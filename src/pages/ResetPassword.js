import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "https://heston-backend.onrender.com";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setStatus({ loading: false, message: "Password must be at least 8 characters.", error: true });
    if (password !== confirm) return setStatus({ loading: false, message: "Passwords do not match.", error: true });

    setStatus({ loading: true, message: "", error: false });
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Request failed");
      setStatus({ loading: false, message: "Password reset successful. Redirecting to login…", error: false });
      setTimeout(() => navigate("/"), 1200); // ya "/admin-login" / "/staff-login" agar alag page use karte ho
    } catch (err) {
      setStatus({ loading: false, message: err.message || "Something went wrong", error: true });
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 24, border: "1px solid #eee", borderRadius: 12 }}>
      <h1 style={{ marginBottom: 16 }}>Set a new password</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="password" style={{ display: "block", marginBottom: 8 }}>New password</label>
        <input id="password" type="password" required value={password}
               onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
               style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 8, border: "1px solid #ddd" }} />

        <label htmlFor="confirm" style={{ display: "block", marginBottom: 8 }}>Confirm password</label>
        <input id="confirm" type="password" required value={confirm}
               onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
               style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 8, border: "1px solid #ddd" }} />

        <button type="submit" disabled={status.loading}
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", cursor: "pointer", opacity: status.loading ? 0.7 : 1 }}>
          {status.loading ? "Saving..." : "Reset password"}
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
