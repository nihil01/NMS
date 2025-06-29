import React, { useEffect, useState } from 'react';
import { HeroUIProvider } from '@heroui/react';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import LoaderScreen from './components/LoaderScreen';
import './index.css';
import { HttpClient } from './net/HttpClient';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate loading progress
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        const isAuthenticated = await new HttpClient().checkAuth();
        setIsAuthenticated(isAuthenticated);
        
        // Complete the progress
        setLoadingProgress(100);
        
        // Hide loader after a short delay
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = (userData: string) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleAuthError = (error: string) => {
    console.error('Auth error:', error);
    // You can add toast notifications here
    setIsAuthenticated(false);
    setUser(null);

    alert(error);
  };

  return (
    <HeroUIProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Initial Loading Screen */}
        <LoaderScreen
          isVisible={isLoading}
          message="Initializing NMS System..."
          progress={loadingProgress}
          showProgress={true}
          showSpinner={true}
          showLogo={true}
          size="lg"
          variant="fullscreen"
        />

        {/* Main App Content */}
        {!isLoading && (
          <>
            {isAuthenticated ? (
              <Dashboard authenticated={setIsAuthenticated} />
            ) : (
              <AuthPage 
                onAuthSuccess={handleAuthSuccess}
                onAuthError={handleAuthError}
              />
            )}
          </>
        )}
      </div>
    </HeroUIProvider>
  );
}

export default App; 