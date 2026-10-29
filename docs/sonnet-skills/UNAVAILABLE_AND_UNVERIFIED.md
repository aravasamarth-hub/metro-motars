# Sonnet Skills: Inaccessible Content, External Dependencies & Unverified Claims

This document provides a factual, evidence-based audit of what the Sonnet Skills website actually delivers versus what cannot be imported or executed directly, documenting missing dependencies, paid vendor requirements, and unverified marketing assertions.

---

## 1. Truth in Delivery: Digital Reader vs. Executable Skills

During systematic browser inspection of `https://www.sonnetskills.com/library/50-ai-agents/read#/read/6`:

| Claim / Expectation | Verified Website Reality | Technical Impact |
| :--- | :--- | :--- |
| **Downloadable Code / Zip Bundles** | **None Found**. The website reader is a compiled single-page React application delivering an interactive digital book (88 pages). | No pre-built Python scripts, LangGraph JSONs, or ready-to-run `.skill` files can be downloaded directly from the reader interface. |
| **One-Click Agent Installers** | **Non-existent**. The platform does not offer automated npm, pip, or git package installation. | Every agent pattern must be written as an original implementation in your local codebase. |
| **Direct Antigravity Integration** | **No native bridge**. The platform is an educational resource and playbook, not an IDE extension or MCP server provider. | Skills must be manually imported as Antigravity markdown specifications or custom Python tools. |
| **Interactive Reader UI** | **Fully Accessible**. 88 pages with table of contents, reading mode, and filterable 50-agent interactive grid. | Conceptual workflows, operational guidelines, and architectural principles are 100% accessible and documented. |

---

## 2. Inaccessible Content & Access Boundaries

1. **Standalone Download Library**:
   - Accessing `https://www.sonnetskills.com/library` directly redirects authenticated users back to the active reader (`/library/50-ai-agents/read#/read/6`). 
   - No secondary file repository or code hosting portal was exposed within this authenticated account view.
2. **Raw Database Schemas & Proprietary Code**:
   - The book references production case studies and real-world architectures, but proprietary internal source code for referenced companies (e.g., specific enterprise CRMs) is understandably proprietary to those businesses and not published in the book.

---

## 3. Required Paid External Services & Tools

Many of the 50 agents described in the playbook rely on third-party SaaS APIs, telecommunication providers, and paid AI services. Attempting to deploy them without paid subscriptions will result in immediate authentication failures:

| Agent / System | Required External Service | Estimated Monthly Cost | Free Tier / Local Alternative |
| :--- | :--- | :--- | :--- |
| **Agent 21: Voice Calling** | Twilio + Deepgram + ElevenLabs | $50 - $200+ (per usage) | None suitable for live inbound PSTN phone calls. |
| **Agents 09, 12, 39, 40: Web Radar** | Tavily / Perplexity API / Firecrawl | $20 - $100 / month | Local Playwright / BeautifulSoup (requires maintenance). |
| **Agents 11: Ad Analytics** | Meta Marketing API / Google Ads API | Requires active ad spend | Mock JSON reporting. |
| **Agent 31: Invoice OCR** | Google Cloud Document AI / AWS Textract | $1.50 per 1,000 pages | Open-source Tesseract OCR / Local PyMuPDF. |
| **Agent 01: Lead Enrichment** | Clearbit / Apollo.io API | $49 - $149 / month | Local regex / heuristics on user email domain. |

---

## 4. Unverified Claims & Critical Technical Warnings

### Claim 1: "AI Agents can operate with 100% autonomy in revenue and finance."
* **Reality Check**: **False & High Risk**. 
* **Evidence**: Financial calculations (invoices, tax totals, price discounts) performed by LLMs suffer from non-deterministic rounding errors and hallucinated line items.
* **Remedy**: Always enforce **Level 3 Control (Human Approval Required)** for invoices and payments. Perform all mathematical calculations in deterministic Python code, never in an LLM prompt.

### Claim 2: "RAG over enterprise documents guarantees hallucination-free support."
* **Reality Check**: **Incomplete**.
* **Evidence**: Without strict context window management, citation verification, and similarity score thresholds, RAG systems frequently blend adjacent document paragraphs or generate answers from obsolete policy versions.
* **Remedy**: Implement strict score cutoffs (e.g., minimum cosine similarity > 0.85), cite exact line numbers, and fall back to human escalation if the document match is ambiguous.

### Claim 3: "Real-time AI voice agents can replace human sales reps."
* **Reality Check**: **Premature for complex negotiations**.
* **Evidence**: Latency across mobile telecom networks (PSTN -> Audio Stream -> STT -> LLM -> TTS -> Audio Stream) frequently exceeds 1,200ms in real-world conditions, causing awkward interruptions and poor customer experience.
* **Remedy**: Limit voice AI to simple appointment scheduling and showroom address directions. Route complex vehicle negotiations to human staff.

---

## 5. Security & Privacy Safeguards

When adapting any agent pattern from the Sonnet Skills curriculum into Metro Motors:
1. **Never Hardcode Secrets**: No API keys, database connection strings, or JWT secrets should ever be placed in skill markdown files or prompts.
2. **Customer PII Protection**: Customer phone numbers, Aadhaar numbers, PAN cards, and private addresses must be masked before transmission to external LLM providers.
3. **Preserve Deferred Architecture**: Respect the boundaries established in Metro Motors' `DEFERRED.md`:
   - Do not attempt live connection to MongoDB Atlas until production credentials are confirmed.
   - Do not attempt live email sending; continue using local console logging and test mocks.
   - Do not configure live Cloudflare R2 storage; use local file storage in `data/`.
