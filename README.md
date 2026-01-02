# 🚀 RamziShare connect

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Express](https://img.shields.io/badge/Express-4.18-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Platform](https://img.shields.io/badge/Platform-Cross--Platform-lightgrey.svg)

**A fast, efficient, and user-friendly local file sharing server for WiFi networks**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Problem It Solves](#-problem-it-solves)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Security Considerations](#-security-considerations)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**RamziShare connect** is a lightweight, high-performance Node.js application that enables seamless file sharing across devices connected to the same WiFi network. Whether you're transferring files between your phone and computer, sharing documents with colleagues, or distributing media files at home, this server provides a simple, web-based solution without requiring cloud services or external dependencies.

### Why This Project?

- **No Cloud Required**: Share files directly on your local network without uploading to external servers
- **Privacy First**: All data stays within your local network
- **Zero Configuration**: Works out of the box with minimal setup
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **Modern UI**: Beautiful, responsive web interface that works on all devices

---

## ✨ Features

### Core Features

- 🌐 **Web-Based Interface** - Modern, responsive UI accessible from any device with a browser
- 📤 **Drag & Drop Upload** - Intuitive file upload with drag-and-drop support
- 📁 **Dual Storage System** - Separate storage for private and public files
- 🌍 **Public File Sharing** - Direct URL access for files marked as public
- ⚡ **High Performance** - Optimized for fast file transfers with progress tracking
- 📱 **Multi-Device Support** - Works seamlessly on desktop, tablet, and mobile devices
- 🔄 **Auto-Refresh** - File list automatically updates every 30 seconds
- 🗑️ **File Management** - View, download, and delete files through the web interface
- 📊 **File Information** - Display file size, upload date, and access status
- 🔒 **Access Control** - Choose between private and public file storage

### Technical Features

- RESTful API for programmatic access
- Real-time upload progress tracking
- Error handling and user feedback
- CORS enabled for cross-origin requests
- Configurable file size limits
- Automatic directory creation
- Network IP detection and display

---

## 🎯 Problem It Solves

### Common Scenarios

1. **Quick File Transfer**: Need to send a file from your phone to your laptop? No need for USB cables or cloud uploads.

2. **Team Collaboration**: Share project files, documents, or media with team members on the same network instantly.

3. **Home Network Sharing**: Distribute photos, videos, or documents to family members' devices without email or messaging apps.

4. **Development Workflow**: Quickly share build files, assets, or test data between development machines.

5. **Offline File Sharing**: Perfect for environments without internet access or when you want to keep data local.

6. **Temporary File Hosting**: Host files temporarily for download without setting up complex file servers.

### Benefits Over Alternatives

- **vs. Cloud Services**: No upload limits, no account required, complete privacy
- **vs. USB Drives**: No physical media needed, works wirelessly
- **vs. Email**: No size limits (configurable), instant access
- **vs. Messaging Apps**: No compression, direct file access, better for large files

---

## 📦 Prerequisites

Before installing, ensure you have the following installed on your system:

- **Node.js** (version 14.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** (comes bundled with Node.js)
  - Verify installation: `npm --version`

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux (any modern distribution)
- **RAM**: Minimum 512MB (recommended 1GB+)
- **Storage**: Depends on file storage needs (minimum 100MB free)
- **Network**: WiFi or Ethernet connection with devices on the same network

---

## 🚀 Installation

### Step 1: Clone or Download the Repository

```bash
# If using Git
git clone https://github.com/nikobuddy/Ramzi-Share.git
cd Ramzi-Share

# Or download and extract the ZIP file, then navigate to the folder
```

### Step 2: Install Dependencies

Navigate to the project directory and install required packages:

```bash
npm install
```

This will install the following dependencies:
- `express` - Web framework for Node.js
- `multer` - Middleware for handling file uploads
- `cors` - Enable Cross-Origin Resource Sharing

### Step 3: Verify Installation

Ensure all dependencies are installed correctly:

```bash
npm list
```

You should see all dependencies listed without any errors.

---

## ⚡ Quick Start

### Starting the Server

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Access the web interface**:
   - On your computer: Open `http://localhost:3000` in your browser
   - On other devices: Use the network IP shown in the console (e.g., `http://191.160.2.200:3000`)

3. **Share the network URL** with devices on your WiFi network

### Example Output

When the server starts, you'll see:

```
========================================
🚀 RamziShare connect Running!
========================================
📱 Local:    http://localhost:3000
🌐 Network:  http://191.160.2.200:3000
========================================

💡 Share the network URL with devices on your WiFi
📁 Files stored in: ./store
🌍 Public files in: ./store/public
```

---

## 📖 Usage Guide

### Uploading Files

#### Method 1: Drag and Drop
1. Open the web interface in your browser
2. Drag files from your file manager directly onto the upload area
3. Files will automatically start uploading

#### Method 2: Click to Browse
1. Click on the upload area
2. Select files from the file picker dialog
3. Files will automatically start uploading

#### Making Files Public
- Check the "Make file public" checkbox before uploading
- Public files are accessible via direct URL: `http://YOUR_IP:3000/public/filename.ext`
- Public files are stored in the `store/public/` directory

### Accessing Files

#### Through Web Interface
1. View all uploaded files in the file list
2. Click "Download" to download any file
3. Files are organized by upload date (newest first)

#### Direct URL Access (Public Files Only)
- Public files can be accessed directly via: `http://YOUR_IP:3000/public/filename.ext`
- Share this URL with anyone on your network
- No authentication required for public files

### Managing Files

- **View Files**: All uploaded files are displayed with name, size, date, and access status
- **Download Files**: Click the "Download" button to download any file
- **Delete Files**: Click "Delete" to remove files from the server
- **Auto-Refresh**: File list automatically refreshes every 30 seconds

### File Status Indicators

- 🌍 **Public**: File is accessible via direct URL
- 🔒 **Private**: File is only accessible through the web interface

---

## 🔌 API Documentation

The server provides a RESTful API for programmatic access to file operations.

### Endpoints

#### `GET /`
Returns the main web interface HTML page.

**Response**: HTML content

---

#### `POST /upload`
Upload a file to the server.

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file` (file): The file to upload
  - `public` (string): `"true"` to make file public, `"false"` for private

**Response**:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "filename": "example.pdf",
  "size": 1024000,
  "url": "/store/example.pdf",
  "isPublic": false
}
```

**Example** (using curl):
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@/path/to/file.pdf" \
  -F "public=false"
```

---

#### `GET /api/files`
Get a list of all uploaded files.

**Response**:
```json
{
  "files": [
    {
      "name": "example.pdf",
      "size": 1024000,
      "modified": "2024-01-15T10:30:00.000Z",
      "url": "/store/example.pdf",
      "isPublic": false
    }
  ]
}
```

**Example**:
```bash
curl http://localhost:3000/api/files
```

---

#### `DELETE /api/files/:filename`
Delete a file from the server.

**Parameters**:
- `filename` (path): Name of the file to delete
- `public` (query): `"true"` if file is in public folder, `"false"` otherwise

**Response**:
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Example**:
```bash
curl -X DELETE "http://localhost:3000/api/files/example.pdf?public=false"
```

---

#### `GET /public/:filename`
Access a public file directly.

**Parameters**:
- `filename` (path): Name of the file

**Response**: File content with appropriate Content-Type header

**Example**:
```
http://192.168.1.100:3000/public/document.pdf
```

---

#### `GET /store/:filename`
Access a private file directly.

**Parameters**:
- `filename` (path): Name of the file

**Response**: File content with appropriate Content-Type header

---

## ⚙️ Configuration

### Changing the Port

Edit `server.js` and modify the `PORT` constant:

```javascript
const PORT = 3000; // Change to your desired port
```

Common alternative ports: `3001`, `8080`, `8000`

### Changing File Size Limit

Edit `server.js` and modify the `limits.fileSize` in multer configuration:

```javascript
limits: {
  fileSize: 500 * 1024 * 1024 // 500MB - change as needed
}
```

### Changing Storage Directories

Modify the directory paths in `server.js`:

```javascript
const storeDir = path.join(__dirname, 'store');
const publicDir = path.join(__dirname, 'store', 'public');
```

---

## 📁 Project Structure

```
Ramzi-Share/
│
├── server.js              # Main server application
├── index.html             # Web interface
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Dependency lock file
├── README.md              # This file
├── .gitignore             # Git ignore rules
│
└── store/                 # File storage directory
    ├── .gitkeep           # Git placeholder
    └── public/            # Public files directory
        └── .gitkeep       # Git placeholder
```

### File Descriptions

- **server.js**: Express server with file upload handling, API endpoints, and static file serving
- **index.html**: Single-page web application with drag-and-drop upload interface
- **package.json**: Node.js project configuration and dependencies
- **store/**: Main directory for all uploaded files
- **store/public/**: Directory for publicly accessible files

---

## 🔧 Troubleshooting

### Server Won't Start

**Problem**: Port already in use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: 
- Change the port in `server.js` to an available port
- Or stop the process using port 3000:
  ```bash
  # Find process using port 3000
  lsof -i :3000
  # Kill the process (replace PID with actual process ID)
  kill -9 PID
  ```

---

### Can't Access from Other Devices

**Problem**: Other devices can't connect to the server

**Solutions**:
1. **Check Network**: Ensure all devices are on the same WiFi network
2. **Check Firewall**: 
   - Windows: Allow Node.js through Windows Firewall
   - macOS: System Preferences → Security & Privacy → Firewall
   - Linux: Configure iptables or ufw
3. **Use Network IP**: Use the network IP shown in console, not `localhost`
4. **Check Router Settings**: Some routers block inter-device communication

---

### Files Not Uploading

**Problem**: Upload fails or times out

**Solutions**:
1. **Check File Size**: Ensure file is under the size limit (default 500MB)
2. **Check Permissions**: Ensure write permissions on `store/` directory
3. **Check Disk Space**: Ensure sufficient disk space available
4. **Check Network**: Verify stable network connection

---

### Files Not Appearing

**Problem**: Uploaded files don't show in the list

**Solutions**:
1. **Refresh Page**: Manually refresh the browser
2. **Check Console**: Look for JavaScript errors in browser console
3. **Check Server Logs**: Look for errors in terminal
4. **Verify Storage**: Check if files exist in `store/` directory

---

### Slow Upload Speed

**Problem**: File uploads are slow

**Solutions**:
1. **Check Network**: Ensure strong WiFi signal
2. **Check Server Resources**: Ensure server has sufficient CPU/RAM
3. **Large Files**: Large files will take time; progress bar shows status
4. **Network Congestion**: Avoid heavy network usage during uploads

---

## 🔒 Security Considerations

### Important Security Notes

⚠️ **This server is designed for local network use only. Do not expose it to the internet without proper security measures.**

### Security Recommendations

1. **Local Network Only**: Only run on trusted local networks
2. **Firewall Configuration**: Configure firewall to restrict access
3. **File Validation**: Add file type validation if needed (modify server.js)
4. **Authentication**: Consider adding authentication for production use
5. **HTTPS**: Use HTTPS in production (requires SSL certificate)
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **File Scanning**: Scan uploaded files for malware if handling untrusted files

### Current Security Features

- CORS enabled for cross-origin requests
- File size limits to prevent resource exhaustion
- Input sanitization for file names
- Error handling to prevent information leakage

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Ideas

- Add user authentication
- Implement file preview
- Add file search functionality
- Support for file folders/directories
- Add download statistics
- Implement file expiration
- Add dark mode to UI
- Support for multiple file selection improvements

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- File upload handling with [Multer](https://github.com/expressjs/multer)
- Inspired by the need for simple, local file sharing solutions

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [Issues](https://github.com/nikobuddy/Ramzi-Share/issues)
3. Create a new issue with detailed information

---

## 👨‍💻 Author

**Nisarga Lokhande**

- GitHub: [@nikobuddy](https://github.com/nikobuddy)
- LinkedIn: [Nisarga Lokhande](https://www.linkedin.com/in/nslokhande/)

---

<div align="center">

**Made with ❤️ by [Nisarga Lokhande](https://github.com/nikobuddy)**

⭐ Star this repo if you find it useful!

[![GitHub](https://img.shields.io/badge/GitHub-nikobuddy-181717?style=flat&logo=github)](https://github.com/nikobuddy)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nisarga%20Lokhande-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/nslokhande/)

</div>
 
