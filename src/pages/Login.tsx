import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

function Login(): JSX.Element {
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    if (sessionStorage.getItem('userName')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const name = userName.trim();

    if (name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (name.length > 30) {
      setError('Name must be less than 30 characters');
      return;
    }

    // Store username and redirect to dashboard
    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userId', Date.now().toString() + Math.random().toString(36).substr(2, 9));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl w-full max-w-md animate-[slideUp_0.5s_ease]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            RamziShare connect
          </h1>
          <p className="text-slate-600 text-base">Local Network File Sharing & Chat</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="userName" className="block mb-2 text-slate-700 font-medium text-sm">
              Enter Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setError('');
              }}
              placeholder="Your name"
              required
              autoComplete="off"
              minLength={2}
              maxLength={30}
              autoFocus
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base transition-all focus:outline-none focus:border-indigo-500 focus:bg-white bg-slate-50 font-sans"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/50 active:translate-y-0"
          >
            Enter Server
          </button>
        </form>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6 text-sm text-blue-900">
          <strong className="block mb-1">💡 Welcome!</strong>
          Join your local network server to chat with others and share files securely.
        </div>
      </div>
    </div>
  );
}

export default Login;

