"use client";

import {memo, useCallback, useEffect, useMemo, useState} from "react";
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


const EARTH_LAYER: LayerConfig = {
  id: "earth",
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  tileOptions: {
    maxZoom: 19,
  },
  view: {
    center: [0, 0],
    zoom: 2,
    minZoom: 1,
    maxZoom: 19,
  },
};

const MOON_MAX_BOUNDS = latLngBounds([-90, -180], [90, 180]);
const SCHRODINGER_BBOX = latLngBounds(
  [-76.2155518, 127.1131997],
  [-67.9997418, 160.0004541],
);
const SCHRODINGER_MAIN_BBOX = latLngBounds(
  [-78.2671343, 137.0287022],
  [-73.9217112, 143.9180335],
);
const SCHRODINGER_EXTRA_SWATHS_BBOX = latLngBounds(
  [-81.0226752, 132.3933557],
  [-74.763851, 146.0942538],
);
const SCHRODINGER_LANDING_BBOX = latLngBounds(
  [-80.0432348, 137.9309074],
  [-76.5686214, 143.5752726],
);
const SCHRODINGER_NE_BBOX = latLngBounds(
  [-77.1212268, 135.7559975],
  [-73.9041122, 142.7772635],
);
const SCHRODINGER_SC_BBOX = latLngBounds(
  [-79.3372857, 133.1798311],
  [-76.9185729, 147.6224657],
);
const SCHRODINGER_SE_BBOX = latLngBounds(
  [-81.0676369, 143.1353647],
  [-78.9801305, 147.9053389],
);
const SCHRODINGER_MARE_UNIT_BBOX = latLngBounds(
  [-76.2155518, 127.1131997],
  [-71.9095503, 137.3027779],
);
const SCHRODINGER_MASSIF_BBOX = latLngBounds(
  [-76.8500136, 121.75],
  [-74.35, 132.299979],
);
const SCHRODINGER_MARE_NORTH_BBOX = latLngBounds(
  [-74.2213313, 132.7718919],
  [-71.9685645, 137.1069797],
);

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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/allSchrodinger_10mV1.0.eq/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_NAC_Schrodinger/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.extraswaths.eq/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_NAC_SchrodingerLandingSite2/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.ne.equirect/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.sc.equirect/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.se.equirect/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerCraterMareUnit_50cmV1.0.eq/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerCraterMassif_50cmV1.0.eq/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
      url: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerMareNorth.eq/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
  earth: EARTH_LAYER,
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
  overlays,
  enabled,
  onHover,
}: {
  overlays?: OverlayConfig[];
  enabled: boolean;
  onHover?: (info: MarkerHoverInfo | null) => void;
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

  

  const descriptors = useMemo<InteractiveMarkerDescriptor[]>(() => {
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
    },
    [map],
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

export default function Map({selectedLayer, onCursorMove, onMarkerHover, showHighlight = true}: MapProps) {
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
  const hasInteractiveOverlays =
    overlays?.some((overlay) => overlay.interactive && overlay.tileOptions?.bounds) ?? false;

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
      <TileLayer
        attribution={attribution}
        url={url}
        {...tileOptions}
      />
      {overlays?.map((overlay) => (
        <TileLayer
          key={`${layer.id}-${overlay.id}`}
          attribution={overlay.attribution ?? attribution}
          url={overlay.url}
          {...overlay.tileOptions}
        />
      ))}
      {showHighlight && hasInteractiveOverlays && (
        <InteractiveOverlayMarkers
          overlays={overlays}
          enabled={showHighlight}
          onHover={showHighlight ? onMarkerHover : undefined}
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