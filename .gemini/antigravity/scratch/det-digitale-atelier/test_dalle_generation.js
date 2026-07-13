require('dotenv').config({ path: '.env.local' });

async function testDalle() {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error("No OPENAI_API_KEY found");
    return;
  }

  const prompt = "Minimalist fashion illustration, elegant continuous line drawing, watercolor hints. NOT photorealistic. A full body sketch of a person wearing an olive green sleeveless linen top, paired with dark denim bootcut jeans. Footwear: flat beige loafers. Color palette highlights: warm earthy tones. White background, editorial fashion sketch style, highly artistic.";
  
  console.log("Testing dall-e-2 model...");
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1-mini',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    const elapsed = Date.now() - startTime;
    console.log(`Response time: ${elapsed}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error (${response.status}):`, errorText);
    } else {
      const data = await response.json();
      console.log("Success! Data:", data);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

testDalle();
