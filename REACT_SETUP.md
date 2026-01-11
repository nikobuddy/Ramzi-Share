# React Frontend Setup

This project now uses React for the frontend with Vite as the build tool.

## Development Setup

### Option 1: Development Mode (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the React dev server (in one terminal):**
   ```bash
   npm run dev:client
   ```
   This will start Vite dev server on `http://localhost:5173`

3. **Start the backend server (in another terminal):**
   ```bash
   npm run dev:server
   ```
   This will start the Express server on `http://localhost:3000`

4. **Access the application:**
   - Open `http://localhost:5173` in your browser
   - Vite will proxy API requests to the backend server

### Option 2: Production Build

1. **Build the React app:**
   ```bash
   npm run build
   ```
   This creates a `dist` folder with the production build.

2. **Start the server:**
   ```bash
   npm start
   ```
   The server will serve the React build from the `dist` folder.

## Project Structure

```
src/
├── components/          # React components
│   ├── Sidebar.jsx
│   ├── ChatSection.jsx
│   ├── FileSharing.jsx
│   └── PrivateChatWindow.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   └── Dashboard.jsx
├── styles/             # CSS files
│   ├── index.css
│   ├── Login.css
│   ├── Dashboard.css
│   ├── Sidebar.css
│   ├── ChatSection.css
│   ├── FileSharing.css
│   └── PrivateChatWindow.css
├── utils/              # Utility functions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Features

- ✅ React 18 with modern hooks
- ✅ React Router for navigation
- ✅ Socket.io client for real-time chat
- ✅ Component-based architecture
- ✅ Responsive design
- ✅ Professional UI

## Development Notes

- The React app runs on port 5173 (Vite default)
- The backend server runs on port 3000
- Vite proxies API requests to the backend automatically
- Hot Module Replacement (HMR) is enabled for fast development

