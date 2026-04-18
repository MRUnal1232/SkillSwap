import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter new password
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Submit email to get reset token
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setResetToken(res.data.resetToken);
      setStep(2);
      setSuccess("Email verified! Set your new password below.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify email");
    }
  };

  // Step 2: Reset password with token
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        token: resetToken,
        newPassword,
      });
      setSuccess(res.data.message);
      setStep(3); // done
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {step === 1 && (
          <>
            <h2>Forgot Password</h2>
            <p className="subtitle">Enter your email to reset your password</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">Verify Email</button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Reset Password</h2>
            <p className="subtitle">Set a new password for your account</p>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Min 6 characters"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Re-enter password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-green">Reset Password</button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Password Reset</h2>
            <div className="auth-success">{success}</div>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: "16px" }}>
              Go to Login
            </Link>
          </>
        )}

        <div className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
