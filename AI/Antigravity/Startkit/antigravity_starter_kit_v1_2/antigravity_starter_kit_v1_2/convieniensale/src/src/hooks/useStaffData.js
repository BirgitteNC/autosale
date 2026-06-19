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
  const [voksenUnlockUntil, setVoksenUnlockUntil] = useState(parseInt(localStorage.getItem('staff_voksen_unlock') || '0', 10));
  const [pinError, setPinError] = useState(false);
  
  const [ingredients, setIngredients] = useState([]);
  const [recipeCounts, setRecipeCounts] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [foodWasteIds, setFoodWasteIds] = useState([]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('staff_store_id');
    localStorage.removeItem('staff_store_pin');
    localStorage.removeItem('staff_user_role');
    localStorage.removeItem('staff_voksen_unlock');
    localStorage.removeItem('staff_login_time');
    setStoreId(null);
    setUserRole('Voksen');
    setVoksenUnlockUntil(0);
    setSelectedIds([]);
    setFoodWasteIds([]);
  };

  // Hent butikker til login skærmen
  useEffect(() => {
    if (!storeId) {
      supabase.from('stores').select('id, name').eq('is_active', true).then(({data}) => {
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
          supabase.from('recipes').select('ingredienser').then(({data: recData}) => {
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
  }, [isAuthenticated, storeId, isSubmitting]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedLoginStore) {
       setPinError(true);
       return;
    }
    setIsSubmitting(true);
    const { data, error } = await supabase.from('store_pins').select('store_id, description').eq('store_id', selectedLoginStore).eq('pin_code', pin).single();
    
    if (data && !error) {
      let role = 'Voksen';
      if (data.description && data.description.startsWith('[Ungarbejder]')) {
        role = 'Ungarbejder';
      }
      
      localStorage.setItem('staff_store_id', data.store_id);
      localStorage.setItem('staff_store_pin', pin);
      localStorage.setItem('staff_user_role', role);
      localStorage.setItem('staff_login_time', Date.now().toString());
      setStoreId(data.store_id);
      setUserRole(role);
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
        setSelectedIds(sel => sel.includes(id) ? sel : [...sel, id]);
        return [...prev, id];
      }
    });
  };

  const validateVoksenPin = async (pinToCheck) => {
    const { data, error } = await supabase.from('store_pins').select('description').eq('store_id', storeId).eq('pin_code', pinToCheck).single();
    if (data && !error) {
      if (data.description && data.description.startsWith('[Ungarbejder]')) return false;
      // Godkendt voksen. Lås op i 10 minutter!
      const unlockTime = Date.now() + 10 * 60 * 1000;
      localStorage.setItem('staff_voksen_unlock', unlockTime.toString());
      setVoksenUnlockUntil(unlockTime);
      return true;
    }
    return false;
  };

  const handleGenerate = async (overridePin = null) => {
    if (!storeId || isSubmitting) return;

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
    
    const savedPin = overridePin || localStorage.getItem('staff_store_pin') || pin;
    try {
       const { error } = await supabase.rpc('update_store_promotions', {
         p_store_id: storeId,
         p_pin: savedPin,
         p_selected_ids: validSelectedIds,
         p_food_waste_ids: validFoodWasteIds
       });
       
       if (error) throw new Error("Sikkerhedsfejl eller forkert PIN");
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
    handleAddIngredient
  };
}
