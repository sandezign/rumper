# Attributions and Adaptation Boundaries

This document records the external systems and visual references informing the
Rumper design guidelines. It does not replace the license files or notices
required by installed dependencies.

## Rumper ownership

Rumper owns:

- Rumper product strategy, content, and decision-safety rules;
- Rumper-specific design-system guidance and token naming;
- Rumper-specific evidence, map, report, risk, and assistant compositions;
- application-owned component source after it is generated or authored;
- original Rumper brand assets and product implementations.

## MongoDB visual inspiration

The design direction is inspired by broad visual characteristics associated
with MongoDB's public-facing interfaces:

- deep-teal framing surfaces;
- bright-green pill-shaped primary actions;
- white and pale-green content surfaces;
- compact card radii;
- structured, information-dense layouts.

Rumper does not copy or claim ownership of:

- MongoDB trademarks, logos, or brand names;
- MongoDB product names or product copy;
- MongoDB proprietary imagery or illustrations;
- MongoDB-specific information architecture or product components;
- MongoDB font licenses or proprietary typefaces.

Use DM Sans rather than requiring Euclid Circular A.

## shadcn/ui

shadcn/ui is used as a component source-distribution workflow. Its CLI copies
component source into the application, where the source becomes
application-owned and may be tailored to Rumper.

Rumper must:

- retain applicable upstream notices and licenses;
- preserve accessibility behavior while customizing components;
- review generated diffs before overwriting tailored source;
- avoid implying shadcn/ui endorsement of Rumper.

Refer to the official shadcn/ui repository and installed package metadata for
the current license and notice requirements.

## Radix UI

Generated shadcn/ui components may depend on Radix UI primitives for
accessibility, focus management, keyboard behavior, and interaction semantics.

Rumper must:

- retain applicable upstream notices and licenses;
- preserve accessible Radix behavior;
- declare directly imported Radix packages as application dependencies;
- verify current license requirements from installed package metadata.

## Lucide

Lucide is the approved icon library through `lucide-react`.

Rumper must:

- retain applicable upstream notices and licenses;
- use verified icon names;
- avoid claiming Lucide icons as original Rumper artwork;
- verify current license requirements from installed package metadata.

## DM Sans

DM Sans is the approved Rumper typeface for display, body, labels, and
controls. Confirm the current font license and required notices before
distribution or self-hosting.

## Maps and data providers

Map tiles, geocoding, spatial layers, and evidence sources may require separate
attribution, licensing, usage limits, or display notices.

Every implementation must:

- show required map-provider attribution;
- retain source links and evidence attribution;
- document source dates, precision, and limitations;
- follow provider terms and usage limits;
- avoid removing required attribution from shared reports or screenshots.

## Public examples

Public examples and prototypes must use fictional or anonymized:

- property and location details;
- customer information;
- evidence records;
- report identifiers;
- expert-review details.

Third-party logos or marks must not be used as generic decoration.

## Attribution verification checklist

Before distribution:

1. Review `package.json` and installed package license metadata.
2. Retain required license files and notices.
3. Confirm font licensing and hosting permissions.
4. Confirm map-provider attribution is visible.
5. Confirm evidence-source citations and links are retained.
6. Confirm no MongoDB trademarks, copy, or proprietary assets were copied.
7. Confirm public examples use fictional or anonymized data.

## Rules

- Treat this document as adaptation guidance, not legal advice.
- Verify current upstream licenses before distribution.
- Preserve required attribution in interfaces, reports, and exported assets.
- Do not imply endorsement by referenced projects or providers.
- Do not copy proprietary visual assets or product copy.
