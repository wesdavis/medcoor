'use client';

import { useState } from 'react';
import { login } from '../actions/auth';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src="/pfhw_logo.png" alt="PFHW Logo" className="h-16 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-slate-900">MedCoor Portal</h1>
          <p className="text-slate-500">Enter the master password to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              name="password" 
              required
              className="w-full border border-slate-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}