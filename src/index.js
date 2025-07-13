const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.json({
    message: 'Container-use Practice Project',
    status: 'Running safely in container!',
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      workingDirectory: process.cwd(),
      containerSafe: true
    }
  });
});

app.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync('.');
    res.json({
      message: 'Container files (safe to explore)',
      files: files,
      note: 'This is running in a safe container environment'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Container-use practice server running on port ${PORT}`);
  console.log(`📦 Safe container environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Host system is protected!`);
});