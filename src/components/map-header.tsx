"use client";

import {Rocket} from "lucide-react";

export function MapHeader() {
  return (
    <div className="absolute left-0 right-0 top-0 z-[1000] bg-gradient-to-b from-background/95 via-background/80 to-transparent px-6 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl">
        {/* Logo and title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Skymaper</h1>
            <p className="text-xs text-muted-foreground">
              Interactive Space Map Viewer
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
