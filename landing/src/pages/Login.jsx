import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthLayout } from "@/components/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Login failed"
        : "Login failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Welcome <span className="font-serif italic font-normal">back</span>
        </>
      }
      subtitle="Sign in to continue your learning journey."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-foreground hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <Alert variant="error" className="mb-5">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <Link
          to="/forgot-password"
          className="text-xs text-muted-foreground hover:text-foreground tracking-wide"
        >
          Forgot your password?
        </Link>
      </div>
    </AuthLayout>
  );
}
