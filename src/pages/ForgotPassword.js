import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "https://heston-backend.onrender.com";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", error: false });
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Request failed");
      setStatus({ loading: false, message: "If that email exists, a reset link has been sent. Please check your inbox and also your junk or spam folder.", error: false });
      setEmail("");
    } catch (err) {
      setStatus({ loading: false, message: err.message || "Something went wrong", error: true });
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h1 style={{ marginBottom: 16 }}>Forgot password</h1>
      <p style={{ marginBottom: 16 }}>Enter your account email. We’ll send you a password reset link.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email" style={{ display: "block", marginBottom: 8 }}>Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button type="submit" disabled={status.loading}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", cursor: "pointer", opacity: status.loading ? 0.7 : 1 }}>
          {status.loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {status.message ? (
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: status.error ? "#ffe6e6" : "#e9ffe9",
                      border: `1px solid ${status.error ? "#ffb3b3" : "#b7f0b7"}` }}>
          {status.message}
        </div>
      ) : null}
    </div>
  );
}
