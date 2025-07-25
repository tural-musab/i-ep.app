/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * İ-EP.APP - Integration Tests Global Teardown
 * Tüm integration testleri sonrasında çalışır
 */

module.exports = async () => {
  console.log('🧹 Starting integration tests global teardown...');
  
  const startTime = Date.now();
  
  try {
    // Get global test manager if available
    const testManager = global.__INTEGRATION_TEST_MANAGER__;
    
    if (testManager) {
      console.log('🧹 Cleaning up test data...');
      await testManager.cleanupTestEnvironment();
      console.log('✅ Test data cleanup completed');
    } else {
      console.log('⚠️  No test manager found, skipping cleanup');
    }
    
    // Clear global references
    delete global.__INTEGRATION_TEST_MANAGER__;
    delete global.testManager;
    
    const endTime = Date.now();
    console.log(`✅ Integration tests global teardown completed in ${endTime - startTime}ms`);
    
  } catch (error) {
    console.error('❌ Integration tests global teardown failed:', error.message);
    console.warn('⚠️  Some test data may not have been cleaned up');
    
    // Don't fail the test run because of cleanup issues
    console.log('✅ Continuing despite cleanup warnings...');
  }
};