"use client";

import {Layers} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LAYER_OPTIONS = [
  {value: "moon", label: "Lunar Map"},
  {value: "mars", label: "Mars Viking Mosaic"},
  {value: "vesta", label: "Vesta View"},

];

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
        <div className="rounded-lg border border-border/50 bg-card/95 p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <div className="relative">
              <Select value={selectedLayer} onValueChange={onLayerChange}>
                <SelectTrigger className="bg-background/50 border-border/50">
                  <SelectValue placeholder="Select layer" />
                </SelectTrigger>
                <SelectContent position="item-aligned" className="z-[2000]">
                  <SelectGroup>
                    {LAYER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>


    </>
  );
}
