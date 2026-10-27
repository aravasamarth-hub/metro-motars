import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  UserCheck,
  Users,
  CheckCircle2,
  Clock,
  Search,
  ArrowUpRight,
  Phone,
  Mail,
  X,
  Plus,
  Eye,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useDeals } from "./useDeals";
import { money } from "./dealModel";
import { dealRepository } from "@/data/dealRepository";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { AgentWhatsAppModal } from "./AgentWhatsAppModal";

// 1. shadcn/ui
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// 2. KokonutUI
import FloatingPaths from "@/components/kokonut/BackgroundPaths";
import SpotlightCard from "@/components/kokonut/SpotlightCard";
import ParticleButton from "@/components/kokonut/ParticleButton";

// 3. Motion (motion.dev)
import { MotionCounter } from "@/components/motion/MotionCounter";

// 4. Anime.js v4
import AnimePulseBeacon from "@/components/anime/AnimePulseBeacon";

// 5. Bklit data visualizations
import { AgentCommissionChart } from "@/components/bklit/AgentCommissionChart";

export default function AgentsView() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isOwner } = useAuth();
  const { deals, loading } = useDeals();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all" | "pending" | "completed"
  const [selectedAgentName, setSelectedAgentName] = useState(null);
  const [handoverFilter, setHandoverFilter] = useState("all"); // inside drawer: "all" | "pending" | "completed"
  const [whatsAppModalDeal, setWhatsAppModalDeal] = useState(null);
  const [isUpdatingDeal, setIsUpdatingDeal] = useState(false);

  // Group deals by Agent Name
  const agentGroups = useMemo(() => {
    const groups = {};

    deals.forEach((deal) => {
      const agent = deal.agent;
      if (!agent || !agent.name || !agent.name.trim()) return;

      const name = agent.name.trim();
      if (!groups[name]) {
        groups[name] = {
          name,
          phone: agent.phone || "",
          email: agent.email || "",
          deals: [],
          totalClients: 0,
          completed: 0,
          pending: 0,
          totalAmount: 0,
          amountPaid: 0,
          amountBalance: 0,
        };
      }

      groups[name].deals.push(deal);
      groups[name].totalClients += 1;

      if (!groups[name].phone && agent.phone) groups[name].phone = agent.phone;
      if (!groups[name].email && agent.email) groups[name].email = agent.email;

      const tot = Number(agent.total_amount) || 0;
      const paid = Number(agent.amount_paid) || 0;
      const bal =
        agent.amount_balance !== "" && agent.amount_balance != null
          ? Number(agent.amount_balance)
          : Math.max(0, tot - paid);

      groups[name].totalAmount += tot;
      groups[name].amountPaid += paid;
      groups[name].amountBalance += bal;

      // Determine task completed status
      const isCompleted =
        agent.status === "Completed" ||
        deal.rc_status === "Transferred" ||
        (agent.status !== "Pending" && bal === 0 && tot > 0) ||
        deal.status === "Sold";

      if (isCompleted) {
        groups[name].completed += 1;
      } else {
        groups[name].pending += 1;
      }
    });

    return Object.values(groups).sort((a, b) => b.totalClients - a.totalClients);
  }, [deals]);

  // Global KPIs across all agents
  const totalAgents = agentGroups.length;
  const totalClients = agentGroups.reduce((sum, a) => sum + a.totalClients, 0);
  const totalCompleted = agentGroups.reduce((sum, a) => sum + a.completed, 0);
  const totalPending = agentGroups.reduce((sum, a) => sum + a.pending, 0);
  const totalBalanceDue = agentGroups.reduce((sum, a) => sum + a.amountBalance, 0);

  // Filtered agent groups based on search & tab
  const filteredAgents = useMemo(() => {
    return agentGroups.filter((agent) => {
      // Tab filter
      if (filterTab === "pending" && agent.pending === 0) return false;
      if (filterTab === "completed" && agent.pending > 0) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = agent.name.toLowerCase().includes(q);
      const matchPhone = agent.phone.toLowerCase().includes(q);
      const matchDeals = agent.deals.some((d) => {
        const v = d.vehicle || {};
        const s = d.seller || {};
        const b = d.buyer || {};
        return (
          (v.vehicle_name && v.vehicle_name.toLowerCase().includes(q)) ||
          (v.registration_number && v.registration_number.toLowerCase().includes(q)) ||
          (s.name && s.name.toLowerCase().includes(q)) ||
          (b.name && b.name.toLowerCase().includes(q)) ||
          (d.bill_number && d.bill_number.toLowerCase().includes(q))
        );
      });

      return matchName || matchPhone || matchDeals;
    });
  }, [agentGroups, filterTab, searchQuery]);

  // Selected agent for drilldown view
  const activeAgent = useMemo(() => {
    if (!selectedAgentName) return null;
    return agentGroups.find((a) => a.name === selectedAgentName) || null;
  }, [agentGroups, selectedAgentName]);

  // Handover deals for the active agent, filtered
  const activeAgentDeals = useMemo(() => {
    if (!activeAgent) return [];
    return activeAgent.deals.filter((deal) => {
      const isCompleted =
        deal.agent?.status === "Completed" ||
        deal.rc_status === "Transferred" ||
        (deal.agent?.status !== "Pending" && Number(deal.agent?.amount_balance) === 0 && Number(deal.agent?.total_amount) > 0) ||
        deal.status === "Sold";

      if (handoverFilter === "pending") return !isCompleted;
      if (handoverFilter === "completed") return isCompleted;
      return true;
    });
  }, [activeAgent, handoverFilter]);

  // Quick toggle deal agent completion status
  const handleToggleDealStatus = async (deal) => {
    if (isUpdatingDeal) return;
    setIsUpdatingDeal(true);
    try {
      const currentCompleted =
        deal.agent?.status === "Completed" ||
        deal.rc_status === "Transferred" ||
        (deal.agent?.status !== "Pending" && Number(deal.agent?.amount_balance) === 0 && Number(deal.agent?.total_amount) > 0) ||
        deal.status === "Sold";

      const newStatus = currentCompleted ? "Pending" : "Completed";
      const updatedDeal = {
        ...deal,
        agent: {
          ...(deal.agent || {}),
          status: newStatus,
          completed_at: newStatus === "Completed" ? new Date().toISOString() : null,
        },
      };
      await dealRepository.save(updatedDeal);
    } catch (err) {
      console.error("Failed to toggle deal agent status:", err);
    } finally {
      setIsUpdatingDeal(false);
    }
  };

  const agentChartData = useMemo(() => {
    if (!agentGroups.length) return [];
    return agentGroups.slice(0, 6).map((a) => {
      // Calculate turnaround time in days for this agent's deals
      let totalDays = 0;
      let validDeals = 0;
      (a.deals || []).forEach((d) => {
        const start = d.created_at ? new Date(d.created_at).getTime() : Date.now() - 3 * 86400000;
        const end = d.agent?.completed_at
          ? new Date(d.agent.completed_at).getTime()
          : (d.updated_at ? new Date(d.updated_at).getTime() : Date.now());
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        totalDays += diffDays;
        validDeals++;
      });
      const daysTaken = validDeals > 0 ? Math.max(1, Math.round(totalDays / validDeals)) : 3;

      const paidK = Number(((a.amountPaid || 0) / 1000).toFixed(1));
      const balanceK = Number(((a.amountBalance || 0) / 1000).toFixed(1));

      return {
        name: a.name,
        deals: a.totalClients,
        amountPaid: paidK,
        amountBalance: balanceK,
        daysTaken,
        rawPaid: a.amountPaid,
        rawBalance: a.amountBalance,
        totalAmount: a.totalAmount,
        payoutStatus: a.amountBalance === 0 ? "settled" : "pending",
        commission: Math.round(a.totalAmount / 1000) || 12,
      };
    });
  }, [agentGroups]);


  if (!isOwner) {
    return (
      <div className="local-page" data-testid="agents-restricted-page">
        <div className="p-10 text-center max-w-lg mx-auto bg-neutral-900/80 rounded-2xl border border-neutral-800 shadow-2xl mt-12">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Owner Access Required</h2>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
            Agent profiles, RTO service fees, commission structures, and payouts are confidential. This page is restricted to Showroom Owner account (<strong>aravasamarth@gmail.com</strong>).
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              className="button button-primary"
              onClick={() => navigate("/deals")}
            >
              Back to Deals
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => navigate("/login")}
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="agents-page-container"
      data-testid="agents-page"
    >
      {/* ── Luxury Agent Command Hero (With KokonutUI FloatingPaths) ── */}
      <div className="luxury-hero-container relative mb-6">
        <FloatingPaths position={1} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <AnimePulseBeacon color="gold" size="sm" label="RTO & SERVICE NETWORK" />
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                {totalAgents} Active Liaisons
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px]">
                {totalCompleted} Completed Handovers
              </Badge>
            </div>

            <h1 data-testid="page-title" className="text-2xl sm:text-3xl font-extrabold text-white font-manrope">
              {t("agents.title", "Agent Management")}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Track client deals handed over to RTO and service agents, progress, commissions, and pending tasks.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <ParticleButton
              onClick={() => navigate("/new-deal")}
              data-testid="agents-create-deal-btn"
              className="luxury-particle-cta px-4 py-2.5 text-xs font-bold"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{t("agents.assign_new", "Assign New Deal")}</span>
            </ParticleButton>
          </div>
        </div>
      </div>

      {/* ── KokonutUI SpotlightCard KPI Grid + Motion Counters ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.15)"
          className="p-4 border-neutral-800 bg-neutral-900/80 shadow-xl"
          data-testid="kpi-total-agents"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>{t("agents.total_agents", "Total Agents")}</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-manrope mt-2">
            <MotionCounter to={totalAgents} />
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">Collaborating Liaisons</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className="p-4 border-neutral-800 bg-neutral-900/80 shadow-xl"
          data-testid="kpi-total-clients"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>{t("agents.total_clients", "Total Clients")}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-manrope mt-2">
            <MotionCounter to={totalClients} />
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">Deals Handed Over</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className="p-4 border-neutral-800 bg-neutral-900/80 shadow-xl"
          data-testid="kpi-completed-tasks"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>{t("agents.completed_tasks", "Completed Work")}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-manrope mt-2">
            <MotionCounter to={totalCompleted} />
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {totalClients > 0 ? `${Math.round((totalCompleted / totalClients) * 100)}% Cleared` : "All Handed Over"}
          </span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className="p-4 border-neutral-800 bg-neutral-900/80 shadow-xl"
          data-testid="kpi-pending-tasks"
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>{t("agents.pending_tasks", "Pending Work")}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-manrope mt-2">
            <MotionCounter to={totalPending} />
          </div>
          <span className="text-[10px] text-amber-400 mt-1 block">
            Balance: {money(totalBalanceDue)}
          </span>
        </SpotlightCard>
      </div>

      {/* ── Bklit Agent Commission & Volume Chart ── */}
      <div className="mb-6">
        <AgentCommissionChart data={agentChartData.length ? agentChartData : undefined} />
      </div>

      {/* Search and Tabs Toolbar */}
      <div className="toolbar agents-toolbar no-print">
        <div className="search-field agents-search-field">
          <Search size={17} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("agents.search_placeholder", "Search agent name, phone, client, or vehicle...")}
            data-testid="agents-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              data-testid="agents-clear-search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="agents-filter-pills" role="tablist">
          <button
            type="button"
            className={`agents-filter-pill ${filterTab === "all" ? "active" : ""}`}
            onClick={() => setFilterTab("all")}
            data-testid="agents-filter-all"
          >
            All Agents ({agentGroups.length})
          </button>
          <button
            type="button"
            className={`agents-filter-pill ${filterTab === "pending" ? "active" : ""}`}
            onClick={() => setFilterTab("pending")}
            data-testid="agents-filter-pending"
          >
            Pending Work ({agentGroups.filter((a) => a.pending > 0).length})
          </button>
          <button
            type="button"
            className={`agents-filter-pill ${filterTab === "completed" ? "active" : ""}`}
            onClick={() => setFilterTab("completed")}
            data-testid="agents-filter-completed"
          >
            All Completed ({agentGroups.filter((a) => a.pending === 0).length})
          </button>
        </div>
      </div>

      {/* Agent Table (as requested by user) */}
      <div className="table-shell agents-table-shell no-print" data-testid="agents-table-shell">
        <div className="table-heading agents-table-heading">
          <div>
            <b>
              {t("agents.directory", "Agents Directory")} (
              <span data-testid="agents-count">{filteredAgents.length}</span>)
            </b>
            <span style={{ marginLeft: "8px", color: "var(--local-muted)", fontSize: "11px" }}>
              Total clients, completed, and pending tasks per agent
            </span>
          </div>
          <span>Amounts in INR</span>
        </div>

        <div className="table-scroll">
          <table className="agents-table" data-testid="agents-table">
            <thead>
              <tr>
                <th style={{ minWidth: "220px" }}>{t("agents.col_agent", "Agent Name")}</th>
                <th style={{ textAlign: "center", width: "120px" }}>
                  {t("agents.col_clients", "Total Clients")}
                </th>
                <th style={{ textAlign: "center", width: "110px" }}>
                  {t("agents.col_pending", "Pending")}
                </th>
                <th style={{ textAlign: "center", width: "110px" }}>
                  {t("agents.col_completed", "Completed")}
                </th>
                <th style={{ width: "180px" }}>{t("agents.col_fees", "Fee & Balance")}</th>
                <th style={{ textAlign: "right", width: "140px" }}>
                  {t("agents.col_actions", "Action")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => {
                const cleanWords = agent.name.replace(/[^a-zA-Z\s]/g, " ").trim().split(/\s+/).filter(Boolean);
                const initials = cleanWords.slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "AG";

                return (
                  <tr
                    key={agent.name}
                    className={`agent-row ${selectedAgentName === agent.name ? "selected" : ""}`}
                    data-testid={`agent-row-${agent.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {/* Agent Name & Contact */}
                    <td>
                      <div className="agent-identity-cell">
                        <div className="agent-avatar-badge">{initials}</div>
                        <div>
                          <strong className="agent-name-title">{agent.name}</strong>
                          <div className="agent-contact-line">
                            {agent.phone && (
                              <span className="agent-phone-item">
                                <Phone size={11} />
                                {agent.phone}
                              </span>
                            )}
                            {agent.email && (
                              <span className="agent-email-item">
                                <Mail size={11} />
                                {agent.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Clients */}
                    <td style={{ textAlign: "center" }}>
                      <span className="agent-number-badge clients" data-testid="agent-total-clients">
                        {agent.totalClients}
                      </span>
                    </td>

                    {/* Pending */}
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`agent-number-badge ${agent.pending > 0 ? "pending" : "zero"}`}
                        data-testid="agent-pending-count"
                      >
                        {agent.pending > 0 && <Clock size={11} />}
                        {agent.pending}
                      </span>
                    </td>

                    {/* Completed */}
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`agent-number-badge ${agent.completed > 0 ? "completed" : "zero"}`}
                        data-testid="agent-completed-count"
                      >
                        {agent.completed > 0 && <Check size={11} strokeWidth={3} />}
                        {agent.completed}
                      </span>
                    </td>

                    {/* Fee Breakdown */}
                    <td>
                      <div className="agent-fee-cell">
                        <div className="agent-fee-row">
                          <span className="label">Total:</span>
                          <strong>{money(agent.totalAmount)}</strong>
                        </div>
                        <div className="agent-fee-row">
                          <span className="label">Bal:</span>
                          <span
                            style={{
                              color: agent.amountBalance > 0 ? "var(--gold)" : "#4ade80",
                              fontWeight: 600,
                            }}
                          >
                            {money(agent.amountBalance)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action: View Deals */}
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="button button-secondary agent-view-btn"
                        onClick={() => setSelectedAgentName(agent.name)}
                        data-testid={`agent-view-btn-${agent.name.toLowerCase().replace(/\s+/g, "-")}`}
                        title={`View ${agent.totalClients} deals handed over to ${agent.name}`}
                      >
                        <Eye size={14} />
                        <span>{t("agents.view_deals", "View")}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!filteredAgents.length && (
                <tr>
                  <td colSpan={6} className="empty-table-cell" data-testid="agents-empty-row">
                    {searchQuery ? (
                      <p>No agents match "{searchQuery}". Try a different search term.</p>
                    ) : (
                      <div className="agents-empty-state">
                        <UserCheck size={36} strokeWidth={1.5} color="var(--local-muted)" />
                        <h3>No agents recorded yet</h3>
                        <p>
                          Agents will appear automatically as you assign RTO or transfer tasks to them
                          in your deals.
                        </p>
                        <button
                          className="button button-primary"
                          onClick={() => navigate("/new-deal")}
                          style={{ marginTop: "12px" }}
                        >
                          <Plus size={16} /> Create Deal with Agent
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover Deals Drilldown Modal / Drawer */}
      {activeAgent && (
        <div
          className="agent-handover-modal-backdrop"
          onClick={() => setSelectedAgentName(null)}
          role="dialog"
          aria-modal="true"
          data-testid="agent-handover-modal"
        >
          <div
            className="agent-handover-modal-shell"
            onClick={(e) => e.stopPropagation()}
            data-testid="agent-handover-modal-shell"
          >
            {/* Modal Header */}
            <div className="agent-handover-modal-header">
              <div className="agent-handover-header-left">
                <div className="agent-avatar-badge large">
                  {activeAgent.name.replace(/[^a-zA-Z\s]/g, " ").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "AG"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 className="agent-handover-title">{activeAgent.name}</h2>
                    <span className="agent-modal-badge">RTO AGENT</span>
                  </div>
                  <div className="agent-handover-subtitle">
                    {activeAgent.phone && (
                      <span style={{ marginRight: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={12} /> {activeAgent.phone}
                      </span>
                    )}
                    <span>
                      {activeAgent.totalClients} Client Deals Handed Over ({activeAgent.completed} Completed ·{" "}
                      <span style={{ color: "var(--gold)" }}>{activeAgent.pending} Pending</span>)
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="agent-modal-close-btn"
                onClick={() => setSelectedAgentName(null)}
                aria-label="Close"
                data-testid="close-agent-handover-modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drilldown Toolbar: Filters */}
            <div className="agent-handover-toolbar">
              <div className="agents-filter-pills" role="tablist">
                <button
                  type="button"
                  className={`agents-filter-pill ${handoverFilter === "all" ? "active" : ""}`}
                  onClick={() => setHandoverFilter("all")}
                >
                  All Handover Deals ({activeAgent.deals.length})
                </button>
                <button
                  type="button"
                  className={`agents-filter-pill ${handoverFilter === "pending" ? "active" : ""}`}
                  onClick={() => setHandoverFilter("pending")}
                >
                  Pending Only ({activeAgent.pending})
                </button>
                <button
                  type="button"
                  className={`agents-filter-pill ${handoverFilter === "completed" ? "active" : ""}`}
                  onClick={() => setHandoverFilter("completed")}
                >
                  Completed ({activeAgent.completed})
                </button>
              </div>

              <div className="agent-handover-financial-summary">
                <span>
                  Total Fee: <strong>{money(activeAgent.totalAmount)}</strong>
                </span>
                <span>
                  Balance Due:{" "}
                  <strong style={{ color: activeAgent.amountBalance > 0 ? "var(--gold)" : "#4ade80" }}>
                    {money(activeAgent.amountBalance)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Handover Deals Cards List */}
            <div className="agent-handover-deals-list" data-testid="agent-handover-deals-list">
              {activeAgentDeals.map((deal) => {
                const v = deal.vehicle || {};
                const s = deal.seller || {};
                const b = deal.buyer || {};
                const clientName = b.name || s.name || "Client";
                const clientRole = b.name ? "Buyer" : "Seller";
                const isCompleted =
                  deal.agent?.status === "Completed" ||
                  deal.rc_status === "Transferred" ||
                  (deal.agent?.status !== "Pending" && Number(deal.agent?.amount_balance) === 0 && Number(deal.agent?.total_amount) > 0) ||
                  deal.status === "Sold";

                const assignedTime = deal.agent?.assigned_at
                  ? new Date(deal.agent.assigned_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not specified";

                const totalFee = Number(deal.agent?.total_amount) || 0;
                const paidFee = Number(deal.agent?.amount_paid) || 0;
                const balFee =
                  deal.agent?.amount_balance !== "" && deal.agent?.amount_balance != null
                    ? Number(deal.agent?.amount_balance)
                    : Math.max(0, totalFee - paidFee);

                return (
                  <div
                    key={deal.id}
                    className={`agent-deal-card ${isCompleted ? "completed" : "pending"}`}
                    data-testid={`agent-deal-card-${deal.id}`}
                  >
                    {/* Card Top: Bill No, Vehicle, Client */}
                    <div className="agent-deal-card-header">
                      <div
                        className="agent-deal-title-block clickable"
                        onClick={() => {
                          setSelectedAgentName(null);
                          navigate(`/new-deal/${deal.id}?step=agent`);
                        }}
                        style={{ cursor: "pointer" }}
                        title="Open Deal Agent Workspace"
                      >
                        <span className="agent-deal-bill-number">
                          {deal.bill_number || deal.id.slice(0, 8)}
                        </span>
                        <h4 className="agent-deal-vehicle-name">
                          {v.vehicle_name || `${v.make || ""} ${v.model || ""}`.trim() || "Vehicle"}
                        </h4>
                        {v.registration_number && (
                          <span className="agent-deal-reg-no">{v.registration_number}</span>
                        )}
                      </div>

                      <div className="agent-deal-client-badge">
                        <span className="agent-deal-role-tag">{clientRole}</span>
                        <strong className="agent-deal-client-name">{clientName}</strong>
                      </div>
                    </div>

                    {/* Card Middle: Tasks, Assigned Date, Financials */}
                    <div className="agent-deal-card-body">
                      <div className="agent-deal-task-info">
                        <span className="agent-deal-section-label">Assigned Work / RTO Tasks:</span>
                        <p className="agent-deal-tasks-text">
                          {deal.agent?.task || "General RTO transfer & documentation"}
                        </p>
                        <small className="agent-deal-assigned-at">
                          <Clock size={11} /> Assigned: {assignedTime}
                        </small>
                      </div>

                      <div className="agent-deal-finance-info">
                        <div className="agent-deal-fee-row">
                          <span>Fee:</span>
                          <strong>{money(totalFee)}</strong>
                        </div>
                        <div className="agent-deal-fee-row">
                          <span>Paid:</span>
                          <span style={{ color: "#4ade80" }}>{money(paidFee)}</span>
                        </div>
                        <div className="agent-deal-fee-row">
                          <span>Balance:</span>
                          <strong style={{ color: balFee > 0 ? "var(--gold)" : "inherit" }}>
                            {money(balFee)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom: Status Toggle & Direct Navigation to Deal Agent Page */}
                    <div className="agent-deal-card-actions">
                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        className={`agent-deal-status-toggle ${isCompleted ? "completed" : "pending"}`}
                        onClick={() => handleToggleDealStatus(deal)}
                        disabled={isUpdatingDeal}
                        title="Click to toggle Completed / Pending status"
                        data-testid={`toggle-deal-status-${deal.id}`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <Clock size={14} />
                            <span>Pending (Click to Complete)</span>
                          </>
                        )}
                      </button>

                      <div className="agent-deal-right-actions">
                        {/* WhatsApp Notify */}
                        <button
                          type="button"
                          className="agent-deal-action-btn whatsapp"
                          onClick={() => setWhatsAppModalDeal(deal)}
                          title="Open WhatsApp message for this deal"
                          data-testid={`agent-deal-whatsapp-${deal.id}`}
                        >
                          <svg className="agent-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.51 3.67-8.18 8.18-8.18 2.18 0 4.24.85 5.79 2.39a8.14 8.14 0 0 1 2.4 5.79c0 4.51-3.67 8.18-8.18 8.18zm4.49-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z" />
                          </svg>
                          <span>WhatsApp</span>
                        </button>

                        {/* View Deal / Go to Deal Agent Page */}
                        <button
                          type="button"
                          className="button button-primary agent-deal-go-btn"
                          onClick={() => {
                            setSelectedAgentName(null);
                            navigate(`/new-deal/${deal.id}?step=agent`);
                          }}
                          data-testid={`agent-deal-goto-${deal.id}`}
                          title="Open Deal Agent Workspace"
                        >
                          <span>{t("agents.go_to_deal", "View Deal Agent Page")}</span>
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!activeAgentDeals.length && (
                <div className="agent-handover-empty">
                  <p>No deals match the selected filter for this agent.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal for specific deal from handover drilldown */}
      {whatsAppModalDeal && (
        <AgentWhatsAppModal
          isOpen={!!whatsAppModalDeal}
          onClose={() => setWhatsAppModalDeal(null)}
          deal={whatsAppModalDeal}
          agent={whatsAppModalDeal.agent}
          selectedTasks={whatsAppModalDeal.agent?.tasks || []}
          taskAmounts={whatsAppModalDeal.agent?.task_amounts || {}}
          otherDoc={whatsAppModalDeal.agent?.other_doc || ""}
          customAssignedAt={whatsAppModalDeal.agent?.assigned_at || ""}
        />
      )}
    </motion.div>
  );
}
