import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts', 'client.ts'],
  splitting: false,
  sourcemap: true,
  dts: true,
  format: ['cjs', 'esm'],
  clean: true
})
