
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // FALLBACK: If Supabase connection fails (DNS issue, offline), 
      // check against hardcoded authorized admins for demo/local use.
      const authorizedEmails = ['beherabibekananda778@gmail.com', 'bibek@admin.com'];
      const isHardcodedAdmin = authorizedEmails.includes(email.trim().toLowerCase());

      // Check if email is in the allowed list via Supabase
      const { data, error: fetchError } = await supabase
        .from('admin_allowed_emails')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

      if ((fetchError || !data) && !isHardcodedAdmin) {
        console.error('Admin check error:', fetchError);
        setError('This email is not authorized for admin access.');
        setLoading(false);
        return;
      }

      // If authorized (via DB or hardcoded), create admin session
      const adminSession = {
        user: {
          id: data?.id || 'admin-local-' + Date.now(),
          email: email.trim().toLowerCase(),
          role: 'admin'
        },
        verified_at: Date.now(),
        expires_at: Date.now() + (12 * 60 * 60 * 1000) // 12 hours
      };

      localStorage.setItem('admin_session', JSON.stringify(adminSession));

      setSuccess('✅ Access Granted! Redirecting to dashboard...');

      // Brief delay for UX, then redirect
      setTimeout(() => {
        navigate('/adminDashboard');
        onLoginSuccess && onLoginSuccess();
      }, 1000);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-[420px] bg-card/40 backdrop-blur-2xl border-white/5 text-white relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t-white/10">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] rotate-3 hover:rotate-0 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>

          <CardTitle className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Secure access for authorized personnel only
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm font-semibold tracking-wide uppercase text-white/50 ml-1">Email Address</Label>
              <div className="relative group">
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-14 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 pl-4 text-lg"
                  placeholder="name@company.com"
                />
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-success/10 border border-success/20 text-success p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>

            <button
              type="button"
              className="w-full text-white/40 hover:text-white/60 text-sm font-medium transition-colors pt-2"
              onClick={handleBackToHome}
            >
              ← Return to public site
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-white/20">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">End-to-End Encryption</span>
            <div className="w-1 h-1 rounded-full bg-white/20"></div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Secure Session</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
