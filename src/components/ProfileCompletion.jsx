
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ProfileCompletion = ({ onComplete }) => {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [mobile, setMobile] = useState(profile?.mobile || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!mobile.trim()) {
      setError('Mobile number is required');
      setLoading(false);
      return;
    }

    try {
      const { error } = await updateProfile({
        full_name: fullName.trim(),
        mobile: mobile.trim()
      });

      if (error) {
        setError(error.message);
      } else {
        onComplete();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-md bg-card backdrop-blur-3xl border-border text-foreground relative z-10 shadow-2xl rounded-[32px] overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-indigo-500 to-accent"></div>
        <CardHeader className="text-center p-8 border-b border-border bg-muted/30">
          <CardTitle className="text-2xl font-black tracking-tighter uppercase bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">
            Please provide your details to access all features
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email (Verified)</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="h-14 bg-muted/50 border-border text-muted-foreground rounded-2xl px-4 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                placeholder="Enter your mobile number"
              />
            </div>

            {error && (
              <Alert className="bg-destructive/10 border-destructive/20 rounded-2xl">
                <AlertDescription className="text-destructive font-bold text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10 transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;

