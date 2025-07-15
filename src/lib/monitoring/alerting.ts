import { environmentManager } from "@/lib/config/environment"

export type AlertSeverity = "low" | "medium" | "high" | "critical"
export type AlertStatus = "open" | "acknowledged" | "resolved"
export type AlertChannel = "email" | "slack" | "sms" | "webhook"

export interface Alert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  resolvedBy?: string
  channels: AlertChannel[]
  escalationLevel: number
  tags: string[]
}

export interface AlertRule {
  id: string
  name: string
  description: string
  enabled: boolean
  conditions: AlertCondition[]
  actions: AlertAction[]
  severity: AlertSeverity
  channels: AlertChannel[]
  cooldownMinutes: number
  escalationRules: EscalationRule[]
  tags: string[]
}

export interface AlertCondition {
  type: "threshold" | "anomaly" | "pattern" | "custom"
  metric: string
  operator: "gt" | "lt" | "eq" | "ne" | "gte" | "lte" | "contains" | "not_contains"
  value: number | string
  timeWindow: number // minutes
  evaluationFrequency: number // minutes
}

export interface AlertAction {
  type: "notification" | "webhook" | "script" | "escalate"
  config: Record<string, any>
  delayMinutes?: number
}

export interface EscalationRule {
  level: number
  delayMinutes: number
  channels: AlertChannel[]
  recipients: string[]
}

export interface MonitoringMetrics {
  timestamp: Date
  metric: string
  value: number
  labels: Record<string, string>
  source: string
}

export class AlertingSystem {
  private static instance: AlertingSystem
  private alerts: Map<string, Alert> = new Map()
  private rules: Map<string, AlertRule> = new Map()
  private metrics: MonitoringMetrics[] = []
  private cooldowns: Map<string, Date> = new Map()

  private constructor() {
    this.initializeDefaultRules()
  }

  static getInstance(): AlertingSystem {
    if (!AlertingSystem.instance) {
      AlertingSystem.instance = new AlertingSystem()
    }
    return AlertingSystem.instance
  }

  private initializeDefaultRules(): void {
    // High error rate alert
    this.addRule({
      id: "high-error-rate",
      name: "High Error Rate",
      description: "Alert when error rate exceeds 5% over 5 minutes",
      enabled: true,
      conditions: [
        {
          type: "threshold",
          metric: "error_rate",
          operator: "gt",
          value: 0.05,
          timeWindow: 5,
          evaluationFrequency: 1
        }
      ],
      actions: [
        {
          type: "notification",
          config: { channels: ["email", "slack"] }
        }
      ],
      severity: "high",
      channels: ["email", "slack"],
      cooldownMinutes: 15,
      escalationRules: [
        {
          level: 1,
          delayMinutes: 15,
          channels: ["email"],
          recipients: ["admin@i-ep.app"]
        },
        {
          level: 2,
          delayMinutes: 30,
          channels: ["sms"],
          recipients: ["emergency-contact"]
        }
      ],
      tags: ["performance", "errors"]
    })

    // Response time alert
    this.addRule({
      id: "slow-response-time",
      name: "Slow Response Time",
      description: "Alert when average response time exceeds 2 seconds",
      enabled: true,
      conditions: [
        {
          type: "threshold",
          metric: "avg_response_time",
          operator: "gt",
          value: 2000,
          timeWindow: 10,
          evaluationFrequency: 2
        }
      ],
      actions: [
        {
          type: "notification",
          config: { channels: ["email"] }
        }
      ],
      severity: "medium",
      channels: ["email"],
      cooldownMinutes: 30,
      escalationRules: [],
      tags: ["performance"]
    })

    // Database connection alert
    this.addRule({
      id: "db-connection-failure",
      name: "Database Connection Failure",
      description: "Alert when database connection fails",
      enabled: true,
      conditions: [
        {
          type: "threshold",
          metric: "db_connection_errors",
          operator: "gt",
          value: 0,
          timeWindow: 1,
          evaluationFrequency: 1
        }
      ],
      actions: [
        {
          type: "notification",
          config: { channels: ["email", "slack", "sms"] }
        }
      ],
      severity: "critical",
      channels: ["email", "slack", "sms"],
      cooldownMinutes: 5,
      escalationRules: [
        {
          level: 1,
          delayMinutes: 5,
          channels: ["sms"],
          recipients: ["emergency-contact"]
        }
      ],
      tags: ["database", "critical"]
    })

    // Security alert
    this.addRule({
      id: "security-breach",
      name: "Security Breach Detected",
      description: "Alert when security breach is detected",
      enabled: true,
      conditions: [
        {
          type: "threshold",
          metric: "security_events",
          operator: "gt",
          value: 10,
          timeWindow: 5,
          evaluationFrequency: 1
        }
      ],
      actions: [
        {
          type: "notification",
          config: { channels: ["email", "slack", "sms"] }
        },
        {
          type: "webhook",
          config: { url: "https://security-webhook.i-ep.app/alert" }
        }
      ],
      severity: "critical",
      channels: ["email", "slack", "sms"],
      cooldownMinutes: 0, // No cooldown for security alerts
      escalationRules: [
        {
          level: 1,
          delayMinutes: 0,
          channels: ["sms"],
          recipients: ["security-team"]
        }
      ],
      tags: ["security", "breach"]
    })

    // Disk space alert
    this.addRule({
      id: "low-disk-space",
      name: "Low Disk Space",
      description: "Alert when disk space falls below 10%",
      enabled: true,
      conditions: [
        {
          type: "threshold",
          metric: "disk_usage_percent",
          operator: "gt",
          value: 90,
          timeWindow: 5,
          evaluationFrequency: 5
        }
      ],
      actions: [
        {
          type: "notification",
          config: { channels: ["email"] }
        }
      ],
      severity: "medium",
      channels: ["email"],
      cooldownMinutes: 60,
      escalationRules: [
        {
          level: 1,
          delayMinutes: 60,
          channels: ["slack"],
          recipients: ["ops-team"]
        }
      ],
      tags: ["infrastructure", "disk"]
    })
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.get(ruleId)
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates })
    }
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values())
  }

  getRule(ruleId: string): AlertRule | undefined {
    return this.rules.get(ruleId)
  }

  addMetric(metric: MonitoringMetrics): void {
    this.metrics.push(metric)
    
    // Keep only last 1000 metrics for performance
    if (this.metrics.length > 1000) {
      this.metrics.shift()
    }

    // Evaluate rules
    this.evaluateRules()
  }

  private evaluateRules(): void {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      // Check cooldown
      const lastTriggered = this.cooldowns.get(rule.id)
      if (lastTriggered && Date.now() - lastTriggered.getTime() < rule.cooldownMinutes * 60 * 1000) {
        continue
      }

      // Evaluate conditions
      const triggered = this.evaluateConditions(rule.conditions)
      
      if (triggered) {
        this.triggerAlert(rule)
      }
    }
  }

  private evaluateConditions(conditions: AlertCondition[]): boolean {
    return conditions.every(condition => this.evaluateCondition(condition))
  }

  private evaluateCondition(condition: AlertCondition): boolean {
    const timeWindowMs = condition.timeWindow * 60 * 1000
    const cutoffTime = new Date(Date.now() - timeWindowMs)
    
    const relevantMetrics = this.metrics.filter(
      metric => metric.metric === condition.metric && metric.timestamp >= cutoffTime
    )

    if (relevantMetrics.length === 0) return false

    let value: number
    
    switch (condition.type) {
      case "threshold":
        // Calculate average for threshold conditions
        value = relevantMetrics.reduce((sum, m) => sum + m.value, 0) / relevantMetrics.length
        break
      case "anomaly":
        // Simple anomaly detection (could be more sophisticated)
        const recent = relevantMetrics.slice(-5)
        const historical = relevantMetrics.slice(0, -5)
        if (historical.length === 0) return false
        
        const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length
        const historicalAvg = historical.reduce((sum, m) => sum + m.value, 0) / historical.length
        
        value = Math.abs(recentAvg - historicalAvg) / historicalAvg
        break
      default:
        value = relevantMetrics[relevantMetrics.length - 1].value
    }

    return this.compareValues(value, condition.operator, condition.value)
  }

  private compareValues(actual: number, operator: string, expected: number | string): boolean {
    const expectedNum = typeof expected === "string" ? parseFloat(expected) : expected
    
    switch (operator) {
      case "gt": return actual > expectedNum
      case "lt": return actual < expectedNum
      case "eq": return actual === expectedNum
      case "ne": return actual !== expectedNum
      case "gte": return actual >= expectedNum
      case "lte": return actual <= expectedNum
      default: return false
    }
  }

  private triggerAlert(rule: AlertRule): void {
    const alert: Alert = {
      id: `${rule.id}-${Date.now()}`,
      title: rule.name,
      description: rule.description,
      severity: rule.severity,
      status: "open",
      source: "alerting-system",
      metadata: {
        ruleId: rule.id,
        conditions: rule.conditions,
        triggeredAt: new Date().toISOString()
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      channels: rule.channels,
      escalationLevel: 0,
      tags: rule.tags
    }

    this.alerts.set(alert.id, alert)
    this.cooldowns.set(rule.id, new Date())

    // Execute actions
    this.executeActions(rule.actions, alert)

    // Schedule escalation if configured
    if (rule.escalationRules.length > 0) {
      this.scheduleEscalation(alert, rule.escalationRules)
    }

    console.log(`🚨 Alert triggered: ${alert.title} [${alert.severity}]`)
  }

  private executeActions(actions: AlertAction[], alert: Alert): void {
    for (const action of actions) {
      switch (action.type) {
        case "notification":
          this.sendNotification(alert, action.config)
          break
        case "webhook":
          this.sendWebhook(alert, action.config)
          break
        case "script":
          this.executeScript(alert, action.config)
          break
      }
    }
  }

  private sendNotification(alert: Alert, config: Record<string, any>): void {
    const channels = config.channels || alert.channels
    
    for (const channel of channels) {
      switch (channel) {
        case "email":
          this.sendEmail(alert)
          break
        case "slack":
          this.sendSlackNotification(alert)
          break
        case "sms":
          this.sendSMS(alert)
          break
      }
    }
  }

  private sendEmail(alert: Alert): void {
    // Email implementation would go here
    console.log(`📧 Email sent for alert: ${alert.title}`)
  }

  private sendSlackNotification(alert: Alert): void {
    // Slack implementation would go here
    console.log(`💬 Slack notification sent for alert: ${alert.title}`)
  }

  private sendSMS(alert: Alert): void {
    // SMS implementation would go here
    console.log(`📱 SMS sent for alert: ${alert.title}`)
  }

  private sendWebhook(alert: Alert, config: Record<string, any>): void {
    // Webhook implementation would go here
    console.log(`🔗 Webhook sent for alert: ${alert.title} to ${config.url}`)
  }

  private executeScript(alert: Alert, config: Record<string, any>): void {
    // Script execution would go here
    console.log(`🔧 Script executed for alert: ${alert.title}`)
  }

  private scheduleEscalation(alert: Alert, escalationRules: EscalationRule[]): void {
    for (const rule of escalationRules) {
      setTimeout(() => {
        const currentAlert = this.alerts.get(alert.id)
        if (currentAlert && currentAlert.status === "open") {
          this.escalateAlert(currentAlert, rule)
        }
      }, rule.delayMinutes * 60 * 1000)
    }
  }

  private escalateAlert(alert: Alert, escalationRule: EscalationRule): void {
    alert.escalationLevel = escalationRule.level
    alert.updatedAt = new Date()
    
    // Send escalation notifications
    for (const channel of escalationRule.channels) {
      switch (channel) {
        case "email":
          this.sendEmail(alert)
          break
        case "slack":
          this.sendSlackNotification(alert)
          break
        case "sms":
          this.sendSMS(alert)
          break
      }
    }

    console.log(`🔥 Alert escalated to level ${escalationRule.level}: ${alert.title}`)
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.alerts.get(alertId)
    if (alert && alert.status === "open") {
      alert.status = "acknowledged"
      alert.acknowledgedAt = new Date()
      alert.acknowledgedBy = acknowledgedBy
      alert.updatedAt = new Date()
    }
  }

  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.alerts.get(alertId)
    if (alert && alert.status !== "resolved") {
      alert.status = "resolved"
      alert.resolvedAt = new Date()
      alert.resolvedBy = resolvedBy
      alert.updatedAt = new Date()
    }
  }

  getAlerts(filters?: {
    status?: AlertStatus
    severity?: AlertSeverity
    tags?: string[]
    source?: string
    limit?: number
  }): Alert[] {
    let alerts = Array.from(this.alerts.values())

    if (filters) {
      if (filters.status) {
        alerts = alerts.filter(a => a.status === filters.status)
      }
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity)
      }
      if (filters.tags) {
        alerts = alerts.filter(a => filters.tags!.some(tag => a.tags.includes(tag)))
      }
      if (filters.source) {
        alerts = alerts.filter(a => a.source === filters.source)
      }
      if (filters.limit) {
        alerts = alerts.slice(0, filters.limit)
      }
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId)
  }

  generateReport(): string {
    const alerts = this.getAlerts()
    const openAlerts = alerts.filter(a => a.status === "open")
    const criticalAlerts = alerts.filter(a => a.severity === "critical")
    const rules = this.getRules()

    let report = `\n=== ALERTING SYSTEM REPORT ===\n`
    report += `Total Alerts: ${alerts.length}\n`
    report += `Open Alerts: ${openAlerts.length}\n`
    report += `Critical Alerts: ${criticalAlerts.length}\n`
    report += `Active Rules: ${rules.filter(r => r.enabled).length}\n`
    report += `Total Rules: ${rules.length}\n\n`

    if (openAlerts.length > 0) {
      report += `OPEN ALERTS:\n`
      openAlerts.forEach(alert => {
        report += `🚨 ${alert.title} [${alert.severity}] - ${alert.createdAt.toISOString()}\n`
        report += `   ${alert.description}\n`
        report += `   Escalation Level: ${alert.escalationLevel}\n\n`
      })
    }

    if (criticalAlerts.length > 0) {
      report += `CRITICAL ALERTS:\n`
      criticalAlerts.forEach(alert => {
        report += `🔥 ${alert.title} [${alert.status}] - ${alert.createdAt.toISOString()}\n`
        report += `   ${alert.description}\n\n`
      })
    }

    report += `ACTIVE RULES:\n`
    rules.filter(r => r.enabled).forEach(rule => {
      report += `✅ ${rule.name} [${rule.severity}]\n`
      report += `   ${rule.description}\n`
      report += `   Channels: ${rule.channels.join(", ")}\n`
      report += `   Cooldown: ${rule.cooldownMinutes} minutes\n\n`
    })

    return report
  }
}

// Global instance
export const alertingSystem = AlertingSystem.getInstance()

// Utility functions
export function addAlert(rule: AlertRule): void {
  alertingSystem.addRule(rule)
}

export function triggerManualAlert(alert: Omit<Alert, "id" | "createdAt" | "updatedAt">): void {
  const fullAlert: Alert = {
    ...alert,
    id: `manual-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  alertingSystem["alerts"].set(fullAlert.id, fullAlert)
  alertingSystem["executeActions"]([], fullAlert)
}

export function recordMetric(metric: string, value: number, labels: Record<string, string> = {}): void {
  alertingSystem.addMetric({
    timestamp: new Date(),
    metric,
    value,
    labels,
    source: "application"
  })
}

export function getActiveAlerts(): Alert[] {
  return alertingSystem.getAlerts({ status: "open" })
}

export function getCriticalAlerts(): Alert[] {
  return alertingSystem.getAlerts({ severity: "critical" })
}