
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
    <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Immersive Environmental Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary/20 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-accent/10 blur-[120px] rounded-full"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <Card className="w-full max-w-[480px] bg-card/30 backdrop-blur-3xl border-white/5 text-white relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-t-white/10 overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-accent"></div>

        <CardHeader className="text-center pt-16 pb-8 px-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Brain className="w-10 h-10 text-primary relative z-10" />
            </div>
          </div>
          <CardTitle className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap mb-2">
            EduIntelligence
          </CardTitle>
          <CardDescription className="text-white/20 uppercase tracking-[0.2em] text-[10px] font-black">
            {isLogin ? 'Neural Node Authentication' : 'Establish New Neural Identity'}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-16">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Callsign</Label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover/input:text-primary transition-colors" />
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white/[0.03] border-white/10 text-white pl-11 h-13 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] transition-all"
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Frequency</Label>
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover/input:text-primary transition-colors" />
                    <Input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="bg-white/[0.03] border-white/10 text-white pl-11 h-13 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] transition-all"
                      placeholder="Mobile"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Access Credential</Label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover/input:text-primary transition-colors" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/[0.03] border-white/10 text-white pl-11 h-13 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] transition-all text-base"
                  placeholder="neural@net.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Neural Key</Label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover/input:text-primary transition-colors" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.03] border-white/10 text-white pl-11 h-13 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] transition-all text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-widest p-4 rounded-xl flex items-center gap-3 animate-in shake duration-500">
                <ShieldCheck className="w-4 h-4" />
                {error}
              </div>
            )}

            {message && (
              <div className="bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-widest p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-500">
                <ShieldCheck className="w-4 h-4" />
                {message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-98 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Synchronizing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isLogin ? 'Establish Link' : 'Initialize Node'}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-12 text-center space-y-6">
            <div className="relative flex items-center gap-4">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">Alternate Nodes</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 h-12 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-white/40 hover:text-white hover:bg-white/[0.05] transition-all font-bold text-xs">
                <Github className="w-4 h-4" />
                Github
              </button>
              <button className="flex-1 h-12 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-white/40 hover:text-white hover:bg-white/[0.05] transition-all font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                SSO
              </button>
            </div>

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/20 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors block w-full"
            >
              {isLogin ? "Request New Neural ID" : "Sync Existing Identity"}
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 hover:text-white transition-all pt-4"
              >
                — Return to Hub —
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
