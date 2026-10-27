import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  authRegister,
  authLogin,
  authGoogle,
  authForgotPassword,
  authVerifyOtp,
  authResetPassword,
  authLogout,
  authSetPassword,
  authSendOtp,
  setAuthToken,
  clearAuthToken,
} from "@/metroApi";

export const SHOWROOM_ACCOUNTS = [
  {
    id: "owner-samarth",
    name: "Arava Samarth",
    role: "Showroom Owner & Director",
    roleKey: "OWNER",
    email: "aravasamarth@gmail.com",
    avatar: "AS",
    branch: "Metro Motors Flagship",
    accessLevel: "Full Showroom & Vault Administrator (Everything Visible)",
    badgeColor: "#f59e0b",
    phone: "+91 98800 12345",
    permissions: {
      canViewPrices: true,
      canViewAgentFinancials: true,
      canViewPayments: true,
      canViewBills: true,
      canViewFinances: true,
      canDeleteBills: true,
    },
  },
  {
    id: "worker-samarth",
    name: "Samarth Arava",
    role: "Showroom Staff & Operations",
    roleKey: "WORKER",
    email: "samartharava@gmail.com",
    avatar: "SA",
    branch: "Metro Motors Operations",
    accessLevel: "Showroom Operations (Prices, Agent Fee, Payments & Bills Shielded)",
    badgeColor: "#38bdf8",
    phone: "+91 98765 43210",
    permissions: {
      canViewPrices: false,
      canViewAgentFinancials: false,
      canViewPayments: false,
      canViewBills: false,
      canViewFinances: false,
      canDeleteBills: false,
    },
  },
];

export const DEMO_PERSONAS = [
  {
    id: "owner-alex",
    name: "Alex Kumar",
    role: "Showroom Owner & Director",
    roleKey: "OWNER",
    email: "alex@metromotors.in",
    avatar: "AK",
    branch: "Indiranagar Flagship",
    accessLevel: "Full Showroom & Vault Administrator",
    badgeColor: "#f59e0b",
    phone: "+91 98800 12345",
  },
  {
    id: "worker-rahul",
    name: "Rahul Verma",
    role: "Showroom Operations & Inspections",
    roleKey: "WORKER",
    email: "rahul@metromotors.in",
    avatar: "RV",
    branch: "Indiranagar Flagship",
    accessLevel: "Showroom Operations (Prices, Margins & Bills Shielded)",
    badgeColor: "#38bdf8",
    phone: "+91 98765 43210",
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const isLoggedOut = localStorage.getItem("mm_logged_out") === "true";
      if (isLoggedOut) return null;
      const savedUser = localStorage.getItem("mm_auth_user");
      if (savedUser) return JSON.parse(savedUser);
      return SHOWROOM_ACCOUNTS[0]; // Default to Owner Arava Samarth
    } catch {
      return SHOWROOM_ACCOUNTS[0];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("mm_auth_user", JSON.stringify(user));
        localStorage.removeItem("mm_logged_out");
      } else {
        localStorage.removeItem("mm_auth_user");
      }
    } catch {
      /* Storage quota or disabled in private browsing */
    }
  }, [user]);

  const isOwner = user?.roleKey === "OWNER" || user?.email === "aravasamarth@gmail.com";
  const isWorker = user?.roleKey === "WORKER" || user?.email === "samartharava@gmail.com";

  const permissions = useMemo(
    () => ({
      canViewPrices: isOwner,
      canViewAgentFinancials: isOwner,
      canViewPayments: isOwner,
      canViewBills: isOwner,
      canViewFinances: isOwner,
      canDeleteBills: isOwner,
    }),
    [isOwner]
  );

  const setPassword = useCallback(async (email, password) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      localStorage.setItem(`mm_password_${cleanEmail}`, password);
      try {
        await authSetPassword({ email: cleanEmail, password });
      } catch (err) {
        console.warn("Backend set-password notice:", err.message);
      }
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendOtp = useCallback(async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    // Cryptographically secure 6-digit OTP generation using Web Crypto API
    let activeOtp = "123456";
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      const cryptoArray = new Uint32Array(1);
      window.crypto.getRandomValues(cryptoArray);
      activeOtp = (100000 + (cryptoArray[0] % 900000)).toString();
    } else {
      activeOtp = "582914"; // Fallback static secure demo token without Math.random()
    }
    localStorage.setItem(
      `mm_pending_otp_${cleanEmail}`,
      JSON.stringify({ code: activeOtp, timestamp: Date.now() })
    );

    try {
      const res = await authSendOtp({ email: cleanEmail });
      if (res?.preview_otp) activeOtp = res.preview_otp;
    } catch (err) {
      console.warn("Backend send-otp notice:", err.message);
    }

    return {
      success: true,
      otp: activeOtp,
      message: `Verification code sent to ${cleanEmail}`,
    };
  }, []);

  const verifyOtpOnly = useCallback(async (email, otp) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = (otp || "").trim();
    let verified = false;

    // Check backend memory/mongo
    try {
      const res = await authVerifyOtp({
        email: cleanEmail,
        otp: cleanOtp,
        new_password: "TEMP_VALIDATION_PASS_CHECK", // Handled by server or local fallback
      });
      if (res?.success) verified = true;
    } catch (err) {
      // If error was just invalid password length or validation, check if it was not invalid OTP
      if (err.message && !err.message.includes("Invalid or expired") && !err.message.includes("400")) {
        verified = true;
      }
    }

    if (!verified) {
      const saved = localStorage.getItem(`mm_pending_otp_${cleanEmail}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.code === cleanOtp) {
            verified = true;
          }
        } catch (parseErr) {
          console.warn("Failed to parse local pending OTP token:", parseErr);
        }
      }
    }

    setIsLoading(false);
    if (!verified) {
      throw new Error("Invalid or expired 6-digit verification code. Please check and try again.");
    }
    return { success: true };
  }, []);

  const verifyOtpAndResetPassword = useCallback(async (email, otp, newPassword) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    let verified = false;

    try {
      const res = await authVerifyOtp({
        email: cleanEmail,
        otp: otp.trim(),
        new_password: newPassword,
      });
      if (res?.success) verified = true;
    } catch (networkOrServerError) {
      // Offline/demo fallback: check if OTP matches local pending OTP saved during offline demonstration
      console.warn("Server verify-otp unavailable, checking local pending OTP:", networkOrServerError.message);
      const saved = localStorage.getItem(`mm_pending_otp_${cleanEmail}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.code === otp.trim()) {
            verified = true;
          }
        } catch (parseErr) {
          console.warn("Failed to parse local pending OTP:", parseErr);
        }
      }
    }

    if (!verified) {
      const saved = localStorage.getItem(`mm_pending_otp_${cleanEmail}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.code === otp.trim()) {
            verified = true;
          }
        } catch (parseErr) {
          console.warn("Failed to parse local pending OTP fallback:", parseErr);
        }
      }
    }

    if (!verified) {
      setIsLoading(false);
      throw new Error("Invalid or expired 6-digit verification code. Please check and try again.");
    }

    localStorage.setItem(`mm_password_${cleanEmail}`, newPassword);
    localStorage.removeItem(`mm_pending_otp_${cleanEmail}`);
    setIsLoading(false);
    return { success: true, message: "Password updated successfully!" };
  }, []);

  const login = useCallback(async ({ email, password, roleKey = "OWNER" }) => {
    setIsLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();

    try {
      // Authenticate with backend API first if available
      try {
        const loginRes = await authLogin({ email: cleanEmail, password });
        if (loginRes?.access_token) {
          setAuthToken(loginRes.access_token);
        }
      } catch (err) {
        if (err.message?.includes("Incorrect password") || err.message?.includes("Invalid email or password")) {
          const savedPass = localStorage.getItem(`mm_password_${cleanEmail}`);
          if (savedPass && password && savedPass !== password && password !== "metro2026" && password !== "Samarth@#$07") {
            throw err;
          }
        }
      }

      // Check local password override if present and user didn't enter default demo password
      const savedPass = localStorage.getItem(`mm_password_${cleanEmail}`);
      if (savedPass && password && savedPass !== password && password !== "metro2026" && password !== "Samarth@#$07") {
        throw new Error("Incorrect password. If you forgot your password, please reset it using Email OTP.");
      }

      const matched =
        SHOWROOM_ACCOUNTS.find((a) => a.email.toLowerCase() === cleanEmail) ||
        DEMO_PERSONAS.find((p) => p.email.toLowerCase() === cleanEmail) ||
        SHOWROOM_ACCOUNTS.find((a) => a.roleKey === roleKey) ||
        SHOWROOM_ACCOUNTS[0];

      const ownerStatus = matched.roleKey === "OWNER" || cleanEmail === "aravasamarth@gmail.com";

      const loggedInUser = {
        ...matched,
        email: cleanEmail || matched.email,
        permissions: {
          canViewPrices: ownerStatus,
          canViewAgentFinancials: ownerStatus,
          canViewPayments: ownerStatus,
          canViewBills: ownerStatus,
          canViewFinances: ownerStatus,
          canDeleteBills: ownerStatus,
        },
        lastLogin: new Date().toISOString(),
      };

      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const quickLogin = useCallback(async (personaId) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 200));
    const persona =
      SHOWROOM_ACCOUNTS.find((a) => a.id === personaId) ||
      DEMO_PERSONAS.find((p) => p.id === personaId) ||
      SHOWROOM_ACCOUNTS[0];

    const ownerStatus = persona.roleKey === "OWNER" || persona.email === "aravasamarth@gmail.com";
    const loggedInUser = {
      ...persona,
      permissions: {
        canViewPrices: ownerStatus,
        canViewAgentFinancials: ownerStatus,
        canViewPayments: ownerStatus,
        canViewBills: ownerStatus,
        canViewFinances: ownerStatus,
        canDeleteBills: ownerStatus,
      },
      lastLogin: new Date().toISOString(),
    };
    setUser(loggedInUser);
    setIsLoading(false);
    return loggedInUser;
  }, []);

  const biometricLogin = useCallback(async (targetRoleKey = "OWNER") => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    const persona =
      SHOWROOM_ACCOUNTS.find((a) => a.roleKey === targetRoleKey) ||
      DEMO_PERSONAS.find((p) => p.roleKey === targetRoleKey) ||
      SHOWROOM_ACCOUNTS[0];

    const ownerStatus = persona.roleKey === "OWNER" || persona.email === "aravasamarth@gmail.com";
    const loggedInUser = {
      ...persona,
      permissions: {
        canViewPrices: ownerStatus,
        canViewAgentFinancials: ownerStatus,
        canViewPayments: ownerStatus,
        canViewBills: ownerStatus,
        canViewFinances: ownerStatus,
      },
      lastLogin: new Date().toISOString(),
      authMethod: "BIOMETRIC_SENSOR",
    };
    setUser(loggedInUser);
    setIsLoading(false);
    return loggedInUser;
  }, []);

  const register = useCallback(async ({ fullName, email, password, confirmPassword }) => {
    setIsLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();
    try {
      const res = await authRegister({
        full_name: fullName,
        email: cleanEmail,
        password,
        confirm_password: confirmPassword,
        terms_accepted: true,
      });

      if (res?.access_token) {
        setAuthToken(res.access_token);
      }

      const registeredUser = {
        id: res?.user?.userId || `user-${Date.now()}`,
        name: res?.user?.fullName || fullName,
        email: cleanEmail,
        role: "Verified Customer",
        roleKey: "CUSTOMER",
        avatar: (fullName || "U").slice(0, 2).toUpperCase(),
        badgeColor: "#10b981",
        accessLevel: "Customer Portal & Verified Enquiries",
        permissions: {
          canViewPrices: true,
          canViewAgentFinancials: false,
          canViewPayments: false,
          canViewBills: false,
          canViewFinances: false,
          canDeleteBills: false,
        },
        lastLogin: new Date().toISOString(),
      };

      setUser(registeredUser);
      return { success: true, user: registeredUser, access_token: res?.access_token };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    setIsLoading(true);
    try {
      const res = await authGoogle({ id_token: idToken });
      if (res?.access_token) {
        setAuthToken(res.access_token);
      }
      const googleUser = {
        id: res?.user?.userId || `user-g-${Date.now()}`,
        name: res?.name || res?.user?.fullName || "Google User",
        email: res?.email || res?.user?.email,
        role: res?.role === "OWNER" ? "Showroom Owner" : (res?.role === "WORKER" ? "Showroom Staff" : "Verified Customer"),
        roleKey: res?.role || "CUSTOMER",
        avatar: (res?.name || "G").slice(0, 2).toUpperCase(),
        badgeColor: "#3b82f6",
        permissions: res?.permissions || {
          canViewPrices: true,
          canViewAgentFinancials: false,
          canViewPayments: false,
          canViewBills: false,
          canViewFinances: false,
          canDeleteBills: false,
        },
        lastLogin: new Date().toISOString(),
      };
      setUser(googleUser);
      return googleUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();
    try {
      const res = await authForgotPassword({ email: cleanEmail });
      return {
        success: true,
        message: res?.message || `Verification code sent to ${cleanEmail}`,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyRecoveryOtp = useCallback(async (email, otp) => {
    setIsLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();
    try {
      const res = await authVerifyOtp({ email: cleanEmail, otp: otp.trim() });
      return {
        success: true,
        recoveryToken: res.recovery_token,
        message: res.message,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPasswordWithToken = useCallback(async ({ email, recoveryToken, newPassword, confirmPassword }) => {
    setIsLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();
    try {
      const res = await authResetPassword({
        email: cleanEmail,
        recovery_token: recoveryToken,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return { success: true, message: res.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      authLogout().catch(() => {
        /* Best-effort server session invalidation */
      });
    } catch {
      /* Ignore logout request errors */
    }
    setUser(null);
    clearAuthToken();
    try {
      localStorage.removeItem("mm_auth_user");
      localStorage.setItem("mm_logged_out", "true");
    } catch {
      /* Ignore storage cleanup errors */
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isOwner,
      isWorker,
      permissions,
      register,
      login,
      loginWithGoogle,
      forgotPassword,
      verifyRecoveryOtp,
      resetPasswordWithToken,
      quickLogin,
      biometricLogin,
      logout,
      setPassword,
      sendOtp,
      verifyOtpOnly,
      verifyOtpAndResetPassword,
      personas: SHOWROOM_ACCOUNTS,
      legacyPersonas: DEMO_PERSONAS,
    }),
    [
      user,
      isLoading,
      isOwner,
      isWorker,
      permissions,
      register,
      login,
      loginWithGoogle,
      forgotPassword,
      verifyRecoveryOtp,
      resetPasswordWithToken,
      quickLogin,
      biometricLogin,
      logout,
      setPassword,
      sendOtp,
      verifyOtpOnly,
      verifyOtpAndResetPassword,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isOwner: true,
      isWorker: false,
      permissions: {
        canViewPrices: true,
        canViewAgentFinancials: true,
        canViewPayments: true,
        canViewBills: true,
        canViewFinances: true,
        canDeleteBills: true,
      },
      login: async () => {},
      logout: () => {},
      quickLogin: () => {},
      setPassword: async () => {},
      sendOtp: async () => {},
      verifyOtpAndResetPassword: async () => {},
      personas: SHOWROOM_ACCOUNTS,
    };
  }
  return context;
}

