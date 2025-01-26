import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  clean: true,
  format: ["esm"],
  target: ["esnext"],
  dts: true,
  minify: true,
  sourcemap: false,
  splitting: true,
});
