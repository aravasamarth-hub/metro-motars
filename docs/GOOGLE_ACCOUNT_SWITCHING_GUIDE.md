# Google Account Switching & Profile Reference Guide

**Project:** Metro Motors / Metro Motors Management  
**Environment:** Windows 11 — Google Chrome  
**Date of Audit:** 2026-11-01  
**Security Status:** Passwords, tokens, and cookies are never stored, logged, or extracted.

---

## 1. Verified Google Accounts & Chrome Profiles

Our capability diagnostic of your Windows Google Chrome installation confirmed that both of your accounts are already established as distinct, secure Chrome profiles on this PC:

| Account Identifier | Email Address | Chrome Profile Directory | Profile Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Account 1 (Primary)** | `aravasamarth@gmail.com` | `Default` | Samarth (Arava Samarth) | ✅ Fully Configured |
| **Account 2 (Secondary)** | `samartharava@gmail.com` | `Profile 1` | Arava (Arava Samarth) | ✅ Fully Configured |
| **Account 3 (Optional / Workspace)** | *Reserved for custom showroom / workspace account* | — | — | Available upon designation |

---

## 2. Launching or Switching Between Accounts

Because Chrome profiles maintain completely separate cookie jars, sessions, extensions, and bookmarks, launching a specific profile is instant, 100% isolated, and never risks mixing up your sessions.

### Option A: From the Windows Terminal / Run Dialog

You can launch either profile directly with these exact commands:

#### To open Account 1 (`aravasamarth@gmail.com`):
```powershell
Start-Process "chrome.exe" -ArgumentList '--profile-directory="Default"', 'https://myaccount.google.com'
```

#### To open Account 2 (`samartharava@gmail.com`):
```powershell
Start-Process "chrome.exe" -ArgumentList '--profile-directory="Profile 1"', 'https://myaccount.google.com'
```

### Option B: From the Chrome Interface

1. Look at the top-right corner of Google Chrome (next to the three vertical dots menu).
2. Click your circular profile avatar icon.
3. Under **Other profiles**, click:
   - **Samarth** for `aravasamarth@gmail.com`
   - **Arava** for `samartharava@gmail.com`
4. A new dedicated window opens instantly with that account already signed in.

---

## 3. How to Identify the Active Account

Before performing sensitive operations on Google Cloud, Google Drive, or Supabase:

1. **Check the Avatar Icon:** The round avatar in the top-right of your browser window indicates which profile is active.
2. **Visit Accounts Hub:** Navigating to `https://accounts.google.com` will immediately display the active email address and name.
3. **URL Multi-Account Indices:** When using Google Docs, Sheets, or Gmail, the URL path indicates the active sign-in:
   - `https://mail.google.com/mail/u/0/` ➔ First signed-in account in that window
   - `https://mail.google.com/mail/u/1/` ➔ Second signed-in account in that window

---

## 4. Troubleshooting & Verification

### What to do if Google asks for verification (2FA / OTP)
- If Google triggers a 2-Step Verification prompt or mobile phone prompt, **complete it directly on your screen or phone**.
- Antigravity will pause and wait for your verification to finish.
- Never paste verification codes, recovery codes, or passwords into any AI prompt or terminal script.

### What to do if a session expires
1. Open the specific profile window using the command or Chrome avatar menu.
2. Log in using Google's official sign-in page.
3. Once logged in, the session remains active in that profile's secure storage.

---

## 5. Security & Isolation Guidelines

- **Zero Credential Storage:** This guide, the codebase, and all agent workflows do not contain any plaintext passwords or session cookies.
- **Strict Role Boundaries:**
  - Tasks intended for **Account 1** must be executed within the `Default` profile.
  - Tasks intended for **Account 2** must be executed within `Profile 1`.
- **Sensitive Operations:** Any operation involving financial purchases, public YouTube publishing, account security changes, or database modifications requires explicit human approval.

