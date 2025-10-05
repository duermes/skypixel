"use client";

import {useEffect} from "react";
import {MapContainer, TileLayer, useMap} from "react-leaflet";
import type {
  CRS,
  LatLngBoundsExpression,
  LatLngExpression,
  TileLayerOptions,
} from "leaflet";
import {CRS as LeafletCRS, latLngBounds} from "leaflet";
import "leaflet/dist/leaflet.css";

type MapProps = {
  selectedLayer: string;
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
};

const EARTH_LAYER: LayerConfig = {
  id: "earth",
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  tileOptions: {
    maxZoom: 19,
  },
  view: {
    center: [51.505, -0.09],
    zoom: 5,
    minZoom: 2,
  },
};

const MOON_MAX_BOUNDS = latLngBounds([-90, -180], [90, 180]);

const MOON_LAYER: LayerConfig = {
  id: "moon",
  url: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
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
    maxBounds: MOON_MAX_BOUNDS,
    maxBoundsViscosity: 0.8,
  },
};

const LAYERS: Record<string, LayerConfig> = {
  default: EARTH_LAYER,
  earth: EARTH_LAYER,
  moon: MOON_LAYER,
  mars: EARTH_LAYER,
  stars: EARTH_LAYER,
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

export default function Map({selectedLayer}: MapProps) {
  const layer = LAYERS[selectedLayer] ?? LAYERS.default;
  const {view, map: mapProps, tileOptions, url, attribution} = layer;

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
      <TileLayer
        attribution={attribution}
        url={url}
        {...tileOptions}
      />
    </MapContainer>
  );
}