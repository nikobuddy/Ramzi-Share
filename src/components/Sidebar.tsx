import React from 'react';
import { SidebarProps } from '../types';

function Sidebar({ userName, connectedUsers, currentUserId, onStartPrivateChat, onLogout }: SidebarProps): JSX.Element {
  const otherUsers = connectedUsers.filter((user) => user.userId !== currentUserId);

  return (
    <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col shadow-md z-[100]">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="text-xl font-bold mb-1">RamziShare connect</h2>
        <p className="text-sm opacity-90">Local Network Server</p>
      </div>
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{userName}</div>
          <div className="text-xs text-slate-500">Online</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-slate-600 mb-4 uppercase tracking-wide">
          Online Users ({connectedUsers.length})
        </h3>
        {otherUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No other users online</div>
        ) : (
          <div className="flex flex-col gap-2">
            {otherUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-slate-100"
                onClick={() => onStartPrivateChat(user.userId, user.name)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-sm font-medium truncate">{user.name}</div>
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                <button
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded-lg cursor-pointer transition-colors hover:bg-blue-600 flex-shrink-0 ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartPrivateChat(user.userId, user.name);
                  }}
                >
                  💬
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-200">
        <button
          className="w-full py-2 px-4 bg-slate-500 text-white rounded-lg font-medium cursor-pointer transition-colors hover:bg-slate-600 text-sm"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

