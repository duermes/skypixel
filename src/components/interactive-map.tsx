"use client";

import {useEffect, useRef} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


interface InteractiveMapProps {
  selectedLayer: string;
}

export default function InteractiveMap({selectedLayer}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [0, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true,
    });

    mapRef.current = map;

    // Add tile layer based on selected layer
    const getTileLayer = () => {
      switch (selectedLayer) {
        case "mars":
          return L.tileLayer(
            "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
            {
              attribution: "NASA Mars Trek",
              tileSize: 256,
              maxZoom: 8,
            }
          );
        case "moon":
          return L.tileLayer(
            "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
            {
              attribution: "NASA Moon Trek",
              tileSize: 256,
              maxZoom: 8,
            }
          );
        case "stars":
          return L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: "Esri World Imagery",
              maxZoom: 18,
            }
          );
        default:
          return L.tileLayer(
            "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2024-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
            {
              attribution: "NASA EOSDIS GIBS",
              maxZoom: 9,
            }
          );
      }
    };

    const tileLayer = getTileLayer();
    tileLayer.addTo(map);

    // Add some example markers with custom styling
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: '<div style="width: 24px; height: 24px; background: oklch(0.65 0.25 230); border: 2px solid oklch(0.95 0.01 250); border-radius: 50%; box-shadow: 0 0 10px oklch(0.65 0.25 230);"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Example markers
    const markers = [
      {lat: 40.7128, lng: -74.006, name: "New York Observatory"},
      {lat: 51.5074, lng: -0.1278, name: "Greenwich Observatory"},
      {lat: -33.8688, lng: 151.2093, name: "Sydney Observatory"},
      {lat: 35.6762, lng: 139.6503, name: "Tokyo Observatory"},
    ];

    markers.forEach((marker) => {
      L.marker([marker.lat, marker.lng], {icon: customIcon})
        .addTo(map)
        .bindPopup(
          `<div style="color: oklch(0.12 0.015 250); font-weight: 600;">${marker.name}</div>`
        );
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [selectedLayer]);

  return <div ref={containerRef} className="h-full w-full" />;
}
