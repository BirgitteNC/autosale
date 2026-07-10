export const footwearLogic = {
  definitions: {
    slim_fit: {
      shoes: ["sneakers", "loafers"],
      profile: "low_profile",
      instruction: "Sikr ubrudte linjer ved anklen.",
    },
    wide_fit: {
      shoes: ["chunky_sneakers", "boots"],
      profile: "high_volume",
      instruction: "Skab visuel balance til det brede snit.",
    },
    straight_fit: {
      shoes: ["classic_leather", "derby"],
      profile: "structured",
      instruction: "Tidløs vertikalitet.",
    },
  },
  magic_lengthening_rules: {
    pointed_toe_priority: true,
    match_skin_tone_priority: true,
    logic: "Hvis sko matcher hudtone eller buksefarve, forlænges benets visuelle linje (Trick 6, W! DK).",
  },
};

export const silhouetteEngine = {
  abdominal_camouflage: {
    avoid: ["tight_clothing", "large_pockets", "mid_waist_volume"],
    apply: {
      vertical_lines: "open_cardigans_or_blazers",
      texture_logic: ["structured_knit", "drapery"],
      neckline: "V-neck_for_torso_elongation",
    },
  },
  waist_resolution_logic: {
    rule: "Betinget tucking-logik for at løse kildekonflikt (Curvii vs. W! DK)",
    conditions: [
      {
        if: { waist_type: "high_waist" },
        then: { action: "half_tuck", result: "ben-for-dage-effekt" },
      },
      {
        if: { waist_type: "mid_low_waist" },
        then: { action: "no_tuck", result: "undgå_mave_fokus" },
      },
    ],
  },
  color_shaping: {
    technique: "color_blocking",
    implementation: "Mørke nuancer på sidepaneler for at skabe talje-illusion.",
  },
};

// Helper to simulate NLP mapping
export function getStyleAdvice(input: string) {
  const query = input.toLowerCase();
  if (query.includes("mave") || query.includes("skjul")) {
    return {
      title: "Abdominal Camouflage",
      advice: "Vi anbefaler en struktureret strik over en let tunika for at skabe ubrudte vertikale linjer.",
      rule: silhouetteEngine.abdominal_camouflage.apply.vertical_lines
    };
  }
  if (query.includes("ben") || query.includes("længde") || query.includes("højere")) {
    return {
      title: "Ben-for-dage Effekt",
      advice: "Brug high-waist bukser med et half-tuck og sko i samme farve som bukserne for at forlænge benene.",
      rule: silhouetteEngine.waist_resolution_logic.conditions[0].then.result
    };
  }
  if (query.includes("bred") || query.includes("wide")) {
    return {
      title: "Volumen Balance",
      advice: "Til brede bukser anbefaler vi chunky støvler for at skabe visuel balance til det brede snit.",
      rule: footwearLogic.definitions.wide_fit.instruction
    };
  }
  
  return {
    title: "Quiet Luxury Standard",
    advice: "Et minimalistisk, monokromt look bygget på teksturkontraster frem for mønstre.",
    rule: "monochrome_chic"
  };
}
