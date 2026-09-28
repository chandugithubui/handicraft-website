/**
 * server/index.js
 *
 * Minimal, clean runner for the TypeScript server.
 * Loads and executes server/src/index.ts directly with ts-node.
 * All application code, singleton database management, and routes live in src/.
 */

'use strict';

const path = require('path');

// Register ts-node on-the-fly for seamless development execution
const isTsNode = process[Symbol.for('ts-node.register.instance')];
if (!isTsNode) {
  require('ts-node').register({
    project: path.join(__dirname, 'tsconfig.json'),
    transpileOnly: true,
  });
}

// Delegate directly to pure TypeScript server entry point
module.exports = require('./src/index');