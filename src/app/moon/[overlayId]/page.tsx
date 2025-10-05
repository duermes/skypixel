import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {SpaceMapViewer} from "@/components/space-map-viewer";
import {getLunarOverlayDetail, LUNAR_OVERLAY_IDS} from "@/lib/lunar-overlays";
import {OverlayDetailClient} from "./overlay-detail-client";

type OverlayDetailParams = {overlayId: string};

interface OverlayDetailPageProps {
  params: Promise<OverlayDetailParams>;
}

export function generateStaticParams() {
  return LUNAR_OVERLAY_IDS.map((overlayId) => ({overlayId}));
}

export async function generateMetadata({params}: OverlayDetailPageProps): Promise<Metadata> {
  const {overlayId} = await params;
  const detail = getLunarOverlayDetail(overlayId);

  if (!detail) {
    return {
      title: "Lunar overlay",
    };
  }

  return {
    title: `${detail.title} | Stellar Explorer`,
    description: detail.summary,
  };
}

export default async function OverlayDetailPage({params}: OverlayDetailPageProps) {
  const {overlayId} = await params;
  const detail = getLunarOverlayDetail(overlayId);

  if (!detail) {
    notFound();
  }

  return (
  <OverlayDetailClient overlayId={detail.id}>
      <main className="flex min-h-[100svh] w-full">
        <SpaceMapViewer />
      </main>
    </OverlayDetailClient>
  );
}
