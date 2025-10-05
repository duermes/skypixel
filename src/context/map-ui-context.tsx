"use client";

import {createContext, useCallback, useContext, useMemo, useState} from "react";
import type {PlanetaryBody} from "@/lib/lunar-overlays";

export type LatLng = {lat: number; lng: number};

export type MarkerHoverInfo = {
  id: string;
  body: PlanetaryBody;
  label: string;
  activationZoom: number;
  targetZoom?: number;
  maxZoom?: number;
  maxNativeZoom?: number;
};

type NavigationRequest =
  | {id: number; type: "detail"; overlayId: string; route: string}
  | {id: number; type: "back"; route: string};

type MapUIContextValue = {
  selectedLayer: string;
  setSelectedLayer: (layer: string) => void;
  cursorPosition: LatLng | null;
  setCursorPosition: (position: LatLng | null) => void;
  hoveredOverlay: MarkerHoverInfo | null;
  setHoveredOverlay: (info: MarkerHoverInfo | null) => void;
  detailOverlayId: string | null;
  setDetailOverlayId: (overlayId: string | null) => void;
  navigationRequest: NavigationRequest | null;
  requestNavigation: (request: NavigationRequestInput) => void;
  clearNavigation: () => void;
};

type NavigationRequestInput =
  | {type: "detail"; overlayId: string; route: string}
  | {type: "back"; route: string};

const MapUIContext = createContext<MapUIContextValue | undefined>(undefined);

export function MapUIProvider({children}: {children: React.ReactNode}) {
  const [selectedLayer, setSelectedLayer] = useState("moon");
  const [cursorPosition, setCursorPosition] = useState<LatLng | null>(null);
  const [hoveredOverlay, setHoveredOverlay] = useState<MarkerHoverInfo | null>(null);
  const [detailOverlayId, setDetailOverlayId] = useState<string | null>(null);
  const [navigationRequest, setNavigationRequest] = useState<NavigationRequest | null>(null);

  const requestNavigation = useCallback((request: NavigationRequestInput) => {
    setNavigationRequest({id: Date.now(), ...request} as NavigationRequest);
  }, []);

  const clearNavigation = useCallback(() => {
    setNavigationRequest(null);
  }, []);

  const value = useMemo<MapUIContextValue>(
    () => ({
      selectedLayer,
      setSelectedLayer,
      cursorPosition,
      setCursorPosition,
      hoveredOverlay,
      setHoveredOverlay,
      detailOverlayId,
      setDetailOverlayId,
      navigationRequest,
      requestNavigation,
      clearNavigation,
    }),
    [
      selectedLayer,
      cursorPosition,
      hoveredOverlay,
      detailOverlayId,
      navigationRequest,
      requestNavigation,
      clearNavigation,
    ],
  );

  return <MapUIContext.Provider value={value}>{children}</MapUIContext.Provider>;
}

export function useMapUI() {
  const context = useContext(MapUIContext);
  if (!context) {
    throw new Error("useMapUI must be used within a MapUIProvider");
  }
  return context;
}
