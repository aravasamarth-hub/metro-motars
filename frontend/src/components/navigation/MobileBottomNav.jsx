import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, BriefcaseBusiness, Plus, UserCheck, CircleDollarSign, CalendarDays, Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function MobileBottomNav() {
  const { t } = useLanguage();
  const location = useLocation();
  const { isOwner } = useAuth();

  // Hide bottom nav on public website / showcase / login / portal pages
  if (
    location.pathname === "/" ||
    location.pathname === "/bikes" ||
    location.pathname === "/login" ||
    location.pathname === "/portal" ||
    location.pathname === "/showcase"
  ) {
    return null;
  }

  const isNewDealActive = location.pathname.startsWith("/new-deal");

  return (
    <nav
      className="mobile-bottom-dock"
      aria-label="Mobile Navigation"
      data-testid="mobile-bottom-nav"
    >
      <div className="mobile-dock-inner">
        {/* 1. Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `mobile-dock-item ${isActive && (location.pathname === "/dashboard" || location.pathname === "/console") ? "active" : ""}`
          }
          data-testid="mobile-nav-dashboard"
        >
          <div className="mobile-dock-icon">
            <LayoutDashboard size={20} />
          </div>
          <span className="mobile-dock-label">{t("nav.dashboard", "Dashboard")}</span>
        </NavLink>

        {/* 2. Deals */}
        <NavLink
          to="/deals"
          className={({ isActive }) =>
            `mobile-dock-item ${isActive && location.pathname.startsWith("/deals") ? "active" : ""}`
          }
          data-testid="mobile-nav-deals"
        >
          <div className="mobile-dock-icon">
            <BriefcaseBusiness size={20} />
          </div>
          <span className="mobile-dock-label">{t("nav.deals", "Deals")}</span>
        </NavLink>

        {/* 3. Center Elevated + New Deal Action */}
        <NavLink
          to="/new-deal"
          className={`mobile-dock-center-action ${isNewDealActive ? "active" : ""}`}
          data-testid="mobile-nav-new-deal"
          aria-label={t("nav.new_deal", "New Deal")}
        >
          <div className="center-action-glow" />
          <div className="center-action-button">
            <Plus size={24} strokeWidth={2.8} />
          </div>
          <span className="mobile-dock-label center-label">{t("nav.new_deal", "New Deal")}</span>
        </NavLink>

        {/* 4. Agents / Follow-ups */}
        {isOwner ? (
          <NavLink
            to="/agents"
            className={({ isActive }) =>
              `mobile-dock-item ${isActive && location.pathname.startsWith("/agents") ? "active" : ""}`
            }
            data-testid="mobile-nav-agents"
          >
            <div className="mobile-dock-icon">
              <UserCheck size={20} />
            </div>
            <span className="mobile-dock-label">{t("nav.agents", "Agents")}</span>
          </NavLink>
        ) : (
          <NavLink
            to="/follow-ups"
            className={({ isActive }) =>
              `mobile-dock-item ${isActive && location.pathname.startsWith("/follow-ups") ? "active" : ""}`
            }
            data-testid="mobile-nav-follow-ups"
          >
            <div className="mobile-dock-icon">
              <CalendarDays size={20} />
            </div>
            <span className="mobile-dock-label">{t("nav.follow_ups", "Follow-ups")}</span>
          </NavLink>
        )}

        {/* 5. Finances / Settings */}
        {isOwner ? (
          <NavLink
            to="/finances"
            className={({ isActive }) =>
              `mobile-dock-item ${isActive && location.pathname.startsWith("/finances") ? "active" : ""}`
            }
            data-testid="mobile-nav-finances"
          >
            <div className="mobile-dock-icon">
              <CircleDollarSign size={20} />
            </div>
            <span className="mobile-dock-label">{t("nav.finances", "Finances")}</span>
          </NavLink>
        ) : (
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `mobile-dock-item ${isActive && location.pathname.startsWith("/settings") ? "active" : ""}`
            }
            data-testid="mobile-nav-settings"
          >
            <div className="mobile-dock-icon">
              <SettingsIcon size={20} />
            </div>
            <span className="mobile-dock-label">{t("nav.settings", "Settings")}</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
