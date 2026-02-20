
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check for hardcoded admin credentials first (bypass Supabase auth)
      if (email === 'bibek@admin.com' && password === 'Bibek@1920') {
        console.log('Admin login with hardcoded credentials');
      
        
        // Create a mock session for admin
        const mockAdminUser = {
          id: '11111111-1111-1111-1111-111111111111',
          email: 'bibek@admin.com',
          role: 'admin'
        };
        
        // Store admin session in localStorage for this specific admin
        localStorage.setItem('admin_session', JSON.stringify({
          user: mockAdminUser,
          expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }));
        
        // Redirect to admin dashboard
        navigate('/adminDashboard');
        onLoginSuccess && onLoginSuccess();
        return;
      }
      
      // For non-admin emails, use regular Supabase auth
      const { data: loginData, error: loginError } = await signIn(email, password);
      
      if (loginError) {
        console.error('Login error:', loginError);
        
        if (loginError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (loginError.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before logging in.');
        } else if (loginError.message.includes('Too many requests')) {
          setError('Too many login attempts. Please wait a few minutes and try again.');
        } else {
          setError(loginError.message || 'Login failed. Please check your credentials and try again.');
        }
      } else if (loginData?.user) {
        // Regular user login successful
        console.log('Regular login successful for user:', loginData.user.email);
        
        // Check if user has admin role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', loginData.user.id)
          .single();
        
        if (profileData?.role === 'admin') {
          navigate('/adminDashboard');
        } else {
          setError('Access denied. Admin privileges required.');
        }
        
        onLoginSuccess && onLoginSuccess();
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 text-white relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-300">
            Access the admin dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter Admin Email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <Alert className={error.includes('✅') ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"}>
                <AlertDescription className={error.includes('✅') ? "text-green-300" : "text-red-300"}>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Admin Login'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleBackToHome}
            >
              Back to Home
            </Button>
          </form>
          
          
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
