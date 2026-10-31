# Metro Motors — Supabase Free Project Keepalive Manual Setup Guide

> **Audience:** Non-programmer / Business Owner  
> **Cost:** ₹0 (100% Free, uses GitHub Actions free tier and Supabase free tier allowances)  
> **Time to complete:** ~5 minutes  
> **Purpose:** Keep your free Supabase database project active and avoid the automatic 7-day inactivity pause, without generating fake emails, fake logins, or exposing private data.

---

## What This Setup Does (In Plain Words)

Supabase automatically pauses projects on the free plan if nobody queries the database for ~7 days.

To prevent this:
1. We create a tiny, isolated, read-only health check table in your Supabase project (`project_keepalive`) with just **1 row**.
2. A free GitHub background automation (GitHub Action) silently asks for that single row **every 8 hours**.
3. Because Supabase sees regular query activity, it registers the project as actively used and avoids inactivity pausing.

---

## Step-by-Step Instructions

### Step 1: Open Supabase and Run the Health-Check SQL

1. Log into your Supabase account: **[https://supabase.com/dashboard](https://supabase.com/dashboard)**
2. Click on your **Metro Motors / Metro Motors** project.
3. In the left-hand navigation sidebar, click on the **SQL Editor** icon (looks like a terminal or `>_` icon).
4. Click **New Query** (or the **+** button at the top).
5. Open your project file [`supabase/migrations/001_create_project_keepalive.sql`](file:///d:/website%20disign/metro%20motors/app/supabase/migrations/001_create_project_keepalive.sql), copy its entire contents, and paste it into the SQL Editor:

```sql
-- 1. Create the keepalive health-check table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.project_keepalive (
    id INTEGER PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'active'
);

-- 2. Insert exactly one baseline health-check record (id = 1)
INSERT INTO public.project_keepalive (id, status)
VALUES (1, 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security (RLS) to enforce strict access control
ALTER TABLE public.project_keepalive
ENABLE ROW LEVEL SECURITY;

-- 4. Grant schema USAGE and table SELECT permission to the 'anon' role
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT
ON TABLE public.project_keepalive
TO anon;

-- 5. Revoke any unintended write privileges from anon as defensive hardening
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES
ON TABLE public.project_keepalive
FROM anon;

-- 6. Define an idempotent Row Level Security (RLS) policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'project_keepalive'
          AND policyname = 'keepalive_read_only'
    ) THEN
        CREATE POLICY keepalive_read_only
        ON public.project_keepalive
        FOR SELECT
        TO anon
        USING (id = 1);
    END IF;
END $$;
```

6. Click the green **Run** button (or press `Ctrl + Enter` / `Cmd + Enter`).
7. You should see a message saying: **`Success. No rows returned`**.
   *(Your table is now created, locked down with Row Level Security, and accessible only as read-only).*

---

### Step 2: Copy Your Supabase API Keys

You need two pieces of information from Supabase:

1. In the Supabase left sidebar, click the **Settings** gear icon (bottom left).
2. Under "Configuration" in the submenu, click **API** (or **Data API** in newer dashboards).
3. Look for the following fields:
   * **Project URL:** Looks like `https://abcdefghijklm.supabase.co`  
     👉 Click **Copy**. (This will be your `SUPABASE_URL`).
   * **Project API Keys -> `anon` / `public`:** A long text string starting with `eyJ...` (or modern `sb_publishable_...`).  
     👉 Click **Copy**. (This will be your `SUPABASE_PUBLISHABLE_KEY`).

> ⚠️ **CRITICAL SECURITY NOTE:**  
> Never copy the `service_role` key! Only copy the `anon` / `public` key. The keepalive system only needs public read permissions.

---

### Step 3: Add Secrets to Your GitHub Repository

1. Open your GitHub repository in your browser:  
   **[https://github.com/aravasamarth-hub/metro-motars](https://github.com/aravasamarth-hub/metro-motars)**
2. Click on the **Settings** tab at the top right of your repository.
3. In the left-hand sidebar under "Security", click **Secrets and variables** ➔ **Actions**.
4. Click the green button: **New repository secret**.
5. Add the first secret:
   * **Name:** `SUPABASE_URL`
   * **Secret:** Paste your Supabase Project URL (e.g. `https://your-project-id.supabase.co`)
   * Click **Add secret**.
6. Click **New repository secret** again and add the second secret:
   * **Name:** `SUPABASE_PUBLISHABLE_KEY`
   * **Secret:** Paste your Supabase `anon` / `public` API key (the one starting with `eyJ...`)
   * Click **Add secret**.

Both secrets will now show as encrypted in your repository. GitHub automatically masks them so they can never be leaked in logs.

---

### Step 4: Commit and Push the New Workflow to GitHub

From your terminal or Git client in the `app` directory:

```bash
git add .github/workflows/supabase-keepalive.yml supabase/migrations/001_create_project_keepalive.sql SUPABASE_KEEPALIVE_SETUP_GUIDE.md SUPABASE_KEEPALIVE_TEST_REPORT.md
git commit -m "feat(devops): add Supabase free tier keepalive workflow and migration"
git push origin main
```

---

### Step 5: Test the Workflow Manually

Once the code is pushed:

1. Go to your GitHub repository: **[https://github.com/aravasamarth-hub/metro-motars](https://github.com/aravasamarth-hub/metro-motars)**
2. Click on the **Actions** tab at the top.
3. In the left sidebar, click **Supabase Keepalive**.
4. On the right side, click the **Run workflow** dropdown button.
5. Keep "Branch: main" selected and click the green **Run workflow** button.
6. Wait ~15–20 seconds, then refresh the page.
7. You will see a green checkmark **✓ Supabase Inactivity Keepalive**.
8. Click into it to view the summary: you will see:
   ```text
   HTTP response status code: 200
   ✅ Supabase project keepalive check completed successfully (HTTP 200, row verified).
   Database activity registered. Project inactivity timer refreshed.
   ```

---

### Step 6: Verifying Future Scheduled Runs

You do not need to do anything further!  
GitHub Actions will automatically run every **8 hours** (at minute 17 of 00:00, 08:00, and 16:00 UTC).

To inspect past runs:
* Go to the **Actions** tab on GitHub anytime.
* Select **Supabase Keepalive** to view the timeline of successful runs.

---

## Troubleshooting & Error Explanations

If a run ever fails, click on the failed run in GitHub Actions. The log will clearly display one of these messages:

| Error / Code | What It Means | How to Fix |
| :--- | :--- | :--- |
| **Required GitHub Secrets are missing** | You forgot to add `SUPABASE_URL` or `SUPABASE_PUBLISHABLE_KEY` in GitHub. | Re-check Step 3 in this guide and make sure names match exactly. |
| **HTTP 401 Unauthorized** | The API key is invalid, truncated, or expired. | Copy the `anon` / `public` key from Supabase Dashboard -> Settings -> API and update the secret in GitHub. |
| **HTTP 403 Forbidden** | Row Level Security (RLS) is blocking the query. | Re-run Step 1 (the SQL script) in the Supabase SQL editor to ensure permissions are granted. |
| **HTTP 404 Not Found** | The table `project_keepalive` doesn't exist yet. | Run Step 1 in the Supabase SQL editor to create the table. |
| **HTTP 5xx / Network Error** | Supabase is temporarily unreachable or paused. | See the Recovery Procedure below. |

---

## Recovery Procedure (If Supabase Was Already Paused)

> **Important:** GitHub Actions **cannot wake up a project that is already paused**. Supabase requires you to unpause it once from their dashboard.

If your project was already paused before setting this up:

1. Go to **[https://supabase.com/dashboard](https://supabase.com/dashboard)**.
2. If your project is paused, you will see a banner stating: **"Project is paused"**.
3. Click the **Restore Project** or **Resume Project** button.
4. Wait 1–3 minutes until the green "Active" status indicator appears.
5. Verify your existing Metro Motors website functions:
   * Try Google OAuth or email login on your site.
   * Verify MongoDB data displays properly.
6. Go to **GitHub ➔ Actions ➔ Supabase Keepalive ➔ Run workflow**.
7. Confirm the keepalive succeeds. Now, the 8-hour keepalive will take over and keep the project active moving forward!

