const url = 'https://meny.dk/opskrift/taerte-med-roedloeg-spinat-skinke-og-timian';

async function run() {
    const res = await fetch(url);
    const html = await res.text();
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) return console.log("No NEXT_DATA");
    const nextData = JSON.parse(match[1]);
    const recipeData = nextData.props?.pageProps?.data || nextData.props?.pageProps?.initialState?.recipe?.recipe;
    console.log("Ingredients:", JSON.stringify(recipeData.ingredients || recipeData.ingredientGroups, null, 2));
}

run();
