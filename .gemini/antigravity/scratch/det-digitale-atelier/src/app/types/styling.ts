export interface BodyProfile {
  waistType: "high_waist" | "mid_low_waist";
  bodyFocus: 
    | "chest_enhance"
    | "chest_reduce"
    | "bottom_reduce"
    | "bottom_enhance"
    | "slimming"
    | "volume_add"
    | "legs_lengthen"
    | "legs_shorten";
}

export interface FavoriteGarment {
  id?: string;
  name: string; 
  category: "top" | "bottom" | "footwear" | "outerwear";
  fit: "oversized" | "wide-leg" | "slim-fit" | "fitted" | "structured";
  color: string;
  imageUrl?: string;
}

export type ColorTheme = "glow" | "analog" | "monochrome";

export interface OutfitFormulaResult {
  title: string;
  advice: string;
  formula: {
    anchor: string;
    garmentVisualDescription: string;
    pairingPieces: string[];
    tuckStyle: "half_tuck" | "no_tuck" | "full_tuck";
    footwearChoice: string;
    layeringStrategy: string;
    colorCombination: string;
    colorPalette: string[];
  };
  appliedRuleIds: string[];
  provenanceSources: string[];
  illustrationUrl?: string;
}
