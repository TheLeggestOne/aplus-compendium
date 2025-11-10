const fs = require('fs').promises;
const path = require('path');
const parserRegistry = require('../src/parsers/ParserRegistry');

/**
 * Extract SRD content from 5etools data files
 * 
 * Usage:
 *   node tools/extract-srd.js <5etools-data-dir> <output-dir>
 * 
 * Example:
 *   node tools/extract-srd.js ../5etools-v2.10.1/data resources/srd
 */

async function getAllJsonFiles(dir, fileList = []) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await getAllJsonFiles(fullPath, fileList);
    } else if (file.name.endsWith('.json')) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

async function extractSrd(inputDir, outputDir) {
  console.log('Discovering parsers...');
  await parserRegistry.discoverParsers();
  
  console.log(`\nScanning input directory: ${inputDir}`);
  console.log(`Output to: ${outputDir}\n`);
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Get all JSON files recursively
  const jsonFiles = await getAllJsonFiles(inputDir);
  console.log(`Found ${jsonFiles.length} JSON files\n`);
  
  let totalExtracted = 0;
  let filesProcessed = 0;
  
  // Track items per content type across all files
  const contentTypeItems = new Map();
  
  for (const inputFile of jsonFiles) {
    const filename = path.relative(inputDir, inputFile);
    
    try {
      // Read and parse input
      const data = await fs.readFile(inputFile, 'utf-8');
      const parsed = JSON.parse(data);
      
      let fileHadContent = false;
      
      // Check each parser to see if this file has content for it
      for (const contentType of parserRegistry.getContentTypes()) {
        const parser = parserRegistry.getParser(contentType);
        const arrayKey = parser.getArrayKey();
        
        // Check if this file has data for this content type
        if (parsed[arrayKey] && Array.isArray(parsed[arrayKey]) && parsed[arrayKey].length > 0) {
          // Parse and filter to SRD only
          const items = parser.parse(parsed, { srdOnly: true });
          
          if (items.length > 0) {
            // Add to accumulated items for this content type
            if (!contentTypeItems.has(contentType)) {
              contentTypeItems.set(contentType, {
                items: [],
                meta: parsed._meta || {}
              });
            }
            
            const accumulated = contentTypeItems.get(contentType);
            accumulated.items.push(...items);
            
            console.log(`  ✓ ${filename} [${arrayKey}]: ${items.length} SRD items -> ${contentType}.json`);
            totalExtracted += items.length;
            fileHadContent = true;
          }
        }
      }
      
      if (fileHadContent) {
        filesProcessed++;
      } else {
        console.log(`  - ${filename}: no SRD content found`);
      }
      
    } catch (error) {
      console.error(`  ✗ ${filename}: ${error.message}`);
    }
  }
  
  // Write accumulated items to output files
  console.log('\nWriting output files...');
  for (const [contentType, data] of contentTypeItems.entries()) {
    const parser = parserRegistry.getParser(contentType);
    const outputFile = path.join(outputDir, `${contentType}.json`);
    
    const output = {
      _meta: data.meta,
      [parser.getArrayKey()]: data.items
    };
    
    await fs.writeFile(outputFile, JSON.stringify(output, null, '\t'), 'utf-8');
    console.log(`  ✓ ${contentType}.json: ${data.items.length} items`);
  }
  
  console.log(`\n✅ Extraction complete: ${totalExtracted} SRD items from ${filesProcessed} files`);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('Usage: node extract-srd.js <5etools-data-dir> <output-dir>');
    console.error('');
    console.error('Example:');
    console.error('  node tools/extract-srd.js ../5etools-v2.10.1/data resources/srd');
    process.exit(1);
  }
  
  const [inputDir, outputDir] = args;
  
  extractSrd(inputDir, outputDir)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { extractSrd };
