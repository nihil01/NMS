import React from 'react';
import { HeroUIProvider } from '@heroui/react';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <HeroUIProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Dashboard />
      </div>
    </HeroUIProvider>
  );
}

export default App; 