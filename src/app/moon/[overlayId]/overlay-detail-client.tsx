"use client";

import {useEffect} from "react";
import {useMapUI} from "@/context/map-ui-context";

export function OverlayDetailClient({
  overlayId,
  children,
}: {
  overlayId: string;
  children: React.ReactNode;
}) {
  const {setDetailOverlayId, setSelectedLayer} = useMapUI();

  useEffect(() => {
    setSelectedLayer("moon");
    setDetailOverlayId(overlayId);

    return () => {
      setDetailOverlayId(null);
    };
  }, [overlayId, setDetailOverlayId, setSelectedLayer]);

  return <>{children}</>;
}
