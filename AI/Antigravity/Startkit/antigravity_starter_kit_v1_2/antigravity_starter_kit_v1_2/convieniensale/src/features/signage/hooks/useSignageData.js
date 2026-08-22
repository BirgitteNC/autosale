import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../../supabaseClient';
import { apiRequest } from '../../../shared/api/apiClient';
import { rankRecipes } from '../../../utils/rankRecipes';

export function useSignageData({ allowStoredStoreId = true } = {}) {
  const [recipes, setRecipes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Stabil beregning — kører kun én gang, ikke på hvert render
  const storeId = useMemo(() => {
    const id = new URLSearchParams(window.location.search).get('storeId');
    if (id) return id;
    if (!allowStoredStoreId) return null;
    try { return localStorage.getItem('staff_store_id'); } catch { return null; }
  }, [allowStoredStoreId]);

  // Katalog-cache: opskrifter og ingredienser hentes én gang og genbruges ved realtime-events
  const catalogRef = useRef(null);

  useEffect(() => {
    if (!storeId) {
      setIsLoaded(true);
      return;
    }

    const updateDisplay = async (forcedSelected = null, forcedWaste = null) => {
      let currentSelected = forcedSelected;
      let currentWaste = forcedWaste;

      if (!currentSelected) {
        const { data: promoData } = await apiRequest(
           supabase.from('active_promotions').select('*').eq('store_id', storeId).maybeSingle()
        );
        currentSelected = promoData?.selected_ingredients || [];
        currentWaste = promoData?.food_waste_ingredients || [];
      }

      // Hent katalog fra cache ved realtime-opdateringer — fetch kun hvis det ikke er indlæst endnu
      if (!catalogRef.current) {
        const [{ data: rawRecipes }, { data: allIngredients }] = await Promise.all([
          apiRequest(supabase.from('recipes').select('*')),
          apiRequest(supabase.from('ingredients').select('id, kategori')),
        ]);
        const allRecipes = rawRecipes ? rawRecipes.filter(r => r.beskrivelse !== 'Importeret fra Meny') : null;
        if (!allRecipes || allRecipes.length === 0 || !allIngredients) {
          setIsLoaded(true);
          return;
        }
        catalogRef.current = { allRecipes, allIngredients };
      }

      const { allRecipes, allIngredients } = catalogRef.current;
      if (!allRecipes || !allIngredients) {
        setIsLoaded(true);
        return;
      }

      let scoredRecipes = rankRecipes({
        selectedIngredientIds: currentSelected,
        foodWasteIngredientIds: currentWaste,
        recipes: allRecipes,
        ingredients: allIngredients
      });

      // SAFE FALLBACK LOGIC

      
      if (currentWaste.length > 0 || currentSelected.length > 0) {
         // Hard Conflict frasortering
         scoredRecipes = scoredRecipes.filter(r => !r.hasMeatConflict);

         // Vi tillader alle opskrifter der har mindst 1 match (enten waste eller normal)
         const hasMatches = scoredRecipes.some(r => r.matchCount > 0 || r.foodWasteCount > 0);
         if (hasMatches) {
             scoredRecipes = scoredRecipes.filter(r => r.matchCount > 0 || r.foodWasteCount > 0);
         } else {
             // FALLBACK: Ingen matches fundet. Viser madspilds-tips pauseskærmen.
             scoredRecipes = [];
         }
      } else {
         // INGEN VARER VALGT (F.eks. efter 'Ryd alt' er trykket)
         // FALLBACK: Viser madspilds-tips pauseskærmen.
         scoredRecipes = [];
      }

      if (scoredRecipes.length > 0) {
          scoredRecipes.sort((a, b) => {
             // Primær sortering: Flest matchende varer fra bundtet vinder
             if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
             // Sekundær sortering: Ved lige mange varer, trumfer datovaren
             return b.foodWasteCount - a.foodWasteCount;
          });
          scoredRecipes = scoredRecipes.slice(0, 1);
      }
      
      setRecipes(scoredRecipes);
      setIsLoaded(true);
      setCurrentIndex(0); // Reset til første opskrift ved opdatering
    };

    updateDisplay();

    const channel = supabase.channel('public:active_promotions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'active_promotions', 
        filter: `store_id=eq.${storeId}` 
      }, 
      (payload) => {
        if (payload.new && payload.new.selected_ingredients) {
          updateDisplay(payload.new.selected_ingredients, payload.new.food_waste_ingredients || []);
        }
      })
      .subscribe((status) => {
         if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
             // Zero-Trust: Træk friske data via REST API hvis websocket dør
             updateDisplay();
         }
      });

    // Zero-Trust Auto-Heal: Tjekker også hvis enheden går fra offline til online
    const handleOnline = () => updateDisplay();
    window.addEventListener('online', handleOnline);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('online', handleOnline);
    };
  }, [storeId]);

  return {
    recipes,
    isLoaded,
    currentIndex,
    storeId
  };
}
