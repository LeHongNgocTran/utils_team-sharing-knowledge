import { rm, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const outputDir = resolve(process.cwd(), "data/outputs");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

console.log(`Cleaned ${outputDir}`);
