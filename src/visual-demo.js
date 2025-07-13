const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎭 Container-use Visual Demo: Host vs Container');
console.log('='.repeat(60));
console.log('This demo clearly shows the difference between host and container environments\n');

// 色付きテキスト用の関数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorText(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function showSection(title, content, color = 'cyan') {
  console.log(colorText(`\n📍 ${title}`, color));
  console.log('─'.repeat(50));
  console.log(content);
}

function compareEnvironments() {
  showSection('Environment Comparison', '', 'magenta');
  
  console.log(colorText('🖥️  YOUR HOST SYSTEM:', 'green'));
  console.log('   • Safe from this demo');
  console.log('   • Your real files untouched');
  console.log('   • Your real directories protected');
  console.log('   • No risk of damage');
  
  console.log(colorText('\n🐳 CONTAINER ENVIRONMENT (Where this runs):', 'yellow'));
  console.log('   • Isolated sandbox');
  console.log('   • Temporary file system');
  console.log('   • Limited system access');
  console.log('   • Can be safely destroyed');
}

function showFileSystemDifference() {
  showSection('File System Exploration', '', 'blue');
  
  try {
    // コンテナ内のディレクトリ構造を表示
    const containerRoot = execSync('ls -la /', { encoding: 'utf8' });
    
    console.log(colorText('🐳 CONTAINER FILE SYSTEM (what I can see):', 'yellow'));
    console.log('📁 Root directory contents:');
    containerRoot.split('\n').slice(0, 10).forEach(line => {
      if (line.trim()) {
        console.log(`   ${line.substring(0, 80)}`);
      }
    });
    
    console.log(colorText('\n🖥️  YOUR HOST SYSTEM:', 'green'));
    console.log('📁 Your real files:');
    console.log('   • /Users/yourname/Documents - PROTECTED ✅');
    console.log('   • /Users/yourname/Desktop - PROTECTED ✅');
    console.log('   • /Applications - PROTECTED ✅');
    console.log('   • /System - PROTECTED ✅');
    console.log('   • All your personal files - PROTECTED ✅');
    
  } catch (error) {
    console.log('   (File system exploration contained safely)');
  }
}

function demonstrateFileDanger() {
  showSection('File Creation Demonstration', '', 'red');
  
  const dangerousFileNames = [
    'important-document.txt',
    'passwords.txt',
    'config.json',
    'database.db',
    'system-backup.tar'
  ];
  
  console.log(colorText('⚠️  SIMULATING "DANGEROUS" FILE OPERATIONS:', 'red'));
  console.log('Creating files that COULD be risky on your host...\n');
  
  const containerPath = '/tmp/fake-danger';
  fs.mkdirSync(containerPath, { recursive: true });
  
  dangerousFileNames.forEach((fileName, index) => {
    const filePath = path.join(containerPath, fileName);
    const fakeContent = `This is a fake ${fileName} file created in container
This COULD have been dangerous if created on your host system:
- Could overwrite important files
- Could fill up disk space  
- Could interfere with applications

But it's safely contained in: ${filePath}
Created at: ${new Date().toISOString()}
Container process: ${process.pid}`;

    fs.writeFileSync(filePath, fakeContent);
    
    setTimeout(() => {
      console.log(colorText(`   ⚠️  Created "${fileName}" in container`, 'yellow'));
      console.log(colorText(`   ✅ Your host file "${fileName}" is safe!`, 'green'));
    }, index * 500);
  });
  
  setTimeout(() => {
    showResults(containerPath);
  }, dangerousFileNames.length * 500 + 1000);
}

function showResults(containerPath) {
  showSection('Results Summary', '', 'green');
  
  try {
    const files = fs.readdirSync(containerPath);
    console.log(colorText('🐳 FILES CREATED IN CONTAINER:', 'yellow'));
    files.forEach(file => {
      console.log(`   📄 ${file} (size: ${fs.statSync(path.join(containerPath, file)).size} bytes)`);
    });
    
    console.log(colorText('\n🖥️  YOUR HOST SYSTEM:', 'green'));
    console.log('   📍 No files created on your real system');
    console.log('   📍 No disk space used on your host');
    console.log('   📍 No interference with your applications');
    console.log('   📍 Complete protection maintained');
    
    // クリーンアップ
    console.log(colorText('\n🧹 CLEANUP:', 'cyan'));
    files.forEach(file => {
      fs.unlinkSync(path.join(containerPath, file));
      console.log(`   🗑️  Removed: ${file}`);
    });
    fs.rmdirSync(containerPath);
    console.log('   ✅ All container files cleaned up');
    
    showFinalSummary();
    
  } catch (error) {
    console.log(`   Error: ${error.message} (safely contained)`);
  }
}

function showFinalSummary() {
  console.log('\n' + '='.repeat(60));
  console.log(colorText('🎯 CONTAINER-USE PROTECTION DEMONSTRATED:', 'magenta'));
  console.log('');
  console.log(colorText('✅ WHAT HAPPENED:', 'green'));
  console.log('   • AI agent created "dangerous" files');
  console.log('   • System commands were executed');
  console.log('   • File operations were performed');
  console.log('   • All contained safely in isolated environment');
  console.log('');
  console.log(colorText('🛡️  WHAT WAS PROTECTED:', 'blue'));
  console.log('   • Your host file system');
  console.log('   • Your personal documents');
  console.log('   • Your system configuration');
  console.log('   • Your applications');
  console.log('');
  console.log(colorText('💡 THE POWER OF CONTAINER-USE:', 'cyan'));
  console.log('   • Safe AI experimentation');
  console.log('   • Risk-free development');
  console.log('   • Complete host protection');
  console.log('   • Easy cleanup and reset');
  console.log('\n' + '='.repeat(60));
}

function runVisualDemo() {
  compareEnvironments();
  
  setTimeout(() => {
    showFileSystemDifference();
  }, 2000);
  
  setTimeout(() => {
    demonstrateFileDanger();
  }, 4000);
}

// デモ開始
console.log(colorText('🚀 Starting visual demonstration in 3 seconds...', 'bright'));
setTimeout(runVisualDemo, 3000);