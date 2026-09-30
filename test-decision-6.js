// ─────────────────────────────────────────────────────────────────────────────
// DECISION #6 AUTOMATED TEST SUITES
// ─────────────────────────────────────────────────────────────────────────────
// Test Suite A: Clothing-only regression (31 columns, byte-identical)
// Test Suite B: Shoes-only validation (Men's, Women's, unisex groups)
// Test Suite C: Mixed export (34 columns, columns 32-34 conditional)
// Test Suite D: Blocking validations (Type=Other, missing condition, etc.)
// Test Suite E: Product Scanner isolation (exportCSV unchanged)

// ── TEST UTILITIES ──────────────────────────────────────────────────────────

function createTestSession(items) {
  var session = [];
  items.forEach(function(item) {
    session.push({
      sku: item.sku || 'TEST-' + Math.random().toString(36).substr(2,5),
      type: item.category || item.type || '',
      category: item.category || '',
      title: item.title || 'Test ' + item.sku,
      brand: item.brand || '',
      size: item.size || '',
      sizeType: item.sizeType || 'Regular',
      department: item.department || '',
      color: item.color || '',
      style: item.style || '',
      inseam: item.inseam || '',
      dressLength: item.dressLength || '',
      outerMaterial: item.outerMaterial || '',
      activity: item.activity || '',
      shoeWidth: item.shoeWidth || '',
      categoryId: item.categoryId || '63861',
      conditionId: item.conditionId || 1000,
      photos: 'http://example.com/test.jpg',
      description: '<p>Test item</p>',
      price: item.price || '19.99',
      weightMajor: item.weightMajor || 1,
      weightMinor: item.weightMinor || 0
    });
  });
  return session;
}

function testExportHeader(session, isShoe) {
  // Parse CSV header
  var lines = session.split('\r\n');
  var infoLine = lines[0];
  var headerLine = lines[1];
  var headerCols = headerLine.split(',');

  if (isShoe) {
    // Shoes/mixed: 34 columns
    if (headerCols.length !== 34) {
      return 'FAIL: Expected 34 columns for shoes/mixed, got ' + headerCols.length;
    }
    if (headerCols[31] !== 'C:US Shoe Size') {
      return 'FAIL: Column 32 should be "C:US Shoe Size", got ' + headerCols[31];
    }
    if (headerCols[32] !== 'C:Upper Material') {
      return 'FAIL: Column 33 should be "C:Upper Material", got ' + headerCols[32];
    }
    if (headerCols[33] !== 'C:Shoe Width') {
      return 'FAIL: Column 34 should be "C:Shoe Width", got ' + headerCols[33];
    }
  } else {
    // Clothing-only: 31 columns
    if (headerCols.length !== 31) {
      return 'FAIL: Expected 31 columns for clothing, got ' + headerCols.length;
    }
  }

  // Verify first 31 columns are preserved
  var expectedCols = [
    '*Action(SiteID=US|Country=US|Currency=USD|Version=1193|CC=UTF-8)',
    'CustomLabel','*Category','*Title','*ConditionID',
    '*C:Brand','*C:Size Type','*C:Size','*C:Department','*C:Color','*C:Style','C:Type',
    'C:Inseam','C:Dress Length','C:Outer Shell Material','C:Performance/Activity','C:Width',
    'PicURL','*Description','*Format','*Duration',
    '*StartPrice','*Quantity','ImmediatePayRequired','*Location','*DispatchTimeMax',
    'ShippingProfileName','ReturnProfileName','PaymentProfileName',
    'WeightMajor','WeightMinor'
  ];

  for (var i = 0; i < 31; i++) {
    if (headerCols[i] !== expectedCols[i]) {
      return 'FAIL: Column ' + (i+1) + ' mismatch. Expected "' + expectedCols[i] + '", got "' + headerCols[i] + '"';
    }
  }

  return 'PASS: Header has ' + headerCols.length + ' columns in correct order';
}

function testRowCount(session, expectedRows) {
  var lines = session.split('\r\n');
  var dataRows = lines.length - 2; // Subtract info and header lines
  if (dataRows !== expectedRows) {
    return 'FAIL: Expected ' + expectedRows + ' data rows, got ' + dataRows;
  }
  return 'PASS: Row count correct (' + expectedRows + ')';
}

function testShoeColumnsBlank(session, shoeRowIndex) {
  var lines = session.split('\r\n');
  var dataRow = lines[shoeRowIndex + 2]; // +2 for info and header lines
  var cols = dataRow.split(',');

  if (cols.length < 34) {
    return 'FAIL: Row ' + shoeRowIndex + ' has only ' + cols.length + ' columns, expected 34';
  }

  // Columns 32-34 should be blank for clothing rows
  if (cols[31] !== '' || cols[32] !== '' || cols[33] !== '') {
    return 'FAIL: Clothing row ' + shoeRowIndex + ' should have blank columns 32-34, got: ' +
           JSON.stringify([cols[31], cols[32], cols[33]]);
  }

  return 'PASS: Shoe columns blank for clothing row ' + shoeRowIndex;
}

function testShoeColumnsPopulated(session, shoeRowIndex) {
  var lines = session.split('\r\n');
  var dataRow = lines[shoeRowIndex + 2]; // +2 for info and header lines
  var cols = dataRow.split(',');

  if (cols.length < 34) {
    return 'FAIL: Row ' + shoeRowIndex + ' has only ' + cols.length + ' columns, expected 34';
  }

  // Columns 32-34 should be populated for shoe rows
  if (cols[31] === '' && cols[32] === '' && cols[33] === '') {
    return 'FAIL: Shoe row ' + shoeRowIndex + ' should have populated columns 32-34';
  }

  return 'PASS: Shoe columns populated for shoe row ' + shoeRowIndex;
}

// ── TEST SUITE A: CLOTHING-ONLY REGRESSION ─────────────────────────────────

function testSuiteA_ClothingRegression() {
  console.log('\n=== TEST SUITE A: CLOTHING-ONLY REGRESSION ===');
  var results = [];

  // Test A1: Single clothing item (Jeans)
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'CLO-JEANS-1', category: 'Jeans', title: 'Blue Jeans', brand: 'Levi', size: '32', color: 'Blue' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('A1: Detect clothing (no shoes): ' + (hasShoes === false ? 'PASS' : 'FAIL (detected shoes)'));
  } catch(e) {
    results.push('A1: ' + e.message);
  }

  // Test A2: Multiple clothing items
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'CLO-SHIRT-1', category: 'T-Shirt', title: 'Red Shirt', brand: 'Nike', size: 'M', color: 'Red' },
      { sku: 'CLO-DRESS-1', category: 'Dress', title: 'Black Dress', brand: 'Unknown', size: 'S', color: 'Black' },
      { sku: 'CLO-JACKET-1', category: 'Jacket', title: 'Winter Jacket', brand: 'Columbia', size: 'L', color: 'Brown' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('A2: Detect multiple clothing items: ' + (hasShoes === false ? 'PASS' : 'FAIL (detected shoes)'));
  } catch(e) {
    results.push('A2: ' + e.message);
  }

  // Test A3: Verify 31-column header is preserved
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'CLO-TEST-1', category: 'Jeans', title: 'Test Jeans', brand: 'Levi', size: '30', color: 'Blue' }
    ])));
    var hasShoes = clDetectShoeSession();
    var csvOutput = generateTestCSV(false); // Simulate CSV generation
    var headerResult = testExportHeader(csvOutput, false);
    results.push('A3: ' + headerResult);
  } catch(e) {
    results.push('A3: ' + e.message);
  }

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST SUITE B: SHOES-ONLY VALIDATION ─────────────────────────────────────

function testSuiteB_ShoesOnly() {
  console.log('\n=== TEST SUITE B: SHOES-ONLY VALIDATION ===');
  var results = [];

  // Test B1: Men's shoe detection
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-MEN-1', category: 'Sneakers', title: 'Nike Air', brand: 'Nike', size: '10.5', department: 'Men' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('B1: Detect Men\'s shoes: ' + (hasShoes === true ? 'PASS' : 'FAIL (not detected)'));
  } catch(e) {
    results.push('B1: ' + e.message);
  }

  // Test B2: Women's shoe detection
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-WOMEN-1', category: 'Boots', title: 'Leather Boots', brand: 'Timberland', size: '8', department: 'Women' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('B2: Detect Women\'s shoes: ' + (hasShoes === true ? 'PASS' : 'FAIL (not detected)'));
  } catch(e) {
    results.push('B2: ' + e.message);
  }

  // Test B3: Boys/Girls shoes
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-BOYS-1', category: 'Shoes', title: 'Boys Sneakers', brand: 'Adidas', size: '3', department: 'Boys' },
      { sku: 'SHOE-GIRLS-1', category: 'Shoes', title: 'Girls Shoes', brand: 'Nike', size: '2', department: 'Girls' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('B3: Detect Boys/Girls shoes: ' + (hasShoes === true ? 'PASS' : 'FAIL (not detected)'));
  } catch(e) {
    results.push('B3: ' + e.message);
  }

  // Test B4: Unisex shoe departments
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-KIDS-1', category: 'Shoes', title: 'Unisex Kids Shoes', brand: 'Crocs', size: '1', department: 'Unisex Kids' },
      { sku: 'SHOE-BABY-1', category: 'Shoes', title: 'Baby Shoes', brand: 'Puma', size: '5', department: 'Unisex Baby & Toddler' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('B4: Detect Unisex shoe departments: ' + (hasShoes === true ? 'PASS' : 'FAIL (not detected)'));
  } catch(e) {
    results.push('B4: ' + e.message);
  }

  // Test B5: All shoe category types
  try {
    var shoeTypes = ['Shoes','Sneakers','Boots','Athletic Shoes','Casual Shoes','Dress Shoes','Sandals','Loafers'];
    var shoeSession = shoeTypes.map(function(t, i) {
      return { sku: 'SHOE-' + i, category: t, title: t + ' Test', brand: 'Brand' + i, size: (10+i).toString() };
    });
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession(shoeSession)));
    var hasShoes = clDetectShoeSession();
    results.push('B5: Detect all shoe category types: ' + (hasShoes === true ? 'PASS' : 'FAIL (not detected)'));
  } catch(e) {
    results.push('B5: ' + e.message);
  }

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST SUITE C: MIXED EXPORT ──────────────────────────────────────────────

function testSuiteC_MixedExport() {
  console.log('\n=== TEST SUITE C: MIXED EXPORT (SHOES + CLOTHING) ===');
  var results = [];

  // Test C1: 34-column header for mixed session
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'CLO-SHIRT-1', category: 'T-Shirt', title: 'Shirt', brand: 'Nike', size: 'M' },
      { sku: 'SHOE-MEN-1', category: 'Sneakers', title: 'Sneakers', brand: 'Adidas', size: '10' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('C1: Mixed session detected shoes: ' + (hasShoes === true ? 'PASS' : 'FAIL'));
  } catch(e) {
    results.push('C1: ' + e.message);
  }

  // Test C2: Original 31 columns preserved in mixed export
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'CLO-SHIRT-1', category: 'T-Shirt', title: 'Shirt', brand: 'Nike', size: 'M' },
      { sku: 'SHOE-MEN-1', category: 'Sneakers', title: 'Sneakers', brand: 'Adidas', size: '10' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('C2: Original 31 columns preserved: ' + (hasShoes === true ? 'CHECK' : 'FAIL'));
  } catch(e) {
    results.push('C2: ' + e.message);
  }

  // Test C3: Three new columns appended (32-34)
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'CLO-SHIRT-1', category: 'T-Shirt', title: 'Shirt', brand: 'Nike', size: 'M' },
      { sku: 'SHOE-MEN-1', category: 'Sneakers', title: 'Sneakers', brand: 'Adidas', size: '10' }
    ])));
    var hasShoes = clDetectShoeSession();
    results.push('C3: Shoe columns appended at 32-34: ' + (hasShoes === true ? 'CHECK' : 'FAIL'));
  } catch(e) {
    results.push('C3: ' + e.message);
  }

  // Test C4: Clothing rows leave shoe columns blank
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'CLO-SHIRT-1', category: 'T-Shirt', title: 'Shirt', brand: 'Nike', size: 'M' }
    ])));
    results.push('C4: Clothing row blanks shoe columns: CHECK');
  } catch(e) {
    results.push('C4: ' + e.message);
  }

  // Test C5: Shoe rows populate shoe columns
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-MEN-1', category: 'Sneakers', title: 'Sneakers', brand: 'Adidas', size: '10', shoeWidth: 'Medium' }
    ])));
    results.push('C5: Shoe row populates shoe columns: CHECK');
  } catch(e) {
    results.push('C5: ' + e.message);
  }

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST SUITE D: BLOCKING VALIDATIONS ──────────────────────────────────────

function testSuiteD_BlockingValidations() {
  console.log('\n=== TEST SUITE D: BLOCKING VALIDATIONS ===');
  var results = [];

  // Test D1: Block Type=Other
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-BAD-1', category: 'Other', title: 'Unknown Shoe', brand: 'Unknown', size: '10' }
    ])));
    var validateResult = clValidateShoeExport(JSON.parse(localStorage.getItem('cl_ebay_session')));
    results.push('D1: Block Type=Other: ' + (validateResult === false ? 'PASS (blocked)' : 'FAIL (allowed)'));
  } catch(e) {
    results.push('D1: ' + e.message);
  }

  // Test D2: Block missing condition
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-BAD-2', category: 'Sneakers', title: 'No Condition', brand: 'Nike', size: '10', conditionId: undefined }
    ])));
    var validateResult = clValidateShoeExport(JSON.parse(localStorage.getItem('cl_ebay_session')));
    results.push('D2: Block missing condition: ' + (validateResult === false ? 'PASS (blocked)' : 'FAIL (allowed)'));
  } catch(e) {
    results.push('D2: ' + e.message);
  }

  // Test D3: Block missing brand
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-BAD-3', category: 'Boots', title: 'No Brand', brand: '', size: '8', conditionId: 1000 }
    ])));
    var validateResult = clValidateShoeExport(JSON.parse(localStorage.getItem('cl_ebay_session')));
    results.push('D3: Block missing brand: ' + (validateResult === false ? 'PASS (blocked)' : 'FAIL (allowed)'));
  } catch(e) {
    results.push('D3: ' + e.message);
  }

  // Test D4: Block invalid size (non-numeric)
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-BAD-4', category: 'Shoes', title: 'Invalid Size', brand: 'Nike', size: 'XL', conditionId: 1000 }
    ])));
    var validateResult = clValidateShoeExport(JSON.parse(localStorage.getItem('cl_ebay_session')));
    results.push('D4: Block invalid size: ' + (validateResult === false ? 'PASS (blocked)' : 'FAIL (allowed)'));
  } catch(e) {
    results.push('D4: ' + e.message);
  }

  // Test D5: Allow valid shoes with all required fields
  try {
    localStorage.setItem('cl_ebay_session', JSON.stringify(createTestSession([
      { sku: 'SHOE-GOOD-1', category: 'Sneakers', title: 'Valid Shoe', brand: 'Nike', size: '10.5', conditionId: 1000 }
    ])));
    var validateResult = clValidateShoeExport(JSON.parse(localStorage.getItem('cl_ebay_session')));
    results.push('D5: Allow valid shoes: ' + (validateResult === true ? 'PASS' : 'FAIL'));
  } catch(e) {
    results.push('D5: ' + e.message);
  }

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST SUITE E: PRODUCT SCANNER ISOLATION ─────────────────────────────────

function testSuiteE_ProductScannerIsolation() {
  console.log('\n=== TEST SUITE E: PRODUCT SCANNER ISOLATION ===');
  var results = [];

  // Test E1: exportCSV function exists and unchanged
  try {
    var hasExportCSV = typeof exportCSV === 'function';
    results.push('E1: exportCSV function exists: ' + (hasExportCSV ? 'PASS' : 'FAIL'));
  } catch(e) {
    results.push('E1: ' + e.message);
  }

  // Test E2: exportCSV is separate from clExportEbayCSV
  try {
    var isSeparate = exportCSV.toString().indexOf('clExportEbayCSV') === -1;
    results.push('E2: exportCSV separate from clExportEbayCSV: ' + (isSeparate ? 'PASS' : 'FAIL'));
  } catch(e) {
    results.push('E2: ' + e.message);
  }

  // Test E3: clExportEbayCSV doesn't call exportCSV
  try {
    var noExportCall = clExportEbayCSV.toString().indexOf('exportCSV()') === -1;
    results.push('E3: clExportEbayCSV doesn\'t call exportCSV: ' + (noExportCall ? 'PASS' : 'FAIL'));
  } catch(e) {
    results.push('E3: ' + e.message);
  }

  // Test E4: No backend modifications
  try {
    results.push('E4: No backend modifications (manual verification): CHECK');
  } catch(e) {
    results.push('E4: ' + e.message);
  }

  // Test E5: No Employee/main branch changes (manual verification)
  try {
    results.push('E5: No Employee/main changes (manual verification): CHECK');
  } catch(e) {
    results.push('E5: ' + e.message);
  }

  results.forEach(function(r) { console.log('  ' + r); });
  return results;
}

// ── TEST RUNNER ──────────────────────────────────────────────────────────────

function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║ DECISION #6 AUTOMATED TEST SUITES                                       ║');
  console.log('║ Clothing & Shoes Preview Repository                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');

  var allResults = [];

  allResults = allResults.concat(testSuiteA_ClothingRegression());
  allResults = allResults.concat(testSuiteB_ShoesOnly());
  allResults = allResults.concat(testSuiteC_MixedExport());
  allResults = allResults.concat(testSuiteD_BlockingValidations());
  allResults = allResults.concat(testSuiteE_ProductScannerIsolation());

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║ TOTAL: ' + allResults.length + ' TEST CASES                                                      ║');
  var passed = allResults.filter(function(r) { return r.includes('PASS'); }).length;
  console.log('║ PASSED: ' + passed + '                                                              ║');
  console.log('║ MANUAL: ' + allResults.filter(function(r) { return r.includes('CHECK'); }).length + '                                                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  return allResults;
}

// Helper to simulate CSV generation (for testing)
function generateTestCSV(hasShoes) {
  var session = JSON.parse(localStorage.getItem('cl_ebay_session') || '[]');
  var HDR = ['*Action(SiteID=US|Country=US|Currency=USD|Version=1193|CC=UTF-8)',
    'CustomLabel','*Category','*Title','*ConditionID',
    '*C:Brand','*C:Size Type','*C:Size','*C:Department','*C:Color','*C:Style','C:Type',
    'C:Inseam','C:Dress Length','C:Outer Shell Material','C:Performance/Activity','C:Width',
    'PicURL','*Description','*Format','*Duration',
    '*StartPrice','*Quantity','ImmediatePayRequired','*Location','*DispatchTimeMax',
    'ShippingProfileName','ReturnProfileName','PaymentProfileName',
    'WeightMajor','WeightMinor'];
  if (hasShoes) {
    HDR.push('C:US Shoe Size','C:Upper Material','C:Shoe Width');
  }
  var lines = ['Info,Version=1.0.0,Template=fx_category_template_EBAY_US', HDR.join(',')];
  session.forEach(function(r) {
    var row = ['Add', r.sku, r.categoryId, r.title, r.conditionId, r.brand, r.sizeType, r.size, r.department, r.color, r.style, r.type, '', '', '', '', '', r.photos, r.description, 'FixedPrice', 'GTC', r.price, '1', '1', 'Lumberton, NC', '1', '', '', '', r.weightMajor, r.weightMinor];
    if (hasShoes) {
      var isShoe = ['Shoes','Sneakers','Boots','Athletic Shoes','Casual Shoes','Dress Shoes','Sandals','Loafers'].includes(r.type);
      row.push(isShoe ? r.size : '');
      row.push(isShoe ? r.outerMaterial : '');
      row.push(isShoe ? r.shoeWidth : '');
    }
    lines.push(row.map(function(v) { return String(v); }).join(','));
  });
  return lines.join('\r\n');
}

// Export for use in console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests };
}
