fetch('https://meny.dk/opskrift/marry-me-graarter')
    .then(r => r.text())
    .then(t => {
        const match = t.match(/<script id="__NEXT_DATA__".*?>(.*?)<\/script>/s);
        if (match) {
            const data = JSON.parse(match[1]);
            const propsData = data.props.pageProps.data;
            if (propsData) {
                console.log("Found propsData");
                const recipeData = propsData.recipe || propsData.recipeDetail || propsData;
                console.log("Keys:", Object.keys(recipeData));
                console.log("Text preview:", JSON.stringify(recipeData).substring(0, 300));
            } else {
                console.log("No data object in pageProps");
            }
        }
    });
