// Street View Static thumbnails for a corridor centroid.
//
// The reference design fills each area card with a stock photograph. We show the actual
// place instead — same endpoint the report map panels already use (`MapPanelV3`), keyed on
// the corridor centroid the areas API returns. Where Street View has no coverage Google
// serves a generic "no imagery" tile rather than a 404, so the caption always says what the
// picture is; it is never presented as a verified photo of a listing.

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined;

export function streetViewThumb(
  latLng: [number, number] | undefined,
  size: "square" | "banner" = "banner",
): string | null {
  if (!MAPS_KEY || !latLng) return null;
  const [lat, lng] = latLng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const dims = size === "square" ? "220x220" : "440x220";
  return `https://maps.googleapis.com/maps/api/streetview?size=${dims}&location=${lat},${lng}&fov=90&key=${MAPS_KEY}`;
}
