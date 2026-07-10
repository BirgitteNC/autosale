import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { imageBase64, eyeColor } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Du er en professionel stylist og ekspert i "Seasonal Color Analysis" (12 sæsoner-systemet).
Analyser ansigtet, hudtonen (varm/kold/neutral, overflade og undertone), hårfarven og øjenfarven på personen på dette billede.${eyeColor ? `\n\nVIGTIG INFO FRA BRUGEREN: Min rigtige øjenfarve er ${eyeColor}. Sørg for at basere din "Seasonal Color Analysis" på denne øjenfarve frem for hvad du eventuelt kan tyde ud fra billedets belysning.` : ''}

Returner KUN et JSON objekt i præcis følgende format:
{
  "season": "f.eks. Kold Sommer, Varm Efterår, Klar Vinter",
  "explanation": "Kort beskrivelse (max 2 sætninger) af hvorfor (f.eks. 'Du har kold, lys hud med askebrunt hår og gråblå øjne...')",
  "recommended_colors": ["Navy blå", "Pudderrosa", "Koksgrå"]
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyser mit farve-DNA ud fra dette billede:" },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    const resultJson = JSON.parse(resultText);

    return NextResponse.json(resultJson);

  } catch (error: any) {
    console.error("Fejl i color-dna vision api:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze color DNA" }, { status: 500 });
  }
}
