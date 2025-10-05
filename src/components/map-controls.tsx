"use client";

import {Search, Layers} from "lucide-react";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MapControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLayer: string;
  onLayerChange: (layer: string) => void;
}

export function MapControls({
  searchQuery,
  onSearchChange,
  selectedLayer,
  onLayerChange,
}: MapControlsProps) {
  return (
    <>
      <div className="absolute right-6 top-[200px] z-[1000] w-80 max-w-[calc(100vw-3rem)]">
        <div className="rounded-lg border border-border/50 bg-card/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search celestial objects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-[270px] z-[1000] w-80 max-w-[calc(100vw-3rem)]">
        <div className="rounded-lg border border-border/50 bg-card/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLayer} onValueChange={onLayerChange}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue placeholder="Select layer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="earth">Earth View</SelectItem>
                <SelectItem value="mars">Mars Surface</SelectItem>
                <SelectItem value="moon">Lunar Map</SelectItem>
                <SelectItem value="stars">Star Field</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Info panel - bottom left */}
      <div className="absolute bottom-6 left-6 z-[1000] max-w-sm">
        <div className="rounded-lg border border-border/50 bg-card/95 p-4 shadow-lg backdrop-blur-sm">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            Navigation Tips
          </h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Scroll to zoom in/out</li>
            <li>• Click and drag to pan</li>
            <li>• Use layer selector to switch views</li>
            <li>• Search for specific objects</li>
          </ul>
        </div>
      </div>
    </>
  );
}
