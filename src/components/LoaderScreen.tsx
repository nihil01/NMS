import React from 'react';
import {
  Spinner,
  Progress,
  Card,
  CardBody,
  Avatar,
} from '@heroui/react';
import {
  ShieldCheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface LoaderScreenProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  showSpinner?: boolean;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'fullscreen';
}

const LoaderScreen: React.FC<LoaderScreenProps> = ({
  isVisible,
  message = 'Loading...',
  progress,
  showProgress = false,
  showSpinner = true,
  showLogo = true,
  size = 'md',
  variant = 'default',
}) => {
  if (!isVisible) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-64 h-48';
      case 'lg':
        return 'w-96 h-80';
      default:
        return 'w-80 h-64';
    }
  };

  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'lg';
      case 'lg':
        return 'lg';
      default:
        return 'lg';
    }
  };

  const getLogoSize = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-xl';
      default:
        return 'text-lg';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          {showSpinner && (
            <Spinner 
              size={getSpinnerSize() as any}
              color="primary"
              className="text-white"
            />
          )}
          {message && (
            <p className={`text-white font-medium ${getTextSize()}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex items-center justify-center">
        <div className="text-center space-y-8">
          {showLogo && (
            <div className="flex justify-center">
              <div className={`${getLogoSize()} bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center`}>
                <Avatar size='md' src={"http://localhost:8080/logo.jpg"} />
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              NMS
            </h1>
            <p className="text-white/80 text-lg">
              Sebeke avadanlığın umumi idarəetmə sistemi
            </p>
          </div>

          <div className="space-y-4">
            {showSpinner && (
              <div className="flex justify-center">
                <Spinner 
                  size="lg"
                  color="white"
                  className="text-white"
                />
              </div>
            )}
            
            {showProgress && progress !== undefined && (
              <div className="w-64 mx-auto space-y-2">
                <Progress
                  value={progress}
                  color="primary"
                  size="sm"
                  className="w-full"
                  classNames={{
                    track: "bg-white/20",
                    indicator: "bg-white",
                  }}
                />
                <p className="text-white/80 text-sm">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}
            
            {message && (
              <p className="text-white/90 font-medium text-lg">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`${getSizeClasses()} bg-white/95 backdrop-blur-sm border-0 shadow-2xl`}>
        <CardBody className="flex flex-col items-center justify-center space-y-6 p-8">
          {showLogo && (
            <div className="flex items-center space-x-3">
              <div className={`${getLogoSize()} bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center`}>
                <Avatar size='md' src={"http://localhost:8080/logo.jpg"} />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">NMS</h2>
                <p className="text-xs text-gray-600">Network Management System</p>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center space-y-4">
            {showSpinner && (
              <div className="relative">
                <Spinner 
                  size={getSpinnerSize() as any}
                  color="primary"
                  className="text-blue-600"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cog6ToothIcon className={`${getIconSize()} text-purple-600 animate-spin`} />
                </div>
              </div>
            )}
            
            {showProgress && progress !== undefined && (
              <div className="w-full space-y-2">
                <Progress
                  value={progress}
                  color="primary"
                  size="sm"
                  className="w-full"
                />
                <p className="text-center text-sm text-gray-600">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}
            
            {message && (
              <p className={`text-gray-700 font-medium text-center ${getTextSize()}`}>
                {message}
              </p>
            )}
          </div>

          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default LoaderScreen; 