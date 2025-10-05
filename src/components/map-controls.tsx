"use client";

import {Layers} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {useMapUI} from "@/context/map-ui-context";

const LAYER_OPTIONS = [
  {value: "moon", label: "Lunar Map"},
  {value: "mars", label: "Mars Viking Mosaic"},
  {value: "vesta", label: "Vesta View"},
];

export function MapControls() {
  const {
    selectedLayer,
    setSelectedLayer,
    cursorPosition,
    hoveredOverlay,
    detailOverlayId,
    setDetailOverlayId,
  } = useMapUI();

  const latText = cursorPosition ? cursorPosition.lat.toFixed(4) : "--";
  const lngText = cursorPosition ? cursorPosition.lng.toFixed(4) : "--";
  const markersAvailable = selectedLayer === "moon";
  const displayHoveredOverlay = markersAvailable ? hoveredOverlay : null;
  const overlayCardActive = Boolean(displayHoveredOverlay);
  const overlayContainerClasses = `mt-3 rounded border px-3 py-2 text-xs transition ${
    overlayCardActive
      ? "border-sky-400/70 bg-sky-500/10 text-sky-100"
      : "border-border/40 bg-background/30 text-muted-foreground"
  }`;
  const hoveredZoomHints = displayHoveredOverlay
    ? [
        displayHoveredOverlay.targetZoom,
        displayHoveredOverlay.maxZoom,
        displayHoveredOverlay.maxNativeZoom,
      ].filter((value): value is number => typeof value === "number")
    : [];
  const overlayTitle = displayHoveredOverlay
    ? displayHoveredOverlay.label
    : markersAvailable
      ? "Hover a lunar marker"
      : "Marker insights unavailable";
  const overlayDescription = displayHoveredOverlay
    ? `Recommended zoom: ${displayHoveredOverlay.targetZoom ?? displayHoveredOverlay.activationZoom + 2}`
    : markersAvailable
      ? "Move the pointer over a blue marker to preview its detail tile."
      : "Switch back to the Lunar Map to explore detailed NAC overlays.";
  const overlayZoomSummary = displayHoveredOverlay
    ? hoveredZoomHints.length
      ? `Tile limit: up to zoom ${Math.min(...hoveredZoomHints)}`
      : `Tile limit: approx. zoom ${displayHoveredOverlay.activationZoom + 2}`
    : null;

  const handleLayerChange = (layer: string) => {
    setSelectedLayer(layer);
    if (layer !== "moon" && detailOverlayId) {
      setDetailOverlayId(null);
    }
  };

  return (
    <div className="absolute right-6 top-[270px] z-[1000] w-80 max-w-[calc(100vw-3rem)]">
      <div className="rounded-lg border border-border/50 bg-card/95 p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <div className="relative">
            <Select value={selectedLayer} onValueChange={handleLayerChange}>
              <SelectTrigger className="border-border/50 bg-background/50">
                <SelectValue placeholder="Select layer" />
              </SelectTrigger>
              <SelectContent position="item-aligned" className="z-[2000]">
                <SelectGroup>
                  {LAYER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 rounded border border-border/40 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Lat</span>
            <span className="font-mono text-foreground">{latText}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Lng</span>
            <span className="font-mono text-foreground">{lngText}</span>
          </div>
        </div>
        <div className={overlayContainerClasses}>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-foreground">Marker details</p>
            <p className="text-[11px] text-foreground/80">{overlayTitle}</p>
            <p className="text-[11px] text-foreground/70">{overlayDescription}</p>
            {overlayZoomSummary && (
              <p className="text-[11px] text-foreground/60">{overlayZoomSummary}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
