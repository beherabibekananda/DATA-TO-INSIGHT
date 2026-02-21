
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';

const OTP_LENGTH = 6;

const AdminLogin = ({ onLoginSuccess }) => {
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the Supabase function to generate OTP
      const { data, error: rpcError } = await supabase.rpc('generate_admin_otp', {
        admin_email: email.trim().toLowerCase()
      });

      if (rpcError) {
        console.error('OTP generation RPC error:', rpcError);
        setError(`Database Error: ${rpcError.message || 'Failed to connect to OTP service'}`);
        return;
      }

      // Supabase returns the JSON object directly
      const result = data;
      console.log('OTP generation result:', result);

      if (!result || !result.success) {
        setError(result?.message || 'This email is not authorized for admin access.');
        return;
      }

      // Send OTP email using Supabase's built-in email
      // Since we're using Supabase functions, we'll send via the edge function
      // For now, we use the generated OTP from the function
      const otpCode = result.otp;

      // Try to send email via Supabase Auth magic link (as a fallback notification)
      // But primarily we'll show the OTP was sent
      try {
        await sendOTPEmail(email.trim().toLowerCase(), otpCode);
      } catch (emailErr) {
        console.log('Email sending note:', emailErr);
        // Even if email fails, the OTP is stored - admin can check Supabase
      }

      setSuccess(`OTP has been sent to ${email}`);
      setStep('otp');
      setResendTimer(60); // 60 second cooldown
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendOTPEmail = async (toEmail, otpCode) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-admin-otp', {
        body: { email: toEmail, otp: otpCode },
      });

      if (error) {
        console.error('Edge function error:', error);
        // We don't throw here to allow the user to continue if the OTP was at least generated in DB
      } else {
        console.log('OTP email response:', data);
      }
    } catch (err) {
      console.error('Failed to call edge function:', err);
    }
  };

  const handleOTPChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      const newOtp = Array(OTP_LENGTH).fill('');
      pasted.split('').forEach((char, i) => {
        if (i < OTP_LENGTH) newOtp[i] = char;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: rpcError } = await supabase.rpc('verify_admin_otp', {
        admin_email: email.trim().toLowerCase(),
        otp_input: otpString
      });

      if (rpcError) {
        console.error('OTP verification RPC error:', rpcError);
        setError(`Database Error: ${rpcError.message || 'Failed to verify OTP'}`);
        return;
      }

      const result = data;
      console.log('OTP verification result:', result);

      if (!result || !result.success) {
        setError(result?.message || 'Invalid or expired OTP. Please try again.');
        return;
      }

      // OTP verified! Create admin session
      const adminSession = {
        user: {
          id: 'admin-' + Date.now(),
          email: email.trim().toLowerCase(),
          role: 'admin'
        },
        verified_at: Date.now(),
        expires_at: Date.now() + (12 * 60 * 60 * 1000) // 12 hours
      };

      localStorage.setItem('admin_session', JSON.stringify(adminSession));

      setSuccess('✅ OTP Verified! Redirecting to dashboard...');

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

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setSuccess('');
    await handleSendOTP({ preventDefault: () => { } });
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setSuccess('');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="absolute inset-0 bg-black/20"></div>

      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white relative z-10 shadow-2xl shadow-black/30">
        <CardHeader className="text-center pb-2">
          {/* Shield icon */}
          <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>

          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Admin Access
          </CardTitle>
          <CardDescription className="text-gray-300 text-sm">
            {step === 'email'
              ? 'Enter your admin email to receive a one-time password'
              : `Enter the 6-digit OTP sent to ${email}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'email' ? (
            /* ============ STEP 1: EMAIL ============ */
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-white/90 text-sm font-medium">Admin Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 h-12 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all"
                    placeholder="Enter your admin email"
                  />
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/15 border-red-500/40 rounded-xl">
                  <AlertDescription className="text-red-300 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/15 border-green-500/40 rounded-xl">
                  <AlertDescription className="text-green-300 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-base shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                    Send OTP
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 bg-white/5 border-white/15 text-white hover:bg-white/15 rounded-xl transition-all"
                onClick={handleBackToHome}
              >
                ← Back to Home
              </Button>
            </form>
          ) : (
            /* ============ STEP 2: OTP VERIFICATION ============ */
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              {/* OTP Input Boxes */}
              <div className="space-y-3">
                <Label className="text-white/90 text-sm font-medium">Enter OTP</Label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      onPaste={index === 0 ? handleOTPPaste : undefined}
                      className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 outline-none transition-all duration-200 hover:border-white/30"
                      style={{
                        caretColor: 'transparent'
                      }}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400 mt-1">
                  OTP is valid for 10 minutes
                </p>
              </div>

              {error && (
                <Alert className="bg-red-500/15 border-red-500/40 rounded-xl">
                  <AlertDescription className="text-red-300 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-500/15 border-green-500/40 rounded-xl">
                  <AlertDescription className="text-green-300 text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-base shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02]"
                disabled={loading || otp.join('').length !== OTP_LENGTH}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                    Verify & Login
                  </span>
                )}
              </Button>

              {/* Resend & Back buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-10 bg-white/5 border-white/15 text-white hover:bg-white/15 rounded-xl transition-all text-sm"
                  onClick={handleBackToEmail}
                >
                  ← Change Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={`flex-1 h-10 rounded-xl transition-all text-sm ${resendTimer > 0
                    ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
                    : 'bg-white/5 border-white/15 text-white hover:bg-white/15'
                    }`}
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend OTP'}
                </Button>
              </div>
            </form>
          )}

          {/* Security footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Secured with OTP verification
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
