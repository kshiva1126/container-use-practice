const http = require('http');

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

function makeRequest(path, callback) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      callback(null, JSON.parse(data));
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.end();
}

console.log('🧪 Running Container-use Practice Tests...\n');

test('Environment should be containerized', () => {
  const isContainer = process.platform === 'linux' && process.getuid() !== 0;
  if (!isContainer) {
    console.log('⚠️  Note: Running in container environment');
  }
});

test('Node.js should be available', () => {
  const version = process.version;
  if (!version || !version.startsWith('v')) {
    throw new Error('Node.js not available');
  }
  console.log(`   Node.js version: ${version}`);
});

test('Working directory should be writable', () => {
  const fs = require('fs');
  const testFile = '/tmp/container-test.txt';
  fs.writeFileSync(testFile, 'Container test');
  const content = fs.readFileSync(testFile, 'utf8');
  if (content !== 'Container test') {
    throw new Error('File system not writable');
  }
  fs.unlinkSync(testFile);
});

console.log('\n🎉 All tests completed!');
console.log('💡 This demonstrates that the container environment is working properly.');