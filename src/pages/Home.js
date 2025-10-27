// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserShield, FaUser, FaLock, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from './business-logo.png';
import { api } from '../services/api';
import './Home.css';

export default function Home() {
  const nav = useNavigate();

  // form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState({ type: null, text: '' }); // 'error' | 'success' | null
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = username.trim().length > 0 && password.length > 0 && !loading;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setNotice({ type: null, text: '' });
    setLoading(true);
    try {
      // Try admin login first
      await api.adminLogin(username.trim(), password);
      nav('/admin');
    } catch (err) {
      try {
        // If admin fails, try staff login
        await api.staffLogin(username.trim(), password);
        nav('/staff');
      } catch (staffErr) {
        setNotice({ type: 'error', text: 'Invalid username or password.' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // A) reliable --vh (1% of innerHeight)
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);

    // B) measure header/footer real heights → CSS vars
    const setBars = () => {
      const header = document.querySelector('.topBar');
      const footer = document.querySelector('.footer');
      if (header) {
        document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
      }
      if (footer) {
        document.documentElement.style.setProperty('--footer-h', `${footer.offsetHeight}px`);
      }
    };
    setTimeout(setBars, 0);
    window.addEventListener('resize', setBars);
    window.addEventListener('orientationchange', setBars);

    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
      window.removeEventListener('resize', setBars);
      window.removeEventListener('orientationchange', setBars);
    };
  }, []);

  return (
    <div className="page">
      {/* ===== HEADER ===== */}
      <header className="topBar">
        <div className="branding">
          <img src={logo} alt="Heston Automotive Logo" className="logo headerLogo" />
          <span className="subtitle"><b>Vehicle Appraisal System</b></span>
        </div>
      </header>

      {/* ===== HERO (Left: Content | Right: Login) ===== */}
      <main className="main">
        <section className="hero">
          <div className="heroBgPattern" />

          {/* LEFT: Text/Marketing */}
          <div className="left">
            <h2 className="heroTitle">Fast, Simple & Accurate Vehicle Appraisals</h2>
            <p className="heroText">
              With Heston Inspect, you can quickly evaluate any vehicle with full confidence.
              Streamline your appraisal process with our intuitive tools.
            </p>
            <ul className="featureList">
              <li className="featureItem"><FaUser className="featureIcon" /> Capture photos & record faults</li>
              <li className="featureItem"><FaLock className="featureIcon" /> Generate branded reports</li>
              <li className="featureItem"><FaUserShield className="featureIcon" /> Secure & team-friendly</li>
            </ul>
          </div>

          {/* RIGHT: Login Card */}
          <form onSubmit={submit} className="loginCard" noValidate>
            <h2 className="cardTitle">Sign in to Heston Inspect</h2>
            <p className="sub">Enter your credentials to continue.</p>

            {/* Username */}
            <div className="row">
              <label htmlFor="username" className="label">Username</label>
              <div className="withIcon">
                <FaUser className="icon" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  inputMode="text"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  className="input"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="row">
              <label htmlFor="password" className="label">Password</label>
              <div className="withIcon">
                <FaLock className="icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  minLength={1}
                  className="input inputWithToggle"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="passwordToggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Notice region */}
            {notice.type && (
              <div
                role="alert"
                aria-live={notice.type === 'error' ? 'assertive' : 'polite'}
                className={`notice ${notice.type}`}
              >
                {notice.text}
              </div>
            )}

            <button
              type="submit"
              className={`btn ${(!canSubmit || loading) ? 'disabled' : ''}`}
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Signing in…
                </>
              ) : (
                <>
                  <FaUser /> Sign In
                </>
              )}
            </button>

            {/* Forgot password link */}
            <p className="forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </form>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        © 2025 Heston Automotive. All rights reserved.
        <br />
        Designed for internal use only | Vehicle Appraisal System
      </footer>
    </div>
  );
}
