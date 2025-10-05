export async function GET() {
  const remote = "http://moontrek.jpl.nasa.gov/trektiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/0/0/0.jpg";

  try {
    const res = await fetch(remote);
    if (!res.ok) {
      return new Response("Upstream fetch failed", { status: 502 });
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("/api/preview error:", err);
    return new Response("Error fetching image", { status: 500 });
  }
}
