// notion-sync-helper.js
// Bu script İ-EP.APP dokümantasyonunu Notion'a taşımanıza yardımcı olur

const fs = require('fs');
const path = require('path');

// Dokümantasyon dosyaları ve Notion'daki konumları
const documentationMap = {
  // Ana dokümantasyon
  'CLAUDE.md': {
    notionPath: 'Project Overview > Current Status',
    title: '📊 Project Status & Context',
    icon: '📋'
  },
  'README.md': {
    notionPath: 'Getting Started > Introduction',
    title: '🚀 İ-EP.APP Introduction',
    icon: '📖'
  },
  
  // Architecture & Strategy
  'FOUNDATION-FIRST-STRATEGY.md': {
    notionPath: 'Architecture > Development Strategy',
    title: '🏗️ Foundation-First Strategy',
    icon: '📐'
  },
  'ANALIZ-RAPORU.md': {
    notionPath: 'Architecture > Analysis Report',
    title: '📊 Comprehensive Analysis',
    icon: '📈'
  },
  
  // Development Guidelines
  'docs/CODE_STANDARDS.md': {
    notionPath: 'Development Guidelines > Code Standards',
    title: '📝 Code Standards & Best Practices',
    icon: '✨'
  },
  'CONTRIBUTING.md': {
    notionPath: 'Development Guidelines > Contributing',
    title: '🤝 Contributing Guidelines',
    icon: '👥'
  },
  'docs/DEVELOPMENT_SETUP.md': {
    notionPath: 'Getting Started > Development Setup',
    title: '🛠️ Development Environment Setup',
    icon: '💻'
  },
  
  // Testing
  'TEST-STATUS-REPORT.md': {
    notionPath: 'Testing > Test Coverage Report',
    title: '🧪 Test Status & Coverage',
    icon: '✅'
  },
  
  // Project Management
  'ACTION-PLAN-OPTIMIZATION.md': {
    notionPath: 'Project Management > Action Plan',
    title: '🎯 Current Action Plan',
    icon: '📅'
  },
  'REALISTIC-TIMELINE-2025.md': {
    notionPath: 'Project Management > Timeline',
    title: '📅 2025 Project Timeline',
    icon: '🗓️'
  },
  'TODO-MANAGEMENT-SYSTEM.md': {
    notionPath: 'Project Management > Task Management',
    title: '✅ TODO Management System',
    icon: '📋'
  },
  
  // Security & Production
  'ENVIRONMENT-VARIABLES-SECURITY-GUIDE.md': {
    notionPath: 'Security > Environment Variables',
    title: '🔐 Environment Variables Guide',
    icon: '🛡️'
  },
  'PRODUCTION-SETUP-GUIDE.md': {
    notionPath: 'Deployment > Production Setup',
    title: '🚀 Production Setup Guide',
    icon: '🌐'
  },
  
  // Daily Workflow
  'GUNLUK-TODO-TAKIP-REHBERI.md': {
    notionPath: 'Project Management > Daily Workflow',
    title: '📅 Daily TODO Tracking Guide',
    icon: '☀️'
  },
  'SETUP-TODO-LIST.md': {
    notionPath: 'Getting Started > Setup Checklist',
    title: '✅ Setup TODO List',
    icon: '📝'
  }
};

// Notion'a taşınacak içerik formatı
const formatForNotion = (content, metadata) => {
  return `# ${metadata.icon} ${metadata.title}

> Imported from: ${metadata.originalFile}
> Last Updated: ${new Date().toLocaleDateString('tr-TR')}

---

${content}

---

## 📝 Metadata
- **Original File**: \`${metadata.originalFile}\`
- **Notion Path**: ${metadata.notionPath}
- **Import Date**: ${new Date().toISOString()}
`;
};

// Dokümantasyon dosyalarını oku ve Notion formatına çevir
const prepareDocumentation = () => {
  const results = [];
  
  for (const [filePath, metadata] of Object.entries(documentationMap)) {
    const fullPath = path.join(__dirname, filePath);
    
    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const formattedContent = formatForNotion(content, {
          ...metadata,
          originalFile: filePath
        });
        
        results.push({
          originalPath: filePath,
          notionPath: metadata.notionPath,
          title: metadata.title,
          content: formattedContent,
          status: 'ready'
        });
        
        console.log(`✅ Prepared: ${filePath} -> ${metadata.notionPath}`);
      } else {
        results.push({
          originalPath: filePath,
          notionPath: metadata.notionPath,
          title: metadata.title,
          status: 'missing',
          error: 'File not found'
        });
        
        console.log(`❌ Missing: ${filePath}`);
      }
    } catch (error) {
      results.push({
        originalPath: filePath,
        notionPath: metadata.notionPath,
        title: metadata.title,
        status: 'error',
        error: error.message
      });
      
      console.log(`⚠️ Error reading ${filePath}: ${error.message}`);
    }
  }
  
  return results;
};

// Özet rapor oluştur
const generateSyncReport = (results) => {
  const ready = results.filter(r => r.status === 'ready').length;
  const missing = results.filter(r => r.status === 'missing').length;
  const errors = results.filter(r => r.status === 'error').length;
  
  const report = `
# 📊 Notion Sync Report

**Generated**: ${new Date().toLocaleString('tr-TR')}

## Summary
- ✅ Ready to sync: ${ready} files
- ❌ Missing files: ${missing}
- ⚠️ Errors: ${errors}
- 📄 Total: ${results.length} files

## File Status

${results.map(r => {
  const statusIcon = r.status === 'ready' ? '✅' : r.status === 'missing' ? '❌' : '⚠️';
  return `- ${statusIcon} **${r.originalPath}**
  - Notion Path: ${r.notionPath}
  - Status: ${r.status}${r.error ? `\n  - Error: ${r.error}` : ''}`;
}).join('\n\n')}

## Next Steps

1. **Create Notion Structure**:
   - Follow the hierarchy in notion-documentation-guide.md
   - Create all parent pages first

2. **Import Content**:
   - Copy formatted content from /notion-sync-output/
   - Paste into corresponding Notion pages
   - Add any additional formatting

3. **Setup Databases**:
   - Create databases as specified in the guide
   - Link related pages
   - Setup views and filters

4. **Final Review**:
   - Check all links work
   - Verify formatting
   - Add team members
`;
  
  return report;
};

// Ana fonksiyon
const main = () => {
  console.log('🚀 Starting İ-EP.APP Documentation Sync Preparation...\n');
  
  // Output klasörünü oluştur
  const outputDir = path.join(__dirname, 'notion-sync-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Dokümantasyonu hazırla
  const results = prepareDocumentation();
  
  // Her hazır dosyayı kaydet
  results.filter(r => r.status === 'ready').forEach(doc => {
    const outputPath = path.join(outputDir, `${doc.title.replace(/[^a-z0-9]/gi, '_')}.md`);
    fs.writeFileSync(outputPath, doc.content);
  });
  
  // Özet raporu oluştur ve kaydet
  const report = generateSyncReport(results);
  fs.writeFileSync(path.join(outputDir, 'SYNC_REPORT.md'), report);
  
  console.log(`\n✅ Sync preparation complete!`);
  console.log(`📁 Output saved to: ${outputDir}`);
  console.log(`📊 Check SYNC_REPORT.md for details`);
};

// Script'i çalıştır
if (require.main === module) {
  main();
}

module.exports = { prepareDocumentation, generateSyncReport };
