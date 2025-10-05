"use client";

import {useState} from "react";
import dynamic from "next/dynamic";
import {MapControls} from "./map-controls";
import {MapHeader} from "./map-header";
import {Loader2} from "lucide-react";

// Dynamically import the map component to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import("./interactive-map"), {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayer, setSelectedLayer] = useState("earth");

  return (
    <div className="relative h-full w-full">
      <MapHeader />

      <div className="h-full w-full">
        <InteractiveMap selectedLayer={selectedLayer} />
      </div>

      <MapControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLayer={selectedLayer}
        onLayerChange={setSelectedLayer}
      />
    </div>
  );
}
