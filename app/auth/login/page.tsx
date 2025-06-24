'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold text-[#FFD700]">
            CineVerse
          </Link>
          <p className="text-[#A0A0A0] mt-2">Welcome back to your cinema universe</p>
        </div>
        
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#EAEAEA] text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-[#A0A0A0] text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[#EAEAEA] text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 bg-[#2A2A2A] border-[#3A3A3A] text-[#EAEAEA] placeholder-[#A0A0A0] focus:border-[#FFD700] focus:ring-[#FFD700]"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-[#EAEAEA] text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-[#2A2A2A] border-[#3A3A3A] text-[#EAEAEA] placeholder-[#A0A0A0] focus:border-[#FFD700] focus:ring-[#FFD700]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0A0A0] hover:text-[#EAEAEA]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-[#3A3A3A] text-[#FFD700] focus:ring-[#FFD700] focus:ring-offset-0"
                  />
                  <span className="ml-2 text-[#A0A0A0] text-sm">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-[#FFD700] hover:text-[#FFD700]/80 text-sm">
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#121212] font-semibold py-3"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-[#A0A0A0]">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-[#FFD700] hover:text-[#FFD700]/80">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}