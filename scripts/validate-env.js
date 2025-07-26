// scripts/validate-env.js
const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredVars = {
  // NextAuth
  NEXTAUTH_SECRET: {
    description: 'Secret for NextAuth.js',
    minLength: 32,
    validate: (value) => value && value.length >= 32,
    errorMessage: 'NEXTAUTH_SECRET must be at least 32 characters long',
  },
  NEXTAUTH_URL: {
    description: 'NextAuth URL',
    validate: (value) => value && (value.startsWith('http://') || value.startsWith('https://')),
    errorMessage: 'NEXTAUTH_URL must be a valid URL',
  },

  // Supabase
  SUPABASE_URL: {
    description: 'Supabase project URL',
    validate: (value) => value && value.includes('supabase.co'),
    errorMessage: 'SUPABASE_URL must be a valid Supabase URL',
  },
  SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key',
    validate: (value) => value && value.startsWith('eyJ'),
    errorMessage: 'SUPABASE_ANON_KEY must be a valid JWT token',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key',
    validate: (value) => value && value.startsWith('eyJ'),
    errorMessage: 'SUPABASE_SERVICE_ROLE_KEY must be a valid JWT token',
    optional: process.env.NODE_ENV !== 'production',
  },
};

// Check if running in CI
const isCI = process.env.CI === 'true';

console.log('🔍 Validating environment variables...\n');

let hasErrors = false;
const errors = [];
const warnings = [];

// Load .env.local if it exists
let envLocal = {};
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envLocal[match[1]] = match[2];
    }
  });
}

// Validate each required variable
Object.entries(requiredVars).forEach(([varName, config]) => {
  const value = process.env[varName] || envLocal[varName];

  if (!value && !config.optional) {
    hasErrors = true;
    errors.push(`❌ ${varName}: Missing required variable`);
    console.error(`❌ ${varName}: Missing required variable`);
    console.error(`   ${config.description}`);
  } else if (value && config.validate && !config.validate(value)) {
    hasErrors = true;
    errors.push(`❌ ${varName}: ${config.errorMessage}`);
    console.error(`❌ ${varName}: ${config.errorMessage}`);
  } else if (value) {
    console.log(`✅ ${varName}: Valid`);
  } else if (config.optional) {
    warnings.push(`⚠️  ${varName}: Optional variable not set`);
    console.warn(`⚠️  ${varName}: Optional variable not set`);
  }
});

// Additional checks for CI environment
if (isCI) {
  console.log('\n📋 CI Environment Checks:');

  // Check for Vercel deployment vars
  const vercelVars = ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'];
  vercelVars.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(`⚠️  ${varName}: Required for Vercel deployment`);
      console.warn(`⚠️  ${varName}: Required for Vercel deployment`);
    }
  });
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`   Errors: ${errors.length}`);
console.log(`   Warnings: ${warnings.length}`);

if (hasErrors) {
  console.error('\n❌ Environment validation failed!');
  console.error('\nTo fix these issues:');
  console.error('1. Copy .env.example to .env.local');
  console.error('2. Fill in all required values');
  console.error('3. For CI/CD, add secrets to GitHub repository settings');
  process.exit(1);
} else {
  console.log('\n✅ Environment validation passed!');
}
