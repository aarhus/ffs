
import React, { useState } from 'react';
import { User } from '../types';
import { DumbbellIcon } from './Icons';

interface LoginPageProps {
  onLogin: (user: User) => void;
  allUsers: User[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, allUsers }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <DumbbellIcon className="w-12 h-12 text-primary" />
          <h1 className="text-3xl font-bold mt-2">Fitcoach AI</h1>
          <p className="text-muted-foreground">Welcome back</p>
        </div>
        
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full mt-1 bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full mt-1 bg-muted border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" 
            />
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-primary/90 transition-colors">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
};
