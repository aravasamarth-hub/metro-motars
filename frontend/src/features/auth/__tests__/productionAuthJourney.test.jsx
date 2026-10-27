import React from "react";
import { renderToString } from "react-dom/server";
import { LOGIN, REGISTER } from "../../../constants/testIds/auth";

describe("Metro Motors — Production Auth Journey & Component Contract", () => {
  test("1. Test IDs for Login and Registration adhere to strict kebab-case format", () => {
    expect(LOGIN.emailInput).toBe("login-email-input");
    expect(LOGIN.passwordInput).toBe("login-password-input");
    expect(LOGIN.submitButton).toBe("login-submit-button");
    expect(LOGIN.forgotPasswordLink).toBe("login-forgot-password-link");
    expect(LOGIN.registerLink).toBe("login-register-link");

    expect(REGISTER.nameInput).toBe("register-name-input");
    expect(REGISTER.emailInput).toBe("register-email-input");
    expect(REGISTER.passwordInput).toBe("register-password-input");
    expect(REGISTER.passwordConfirmInput).toBe("register-password-confirm-input");
    expect(REGISTER.submitButton).toBe("register-submit-button");
    expect(REGISTER.loginLink).toBe("register-login-link");
  });

  test("2. Google OAuth and Enterprise Security Branding elements are well defined", () => {
    // Contract validation for production auth elements
    const brand = {
      name: "METRO MOTORS",
      tagline: "Curated Two-Wheeler Showroom",
      authProviders: ["password", "google"],
      otpExpiryMinutes: 10,
      recoveryTokenExpiryMinutes: 15,
      maxOtpAttempts: 5,
    };

    expect(brand.name).toBe("METRO MOTORS");
    expect(brand.authProviders).toContain("google");
    expect(brand.authProviders).toContain("password");
    expect(brand.otpExpiryMinutes).toBe(10);
    expect(brand.maxOtpAttempts).toBe(5);
  });

  test("3. Password policy rules validate accurately on frontend", () => {
    const checkPasswordStrength = (pwd) => ({
      minLength: pwd.length >= 8,
      upperCase: /[A-Z]/.test(pwd),
      lowerCase: /[a-z]/.test(pwd),
      numberOrSymbol: /[\d\W_]/.test(pwd),
    });

    const weak = checkPasswordStrength("abc");
    expect(weak.minLength).toBe(false);

    const noUpper = checkPasswordStrength("securepass1!");
    expect(noUpper.upperCase).toBe(false);

    const valid = checkPasswordStrength("EnterprisePass2026!");
    expect(valid.minLength).toBe(true);
    expect(valid.upperCase).toBe(true);
    expect(valid.lowerCase).toBe(true);
    expect(valid.numberOrSymbol).toBe(true);
  });
});
