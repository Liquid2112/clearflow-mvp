import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Vitest config for the deterministic grade + recommendation engines.
// Kept at the repo root (not under src/app) so Next never treats it as a page.
// Tests live under `tests/` and never ship in the static export. The `@/` alias
// mirrors the tsconfig paths mapping so imports resolve the same way as in Next.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
