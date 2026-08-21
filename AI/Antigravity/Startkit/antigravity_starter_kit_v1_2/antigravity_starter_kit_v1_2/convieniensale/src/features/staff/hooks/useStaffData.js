import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { apiRequest } from '../../../shared/api/apiClient';
import { validateBundle } from '../../../utils/rankRecipes';
import { shouldAcceptRemotePromotion } from '../utils/promotionDraft';

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
  const draftDirtyRef = useRef(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('staff_store_id');
      localStorage.removeItem('staff_user_role');
      localStorage.removeItem('staff_role_desc');
      localStorage.removeItem('staff_voksen_unlock');
      localStorage.removeItem('staff_login_time');
      localStorage.removeItem('staff_department');
    } catch {
      console.warn('localStorage er blokeret under logout');
    }
    
    // Kald server-side logout for at slette HttpOnly cookie
    try {
      await fetch('/api/staff/logout', { method: 'POST' });
    } catch {
      console.warn('Netværksfejl under logout');
    }

    setStoreId(null);
    setUserRole('Voksen');
    setUserRoleDesc('');
    setVoksenUnlockUntil(0);
    setSelectedIds([]);
    setFoodWasteIds([]);
    draftDirtyRef.current = false;
  };

  // Hent butikker til login skærmen
  useEffect(() => {
    if (!storeId) {
      const fetchStores = async () => {
        try {
          const { data } = await apiRequest(supabase.from('stores').select('id, name'));
          if (data) setAvailableStores(data);
        } catch {
          window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Kunne ikke hente butiksliste. Tjek forbindelsen.' }));
        }
      };
      fetchStores();
    }
  }, [storeId]);

  // Tjek om sessionen er udløbet (8 timer)
  useEffect(() => {
    const loginTime = localStorage.getItem('staff_login_time');
    if (loginTime) {
      const hoursSinceLogin = (Date.now() - parseInt(loginTime, 10)) / (1000 * 60 * 60);
      if (hoursSinceLogin >= 8) {

        handleLogout();
        window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Din session er udløbet (8 timer). Log venligst ind igen.' }));
      }
    }
  }, []);

  const isAuthenticated = !!storeId;

  // Hent varer via vores super-optimerede SQL view (ingen client-side JSON tælling længere)
  useEffect(() => {
    if (isAuthenticated) {
      let isFetchingPromotions = false;
      
      const fetchCatalog = async () => {
        try {
          const { data: catalogData } = await apiRequest(supabase.from('staff_ingredient_catalog').select('*'));
          if (catalogData) {
            const counts = {};
            catalogData.forEach(item => counts[item.id] = parseInt(item.active_recipe_count, 10));
            setRecipeCounts(counts);
            setIngredients(catalogData);
          }
        } catch {
           window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Fejl ved indlæsning af varer. Prøv at genindlæse siden.' }));
        }
      };

      const syncPromotions = async () => {
        if (isFetchingPromotions) return;
        isFetchingPromotions = true;
        try {
          const { data: promoData } = await apiRequest(supabase.from('active_promotions').select('*').eq('store_id', storeId).single());
          if (promoData && shouldAcceptRemotePromotion(draftDirtyRef.current)) {
             setSelectedIds(promoData.selected_ingredients || []);
             setFoodWasteIds(promoData.food_waste_ingredients || []);
          }
        } catch (error) {
           console.warn('Ingen eksisterende tilbud fundet eller fejl ved hentning', error);
        } finally {
          isFetchingPromotions = false;
        }
      };

      fetchCatalog();
      syncPromotions();
      
      // Lyt efter live-ændringer fra andre terminals/afdelinger!
      const channel = supabase.channel('staff_active_promotions')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'active_promotions', 
          filter: `store_id=eq.${storeId}` 
        }, 
        (payload) => {
          if (payload.new && shouldAcceptRemotePromotion(draftDirtyRef.current)) {
            setSelectedIds(payload.new.selected_ingredients || []);
            setFoodWasteIds(payload.new.food_waste_ingredients || []);
          }
        })
        .subscribe((status) => {
           if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
               // Fallback: Hent nyeste data via REST ved tabt WebSocket-forbindelse
               syncPromotions();
           }
        });

      // Lyt efter netværksændringer
      const handleOnline = () => syncPromotions();
      window.addEventListener('online', handleOnline);

      // Periodisk fallback-opdatering
      const fallbackInterval = setInterval(() => {
        syncPromotions();
      }, 60000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(fallbackInterval);
        window.removeEventListener('online', handleOnline);
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

    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: selectedLoginStore, pin: trimmedPin })
      });

      if (response.ok) {
        const result = await response.json();
        const role = result.role === 'young_worker' ? 'Ungarbejder' : 'Voksen';
        const roleDesc = role === 'Ungarbejder' ? '[Ungarbejder] Begrænset adgang' : '[Admin] Fuld adgang';
        
        try {
          localStorage.setItem('staff_store_id', selectedLoginStore);
          // VIGTIGT: PIN GEMMES IKKE I LOCALSTORAGE MERE! Cookien holder sessionen.
          localStorage.setItem('staff_user_role', role);
          localStorage.setItem('staff_role_desc', roleDesc);
          localStorage.setItem('staff_login_time', Date.now().toString());
          if (result.department) {
            localStorage.setItem('staff_department', result.department);
          } else {
            localStorage.removeItem('staff_department');
          }
        } catch {
          // Ignorer fejl
        }
        
        setStoreId(selectedLoginStore);
        draftDirtyRef.current = false;
        setUserRole(role);
        setUserRoleDesc(roleDesc);
        setPinError(false);
      } else {
        await response.json(); // Læs for at konsumere body
        if (response.status === 429) {
           window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'For mange mislykkede forsøg. Vent venligst.' }));
        }
        setPinError(true);
        setPin('');
      }
    } catch {
      setPinError(true);
      setPin('');
    }
    
    setIsSubmitting(false);
  };

  const toggleIngredient = (id) => {
    if (selectedIds.includes(id)) {
      draftDirtyRef.current = true;
      setSelectedIds(prev => prev.filter(i => i !== id));
      setFoodWasteIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 6) {
        window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Du kan maksimalt vælge 6 varer ad gangen.' }));
        return;
      }
      draftDirtyRef.current = true;
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const toggleFoodWaste = (id) => {
    const isWaste = foodWasteIds.includes(id);
    const isSelected = selectedIds.includes(id);

    if (isWaste) {
      draftDirtyRef.current = true;
      setFoodWasteIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 6 && !isSelected) {
        window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Du kan maksimalt vælge 6 varer ad gangen.' }));
        return;
      }
      draftDirtyRef.current = true;
      if (!isSelected) {
        setSelectedIds(prev => {
          if (!prev.includes(id)) return [...prev, id];
          return prev;
        });
      }
      setFoodWasteIds(prev => {
        if (!prev.includes(id)) return [...prev, id];
        return prev;
      });
    }
  };

  const validateVoksenPin = async (pinToCheck) => {
    if (!navigator.onLine) {
       window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Ingen internetforbindelse - prøv igen.' }));
       return false;
    }
    
    try {
      const response = await fetch('/api/staff/validate_pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ storeId, pin: pinToCheck })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.role === 'young_worker') return false; 
        
        return result.approvalToken || true;
      }
    } catch (error) {
      console.error(error);
    }
    
    return false;
  };

  const handleGenerate = async (approvalToken = null) => {
    if (!storeId || isSubmitting) return;
    if (!navigator.onLine) {
       window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Ingen internetforbindelse - prøv igen.' }));
       return;
    }

    // Streng validering af input
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
    
    // VALIDERING AF BUNDT — afvis INDEN API-kald så skærmen aldrig modtager ugyldige data
    if (validSelectedIds.length > 1) {
        try {
          const { data: rawRecipes } = await apiRequest(supabase.from('recipes').select('ingredienser, beskrivelse'));
          const allRecipes = rawRecipes ? rawRecipes.filter(r => r.beskrivelse !== 'Importeret fra Meny') : null;

          if (allRecipes && !validateBundle(validSelectedIds, allRecipes)) {
              setIsSubmitting(false);
              return 'NO_RECIPE_MATCH';
          }
        } catch {
          setIsSubmitting(false);
          return 'NO_RECIPE_MATCH';
        }
    }

    try {
       const response = await fetch('/api/update_promotions', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'same-origin',
         body: JSON.stringify({
           selectedIds: validSelectedIds,
           foodWasteIds: validFoodWasteIds,
           approvalToken: approvalToken
         })
       });
       
       if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Server error');
       }
       
       setShowSuccess(true);
       draftDirtyRef.current = false;
       setIsSubmitting(false);
       setTimeout(() => setShowSuccess(false), 3000);
       return 'SUCCESS';
    } catch(err) {
       console.error("Fejl ved opdatering:", err);
       window.dispatchEvent(new CustomEvent('staff-toast', { detail: `Sikkerhedsfejl: Kunne ikke opdatere tilbud (${err.message}).` }));
       setIsSubmitting(false);
       return 'ERROR';
    }
  };
  
  const handleClearAll = async (approvalToken = null) => {
     setIsSubmitting(true);
     
     try {
        const response = await fetch('/api/update_promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          selectedIds: [],
          foodWasteIds: [],
          approvalToken: approvalToken
        })
      });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Sikkerhedsfejl eller manglende rettigheder");
        }
        setSelectedIds([]);
        setFoodWasteIds([]);
        draftDirtyRef.current = false;
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        return 'SUCCESS';
     } catch(err) {
        console.error("Fejl ved sletning:", err);
        window.dispatchEvent(new CustomEvent('staff-toast', { detail: `Kunne ikke rydde varer (${err.message}). Dine valg er bevaret.` }));
        return 'ERROR';
     } finally {
        setIsSubmitting(false);
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
    userRoleDesc
  };
}
