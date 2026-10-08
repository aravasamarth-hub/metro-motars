import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Briefcase,
  Clock,
  CalendarDays,
  WalletCards,
  Plus,
  Search,
  X,
  Phone,
  Bike,
  CheckCircle2,
  ArrowUpRight,
  Filter,
  Check,
  AlertCircle,
  FileCheck,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useDeals } from "./useDeals";
import { money } from "./dealModel";
import { useLanguage } from "@/features/i18n/LanguageContext";

const DEFAULT_FOLLOWUPS = [
  // Buyer follow-ups
  {
    id: "bf-1",
    role: "Buyer",
    name: "Chirag Hegde",
    phone: "+91 97412 83746",
    vehicle: "Yamaha MT-15 V2",
    regNo: "KA-04-ER-9821",
    task: "Remaining balance collection before vehicle delivery",
    amountDue: 110000,
    dueDate: "Today",
    isUrgent: true,
    dealId: "c3d5a420-9bf3-4e88-bd98-75e119428512",
    status: "pending",
  },
  {
    id: "bf-2",
    role: "Buyer",
    name: "Naveen Reddy",
    phone: "+91 97390 19283",
    vehicle: "TVS Apache RTR 200",
    regNo: "KA-01-EE-4512",
    task: "Final payment settlement & key handover",
    amountDue: 85000,
    dueDate: "Today",
    isUrgent: true,
    dealId: "40d046bb-29c8-4735-a7b5-0c7f8c1caec3",
    status: "pending",
  },
  {
    id: "bf-3",
    role: "Buyer",
    name: "Aditya Mohan",
    phone: "+91 99008 81122",
    vehicle: "Royal Enfield Classic 350",
    regNo: "KA-03-JJ-4521",
    task: "RC Smart Card delivery tracking & dispatch confirmation",
    amountDue: 0,
    dueDate: "08 Oct 2026",
    isUrgent: false,
    dealId: "437651a2-581b-410a-b9c1-5ee475965a39",
    status: "pending",
  },
  {
    id: "bf-4",
    role: "Buyer",
    name: "Tanmay Bhatia",
    phone: "+91 99887 76655",
    vehicle: "Kawasaki Ninja 300",
    regNo: "KA-51-KK-1290",
    task: "1st Free Service & extended warranty check",
    amountDue: 0,
    dueDate: "15 Oct 2026",
    isUrgent: false,
    dealId: "437651a2-581b-410a-b9c1-5ee475965a39",
    status: "pending",
  },

  // Seller follow-ups
  {
    id: "sf-1",
    role: "Seller",
    name: "Arjun N. Mehta",
    phone: "+91 98201 23456",
    vehicle: "KTM Duke 390",
    regNo: "KA-01-MJ-8821",
    task: "Collect original Bank NOC & Form 35 cancellation copy",
    amountDue: 0,
    dueDate: "Tomorrow",
    isUrgent: false,
    dealId: "d69efbb3-3e0f-4886-905c-30bfe7fa82f4",
    status: "pending",
  },
  {
    id: "sf-2",
    role: "Seller",
    name: "Sandeep R. Kulkarni",
    phone: "+91 98451 23456",
    vehicle: "Royal Enfield Hunter 350",
    regNo: "KA-05-MH-2024",
    task: "Release remaining payout ₹15,000 upon receiving duplicate key",
    amountDue: 15000,
    dueDate: "11 Oct 2026",
    isUrgent: false,
    dealId: "f7a7c4c6-093e-4025-8ba3-b4e834d2dfaa",
    status: "pending",
  },
  {
    id: "sf-3",
    role: "Seller",
    name: "Rajesh Gowda",
    phone: "+91 94480 54321",
    vehicle: "Honda Activa 6G",
    regNo: "KA-05-JL-3311",
    task: "Collect signed insurance transfer endorsement form",
    amountDue: 0,
    dueDate: "14 Oct 2026",
    isUrgent: false,
    dealId: "81eb4119-e932-4919-8692-a1ad4bc341ba",
    status: "pending",
  },

  // Agent follow-ups
  {
    id: "af-1",
    role: "Agent",
    name: "Ramesh Babu (RTO Consultant)",
    phone: "+91 98860 12345",
    vehicle: "Royal Enfield Hunter 350",
    regNo: "KA-05-MH-2024",
    task: "KA-05 to KA-51 RTO Transfer · Check Form 29/30 submission receipt",
    amountDue: 1000,
    dueDate: "Today",
    isUrgent: true,
    dealId: "f7a7c4c6-093e-4025-8ba3-b4e834d2dfaa",
    status: "pending",
  },
  {
    id: "af-2",
    role: "Agent",
    name: "Shivakumar (Koramangala RTO)",
    phone: "+91 94481 23456",
    vehicle: "KTM Duke 390",
    regNo: "KA-01-MJ-8821",
    task: "Hypothecation verification (HPT) & Clearance Certificate (CC)",
    amountDue: 1000,
    dueDate: "Tomorrow",
    isUrgent: false,
    dealId: "d69efbb3-3e0f-4886-905c-30bfe7fa82f4",
    status: "pending",
  },
  {
    id: "af-3",
    role: "Agent",
    name: "Manjunath (Jayanagar RTO)",
    phone: "+91 94498 12345",
    vehicle: "Royal Enfield Classic 350",
    regNo: "KA-03-JJ-4521",
    task: "KA-05 Jayanagar Transfer & Tax Endorsement clearance",
    amountDue: 1000,
    dueDate: "12 Oct 2026",
    isUrgent: false,
    dealId: "437651a2-581b-410a-b9c1-5ee475965a39",
    status: "pending",
  },
  {
    id: "af-4",
    role: "Agent",
    name: "Anand RTO Consult",
    phone: "+91 98440 55667",
    vehicle: "TVS Apache RTR 200",
    regNo: "KA-01-EE-4512",
    task: "Duplicate RC (DRC) submission & receipt acknowledgement",
    amountDue: 0,
    dueDate: "16 Oct 2026",
    isUrgent: false,
    dealId: "40d046bb-29c8-4735-a7b5-0c7f8c1caec3",
    status: "completed",
  },
];

export default function FollowUpsView() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { deals } = useDeals();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "buyer" | "seller" | "agent"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "completed"
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load custom follow-ups from localStorage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("mm_custom_followups");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_FOLLOWUPS;
  });

  // Save to localStorage when items change
  useEffect(() => {
    try {
      localStorage.setItem("mm_custom_followups", JSON.stringify(items));
    } catch {}
  }, [items]);

  // Merge deal updates if applicable
  const combinedItems = useMemo(() => {
    const list = [...items];
    const existingDealIds = new Set(list.map((it) => it.dealId).filter(Boolean));

    // Scan real deals for pending items
    deals.forEach((deal) => {
      if (!deal.id || existingDealIds.has(deal.id)) return;

      const v = deal.vehicle || {};
      const vehicleName = v.vehicle_name || `${v.make || ""} ${v.model || ""}`.trim() || "Vehicle";
      const reg = v.registration_number || "";

      // Buyer follow-up
      if (deal.buyer?.name) {
        const sp = Number(deal.payments?.selling_price) || 0;
        const rec = Number(deal.payments?.received_from_buyer) || 0;
        const bal = Math.max(0, sp - rec);
        if (bal > 0) {
          list.push({
            id: `deal-buyer-${deal.id}`,
            role: "Buyer",
            name: deal.buyer.name,
            phone: deal.buyer.phone || "",
            vehicle: vehicleName,
            regNo: reg,
            task: `Remaining balance collection (${money(bal)})`,
            amountDue: bal,
            dueDate: "Upcoming",
            isUrgent: false,
            dealId: deal.id,
            status: "pending",
          });
        }
      }

      // Seller follow-up
      if (deal.seller?.name) {
        const pp = Number(deal.payments?.purchase_price) || 0;
        const paid = Number(deal.payments?.paid_to_seller) || 0;
        const bal = Math.max(0, pp - paid);
        if (bal > 0) {
          list.push({
            id: `deal-seller-${deal.id}`,
            role: "Seller",
            name: deal.seller.name,
            phone: deal.seller.phone || "",
            vehicle: vehicleName,
            regNo: reg,
            task: `Payout balance release (${money(bal)})`,
            amountDue: bal,
            dueDate: "Upcoming",
            isUrgent: false,
            dealId: deal.id,
            status: "pending",
          });
        }
      }

      // Agent follow-up
      if (deal.agent?.name) {
        const tot = Number(deal.agent.total_amount) || 0;
        const paid = Number(deal.agent.amount_paid) || 0;
        const bal =
          deal.agent.amount_balance !== "" && deal.agent.amount_balance != null
            ? Number(deal.agent.amount_balance)
            : Math.max(0, tot - paid);
        list.push({
          id: `deal-agent-${deal.id}`,
          role: "Agent",
          name: deal.agent.name,
          phone: deal.agent.phone || "",
          vehicle: vehicleName,
          regNo: reg,
          task: deal.agent.task || "RTO documentation & transfer clearance",
          amountDue: bal,
          dueDate: "Upcoming",
          isUrgent: false,
          dealId: deal.id,
          status: deal.agent.status === "Completed" ? "completed" : "pending",
        });
      }
    });

    return list;
  }, [items, deals]);

  // Toggle item status
  const handleToggleStatus = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "completed" ? "pending" : "completed" }
          : item
      )
    );
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      // Role filter
      if (activeTab === "buyer" && item.role !== "Buyer") return false;
      if (activeTab === "seller" && item.role !== "Seller") return false;
      if (activeTab === "agent" && item.role !== "Agent") return false;

      // Status filter
      if (statusFilter === "pending" && item.status !== "pending") return false;
      if (statusFilter === "completed" && item.status !== "completed") return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.phone && item.phone.toLowerCase().includes(q)) ||
        (item.vehicle && item.vehicle.toLowerCase().includes(q)) ||
        (item.regNo && item.regNo.toLowerCase().includes(q)) ||
        (item.task && item.task.toLowerCase().includes(q))
      );
    });
  }, [combinedItems, activeTab, statusFilter, searchQuery]);

  // Breakdown by role
  const buyerItems = useMemo(
    () => filteredItems.filter((i) => i.role === "Buyer"),
    [filteredItems]
  );
  const sellerItems = useMemo(
    () => filteredItems.filter((i) => i.role === "Seller"),
    [filteredItems]
  );
  const agentItems = useMemo(
    () => filteredItems.filter((i) => i.role === "Agent"),
    [filteredItems]
  );

  // Overall metric counts
  const totalDueToday = combinedItems.filter(
    (i) => i.status === "pending" && (i.isUrgent || i.dueDate === "Today")
  ).length;
  const totalBuyerCount = combinedItems.filter((i) => i.role === "Buyer" && i.status === "pending").length;
  const totalSellerCount = combinedItems.filter((i) => i.role === "Seller" && i.status === "pending").length;
  const totalAgentCount = combinedItems.filter((i) => i.role === "Agent" && i.status === "pending").length;
  const totalCollectionQueue = combinedItems
    .filter((i) => i.role === "Buyer" && i.status === "pending")
    .reduce((sum, i) => sum + (Number(i.amountDue) || 0), 0);

  // Quick WhatsApp link helper
  const openWhatsApp = (item) => {
    if (!item.phone) return;
    const cleanPhone = item.phone.replace(/[^0-9]/g, "");
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    let text = "";
    if (item.role === "Agent") {
      text = `Hello ${item.name}, this is Metro Motors. Regarding RTO task for ${item.vehicle || "the deal"}: "${item.task}". Please let us know the current update. Thank you!`;
    } else if (item.role === "Buyer") {
      text = `Hello ${item.name}, greeting from Metro Motors regarding your ${item.vehicle || "vehicle"}. Follow-up on: ${item.task}. Thank you!`;
    } else {
      text = `Hello ${item.name}, greeting from Metro Motors regarding your ${item.vehicle || "vehicle"}. Follow-up on: ${item.task}. Thank you!`;
    }

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Navigation to deal / agent step
  const handleOpenDeal = (item) => {
    if (!item.dealId) return;
    if (item.role === "Agent") {
      navigate(`/new-deal/${item.dealId}?step=agent`);
    } else {
      navigate(`/new-deal/${item.dealId}`);
    }
  };

  return (
    <div className="followups-page-luxury" data-testid="followups-page">
      {/* Header bar */}
      <div className="page-header followups-luxury-header no-print">
        <div>
          <div className="eyebrow followups-eyebrow">
            <span className="eyebrow-beacon" />
            <span>{t("followups.eyebrow", "CUSTOMER & AGENT RELATIONSHIPS · ACTIVE PIPELINE")}</span>
          </div>
          <h1 data-testid="page-title" className="followups-hero-title">
            {t("followups.title", "Follow-ups")}
          </h1>
          <p className="followups-hero-subtitle">
            {t(
              "followups.subtitle",
              "Dedicated pipelines for Buyers, Sellers, and RTO Agents to ensure timely collections, document handovers, and task clearances."
            )}
          </p>
        </div>

        <button
          className="button button-primary followups-add-btn"
          onClick={() => setIsModalOpen(true)}
          data-testid="add-follow-up-button"
        >
          <Plus size={18} strokeWidth={2.4} />
          <span>{t("followups.add_button", "Add follow-up")}</span>
        </button>
      </div>

      {/* CRM Urgency Metrics Strip */}
      <div className="crm-urgency-strip">
        <div className="crm-urgency-pill crm-urgent" data-testid="metric-due-today">
          <Clock size={13} />
          <span>{totalDueToday} Due Today & Overdue</span>
        </div>
        <div className="crm-urgency-pill crm-upcoming" data-testid="metric-buyers">
          <Users size={13} />
          <span>{totalBuyerCount} Buyer Deliveries & Balances</span>
        </div>
        <div className="crm-urgency-pill" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)" }} data-testid="metric-sellers">
          <FileCheck size={13} />
          <span>{totalSellerCount} Seller Clearances</span>
        </div>
        <div className="crm-urgency-pill" style={{ background: "rgba(168, 85, 247, 0.12)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.3)" }} data-testid="metric-agents">
          <UserCheck size={13} />
          <span>{totalAgentCount} Agent RTO Tasks</span>
        </div>
        <div className="crm-urgency-pill crm-inflow" data-testid="metric-inflow">
          <WalletCards size={13} />
          <span>{money(totalCollectionQueue)} Collection Queue</span>
        </div>
      </div>

      {/* Category Pills & Toolbar */}
      <div className="toolbar followups-toolbar no-print">
        {/* Search */}
        <div className="search-field followups-search-field">
          <Search size={16} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by contact name, phone, vehicle, or task details..."
            data-testid="followups-search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} aria-label="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Separate Section Navigation Pills */}
        <div className="agents-filter-pills" role="tablist">
          <button
            type="button"
            className={`agents-filter-pill ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
            data-testid="tab-all-followups"
          >
            All Follow-ups ({combinedItems.length})
          </button>
          <button
            type="button"
            className={`agents-filter-pill ${activeTab === "buyer" ? "active" : ""}`}
            onClick={() => setActiveTab("buyer")}
            data-testid="tab-buyer-followups"
            style={activeTab === "buyer" ? { borderColor: "#38bdf8", color: "#38bdf8" } : {}}
          >
            🛒 Buyers ({combinedItems.filter((i) => i.role === "Buyer").length})
          </button>
          <button
            type="button"
            className={`agents-filter-pill ${activeTab === "seller" ? "active" : ""}`}
            onClick={() => setActiveTab("seller")}
            data-testid="tab-seller-followups"
            style={activeTab === "seller" ? { borderColor: "#fbbf24", color: "#fbbf24" } : {}}
          >
            🤝 Sellers ({combinedItems.filter((i) => i.role === "Seller").length})
          </button>
          <button
            type="button"
            className={`agents-filter-pill ${activeTab === "agent" ? "active" : ""}`}
            onClick={() => setActiveTab("agent")}
            data-testid="tab-agent-followups"
            style={activeTab === "agent" ? { borderColor: "#a855f7", color: "#c084fc" } : {}}
          >
            🏛️ Agents ({combinedItems.filter((i) => i.role === "Agent").length})
          </button>
        </div>

        {/* Status Filter */}
        <div className="followups-status-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="followups-select"
            data-testid="followups-status-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>
      </div>

      {/* SEPARATE SECTION 1: BUYER FOLLOW-UPS */}
      {(activeTab === "all" || activeTab === "buyer") && (
        <section
          className="follow-section luxury-follow-section followups-category-section buyer-section"
          data-testid="section-buyer-followups"
        >
          <div className="section-title followups-section-header">
            <div className="followups-title-block">
              <div className="followups-category-icon blue">
                <Users size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2>{t("followups.buyers_section", "Buyer Follow-ups")}</h2>
                  <span className="followup-role-pill buyer">
                    {buyerItems.length} {buyerItems.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
                <p className="followups-section-desc">
                  Balance collections, delivery appointments, advance clearances, and RC smart card handover.
                </p>
              </div>
            </div>
          </div>

          <div className="follow-list">
            {buyerItems.map((item, idx) => (
              <FollowUpRow
                key={item.id || idx}
                item={item}
                onToggle={handleToggleStatus}
                onWhatsApp={openWhatsApp}
                onOpenDeal={handleOpenDeal}
                testIdPrefix="buyer"
              />
            ))}

            {!buyerItems.length && (
              <div className="followups-empty-row">
                <p>No buyer follow-ups match the selected filters.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SEPARATE SECTION 2: SELLER FOLLOW-UPS */}
      {(activeTab === "all" || activeTab === "seller") && (
        <section
          className="follow-section luxury-follow-section followups-category-section seller-section"
          data-testid="section-seller-followups"
        >
          <div className="section-title followups-section-header">
            <div className="followups-title-block">
              <div className="followups-category-icon amber">
                <FileCheck size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2>{t("followups.sellers_section", "Seller Follow-ups")}</h2>
                  <span className="followup-role-pill seller">
                    {sellerItems.length} {sellerItems.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
                <p className="followups-section-desc">
                  Document collections, original bank NOCs, Form 29/30 endorsement signatures, and seller payout balances.
                </p>
              </div>
            </div>
          </div>

          <div className="follow-list">
            {sellerItems.map((item, idx) => (
              <FollowUpRow
                key={item.id || idx}
                item={item}
                onToggle={handleToggleStatus}
                onWhatsApp={openWhatsApp}
                onOpenDeal={handleOpenDeal}
                testIdPrefix="seller"
              />
            ))}

            {!sellerItems.length && (
              <div className="followups-empty-row">
                <p>No seller follow-ups match the selected filters.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SEPARATE SECTION 3: AGENT FOLLOW-UPS */}
      {(activeTab === "all" || activeTab === "agent") && (
        <section
          className="follow-section luxury-follow-section followups-category-section agent-section"
          data-testid="section-agent-followups"
        >
          <div className="section-title followups-section-header">
            <div className="followups-title-block">
              <div className="followups-category-icon purple">
                <UserCheck size={18} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2>{t("followups.agents_section", "Agent Follow-ups")}</h2>
                  <span className="followup-role-pill agent">
                    {agentItems.length} {agentItems.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
                <p className="followups-section-desc">
                  RTO transfer deadlines, TO/HPT/NOC certificates, clearance tracking, and agent commission settlements.
                </p>
              </div>
            </div>
          </div>

          <div className="follow-list">
            {agentItems.map((item, idx) => (
              <FollowUpRow
                key={item.id || idx}
                item={item}
                onToggle={handleToggleStatus}
                onWhatsApp={openWhatsApp}
                onOpenDeal={handleOpenDeal}
                testIdPrefix="agent"
              />
            ))}

            {!agentItems.length && (
              <div className="followups-empty-row">
                <p>No agent follow-ups match the selected filters.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Add Follow-up Modal */}
      {isModalOpen && (
        <AddFollowUpModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={(newItem) => {
            setItems((prev) => [newItem, ...prev]);
            setIsModalOpen(false);
          }}
          deals={deals}
        />
      )}
    </div>
  );
}

// Single Follow-up Row Component
function FollowUpRow({ item, onToggle, onWhatsApp, onOpenDeal, testIdPrefix }) {
  const isCompleted = item.status === "completed";
  const isUrgent = item.isUrgent || item.dueDate === "Today";
  const initials = item.name
    ? item.name
        .replace(/[^a-zA-Z\s]/g, " ")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "FL"
    : "FL";

  const roleClass =
    item.role === "Buyer" ? "buyer" : item.role === "Seller" ? "seller" : "agent";

  return (
    <div
      className={`follow-row luxury-follow-row followup-unified-row ${isUrgent ? "is-urgent" : ""} ${
        isCompleted ? "is-completed" : ""
      }`}
      data-testid={`follow-up-row-${testIdPrefix}-${item.id}`}
    >
      {/* Checkbox toggle */}
      <button
        type="button"
        className={`followup-checkbox-btn ${isCompleted ? "checked" : ""}`}
        onClick={() => onToggle(item.id)}
        title={isCompleted ? "Mark Pending" : "Mark Completed"}
        data-testid={`toggle-followup-${item.id}`}
      >
        {isCompleted ? <Check size={14} strokeWidth={3} /> : null}
      </button>

      {/* Avatar */}
      <div className={`person-avatar luxury-avatar role-${roleClass}`}>{initials}</div>

      {/* Person & Contact */}
      <div className="follow-person">
        <strong className={`follow-person-name ${isCompleted ? "line-through" : ""}`}>
          {item.name}
        </strong>
        {item.phone && (
          <a
            href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`}
            className="follow-phone-link"
            title="Call"
          >
            <Phone size={11} className="text-amber-400" />
            <span>{item.phone}</span>
          </a>
        )}
      </div>

      {/* Role Tag */}
      <span className={`followup-role-pill ${roleClass}`}>{item.role}</span>

      {/* Vehicle / Deal Ref */}
      <div className="follow-bike">
        <Bike size={15} className="text-blue-400" />
        <div>
          <b>{item.vehicle || "Deal Reference"}</b>
          {item.regNo && <small className="follow-reg-sub">{item.regNo}</small>}
        </div>
      </div>

      {/* Task / Work Details & Due Amount */}
      <div className="follow-due">
        <span className="follow-task-text" title={item.task}>
          {item.task}
        </span>
        {Number(item.amountDue) > 0 && (
          <strong className="due-gold-amount">{money(item.amountDue)}</strong>
        )}
      </div>

      {/* Due Date */}
      <div className="follow-date">
        <span className={`date-badge ${isUrgent ? "date-urgent" : "date-normal"}`}>
          {isUrgent && <span className="date-pulse-dot" />}
          {item.dueDate}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="followup-row-actions">
        {/* WhatsApp Button */}
        {item.phone && (
          <button
            type="button"
            className="followup-action-btn whatsapp"
            onClick={() => onWhatsApp(item)}
            title={`Send WhatsApp message to ${item.name}`}
            data-testid={`whatsapp-followup-${item.id}`}
          >
            <svg className="agent-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.25-4.38c0-4.51 3.67-8.18 8.18-8.18 2.18 0 4.24.85 5.79 2.39a8.14 8.14 0 0 1 2.4 5.79c0 4.51-3.67 8.18-8.18 8.18zm4.49-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z" />
            </svg>
            <span>WhatsApp</span>
          </button>
        )}

        {/* Open Deal */}
        {item.dealId && (
          <button
            type="button"
            className="open-button luxury-open-btn followup-open-btn"
            onClick={() => onOpenDeal(item)}
            title={item.role === "Agent" ? "Open Deal Agent Step" : "Open Deal"}
            data-testid={`open-followup-${item.id}`}
          >
            <span>{item.role === "Agent" ? "Agent Step" : "Open"}</span>
            <ArrowUpRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// Modal for Adding a New Follow-up
function AddFollowUpModal({ isOpen, onClose, onAdd, deals }) {
  const [role, setRole] = useState("Buyer"); // "Buyer" | "Seller" | "Agent"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [task, setTask] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [dueDate, setDueDate] = useState("Today");
  const [dealId, setDealId] = useState("");

  if (!isOpen) return null;

  // Quick autofill when choosing a deal
  const handleDealSelect = (e) => {
    const selectedId = e.target.value;
    setDealId(selectedId);
    if (!selectedId) return;

    const d = deals.find((deal) => deal.id === selectedId);
    if (!d) return;

    const v = d.vehicle || {};
    setVehicle(v.vehicle_name || `${v.make || ""} ${v.model || ""}`.trim() || "");

    if (role === "Buyer" && d.buyer?.name) {
      setName(d.buyer.name);
      setPhone(d.buyer.phone || "");
      const bal =
        (Number(d.payments?.selling_price) || 0) -
        (Number(d.payments?.received_from_buyer) || 0);
      if (bal > 0) setAmountDue(String(bal));
    } else if (role === "Seller" && d.seller?.name) {
      setName(d.seller.name);
      setPhone(d.seller.phone || "");
    } else if (role === "Agent" && d.agent?.name) {
      setName(d.agent.name);
      setPhone(d.agent.phone || "");
      setTask(d.agent.task || "RTO Documentation");
      if (d.agent.amount_balance) setAmountDue(String(d.agent.amount_balance));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      role,
      name: name.trim(),
      phone: phone.trim(),
      vehicle: vehicle.trim() || "Showroom Deal",
      task: task.trim() || (role === "Buyer" ? "Balance collection & delivery" : role === "Seller" ? "Document collect & payout" : "RTO documentation"),
      amountDue: Number(amountDue) || 0,
      dueDate: dueDate.trim() || "Today",
      isUrgent: dueDate.toLowerCase().includes("today"),
      dealId: dealId || null,
      status: "pending",
    };

    onAdd(newItem);
  };

  return (
    <div className="agent-handover-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="agent-handover-modal-shell followups-modal-shell"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "560px" }}
      >
        <div className="agent-handover-modal-header">
          <div className="agent-handover-header-left">
            <div className="agent-avatar-badge large" style={{ background: "#e5b94c22", color: "#e5b94c" }}>
              <Plus size={20} />
            </div>
            <div>
              <h2 className="agent-handover-title">Add New Follow-up</h2>
              <div className="agent-handover-subtitle">
                Create a scheduled follow-up for a Buyer, Seller, or Agent
              </div>
            </div>
          </div>
          <button type="button" className="agent-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="followups-modal-form">
          {/* Target Entity Selector */}
          <div className="followup-form-group">
            <label className="followup-form-label">Follow-up For (Entity):</label>
            <div className="followup-role-selector">
              <button
                type="button"
                className={`role-choice-pill buyer ${role === "Buyer" ? "selected" : ""}`}
                onClick={() => setRole("Buyer")}
              >
                🛒 Buyer
              </button>
              <button
                type="button"
                className={`role-choice-pill seller ${role === "Seller" ? "selected" : ""}`}
                onClick={() => setRole("Seller")}
              >
                🤝 Seller
              </button>
              <button
                type="button"
                className={`role-choice-pill agent ${role === "Agent" ? "selected" : ""}`}
                onClick={() => setRole("Agent")}
              >
                🏛️ RTO Agent
              </button>
            </div>
          </div>

          {/* Quick Select from existing deals */}
          {deals.length > 0 && (
            <div className="followup-form-group">
              <label className="followup-form-label">Link with Showroom Deal (Optional):</label>
              <select
                value={dealId}
                onChange={handleDealSelect}
                className="followup-modal-input"
              >
                <option value="">-- Select Deal to Autofill --</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.bill_number || d.id.slice(0, 8)} · {d.vehicle?.vehicle_name || "Vehicle"} (
                    {d.buyer?.name || d.seller?.name || "Client"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name & Phone */}
          <div className="followup-form-row">
            <div className="followup-form-group" style={{ flex: 1.2 }}>
              <label className="followup-form-label">{role} Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${role.toLowerCase()} name...`}
                className="followup-modal-input"
              />
            </div>
            <div className="followup-form-group" style={{ flex: 1 }}>
              <label className="followup-form-label">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9886012345"
                className="followup-modal-input"
              />
            </div>
          </div>

          {/* Vehicle Reference */}
          <div className="followup-form-group">
            <label className="followup-form-label">Vehicle Reference</label>
            <input
              type="text"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="e.g. Royal Enfield Hunter 350 (KA-05-MH-2024)"
              className="followup-modal-input"
            />
          </div>

          {/* Task / Work Details */}
          <div className="followup-form-group">
            <label className="followup-form-label">Follow-up Task / Work Details *</label>
            <input
              type="text"
              required
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder={
                role === "Agent"
                  ? "e.g. Verify Form 29/30 submission & NOC clearance"
                  : role === "Buyer"
                  ? "e.g. Balance collection ₹1,10,000 on delivery"
                  : "e.g. Collect original bank NOC & Form 35 receipt"
              }
              className="followup-modal-input"
            />
          </div>

          {/* Amount Due & Due Date */}
          <div className="followup-form-row">
            <div className="followup-form-group" style={{ flex: 1 }}>
              <label className="followup-form-label">Amount Due (₹, Optional)</label>
              <input
                type="number"
                min="0"
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                placeholder="0.00"
                className="followup-modal-input"
              />
            </div>
            <div className="followup-form-group" style={{ flex: 1 }}>
              <label className="followup-form-label">Due Date *</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Today / Tomorrow / 15 Oct 2026"
                className="followup-modal-input"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="followup-modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              <Plus size={16} /> Save Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
