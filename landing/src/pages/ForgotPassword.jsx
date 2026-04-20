import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthLayout } from "@/components/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { api } from "@/lib/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toMessage = (err, fallback) =>
    axios.isAxiosError(err)
      ? err.response?.data?.message ?? fallback
      : fallback;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setResetToken(res.data.resetToken);
      setStep(2);
      setSuccess("Email verified. Set your new password below.");
    } catch (err) {
      setError(toMessage(err, "Failed to verify email"));
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        token: resetToken,
        newPassword,
      });
      setSuccess(res.data.message);
      setStep(3);
    } catch (err) {
      setError(toMessage(err, "Failed to reset password"));
    }
  };

  return (
    <AuthLayout
      title={
        step === 3 ? (
          <>
            Password <span className="font-serif italic font-normal">reset</span>
          </>
        ) : step === 2 ? (
          <>
            Set a <span className="font-serif italic font-normal">new</span>{" "}
            password
          </>
        ) : (
          <>
            Forgot your{" "}
            <span className="font-serif italic font-normal">password?</span>
          </>
        )
      }
      subtitle={
        step === 1
          ? "Enter your email to reset your password."
          : step === 2
            ? "Choose a strong new password for your account."
            : undefined
      }
      footer={
        <Link to="/login" className="hover:text-foreground">
          Back to sign in
        </Link>
      }
    >
      {error && (
        <Alert variant="error" className="mb-5">
          {error}
        </Alert>
      )}
      {success && step !== 3 && (
        <Alert variant="success" className="mb-5">
          {success}
        </Alert>
      )}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Verify Email
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full">
            Reset Password
          </Button>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <Alert variant="success">{success}</Alert>
          <Link to="/login">
            <Button size="lg" className="w-full">
              Go to Sign In
            </Button>
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
