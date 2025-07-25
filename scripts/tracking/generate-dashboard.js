const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Config'i oku
const configPath = path.resolve(__dirname, '../../tracking/unified-tracking.yaml');
const config = yaml.load(fs.readFileSync(configPath));

// Evidence validation results helper functions
function getEvidenceStatus(evidence) {
  if (!evidence || !evidence.evidence_score) return { icon: '⏳', text: 'Pending' };

  if (evidence.verified) return { icon: '✅', text: 'VERIFIED' };
  if (evidence.evidence_score >= 70) return { icon: '⚠️', text: 'PARTIAL' };
  return { icon: '❌', text: 'FAILED' };
}

function getEvidenceColor(score) {
  if (score >= 85) return '🟢';
  if (score >= 70) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

// Dashboard markdown oluştur
let dashboard = `# 📊 İ-EP.APP Unified Tracking Dashboard

> Last Sync: ${new Date(config.last_sync).toLocaleString('tr-TR')}
> Generated: ${new Date().toLocaleString('tr-TR')}
> Evidence Validation: ${config.evidence_validation && config.evidence_validation.enabled ? '🔍 ACTIVE' : '⚠️ DISABLED'}

## 🎯 Executive Summary

| Metric | Sprint Status | Progress.md | TODO System | Status |
|--------|--------------|-------------|-------------|---------|
| Overall | ${config.sources[0].metrics.completion}% | ${config.sources[1].metrics.overall}% | ${config.sources[2].metrics.total_issues} issues | ${
  Math.abs(config.sources[0].metrics.completion - config.sources[1].metrics.overall) <= 5
    ? '✅ Aligned'
    : '⚠️ Mismatch'
} |
| Phase | ${config.sources[0].metrics.phase} | - | - | 🔄 Active |
| MVP Target | ${config.sources[3].metrics.mvp_date} | - | - | ${
  new Date(config.sources[3].metrics.mvp_date) > new Date() ? '✅ On Track' : '⚠️ At Risk'
} |`;

// Evidence validation section (NEW)
if (config.evidence_validation && config.evidence_validation.enabled) {
  dashboard += `

## 🔍 Evidence-Based Validation

> **Purpose**: Verify claimed completion status with concrete evidence
> **Threshold**: ${config.evidence_validation.validation_threshold}% evidence required
> **Last Validation**: ${config.evidence_validation.last_validation ? new Date(config.evidence_validation.last_validation).toLocaleString('tr-TR') : 'Never'}

| Task | Claimed | Evidence Score | Status | Critical Issues |
|------|---------|----------------|--------|-----------------|`;

  // Add evidence results for each task
  for (const [taskId, evidence] of Object.entries(config.evidence_validation.results)) {
    const status = getEvidenceStatus(evidence);
    const scoreColor = evidence.evidence_score ? getEvidenceColor(evidence.evidence_score) : '⚪';
    const scoreText = evidence.evidence_score
      ? `${scoreColor} ${evidence.evidence_score}%`
      : '⏳ Pending';
    const claimedIcon = evidence.claimed ? '✅' : '❌';

    dashboard += `
| ${taskId.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} | ${claimedIcon} ${evidence.claimed ? 'Complete' : 'Incomplete'} | ${scoreText} | ${status.icon} ${status.text} | ${evidence.verified ? '✅ None' : '🔴 Found'} |`;
  }

  // Evidence summary
  const evidenceResults = Object.values(config.evidence_validation.results);
  const totalTasks = evidenceResults.length;
  const verifiedTasks = evidenceResults.filter((r) => r.verified).length;
  const criticalTasks = evidenceResults.filter((r) => {
    // Check if task is critical (you might need to load evidence config for this)
    return true; // Simplified for now
  }).length;
  const verifiedCritical = evidenceResults.filter((r) => r.verified).length; // Simplified

  dashboard += `

### 📊 Evidence Summary

- **Total Tasks**: ${totalTasks}
- **Verified**: ${verifiedTasks}/${totalTasks} (${Math.round((verifiedTasks / totalTasks) * 100)}%)
- **Critical Verified**: ${verifiedCritical}/${criticalTasks} (${Math.round((verifiedCritical / criticalTasks) * 100)}%)
- **Overall Health**: ${verifiedCritical === criticalTasks ? '🟢 HEALTHY' : '🔴 NEEDS ATTENTION'}

### 🚨 Evidence Action Items

`;

  // Add specific action items based on evidence results
  for (const [taskId, evidence] of Object.entries(config.evidence_validation.results)) {
    if (!evidence.verified) {
      dashboard += `- **${taskId}**: Score ${evidence.evidence_score || 0}% - ${evidence.verified ? 'Verified' : 'Needs evidence improvement'}\n`;
    }
  }
}

dashboard += `

## 📋 TODO Priority Distribution

- 🔴 Critical: ${config.sources[2].metrics.critical} issues
- 🟠 High: ${config.sources[2].metrics.high} issues  
- 🟡 Medium: ${config.sources[2].metrics.medium} issues
- 🟢 Low: ${config.sources[2].metrics.low} issues

**Total**: ${config.sources[2].metrics.total_issues} temporary solutions to resolve

## 📈 System Completion Status

| System | Progress | Evidence Score | Combined Status |
|--------|----------|----------------|-----------------|`;

// Enhanced system status with evidence
const systemEvidence = {
  Assignment: config.evidence_validation?.results?.assignment_system_complete,
  Attendance: config.evidence_validation?.results?.attendance_system_complete,
  'Grade Management': config.evidence_validation?.results?.grade_system_complete,
};

['Assignment', 'Attendance', 'Grade Management'].forEach((system, index) => {
  const progressScore = [
    config.sources[1].metrics.systems.assignment,
    config.sources[1].metrics.systems.attendance,
    config.sources[1].metrics.systems.grade,
  ][index];

  const evidence = systemEvidence[system];
  const evidenceScore = evidence?.evidence_score || 0;
  const evidenceIcon = evidence?.verified ? '✅' : evidenceScore >= 70 ? '⚠️' : '❌';

  const combinedStatus =
    progressScore >= 85 && (evidence?.verified || evidenceScore >= 70)
      ? '✅ READY'
      : '🔄 IN PROGRESS';

  dashboard += `
| ${system} | ${progressScore}% | ${evidenceIcon} ${evidenceScore}% | ${combinedStatus} |`;
});

dashboard += `

## 🚨 Priority Action Items

1. **Evidence**: ${config.evidence_validation?.enabled ? 'Review evidence failures above' : 'Enable evidence validation'}
2. **Critical Issues**: Resolve ${config.sources[2].metrics.critical} critical issues immediately
3. **Phase Progress**: Complete Phase ${config.sources[0].metrics.phase}
4. **MVP Target**: Achieve ${config.sources[3].metrics.target_completion}% by ${config.sources[3].metrics.mvp_date}

---

*This dashboard combines traditional metrics with evidence-based validation for maximum accuracy.*
`;

// Dashboard'u kaydet
const dashboardPath = path.resolve(__dirname, '../../tracking/UNIFIED-DASHBOARD.md');
fs.writeFileSync(dashboardPath, dashboard);
console.log('✅ Enhanced dashboard generated: tracking/UNIFIED-DASHBOARD.md');
console.log(
  `   📊 Includes evidence validation: ${config.evidence_validation?.enabled ? 'YES' : 'NO'}`
);
console.log(
  `   🔍 Last evidence check: ${config.evidence_validation?.last_validation ? new Date(config.evidence_validation.last_validation).toLocaleString() : 'Never'}`
);
