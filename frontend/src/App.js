import { useState, useEffect } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Bike, BriefcaseBusiness, CalendarDays, Camera, Check, ChevronDown, CircleDollarSign, ClipboardList, Clock, CreditCard, LayoutDashboard, LogOut, Menu, MoreHorizontal, Moon, Pencil, Phone, Plus, Printer, RefreshCw, Search, Settings as SettingsIcon, ShieldCheck, Sun, Trash2, UsersRound, WalletCards, X, Zap } from "lucide-react";
import "@/App.css";
import FunctionalNewDeal from "@/components/FunctionalNewDeal";
import FunctionalDashboard from "@/components/FunctionalDashboard";
import FunctionalDeals from "@/components/FunctionalDeals";
import DealView from "@/components/DealView";
import { LocalFinances as FunctionalFinances } from "@/features/deals/LocalPreviewPages";
import "@/features/deals/deals.css";
import { dealRepository } from "@/data/dealRepository";

import { LanguageProvider, useLanguage } from "@/features/i18n/LanguageContext";
import { LanguageSwitcher } from "@/features/i18n/LanguageSwitcher";

const navItems = [
  ["nav.dashboard", "Dashboard", "/", LayoutDashboard],
  ["nav.deals", "Deals", "/deals", BriefcaseBusiness],
  ["nav.new_deal", "New Deal", "/new-deal", Plus],
  ["nav.finances", "Finances", "/finances", CircleDollarSign],
  ["nav.follow_ups", "Follow-ups", "/follow-ups", CalendarDays],
  ["nav.settings", "Settings", "/settings", SettingsIcon],
];

function AppShell({ children, dark, setDark }) {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const currentNav = navItems.find(([, , path]) => path === location.pathname);
  const pageName = currentNav
    ? t(currentNav[0], currentNav[1])
    : location.pathname.startsWith("/new-deal")
    ? t("nav.new_deal", "New Deal")
    : location.pathname.startsWith("/deals")
    ? t("nav.deals", "Deals")
    : t("nav.dashboard", "Dashboard");

  return (
    <div className={`app-shell ${dark ? "theme-dark" : "theme-light"}`}>
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
          {navItems.map(([key, label, path, Icon]) => (
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
          <button className="logout-link" data-testid="logout-button">
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
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setDark(!dark)}
              data-testid="theme-toggle"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? (
                <>
                  <Sun size={15} strokeWidth={2.2} className="theme-toggle-icon" />
                  <span>{t("topbar.light", "Light")}</span>
                </>
              ) : (
                <>
                  <Moon size={15} strokeWidth={2.2} className="theme-toggle-icon" />
                  <span>{t("topbar.dark", "Dark")}</span>
                </>
              )}
            </button>
            <LanguageSwitcher />
            <span className="owner-badge" data-testid="owner-badge">
              {t("topbar.owner", "OWNER")}
            </span>
            <div className="user-chip" data-testid="user-area">
              <div className="avatar">AK</div>
              <div className="user-copy">
                <b>Alex Kumar</b>
                <span>{t("topbar.administrator", "Administrator")}</span>
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

function FollowUps() {
  const { t } = useLanguage();
  const followups = [
    ["Chirag Hegde", "+91 97412 83746", "Buyer", "Yamaha MT-15 V2", "₹1,10,000", "Today"],
    ["Naveen Reddy", "+91 97390 19283", "Buyer", "TVS Apache RTR 200", "₹85,000", "Today"],
    ["Arjun N. Mehta", "+91 98201 23456", "Seller", "KTM Duke 390", "NOC Collect", "Tomorrow"],
    ["Aditya Mohan", "+91 99008 81122", "Buyer", "Royal Enfield Classic 350", "RC Dispatch", "08 Oct 2026"],
    ["Tanmay Bhatia", "+91 99887 76655", "Buyer", "Kawasaki Ninja 300", "Service Due", "15 Oct 2026"],
  ];
  return (
    <div className="followups-page-luxury">
      <div className="page-header followups-luxury-header">
        <div>
          <div className="eyebrow followups-eyebrow">
            <span className="eyebrow-beacon" />
            <span>{t("followups.eyebrow", "CUSTOMER RELATIONSHIPS · ACTIVE PIPELINE")}</span>
          </div>
          <h1 data-testid="page-title" className="followups-hero-title">
            {t("followups.title", "Follow-ups")}
          </h1>
          <p className="followups-hero-subtitle">
            {t("followups.subtitle", "Stay on top of every customer conversation, balance collection and RTO delivery.")}
          </p>
        </div>
        <Button
          primary
          icon={<Plus size={18} strokeWidth={2.4} />}
          testid="add-follow-up-button"
        >
          {t("followups.add_button", "Add follow-up")}
        </Button>
      </div>

      {/* CRM Urgency Metrics Strip */}
      <div className="crm-urgency-strip">
        <div className="crm-urgency-pill crm-urgent">
          <Clock size={13} />
          <span>2 Due Today & Overdue</span>
        </div>
        <div className="crm-urgency-pill crm-upcoming">
          <CalendarDays size={13} />
          <span>3 Scheduled Deliveries</span>
        </div>
        <div className="crm-urgency-pill crm-inflow">
          <WalletCards size={13} />
          <span>₹1,95,000 Collection Queue</span>
        </div>
      </div>

      <section className="follow-section luxury-follow-section">
        <SectionTitle
          title={t("followups.today_overdue", "Today & Overdue")}
          action={<StatusPill tone="red">{t("followups.due_today_count", "2 due today")}</StatusPill>}
        />
        <div className="follow-list">
          {followups.slice(0, 2).map((row, i) => (
            <FollowRow row={row} key={row[0]} i={i} />
          ))}
        </div>
      </section>

      <section className="follow-section luxury-follow-section">
        <SectionTitle
          title={t("followups.upcoming", "Upcoming")}
          action={
            <button className="text-button luxury-view-all-btn" data-testid="view-all-follow-ups">
              <span>{t("followups.view_all", "View all")}</span>
              <ArrowUpRight size={15} />
            </button>
          }
        />
        <div className="follow-list">
          {followups.slice(2).map((row, i) => (
            <FollowRow row={row} key={row[0]} i={i + 2} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FollowRow({ row, i }) {
  const { t } = useLanguage();
  const roleLabel = row[2] === "Buyer" ? t("followups.buyer", "Buyer") : t("followups.seller", "Seller");
  const dateVal = row[5] === "Today" ? t("followups.today", "Today") : row[5];
  const isUrgent = row[5] === "Today";

  return (
    <div className={`follow-row luxury-follow-row ${isUrgent ? "is-urgent" : ""}`} data-testid={`follow-up-row-${i}`}>
      <div className="person-avatar luxury-avatar">{row[0].split(" ").map(x => x[0]).join("")}</div>
      <div className="follow-person">
        <b>{row[0]}</b>
        <span>
          <Phone size={12} className="text-amber-400" />
          {row[1]}
        </span>
      </div>
      <StatusPill tone={row[2] === "Buyer" ? "blue" : "gold"}>{roleLabel}</StatusPill>
      <div className="follow-bike">
        <Bike size={15} className="text-blue-400" />
        <b>{row[3]}</b>
      </div>
      <div className="follow-due">
        <span>{t("followups.amount_due", "Amount due")}</span>
        <strong className="due-gold-amount">{row[4]}</strong>
      </div>
      <div className="follow-date">
        <span>{t("followups.due_date", "Due date")}</span>
        <span className={`date-badge ${isUrgent ? "date-urgent" : "date-normal"}`}>{dateVal}</span>
      </div>
      <button className="open-button luxury-open-btn" data-testid={`open-follow-up-${i}`}>
        <span>{t("followups.open", "Open")}</span>
        <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

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
    <div className="settings-page-luxury">
      <div className="page-header settings-luxury-header">
        <div>
          <div className="eyebrow settings-eyebrow">
            <span className="eyebrow-beacon" />
            <span>{t("settings.eyebrow", "SHOWROOM PREFERENCES & PROFILE ATELIER")}</span>
          </div>
          <h1 data-testid="page-title" className="settings-hero-title">
            {t("settings.title", "Settings")}
          </h1>
          <p className="settings-hero-subtitle">
            {t("settings.subtitle", "Manage your profile, showroom preferences, and local demo state.")}
          </p>
        </div>
      </div>

      <div className="settings-grid luxury-settings-grid">
        <section className="settings-section luxury-settings-section">
          <SectionTitle title={t("settings.account", "Account Profile")} />
          <div className="profile-card luxury-profile-card">
            <div className="large-avatar luxury-avatar-large">AK</div>
            <div className="profile-info-block">
              <h3>Alex Kumar</h3>
              <p>alex@metromotors.in</p>
              <div className="profile-badge-row">
                <StatusPill tone="gold">{t("settings.owner", "Owner")}</StatusPill>
                <span className="verified-shield">
                  <ShieldCheck size={12} className="text-emerald-400" />
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
        </section>

        <section className="settings-section luxury-settings-section">
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
            <span className="current-dot">
              <i />
              {t("settings.active_status", "Active")}
            </span>
          </div>
        </section>

        <section className="settings-section luxury-settings-section">
          <SectionTitle title={t("settings.showroom", "Showroom Identity")} />
          <div className="settings-fields">
            <SettingField label={t("settings.showroom_name", "Showroom name")} value="Metro Motors" />
            <SettingField label={t("settings.currency", "Currency")} value={t("settings.currency_val", "Indian Rupee (₹)")} />
            <SettingField label={t("settings.date_format", "Date format")} value="DD MMM YYYY" />
          </div>
          <Button primary icon={<Check size={16} />} testid="save-settings-button">
            {t("settings.save_changes", "Save changes")}
          </Button>
        </section>

        <section className="settings-section luxury-settings-section" style={{ gridColumn: "1 / -1" }}>
          <SectionTitle title={t("settings.demo_data_header", "Showroom Storage & Demo Fleet Data")} />
          <div className="demo-vault-box">
            <p className="demo-vault-text">
              {t("settings.demo_data_desc", "Metro Motors comes pre-configured with 7 rich demo vehicle deals (Royal Enfield, KTM Duke, Yamaha MT-15, Honda Activa, Apache RTR, Kawasaki Ninja, and Hero Splendor) complete with vehicle specs, parties, witness details, agent transfers, payments, and verified photo documentation.")}
            </p>
            {demoNotice && (
              <div className="workflow-message" role="status" data-testid="settings-demo-message" style={{ margin: "4px 0" }}>
                <Sparkles size={14} className="text-amber-400" />
                <span>{demoNotice}</span>
              </div>
            )}
            <div className="demo-vault-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={reloadDemo}
                disabled={busy}
                data-testid="reload-demo-data-button"
              >
                <RefreshCw size={15} className={busy ? "animate-spin" : ""} />
                <span>{t("settings.reload_demo", "Reload Complete Demo Details")}</span>
              </button>
              <button
                type="button"
                className="button button-secondary clear-data-btn"
                onClick={clearData}
                disabled={busy}
                data-testid="clear-all-data-button"
              >
                <Trash2 size={15} />
                <span>{t("settings.clear_all_data", "Clear All Records")}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
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
  const [reloading, setReloading] = useState(false);
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
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppShell dark={dark} setDark={setDark}>
          <LocalModeLabel />
          <Routes>
            <Route path="/" element={<FunctionalDashboard />} />
            <Route path="/deals" element={<FunctionalDeals />} />
            <Route path="/deals/:dealId" element={<DealView />} />
            <Route path="/bills" element={<Navigate to="/deals" replace />} />
            <Route path="/new-deal" element={<FunctionalNewDeal />} />
            <Route path="/new-deal/:dealId" element={<FunctionalNewDeal />} />
            <Route path="/finances" element={<FunctionalFinances />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<FunctionalDashboard />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </LanguageProvider>
  );
}
export default App;
