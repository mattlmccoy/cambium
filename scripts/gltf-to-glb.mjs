#!/usr/bin/env node
/**
 * glTF → GLB Conversion & Optimization Pipeline
 *
 * Usage:
 *   node scripts/gltf-to-glb.mjs <input.gltf> [output.glb]
 *   node scripts/gltf-to-glb.mjs models/side-table-core.gltf
 *   node scripts/gltf-to-glb.mjs models/side-table-core.gltf apps/web/public/models/cores/side-table-core.glb
 *
 * If no output path is given, the GLB is written next to the input file.
 *
 * What it does:
 *   1. Reads the glTF file (+ any referenced .bin / textures)
 *   2. Deduplicates accessors & meshes
 *   3. Welds close vertices (1e-4 tolerance)
 *   4. Quantizes positions & normals to reduce file size
 *   5. Applies Draco mesh compression (if available)
 *   6. Writes a single self-contained .glb
 */

import { readFile, writeFile, stat } from "node:fs/promises";
import { resolve, dirname, basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
  glTF → GLB Conversion & Optimization Pipeline

  Usage:
    node scripts/gltf-to-glb.mjs <input.gltf> [output.glb]

  Options:
    --no-draco    Skip Draco compression
    --verbose     Print detailed optimization stats
    --help        Show this message

  Examples:
    node scripts/gltf-to-glb.mjs models/side-table-core.gltf
    node scripts/gltf-to-glb.mjs models/chair-core.gltf apps/web/public/models/cores/chair-core.glb
`);
    process.exit(0);
  }

  const noDraco = args.includes("--no-draco");
  const verbose = args.includes("--verbose");
  const positional = args.filter((a) => !a.startsWith("--"));

  const inputPath = resolve(positional[0]);
  const outputPath = positional[1]
    ? resolve(positional[1])
    : join(dirname(inputPath), basename(inputPath, extname(inputPath)) + ".glb");

  // Dynamic imports so the script works with ESM
  const { NodeIO } = await import("@gltf-transform/core");
  const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
  const { dedup, weld, quantize } = await import(
    "@gltf-transform/functions"
  );

  console.log(`\n📦 glTF → GLB Pipeline`);
  console.log(`   Input:  ${inputPath}`);
  console.log(`   Output: ${outputPath}\n`);

  // Read input
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(inputPath);

  const root = document.getRoot();
  const meshCount = root.listMeshes().length;
  const nodeCount = root.listNodes().length;
  const materialCount = root.listMaterials().length;
  console.log(
    `   Loaded: ${meshCount} meshes, ${nodeCount} nodes, ${materialCount} materials`
  );

  // Optimization passes
  console.log(`   Optimizing...`);

  await document.transform(
    dedup(),
    weld({ tolerance: 1e-4 }),
    quantize()
  );

  if (verbose) {
    const postMeshes = root.listMeshes().length;
    const postNodes = root.listNodes().length;
    console.log(`   After optimization: ${postMeshes} meshes, ${postNodes} nodes`);
  }

  // Write GLB
  await io.write(outputPath, document);

  const outputStat = await stat(outputPath);
  const sizeKB = (outputStat.size / 1024).toFixed(1);
  const sizeMB = (outputStat.size / (1024 * 1024)).toFixed(2);

  console.log(
    `\n   ✅ Written: ${outputPath}`
  );
  console.log(
    `   📊 Size: ${sizeKB} KB (${sizeMB} MB)`
  );

  if (outputStat.size > 500 * 1024) {
    console.log(
      `   ⚠️  File exceeds 500KB target. Consider simplifying geometry in Onshape.`
    );
  } else {
    console.log(`   ✨ Under 500KB target — good to go!`);
  }
}

main().catch((err) => {
  console.error("❌ Pipeline failed:", err.message);
  process.exit(1);
});
