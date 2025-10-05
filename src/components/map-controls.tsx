"use client";

import {Layers} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MapControlsProps {
  selectedLayer: string;
  onLayerChange: (layer: string) => void;
}

export function MapControls({
  selectedLayer,
  onLayerChange,
}: MapControlsProps) {
  return (
    <>
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


    </>
  );
}
