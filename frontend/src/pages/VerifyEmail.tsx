import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Button } from "@/components/UI/button";
import { authAPI } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        setError("No verification token provided");
        setIsLoading(false);
        return;
      }

      try {
        const result = await authAPI.verifyEmail(token);
        
        if (result.success) {
          setIsSuccess(true);
          toast({
            title: "Email Verified!",
            description: result.message,
          });
        } else {
          setError(result.message || "Verification failed");
        }
      } catch (error: any) {
        setError(error.message || "An error occurred during verification");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-card p-8 shadow-soft text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Verifying Email...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card p-8 shadow-soft text-center">
            {isSuccess ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Email Verified Successfully!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your email address has been verified. You can now log in to your account.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full btn-hero"
                  >
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Home
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Verification Failed
                </h2>
                <p className="text-muted-foreground mb-6">
                  {error || "The verification link is invalid or has expired."}
                </p>
                <div className="space-y-3">
                  <Link
                    to="/register"
                    className="block w-full"
                  >
                    <Button className="w-full btn-hero">
                      Register Again
                    </Button>
                  </Link>
                  <Link
                    to="/login"
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              </>
            )}

            <div className="text-center mt-6">
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
    </div>
  );
};

export default VerifyEmail;
