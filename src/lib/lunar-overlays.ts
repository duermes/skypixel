import type {BoundsLiteral} from "./lunar-geometries";
import {
  SCHRODINGER_EXTRA_SWATHS_BOUNDS,
  SCHRODINGER_LANDING_BOUNDS,
  SCHRODINGER_MAIN_BOUNDS,
  SCHRODINGER_MARE_NORTH_BOUNDS,
  SCHRODINGER_MARE_UNIT_BOUNDS,
  SCHRODINGER_MASSIF_BOUNDS,
  SCHRODINGER_NE_BOUNDS,
  SCHRODINGER_SC_BOUNDS,
  SCHRODINGER_SE_BOUNDS,
} from "./lunar-geometries";

type WmtsLayerInfo = {
  endpoint: string;
  layerId: string;
  tileMatrixSet?: string;
  bbox: BoundsLiteral;
  minZoom?: number;
  maxZoom?: number;
  maxNativeZoom?: number;
  format?: "jpg" | "png";
  style?: string;
};

export type LunarOverlayDetail = {
  id: string;
  title: string;
  summary: string;
  route: string;
  missionFocus?: string;
  wmts?: WmtsLayerInfo;
};

const DEFAULT_TILE_MATRIX_SET = "default028mm";

const resolveLayerId = (endpoint: string) => endpoint.split("/").filter(Boolean).pop() ?? "";

const createOverlayDetail = (
  id: string,
  title: string,
  summary: string,
  missionFocus?: string,
  wmts?: Omit<WmtsLayerInfo, "layerId"> & {layerId?: string},
): LunarOverlayDetail => ({
  id,
  title,
  summary,
  missionFocus,
  route: `/moon/${id}`,
  wmts: wmts
    ? {
        ...wmts,
        layerId: wmts.layerId ?? resolveLayerId(wmts.endpoint),
        tileMatrixSet: wmts.tileMatrixSet ?? DEFAULT_TILE_MATRIX_SET,
        format: wmts.format ?? "png",
        style: wmts.style ?? "default",
      }
    : undefined,
});

type PreviewTile = {
  url: string;
  zoom: number;
  x: number;
  y: number;
};

const toTileIndices = (lat: number, lng: number, zoom: number) => {
  const matrixWidth = 2 ** (zoom + 1);
  const matrixHeight = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * matrixWidth);
  const y = Math.floor(((90 - lat) / 180) * matrixHeight);
  return {x, y};
};

export function getOverlayDetailPreview(
  detail: LunarOverlayDetail,
  zoom = detail.wmts?.maxNativeZoom ?? detail.wmts?.maxZoom ?? 10,
): PreviewTile | null {
  const wmts = detail.wmts;
  if (!wmts) return null;

  const [southWest, northEast] = wmts.bbox;
  const centerLat = (southWest[0] + northEast[0]) / 2;
  const centerLng = (southWest[1] + northEast[1]) / 2;
  const {x: rawCol, y: rawRow} = toTileIndices(centerLat, centerLng, zoom);
  const matrixWidth = 2 ** (zoom + 1);
  const matrixHeight = 2 ** zoom;
  const col = Math.max(0, Math.min(matrixWidth - 1, rawCol));
  const row = Math.max(0, Math.min(matrixHeight - 1, rawRow));
  const style = wmts.style ?? "default";
  const format = wmts.format ?? "png";
  const tileMatrixSet = wmts.tileMatrixSet ?? DEFAULT_TILE_MATRIX_SET;

  return {
    url: `${wmts.endpoint}/1.0.0/${style}/${tileMatrixSet}/${zoom}/${row}/${col}.${format}`,
    zoom,
    x: col,
    y: row,
  };
}

export const LUNAR_OVERLAY_DETAILS: Record<string, LunarOverlayDetail> = {
  "moon-schrodinger-nac": createOverlayDetail(
    "moon-schrodinger-nac",
    "Main NAC Mosaic",
    "High-resolution Narrow Angle Camera mosaic covering the heart of Schrödinger crater.",
    "Lunar Reconnaissance Orbiter NAC",
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_NAC_Schrodinger",
      bbox: SCHRODINGER_MAIN_BOUNDS,
      minZoom: 6,
      maxZoom: 12,
      maxNativeZoom: 12,
    },
  ),
  "moon-schrodinger-extras": createOverlayDetail(
    "moon-schrodinger-extras",
    "Extra Swaths",
    "Supplementary NAC swaths stitching together additional passes over the crater interior.",
    undefined,
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.extraswaths.eq",
      bbox: SCHRODINGER_EXTRA_SWATHS_BOUNDS,
      minZoom: 6,
      maxZoom: 11,
      maxNativeZoom: 11,
    },
  ),
  "moon-schrodinger-landing": createOverlayDetail(
    "moon-schrodinger-landing",
    "Landing Site",
    "Candidate landing zone focused on relatively smooth terrain near the crater floor.",
    "Artemis precursor studies",
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_NAC_SchrodingerLandingSite2",
      bbox: SCHRODINGER_LANDING_BOUNDS,
      minZoom: 7,
      maxZoom: 12,
      maxNativeZoom: 12,
    },
  ),
  "moon-schrodinger-ne": createOverlayDetail(
    "moon-schrodinger-ne",
    "North East Ridge",
    "Rugged rim section showing tectonic fractures and volcanic flow fronts on the northeastern wall.",
    undefined,
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.ne.equirect",
      bbox: SCHRODINGER_NE_BOUNDS,
      minZoom: 6,
      maxZoom: 11,
      maxNativeZoom: 11,
    },
  ),
  "moon-schrodinger-sc": createOverlayDetail(
    "moon-schrodinger-sc",
    "South Center",
    "Central peak complex revealing uplifted ancient crustal material and dark pyroclastics.",
    undefined,
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.sc.equirect",
      bbox: SCHRODINGER_SC_BOUNDS,
      minZoom: 6,
      maxZoom: 11,
      maxNativeZoom: 11,
    },
  ),
  "moon-schrodinger-se": createOverlayDetail(
    "moon-schrodinger-se",
    "South East",
    "Transition zone between the basin floor and rim terraces toward the southeast sector.",
    undefined,
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.se.equirect",
      bbox: SCHRODINGER_SE_BOUNDS,
      minZoom: 7,
      maxZoom: 12,
      maxNativeZoom: 12,
    },
  ),
  "moon-schrodinger-mare-unit": createOverlayDetail(
    "moon-schrodinger-mare-unit",
    "Mare Unit",
    "Basaltic lava flow unit with distinctive albedo variations indicating compositional diversity.",
    undefined,
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerCraterMareUnit_50cmV1.0.eq",
      bbox: SCHRODINGER_MARE_UNIT_BOUNDS,
      minZoom: 7,
      maxZoom: 12,
      maxNativeZoom: 12,
    },
  ),
  "moon-schrodinger-massif": createOverlayDetail(
    "moon-schrodinger-massif",
    "Massif",
    "Towering massif capturing slumped blocks and layered regolith along the crater wall.",
    undefined,
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerCraterMassif_50cmV1.0.eq",
      bbox: SCHRODINGER_MASSIF_BOUNDS,
      minZoom: 7,
      maxZoom: 12,
      maxNativeZoom: 12,
    },
  ),
  "moon-schrodinger-mare-north": createOverlayDetail(
    "moon-schrodinger-mare-north",
    "Mare North",
    "Northern extension of the mare unit with subtle wrinkle ridges and impact overprints.",
    undefined,
    {
      endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerMareNorth.eq",
      bbox: SCHRODINGER_MARE_NORTH_BOUNDS,
      minZoom: 7,
      maxZoom: 12,
      maxNativeZoom: 12,
    },
  ),
};

export const LUNAR_OVERLAY_IDS = Object.keys(LUNAR_OVERLAY_DETAILS);

export function getLunarOverlayDetail(id: string) {
  return LUNAR_OVERLAY_DETAILS[id];
}
