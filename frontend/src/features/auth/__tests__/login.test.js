import { DEMO_PERSONAS } from "../../../context/AuthContext";
import { LOGIN, REGISTER, LOGOUT } from "../../../constants/testIds/auth";

describe("Metro Motors - Enterprise Login & Auth System", () => {
  test("DEMO_PERSONAS defines all 3 core showroom roles with verified profiles", () => {
    expect(DEMO_PERSONAS).toHaveLength(3);

    const owner = DEMO_PERSONAS.find((p) => p.roleKey === "OWNER");
    expect(owner).toBeDefined();
    expect(owner.name).toBe("Alex Kumar");
    expect(owner.email).toBe("alex@metromotors.in");
    expect(owner.role).toContain("Showroom Owner");
    expect(owner.badgeColor).toBe("#f59e0b");

    const agent = DEMO_PERSONAS.find((p) => p.roleKey === "AGENT");
    expect(agent).toBeDefined();
    expect(agent.name).toBe("Rajesh Sharma");
    expect(agent.email).toBe("rajesh@metromotors.in");
    expect(agent.role).toContain("Sales Lead");
    expect(agent.badgeColor).toBe("#38bdf8");

    const manager = DEMO_PERSONAS.find((p) => p.roleKey === "MANAGER");
    expect(manager).toBeDefined();
    expect(manager.name).toBe("Priya Nair");
    expect(manager.email).toBe("priya@metromotors.in");
    expect(manager.role).toContain("Finance");
    expect(manager.badgeColor).toBe("#a855f7");
  });

  test("LOGIN test IDs are properly formatted and accessible", () => {
    expect(LOGIN.emailInput).toBe("login-email-input");
    expect(LOGIN.passwordInput).toBe("login-password-input");
    expect(LOGIN.submitButton).toBe("login-submit-button");
    expect(LOGIN.forgotPasswordLink).toBe("login-forgot-password-link");
    expect(LOGOUT.button).toBe("logout-button");
  });

  test("Persona email matching resolves correctly for all roles", () => {
    const findByEmail = (email) =>
      DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());

    expect(findByEmail("alex@metromotors.in")?.name).toBe("Alex Kumar");
    expect(findByEmail("rajesh@metromotors.in")?.name).toBe("Rajesh Sharma");
    expect(findByEmail("priya@metromotors.in")?.name).toBe("Priya Nair");
    expect(findByEmail("unknown@email.com")).toBeUndefined();
  });
});
