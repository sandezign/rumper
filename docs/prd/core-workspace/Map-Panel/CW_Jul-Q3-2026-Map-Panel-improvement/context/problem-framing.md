# Problem Framing

## The Problem
First-time home buyers in Jabodetabek need an intuitive way to digest complex geospatial risk data (flood zones, commute times, infrastructure) alongside their personalized research results. A traditional, text-only generative AI chat interface is insufficient because it forces users to read long paragraphs to extract spatial and quantitative data, leading to fatigue and diminished trust in the data's accuracy.

Furthermore, buyers lack a way to visually verify the claims made by property agents or abstract AI risk scores. When looking at a "64% Flood Risk Score," buyers need to know exactly *where* the flood is and *who* verified it, otherwise they remain skeptical and anxious about their purchase.

## Evidence
- Text-only reports bore users and fail to visually communicate spatial risks like flood radiuses or SUTET proximity.
- A generic GPT/Gemini chat interface can perform shallow surveys but struggles to present structured, deterministic evidence clearly.
- Real estate platforms currently only show generic map pins, offering zero risk transparency.
- The Rumper Pre-mortem identified "data accuracy" (Tiger #2) as a key risk.

## Key Insights
- The AI assistant must be *subordinate* to the verified analysis. The chat acts as a guide (intake & QA) while the actual visual evidence is delivered via a structured three-region workspace: Chat Rail, Analysis Region, and Map Workspace.
- The map shouldn't just be a navigation tool; it needs to be an interactive "Proof Engine." Every marker on the map must act as clickable evidence with cited sources and confidence levels, transforming abstract AI research into undeniable geographic reality.
