#!/usr/bin/env node

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { replace as replacePlugin } from 'esbuild-plugin-replace';
import copyStaticFiles from 'esbuild-copy-static-files';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('lib', { type: 'boolean', default: false, description: 'Build CommonJS library version' })
  .option('browser', { type: 'boolean', default: false, description: 'Build browser-compatible library version' })
  .option('esm', { type: 'boolean', default: false, description: 'Build ESM library version' })
  .option('browser-esm', { type: 'boolean', default: false, description: 'Build browser-compatible ESM library version' })
  .option('demo', { type: 'boolean', default: false, description: 'Build demo app' })
  .option('production', { type: 'boolean', default: false, description: 'Production build (minified)' })
  .option('sourcemap', { type: 'boolean', default: true, description: 'Generate sourcemaps' })
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
      build.onResolve({ filter: /^(http|fs|os|tty)$/ }, () => {
        return { path: emptyNodeModulePath };
      });
    }
  };
}

// Execute the build for a specific format
async function buildFormat(format) {
  let entryPoint;
  let outfile;
  let platform;
  let buildFormat;
  let globalName;
  let plugins = [];

  // Configure based on format
  if (format === 'lib') {
    entryPoint = path.join(rootDir, 'src/index.ts');
    outfile = path.join(rootDir, 'bundles/redoc.lib.cjs');
    platform = 'node';
    buildFormat = 'cjs';
    plugins = [];
  } else if (format === 'browser') {
    entryPoint = path.join(rootDir, 'src/index.ts');
    outfile = path.join(rootDir, 'bundles/redoc.browser.lib.js');
    platform = 'browser';  // Browser environment
    buildFormat = 'iife';
    globalName = 'Redoc';
    plugins = [ createBrowserResolvePlugin() ];
  } else if (format === 'esm') {
    entryPoint = path.join(rootDir, 'src/index.ts');
    outfile = path.join(rootDir, 'bundles/redoc.esm.mjs');
    platform = 'node';  // Node environment for ESM
    buildFormat = 'esm';
    plugins = [  ];
  } else if (format === 'browser-esm') {
    entryPoint = path.join(rootDir, 'src/index.ts');
    outfile = path.join(rootDir, 'bundles/redoc.browser.esm.js');
    platform = 'browser';  // Browser environment for Browser-ESM
    buildFormat = 'esm';
    plugins = [ createBrowserResolvePlugin() ];
  } else if (format === 'demo') {
    entryPoint = path.join(rootDir, 'demo/index.tsx');
    outfile = path.join(rootDir, 'demo/dist/redoc-demo.bundle.js');
    platform = 'browser';
    buildFormat = 'iife';
    plugins = [ createBrowserResolvePlugin() ];

    // Ensure demo directory exists
    const demoDir = path.join(rootDir, 'demo/dist');
    if (!fs.existsSync(demoDir)) {
      fs.mkdirSync(demoDir, { recursive: true });
    }

    // Add static file copying for demo
    plugins.push(
      copyStaticFiles({
        src: path.join(rootDir, 'demo/index.html'),
        dest: path.join(demoDir, 'index.html')
      })
    );

    // Copy OpenAPI spec if it exists
    const specFile = path.join(rootDir, 'demo/museum.yaml');
    if (fs.existsSync(specFile)) {
      plugins.push(
        copyStaticFiles({
          src: specFile,
          dest: path.join(demoDir, 'museum.yaml')
        })
      );
    }
  }

  // Define environment settings
  const define = {
    '__REDOC_VERSION__': VERSION,
    '__REDOC_REVISION__': REVISION,
    'process.env.NODE_ENV': JSON.stringify(argv.production ? 'production' : 'development'),
    'process.env.DEBUG': 'globalThis.DEBUG'
  };

  // Add browser environment emulation only for browser builds
  if (platform === 'browser') {
    Object.assign(define, {
      'process.env': '{}',
      'process.platform': '"browser"',
      'process.stdout': 'null',
    });
  }

  // Add replacement plugin
  plugins.unshift(
    replacePlugin({
      include: /\.tsx?$/,
      'process.env.NODE_ENV': argv.production ? '"production"' : '"development"',
    })
  );

  // Build config
  const buildConfig = {
    entryPoints: [ entryPoint ],
    outfile,
    bundle: true,
    minify: false,
    sourcemap: argv.sourcemap,
    target: [ 'es2019' ],
    platform,
    format: buildFormat,
    globalName,
    define,
    tsconfig: 'tsconfig.lib.json',
    plugins,
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

  // Set external packages for library builds (not demo)
  if (format !== 'demo') {
    buildConfig.external = [
      'react',
      'react-dom',
      'styled-components',
      'mobx',
      'mobx-react',
      'final-form',
      'final-form-arrays',
      'final-form-focus',
      'final-form-calculate',
      'react-final-form',
      'react-final-form-arrays',
      'axios',
      'validator',
      'react-tabs',
      'debug',
      '@har-sdk/openapi-sampler'
    ];
  }

  try {
    // Simple one-time build
    await esbuild.build(buildConfig);
    console.log(`Built ${ outfile }`);
  } catch (error) {
    console.error(`Error building ${ format }:`, error);
    process.exit(1);
  }
}

// Run all requested builds
async function runBuilds() {
  try {
    // Ensure bundles directory exists
    if (!fs.existsSync(path.join(rootDir, 'bundles'))) {
      fs.mkdirSync(path.join(rootDir, 'bundles'), { recursive: true });
    }

    const buildPromises = [];

    if (argv.lib) {
      buildPromises.push(buildFormat('lib'));
    }

    if (argv.browser) {
      buildPromises.push(buildFormat('browser'));
    }

    if (argv.esm) {
      buildPromises.push(buildFormat('esm'));
    }

    if (argv['browser-esm']) {
      buildPromises.push(buildFormat('browser-esm'));
    }

    if (argv.demo) {
      buildPromises.push(buildFormat('demo'));
    }

    if (buildPromises.length === 0) {
      console.log('No build type specified. Use --lib, --browser, --esm, --browser-esm, or --demo');
      process.exit(1);
    }

    await Promise.all(buildPromises);

    console.log('All builds completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuilds();
