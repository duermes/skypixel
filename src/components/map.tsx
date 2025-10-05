"use client";

import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  CircleMarker,
  MapContainer,
  Rectangle,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type {
  CRS,
  LatLngBounds,
  LatLngBoundsLiteral,
  LatLngBoundsExpression,
  LatLngExpression,
  PathOptions,
  TileLayerOptions,
  CircleMarker as LeafletCircleMarker,
} from "leaflet";
import {
  CRS as LeafletCRS,
  LatLngBounds as LeafletLatLngBounds,
  latLngBounds,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  SCHRODINGER_BOUNDS,
  SCHRODINGER_EXTRA_SWATHS_BOUNDS,
  SCHRODINGER_LANDING_BOUNDS,
  SCHRODINGER_MAIN_BOUNDS,
  SCHRODINGER_MARE_NORTH_BOUNDS,
  SCHRODINGER_MARE_UNIT_BOUNDS,
  SCHRODINGER_MASSIF_BOUNDS,
  SCHRODINGER_NE_BOUNDS,
  SCHRODINGER_SC_BOUNDS,
  SCHRODINGER_SE_BOUNDS,
} from "@/lib/lunar-geometries";
import {getLunarOverlayDetail} from "@/lib/lunar-overlays";

type MarkerHoverInfo = {
  id: string;
  label: string;
  activationZoom: number;
  targetZoom?: number;
  maxZoom?: number;
  maxNativeZoom?: number;
};

type MapProps = {
  selectedLayer: string;
  onCursorMove?: (coords: {lat: number; lng: number} | null) => void;
  onMarkerHover?: (info: MarkerHoverInfo | null) => void;
  onMarkerSelect?: (overlayId: string) => void;
  detailOverlayId?: string | null;
  showHighlight?: boolean;
};



type LayerConfig = {
  id: string;
  url: string;
  attribution: string;
  tileOptions?: TileLayerOptions;
  view: {
    center: LatLngExpression;
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
  };
  map?: {
    crs?: CRS;
    maxBounds?: LatLngBoundsExpression;
    maxBoundsViscosity?: number;
  };
  overlays?: OverlayConfig[];
  highlight?: HighlightConfig;
};

type OverlayConfig = {
  id: string;
  url: string;
  attribution?: string;
  tileOptions?: TileLayerOptions;
  interactive?: OverlayInteractiveConfig;
};

type HighlightConfig = {
  bounds: LatLngBoundsExpression;
  options?: PathOptions;
};

type OverlayInteractiveConfig = {
  label: string;
  activationZoom: number;
  targetZoom?: number;
};

function toLeafletBounds(bounds: LatLngBoundsExpression): LatLngBounds {
  if (bounds instanceof LeafletLatLngBounds) {
    return bounds;
  }

  return latLngBounds(bounds as LatLngBoundsLiteral);
}


const MOON_MAX_BOUNDS = latLngBounds([-90, -180], [90, 180]);
const SCHRODINGER_BBOX = latLngBounds(SCHRODINGER_BOUNDS);
const SCHRODINGER_MAIN_BBOX = latLngBounds(SCHRODINGER_MAIN_BOUNDS);
const SCHRODINGER_EXTRA_SWATHS_BBOX = latLngBounds(SCHRODINGER_EXTRA_SWATHS_BOUNDS);
const SCHRODINGER_LANDING_BBOX = latLngBounds(SCHRODINGER_LANDING_BOUNDS);
const SCHRODINGER_NE_BBOX = latLngBounds(SCHRODINGER_NE_BOUNDS);
const SCHRODINGER_SC_BBOX = latLngBounds(SCHRODINGER_SC_BOUNDS);
const SCHRODINGER_SE_BBOX = latLngBounds(SCHRODINGER_SE_BOUNDS);
const SCHRODINGER_MARE_UNIT_BBOX = latLngBounds(SCHRODINGER_MARE_UNIT_BOUNDS);
const SCHRODINGER_MASSIF_BBOX = latLngBounds(SCHRODINGER_MASSIF_BOUNDS);
const SCHRODINGER_MARE_NORTH_BBOX = latLngBounds(SCHRODINGER_MARE_NORTH_BOUNDS);

const MOON_LAYER: LayerConfig = {
  id: "moon",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
  attribution:
    'Imagery courtesy NASA/JPL/USGS <a href="https://trek.nasa.gov/">Trek</a>',
  tileOptions: {
    maxZoom: 12,
    maxNativeZoom: 11,
    minZoom: 0,
    noWrap: true,
  },
  view: {
    center: [0, 0],
    zoom: 2,
    minZoom: 0,
    maxZoom: 12,
  },
  map: {
    crs: LeafletCRS.EPSG4326,
    maxBounds: MOON_MAX_BOUNDS,
    maxBoundsViscosity: 0.8,
  },
  overlays: [
    {
      id: "moon-schrodinger",
      url: "https://trek.nasa.gov/tiles/Moon/EQ/allSchrodinger_10mV1.0.eq/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      attribution:
        'Schrödinger Crater imagery © NASA/JPL/USGS <a href="https://trek.nasa.gov/">Trek</a>',
      tileOptions: {
        minZoom: 4,
        maxZoom: 9,
        maxNativeZoom: 9,
        noWrap: true,
        opacity: 0.75,
        bounds: SCHRODINGER_BBOX,
        zIndex: 500,
      },
    },
    {
      id: "moon-schrodinger-nac",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_NAC_Schrodinger/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 6,
        maxZoom: 12,
        maxNativeZoom: 12,
        noWrap: true,
        opacity: 0.9,
        bounds: SCHRODINGER_MAIN_BBOX,
        zIndex: 510,
      },
      interactive: {
        label: "Main NAC Mosaic",
        activationZoom: 9,
        targetZoom: 11,
      },
    },
    {
      id: "moon-schrodinger-extras",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.extraswaths.eq/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 6,
        maxZoom: 11,
        maxNativeZoom: 11,
        noWrap: true,
        opacity: 0.85,
        bounds: SCHRODINGER_EXTRA_SWATHS_BBOX,
        zIndex: 505,
      },
      interactive: {
        label: "Extra Swaths",
        activationZoom: 9,
        targetZoom: 11,
      },
    },
    {
      id: "moon-schrodinger-landing",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_NAC_SchrodingerLandingSite2/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
        noWrap: true,
        opacity: 0.9,
        bounds: SCHRODINGER_LANDING_BBOX,
        zIndex: 515,
      },
      interactive: {
        label: "Landing Site",
        activationZoom: 10,
        targetZoom: 12,
      },
    },
    {
      id: "moon-schrodinger-ne",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.ne.equirect/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 6,
        maxZoom: 11,
        maxNativeZoom: 11,
        noWrap: true,
        opacity: 0.85,
        bounds: SCHRODINGER_NE_BBOX,
        zIndex: 505,
      },
      interactive: {
        label: "North East Ridge",
        activationZoom: 9,
        targetZoom: 11,
      },
    },
    {
      id: "moon-schrodinger-sc",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.sc.equirect/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 6,
        maxZoom: 11,
        maxNativeZoom: 11,
        noWrap: true,
        opacity: 0.85,
        bounds: SCHRODINGER_SC_BBOX,
        zIndex: 505,
      },
      interactive: {
        label: "South Center",
        activationZoom: 9,
        targetZoom: 11,
      },
    },
    {
      id: "moon-schrodinger-se",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.se.equirect/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
        noWrap: true,
        opacity: 0.9,
        bounds: SCHRODINGER_SE_BBOX,
        zIndex: 515,
      },
      interactive: {
        label: "South East",
        activationZoom: 10,
        targetZoom: 12,
      },
    },
    {
      id: "moon-schrodinger-mare-unit",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerCraterMareUnit_50cmV1.0.eq/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
        noWrap: true,
        opacity: 0.9,
        bounds: SCHRODINGER_MARE_UNIT_BBOX,
        zIndex: 520,
      },
      interactive: {
        label: "Mare Unit",
        activationZoom: 10,
        targetZoom: 12,
      },
    },
    {
      id: "moon-schrodinger-massif",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerCraterMassif_50cmV1.0.eq/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
        noWrap: true,
        opacity: 0.9,
        bounds: SCHRODINGER_MASSIF_BBOX,
        zIndex: 520,
      },
      interactive: {
        label: "Massif",
        activationZoom: 10,
        targetZoom: 12,
      },
    },
    {
      id: "moon-schrodinger-mare-north",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerMareNorth.eq/1.0.0/default/default028mm/{z}/{y}/{x}.png",
      tileOptions: {
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
        noWrap: true,
        opacity: 0.9,
        bounds: SCHRODINGER_MARE_NORTH_BBOX,
        zIndex: 520,
      },
      interactive: {
        label: "Mare North",
        activationZoom: 10,
        targetZoom: 12,
      },
    },
  ],
  highlight: {
    bounds: SCHRODINGER_BBOX,
    options: {
      color: "#22c55e",
      weight: 2.5,
      opacity: 0.85,
      fillOpacity: 0.35,
      fillColor: "#22c55e",
      className: "schrodinger-highlight",
    },
  },
};

const MARS_MAX_BOUNDS = latLngBounds([-90, -180], [90, 180]);

const MARS_LAYER: LayerConfig = {
  id: "mars",
  url: "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
  attribution:
    'Imagery courtesy NASA/JPL/USGS <a href="https://trek.nasa.gov/">Trek</a>',
  tileOptions: {
    maxZoom: 9,
    maxNativeZoom: 9,
    minZoom: 0,
    noWrap: true,
  },
  view: {
    center: [0, 0],
    zoom: 2,
    minZoom: 0,
    maxZoom: 9,
  },
  map: {
    crs: LeafletCRS.EPSG4326,
    maxBounds: MARS_MAX_BOUNDS,
    maxBoundsViscosity: 0.8,
  },
};

const VESTA_MAX_BOUNDS = latLngBounds([-90, -180], [90, 180]);

const VESTA_LAYER: LayerConfig = {
  id: "vesta",
  url: "https://trek.nasa.gov/tiles/Vesta/EQ/Vesta_Dawn_FC_HAMO_Mosaic_Global_74ppd/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
  attribution:
    'Imagery courtesy NASA/JPL/USGS <a href="https://trek.nasa.gov/">Trek</a>',
  tileOptions: {
    maxZoom: 8,
    maxNativeZoom: 8,
    minZoom: 0,
    noWrap: true,
  },
  view: {
    center: [0, 0],
    zoom: 2,
    minZoom: 0,
    maxZoom: 8,
  },
  map: {
    crs: LeafletCRS.EPSG4326,
    maxBounds: VESTA_MAX_BOUNDS,
    maxBoundsViscosity: 0.8,
  },
};


const LAYERS: Record<string, LayerConfig> = {
  default: MOON_LAYER,
  moon: MOON_LAYER,
  mars: MARS_LAYER,
  vesta: VESTA_LAYER,
};

function MapResizer() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => {
      map.invalidateSize();
    };

    invalidate();

    window.addEventListener("resize", invalidate);
    document.addEventListener("fullscreenchange", invalidate);

    return () => {
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("fullscreenchange", invalidate);
    };
  }, [map]);

  return null;
}

function MapCursorTracker({
  onMove,
}: {
  onMove?: (coords: {lat: number; lng: number} | null) => void;
}) {
  useMapEvents({
    mousemove(event) {
      onMove?.({lat: event.latlng.lat, lng: event.latlng.lng});
    },
    mouseout() {
      onMove?.(null);
    },
  });

  return null;
}

type InteractiveMarkerDescriptor = {
  id: string;
  label: string;
  bounds: LatLngBounds;
  center: LatLngExpression;
  activationZoom: number;
  targetZoom?: number;
  maxZoom?: number;
  maxNativeZoom?: number;
};

const InteractiveOverlayMarkers = memo(function InteractiveOverlayMarkers({
  descriptors,
  enabled,
  onHover,
  onSelect,
}: {
  descriptors: InteractiveMarkerDescriptor[];
  enabled: boolean;
  onHover?: (info: MarkerHoverInfo | null) => void;
  onSelect?: (overlayId: string) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const handleZoom = () => {
      const nextZoom = map.getZoom();
      setZoom((current) => (current === nextZoom ? current : nextZoom));
    };
    map.on("zoomend", handleZoom);
    return () => {
      map.off("zoomend", handleZoom);
    };

  }, [map]);

  useEffect(() => {
    if (!enabled) {
      onHover?.(null);
    }

    return () => {
      onHover?.(null);
    };
  }, [enabled, onHover]);

  const handleMarkerClick = useCallback(
    (descriptor: InteractiveMarkerDescriptor) => {
      const {bounds, targetZoom, activationZoom, maxZoom: overlayMaxZoom, maxNativeZoom} = descriptor;

      let desiredZoom = targetZoom ?? activationZoom + 2;

      if (typeof overlayMaxZoom === "number" && overlayMaxZoom < desiredZoom) {
        desiredZoom = overlayMaxZoom;
      }
      if (typeof maxNativeZoom === "number" && maxNativeZoom < desiredZoom) {
        desiredZoom = maxNativeZoom;
      }

      const mapMaxZoom = map.getMaxZoom();
      if (typeof mapMaxZoom === "number" && Number.isFinite(mapMaxZoom) && mapMaxZoom < desiredZoom) {
        desiredZoom = mapMaxZoom;
      }

      map.flyToBounds(bounds, {
        maxZoom: desiredZoom,
        duration: 1.1,
        easeLinearity: 0.25,
        paddingTopLeft: [56, 72],
        paddingBottomRight: [56, 48],
      });

      onSelect?.(descriptor.id);
    },
    [map, onSelect],
  );

  if (!enabled || !descriptors.length) {
    return null;
  }

  return (
    <>
      {descriptors.map((descriptor) => {
        const {center, activationZoom, label, targetZoom, id, maxZoom, maxNativeZoom} = descriptor;
        const isActive = zoom >= activationZoom;
        const radius = isActive
          ? Math.min(14, 8 + Math.max(0, zoom - activationZoom) * 1.2)
          : 8;
        const color = isActive ? "#38bdf8" : "#0ea5e9";
        const fillOpacity = isActive ? 0.6 : 0.35;
        const weight = isActive ? 2.6 : 1.8;

        const className = `interactive-overlay-marker${
          isActive ? "" : " interactive-overlay-marker--inactive"
        }`;

        const hoverInfo: MarkerHoverInfo = {
          id,
          label,
          activationZoom,
          targetZoom,
          maxZoom,
          maxNativeZoom,
        };

        return (
          <CircleMarker
            key={id}
            center={center}
            radius={radius}
            className={className}
            pane="markerPane"
            pathOptions={{
              color,
              weight,
              opacity: 0.9,
              fillColor: color,
              fillOpacity,
            }}
            eventHandlers={{
              click: () => handleMarkerClick(descriptor),
              mouseover: (event) => {
                onHover?.(hoverInfo);
                const layer = event.target as LeafletCircleMarker;
                layer.setStyle({
                  opacity: 0.2,
                  fillOpacity: 0.08,
                });
              },
              mouseout: (event) => {
                onHover?.(null);
                const layer = event.target as LeafletCircleMarker;
                layer.setStyle({
                  opacity: 0.9,
                  fillOpacity,
                });
              },
            }}
          >
            <Tooltip
              className="interactive-overlay-tooltip"
              direction="top"
              offset={[0, -Math.max(radius, 6)]}
              opacity={0.95}
              sticky
              interactive={false}
            >
              <div className="text-xs font-semibold text-sky-100">
                {label}
              </div>
              <div className="text-[11px] text-slate-200/75">
                {targetZoom ? `Click to zoom to ${targetZoom}` : "Click to explore this area"}
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
});

InteractiveOverlayMarkers.displayName = "InteractiveOverlayMarkers";

function DetailZoomController({
  descriptor,
  layer,
}: {
  descriptor?: InteractiveMarkerDescriptor;
  layer: LayerConfig;
}) {
  const map = useMap();
  const lastDetailId = useRef<string | null>(null);

  useEffect(() => {
    if (!descriptor) {
      lastDetailId.current = null;
      return;
    }
    if (layer.id !== "moon") return;

    if (lastDetailId.current === descriptor.id) {
      return;
    }

    lastDetailId.current = descriptor.id;

    const {bounds, targetZoom, activationZoom, maxZoom, maxNativeZoom} = descriptor;

    let desiredZoom = targetZoom ?? activationZoom + 2;

    if (typeof maxZoom === "number" && maxZoom < desiredZoom) {
      desiredZoom = maxZoom;
    }
    if (typeof maxNativeZoom === "number" && maxNativeZoom < desiredZoom) {
      desiredZoom = maxNativeZoom;
    }

    const mapMaxZoom = map.getMaxZoom();
    if (typeof mapMaxZoom === "number" && Number.isFinite(mapMaxZoom) && mapMaxZoom < desiredZoom) {
      desiredZoom = mapMaxZoom;
    }

    map.flyToBounds(bounds, {
      maxZoom: desiredZoom,
      duration: 1.2,
      easeLinearity: 0.25,
      paddingTopLeft: [56, 72],
      paddingBottomRight: [56, 48],
    });
  }, [descriptor, layer, map]);

  return null;
}

function OverviewResetController({
  detailOverlayId,
  layer,
}: {
  detailOverlayId: string | null;
  layer: LayerConfig;
}) {
  const map = useMap();
  const previousDetailId = useRef<string | null>(null);

  useEffect(() => {
    const previous = previousDetailId.current;
    previousDetailId.current = detailOverlayId;

    if (layer.id !== "moon") {
      return;
    }

    if (previous && !detailOverlayId) {
      map.flyTo(layer.view.center as LatLngExpression, layer.view.zoom, {
        duration: 1.1,
        easeLinearity: 0.25,
      });
    }
  }, [detailOverlayId, layer, map]);

  return null;
}

export default function Map({
  selectedLayer,
  onCursorMove,
  onMarkerHover,
  onMarkerSelect,
  detailOverlayId = null,
  showHighlight = true,
}: MapProps) {
  const layer = LAYERS[selectedLayer] ?? LAYERS.default;
  const {
    view,
    map: mapProps,
    tileOptions,
    url,
    attribution,
    overlays,
    highlight,
  } = layer;
  const interactiveDescriptors = useMemo<InteractiveMarkerDescriptor[]>(() => {
    if (!overlays?.length) return [];

    const result: InteractiveMarkerDescriptor[] = [];

    for (const overlay of overlays) {
      const interactive = overlay.interactive;
      const boundsExpression = overlay.tileOptions?.bounds;

      if (!interactive || !boundsExpression) {
        continue;
      }

      const bounds = toLeafletBounds(boundsExpression);
      const centerPoint = bounds.getCenter();

      result.push({
        id: overlay.id,
        label: interactive.label,
        bounds,
        center: [centerPoint.lat, centerPoint.lng] as LatLngExpression,
        activationZoom: interactive.activationZoom,
        targetZoom: interactive.targetZoom,
        maxZoom: overlay.tileOptions?.maxZoom,
        maxNativeZoom: overlay.tileOptions?.maxNativeZoom,
      });
    }

    return result;
  }, [overlays]);

  const hasInteractiveOverlays = interactiveDescriptors.length > 0;

  const detailDescriptor = useMemo<InteractiveMarkerDescriptor | undefined>(() => {
    if (!detailOverlayId) return undefined;
    return interactiveDescriptors.find((descriptor) => descriptor.id === detailOverlayId) ?? undefined;
  }, [detailOverlayId, interactiveDescriptors]);

  const detailMeta = detailOverlayId ? getLunarOverlayDetail(detailOverlayId) : undefined;
  const detailWmts = detailMeta?.wmts;

  return (
    <MapContainer
      key={layer.id}
      center={view.center}
      zoom={view.zoom}
      minZoom={view.minZoom}
      maxZoom={view.maxZoom}
      scrollWheelZoom
      className="h-full w-full"
      style={{minHeight: "100%"}}
      {...mapProps}
    >
      <MapResizer />
      <MapCursorTracker onMove={onCursorMove} />
      <DetailZoomController descriptor={detailDescriptor} layer={layer} />
      <OverviewResetController detailOverlayId={detailOverlayId ?? null} layer={layer} />
      <TileLayer
        attribution={attribution}
        url={url}
        {...tileOptions}
      />
      {detailWmts && (
        <TileLayer
          key={`${detailMeta?.id}-detail-layer`}
          attribution={attribution}
          url={`${detailWmts.endpoint}/1.0.0/${detailWmts.style ?? "default"}/${detailWmts.tileMatrixSet ?? "default028mm"}/{z}/{y}/{x}.${detailWmts.format ?? "png"}`}
          bounds={detailWmts.bbox}
          noWrap
          opacity={1}
          zIndex={525}
          maxZoom={detailWmts.maxZoom ?? tileOptions?.maxZoom}
          maxNativeZoom={detailWmts.maxNativeZoom ?? tileOptions?.maxNativeZoom}
          minZoom={detailWmts.minZoom ?? tileOptions?.minZoom}
        />
      )}
      {overlays?.map((overlay) => {
        if (overlay.id === detailOverlayId) {
          return null;
        }

        return (
          <TileLayer
            key={`${layer.id}-${overlay.id}`}
            attribution={overlay.attribution ?? attribution}
            url={overlay.url}
            {...overlay.tileOptions}
          />
        );
      })}
      {showHighlight && hasInteractiveOverlays && (
        <InteractiveOverlayMarkers
          descriptors={interactiveDescriptors}
          enabled={showHighlight}
          onHover={showHighlight ? onMarkerHover : undefined}
          onSelect={onMarkerSelect}
        />
      )}
      {showHighlight && !hasInteractiveOverlays && highlight && (
        <Rectangle
          bounds={highlight.bounds}
          pathOptions={highlight.options}
          interactive={false}
        />
      )}
    </MapContainer>
  );
}