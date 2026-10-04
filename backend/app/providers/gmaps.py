"""Google Maps Platform client: Geocoding (legacy), Routes v2, Places Nearby (legacy).

These match the services enabled on rumper-499015 and the `rumper-maps-key`
restrictions (docs/08 §1).
"""
import logging
import math
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from app.core.config import get_settings

log = logging.getLogger("rumper.gmaps")

_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"


async def _get_json(url: str, params: dict[str, Any], *, timeout: float = 15.0) -> dict[str, Any] | None:
    """GET a Maps endpoint and parse JSON, tolerating failures.

    Maps can return a non-JSON body (HTML error page on billing/quota/5xx) or the
    network can drop (timeout/connect error). Returning ``None`` here lets callers
    degrade to the graceful "couldn't map" path (HTTP 400 / chat retry) instead of
    surfacing an unhandled exception as a 500.
    """
    try:
        async with httpx.AsyncClient(timeout=timeout) as http:
            r = await http.get(url, params=params)
        return r.json()
    except (httpx.HTTPError, ValueError) as e:  # ValueError covers JSONDecodeError
        log.warning("gmaps GET %s failed: %s", url, e)
        return None

JABODETABEK_TOKENS = (
    "jakarta", "bogor", "depok", "tangerang", "bekasi",
)


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def next_weekday_at_wib(weekday: int, hour: int) -> str:
    """RFC3339 UTC timestamp for the next given weekday at `hour` WIB (UTC+7)."""
    now_wib = datetime.now(timezone.utc) + timedelta(hours=7)
    days_ahead = (weekday - now_wib.weekday()) % 7 or 7
    target = (now_wib + timedelta(days=days_ahead)).replace(hour=hour, minute=0, second=0, microsecond=0)
    return (target - timedelta(hours=7)).strftime("%Y-%m-%dT%H:%M:%SZ")


async def geocode(address: str) -> dict[str, Any] | None:
    """Returns {lat, lng, formatted_address, kelurahan, kecamatan, kota, in_jabodetabek}."""
    data = await _get_json(_GEOCODE_URL, {
        "address": address, "region": "id", "language": "id",
        "key": get_settings().maps_api_key,
    })
    if not data or data.get("status") != "OK" or not data.get("results"):
        return None
    res = data["results"][0]
    loc = (res.get("geometry") or {}).get("location")
    if not loc or "lat" not in loc or "lng" not in loc:
        log.warning("gmaps geocode result missing geometry for %r", address)
        return None
    comp = {t: c.get("long_name", "") for c in res.get("address_components", []) for t in c.get("types", [])}
    kota = comp.get("administrative_area_level_2") or comp.get("locality") or ""
    full = res.get("formatted_address", "")
    in_jbdtbk = any(tok in (kota + " " + full).lower() for tok in JABODETABEK_TOKENS)
    return {
        "lat": loc["lat"], "lng": loc["lng"],
        "formatted_address": full,
        "kelurahan": comp.get("administrative_area_level_4") or comp.get("sublocality_level_1"),
        "kecamatan": comp.get("administrative_area_level_3"),
        "kota": kota,
        "in_jabodetabek": in_jbdtbk,
    }


_AREA_PREFIX_RE = r"^(di\s+|ke\s+)?(sekitar(an)?|daerah|area|kawasan|dekat|wilayah)\s+"
_TEXTSEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"


async def geocode_smart(query: str) -> dict[str, Any] | None:
    """Area-tolerant geocoding (docs/12): users may name a *kawasan* ("sekitar BSD City",
    "daerah Haji Nawi"), not a specific cluster. Try: raw → prefix-stripped →
    Places Text Search centroid (then re-geocode for admin components)."""
    import re as _re

    geo = await geocode(query)
    if geo:
        return geo
    stripped = _re.sub(_AREA_PREFIX_RE, "", query.strip(), flags=_re.I).strip()
    if stripped and stripped.lower() != query.strip().lower():
        geo = await geocode(stripped)
        if geo:
            return geo
    # Places Text Search is far better at fuzzy area/landmark names
    data = await _get_json(_TEXTSEARCH_URL, {
        "query": stripped or query, "region": "id", "language": "id",
        "key": get_settings().maps_api_key,
    })
    results = (data or {}).get("results") or []
    if not results:
        return None
    top = results[0]
    geo = await geocode(top.get("formatted_address") or top.get("name", ""))
    if geo:
        return geo
    loc = (top.get("geometry") or {}).get("location")
    if not loc or "lat" not in loc or "lng" not in loc:
        return None
    full = top.get("formatted_address", top.get("name", ""))
    return {
        "lat": loc["lat"], "lng": loc["lng"], "formatted_address": full,
        "kelurahan": None, "kecamatan": None, "kota": None,
        "in_jabodetabek": any(tok in full.lower() for tok in JABODETABEK_TOKENS),
    }


async def autocomplete(
    query: str, *, bias: tuple[float, float] | None = None, radius_m: int = 12000,
) -> list[dict[str, str]]:
    """Places Autocomplete for the address pickers (docs/12 UI).

    `bias` restricts results to a circle — used when the buyer has already chosen a
    corridor, so "Griya" inside Cibubur cannot return a Griya in Surabaya. `strictbounds`
    makes it a hard filter rather than a preference; that is the point here.
    """
    params: dict[str, Any] = {
        "input": query, "components": "country:id", "language": "id",
        "key": get_settings().maps_api_key,
    }
    if bias:
        params["location"] = f"{bias[0]},{bias[1]}"
        params["radius"] = radius_m
        params["strictbounds"] = "true"
    data = await _get_json(
        "https://maps.googleapis.com/maps/api/place/autocomplete/json",
        params,
        timeout=10.0,
    )
    return [
        {"description": p["description"], "place_id": p["place_id"]}
        for p in ((data or {}).get("predictions") or [])[:5]
        if p.get("description") and p.get("place_id")
    ]


async def compute_route(
    origin: tuple[float, float], dest: tuple[float, float], *,
    mode: str, departure_rfc3339: str | None = None, with_polyline: bool = False,
) -> dict[str, Any] | None:
    """mode: DRIVE | TWO_WHEELER | TRANSIT. Returns {duration_min, distance_km, transfers}.

    ``with_polyline`` additionally returns ``polyline`` (Google's encoded path) so the map
    workspace can draw the real street route instead of a straight line (docs/14 §3).
    """
    body: dict[str, Any] = {
        "origin": {"location": {"latLng": {"latitude": origin[0], "longitude": origin[1]}}},
        "destination": {"location": {"latLng": {"latitude": dest[0], "longitude": dest[1]}}},
        "travelMode": mode,
    }
    if mode in ("DRIVE", "TWO_WHEELER"):
        body["routingPreference"] = "TRAFFIC_AWARE"
    if departure_rfc3339:
        body["departureTime"] = departure_rfc3339
    field_mask = "routes.duration,routes.distanceMeters,routes.legs.steps.travelMode"
    if with_polyline:
        field_mask += ",routes.polyline.encodedPolyline"
    headers = {
        "X-Goog-Api-Key": get_settings().maps_api_key,
        "X-Goog-FieldMask": field_mask,
    }
    try:
        async with httpx.AsyncClient(timeout=30) as http:
            r = await http.post(_ROUTES_URL, json=body, headers=headers)
        if r.status_code != 200:
            return None
        routes = r.json().get("routes") or []
    except (httpx.HTTPError, ValueError) as e:
        log.warning("gmaps compute_route failed: %s", e)
        return None
    if not routes:
        return None
    route = routes[0]
    seconds = int(str(route.get("duration", "0s")).rstrip("s") or 0)
    transit_steps = sum(
        1 for leg in route.get("legs", []) for step in leg.get("steps", [])
        if step.get("travelMode") == "TRANSIT"
    )
    out = {
        "duration_min": round(seconds / 60),
        "distance_km": round(route.get("distanceMeters", 0) / 1000, 1),
        "transfers": max(0, transit_steps - 1),
    }
    if with_polyline:
        out["polyline"] = (route.get("polyline") or {}).get("encodedPolyline")
    return out


async def places_nearby(
    lat: float, lng: float, *, radius_m: int,
    place_type: str | None = None, keyword: str | None = None,
) -> list[dict[str, Any]]:
    """Returns [{name, lat, lng, distance_km, types}] sorted by distance."""
    params: dict[str, Any] = {
        "location": f"{lat},{lng}", "radius": radius_m, "language": "id",
        "key": get_settings().maps_api_key,
    }
    if place_type:
        params["type"] = place_type
    if keyword:
        params["keyword"] = keyword
    data = await _get_json(_PLACES_URL, params)
    out = []
    for p in (data or {}).get("results", [])[:10]:
        ploc = (p.get("geometry") or {}).get("location")
        if not ploc or "lat" not in ploc or "lng" not in ploc:
            continue
        out.append({
            "name": p.get("name", "?"),
            "lat": ploc["lat"], "lng": ploc["lng"],
            "distance_km": round(haversine_km(lat, lng, ploc["lat"], ploc["lng"]), 2),
            "types": p.get("types", []),
        })
    out.sort(key=lambda x: x["distance_km"])
    return out
