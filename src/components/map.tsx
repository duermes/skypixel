"use client";

import {useEffect} from "react";
import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MapProps = {
  selectedLayer: string;
};

const BASE_LAYER = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

const LAYERS: Record<string, {url: string; attribution: string}> = {
  default: BASE_LAYER,
  earth: BASE_LAYER,
  moon: BASE_LAYER,
  mars: BASE_LAYER,
  stars: BASE_LAYER,
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

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
      style={{minHeight: "100%"}}
    >
      <MapResizer />
      <TileLayer attribution={layer.attribution} url={layer.url} />
      <Marker position={[51.505, -0.09]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}