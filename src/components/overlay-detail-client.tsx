"use client";

import {useEffect} from "react";
import type {PlanetaryBody} from "@/lib/lunar-overlays";
import {useMapUI} from "@/context/map-ui-context";

export function OverlayDetailClient({
  body,
  overlayId,
  children,
}: {
  body: PlanetaryBody;
  overlayId: string;
  children: React.ReactNode;
}) {
  const {setDetailOverlayId, setSelectedLayer} = useMapUI();

  useEffect(() => {
    setSelectedLayer(body);
    setDetailOverlayId(overlayId);

    return () => {
      setDetailOverlayId(null);
    };
  }, [body, overlayId, setDetailOverlayId, setSelectedLayer]);

  return <>{children}</>;
}
