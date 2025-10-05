"use client";

import {useCallback, useEffect, useMemo} from "react";
import dynamic from "next/dynamic";
import {Loader2} from "lucide-react";
import {useMapUI} from "@/context/map-ui-context";
import {getOverlayDetail, getOverlayDetailsByBody, type PlanetaryBody} from "@/lib/lunar-overlays";

function isPlanetaryBody(value: string): value is PlanetaryBody {
  return ["moon", "mars", "vesta"].includes(value);
}

// Dynamically import the map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading stellar map...</p>
      </div>
    </div>
  ),
});

export function SpaceMapViewer() {
  const {
    selectedLayer,
    setCursorPosition,
    setHoveredOverlay,
    detailOverlayId,
    requestNavigation,
    setDetailOverlayId,
  } = useMapUI();

  const currentBody = useMemo<PlanetaryBody | null>(
    () => (isPlanetaryBody(selectedLayer) ? selectedLayer : null),
    [selectedLayer],
  );
  const overlayDetailsAvailable = useMemo(() => {
    if (!currentBody) {
      return false;
    }
    return getOverlayDetailsByBody(currentBody).length > 0;
  }, [currentBody]);

  useEffect(() => {
    if (!overlayDetailsAvailable) {
      setHoveredOverlay(null);
    }
  }, [overlayDetailsAvailable, setHoveredOverlay]);

  const handleMarkerSelect = useCallback(
    (overlayId: string) => {
      const detail = getOverlayDetail(overlayId);
      const route = detail?.route ?? `/moon/${overlayId}`;
      setDetailOverlayId(overlayId);
      requestNavigation({type: "detail", overlayId, route});
    },
    [requestNavigation, setDetailOverlayId],
  );

  return (
    <div className="relative flex min-h-[100svh] w-full flex-1 flex-col overflow-hidden">
      <div className="relative flex-1">
        <Map
          selectedLayer={selectedLayer}
          onCursorMove={setCursorPosition}
          onMarkerHover={overlayDetailsAvailable ? setHoveredOverlay : undefined}
          onMarkerSelect={overlayDetailsAvailable ? handleMarkerSelect : undefined}
          detailOverlayId={overlayDetailsAvailable ? detailOverlayId : null}
        />
      </div>
    </div>
  );
}
