# User Flows

## Flow 1: Viewing the Analysis
1. After the research loader finishes, the three-region workspace opens.
2. The user's focus is drawn to the center **Analysis Region**.
3. User views the `Overview` tab (Overall RLS Score, Priority Findings).
4. User clicks the `Evidence Risk` tab to see paginated evidence cards categorized by risk (e.g., Ketahanan Banjir, Aksesibilitas). Each card features a status badge and an actionable **Map Layer Toggle switch** (default ON) to show/hide specific risk layers on the map.
5. User clicks the `Nearby Facilities` tab to view a structured field validation checklist.
6. User can click the **Analyst Review Prompt ("Minta tinjauan analis")** to consult a human expert.

## Flow 2: Exploring the Map (Verifying Environmental Hazards)
1. User looks at the right **Map Workspace** region.
2. User interacts with the **Segmented Tab Bar** above the map (`Overview`, `Red Flags`, `Commute`, `Facilities`, `Toll & Access`).
3. User notices the **Floating Legend Card** displaying active layer radii and data sources.
4. User clicks a specific POI marker or a hazard polygon (e.g., Flood Zone, SUTET).
5. An **Interactive POI Detail Card (Evidence Card)** popup displays over the map containing:
   - Header image and radius distance.
   - CLAIM / TEMUAN (The specific AI finding).
   - KEPERCAYAAN BUKTI (Confidence level badge).
   - KETERBATASAN DATA (Limitations of the source data).
   - LANGKAH LAPANGAN (A specific checklist step to validate the POI).
   - Action Button (e.g., "Navigasi di Google Maps").

## Flow 3: Two-Way Synchronization
1. User reads the left-hand text panel mentioning a specific risk or facility (e.g., "RS Hermina is 2km away").
2. User hovers their mouse over this text.
3. The map automatically switches to the relevant tab (e.g., "Facilities").
4. The map zooms and highlights the marker with a pulsing animation.

## Flow 4: Asking Follow-up Questions (Report QA)
1. User clicks the FAB `+ AI Assistant` or expands the left **Assistant Rail**.
2. User views the **"Deep Thinking" accordion logger**.
3. User selects a suggested follow-up question chip or asks a question.
4. The AI replies strictly using the generated report factsheet as context.
