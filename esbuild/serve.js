#!/usr/bin/env node

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {replace as replacePlugin} from 'esbuild-plugin-replace';
import globalsPlugin from 'esbuild-plugin-globals';
import * as http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('playground', { type: 'boolean', default: false })
  .option('demo', { type: 'boolean', default: false })
  .option('bench', { type: 'boolean', default: false })
  .option('production', { type: 'boolean', default: false })
  .option('port', { type: 'number', default: 9090 })
  .parse();

// Get package and version info
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const VERSION = JSON.stringify(packageJson.version);
let REVISION;

try {
  REVISION = JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim());
} catch (e) {
  console.error('Skipping REDOC_REVISION');
  REVISION = JSON.stringify('unknown');
}

// Create a custom browser resolve plugin for Node.js built-ins
function createBrowserResolvePlugin() {
  const emptyNodeModulePath = path.resolve(rootDir, 'src/empty.js');

  return {
    name: 'browser-resolve',
    setup(build) {
      // Handle path module
      build.onResolve({ filter: /^path$/ }, () => {
        return { path: path.resolve(rootDir, 'node_modules/path-browserify/index.js') };
      });

      // Handle buffer module
      build.onResolve({ filter: /^buffer$/ }, () => {
        return { path: path.resolve(rootDir, 'node_modules/buffer/index.js') };
      });

      // Handle url module
      build.onResolve({ filter: /^url$/ }, () => {
        return { path: path.resolve(rootDir, 'node_modules/url/url.js') };
      });

      // Handle empty modules (http, fs, os, tty)
      build.onResolve({ filter: /^(http|fs|os|tty)$/ }, (args) => {
        return { path: emptyNodeModulePath };
      });
    }
  };
}

// Define build options
const getContextOptions = () => {
  const entryPoints = [];

  if (argv.playground) {
    entryPoints.push(path.join(rootDir, 'demo/playground/hmr-playground.tsx'));
  } else if (argv.demo) {
    entryPoints.push(path.join(rootDir, 'demo/index.tsx'));
  } else if (argv.bench) {
    entryPoints.push(path.join(rootDir, 'benchmark/index.tsx'));
  } else {
    entryPoints.push(path.join(rootDir, 'src/index.ts'));
  }

  // Handle browser vs node environment
  const browserNodeEmulation = {
    'process.env': '{}',
    'process.platform': '"browser"',
    'process.stdout': 'null',
  };

  // Handle standalone build external modules
  const standaloneExternals = {
    'esprima': 'null',
    'node-fetch': 'null',
    'node-fetch-h2': 'null',
    'yaml': 'null',
    'url': 'null',
    'safe-json-stringify': 'null',
  };
  const emptyNodeModulePath = path.resolve(rootDir, 'src/empty.js');
  return {
    entryPoints,
    outdir: path.join(rootDir, 'demo/dist'),
    entryNames: 'redoc-demo.bundle',
    bundle: true,
    minify: argv.production,
    sourcemap: true,
    target: [ 'es2019' ],
    platform: 'browser',
    format: 'iife',
    define: {
      '__REDOC_VERSION__': VERSION,
      '__REDOC_REVISION__': REVISION,
      ...browserNodeEmulation,
      'global': 'window', // handle global references
    },
    plugins: [
      replacePlugin({
        include: /\.tsx?$/,
        'process.env.NODE_ENV': argv.production ? '"production"' : '"development"',
      }),
      createBrowserResolvePlugin(),
      globalsPlugin(standaloneExternals),
    ],
    loader: {
      '.png': 'dataurl',
      '.svg': 'dataurl',
      '.woff': 'dataurl',
      '.woff2': 'dataurl',
      '.eot': 'dataurl',
      '.ttf': 'dataurl',
      '.css': 'text',
    },
  };
};

// Start dev server
const startDevServer = async () => {
  try {
    // Ensure dist directory exists
    const distDir = path.join(rootDir, 'demo/dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Copy needed static files
    const htmlSource = argv.playground
                       ? path.join(rootDir, 'demo/playground/index.html')
                       : argv.bench
                         ? path.join(rootDir, 'benchmark/index.html')
                         : path.join(rootDir, 'demo/index.html');

    const htmlDest = path.join(distDir, 'index.html');
    fs.copyFileSync(htmlSource, htmlDest);

    // Copy OpenAPI spec if it exists
    const specFile = path.join(rootDir, 'demo/museum.yaml');
    if (fs.existsSync(specFile)) {
      fs.copyFileSync(specFile, path.join(distDir, 'museum.yaml'));
    }

    // Setup context for esbuild
    const context = await esbuild.context(getContextOptions());

    // Start dev server
    const { host, port } = await context.serve({
      servedir: distDir,
      port: argv.port,
      onRequest: (args) => {
        console.log(`${ args.method } ${ args.path } - ${ args.status }`);
      }
    });

    console.log(`Development server running at http://${ host }:${ port }`);

    // Create a simple HTTP server to handle fallbacks for SPA routing
    const redirectServer = http.createServer((req, res) => {
      const options = {
        hostname: host,
        port: port,
        path: req.url,
        method: req.method,
        headers: req.headers,
      };

      // Forward the request to esbuild
      const proxyReq = http.request(options, (proxyRes) => {
        if (proxyRes.statusCode === 404) {
          // Serve index.html for any 404 responses (for SPA routing)
          options.path = '/';
          const htmlReq = http.request(options, (htmlRes) => {
            res.writeHead(200, htmlRes.headers);
            htmlRes.pipe(res, { end: true });
          });

          htmlReq.on('error', (error) => {
            console.error('Error serving index.html fallback:', error);
            res.statusCode = 500;
            res.end();
          });

          htmlReq.end();
        } else {
          // Pass through the response as-is for all other responses
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        }
      });

      // Handle request errors
      proxyReq.on('error', (error) => {
        console.error('Error forwarding request:', error);
        res.statusCode = 500;
        res.end();
      });

      // Forward request body if present
      req.pipe(proxyReq, { end: true });
    });

    // Start the redirect server on the specified port
    redirectServer.listen(argv.port, () => {
      console.log(`Redirecting server running at http://localhost:${ argv.port }`);
      console.log(`Open your browser to http://localhost:${ argv.port } to view the application`);

      // Open the browser if running on a local machine
      if (process.platform === 'darwin') {
        execSync(`open http://localhost:${ argv.port }`);
      } else if (process.platform === 'win32') {
        execSync(`start http://localhost:${ argv.port }`);
      } else if (process.platform === 'linux') {
        execSync(`xdg-open http://localhost:${ argv.port }`);
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    process.exit(1);
  }
};

startDevServer();
