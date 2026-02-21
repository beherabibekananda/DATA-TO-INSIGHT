
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Cpu, ShieldCheck, Mail, Lock, User, Phone, ArrowRight, Github } from 'lucide-react';

const AuthPage = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        if (email === 'user@test.com' && password === 'User@1234') {
          const mockUser = {
            id: '22222222-2222-2222-2222-222222222222',
            email: 'user@test.com',
            role: 'user'
          };
          localStorage.setItem('user_session', JSON.stringify({
            user: mockUser,
            expires_at: Date.now() + (24 * 60 * 60 * 1000)
          }));
          window.location.href = '/';
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else if (onClose) {
          onClose();
        }
      } else {
        if (!fullName.trim()) return setError('Full name is required');
        if (!mobile.trim()) return setError('Mobile number is required');

        const { error } = await signUp(email, password, fullName, mobile);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Neural verification link sent to your email.');
        }
      }
    } catch (err) {
      setError('Neural sync failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Immersive Environmental Background */}
      <div className="fixed inset-0 pointer-events-none z-0 mesh-gradient opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[60%] left-[10%] w-[40%] h-[40%] bg-pink-500/5 blur-[120px] rounded-full animate-pulse-slow"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <Card className="w-full max-w-[480px] bg-card backdrop-blur-3xl border-border text-foreground relative z-10 shadow-2xl border-t-white/20 overflow-hidden group transition-all duration-500 hover:shadow-primary/10">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-accent"></div>

        <CardHeader className="text-center pt-16 pb-8 px-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-muted border border-border rounded-[2rem] flex items-center justify-center shadow-sm relative group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Brain className="w-10 h-10 text-primary relative z-10" />
            </div>
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase mb-2">
            Data To Insight
          </CardTitle>
          <CardDescription className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Full Name</Label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-hover/input:text-primary transition-colors" />
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-muted border-border text-foreground pl-11 h-13 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-muted/80 transition-all shadow-sm"
                      placeholder="Enter name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Mobile No.</Label>
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-hover/input:text-primary transition-colors" />
                    <Input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="bg-muted border-border text-foreground pl-11 h-13 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-muted/80 transition-all shadow-sm"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Email Address</Label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-hover/input:text-primary transition-colors" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted border-border text-foreground pl-11 h-13 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-muted/80 transition-all text-base shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Password</Label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-hover/input:text-primary transition-colors" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted border-border text-foreground pl-11 h-13 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:bg-muted/80 transition-all text-base shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest p-4 rounded-xl flex items-center gap-3 animate-in shake duration-500 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                {error}
              </div>
            )}

            {message && (
              <div className="bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-widest p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-500 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/10 transition-all duration-300 hover:scale-[1.02] active:scale-98 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Please wait...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? 'Login Now' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-12 text-center space-y-6">
            <div className="relative flex items-center gap-4">
              <div className="h-px bg-border flex-1"></div>
              <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em]">Or continue with</span>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 h-12 bg-muted border border-border rounded-2xl flex items-center justify-center gap-3 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 hover:border-muted-foreground/20 transition-all font-bold text-xs shadow-sm">
                <Github className="w-4 h-4" />
                Github
              </button>
              <button className="flex-1 h-12 bg-muted border border-border rounded-2xl flex items-center justify-center gap-3 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 hover:border-muted-foreground/20 transition-all font-bold text-xs shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                SSO
              </button>
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors block w-full"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 hover:text-foreground transition-all pt-4"
              >
                — Back to home —
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .h-13 { height: 3.25rem; }
      `}</style>
    </div>
  );
};

export default AuthPage;
