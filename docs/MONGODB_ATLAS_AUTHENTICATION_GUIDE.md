# Metro Motors — Production MongoDB Atlas & Authentication Architecture Guide

This guide provides step-by-step instructions for configuring **MongoDB Atlas**, **Google OAuth 2.0**, and **SMTP Email Delivery** for the Metro Motors vehicle marketplace platform.

---

## 1. System Architecture Overview

```mermaid
graph TD
    Client["React Frontend (SPA)<br/>Port 3001"] -->|HTTP / JSON + Bearer JWT| API["FastAPI Backend Server<br/>Port 8001"]
    API -->|Async Motor Client<br/>Connection Pool| Atlas[("MongoDB Atlas Database<br/>'motors'")]
    API -->|SMTP TLS Port 587| SMTP["Email Provider<br/>(Gmail / Brevo / SES)"]
    API -->|Tokeninfo Verification| Google["Google OAuth 2.0<br/>Identity Services"]

    subgraph "MongoDB Collections & Security"
        Atlas --> Users["users<br/>(unique: normalizedEmail)"]
        Atlas --> ResetRequests["password_reset_requests<br/>(HMAC OTP, TTL expiry)"]
        Atlas --> Showroom["deals, vehicles, bills..."]
    end
```

---

## 2. MongoDB Atlas Configuration

### Step 2.1: Create your MongoDB Atlas Cluster
1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Click **Create** to deploy a cluster (M0 Free tier or dedicated M10+ for production).
3. Choose your preferred cloud provider and region (e.g. AWS `ap-south-1` Mumbai for Indian showroom deployment).

### Step 2.2: Create a Least-Privilege Database User
1. Navigate to **Security** → **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set Username: e.g. `metro_app_user`.
5. Generate a strong password (save it securely).
6. Under **Database User Privileges**, select **Built-in Role** → **Read and write to any database** (or restrict specifically to the `motors` database: `readWrite@motors`).
7. Click **Add User**.

> [!IMPORTANT]
> Do not use the Atlas Administrative account (`atlasAdmin`) for routine application runtime access.

### Step 2.3: Configure Network Access (IP Whitelist)
1. Navigate to **Security** → **Network Access**.
2. Click **Add IP Address**.
3. For local development / dynamic IPs: Add your current public IP address or click **Add Current IP Address**.
4. For production cloud deployments (AWS ECS, Render, Railway, DigitalOcean): Add your production server's static outbound IP / NAT gateway.
5. Save the network entry.

### Step 2.4: Copy Connection String
1. Navigate to **Deployment** → **Database** → Click **Connect**.
2. Choose **Drivers** (Python / Motor).
3. Copy the connection string:
   ```env
   mongodb+srv://metro_app_user:<DB_PASSWORD>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
4. Paste it into your `backend/.env` file:
   ```env
   MONGODB_URI="mongodb+srv://metro_app_user:<YOUR_PASSWORD>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"
   MONGODB_DB_NAME="motors"
   ```

### Step 2.5: Automatic Index Verification
The backend automatically creates and verifies all necessary database indexes upon startup:
- `users`:
  - `idx_users_normalized_email_unique` (`normalizedEmail`: 1, **Unique: true**)
  - `idx_users_email` (`email`: 1)
  - `idx_users_google_sub` (`googleSubjectId`: 1, **Sparse: true**)
  - `idx_users_role` (`role`: 1)
- `password_reset_requests`:
  - `idx_pwd_reset_email` (`email`: 1)
  - `idx_pwd_reset_recovery_token` (`recoveryToken`: 1, **Sparse: true**)
  - `idx_pwd_reset_ttl_expires` (`expiresAt`: 1, **expireAfterSeconds: 0**)

---

## 3. Google OAuth 2.0 Setup

### Step 3.1: Create Project in Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `Metro Motors Showroom`.

### Step 3.2: Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**.
2. Select User Type: **External** → Click **Create**.
3. Fill in:
   - App name: `Metro Motors`
   - User support email: your email address
   - Authorized domains: your domain (e.g. `metromotors.in` or leave empty for localhost)
   - Developer contact email: your email address
4. Click **Save and Continue** through Scopes (default `email`, `profile`, `openid`).

### Step 3.3: Create Web Client ID Credentials
1. Go to **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
2. Application type: **Web application**.
3. Name: `Metro Motors Web Client`.
4. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `https://yourproductiondomain.com`
5. **Authorized redirect URIs**:
   - `http://localhost:3001/login`
   - `https://yourproductiondomain.com/login`
6. Click **Create** and copy your **Client ID** and **Client Secret**.

### Step 3.4: Configure Environment Variables
- In `backend/.env`:
  ```env
  GOOGLE_CLIENT_ID="1234567890-abcdef.apps.googleusercontent.com"
  GOOGLE_CLIENT_SECRET="GOCSPX-your_google_secret"
  ```
- In `frontend/.env`:
  ```env
  REACT_APP_GOOGLE_CLIENT_ID="1234567890-abcdef.apps.googleusercontent.com"
  ```

---

## 4. SMTP Email Delivery Setup (Password Recovery OTP)

### Option A: Gmail App Password (Fastest for Testing)
1. Go to your [Google Account Security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is enabled.
3. Search for **App passwords** (or go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Create an App password named `Metro Motors Backend`.
5. Copy the 16-character generated password.
6. Configure in `backend/.env`:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="youraddress@gmail.com"
   SMTP_PASS="xxxx xxxx xxxx xxxx"
   EMAIL_FROM="youraddress@gmail.com"
   EMAIL_FROM_NAME="Metro Motors Bangalore"
   ```

### Option B: Brevo (Sendinblue) / SendGrid (Production Recommendation)
1. Register at [Brevo](https://www.brevo.com/) or [SendGrid](https://sendgrid.com/).
2. Verify your sender domain (`metromotors.in`).
3. Generate an SMTP API Key.
4. Configure in `backend/.env`:
   ```env
   SMTP_HOST="smtp-relay.brevo.com"
   SMTP_PORT="587"
   SMTP_USER="your-login@brevo.com"
   SMTP_PASS="your-smtp-api-key"
   EMAIL_FROM="noreply@metromotors.in"
   EMAIL_FROM_NAME="Metro Motors Bangalore"
   ```

---

## 5. Health Check & Diagnostics

Check the health endpoint at any time to verify database and email subsystem status:

```bash
curl http://127.0.0.1:8001/api/auth/health
```

Sample Healthy Output:
```json
{
  "status": "healthy",
  "service": "Metro Motors Authentication Atelier",
  "database": {
    "connected": true,
    "database_name": "motors",
    "sanitized_uri": "mongodb+srv://metro_app_user:***@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority",
    "remote_db_disabled": false,
    "last_error": null
  },
  "smtp_configured": true,
  "google_oauth_configured": true
}
```
