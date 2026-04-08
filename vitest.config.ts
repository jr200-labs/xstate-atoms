import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 5000,
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    pool: 'forks',
    maxWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/index.ts',
        'src/time/types.ts',
        'src/time/hooks.ts',
        'src/duckdb/atoms.ts',
        'src/duckdb/query.ts',
        'src/nats/atoms.ts',
      ],
    },
  },
})
