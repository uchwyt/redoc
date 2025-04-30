#!/usr/bin/env node

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import copyStaticFiles from 'esbuild-copy-static-files';
import { replace as replacePlugin } from 'esbuild-plugin-replace';
import globalsPlugin from 'esbuild-plugin-globals';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('standalone', { type: 'boolean', default: false })
  .option('lib', { type: 'boolean', default: false })
  .option('browser', { type: 'boolean', default: false })
  .option('esm', { type: 'boolean', default: false })
  .option('demo', { type: 'boolean', default: false })
  .option('bench', { type: 'boolean', default: false })
  .option('production', { type: 'boolean', default: false })
  .option('metafile', { type: 'boolean', default: false })
  .option('watch', { type: 'boolean', default: false })
  .option('sourcemap', { type: 'boolean', default: true })
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

const BANNER = `ReDoc - OpenAPI/Swagger-generated API Reference Documentation
-------------------------------------------------------------
  Version: ${ packageJson.version }
  Repo: https://github.com/Redocly/redoc`;

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

// Define build options based on arguments
const getBuildOptions = () => {
  const entryPoints = [];

  if (argv.standalone) {
    entryPoints.push(path.join(rootDir, 'src/standalone.tsx'));
  } else if (argv.demo) {
    entryPoints.push(path.join(rootDir, 'demo/index.tsx'));
  } else if (argv.bench) {
    entryPoints.push(path.join(rootDir, 'benchmark/index.tsx'));
  } else {
    entryPoints.push(path.join(rootDir, 'src/index.ts'));
  }

  const outfile = argv.standalone
                  ? path.join(rootDir, 'bundles/redoc.standalone.js')
                  : argv.browser
                    ? path.join(rootDir, 'bundles/redoc.browser.lib.js')
                    : argv.esm
                      ? path.join(rootDir, 'bundles/redoc.esm.js')
                      : argv.demo
                        ? path.join(rootDir, 'demo/dist/redoc-demo.bundle.js')
                        : path.join(rootDir, 'bundles/redoc.lib.js');

  const format = argv.esm ? 'esm' : 'iife';
  const target = [ 'es2019' ];
  const globalName = 'Redoc';

  // Define ignored modules for different builds
  const ignorePatterns = [ 'js-yaml/dumper.js', 'json-schema-ref-parser/lib/dereference.js' ];

  if (argv.standalone) {
    ignorePatterns.push('./SearchWorker.worker');
  }

  const external = argv.standalone
                   ? []
                   : [ 'react', 'react-dom', 'styled-components', 'mobx', 'mobx-react' ];

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

  return {
    entryPoints,
    outfile,
    bundle: true,
    minify: argv.production,
    sourcemap: argv.sourcemap,
    target,
    platform: 'browser',
    format,
    globalName: format === 'iife' ? globalName : undefined,
    metafile: argv.metafile,
    banner: {
      js: BANNER,
    },
    define: {
      '__REDOC_VERSION__': VERSION,
      '__REDOC_REVISION__': REVISION,
      ...browserNodeEmulation,
    },
    plugins: [
      replacePlugin({
        include: /\.tsx?$/,
        'process.env.NODE_ENV': argv.production ? '"production"' : '"development"',
      }),
      createBrowserResolvePlugin(),
      ...( argv.standalone ? [
        globalsPlugin(standaloneExternals)
      ] : [] ),
      ...( argv.demo ? [
        copyStaticFiles({
          src: path.join(rootDir, 'demo/museum.yaml'),
          dest: path.join(rootDir, 'demo/dist/museum.yaml')
        }),
        copyStaticFiles({
          src: path.join(rootDir, 'demo/playground/index.html'),
          dest: path.join(rootDir, 'demo/dist/index.html')
        })
      ] : [] )
    ],
    external,
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

// Execute the build
const runBuild = async () => {
  try {
    const options = getBuildOptions();

    if (argv.watch) {
      // Set up watch mode
      const context = await esbuild.context(options);
      await context.watch();
      console.log('Watching for changes...');
    } else {
      // Run a one-time build
      const result = await esbuild.build(options);

      if (argv.metafile) {
        // Write metafile for analysis
        fs.writeFileSync('meta.json', JSON.stringify(result.metafile));
        console.log('Build metadata written to meta.json');
      }

      console.log(`Built ${ options.outfile }`);
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
};

runBuild();
