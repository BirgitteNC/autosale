import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { apiRequest } from '../../../shared/api/apiClient';

export function useStoreAdmin() {
  const [stores, setStores] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInStoreId, setLoggedInStoreId] = useState(null);
  
  const [pins, setPins] = useState([]);
  const [topRecipes, setTopRecipes] = useState([]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await apiRequest(supabase.from('stores').select('id, name'));
      if (data) setStores(data);
    };
    fetchStores();
  }, []);

  const fetchPins = async (storeId) => {
    // Vi henter IKKE pin_hash! Den er hemmelig.
    const { data } = await apiRequest(
      supabase.from('staff_credentials')
        .select('id, description, role, created_at')
        .eq('store_id', storeId)
        .eq('is_active', true)
    );
    if (data) setPins(data);
  };

  const fetchTopRecipes = async (storeId) => {
    const { data: scans, error } = await apiRequest(
       supabase.from('recipe_scans').select('recipe_id').eq('store_id', storeId).limit(2000)
    );
    if (error || !scans) return;
    
    const counts = {};
    scans.forEach(scan => {
       counts[scan.recipe_id] = (counts[scan.recipe_id] || 0) + 1;
    });
    
    const topIds = Object.keys(counts).sort((a,b) => counts[b] - counts[a]).slice(0, 5);
    if (topIds.length === 0) {
       setTopRecipes([]);
       return;
    }
    
    const { data: recipesData } = await apiRequest(
       supabase.from('recipes').select('id, titel, billed_url').in('id', topIds)
    );
    
    if (recipesData) {
       const merged = recipesData.map(r => ({...r, scans: counts[r.id] })).sort((a,b) => b.scans - a.scans);
       setTopRecipes(merged);
    }
  };

  const handleAuth = async (storeId, password) => {
    setErrorMsg('');
    setIsSubmitting(true);
    const store = stores.find(s => s.id === storeId);
    let domain = 'meny.dk';
    if (store && store.name) {
       const lowerName = store.name.toLowerCase();
       if (lowerName.includes('spar')) domain = 'spar.dk';
       else if (lowerName.includes('købmand')) domain = 'minkobmand.dk';
    }
    const storeEmail = `store_${storeId}@${domain}`;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email: storeEmail, password: password });
      if (error) {
        setErrorMsg('Forkert 6-cifret kode. Adgang nægtet.');
      } else {
        setIsAuthenticated(true);
        setLoggedInStoreId(storeId);
        
        try {
          localStorage.setItem('staff_store_id', storeId);
        } catch {
          // Ignorer hvis localStorage ikke er tilgængelig
        }

        fetchPins(storeId);
        fetchTopRecipes(storeId);
      }
    } catch {
      setErrorMsg('Netværksfejl.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    
    // Slet session cookien for sikkerheds skyld
    try {
      await fetch('/api/staff/logout', { method: 'POST' });
    } catch {
      console.warn('Netværksfejl under logout');
    }

    setIsAuthenticated(false);
    setLoggedInStoreId(null);
    setPins([]);
  };

  const createPin = async (newDesc, newRole, newPin) => {
    setErrorMsg('');
    const internalRole = newRole === 'Voksen' ? 'adult' : 'young_worker';
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Ingen aktiv session');
      
      const response = await fetch('/api/admin/create_credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          storeId: loggedInStoreId,
          pin: newPin,
          role: internalRole,
          description: newDesc
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fejl ved oprettelse.');
      }
      
      fetchPins(loggedInStoreId);
      return true;
    } catch (error) {
      setErrorMsg(error.message || 'Fejl ved oprettelse. Måske er sikkerhedsregler ikke sat korrekt?');
      return false;
    }
  };

  const deletePin = async (id) => {
    await apiRequest(
       supabase.from('staff_credentials').update({ is_active: false }).eq('id', id)
    );
    fetchPins(loggedInStoreId);
  };

  return {
    stores,
    isAuthenticated,
    loggedInStoreId,
    pins,
    topRecipes,
    errorMsg,
    setErrorMsg,
    isSubmitting,
    handleAuth,
    handleLogout,
    createPin,
    deletePin
  };
}
