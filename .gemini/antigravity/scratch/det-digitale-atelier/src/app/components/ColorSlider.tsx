"use client";

export type ColorState = "glow" | "analog" | "monochrome";

interface ColorSliderProps {
  value: ColorState;
  onChange: (val: ColorState) => void;
}

export function ColorSlider({ value, onChange }: ColorSliderProps) {
  const states: ColorState[] = ["glow", "analog", "monochrome"];

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex items-center gap-6">
        {states.map((state) => (
          <button
            key={state}
            onClick={() => onChange(state)}
            className={`text-sm tracking-widest uppercase pb-1 border-b-2 transition-all duration-quiet ease-quiet ${
              value === state ? "border-accent text-accent" : "border-transparent text-foreground/50 hover:text-foreground"
            }`}
          >
            {state}
          </button>
        ))}
      </div>
      <div className="text-xs text-foreground/40 max-w-md text-center">
        {value === "glow" && "Mapper tøjfarver til din hudtone for en naturlig glød."}
        {value === "analog" && "Beregner nabofarver for lav-kontrast, rolig harmoni."}
        {value === "monochrome" && "Samme farvetone overalt, dybde skabes gennem tekstur (f.eks. strik vs. hør)."}
      </div>
    </div>
  );
}
