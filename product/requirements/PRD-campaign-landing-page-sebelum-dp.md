# PRD: Rumper Campaign Landing Page — Before the Down Payment

**Status:** Draft requirement based on approved editorial concept  
**Primary page:** `/sebelum-dp`  
**Primary language:** English  
**Reference prototype:** `apps/website/campaign-concepts/editorial.html`

## 1. Summary

Rumper needs a focused campaign landing page that converts campaign visitors into qualified requests for a free Mini Location Risk Check.

The page must help first-time homebuyers understand hidden location risks, trust Rumper's independent approach, preview the report format, and submit a real shortlisted home in Greater Jakarta before paying a booking fee or down payment.

The landing page is separate from the main Rumper website. It uses an editorial, evidence-led design and sends the primary conversion to an external Typeform.

## 2. Contacts

| Role | Owner | Responsibility |
|---|---|---|
| Product owner | Founder / Product Lead | Approves scope, offer, and success criteria |
| Marketing owner | Growth / Marketing Lead | Campaign traffic, message, attribution, and offer availability |
| Design owner | Product Designer | Visual quality, responsive behavior, and accessibility |
| Engineering owner | Web Engineer | Page implementation, integrations, analytics, and performance |
| Operations owner | Operations Lead | Reviews Mini-Check requests and manages customer follow-up |

## 3. Background

### Context

First-time homebuyers often receive positive information from property listings, agents, developers, and brochures. Important location risks such as flooding, difficult commutes, poor road access, and environmental concerns are harder to verify.

Rumper is an independent buyer-side service. It helps buyers check location risks before they make a difficult-to-reverse financial commitment.

### Why This Page Is Needed

The main marketing website explains the wider Rumper service. Campaign traffic needs a more focused page with one clear offer:

> Free Mini Location Risk Check for users with a shortlisted home in Greater Jakarta.

The page must balance conversion with trust. Asking for a real home location is a high-trust action. Visitors need to see useful evidence, clear limitations, and an understandable report format before they submit.

### Strategic Fit

The page supports Rumper's validation-first strategy by helping the team:

- Reach buyers with real shortlisted properties.
- Test whether visitors will submit a real location.
- Identify the strongest campaign source and message.
- Convert qualified Mini-Check requests into paid Full Location Risk Reports.

### Product Boundary

This landing page is a marketing and lead-generation experience. It is not the location-risk product itself.

It does not include:

- Automated location analysis.
- User accounts.
- Payment.
- A customer dashboard.
- A custom Mini-Check intake backend.
- Automated report generation.

## 4. Objective

### Objective Statement

Convert campaign visitors with a shortlisted home in Greater Jakarta into qualified Mini Location Risk Check requests by showing clear risks, independent evidence, and a credible example report.

### Customer Benefit

The page helps buyers understand what they should check before paying a booking fee or down payment. It gives them a low-risk way to start evaluating a shortlisted location.

### Company Benefit

The page generates qualified leads and provides evidence about campaign-message fit, customer concerns, and demand for the paid Full Location Risk Report.

### Key Results

| Key result | Target |
|---|---:|
| Qualified Mini-Check conversion rate | At least 5% of campaign visitors |
| Primary CTA tracking coverage | 100% of CTA placements |
| Campaign attribution coverage | 100% of Typeform referrals where technically available |
| Mobile usability | No blocked content, hidden fields, or horizontal page scroll |
| Accessibility | WCAG AA for text contrast and keyboard operation |

### Qualified Conversion Definition

A qualified Mini-Check conversion is a completed Typeform submission that contains:

- A specific property location, Google Maps link, listing, or development name.
- A location within Greater Jakarta.
- Usable contact information.

Decision timing should be collected for prioritization, but it is not required for qualification.

### Supporting Metrics

- Primary CTA click-through rate.
- Sample-report section view rate.
- Sample-report request conversion rate.
- WhatsApp confirmation-open rate.
- Typeform completion rate.
- Qualified versus unqualified submissions.
- Later conversion from Mini-Check to paid Full Report.
- Performance by campaign source, message, device, and CTA placement.

## 5. Market Segments

### Primary Segment

First-time homebuyers who have a shortlisted home in Greater Jakarta and want to reduce location-related uncertainty before paying a booking fee or down payment.

### Priority Jobs

- Verify claims such as “flood-free” or “strategic location.”
- Understand realistic commute time and effort.
- Identify road-access and environmental risks.
- Find useful questions for a physical site visit.
- Discuss the decision with a partner or family using shared evidence.

### Important Segments

| Segment | Main concern | Page message |
|---|---|---|
| Almost-down-payment buyer | Fear of making an expensive mistake | Check before paying the down payment |
| Flood-anxious buyer | Distrust of flood-free claims | Important claims need evidence |
| Commuter buyer | Unclear daily travel cost | A short distance may not mean an easy commute |
| Family-influenced buyer | Needs a neutral discussion tool | Use one clear report to discuss the decision |

### Eligibility

The free Mini-Check is available to visitors who have a shortlisted home in Greater Jakarta.

The page may receive visitors without a candidate or outside the service area. The Typeform should identify these visitors and route or label them as unqualified leads.

## 6. Value Propositions

### Core Value Proposition

Rumper helps first-time homebuyers check hidden location risks before paying a booking fee or down payment.

### Customer Gains

- A clearer view of the shortlisted location.
- Independent evidence that does not depend on closing a property sale.
- A simple summary that can be discussed with family.
- Clear next steps for further validation.

### Pains Reduced

- Biased or incomplete property information.
- Difficulty verifying property-marketing claims.
- Fragmented location data.
- Unclear commute reality.
- Fear of discovering important problems after moving in.

### Differentiation

| Alternative | What it provides | Rumper difference |
|---|---|---|
| Property listing | Helps visitors find homes | Checks hidden risks after a home is shortlisted |
| Agent or developer | Helps complete a property transaction | Provides an independent buyer-side view |
| Google Maps | Shows location, route, and distance | Turns several signals into practical findings |
| Home inspection | Reviews building condition | Reviews the surrounding location |

### Message Principles

- Protect without frightening.
- Challenge claims, not people.
- Use clear consumer language instead of technical GIS terms.
- Separate evidence, interpretation, recommendation, and uncertainty.
- Never claim that Rumper guarantees a risk-free location.

## 7. Solution

### 7.1 UX and Prototype

#### Approved Direction

Use the **Editorial Risk Intelligence** concept:

- Large editorial headlines.
- Warm neutral page background.
- Large navy evidence and conversion panels.
- Lime primary actions.
- Report previews as the main trust proof.
- Amber, red, and green only for labeled risk states.
- Calm, evidence-led tone.

Reference:

`apps/website/campaign-concepts/editorial.html`

#### Primary User Flow

```text
Campaign visitor opens /sebelum-dp
→ Understands the pre-down-payment risk and offer
→ Reviews evidence and sample-report content
→ Clicks a primary CTA
→ Opens the external Mini-Check Typeform with attribution
→ Completes the Typeform
→ Operations qualifies and follows up with the lead
```

#### Secondary User Flow

```text
Visitor clicks View Sample Report
→ Page scrolls to the on-page report preview
→ Visitor reviews report format and evidence
→ Visitor enters name and WhatsApp number
→ Page validates the fields
→ WhatsApp opens with a prefilled sample-report request
→ Operations sends the sample report manually
```

### 7.2 Page Structure and Content Requirements

#### A. Sticky Navigation

Must include:

- Rumper brand link.
- `What we check` anchor link.
- `Sample report` anchor link.
- `FAQ` anchor link.
- Primary CTA: `Check my location`.

Requirements:

- Remains available while scrolling.
- Uses one clear primary CTA.
- Desktop shows navigation links.
- Mobile may hide secondary links but must keep the brand and primary CTA.

#### B. Hero

Must communicate within the first viewport:

- What Rumper does.
- When the visitor should use it.
- Who qualifies for the free Mini-Check.
- Primary and secondary actions.

Required copy:

- Headline: `Check home location risks before paying the down payment.`
- Supporting message covering flood risk, commute, road access, and red flags.
- Offer note: free for the first 20 users with a shortlisted home in Greater Jakarta.

Required visual:

- Central Rumper report preview.
- Evidence cards showing flood risk, commute, confidence, and recommendation.

#### C. Trust Strip

Must show:

- Real shortlisted property requirement.
- Buyer-first independence.
- Transparent evidence and confidence labels.
- Limited free Mini-Check offer.

Do not show customer or partner logos unless their use is approved.

#### D. Problem Section

Must explain common buyer blind spots:

- Flood-free claims.
- Map distance versus real commute.
- Purchase price versus long-term location cost.

Each problem card uses:

`Visual → short claim → short explanation`

#### E. Report Preview

Must show that the Rumper report includes:

- Risk findings.
- Evidence sources.
- Confidence labels.
- Location score or risk summary.
- Final recommendation.
- Site-visit questions or checklist.

The preview must clearly be labeled as an example. It must not imply that the displayed location is a real customer location.

#### F. What Rumper Checks

Must include five modules:

1. Flood Risk Check.
2. Real Commute.
3. Road Access.
4. Red Flag Scan.
5. Recommendation.

Flood risk may receive stronger visual emphasis because it is a high-priority concern.

#### G. Sample Report Request

Required fields:

- Name.
- WhatsApp number.

Requirements:

- Use visible labels.
- Validate fields after the user leaves a field or submits the form.
- Show errors below the relevant field.
- Focus the first invalid field after a failed submission.
- Explain how the contact details will be used.
- After valid submission, open WhatsApp with a prefilled request message.
- Do not store contact details on the landing page unless a storage system is approved later.

#### H. How It Works

Must explain four steps:

1. Send the shortlisted location.
2. Rumper checks the risks.
3. Receive a clear summary.
4. Upgrade to the Full Location Risk Report if needed.

#### I. Offer Section

Must include:

- Free Mini Location Risk Check offer.
- Greater Jakarta eligibility.
- Limited availability.
- Primary CTA to the external Typeform.
- Clear statement that the offer is for initial beta validation.

The “first 20 users” claim must be removed or updated when the offer is no longer available.

#### J. FAQ

Must answer:

- Does Rumper sell homes?
- Does Rumper guarantee the location is risk-free?
- Who is the service for?
- How much does the Full Location Risk Report cost?

FAQ items use accessible disclosure or accordion behavior. Multiple items may remain open.

#### K. Mobile Sticky CTA

Must:

- Appear after the hero CTA leaves the viewport.
- Hide near the main offer section.
- Respect mobile safe-area spacing.
- Never cover form controls or page content.

### 7.3 Component Standards

| Component | Requirement |
|---|---|
| Primary button | Lime fill, dark text, verb-first label, minimum 44px touch target |
| Secondary button | Clearly subordinate outline or transparent style |
| Cards | Use a border or shadow, not both unless required by the report-preview composition |
| Risk badges | Pair semantic color with visible text |
| Form inputs | Visible labels, minimum 44px height, inline error and focus state |
| Accordion | Keyboard operable with clear expanded state |
| Icons | One consistent SVG icon style; no emoji icons |
| Focus state | Visible high-contrast focus ring |

### 7.4 Visual Design Requirements

#### Color Roles

| Role | Approved direction |
|---|---|
| Page background | Warm off-white |
| Feature panels | Deep navy |
| Primary action | Bright lime |
| Primary text | Near-black navy |
| Secondary text | Muted blue-gray |
| Warning risk | Amber with text label |
| High risk | Red with text label |
| Positive state | Green with text label |

#### Typography

- Display headings: Fraunces or approved equivalent.
- Body and UI: DM Sans or approved equivalent.
- Body text must be at least 16px on mobile.
- Long text should use a readable line length.

#### Layout

- Mobile-first responsive design.
- Maximum desktop content width around 1,200px.
- No horizontal page scroll.
- Use generous whitespace and clear section separation.
- The report preview may overlap visual elements, but not interactive controls.

### 7.5 Motion Requirements

Motion must explain evidence, hierarchy, or feedback. It must not distract from conversion.

#### Motion Tokens

| Motion | Duration |
|---|---:|
| Press feedback | About 100ms |
| Hover and focus | About 180ms |
| Standard reveal | About 260ms |
| Report emphasis | Up to 420ms |
| Evidence-card stagger | About 40ms between cards |

#### Required Motion Behavior

- Hero report appears before supporting evidence cards.
- Evidence cards enter in a short sequence.
- Report pages separate slightly when the preview enters the viewport.
- CTA press feedback must be immediate.
- Form errors appear near the related field.
- FAQ expansion uses a short transition.
- Mobile sticky CTA fades and moves into view.

#### Motion Guardrails

- Animate transform and opacity where possible.
- Do not use auto-advancing carousels.
- Do not use looping decorative animation.
- Do not block interaction while motion runs.
- Respect `prefers-reduced-motion`.

### 7.6 Accessibility Requirements

- Meet WCAG AA contrast for normal text.
- Provide a skip-to-main-content link.
- Use one `h1` and a logical heading order.
- Make every interactive control keyboard operable.
- Use visible focus states.
- Pair color-coded risk states with text.
- Use meaningful labels for forms and controls.
- Use descriptive alternative text for meaningful images.
- Keep touch targets at least 44×44px.
- Do not disable browser zoom.

### 7.7 Analytics Requirements

Track the following events:

| Event | Required properties |
|---|---|
| `campaign_page_viewed` | Source, campaign, device, landing-page variant |
| `primary_cta_clicked` | CTA placement, source, campaign |
| `sample_report_preview_viewed` | Source, campaign |
| `sample_report_request_submitted` | Source, campaign |
| `whatsapp_sample_request_opened` | Source, campaign |
| `typeform_opened` | CTA placement, source, campaign |
| `typeform_completed` | Source, campaign, qualification result when available |

Requirements:

- CTA placement names must be consistent.
- UTM or equivalent attribution must pass to Typeform where supported.
- Page functionality must continue when analytics fails.
- Do not send property locations or personal contact details to analytics tools.

### 7.8 Technology Requirements

- Publish as a dedicated route: `/sebelum-dp`.
- Primary CTA opens the external Mini-Check Typeform.
- Typeform URL must be configurable without changing page content.
- Sample-report request opens WhatsApp with a prefilled message.
- Static page content must work without a backend.
- Use optimized responsive images for production assets.
- Lazy-load non-critical images below the fold.
- Reserve image dimensions to avoid layout shift.
- Load third-party analytics asynchronously.

### 7.9 Performance Requirements

- Main content must remain usable on slow mobile connections.
- Avoid large autoplay video.
- Avoid unnecessary third-party scripts.
- Target no visible layout shift during page load.
- Ensure the hero remains readable if external fonts fail.
- The page must work when JavaScript fails, except for enhanced motion, validation, and WhatsApp-prefill behavior.

### 7.10 Content and Legal Guardrails

- State that Rumper provides risk indicators, not guarantees.
- State that Rumper does not replace a physical site visit.
- Do not imply every property agent or developer is dishonest.
- Do not publish submitted locations without permission.
- Do not claim the offer is available to the first 20 users after capacity is filled.
- Clearly distinguish sample findings from real customer results.

### 7.11 Acceptance Criteria

#### Content and Navigation

- Visitors can understand Rumper's service, eligibility, and primary action from the hero.
- All navigation anchors lead to the correct page section.
- All primary CTAs open the configured external Typeform.
- `View Sample Report` scrolls to the on-page report preview.

#### Sample Request

- The form requires name and WhatsApp number.
- Invalid fields show a clear inline error.
- The first invalid field receives focus after failed submission.
- A valid submission opens WhatsApp with a prefilled sample-report request.
- Privacy helper text is visible.

#### Responsive and Accessibility

- The page works at 375px, 768px, 1,024px, and 1,440px widths.
- The page has no horizontal scroll.
- The mobile sticky CTA does not cover content or form controls.
- Keyboard users can reach and operate every action.
- Risk status is understandable without color.
- Reduced-motion mode removes non-essential movement.

#### Analytics and Resilience

- Each primary CTA placement sends a distinct analytics property.
- Typeform receives campaign attribution where supported.
- The page remains usable if analytics or Typeform tracking fails.

### 7.12 Assumptions to Validate

1. Visitors will trust Rumper enough to submit a real property location after seeing an evidence-led report preview.
2. The free Mini-Check offer will produce qualified leads rather than only free-service seekers.
3. Greater Jakarta visitors understand the value of flood, commute, access, and red-flag checks.
4. A sample-report request through WhatsApp provides enough trust without requiring a downloadable PDF on the page.
5. The editorial page will achieve at least a 5% qualified Mini-Check conversion rate.
6. English is suitable for the intended campaign audience. This must be tested against a Bahasa Indonesia version.

## 8. Release

### Version 1: Campaign MVP

Target delivery: one short implementation cycle.

Includes:

- Dedicated `/sebelum-dp` page.
- Approved editorial evidence-led layout.
- Responsive desktop and mobile behavior.
- External Typeform primary CTA.
- On-page sample report preview.
- Name and WhatsApp sample-request form.
- WhatsApp prefilled-message handoff.
- Required analytics events and campaign attribution.
- Accessibility and reduced-motion support.
- FAQ and service-limit disclaimers.

### Version 1 Exclusions

- Custom lead database.
- Automated qualification.
- Automated report delivery.
- Personalized page content.
- A/B testing platform integration beyond a simple variant identifier.
- Downloadable sample PDF hosted by the page.

### Future Versions

- Bahasa Indonesia and English language variants.
- A/B tests for headline, offer, and section order.
- Dynamic offer-capacity status.
- Partner-specific campaign pages.
- Automated sample-report delivery.
- Direct integration between Typeform, lead tracker, and customer follow-up.
- Personalized report-preview examples by primary concern.

### Release Readiness Checklist

- Offer availability and wording approved.
- Typeform URL and required fields confirmed.
- WhatsApp destination and prefilled message approved.
- Sample findings confirmed as anonymous or fictional.
- Analytics event names and attribution tested.
- Privacy copy approved.
- Mobile and desktop acceptance criteria passed.
- Operations team ready to process incoming requests.
