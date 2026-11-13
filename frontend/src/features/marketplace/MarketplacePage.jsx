import React, { useState, useEffect, useMemo, useCallback } from "react";
import PublicNavbar from "@/components/marketplace/PublicNavbar";
import PublicHero from "@/components/marketplace/PublicHero";
import BrowseBikes from "@/components/marketplace/BrowseBikes";
import {
  BrandsSection,
  CategoriesSection,
  VehicleRail,
  CertificationSection,
  ProcessSection,
  AboutShowroomSection,
  ContactShowroomSection,
  PublicFooter,
} from "@/components/marketplace/PublicSections";
import VehicleDetailModal from "@/components/marketplace/VehicleDetailModal";
import EnquiryModal from "@/components/marketplace/EnquiryModal";
import { smoothScrollTo } from "@/components/marketplace/marketplaceUtils";
import { getPublicInventory } from "@/data/publicInventory";

export default function MarketplacePage({ dark, setDark }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState(null);

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [enquiryVehicle, setEnquiryVehicle] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const items = await getPublicInventory();
        if (isMounted) setInventory(items);
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

  // Summary is derived from the single inventory load (avoids a second IndexedDB read).
  const summary = useMemo(() => {
    const byBrand = {};
    const byType = {};
    for (const bike of inventory) {
      byBrand[bike.brand || "Other"] = (byBrand[bike.brand || "Other"] || 0) + 1;
      if (bike.vehicleType) byType[bike.vehicleType] = (byType[bike.vehicleType] || 0) + 1;
    }
    return { totalAvailable: inventory.length, byBrand, byType, brandsList: Object.keys(byBrand).sort(), typesList: Object.keys(byType).sort() };
  }, [inventory]);

  const featured = useMemo(
    () => [...inventory].filter((b) => b.sellingPrice).sort((a, b) => b.sellingPrice - a.sellingPrice).slice(0, 4),
    [inventory]
  );
  const recent = useMemo(
    () => [...inventory].sort((a, b) => String(b.listedAt || "").localeCompare(String(a.listedAt || ""))).slice(0, 8),
    [inventory]
  );

  const applyPreset = useCallback((filters) => {
    setPreset({ filters, nonce: Date.now() });
    smoothScrollTo("#browse-bikes");
  }, []);

  const openVehicle = useCallback((bike) => setSelectedVehicle(bike), []);
  const openEnquiry = useCallback((bike) => setEnquiryVehicle(bike), []);
  const closeVehicle = useCallback(() => setSelectedVehicle(null), []);
  const closeEnquiry = useCallback(() => setEnquiryVehicle(null), []);

  return (
    <div className={`mm-public selection:bg-[color:var(--mm-gold)] selection:text-neutral-950 ${dark ? "dark" : ""}`} data-testid="marketplace-page">
      <a href="#browse-bikes" className="mm-sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-neutral-900">
        Skip to inventory
      </a>
      <PublicNavbar dark={dark} setDark={setDark} totalBikes={summary.totalAvailable} />

      <main>
        <PublicHero
          totalAvailable={summary.totalAvailable}
          brands={summary.brandsList}
          types={summary.typesList}
          onQuickSearch={({ brand, type, budget }) => setPreset({ filters: { brand, type, budget }, nonce: Date.now() })}
        />

        <BrandsSection byBrand={summary.byBrand} onPickBrand={(brand) => applyPreset({ brand })} />

        <CategoriesSection byType={summary.byType} onPickType={(type) => applyPreset({ type })} />

        {inventory.length >= 3 && (
          <VehicleRail
            id="featured"
            eyebrow="Showroom picks"
            title="Featured vehicles"
            copy="Our most sought-after machines currently on the floor."
            vehicles={featured}
            onSelect={openVehicle}
            onEnquire={openEnquiry}
            testId="featured-rail"
          />
        )}

        {inventory.length >= 5 && (
          <VehicleRail
            id="recent"
            eyebrow="Just in"
            title="Recently added"
            copy="Freshly inspected arrivals, newest first."
            vehicles={recent}
            onSelect={openVehicle}
            onEnquire={openEnquiry}
            testId="recent-rail"
          />
        )}

        <BrowseBikes
          inventory={inventory}
          loading={loading}
          preset={preset}
          onSelectVehicle={openVehicle}
          onEnquireVehicle={openEnquiry}
        />

        <CertificationSection />
        <ProcessSection />
        <AboutShowroomSection />
        <ContactShowroomSection />
      </main>

      <PublicFooter />

      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={Boolean(selectedVehicle)}
        onClose={closeVehicle}
        onOpenEnquiry={openEnquiry}
        inventory={inventory}
        onSelectVehicle={openVehicle}
      />

      <EnquiryModal vehicle={enquiryVehicle} isOpen={Boolean(enquiryVehicle)} onClose={closeEnquiry} />
    </div>
  );
}
