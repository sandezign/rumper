# Developer Handoff: Map Panel V3 Leaflet Migration & UI Improvements

This document serves as the guide for the frontend implementation and migration of the Map Panel to V3.

## 1. Architectural Transition: Google Maps vs. Leaflet

To adhere to the project constraints and minimize third-party API dependencies/costs, the V3 Map Panel has transitioned from the Google Maps SDK to **Leaflet** using **React-Leaflet** and **OpenStreetMap (OSM) tiles**.

| Feature | Old Stack (Google Maps) | New Stack (Leaflet + OSM) |
| :--- | :--- | :--- |
| **Map Loader** | `<APIProvider>` + `<Map>` | `<MapContainer>` + `<TileLayer>` |
| **Tile Source** | Google Maps Tiles (API key required) | OpenStreetMap Standard Tiles (Free) |
| **Overlay Markers** | Custom React Portal overlay elements | `<Marker>` with HTML-based `L.divIcon` |
| **Popups** | `<InfoWindow>` (Google Maps custom wrapper) | `<Popup>` (react-leaflet wrapper) |
| **Overlays** | Custom overlay components (`MapCircle`, `MapPolygon`) | `<Circle>` and `<Polygon>` (Native Leaflet components) |

---

## 2. Dependency Configuration

Install the following dependencies inside the `frontend/` directory (use `--legacy-peer-deps` due to React 19 compatibility overrides):
- `leaflet` (`^1.9.4`)
- `react-leaflet` (`^4.2.1`)
- `@types/leaflet` (`^1.9.12` as a devDependency)

### CSS Inclusion
Import the Leaflet CSS stylesheet in the application entrypoint `src/main.tsx` right after the global Tailwind imports:
```typescript
import "leaflet/dist/leaflet.css";
```

---

## 3. Leaflet Component Design

### 3.1 Custom HTML Markers (`L.divIcon`)
We render HTML-based icons (emojis and Lucide icons) inside Leaflet markers to keep the visual design consistent. To achieve this, we render React elements into static strings:

```typescript
import { renderToString } from "react-dom/server";

const createLeafletIcon = (element: React.ReactElement) => {
  return L.divIcon({
    html: renderToString(element),
    className: "", // clears default Leaflet styling
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};
```

### 3.2 Two-Way Sync Hook (`MapController`)
To reactively pan and zoom the map when a finding or text hover is triggered in the center region, we use a controller component that handles the Leaflet map reference:

```typescript
function MapController({ center, selected }: { center: { lat: number; lng: number }; selected: Selected | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.setView([selected.lat, selected.lng], 15, { animate: true });
    } else {
      map.setView([center.lat, center.lng], 14, { animate: true });
    }
  }, [map, selected, center.lat, center.lng]);
  return null;
}
```

---

## 4. UI Layer Mapping & Filter System

Interactive overlay layers are rendered according to the active tab:
- **Overview**: Candidate location pin + RLS score halo circle.
- **Red Flags**: SUTET, landfill, industrial, cemetery, and rail line markers. If the flood overlay is active, the InaRISK flood polygon contour displays.
- **Commute**: Local KRL/transit stations + Walkability radius halos (500m, 1km, 2km).
- **Facilities**: Healthcare facilities (hospital, clinic, pharmacy), schools, markets, and supermarkets.
- **Toll & Access**: Nearby toll gate markers.

---

## 5. Overlay Styling Guidelines (index.css overrides)

We override default Leaflet popup styles to match Rumper's card elevation tokens:
```css
.custom-leaflet-popup .leaflet-popup-content-wrapper {
  padding: 0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1) !important;
  border: 1px solid #e1e5e8 !important;
}
.custom-leaflet-popup .leaflet-popup-content {
  margin: 0 !important;
  width: 320px !important;
}
.custom-leaflet-popup .leaflet-popup-close-button {
  background: rgba(255, 255, 255, 0.92) !important;
  border-radius: 9999px !important;
  top: 10px !important;
  right: 10px !important;
}
```
