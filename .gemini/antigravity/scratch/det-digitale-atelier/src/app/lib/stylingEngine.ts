import { BodyProfile, FavoriteGarment, ColorTheme, OutfitFormulaResult } from "../types/styling";

export async function generateOutfitFormula(
  body: BodyProfile,
  garment: FavoriteGarment,
  theme: ColorTheme,
  userProfile?: any,
  userId?: string
): Promise<OutfitFormulaResult> {
  // Sikr os at vi ikke sender massive base64 strenge (fra gamle ukomprimerede uploads) som crasher Vercel (413 Payload Too Large)
  let safeImageUrl = garment.imageUrl;
  if (safeImageUrl && safeImageUrl.startsWith('data:image') && safeImageUrl.length > 1024 * 1024) { // Større end 1MB
    console.warn("Billedet er for stort til Vercel. Fjerner billedet fra request payload.");
    safeImageUrl = undefined;
  }

  const safeGarment = { ...garment, imageUrl: safeImageUrl };

  const response = await fetch('/api/styling', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, garment: safeGarment, theme, userProfile, userId })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Kunne ikke generere outfit formel');
  }

  return response.json();
}
