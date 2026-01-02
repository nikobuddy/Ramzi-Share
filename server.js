const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for local network access
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create directories if they don't exist
const storeDir = path.join(__dirname, 'store');
const publicDir = path.join(__dirname, 'store', 'public');

[storeDir, publicDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if file should go to public folder
    const isPublic = req.body.public === 'true';
    const uploadPath = isPublic ? publicDir : storeDir;
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Preserve original filename with timestamp to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Serve static files from public folder
app.use('/public', express.static(publicDir));

// Serve static files from store folder (for browsing)
app.use('/store', express.static(storeDir, {
  setHeaders: (res, filePath) => {
    // Set appropriate headers for file downloads
    if (filePath.endsWith('.html') || filePath.endsWith('.htm')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = req.body.public === 'true' 
    ? `/public/${req.file.filename}`
    : `/store/${req.file.filename}`;

  res.json({
    success: true,
    message: 'File uploaded successfully',
    filename: req.file.filename,
    size: req.file.size,
    url: fileUrl,
    isPublic: req.body.public === 'true'
  });
});

// Get list of files in store
app.get('/api/files', (req, res) => {
  try {
    const files = [];
    
    // Get files from store directory
    const storeFiles = fs.readdirSync(storeDir);
    storeFiles.forEach(file => {
      const filePath = path.join(storeDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        files.push({
          name: file,
          size: stats.size,
          modified: stats.mtime,
          url: `/store/${file}`,
          isPublic: false
        });
      }
    });

    // Get files from public directory
    const publicFiles = fs.readdirSync(publicDir);
    publicFiles.forEach(file => {
      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        files.push({
          name: file,
          size: stats.size,
          modified: stats.mtime,
          url: `/public/${file}`,
          isPublic: true
        });
      }
    });

    // Sort by modified date (newest first)
    files.sort((a, b) => b.modified - a.modified);

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// Delete file endpoint
app.delete('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const isPublic = req.query.public === 'true';
  
  const filePath = isPublic 
    ? path.join(publicDir, filename)
    : path.join(storeDir, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get network IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('\n========================================');
  console.log('🚀 RamziShare connect Running!');
  console.log('========================================');
  console.log(`📱 Local:    http://localhost:${PORT}`);
  console.log(`🌐 Network:  http://${localIP}:${PORT}`);
  console.log('========================================\n');
  console.log('💡 Share the network URL with devices on your WiFi');
  console.log('📁 Files stored in: ./store');
  console.log('🌍 Public files in: ./store/public\n');
});

