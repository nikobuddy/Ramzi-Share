import { Socket } from 'socket.io-client';

export interface User {
  userId: string;
  name: string;
  socketId?: string;
}

export interface ChatMessage {
  id?: string;
  user: string;
  userId: string;
  message: string;
  timestamp: string;
  type?: 'system' | 'user';
}

export interface PrivateChat {
  userId: string;
  userName: string;
  messages: ChatMessage[];
  active: boolean;
  minimized: boolean;
}

export interface FileInfo {
  name: string;
  size: number;
  modified: string;
  url: string;
  isPublic: boolean;
  hasPassword: boolean;
}

export interface SidebarProps {
  userName: string;
  connectedUsers: User[];
  currentUserId: string;
  onStartPrivateChat: (userId: string, userName: string) => void;
  onLogout: () => void;
}

export interface ChatSectionProps {
  socket: Socket | null;
  userName: string;
  userId: string;
}

export interface FileSharingProps {
  socket: Socket | null;
  userName: string;
}

export interface PrivateChatWindowProps {
  chat: PrivateChat;
  currentUserId: string;
  currentUserName: string;
  onClose: () => void;
  onMinimize: () => void;
  onSendMessage: (message: string) => void;
}

