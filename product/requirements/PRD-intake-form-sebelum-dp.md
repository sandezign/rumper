# PRD: Rumper Campaign Intake Form — Before the Down Payment

**Status:** Approved design, ready for implementation planning  
**Primary route:** `/sebelum-dp/intake`  
**Entry point:** Primary CTA from `/sebelum-dp`  
**Primary language:** Bahasa Indonesia  
**Initial storage:** Google Sheets through a controlled submission endpoint

## 1. Summary

Rumper needs a simple, mobile-first intake flow after the campaign landing page. The form collects enough information to understand a buyer's context, save the inquiry for validation tracking, and continue the conversation through WhatsApp.

The first release uses a short multi-step form. It allows visitors without a specific property location to submit, but marks them as exploratory leads rather than qualified Mini-Check requests.

## 2. Contacts

| Role | Owner | Responsibility |
|---|---|---|
| Product owner | Founder / Product Lead | Approves scope, questions, and success criteria |
| Marketing owner | Growth / Marketing Lead | Owns campaign attribution and funnel reporting |
| Engineering owner | Web Engineer | Builds the form, submission endpoint, and Google Sheets integration |
| Operations owner | Operations Lead | Reviews submissions and conducts WhatsApp follow-up |
| Research owner | Customer Research Lead | Reviews lead quality and validation learning |

## 3. Background

### Context

The `/sebelum-dp` landing page explains Rumper's independent location-risk service and invites visitors to check a shortlisted home before paying a booking fee or down payment.

After clicking the primary CTA, visitors need a clear way to share their buying context. The intake must collect enough information for manual follow-up without creating the friction of a long order form.

### Why Build a Custom Intake Flow

A custom intake flow gives Rumper control over:

- The mobile experience and campaign message.
- The order and wording of questions.
- Campaign attribution.
- Lead classification.
- The handoff from form submission to WhatsApp.

### Strategic Fit

The intake supports the current validation plan by helping Rumper measure:

- Whether visitors trust Rumper enough to submit personal and property context.
- Whether leads have a real shortlisted property.
- How close leads are to a booking-fee or DP decision.
- Which location risks are most urgent.
- Which campaign sources produce qualified leads.

### Product Boundary

This intake is a lead-capture and qualification-support flow. It is not a customer account, paid order flow, or automated location-analysis product.

## 4. Objective

### Objective Statement

Convert interested landing-page visitors into saved inquiries that the Rumper team can review and follow up through WhatsApp.

### Customer Benefit

Visitors can explain their location concerns in a few short steps and receive a clear next action without creating an account.

### Company Benefit

Rumper receives structured lead data that can be used for qualification, customer follow-up, and validation analysis.

### Key Results

| Key result | Initial target |
|---|---:|
| Form completion rate | At least 50% of visitors who start the intake |
| Successfully saved submissions | At least 99% of submitted forms |
| WhatsApp continuation rate | At least 50% of saved submissions |
| Submission attribution coverage | At least 95% where campaign data is available |
| Required contact-consent coverage | 100% of saved submissions |

### Lead Classification

| Classification | Definition |
|---|---|
| `qualified_candidate` | Submission includes a usable property name, Google Maps link, or listing link |
| `exploratory` | Submission does not include a usable specific property reference |

Location availability alone does not decide final qualification. Operations must also review intended use, decision stage, timeline, and stated concern.

## 5. Market Segments

### Primary Segment

First-time homebuyers considering a home for personal occupancy in Jabodetabek, especially those approaching a booking-fee or DP decision.

### Secondary Segment

Visitors who are still exploring an area or do not yet have a specific property candidate. Their submissions are accepted and marked as exploratory leads.

### Priority Jobs

- Share a property or area that needs checking.
- Explain the current buying stage and decision timeline.
- Explain important daily needs and location concerns.
- Start a WhatsApp conversation with Rumper.

## 6. Value Proposition

### Core Value Proposition

Share your buying context and location concerns so Rumper can help identify the most important risks to check before paying a booking fee or down payment.

### Customer Gains

- A short and guided submission process.
- No account required.
- Clear confirmation that the request was received.
- A direct WhatsApp channel for the next step.

### Pains Reduced

- Unclear information requirements.
- Repeating the same context during follow-up.
- Long forms that ask for unnecessary order details.
- Uncertainty about what happens after submission.

## 7. Solution

### 7.1 Primary User Flow

```text
Visitor clicks a primary CTA on /sebelum-dp
→ Opens /sebelum-dp/intake with campaign attribution
→ Reads the short introduction
→ Completes the multi-step intake
→ Reviews and submits the form
→ Submission is saved to Google Sheets
→ Success state confirms the inquiry was received
→ WhatsApp opens with a prefilled confirmation message
→ Operations reviews and follows up
```

### 7.2 Flow Structure

The form uses one section per screen with a visible progress indicator.

| Step | Section | Purpose |
|---:|---|---|
| 1 | Intro | Explain what information is needed and what happens next |
| 2 | Contact | Collect the minimum information needed for follow-up |
| 3 | Location | Collect a property reference when available |
| 4 | Buying Context | Understand intended use, buying stage, and urgency |
| 5 | User Needs | Understand daily needs and primary concerns |
| 6 | Consent | Record WhatsApp and feedback permissions |
| 7 | Review and Submit | Let the visitor review key answers and submit |

Users can move backward without losing answers. Moving forward validates only the current step.

### 7.3 Form Content

#### Step 1: Intro

| Element | Requirement |
|---|---|
| Title | `Cek Risiko Lokasi Rumah Saya` |
| Description | Explain that Rumper checks location-risk signals before booking fee or DP |
| Expectation | Explain that the team will review the submission and continue through WhatsApp |
| Limitation | State that Rumper is not an agent and does not replace a physical site survey |
| Primary action | `Mulai` |

#### Step 2: Contact

| Field ID | Label | Type | Required | Validation |
|---|---|---|---|---|
| `full_name` | Nama | Short text | Yes | 2–100 characters |
| `whatsapp_number` | Nomor WhatsApp | Telephone | Yes | Accept a valid Indonesian or international phone-number format |

Helper text for WhatsApp:

> Kami akan menggunakan nomor ini untuk mengonfirmasi kebutuhan dan melanjutkan proses pengecekan.

#### Step 3: Location

All location fields are optional. The form must clearly explain that a specific property helps Rumper provide a more useful follow-up.

| Field ID | Label | Type | Required | Validation |
|---|---|---|---|---|
| `property_name_or_area` | Nama perumahan / area | Short text | No | Maximum 200 characters |
| `google_maps_url` | Link Google Maps | URL | No | Valid `http` or `https` URL when entered |
| `listing_url` | Link listing properti | URL | No | Valid `http` or `https` URL when entered |

If all three fields are empty, show a non-blocking message:

> Belum punya kandidat spesifik? Tidak masalah. Permintaan kamu akan kami catat sebagai eksplorasi awal.

#### Step 4: Buying Context

| Field ID | Label | Type | Required | Options |
|---|---|---|---|---|
| `purchase_purpose` | Rumah ini akan digunakan untuk apa? | Single choice | Yes | Ditinggali sendiri; Ditinggali bersama pasangan atau keluarga; Investasi; Belum yakin; Lainnya |
| `buying_stage` | Saat ini kamu sudah di tahap apa? | Single choice | Yes | Baru eksplorasi area; Sudah punya kandidat; Sudah survei lokasi; Hampir bayar booking fee; Hampir bayar DP; Sudah booking dan ingin validasi; Lainnya |
| `decision_timeline` | Kapan rencana booking fee atau DP? | Single choice | Yes | Kurang dari 1 bulan; 1–3 bulan; 3–6 bulan; Lebih dari 6 bulan; Belum pasti |

If `purchase_purpose` is `Investasi`, show a non-blocking scope message:

> Rumper saat ini berfokus pada risiko lokasi, bukan analisis investasi atau prediksi kenaikan harga.

#### Step 5: User Needs

| Field ID | Label | Type | Required | Options or validation |
|---|---|---|---|---|
| `primary_activity_location` | Lokasi kerja atau aktivitas utama | Short text | No | Maximum 200 characters |
| `primary_transport` | Transportasi utama sehari-hari | Single choice | Yes | Mobil pribadi; Motor pribadi; Transportasi umum; Ojek online; Kombinasi; Lainnya |
| `family_status` | Status keluarga saat ini | Single choice | No | Single; Menikah, belum punya anak; Menikah, punya anak; Tinggal bersama keluarga besar; Lainnya |
| `risk_concerns` | Risiko apa yang paling kamu khawatirkan? | Multiple choice | Yes | Banjir atau genangan; Commute; Akses jalan; Kemacetan; Transportasi umum; Fasilitas keluarga; Lingkungan sekitar; Keamanan; Klaim sales atau developer; Belum tahu |
| `concern_detail` | Ceritakan kekhawatiran utama kamu | Long text | No | Maximum 1,000 characters |

At least one `risk_concerns` option must be selected.

#### Step 6: Consent

| Field ID | Label | Type | Required | Behavior |
|---|---|---|---|---|
| `whatsapp_contact_consent` | Saya bersedia dihubungi Rumper melalui WhatsApp terkait permintaan ini | Required checkbox | Yes | Submission is blocked until checked |
| `feedback_consent` | Apakah kamu bersedia memberi feedback setelah menerima hasil pengecekan? | Single choice | Yes | Options: Ya; Tidak |
| `privacy_acknowledgement` | Saya memahami data ini digunakan untuk memproses permintaan dan validasi layanan Rumper | Required checkbox | Yes | Submission is blocked until checked |

Consent must not be preselected.

#### Step 7: Review and Submit

The review screen must show:

- Name and WhatsApp number.
- Available property references.
- Buying stage and decision timeline.
- Primary risk concerns.
- Contact and feedback consent choices.

Users can return to the relevant step to edit an answer.

Submit button:

`Kirim Lokasi untuk Dicek`

### 7.4 Submission Behavior

On submission:

1. Disable duplicate submission while the request is in progress.
2. Validate all required fields and formats.
3. Generate a unique `lead_id`.
4. Determine `lead_classification`.
5. Save the submission to Google Sheets through the approved endpoint.
6. Record the successful submission analytics event without personal or property data.
7. Show a success state.
8. Open WhatsApp with a prefilled confirmation message.

The form must only open WhatsApp after Google Sheets confirms a successful save.

### 7.5 WhatsApp Handoff

The WhatsApp message must not include every form answer. It should confirm the saved request and provide enough context for operations to find the record.

Recommended message:

```text
Halo Rumper, saya sudah mengirim permintaan Cek Risiko Lokasi Rumah.

Nama: {full_name}
ID Permintaan: {lead_id}

Saya siap melanjutkan konfirmasi melalui WhatsApp.
```

Requirements:

- Use a configurable Rumper WhatsApp destination number.
- Redirect to the WhatsApp URL only after a successful save.
- Show a visible `Lanjutkan ke WhatsApp` fallback link if automatic opening fails.
- Keep the success message visible if the visitor returns from WhatsApp.

### 7.6 Success State

Required copy:

> Terima kasih, permintaan kamu sudah tersimpan.
>
> Tim Rumper akan meninjau informasi yang kamu kirim dan melanjutkan konfirmasi melalui WhatsApp.

The success state must also show:

- The generated request ID.
- Whether the request is recorded as a specific-location request or exploratory request.
- A WhatsApp continuation button.
- A link back to the campaign landing page.

### 7.7 Google Sheets Requirements

Each successful submission creates one new row. Existing rows must never be overwritten by a new submission.

Required columns:

| Column | Source |
|---|---|
| `submitted_at` | Server-generated timestamp |
| `lead_id` | Server-generated unique ID |
| `lead_classification` | Derived from location fields |
| `status` | Default value: `new_inquiry` |
| `full_name` | Form |
| `whatsapp_number` | Form |
| `property_name_or_area` | Form |
| `google_maps_url` | Form |
| `listing_url` | Form |
| `purchase_purpose` | Form |
| `buying_stage` | Form |
| `decision_timeline` | Form |
| `primary_activity_location` | Form |
| `primary_transport` | Form |
| `family_status` | Form |
| `risk_concerns` | Form, stored as a consistent separated list |
| `concern_detail` | Form |
| `whatsapp_contact_consent` | Form |
| `feedback_consent` | Form |
| `privacy_acknowledgement` | Form |
| `utm_source` | Hidden attribution |
| `utm_medium` | Hidden attribution |
| `utm_campaign` | Hidden attribution |
| `utm_content` | Hidden attribution |
| `landing_page_variant` | Hidden attribution |
| `cta_placement` | Hidden attribution |

Google Sheets is the initial inquiry source of truth. Access must be limited to approved Rumper team members.

### 7.8 Attribution

The landing-page CTA must pass available campaign data to `/sebelum-dp/intake`.

The intake must preserve attribution while the visitor moves between steps and include it in the saved submission.

Required attribution fields:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `landing_page_variant`
- `cta_placement`

Missing attribution must not block form completion.

### 7.9 Validation and Error Handling

#### Field Errors

- Show errors below the related field.
- Use clear Bahasa Indonesia instructions.
- Focus the first invalid field after a failed step or submission.
- Do not clear valid answers when another answer has an error.

#### Submission Failure

If Google Sheets saving fails:

- Do not open WhatsApp automatically.
- Keep all entered answers.
- Show a clear failure message.
- Provide a `Coba Kirim Lagi` action.
- Provide a manual WhatsApp fallback that states the form could not be saved.

Recommended failure message:

> Permintaan belum berhasil tersimpan. Data yang kamu isi masih ada. Silakan coba kirim lagi.

#### Duplicate Protection

- Disable the submit action during an active request.
- Use `lead_id` or an idempotency key to avoid duplicate rows when a request is retried.
- Do not silently discard a duplicate attempt.

### 7.10 Analytics Requirements

| Event | Required properties |
|---|---|
| `intake_viewed` | Source, campaign, CTA placement |
| `intake_started` | Source, campaign |
| `intake_step_completed` | Step name, source, campaign |
| `intake_submission_attempted` | Source, campaign |
| `intake_submitted` | Lead classification, source, campaign |
| `intake_submission_failed` | Error category, source, campaign |
| `intake_whatsapp_opened` | Lead classification, source, campaign |

Do not send names, phone numbers, property names, URLs, concern details, or request IDs to analytics tools.

### 7.11 Privacy and Security Requirements

- Explain how contact and property information will be used.
- Do not preselect consent.
- Do not store personal data in browser analytics.
- Do not expose Google Sheets credentials or write permissions in client-side code.
- Validate and normalize data at the submission endpoint.
- Reject unexpected fields and excessively long values.
- Protect the endpoint against basic automated spam.
- Do not commit real customer submissions or credentials to Git.
- Do not use submitted property details in marketing or case studies without separate explicit permission.

### 7.12 Accessibility and Responsive Requirements

- Design mobile-first for visitors arriving from campaign links.
- Support 375px, 768px, 1,024px, and 1,440px widths without horizontal scrolling.
- Show a text progress label in addition to a visual progress bar.
- Use visible labels for every field.
- Keep touch targets at least 44×44px.
- Make every action keyboard operable.
- Show a visible focus state.
- Associate error messages with their fields.
- Do not rely on color alone for progress, errors, or status.
- Preserve entered values when navigating backward and forward.

### 7.13 Acceptance Criteria

#### Navigation and Flow

- Every primary CTA on `/sebelum-dp` can open `/sebelum-dp/intake`.
- Available campaign attribution reaches the intake.
- Users can move backward without losing answers.
- Users cannot advance when a required field in the current step is invalid.

#### Location and Classification

- Users can submit without entering a property name, Google Maps link, or listing link.
- A submission without a property reference is saved as `exploratory`.
- A submission with at least one property reference is saved as `qualified_candidate`.

#### Consent

- Users cannot submit without WhatsApp contact consent.
- Users cannot submit without the privacy acknowledgement.
- Feedback consent records both `Ya` and `Tidak` without blocking submission.

#### Saving and WhatsApp

- A valid submission creates exactly one Google Sheets row.
- The saved row contains the generated `lead_id`, classification, default status, answers, and available attribution.
- WhatsApp opens only after a successful save.
- A WhatsApp fallback link remains available from the success state.
- A failed save keeps all entered answers and provides retry.

#### Privacy and Analytics

- Analytics events contain no personal or property-specific data.
- Google Sheets credentials are not present in client-side code.
- Real customer data is not committed to Git.

### 7.14 Assumptions to Validate

1. A multi-step form will achieve at least a 50% completion rate.
2. Allowing exploratory submissions will create useful future leads without overwhelming operations.
3. Visitors will accept WhatsApp contact as a required next step.
4. Saving before WhatsApp will improve tracking without materially reducing continuation.
5. Google Sheets will remain manageable during the early validation phase.
6. The selected questions provide enough context for a short WhatsApp qualification conversation.

## 8. Release

### Version 1: Validation Intake

Target delivery: one short implementation cycle.

Includes:

- `/sebelum-dp/intake` route.
- Seven-step mobile-first intake flow.
- Required field validation.
- Exploratory and qualified-candidate classification.
- Google Sheets submission.
- Campaign attribution.
- Success and error states.
- Save-before-WhatsApp handoff.
- Basic analytics.
- Privacy and consent requirements.

### Version 1 Exclusions

- Customer accounts.
- Payment collection.
- Automated Mini-Check or report generation.
- Automated final qualification or rejection.
- Automated package recommendation.
- File uploads.
- Multiple-property comparison intake.
- A customer order-status page.
- A custom operations dashboard.

### Future Considerations

Add or change features only after validation data shows a clear need. Possible later improvements include adaptive questions, paid-order intake, comparison intake, automated qualification support, and migration from Google Sheets to a structured database.
