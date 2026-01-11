const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Store connected users
const connectedUsers = new Map();

// Store file passwords (in production, use a database)
// Format: { filename: hashedPassword }
const filePasswords = {};

// Helper function to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to verify password
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Enable CORS for local network access
app.use(cors());

// Middleware - Increase limits for large file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create directories if they don't exist
const storeDir = path.join(__dirname, 'store');
const publicDir = path.join(__dirname, 'store', 'public');

[storeDir, publicDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
// Note: Multer's destination callback doesn't have access to req.body fields yet
// So we save to storeDir first, then move to publicDir if needed after upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Always save to storeDir initially - we'll move it later if public
    cb(null, storeDir);
  },
  filename: (req, file, cb) => {
    // Preserve original filename
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB limit (1024 MB)
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types including ZIP files, images, documents, videos, etc.
    // No restrictions on file extensions - users can share any file type
    cb(null, true);
  }
});

// Serve static files from public folder
app.use('/public', express.static(publicDir));

// Serve React build in production
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  // API routes should be before the catch-all
  // All API routes are defined above, so this catch-all only handles React routes
  // Note: Static middleware for /public and /store routes are defined above, so they will be handled first
  app.get('*', (req, res) => {
    // Don't serve React for API routes or file routes (these are handled by other middleware)
    if (req.path.startsWith('/api') || req.path.startsWith('/upload') || 
        req.path.startsWith('/store') || req.path.startsWith('/socket.io')) {
      return res.status(404).json({ error: 'Not found' });
    }
    // /public routes are handled by static middleware above, so they won't reach here
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // In development, serve old HTML files as fallback if React dev server not running
  app.get('/', (req, res) => {
    // Check if React dev server is running (port 5173)
    res.sendFile(path.join(__dirname, 'login.html'));
  });
  app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
  });
}

// Error handler for multer file size limit
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File size exceeds the 1GB limit. Maximum allowed size is 1GB per file.' 
      });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  next(err);
};

// File upload endpoint - Handle large files including ZIP files (up to 1GB)
app.post('/upload', upload.single('file'), handleMulterError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // File is initially saved to storeDir (see multer config above)
  // Use req.file.path which contains the actual path where multer saved it
  const tempFilePath = req.file.path;
  
  // Debug: Log the request body to see what we're receiving
  console.log('Upload request body:', JSON.stringify(req.body));
  console.log('req.body.public value:', req.body.public, 'Type:', typeof req.body.public);
  
  // Check if file is public - handle both string 'true' and boolean true
  const isPublic = req.body.public === 'true' || req.body.public === true;
  
  console.log('isPublic determined as:', isPublic);

  // Additional file size validation (1GB = 1024 * 1024 * 1024 bytes)
  const maxSize = 1024 * 1024 * 1024; // 1GB
  if (req.file.size > maxSize) {
    // Delete the uploaded file if it exceeds limit
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    const fileSizeGB = (req.file.size / (1024 * 1024 * 1024)).toFixed(2);
    return res.status(400).json({ 
      error: `File size (${fileSizeGB}GB) exceeds the 1GB limit. Maximum allowed size is 1GB per file.` 
    });
  }

  // Validate private files must have password
  if (!isPublic) {
    const password = req.body.password ? req.body.password.trim() : '';
    if (!password || password === '') {
      // Delete the uploaded file if password is missing
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ error: 'Access code is required for private files' });
    }
    if (password.length < 3) {
      // Delete the uploaded file if password is too short
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({ error: 'Access code must be at least 3 characters long' });
    }
    // Store password for private files
    filePasswords[req.file.filename] = hashPassword(password);
  }

  // Move file to correct directory based on isPublic flag
  let finalFilePath = tempFilePath;
  if (isPublic) {
    // Move from storeDir to publicDir
    finalFilePath = path.join(publicDir, req.file.filename);
    try {
      // Check if temp file exists before moving
      if (!fs.existsSync(tempFilePath)) {
        console.error('Temp file does not exist:', tempFilePath);
        return res.status(500).json({ error: 'Uploaded file not found' });
      }
      
      // Remove existing file in publicDir if it exists
      if (fs.existsSync(finalFilePath)) {
        console.log('Removing existing file in public directory:', finalFilePath);
        fs.unlinkSync(finalFilePath);
      }
      
      // Move file to public directory
      console.log(`Moving file from ${tempFilePath} to ${finalFilePath}`);
      fs.renameSync(tempFilePath, finalFilePath);
      console.log(`✓ Successfully moved file to public directory: ${req.file.filename}`);
    } catch (error) {
      console.error('Error moving file to public directory:', error);
      console.error('Error details:', error.message, error.stack);
      // If move fails, delete the temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(500).json({ error: 'Failed to save public file: ' + error.message });
    }
  } else {
    console.log(`File kept in private directory: ${req.file.filename}`);
  }

  // Log file info for debugging
  const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
  console.log(`File uploaded: ${req.file.originalname}, Size: ${fileSizeMB}MB, Type: ${req.file.mimetype || 'unknown'}, Public: ${isPublic}, Location: ${isPublic ? 'public' : 'private'}`);

  const fileUrl = isPublic 
    ? `/public/${req.file.filename}`
    : `/store/${req.file.filename}`;

  res.json({
    success: true,
    message: 'File uploaded successfully',
    filename: req.file.filename,
    size: req.file.size,
    url: fileUrl,
    isPublic: isPublic,
    hasPassword: !isPublic
  });
});

// Get list of files in store
app.get('/api/files', (req, res) => {
  try {
    const files = [];
    
    // Get files from store directory (excluding public subdirectory)
    const storeFiles = fs.readdirSync(storeDir);
    storeFiles.forEach(file => {
      // Skip the 'public' directory itself
      if (file === 'public') return;
      
      const filePath = path.join(storeDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        files.push({
          name: file,
          size: stats.size,
          modified: stats.mtime,
          url: `/store/${file}`,
          isPublic: false,
          hasPassword: filePasswords.hasOwnProperty(file)
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
          isPublic: true,
          hasPassword: false
        });
      }
    });

    // Sort by modified date (newest first)
    files.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    res.json({ files });
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// Delete file endpoint
app.delete('/api/files/:filename', (req, res) => {
  const { filename } = req.params;
  const isPublic = req.query.public === 'true';
  
  const filePath = isPublic 
    ? path.join(publicDir, filename)
    : path.join(storeDir, filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      // Remove password if exists
      if (filePasswords.hasOwnProperty(filename)) {
        delete filePasswords[filename];
      }
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Verify password for private file
app.post('/api/verify-password', (req, res) => {
  const { filename, password } = req.body;
  
  if (!filename || !password) {
    return res.status(400).json({ error: 'Filename and password required' });
  }

  const hashedPassword = filePasswords[filename];
  if (!hashedPassword) {
    return res.status(404).json({ error: 'File not found or no password set' });
  }

  const isValid = verifyPassword(password, hashedPassword);
  
  if (isValid) {
    res.json({ success: true, message: 'Password verified' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Protected file download endpoint
app.get('/store/:filename', (req, res) => {
  const { filename } = req.params;
  const { password } = req.query;
  const filePath = path.join(storeDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // All private files require password
  const hashedPassword = filePasswords[filename];
  if (!hashedPassword) {
    return res.status(401).json({ 
      error: 'Access code required',
      requiresPassword: true 
    });
  }

  if (!password) {
    return res.status(401).json({ 
      error: 'Access code required',
      requiresPassword: true 
    });
  }

  // Verify password
  if (!verifyPassword(password, hashedPassword)) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  // Send file
  res.sendFile(filePath);
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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with name
  socket.on('user-join', (userData) => {
    connectedUsers.set(socket.id, {
      id: socket.id,
      name: userData.name,
      userId: userData.userId,
      joinedAt: new Date()
    });

    // Broadcast user joined
    io.emit('user-joined', {
      user: connectedUsers.get(socket.id),
      totalUsers: connectedUsers.size
    });

    // Send current users list to new user
    socket.emit('users-list', Array.from(connectedUsers.values()));
    
    // Broadcast updated users list to all
    io.emit('users-list-updated', Array.from(connectedUsers.values()));
  });

  // Handle private messages
  socket.on('private-message', (messageData) => {
    const sender = connectedUsers.get(socket.id);
    if (!sender) return;

    // Find recipient by userId
    const recipient = Array.from(connectedUsers.values()).find(
      user => user.userId === messageData.toUserId
    );

    if (recipient) {
      // Send to recipient
      io.to(recipient.id).emit('private-message', {
        fromUserId: sender.userId,
        fromUserName: sender.name,
        message: messageData.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle users list request
  socket.on('request-users-list', () => {
    socket.emit('users-list', Array.from(connectedUsers.values()));
  });

  socket.on('get-users-list', () => {
    io.emit('users-list-updated', Array.from(connectedUsers.values()));
  });

  // Handle chat messages
  socket.on('chat-message', (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      io.emit('chat-message', {
        id: Date.now().toString(),
        user: user.name,
        userId: user.userId,
        message: messageData.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle file share notification
  socket.on('file-shared', (fileData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      io.emit('file-shared', {
        user: user.name,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        isPublic: fileData.isPublic,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit('typing', {
        user: user.name,
        isTyping: data.isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      io.emit('user-left', {
        user: user,
        totalUsers: connectedUsers.size
      });
      // Broadcast updated users list
      io.emit('users-list-updated', Array.from(connectedUsers.values()));
    }
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('\n========================================');
  console.log('🚀 RamziShare connect Running!');
  console.log('========================================');
  console.log(`📱 Local:    http://localhost:${PORT}`);
  console.log(`🌐 Network:  http://${localIP}:${PORT}`);
  console.log('========================================\n');
  console.log('💡 Share the network URL with devices on your WiFi');
  console.log('📁 Files stored in: ./store');
  console.log('🌍 Public files in: ./store/public');
  console.log('💬 Real-time chat enabled\n');
});

