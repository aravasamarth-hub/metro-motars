import React from "react";
import { renderToString } from "react-dom/server";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/" }),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  NavLink: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

import MarketplacePage from "../MarketplacePage";
import BrowseBikes from "../../../components/marketplace/BrowseBikes";
import VehicleDetailModal from "../../../components/marketplace/VehicleDetailModal";
import EnquiryModal from "../../../components/marketplace/EnquiryModal";
import PublicNavbar from "../../../components/marketplace/PublicNavbar";
import PublicHero from "../../../components/marketplace/PublicHero";
import {
  CertificationSection,
  AboutShowroomSection,
  ContactShowroomSection,
  PublicFooter,
} from "../../../components/marketplace/PublicSections";
import { MOTORCYCLE_PLACEHOLDER_SVG } from "../../../data/publicInventory";
import { SHOWROOM_CONTACT } from "../../../data/customerEnquiry";

describe("Phase 2: Customer Journey & Component Verification", () => {
  const sampleInventory = [
    {
      id: "bike-01",
      title: "Royal Enfield Himalayan 450 Summit",
      brand: "Royal Enfield",
      model: "Himalayan 450",
      variant: "Summit Tubeless",
      year: 2024,
      engineCc: 452,
      odometerKm: 4200,
      color: "Kamet White",
      fuelType: "Petrol",
      sellingPrice: 317000,
      status: "Available",
      registrationLocation: "KA-04-****",
      condition: "120-Point Certified",
      photos: [
        { id: "p1", name: "front.jpg", url: "https://example.com/bike1.jpg" },
        { id: "p2", name: "side.jpg", url: "https://example.com/bike2.jpg" },
      ],
      primaryPhoto: "https://example.com/bike1.jpg",
      inspectionSummary: [
        "120-Point Multi-Point Check",
        "Engine Compression Tested",
        "Title & RTO Verification",
      ],
      description: "Pristine Himalayan 450 in Kamet White.",
    },
    {
      id: "bike-02",
      title: "KTM 390 Duke Gen-3",
      brand: "KTM",
      model: "390 Duke",
      variant: "Quickshifter+",
      year: 2024,
      engineCc: 399,
      odometerKm: 6800,
      color: "Electronic Orange",
      fuelType: "Petrol",
      sellingPrice: 268000,
      status: "Available",
      registrationLocation: "KA-01-****",
      condition: "120-Point Certified",
      photos: [],
      primaryPhoto: MOTORCYCLE_PLACEHOLDER_SVG,
      inspectionSummary: ["120-Point Multi-Point Check"],
      description: "Performance streetfighter with quickshifter.",
    },
  ];

  test("1. Marketplace Navbar renders branding, navigation, direct phone link, and decoupled public actions", () => {
    const html = renderToString(
      <PublicNavbar dark={true} setDark={() => {}} />
    );

    expect(html).toContain("METRO");
    expect(html).toContain("MOTORS");
    expect(html).toContain("Pre-Owned");
    expect(html).toContain("#browse-bikes");
    expect(html).toContain("#standards");
    expect(html).toContain("#contact");
    expect(html).toContain(`href="tel:${SHOWROOM_CONTACT.rawPhone}"`);
    expect(html).not.toContain("Dealer Console");
    expect(html).not.toContain("Showroom Staff Login");
  });

  test("2. Public Hero renders value proposition and live stock indicator", () => {
    const html = renderToString(
      <PublicHero totalAvailable={8} />
    );

    expect(html).toContain("Find Your Next Ride");
    expect(html).toContain("Ride With Confidence");
    expect(html).toContain("8");
    expect(html).toContain("Live Count");
    expect(html).toContain("120-Point");
  });

  test("3. BrowseBikes renders motorcycle cards with specifications, price, and masked registration", () => {
    const html = renderToString(
      <BrowseBikes
        inventory={sampleInventory}
        onSelectVehicle={() => {}}
        onEnquireVehicle={() => {}}
      />
    );

    expect(html).toContain("Royal Enfield Himalayan 450 Summit");
    expect(html).toContain("KTM 390 Duke Gen-3");
    expect(html).toContain("3,17,000");
    expect(html).toContain("2,68,000");
    expect(html).toContain("452");
    expect(html).toContain("399");
    expect(html).toContain("KA-04-****");
    expect(html).toContain("KA-01-****");
    expect(html).toContain("Enquire");
  });

  test("4. BrowseBikes renders empty state gracefully when no bikes match", () => {
    const html = renderToString(
      <BrowseBikes
        inventory={[]}
        onSelectVehicle={() => {}}
        onEnquireVehicle={() => {}}
      />
    );

    expect(html).toContain("No motorcycles match your filters");
    expect(html).toContain("Show All Motorcycles");
  });

  test("5. VehicleDetailModal renders technical specifications and gallery", () => {
    const html = renderToString(
      <VehicleDetailModal
        vehicle={sampleInventory[0]}
        isOpen={true}
        onClose={() => {}}
        onOpenEnquiry={() => {}}
      />
    );

    expect(html).toContain("Royal Enfield Himalayan 450 Summit");
    expect(html).toContain("Showroom Selling Price");
    expect(html).toContain("3,17,000");
    expect(html).toContain("All RTO Transfer &amp; Certification Included");
    expect(html).toContain("Verified Technical Specifications");
    expect(html).toContain("452");
    expect(html).toContain("4,200");
    expect(html).toContain("km");
    expect(html).toContain("Kamet White");
    expect(html).toContain("KA-04-****");
    expect(html).toContain("WhatsApp");
  });

  test("6. VehicleDetailModal gracefully uses placeholder SVG when photos array is empty", () => {
    const html = renderToString(
      <VehicleDetailModal
        vehicle={sampleInventory[1]} // has empty photos array
        isOpen={true}
        onClose={() => {}}
        onOpenEnquiry={() => {}}
      />
    );

    expect(html).toContain("KTM 390 Duke Gen-3");
    expect(html).toContain("data:image/svg+xml");
  });

  test("7. EnquiryModal renders direct phone and WhatsApp contact options and form fields", () => {
    const html = renderToString(
      <EnquiryModal
        vehicle={sampleInventory[0]}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(html).toContain("Purchase Enquiry");
    expect(html).toContain("Royal Enfield Himalayan 450 Summit");
    expect(html).toContain(`tel:${SHOWROOM_CONTACT.rawPhone}`);
    expect(html).toContain("WhatsApp Showroom");
    expect(html).toContain("Your Full Name");
    expect(html).toContain("Mobile Number (WhatsApp)");
    expect(html).toContain("Preferred Contact Method");
    expect(html).toContain("Send Enquiry");
  });

  test("8. Certification, About, and Contact sections render showroom standards and hours", () => {
    const certHtml = renderToString(<CertificationSection />);
    expect(certHtml).toContain("The 120-Point Showroom Certification");
    expect(certHtml).toContain("Engine &amp; Transmission Testing");
    expect(certHtml).toContain("Chassis &amp; Frame Alignment");

    const aboutHtml = renderToString(<AboutShowroomSection />);
    expect(aboutHtml).toContain("About Metro Motors");
    expect(aboutHtml).toContain("100%");
    expect(aboutHtml).toContain("Verified History");

    const contactHtml = renderToString(<ContactShowroomSection />);
    expect(contactHtml).toContain("Visit Our Showroom");
    expect(contactHtml).toContain(SHOWROOM_CONTACT.address);
    expect(contactHtml).toContain(SHOWROOM_CONTACT.businessHours);

    const footerHtml = renderToString(
      <PublicFooter />
    );
    expect(footerHtml).toContain("Metro Motors Bengaluru");
    expect(footerHtml).not.toContain("Staff Login");
  });

  test("9. Strict Public Privacy Audit: No confidential words exist in public marketplace DOM", () => {
    const fullHtml = renderToString(
        <div>
          <PublicNavbar dark={true} setDark={() => {}} onStaffLogin={() => {}} />
          <PublicHero availableCount={2} />
          <BrowseBikes inventory={sampleInventory} onSelectVehicle={() => {}} onEnquireVehicle={() => {}} />
          <CertificationSection />
          <AboutShowroomSection />
          <ContactShowroomSection />
          <PublicFooter />
        </div>
    );

    // Assert that NO internal business terms or confidential keys are present
    const forbiddenPatterns = [
      /purchase[_\s]price/i,
      /paid[_\s]to[_\s]seller/i,
      /dealer[_\s]margin/i,
      /gross[_\s]margin/i,
      /fleet[_\s]valuation/i,
      /showroom[_\s]telemetry/i,
      /agent[_\s]payout/i,
      /aadhaar/i,
      /pan[_\s]card/i,
      /buyer[_\s]kyc/i,
      /seller[_\s]kyc/i,
    ];

    for (const pattern of forbiddenPatterns) {
      expect(fullHtml).not.toMatch(pattern);
    }
  });
});
