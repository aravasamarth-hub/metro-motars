import React, { useState, useEffect } from "react";
import PublicNavbar from "@/components/marketplace/PublicNavbar";
import PublicHero from "@/components/marketplace/PublicHero";
import BrowseBikes from "@/components/marketplace/BrowseBikes";
import {
  CertificationSection,
  AboutShowroomSection,
  ContactShowroomSection,
  PublicFooter,
} from "@/components/marketplace/PublicSections";
import VehicleDetailModal from "@/components/marketplace/VehicleDetailModal";
import EnquiryModal from "@/components/marketplace/EnquiryModal";
import { getPublicInventory, getInventorySummary } from "@/data/publicInventory";

export default function MarketplacePage({ dark, setDark }) {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({ totalAvailable: 0, brandsList: [] });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [enquiryVehicle, setEnquiryVehicle] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [items, stats] = await Promise.all([
          getPublicInventory(),
          getInventorySummary(),
        ]);
        if (isMounted) {
          setInventory(items);
          setSummary(stats);
        }
      } catch (err) {
        console.error("Error loading marketplace data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    // Listen to changes in deals (e.g. if a deal is marked sold in another tab)
    const handleUpdate = () => loadData();
    window.addEventListener("metro-deals-changed", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("metro-deals-changed", handleUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#07090e] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950 transition-colors duration-200">
      {/* 1. Header & Navigation */}
      <PublicNavbar
        dark={dark}
        setDark={setDark}
        totalBikes={summary.totalAvailable}
      />

      <main>
        {/* 2. Customer Hero with Live Inventory Summary */}
        <PublicHero
          totalAvailable={summary.totalAvailable}
          brands={summary.brandsList}
        />

        {/* 3. Motorcycle Inventory Marketplace (Browse Bikes) */}
        <BrowseBikes
          inventory={inventory}
          onSelectVehicle={(bike) => setSelectedVehicle(bike)}
          onEnquireVehicle={(bike) => setEnquiryVehicle(bike)}
        />

        {/* 4. 120-Point Certification Standards */}
        <CertificationSection />

        {/* 5. About Showroom */}
        <AboutShowroomSection />

        {/* 6. Contact & Visit Showroom */}
        <ContactShowroomSection />
      </main>

      {/* 7. Public Footer */}
      <PublicFooter />

      {/* 8. Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
        onOpenEnquiry={(bike) => setEnquiryVehicle(bike)}
      />

      {/* 9. Contact to Purchase Enquiry Modal */}
      <EnquiryModal
        vehicle={enquiryVehicle}
        isOpen={Boolean(enquiryVehicle)}
        onClose={() => setEnquiryVehicle(null)}
      />
    </div>
  );
}
