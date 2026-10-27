import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, Check, ChevronDown, CircleDollarSign, LayoutDashboard, LogOut, Menu, Moon, Pencil, Plus, RefreshCw, Settings as SettingsIcon, ShieldCheck, Sparkles, Sun, Trash2, UserCheck, Zap } from "lucide-react";
import "@/App.css";
import "@/styles/luxury-design.css";
import "@/features/deals/deals.css";
import { dealRepository } from "@/data/dealRepository";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Lazy-loaded route chunks for optimal initial bundle size and rapid LCP
const FunctionalNewDeal = lazy(() => import("@/components/FunctionalNewDeal"));
const FunctionalDashboard = lazy(() => import("@/components/FunctionalDashboard"));
const FunctionalDeals = lazy(() => import("@/components/FunctionalDeals"));
const DealView = lazy(() => import("@/components/DealView"));
const FunctionalFinances = lazy(() => import("@/features/deals/LocalPreviewPages").then(m => ({ default: m.LocalFinances })));
const AgentsView = lazy(() => import("@/features/deals/AgentsView"));
const FollowUpsView = lazy(() => import("@/features/deals/FollowUpsView"));
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const MarketplacePage = lazy(() => import("@/features/marketplace/MarketplacePage"));
// Diagnostic route lazy-loaded only in development
const MotionDevTest = process.env.NODE_ENV !== "production"
  ? lazy(() => import("@/features/motion/MotionDevTest"))
  : null;

import { LanguageProvider, useLanguage } from "@/features/i18n/LanguageContext";
import { LanguageSwitcher } from "@/features/i18n/LanguageSwitcher";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

// 1. shadcn/ui
import { Badge } from "@/components/ui/badge";

// 2. KokonutUI
import FloatingPaths from "@/components/kokonut/BackgroundPaths";
import SpotlightCard from "@/components/kokonut/SpotlightCard";
import ParticleButton from "@/components/kokonut/ParticleButton";

// 3. Motion (motion.dev)
import { motion } from "motion/react";

// 4. Anime.js v4
import AnimePulseBeacon from "@/components/anime/AnimePulseBeacon";

// 5. Bklit data visualizations
import { InspectionRadialGauge } from "@/components/bklit/InspectionRadialGauge";

const navItems = [
  ["nav.dashboard", "Dashboard", "/dashboard", LayoutDashboard],
  ["nav.deals", "Deals", "/deals", BriefcaseBusiness],
  ["nav.new_deal", "New Deal", "/new-deal", Plus],
  ["nav.agents", "Agents", "/agents", UserCheck],
  ["nav.finances", "Finances", "/finances", CircleDollarSign],
  ["nav.follow_ups", "Follow-ups", "/follow-ups", CalendarDays],
  ["nav.settings", "Settings", "/settings", SettingsIcon],
];

function resolvePageName(pathname, t, currentNav) {
  if (currentNav) {
    return t(currentNav[0], currentNav[1]);
  }
  if (pathname.startsWith("/agents")) {
    return t("nav.agents", "Agents");
  }
  if (pathname.startsWith("/new-deal")) {
    return t("nav.new_deal", "New Deal");
  }
  if (pathname.startsWith("/deals")) {
    return t("nav.deals", "Deals");
  }
  return t("nav.dashboard", "Dashboard");
}

function AppShell({ children, dark, setDark }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isOwner } = useAuth();
  const [mobileNav, setMobileNav] = useState(false);

  const isPublicRoute =
    location.pathname === "/" ||
    location.pathname === "/bikes" ||
    location.pathname === "/login" ||
    location.pathname === "/portal" ||
    location.pathname === "/showcase";

  if (isPublicRoute) {
    return <div className={`marketplace-fullscreen-wrapper ${dark ? "theme-dark dark" : "theme-light"}`}>{children}</div>;
  }

  const visibleNavItems = navItems.filter(
    ([, , path]) => isOwner || (path !== "/agents" && path !== "/finances")
  );

  const currentNav = navItems.find(([, , path]) => path === location.pathname);
  const pageName = resolvePageName(location.pathname, t, currentNav);

  return (
    <div className={`app-shell ${dark ? "dark theme-dark" : "light theme-light"}`}>
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`} data-testid="sidebar">
        <div className="brand-lockup" data-testid="brand-lockup">
          <div className="brand-mark">MM</div>
          <div>
            <strong>METRO</strong>
            <strong>MOTORS</strong>
            <small>{t("brand.subtitle", "RESELLING SHOWROOM")}</small>
          </div>
        </div>
        <div className="sidebar-label">{t("nav.main_menu", "MAIN MENU")}</div>
        <nav className="main-nav" aria-label="Main navigation">
          {visibleNavItems.map(([key, label, path, Icon]) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMobileNav(false)}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon size={18} />
              <span>{t(key, label)}</span>
              {label === "New Deal" && <span className="nav-plus">+</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="support-card">
            <Zap size={17} />
            <div>
              <b>{t("nav.quick_actions", "Quick actions")}</b>
              <span>{t("nav.showroom_moving", "Keep your showroom moving.")}</span>
            </div>
          </div>
          <button
            type="button"
            className="logout-link"
            data-testid="logout-button"
            onClick={async () => {
              try {
                await logout();
                await navigate("/login");
              } catch (err) {
                console.error("Logout error", err);
                await navigate("/login").catch(() => {
                  window.location.href = "/login";
                });
              }
            }}
          >
            <LogOut size={17} /> {t("nav.logout", "Logout")}
          </button>
          <div className="version">
            Metro Motors <span>v1.0</span>
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileNav(false)}
          aria-label="Close menu"
          data-testid="mobile-menu-overlay"
        />
      )}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left-group">
            <button
              type="button"
              className="icon-button mobile-menu"
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
              data-testid="mobile-menu-button"
            >
              <Menu size={21} />
            </button>
            <button
              type="button"
              className="mobile-brand-mark"
              onClick={() => navigate("/")}
              title="Metro Motors Home"
              style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
            >
              <div className="mobile-brand-badge">MM</div>
              <div className="mobile-brand-text">
                <strong>METRO MOTORS</strong>
                <small>EXECUTIVE FLEET</small>
              </div>
            </button>
            <div className="breadcrumb">
              <span>Metro Motors</span>
              <span>/</span>
              <b>{pageName}</b>
            </div>
          </div>
          <div className="topbar-actions">
            <fieldset
              className="theme-toggle-switch"
              aria-label="Theme selector"
              data-testid="theme-toggle"
              style={{ border: 0, margin: 0, padding: 0 }}
            >
              <button
                type="button"
                className={`theme-switch-btn ${!dark ? "active" : ""}`}
                onClick={() => setDark(false)}
                data-testid="theme-toggle-light"
                aria-label="Switch to light mode"
                title="Light Mode (Bright & White)"
              >
                <Sun size={14} strokeWidth={2.2} className="theme-toggle-icon" />
                <span className="theme-label">{t("topbar.light", "Light")}</span>
              </button>
              <button
                type="button"
                className={`theme-switch-btn ${dark ? "active" : ""}`}
                onClick={() => setDark(true)}
                data-testid="theme-toggle-dark"
                aria-label="Switch to dark mode"
                title="Dark Mode"
              >
                <Moon size={14} strokeWidth={2.2} className="theme-toggle-icon" />
                <span className="theme-label">{t("topbar.dark", "Dark")}</span>
              </button>
            </fieldset>
            <LanguageSwitcher />
            <span
              className="owner-badge"
              data-testid="owner-badge"
              style={{
                backgroundColor: user?.badgeColor ? `${user.badgeColor}22` : undefined,
                color: user?.badgeColor || undefined,
                borderColor: user?.badgeColor ? `${user.badgeColor}55` : undefined,
              }}
            >
              {user?.roleKey || t("topbar.owner", "OWNER")}
            </span>
            <button
              type="button"
              className="user-chip"
              data-testid="user-area"
              onClick={() => navigate("/login")}
              style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}
              title="Showroom Account & Switch Persona"
            >
              <div
                className="avatar"
                style={{
                  backgroundColor: user?.badgeColor || "#d97706",
                  color: "#ffffff",
                }}
              >
                {user?.avatar || "AK"}
              </div>
              <div className="user-copy">
                <b>{user?.name || "Alex Kumar"}</b>
                <span>{user?.role || t("topbar.administrator", "Administrator")}</span>
              </div>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <div className="page-content">{children}</div>
        <MobileBottomNav />
      </main>
    </div>
  );
}

const PageHeader = ({ eyebrow, title, subtitle, action }) => <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1 data-testid="page-title">{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
const Button = ({ children, primary = false, onClick, icon, testid }) => <button className={`button ${primary ? "button-primary" : "button-secondary"}`} onClick={onClick} data-testid={testid || "action-button"}>{icon}{children}</button>;
const StatusPill = ({ children, tone = "green" }) => <span className={`status-pill ${tone}`} data-testid={`status-${String(children).toLowerCase().replaceAll(" ", "-")}`}>{children}</span>;
const SectionTitle = ({ title, action }) => <div className="section-title"><h2>{title}</h2>{action}</div>;

const FollowUps = FollowUpsView;

function Settings() {
  const { t } = useLanguage();
  const { isOwner, permissions } = useAuth();
  const [demoNotice, setDemoNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const reloadDemo = async () => {
    setBusy(true);
    setDemoNotice("");
    try {
      const reloaded = await dealRepository.resetDemoData();
      setDemoNotice(t("settings.demo_loaded_msg", `All ${reloaded.length} comprehensive demo deals, party details, agent tasks and verified photos reloaded!`));
      setTimeout(() => setDemoNotice(""), 6000);
    } catch (e) {
      setDemoNotice(e.message);
    } finally {
      setBusy(false);
    }
  };

  const clearData = async () => {
    if (!isOwner || !permissions?.canDeleteBills) return;
    if (!window.confirm("Are you sure you want to clear all deals from this browser?")) return;
    setBusy(true);
    setDemoNotice("");
    try {
      await dealRepository.clearAllData();
      setDemoNotice(t("settings.demo_cleared_msg", "All local deals cleared from this browser."));
      setTimeout(() => setDemoNotice(""), 6000);
    } catch (e) {
      setDemoNotice(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="settings-page-luxury"
    >
      {/* ── Luxury Preferences Hero (With KokonutUI FloatingPaths) ── */}
      <div className="luxury-hero-container relative mb-6">
        <FloatingPaths position={1} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <AnimePulseBeacon color="gold" size="sm" label="SHOWROOM ATELIER" />
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                Owner Profile: Alex Kumar
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                Verified Operator
              </Badge>
            </div>

            <h1 data-testid="page-title" className="text-2xl sm:text-3xl font-extrabold text-white font-manrope">
              {t("settings.title", "Settings")}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Showroom preferences, operator authentication, and local database storage management.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <ParticleButton
              onClick={reloadDemo}
              disabled={busy}
              data-testid="reload-demo-data-top-btn"
              className="luxury-particle-cta px-4 py-2.5 text-xs font-bold"
            >
              <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
              <span>{t("settings.reload_demo", "Reload Demo Data")}</span>
            </ParticleButton>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Account Profile Card */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className="p-6 border-neutral-800 bg-neutral-900/80 shadow-xl"
        >
          <SectionTitle title={t("settings.account", "Account Profile")} />
          <div className="profile-card luxury-profile-card">
            <div className="large-avatar luxury-avatar-large">AK</div>
            <div className="profile-info-block">
              <h3>Alex Kumar</h3>
              <p>alex@metromotors.in</p>
              <div className="profile-badge-row flex items-center gap-2 mt-1">
                <StatusPill tone="gold">{t("settings.owner", "Owner")}</StatusPill>
                <span className="verified-shield text-xs flex items-center gap-1 text-emerald-400">
                  <ShieldCheck size={14} />
                  Verified Operator
                </span>
              </div>
            </div>
            <button className="icon-button luxury-icon-btn" aria-label={t("settings.edit_profile", "Edit profile")} data-testid="edit-profile-button">
              <Pencil size={16} />
            </button>
          </div>
          <div className="settings-fields">
            <SettingField label={t("settings.full_name", "Full name")} value="Alex Kumar" />
            <SettingField label={t("settings.email_address", "Email address")} value="alex@metromotors.in" />
            <SettingField label={t("settings.role", "Role")} value={t("settings.owner", "Owner")} />
          </div>
        </SpotlightCard>

        {/* Active Sessions Card */}
        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.15)"
          className="p-6 border-neutral-800 bg-neutral-900/80 shadow-xl"
        >
          <SectionTitle
            title={t("settings.active_sessions", "Active Sessions")}
            action={<StatusPill tone="green">{t("settings.one_active", "1 active")}</StatusPill>}
          />
          <div className="session-row luxury-session-row">
            <div className="session-icon luxury-session-icon">
              <Zap size={18} />
            </div>
            <div className="session-details">
              <b>{t("settings.current_device", "Chrome on Windows")}</b>
              <span>{t("settings.current_location", "Bengaluru, India · Current session")}</span>
            </div>
            <span className="current-dot flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <i className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
              {t("settings.active_status", "Active")}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800">
            <SectionTitle title={t("settings.showroom", "Showroom Identity")} />
            <div className="settings-fields">
              <SettingField label={t("settings.showroom_name", "Showroom name")} value="Metro Motors" />
              <SettingField label={t("settings.currency", "Currency")} value={t("settings.currency_val", "Indian Rupee (₹)")} />
              <SettingField label={t("settings.date_format", "Date format")} value="DD MMM YYYY" />
            </div>
            <div className="mt-3">
              <ParticleButton
                testid="save-settings-button"
                className="luxury-particle-cta text-xs px-4 py-2"
              >
                <Check size={14} />
                <span>{t("settings.save_changes", "Save changes")}</span>
              </ParticleButton>
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* Database Vault & Demo Data Section with Bklit Gauge */}
      <SpotlightCard
        spotlightColor="rgba(245, 158, 11, 0.12)"
        className="p-6 md:p-8 border-neutral-800 bg-neutral-900/80 shadow-2xl mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <SectionTitle title={t("settings.demo_data_header", "Showroom Storage & Demo Fleet Data")} />
            <p className="demo-vault-text text-sm text-neutral-400 leading-relaxed mt-2">
              {t("settings.demo_data_desc", "Metro Motors comes pre-configured with 7 rich demo vehicle deals (Royal Enfield, KTM Duke, Yamaha MT-15, Honda Activa, Apache RTR, Kawasaki Ninja, and Hero Splendor) complete with vehicle specs, parties, witness details, agent transfers, payments, and verified photo documentation.")}
            </p>
            {demoNotice && (
              <output
                className="workflow-message mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs"
                data-testid="settings-demo-message"
                aria-live="polite"
              >
                <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
                <span>{demoNotice}</span>
              </output>
            )}
            <div className="demo-vault-actions flex gap-3 mt-5 flex-wrap">
              <ParticleButton
                onClick={reloadDemo}
                disabled={busy}
                data-testid="reload-demo-data-button"
                className="luxury-particle-cta px-4 py-2 text-xs font-bold"
              >
                <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
                <span>{t("settings.reload_demo", "Reload Complete Demo Details")}</span>
              </ParticleButton>
              {isOwner && permissions?.canDeleteBills && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors inline-flex items-center gap-2"
                  onClick={clearData}
                  disabled={busy}
                  data-testid="clear-all-data-button"
                >
                  <Trash2 size={14} />
                  <span>{t("settings.clear_all_data", "Clear All Records")}</span>
                </button>
              )}
            </div>
          </div>

          {/* 5. Bklit Database Integrity & Health Radial Gauge */}
          <div className="flex justify-center">
            <InspectionRadialGauge score={100} />
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

function SettingField({ label, value }) {
  return (
    <label className="setting-field luxury-setting-field">
      <span>{label}</span>
      <div>
        <span>{value}</span>
        <Pencil size={14} className="pencil-icon" />
      </div>
    </label>
  );
}

function LocalModeLabel() {
  const { t } = useLanguage();
  const location = useLocation();
  const [reloading, setReloading] = useState(false);

  const isPublic =
    location.pathname === "/" ||
    location.pathname === "/bikes" ||
    location.pathname === "/login" ||
    location.pathname === "/portal" ||
    location.pathname === "/showcase";
  if (isPublic) return null;

  const handleReload = async () => {
    setReloading(true);
    try {
      await dealRepository.resetDemoData();
    } finally {
      setReloading(false);
    }
  };
  return (
    <div className="local-mode-banner" data-testid="browser-local-mode">
      <div className="local-mode-info">
        <span className="local-mode-pulse" />
        <span className="local-mode-text">{t("common.browser_local_mode", "Browser-local preview · No cloud sync")}</span>
      </div>
      <button
        type="button"
        onClick={handleReload}
        disabled={reloading}
        className="local-mode-reload-btn"
        data-testid="quick-reload-demo"
        title="Reload all demo details"
      >
        <RefreshCw size={12} className={reloading ? "animate-spin" : ""}/>
        <span>{reloading ? t("common.reloading", "Reloading…") : t("common.reload_demo", "Reload Demo Data")}</span>
      </button>
    </div>
  );
}

function App() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("mm_theme");
      return saved !== null ? saved === "dark" : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("mm_theme", dark ? "dark" : "light");
    } catch {
      // Storage quota exceeded or disabled in private mode
    }
    if (dark) {
      document.documentElement.classList.add("dark", "theme-dark");
      document.documentElement.classList.remove("light", "theme-light");
      document.body.classList.add("dark", "theme-dark");
      document.body.classList.remove("light", "theme-light");
    } else {
      document.documentElement.classList.remove("dark", "theme-dark");
      document.documentElement.classList.add("light", "theme-light");
      document.body.classList.remove("dark", "theme-dark");
      document.body.classList.add("light", "theme-light");
    }
  }, [dark]);

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppShell dark={dark} setDark={setDark}>
            <LocalModeLabel />
            <Suspense fallback={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "16px" }}>
                <div style={{ width: "36px", height: "36px", border: "3px solid rgba(245, 158, 11, 0.2)", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.5px" }}>Loading Showroom Atelier…</span>
              </div>
            }>
              <Routes>
                {/* Customer-Facing Public Motorcycle Marketplace */}
                <Route path="/" element={<MarketplacePage dark={dark} setDark={setDark} />} />
                <Route path="/bikes" element={<MarketplacePage dark={dark} setDark={setDark} />} />
                <Route path="/portal" element={<MarketplacePage dark={dark} setDark={setDark} />} />
                <Route path="/showcase" element={<MarketplacePage dark={dark} setDark={setDark} />} />

                {/* Showroom Staff & Management Console */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/console" element={<FunctionalDashboard />} />
                <Route path="/dashboard" element={<FunctionalDashboard />} />
                <Route path="/deals" element={<FunctionalDeals />} />
                <Route path="/deals/:dealId" element={<DealView />} />
                <Route path="/bills" element={<Navigate to="/deals" replace />} />
                <Route path="/new-deal" element={<FunctionalNewDeal />} />
                <Route path="/new-deal/:dealId" element={<FunctionalNewDeal />} />
                <Route path="/agents" element={<AgentsView />} />
                <Route path="/agents/:agentName" element={<AgentsView />} />
                <Route path="/finances" element={<FunctionalFinances />} />
                <Route path="/follow-ups" element={<FollowUps />} />
                <Route path="/settings" element={<Settings />} />
                {process.env.NODE_ENV !== "production" && MotionDevTest && (
                  <Route path="/motion-test" element={<MotionDevTest />} />
                )}
                <Route path="*" element={<MarketplacePage dark={dark} setDark={setDark} />} />
              </Routes>
            </Suspense>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
export default App;
