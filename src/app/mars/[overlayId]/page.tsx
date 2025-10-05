import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {SpaceMapViewer} from "@/components/space-map-viewer";
import {OverlayDetailClient} from "@/components/overlay-detail-client";
import {getOverlayDetail, getOverlayDetailsByBody, type PlanetaryBody} from "@/lib/lunar-overlays";

type OverlayDetailParams = {overlayId: string};

type OverlayDetailPageProps = {
  params: Promise<OverlayDetailParams>;
};

const BODY: PlanetaryBody = "mars";

export function generateStaticParams() {
  return getOverlayDetailsByBody(BODY).map((detail) => ({overlayId: detail.id}));
}

export async function generateMetadata({params}: OverlayDetailPageProps): Promise<Metadata> {
  const {overlayId} = await params;
  const detail = getOverlayDetail(overlayId);

  if (!detail || detail.body !== BODY) {
    return {
      title: "Martian overlay",
    };
  }

  return {
    title: `${detail.title} | Stellar Explorer`,
    description: detail.summary,
  };
}

export default async function OverlayDetailPage({params}: OverlayDetailPageProps) {
  const {overlayId} = await params;
  const detail = getOverlayDetail(overlayId);

  if (!detail || detail.body !== BODY) {
    notFound();
  }

  return (
    <OverlayDetailClient body={BODY} overlayId={detail.id}>
      <main className="flex min-h-[100svh] w-full">
        <SpaceMapViewer />
      </main>
    </OverlayDetailClient>
  );
}
