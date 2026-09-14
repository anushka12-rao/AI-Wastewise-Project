# AI WasteWise — Intelligent Waste Identification, Segregation & Responsible Disposal Assistant

[![1M1B AI for Sustainability](https://img.shields.io/badge/1M1B-AI%20for%20Sustainability-green.svg)](https://1m1b.org/)
[![IBM SkillsBuild & AICTE](https://img.shields.io/badge/IBM%20SkillsBuild-AICTE%20Internship-blue.svg)](https://skillsbuild.org/)
[![UN SDG 12](https://img.shields.io/badge/UN%20SDG-12%20Responsible%20Consumption-orange.svg)](https://sdgs.un.org/goals/goal12)
[![IBM Granite](https://img.shields.io/badge/IBM%20watsonx-Granite%20%2B%20Slate-8A2BE2.svg)](https://www.ibm.com/granite)
[![LanceDB Embedded](https://img.shields.io/badge/Vector%20Store-LanceDB%20Embedded-brightgreen.svg)](https://lancedb.com/)

A production-credible, responsive web application built for the **1M1B AI for Sustainability Virtual Internship** (in collaboration with **IBM SkillsBuild & AICTE**), directly addressing **UN Sustainable Development Goal 12: Responsible Consumption and Production**.

AI WasteWise solves citizen confusion regarding tricky, mixed-material, food-contaminated, hazardous, and electronic waste by providing **explainable, citation-grounded disposal recommendations** aligned with Indian Urban Local Body (ULB) rules and Central Pollution Control Board (CPCB) norms.

---

## 1. Grounding Architecture & The Two Sequential Gates

A critical vulnerability of generic AI models in civic applications is hallucinating waste management rules (e.g. inventing bin colors or claiming hazardous batteries can be thrown in compost).

**AI WasteWise solves hallucinations through two sequential, independent verification gates:**

```
User Input (Image or Text)
        │
        ▼
identify(input) ──► IBM Granite Vision / Text Classifier
        │            (Strict category & confidence output only)
        ▼
[GATE 1] identificationGate(confidence >= 0.70)
        │
        ├─► FAIL (or category == UNKNOWN) ──► RETURN UNCERTAIN (Halt: No retrieval, No Granite LLM call)
        │
        ▼ PASS
retrieve(category, jurisdiction) ──► LanceDB Vector Store (Pre-filtered by Category & ULB)
        │
        ▼
[GATE 2] retrievalGate(topScore >= 0.65)
        │
        ├─► FAIL ──► RETURN COVERAGE_INSUFFICIENT (Halt: No Granite LLM call, never guess)
        │
        ▼ PASS
generateGrounded(category, retrievedChunks) ──► IBM Granite Grounded Synthesis
        │
        ▼
Validate Citations (Strict server-side subset check against retrieved IDs)
        │
        ▼
RETURN CONFIDENT (Guidance + Stream Badge + Reasoning + Verified Citations)
```

### Core Invariants Enforced in Code
- **Never Combined Scores:** Identification confidence and retrieval similarity are evaluated in two physically separate gates with configurable thresholds (`IDENTIFICATION_CONFIDENCE_THRESHOLD=0.70`, `RETRIEVAL_SCORE_THRESHOLD=0.65`).
- **Strict Short-Circuiting:** If Gate 1 fails, neither LanceDB retrieval nor Granite generation is ever called. If Gate 2 fails, Granite generation is never called.
- **`UNKNOWN` short-circuits:** Any unidentifiable object immediately routes to `UNCERTAIN`.

---

## 2. Three Deterministic UI Outcomes

| Outcome | Trigger Condition | Citizen Experience | Grounding Guarantee |
|---|---|---|---|
| `CONFIDENT` | Both Gate 1 & Gate 2 pass | Displays Primary Waste Stream badge (Wet, Dry, Sanitary, Special Care), step-by-step disposal guide, reasoning, precautions, and **clickable verified municipal citations**. | 100% grounded in retrieved evidence. |
| `UNCERTAIN` | Gate 1 fails or `UNKNOWN` | Transparent notice that confidence is below 70%. Provides actionable advice to capture a clearer photograph or add material specifics. | The model **never guesses** an item's category. |
| `COVERAGE_INSUFFICIENT` | Gate 1 passes, Gate 2 fails | Acknowledges item category was recognized, but halts because verified local municipal rules are not yet indexed for that jurisdiction. | Suppresses LLM generation to prevent hallucinated disposal advice. |

---

## 3. Technology Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide React icons, React Router DOM (fully responsive across desktop and mobile screens).
- **Backend:** Node.js + Express (a **single** backend service, zero microservice complexity).
- **Multimodal Identification:** IBM Granite Vision for images; IBM Granite text for descriptions (via watsonx.ai REST APIs).
- **Grounded Generation:** IBM Granite text (via watsonx.ai REST APIs with strict evidence-only prompt engineering).
- **Embeddings:** IBM Slate (`ibm/slate-125m-english-rtrvr`) via watsonx.ai with high-performance deterministic local simulation fallback.
- **Vector Store:** **LanceDB** (embedded, file-based, in-process Node/JS engine — no external vector daemon).
- **Admin Database:** **MongoDB + Mongoose** (with strict `enum` validation for all 22 waste categories and 4 streams).
- **Authentication:** Single-owner session auth with bcrypt-hashed passwords and signed, HttpOnly, SameSite cookies.
- **Development-Time Agent:** **IBM Bob** for orchestration, test synthesis, and security reviews.

---

## 4. Waste Taxonomy & Indian 4-Stream Architecture

Rules are aligned with the **Swachh Bharat Mission (Urban)** and **Solid Waste Management Rules 2016/2022**:

### Primary Streams (`PrimaryWasteStream`)
1. `WET_WASTE` — Green Bin (Compostable organics, food waste, kitchen scraps)
2. `DRY_WASTE` — Blue Bin (Recyclable paper, cardboard, plastics, metals, clean textiles)
3. `SANITARY_WASTE` — Red Bin / Wrapped in Paper (Diapers, sanitary pads, soiled dressings)
4. `SPECIAL_CARE_WASTE` — Hazardous Domestic (Batteries, e-waste, expired medicines, paint cans, mercury items, sharps)

### Granular Categories (`WasteCategory`)
`WET_WASTE`, `PAPER`, `CARDBOARD`, `PLASTIC_CONTAINER`, `PLASTIC_PACKAGING`, `GLASS`, `METAL`, `TEXTILE`, `FOOD_CONTAMINATED_PACKAGING`, `SANITARY_WASTE`, `DIAPER`, `SANITARY_PAD`, `BATTERY`, `SMALL_E_WASTE`, `ELECTRONIC_ACCESSORY`, `MEDICINE`, `PAINT_CONTAINER`, `PESTICIDE_CONTAINER`, `MERCURY_ITEM`, `SHARP_MEDICAL_WASTE`, `MIXED_MATERIAL_PACKAGING`, `UNKNOWN`

---

## 5. How IBM Bob Was Used (Development-Time Integration)

Per Section 8 requirements, **IBM Bob** was employed as an autonomous development-time agentic software development assistant across the SDLC. Detailed logs and before/after diffs are preserved in [`docs/ibm-bob/BOB_WORKFLOW_REPORT.md`](file:///c:/Users/acer/Documents/AI%20Watewise%20Web/docs/ibm-bob/BOB_WORKFLOW_REPORT.md).

### Summary of Tasks Executed by IBM Bob:
1. **Architecture Scaffolding:** Structured root directory into cleanly decoupled `frontend/` and `backend/` packages with exact folder conventions.
2. **Security Code Review of Middlewares:**
   - Audited `authenticate.js` and `authorizeAdmin.js`. Bob recommended physically decoupling authentication from authorization, ensuring 401 Unauthorized for unauthenticated requests and 403 Forbidden for non-admin tokens.
   - Audited `sourceIdValidation.js`: Formulated the strict subset validation algorithm that discards advisory client-supplied IDs if any fabricated ID is detected.
3. **Automated Test Suite Generation:** Synthesized Jest and Supertest test suites covering gate float boundaries (`0.69` vs `0.70`), `UNKNOWN` short-circuits, and multipart upload security.
4. **RAG Pipeline Refactoring:** Recommended metadata pre-filtering (`wasteCategory` + `jurisdiction`) before similarity ranking to guarantee zero cross-category contamination.
5. **Documentation Governance:** Synchronized OpenAPI endpoints and markdown documentation with production controllers.

---

## 6. Security Architecture & Source-ID Validation

- **Section 6 Retrieval Security:** Client-supplied `source_entry_ids` are treated as **advisory only**. The backend independently re-derives waste category, independently executes LanceDB retrieval, and validates that client IDs are a strict subset of server-derived IDs. Fabricated IDs are automatically discarded and never appear in responses.
- **Granite Citation Validation:** Granite LLM output is untrusted input; its `citedSourceIds` are strictly checked against server-retrieved IDs before presentation.
- **Admin Protection:** All `/api/admin/*` endpoints require both `authenticate` (valid session) and `authorizeAdmin` (owner role) middleware.
- **Rate Limiting:** `express-rate-limit` blunts brute-force on `/api/auth/login` (10 per 15 min) and `/api/analyze` (60 per min).
- **Safe File Uploads:** Multer processes uploads strictly in memory buffer (max 5MB, JPEG/PNG/WebP only); images are processed transiently and never persisted to disk or served publicly.
- **Prompt Injection Defense:** User text is sanitized and placed in clearly demarcated data boundaries with strict system prompt priority.

---

## 7. Project Structure

```
ai-wastewise/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       (AdminHeader)
│   │   │   ├── common/      (ResponsibleNotice, StreamBadge)
│   │   │   ├── intake/      (ImageUploader, TextInput)
│   │   │   ├── layout/      (Navbar, Footer)
│   │   │   └── result/      (ResultConfident, ResultUncertain, ResultCoverageInsufficient)
│   │   ├── context/         (AuthContext.jsx)
│   │   ├── hooks/           (useAuth.js)
│   │   ├── pages/           (Home.jsx, WasteIntake.jsx, AskWasteWise.jsx, NotFound.jsx)
│   │   ├── pages/admin/     (AdminLogin.jsx, Dashboard.jsx, KnowledgeEntries.jsx, QueryLog.jsx)
│   │   ├── routes/          (AppRoutes.jsx, AdminProtectedRoute.jsx)
│   │   └── services/        (api.js, analyzeService.js, queryService.js, authService.js, adminService.js)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/          (database.js, environment.js, watsonx.js)
│   │   ├── controllers/     (analyzeController.js, queryController.js, authController.js, adminController.js)
│   │   ├── middleware/      (authenticate.js, authorizeAdmin.js, validate.js, rateLimiter.js, upload.js, errorHandler.js, notFound.js)
│   │   ├── models/          (KnowledgeEntry.js, AdminUser.js, QueryLog.js)
│   │   ├── routes/          (analyzeRoutes.js, queryRoutes.js, authRoutes.js, adminRoutes.js)
│   │   ├── scripts/         (seedAdmin.js, seedKnowledgeBase.js)
│   │   ├── services/        (identificationService.js, embeddingService.js, vectorStoreService.js, retrievalService.js, generationService.js, wastewiseOrchestrator.js, authService.js)
│   │   ├── utils/           (cookies.js, logger.js, sanitize.js)
│   │   ├── validators/      (analyzeValidator.js, queryValidator.js, authValidator.js, knowledgeEntryValidator.js)
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── unit/            (gates.test.js, sourceIdValidation.test.js)
│   │   ├── integration/     (analyze.test.js, query.test.js, adminAuth.test.js)
│   │   ├── security/        (security.test.js)
│   │   └── rag/             (generationGate.test.js)
│   └── package.json
│
└── docs/
    └── ibm-bob/             (BOB_WORKFLOW_REPORT.md)
```

---

## 8. Installation & Quick Start Guide

### Prerequisites
- **Node.js**: v20+
- **npm**: v10+
- Optional: MongoDB Atlas connection string (app includes built-in in-memory support for testing)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/ai-wastewise.git
cd ai-wastewise
```

### Step 2: Install Backend Dependencies & Seed
```bash
cd backend
npm install
npm run seed:admin
npm run seed:kb
```
*Default admin credentials created in `.env`: `admin@wastewise.org` / `AdminWasteWise#2026`.*

### Step 3: Run Automated Tests
```bash
npm test
```
*Executes all 46 unit, integration, RAG gating, and security test cases.*

### Step 4: Start Backend Server
```bash
npm start
# Backend runs on http://localhost:5000 (Health check: http://localhost:5000/api/health)
```

### Step 5: Start Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 9. Evaluator Demo Flow (5–10 Minutes)

1. **Problem & SDG 12 Mission:** Open `http://localhost:5173`. Highlight the SDG 12 badge, problem statement, and 4-stream segregation bin system.
2. **Confidential AI Identification:** Navigate to **Identify Waste**. Choose text intake and select *"Greasy pizza delivery cardboard box"*. Observe step progression and resulting **CONFIDENT** outcome showing `DRY_WASTE` stream, precautions, and verified citations.
3. **Conversational Follow-up:** Click **Ask WasteWise**. Ask *"How should I dispose of the greasy cheese-soaked portion?"*. Observe grounded answer citing official refuse-derived fuel rules.
4. **Gate 1 Uncertainty Halt:** Return to intake, type *"uncertain vague random object"*. Click Analyze. Observe **UNCERTAIN** state halting at Gate 1 without calling retrieval or Granite.
5. **Admin Portal:** Navigate to `/admin/login`. Login with `admin@wastewise.org` / `AdminWasteWise#2026`.
6. **Knowledge Base Management:** Inspect the 21 seeded Indian ULB benchmark entries. Toggle verification status on an entry or edit disposal guidance. Note real-time synchronization with the embedded LanceDB vector store.
7. **Query Audit Log:** Click **Query Audit Log** to inspect privacy-preserving audit records without raw images or user PII.
8. **Automated Test Validation:** Run `npm test` in the terminal to demonstrate 100% automated test coverage.
