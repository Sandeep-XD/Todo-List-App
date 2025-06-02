import React from "react";
// import './App.css'
import Home from "./pages/Home";
import { SignedIn, SignedOut, SignInButton, UserButton ,useUser } from '@clerk/clerk-react';
import { useTheme } from './contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi'; // Import icons



function App() {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm text-center">
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>Todo App</h1>
            <p className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
              Your day, organized. One todo at a time.
            </p>
            <p className="mb-6 text-gray-600" style={{ color: 'var(--color-text-secondary)' }}>Sign in to keep track of your tasks.</p>
            <SignInButton mode="modal">
              <button className="w-full px-4 py-2 font-semibold rounded-md transition-colors hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="py-3 px-4 flex justify-between items-center shadow-md" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
          <h1 className="text-xl font-bold">Todo App</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            <UserButton afterSignOutUrl="/"/>
          </div>
        </div>
        <div className="container mx-auto mt-8 px-4">
            {/* <p className="flex w-full bg-amber-300">Welcome {user?.firstName} , to the Todo App!</p> */}
            <Home/>
        </div>
      </SignedIn>
    </div>
  );
}

export default App;