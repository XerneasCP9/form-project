import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', pool: 'threads', maxWorkers: 1, fileParallelism: false, testTimeout: 15000, include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'] } });
