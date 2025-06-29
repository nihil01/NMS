import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  Avatar,
  User,
} from '@heroui/react';

import {
  EyeIcon,
  EyeSlashIcon,
  UserCircleIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { HttpClient } from '../net/HttpClient';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  acceptTerms: boolean;
  rememberMe: boolean;
  twoFactorEnabled: boolean;
}

interface AuthPageProps {
  onAuthSuccess?: (userData: string) => void;
  onAuthError?: (error: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onAuthError }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    acceptTerms: false,
    rememberMe: false,
    twoFactorEnabled: false,
  });
  const [errors, setErrors] = useState<Partial<AuthFormData>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateForm = (): boolean => {
    const newErrors: Partial<AuthFormData> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } 

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleInputChange = (field: keyof AuthFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Calculate password strength
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      const userData = await new HttpClient().authenticate(formData.email, formData.password);

      onAuthSuccess?.(userData);
    } catch (error) {
      onAuthError?.('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Avatar size='lg' src={"http://localhost:8080/logo.jpg"} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            NMS
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sebeke avadanlığın umumi idarəetmə sistemi
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl border-0">
          <CardBody className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              <Input
                type="text"
                aria-label="Email"
                placeholder="Istifadəçi"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                startContent={<UserCircleIcon className="w-4 h-4 text-gray-400" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                variant="bordered"
                size="lg"
              />

              <Input
                type={showPassword ? "text" : "password"}
                aria-label="Password"
                placeholder="Şifrə"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                startContent={<LockClosedIcon className="w-4 h-4 text-gray-400" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                variant="bordered"
                size="lg"
              />


              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-semibold"
                isLoading={isLoading}
                endContent={!isLoading && <ArrowRightIcon className="w-4 h-4" />}
              >
                LOGIN
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage; 