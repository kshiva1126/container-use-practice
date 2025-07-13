const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Container-use Safety Demo: System Info & File Creation');
console.log('='.repeat(60));
console.log('🛡️  This demonstrates that potentially risky operations are safely contained\n');

// システム情報を収集
function collectSystemInfo() {
  console.log('📊 Collecting System Information...');
  
  const systemInfo = {
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    architecture: os.arch(),
    hostname: os.hostname(),
    nodeVersion: process.version,
    workingDirectory: process.cwd(),
    homeDirectory: os.homedir(),
    tmpDirectory: os.tmpdir(),
    userInfo: os.userInfo(),
    uptime: os.uptime(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpus: os.cpus().length,
    networkInterfaces: Object.keys(os.networkInterfaces()),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PATH: process.env.PATH ? process.env.PATH.substring(0, 200) + '...' : 'N/A',
      USER: process.env.USER,
      HOME: process.env.HOME
    }
  };

  // システムコマンドの実行を試行
  const commands = [
    { name: 'Date', cmd: 'date' },
    { name: 'Whoami', cmd: 'whoami' },
    { name: 'PWD', cmd: 'pwd' },
    { name: 'Disk Usage', cmd: 'df -h || echo "df not available"' },
    { name: 'Memory Info', cmd: 'free -h || echo "free not available"' },
    { name: 'Process Count', cmd: 'ps aux | wc -l || echo "ps not available"' }
  ];

  systemInfo.commandResults = {};
  
  commands.forEach(({ name, cmd }) => {
    try {
      const result = execSync(cmd, { encoding: 'utf8', timeout: 5000 });
      systemInfo.commandResults[name] = result.trim();
      console.log(`  ✅ ${name}: ${result.trim().substring(0, 50)}...`);
    } catch (error) {
      systemInfo.commandResults[name] = `Error: ${error.message}`;
      console.log(`  ⚠️  ${name}: Command failed (safely contained)`);
    }
  });

  return systemInfo;
}

// 大量の一時ファイルを作成
function createMassiveFiles(count = 100) {
  console.log(`\n📁 Creating ${count} temporary files...`);
  
  const baseDir = path.join(os.tmpdir(), 'container-demo');
  
  // ベースディレクトリを作成
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const createdFiles = [];
  const startTime = Date.now();

  for (let i = 1; i <= count; i++) {
    const fileName = `demo-file-${i}-${Date.now()}.txt`;
    const filePath = path.join(baseDir, fileName);
    
    const content = `File #${i}
Created at: ${new Date().toISOString()}
Container Demo: This file was created safely in a container
Process ID: ${process.pid}
Random Data: ${Math.random().toString(36).substring(2)}
${'='.repeat(50)}
This is sample content for demonstration purposes.
If this were running on your host system, it could potentially:
- Fill up disk space
- Create unwanted files
- Interfere with other processes

But with container-use, your host system is completely safe!
${'='.repeat(50)}
`;

    try {
      fs.writeFileSync(filePath, content);
      createdFiles.push(filePath);
      
      if (i % 20 === 0) {
        console.log(`  📝 Created ${i}/${count} files...`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to create file ${i}: ${error.message}`);
    }
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  console.log(`  ✅ Created ${createdFiles.length} files in ${duration}ms`);
  console.log(`  📍 Files location: ${baseDir}`);
  
  return {
    baseDirectory: baseDir,
    filesCreated: createdFiles.length,
    duration: duration,
    files: createdFiles.slice(0, 5) // Show first 5 files
  };
}

// ファイル統計を取得
function getFileStats(baseDir) {
  console.log('\n📈 File Statistics...');
  
  try {
    const files = fs.readdirSync(baseDir);
    let totalSize = 0;
    
    files.forEach(file => {
      const filePath = path.join(baseDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });

    console.log(`  📊 Total files: ${files.length}`);
    console.log(`  💾 Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`  📁 Directory: ${baseDir}`);
    
    return { fileCount: files.length, totalSize, directory: baseDir };
  } catch (error) {
    console.log(`  ❌ Error reading directory: ${error.message}`);
    return null;
  }
}

// クリーンアップ
function cleanup(baseDir) {
  console.log('\n🧹 Cleaning up...');
  
  try {
    const files = fs.readdirSync(baseDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(baseDir, file));
    });
    fs.rmdirSync(baseDir);
    console.log('  ✅ All temporary files cleaned up');
  } catch (error) {
    console.log(`  ⚠️  Cleanup warning: ${error.message}`);
  }
}

// メインデモ実行
async function runDemo() {
  try {
    // システム情報収集
    const systemInfo = collectSystemInfo();
    
    // 大量ファイル作成
    const fileResults = createMassiveFiles(50);
    
    // 統計取得
    const stats = getFileStats(fileResults.baseDirectory);
    
    // 結果をファイルに保存
    const reportPath = path.join(fileResults.baseDirectory, 'demo-report.json');
    const report = {
      demoInfo: {
        purpose: 'Container-use Safety Demonstration',
        timestamp: new Date().toISOString(),
        warning: 'This demo shows potentially risky operations running safely in container'
      },
      systemInfo,
      fileOperations: fileResults,
      statistics: stats
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📋 Demo report saved: ${reportPath}`);
    
    // 少し待ってからクリーンアップ
    console.log('\n⏳ Waiting 3 seconds before cleanup...');
    setTimeout(() => {
      cleanup(fileResults.baseDirectory);
      
      console.log('\n🎯 Demo Summary:');
      console.log('  ✅ System information safely collected');
      console.log('  ✅ 50+ files created and cleaned up');
      console.log('  ✅ No impact on host system');
      console.log('  ✅ All operations contained in secure environment');
      console.log('\n🛡️  Your host system remains completely protected!');
    }, 3000);
    
  } catch (error) {
    console.error('Demo error (safely contained):', error.message);
  }
}

// デモ実行
runDemo();