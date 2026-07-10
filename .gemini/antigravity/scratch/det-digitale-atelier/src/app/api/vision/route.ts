import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Vi initialiserer ikke OpenAI her ude, da vi vil fange manglende nøgler gracefuldt nede i requesten
export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Ingen billeddata modtaget' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API nøgle mangler' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Du er en ekspert i 'Quiet Luxury' og proportioner. 
          Du skal identificere tøjet på billedet og returnere præcis dette JSON format:
          {
            "name": "Kort beskrivelse (f.eks. 'Klassisk Uldfrakke')",
            "category": "En af følgende: 'top', 'bottom', 'footwear', 'outerwear'",
            "fit": "En af følgende: 'oversized', 'wide-leg', 'slim-fit', 'fitted', 'structured'",
            "color": "Hovedfarven"
          }
          Hvis du ikke kan se tøjet eller der er en fejl, så returner et gyldigt JSON objekt med fallback værdier og skriv en venlig besked i name, f.eks: {"name": "Kunne ikke analysere billedet", "category": "top", "fit": "structured", "color": "Ukendt"}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyser dette tøj:" },
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
    console.error("OpenAI API fejl:", error);
    // Graceful degradation: Return fallback instead of crashing
    return NextResponse.json({ 
      name: "Manuel indtastning påkrævet", 
      category: "top", 
      fit: "structured", 
      color: "Ukendt",
      _error: error.message
    }, { status: 200 });
  }
}
