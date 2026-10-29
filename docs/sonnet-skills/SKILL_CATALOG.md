# Sonnet Skills & 50 AI Agents: Verified Complete Skill Catalog

> **Empirical Inspection Verification**: Every single one of the 50 agents below was directly inspected from the live Sonnet Skills digital reader and agent library grid at `https://www.sonnetskills.com/library/50-ai-agents/read#/library`.
> 
> **Inspection Status**: **100% Fully Inspected (50 of 50 agents)**.
> - **Evidence Maturity**: Verified directly from the platform (*Proven*, *Emerging*, or *Frontier*).
> - **Human Control Requirement**: Verified directly from the platform (*Informed*, *Review required*, *Approval required*, or *Human decision only*).
> - **Readiness Load**: Verified directly from the platform (*Low*, *Medium*, or *High*).
> - **Direct Import Feasibility**: Verified: **0 of 50** are downloadable files. All 50 must be created as original implementations (Antigravity markdown skills, Python FastAPI services, or prompt pipelines).

---

## Catalog Overview by Business System

| System | Agents | Focus Area |
| :--- | :---: | :--- |
| **1. Revenue Engine** | `01 - 08` | Pipeline acceleration, qualification, research, objection handling, hygiene |
| **2. Growth Engine** | `09 - 16` | Content generation, repurposing, ad analysis, SEO, calculators, segmentation |
| **3. Customer Engine** | `17 - 22` | Support triage, resolution, proactive customer success, voice, feedback |
| **4. Operations Engine** | `23 - 30` | SOP compliance, meeting action routing, project risks, OCR, inventory intelligence |
| **5. Money & People** | `31 - 38` | AP invoice matching, AR follow-up, expense review, hiring, onboarding, enterprise search |
| **6. Intelligence Engine** | `39 - 42` | Competitor surveillance, market trend radar, qualitative customer research, M&A due diligence |
| **7. Management & Memory** | `43 - 50` | Founder daily briefs, decision memos, executive assistance, institutional ADR memory |

---

## Detailed Specifications for All 50 AI Agents

### Agent 01: AI Lead Qualification Agent
* **Business System**: Revenue Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Informed`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Every inbound lead receives roughly the same manual process, causing high-value buyers to wait while sales reps sift through spam and tire-kickers.
* **What It Needs (Prerequisites)**: Clear ICP definition, enrichment data source (Apollo/Clearbit), webhook intake from forms, strict CRM tagging schema.
* **Documented Claim vs. Technical Reality Check**: Over-relying on automated rejection can discard viable unconventional buyers; keep boundary leads in a human review queue.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Scoring used bike buyer enquiries in backend/enquiry_service.py: detect high-intent buyers ready for test rides vs price checkers.
* **Priority for Metro Motors**: **Critical**

---

### Agent 02: AI Account Research Agent
* **Business System**: Revenue Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `Medium`
* **The Problem It Solves**: Salespeople burn hours opening 20 browser tabs and reconstructing context on company background, news, and executive pain points before a meeting.
* **What It Needs (Prerequisites)**: Target domain/name, web scraping/search API, company registry data, structured brief template.
* **Documented Claim vs. Technical Reality Check**: Web scrapers break on anti-bot protections; corporate press releases often exaggerate true technical or commercial priorities.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Pre-meeting dossiers on fleet buyers, corporate mobility clients, or prospective multi-bike sellers.
* **Priority for Metro Motors**: **Low**

---

### Agent 03: AI Sales Follow-Up Agent
* **Business System**: Revenue Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Good sales meetings die because post-call recaps and commitment summaries happen inconsistently or days later.
* **What It Needs (Prerequisites)**: Call audio/transcript (Whisper/Gong/Fireflies), structured notes, rep mailbox integration, CRM deal stage mapping.
* **Documented Claim vs. Technical Reality Check**: Audio transcription errors can misstate agreed pricing or warranty terms; human rep review before sending is mandatory.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Post-test-ride follow-ups summarizing the exact motorcycle inspected, financing terms, and pending KYC documents.
* **Priority for Metro Motors**: **High**

---

### Agent 04: AI CRM Hygiene Agent
* **Business System**: Revenue Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Informed`
* **Documented Readiness Load**: `Medium`
* **The Problem It Solves**: AI cannot operate reliably on a CRM full of stale deal stages, duplicate contacts, and missing contact information.
* **What It Needs (Prerequisites)**: Database read/write access, deduplication heuristics (fuzzy phone/email matching), field normalization schemas.
* **Documented Claim vs. Technical Reality Check**: Over-aggressive automated merging can combine unrelated family members or fleet accounts sharing domain names.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Deduplicating customer phone numbers, cleaning bike model names (e.g. 'Classic 350' vs 'RE Classic 350') in data/ and MongoDB.
* **Priority for Metro Motors**: **High**

---

### Agent 05: AI Proposal Assistant
* **Business System**: Revenue Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: RFP and proposal work repeatedly consumes senior sales time finding credentials, assembling case studies, and calculating pricing tables.
* **What It Needs (Prerequisites)**: Master pricing matrix, legal clauses, templating engine (Jinja2/ReportLab), CRM deal inputs.
* **Documented Claim vs. Technical Reality Check**: Never delegate pricing math to an LLM; calculations must be computed deterministically in code, with LLM handling narrative text.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Generating validated vehicle sale proposals and proforma invoices in bill/demo bill.pdf workflow.
* **Priority for Metro Motors**: **Critical**

---

### Agent 06: AI Pipeline Risk Agent
* **Business System**: Revenue Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `Medium`
* **The Problem It Solves**: Sales pipeline totals look healthy while deals quietly slip, champion stakeholders change jobs, or response latency spikes.
* **What It Needs (Prerequisites)**: Historical deal velocity baselines, stage duration metrics, email interaction latency logs.
* **Documented Claim vs. Technical Reality Check**: Small sample sizes in local dealerships can produce false risk alerts; requires 100+ deals to calibrate statistically.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Flagging bike customer enquiries that have sat without response > 7 days after quotation delivery.
* **Priority for Metro Motors**: **Medium**

---

### Agent 07: AI Objection Intelligence Agent
* **Business System**: Revenue Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Informed`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Objections disappear inside hundreds of sales calls instead of compounding into shared showroom learning.
* **What It Needs (Prerequisites)**: Call recordings/notes, indexed battlecards, objection taxonomy (price, condition, warranty, competitor).
* **Documented Claim vs. Technical Reality Check**: Competitor claims change rapidly; battlecards must be updated when competitor pricing or terms shift.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Surfacing winning responses for showroom staff when customers cite lower prices from OLX, BeepKart, or CredR.
* **Priority for Metro Motors**: **Medium**

---

### Agent 08: AI Lead Reactivation Agent
* **Business System**: Revenue Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Sales databases contain years of dormant intent while businesses continually spend marketing budget acquiring new leads.
* **What It Needs (Prerequisites)**: Historical closed-lost/dormant deal database, trigger event monitors (inventory arrival, price drops), messaging queue.
* **Documented Claim vs. Technical Reality Check**: Cold outreach to unconsented contacts risks spam reporting and TRAI/CAN-SPAM regulatory violations.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Triggering alerts to past prospects when newly acquired bike inventory matches their historical search criteria.
* **Priority for Metro Motors**: **High**

---

### Agent 09: AI Content Research Agent
* **Business System**: Growth Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Marketing teams choose content topics by intuition rather than empirical evidence of search intent and audience friction.
* **What It Needs (Prerequisites)**: Web search API, forum scraper (Reddit, Quora, Team-BHP), keyword volume metrics.
* **Documented Claim vs. Technical Reality Check**: Aggregated forum sentiment can be skewed by vocal minorities rather than representative mainstream buyers.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Researching trending commuter and sports motorcycle maintenance queries in India.
* **Priority for Metro Motors**: **Low**

---

### Agent 10: AI Content Repurposing Agent
* **Business System**: Growth Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Businesses produce valuable video reviews or technical inspection guides once, then fail to repurpose them across social channels.
* **What It Needs (Prerequisites)**: Pillar asset (video transcript, technical blog, inspection report), platform formatting rubrics.
* **Documented Claim vs. Technical Reality Check**: Repurposed copy sounds generic and robotic unless brand tone rules and concrete technical vehicle specs are enforced.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Repurposing vehicle inspection reports and model reviews into Instagram carousels and buying tips.
* **Priority for Metro Motors**: **Medium**

---

### Agent 11: AI Performance Marketing Analyst
* **Business System**: Growth Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Paid media teams cannot continuously monitor hundreds of campaign signals, ad sets, and ROAS fatigue points 24/7.
* **What It Needs (Prerequisites)**: Meta Ads API / Google Ads API access, conversion pixel attribution, target CPA thresholds.
* **Documented Claim vs. Technical Reality Check**: Automated budget reallocations carry high financial risk if conversion tracking pixels drop or misattribute offline showroom visits.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Tracking local paid ad spend and customer acquisition cost per vehicle test-ride enquiry.
* **Priority for Metro Motors**: **Low**

---

### Agent 12: AI Creative Intelligence Agent
* **Business System**: Growth Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Teams know which ad creative converted best, but cannot isolate which hook, visual angle, or warranty offer drove the lift.
* **What It Needs (Prerequisites)**: Meta Ad Library API, creative asset repository, visual tagger (Vision LLM).
* **Documented Claim vs. Technical Reality Check**: Correlation does not equal causation; ad performance is often driven by audience saturation rather than minor visual tweaks.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Analyzing competitor used two-wheeler advertising angles (e.g. 1-year warranty vs free insurance).
* **Priority for Metro Motors**: **Low**

---

### Agent 13: AI SEO Opportunity Agent
* **Business System**: Growth Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `Medium`
* **The Problem It Solves**: SEO teams react to ranking drops after traffic is lost rather than proactively mining Google Search Console for emerging keywords.
* **What It Needs (Prerequisites)**: Google Search Console API, sitemap, search performance database.
* **Documented Claim vs. Technical Reality Check**: High impression keywords ranking on page 2 may have low commercial purchase intent (e.g. homework queries vs buying queries).
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Optimizing vehicle inventory category pages (e.g. 'Used Royal Enfield Bangalore') for local organic search.
* **Priority for Metro Motors**: **Medium**

---

### Agent 14: AI Newsletter Agent
* **Business System**: Growth Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Newsletters fail because maintaining consistent editorial curation and writing takes more time than marketers can sustain.
* **What It Needs (Prerequisites)**: RSS feeds, internal inventory changelog, ESP integration (SendGrid/Beehiiv), editorial voice guide.
* **Documented Claim vs. Technical Reality Check**: Full AI automation produces sterile newsletters that degrade subscriber open rates over time; human curation is critical.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Monthly showroom digest featuring newly arrived two-wheelers, maintenance advice, and community rides.
* **Priority for Metro Motors**: **Low**

---

### Agent 15: AI Lead Magnet Generator
* **Business System**: Growth Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Internal operational expertise stays trapped in employee heads instead of becoming customer-facing calculators and guides.
* **What It Needs (Prerequisites)**: Proprietary valuation formula, frontend React widget, lead capture form.
* **Documented Claim vs. Technical Reality Check**: Valuation formulas must be calibrated against real market auction and sales data to prevent misleading customer expectations.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Interactive 'Used Motorcycle Resale Valuation Calculator' and 'EMI Estimator' on the Metro Motors website.
* **Priority for Metro Motors**: **High**

---

### Agent 16: AI Customer Segmentation Agent
* **Business System**: Growth Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `Medium`
* **The Problem It Solves**: Static customer tags fail to capture dynamic behavioral shifts indicating buying intent or churn.
* **What It Needs (Prerequisites)**: In-app telemetry (Mixpanel/PostHog), CRM purchase history, clustering algorithm or rule engine.
* **Documented Claim vs. Technical Reality Check**: Over-segmentation leads to complex, unmaintainable email sequences that produce diminishing returns.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Segmenting Metro Motors buyers into Budget Commuter, Premium Sports, Touring, and Vehicle Seller cohorts.
* **Priority for Metro Motors**: **Medium**

---

### Agent 17: AI Customer Support Agent
* **Business System**: Customer Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Expensive human staff spend half their time answering predictable FAQs on business hours, documents, and policies.
* **What It Needs (Prerequisites)**: Structured documentation / knowledge base, vector index, chat UI / webhook, human escalation bridge.
* **Documented Claim vs. Technical Reality Check**: Without strict similarity bounds and source citation constraints, support agents hallucinate non-existent return policies.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Answering showroom hours, test-ride requirements, RTO transfer timelines, and warranty coverage.
* **Priority for Metro Motors**: **High**

---

### Agent 18: AI Support Triage Agent
* **Business System**: Customer Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Customer inquiries sit unassigned in shared inboxes because manual sorting creates bottlenecks.
* **What It Needs (Prerequisites)**: Inbound message webhook, fast classifier model, priority and urgency mapping rules.
* **Documented Claim vs. Technical Reality Check**: Sarcastic or emotionally complex complaints can be misclassified as low priority by simple classifiers.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Categorizing inbound Metro Motors customer enquiries into 'Ready to Buy', 'Service Request', or 'Documentation'.
* **Priority for Metro Motors**: **Critical**

---

### Agent 19: AI Customer Success Agent
* **Business System**: Customer Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Unhappy customers silently stop engaging months before renewal or publicly post negative reviews.
* **What It Needs (Prerequisites)**: Customer activity telemetry, post-delivery milestones, CSAT survey trigger.
* **Documented Claim vs. Technical Reality Check**: Excessive proactive check-ins annoy satisfied customers; timing must be aligned with real customer milestones.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Post-delivery check-in at Day 7 and Day 30 offering free first-service inspections to ensure vehicle satisfaction.
* **Priority for Metro Motors**: **Medium**

---

### Agent 20: AI Customer Onboarding Agent
* **Business System**: Customer Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Between initial agreement and vehicle handover, buyers get stuck submitting required identity and registration documents.
* **What It Needs (Prerequisites)**: Step-by-step onboarding checklist, secure document upload endpoint, verification status tracker.
* **Documented Claim vs. Technical Reality Check**: Government document rules vary by state RTO; document validation schemas must be tailored to local jurisdiction.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Guided KYC submission for bike buyers and sellers (Aadhaar, PAN, Form 29/30 RTO transfer forms).
* **Priority for Metro Motors**: **Critical**

---

### Agent 21: AI Voice Calling Agent
* **Business System**: Customer Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Phone-based appointment booking and customer qualification historically scale only with human headcount.
* **What It Needs (Prerequisites)**: Telephony provider (Twilio), real-time STT (Deepgram), ultra-low-latency LLM, natural TTS (ElevenLabs).
* **Documented Claim vs. Technical Reality Check**: Mobile network latency frequently exceeds 1,200ms, creating awkward conversational collisions; costly ($0.15/min).
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: After-hours inbound call answering to provide showroom location and schedule morning test-ride bookings.
* **Priority for Metro Motors**: **Low**

---

### Agent 22: AI Customer Feedback Agent
* **Business System**: Customer Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `Medium`
* **The Problem It Solves**: Customers explain what is broken across reviews and surveys, but unstructured text is rarely synthesized into product priorities.
* **What It Needs (Prerequisites)**: Google Reviews API, local feedback DB, sentiment and thematic clustering model.
* **Documented Claim vs. Technical Reality Check**: Public reviews often over-index on negative emotional outliers; combine with private surveys for balanced insight.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Synthesizing Google Reviews and showroom feedback to detect recurring complaints about refurbishment quality.
* **Priority for Metro Motors**: **Medium**

---

### Agent 23: AI SOP Assistant
* **Business System**: Operations Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Official Standard Operating Procedures drift from real work, and critical knowledge remains trapped in senior staff heads.
* **What It Needs (Prerequisites)**: Markdown SOP repository, search index, interactive chat interface.
* **Documented Claim vs. Technical Reality Check**: Staff bypass documentation if answers are verbose; instructions must be bite-sized and actionable with direct links.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Guiding showroom technicians through the 45-point used vehicle mechanical inspection process.
* **Priority for Metro Motors**: **High**

---

### Agent 24: AI Task Routing Agent
* **Business System**: Operations Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Informed`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Operational requests arrive across disparate channels, turning managers into human ticket routers.
* **What It Needs (Prerequisites)**: Task inbox webhook, organizational responsibility matrix, project management API (Linear/Jira).
* **Documented Claim vs. Technical Reality Check**: Ambiguous cross-functional tasks can be routed in circles if ownership boundaries are not strictly defined.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Converting showroom mechanic notes into structured refurbishment work orders.
* **Priority for Metro Motors**: **Medium**

---

### Agent 25: AI Meeting Action Agent
* **Business System**: Operations Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Meetings create informal verbal commitments that disappear because notes and deadlines are not systematically tracked.
* **What It Needs (Prerequisites)**: Audio recording / transcript, commitment extraction prompt schema, task tracker sync.
* **Documented Claim vs. Technical Reality Check**: Casual brainstorming statements can be erroneously flagged as binding commitments; requires human confirmation.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Extracting action items from weekly showroom operations and inventory planning meetings.
* **Priority for Metro Motors**: **Medium**

---

### Agent 26: AI Project Risk Agent
* **Business System**: Operations Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Software and operational projects appear healthy until milestones are missed; risk signals are scattered in small delays.
* **What It Needs (Prerequisites)**: Git commit logs, PR aging metrics, sprint velocity charts, blocker comments.
* **Documented Claim vs. Technical Reality Check**: Code commits and ticket velocity do not always reflect true architectural complexity or hidden blockers.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Auditing Metro Motors sprint progress and alerting on unmerged PRs or pending deferred items.
* **Priority for Metro Motors**: **High**

---

### Agent 27: AI Document Processing Agent
* **Business System**: Operations Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Businesses pay employees to manually retype data from paper vehicle documents, ID cards, and vendor invoices.
* **What It Needs (Prerequisites)**: Vision LLM (Gemini 2.5/Flash, GPT-4o), PDF rendering pipeline, strict Pydantic extraction schema.
* **Documented Claim vs. Technical Reality Check**: Poor quality mobile photos and distorted angles degrade OCR accuracy; fallback human review gate is mandatory.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Extracting chassis number, engine number, registration date, and ownership serial from vehicle RC smart cards.
* **Priority for Metro Motors**: **Critical**

---

### Agent 28: AI Vendor Coordination Agent
* **Business System**: Operations Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Procurement managers burn time chasing spare parts quotes, tracking deliveries, and reconciling supplier terms.
* **What It Needs (Prerequisites)**: Supplier quote parser, purchase order ledger, automated reminder scheduler.
* **Documented Claim vs. Technical Reality Check**: Supplier relationship nuances and volume discount negotiations still require experienced human judgment.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Managing spare parts procurement, battery suppliers, and tire vendors for vehicle refurbishment.
* **Priority for Metro Motors**: **Low**

---

### Agent 29: AI Inventory Intelligence Agent
* **Business System**: Operations Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Holding too much slow-moving vehicle inventory traps working capital, while stockouts on popular models lose sales.
* **What It Needs (Prerequisites)**: Inventory database with timestamped listings, historical sales velocity, market depreciation tables.
* **Documented Claim vs. Technical Reality Check**: Seasonality (e.g. monsoon slowdowns, festive Diwali surges) must be factored into reorder and markdown logic.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Tracking days-on-market for each motorcycle in Metro Motors showroom; alerting on stock held > 30/45 days.
* **Priority for Metro Motors**: **Critical**

---

### Agent 30: AI Quality Exception Agent
* **Business System**: Operations Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Humans are poor at catching subtle regression patterns across high-volume error logs and test suites without fatigue.
* **What It Needs (Prerequisites)**: Application error log stream (Sentry/server logs), automated test reporter (pytest/jest).
* **Documented Claim vs. Technical Reality Check**: Log noise and harmless benign warnings must be filtered to prevent alert fatigue.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Automated pre-commit quality gate verifying that backend tests and frontend Jest suites pass 100%.
* **Priority for Metro Motors**: **Critical**

---

### Agent 31: AI Invoice Processing Agent
* **Business System**: Money & People
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Accounts payable teams spend hours manually matching vendor bills against purchase orders and bank receipts.
* **What It Needs (Prerequisites)**: PDF parser, 3-way matching rules (PO = Receipt = Invoice), accounting ledger API / JSONL.
* **Documented Claim vs. Technical Reality Check**: LLMs must NEVER perform invoice arithmetic; all sums, taxes, and subtotals must be validated deterministically in code.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Verifying vendor repair and refurbishment bills, preventing duplicate invoice numbers, and staging payouts.
* **Priority for Metro Motors**: **Critical**

---

### Agent 32: AI Payment Follow-Up Agent
* **Business System**: Money & People
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Accounts receivable age past due because payment reminders and customer promises-to-pay are tracked inconsistently.
* **What It Needs (Prerequisites)**: Customer billing ledger, payment gateway status API, escalating reminder scheduler.
* **Documented Claim vs. Technical Reality Check**: Premature automated collection notices sent to customers who already paid damage showroom goodwill.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Automated polite reminders for customer balance payments prior to vehicle delivery and registration transfer.
* **Priority for Metro Motors**: **High**

---

### Agent 33: AI Expense Review Agent
* **Business System**: Money & People
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `Medium`
* **The Problem It Solves**: Manual expense auditing consumes massive capacity, forcing finance teams to audit only small random samples.
* **What It Needs (Prerequisites)**: Receipt OCR, corporate expense policy rules engine, card transaction feed.
* **Documented Claim vs. Technical Reality Check**: Merchant naming variations can trigger false out-of-policy alerts without fuzzy matching.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Auditing showroom petty cash receipts (test-ride fuel, cleaning supplies, temporary transit permits).
* **Priority for Metro Motors**: **Low**

---

### Agent 34: AI Management Reporting Agent
* **Business System**: Money & People
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `Medium`
* **The Problem It Solves**: Leadership receives monthly reports late because finance teams spend days consolidating numbers from disparate systems.
* **What It Needs (Prerequisites)**: Accounting ledger database, sales records, Jinja2/HTML-to-PDF reporting engine.
* **Documented Claim vs. Technical Reality Check**: Management commentary must clearly distinguish audited financial records from speculative projections.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Compiling monthly showroom profitability summaries: bikes sold, average gross margin, and repair costs.
* **Priority for Metro Motors**: **High**

---

### Agent 35: AI Recruitment Coordination Agent
* **Business System**: Money & People
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Human decision only`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Hiring managers spend valuable hours coordinating calendars and screening resumes instead of evaluating talent.
* **What It Needs (Prerequisites)**: Job description rubric, resume parser, calendar scheduling API.
* **Documented Claim vs. Technical Reality Check**: Resume screening algorithms can perpetuate demographic bias; human must make all shortlisting and rejection choices.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Screening applicant resumes for showroom sales executives and certified two-wheeler mechanics.
* **Priority for Metro Motors**: **Low**

---

### Agent 36: AI Employee Onboarding Agent
* **Business System**: Money & People
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: New hires start without clear IT access, required paperwork, or a coherent first-week roadmap.
* **What It Needs (Prerequisites)**: Employee handbook, tool provisioning checklist, interactive Slack/chat interface.
* **Documented Claim vs. Technical Reality Check**: Automated onboarding cannot replace personal mentorship and cultural integration with team peers.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Guiding new showroom staff and mechanics through Metro Motors safety standards and software tools.
* **Priority for Metro Motors**: **Medium**

---

### Agent 37: AI Internal Knowledge Agent
* **Business System**: Money & People
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Informed`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Employees waste hours asking colleagues where files, policies, and templates live even though documentation exists.
* **What It Needs (Prerequisites)**: Hybrid search index (BM25 + embeddings) across repository docs, markdown wikis, and guidelines.
* **Documented Claim vs. Technical Reality Check**: Search indices become obsolete if documentation is not updated alongside code releases.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Semantic search across Metro Motors docs: MONGODB_SETUP_GUIDE.md, DEMO_HANDOVER_CHECKLIST.md, API contracts.
* **Priority for Metro Motors**: **High**

---

### Agent 38: AI Training Coach
* **Business System**: Money & People
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Corporate training offers generic slides that fail to address individual employee objection-handling weaknesses.
* **What It Needs (Prerequisites)**: Role-play conversational LLM, evaluation rubric, feedback scoring prompt.
* **Documented Claim vs. Technical Reality Check**: Simulated conversations can lack the unpredictable emotional nuance of real customer showroom negotiations.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Role-play training for junior sales reps on negotiating used vehicle trade-in prices.
* **Priority for Metro Motors**: **Low**

---

### Agent 39: AI Competitor Intelligence Agent
* **Business System**: Intelligence Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Competitor pricing changes, new warranty terms, and showroom expansions are noticed months after they occur.
* **What It Needs (Prerequisites)**: Web scraper (Playwright/Firecrawl), visual diff detector, summary generator.
* **Documented Claim vs. Technical Reality Check**: Frequent competitor website layout redesigns break automated scrapers, requiring ongoing maintenance.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Tracking competitor listing prices and warranty offerings across major Bangalore used two-wheeler portals.
* **Priority for Metro Motors**: **Medium**

---

### Agent 40: AI Market Research Agent
* **Business System**: Intelligence Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Strategic market decisions rely on outdated secondary research that takes weeks to manually assemble.
* **What It Needs (Prerequisites)**: Web search API, industry journal feeds, regulatory registers.
* **Documented Claim vs. Technical Reality Check**: Secondary research reports frequently recycle unverified industry estimates.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Monitoring two-wheeler regulatory updates, EV subsidy shifts, and state RTO tax revisions.
* **Priority for Metro Motors**: **Low**

---

### Agent 41: AI Customer Research Agent
* **Business System**: Intelligence Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Rich customer discovery calls are reduced to vague numeric averages instead of compounding verbatim language.
* **What It Needs (Prerequisites)**: Interview audio/transcripts, Jobs-to-be-Done (JTBD) coding schema, thematic tagger.
* **Documented Claim vs. Technical Reality Check**: Small qualitative cohorts can lead to over-indexing on non-representative customer edge cases.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Analyzing customer discovery interviews to understand why buyers hesitate to buy pre-owned motorcycles online.
* **Priority for Metro Motors**: **Low**

---

### Agent 42: AI Due-Diligence Research Agent
* **Business System**: Intelligence Engine
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Human decision only`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Commercial agreements and M&A transactions require reviewing volumes of legal records where missing one liability is costly.
* **What It Needs (Prerequisites)**: Corporate registry APIs (MCA/OpenCorporates), court docket search, adverse media scraper.
* **Documented Claim vs. Technical Reality Check**: Public databases often have delayed updates or sealed records; never use as sole basis for legal execution.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Background audits on commercial vehicle fleet sellers or property lease agreements.
* **Priority for Metro Motors**: **Low**

---

### Agent 43: AI Founder Briefing Agent
* **Business System**: Management & Memory
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Frontier`
* **Documented Human Control**: `Human decision only`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Founders suffer from fragmented attention across emails, bank balances, customer complaints, and pipeline status.
* **What It Needs (Prerequisites)**: Direct database metric queries, calendar API, notification delivery worker.
* **Documented Claim vs. Technical Reality Check**: Frontier reasoning models can hallucinate narrative causes behind metric fluctuations without deep causal data.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Daily 7:00 AM executive brief: bikes sold yesterday, active enquiries, scheduled test rides, and cash collected.
* **Priority for Metro Motors**: **Critical**

---

### Agent 44: AI Decision Preparation Agent
* **Business System**: Management & Memory
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Frontier`
* **Documented Human Control**: `Human decision only`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: High-stakes business choices are made based on intuition and incomplete data without testing failure modes.
* **What It Needs (Prerequisites)**: Decision memo template, pre-mortem prompt architecture, 2nd-order trade-off matrix.
* **Documented Claim vs. Technical Reality Check**: AI can frame options and devil's advocate arguments, but ultimate risk liability rests solely with human leadership.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Structuring major capital choices (e.g. opening a second showroom branch vs launching vehicle delivery service).
* **Priority for Metro Motors**: **Medium**

---

### Agent 45: AI Executive Assistant
* **Business System**: Management & Memory
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Leadership time is consumed by calendar coordination, email triage, and tracking open conversational loops.
* **What It Needs (Prerequisites)**: Mailbox read/draft API, calendar API, natural language time parser.
* **Documented Claim vs. Technical Reality Check**: Autonomous calendar booking risks scheduling over critical personal or deep-work commitments.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Managing showroom owner's appointment schedule and vendor callback queues.
* **Priority for Metro Motors**: **Low**

---

### Agent 46: AI Business Memory Agent
* **Business System**: Management & Memory
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Informed`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Organizations forget why past architectural or operational choices were made, repeating settled debates.
* **What It Needs (Prerequisites)**: Git repository markdown archive (ADRs), decision capture schema, semantic search.
* **Documented Claim vs. Technical Reality Check**: Requires team discipline to record decision rationales consistently at the time choices are made.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Maintaining repository ADRs explaining why MongoDB Atlas is deferred and how offline JSONL fallback functions.
* **Priority for Metro Motors**: **Critical**

---

### Agent 47: AI Client Context Agent
* **Business System**: Management & Memory
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Review required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Clients have to re-explain their preferences and history whenever a new sales rep or account manager takes over.
* **What It Needs (Prerequisites)**: Customer interaction history log, CRM deal notes, customer profile synthesizer.
* **Documented Claim vs. Technical Reality Check**: Outdated notes can misrepresent customer sentiment if interaction logs are not refreshed after every call.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Providing showroom reps with instant context on returning vehicle buyers or service customers.
* **Priority for Metro Motors**: **High**

---

### Agent 48: AI Project Manager
* **Business System**: Management & Memory
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Project managers lose hours to manual status collection and board updates rather than proactive leadership.
* **What It Needs (Prerequisites)**: Project board API (Linear/Jira/GitHub), standup response parser, dependency tracker.
* **Documented Claim vs. Technical Reality Check**: Automated sprint tracking can become bureaucratic noise if task estimates are not grounded in real engineering velocity.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Tracking Metro Motors development milestones, open tests, and dependency vulnerabilities.
* **Priority for Metro Motors**: **High**

---

### Agent 49: AI Client Reporting Agent
* **Business System**: Management & Memory
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Proven`
* **Documented Human Control**: `Approval required`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Account managers spend non-billable days downloading analytics and compiling monthly client slide decks.
* **What It Needs (Prerequisites)**: Third-party analytics API, slide template engine (Google Slides/HTML-to-PDF).
* **Documented Claim vs. Technical Reality Check**: Clients quickly detect template-driven boilerplate if narrative strategic takeaways are not tailored.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Monthly marketplace performance summaries for vehicle consignment partners and financiers.
* **Priority for Metro Motors**: **Low**

---

### Agent 50: AI Agency Operating Agent
* **Business System**: Management & Memory
* **Inspection Status**: **Fully Inspected** (Verified on live platform)
* **Documented Evidence Maturity**: `Emerging`
* **Documented Human Control**: `Human decision only`
* **Documented Readiness Load**: `High`
* **The Problem It Solves**: Founders struggle to balance capacity, project gross margins, and team utilization across fragmented systems.
* **What It Needs (Prerequisites)**: Time tracking database, payroll cost tables, contract retainer ledgers.
* **Documented Claim vs. Technical Reality Check**: High complexity; requires real-time integration across accounting, project management, and CRM systems.
* **Import Mechanism**: Original implementation required. Cannot be downloaded from site.
* **Metro Motors Practical Application**: Calculating labor cost, spare parts overhead, and net margin per refurbished vehicle.
* **Priority for Metro Motors**: **Medium**

---
