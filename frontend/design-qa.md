# Onboarding V2 Design QA

- Source visual truth: `/Users/arisandy/.codex/generated_images/01a0be3b-3694-70e2-81a7-90918e4b5ba4/exec-d7c27f91-7b62-48fc-b521-41f63829d309.png`
- Browser implementation capture: `/Users/arisandy/Documents/Sandz Assistant/rumper-launch/rumper-app/frontend/onboarding-v2-implementation.png`
- Side-by-side evidence: `/Users/arisandy/Documents/Sandz Assistant/rumper-launch/rumper-app/frontend/onboarding-v2-comparison.png`
- Route: `http://127.0.0.1:3000/v2/onboarding`
- State: initial V2 onboarding welcome screen
- CSS viewport: 390 × 844 px
- Device scale factor: 1
- Source pixels: 853 × 1844 px, normalized to the 390 × 844 CSS frame in the side-by-side comparison
- Implementation pixels: 390 × 844 px

**Findings**

- No actionable P0, P1, or P2 differences remain.
- The first comparison found one P2 asset issue: the `Supermarket` SVG callout exceeded the illustration viewBox and clipped on the right. The callout was moved inward, the screen was recaptured at 390 × 844, and the post-fix evidence shows the complete label.
- The implementation intentionally says `Langkah 1 dari 5` rather than the concept's `Langkah 1 dari 7`. The current working V2 flow contains welcome, four interactive stages, and synthesis; showing seven would misrepresent the implemented journey.

**Required Fidelity Surfaces**

- Fonts and typography: DM Sans is preserved through the existing application font stack. Weight, wrapping, centered headline, uppercase eyebrow, and small supporting copy match the concept hierarchy.
- Spacing and layout rhythm: the compact progress header, centered headline, dominant map illustration, divided evidence list, supporting note, and persistent bottom CTA fit within 390 × 844 without document overflow.
- Colors and visual tokens: white canvas, deep-teal text, pale-green emphasis, semantic evidence blue/amber, and green action treatment follow the existing Rumper palette. Green is not used as a safety verdict.
- Image quality and asset fidelity: the raster concept was not embedded. The implemented map is a dedicated external SVG asset with crisp paths, accessible title/description, and appropriate scaling at the target viewport.
- Copy and content: selected-direction copy is preserved except for the truthful total-step count. Unsupported claims such as `bebas risiko` and `60 detik` were removed.

**Full-view comparison evidence**

The saved side-by-side comparison checks composition, hierarchy, illustration scale, list density, and viewport fit in one view. The implementation retains the selected concept's main visual rhythm while simplifying the small legend and map details for legibility.

**Focused region evidence**

A separate crop was not required because the full-view comparison keeps the headline, illustration labels, evidence rows, and CTA readable at the normalized target size. The clipped SVG label was inspected and corrected directly in the 390 × 844 browser capture.

**Interaction and browser checks**

- Primary CTA `Analisis lokasi saya`: visible, enabled, and advances to the first interactive intake stage.
- Back action from the first interactive stage: returns to the welcome screen.
- Console errors on the tested path: none.
- Browser-rendered body at 390 × 844: `scrollHeight` equals `clientHeight` (844 px), so the persistent CTA remains visible without vertical overflow.
- Production build: passed. Existing CSS optimizer and bundle-size warnings remain outside this screen's change.

**Comparison history**

1. Initial browser capture: one P2 clipped `Supermarket` callout in the SVG.
2. Fix: moved the callout inward within the SVG viewBox.
3. Post-fix browser capture: label fully visible; no remaining P0/P1/P2 visual findings.

**Follow-up polish**

- P3: evaluate whether the small in-map labels remain useful on devices narrower than 390 px; they may be simplified in a later iteration if user testing shows visual noise.

## Cross-step consistency follow-up

- Annotated issue: the first intake step used a wide dashboard shell, branded app header, pale-grey canvas, circular next control, emoji cards, and desktop-only radar panel that did not match the redesigned welcome screen.
- Fix: all onboarding states now share one white canvas, centered mobile content column, five-segment progress header, 28–30 px heading scale, pale-green eyebrow, restrained selection cards, and fixed pill-shaped bottom actions.
- Component updates: friction, commute, persona, work-pattern, and budget controls now use a consistent radius, border, selection ring, icon treatment, spacing rhythm, focus state, and 200–300 ms response timing.
- Emotional-language update: the synthesis screen now says what Rumper will do with the choices rather than claiming that the best or flood-free corridors have already been found.
- Browser evidence: `/Users/arisandy/Documents/Sandz Assistant/rumper-launch/rumper-app/frontend/onboarding-v2-step1-consistent.png` and `/Users/arisandy/Documents/Sandz Assistant/rumper-launch/rumper-app/frontend/onboarding-v2-summary-consistent.png`.
- Journey test: welcome → four interactive steps → synthesis completed successfully; primary actions were visible and enabled; browser console reported no errors.
- Production build: passed after the consistency changes. The existing CSS optimizer and bundle-size warnings remain unrelated to this flow.

## Interface Craft polish pass

- Added a documented four-beat storyboard: surface enters at 0 ms, prompt at 45 ms, context at 110 ms, and interactive control at 170 ms.
- All animation timing, offsets, and spring physics are named constants in `VisualOnboardingShell.tsx`; there are no transition magic numbers in the stage JSX.
- Step changes use exit-before-enter choreography so two questions do not compete on screen.
- Progress segments and primary actions use restrained spring feedback; no looping or decorative animation was added.
- `prefers-reduced-motion` is respected through `useReducedMotion`, collapsing transitions to immediate state changes.
- Context copy was rewritten to reduce pressure and clarify reversibility, especially for concern selection and budget range.
- Browser journey test passed from welcome through synthesis. New context copy and final action were visible, enabled, and console-error free.

final result: passed
