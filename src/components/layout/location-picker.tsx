"use client";

import { ChevronRight, LocateFixed, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { locationLabel, nearestNeighborhood, neighborhoods } from "@/lib/geo";
import { useDemoStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/use-hydrated";

export function LocationPicker() {
  const hydrated = useHasHydrated();
  const location = useDemoStore((s) => s.preferences.location);
  const setPreferences = useDemoStore((s) => s.setPreferences);
  const shown = hydrated ? location : "Jubilee Hills, Hyderabad";
  const city = shown.split(",")[0]?.trim() || "Hyderabad";
  const [open, setOpen] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [finding, setFinding] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function choose(name: string) {
    const place = neighborhoods.find((entry) => entry.name === name);
    setPreferences({
      location: locationLabel(name),
      lat: place?.lat,
      lng: place?.lng,
    });
    setGpsError("");
    setOpen(false);
  }

  function useDevice() {
    if (!navigator.geolocation) {
      setGpsError("This browser will not share a location.");
      return;
    }
    setFinding(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        const snapped = nearestNeighborhood(point);
        setPreferences({
          location: locationLabel(snapped.place.name),
          lat: point.lat,
          lng: point.lng,
        });
        setFinding(false);
        setGpsError("");
        setOpen(false);
      },
      () => {
        setFinding(false);
        setGpsError("Could not read GPS. Pick an area below.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="location-wrap" ref={root}>
      <button className="location-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <MapPin size={16} /> {city} <ChevronRight size={14} />
      </button>
      {open ? (
        <div className="location-menu" role="dialog" aria-label="Delivery address">
          <p>Orders go to this address. Nearby, highly rated kitchens rank first.</p>
          <button className="button secondary full" type="button" onClick={useDevice} disabled={finding}>
            <LocateFixed size={16} /> {finding ? "Finding you…" : "Use current location"}
          </button>
          {gpsError ? <p className="form-note">{gpsError}</p> : null}
          <ul>
            {neighborhoods.map((place) => (
              <li key={place.name}>
                <button type="button" className={city === place.name ? "selected" : ""} onClick={() => choose(place.name)}>
                  {place.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
