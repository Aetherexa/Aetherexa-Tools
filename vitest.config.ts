import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/registry.ts', 'src/lib/tool-contracts.ts', 'src/lib/tool-guides.ts'],
      thresholds: { lines: 60, functions: 60, branches: 50, statements: 60 },
    },
  },
});
