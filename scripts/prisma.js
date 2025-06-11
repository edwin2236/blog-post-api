#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define schema path relative to project root
const SCHEMA_PATH = resolve(__dirname, '../src/shared/infrastructure/database/prisma/schema.prisma');

// Get command line arguments (excluding node and script path)
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Please provide a Prisma command');
  process.exit(1);
}

// Execute Prisma command with schema path
const result = spawnSync('prisma', [...args, '--schema', SCHEMA_PATH], {
  stdio: 'inherit',
  shell: true,
});

// Forward the exit code
process.exit(result.status ?? 1);
