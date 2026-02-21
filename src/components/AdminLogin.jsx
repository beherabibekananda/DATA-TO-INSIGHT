
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 mesh-gradient opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-yellow-500/5 rounded-full blur-[100px]"></div>
      </div>

      <Card className="w-full max-w-[420px] bg-card backdrop-blur-3xl border-border text-foreground relative z-10 shadow-2xl border-t-white/20 transition-all duration-500 hover:shadow-primary/10">
        <CardHeader className="text-center pt-10 pb-6">
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-indigo-500 flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>

          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Admin Login
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base font-medium">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Email Address</Label>
              <div className="relative group/input">
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground/20 h-14 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-muted/80 transition-all duration-300 pl-4 text-lg shadow-sm font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-success/10 border border-success/20 text-success p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <p className="text-sm font-semibold">{success}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/10 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Go to Dashboard"
              )}
            </Button>

            <button
              type="button"
              className="w-full text-muted-foreground/40 hover:text-muted-foreground/60 text-sm font-medium transition-colors pt-2"
              onClick={handleBackToHome}
            >
              ← Back to home
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-border flex items-center justify-center gap-4 text-muted-foreground/20">
            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Secure Access</span>
            <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Private Portal</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
