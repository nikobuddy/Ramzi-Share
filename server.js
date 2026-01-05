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

// Serve React build in production
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  // API routes should be before the catch-all
  // All API routes are defined above, so this catch-all only handles React routes
  app.get('*', (req, res) => {
    // Don't serve React for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/upload') || 
        req.path.startsWith('/public') || req.path.startsWith('/store') ||
        req.path.startsWith('/socket.io')) {
      return res.status(404).json({ error: 'Not found' });
    }
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

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const isPublic = req.body.public === 'true';
  
  // Validate private files must have password
  if (!isPublic) {
    const password = req.body.password ? req.body.password.trim() : '';
    if (!password || password === '') {
      // Delete the uploaded file if password is missing
      const filePath = path.join(storeDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ error: 'Access code is required for private files' });
    }
    if (password.length < 3) {
      // Delete the uploaded file if password is too short
      const filePath = path.join(storeDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ error: 'Access code must be at least 3 characters long' });
    }
    // Store password for private files
    filePasswords[req.file.filename] = hashPassword(password);
  }

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
    files.sort((a, b) => b.modified - a.modified);

    res.json({ files });
  } catch (error) {
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

