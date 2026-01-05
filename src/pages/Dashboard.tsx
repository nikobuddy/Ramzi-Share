import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import ChatSection from '../components/ChatSection';
import FileSharing from '../components/FileSharing';
import PrivateChatWindow from '../components/PrivateChatWindow';
import { User, PrivateChat } from '../types';

function Dashboard(): JSX.Element {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [privateChats, setPrivateChats] = useState<Map<string, PrivateChat>>(new Map());

  useEffect(() => {
    const name = sessionStorage.getItem('userName');
    const id = sessionStorage.getItem('userId');

    if (!name || !id) {
      navigate('/');
      return;
    }

    setUserName(name);
    setUserId(id);

    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      newSocket.emit('user-join', { name, userId: id });
    });

    newSocket.on('users-list', (users: User[]) => {
      setConnectedUsers(users);
    });

    newSocket.on('users-list-updated', (users: User[]) => {
      setConnectedUsers(users);
    });

    newSocket.on('user-joined', (data: { user: User }) => {
      setConnectedUsers((prev) => {
        const exists = prev.find((u) => u.userId === data.user.userId);
        if (!exists) {
          return [...prev, data.user];
        }
        return prev;
      });
    });

    newSocket.on('user-left', (data: { user: User }) => {
      setConnectedUsers((prev) => prev.filter((u) => u.userId !== data.user.userId));
      setPrivateChats((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.user.userId);
        return newMap;
      });
    });

    newSocket.on('private-message', (data: { fromUserId: string; fromUserName: string; message: string; timestamp: string }) => {
      handlePrivateMessage(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [navigate]);

  const handlePrivateMessage = (data: { fromUserId: string; fromUserName: string; message: string; timestamp: string }): void => {
    setPrivateChats((prev) => {
      const newMap = new Map(prev);
      const chatId = data.fromUserId;
      
      if (!newMap.has(chatId)) {
        newMap.set(chatId, {
          userId: data.fromUserId,
          userName: data.fromUserName,
          messages: [],
          active: true,
          minimized: false,
        });
      }

      const chat = newMap.get(chatId);
      if (chat) {
        chat.messages.push({
          user: data.fromUserName,
          userId: data.fromUserId,
          message: data.message,
          timestamp: data.timestamp,
        });
      }

      return new Map(newMap);
    });
  };

  const startPrivateChat = (targetUserId: string, targetUserName: string): void => {
    setPrivateChats((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(targetUserId)) {
        newMap.set(targetUserId, {
          userId: targetUserId,
          userName: targetUserName,
          messages: [],
          active: true,
          minimized: false,
        });
      } else {
        const chat = newMap.get(targetUserId);
        if (chat) {
          chat.active = true;
          chat.minimized = false;
        }
      }
      return new Map(newMap);
    });
  };

  const closePrivateChat = (chatUserId: string): void => {
    setPrivateChats((prev) => {
      const newMap = new Map(prev);
      const chat = newMap.get(chatUserId);
      if (chat) {
        chat.active = false;
      }
      return new Map(newMap);
    });
  };

  const toggleMinimizeChat = (chatUserId: string): void => {
    setPrivateChats((prev) => {
      const newMap = new Map(prev);
      const chat = newMap.get(chatUserId);
      if (chat) {
        chat.minimized = !chat.minimized;
      }
      return new Map(newMap);
    });
  };

  const sendPrivateMessage = (targetUserId: string, message: string): void => {
    if (socket) {
      socket.emit('private-message', {
        toUserId: targetUserId,
        message: message,
      });

      setPrivateChats((prev) => {
        const newMap = new Map(prev);
        const chat = newMap.get(targetUserId);
        if (chat) {
          chat.messages.push({
            user: userName,
            userId: userId,
            message: message,
            timestamp: new Date().toISOString(),
          });
        }
        return new Map(newMap);
      });
    }
  };

  if (!socket || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden max-md:flex-col">
      <Sidebar
        userName={userName}
        connectedUsers={connectedUsers}
        currentUserId={userId}
        onStartPrivateChat={startPrivateChat}
        onLogout={() => {
          sessionStorage.clear();
          navigate('/');
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Connected</span>
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden max-lg:flex-col">
          <ChatSection socket={socket} userName={userName} userId={userId} />
          <FileSharing socket={socket} userName={userName} />
        </div>
      </div>
      <div className="fixed right-5 bottom-5 flex flex-col-reverse gap-4 z-[2000] max-w-[calc(100vw-40px)] items-end">
        {Array.from(privateChats.values())
          .filter((chat) => chat.active)
          .map((chat) => (
            <PrivateChatWindow
              key={chat.userId}
              chat={chat}
              currentUserId={userId}
              currentUserName={userName}
              onClose={() => closePrivateChat(chat.userId)}
              onMinimize={() => toggleMinimizeChat(chat.userId)}
              onSendMessage={(message) => sendPrivateMessage(chat.userId, message)}
            />
          ))}
      </div>
    </div>
  );
}

export default Dashboard;

