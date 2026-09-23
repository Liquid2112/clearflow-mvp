# ClearFlow Pitch Deck

---

## Slide 1: Title

### ClearFlow
**Understand your water. Choose the right next step.**

Consumer water-information and treatment-recommendation platform

*Shubh Patel | Vanderbilt University | Class of 2030*
*liquid2112.github.io/clearflow-mvp*

---

## Slide 2: The Problem

**36 million U.S. households on public water systems don't have a simple way to understand their water quality.**

- Public water-system data exists (EPA SDWIS/ECHO, CCRs) but is scattered across government portals, written in compliance jargon, and hard to act on.
- Residents who notice chlorine taste, hardness, or see a local water-quality report don't know which treatment option fits their situation.
- Existing solutions are either generic water-test kits with no context, or expensive in-home consultations with no transparency.
- **The gap:** free public data → plain-English explanation → personalized recommendation → credible next step.

---

## Slide 3: The Solution

**ClearFlow connects a user's address to public water-system information, explains it in plain English, and recommends a tailored water-treatment path — in under 3 minutes.**

**User flow:**
1. Enter address or ZIP code → location matched to most likely public water system (PWSID)
2. Plain-English public-data snapshot: system name, PWSID, compliance status, water source, latest CCR link
3. 7-question personalization quiz (goal, housing, scope, household size, budget, installation willingness, test preference)
4. Deterministic treatment recommendation — not an AI black box, not a sales pitch
5. Optional pilot signup to save the recommendation and get follow-up

**Key disclosure, always visible:** This is a *likely water-system match*, not a test of the water at your specific tap. A home test is recommended before household-specific treatment decisions.

---

## Slide 4: Market Size

| Segment | Households | Revenue Opportunity |
|---------|-----------|---------------------|
| **TAM** — U.S. households served by public/community water systems, willing to purchase home water treatment | 36,000,000 | **$10.8B** (at ~$300 avg. treatment spend) |
| **SAM** — Digitally reachable homeowners/renters in areas whose ZIP codes map reliably to public water systems, reachable online | 10,000,000 | **$3.0B** |
| **SOM** — First 3 years: Tennessee + nearby states, online ads, health conferences, partnerships | 50,000 | **$15M** (0.5% of SAM) |

*Sources: EPA Public Water System Service Areas (epa.gov), EPA SDWIS/ECHO data downloads (echo.epa.gov), U.S. Census household data.*

---

## Slide 5: Product Demo (Live MVP)

**Live site:** `https://liquid2112.github.io/clearflow-mvp/`

**What the investor can do in the demo:**
1. Go to the landing page — "Understand your water. Choose the right next step."
2. Click **Check My Water**
3. Enter a ZIP code (e.g., 37201 — Nashville) or a full address
4. See the water-system match: Metropolitan Nashville Department of Water Services, PWSID TNPW0001234, 650k population served, "No recent health-based violation found"
5. Click **Continue to personalization** → take the 7-question quiz
6. See the recommendation: treatment category, rationale, estimated cost range, disclosure

**Current coverage:** Nashville metro / Tennessee (2 water systems stubbed — Nashville and Brentwood). Built to expand state-by-state as EPA integration connects.

---

## Slide 6: How It Works (Architecture)

**Data pipeline:**
- **Geocoding:** Address → lat/lng (stub: ZIP-code lookup; production: Census geocoder or commercial)
- **Point-in-polygon match:** lat/lng tested against EPA Community Water System service-area boundaries → PWSID
- **Compliance lookup:** PWSID → EPA SDWIS/ECHO → compliance status, water source, CCR URL
- **Recommendation engine:** Quiz answers + water-system data → deterministic rules engine → treatment category + rationale + cost range

**Tech stack:**
- Next.js 14, TypeScript, Tailwind CSS
- In-memory data store (MVP); PostgreSQL + PostGIS planned for production
- Static export — deployable to any static hosting (GitHub Pages, Vercel, Netlify)
- No LLM in the recommendation path — full transparency and auditability

---

## Slide 7: Business Model

**Revenue hypothesis (to validate in pilot):**

- **Freemium public-data report:** Anyone can check their water system for free — drives traffic and trust.
- **Pilot signup:** Email capture to save recommendations, follow-up guidance, priority access — builds the lead pipeline.
- **Test-kit affiliate/affiliate-plus:** When ClearFlow recommends a test kit, earn on certified kit orders (not a specific brand partnership).
- **Treatment solution marketplace (future):** Curated, certified treatment options with re-occuring monitoring — subscription-grade recurring revenue model similar to WHOOP for water quality.

**What we are NOT:** Not selling a specific filter brand. Not charging for the public-data lookup. Not a lead-gen site that sells user data.

---

## Slide 8: Competitive Landscape

| | ClearFlow | Generic water test kit | In-home water consultation | Utility CCR (raw) |
|---|---|---|---|---|
| Free public data lookup | ✅ | ❌ | ❌ | ✅ (but raw) |
| Plain-English explanation | ✅ | ❌ | ✅ | ❌ |
| Personalized to user situation | ✅ | ❌ | ✅ | ❌ |
| Transparent, deterministic | ✅ | N/A | ❌ (sales-driven) | N/A |
| Online, under 3 minutes | ✅ | ✅ | ❌ (schedule required) | ❌ (read a PDF) |
| Cost to user | Free | $20–$150 | $100–$300+ consultation | Free (but time-consuming) |

**ClearFlow sits between "free but unusable data" and "expensive, opaque consultation."**

---

## Slide 9: Traction & Roadmap

**Current state (MVP):**
- ✅ 9-page responsive web app (landing, check-water, results, quiz, plan, how-it-works, data-sources, privacy, admin)
- ✅ ZIP-code-only lookup mode (US only)
- ✅ deterministic recommendation engine with 8 treatment categories
- ✅ In-memory lead capture + admin dashboard
- ✅ Static export — deployable and live at liquid2112.github.io/clearflow-mvp

**What's next (post-MVP):**
- Integrate real EPA geocoding + ArcGIS service-area layer (production, not stub)
- Integrate EPA ECHO REST API / SDWIS bulk data for real compliance events by PWSID
- Expand from Nashville/Tennessee to next geographies state-by-state
- PostgreSQL + PostGIS for persistent water-system data indexed by PWSID
- Pilot launch: measure completion rate, match rate, quiz completion, plan view, pilot signup
- Manual review of 25 test addresses without unsupported water-safety claims (success criterion from spec)

**Success criteria for first pilot:**
- Match ≥80% of test addresses in launch geography to a water system or clearly explain match failure
- Display water-system name, PWSID, boundary source, data freshness, link to official source
- Produce transparent treatment recommendation from quiz inputs
- Capture pilot interest and log anonymous funnel events
- Pass manual review of 25 test addresses

---

## Slide 10: Why Now

- **Water-quality awareness is rising** — Flint, MI; emerging contaminants; aging infrastructure. Consumers are paying attention but don't know how to act.
- **Public data is available but unusable** — EPA maintains rich water-system data, but the barrier is interpretation, not data availability.
- **Consumer hardware market is fragmented** — no integrated software layer connects public data to treatment decisions.
- **AI hype creates an opening for transparency** — consumers and regulators are skeptical of AI-decided health-adjacent recommendations. A deterministic, auditable rules engine is a differentiator, not a compromise.

---

## Slide 11: The Ask

**What we're looking for:**

- Feedback on the MVP from a water-industry or consumer-software investor
- Introductions to water utility contacts, EPA data partners, or treatment-equipment manufacturers for the integration roadmap
- Pilot partnership: run ClearFlow with a defined user group, measure the funnel, iterate on the recommendation logic
- Early-stage support to connect the EPA data integrations (geocoding, ArcGIS service areas, ECHO/SWMIS compliance) and expand beyond Nashville

**Contact:** Shubh Patel — Vanderbilt University, Mechanical Engineering + Mathematics, Class of 2030
**Demo:** `https://liquid2112.github.io/clearflow-mvp/`
**Code:** `github.com/Liquid2112/clearflow-mvp`

---

## Appendix: Data Sources

- EPA Community Water System service-area layer — ArcGIS feature service, provides PWSID-linked service boundaries
- EPA SDWIS/ECHO — Safe Drinking Water Information System, compliance and monitoring data by PWSID, refreshed quarterly
- EPA Consumer Confidence Reports (CCR) — annual water-quality reports published by community water systems, linked from SDWIS
- U.S. Census — household count estimates used for market sizing

*All public data. All linked from the app's Data Sources page.*
