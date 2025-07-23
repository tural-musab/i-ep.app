/**
 * ContainerManager - Testcontainers utility for integration tests
 * 
 * Provides isolated Docker containers for PostgreSQL and Redis testing
 * Used in Phase 3 Integration Tests for reliable, reproducible test environments
 */

import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import type { StartedTestContainer } from 'testcontainers';

class ContainerManager {
  private containers = new Map<string, StartedTestContainer>();

  /**
   * Start PostgreSQL container for database integration tests
   */
  async startPostgres(): Promise<StartedTestContainer> {
    console.log('🐘 Starting PostgreSQL container for integration tests...');
    
    const container = await new PostgreSqlContainer('postgres:13')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpass')
      .withExposedPorts(5432)
      .start();

    // Set environment variables for test consumption
    const host = container.getHost();
    const port = container.getMappedPort(5432);
    const connectionString = `postgresql://testuser:testpass@${host}:${port}/testdb`;
    
    process.env.TEST_DATABASE_URL = connectionString;
    process.env.DATABASE_URL = connectionString; // For compatibility
    
    this.containers.set('postgres', container);
    
    console.log(`✅ PostgreSQL container started at ${host}:${port}`);
    return container;
  }

  /**
   * Start Redis container for cache integration tests
   */
  async startRedis(): Promise<StartedTestContainer> {
    console.log('🔴 Starting Redis container for integration tests...');
    
    const container = await new RedisContainer('redis:6-alpine')
      .withExposedPorts(6379)
      .start();

    // Set environment variables for test consumption
    const host = container.getHost();
    const port = container.getMappedPort(6379);
    const connectionString = `redis://${host}:${port}`;
    
    process.env.TEST_REDIS_URL = connectionString;
    process.env.REDIS_URL = connectionString; // For compatibility
    
    this.containers.set('redis', container);
    
    console.log(`✅ Redis container started at ${host}:${port}`);
    return container;
  }

  /**
   * Start both PostgreSQL and Redis containers
   */
  async startAll(): Promise<{postgres: StartedTestContainer, redis: StartedTestContainer}> {
    console.log('🚀 Starting all integration test containers...');
    
    const [postgres, redis] = await Promise.all([
      this.startPostgres(),
      this.startRedis()
    ]);

    console.log('✅ All containers started successfully');
    return { postgres, redis };
  }

  /**
   * Stop a specific container by name
   */
  async stopContainer(name: string): Promise<void> {
    const container = this.containers.get(name);
    if (container) {
      console.log(`🛑 Stopping ${name} container...`);
      await container.stop();
      this.containers.delete(name);
      console.log(`✅ ${name} container stopped`);
    }
  }

  /**
   * Stop all managed containers
   */
  async stopAll(): Promise<void> {
    console.log('🛑 Stopping all integration test containers...');
    
    const stopPromises = Array.from(this.containers.keys()).map(name => 
      this.stopContainer(name)
    );
    
    await Promise.all(stopPromises);
    console.log('✅ All containers stopped');
  }

  /**
   * Get container instance by name
   */
  getContainer(name: string): StartedTestContainer | null {
    return this.containers.get(name) || null;
  }

  /**
   * Health check for all running containers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const health = {};
    
    for (const [name, container] of this.containers.entries()) {
      try {
        // Simple check - container should be running
        health[name] = container.getId() !== null;
      } catch (error) {
        health[name] = false;
      }
    }
    
    return health;
  }
}

// Export singleton instance for consistent container management
const containerManager = new ContainerManager();

export {
  ContainerManager,
  containerManager
};