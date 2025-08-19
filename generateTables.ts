import { initPruning, getPruningTables } from "./src/utils/solver/search.js"; 
import fs from "fs";
import { gzipSync } from "zlib";

async function generateTables() {
  console.log("🚀 Starting pruning table generation...");
  console.log("⏰ This may take 30-60 minutes depending on your machine");
  
  const startTime = Date.now();

  // Initialize pruning (this usually runs BFS on multiple state spaces)
  console.log("🔧 Initializing pruning...");
  initPruning({
    onTableStart: (name: string) => {
      console.log(`\n📦 Generating table: ${name}`);
      console.log(`⏰ Started at: ${new Date().toLocaleTimeString()}`);
    },
    onProgress: (name: string, count: number) => {
      if (count % 100000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        console.log(`   ${name}: processed ${count.toLocaleString()} states... (${elapsed}m elapsed)`);
      }
    },
    onTableDone: (name: string) => {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      console.log(`✅ Finished ${name} (${elapsed}m total elapsed)`);
    },
  });

  console.log("\n💾 Collecting pruning tables...");
  const tables = getPruningTables();

  // Calculate sizes
  const totalSize = Object.values(tables).reduce((sum, table) => sum + table.byteLength, 0);
  console.log(`📊 Total pruning table size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  // Convert Int8Arrays to regular arrays for JSON serialization
  const serializedTables = {
    Slice_URFtoDLF_Parity_Prun: Array.from(tables.Slice_URFtoDLF_Parity_Prun),
    Slice_URtoDF_Parity_Prun: Array.from(tables.Slice_URtoDF_Parity_Prun),
    Slice_Twist_Prun: Array.from(tables.Slice_Twist_Prun),
    Slice_Flip_Prun: Array.from(tables.Slice_Flip_Prun),
  };

  // Save uncompressed version
  const outPath = "./dist/pruningTables.json";
  const jsonData = JSON.stringify(serializedTables);
  fs.writeFileSync(outPath, jsonData);
  
  const uncompressedSize = fs.statSync(outPath).size;
  console.log(`💾 Uncompressed JSON: ${(uncompressedSize / 1024 / 1024).toFixed(2)} MB`);

  // Save compressed version for production
  const compressedPath = "./dist/pruningTables.json.gz";
  const compressed = gzipSync(jsonData);
  fs.writeFileSync(compressedPath, compressed);
  
  const compressedSize = compressed.length;
  const compressionRatio = ((1 - compressedSize / uncompressedSize) * 100).toFixed(1);
  console.log(`🗜️  Compressed (gzip): ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressionRatio}% reduction)`);

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n🎉 All pruning tables generated in ${totalTime} minutes!`);
  console.log(`📁 Files saved:`);
  console.log(`   - ${outPath} (for development)`);
  console.log(`   - ${compressedPath} (for production)`);
}

generateTables().catch(err => {
  console.error("❌ Error during table generation:", err);
  process.exit(1);
});