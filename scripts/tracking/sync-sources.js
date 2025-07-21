const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { EvidenceValidator } = require('./evidence-validator.js');

async function syncTrackingSources() {
  console.log('🔄 Starting Unified Tracking Sync...');
  console.log('=====================================');

  // 1. Load tracking config
  const configPath = path.resolve(__dirname, '../../tracking/unified-tracking.yaml');
  const config = yaml.load(fs.readFileSync(configPath));

  // 2. Sync traditional metrics (existing functionality)
  console.log('\n📊 Syncing traditional metrics...');
  config.sources.forEach(source => {
    try {
      const sourceFilePath = path.resolve(__dirname, '../../', source.file.replace('../', ''));
      const content = fs.readFileSync(sourceFilePath, 'utf8');
      
      // Pattern matching ile metrikleri çıkar
      switch(source.id) {
        case 'sprint':
          // Current Phase çıkar
          const phaseMatch = content.match(/Phase (\d+\.\d+)/);
          if (phaseMatch) source.metrics.phase = phaseMatch[0];
          
          // Completion yüzdesi
          const compMatch = content.match(/(\d+)%.*overall/i);
          if (compMatch) source.metrics.completion = parseInt(compMatch[1]);
          break;
          
        case 'progress':
          // Overall progress
          const overallMatch = content.match(/Tamamlanma Yüzdesi.*?(\d+)%/);
          if (overallMatch) source.metrics.overall = parseInt(overallMatch[1]);
          
          // System completion rates
          const assignmentMatch = content.match(/Assignment.*?(\d+)%/);
          const attendanceMatch = content.match(/Attendance.*?(\d+)%/);
          const gradeMatch = content.match(/Grade.*?(\d+)%/);
          
          if (assignmentMatch) source.metrics.systems.assignment = parseInt(assignmentMatch[1]);
          if (attendanceMatch) source.metrics.systems.attendance = parseInt(attendanceMatch[1]);
          if (gradeMatch) source.metrics.systems.grade = parseInt(gradeMatch[1]);
          break;
          
        case 'todo':
          // Temporary solutions count
          const tempMatch = content.match(/(\d+) temporary solutions/);
          if (tempMatch) source.metrics.total_issues = parseInt(tempMatch[1]);
          
          // Priority distribution
          const criticalMatch = content.match(/🔴.*?(\d+)/);
          const highMatch = content.match(/🟡.*?(\d+)/);
          const mediumMatch = content.match(/🟠.*?(\d+)/);
          const lowMatch = content.match(/🟢.*?(\d+)/);
          
          if (criticalMatch) source.metrics.critical = parseInt(criticalMatch[1]);
          if (highMatch) source.metrics.high = parseInt(highMatch[1]);
          if (mediumMatch) source.metrics.medium = parseInt(mediumMatch[1]);
          if (lowMatch) source.metrics.low = parseInt(lowMatch[1]);
          break;
      }
      
      console.log(`   ✅ ${source.id}: Updated`);
    } catch (error) {
      console.log(`   ❌ ${source.id}: Failed - ${error.message}`);
    }
  });

  // 3. Run evidence validation (NEW)
  if (config.evidence_validation && config.evidence_validation.enabled) {
    console.log('\n🔍 Running evidence validation...');
    
    try {
      const validator = new EvidenceValidator();
      const results = await validator.validateAll();
      
      // Update config with evidence results
      config.evidence_validation.last_validation = new Date().toISOString();
      
      for (const [taskId, result] of Object.entries(results)) {
        if (config.evidence_validation.results[taskId]) {
          config.evidence_validation.results[taskId] = {
            claimed: result.claimed_complete,
            evidence_score: result.evidence_score,
            verified: result.verified,
            status: result.status.toLowerCase(),
            last_checked: result.validation_timestamp
          };
        }
      }
      
      console.log('   ✅ Evidence validation completed');
      
      // Generate summary
      const totalTasks = Object.keys(results).length;
      const verifiedTasks = Object.values(results).filter(r => r.verified).length;
      console.log(`   📊 Summary: ${verifiedTasks}/${totalTasks} tasks verified`);
      
    } catch (error) {
      console.log(`   ❌ Evidence validation failed: ${error.message}`);
    }
  }

  // 4. Save updated config
  config.last_sync = new Date().toISOString();
  fs.writeFileSync(configPath, yaml.dump(config));

  console.log('\n✅ Unified tracking sync completed!');
  console.log(`   Timestamp: ${new Date().toLocaleString()}`);
  
  return config;
}

// CLI execution
if (require.main === module) {
  syncTrackingSources()
    .then(() => {
      console.log('\n🎉 Sync process finished successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Sync process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { syncTrackingSources };