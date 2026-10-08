import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bike,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Layers,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LOGIN } from "@/constants/testIds/auth";
import "./LoginPage.css";

const ROLE_OPTIONS = [
  { id: "OWNER", label: "Owner", icon: "👑", defaultEmail: "alex@metromotors.in" },
  { id: "AGENT", label: "Sales Agent", icon: "⚡", defaultEmail: "rajesh@metromotors.in" },
  { id: "MANAGER", label: "Finance / Audit", icon: "📊", defaultEmail: "priya@metromotors.in" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLogin, biometricLogin, personas } = useAuth();

  const [activeRole, setActiveRole] = useState("OWNER");
  const [email, setEmail] = useState("alex@metromotors.in");
  const [password, setPassword] = useState("metro2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse tracking for subtle interactive ambient spotlight
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });
  };

  const handleRoleChange = (roleId) => {
    setActiveRole(roleId);
    setErrorMsg("");
    const roleObj = ROLE_OPTIONS.find((r) => r.id === roleId);
    if (roleObj) {
      setEmail(roleObj.defaultEmail);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email) {
      setErrorMsg("Please enter your showroom email ID.");
      return;
    }
    setBusy(true);
    try {
      await login({ email, password, roleKey: activeRole });
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } catch {
      setErrorMsg("Failed to authenticate terminal. Please check credentials.");
    } finally {
      setBusy(false);
    }
  };

  const handleBiometricClick = async () => {
    if (scanning || busy) return;
    setScanning(true);
    setErrorMsg("");
    try {
      await biometricLogin(activeRole);
      setScanSuccess(true);
      await new Promise((r) => setTimeout(r, 600));
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } catch {
      setErrorMsg("Sensor communication error. Use keyboard credentials.");
      setScanning(false);
    }
  };

  const handleQuickPersona = async (personaId) => {
    if (busy || scanning) return;
    setBusy(true);
    try {
      await quickLogin(personaId);
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-universe" onMouseMove={handleMouseMove}>
      {/* Background Cybernetic Grid */}
      <div className="login-cyber-grid" />

      {/* Ambient Radial Auroras */}
      <div className="login-aurora-orb aurora-gold" />
      <div className="login-aurora-orb aurora-cyan" />
      <div className="login-aurora-orb aurora-violet" />

      {/* Dynamic Cursor Light Spotlight */}
      <div
        style={{
          position: "fixed",
          left: mousePos.x,
          top: mousePos.y,
          width: "480px",
          height: "480px",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.045) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 2,
          transition: "left 0.12s ease-out, top 0.12s ease-out",
        }}
      />

      {/* Main Stage */}
      <div className="login-stage">
        {/* Left Side: Login Command Terminal */}
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Brand Bar */}
          <div className="login-brand-bar">
            <div className="login-brand-lockup">
              <div className="login-brand-mark">MM</div>
              <div className="login-brand-names">
                <h2>
                  METRO <span>MOTORS</span>
                </h2>
                <p>Reselling Showroom Enterprise</p>
              </div>
            </div>
            <div className="system-live-pill" title="Local Vault & Cloudflare Connected">
              <span className="live-dot" />
              <span>AI VAULT ONLINE</span>
            </div>
          </div>

          {/* Heading */}
          <div className="login-header-text">
            <h1>Showroom Access</h1>
            <p>Enter your credentials or scan biometrics to unlock the dealership console.</p>
          </div>

          {/* Role Segmented Tabs (Lovable / Stitch style) */}
          <div className="role-segment-selector" role="tablist">
            {ROLE_OPTIONS.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`role-tab-btn ${activeRole === role.id ? "is-active" : ""}`}
                onClick={() => handleRoleChange(role.id)}
                role="tab"
                aria-selected={activeRole === role.id}
              >
                <span>{role.icon}</span>
                <span>{role.label}</span>
              </button>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="workflow-message"
                style={{
                  marginBottom: 16,
                  borderColor: "#ef4444",
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#fca5a5",
                }}
              >
                <ShieldAlert size={15} />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Standard Login Form */}
          <form className="login-form" onSubmit={handleFormSubmit}>
            {/* Email Field */}
            <div className="input-block">
              <div className="input-label-row">
                <label htmlFor="login-email">Showroom Email / ID</label>
              </div>
              <div className="input-field-wrapper">
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@metromotors.in"
                  className="login-input"
                  data-testid={LOGIN.emailInput}
                  autoComplete="username"
                />
                <Mail size={16} className="input-icon-lead" />
              </div>
            </div>

            {/* Password Field */}
            <div className="input-block">
              <div className="input-label-row">
                <label htmlFor="login-password">Security Password</label>
                <button
                  type="button"
                  className="forgot-link"
                  data-testid={LOGIN.forgotPasswordLink}
                  onClick={() => alert("Contact Showroom Administrator (Alex Kumar) for master password reset.")}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-field-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="login-input"
                  data-testid={LOGIN.passwordInput}
                  autoComplete="current-password"
                />
                <Lock size={16} className="input-icon-lead" />
                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-checkbox"
              />
              <span>Remember this showroom terminal</span>
            </label>

            {/* Primary Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={busy || scanning}
              data-testid={LOGIN.submitButton}
            >
              {busy ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Authenticating Terminal…</span>
                </>
              ) : (
                <>
                  <span>Sign in to Showroom</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Biometric Sensor Login Box */}
          <div
            className={`biometric-scanner-box ${scanning ? "is-scanning" : ""}`}
            onClick={handleBiometricClick}
            title="Click to authenticate using optical fingerprint scanner or Passkey"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleBiometricClick()}
          >
            <div className="biometric-icon-container">
              <Fingerprint size={24} />
              {scanning && <div className="biometric-laser-line" />}
            </div>
            <div className="biometric-copy">
              <h4>
                {scanning
                  ? "Scanning Biometric Sensor…"
                  : scanSuccess
                  ? "Biometrics Verified ✓"
                  : "Touch Biometric Sensor"}
              </h4>
              <p>Mantra / SecuGen USB Sensor or Device Passkey</p>
            </div>
            <div className="biometric-pulse-radar">
              {scanSuccess ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : (
                <span className="radar-ring" />
              )}
            </div>
          </div>

          {/* Quick Demo Personas (Instant 1-Click Access) */}
          <div className="demo-personas-section">
            <div className="demo-personas-label">
              <span>Quick Demo Personas</span>
              <small>1-Click instant access</small>
            </div>
            <div className="demo-chips-grid">
              {personas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="demo-persona-chip"
                  onClick={() => handleQuickPersona(p.id)}
                  title={`Sign in as ${p.name} (${p.role})`}
                >
                  <div className="demo-chip-avatar" style={{ backgroundColor: p.badgeColor }}>
                    {p.avatar}
                  </div>
                  <div className="demo-chip-name">{p.name}</div>
                  <div className="demo-chip-role">{p.role.split(" ")[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Security Footer */}
          <div className="login-vault-footer">
            <span>
              <ShieldCheck size={14} color="#10b981" /> 256-Bit Encrypted
            </span>
            <span>·</span>
            <span>Cloud Storage Synced</span>
            <span>·</span>
            <span>Zero Egress</span>
          </div>
        </motion.div>

        {/* Right Side: Live Showroom Intelligence Showcase (Lovable / Cursor aesthetic) */}
        <motion.div
          className="showcase-stage"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          {/* Main Showcase Hero Card */}
          <div className="showcase-hero-card">
            <div className="showcase-topline">
              <div className="showcase-badge">
                <Sparkles size={13} />
                <span>AI FLEET OS · REAL-TIME TELEMETRY</span>
              </div>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                BANGALORE MAIN HUB
              </span>
            </div>

            <div className="showcase-metric-hero">
              <div className="showcase-metric-label">
                <TrendingUp size={14} color="#f59e0b" />
                <span>Live Showroom Inventory Valuation</span>
              </div>
              <div className="showcase-metric-val">
                ₹1,84,50,000
                <span>+14.8% this month</span>
              </div>
            </div>

            {/* 3 Column Showroom Telemetry Grid */}
            <div className="showcase-stats-grid">
              <div className="showcase-stat-box">
                <b>42</b>
                <span>Vehicles in Fleet</span>
              </div>
              <div className="showcase-stat-box">
                <b>18</b>
                <span>Deals in Pipeline</span>
              </div>
              <div className="showcase-stat-box">
                <b>100%</b>
                <span>Biometric Verified</span>
              </div>
            </div>

            {/* System Status Indicators */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                fontSize: 11.5,
                color: "#94a3b8",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span>Google Drive Vault: Auto-Mirror Active</span>
              </div>
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>100 GB Plan</span>
            </div>
          </div>

          {/* Floating Micro Highlights Stream */}
          <div className="floating-cards-stream">
            {/* Card 1: Recent Deal */}
            <div className="floating-glass-card">
              <div className="floating-card-header">
                <div className="floating-card-icon icon-amber">
                  <Bike size={18} />
                </div>
                <div>
                  <div className="floating-card-title">Royal Enfield Hunter 350</div>
                  <div className="floating-card-sub">Deal #MM-26-0042 · Handed Over</div>
                </div>
              </div>
              <div className="floating-card-detail">
                <Check size={12} color="#10b981" />
                <span>₹1,42,000 · RC Transferred · Biometric Verified</span>
              </div>
            </div>

            {/* Card 2: Biometric Security Status */}
            <div className="floating-glass-card card-secondary">
              <div className="floating-card-header">
                <div className="floating-card-icon icon-cyan">
                  <Fingerprint size={18} />
                </div>
                <div>
                  <div className="floating-card-title">Biometric RD Service</div>
                  <div className="floating-card-sub">Port 11100 · Sensor Ready</div>
                </div>
              </div>
              <div className="floating-card-detail">
                <Zap size={12} color="#38bdf8" />
                <span>500 DPI Optical Thumbprints Linked to Sale Deed</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
