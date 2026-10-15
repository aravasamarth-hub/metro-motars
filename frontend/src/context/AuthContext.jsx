import React, { createContext, useContext, useState, useEffect } from "react";
import { authSetPassword, authSendOtp, authVerifyOtp, authLogin } from "@/metroApi";

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
    id: "agent-rajesh",
    name: "Rajesh Sharma",
    role: "Senior Sales Lead",
    roleKey: "AGENT",
    email: "rajesh@metromotors.in",
    avatar: "RS",
    branch: "Indiranagar Flagship",
    accessLevel: "Deals, Client Onboarding & Follow-ups",
    badgeColor: "#38bdf8",
    phone: "+91 98765 43210",
  },
  {
    id: "manager-priya",
    name: "Priya Nair",
    role: "Finance & Accounts Manager",
    roleKey: "MANAGER",
    email: "priya@metromotors.in",
    avatar: "PN",
    branch: "Central Accounts Desk",
    accessLevel: "Financial Ledgers & Maintenance Audit",
    badgeColor: "#a855f7",
    phone: "+91 98450 67890",
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
    } catch {}
  }, [user]);

  const isOwner = user?.roleKey === "OWNER" || user?.email === "aravasamarth@gmail.com";
  const isWorker = user?.roleKey === "WORKER" || user?.email === "samartharava@gmail.com";

  const permissions = {
    canViewPrices: isOwner,
    canViewAgentFinancials: isOwner,
    canViewPayments: isOwner,
    canViewBills: isOwner,
    canViewFinances: isOwner,
  };

  const setPassword = async (email, password) => {
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
  };

  const sendOtp = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(
      `mm_pending_otp_${cleanEmail}`,
      JSON.stringify({ code: generatedOtp, timestamp: Date.now() })
    );

    let activeOtp = generatedOtp;
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
  };

  const verifyOtpAndResetPassword = async (email, otp, newPassword) => {
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
    } catch (err) {
      // Check local storage fallback
      const saved = localStorage.getItem(`mm_pending_otp_${cleanEmail}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.code === otp.trim()) {
          verified = true;
        }
      }
    }

    if (!verified) {
      const saved = localStorage.getItem(`mm_pending_otp_${cleanEmail}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.code === otp.trim()) {
          verified = true;
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
  };

  const login = async ({ email, password, roleKey = "OWNER" }) => {
    setIsLoading(true);
    const cleanEmail = (email || "").trim().toLowerCase();

    try {
      // Check password if saved
      const savedPass = localStorage.getItem(`mm_password_${cleanEmail}`);
      if (savedPass && password && savedPass !== password) {
        throw new Error("Incorrect password. If you forgot your password, please reset it using Email OTP.");
      }

      try {
        await authLogin({ email: cleanEmail, password });
      } catch (err) {
        if (err.message && err.message.includes("Incorrect password")) {
          throw err;
        }
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
        },
        lastLogin: new Date().toISOString(),
      };

      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (personaId) => {
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
      },
      lastLogin: new Date().toISOString(),
    };
    setUser(loggedInUser);
    setIsLoading(false);
    return loggedInUser;
  };

  const biometricLogin = async (targetRoleKey = "OWNER") => {
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
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("mm_auth_user");
      localStorage.setItem("mm_logged_out", "true");
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isOwner,
        isWorker,
        permissions,
        login,
        quickLogin,
        biometricLogin,
        logout,
        setPassword,
        sendOtp,
        verifyOtpAndResetPassword,
        personas: SHOWROOM_ACCOUNTS,
        legacyPersonas: DEMO_PERSONAS,
      }}
    >
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

