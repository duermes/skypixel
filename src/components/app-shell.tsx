"use client";

import {useEffect} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useMapUI} from "@/context/map-ui-context";
import {MapHeader} from "./map-header";
import {MapControls} from "./map-controls";
import {OverlayDetailPanel} from "./overlay-detail-panel";

function NavigationBridge() {
  const {
    navigationRequest,
    clearNavigation,
    setDetailOverlayId,
    setSelectedLayer,
  } = useMapUI();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!navigationRequest) {
      return;
    }

    const {route, type} = navigationRequest;

    if (type === "detail") {
      setSelectedLayer("moon");
      setDetailOverlayId(navigationRequest.overlayId);
    }

    if (type === "back") {
      setDetailOverlayId(null);
    }

    if (route !== pathname) {
      router.push(route);
    }

    clearNavigation();
  }, [navigationRequest, clearNavigation, router, pathname, setDetailOverlayId, setSelectedLayer]);

  return null;
}

export function AppShell({children}: {children: React.ReactNode}) {
  return (
    <div className="relative flex min-h-[100svh] w-full flex-1 bg-background">
      <NavigationBridge />
      <MapHeader />
      <div className="relative flex-1">{children}</div>
      <MapControls />
      <OverlayDetailPanel />
    </div>
  );
}
