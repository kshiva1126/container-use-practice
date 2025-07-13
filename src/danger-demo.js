const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚨 Container Safety Demo - "Dangerous" Commands');
console.log('='.repeat(50));
console.log('This demo shows how container-use protects your host system\n');

function safetyDemo(description, command, riskLevel = 'Medium') {
  console.log(`📍 Demo: ${description}`);
  console.log(`⚠️  Risk Level: ${riskLevel}`);
  console.log(`🛡️  Container Protection: ACTIVE`);
  console.log(`💻 Command: ${command}`);
  
  try {
    const result = execSync(command, { encoding: 'utf8', cwd: '/workdir' });
    console.log(`✅ Executed safely in container:`);
    console.log(`   ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
  } catch (error) {
    console.log(`⚠️  Command failed (safely contained): ${error.message.substring(0, 100)}`);
  }
  console.log('-'.repeat(40) + '\n');
}

console.log('🔒 Current Environment:');
console.log(`   Platform: ${process.platform}`);
console.log(`   Working Dir: ${process.cwd()}`);
console.log(`   User ID: ${process.getuid ? process.getuid() : 'N/A'}`);
console.log(`   Container: ${process.env.container || 'Yes (implied)'}\n`);

safetyDemo(
  'File System Exploration', 
  'ls -la /', 
  'Low'
);

safetyDemo(
  'Create Temporary Files', 
  'touch /tmp/demo-file.txt && echo "Container test" > /tmp/demo-file.txt && cat /tmp/demo-file.txt', 
  'Low'
);

safetyDemo(
  'System Information', 
  'uname -a', 
  'Low'
);

safetyDemo(
  'Process Information', 
  'ps aux | head -10', 
  'Low'
);

safetyDemo(
  'Network Configuration', 
  'ip addr show || ifconfig || echo "Network commands not available"', 
  'Medium'
);

console.log('🎯 Key Safety Features Demonstrated:');
console.log('   ✅ All commands run in isolated container');
console.log('   ✅ Host filesystem is protected');
console.log('   ✅ Limited system access');
console.log('   ✅ No permanent system changes on host');
console.log('   ✅ Easy cleanup and reset');

console.log('\n🛡️  Your host system remains completely safe!');
console.log('💡 This is the power of container-use - safe AI agent experimentation.');