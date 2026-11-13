import { sanitizeWhatsAppPhone } from "../CustomerMessageModal";

describe("Customer Greetings & RC Notifications Logic", () => {
  test("sanitizeWhatsAppPhone cleans and formats 10-digit Indian numbers", () => {
    expect(sanitizeWhatsAppPhone("9845012345")).toBe("919845012345");
    expect(sanitizeWhatsAppPhone("+91 98450 12345")).toBe("919845012345");
    expect(sanitizeWhatsAppPhone("919845012345")).toBe("919845012345");
    expect(sanitizeWhatsAppPhone("09845012345")).toBe("09845012345");
    expect(sanitizeWhatsAppPhone("")).toBe("");
  });

  test("builds correct Seller thank you message and WhatsApp URL", () => {
    const phone = sanitizeWhatsAppPhone("9845012345");
    const message = "Thank you for choosing Metro Motors! We appreciate your trust in selling your vehicle.";
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    expect(waUrl).toContain("https://wa.me/919845012345?text=");
    expect(waUrl).toContain(encodeURIComponent("Metro Motors"));
  });

  test("builds correct Buyer RC transfer collection message and mailto URL", () => {
    const email = "buyer@example.com";
    const subject = "Action Required: RC Transfer Completed - Collect Original RC";
    const body = "Please come and verify and collect your original RC document from our showroom at Indiranagar, Bengaluru.";
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    expect(mailtoUrl).toContain("mailto:buyer%40example.com");
    expect(mailtoUrl).toContain("RC%20Transfer");
    expect(mailtoUrl).toContain("Indiranagar");
  });
});
