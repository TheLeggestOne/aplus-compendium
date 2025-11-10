const fs = require('fs').promises;
const path = require('path');

// Mock electron app for testing
const testDataDir = path.join(__dirname, 'test-data');
const mockApp = {
  getPath: () => testDataDir,
  isReady: () => true,
  whenReady: () => Promise.resolve()
};

// Mock electron module before requiring our modules
require.cache[require.resolve('electron')] = {
  exports: { app: mockApp }
};

const fileHandler = require('./src/fileHandler');
const contentManager = require('./src/contentManager');
const characterManager = require('./src/characterManager');

// Test utilities
async function cleanup() {
  try {
    await fs.rm(testDataDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore if doesn't exist
  }
}

async function runTests() {
  console.log('🧪 Running basic functionality tests...\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Initialize FileHandler
  try {
    await cleanup();
    await fileHandler.initialize();
    console.log('✅ Test 1: FileHandler initialization');
    passed++;
  } catch (error) {
    console.log('❌ Test 1 FAILED:', error.message);
    failed++;
  }

  // Test 2: Content import
  try {
    const testSpells = [
      { name: 'Fireball', source: 'PHB', level: 3, school: 'evocation' },
      { name: 'Magic Missile', level: 1, school: 'evocation' }
    ];
    await contentManager.import('spells', testSpells, 'SRD');
    console.log('✅ Test 2: Content import');
    passed++;
  } catch (error) {
    console.log('❌ Test 2 FAILED:', error.message);
    failed++;
  }

  // Test 3: Get all content
  try {
    const spells = await contentManager.getAll('spells');
    const keys = Object.keys(spells);
    if (keys.length === 2 && 
        keys.includes('Fireball::PHB') && 
        keys.includes('Magic Missile::SRD')) {
      console.log('✅ Test 3: Get all content with compound keys');
      passed++;
    } else {
      throw new Error(`Expected 2 spells, got ${keys.length}: ${keys.join(', ')}`);
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error.message);
    failed++;
  }

  // Test 4: Search content
  try {
    const results = await contentManager.search('spells', 'fire');
    if (Object.keys(results).length === 1 && results['Fireball::PHB']) {
      console.log('✅ Test 4: Search content');
      passed++;
    } else {
      throw new Error('Search did not return expected results');
    }
  } catch (error) {
    console.log('❌ Test 4 FAILED:', error.message);
    failed++;
  }

  // Test 5: Additive merge
  try {
    const update = [
      { name: 'Fireball', source: 'PHB', description: 'A bright streak...' }
    ];
    await contentManager.import('spells', update, 'SRD');
    const spell = await contentManager.get('spells', 'Fireball', 'PHB');
    if (spell.level === 3 && spell.description === 'A bright streak...') {
      console.log('✅ Test 5: Additive merge (preserves existing fields)');
      passed++;
    } else {
      throw new Error('Merge did not preserve existing fields');
    }
  } catch (error) {
    console.log('❌ Test 5 FAILED:', error.message);
    failed++;
  }

  // Test 6: Save character
  try {
    const testChar = {
      name: 'Gandalf',
      class: 'Wizard',
      level: 20,
      race: 'Human'
    };
    await characterManager.save('char-001', testChar);
    console.log('✅ Test 6: Save character');
    passed++;
  } catch (error) {
    console.log('❌ Test 6 FAILED:', error.message);
    failed++;
  }

  // Test 7: Get character
  try {
    const char = await characterManager.get('char-001');
    if (char && char.name === 'Gandalf' && char.id === 'char-001') {
      console.log('✅ Test 7: Get character with ID');
      passed++;
    } else {
      throw new Error('Character not found or ID mismatch');
    }
  } catch (error) {
    console.log('❌ Test 7 FAILED:', error.message);
    failed++;
  }

  // Test 8: Duplicate character
  try {
    const duplicate = await characterManager.duplicate('char-001', 'char-002');
    if (duplicate.name === 'Gandalf' && duplicate.id === 'char-002') {
      console.log('✅ Test 8: Duplicate character');
      passed++;
    } else {
      throw new Error('Duplicate character has wrong ID');
    }
  } catch (error) {
    console.log('❌ Test 8 FAILED:', error.message);
    failed++;
  }

  // Test 9: Get all characters
  try {
    const chars = await characterManager.getAll();
    if (chars.length === 2) {
      console.log('✅ Test 9: Get all characters');
      passed++;
    } else {
      throw new Error(`Expected 2 characters, got ${chars.length}`);
    }
  } catch (error) {
    console.log('❌ Test 9 FAILED:', error.message);
    failed++;
  }

  // Test 10: Delete content
  try {
    await contentManager.delete('spells', 'Magic Missile', 'SRD');
    const spells = await contentManager.getAll('spells');
    if (!spells['Magic Missile::SRD'] && Object.keys(spells).length === 1) {
      console.log('✅ Test 10: Delete content');
      passed++;
    } else {
      throw new Error('Content not deleted properly');
    }
  } catch (error) {
    console.log('❌ Test 10 FAILED:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`Tests passed: ${passed}`);
  console.log(`Tests failed: ${failed}`);
  console.log('='.repeat(50));

  await cleanup();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
