import React, { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/UI/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/UI/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/utils/api";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Forgot Password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "password">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        toast({ title: "Success!", description: result.message });
        navigate("/");
      } else {
        toast({ title: "Login Failed", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openForgot = () => {
    // Pre-fill with login email if present
    setForgotEmail(formData.email || "");
    setForgotStep("email");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setResendCooldown(0);
    setForgotOpen(true);
  };

  const requestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Email required", description: "Please enter your email to continue.", variant: "destructive" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.requestResetOtp(forgotEmail);
      if (res?.success) {
        toast({ title: "OTP sent", description: "Please check your email for the OTP." });
        setForgotStep("otp");
        setResendCooldown(30);
      }
    } catch (err: any) {
      toast({ title: "Unable to send OTP", description: err?.message || "Please try again.", variant: "destructive" });
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
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit OTP.", variant: "destructive" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.verifyResetOtp(forgotEmail, otp);
      if (res?.success) {
        toast({ title: "OTP verified", description: "You can now create a new password." });
        setForgotStep("password");
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please confirm your password.", variant: "destructive" });
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authAPI.resetPasswordOtp(forgotEmail, otp, newPassword);
      if (res?.success) {
        toast({ title: "Password updated", description: "You can now sign in with your new password." });
        setForgotOpen(false);
        // Prefill email and clear password for convenience
        setFormData((prev) => ({ ...prev, email: forgotEmail, password: "" }));
      }
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card p-8 shadow-soft">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your BRELIS account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">Password</label>
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full btn-hero" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link to="/register" className="text-primary hover:text-primary/80 text-sm">
                Don't have an account? Sign up
              </Link>
            </div>

            <div className="text-center mt-4">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          {forgotStep === "email" && (
            <form onSubmit={requestOtp}>
              <DialogHeader>
                <DialogTitle>Reset your password</DialogTitle>
                <DialogDescription>
                  Enter the email associated with your account. We'll send a 6-digit OTP to verify it's you.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={forgotLoading}
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="ghost" onClick={() => setForgotOpen(false)} disabled={forgotLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? "Sending..." : "Send OTP"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotStep === "otp" && (
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
                <Button type="button" variant="ghost" onClick={() => setForgotStep("email")} disabled={forgotLoading}>
                  Back
                </Button>
                <Button type="submit" disabled={forgotLoading || otp.length !== 6}>
                  {forgotLoading ? "Verifying..." : "Verify"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {forgotStep === "password" && (
            <form onSubmit={resetPasswordWithOtp}>
              <DialogHeader>
                <DialogTitle>Create new password</DialogTitle>
                <DialogDescription>Enter a new password for your account.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
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
                  <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
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
                <Button type="button" variant="ghost" onClick={() => setForgotStep("otp")} disabled={forgotLoading}>
                  Back
                </Button>
                <Button type="submit" disabled={forgotLoading}>
                  {forgotLoading ? "Saving..." : "Save Password"}
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
