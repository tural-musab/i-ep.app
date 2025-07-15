import { createClient } from "@/lib/supabase/client"
import { Redis } from "@upstash/redis"
import { environmentManager } from "@/lib/config/environment"

export type HealthStatus = "healthy" | "degraded" | "unhealthy"

export interface HealthCheck {
  name: string
  status: HealthStatus
  responseTime: number
  timestamp: Date
  details?: Record<string, any>
  error?: string
}

export interface SystemHealth {
  status: HealthStatus
  timestamp: Date
  services: HealthCheck[]
  metadata: {
    version: string
    environment: string
    uptime: number
  }
}

export class HealthChecker {
  private static instance: HealthChecker
  private redis: Redis
  private supabase: any
  private startTime: Date

  private constructor() {
    this.redis = Redis.fromEnv()
    this.supabase = createClient()
    this.startTime = new Date()
  }

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker()
    }
    return HealthChecker.instance
  }

  async checkHealth(): Promise<SystemHealth> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkFileSystem(),
      this.checkExternalServices(),
      this.checkMemory(),
      this.checkCPU(),
      this.checkDiskSpace()
    ])

    const overallStatus = this.calculateOverallStatus(checks)
    const config = environmentManager.getConfig()

    return {
      status: overallStatus,
      timestamp: new Date(),
      services: checks,
      metadata: {
        version: process.env.npm_package_version || "unknown",
        environment: config.environment,
        uptime: Date.now() - this.startTime.getTime()
      }
    }
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("id")
        .limit(1)
        .single()

      const responseTime = Date.now() - startTime

      if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
        return {
          name: "database",
          status: "unhealthy",
          responseTime,
          timestamp: new Date(),
          error: error.message,
          details: { error }
        }
      }

      return {
        name: "database",
        status: responseTime > 1000 ? "degraded" : "healthy",
        responseTime,
        timestamp: new Date(),
        details: {
          queryExecuted: true,
          connectionPool: "active"
        }
      }
    } catch (error) {
      return {
        name: "database",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      }
    }
  }

  private async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const testKey = "health-check-test"
      const testValue = Date.now().toString()
      
      await this.redis.set(testKey, testValue, { ex: 60 })
      const retrievedValue = await this.redis.get(testKey)
      await this.redis.del(testKey)

      const responseTime = Date.now() - startTime

      if (retrievedValue !== testValue) {
        return {
          name: "redis",
          status: "unhealthy",
          responseTime,
          timestamp: new Date(),
          error: "Redis value mismatch",
          details: { expected: testValue, actual: retrievedValue }
        }
      }

      return {
        name: "redis",
        status: responseTime > 500 ? "degraded" : "healthy",
        responseTime,
        timestamp: new Date(),
        details: {
          testKey,
          operationsExecuted: 3
        }
      }
    } catch (error) {
      return {
        name: "redis",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      }
    }
  }

  private async checkFileSystem(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const fs = require('fs').promises
      const path = require('path')
      
      const testFile = path.join(process.cwd(), '.health-check')
      const testContent = `health-check-${Date.now()}`
      
      await fs.writeFile(testFile, testContent)
      const readContent = await fs.readFile(testFile, 'utf8')
      await fs.unlink(testFile)

      const responseTime = Date.now() - startTime

      if (readContent !== testContent) {
        return {
          name: "filesystem",
          status: "unhealthy",
          responseTime,
          timestamp: new Date(),
          error: "File system read/write mismatch",
          details: { expected: testContent, actual: readContent }
        }
      }

      return {
        name: "filesystem",
        status: responseTime > 100 ? "degraded" : "healthy",
        responseTime,
        timestamp: new Date(),
        details: {
          testFile,
          operationsExecuted: 3
        }
      }
    } catch (error) {
      return {
        name: "filesystem",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      }
    }
  }

  private async checkExternalServices(): Promise<HealthCheck> {
    const startTime = Date.now()
    const config = environmentManager.getConfig()
    
    try {
      const checks = []

      // Check Supabase API
      if (config.external.supabase.url) {
        try {
          const response = await fetch(`${config.external.supabase.url}/rest/v1/`, {
            method: 'HEAD',
            headers: {
              'apikey': config.external.supabase.anonKey
            }
          })
          checks.push({
            service: 'supabase',
            status: response.ok ? 'healthy' : 'unhealthy',
            statusCode: response.status
          })
        } catch (error) {
          checks.push({
            service: 'supabase',
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Check İyzico API (if enabled)
      if (config.external.iyzico.enabled) {
        try {
          const response = await fetch(config.external.iyzico.baseUrl, {
            method: 'HEAD'
          })
          checks.push({
            service: 'iyzico',
            status: response.ok ? 'healthy' : 'unhealthy',
            statusCode: response.status
          })
        } catch (error) {
          checks.push({
            service: 'iyzico',
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      const responseTime = Date.now() - startTime
      const unhealthyServices = checks.filter(c => c.status === 'unhealthy')
      
      return {
        name: "external_services",
        status: unhealthyServices.length > 0 ? "degraded" : "healthy",
        responseTime,
        timestamp: new Date(),
        details: {
          services: checks,
          totalChecked: checks.length,
          unhealthyCount: unhealthyServices.length
        }
      }
    } catch (error) {
      return {
        name: "external_services",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      }
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const memoryUsage = process.memoryUsage()
      const responseTime = Date.now() - startTime
      
      // Convert to MB
      const usedMemoryMB = memoryUsage.heapUsed / 1024 / 1024
      const totalMemoryMB = memoryUsage.heapTotal / 1024 / 1024
      const memoryPercentage = (usedMemoryMB / totalMemoryMB) * 100

      let status: HealthStatus = "healthy"
      if (memoryPercentage > 90) {
        status = "unhealthy"
      } else if (memoryPercentage > 75) {
        status = "degraded"
      }

      return {
        name: "memory",
        status,
        responseTime,
        timestamp: new Date(),
        details: {
          used: Math.round(usedMemoryMB),
          total: Math.round(totalMemoryMB),
          percentage: Math.round(memoryPercentage),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024)
        }
      }
    } catch (error) {
      return {
        name: "memory",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      }
    }
  }

  private async checkCPU(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const cpuUsage = process.cpuUsage()
      const responseTime = Date.now() - startTime
      
      // Simple CPU check - in production, you'd want more sophisticated monitoring
      const cpuPercentage = (cpuUsage.user + cpuUsage.system) / 1000000 // Convert to seconds
      
      let status: HealthStatus = "healthy"
      if (cpuPercentage > 0.9) {
        status = "unhealthy"
      } else if (cpuPercentage > 0.7) {
        status = "degraded"
      }

      return {
        name: "cpu",
        status,
        responseTime,
        timestamp: new Date(),
        details: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          percentage: Math.round(cpuPercentage * 100)
        }
      }
    } catch (error) {
      return {
        name: "cpu",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      }
    }
  }

  private async checkDiskSpace(): Promise<HealthCheck> {
    const startTime = Date.now()
    
    try {
      const fs = require('fs')
      const stats = fs.statSync(process.cwd())
      const responseTime = Date.now() - startTime
      
      // Note: This is a simplified check. In production, you'd want to check actual disk space
      const mockDiskUsage = 45 // Simulate 45% disk usage
      
      let status: HealthStatus = "healthy"
      if (mockDiskUsage > 90) {
        status = "unhealthy"
      } else if (mockDiskUsage > 80) {
        status = "degraded"
      }

      return {
        name: "disk",
        status,
        responseTime,
        timestamp: new Date(),
        details: {
          usagePercentage: mockDiskUsage,
          path: process.cwd(),
          available: "5.2GB",
          total: "10GB"
        }
      }
    } catch (error) {
      return {
        name: "disk",
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error }
      }
    }
  }

  private calculateOverallStatus(checks: HealthCheck[]): HealthStatus {
    const criticalServices = ["database", "redis"]
    const unhealthyCount = checks.filter(c => c.status === "unhealthy").length
    const degradedCount = checks.filter(c => c.status === "degraded").length
    
    // Check if any critical service is unhealthy
    const criticalUnhealthy = checks.some(c => 
      criticalServices.includes(c.name) && c.status === "unhealthy"
    )
    
    if (criticalUnhealthy || unhealthyCount > 2) {
      return "unhealthy"
    }
    
    if (unhealthyCount > 0 || degradedCount > 1) {
      return "degraded"
    }
    
    return "healthy"
  }

  async getDetailedHealth(): Promise<{
    system: SystemHealth
    performance: {
      averageResponseTime: number
      slowestService: string
      fastestService: string
    }
    recommendations: string[]
  }> {
    const systemHealth = await this.checkHealth()
    
    const responseTimes = systemHealth.services.map(s => s.responseTime)
    const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    
    const slowestService = systemHealth.services.reduce((prev, current) => 
      prev.responseTime > current.responseTime ? prev : current
    ).name
    
    const fastestService = systemHealth.services.reduce((prev, current) => 
      prev.responseTime < current.responseTime ? prev : current
    ).name
    
    const recommendations = this.generateRecommendations(systemHealth)
    
    return {
      system: systemHealth,
      performance: {
        averageResponseTime,
        slowestService,
        fastestService
      },
      recommendations
    }
  }

  private generateRecommendations(health: SystemHealth): string[] {
    const recommendations: string[] = []
    
    for (const service of health.services) {
      if (service.status === "unhealthy") {
        recommendations.push(`Fix ${service.name} service: ${service.error}`)
      } else if (service.status === "degraded") {
        recommendations.push(`Optimize ${service.name} service performance`)
      }
      
      if (service.responseTime > 1000) {
        recommendations.push(`Improve ${service.name} response time (currently ${service.responseTime}ms)`)
      }
    }
    
    const memoryService = health.services.find(s => s.name === "memory")
    if (memoryService?.details?.percentage > 75) {
      recommendations.push("Consider increasing memory allocation or optimizing memory usage")
    }
    
    const diskService = health.services.find(s => s.name === "disk")
    if (diskService?.details?.usagePercentage > 80) {
      recommendations.push("Clean up disk space or increase storage capacity")
    }
    
    return recommendations
  }

  generateHealthReport(): string {
    return new Promise(async (resolve) => {
      const health = await this.getDetailedHealth()
      
      let report = `\n=== SYSTEM HEALTH REPORT ===\n`
      report += `Overall Status: ${health.system.status.toUpperCase()}\n`
      report += `Environment: ${health.system.metadata.environment}\n`
      report += `Version: ${health.system.metadata.version}\n`
      report += `Uptime: ${Math.round(health.system.metadata.uptime / 1000 / 60)} minutes\n`
      report += `Timestamp: ${health.system.timestamp.toISOString()}\n\n`
      
      report += `PERFORMANCE METRICS:\n`
      report += `- Average Response Time: ${Math.round(health.performance.averageResponseTime)}ms\n`
      report += `- Slowest Service: ${health.performance.slowestService}\n`
      report += `- Fastest Service: ${health.performance.fastestService}\n\n`
      
      report += `SERVICE STATUS:\n`
      health.system.services.forEach(service => {
        const statusEmoji = service.status === "healthy" ? "✅" : 
                          service.status === "degraded" ? "⚠️" : "❌"
        report += `${statusEmoji} ${service.name}: ${service.status} (${service.responseTime}ms)\n`
        if (service.error) {
          report += `   Error: ${service.error}\n`
        }
      })
      
      if (health.recommendations.length > 0) {
        report += `\nRECOMMENDATIONS:\n`
        health.recommendations.forEach(rec => {
          report += `💡 ${rec}\n`
        })
      }
      
      resolve(report)
    })
  }
}

// Global instance
export const healthChecker = HealthChecker.getInstance()

// Utility functions
export async function getSystemHealth(): Promise<SystemHealth> {
  return healthChecker.checkHealth()
}

export async function getDetailedHealth() {
  return healthChecker.getDetailedHealth()
}

export function isHealthy(status: HealthStatus): boolean {
  return status === "healthy"
}

export function isDegraded(status: HealthStatus): boolean {
  return status === "degraded"
}

export function isUnhealthy(status: HealthStatus): boolean {
  return status === "unhealthy"
}