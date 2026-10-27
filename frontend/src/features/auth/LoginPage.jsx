import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Check,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LOGIN, REGISTER } from "@/constants/testIds/auth";
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
  const {
    login,
    register,
    quickLogin,
    setPassword: authSetPass,
    forgotPassword,
    verifyRecoveryOtp,
    resetPasswordWithToken,
    personas,
  } = useAuth();

  // Mode Switcher: 'login' | 'register'
  const [authMode, setAuthMode] = useState("login");

  // ── Login Form State ──
  const [activeRole, setActiveRole] = useState("OWNER");
  const [email, setEmail] = useState("aravasamarth@gmail.com");
  const [password, setPassword] = useState("metro2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // ── Registration Form State ──
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── Google OAuth Guidance Modal State ──
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // ── First-Time Password Setup State ──
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [setupEmail, setSetupEmail] = useState("aravasamarth@gmail.com");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupConfirm, setSetupConfirm] = useState("");
  const [setupError, setSetupError] = useState("");

  // ── 3-Step Forgot Password & Email OTP State ──
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [otpEmail, setOtpEmail] = useState("aravasamarth@gmail.com");
  const [otpCode, setOtpCode] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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
      if (roleId === "WORKER") {
        setPassword("Samarth@#$07");
      } else {
        setPassword("metro2026");
      }
    }
  };

  // ── Handle Email/Password Login ──
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }
    setBusy(true);
    try {
      await login({ email, password, roleKey: activeRole });
      const dest = location.state?.from?.pathname || "/dashboard";
      void navigate(dest, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setBusy(false);
    }
  };

  // ── Handle Customer Registration ──
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regFullName || regFullName.trim().length < 2) {
      setRegError("Please enter your full name (minimum 2 characters).");
      return;
    }
    if (!regEmail?.includes("@")) {
      setRegError("Please enter a valid email address.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match. Please verify your entries.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Password must be at least 8 characters long.");
      return;
    }
    if (!regTermsAccepted) {
      setRegError("You must agree to the Terms of Service & Privacy Policy to create an account.");
      return;
    }

    setBusy(true);
    try {
      await register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });
      setRegSuccess("Account registered successfully! Welcome to Metro Motors.");
      await new Promise((r) => setTimeout(r, 600));
      const dest = location.state?.from?.pathname || "/dashboard";
      void navigate(dest, { replace: true });
    } catch (err) {
      setRegError(err.message || "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // ── Handle Google OAuth Click ──
  const handleGoogleClick = () => {
    // If Google Client ID is configured in client window or env, initiate prompt
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowGoogleModal(true);
    }
  };

  // ── Handle Initial Password Setup for Showroom Owner ──
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
      void navigate("/dashboard", { replace: true });
    } catch (err) {
      setSetupError(err.message || "Failed to save password.");
    } finally {
      setBusy(false);
    }
  };

  // ── Step 1: Request 6-Digit OTP from Server ──
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError("");
    setOtpSuccess("");
    if (!otpEmail?.includes("@")) {
      setOtpError("Please enter a valid email address.");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await forgotPassword(otpEmail);
      setOtpSuccess(res.message || `Verification code sent to ${otpEmail}`);
      setResendCooldown(60);
      setOtpStep(2);
    } catch (err) {
      setOtpError(err.message || "Failed to dispatch verification OTP. Please try again.");
    } finally {
      setOtpBusy(false);
    }
  };

  // ── Step 2: Validate 6-Digit OTP Code -> Receive Recovery Token ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");
    const cleanCode = (otpCode || "").trim();
    if (cleanCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await verifyRecoveryOtp(otpEmail, cleanCode);
      setRecoveryToken(res.recoveryToken);
      setOtpSuccess("Verification confirmed! Please set your new password below.");
      setOtpStep(3);
    } catch (err) {
      setOtpError(err.message || "Invalid or expired verification code. Please check your inbox or resend.");
    } finally {
      setOtpBusy(false);
    }
  };

  // ── Step 3: Reset Password using Recovery Token ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");
    if (!newPassword || newPassword.length < 8) {
      setOtpError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setOtpError("Passwords do not match.");
      return;
    }
    setOtpBusy(true);
    try {
      await resetPasswordWithToken({
        email: otpEmail,
        recoveryToken,
        newPassword,
        confirmPassword,
      });
      setOtpSuccess("Password successfully updated! Logging you in…");
      await new Promise((r) => setTimeout(r, 600));
      await login({ email: otpEmail, password: newPassword, roleKey: "OWNER" });
      setShowForgotModal(false);
      void navigate("/dashboard", { replace: true });
    } catch (err) {
      setOtpError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setOtpBusy(false);
    }
  };

  const handleQuickPersona = async (personaId) => {
    if (busy) return;
    setBusy(true);
    try {
      await quickLogin(personaId);
      const dest = location.state?.from?.pathname || "/dashboard";
      void navigate(dest, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || "Quick persona sign-in failed.");
    } finally {
      setBusy(false);
    }
  };

  // Password Policy Checklist Helpers
  const hasMinLength = regPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(regPassword);
  const hasLowerCase = /[a-z]/.test(regPassword);
  const hasNumberOrSymbol = /[\d\W_]/.test(regPassword);

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
                <p>Curated Two-Wheeler Showroom</p>
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
                title="Explore the VIP Automotive Showcase"
              >
                <Sparkles size={13} />
                <span>VIP Showcase</span>
                <ArrowRight size={12} />
              </button>
              <div className="system-live-pill" title="MongoDB Atlas & Security Active">
                <span className="live-dot" />
                <span>ONLINE</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="login-header-text">
            <h1>{authMode === "login" ? "Welcome Back" : "Create Account"}</h1>
            <p>
              {authMode === "login"
                ? "Sign in to access your saved bikes, customer enquiries, or showroom console."
                : "Register with full name and verified credentials to save favourite bikes and submit enquiries."}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Create Account) */}
          <div className="auth-mode-switch" role="tablist">
            <button
              type="button"
              className={`auth-mode-tab ${authMode === "login" ? "is-active" : ""}`}
              onClick={() => {
                setAuthMode("login");
                setErrorMsg("");
              }}
              role="tab"
              aria-selected={authMode === "login"}
              data-testid={REGISTER.loginLink}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-mode-tab ${authMode === "register" ? "is-active" : ""}`}
              onClick={() => {
                setAuthMode("register");
                setRegError("");
              }}
              role="tab"
              aria-selected={authMode === "register"}
              data-testid={LOGIN.registerLink}
            >
              Create Account
            </button>
          </div>

          {/* ═══════════════════════════════════════════════
              MODE 1: SIGN IN FORM
             ═══════════════════════════════════════════════ */}
          {authMode === "login" && (
            <>
              {/* Google OAuth Button */}
              <button
                type="button"
                className="google-auth-btn"
                onClick={handleGoogleClick}
                title="Sign in with your verified Google account"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="auth-divider">or sign in with email</div>

              {/* Showroom Staff Persona Switcher */}
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
                    ? "👑 Owner Account: Full administrative and showroom console access."
                    : "🛠️ Worker Account: Showroom operations mode."}
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
                    <label htmlFor="login-email">Email Address</label>
                  </div>
                  <div className="input-field-wrapper">
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
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
                    <label htmlFor="login-password">Password</label>
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
                  <span>Remember this device</span>
                </label>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={busy}
                  data-testid={LOGIN.submitButton}
                >
                  {busy ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>Authenticating…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Personas */}
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
            </>
          )}

          {/* ═══════════════════════════════════════════════
              MODE 2: REGISTRATION FORM
             ═══════════════════════════════════════════════ */}
          {authMode === "register" && (
            <>
              {/* Google OAuth Register Option */}
              <button
                type="button"
                className="google-auth-btn"
                onClick={handleGoogleClick}
                title="Register instantly with your Google account"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign up with Google</span>
              </button>

              <div className="auth-divider">or register with email</div>

              {/* Registration Error */}
              {regError && (
                <div
                  className="workflow-message"
                  style={{
                    marginBottom: 16,
                    borderColor: "#ef4444",
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#fca5a5",
                  }}
                >
                  <ShieldAlert size={15} />
                  <span>{regError}</span>
                </div>
              )}

              {/* Registration Success */}
              {regSuccess && (
                <div
                  className="workflow-message"
                  style={{
                    marginBottom: 16,
                    borderColor: "#10b981",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#6ee7b7",
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>{regSuccess}</span>
                </div>
              )}

              <form className="login-form" onSubmit={handleRegisterSubmit}>
                {/* Full Name */}
                <div className="input-block">
                  <div className="input-label-row">
                    <label htmlFor="reg-name">Full Name</label>
                  </div>
                  <div className="input-field-wrapper">
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="login-input"
                      data-testid={REGISTER.nameInput}
                      autoComplete="name"
                    />
                    <User size={16} className="input-icon-lead" />
                  </div>
                </div>

                {/* Email */}
                <div className="input-block">
                  <div className="input-label-row">
                    <label htmlFor="reg-email">Email Address</label>
                  </div>
                  <div className="input-field-wrapper">
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="login-input"
                      data-testid={REGISTER.emailInput}
                      autoComplete="email"
                    />
                    <Mail size={16} className="input-icon-lead" />
                  </div>
                </div>

                {/* Password */}
                <div className="input-block">
                  <div className="input-label-row">
                    <label htmlFor="reg-password">Password</label>
                  </div>
                  <div className="input-field-wrapper">
                    <input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="login-input"
                      data-testid={REGISTER.passwordInput}
                      autoComplete="new-password"
                    />
                    <Lock size={16} className="input-icon-lead" />
                    <button
                      type="button"
                      className="password-eye-btn"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Checklist */}
                {regPassword && (
                  <div className="password-policy-card">
                    <small>Password Requirements</small>
                    <div className={`password-rule-row ${hasMinLength ? "is-met" : ""}`}>
                      {hasMinLength ? <Check size={12} /> : <span>•</span>}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`password-rule-row ${hasUpperCase && hasLowerCase ? "is-met" : ""}`}>
                      {hasUpperCase && hasLowerCase ? <Check size={12} /> : <span>•</span>}
                      <span>Uppercase and lowercase letters</span>
                    </div>
                    <div className={`password-rule-row ${hasNumberOrSymbol ? "is-met" : ""}`}>
                      {hasNumberOrSymbol ? <Check size={12} /> : <span>•</span>}
                      <span>At least one number or special symbol</span>
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="input-block">
                  <div className="input-label-row">
                    <label htmlFor="reg-confirm-password">Confirm Password</label>
                  </div>
                  <div className="input-field-wrapper">
                    <input
                      id="reg-confirm-password"
                      type={showRegConfirmPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="login-input"
                      data-testid={REGISTER.passwordConfirmInput}
                      autoComplete="new-password"
                    />
                    <Lock size={16} className="input-icon-lead" />
                    <button
                      type="button"
                      className="password-eye-btn"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Terms Acceptance */}
                <label className="terms-checkbox-row">
                  <input
                    type="checkbox"
                    checked={regTermsAccepted}
                    onChange={(e) => setRegTermsAccepted(e.target.checked)}
                    required
                  />
                  <span>
                    I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{" "}
                    <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                  </span>
                </label>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={busy}
                  data-testid={REGISTER.submitButton}
                >
                  {busy ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>Creating Account…</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ═══════════════════════════════════════════════
              MODAL: Google OAuth Setup Guidance
             ═══════════════════════════════════════════════ */}
          {showGoogleModal && (
            <div
              className="auth-modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label="Google OAuth Configuration"
              tabIndex={-1}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowGoogleModal(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowGoogleModal(false);
              }}
            >
              <div className="auth-modal-card">
                <div className="auth-modal-header">
                  <div>
                    <h3>
                      <HelpCircle size={20} className="text-amber-400" /> Google OAuth Setup
                    </h3>
                    <p>Configuration instructions for production Google Sign-In</p>
                  </div>
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowGoogleModal(false)}
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
                <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, padding: "8px 0" }}>
                  <p style={{ margin: "0 0 12px 0" }}>
                    The backend Google OAuth validation endpoint is fully implemented at{" "}
                    <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                      /api/auth/google
                    </code>
                    .
                  </p>
                  <p style={{ margin: "0 0 12px 0" }}>
                    To enable live one-click Google popup authentication:
                  </p>
                  <ol style={{ paddingLeft: "20px", margin: "0 0 14px 0", color: "#94a3b8" }}>
                    <li>Obtain a Web Client ID from Google Cloud Console.</li>
                    <li>Add your domain / <code>http://localhost:3001</code> to Authorized JavaScript Origins.</li>
                    <li>
                      Set <code>GOOGLE_CLIENT_ID</code> in <code>backend/.env</code> and{" "}
                      <code>REACT_APP_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code>.
                    </li>
                  </ol>
                  <p style={{ margin: 0, color: "#f59e0b", fontSize: "12px" }}>
                    You can sign in or register immediately using standard email and password.
                  </p>
                </div>
                <button
                  type="button"
                  className="login-submit-btn"
                  style={{ marginTop: "16px" }}
                  onClick={() => setShowGoogleModal(false)}
                >
                  Understood
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              MODAL: Initial Password Setup for Showroom Owner
             ═══════════════════════════════════════════════ */}
          {showSetPasswordModal && (
            <div
              className="auth-modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label="Set Starting Owner Password"
              tabIndex={-1}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowSetPasswordModal(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowSetPasswordModal(false);
              }}
            >
              <div className="auth-modal-card">
                <div className="auth-modal-header">
                  <div>
                    <h3><KeyRound size={20} className="text-amber-400" /> Set Starting Owner Password</h3>
                    <p>Configure a custom security password for {setupEmail}</p>
                  </div>
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowSetPasswordModal(false)}
                    aria-label="Close setup modal"
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
                    <label htmlFor="setup-email-input" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Owner Email Address</label>
                    <input
                      id="setup-email-input"
                      type="email"
                      value={setupEmail}
                      disabled
                      className="login-input"
                      style={{ opacity: 0.7 }}
                    />
                  </div>

                  <div className="input-block" style={{ marginTop: "12px" }}>
                    <label htmlFor="setup-password-input" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>New Security Password</label>
                    <input
                      id="setup-password-input"
                      type="password"
                      required
                      placeholder="Enter minimum 4 characters"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      className="login-input"
                    />
                  </div>

                  <div className="input-block" style={{ marginTop: "12px" }}>
                    <label htmlFor="setup-confirm-input" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Confirm Security Password</label>
                    <input
                      id="setup-confirm-input"
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

          {/* ═══════════════════════════════════════════════
              MODAL: 3-Step Forgot Password & Email OTP Recovery
             ═══════════════════════════════════════════════ */}
          {showForgotModal && (
            <div
              className="auth-modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label="Reset Password via Email OTP"
              tabIndex={-1}
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowForgotModal(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowForgotModal(false);
              }}
            >
              <div className="auth-modal-card">
                <div className="auth-modal-header">
                  <div>
                    <h3><Mail size={20} className="text-amber-400" /> Password Recovery</h3>
                    <p>Server-side verified 6-digit OTP recovery</p>
                  </div>
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowForgotModal(false)}
                    aria-label="Close forgot password modal"
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

                {/* Step 1: Request OTP */}
                {otpStep === 1 && (
                  <form onSubmit={handleSendOtp}>
                    <div className="auth-step-pill">
                      <span>Step 1 of 3: Request Verification Code</span>
                    </div>
                    <div className="input-block">
                      <label htmlFor="otp-email-input" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Your Registered Email Address</label>
                      <input
                        id="otp-email-input"
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        className="login-input"
                        placeholder="yourname@example.com"
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

                {/* Step 2: Verify 6-Digit OTP */}
                {otpStep === 2 && (
                  <form onSubmit={handleVerifyOtp}>
                    <div className="auth-step-pill">
                      <span>Step 2 of 3: Enter 6-Digit Verification Code</span>
                    </div>

                    <div className="input-block">
                      <label htmlFor="otp-code-input" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                        6-Digit Verification Code (Sent to {otpEmail})
                      </label>
                      <input
                        id="otp-code-input"
                        type="text"
                        maxLength={6}
                        required
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="login-input auth-otp-input"
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      className="login-submit-btn"
                      style={{ marginTop: "20px" }}
                      disabled={otpBusy || otpCode.length !== 6}
                    >
                      {otpBusy ? "Verifying Code…" : "Verify Code"}
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep(1);
                          setOtpError("");
                          setOtpSuccess("");
                        }}
                        style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "11.5px", cursor: "pointer" }}
                      >
                        ← Change Email
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendCooldown > 0 || otpBusy}
                        style={{
                          background: "none",
                          border: "none",
                          color: resendCooldown > 0 ? "#64748b" : "#38bdf8",
                          fontSize: "11.5px",
                          cursor: resendCooldown > 0 ? "default" : "pointer",
                        }}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP Code"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Choose New Password */}
                {otpStep === 3 && (
                  <form onSubmit={handleResetPassword}>
                    <div className="auth-step-pill" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                      <span>Step 3 of 3: Code Verified — Choose New Password</span>
                    </div>

                    <div className="input-block">
                      <label htmlFor="otp-new-password-input" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>New Password</label>
                      <div className="input-field-wrapper">
                        <input
                          id="otp-new-password-input"
                          type={showNewPassword ? "text" : "password"}
                          required
                          placeholder="Minimum 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="login-input"
                        />
                        <button
                          type="button"
                          className="password-eye-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="input-block" style={{ marginTop: "14px" }}>
                      <label htmlFor="otp-confirm-password-input" style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>Confirm New Password</label>
                      <div className="input-field-wrapper">
                        <input
                          id="otp-confirm-password-input"
                          type={showConfirmNewPassword ? "text" : "password"}
                          required
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="login-input"
                        />
                        <button
                          type="button"
                          className="password-eye-btn"
                          onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="login-submit-btn"
                      style={{ marginTop: "20px" }}
                      disabled={otpBusy}
                    >
                      {otpBusy ? "Resetting Password…" : "Save New Password & Sign In"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Security Footer */}
          <div className="login-vault-footer">
            <span>
              <ShieldCheck size={14} color="#10b981" /> 256-Bit Encrypted
            </span>
            <span>·</span>
            <span>MongoDB Atlas Secured</span>
            <span>·</span>
            <span>Zero Plaintext Passwords</span>
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
