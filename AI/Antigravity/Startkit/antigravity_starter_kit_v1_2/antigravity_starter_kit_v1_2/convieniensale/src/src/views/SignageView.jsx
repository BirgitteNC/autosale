import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeSVG } from 'qrcode.react';

export default function SignageView() {
  const [recipes, setRecipes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Læs storeId fra URL (?storeId=...), ellers fallback til standard test-butikken.
  const searchParams = new URLSearchParams(window.location.search);
  const storeId = searchParams.get('storeId');

  useEffect(() => {
    if (!storeId) {
      setIsLoaded(true);
      return;
    }
    const updateDisplay = async (forcedSelected = null, forcedWaste = null) => {
      let currentSelected = forcedSelected;
      let currentWaste = forcedWaste;
      
      if (!currentSelected) {
        const { data: promoData } = await supabase.from('active_promotions').select('*').eq('store_id', storeId).single();
        currentSelected = promoData?.selected_ingredients || [];
        currentWaste = promoData?.food_waste_ingredients || [];
      }

      const { data: allRecipes } = await supabase.from('recipes').select('*');
      if (!allRecipes || allRecipes.length === 0) return;

      let scoredRecipes = allRecipes.map(recipe => {
         const recipeIngs = recipe.ingredienser || [];
         let matchCount = 0;
         let wasteCount = 0;
         recipeIngs.forEach(ri => {
            if (currentSelected.includes(ri.raavare_id)) matchCount++;
            if (currentWaste.includes(ri.raavare_id)) wasteCount++;
         });
         return { ...recipe, matchCount, foodWasteCount: wasteCount };
      });

      // SAFE FALLBACK LOGIC (DROGON PROTOCOL: Ingen blinde gæt)
      let isMemoryUsed = false;
      
      if (currentWaste.length > 0) {
          const wasteMatches = scoredRecipes.filter(r => r.foodWasteCount > 0);
          if (wasteMatches.length > 0) {
              scoredRecipes = wasteMatches;
          } else {
              scoredRecipes = []; // Hard Lock: Ingen opskrifter = Tom skærm
          }
      } else if (currentSelected.length > 0) {
         const hasMatches = scoredRecipes.some(r => r.matchCount > 0);
         if (hasMatches) {
             scoredRecipes = scoredRecipes.filter(r => r.matchCount > 0);
         } else {
             scoredRecipes = []; // Hard Lock
         }
      } else {
         // INGEN VARER VALGT (F.eks. efter 'Ryd alt' er trykket)
         const saved = localStorage.getItem('last_valid_recipes');
         if (saved) {
             try {
                 const parsedSaved = JSON.parse(saved);
                 if (parsedSaved && parsedSaved.length > 0) {
                     scoredRecipes = parsedSaved;
                     isMemoryUsed = true;
                 }
             } catch(e) {}
         }
         
         if (!isMemoryUsed) {
             scoredRecipes = []; // Default til passiv skærm
         }
      }

      if (!isMemoryUsed) {
          scoredRecipes.sort((a, b) => {
             // Primær sortering: Datovarer (food waste) trumfer alt andet
             if (b.foodWasteCount !== a.foodWasteCount) return b.foodWasteCount - a.foodWasteCount;
             // Sekundær sortering: Det samlede antal matchende varer
             return b.matchCount - a.matchCount;
          });
          scoredRecipes = scoredRecipes.slice(0, 3);
          
          // Hvis der faktisk ER valgt varer, gemmer vi resultatet i skærmens notesbog til i morgen!
          if (currentWaste.length > 0 || currentSelected.length > 0) {
             localStorage.setItem('last_valid_recipes', JSON.stringify(scoredRecipes));
          }
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="container flex-col items-center justify-center" style={{minHeight: '100vh', display: 'flex', gap: '1rem'}}>
        <h2 className="text-muted">Forbinder til skærmnetværket...</h2>
      </div>
    );
  }

  const currentRecipe = recipes[currentIndex];

  if (!currentRecipe) {
    return (
      <div className="container animate-fade-in" style={{padding: '0', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden'}}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop)`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          filter: 'brightness(0.7)'
        }} />
        <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'white'}}>
           <h1 style={{fontSize: '5rem', fontWeight: 'bold', marginBottom: '1rem', textShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>MENY</h1>
           <h2 style={{fontSize: '2.5rem', fontWeight: 'normal', textShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>Inspiration & Madglæde</h2>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (recipes.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % recipes.length);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [recipes.length]);

  const displayImageUrl = currentRecipe.billed_url;

  return (
    <div className="container animate-fade-in" style={{padding: '0', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden'}}>
      <style>
        {`
          @keyframes slowPan {
            0% { transform: scale(1) translate(0, 0); }
            100% { transform: scale(1.05) translate(-1%, -1%); }
          }
          @keyframes softPulse {
            0% { box-shadow: 0 0 0 0 rgba(67, 56, 202, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(67, 56, 202, 0); }
            100% { box-shadow: 0 0 0 0 rgba(67, 56, 202, 0); }
          }
          .ken-burns {
            animation: slowPan 20s ease-in-out infinite alternate;
            transform-origin: center center;
          }
          .qr-pulse {
            animation: softPulse 2.5s infinite;
            border-radius: 12px;
          }
        `}
      </style>

      <div style={{display: 'flex', flex: 1, position: 'relative'}}>
        {/* Venstre side: Stort billede med Ken Burns effekt */}
        <div style={{flex: 1, overflow: 'hidden', position: 'relative'}}>
          <div className="ken-burns" style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${displayImageUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center'
          }} />
          <div style={{position: 'absolute', top: '2rem', left: '2rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1.25rem', fontWeight: 'bold'}}>
             MENYMENU
          </div>
          {currentIndex === 0 && (
             <div style={{position: 'absolute', bottom: '2rem', left: '2rem', background: '#eab308', color: '#854d0e', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1.25rem', fontWeight: 'bold'}}>
                Mest Populær
             </div>
          )}
        </div>

        {/* Højre side: Opskrift info */}
        <div style={{width: '600px', display: 'flex', flexDirection: 'column', padding: '2.5rem 2.5rem', background: 'var(--color-bg)'}}>
          <div style={{marginBottom: '0.75rem', color: '#4338ca', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.875rem'}}>
            Dagens Anbefaling fra Madarbejderne
          </div>
          <h1 style={{fontSize: 'clamp(2rem, 3.5vh, 2.75rem)', marginBottom: '1rem', lineHeight: 1.1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{currentRecipe.titel}</h1>
          
          <div className="flex gap-2" style={{marginBottom: '1rem', flexWrap: 'wrap'}}>
            {currentRecipe.foodWasteCount > 0 && (
              <span style={{background: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 'bold'}}>💚 Datovinder</span>
            )}
            {currentRecipe.tags && currentRecipe.tags.map(tag => (
              <span key={tag} style={{background: tag === 'Vegetar' ? '#dcfce7' : '#e0f2fe', color: tag === 'Vegetar' ? '#166534' : '#0284c7', padding: '0.35rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 'bold'}}>{tag}</span>
            ))}
          </div>
          
          <p className="text-muted" style={{fontSize: '1.25rem', marginBottom: '1rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
            {currentRecipe.beskrivelse}
          </p>

          <div style={{ flex: 1 }}></div>

          <div className="flex justify-between items-center" style={{flexShrink: 0, marginTop: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0'}}>
            <div className="flex-col gap-1">
              <div className="font-bold" style={{fontSize: '1.35rem', marginBottom: '0.25rem'}}>Få opskriften på mobilen</div>
              <div className="text-muted" style={{fontSize: '1rem', marginBottom: '0.5rem'}}>Inkl. trin-for-trin og indkøbsliste</div>
              <div style={{color: '#4338ca', fontWeight: 'bold', fontSize: '1.125rem'}}>
                #menymenu
              </div>
            </div>
            <div className="qr-pulse" style={{background: 'white', padding: '0.75rem'}}>
               <QRCodeSVG value={`${window.location.origin}/recipe/${currentRecipe.id}?storeId=${storeId}`} size={120} />
            </div>
          </div>
          <div style={{marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center'}}>
             * Tjek altid varedeklarationen i butikken for allergener.
          </div>
        </div>

        {/* Autoplay er aktivt, ingen manuelle pile */}
      </div>
    </div>
  );
}
