import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Clock, Users, ArrowLeft, Download, Flame, Beef } from 'lucide-react';

export default function CustomerMobileView() {
  const { id } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const storeId = searchParams.get('storeId');

  const [recipe, setRecipe] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [checkedItems, setCheckedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(`recipe_checks_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(`recipe_checks_${id}`, JSON.stringify(checkedItems));
  }, [checkedItems, id]);
  const [allergyFilter, setAllergyFilter] = useState('none');
  const [targetServings, setTargetServings] = useState(2);

  useEffect(() => {
    // 1. WAKELOCK: Hold skærmen tændt mens kunden er i køkkenet!
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wakelock not supported or denied', err);
      }
    };
    requestWakeLock();

    return () => {
      if (wakeLock !== null) wakeLock.release().catch(console.error);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Hent opskriften
      const { data: recipeData } = await supabase.from('recipes').select('*').eq('id', id).single();
      
      if (recipeData) {
        setRecipe(recipeData);
        if (recipeData.portioner) setTargetServings(recipeData.portioner);

        const usedIngredientIds = (recipeData.ingredienser || []).map(ing => ing.raavare_id);
        if (usedIngredientIds.length > 0) {
           const { data: ingData } = await supabase.from('ingredients').select('*');
           if (ingData) {
              setAllIngredients(ingData);
           }
        }
      }

      // Hent aktuelle madspildsvarer for den specifikke butik (dynamisk!)
      const { data: promoData } = await supabase.from('active_promotions').select('food_waste_ingredients').eq('store_id', storeId).single();
      if (promoData && recipeData) {
         const promoIngs = promoData.food_waste_ingredients || [];
         const matchCount = (recipeData.ingredienser || []).filter(ing => promoIngs.includes(ing.raavare_id)).length;
         if (matchCount > 0) {
            setRecipe(prev => ({...prev, isFoodWasteSaver: true}));
         }
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [id]);

  if (loading) return <div className="container flex items-center justify-center" style={{minHeight: '100vh'}}><h2 className="text-muted">Henter opskrift...</h2></div>;
  if (!recipe) return <div className="container flex items-center justify-center" style={{minHeight: '100vh'}}><h2 className="text-danger">Opskrift ikke fundet.</h2></div>;
  
  // Nyt P0 Fix: Fejlbesked hvis en opskrift crasher/mangler ingredienser
  if (!recipe.ingredienser || recipe.ingredienser.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center text-center" style={{minHeight: '100vh', padding: '0 2rem'}}>
        <h2 style={{fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--color-primary)'}}>Opskrift under udarbejdelse</h2>
        <p style={{fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--color-text-main)', marginBottom: '2rem'}}>
          Vores dygtige medarbejdere er ved at finde den helt rigtige opskrift digitalt - spørg dem analogt, de vil så gerne hjælpe dig.
        </p>
      </div>
    );
  }

  const toggleCheck = (ingId) => {
    setCheckedItems(prev => ({...prev, [ingId]: !prev[ingId]}));
  };

  const formatIngredient = (ingred, factor) => {
    // 1. Har vi en præcis 'amount' i databasen fra ETL pipelinen?
    if (ingred.amount !== null && ingred.amount !== undefined) {
       const scaled = ingred.amount * factor;
       // Fjerner unødige nul-decimaler og bruger dansk komma
       const formattedAmount = parseFloat(scaled.toFixed(2)).toString().replace('.', ',');
       const unitStr = ingred.unit ? ` ${ingred.unit}` : '';
       return `${formattedAmount}${unitStr}`;
    }
    
    // 2. Fallback til teksten "Efter behov", "Tilpasset mængde" etc.
    return ingred.text || '';
  };

  const getIngredientInfo = (ingred) => {
    let dbItem = allIngredients.find(i => i.id === ingred.raavare_id);
    if (!dbItem) return null;

    if (allergyFilter === 'gluten' && dbItem.allergener.includes('gluten') && dbItem.alternativ_id) {
        dbItem = allIngredients.find(i => i.id === dbItem.alternativ_id) || dbItem;
    }
    if (allergyFilter === 'laktose' && dbItem.allergener.includes('laktose') && dbItem.alternativ_id) {
        dbItem = allIngredients.find(i => i.id === dbItem.alternativ_id) || dbItem;
    }

    const factor = targetServings / (recipe.portioner || 2);
    return { ...dbItem, maengde: formatIngredient(ingred, factor) };
  };

  const ingredientList = recipe?.ingredienser?.map(getIngredientInfo).filter(Boolean) || [];

  // Sikker fallback for billeder, der fejler eller mangler
  const displayImageUrl = recipe.billed_url && recipe.billed_url.startsWith('http') 
    ? recipe.billed_url 
    : 'https://images.unsplash.com/photo-1490818387583-1b0ba68751c3?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="animate-fade-in" style={{paddingBottom: '4rem'}}>
      <div style={{height: '35vh', backgroundImage: `url(${displayImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'}}>
         <Link to="/" style={{position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.9)', padding: '0.5rem', borderRadius: '50%', color: 'var(--color-text-main)'}}>
            <ArrowLeft size={24} />
         </Link>
      </div>
      
      <div className="container" style={{marginTop: '-2rem', position: 'relative', zIndex: 2, background: 'var(--color-bg)', borderRadius: '32px 32px 0 0', padding: '2rem 1.5rem'}}>
        <h1 style={{fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', marginBottom: '1rem', lineHeight: 1.2}}>{recipe.titel}</h1>
        
        <div className="flex gap-2 flex-wrap" style={{marginBottom: '1.5rem'}}>
          {recipe.isFoodWasteSaver && (
            <span style={{background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 'bold'}}>💚 Datovinder</span>
          )}
          {recipe.tags && recipe.tags.map(tag => (
            <span key={tag} style={{background: tag === 'Vegetar' ? '#dcfce7' : '#e0f2fe', color: tag === 'Vegetar' ? '#166534' : '#0284c7', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 'bold'}}>{tag}</span>
          ))}
        </div>

        {recipe.beskrivelse && (
          <p className="text-muted" style={{marginBottom: '1.5rem', fontSize: '1.125rem', lineHeight: 1.6}}>
             {recipe.beskrivelse}
          </p>
        )}

        <div style={{background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem'}}>
          <div className="grid-2" style={{gap: '1rem'}}>
            <div className="flex items-center gap-3">
              <Clock className="text-primary" size={24}/>
              <div>
                 <div style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Tid</div>
                 <div className="font-bold">{recipe.tidsforbrug_min || 20} minutter</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="text-primary" size={24}/>
              <div className="flex items-center gap-2">
                 <div style={{fontSize: '0.875rem', color: 'var(--color-text-muted)', marginRight: '0.5rem'}}>Portioner</div>
                 <button onClick={() => setTargetServings(2)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold ${targetServings === 2 ? 'bg-primary text-white' : 'bg-white border'}`}>2</button>
                 <button onClick={() => setTargetServings(4)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold ${targetServings === 4 ? 'bg-primary text-white' : 'bg-white border'}`}>4</button>
                 <button onClick={() => setTargetServings(6)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold ${targetServings === 6 ? 'bg-primary text-white' : 'bg-white border'}`}>6</button>
              </div>
            </div>

            {recipe.kalorier_per_300g && (
              <div className="flex items-center gap-3">
                <Flame size={24} style={{color: '#f59e0b'}}/>
                <div>
                   <div style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Kalorier pr. 300g</div>
                   <div className="font-bold">{recipe.kalorier_per_300g} kcal</div>
                </div>
              </div>
            )}

            {recipe.protein_per_300g && (
              <div className="flex items-center gap-3">
                <Beef size={24} style={{color: '#ef4444'}}/>
                <div>
                   <div style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Protein pr. 300g</div>
                   <div className="font-bold">{recipe.protein_per_300g} g</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{marginBottom: '3rem'}}>
           <div className="flex items-center justify-between" style={{marginBottom: '1rem'}}>
              <h3 style={{fontSize: '1.25rem', margin: 0}}>Indkøbsliste</h3>
              <span style={{background: 'var(--color-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 'bold'}}>
                Beregnet til {targetServings} personer
              </span>
           </div>
           
           <div className="flex gap-2" style={{marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
             <button 
                onClick={() => setAllergyFilter('none')}
                className={`badge ${allergyFilter === 'none' ? 'font-bold' : ''}`} style={{background: allergyFilter === 'none' ? 'var(--color-primary)' : '#f1f5f9', color: allergyFilter === 'none' ? 'white' : 'var(--color-text-main)', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem'}}>Standard</button>
             <button 
                onClick={() => setAllergyFilter('gluten')}
                className={`badge ${allergyFilter === 'gluten' ? 'font-bold' : ''}`} style={{background: allergyFilter === 'gluten' ? 'var(--color-primary)' : '#f1f5f9', color: allergyFilter === 'gluten' ? 'white' : 'var(--color-text-main)', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem'}}>Glutenfri</button>
             <button 
                onClick={() => setAllergyFilter('laktose')}
                className={`badge ${allergyFilter === 'laktose' ? 'font-bold' : ''}`} style={{background: allergyFilter === 'laktose' ? 'var(--color-primary)' : '#f1f5f9', color: allergyFilter === 'laktose' ? 'white' : 'var(--color-text-main)', border: 'none', cursor: 'pointer', padding: '0.75rem 1rem'}}>Laktosefri</button>
           </div>

           <div style={{background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'}}>
             {ingredientList.map((item, idx) => (
                <label key={idx} className={`shopping-item ${checkedItems[item.id] ? 'checked' : ''}`}>
                   <input type="checkbox" className="checkbox-custom" checked={!!checkedItems[item.id]} onChange={() => toggleCheck(item.id)} />
                   <div className="item-name flex-1 font-semibold" style={{fontSize: '1.125rem'}}>{item.navn}</div>
                   <div className="text-primary font-bold" style={{fontSize: '1.125rem'}}>{item.maengde}</div>
                </label>
             ))}
           </div>
           
           <div style={{marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center'}}>
             * Bemærk: MenyMenu er et inspirationsværktøj. Tjek altid selv varedeklarationen for allergener inden brug.
           </div>
        </div>

        <div>
          <h3 style={{marginBottom: '1.5rem', fontSize: '1.25rem'}}>Instruktioner</h3>
          <ol style={{paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
             {recipe.instruktioner.map((step, idx) => (
               <li key={idx} className="text-main" style={{lineHeight: 1.6, fontSize: '1.125rem'}}>{step}</li>
             ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
