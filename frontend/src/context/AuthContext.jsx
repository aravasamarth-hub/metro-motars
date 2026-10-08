import React, { createContext, useContext, useState, useEffect } from "react";

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
    phone: "+91 98800 12345"
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
    phone: "+91 98765 43210"
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
    phone: "+91 98450 67890"
  }
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const isLoggedOut = localStorage.getItem("mm_logged_out") === "true";
      if (isLoggedOut) return null;
      const savedUser = localStorage.getItem("mm_auth_user");
      if (savedUser) return JSON.parse(savedUser);
      // Default to owner persona if never explicitly logged out
      return DEMO_PERSONAS[0];
    } catch {
      return DEMO_PERSONAS[0];
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

  const login = async ({ email, password, roleKey = "OWNER" }) => {
    setIsLoading(true);
    // Simulate high-performance enterprise token handshake
    await new Promise((r) => setTimeout(r, 650));
    
    // Check if matches one of the known demo personas
    const matched = DEMO_PERSONAS.find(
      (p) => p.email.toLowerCase() === (email || "").toLowerCase()
    ) || DEMO_PERSONAS.find((p) => p.roleKey === roleKey) || DEMO_PERSONAS[0];

    const loggedInUser = {
      ...matched,
      email: email || matched.email,
      lastLogin: new Date().toISOString()
    };

    setUser(loggedInUser);
    setIsLoading(false);
    return loggedInUser;
  };

  const quickLogin = async (personaId) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const persona = DEMO_PERSONAS.find((p) => p.id === personaId) || DEMO_PERSONAS[0];
    const loggedInUser = {
      ...persona,
      lastLogin: new Date().toISOString()
    };
    setUser(loggedInUser);
    setIsLoading(false);
    return loggedInUser;
  };

  const biometricLogin = async (targetRoleKey = "OWNER") => {
    setIsLoading(true);
    // Simulating optical sensor handshake & minutiae template verification
    await new Promise((r) => setTimeout(r, 1100));
    const persona = DEMO_PERSONAS.find((p) => p.roleKey === targetRoleKey) || DEMO_PERSONAS[0];
    const loggedInUser = {
      ...persona,
      lastLogin: new Date().toISOString(),
      authMethod: "BIOMETRIC_SENSOR"
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
        login,
        quickLogin,
        biometricLogin,
        logout,
        personas: DEMO_PERSONAS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
