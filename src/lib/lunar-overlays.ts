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
import {
  GALE_CRATER_BOUNDS,
  JEZERO_DELTA_BOUNDS,
  OLYMPUS_MONS_BOUNDS,
} from "./martian-geometries";
import {
  LUCARIA_THOLI_BOUNDS,
  MARCIA_CRATER_BOUNDS,
  RHEASILVIA_BASIN_BOUNDS,
} from "./vesta-geometries";

export type PlanetaryBody = "moon" | "mars" | "vesta";

type MarkerConfig = {
  activationZoom: number;
  targetZoom?: number;
};

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

export type PlanetaryOverlayDetail = {
  id: string;
  body: PlanetaryBody;
  title: string;
  summary: string;
  route: string;
  missionFocus?: string;
  marker?: MarkerConfig;
  wmts?: WmtsLayerInfo;
};

export type LunarOverlayDetail = PlanetaryOverlayDetail;

const DEFAULT_TILE_MATRIX_SET = "default028mm";

const resolveLayerId = (endpoint: string) =>
  endpoint.split("/").filter(Boolean).pop() ?? "";

type OverlayDetailOptions = {
  missionFocus?: string;
  wmts?: Omit<WmtsLayerInfo, "layerId"> & {layerId?: string};
  marker?: MarkerConfig;
};

const createOverlayDetail = (
  body: PlanetaryBody,
  id: string,
  title: string,
  summary: string,
  options: OverlayDetailOptions = {}
): PlanetaryOverlayDetail => {
  const {missionFocus, wmts, marker} = options;

  return {
    id,
    body,
    title,
    summary,
    missionFocus,
    marker,
    route: `/${body}/${id}`,
    wmts: wmts
      ? {
          ...wmts,
          layerId: wmts.layerId ?? resolveLayerId(wmts.endpoint),
          tileMatrixSet: wmts.tileMatrixSet ?? DEFAULT_TILE_MATRIX_SET,
          format: wmts.format ?? "png",
          style: wmts.style ?? "default",
        }
      : undefined,
  };
};

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
  detail: PlanetaryOverlayDetail,
  zoom = detail.wmts?.maxNativeZoom ?? detail.wmts?.maxZoom ?? 10
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

const BASE_VESTA_ENDPOINT =
  "https://trek.nasa.gov/tiles/Vesta/EQ/Vesta_Dawn_FC_HAMO_Mosaic_Global_74ppd";

const PLANETARY_OVERLAY_DETAILS: Record<string, PlanetaryOverlayDetail> = {
  "moon-schrodinger-nac": createOverlayDetail(
    "moon",
    "moon-schrodinger-nac",
    "Main NAC Mosaic",
    "High-resolution Narrow Angle Camera mosaic covering the heart of Schrödinger crater.",
    {
      missionFocus: "Lunar Reconnaissance Orbiter NAC",
      marker: {
        activationZoom: 9,
        targetZoom: 11,
      },
      wmts: {
        endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_NAC_Schrodinger",
        bbox: SCHRODINGER_MAIN_BOUNDS,
        minZoom: 6,
        maxZoom: 12,
        maxNativeZoom: 12,
      },
    }
  ),
  "moon-schrodinger-extras": createOverlayDetail(
    "moon",
    "moon-schrodinger-extras",
    "Extra Swaths",
    "Supplementary NAC swaths stitching together additional passes over the crater interior.",
    {
      marker: {
        activationZoom: 9,
        targetZoom: 11,
      },
      wmts: {
        endpoint:
          "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.extraswaths.eq",
        bbox: SCHRODINGER_EXTRA_SWATHS_BOUNDS,
        minZoom: 6,
        maxZoom: 11,
        maxNativeZoom: 11,
      },
    }
  ),
  "moon-schrodinger-landing": createOverlayDetail(
    "moon",
    "moon-schrodinger-landing",
    "Landing Site",
    "Candidate landing zone focused on relatively smooth terrain near the crater floor.",
    {
      missionFocus: "Artemis precursor studies",
      marker: {
        activationZoom: 10,
        targetZoom: 12,
      },
      wmts: {
        endpoint:
          "https://trek.nasa.gov/tiles/Moon/EQ/LRO_NAC_SchrodingerLandingSite2",
        bbox: SCHRODINGER_LANDING_BOUNDS,
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
      },
    }
  ),
  "moon-schrodinger-ne": createOverlayDetail(
    "moon",
    "moon-schrodinger-ne",
    "North East Ridge",
    "Rugged rim section showing tectonic fractures and volcanic flow fronts on the northeastern wall.",
    {
      marker: {
        activationZoom: 9,
        targetZoom: 11,
      },
      wmts: {
        endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.ne.equirect",
        bbox: SCHRODINGER_NE_BOUNDS,
        minZoom: 6,
        maxZoom: 11,
        maxNativeZoom: 11,
      },
    }
  ),
  "moon-schrodinger-sc": createOverlayDetail(
    "moon",
    "moon-schrodinger-sc",
    "South Center",
    "Central peak complex revealing uplifted ancient crustal material and dark pyroclastics.",
    {
      marker: {
        activationZoom: 9,
        targetZoom: 11,
      },
      wmts: {
        endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.sc.equirect",
        bbox: SCHRODINGER_SC_BOUNDS,
        minZoom: 6,
        maxZoom: 11,
        maxNativeZoom: 11,
      },
    }
  ),
  "moon-schrodinger-se": createOverlayDetail(
    "moon",
    "moon-schrodinger-se",
    "South East",
    "Transition zone between the basin floor and rim terraces toward the southeast sector.",
    {
      marker: {
        activationZoom: 10,
        targetZoom: 12,
      },
      wmts: {
        endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/schrodinger.se.equirect",
        bbox: SCHRODINGER_SE_BOUNDS,
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
      },
    }
  ),
  "moon-schrodinger-mare-unit": createOverlayDetail(
    "moon",
    "moon-schrodinger-mare-unit",
    "Mare Unit",
    "Basaltic lava flow unit with distinctive albedo variations indicating compositional diversity.",
    {
      marker: {
        activationZoom: 10,
        targetZoom: 12,
      },
      wmts: {
        endpoint:
          "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerCraterMareUnit_50cmV1.0.eq",
        bbox: SCHRODINGER_MARE_UNIT_BOUNDS,
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
      },
    }
  ),
  "moon-schrodinger-massif": createOverlayDetail(
    "moon",
    "moon-schrodinger-massif",
    "Massif",
    "Towering massif capturing slumped blocks and layered regolith along the crater wall.",
    {
      marker: {
        activationZoom: 10,
        targetZoom: 12,
      },
      wmts: {
        endpoint:
          "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerCraterMassif_50cmV1.0.eq",
        bbox: SCHRODINGER_MASSIF_BOUNDS,
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
      },
    }
  ),
  "moon-schrodinger-mare-north": createOverlayDetail(
    "moon",
    "moon-schrodinger-mare-north",
    "Mare North",
    "Northern extension of the mare unit with subtle wrinkle ridges and impact overprints.",
    {
      marker: {
        activationZoom: 10,
        targetZoom: 12,
      },
      wmts: {
        endpoint: "https://trek.nasa.gov/tiles/Moon/EQ/SchrodingerMareNorth.eq",
        bbox: SCHRODINGER_MARE_NORTH_BOUNDS,
        minZoom: 7,
        maxZoom: 12,
        maxNativeZoom: 12,
      },
    }
  ),
  "mars-gale-crater": createOverlayDetail(
    "mars",
    "mars-gale-crater",
    "Gale Crater Traverse",
    "Curiosity's landing zone with layered foothills and Mount Sharp’s hematite-rich slopes.",
    {
      missionFocus: "Mars Science Laboratory",
      marker: {
        activationZoom: 5,
        targetZoom: 7,
      },
      wmts: {
        endpoint: "https://trek.nasa.gov/tiles/Mars/EQ/Gale_CTX_BlockAdj_dd",
        bbox: GALE_CRATER_BOUNDS,
        minZoom: 4,
        maxZoom: 9,
        maxNativeZoom: 9,
      },
    }
  ),
  "mars-jezero-delta": createOverlayDetail(
    "mars",
    "mars-jezero-delta",
    "Jezero Delta",
    "Ancient river delta deposits explored by the Perseverance rover.",
    {
      missionFocus: "Mars 2020 Perseverance Rover",
      marker: {
        activationZoom: 5,
        targetZoom: 7,
      },
      wmts: {
        endpoint:
          "https://trek.nasa.gov/tiles/Mars/EQ/JEZ_ctx_B_soc_008_orthoMosaic_6m_Eqc_latTs0_lon0",
        bbox: JEZERO_DELTA_BOUNDS,
        minZoom: 4,
        maxZoom: 9,
        maxNativeZoom: 9,
      },
    }
  ),
  "mars-olympus-mons": createOverlayDetail(
    "mars",
    "mars-olympus-mons",
    "Olympus Mons Calderas",
    "Summit caldera complex of the tallest volcano in the solar system.",
    {
      marker: {
        activationZoom: 4,
        targetZoom: 7,
      },
      wmts: {
        endpoint: "https://trek.nasa.gov/tiles/Mars/EQ/olympus_mons.eq",
        bbox: OLYMPUS_MONS_BOUNDS,
        minZoom: 4,
        maxZoom: 9,
        maxNativeZoom: 9,
      },
    }
  ),
  "vesta-rheasilvia-basin": createOverlayDetail(
    "vesta",
    "vesta-rheasilvia-basin",
    "Rheasilvia Basin",
    "Giant south-polar impact basin revealing Vesta's deep interior.",
    {
      missionFocus: "Dawn Mission HAMO",
      marker: {
        activationZoom: 4,
        targetZoom: 6,
      },
      wmts: {
        endpoint: BASE_VESTA_ENDPOINT,
        bbox: RHEASILVIA_BASIN_BOUNDS,
        minZoom: 3,
        maxZoom: 8,
        maxNativeZoom: 8,
      },
    }
  ),
  "vesta-marcia-crater": createOverlayDetail(
    "vesta",
    "vesta-marcia-crater",
    "Marcia Crater",
    "Fresh impact featuring bright ejecta and possible impact melt flows.",
    {
      marker: {
        activationZoom: 4,
        targetZoom: 6,
      },
      wmts: {
        endpoint: BASE_VESTA_ENDPOINT,
        bbox: MARCIA_CRATER_BOUNDS,
        minZoom: 3,
        maxZoom: 8,
        maxNativeZoom: 8,
      },
    }
  ),
  "vesta-lucaria-tholi": createOverlayDetail(
    "vesta",
    "vesta-lucaria-tholi",
    "Lucaria Tholi",
    "Low domes and ridges highlighting Vesta's tectonic evolution.",
    {
      marker: {
        activationZoom: 4,
        targetZoom: 6,
      },
      wmts: {
        endpoint: BASE_VESTA_ENDPOINT,
        bbox: LUCARIA_THOLI_BOUNDS,
        minZoom: 3,
        maxZoom: 8,
        maxNativeZoom: 8,
      },
    }
  ),
};

export const PLANETARY_OVERLAY_IDS = Object.keys(PLANETARY_OVERLAY_DETAILS);

export function getOverlayDetail(id: string) {
  return PLANETARY_OVERLAY_DETAILS[id];
}

export function getOverlayDetailsByBody(body: PlanetaryBody) {
  return PLANETARY_OVERLAY_IDS.map(
    (id) => PLANETARY_OVERLAY_DETAILS[id]
  ).filter((detail): detail is PlanetaryOverlayDetail => detail.body === body);
}

export function getOverlayRoute(id: string) {
  return getOverlayDetail(id)?.route;
}

export function getOverlayBody(id: string): PlanetaryBody | null {
  return getOverlayDetail(id)?.body ?? null;
}

export const LUNAR_OVERLAY_DETAILS: Record<string, PlanetaryOverlayDetail> =
  Object.fromEntries(
    PLANETARY_OVERLAY_IDS.filter(
      (id) => PLANETARY_OVERLAY_DETAILS[id].body === "moon"
    ).map((id) => [id, PLANETARY_OVERLAY_DETAILS[id]])
  );

export const LUNAR_OVERLAY_IDS = Object.keys(LUNAR_OVERLAY_DETAILS);

export function getLunarOverlayDetail(id: string) {
  const detail = PLANETARY_OVERLAY_DETAILS[id];
  return detail?.body === "moon" ? detail : undefined;
}
