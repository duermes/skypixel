"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import {Sparkles} from "lucide-react";
import {useMapUI} from "@/context/map-ui-context";
import {getOverlayDetail, getOverlayDetailPreview} from "@/lib/lunar-overlays";

export function OverlayDetailPanel() {
  const {detailOverlayId} = useMapUI();
  const detail = detailOverlayId ? getOverlayDetail(detailOverlayId) : undefined;
  const preview = detail ? getOverlayDetailPreview(detail) : null;
  const [previewError, setPreviewError] = useState(false);
  const datasetLink = detail?.wmts ? `${detail.wmts.endpoint}` : null;

  useEffect(() => {
    setPreviewError(false);
  }, [preview?.url]);

  if (!detail) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-[1000] w-full max-w-sm sm:max-w-md">
      <div className="pointer-events-auto rounded-xl border border-border/40 bg-background/85 p-4 shadow-lg shadow-sky-900/40 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-sky-500/20 p-2 text-sky-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-sky-200/80">Detail view</p>
              <h2 className="text-base font-semibold text-foreground">{detail.title}</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{detail.summary}</p>
            {preview && !previewError && (
              <div className="overflow-hidden rounded-lg border border-border/40 bg-black/40">
                <div className="relative aspect-video w-full bg-black/60">
                  <Image
                    src={preview.url}
                    alt={`${detail.title} preview at zoom ${preview.zoom}`}
                    fill
                    sizes="(max-width: 640px) 90vw, 384px"
                    className="object-cover"
                    onError={() => setPreviewError(true)}
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
                  <span>Zoom {preview.zoom}</span>
                  {datasetLink && (
                    <a
                      href={datasetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-300 transition hover:text-sky-200"
                    >
                      Abrir dataset
                    </a>
                  )}
                </div>
              </div>
            )}
            {previewError && (
              <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-[11px] text-muted-foreground">
                Vista previa no disponible para este dataset en este momento.
              </div>
            )}
            {detail.missionFocus && (
              <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-100">
                Mission focus: {detail.missionFocus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
