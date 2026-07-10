import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export const runtime = 'edge'; // Edge runtime gives 25s timeout on Hobby instead of 10s Serverless

// System promptet for AI Stylisten
const SYSTEM_PROMPT = `Du er Anastasiia Preston, en professionel fashion stylist. Din æstetik er 'Quiet Luxury' og 'Old Money', og du bygger dine anbefalinger på et videnskabeligt Kildebaseret Stylingskodeks (Stylewise, Laura Lava, Trinny London).
Dine absolutte stylingsregler:

KROPSARKITEKTUR (MODUL 1)
- Pæreform: Træk blikket opad. Brug bådhals/off-shoulder. Undgå skinny jeans, brug bootcut/trouser jeans.
- Æbleform: Flyt taljelinjen (Empire-snit), brug V-udskæringer og skab lodret forlængelse med åbne lag (cardigan/blazer). Undgå bælter i taljen.
- Rektangel: Bryd søjlesilhuetten. Brug kurvede halsudskæringer, ærmer med volumen. Overdele MÅ IKKE slutte i taljen (slut ved hoften). Undgå høj talje.
- Melonform: Brug slå-om-snit (Wrap) og V-udskæringer. Brug bukser med svaj (bootcut). Undgå skinny jeans.
- Timeglas: Fremhæv taljen (bodycon, wrap, bælter). Undgå oversized formløst tøj.

FOKUSERET STYLING (MODUL 2 & 3)
- Mavekamouflage: Ingen tætsiddende overdele. Brug leggings + tunika. Tredjedels-regel (stop aldrig blusen stramt ned). Draperinger og tekstur snyder øjet.
- Små Bryster: Statement-bluser (flæser, volumen) er fantastiske. Høj hals, halterneck, ELLER ekstrem dyb V-hals uden BH. Undgå stramme t-shirts med dyb V-hals (bær hvid tee under).

PROPORTIONER OG FODTØJ (MODUL 4)
- Slim-fit bukser = lav-profil sko (loafers, slanke støvler, minimalistiske sneakers).
- Wide-leg bukser = sko med volumen (chunky sneakers, kraftige støvler).
- Benforlængelse: Brug spidse sko der farve-matcher bukserne eller hudtonen for at undgå brud ved anklen.

FARVER (MODUL 5)
- Monokrom, Analog (nabofarver), Samme Glød (intensitet) er de 3 sikre formler.

SYSTEMISKE PARADOKSER (MODUL 6 - VIGTIGST)
- Hvis lille barm + mave: Drop taljebæltet! Brug drapering + ruffet halsudskæring i stedet.
- Hvis æbleform + lille barm: Drop empire-snit! Brug wrap-kjole med V-hals i stedet.
- Hvis rektangel + mave: Drop højtaljet! Brug mid-rise bukser + french tuck + åben cardigan over.

Opgave:
Du modtager en JSON payload med brugerens 'body' profil (inklusiv deres personlige 'Color DNA', højde, og præferencer), det valgte 'garment' og et ønsket 'theme'.
Generér en styling-formel baseret på PÅ DETTE MANIFEST. Løs eventuelle paradokser korrekt.

Returner KUN et JSON objekt i dette format (præcis dette format, ingen markdown):
{
  "title": "Navnet på looket",
  "advice": "1-2 sætninger der beskriver hvorfor dette look virker, henvendt til brugeren (brug ord som 'vi' og 'din').",
  "formula": {
    "anchor": "Navnet på tøjet fra input",
    "garmentVisualDescription": "En ultra-detaljeret visuel beskrivelse af det valgte tøj på billedet (farve, tekstur, pasform, mønster, fx 'hvide baggy bukser med semi-transparent blomsterblonde, løs pasform og elastik i taljen'). VIGTIGT: Hvis der er et billede vedlagt, baser beskrivelsen på dette billede. Hvis ikke, brug dit bedste gæt baseret på navnet.",
    "pairingPieces": ["Piece 1", "Piece 2"],
    "tuckStyle": "half_tuck | no_tuck | full_tuck",
    "footwearChoice": "Beskrivelse af fodtøj (husk The Wrong Shoe Theory eller Sandwiching)",
    "layeringStrategy": "Hvordan lagene bygges",
    "colorCombination": "Kort beskrivelse af farverne",
    "colorPalette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"]
  },
  "appliedRuleIds": ["RULE_1", "RULE_2"],
  "provenanceSources": ["Anastasiia Preston Volume Guide", "Style Formula"]
}`;

export async function POST(req: Request) {
  try {
    const { body, garment, theme, userProfile, userId } = await req.json();

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OpenAI API key er ikke konfigureret' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: [
            { type: 'text' as const, text: JSON.stringify({ body, garment: { name: garment.name, category: garment.category, fit: garment.fit, color: garment.color }, theme, userProfile }) },
            ...(garment.imageUrl ? [{ type: 'image_url' as const, image_url: { url: garment.imageUrl } }] : [])
          ]
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(resultText);

    // Generer Fashion Sketch med GPT-Image-2
    let illustrationUrl = null;
    try {
      const dallePrompt = `Minimalist fashion illustration, elegant continuous line drawing, watercolor hints. NOT photorealistic. A full body sketch of a person with a ${userProfile?.body_shape || 'balanced'} body shape, wearing: ${result.formula.garmentVisualDescription}, and paired with ${result.formula.pairingPieces.join(', ')}. Footwear: ${result.formula.footwearChoice}. Color palette highlights: ${result.formula.colorCombination}. White background, editorial fashion sketch style, highly artistic.`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 21000); // 21 second timeout for image generation
      
      const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt: dallePrompt,
          n: 1,
          size: '1024x1024'
        })
      });

      if (dalleResponse.ok) {
        const dalleData = await dalleResponse.json();
        if (dalleData.data && dalleData.data[0].b64_json) {
          illustrationUrl = 'data:image/png;base64,' + dalleData.data[0].b64_json;
        } else if (dalleData.data && dalleData.data[0].url) {
          illustrationUrl = dalleData.data[0].url;
        }
        result.illustrationUrl = illustrationUrl;
      } else {
        console.error("GPT-Image-2 API Error:", await dalleResponse.text());
      }
      clearTimeout(timeoutId);
    } catch (e) {
      console.error("Failed to generate GPT-Image-2 image", e);
    }

    // Rule 8: EU AI Act - Data Provenance Logging
    if (userId) {
      const message = userId + JSON.stringify(body) + JSON.stringify(garment) + JSON.stringify(result.appliedRuleIds);
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const integrityHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await supabase.from('styling_recommendation_logs').insert({
        user_id: userId,
        body_profile_snapshot: body,
        favorite_garment_snapshot: garment,
        selected_theme: theme,
        rule_ids_applied: result.appliedRuleIds,
        provenance_sources: result.provenanceSources,
        generated_advice_text: result.advice,
        integrity_hash: integrityHash,
        generated_image_url: illustrationUrl
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Styling API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
