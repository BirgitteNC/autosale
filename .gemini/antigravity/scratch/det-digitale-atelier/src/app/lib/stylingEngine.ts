import { BodyProfile, FavoriteGarment, ColorTheme, OutfitFormulaResult } from "../types/styling";

export async function generateOutfitFormula(
  body: BodyProfile,
  garment: FavoriteGarment,
  theme: ColorTheme,
  userProfile?: any,
  userId?: string
): Promise<OutfitFormulaResult> {
  const response = await fetch('/api/styling', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, garment, theme, userProfile, userId })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Kunne ikke generere outfit formel');
  }

  return response.json();
}
