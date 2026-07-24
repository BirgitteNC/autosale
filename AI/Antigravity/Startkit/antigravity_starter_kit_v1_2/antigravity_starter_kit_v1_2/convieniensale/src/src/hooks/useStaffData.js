import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * useStaffData håndterer global state for medarbejderens tablet (StaffView).
 * Den administrerer valgte fokusvarer, madspildsvarer, PIN-lås, og synkronisering med Supabase.
 * Den håndterer også validering via Drogon Protocol før opdatering.
 */
export function useStaffData() {
  const [storeId, setStoreId] = useState(localStorage.getItem('staff_store_id'));
  const [pin, setPin] = useState('');
  const [selectedLoginStore, setSelectedLoginStore] = useState('');
  const [availableStores, setAvailableStores] = useState([]);
  const [userRole, setUserRole] = useState(localStorage.getItem('staff_user_role') || 'Voksen');
  const [userRoleDesc, setUserRoleDesc] = useState(localStorage.getItem('staff_role_desc') || '');
  const [voksenUnlockUntil, setVoksenUnlockUntil] = useState(parseInt(localStorage.getItem('staff_voksen_unlock') || '0', 10));
  const [pinError, setPinError] = useState(false);
  
  const [ingredients, setIngredients] = useState([]);
  const [recipeCounts, setRecipeCounts] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [foodWasteIds, setFoodWasteIds] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem('staff_store_id');
      localStorage.removeItem('staff_store_pin');
      localStorage.removeItem('staff_user_role');
      localStorage.removeItem('staff_role_desc');
      localStorage.removeItem('staff_voksen_unlock');
      localStorage.removeItem('staff_login_time');
    } catch(e) {
      console.warn('localStorage er blokeret under logout', e);
    }
    setStoreId(null);
    setUserRole('Voksen');
    setUserRoleDesc('');
    setVoksenUnlockUntil(0);
    setSelectedIds([]);
    setFoodWasteIds([]);
  };

  // Hent butikker til login skærmen
  useEffect(() => {
    if (!storeId) {
      supabase.from('stores').select('id, name').then(({data}) => {
        if(data) setAvailableStores(data);
      });
    }
  }, [storeId]);

  // Tjek om sessionen er udløbet (8 timer)
  useEffect(() => {
    const loginTime = localStorage.getItem('staff_login_time');
    if (loginTime) {
      const hoursSinceLogin = (Date.now() - parseInt(loginTime, 10)) / (1000 * 60 * 60);
      if (hoursSinceLogin >= 8) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        handleLogout();
        window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Din session er udløbet (8 timer). Log venligst ind igen.' }));
      }
    }
  }, []);

  const isAuthenticated = !!storeId;

  // Hent varer, opskrifter OG nuværende valgte varer når logget ind
  useEffect(() => {
    if (isAuthenticated) {
      supabase.from('ingredients').select('*').eq('standard_vare', false).then(({data: ingData}) => {
        if(ingData) {
          supabase.from('recipes').select('ingredienser').neq('beskrivelse', 'Importeret fra Meny').then(({data: recData}) => {
            const counts = {};
            ingData.forEach(i => counts[i.id] = 0);
            if(recData) {
               recData.forEach(recipe => {
                   const ri = recipe.ingredienser || [];
                   ri.forEach(r_ing => {
                      if (counts[r_ing.raavare_id] !== undefined) {
                         counts[r_ing.raavare_id]++;
                      }
                   });
               });
            }
            setRecipeCounts(counts);
            setIngredients(ingData);
          });
        }
      });
      
      // Hent eksisterende valg fra databasen, så vi ikke overskriver hinanden!
      supabase.from('active_promotions').select('*').eq('store_id', storeId).single().then(({data: promoData}) => {
         if(promoData) {
            setSelectedIds(promoData.selected_ingredients || []);
            setFoodWasteIds(promoData.food_waste_ingredients || []);
         }
      });
      
      // Lyt efter live-ændringer fra andre terminals/afdelinger!
      const channel = supabase.channel('staff_active_promotions')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'active_promotions', 
          filter: `store_id=eq.${storeId}` 
        }, 
        (payload) => {
          if (payload.new && !isSubmitting) {
            setSelectedIds(payload.new.selected_ingredients || []);
            setFoodWasteIds(payload.new.food_waste_ingredients || []);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, storeId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!navigator.onLine) {
       window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Ingen internetforbindelse - prøv igen.' }));
       return;
    }
    if (!selectedLoginStore) {
       setPinError(true);
       return;
    }
    setIsSubmitting(true);
    
    const trimmedPin = pin.trim();

    // SIKKERT RPC KALD: I stedet for at læse hele tabellen (som nu er blokeret af RLS),
    // beder vi databasen om blindt at verificere koden for os.
    const { data, error } = await supabase.rpc('verify_staff_pin', {
      p_store_id: selectedLoginStore,
      p_pin_code: trimmedPin
    });
    
    // RPC returnerer en array med 1 objekt: [{ is_valid: true/false, role_description: '...' }]
    const result = data && data.length > 0 ? data[0] : null;

    if (result && result.is_valid && !error) {
      let role = 'Voksen';
      if (result.role_description && result.role_description.startsWith('[Ungarbejder]')) {
        role = 'Ungarbejder';
      }
      
      try {
        localStorage.setItem('staff_store_id', selectedLoginStore);
        localStorage.setItem('staff_store_pin', 'hashed_or_hidden'); // Sikkerhed: Vi gemmer ikke raw pin længere
        localStorage.setItem('staff_user_role', role);
        localStorage.setItem('staff_role_desc', result.role_description || '');
        localStorage.setItem('staff_login_time', Date.now().toString());
      } catch(e) {}
      setStoreId(selectedLoginStore);
      setUserRole(role);
      setUserRoleDesc(result.role_description || '');
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
    setIsSubmitting(false);
  };

  const toggleIngredient = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
      setFoodWasteIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 6) {
        window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Du kan maksimalt vælge 6 varer ad gangen.' }));
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const toggleFoodWaste = (id) => {
    setFoodWasteIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        if (selectedIds.length >= 6 && !selectedIds.includes(id)) {
          window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Du kan maksimalt vælge 6 varer ad gangen.' }));
          return prev;
        }
        setSelectedIds(sel => sel.includes(id) ? sel : [...sel, id]);
        return [...prev, id];
      }
    });
  };

  const validateVoksenPin = async (pinToCheck) => {
    if (!navigator.onLine) {
       window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Ingen internetforbindelse - prøv igen.' }));
       return false;
    }
    const { data, error } = await supabase.rpc('verify_staff_pin', {
      p_store_id: storeId,
      p_pin_code: pinToCheck
    });
    
    const result = data && data.length > 0 ? data[0] : null;

    if (result && result.is_valid && !error) {
      if (result.role_description && result.role_description.startsWith('[Ungarbejder]')) return false;
      // Godkendt voksen. Lås op i 10 minutter!
      const unlockTime = Date.now() + 10 * 60 * 1000;
      try {
        localStorage.setItem('staff_voksen_unlock', unlockTime.toString());
      } catch(e) {}
      setVoksenUnlockUntil(unlockTime);
      return true;
    }
    return false;
  };

  const handleGenerate = async (overridePin = null) => {
    if (!storeId || isSubmitting) return;
    if (!navigator.onLine) {
       window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Ingen internetforbindelse - prøv igen.' }));
       return;
    }

    // DROGON PROTOCOL HARD LOCK: Nådesløs Validering
    const validSelectedIds = selectedIds.filter(id => (recipeCounts[id] || 0) > 0);
    const validFoodWasteIds = foodWasteIds.filter(id => (recipeCounts[id] || 0) > 0);

      if (validSelectedIds.length !== selectedIds.length || validFoodWasteIds.length !== foodWasteIds.length) {
         window.dispatchEvent(new CustomEvent('staff-toast', { 
           detail: "Fejl: Nogle valgte varer har ingen opskrifter. De fjernes automatisk for at beskytte skærmen." 
         }));
         setSelectedIds(validSelectedIds);
       setFoodWasteIds(validFoodWasteIds);
    }
    
    if (validSelectedIds.length === 0 && selectedIds.length > 0) {
       setIsSubmitting(false);
       return;
    }

    setIsSubmitting(true);
    
    // VALIDERING AF BUNDT (Undgå at systemet viser fuldstændig irrelevante opskrifter)
    if (validSelectedIds.length > 1) {
        const { data: allRecipes } = await supabase.from('recipes').select('ingredienser').neq('beskrivelse', 'Importeret fra Meny');
        let maxMatch = 0;
        if (allRecipes) {
            allRecipes.forEach(recipe => {
                const recipeIngs = recipe.ingredienser || [];
                let matchCount = 0;
                recipeIngs.forEach(ri => {
                    if (validSelectedIds.includes(ri.raavare_id)) matchCount++;
                });
                if (matchCount > maxMatch) maxMatch = matchCount;
            });
        }
        
        // Demo-tilpasning: Hvis man kun vælger 2 varer, kræver vi kun at mindst én af dem findes i opskriften, 
        // for at undgå at demoen blokerer og viser "Stop Madspild" skærmen ved uskyldige kombinationer.
        // Hvis man har valgt 3 varer, forventer vi mindst 2 findes sammen, og ved 4+ varer mindst 3.
        const requiredMatches = validSelectedIds.length <= 2 ? 1 : (validSelectedIds.length === 3 ? 2 : 3);
        
        if (maxMatch < requiredMatches) {
            window.dispatchEvent(new CustomEvent('staff-toast', { 
               detail: `Systemet kender ikke en opskrift, der samler nok af de valgte varer. Prøv en anden kombination.` 
            }));
            setIsSubmitting(false);
            return;
        }
    }

    const savedPin = overridePin || localStorage.getItem('staff_store_pin') || pin;
    try {
       const { error } = await supabase.rpc('update_store_promotions', {
         p_store_id: storeId,
         p_pin: savedPin,
         p_selected_ids: validSelectedIds,
         p_food_waste_ids: validFoodWasteIds
       });
       
       if (error) {
      console.error('Generering fejlede:', error);
      window.dispatchEvent(new CustomEvent('staff-toast', { detail: `DB Fejl: ${error.message || 'Ukendt fejl'}` }));
      setIsSubmitting(false);
      return;
    }
      setShowSuccess(true);
    } catch(err) {
       console.error("Fejl ved opdatering:", err);
       window.dispatchEvent(new CustomEvent('staff-toast', { detail: "Sikkerhedsfejl: Kunne ikke opdatere tilbud." }));
    }
    
    setIsSubmitting(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  
  const handleClearAll = async () => {
     if(!window.confirm("Er du sikker på at du vil fjerne alle fremhævede varer fra systemet? Dette gøres typisk kun ved lukketid.")) return;
     setSelectedIds([]);
     setFoodWasteIds([]);
     setIsSubmitting(true);
     
     const savedPin = localStorage.getItem('staff_store_pin') || pin;
     try {
        const { error } = await supabase.rpc('update_store_promotions', {
          p_store_id: storeId,
          p_pin: savedPin,
          p_selected_ids: [],
          p_food_waste_ids: []
        });
        
        if (error) throw new Error("Sikkerhedsfejl eller forkert PIN");
        setShowSuccess(true);
     } catch(err) {
        console.error("Fejl ved sletning:", err);
     }
     
     setIsSubmitting(false);
     setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddIngredient = async (name, category = 'Kolonial') => {
    if (!name.trim()) return;
    const newIng = {
      id: `ing_custom_${Date.now()}`,
      navn: name.trim(),
      kategori: category,
      allergener: [],
      standard_vare: false
    };
    const { error } = await supabase.from('ingredients').insert([newIng]);
    if (!error) {
      setIngredients(prev => [...prev, newIng]);
      return true;
    } else {
      console.error("Fejl ved oprettelse af råvare:", error);
      return false;
    }
  };

  return {
    isAuthenticated,
    storeId, userRole, voksenUnlockUntil,
    pin, setPin, pinError,
    availableStores, selectedLoginStore, setSelectedLoginStore,
    ingredients,
    recipeCounts,
    selectedIds, foodWasteIds,
    showSuccess, isSubmitting,
    handleLogin, handleLogout,
    toggleIngredient, toggleFoodWaste, handleGenerate, validateVoksenPin,
    handleClearAll,
    handleAddIngredient,
    userRoleDesc
  };
}
