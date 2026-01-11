import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { PrivateChatWindowProps } from '../types';

function PrivateChatWindow({
  chat,
  currentUserId,
  currentUserName,
  onClose,
  onMinimize,
  onSendMessage,
}: PrivateChatWindowProps): JSX.Element | null {
  const [message, setMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const handleSend = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const msg = message.trim();
    if (!msg) return;

    onSendMessage(msg);
    setMessage('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  if (!chat.active) return null;

  return (
    <div
      className={`w-[350px] max-w-[calc(100vw-40px)] ${
        chat.minimized ? 'h-[60px]' : 'h-[500px] max-h-[calc(100vh-40px)]'
      } bg-white rounded-xl shadow-xl flex flex-col border border-slate-200 animate-[slideUpChat_0.3s_ease]`}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <h3 className="text-base font-semibold">💬 {chat.userName}</h3>
        <div className="flex gap-2">
          <button
            onClick={onMinimize}
            className="bg-transparent border-none text-white cursor-pointer px-2 py-1 text-xl leading-none transition-opacity hover:opacity-80"
          >
            {chat.minimized ? '+' : '−'}
          </button>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-white cursor-pointer px-2 py-1 text-xl leading-none transition-opacity hover:opacity-80"
          >
            ×
          </button>
        </div>
      </div>
      {!chat.minimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-100" ref={messagesEndRef}>
            {chat.messages.map((msg, index) => {
              const isOwn = msg.userId === currentUserId;
              const time = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={index}
                  className={`flex gap-3 mb-3 ${isOwn ? 'flex-row-reverse' : ''}`}
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
                      className={`px-4 py-3 rounded-xl break-words ${
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
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer text-sm transition-colors hover:bg-blue-600"
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default PrivateChatWindow;

