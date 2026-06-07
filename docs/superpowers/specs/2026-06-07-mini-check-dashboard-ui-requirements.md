# Mini Check Dashboard UI Requirements

**Status:** Approved requirements  
**Date:** 2026-06-07  
**Primary user:** Homebuyer/customer  
**Visual direction:** Existing Rumper landing-page style  
**Applies to:** Customer-facing Mini Check sample report dashboard

## 1. Objective

Create a read-only customer dashboard that visualizes the Mini Check sample
report as an interactive location-risk report. The dashboard must help a
homebuyer understand the candidate location, material findings, score basis,
evidence quality, limitations, and next decision gate before paying a booking
fee or down payment.

The dashboard is not an internal analyst workspace and must not expose editing,
review, upload, collaboration, or workflow controls in the first version.

## 2. Source Content

The dashboard uses the approved fictional Mini Check scenario:

- Location: `Perumahan Taman Arunika, Bekasi`
- Report type: Mini Check
- Overall temporary Mini Check score: approximately `68/100`
- Outcome: `Layak dengan catatan`
- Recommendation: `Lanjut dengan hati-hati setelah validasi banjir dan akses`
- Main concerns: access-road ponding and single-access bottleneck
- Supporting factors: commute and essential amenities are generally supporting
- Critical override: no confirmed critical red flag

The dashboard must clearly label the content as fictional sample data.

## 3. Product Principles

1. **Customer-first language:** Use plain Bahasa Indonesia and avoid analyst
   jargon unless it is explained.
2. **Findings before formulas:** Show what matters about the location before
   showing how every score was calculated.
3. **Transparent uncertainty:** Show coverage, confidence, limitations, and
   missing evidence visibly.
4. **Score and recommendation separation:** The score explains location
   signals; the recommendation explains what the customer should do next.
5. **Read-only trust:** The first version is for reading and understanding an
   approved report, not editing or submitting new evidence.
6. **Mobile-readable:** The dashboard must work well on phone screens opened
   from WhatsApp.

## 4. Information Architecture

Use a Category Explorer structure with persistent navigation:

| Section | Purpose |
|---|---|
| Overview | Establish location context, top findings, score, and decision gate |
| Flood | Explain flood and ponding signals |
| Commute | Explain commute realism and transport options |
| Access | Explain road access, bottlenecks, and entry/exit risks |
| Amenities | Explain access to essential facilities |
| Environment | Explain environmental and local red-flag signals |
| Methodology | Explain calculation, weights, coverage, confidence, and rubric |

Desktop uses a visible sidebar or left navigation. Mobile collapses navigation
into a compact section switcher or horizontal tabs.

## 5. Overview Requirements

The Overview page uses a finding-led hierarchy:

1. Candidate location and fictional-sample label.
2. Map or spatial location preview.
3. Top material findings.
4. Supporting factors.
5. Temporary Mini Check score.
6. Recommendation.
7. Decision gate before booking fee or DP.

The Overview must answer within the first screen:

- What location is being assessed?
- What are the most important findings?
- Is the result broadly positive, mixed, or risky?
- What must the customer validate before deciding?

## 6. Category Detail Requirements

Each category page uses a map-led evidence layout:

- category title and plain-language summary;
- category score;
- category coverage;
- category confidence;
- map or spatial context as the primary visual;
- evidence cards tied to the candidate point or surrounding area;
- missing-data or limited-coverage indicators;
- validation actions relevant to that category.

Evidence cards should include:

- finding title;
- short observation;
- confidence label;
- evidence summary;
- limitation;
- customer implication;
- validation action.

The category page should not require customers to understand the scoring
formula before they understand the practical finding.

## 7. Methodology Requirements

Use a dedicated Methodology workspace for full scoring transparency.

It must include:

- overall score formula;
- category weights;
- category scores;
- weighted category contribution;
- priority sub-parameter scores used by the Mini Check;
- coverage calculation;
- confidence explanation;
- interpretation bands;
- rubric definitions for score anchors;
- explanation that Mini Check scoring is not equivalent to a Full Report.

The Methodology section may be denser than the customer-facing category pages,
but it must remain readable and structured with tabs, tables, or segmented
sections.

## 8. Read-Only Scope

Version 1 explicitly excludes:

- customer notes;
- photo uploads;
- checklist completion;
- comments;
- family or collaborator invite;
- analyst review requests;
- report editing;
- evidence submission;
- payment or order workflow.

Any checklist shown in the dashboard is instructional only.

## 9. Component Requirements

Use production-grade dashboard patterns:

| Component | Usage requirement |
|---|---|
| Header | Report identity, sample status, and key metadata |
| Sidebar / section navigation | Persistent category explorer on desktop |
| Tabs or segmented control | Mobile section navigation and Methodology subsections |
| Cards | Findings, evidence summaries, metrics, and decision gates |
| Badges | Status, confidence, coverage, and warning labels |
| Alert / callout | Mini Check limitation and fictional sample notice |
| Map preview | Spatial context and evidence location signals |
| Table | Methodology calculations and score contribution |
| Progress / meter | Score and coverage visualization |
| Accordion / disclosure | Optional detail blocks for evidence and scoring explanation |

Buttons should be limited because the dashboard is read-only. Any primary
button must point to a non-editing action such as `Lihat checklist validasi`
or `Lihat metodologi`.

## 10. Visual Direction

Follow the existing Rumper landing-page style:

- warm paper background;
- deep navy primary panels;
- lime accent for primary highlights;
- amber for caution and validation-required states;
- red only for danger or confirmed high-risk states;
- green for supporting or verified-positive states;
- editorial typography pairing aligned with current site direction;
- generous spacing and rounded cards;
- report-card and map-preview visual language;
- calm, trustworthy, non-alarmist tone.

Avoid generic SaaS styling that breaks from the campaign concept. The dashboard
should feel like an extension of the existing Rumper report preview, not a
separate analytics product.

## 11. Responsive Behavior

### Desktop

- Use a two-region layout: persistent navigation and main report canvas.
- Keep the map and primary finding visible near the top of category pages.
- Place Methodology tables in a readable wide layout.

### Tablet

- Keep category navigation visible if space permits.
- Stack secondary metric cards below the map and main finding.

### Mobile

- Replace sidebar with horizontal tabs or a compact section switcher.
- Show one primary content column.
- Keep touch targets at least `44px`.
- Avoid dense tables in the first viewport; Methodology tables may scroll
  horizontally when necessary.

## 12. Accessibility Requirements

- Use semantic headings with one `h1`.
- Ensure WCAG AA color contrast.
- Do not rely on color alone for warning, confidence, or status.
- Provide keyboard focus states for all interactive navigation.
- Use descriptive labels for tabs, disclosures, and map summaries.
- Provide text equivalents for map evidence markers.
- Keep body text at least `14px`, with `16px` preferred.

## 13. Acceptance Criteria

The UI requirements are satisfied when:

1. The dashboard is clearly customer-facing and read-only.
2. The Overview uses location and findings before score methodology.
3. All five categories are available through Category Explorer navigation.
4. Category pages use map-led evidence presentation.
5. Score, coverage, confidence, missing evidence, and validation actions are
   visible.
6. The Methodology workspace exposes all scoring details without overwhelming
   the Overview.
7. The visual design follows the existing landing-page style.
8. The fictional-sample status is visible.
9. The dashboard remains understandable on mobile.
10. No customer editing, upload, collaboration, or analyst workflow is included
    in v1.

