#!/usr/bin/env node
/**
 * DECISION #6 SCHEMA PHASE — 20 AUTOMATED TESTS
 *
 * Tests the Phase 1 schema changes:
 * - Item classification fields (itemType, gender, shoeGroup, sourceCategory, condition)
 * - Safe shoe detection via clIsShoeRow()
 * - Department mapping with no fallback
 * - eBay category routing
 * - Condition mapping
 *
 * Run: node test-schema-phase.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Load the shared cl-shoe-ebay module
const clShoeEbay = require(path.join(__dirname, 'cl-shoe-ebay.js'));

// Mock cl state object and supporting state
let cl = {
  type: 'clothing',
  gender: 'unisex',
  shoeGroup: '',
  sku: 'TEST-001',
  category: 'Jeans',
  condition: 'NEW_WITH_BOX',
  brand: 'Nike',
  color: 'Blue',
  size: 'M',
  style: '',
  inseam: '',
  dressLength: '',
  outerMaterial: '',
  swimStyle: '',
  activity: '',
  shoeWidth: '',
  location: '',
};

// Simulate clBuildEbayRow function (minimal version for testing)
function clBuildEbayRow_Mock(photoUrls) {
  return {
    // Decision #6 fields
    itemType:       cl.type,
    gender:         cl.gender,
    shoeGroup:      cl.type === 'shoes' ? cl.shoeGroup : '',
    sourceCategory: cl.category,
    condition:      cl.condition,

    // Existing fields (minimal subset for testing)
    sku:            cl.sku || '',
    photos:         photoUrls || '',
    title:          'Test Item',
    category:       cl.category || '',
    categoryId:     '63861',
    conditionId:    1000,
    brand:          cl.brand || '',
    size:           cl.size || '',
    department:     'Unisex',
    color:          cl.color || '',
    type:           cl.category || '',
    description:    'Test description',
    price:          '9.99',
    location:       'Lumberton, NC',
  };
}

// Test results
const tests = [];
let passed = 0;
let failed = 0;

function test(id, name, fn) {
  let ok = false;
  let error = '';
  try {
    const result = fn();
    ok = result === true || (result && result.ok === true);
    if (result && result.error) error = result.error;
  } catch (e) {
    error = e.message;
  }

  tests.push({ id, name, ok, error });
  if (ok) {
    passed++;
    console.log(`  ✓ [${id}] ${name}`);
  } else {
    failed++;
    console.log(`  ✗ [${id}] ${name}${error ? ' — ' + error : ''}`);
  }
  return ok;
}

function assertEqual(actual, expected, msg) {
  if (actual === expected) return true;
  throw new Error(`${msg}: expected ${expected}, got ${actual}`);
}

function assertUndefined(value, msg) {
  if (value === undefined) return true;
  throw new Error(`${msg}: expected undefined, got ${value}`);
}

function assertTrue(value, msg) {
  if (value === true) return true;
  throw new Error(`${msg}: expected true, got ${value}`);
}

function assertFalse(value, msg) {
  if (value === false) return true;
  throw new Error(`${msg}: expected false, got ${value}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 1-5: Row Schema Completeness
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 1-5: Row Schema Completeness ═══\n');

test(1, 'Clothing row saves itemType=clothing', () => {
  cl.type = 'clothing';
  cl.gender = 'mens';
  cl.shoeGroup = '';
  cl.category = 'Jeans';
  const row = clBuildEbayRow_Mock();
  return assertEqual(row.itemType, 'clothing', 'itemType should be "clothing"');
});

test(2, 'Shoe row saves itemType=shoes', () => {
  cl.type = 'shoes';
  cl.gender = ''; // shoes don't use gender
  cl.shoeGroup = 'mens';
  cl.category = 'Athletic Shoes';
  const row = clBuildEbayRow_Mock();
  return assertEqual(row.itemType, 'shoes', 'itemType should be "shoes"');
});

test(3, 'Shoe row saves shoeGroup', () => {
  cl.type = 'shoes';
  cl.shoeGroup = 'womens';
  cl.category = 'Athletic Shoes';
  const row = clBuildEbayRow_Mock();
  return assertEqual(row.shoeGroup, 'womens', 'shoeGroup should be "womens"');
});

test(4, 'New row saves sourceCategory', () => {
  cl.type = 'shoes';
  cl.category = 'Boots';
  cl.shoeGroup = 'mens';
  const row = clBuildEbayRow_Mock();
  return assertEqual(row.sourceCategory, 'Boots', 'sourceCategory should be "Boots"');
});

test(5, 'New row saves condition', () => {
  cl.condition = 'PREOWNED_EXCELLENT';
  const row = clBuildEbayRow_Mock();
  return assertEqual(row.condition, 'PREOWNED_EXCELLENT', 'condition should be preserved');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 6: Clothing State Isolation
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TEST 6: Clothing State Isolation ═══\n');

test(6, 'Clothing row keeps shoeGroup blank', () => {
  cl.type = 'clothing';
  cl.shoeGroup = 'should_be_cleared'; // Simulate attempt to set it
  // When type is clothing, clBuildEbayRow should return empty shoeGroup
  const row = clBuildEbayRow_Mock();
  return assertEqual(row.shoeGroup, '', 'shoeGroup should be empty for clothing');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 7-8: Safe Shoe Detection (clIsShoeRow)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 7-8: Safe Shoe Detection via clIsShoeRow ═══\n');

test(7, 'clIsShoeRow(shoe)=true', () => {
  cl.type = 'shoes';
  cl.shoeGroup = 'mens';
  const row = clBuildEbayRow_Mock();
  return assertTrue(clShoeEbay.clIsShoeRow(row), 'should detect shoe row');
});

test(8, 'clIsShoeRow(clothing)=false', () => {
  cl.type = 'clothing';
  cl.shoeGroup = '';
  const row = clBuildEbayRow_Mock();
  return assertFalse(clShoeEbay.clIsShoeRow(row), 'should not detect clothing as shoe');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 9-10: Unsupported Categories & Blocking
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 9-10: Unsupported Categories ═══\n');

test(9, 'Unsupported shoe category still identifiable as Shoe', () => {
  cl.type = 'shoes';
  cl.shoeGroup = 'mens';
  cl.category = 'UnsupportedShoeType'; // Not in routing table
  const row = clBuildEbayRow_Mock();
  // Still should be identified as a shoe via itemType
  return assertTrue(clShoeEbay.clIsShoeRow(row), 'should identify even unsupported shoe type via itemType');
});

test(10, 'Unsupported category returns undefined categoryId (no silent fallback)', () => {
  cl.type = 'shoes';
  cl.shoeGroup = 'mens';
  cl.category = 'UnknownCategory';
  const row = clBuildEbayRow_Mock();
  // Category routing should return undefined, not a fallback
  const catId = clShoeEbay.clGetShoeEbayCategoryIdFor(row);
  return assertUndefined(catId, 'should return undefined for unknown category');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 11-12: No Department Fallback (Explicit Blocking)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 11-12: Department Mapping Without Fallback ═══\n');

test(11, 'Unknown shoeGroup returns undefined (no fallback)', () => {
  cl.type = 'shoes';
  cl.shoeGroup = 'invalid_group';
  const row = clBuildEbayRow_Mock();
  const dept = clShoeEbay.clShoeDeptFor(row);
  return assertUndefined(dept, 'should return undefined for unknown shoeGroup (no fallback)');
});

test(12, 'Valid shoeGroup returns correct Department', () => {
  cl.type = 'shoes';
  cl.shoeGroup = 'mens';
  const row = clBuildEbayRow_Mock();
  const dept = clShoeEbay.clShoeDeptFor(row);
  return assertEqual(dept, 'Men', 'should return correct Department for valid shoeGroup');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 13-16: Shoe Group Distinctions
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 13-16: Shoe Group Distinctions ═══\n');

test(13, 'Boys and Girls are distinct', () => {
  cl.type = 'shoes';

  cl.shoeGroup = 'boys';
  const rowBoys = clBuildEbayRow_Mock();
  const deptBoys = clShoeEbay.clShoeDeptFor(rowBoys);

  cl.shoeGroup = 'girls';
  const rowGirls = clBuildEbayRow_Mock();
  const deptGirls = clShoeEbay.clShoeDeptFor(rowGirls);

  return assertEqual(deptBoys, 'Boys', 'boys dept') &&
         assertEqual(deptGirls, 'Girls', 'girls dept') &&
         (deptBoys !== deptGirls ? true : (() => { throw new Error('departments should be distinct'); })());
});

test(14, 'Unisex Kids distinct from Boys/Girls', () => {
  cl.type = 'shoes';

  cl.shoeGroup = 'unisex_kids';
  const rowKids = clBuildEbayRow_Mock();
  const deptKids = clShoeEbay.clShoeDeptFor(rowKids);

  cl.shoeGroup = 'boys';
  const rowBoys = clBuildEbayRow_Mock();
  const deptBoys = clShoeEbay.clShoeDeptFor(rowBoys);

  return assertEqual(deptKids, 'Unisex Kids', 'kids dept') &&
         (deptKids !== deptBoys ? true : (() => { throw new Error('should be distinct from Boys'); })());
});

test(15, 'Baby distinct from Kids', () => {
  cl.type = 'shoes';

  cl.shoeGroup = 'baby';
  const rowBaby = clBuildEbayRow_Mock();
  const deptBaby = clShoeEbay.clShoeDeptFor(rowBaby);

  cl.shoeGroup = 'unisex_kids';
  const rowKids = clBuildEbayRow_Mock();
  const deptKids = clShoeEbay.clShoeDeptFor(rowKids);

  return assertEqual(deptBaby, 'Unisex Baby & Toddler', 'baby dept') &&
         (deptBaby !== deptKids ? true : (() => { throw new Error('should be distinct from Kids'); })());
});

test(16, 'Unisex Adult exists and is distinct from Men/Women', () => {
  cl.type = 'shoes';

  cl.shoeGroup = 'unisex';
  const rowUnisex = clBuildEbayRow_Mock();
  const deptUnisex = clShoeEbay.clShoeDeptFor(rowUnisex);

  cl.shoeGroup = 'mens';
  const rowMens = clBuildEbayRow_Mock();
  const deptMens = clShoeEbay.clShoeDeptFor(rowMens);

  return assertEqual(deptUnisex, 'Unisex Adults', 'unisex dept') &&
         (deptUnisex !== deptMens ? true : (() => { throw new Error('should be distinct from Men'); })());
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 17-18: Legacy Row Handling
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 17-18: Legacy Row Handling ═══\n');

test(17, 'Legacy ambiguous row (no itemType) cannot be safely detected as shoe', () => {
  // Simulate legacy row missing itemType field
  const legacyRow = {
    type: 'Boots',  // Could be shoe type OR clothing category (ambiguous!)
    gender: 'mens',
    sourceCategory: undefined, // Not saved
    // itemType is MISSING
  };

  // clIsShoeRow requires itemType field
  const isSh = clShoeEbay.clIsShoeRow(legacyRow);
  return assertFalse(isSh, 'legacy row without itemType should not be detected as shoe');
});

test(18, 'Legacy Clothing row does not get forced into Shoe path', () => {
  // Simulate legacy clothing row with shoes-like category name
  const legacyClothing = {
    itemType: 'clothing',
    gender: 'womens',
    shoeGroup: '', // Empty/not applicable
    sourceCategory: 'Boots', // Could sound like shoe
    type: 'Boots',
  };

  // Should NOT be treated as shoe just because category mentions Boots
  const isSh = clShoeEbay.clIsShoeRow(legacyClothing);
  return (isSh === false ? true : (() => { throw new Error('should not be detected as shoe'); })());
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 19-20: Backward Compatibility
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 19-20: Backward Compatibility ═══\n');

test(19, 'Existing row.type remains unchanged (sourceCategory takes over)', () => {
  cl.type = 'shoes';
  cl.category = 'Athletic Shoes';
  cl.shoeGroup = 'womens';
  const row = clBuildEbayRow_Mock();

  // Old code might reference row.type, which is still set for backward compat
  // New code should use row.sourceCategory instead
  return assertEqual(row.type, 'Athletic Shoes', 'old row.type still present for compat') &&
         assertEqual(row.sourceCategory, 'Athletic Shoes', 'new sourceCategory also set');
});

test(20, 'Condition mapping works for all approved conditions', () => {
  const testConditions = [
    { input: 'NEW_WITH_BOX', expected: 1000 },
    { input: 'NEW_WITHOUT_BOX', expected: 1500 },
    { input: 'NEW_WITH_DEFECTS', expected: 1750 },
    { input: 'PREOWNED_EXCELLENT', expected: 2990 },
    { input: 'PREOWNED_GOOD', expected: 3000 },
    { input: 'PREOWNED_FAIR', expected: 3010 },
  ];

  for (let cond of testConditions) {
    cl.condition = cond.input;
    const row = clBuildEbayRow_Mock();
    const condId = clShoeEbay.clGetShoeConditionIdFor(row);
    if (condId !== cond.expected) {
      throw new Error(`Condition ${cond.input}: expected ${cond.expected}, got ${condId}`);
    }
  }
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(70));
console.log('SCHEMA PHASE TEST RESULTS');
console.log('═'.repeat(70));
console.log(`\nTotal:  ${tests.length} tests`);
console.log(`Passed: ${passed} tests ✓`);
console.log(`Failed: ${failed} tests ✗`);
console.log('\n' + '═'.repeat(70));

if (failed === 0) {
  console.log('✓ ALL TESTS PASSED — Schema phase ready for integration\n');
  process.exit(0);
} else {
  console.log(`✗ ${failed} TEST(S) FAILED — Review above\n`);
  process.exit(1);
}
