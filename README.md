<div align="center">

# SkyPixel
_Planet-to-pixel exploration for the Artemis generation_

![SkyPixel hero](./public/icon.png)

</div>

## ✨ Executive Overview

SkyPixel is a browser-native deep-zoom viewer that turns NASA’s gigapixel mosaics into a fluid, story-driven experience. Built on Next.js, React, and Leaflet, we redesigned tile delivery so that mission imagery loads fastest exactly where curiosity lands. No upscaling, no AI hallucinations—just the trusted pixels straight from NASA’s WMTS feeds, delivered with a marketing mind and a scientist’s respect for the data.

> _“Imagine briefing a minister, inspiring a classroom, or validating a landing corridor—without waiting for a desktop GIS. SkyPixel brings worlds to the browser with the clarity policymakers expect and the authenticity explorers demand.”_

## 🚀 Why ANSA Should Care

- **Citizen inspiration, institutional credibility.** SkyPixel keeps NASA attributions front and center while packaging the experience in a museum-ready, modern interface that ANSA can showcase across Europe.
- **Mission rehearsal meets public outreach.** Researchers can jump from global context to meter-scale detail in seconds; educators and communicators can frame discoveries with coordinates, scale, and storytelling cues.
- **A platform that scales.** The same delivery engine can ingest Italian Space Agency datasets, temporal overlays (before/after), or clearly labeled AI-enhanced products—extending ANSA’s footprint in deep-space engagement.

## 🛰️ What It Does

| Use Case | SkyPixel Advantage |
| --- | --- |
| Inspect landing sites | Progressive sub-tile loading reveals safety-critical terrain without heavy downloads. |
| Teach with confidence | Attribution, scale bars, and precise cursor readouts make lessons defensible. |
| Public showcases | Featured overlays and cinematic UI draw visitors into authentic data, not renders. |

## 🧠 How It Works (Without Buzzwords)

1. **Viewport-aware tiling.** We watch where the user actually looks and request only the WMTS sub-tiles that matter at that zoom level.
2. **Native resolution all the way down.** No post-processing: every pixel is NASA’s. We align rendering to device pixel ratio to avoid blur.
3. **Context-first UX.** Featured markers key to high-value sites. Hover states surface zoom guidance. Toggles keep the interface clean mid-presentation.

This trifecta means SkyPixel feels like a bespoke app while staying featherweight—perfect for hackathon demos, press briefings, or mission dry runs.

## 📊 What’s in the MVP

- Moon & Mars base maps (LRO WAC 303ppd, Viking MDIM21)
- High-resolution overlay jump points (e.g., Schrödinger crater NAC, Gale Crater CTX)
- Coordinate readouts, layer toggles, marker insights, collapsible detail panels
- Deep-zoom previews that load instantly thanks to TileMatrix-level prefetching

## 🛠️ Tech Stack Snapshot

- **Framework & UI:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Mapping Engine:** Leaflet + react-leaflet with CRS tuning for planetary bodies
- **Data Sources:** NASA Solar System Treks WMTS (Moon, Mars) — real-time pulls, no caching layer yet
- **Build & Tooling:** pnpm, ESLint, Vite-style dev ergonomics via Next.js

## 🔐 Data Integrity & Attribution

- Imagery remains unaltered; SkyPixel is a delivery innovation, not a processing pipeline.
- Attribution strings, WMTS layer IDs, and bounding boxes are displayed with every overlay.
- No endorsements implied; perfect for agencies that need to respect licensing while elevating presentation.

## 📈 Roadmap for ANSA & Partners

| Phase | Outcome |
| --- | --- |
| 1. Temporal layers | Compare eruptions, dust storms, or rover traverses with a slider. |
| 2. Optional AI assists | Clearly labeled super-resolution or semantic highlights for stakeholder demos. |
| 3. Edge caching/CDN | Sub-second loads for conference kiosks or mission operations.
| 4. New worlds | Drop in ESA/ASI datasets (Enceladus, Titan, lunar south pole) with minimal config. |

## 🧪 Running SkyPixel Locally

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` and explore.

### Environment

Create a `.env.local` file with your NASA API key to stay within generous rate limits:

```bash
NEXT_PUBLIC_NASA_API_KEY=your_key_here
```

> Without a key, SkyPixel still works using public WMTS access (subject to throttling).

## 🌍 Responsible Storytelling

- Transparency: we flag when imagery is enhanced vs. native (currently native only).
- Accessibility: interface designed for keyboard navigation and high-contrast themes.
- Ethics: data sourced from NASA; credit maintained; open for integration with ESA/ASI archives.

## 🧑‍🚀 Team POV

> _“As marketers, we obsess over visual clarity; as technologists, we refuse to fabricate pixels. SkyPixel reconciles both—delivering the thrill of discovery with scientific integrity.”_

Let’s bring Italy, Europe, and the world one zoom closer to the next giant leap.

---

_Imagery © NASA/JPL/USGS via Solar System Treks. SkyPixel is an independent prototype; no endorsement implied._
