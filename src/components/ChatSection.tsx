import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { Socket } from 'socket.io-client';
import { ChatSectionProps, ChatMessage } from '../types';

function ChatSection({ socket, userName, userId }: ChatSectionProps): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const [typingIndicator, setTypingIndicator] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (data: ChatMessage): void => {
      setMessages((prev) => [...prev, data]);
    };

    const handleUserJoined = (data: { user: { name: string } }): void => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          user: '',
          userId: '',
          message: `${data.user.name} joined the server`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const handleUserLeft = (data: { user: { name: string } }): void => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          user: '',
          userId: '',
          message: `${data.user.name} left the server`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const handleFileShared = (data: { user: string; fileName: string }): void => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          user: '',
          userId: '',
          message: `${data.user} shared a file: ${data.fileName}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const handleTyping = (data: { user: string; isTyping: boolean }): void => {
      if (data.isTyping) {
        setTypingIndicator(`${data.user} is typing...`);
      } else {
        setTypingIndicator('');
      }
    };

    socket.on('chat-message', handleChatMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('file-shared', handleFileShared);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('chat-message', handleChatMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('file-shared', handleFileShared);
      socket.off('typing', handleTyping);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg || !socket) return;

    socket.emit('chat-message', { message: msg });
    setMessage('');
    socket.emit('typing', { isTyping: false });
    if (chatInputRef.current) {
      chatInputRef.current.style.height = 'auto';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
    if (socket) {
      socket.emit('typing', { isTyping: e.target.value.length > 0 });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="w-1/2 max-lg:w-full max-lg:h-1/2 flex flex-col bg-slate-100 border-r border-slate-200">
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">💬 Public Chat</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4" ref={messagesEndRef}>
        {messages.map((msg, index) => {
          if (msg.type === 'system') {
            return (
              <div key={index} className="text-center py-2 text-slate-500 text-sm italic">
                {msg.message}
              </div>
            );
          }

          const isOwn = msg.userId === userId;
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 animate-[slideIn_0.3s_ease] ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {msg.user.charAt(0).toUpperCase()}
              </div>
              <div className="max-w-[70%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{msg.user}</span>
                  <span className="text-xs text-slate-500">{time}</span>
                </div>
                <div
                  className={`px-4 py-3 rounded-xl shadow-sm break-words ${
                    isOwn ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-6 text-sm text-slate-500 italic min-h-[1.5rem]">{typingIndicator}</div>
      <div className="bg-white px-6 py-4 border-t border-slate-200">
        <form onSubmit={handleSend} className="flex gap-3 items-end">
          <textarea
            ref={chatInputRef}
            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl text-sm resize-none max-h-[120px] focus:outline-none focus:border-blue-500"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold cursor-pointer transition-colors hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatSection;

