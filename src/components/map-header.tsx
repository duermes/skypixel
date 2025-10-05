"use client";

import {ArrowLeft, Rocket} from "lucide-react";
import {useMapUI} from "@/context/map-ui-context";
import {getLunarOverlayDetail} from "@/lib/lunar-overlays";

export function MapHeader() {
  const {detailOverlayId, requestNavigation, setDetailOverlayId} = useMapUI();
  const detail = detailOverlayId ? getLunarOverlayDetail(detailOverlayId) : undefined;
  const datasetLink = detail?.wmts ? `${detail.wmts.endpoint}` : null;

  const handleBack = () => {
    setDetailOverlayId(null);
    requestNavigation({type: "back", route: "/"});
  };

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] bg-gradient-to-b from-background/95 via-background/80 to-transparent px-6 py-6">
      <div className="pointer-events-auto mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Stellar Explorer</h1>
              <p className="text-xs text-muted-foreground">Interactive Space Map Viewer</p>
            </div>
          </div>

          {detail && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/70 px-4 py-2 text-xs font-medium text-foreground shadow-sm transition hover:border-border/60 hover:bg-background/80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to overview</span>
            </button>
          )}
        </div>

        {detail ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-xl border border-border/50 bg-background/70 p-4 shadow-md shadow-sky-900/30">
              <p className="text-xs uppercase tracking-wide text-sky-300/80">Focused overlay</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{detail.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{detail.summary}</p>
              {detail.wmts && (
                <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground/80">Layer ID:</span> {detail.wmts.layerId}
                  </p>
                  <p>
                    <span className="font-medium text-foreground/80">Tile matrix:</span> {detail.wmts.tileMatrixSet}
                  </p>
                  <p className="break-words">
                    <span className="font-medium text-foreground/80">BBOX:</span> {detail.wmts.bbox[0][1].toFixed(4)},{" "}
                    {detail.wmts.bbox[0][0].toFixed(4)} → {detail.wmts.bbox[1][1].toFixed(4)},{" "}
                    {detail.wmts.bbox[1][0].toFixed(4)}
                  </p>
                  {datasetLink && (
                    <a
                      href={datasetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sky-300 transition hover:text-sky-200"
                    >
                      Abrir endpoint WMTS
                    </a>
                  )}
                </div>
              )}
            </div>
            {detail.missionFocus && (
              <div className="rounded-xl border border-border/40 bg-background/60 p-4 shadow-md">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Mission focus</p>
                <p className="mt-2 text-sm font-medium text-foreground">{detail.missionFocus}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Route locked on NAC swath. Use the control panel to explore adjacent overlays or return to the lunar overview.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 text-xs text-muted-foreground">
            Navigate the lunar surface, hover markers for NAC tips, and click to dive into mission-ready detail tiles.
          </div>
        )}
      </div>
    </div>
  );
}
