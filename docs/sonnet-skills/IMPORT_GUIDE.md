# Antigravity Skills Import & Implementation Guide

This guide details the exact mechanism, filesystem locations, file formats, and security rules for installing, configuring, and executing AI skills within Google Antigravity (AGY) and the Metro Motors workspace.

---

## 1. Antigravity Skill Discovery & Architecture

Antigravity discovers skills and agent configurations through two standard customization roots:

### Root 1: Global Customizations (Cross-Project)
- **Filesystem Path**: `C:\Users\arava\.gemini\config\`
- **Skills Directory**: `C:\Users\arava\.gemini\config\skills\<skill_name>\SKILL.md`
- **Scope**: Available across all projects opened in the Antigravity IDE.
- **Installed Global Skill**:
  - `fifty-ai-agents`: Master catalog containing the 50 AI Agents playbook and 8 system reference guides at `C:\Users\arava\.gemini\config\skills\fifty-ai-agents\SKILL.md`.

### Root 2: Workspace Customizations (Project-Specific)
- **Filesystem Path**: `<workspace_root>\.agents\` (in Metro Motors: `D:\website disign\metro motors\app\.agents\`)
- **Skills Directory**: `.agents\skills\<skill_name>\SKILL.md`
- **Rules Directory**: `.agents\rules\<rule_name>.md`
- **Root Instructions**: `AGENTS.md` in the project root.
- **Scope**: Local to Metro Motors; version-controlled in git; overrides global rules.

---

## 2. Standard Antigravity Skill File Format

Every Antigravity skill must be defined as a markdown file named **`SKILL.md`** with valid YAML frontmatter:

```markdown
---
name: metro-quality-workflow
description: Enforces pre-edit dependency mapping, pytest/jest verification, and security checks for Metro Motors.
risk: none
source: local-project-workflow
date_added: 2026-10-28
tags: ["quality", "testing", "fastapi", "react", "security"]
---

# Skill Title

Skill instructions, tool requirements, decision rubrics, and execution examples...
```

### Critical Validation Rules:
1. **Valid Frontmatter**: Must contain `name` (kebab-case) and `description` (clear sentence explaining when the agent should trigger the skill).
2. **Deterministic Boundaries**: Instructions must explicitly declare what the agent is **not** permitted to do (e.g. no destructive database drops, no live credential commits).
3. **No Embedded Secrets**: Never place API tokens, passwords, or customer PII inside skill markdown files.

---

## 3. Selected Project-Specific Skills for Metro Motors

Instead of blindly installing all 50 theoretical agents, install only the 2 highest-value, fully reviewed workspace skills in `D:\website disign\metro motors\app\.agents\skills\`:

### 1. `metro-quality-workflow`
- **Location**: `.agents\skills\metro-quality-workflow\SKILL.md`
- **Role**: Software Quality Gate & Regression Prevention.
- **Execution Checklist**:
  1. Understand requested change before editing.
  2. Map affected backend/frontend dependencies.
  3. Run targeted pytest and Jest tests.
  4. Run lint and type checking (`ruff`, `tsc`).
  5. Verify offline JSONL fallback integrity.
  6. Document verification evidence.

### 2. `metro-billing-integrity`
- **Location**: `.agents\skills\metro-billing-integrity\SKILL.md`
- **Role**: Billing Math, Idempotency & Tax Validation.
- **Execution Checklist**:
  1. Validate invoice mathematical totals deterministically in Python.
  2. Enforce duplicate invoice prevention on `invoice_id`.
  3. Validate vehicle registration (RC) extraction against Pydantic schema.
  4. Maintain human approval gate (Level 3 Control) before releasing finalized bills.

---

## 4. Step-by-Step Installation & Verification Guide

### Step 1: Create the Workspace Skill Directory
```powershell
New-Item -ItemType Directory -Path "D:\website disign\metro motors\app\.agents\skills\metro-quality-workflow" -Force
New-Item -ItemType Directory -Path "D:\website disign\metro motors\app\.agents\skills\metro-billing-integrity" -Force
```

### Step 2: Write the Verified SKILL.md Files
Deploy the reviewed `SKILL.md` files with clear operational rules and zero security-weakening instructions.

### Step 3: Run Safe Verification Tests
Verify that the workspace skills are syntactically valid and perform safe test executions:
- Run backend pytest suite: `python -m pytest backend/tests`
- Verify offline data file read: `python -c "import json; [json.loads(line) for line in open('backend/data/bikes.jsonl', 'r', encoding='utf-8')]"`

---

## 5. Security & Safety Checklist

Before activating any new skill:
- [x] Does the skill contain destructive shell commands (`rm -rf`, `DROP TABLE`, `format`)? -> **Forbidden**.
- [x] Does the skill exfiltrate code or customer PII to external domains? -> **Forbidden**.
- [x] Does the skill alter git history or commit directly to `main` without review? -> **Forbidden**.
- [x] Does the skill respect existing Antigravity settings and project rules? -> **Mandatory**.
- [x] Does the skill distinguish between automated test evidence vs. unverified claims? -> **Mandatory**.
