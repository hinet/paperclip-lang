/**
 * Bundles the plugin worker into a self-contained ESM file.
 *
 * The worker is bundled with all dependencies included (no externals) so the
 * published npm package works without requiring @paperclipai/plugin-sdk to be
 * separately installed on the host.
 */
import esbuild from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");

await esbuild.build({
  entryPoints: [path.join(packageRoot, "src/worker.ts")],
  outfile: path.join(packageRoot, "dist/worker.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  target: ["node18"],
  sourcemap: true,
  logLevel: "info",
});
