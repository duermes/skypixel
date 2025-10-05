"use client";

import {useEffect, useState} from "react";
import dynamic from "next/dynamic";
import {MapControls} from "./map-controls";
import {MapHeader} from "./map-header";
import {Loader2} from "lucide-react";

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
  const [selectedLayer, setSelectedLayer] = useState("moon");
  const [cursorPosition, setCursorPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [hoveredOverlay, setHoveredOverlay] = useState<{
    id: string;
    label: string;
    activationZoom: number;
    targetZoom?: number;
    maxZoom?: number;
    maxNativeZoom?: number;
  } | null>(null);

  const overlayDetailsAvailable = selectedLayer === "moon";

  useEffect(() => {
    if (!overlayDetailsAvailable) {
      setHoveredOverlay(null);
    }
  }, [overlayDetailsAvailable]);

  // useEffect(() => {
  //   let mounted = true;
  //   let objectUrl: string | null = null;
  
  //   (async () => {
  //     try {
  //       const res = await fetch(
  //         `http://moontrek.jpl.nasa.gov/trektiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/0/0/0.jpg`
  //        );
  //       const blob = await res.blob();
  //       objectUrl = URL.createObjectURL(blob);
  //       if (mounted) setImageUrl(objectUrl);
  //     } catch (e) {
  //       console.error("Failed to fetch preview image", e);
  //     }
  //   })();

  //   return () => {
  //     mounted = false;
  //     if (objectUrl) URL.revokeObjectURL(objectUrl);
  //   };
  // }, []);

  return (
    <div className="relative flex min-h-[100svh] w-full flex-1 flex-col overflow-hidden">
      <MapHeader />

      <div className="relative flex-1">
        <Map
          selectedLayer={selectedLayer}
          onCursorMove={setCursorPosition}
          onMarkerHover={overlayDetailsAvailable ? setHoveredOverlay : undefined}
        />
      </div>

      <MapControls
        selectedLayer={selectedLayer}
        onLayerChange={setSelectedLayer}
        cursorPosition={cursorPosition}
        hoveredOverlay={overlayDetailsAvailable ? hoveredOverlay : null}
      />
    </div>
  );
}
