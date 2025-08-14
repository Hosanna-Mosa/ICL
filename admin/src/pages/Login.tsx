import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import adminApi, { adminAuthAPI } from '@/utils/api';

const Login = () => {
  const { user, login, loading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'password'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(formData.email, formData.password);

    if (success) {
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in to BRELIS Admin Panel.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
      });
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Forgot password handlers
  const openForgot = () => {
    setForgotEmail(formData.email || '');
    setForgotStep('email');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResendCooldown(0);
    setForgotOpen(true);
  };

  const requestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!forgotEmail) {
      toast({ title: 'Email required', description: 'Please enter your email to continue.', variant: 'destructive' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await adminAuthAPI.requestResetOtp(forgotEmail);
      if (res?.success) {
        toast({ title: 'OTP sent', description: 'Please check your email for the OTP.' });
        setForgotStep('otp');
        setResendCooldown(30);
      }
    } catch (err: any) {
      toast({ title: 'Unable to send OTP', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setForgotLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    await requestOtp();
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit OTP.', variant: 'destructive' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await adminAuthAPI.verifyResetOtp(forgotEmail, otp);
      if (res?.success) {
        toast({ title: 'OTP verified', description: 'You can now create a new password.' });
        setForgotStep('password');
      }
    } catch (err: any) {
      toast({ title: 'Verification failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please confirm your password.', variant: 'destructive' });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await adminAuthAPI.resetPasswordOtp(forgotEmail, otp, newPassword);
      if (res?.success) {
        toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
        setForgotOpen(false);
        setFormData((prev) => ({ ...prev, email: forgotEmail, password: '' }));
      }
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setForgotLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass shadow-premium border-border/50">
          <CardHeader className="text-center space-y-6 pb-8">
            <Logo className="mx-auto" />
            <div>
              <CardTitle className="text-2xl font-semibold">Admin Login</CardTitle>
              <CardDescription className="text-muted-foreground">
                Access the BRELIS Streetwear management panel
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 bg-input/50 border-border/50 focus:border-primary transition-colors"
                  placeholder="admin@brelisstreetwear.com"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={openForgot}
                    className="text-primary text-xs hover:underline"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-12 bg-input/50 border-border/50 focus:border-primary transition-colors pr-12"
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-300 shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Demo credentials: admin@brelisstreetwear.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          {forgotStep === 'email' && (
            <form onSubmit={requestOtp}>
              <DialogHeader>
                <DialogTitle>Reset your password</DialogTitle>
                <DialogDescription>
                  Enter the admin email. We'll send a 6-digit OTP to verify it's you.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@brelisstreetwear.com"
                  required
                  disabled={forgotLoading}
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setForgotOpen(false)} disabled={forgotLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotStep === 'otp' && (
            <form onSubmit={verifyOtp}>
              <DialogHeader>
                <DialogTitle>Enter OTP</DialogTitle>
                <DialogDescription>
                  We've sent a 6-digit OTP to {forgotEmail}. Please enter it below.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex flex-col items-center gap-4">
                <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={forgotLoading}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <div className="text-xs text-muted-foreground">
                  {resendCooldown > 0 ? (
                    <span>Resend OTP in {resendCooldown}s</span>
                  ) : (
                    <button type="button" onClick={resendOtp} className="text-primary hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setForgotStep('email')} disabled={forgotLoading}>
                  Back
                </Button>
                <Button type="submit" disabled={forgotLoading || otp.length !== 6}>
                  {forgotLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotStep === 'password' && (
            <form onSubmit={resetPasswordWithOtp}>
              <DialogHeader>
                <DialogTitle>Create new password</DialogTitle>
                <DialogDescription>Enter a new password for your admin account.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">New Password</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={forgotLoading}
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium mb-2">Confirm Password</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    disabled={forgotLoading}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setForgotStep('otp')} disabled={forgotLoading}>
                  Back
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? 'Saving...' : 'Save Password'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;