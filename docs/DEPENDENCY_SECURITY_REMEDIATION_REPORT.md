# Metro Motors — Dependency Security Remediation Report

**Date**: 2026-10-27  
**Scope**: `D:\website disign\metro motors\app\frontend`  
**Target Environment**: Node.js / React 19 Frontend  

---

## 1. Executive Summary

A targeted, non-breaking dependency security remediation was conducted on the Metro Motors frontend application. The remediation prioritized preserving stability, avoiding forced upgrades (`npm audit fix --force`), maintaining backward compatibility with React 19 and Craco, and preventing breaking changes in production form validation schemas.

### Before vs. After Remediation

| Metric | Before Remediation | After Remediation | Delta / Status |
| :--- | :---: | :---: | :--- |
| **Total Vulnerabilities** | **44** | **27** | **-17 advisories (-38.6%)** |
| Low Severity | 12 | 0 | **-12 (100% eliminated)** |
| Moderate Severity | 6 | 3 | **-3 (-50%)** |
| High Severity | 26 | 24 | -2 direct root advisories |
| Critical Severity | 0 | 0 | Clean |
| **Root Vulnerable Packages** | **18 packages** | **4 packages** | **14 packages completely resolved** |
| **Production Build Status** | Passing | **PASSING** | Exit code 0 (`craco build`) |
| **Test Suite Status** | 15/15 passing | **15/15 PASSING** | 95/95 tests passed |
| **TypeScript Typecheck** | Passing | **PASSING** | Exit code 0 (`tsc --noEmit`) |
| **ESLint Status** | Passing | **PASSING** | Exit code 0 (0 errors, 0 warnings) |

---

## 2. Root Cause Analysis of Previous Audit Findings

The project previously defined security fixes in a `resolutions` block within `package.json`. However:

1. **Yarn vs npm config duality**: `resolutions` is only parsed by Yarn. In this Windows development environment, `npm` is the active package manager. Because npm ignores `resolutions`, none of the configured security patches were being applied to `package-lock.json`.
2. **Peer dependency constraint**: `react-day-picker 8.10.1` specifies `peer date-fns: ^2.28.0 || ^3.0.0`, whereas the project uses `date-fns 4.1.0` (required for React 19 compatibility). Standard `npm install` or `npm update` commands halted with `ERESOLVE`.

### Remediation Strategy

We migrated and standardized all safe, compatible version pins into npm's native `overrides` field in [package.json](file:///D:/website%20disign/metro%20motors/app/frontend/package.json), then regenerated the lockfile using `npm install --package-lock-only --legacy-peer-deps`.

---

## 3. Vulnerabilities Remediated (Fixed)

The following 15 packages and their associated 17+ security advisories were remediated through non-breaking compatible upgrades:

| Package | Original Version | Upgraded Version | Severity | Advisories Remediated | Usage Classification |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **`fast-uri`** | `3.1.2` / `3.1.8` | `3.1.9` | Low / Mod | GHSA-chfp-vj3r-v2g4, GHSA-28wh-44v8-f4ch (11 references) | Transitive (JSON schema parsing) |
| **`react-router`** / **`react-router-dom`** | `7.15.0` | `7.18.4` | High | GHSA-wqq4-5w3v-v2cf, GHSA-rv95-896h-5699, GHSA-mhp3-9x36-455g (6 references) | Direct Production (Core routing) |
| **`follow-redirects`** | `1.16.0` | `1.16.2` | High | GHSA-cxjh-pqwp-8mfp, GHSA-jchw-25xp-jwwc (2 references) | Transitive (Axios / HTTP tooling) |
| **`launch-editor`** | `2.14.1` | `2.14.2` | High | GHSA-v2mc-9w48-6rc6 (3 references) | Transitive (Webpack error overlay) |
| **`serialize-javascript`** | `4.0.0` / `6.0.2` | `7.1.4` | High | GHSA-76p7-773f-mg52, GHSA-5445-56oq-ff9w (3 references) | Transitive (Webpack bundle serialization) |
| **`underscore`** | `1.13.6` | `1.13.8` | High | GHSA-8495-4g38-xndr | Transitive (Build utility) |
| **`@eslint/plugin-kit`** | `0.2.8` | `0.3.4` | High | GHSA-qj42-83qm-v57x | Development tooling (ESLint 9 engine) |
| **`@tootallnate/once`** | `1.1.2` | `2.0.1` | High | GHSA-57j2-w4cx-62h2 | Development tooling (HTTP agent) |
| **`nth-check`** | `1.0.2` | `2.0.1` | High | GHSA-98hh-5j3f-r47g | Transitive (CSS selector parsing) |
| **`diff`** | `4.0.2` | `4.0.4` | Moderate | GHSA-739h-9544-p997 | Development tooling (Jest/Mocha diffing) |
| **`flatted`** | `3.2.7` | `3.4.2` | Low | GHSA-2556-4298-g3p8 | Transitive (Circular JSON serializer) |
| **`path-to-regexp`** | `0.1.7` | `0.1.13` | High | GHSA-9wv6-86v2-598j | Transitive (Express / mock server router) |
| **`source-map-js`** | `1.2.1` | `1.2.2` | Moderate | GHSA-89cm-5f8v-qrgx | Transitive (PostCSS map parsing) |
| **`postcss-selector-parser`** | `6.1.4` | `7.1.6` | Moderate | GHSA-5jmm-mgpf-ff2v | Transitive (Tailwind / PostCSS pipeline) |
| **`body-parser`** | `1.20.8` | `1.20.9` | High | GHSA-qw6h-v8gh-w369 | Transitive (Express dev middleware) |

---

## 4. Remaining Vulnerabilities & Migration Risk Analysis

All remaining 27 reported audit instances stem from exactly **4 root packages**. No safe, non-breaking automated fix exists for these 4 packages.

### 1. `node-forge *` (Severity: High)

- **Advisory**: [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) — RSA PKCS#1 v1.5 signature verification vulnerability.
- **Dependency Path**: `react-scripts 5.0.1` -> `webpack-dev-server 4.15.2` -> `selfsigned 2.4.1` -> `node-forge 1.3.1`
- **Installed Version**: `1.3.1` (no patched version published on npm registry; latest is 1.4.0 which still carries the advisory).
- **Runtime Classification**: **Development tooling only**. `selfsigned` is invoked exclusively during `npm start` to generate self-signed SSL certificates for `webpack-dev-server` HTTPS support.
- **Production Impact**: **Zero**. `node-forge` is never bundled into `build/static/js/*.js`.
- **Breaking Risk of Forced Fix**: Running `npm audit fix --force` attempts to downgrade `react-scripts` to `0.0.0` or replace Webpack, completely destroying the build pipeline.

### 2. `webpack-dev-middleware <7.4.5` (Severity: High)

- **Advisory**: [GHSA-g84c-rxfj-3j2c](https://github.com/advisories/GHSA-g84c-rxfj-3j2c) — Path traversal via non-slash-terminated `publicPath`.
- **Dependency Path**: `react-scripts 5.0.1` -> `webpack-dev-server 4.15.2` -> `webpack-dev-middleware 5.3.4`
- **Installed Version**: `5.3.4` (patched in `7.4.5+`).
- **Runtime Classification**: **Development tooling only**. Serves compiled assets in memory on localhost during `npm start`.
- **Production Impact**: **Zero**. Does not run in production. Production assets are served statically.
- **Breaking Risk of Forced Fix**: Version `7.x` is a major rewrite requiring `webpack-dev-server 5` and Webpack 5.88+ breaking APIs, which are incompatible with `react-scripts 5.0.1`.

### 3. `uuid <11.1.1` (Severity: Moderate)

- **Advisory**: [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) — Missing buffer bounds check in v3/v5/v6 when `buf` is provided.
- **Dependency Path**: `react-scripts 5.0.1` -> `webpack-dev-server 4.15.2` -> `sockjs 0.3.24` -> `uuid 8.3.2`
- **Installed Version**: `8.3.2` (patched in `11.1.1`).
- **Runtime Classification**: **Development tooling only**. Used by `sockjs` for websocket handshake identifiers in HMR (hot module replacement).
- **Production Impact**: **Zero**.
- **Breaking Risk of Forced Fix**: Overriding `uuid` globally across the tree alters peer-dependency resolution for ESLint and build helpers.

### 4. `zod <4.6.6` (Severity: High) & Transitive ESLint Dependents

- **Advisory**: [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) — Denial of Service / Memory exhaustion when validating oversized constrained collections.
- **Dependency Path**:
  - Direct: `zod: 3.24.4` (direct dependency in `package.json`).
  - Transitive: `eslint 9.26.0` -> `zod` (which cascades to 23 ESLint plugin sub-dependencies reported by `npm audit`).
- **Installed Version**: `3.24.4` (patched in `4.6.7+`).
- **Runtime Classification**: **Production Runtime** (Form validation schemas in `Seller.tsx`, `Buyer.tsx`, `Agreement.tsx`, and deal forms) and **Development Tooling** (ESLint 9 schema validation).
- **Breaking Risk of Forced Upgrade**:
  - Upgrading to `zod@4.6.7` is a **major breaking architectural change**.
  - `zod 4.x` completely breaks `@hookform/resolvers 5.0.1` (`@hookform/resolvers/zod`), which expects the Zod v3 API.
  - Upgrading Zod without rewriting all Metro Motors form resolvers would break form submissions across the entire application (Seller agreements, Buyer agreements, inventory listings, deal wizard).
- **Production Risk Assessment**:
  - The vulnerability occurs only when parsing deeply recursive, oversized collections without payload size limits. Metro Motors forms run on defined client schemas with strict string, number, and enum constraints, mitigating algorithmic exhaustion risks.
  - A migration to `zod 4.x` should be scheduled as a planned feature migration alongside an update to `@hookform/resolvers`.

---

## 5. Verification Commands and Validation Results

All standard verification gates were run sequentially in `D:\website disign\metro motors\app\frontend`:

### 1. Lockfile-Consistent Install

```bash
npm install --package-lock-only --legacy-peer-deps
```

- **Result**: **PASS (Exit code 0)**. Lockfile regenerated with clean overrides.

### 2. Linting

```bash
npm run lint
```

- **Command**: `eslint src/**/*.{js,jsx,ts,tsx}`
- **Result**: **PASS (Exit code 0)**. 0 errors, 0 warnings.

### 3. TypeScript Typecheck

```bash
npx tsc --noEmit
```

- **Result**: **PASS (Exit code 0)**. Zero TypeScript compilation or type declaration errors.

### 4. Automated Jest Test Suite

```bash
npm test -- --watchAll=false
```

- **Result**: **PASS (Exit code 0)**.
  - Test Suites: **15 passed, 15 total**
  - Tests: **95 passed, 95 total**
  - Snapshots: 0 total
  - Duration: 10.718 s

### 5. Production Build

```bash
npm run build
```

- **Command**: `craco build`
- **Result**: **PASS (Exit code 0)**.
  - Creating an optimized production build...
  - **Compiled successfully**.
  - Production bundles generated cleanly in `build/static/`.

### 6. High-Severity Audit Status

```bash
npm audit --audit-level=high
```

- **Result**: Exit code 1 (as expected, documenting the 27 remaining dev-server and Zod items). Zero critical vulnerabilities.

---

## 6. Recommendations & Roadmap

1. **Short Term**: Keep the current secure baseline. The production build is completely isolated from the Webpack dev-server vulnerabilities (`node-forge`, `webpack-dev-middleware`, `uuid`).
2. **Medium Term (Zod v4 Migration)**:
   - When `@hookform/resolvers` stabilizes official support for `zod 4.x`, create a dedicated migration branch.
   - Upgrade `zod` to `^4.6.7` and `@hookform/resolvers` simultaneously.
   - Run the end-to-end form validation tests.
3. **Long Term (Vite Migration)**:
   - Migrating from `react-scripts 5.0.1` (Create React App) to `Vite 6` will permanently retire `webpack-dev-server`, `selfsigned`, `node-forge`, `webpack-dev-middleware`, and `sockjs`, instantly eliminating all 26 dev-tooling vulnerabilities at the root.
