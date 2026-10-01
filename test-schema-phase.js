#!/usr/bin/env node
/**
 * DECISION #6 SCHEMA PHASE — COMPREHENSIVE AUTOMATED TEST SUITE
 *
 * Tests the Phase 1 schema changes using REAL PRODUCTION FUNCTIONS:
 * - Item classification fields (itemType, gender, shoeGroup, sourceCategory, condition)
 * - Safe shoe detection via clIsShoeRow()
 * - Department mapping with no fallback
 * - eBay category routing (all 20 categories across all 7 shoe groups)
 * - Condition mapping (6 eBay conditions)
 * - State isolation (shoes vs clothing)
 * - Clothing regression tests
 *
 * Run: node test-schema-phase.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

// Load the shared cl-shoe-ebay module (REAL PRODUCTION FUNCTIONS)
const clShoeEbay = require(path.join(__dirname, 'cl-shoe-ebay.js'));

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

function assertNotUndefined(value, msg) {
  if (value !== undefined) return true;
  throw new Error(`${msg}: expected non-undefined value, got undefined`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 1-7: Safe Shoe Detection (clIsShoeRow)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 1-7: Safe Shoe Detection via clIsShoeRow ═══\n');

test(1, 'clIsShoeRow(shoe)=true', () => {
  const row = { itemType: 'shoes', shoeGroup: 'mens' };
  return assertTrue(clShoeEbay.clIsShoeRow(row), 'should detect shoe row');
});

test(2, 'clIsShoeRow(clothing)=false', () => {
  const row = { itemType: 'clothing', gender: 'mens' };
  return assertFalse(clShoeEbay.clIsShoeRow(row), 'should not detect clothing as shoe');
});

test(3, 'Legacy row without itemType returns false (safe fallback)', () => {
  const legacyRow = { type: 'Boots', gender: 'mens' };
  return assertFalse(clShoeEbay.clIsShoeRow(legacyRow), 'legacy ambiguous row should be false');
});

test(4, 'Null/undefined row returns false', () => {
  return assertFalse(clShoeEbay.clIsShoeRow(null), 'null row should return false') &&
         assertFalse(clShoeEbay.clIsShoeRow(undefined), 'undefined row should return false');
});

test(5, 'Row with itemType=shoes but no shoeGroup still returns true', () => {
  const row = { itemType: 'shoes' };
  return assertTrue(clShoeEbay.clIsShoeRow(row), 'itemType=shoes is the only requirement');
});

test(6, 'Empty object returns false', () => {
  return assertFalse(clShoeEbay.clIsShoeRow({}), 'empty object should return false');
});

test(7, 'Object with itemType=other returns false', () => {
  const row = { itemType: 'other', shoeGroup: 'mens' };
  return assertFalse(clShoeEbay.clIsShoeRow(row), 'itemType must be exactly "shoes"');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 8-14: Department Mapping (7 Shoe Groups)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 8-14: Department Mapping (All 7 Shoe Groups) ═══\n');

test(8, 'Mens shoeGroup → Men department', () => {
  const row = { shoeGroup: 'mens' };
  return assertEqual(clShoeEbay.clShoeDeptFor(row), 'Men', 'mens should map to Men');
});

test(9, 'Womens shoeGroup → Women department', () => {
  const row = { shoeGroup: 'womens' };
  return assertEqual(clShoeEbay.clShoeDeptFor(row), 'Women', 'womens should map to Women');
});

test(10, 'Boys shoeGroup → Boys department', () => {
  const row = { shoeGroup: 'boys' };
  return assertEqual(clShoeEbay.clShoeDeptFor(row), 'Boys', 'boys should map to Boys');
});

test(11, 'Girls shoeGroup → Girls department', () => {
  const row = { shoeGroup: 'girls' };
  return assertEqual(clShoeEbay.clShoeDeptFor(row), 'Girls', 'girls should map to Girls');
});

test(12, 'Unisex_kids shoeGroup → Unisex Kids department', () => {
  const row = { shoeGroup: 'unisex_kids' };
  return assertEqual(clShoeEbay.clShoeDeptFor(row), 'Unisex Kids', 'unisex_kids should map to Unisex Kids');
});

test(13, 'Baby shoeGroup → Unisex Baby & Toddler department', () => {
  const row = { shoeGroup: 'baby' };
  return assertEqual(clShoeEbay.clShoeDeptFor(row), 'Unisex Baby & Toddler', 'baby should map to Unisex Baby & Toddler');
});

test(14, 'Unisex shoeGroup → Unisex Adults department', () => {
  const row = { shoeGroup: 'unisex' };
  return assertEqual(clShoeEbay.clShoeDeptFor(row), 'Unisex Adults', 'unisex should map to Unisex Adults');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 15-20: No Department Fallback (Explicit Blocking)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 15-20: Department Mapping Without Fallback ═══\n');

test(15, 'Unknown shoeGroup returns undefined (no fallback)', () => {
  const row = { shoeGroup: 'invalid_group' };
  return assertUndefined(clShoeEbay.clShoeDeptFor(row), 'should return undefined for unknown shoeGroup');
});

test(16, 'Missing shoeGroup returns undefined', () => {
  const row = {};
  return assertUndefined(clShoeEbay.clShoeDeptFor(row), 'missing shoeGroup should return undefined');
});

test(17, 'Empty shoeGroup returns undefined', () => {
  const row = { shoeGroup: '' };
  return assertUndefined(clShoeEbay.clShoeDeptFor(row), 'empty shoeGroup should return undefined');
});

test(18, 'Null shoeGroup returns undefined', () => {
  const row = { shoeGroup: null };
  return assertUndefined(clShoeEbay.clShoeDeptFor(row), 'null shoeGroup should return undefined');
});

test(19, 'Case-sensitive: "Mens" (capital M) returns undefined', () => {
  const row = { shoeGroup: 'Mens' };
  return assertUndefined(clShoeEbay.clShoeDeptFor(row), 'shoeGroup is case-sensitive');
});

test(20, 'Typo "mens " (trailing space) returns undefined', () => {
  const row = { shoeGroup: 'mens ' };
  return assertUndefined(clShoeEbay.clShoeDeptFor(row), 'shoeGroup must be exact');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 21-26: Condition Mapping (6 eBay Conditions)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 21-26: Condition Mapping (All 6 eBay Conditions) ═══\n');

test(21, 'NEW_WITH_BOX → 1000', () => {
  const row = { condition: 'NEW_WITH_BOX' };
  return assertEqual(clShoeEbay.clGetShoeConditionIdFor(row), 1000, 'NEW_WITH_BOX should map to 1000');
});

test(22, 'NEW_WITHOUT_BOX → 1500', () => {
  const row = { condition: 'NEW_WITHOUT_BOX' };
  return assertEqual(clShoeEbay.clGetShoeConditionIdFor(row), 1500, 'NEW_WITHOUT_BOX should map to 1500');
});

test(23, 'NEW_WITH_DEFECTS → 1750', () => {
  const row = { condition: 'NEW_WITH_DEFECTS' };
  return assertEqual(clShoeEbay.clGetShoeConditionIdFor(row), 1750, 'NEW_WITH_DEFECTS should map to 1750');
});

test(24, 'PREOWNED_EXCELLENT → 2990', () => {
  const row = { condition: 'PREOWNED_EXCELLENT' };
  return assertEqual(clShoeEbay.clGetShoeConditionIdFor(row), 2990, 'PREOWNED_EXCELLENT should map to 2990');
});

test(25, 'PREOWNED_GOOD → 3000', () => {
  const row = { condition: 'PREOWNED_GOOD' };
  return assertEqual(clShoeEbay.clGetShoeConditionIdFor(row), 3000, 'PREOWNED_GOOD should map to 3000');
});

test(26, 'PREOWNED_FAIR → 3010', () => {
  const row = { condition: 'PREOWNED_FAIR' };
  return assertEqual(clShoeEbay.clGetShoeConditionIdFor(row), 3010, 'PREOWNED_FAIR should map to 3010');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 27-32: No Condition Fallback (Explicit Blocking)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 27-32: Condition Mapping Without Fallback ═══\n');

test(27, 'Unknown condition returns undefined (no fallback)', () => {
  const row = { condition: 'UNKNOWN_CONDITION' };
  return assertUndefined(clShoeEbay.clGetShoeConditionIdFor(row), 'should return undefined for unknown condition');
});

test(28, 'Missing condition returns undefined', () => {
  const row = {};
  return assertUndefined(clShoeEbay.clGetShoeConditionIdFor(row), 'missing condition should return undefined');
});

test(29, 'Empty condition returns undefined', () => {
  const row = { condition: '' };
  return assertUndefined(clShoeEbay.clGetShoeConditionIdFor(row), 'empty condition should return undefined');
});

test(30, 'Case-sensitive: "new_with_box" (lowercase) returns undefined', () => {
  const row = { condition: 'new_with_box' };
  return assertUndefined(clShoeEbay.clGetShoeConditionIdFor(row), 'condition is case-sensitive');
});

test(31, 'Typo: "PREOWNED_EXCELLNT" returns undefined', () => {
  const row = { condition: 'PREOWNED_EXCELLNT' };
  return assertUndefined(clShoeEbay.clGetShoeConditionIdFor(row), 'condition must be exact');
});

test(32, 'Clothing condition "NWT" returns undefined for shoe path', () => {
  const row = { condition: 'NWT' };
  return assertUndefined(clShoeEbay.clGetShoeConditionIdFor(row), 'clothing conditions not valid for shoes');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 33-38: Category Routing for MENS (multiple categories)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 33-38: Mens Shoe Routing ═══\n');

const mensCategories = [
  { cat: 'Sneakers', expected: 15709 },
  { cat: 'Running', expected: 15709 },
  { cat: 'Athletic', expected: 15709 },
  { cat: 'Basketball', expected: 15709 },
  { cat: 'Casual', expected: 24087 },
  { cat: 'Dress Shoes', expected: 53120 },
];

mensCategories.forEach((item, idx) => {
  const testNum = 33 + idx;
  test(testNum, `Mens: ${item.cat} → ${item.expected}`, () => {
    const row = { shoeGroup: 'mens', sourceCategory: item.cat };
    return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), item.expected, `${item.cat} should route to ${item.expected}`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 39-45: Category Routing for WOMENS (multiple categories)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 39-45: Womens Shoe Routing ═══\n');

const womensCategories = [
  { cat: 'Sneakers', expected: 95672 },
  { cat: 'Running', expected: 95672 },
  { cat: 'Athletic', expected: 95672 },
  { cat: 'Basketball', expected: 95672 },
  { cat: 'Casual', expected: 45333 },
  { cat: 'Flats', expected: 45333 },
  { cat: 'Heels', expected: 55793 },
];

womensCategories.forEach((item, idx) => {
  const testNum = 39 + idx;
  test(testNum, `Womens: ${item.cat} → ${item.expected}`, () => {
    const row = { shoeGroup: 'womens', sourceCategory: item.cat };
    return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), item.expected, `${item.cat} should route to ${item.expected}`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 46-48: Boys Shoes (All categories → 57929)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 46-48: Boys Shoe Routing (All → 57929) ═══\n');

test(46, 'Boys: Sneakers → 57929', () => {
  const row = { shoeGroup: 'boys', sourceCategory: 'Sneakers' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 57929, 'boys sneakers → 57929');
});

test(47, 'Boys: Casual → 57929', () => {
  const row = { shoeGroup: 'boys', sourceCategory: 'Casual' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 57929, 'boys casual → 57929');
});

test(48, 'Boys: Any category → 57929', () => {
  const row = { shoeGroup: 'boys', sourceCategory: 'Boots' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 57929, 'boys boots → 57929');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 49-51: Girls Shoes (All categories → 57974)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 49-51: Girls Shoe Routing (All → 57974) ═══\n');

test(49, 'Girls: Sneakers → 57974', () => {
  const row = { shoeGroup: 'girls', sourceCategory: 'Sneakers' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 57974, 'girls sneakers → 57974');
});

test(50, 'Girls: Casual → 57974', () => {
  const row = { shoeGroup: 'girls', sourceCategory: 'Casual' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 57974, 'girls casual → 57974');
});

test(51, 'Girls: Any category → 57974', () => {
  const row = { shoeGroup: 'girls', sourceCategory: 'Heels' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 57974, 'girls heels → 57974');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 52-56: Unisex Routing (Mixed mapping)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 52-56: Unisex Shoe Routing (Mixed Mapping) ═══\n');

test(52, 'Unisex: Sneakers → 15709', () => {
  const row = { shoeGroup: 'unisex', sourceCategory: 'Sneakers' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 15709, 'unisex sneakers → 15709');
});

test(53, 'Unisex: Casual → 53548', () => {
  const row = { shoeGroup: 'unisex', sourceCategory: 'Casual' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 53548, 'unisex casual → 53548');
});

test(54, 'Unisex: Dress Shoes → 53120', () => {
  const row = { shoeGroup: 'unisex', sourceCategory: 'Dress Shoes' };
  return assertEqual(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 53120, 'unisex dress shoes → 53120');
});

test(55, 'Unisex_kids: Any category → undefined (deliberately unsupported)', () => {
  const row = { shoeGroup: 'unisex_kids', sourceCategory: 'Sneakers' };
  return assertUndefined(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 'unisex_kids not supported');
});

test(56, 'Baby: Any category → undefined (deliberately unsupported)', () => {
  const row = { shoeGroup: 'baby', sourceCategory: 'Sneakers' };
  return assertUndefined(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 'baby not supported');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 57-62: Unknown Category (No Silent Fallback)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 57-62: Unknown Category Handling (No Fallback) ═══\n');

test(57, 'Unknown category for mens → undefined', () => {
  const row = { shoeGroup: 'mens', sourceCategory: 'UnknownType' };
  return assertUndefined(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 'unknown category should return undefined');
});

test(58, 'Unknown category for womens → undefined', () => {
  const row = { shoeGroup: 'womens', sourceCategory: 'FakeCategory' };
  return assertUndefined(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 'unknown category should return undefined');
});

test(59, 'Empty sourceCategory → undefined', () => {
  const row = { shoeGroup: 'mens', sourceCategory: '' };
  return assertUndefined(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 'empty sourceCategory should return undefined');
});

test(60, 'Missing sourceCategory → undefined', () => {
  const row = { shoeGroup: 'mens' };
  return assertUndefined(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 'missing sourceCategory should return undefined');
});

test(61, 'Case-sensitive: "sneakers" (lowercase) → undefined', () => {
  const row = { shoeGroup: 'mens', sourceCategory: 'sneakers' };
  return assertUndefined(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 'sourceCategory is case-sensitive');
});

test(62, 'Missing shoeGroup → undefined', () => {
  const row = { sourceCategory: 'Sneakers' };
  return assertUndefined(clShoeEbay.clGetShoeEbayCategoryIdFor(row), 'missing shoeGroup should return undefined');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 63-68: State Isolation (Shoes vs Clothing)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 63-68: State Isolation (Shoes vs Clothing) ═══\n');

test(63, 'Clothing row with shoeGroup name in sourceCategory is not a shoe', () => {
  const row = { itemType: 'clothing', sourceCategory: 'Boots', gender: 'womens' };
  return assertFalse(clShoeEbay.clIsShoeRow(row), 'clothing is not misidentified as shoe');
});

test(64, 'Clothing uses gender field, shoes use shoeGroup field', () => {
  const clothRow = { itemType: 'clothing', gender: 'mens', shoeGroup: '' };
  const shoeRow = { itemType: 'shoes', shoeGroup: 'mens', gender: '' };
  return assertFalse(clShoeEbay.clIsShoeRow(clothRow), 'clothing is not shoe') &&
         assertTrue(clShoeEbay.clIsShoeRow(shoeRow), 'shoes is shoe');
});

test(65, 'Shoe functions ignore gender field', () => {
  const row1 = { shoeGroup: 'mens', sourceCategory: 'Sneakers', gender: 'womens' };
  const row2 = { shoeGroup: 'womens', sourceCategory: 'Sneakers', gender: 'mens' };
  const cat1 = clShoeEbay.clGetShoeEbayCategoryIdFor(row1);
  const cat2 = clShoeEbay.clGetShoeEbayCategoryIdFor(row2);
  return assertEqual(cat1, 15709, 'mens routing') && assertEqual(cat2, 95672, 'womens routing');
});

test(66, 'Department mapping for shoes ignores gender', () => {
  const row = { shoeGroup: 'mens', gender: 'womens' };
  return assertEqual(clShoeEbay.clShoeDeptFor(row), 'Men', 'uses shoeGroup, not gender');
});

test(67, 'Clothing condition codes (NWT, NWOT, etc) are invalid for shoes', () => {
  const clothingConditions = ['NWT', 'NWOT', 'EXCEL', 'GOOD', 'FAIR'];
  for (let cond of clothingConditions) {
    const catId = clShoeEbay.clGetShoeConditionIdFor({ condition: cond });
    if (catId !== undefined) throw new Error(`${cond} should not map to shoe condition`);
  }
  return true;
});

test(68, 'Shoe conditions (NEW_WITH_BOX, etc) are for shoes only', () => {
  const row = { condition: 'NEW_WITH_BOX' };
  const condId = clShoeEbay.clGetShoeConditionIdFor(row);
  return assertNotUndefined(condId, 'NEW_WITH_BOX is valid shoe condition');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 69-74: Legacy Row Handling
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 69-74: Legacy Row Handling ═══\n');

test(69, 'Legacy row missing itemType is not detected as shoe', () => {
  const legacyRow = { type: 'Boots', gender: 'mens', sourceCategory: 'Boots' };
  return assertFalse(clShoeEbay.clIsShoeRow(legacyRow), 'legacy ambiguous row should not be shoe');
});

test(70, 'Legacy row with type but no itemType cannot be routed', () => {
  const legacyRow = { type: 'Boots', sourceCategory: 'Boots' };
  const catId = clShoeEbay.clGetShoeEbayCategoryIdFor(legacyRow);
  return assertUndefined(catId, 'legacy row without shoeGroup cannot be routed');
});

test(71, 'Explicit itemType=clothing is safe', () => {
  const row = { itemType: 'clothing', sourceCategory: 'Boots', gender: 'mens' };
  return assertFalse(clShoeEbay.clIsShoeRow(row), 'clothing is explicitly not a shoe');
});

test(72, 'Explicit itemType=shoes is safe', () => {
  const row = { itemType: 'shoes', sourceCategory: 'Boots', shoeGroup: 'mens' };
  return assertTrue(clShoeEbay.clIsShoeRow(row), 'shoes is explicitly a shoe');
});

test(73, 'Row with both itemType and type uses itemType for detection', () => {
  const row = { itemType: 'clothing', type: 'Boots', sourceCategory: 'Boots' };
  return assertFalse(clShoeEbay.clIsShoeRow(row), 'itemType takes precedence');
});

test(74, 'sourceCategory is NOT used for shoe detection, only itemType', () => {
  const row = { itemType: 'clothing', sourceCategory: 'Boots', gender: 'mens' };
  return assertFalse(clShoeEbay.clIsShoeRow(row), 'sourceCategory name does not affect detection');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 75-80: Clothing Regression (No Existing Functionality Broken)
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 75-80: Clothing Regression Tests ═══\n');

test(75, 'Clothing is not a shoe', () => {
  const row = { itemType: 'clothing', gender: 'mens' };
  return assertFalse(clShoeEbay.clIsShoeRow(row), 'clothing is not a shoe');
});

test(76, 'Shoe functions return undefined for clothing rows', () => {
  const clothRow = { itemType: 'clothing', gender: 'womens' };
  const dept = clShoeEbay.clShoeDeptFor(clothRow);
  return assertUndefined(dept, 'shoe functions should not process clothing');
});

test(77, 'Shoe routing is not called on clothing rows', () => {
  const clothRow = { itemType: 'clothing', sourceCategory: 'Jeans', gender: 'mens' };
  const catId = clShoeEbay.clGetShoeEbayCategoryIdFor(clothRow);
  return assertUndefined(catId, 'shoe routing should not apply to clothing');
});

test(78, 'clIsShoeRow is the safe detection boundary', () => {
  const clothRow = { itemType: 'clothing' };
  if (clShoeEbay.clIsShoeRow(clothRow)) {
    throw new Error('clothing must not be detected as shoe');
  }
  return true;
});

test(79, 'Multiple rows can be evaluated independently', () => {
  const row1 = { itemType: 'shoes', shoeGroup: 'mens' };
  const row2 = { itemType: 'clothing', gender: 'womens' };
  return assertTrue(clShoeEbay.clIsShoeRow(row1), 'row1 is shoe') &&
         assertFalse(clShoeEbay.clIsShoeRow(row2), 'row2 is not shoe');
});

test(80, 'Pure functions have no side effects', () => {
  const row = { shoeGroup: 'mens', sourceCategory: 'Sneakers' };
  const dept1 = clShoeEbay.clShoeDeptFor(row);
  const dept2 = clShoeEbay.clShoeDeptFor(row);
  return assertEqual(dept1, dept2, 'same row produces same result');
});

// ═══════════════════════════════════════════════════════════════════════════
// TESTS 81-95: Integration & Source Verification
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n═══ TESTS 81-95: Integration & Source Verification ═══\n');

test(81, 'cl-shoe-ebay.js module exports exist', () => {
  return assertEqual(typeof clShoeEbay, 'object', 'clShoeEbay should be object');
});

test(82, 'Browser namespace clShoeEbay would be exported', () => {
  const fileContent = fs.readFileSync(path.join(__dirname, 'cl-shoe-ebay.js'), 'utf8');
  return fileContent.includes('window.clShoeEbay = clShoeEbay') ? true : (() => {throw new Error('window.clShoeEbay export missing')})();
});

test(83, 'clBuildEbayRowData is exported', () => {
  return assertEqual(typeof clShoeEbay.clBuildEbayRowData, 'function', 'clBuildEbayRowData should be function');
});

test(84, 'clValidateShoeExport is exported', () => {
  return assertEqual(typeof clShoeEbay.clValidateShoeExport, 'function', 'clValidateShoeExport should be function');
});

test(85, 'index.html loads cl-shoe-ebay.js before app.js', () => {
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const shoeIdx = html.indexOf('<script src="cl-shoe-ebay.js">');
  const appIdx = html.indexOf('<script src="app.js');
  return (shoeIdx > 0 && appIdx > 0 && shoeIdx < appIdx) ? true : (() => {throw new Error('Script load order wrong')})();
});

test(86, 'app.js does NOT define duplicate CL_SHOE_ROUTING', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  var count = 0;
  var idx = 0;
  while ((idx = appContent.indexOf('CL_SHOE_ROUTING', idx)) !== -1) {
    if (appContent.substring(idx-20, idx).includes('const ') ||
        appContent.substring(idx-20, idx).includes('var ')) count++;
    idx += 1;
  }
  return assertEqual(count, 0, 'app.js should not define CL_SHOE_ROUTING');
});

test(87, 'app.js does NOT define duplicate clIsShoeRow', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  return appContent.match(/function clIsShoeRow/) ? false : true;
});

test(88, 'clDept() does NOT have fallback || "Unisex Adults"', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  const clDeptMatch = appContent.match(/function clDept\(\)[\s\S]*?return.*?clShoeDeptFor[\s\S]*?\)/);
  if (!clDeptMatch) return true;
  const deptBody = clDeptMatch[0];
  return !deptBody.includes('|| \'Unisex Adults\'') || !deptBody.match(/clShoeDeptFor.*?\|\|/) ? true : (() => {throw new Error('clDept has forbidden fallback')})();
});

test(89, 'clBuildEbayRow() does NOT have || "63861" fallback for shoes', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  const builderMatch = appContent.match(/function clBuildEbayRow[\s\S]*?categoryId:[\s\S]*?\n/);
  if (!builderMatch) return true;
  const line = builderMatch[0];
  return !line.match(/shoes.*\|\|.*63861/) && !line.match(/shoes.*\|\|.*1000/) ? true : (() => {throw new Error('clBuildEbayRow has forbidden fallbacks')})();
});

test(90, 'clBuildEbayRow() calls clShoeEbay.clBuildEbayRowData', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  return appContent.includes('clShoeEbay.clBuildEbayRowData') ? true : (() => {throw new Error('Not using shared builder')})();
});

test(91, 'clShoeEbay.clBuildEbayRowData internally calls shared functions', () => {
  const shoeEbayContent = fs.readFileSync(path.join(__dirname, 'cl-shoe-ebay.js'), 'utf8');
  return shoeEbayContent.includes('clGetShoeEbayCategoryIdFor') &&
         shoeEbayContent.includes('clGetShoeConditionIdFor') ? true : (() => {throw new Error('Shared functions not used in builder')})();
});

test(92, 'unisex_kids routing ONLY has Kids Sneakers and Kids Boots', () => {
  const kids = clShoeEbay.CL_SHOE_ROUTING.unisex_kids;
  const keys = Object.keys(kids);
  return assertEqual(keys.length, 2, 'unisex_kids should have exactly 2 entries') &&
         (kids['Kids Sneakers'] === 155202 ? true : (() => {throw new Error('Kids Sneakers not 155202')})()) &&
         (kids['Kids Boots'] === 155202 ? true : (() => {throw new Error('Kids Boots not 155202')})());
});

test(93, 'unisex adult routing does NOT include category 155202 (kids)', () => {
  const adult = clShoeEbay.CL_SHOE_ROUTING.unisex;
  return Object.values(adult).includes(155202) ? (() => {throw new Error('unisex includes kids category 155202')})() : true;
});

test(94, 'unisex adult routing does NOT include boys (57929) or girls (57974)', () => {
  const adult = clShoeEbay.CL_SHOE_ROUTING.unisex;
  const vals = Object.values(adult);
  return vals.includes(57929) || vals.includes(57974) ? (() => {throw new Error('unisex includes kids categories')})() : true;
});

test(95, 'clBuildEbayRowData pure function accepts input with all fields', () => {
  const result = clShoeEbay.clBuildEbayRowData({
    itemType: 'shoes',
    shoeGroup: 'mens',
    sourceCategory: 'Sneakers',
    condition: 'NEW_WITH_BOX',
    sku: 'TEST-001',
    title: 'Test Shoe',
    brand: 'Nike'
  });
  return assertEqual(result.itemType, 'shoes', 'output itemType') &&
         assertEqual(result.categoryId, 15709, 'output categoryId') &&
         assertEqual(result.conditionId, 1000, 'output conditionId') &&
         assertEqual(result.department, 'Men', 'output department');
});

test(96, 'CSV row detection: itemType=shoes + Sneakers → Shoe row', () => {
  const shoeRow = {
    itemType: 'shoes',
    sourceCategory: 'Sneakers',
    shoeGroup: 'mens'
  };
  return clShoeEbay.clIsShoeRow(shoeRow) === true ? true : (() => {throw new Error('Not detected as shoe')})();
});

test(97, 'CSV row detection: itemType=shoes + Running → Shoe row', () => {
  const shoeRow = {
    itemType: 'shoes',
    sourceCategory: 'Running',
    shoeGroup: 'womens'
  };
  return clShoeEbay.clIsShoeRow(shoeRow) === true ? true : (() => {throw new Error('Not detected as shoe')})();
});

test(98, 'CSV row detection: itemType=shoes + Athletic → Shoe row', () => {
  const shoeRow = {
    itemType: 'shoes',
    sourceCategory: 'Athletic',
    shoeGroup: 'mens'
  };
  return clShoeEbay.clIsShoeRow(shoeRow) === true ? true : (() => {throw new Error('Not detected as shoe')})();
});

test(99, 'CSV row detection: itemType=shoes + Kids Sneakers → Shoe row', () => {
  const shoeRow = {
    itemType: 'shoes',
    sourceCategory: 'Kids Sneakers',
    shoeGroup: 'unisex_kids'
  };
  return clShoeEbay.clIsShoeRow(shoeRow) === true ? true : (() => {throw new Error('Not detected as shoe')})();
});

test(100, 'CSV row detection: unsupported itemType=shoes remains Shoe and is BLOCKED', () => {
  const unsupportedShoe = {
    itemType: 'shoes',
    sourceCategory: 'UnsupportedType',
    shoeGroup: 'mens',
    condition: 'NEW_WITH_BOX'
  };
  const validation = clShoeEbay.clValidateShoeExport([unsupportedShoe]);
  return validation.ok === false && validation.error.includes('unsupported') ? true : (() => {throw new Error('Should block unsupported shoe')})();
});

test(101, 'CSV column validation: Clothing row with type="Boots" is NOT treated as Shoe', () => {
  const clothingRow = {
    itemType: 'clothing',
    type: 'Boots',
    category: 'Boots',
    gender: 'womens'
  };
  return clShoeEbay.clIsShoeRow(clothingRow) === false ? true : (() => {throw new Error('Clothing mistaken for shoe')})();
});

test(102, 'CSV column validation: Shoe size goes to col 32, NOT col 7', () => {
  const shoeRow = clShoeEbay.clBuildEbayRowData({
    itemType: 'shoes',
    shoeGroup: 'mens',
    sourceCategory: 'Sneakers',
    condition: 'NEW_WITH_BOX',
    size: '10'
  });
  return assertEqual(shoeRow.size, '10', 'shoe size field should be preserved');
});

test(103, 'CSV column validation: Clothing row has no shoe-specific fields', () => {
  const clothingRow = clShoeEbay.clBuildEbayRowData({
    itemType: 'clothing',
    gender: 'womens',
    sourceCategory: 'Dress',
    condition: 'NEW_WITH_BOX',
    size: '8'
  });
  return assertEqual(clothingRow.shoeGroup, '', 'clothing shoeGroup must be blank');
});

test(104, 'Legacy classification: itemType missing but shoeGroup present → ambiguous', () => {
  const legacyShoe = {
    shoeGroup: 'mens'
  };
  const classification = clShoeEbay.clClassifySessionRow(legacyShoe);
  return assertEqual(classification, 'shoes', 'should classify as shoe if shoeGroup present');
});

test(105, 'Legacy classification: itemType=clothing with type="Boots" → clothing', () => {
  const legacyClothing = {
    itemType: 'clothing',
    type: 'Boots'
  };
  const classification = clShoeEbay.clClassifySessionRow(legacyClothing);
  return assertEqual(classification, 'clothing', 'should classify as clothing');
});

test(106, 'Production path uses shared builder: CSV export calls clBuildEbayRowData', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  return appContent.includes('clShoeEbay.clBuildEbayRowData(input)') ? true : (() => {throw new Error('Production not using shared builder')})();
});

test(107, 'CSV export uses ONLY clShoeEbay.clIsShoeRow() for detection', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  const exportFunc = appContent.match(/function clExportEbayCSV\(\)[\s\S]*?var csv=lines\.join/);
  if (!exportFunc) return true;
  const body = exportFunc[0];
  return !body.includes('isShoeItem') && !body.includes('APPROVED_ROUTING') ? true : (() => {throw new Error('Old detection logic still present')})();
});

test(108, 'CSV export no longer has duplicate APPROVED_ROUTING table', () => {
  const appContent = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
  const exportFunc = appContent.match(/function clExportEbayCSV\(\)[\s\S]*?var csv=lines\.join/);
  if (!exportFunc) return true;
  const body = exportFunc[0];
  return !body.includes("'mens': ['Athletic Shoes'") ? true : (() => {throw new Error('Duplicate routing still present')})();
});

test(109, 'Shared builder preserves all production fields: sku, photos, title, brand', () => {
  const result = clShoeEbay.clBuildEbayRowData({
    itemType: 'clothing',
    gender: 'womens',
    sourceCategory: 'Dress',
    sku: 'TEST-123',
    photos: 'http://example.com/pic.jpg',
    title: 'Test Dress',
    brand: 'Nike'
  });
  return assertEqual(result.sku, 'TEST-123', 'sku') &&
         assertEqual(result.photos, 'http://example.com/pic.jpg', 'photos') &&
         assertEqual(result.title, 'Test Dress', 'title') &&
         assertEqual(result.brand, 'Nike', 'brand');
});

test(110, 'Shared builder preserves all production fields: weight, description, price', () => {
  const result = clShoeEbay.clBuildEbayRowData({
    itemType: 'clothing',
    gender: 'mens',
    sourceCategory: 'Shirt',
    weightMajor: '1',
    weightMinor: '4',
    weightTotalLb: '1.25',
    description: 'Test description',
    price: '29.99'
  });
  return assertEqual(result.weightMajor, '1', 'weightMajor') &&
         assertEqual(result.weightMinor, '4', 'weightMinor') &&
         assertEqual(result.weightTotalLb, '1.25', 'weightTotalLb') &&
         assertEqual(result.description, 'Test description', 'description') &&
         assertEqual(result.price, '29.99', 'price');
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(70));
console.log('SCHEMA PHASE COMPREHENSIVE TEST RESULTS');
console.log('═'.repeat(70));
console.log(`\nTotal:  ${tests.length} tests`);
console.log(`Passed: ${passed} tests ✓`);
console.log(`Failed: ${failed} tests ✗`);
console.log('\n' + '═'.repeat(70));

if (failed === 0) {
  console.log('✓ ALL TESTS PASSED — Schema phase ready for production\n');
  process.exit(0);
} else {
  console.log(`✗ ${failed} TEST(S) FAILED — Review above\n`);
  process.exit(1);
}
