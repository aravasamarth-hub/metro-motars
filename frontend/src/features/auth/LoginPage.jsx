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
  {
    id: "OWNER",
    label: "Showroom Owner",
    icon: "👑",
    defaultEmail: "aravasamarth@gmail.com",
    badge: "Full Access",
    subtitle: "Everything Visible (All Pricing, Ledgers, Bills & Margins)",
  },
  {
    id: "WORKER",
    label: "Showroom Worker",
    icon: "🛠️",
    defaultEmail: "samartharava@gmail.com",
    badge: "Restricted",
    subtitle: "Prices, Agent Fee, Payments & Bills Shielded",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickLogin, biometricLogin, setPassword: authSetPass, sendOtp, verifyOtpAndResetPassword, personas } = useAuth();

  const [activeRole, setActiveRole] = useState("OWNER");
  const [email, setEmail] = useState("aravasamarth@gmail.com");
  const [password, setPassword] = useState("metro2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── First-Time Password Setup State ──
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [setupEmail, setSetupEmail] = useState("aravasamarth@gmail.com");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [setupError, setSetupError] = useState("");

  // ── Forgot Password & Email OTP State ──
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otpEmail, setOtpEmail] = useState("aravasamarth@gmail.com");
  const [otpCode, setOtpCode] = useState("");
  const [dispatchedOtp, setDispatchedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);

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
    } catch (err) {
      setErrorMsg(err.message || "Failed to authenticate terminal. Please check credentials or reset via OTP.");
    } finally {
      setBusy(false);
    }
  };

  // ── Handle Initial Password Setup for Owner ──
  const handleSaveInitialPassword = async (e) => {
    e.preventDefault();
    setSetupError("");
    if (!setupPassword || setupPassword.length < 4) {
      setSetupError("Password must be at least 4 characters.");
      return;
    }
    if (setupPassword !== setupConfirm) {
      setSetupError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await authSetPass(setupEmail, setupPassword);
      await login({ email: setupEmail, password: setupPassword, roleKey: "OWNER" });
      setShowSetPasswordModal(false);
      navigate("/", { replace: true });
    } catch (err) {
      setSetupError(err.message || "Failed to save password.");
    } finally {
      setBusy(false);
    }
  };

  // ── Handle OTP Dispatch to Email ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");
    setOtpBusy(true);
    try {
      const res = await sendOtp(otpEmail);
      setDispatchedOtp(res.otp);
      setOtpSuccess(`Verification code dispatched to ${otpEmail}`);
      setOtpStep(2);
    } catch (err) {
      setOtpError(err.message || "Failed to dispatch verification OTP.");
    } finally {
      setOtpBusy(false);
    }
  };

  // ── Handle OTP Verification & Password Reset ──
  const handleVerifyOtpAndSave = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setOtpError("New password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpError("Passwords do not match.");
      return;
    }
    setOtpBusy(true);
    try {
      await verifyOtpAndResetPassword(otpEmail, otpCode, newPassword);
      setOtpSuccess("Password verified and updated!");
      await new Promise((r) => setTimeout(r, 600));
      await login({ email: otpEmail, password: newPassword, roleKey: "OWNER" });
      setShowForgotModal(false);
      navigate("/", { replace: true });
    } catch (err) {
      setOtpError(err.message || "Verification failed. Check the code and try again.");
    } finally {
      setOtpBusy(false);
    }
  };

  const handleBiometricClick = async () => {
    if (scanning || busy) return;
    setScanning(true);
    setErrorMsg("");
    try {
      await biometricLogin(activeRole);
      setScanSuccess(true);
      await new Promise((r) => setTimeout(r, 450));
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => navigate("/showcase")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(56, 189, 248, 0.15))",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  color: "#f59e0b",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                }}
                data-testid="login-vip-showcase-pill"
                title="Explore the Public 5-Library VIP Automotive Showcase"
              >
                <Sparkles size={13} />
                <span>VIP Showcase</span>
                <ArrowRight size={12} />
              </button>
              <div className="system-live-pill" title="Local Vault & Cloudflare Connected">
                <span className="live-dot" />
                <span>AI VAULT ONLINE</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="login-header-text">
            <h1>Showroom Access</h1>
            <p>Select your authorized account and enter your security credentials.</p>
          </div>

          {/* Role Segmented Tabs (Owner vs Worker) */}
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

          {/* Role Description Banner */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: activeRole === "OWNER" ? "rgba(245, 158, 11, 0.08)" : "rgba(56, 189, 248, 0.08)",
              border: `1px solid ${activeRole === "OWNER" ? "rgba(245, 158, 11, 0.25)" : "rgba(56, 189, 248, 0.25)"}`,
              marginBottom: "16px",
              fontSize: "11px",
              color: activeRole === "OWNER" ? "#fcd34d" : "#7dd3fc",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldCheck size={14} />
            <span>
              {activeRole === "OWNER"
                ? "👑 Owner Account: Everything visible (Vehicle prices, seller & buyer costs, agent fees, payments, bills & finances)."
                : "🛠️ Worker Account: Operations visible. Prices of seller & buyer, agent fees, payments, and bills are shielded."}
            </span>
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
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {activeRole === "OWNER" && (
                    <button
                      type="button"
                      className="forgot-link"
                      style={{ color: "#38bdf8", fontWeight: 700 }}
                      onClick={() => {
                        setSetupEmail(email);
                        setSetupPassword("");
                        setSetupConfirm("");
                        setSetupError("");
                        setShowSetPasswordModal(true);
                      }}
                      title="Set or update owner password directly"
                    >
                      Set Initial Password
                    </button>
                  )}
                  <button
                    type="button"
                    className="forgot-link"
                    data-testid={LOGIN.forgotPasswordLink}
                    onClick={() => {
                      setOtpEmail(email);
                      setOtpStep(1);
                      setOtpCode("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setOtpError("");
                      setOtpSuccess("");
                      setShowForgotModal(true);
                    }}
                  >
                    Forgot password? (Email OTP)
                  </button>
                </div>
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
                  <span>Sign in as {activeRole === "OWNER" ? "Owner" : "Worker"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* ── First-Time Initial Password Setup Modal ── */}
          {showSetPasswordModal && (
            <div className="auth-modal-backdrop" onClick={() => setShowSetPasswordModal(false)}>
              <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal-header">
                  <div>
                    <h3><KeyRound size={20} className="text-amber-400" /> Set Starting Owner Password</h3>
                    <p>Configure a custom security password for {setupEmail}</p>
                  </div>
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowSetPasswordModal(false)}
                  >
                    ✕
                  </button>
                </div>

                {setupError && (
                  <div className="workflow-message" style={{ background: "rgba(239, 68, 68, 0.15)", borderColor: "#ef4444", color: "#fca5a5", marginBottom: "14px" }}>
                    <ShieldAlert size={14} />
                    <span>{setupError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveInitialPassword}>
                  <div className="input-block">
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Owner Email Address</label>
                    <input
                      type="email"
                      value={setupEmail}
                      disabled
                      className="login-input"
                      style={{ opacity: 0.7 }}
                    />
                  </div>

                  <div className="input-block" style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>New Security Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter minimum 4 characters"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      className="login-input"
                    />
                  </div>

                  <div className="input-block" style={{ marginTop: "12px" }}>
                    <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Confirm Security Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat your new password"
                      value={setupConfirm}
                      onChange={(e) => setSetupConfirm(e.target.value)}
                      className="login-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="login-submit-btn"
                    style={{ marginTop: "20px" }}
                    disabled={busy}
                  >
                    {busy ? "Saving Credentials…" : "Save Password & Enter Showroom"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── Forgot Password & Email OTP Verification Modal ── */}
          {showForgotModal && (
            <div className="auth-modal-backdrop" onClick={() => setShowForgotModal(false)}>
              <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal-header">
                  <div>
                    <h3><Mail size={20} className="text-amber-400" /> Reset Password via Email OTP</h3>
                    <p>Verify your showroom identity to reset your password</p>
                  </div>
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowForgotModal(false)}
                  >
                    ✕
                  </button>
                </div>

                {otpError && (
                  <div className="workflow-message" style={{ background: "rgba(239, 68, 68, 0.15)", borderColor: "#ef4444", color: "#fca5a5", marginBottom: "14px" }}>
                    <ShieldAlert size={14} />
                    <span>{otpError}</span>
                  </div>
                )}

                {otpSuccess && (
                  <div className="workflow-message" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "#10b981", color: "#6ee7b7", marginBottom: "14px" }}>
                    <CheckCircle2 size={14} />
                    <span>{otpSuccess}</span>
                  </div>
                )}

                {otpStep === 1 && (
                  <form onSubmit={handleSendOtp}>
                    <div className="input-block">
                      <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Showroom Email ID</label>
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        className="login-input"
                      />
                    </div>
                    <button
                      type="submit"
                      className="login-submit-btn"
                      style={{ marginTop: "20px" }}
                      disabled={otpBusy}
                    >
                      {otpBusy ? "Dispatching OTP…" : "Send 6-Digit Email OTP"}
                    </button>
                  </form>
                )}

                {otpStep === 2 && (
                  <form onSubmit={handleVerifyOtpAndSave}>
                    {/* Live Preview OTP Banner for Test / Verification */}
                    {dispatchedOtp && (
                      <div className="auth-otp-preview-banner">
                        <div>
                          <b style={{ color: "#ffffff", fontSize: "12px", display: "block" }}>🔐 Dispatched Security OTP</b>
                          <span style={{ color: "#94a3b8", fontSize: "11px" }}>Enter this verification code below:</span>
                        </div>
                        <span className="auth-otp-code-chip">{dispatchedOtp}</span>
                      </div>
                    )}

                    <div className="input-block">
                      <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Enter 6-Digit Verification Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="login-input auth-otp-input"
                      />
                    </div>

                    <div className="input-block" style={{ marginTop: "14px" }}>
                      <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>New Security Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 4 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="login-input"
                      />
                    </div>

                    <div className="input-block" style={{ marginTop: "14px" }}>
                      <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="login-input"
                      />
                    </div>

                    <button
                      type="submit"
                      className="login-submit-btn"
                      style={{ marginTop: "20px" }}
                      disabled={otpBusy}
                    >
                      {otpBusy ? "Verifying Code…" : "Verify OTP & Update Password"}
                    </button>

                    <div style={{ textAlign: "center", marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "11.5px", cursor: "pointer" }}
                      >
                        Didn't receive code? Resend OTP
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

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

          <div style={{ marginTop: 14, textAlign: "center", paddingTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>Looking for the public showroom? </span>
            <button
              type="button"
              onClick={() => navigate("/showcase")}
              style={{
                background: "none",
                border: "none",
                color: "#f59e0b",
                fontWeight: 600,
                fontSize: "11.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                textDecoration: "underline",
              }}
              data-testid="login-public-showcase-link"
            >
              Explore VIP Showcase <ArrowRight size={11} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
