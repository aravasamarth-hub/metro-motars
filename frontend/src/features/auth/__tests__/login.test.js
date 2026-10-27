import { DEMO_PERSONAS } from "../../../context/AuthContext";
import { LOGIN, LOGOUT } from "../../../constants/testIds/auth";

describe("Metro Motors - Enterprise Login & Auth System", () => {
  test("DEMO_PERSONAS defines OWNER and WORKER showroom roles with verified profiles and no AGENT access", () => {
    expect(DEMO_PERSONAS).toHaveLength(2);

    const owner = DEMO_PERSONAS.find((p) => p.roleKey === "OWNER");
    expect(owner).toBeDefined();
    expect(owner.name).toBe("Alex Kumar");
    expect(owner.email).toBe("alex@metromotors.in");
    expect(owner.role).toContain("Showroom Owner");
    expect(owner.badgeColor).toBe("#f59e0b");

    const worker = DEMO_PERSONAS.find((p) => p.roleKey === "WORKER");
    expect(worker).toBeDefined();
    expect(worker.name).toBe("Rahul Verma");
    expect(worker.email).toBe("rahul@metromotors.in");
    expect(worker.role).toContain("Showroom Operations");
    expect(worker.badgeColor).toBe("#38bdf8");

    // Verify AGENT access has been removed
    const agent = DEMO_PERSONAS.find((p) => p.roleKey === "AGENT");
    expect(agent).toBeUndefined();
  });

  test("LOGIN test IDs are properly formatted and accessible", () => {
    expect(LOGIN.emailInput).toBe("login-email-input");
    expect(LOGIN.passwordInput).toBe("login-password-input");
    expect(LOGIN.submitButton).toBe("login-submit-button");
    expect(LOGIN.forgotPasswordLink).toBe("login-forgot-password-link");
    expect(LOGOUT.button).toBe("logout-button");
  });

  test("Persona email matching resolves correctly for OWNER and WORKER roles", () => {
    const findByEmail = (email) =>
      DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());

    expect(findByEmail("alex@metromotors.in")?.name).toBe("Alex Kumar");
    expect(findByEmail("rahul@metromotors.in")?.name).toBe("Rahul Verma");
    expect(findByEmail("rajesh@metromotors.in")).toBeUndefined();
    expect(findByEmail("unknown@email.com")).toBeUndefined();
  });
});
