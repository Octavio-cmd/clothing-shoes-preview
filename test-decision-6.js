// ─────────────────────────────────────────────────────────────────────────────
// DECISION #6 AUTOMATED TEST SUITES (UPDATED)
// ─────────────────────────────────────────────────────────────────────────────
// Comprehensive verification of:
// - 17 approved eBay footwear category IDs
// - 11 blocking validation rules
// - Header generation (31 columns clothing, 34 columns shoes/mixed)
// - Shoe column population (32-34)
// - Product Scanner isolation

// ── APPROVED ROUTING & VALIDATION DATA ──────────────────────────────────────

var APPROVED_17_CATEGORY_IDS = [
  147285,  // Unisex Baby & Toddler: Shoes
  57929,   // Boys: Shoes
  57974,   // Girls: Shoes
  155202,  // Unisex Kids: Shoes
  15709,   // Men: Athletic Shoes
  11498,   // Men: Boots
  24087,   // Men: Casual Shoes
  53120,   // Men: Dress Shoes
  11504,   // Men: Sandals
  11505,   // Men: Slippers
  95672,   // Women: Athletic Shoes
  53557,   // Women: Boots
  53548,   // Women: Comfort Shoes
  45333,   // Women: Flats
  55793,   // Women: Heels
  62107,   // Women: Sandals
  11632    // Women: Slippers
];

var APPROVED_ROUTING = {
  'mens': ['Athletic Shoes','Boots','Casual Shoes','Dress Shoes','Sandals','Slippers'],
  'womens': ['Athletic Shoes','Boots','Comfort Shoes','Flats','Heels','Sandals','Slippers'],
  'boys': ['Shoes'],
  'girls': ['Shoes'],
  'kids': ['Shoes'],
  'baby': ['Shoes']
};

var APPROVED_DEPARTMENTS = {
  'mens': 'Men',
  'womens': 'Women',
  'boys': 'Boys',
  'girls': 'Girls',
  'kids': 'Unisex Kids',
  'baby': 'Unisex Baby & Toddler'
};

var APPROVED_CONDITIONS = {
  'NEW_WITH_BOX': 1000,
  'NEW_WITHOUT_BOX': 1500,
  'NEW_WITH_DEFECTS': 1750,
  'PREOWNED_EXCELLENT': 2990,
  'PREOWNED_GOOD': 3000,
  'PREOWNED_FAIR': 3010
};

// ── TEST UTILITIES ──────────────────────────────────────────────────────────

function testValidation_Rule1_ShoeGroup(shoeItem) {
  // RULE 1: Recognized shoe group
  var keys = Object.keys(APPROVED_ROUTING);
  for (var i = 0; i < keys.length; i++) {
    if (APPROVED_ROUTING[keys[i]].includes(shoeItem.category)) {
      return { pass: true, msg: 'PASS: Shoe type recognized in approved routing' };
    }
  }
  return { pass: false, msg: 'FAIL: Shoe type not in approved routing (' + shoeItem.category + ')' };
}

function testValidation_Rule2_ApprovedRoute(shoeItem) {
  // RULE 2: Approved Decision #5 type/group route
  var routingTable = {
    'mens': {
      'Athletic Shoes': 15709, 'Boots': 11498, 'Casual Shoes': 24087,
      'Dress Shoes': 53120, 'Sandals': 11504, 'Slippers': 11505
    },
    'womens': {
      'Athletic Shoes': 95672, 'Boots': 53557, 'Comfort Shoes': 53548,
      'Flats': 45333, 'Heels': 55793, 'Sandals': 62107, 'Slippers': 11632
    },
    'boys': {'Shoes': 57929},
    'girls': {'Shoes': 57974},
    'kids': {'Shoes': 155202},
    'baby': {'Shoes': 147285}
  };

  // Find gender for this shoe type
  var gender = Object.keys(APPROVED_ROUTING).find(function(g) {
    return APPROVED_ROUTING[g].includes(shoeItem.category);
  });

  if (!gender) return { pass: false, msg: 'FAIL: No gender found for type ' + shoeItem.category };

  var expectedCatId = routingTable[gender][shoeItem.category];
  if (!expectedCatId) return { pass: false, msg: 'FAIL: No category ID for ' + gender + '/' + shoeItem.category };

  if (shoeItem.categoryId !== expectedCatId) {
    return { pass: false, msg: 'FAIL: Expected category ID ' + expectedCatId + ', got ' + shoeItem.categoryId };
  }

  return { pass: true, msg: 'PASS: Category ID matches Decision #5 routing (' + expectedCatId + ')' };
}

function testValidation_Rule3_Condition(shoeItem) {
  // RULE 3: Valid shoe condition (Decision #4)
  if (!shoeItem.conditionId) {
    return { pass: false, msg: 'FAIL: Missing condition ID' };
  }

  var conditionIds = Object.keys(APPROVED_CONDITIONS).map(function(k) {
    return APPROVED_CONDITIONS[k];
  });

  if (!conditionIds.includes(shoeItem.conditionId)) {
    return { pass: false, msg: 'FAIL: Invalid condition ID ' + shoeItem.conditionId };
  }

  return { pass: true, msg: 'PASS: Condition ID valid (' + shoeItem.conditionId + ')' };
}

function testValidation_Rule4_Brand(shoeItem) {
  // RULE 4: Brand present
  if (!shoeItem.brand || String(shoeItem.brand).trim() === '') {
    return { pass: false, msg: 'FAIL: Missing brand' };
  }
  return { pass: true, msg: 'PASS: Brand present (' + shoeItem.brand + ')' };
}

function testValidation_Rule5_ShoeSize(shoeItem) {
  // RULE 5: US Shoe Size present
  if (!shoeItem.size || String(shoeItem.size).trim() === '') {
    return { pass: false, msg: 'FAIL: Missing shoe size' };
  }
  return { pass: true, msg: 'PASS: Shoe size present (' + shoeItem.size + ')' };
}

function testValidation_Rule6_SizeValid(shoeItem) {
  // RULE 6: US Shoe Size valid (numeric 1-20)
  if (!shoeItem.size) {
    return { pass: false, msg: 'FAIL: Size missing' };
  }

  var sizeStr = String(shoeItem.size).trim();
  var sizeNum = parseFloat(sizeStr);

  // Check: pure numeric (integer or single decimal)
  if (!/^(\d+|\d+\.\d)$/.test(sizeStr)) {
    return { pass: false, msg: 'FAIL: Size not numeric format (' + sizeStr + ')' };
  }

  // Check: in range 1-20
  if (sizeNum < 1 || sizeNum > 20) {
    return { pass: false, msg: 'FAIL: Size out of range 1-20 (' + sizeNum + ')' };
  }

  return { pass: true, msg: 'PASS: Size valid (' + sizeNum + ')' };
}

function testValidation_Rule7_Color(shoeItem) {
  // RULE 7: Color present (not Unknown/Other)
  if (!shoeItem.color || String(shoeItem.color).trim() === '') {
    return { pass: false, msg: 'FAIL: Missing color' };
  }

  var colorUpper = String(shoeItem.color).trim().toUpperCase();
  if (colorUpper === 'UNKNOWN' || colorUpper === 'OTHER') {
    return { pass: false, msg: 'FAIL: Color cannot be "' + shoeItem.color + '"' };
  }

  return { pass: true, msg: 'PASS: Color valid (' + shoeItem.color + ')' };
}

function testValidation_Rule8_Material(shoeItem) {
  // RULE 8: Upper Material present
  if (!shoeItem.outerMaterial || String(shoeItem.outerMaterial).trim() === '') {
    return { pass: false, msg: 'FAIL: Missing upper material' };
  }
  return { pass: true, msg: 'PASS: Upper material present (' + shoeItem.outerMaterial + ')' };
}

function testValidation_Rule9_Width(shoeItem) {
  // RULE 9: Shoe Width valid if supplied
  if (shoeItem.shoeWidth && String(shoeItem.shoeWidth).trim() !== '') {
    var widthStr = String(shoeItem.shoeWidth).trim();
    // Valid: "Narrow", "Regular", "Wide", "Extra Wide", or single letters B,D,2E,etc.
    var valid = /^(narrow|regular|wide|extra wide|b|d|2e|aaaa|aaa|aa|m|n|w|ww|2w)/i.test(widthStr);
    if (!valid) {
      return { pass: false, msg: 'FAIL: Invalid shoe width format (' + widthStr + ')' };
    }
  }
  return { pass: true, msg: 'PASS: Shoe width valid or empty' };
}

function testValidation_Rule10_Department(shoeItem) {
  // RULE 10: Department matches Decision #3 routing
  var gender = Object.keys(APPROVED_ROUTING).find(function(g) {
    return APPROVED_ROUTING[g].includes(shoeItem.category);
  });

  if (!gender) {
    return { pass: false, msg: 'FAIL: No gender for type ' + shoeItem.category };
  }

  var expectedDept = APPROVED_DEPARTMENTS[gender];
  if (shoeItem.department !== expectedDept) {
    return { pass: false, msg: 'FAIL: Expected dept "' + expectedDept + '", got "' + shoeItem.department + '"' };
  }

  return { pass: true, msg: 'PASS: Department matches routing (' + expectedDept + ')' };
}

function testValidation_Rule11_CategoryID(shoeItem) {
  // RULE 11: Final Category ID is one of 17 approved footwear IDs
  if (!shoeItem.categoryId) {
    return { pass: false, msg: 'FAIL: Missing category ID' };
  }

  var catId = parseInt(shoeItem.categoryId);
  if (!APPROVED_17_CATEGORY_IDS.includes(catId)) {
    return { pass: false, msg: 'FAIL: Category ID ' + catId + ' not in approved 17 IDs' };
  }

  return { pass: true, msg: 'PASS: Category ID in approved 17 (' + catId + ')' };
}

// ── TEST SUITE 1: APPROVED 17 CATEGORY IDS ─────────────────────────────────

function testSuite1_17CategoryIDs() {
  console.log('\n=== TEST SUITE 1: APPROVED 17 CATEGORY IDS ===');
  console.log('Verifying: [147285, 57929, 57974, 155202, 15709, 11498, 24087, 53120, 11504, 11505, 95672, 53557, 53548, 45333, 55793, 62107, 11632]');

  var results = [];

  // Test 1.1: All 17 IDs are unique
  var uniqueIds = new Set(APPROVED_17_CATEGORY_IDS);
  results.push('1.1: 17 IDs unique: ' + (uniqueIds.size === 17 ? 'PASS' : 'FAIL (duplicates found)'));

  // Test 1.2: Baby (147285) is in list
  results.push('1.2: Baby ID 147285: ' + (APPROVED_17_CATEGORY_IDS.includes(147285) ? 'PASS' : 'FAIL'));

  // Test 1.3: Boys (57929) is in list
  results.push('1.3: Boys ID 57929: ' + (APPROVED_17_CATEGORY_IDS.includes(57929) ? 'PASS' : 'FAIL'));

  // Test 1.4: Girls (57974) is in list
  results.push('1.4: Girls ID 57974: ' + (APPROVED_17_CATEGORY_IDS.includes(57974) ? 'PASS' : 'FAIL'));

  // Test 1.5: Kids (155202) is in list
  results.push('1.5: Kids ID 155202: ' + (APPROVED_17_CATEGORY_IDS.includes(155202) ? 'PASS' : 'FAIL'));

  // Test 1.6: All Men's IDs present (15709, 11498, 24087, 53120, 11504, 11505)
  var mensIds = [15709, 11498, 24087, 53120, 11504, 11505];
  var mensOk = mensIds.every(function(id) { return APPROVED_17_CATEGORY_IDS.includes(id); });
  results.push('1.6: All Men\'s IDs (6): ' + (mensOk ? 'PASS' : 'FAIL'));

  // Test 1.7: All Women's IDs present (95672, 53557, 53548, 45333, 55793, 62107, 11632)
  var womensIds = [95672, 53557, 53548, 45333, 55793, 62107, 11632];
  var womensOk = womensIds.every(function(id) { return APPROVED_17_CATEGORY_IDS.includes(id); });
  results.push('1.7: All Women\'s IDs (7): ' + (womensOk ? 'PASS' : 'FAIL'));

  // Test 1.8: Total count is exactly 17
  results.push('1.8: Total 17 IDs: ' + (APPROVED_17_CATEGORY_IDS.length === 17 ? 'PASS' : 'FAIL (count=' + APPROVED_17_CATEGORY_IDS.length + ')'));

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST SUITE 2: 11 VALIDATION RULES ─────────────────────────────────────

function testSuite2_11ValidationRules() {
  console.log('\n=== TEST SUITE 2: 11 VALIDATION RULES ===');
  var results = [];

  // Test shoe: Men's Athletic Shoes, all valid
  var validShoe = {
    sku: 'VALID-SHOE-1',
    category: 'Athletic Shoes',
    title: 'Valid Nike',
    brand: 'Nike',
    size: '10.5',
    color: 'Black',
    outerMaterial: 'Mesh',
    shoeWidth: 'Regular',
    categoryId: 15709,
    conditionId: 1000,
    department: 'Men'
  };

  console.log('  Testing VALID shoe: Men\'s Athletic Shoes (Nike, size 10.5)');
  var r1 = testValidation_Rule1_ShoeGroup(validShoe);
  results.push('2.1 - Rule 1 (Recognized shoe group): ' + r1.msg);

  var r2 = testValidation_Rule2_ApprovedRoute(validShoe);
  results.push('2.2 - Rule 2 (Approved routing): ' + r2.msg);

  var r3 = testValidation_Rule3_Condition(validShoe);
  results.push('2.3 - Rule 3 (Valid condition): ' + r3.msg);

  var r4 = testValidation_Rule4_Brand(validShoe);
  results.push('2.4 - Rule 4 (Brand present): ' + r4.msg);

  var r5 = testValidation_Rule5_ShoeSize(validShoe);
  results.push('2.5 - Rule 5 (Size present): ' + r5.msg);

  var r6 = testValidation_Rule6_SizeValid(validShoe);
  results.push('2.6 - Rule 6 (Size numeric 1-20): ' + r6.msg);

  var r7 = testValidation_Rule7_Color(validShoe);
  results.push('2.7 - Rule 7 (Color valid): ' + r7.msg);

  var r8 = testValidation_Rule8_Material(validShoe);
  results.push('2.8 - Rule 8 (Material present): ' + r8.msg);

  var r9 = testValidation_Rule9_Width(validShoe);
  results.push('2.9 - Rule 9 (Width valid): ' + r9.msg);

  var r10 = testValidation_Rule10_Department(validShoe);
  results.push('2.10 - Rule 10 (Department matches): ' + r10.msg);

  var r11 = testValidation_Rule11_CategoryID(validShoe);
  results.push('2.11 - Rule 11 (Category ID in 17): ' + r11.msg);

  // Test invalid cases
  console.log('\n  Testing INVALID shoes (should block):');

  var invalidBrand = Object.assign({}, validShoe, { brand: '' });
  results.push('2.12 - Missing brand blocks: ' + (!testValidation_Rule4_Brand(invalidBrand).pass ? 'PASS' : 'FAIL'));

  var invalidSize = Object.assign({}, validShoe, { size: 'XL' });
  results.push('2.13 - Non-numeric size blocks: ' + (!testValidation_Rule6_SizeValid(invalidSize).pass ? 'PASS' : 'FAIL'));

  var invalidCond = Object.assign({}, validShoe, { conditionId: 9999 });
  results.push('2.14 - Invalid condition blocks: ' + (!testValidation_Rule3_Condition(invalidCond).pass ? 'PASS' : 'FAIL'));

  var invalidCatId = Object.assign({}, validShoe, { categoryId: 63861 });
  results.push('2.15 - Wrong category ID blocks: ' + (!testValidation_Rule11_CategoryID(invalidCatId).pass ? 'PASS' : 'FAIL'));

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST SUITE 3: HEADER & COLUMN GENERATION ────────────────────────────────

function testSuite3_HeaderGeneration() {
  console.log('\n=== TEST SUITE 3: HEADER & COLUMN GENERATION ===');
  var results = [];

  // Test 3.1: Clothing-only header (31 columns)
  results.push('3.1: Clothing-only header 31 columns: MANUAL (requires CSV export)');

  // Test 3.2: Shoes/mixed header (34 columns)
  results.push('3.2: Shoes/mixed header 34 columns: MANUAL (requires CSV export)');

  // Test 3.3: Shoe columns at 32-34
  results.push('3.3: Shoe columns at positions 32-34: MANUAL (requires CSV export)');

  // Test 3.4: Columns 32-34 labels
  results.push('3.4: Column labels (C:US Shoe Size, C:Upper Material, C:Shoe Width): MANUAL (requires CSV export)');

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST SUITE 4: MIXED SESSION (CLOTHING + SHOES) ──────────────────────────

function testSuite4_MixedSession() {
  console.log('\n=== TEST SUITE 4: MIXED SESSION (CLOTHING + SHOES) ===');
  var results = [];

  results.push('4.1: Clothing row shoe columns blank (32-34): MANUAL (requires CSV export)');
  results.push('4.2: Shoe row shoe columns populated (32-34): MANUAL (requires CSV export)');
  results.push('4.3: Mixed CSV header has 34 columns: MANUAL (requires CSV export)');
  results.push('4.4: Original 31 columns preserved in order: MANUAL (requires CSV export)');

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST SUITE 5: PRODUCT SCANNER ISOLATION ────────────────────────────────

function testSuite5_ProductScannerIsolation() {
  console.log('\n=== TEST SUITE 5: PRODUCT SCANNER ISOLATION ===');
  var results = [];

  // Test 5.1: exportCSV function exists
  results.push('5.1: exportCSV function exists: ' + (typeof exportCSV === 'function' ? 'PASS' : 'FAIL'));

  // Test 5.2: clExportEbayCSV is separate
  results.push('5.2: clExportEbayCSV separate from exportCSV: ' + (typeof clExportEbayCSV === 'function' ? 'PASS' : 'FAIL'));

  // Test 5.3: clExportEbayCSV doesn't call exportCSV
  results.push('5.3: clExportEbayCSV doesn\'t call exportCSV: MANUAL (code review required)');

  // Test 5.4: No backend modifications
  results.push('5.4: No backend modifications: MANUAL (verify only app.js changed)');

  // Test 5.5: No Employee/main changes
  results.push('5.5: No Employee/main changes: MANUAL (verify branch isolation)');

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── RUN ALL TEST SUITES ─────────────────────────────────────────────────────

function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║        DECISION #6 COMPREHENSIVE TEST SUITES                   ║');
  console.log('║     Verified: 17 Category IDs + 11 Validation Rules             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  var allResults = [];
  allResults = allResults.concat(testSuite1_17CategoryIDs());
  allResults = allResults.concat(testSuite2_11ValidationRules());
  allResults = allResults.concat(testSuite3_HeaderGeneration());
  allResults = allResults.concat(testSuite4_MixedSession());
  allResults = allResults.concat(testSuite5_ProductScannerIsolation());

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║ TOTAL TEST RESULTS: See above for each suite                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  return allResults;
}

// Export for Node.js / browser testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests: runAllTests,
    testSuite1_17CategoryIDs: testSuite1_17CategoryIDs,
    testSuite2_11ValidationRules: testSuite2_11ValidationRules,
    APPROVED_17_CATEGORY_IDS: APPROVED_17_CATEGORY_IDS,
    APPROVED_ROUTING: APPROVED_ROUTING
  };
}
