/**
 * Centraliseret forretningslogik for at matche, rangere og filtrere opskrifter baseret på valgte råvarer.
 * Dette sikrer at Signage (butiksskærme) og Staff App evaluerer data 100% ens.
 * 
 * Funktionerne herunder håndterer bl.a. 'kød-konflikter' via `meatCategories`, 
 * som forhindrer systemet i at foreslå en svinekøds-opskrift, hvis brugeren allerede
 * har valgt kylling.
 * 
 * @param {Object} options Objekt med opskrifter, råvarer og valgte ID'er.
 * @returns {Array} Sorteret og beriget liste af opskrifter (scoredRecipes).
 */

// Forgængelighedsvægte: høj vægt = skal sælges hurtigst
const PERISHABILITY_WEIGHT = {
  'Grønt':                    1.5,
  'Frugt/Grønt':              1.5,
  'Slagter':                  1.5,
  'Kød':                      1.5,
  'Fisk':                     1.5,
  'Fiskeafdeling':            1.5,
  'Mejeri':                   1.2,
  'Mælk og mejeriprodukter':  1.2,
};

function perishabilityWeight(kategori) {
  return PERISHABILITY_WEIGHT[kategori] ?? 1.0;
}

export function rankRecipes({
    selectedIngredientIds = [],
    foodWasteIngredientIds = [],
    recipes = [],
    ingredients = []
  }) {
    const ingCategoryMap = {};
    ingredients.forEach(i => { ingCategoryMap[i.id] = i.kategori; });

    const meatCategories = ['Kød', 'Slagter', 'Fisk', 'Fiskeafdeling'];
    const allSelectedIds = [...selectedIngredientIds, ...foodWasteIngredientIds];
    const userSelectedMeats = allSelectedIds.filter(id => meatCategories.includes(ingCategoryMap[id]));

    let scoredRecipes = recipes.map(recipe => {
       const recipeIngs = recipe.ingredienser || [];
       let matchCount = 0;
       let wasteCount = 0;
       let hasMeatConflict = false;

       const uniqueRecipeRaavareIds = [...new Set(recipeIngs.map(ri => ri.raavare_id))];

       uniqueRecipeRaavareIds.forEach(raavare_id => {
           const weight = perishabilityWeight(ingCategoryMap[raavare_id]);
           if (selectedIngredientIds.includes(raavare_id)) matchCount += weight;
           if (foodWasteIngredientIds.includes(raavare_id)) wasteCount += weight;
       });

       // HÅRD REGEL: Kød-konflikt
       if (userSelectedMeats.length > 0) {
           const recipeMeats = recipeIngs.filter(ri => {
               const kategori = ingCategoryMap[ri.raavare_id];
               if (kategori === 'Krydderurter' || kategori === 'Frugt/Grønt') return false;
               return meatCategories.includes(kategori);
           });

           if (recipeMeats.length > 0) {
               const hasRequestedMeat = recipeMeats.some(rm => userSelectedMeats.includes(rm.raavare_id));
               if (!hasRequestedMeat) {
                   hasMeatConflict = true;
               }
           }
       }

       return { ...recipe, matchCount, foodWasteCount: wasteCount, hasMeatConflict };
    });

    return scoredRecipes;
  }
  
  /**
   * Validerer om en gruppe af råvarer (bundt) er en lovlig kombination.
   * Bruges af medarbejderen for at undgå irrelevante opskrifter på skærmen.
   */
  export function validateBundle(validSelectedIds, recipes) {
      const uniqueValidIds = [...new Set(validSelectedIds)];
      if (uniqueValidIds.length <= 1) return true;
      
      let maxMatch = 0;
      recipes.forEach(recipe => {
          const recipeIngs = recipe.ingredienser || [];
          let matchCount = 0;
          const uniqueRecipeRaavareIds = [...new Set(recipeIngs.map(ri => ri.raavare_id))];
          uniqueRecipeRaavareIds.forEach(raavare_id => {
              if (uniqueValidIds.includes(raavare_id)) matchCount++;
          });
          if (matchCount > maxMatch) maxMatch = matchCount;
      });
      
      const requiredMatches = uniqueValidIds.length <= 2 ? 1 : (uniqueValidIds.length === 3 ? 2 : 3);
      return maxMatch >= requiredMatches;
  }
