# Quick Start Guide - TypeScript + Tailwind CSS

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

This installs:
- React 18 with TypeScript
- Tailwind CSS
- Socket.io Client
- All required dev dependencies

### 2. Start Development

**Option A: Two Terminal Windows (Recommended)**

```bash
# Terminal 1 - React Dev Server (Vite)
npm run dev:client

# Terminal 2 - Backend Server
npm run dev:server
```

Then open: **http://localhost:5173**

**Option B: Production Build**

```bash
# Build React app
npm run build

# Start production server
npm start
```

Then open: **http://localhost:3000**

## 📁 Project Structure

```
src/
├── components/          # React TSX Components
│   ├── Sidebar.tsx
│   ├── ChatSection.tsx
│   ├── FileSharing.tsx
│   └── PrivateChatWindow.tsx
├── pages/              # Page Components
│   ├── Login.tsx
│   └── Dashboard.tsx
├── types/              # TypeScript Types
│   └── index.ts
├── styles/             # Global Styles
│   └── index.css       # Tailwind CSS
├── App.tsx
└── main.tsx
```

## ✨ Features

- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Utility-first styling
- ✅ **Responsive Design** - Mobile-friendly
- ✅ **Real-time Chat** - Socket.io integration
- ✅ **File Sharing** - Public & Private files
- ✅ **Private Chat** - One-on-one messaging

## 🎨 Tailwind CSS

All styling uses Tailwind utility classes:
- `bg-blue-500` - Background colors
- `text-white` - Text colors
- `rounded-lg` - Border radius
- `p-4` - Padding
- `flex` - Flexbox
- `hover:bg-blue-600` - Hover states
- `max-md:` - Responsive breakpoints

## 📝 TypeScript

All components are fully typed:
- Component props
- State variables
- Event handlers
- API responses
- Socket.io events

## 🔧 Configuration Files

- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Tailwind config
- `postcss.config.js` - PostCSS config
- `vite.config.js` - Vite build config

## 🐛 Troubleshooting

**Port already in use?**
- Change port in `vite.config.js` (line 7)
- Or kill process: `lsof -ti:5173 | xargs kill`

**TypeScript errors?**
- Run: `npm install` to ensure all types are installed
- Check `tsconfig.json` is correct

**Tailwind not working?**
- Ensure `postcss.config.js` exists
- Check `tailwind.config.js` content paths
- Restart dev server

## 📚 Learn More

- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)

