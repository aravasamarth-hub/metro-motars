import { useState, useEffect } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Bike, BriefcaseBusiness, CalendarDays, Camera, Check, ChevronDown, CircleDollarSign, ClipboardList, Clock, CreditCard, LayoutDashboard, LogOut, Menu, MoreHorizontal, Moon, Pencil, Phone, Plus, Printer, RefreshCw, Search, Settings as SettingsIcon, ShieldCheck, Sparkles, Sun, Trash2, UserCheck, UsersRound, WalletCards, X, Zap } from "lucide-react";
import "@/App.css";
import "@/styles/luxury-design.css";
import FunctionalNewDeal from "@/components/FunctionalNewDeal";
import FunctionalDashboard from "@/components/FunctionalDashboard";
import FunctionalDeals from "@/components/FunctionalDeals";
import DealView from "@/components/DealView";
import { LocalFinances as FunctionalFinances } from "@/features/deals/LocalPreviewPages";
import "@/features/deals/deals.css";
import { dealRepository } from "@/data/dealRepository";
import AgentsView from "@/features/deals/AgentsView";
import FollowUpsView from "@/features/deals/FollowUpsView";
import LoginPage from "@/features/auth/LoginPage";
import ShowcasePage from "@/features/showcase/ShowcasePage";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import { LanguageProvider, useLanguage } from "@/features/i18n/LanguageContext";
import { LanguageSwitcher } from "@/features/i18n/LanguageSwitcher";

// 1. shadcn/ui
import { Badge } from "@/components/ui/badge";

// 2. KokonutUI
import FloatingPaths from "@/components/kokonut/BackgroundPaths";
import SpotlightCard from "@/components/kokonut/SpotlightCard";
import ParticleButton from "@/components/kokonut/ParticleButton";

// 3. Motion (motion.dev)
import { motion } from "motion/react";
import { MotionCounter } from "@/components/motion/MotionCounter";

// 4. Anime.js v4
import AnimePulseBeacon from "@/components/anime/AnimePulseBeacon";

// 5. Bklit data visualizations
import { InspectionRadialGauge } from "@/components/bklit/InspectionRadialGauge";

const navItems = [
  ["nav.dashboard", "Dashboard", "/", LayoutDashboard],
  ["nav.deals", "Deals", "/deals", BriefcaseBusiness],
  ["nav.new_deal", "New Deal", "/new-deal", Plus],
  ["nav.agents", "Agents", "/agents", UserCheck],
  ["nav.finances", "Finances", "/finances", CircleDollarSign],
  ["nav.follow_ups", "Follow-ups", "/follow-ups", CalendarDays],
  ["nav.settings", "Settings", "/settings", SettingsIcon],
];

function AppShell({ children, dark, setDark }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isOwner } = useAuth();
  const [mobileNav, setMobileNav] = useState(false);

  if (location.pathname === "/login" || location.pathname === "/portal" || location.pathname === "/showcase") {
    return <div className={`showcase-fullscreen-wrapper ${dark ? "theme-dark dark" : "theme-light"}`}>{children}</div>;
  }

  const visibleNavItems = navItems.filter(([, , path]) => {
    if (!isOwner && (path === "/agents" || path === "/finances")) return false;
    return true;
  });

  const currentNav = navItems.find(([, , path]) => path === location.pathname);
  const pageName = currentNav
    ? t(currentNav[0], currentNav[1])
    : location.pathname.startsWith("/agents")
    ? t("nav.agents", "Agents")
    : location.pathname.startsWith("/new-deal")
    ? t("nav.new_deal", "New Deal")
    : location.pathname.startsWith("/deals")
    ? t("nav.deals", "Deals")
    : t("nav.dashboard", "Dashboard");

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
          <button
            type="button"
            className="sidebar-vip-pill"
            onClick={() => navigate("/showcase")}
            title="Open 5-Library VIP Automotive Showcase"
            data-testid="sidebar-vip-showcase"
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} className="text-amber-400" />
              <span>VIP Showcase</span>
            </span>
            <span style={{ fontSize: "10px", background: "rgba(245, 158, 11, 0.2)", padding: "1px 6px", borderRadius: "4px" }}>5 Libs</span>
          </button>
          <div className="support-card">
            <Zap size={17} />
            <div>
              <b>{t("nav.quick_actions", "Quick actions")}</b>
              <span>{t("nav.showroom_moving", "Keep your showroom moving.")}</span>
            </div>
          </div>
          <button
            className="logout-link"
            data-testid="logout-button"
            onClick={() => {
              logout();
              navigate("/login");
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
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
            data-testid="mobile-menu-button"
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            <span>Metro Motors</span>
            <span>/</span>
            <b>{pageName}</b>
          </div>
          <div className="topbar-actions">
            <div className="theme-toggle-switch" role="group" aria-label="Theme selector" data-testid="theme-toggle">
              <button
                type="button"
                className={`theme-switch-btn ${!dark ? "active" : ""}`}
                onClick={() => setDark(false)}
                data-testid="theme-toggle-light"
                aria-label="Switch to light mode"
                title="Light Mode (Bright & White)"
              >
                <Sun size={14} strokeWidth={2.2} className="theme-toggle-icon" />
                <span>{t("topbar.light", "Light")}</span>
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
                <span>{t("topbar.dark", "Dark")}</span>
              </button>
            </div>
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
            <div
              className="user-chip"
              data-testid="user-area"
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer" }}
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
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
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
  const [demoNotice, setDemoNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const reloadDemo = async () => {
    setBusy(true);
    setDemoNotice("");
    try {
      await dealRepository.resetDemoData();
      setDemoNotice(t("settings.demo_loaded_msg", "All 7 comprehensive demo deals, party details, agent tasks and verified photos reloaded!"));
      setTimeout(() => setDemoNotice(""), 6000);
    } catch (e) {
      setDemoNotice(e.message);
    } finally {
      setBusy(false);
    }
  };

  const clearData = async () => {
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
              <div className="workflow-message mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs" role="status" data-testid="settings-demo-message">
                <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
                <span>{demoNotice}</span>
              </div>
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

  if (location.pathname === "/login" || location.pathname === "/portal" || location.pathname === "/showcase") return null;

  const handleReload = async () => {
    setReloading(true);
    try {
      await dealRepository.resetDemoData();
    } finally {
      setReloading(false);
    }
  };
  return (
    <div className="local-mode-label" data-testid="browser-local-mode" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
      <span>{t("common.browser_local_mode", "Browser-local preview · No cloud sync")}</span>
      <button
        type="button"
        onClick={handleReload}
        disabled={reloading}
        className="text-button"
        style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", background: "rgba(217, 119, 6, 0.15)", borderRadius: "4px", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
        data-testid="quick-reload-demo"
        title="Reload all demo details"
      >
        <RefreshCw size={12} className={reloading ? "animate-spin" : ""}/>
        {reloading ? t("common.reloading", "Reloading…") : t("common.reload_demo", "Reload Demo Data")}
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
    } catch {}
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
            <Routes>
              <Route path="/portal" element={<ShowcasePage dark={dark} setDark={setDark} />} />
              <Route path="/showcase" element={<ShowcasePage dark={dark} setDark={setDark} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<FunctionalDashboard />} />
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
              <Route path="*" element={<FunctionalDashboard />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
export default App;
