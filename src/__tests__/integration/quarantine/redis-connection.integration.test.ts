/**
 * İ-EP.APP - Redis Connection Integration Test
 * Gerçek Redis bağlantısını test eder
 */

import { Redis } from '@upstash/redis';

describe('Redis Connection Integration Tests', () => {
  let redis: Redis;

  beforeAll(() => {
    redis = new Redis({
      url: process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN || 'test-token',
    });
  });

  afterEach(async () => {
    // Clean up test keys after each test
    const testKeys = await redis.keys('integration-test:*');
    if (testKeys.length > 0) {
      await redis.del(...testKeys);
    }
  });

  describe('Redis Basic Operations', () => {
    it('should connect to Redis successfully', async () => {
      const testKey = 'integration-test:connection';
      const testValue = 'connection-test-value';

      // Set a test value
      const setResult = await redis.set(testKey, testValue, { ex: 10 });
      expect(setResult).toBe('OK');

      // Get the test value
      const getValue = await redis.get(testKey);
      expect(getValue).toBe(testValue);

      // Clean up
      await redis.del(testKey);
    });

    it('should handle string operations', async () => {
      const testKey = 'integration-test:string';
      const testValue = 'Hello İ-EP.APP Integration Test!';

      await redis.set(testKey, testValue);
      const result = await redis.get(testKey);
      
      expect(result).toBe(testValue);
    });

    it('should handle JSON data', async () => {
      const testKey = 'integration-test:json';
      const testData = {
        userId: 'test-user-123',
        tenantId: process.env.TEST_TENANT_ID,
        role: 'student',
        lastActivity: new Date().toISOString(),
        metadata: {
          loginCount: 5,
          features: ['assignments', 'grades']
        }
      };

      await redis.set(testKey, JSON.stringify(testData));
      const result = await redis.get(testKey);
      const parsedResult = JSON.parse(result as string);
      
      expect(parsedResult).toEqual(testData);
      expect(parsedResult.userId).toBe('test-user-123');
      expect(parsedResult.tenantId).toBe(process.env.TEST_TENANT_ID);
    });

    it('should handle expiration', async () => {
      const testKey = 'integration-test:expiry';
      const testValue = 'expires-soon';

      // Set with 1 second expiration
      await redis.set(testKey, testValue, { ex: 1 });
      
      // Should exist immediately
      const immediateResult = await redis.get(testKey);
      expect(immediateResult).toBe(testValue);

      // Wait for expiration (2 seconds to be safe)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Should be null after expiration
      const expiredResult = await redis.get(testKey);
      expect(expiredResult).toBeNull();
    });
  });

  describe('Redis Advanced Operations', () => {
    it('should handle hash operations', async () => {
      const hashKey = 'integration-test:hash:user';
      const userDetails = {
        name: 'Test User',
        email: 'test@i-ep.app',
        role: 'student',
        tenantId: process.env.TEST_TENANT_ID!
      };

      // Set hash fields
      await redis.hset(hashKey, userDetails);

      // Get individual field
      const name = await redis.hget(hashKey, 'name');
      expect(name).toBe('Test User');

      // Get all fields
      const allFields = await redis.hgetall(hashKey);
      expect(allFields).toEqual(userDetails);

      // Clean up
      await redis.del(hashKey);
    });

    it('should handle list operations', async () => {
      const listKey = 'integration-test:list:notifications';
      const notifications = [
        'New assignment posted',
        'Grade updated',
        'Attendance recorded'
      ];

      // Push notifications to list
      for (const notification of notifications) {
        await redis.lpush(listKey, notification);
      }

      // Get list length
      const listLength = await redis.llen(listKey);
      expect(listLength).toBe(3);

      // Get all items (in reverse order due to lpush)
      const allItems = await redis.lrange(listKey, 0, -1);
      expect(allItems).toEqual(notifications.reverse());

      // Clean up
      await redis.del(listKey);
    });

    it('should handle set operations', async () => {
      const setKey = 'integration-test:set:permissions';
      const permissions = ['read', 'write', 'delete'];

      // Add members to set
      await redis.sadd(setKey, ...permissions);

      // Check if member exists
      const hasRead = await redis.sismember(setKey, 'read');
      expect(hasRead).toBe(1);

      const hasAdmin = await redis.sismember(setKey, 'admin');
      expect(hasAdmin).toBe(0);

      // Get all members
      const allMembers = await redis.smembers(setKey);
      expect(allMembers.sort()).toEqual(permissions.sort());

      // Clean up
      await redis.del(setKey);
    });
  });

  describe('Redis Performance', () => {
    it('should handle multiple operations quickly', async () => {
      const startTime = Date.now();
      const operations = [];

      // Create 10 concurrent operations
      for (let i = 0; i < 10; i++) {
        const key = `integration-test:perf:${i}`;
        const value = `value-${i}`;
        operations.push(redis.set(key, value, { ex: 30 }));
      }

      // Wait for all operations to complete
      await Promise.all(operations);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Clean up performance test keys
      const perfKeys = await redis.keys('integration-test:perf:*');
      if (perfKeys.length > 0) {
        await redis.del(...perfKeys);
      }
    });

    it('should handle large data efficiently', async () => {
      const testKey = 'integration-test:large-data';
      
      // Create a large JSON object (simulating a large assignment or grade data)
      const largeData = {
        assignmentId: 'large-assignment-123',
        tenantId: process.env.TEST_TENANT_ID,
        students: Array.from({ length: 100 }, (_, i) => ({
          id: `student-${i}`,
          name: `Student ${i}`,
          submissions: Array.from({ length: 10 }, (_, j) => ({
            id: `submission-${i}-${j}`,
            content: `This is submission content for student ${i}, submission ${j}. `.repeat(50),
            timestamp: new Date().toISOString()
          }))
        }))
      };

      const startTime = Date.now();
      
      // Store large data
      await redis.set(testKey, JSON.stringify(largeData), { ex: 30 });
      
      // Retrieve large data
      const result = await redis.get(testKey);
      const parsedResult = JSON.parse(result as string);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(parsedResult.students).toHaveLength(100);
      expect(parsedResult.students[0].submissions).toHaveLength(10);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds for large data

      // Clean up
      await redis.del(testKey);
    });
  });

  describe('Redis Error Handling', () => {
    it('should handle non-existent keys gracefully', async () => {
      const nonExistentKey = 'integration-test:non-existent';
      
      const result = await redis.get(nonExistentKey);
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', async () => {
      const testKey = 'integration-test:invalid-json';
      const invalidJson = '{ invalid json content }';

      await redis.set(testKey, invalidJson);
      const result = await redis.get(testKey);
      
      expect(result).toBe(invalidJson);
      
      // Attempting to parse should throw, but Redis operation should work
      expect(() => JSON.parse(result as string)).toThrow();
    });
  });
});