const db = require('./config/db');
const { calculateCartPricing, createVoucher, deleteVoucher } = require('./models/voucherModel');
const { createPromotion, deletePromotion } = require('./models/promotionModel');
const { createProduct, deleteProduct, findOrCreateCategoryId } = require('./models/productModel');

(async () => {
  console.log('--- STARTING HAPPY HOUR DISCOUNT INTEGRATION TESTS ---');

  let mockProductId = null;
  let mockPromoId = null;
  let mockVoucherCode = 'TESTHH10';
  let mockVoucherId = null;

  try {
    // 1. Resolve category
    console.log('Resolving category...');
    const categoryId = await findOrCreateCategoryId('Test Category');

    // 2. Create a mock product
    console.log('Creating mock product...');
    mockProductId = await createProduct({
      name: 'Mock Chocolate Mousse',
      price: 100000,
      description: 'Test Mousse description',
      ingredients: 'Chocolate, cream',
      image: null,
      categoryId: categoryId
    });
    console.log(`Created mock product with ID: ${mockProductId}`);

    // 3. Create active promotion (Happy Hour 30% active today/now)
    console.log('Creating mock 30% active discount promotion...');
    
    // Set dates and times to ensure it is active right now
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${date}`;
    
    // Make start_time earlier and end_time later than current time
    const startHour = String((now.getHours() - 1 + 24) % 24).padStart(2, '0');
    const endHour = String((now.getHours() + 1) % 24).padStart(2, '0');
    
    mockPromoId = await createPromotion({
      name: 'Happy Hour 30%',
      discount: 30,
      start_date: todayStr,
      end_date: todayStr,
      start_time: `${startHour}:00:00`,
      end_time: `${endHour}:00:00`,
      product_ids: [mockProductId]
    });
    console.log(`Created mock promotion with ID: ${mockPromoId}`);

    // 4. Calculate cart pricing (no voucher)
    console.log('Calculating cart pricing for 2 items (total original = 200k)...');
    const items = [
      { product_id: mockProductId, price: 100000, quantity: 2 }
    ];
    
    const pricingNoVoucher = await calculateCartPricing(items, null);
    console.log('Pricing Result (No Voucher):');
    console.log(`  Subtotal: ${pricingNoVoucher.subtotal}`);
    console.log(`  Promotion Discount (Happy Hour): ${pricingNoVoucher.promotionDiscount}`);
    console.log(`  Total Payable: ${pricingNoVoucher.totalPayable}`);

    // Expected: subtotal = 200,000, promotionDiscount = 60,000, totalPayable = 140,000
    if (pricingNoVoucher.subtotal === 200000 &&
        pricingNoVoucher.promotionDiscount === 60000 &&
        pricingNoVoucher.totalPayable === 140000) {
      console.log('✅ Happy Hour discount calculation test PASSED.');
    } else {
      throw new Error('❌ Happy Hour discount calculation test FAILED.');
    }

    // 5. Create a 10% voucher
    console.log('Creating mock 10% voucher...');
    // expiry date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tYear = tomorrow.getFullYear();
    const tMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tDate = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${tYear}-${tMonth}-${tDate}`;
    
    const voucherRes = await createVoucher(mockVoucherCode, 10, tomorrowStr);
    mockVoucherId = voucherRes.voucher_id;
    console.log(`Created mock voucher: ${mockVoucherCode}`);

    // 6. Calculate pricing with both Happy Hour and Voucher
    console.log('Calculating pricing with both Happy Hour and Voucher...');
    const pricingWithVoucher = await calculateCartPricing(items, mockVoucherCode);
    console.log('Pricing Result (With Voucher):');
    console.log(`  Subtotal: ${pricingWithVoucher.subtotal}`);
    console.log(`  Promotion Discount (Happy Hour): ${pricingWithVoucher.promotionDiscount}`);
    console.log(`  Voucher Discount: ${pricingWithVoucher.voucherDiscount}`);
    console.log(`  Total Discount: ${pricingWithVoucher.totalDiscount}`);
    console.log(`  Total Payable: ${pricingWithVoucher.totalPayable}`);

    // Expected:
    // Original subtotal = 200,000
    // Promotion discount = 60,000
    // After promotion = 140,000
    // Voucher discount (10%) = 14,000
    // Total discount = 74,000
    // Total payable = 126,000
    if (pricingWithVoucher.subtotal === 200000 &&
        pricingWithVoucher.promotionDiscount === 60000 &&
        pricingWithVoucher.voucherDiscount === 14000 &&
        pricingWithVoucher.totalDiscount === 74000 &&
        pricingWithVoucher.totalPayable === 126000) {
      console.log('✅ Voucher on top of Happy Hour calculation test PASSED.');
    } else {
      throw new Error('❌ Voucher on top of Happy Hour calculation test FAILED.');
    }

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉');

  } catch (err) {
    console.error('Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    // 7. Cleanup
    console.log('Cleaning up mock data...');
    try {
      if (mockPromoId) {
        await deletePromotion(mockPromoId);
        console.log(`Deleted mock promotion: ${mockPromoId}`);
      }
      if (mockProductId) {
        await deleteProduct(mockProductId);
        console.log(`Deleted mock product: ${mockProductId}`);
      }
      if (mockVoucherId) {
        await deleteVoucher(mockVoucherId);
        console.log(`Deleted mock voucher: ${mockVoucherCode}`);
      }
    } catch (cleanErr) {
      console.error('Error during cleanup:', cleanErr);
    }
    // Release db connection pool
    await db.end();
  }
})();
