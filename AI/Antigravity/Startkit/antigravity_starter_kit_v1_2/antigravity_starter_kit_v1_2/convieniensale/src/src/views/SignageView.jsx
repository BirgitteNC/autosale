import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { QRCodeSVG } from 'qrcode.react';

export default function SignageView() {
  const [recipes, setRecipes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Læs storeId fra URL (?storeId=...), ellers fallback til localStorage.
  const searchParams = new URLSearchParams(window.location.search);
  let storeId = searchParams.get('storeId');
  if (!storeId) {
    try {
      storeId = localStorage.getItem('staff_store_id');
    } catch(e) {
      console.warn('localStorage blokeret', e);
    }
  }

  useEffect(() => {
    if (!storeId) {
      setIsLoaded(true);
      return;
    }
    const updateDisplay = async (forcedSelected = null, forcedWaste = null) => {
      let currentSelected = forcedSelected;
      let currentWaste = forcedWaste;
      
      if (!currentSelected) {
        const { data: promoData } = await supabase.from('active_promotions').select('*').eq('store_id', storeId).maybeSingle();
        currentSelected = promoData?.selected_ingredients || [];
        currentWaste = promoData?.food_waste_ingredients || [];
      }

      const { data: allRecipes } = await supabase.from('recipes').select('*').neq('beskrivelse', 'Importeret fra Meny');
      const { data: allIngredients } = await supabase.from('ingredients').select('id, kategori');
      if (!allRecipes || allRecipes.length === 0 || !allIngredients) return;

      const ingCategoryMap = {};
      allIngredients.forEach(i => { ingCategoryMap[i.id] = i.kategori; });

      const meatCategories = ['Slagter', 'Fisk'];
      const allSelectedIds = [...currentSelected, ...currentWaste];
      const userSelectedMeats = allSelectedIds.filter(id => meatCategories.includes(ingCategoryMap[id]));

      let scoredRecipes = allRecipes.map(recipe => {
         const recipeIngs = recipe.ingredienser || [];
         let matchCount = 0;
         let wasteCount = 0;
         let hasMeatConflict = false;

         recipeIngs.forEach(ri => {
             if (currentSelected.includes(ri.raavare_id)) matchCount++;
             if (currentWaste.includes(ri.raavare_id)) wasteCount++;
         });

         // Konflikthåndtering for Kød/Fisk
         if (userSelectedMeats.length > 0) {
             const recipeMeats = recipeIngs.filter(ri => {
                 // Ignorer fejlagtigt kategoriserede råvarer som koriander (ing_koriander) og mandler (ing_meny_auto_104)
                 if (['ing_koriander', 'ing_meny_auto_104'].includes(ri.raavare_id)) return false;
                 return meatCategories.includes(ingCategoryMap[ri.raavare_id]);
             });
             
             if (recipeMeats.length > 0) {
                 // Opskriften har kød. Tjek om den indeholder MINDST ÉN af de valgte kødtyper.
                 const hasRequestedMeat = recipeMeats.some(rm => userSelectedMeats.includes(rm.raavare_id));
                 if (!hasRequestedMeat) {
                     hasMeatConflict = true; // Opskriften har et ANDET kød, og MANGLER det kød brugeren vil have.
                 }
             }
         }

         return { ...recipe, matchCount, foodWasteCount: wasteCount, hasMeatConflict };
      });

      // SAFE FALLBACK LOGIC (Ny logik baseret på max match count)
      let isMemoryUsed = false;
      
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
         let saved = null;
         try {
           saved = localStorage.getItem('last_valid_recipes');
         } catch(e) {}
         
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
             // FALLBACK: Ingen valgte varer og ingen hukommelse. Viser madspilds-tips pauseskærmen.
             scoredRecipes = [];
         }
      }

      if (!isMemoryUsed) {
          scoredRecipes.sort((a, b) => {
             // Primær sortering: Flest matchende varer fra bundtet vinder
             if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
             // Sekundær sortering: Ved lige mange varer, trumfer datovaren
             return b.foodWasteCount - a.foodWasteCount;
          });
          scoredRecipes = scoredRecipes.slice(0, 1);
          
          // Hvis der faktisk ER valgt varer, gemmer vi resultatet i skærmens notesbog til i morgen!
          if (currentWaste.length > 0 || currentSelected.length > 0) {
             try {
               localStorage.setItem('last_valid_recipes', JSON.stringify(scoredRecipes));
             } catch(e) {}
          }
      }

      // Sørg for, at der ALTID maksimalt er 1 opskrift (dræb karrusellen én gang for alle)
      scoredRecipes = scoredRecipes.slice(0, 1);
      
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

    // 3-minutters REST Fallback Failsafe (Anti-Race Condition)
    const fallbackInterval = setInterval(() => {
      updateDisplay();
    }, 180000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallbackInterval);
    };
  }, []);

  useEffect(() => {
    if (recipes.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % recipes.length);
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [recipes.length]);

  if (!isLoaded) {
    return (
      <div className="container flex-col items-center justify-center" style={{minHeight: '100vh', display: 'flex', gap: '1rem'}}>
        <h2 className="text-muted">Forbinder til skærmnetværket...</h2>
      </div>
    );
  }

  const currentRecipe = recipes[currentIndex];

  if (currentRecipe) {
     try {
        localStorage.setItem('demo_sync_recipe_id', currentRecipe.id);
     } catch (e) {}
  }

  if (!currentRecipe) {
    return (
      <div className="container animate-fade-in" style={{padding: '0', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden'}}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#166534', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
           <h1 style={{fontSize: '5rem', fontWeight: 'bold', marginBottom: '2rem', textShadow: '0 4px 12px rgba(0,0,0,0.3)'}}>💚 Stop Madspild</h1>
           <div style={{fontSize: '2rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '16px'}}>
             <p style={{marginBottom: '1rem', fontWeight: 'bold'}}>Vidste du, at...</p>
             <ul style={{textAlign: 'left', listStyle: 'none', padding: 0}}>
               <li style={{marginBottom: '1rem'}}>🍌 Brune bananer er perfekte til bagværk eller smoothies.</li>
               <li style={{marginBottom: '1rem'}}>🍞 Gammelt brød kan blive til lækre hvidløgscroutoner.</li>
               <li>🥕 Slappe rodfrugter bliver sprøde igen i et koldt vandbad.</li>
             </ul>
           </div>
           <h3 style={{marginTop: '3rem', fontSize: '1.5rem', opacity: 0.8}}>Spørg madarbejderne for flere tips!</h3>
        </div>
      </div>
    );
  }

  const displayImageUrl = currentRecipe.billed_url || 'https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=960&auto=format&fit=crop';

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

      <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden'}}>
         <div className="ken-burns" style={{
            position: 'absolute', top: '-5%', left: '-5%', right: '-5%', bottom: '-5%',
            backgroundImage: `url(${displayImageUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center'
         }} />
         {/* Gradient overlay for optimal text readability */}
         <div style={{position: 'absolute', top: 0, right: 0, bottom: 0, width: '60%', background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.85))'}} />
         <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)'}} />
      </div>

      <div style={{position: 'relative', zIndex: 10, display: 'flex', flex: 1, justifyContent: 'flex-end', padding: '4rem'}}>
         

         {/* Floating Glassmorphism Panel on the Right */}
         <div className="animate-fade-in" key={currentRecipe.id} style={{
            width: '650px', display: 'flex', flexDirection: 'column', padding: '3.5rem', 
            background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '32px', border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)', color: 'white'
         }}>
           <div style={{marginBottom: '1rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '1.1rem'}}>
             Dagens Anbefaling fra Madarbejderne
           </div>
           
           <h1 style={{fontSize: 'clamp(2.5rem, 5vh, 3.5rem)', marginBottom: '1.5rem', lineHeight: 1.1, fontFamily: 'Outfit, sans-serif', textShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>
             {currentRecipe.titel}
           </h1>
           
           <div className="flex gap-3" style={{marginBottom: '2rem', flexWrap: 'wrap'}}>
             {currentRecipe.foodWasteCount > 0 && (
               <span style={{background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(74, 222, 128, 0.5)', color: '#86efac', padding: '0.6rem 1.25rem', borderRadius: '24px', fontSize: '1.1rem', fontWeight: 'bold', backdropFilter: 'blur(8px)'}}>💚 Datovinder</span>
             )}
             {currentRecipe.tags && currentRecipe.tags.map(tag => (
               <span key={tag} style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '24px', fontSize: '1.1rem', fontWeight: 'bold', backdropFilter: 'blur(8px)'}}>{tag}</span>
             ))}
           </div>
           
           <p style={{fontSize: '1.4rem', marginBottom: '2rem', lineHeight: 1.5, color: '#e2e8f0', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
             {currentRecipe.beskrivelse}
           </p>

           <div style={{ flex: 1 }}></div>

           <div className="flex justify-between items-center" style={{marginTop: '2rem', background: 'rgba(0,0,0,0.3)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'}}>
             <div className="flex-col gap-2">
               <div style={{fontSize: '1.6rem', fontWeight: '800', color: 'white'}}>Få opskriften på mobilen</div>
               <div style={{fontSize: '1.1rem', color: '#cbd5e1', marginTop: '0.5rem'}}>Inkl. trin-for-trin og indkøbsliste</div>
               <div style={{color: '#38bdf8', fontWeight: 'bold', fontSize: '1.25rem', marginTop: '1rem', letterSpacing: '1px'}}>
                 SCAN QR-KODEN ➔
               </div>
             </div>
             <div className="qr-pulse" style={{background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'}}>
                <QRCodeSVG value={`${window.location.origin}/recipe/${currentRecipe.id}?storeId=${storeId}`} size={150} />
             </div>
           </div>
         </div>

        {/* Autoplay er aktivt, ingen manuelle pile */}
      </div>
    </div>
  );
}
