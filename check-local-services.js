#!/usr/bin/env node
// Professional Local Development Environment Health Check
const http = require('http');
const net = require('net');

console.log('🔍 İ-EP.APP Local Development Environment Health Check\n');
console.log('📋 Required Services for .env.development.local:\n');

// Services to check based on .env.development.local
const services = [
  {
    name: 'Supabase Local',
    host: 'localhost',
    port: 54321,
    path: '/health',
    required: true,
    description: 'Local Supabase instance'
  },
  {
    name: 'Redis Local',
    host: 'localhost', 
    port: 6379,
    required: true,
    description: 'Local Redis cache'
  },
  {
    name: 'Email Service (MailHog)',
    host: 'localhost',
    port: 1025,
    required: false,
    description: 'Local email testing'
  },
  {
    name: 'MinIO (S3 Compatible)',
    host: 'localhost',
    port: 9000,
    required: false,
    description: 'Local object storage (S3 alternative)'
  },
  {
    name: 'Next.js Dev Server',
    host: 'localhost',
    port: 3000,
    required: false,
    description: 'Development server port'
  }
];

// Check if port is open
function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 3000;
    
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// Check HTTP endpoint
function checkHTTP(host, port, path = '/') {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    };
    
    const req = http.request(options, (res) => {
      resolve({ status: res.statusCode, accessible: true });
    });
    
    req.on('error', () => {
      resolve({ accessible: false });
    });
    
    req.on('timeout', () => {
      resolve({ accessible: false });
    });
    
    req.end();
  });
}

// Main check function
async function checkServices() {
  const results = [];
  
  for (const service of services) {
    process.stdout.write(`⏳ Checking ${service.name}... `);
    
    const isPortOpen = await checkPort(service.host, service.port);
    let httpCheck = null;
    
    if (isPortOpen && service.path) {
      httpCheck = await checkHTTP(service.host, service.port, service.path);
    }
    
    const status = isPortOpen ? '✅ RUNNING' : '❌ NOT RUNNING';
    const required = service.required ? '🔴 REQUIRED' : '🟡 OPTIONAL';
    
    console.log(`${status} ${required}`);
    console.log(`   ${service.description}`);
    
    if (service.path && httpCheck) {
      console.log(`   HTTP Status: ${httpCheck.accessible ? 'OK' : 'FAILED'}`);
    }
    
    results.push({
      ...service,
      running: isPortOpen,
      httpAccessible: httpCheck?.accessible || false
    });
    
    console.log('');
  }
  
  return results;
}

// Generate Docker Compose for missing services
function generateDockerCompose(results) {
  const missingRequired = results.filter(s => s.required && !s.running);
  const missingOptional = results.filter(s => !s.required && !s.running);
  
  if (missingRequired.length === 0 && missingOptional.length === 0) {
    console.log('🎉 All services are running! Local development environment is ready.\n');
    return;
  }
  
  console.log('📋 Service Status Summary:\n');
  
  if (missingRequired.length > 0) {
    console.log('🔴 MISSING REQUIRED SERVICES:');
    missingRequired.forEach(s => {
      console.log(`   ❌ ${s.name} (${s.host}:${s.port}) - ${s.description}`);
    });
    console.log('');
  }
  
  if (missingOptional.length > 0) {
    console.log('🟡 MISSING OPTIONAL SERVICES:');
    missingOptional.forEach(s => {
      console.log(`   ⚠️  ${s.name} (${s.host}:${s.port}) - ${s.description}`);
    });
    console.log('');
  }
  
  console.log('🐳 Docker Compose will be generated for missing services...\n');
}

// Run the check
checkServices().then(generateDockerCompose).catch(console.error);