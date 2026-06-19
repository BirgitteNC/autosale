import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Store, Plus, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

export default function StoreAdminView() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInStoreId, setLoggedInStoreId] = useState(null);
  
  const [pins, setPins] = useState([]);
  const [newPin, setNewPin] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRole, setNewRole] = useState('Voksen');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    supabase.from('stores').select('id, name').eq('is_active', true).then(({data}) => setStores(data || []));
  }, []);

  const fetchPins = async (storeId) => {
    const { data } = await supabase.from('store_pins').select('*').eq('store_id', storeId);
    if (data) setPins(data);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedStore) {
      setErrorMsg('Vælg en butik først.');
      return;
    }
    if (password.length !== 6) {
      setErrorMsg('Adgangskoden skal være præcis 6 cifre.');
      return;
    }

    setIsSubmitting(true);
    // Map Store ID to a virtual email for Supabase Auth
    const storeEmail = `store_${selectedStore}@meny.dk`;

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email: storeEmail, password: password });
        if (error) {
          setErrorMsg(error.message.includes('already registered') ? 'Butikken har allerede en kode. Skift til Log Ind.' : 'Kunne ikke oprette adgang.');
        } else {
          setIsAuthenticated(true);
          setLoggedInStoreId(selectedStore);
          fetchPins(selectedStore);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: storeEmail, password: password });
        if (error) {
          setErrorMsg('Forkert 6-cifret kode. Adgang nægtet.');
        } else {
          setIsAuthenticated(true);
          setLoggedInStoreId(selectedStore);
          fetchPins(selectedStore);
        }
      }
    } catch (err) {
      setErrorMsg('Netværksfejl.');
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setLoggedInStoreId(null);
    setPins([]);
  };

  const createPin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newPin || !newDesc || newPin.length !== 4) {
      setErrorMsg('PIN koden skal være præcis 4 cifre, og der skal være en beskrivelse.');
      return;
    }
    const fullDesc = `[${newRole}] ${newDesc}`;
    const { error } = await supabase.from('store_pins').insert([{ store_id: loggedInStoreId, pin_code: newPin, description: fullDesc }]);
    if (error) setErrorMsg('Fejl ved oprettelse. Måske er sikkerhedsregler ikke sat korrekt?');
    else {
      setNewPin('');
      setNewDesc('');
      fetchPins(loggedInStoreId);
    }
  };

  const deletePin = async (id) => {
    if (window.confirm('Er du sikker på du vil slette denne PIN kode?')) {
      await supabase.from('store_pins').delete().eq('id', id);
      fetchPins(loggedInStoreId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in flex-col items-center justify-center" style={{minHeight: '70vh', gap: '2rem', display: 'flex'}}>
        <div style={{background: 'var(--color-surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', maxWidth: '400px', width: '100%', borderTop: '4px solid var(--color-primary)'}}>
          <Store size={48} className="text-primary" style={{margin: '0 auto 1.5rem'}} />
          <h2 style={{marginBottom: '0.5rem', fontSize: '1.75rem'}}>Butikschef</h2>
          <p className="text-muted" style={{marginBottom: '2.5rem'}}>{isRegistering ? 'Opret din personlige 6-cifrede PIN' : 'Log ind for at administrere adgange'}</p>
          {errorMsg && <div style={{background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem'}}>{errorMsg}</div>}
          <form onSubmit={handleAuth} className="flex-col gap-4">
            <select 
              value={selectedStore} 
              onChange={(e) => setSelectedStore(e.target.value)}
              style={{padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%', fontSize: '1rem'}}
              required
            >
               <option value="" disabled>Vælg din butik</option>
               {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="6-cifret adgangskode"
              pattern="\d{6}"
              title="Koden skal være præcis 6 cifre"
              style={{padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%', fontSize: '1.25rem', letterSpacing: '0.2rem', textAlign: 'center'}}
              required
            />
            <label style={{display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'left'}}>
              <input type="checkbox" required style={{marginTop: '0.25rem', transform: 'scale(1.2)'}} />
              <span>Jeg accepterer hermed Antigravitys B2B vilkår, herunder at Dagrofa/butikken bærer ansvaret for korrekte fødevaredeklarationer og medarbejder-input, samt at platformens kildekode og data tilhører Antigravity.</span>
            </label>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full flex items-center justify-center gap-2" style={{marginTop: '1rem', padding: '1rem', opacity: isSubmitting ? 0.7 : 1}}>
              {isSubmitting && <Loader2 className="animate-spin" size={20} />}
              {isSubmitting ? 'Autentificerer...' : isRegistering ? 'Opret Adgang' : 'Log ind'}
            </button>
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); setPassword(''); }} style={{marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'}}>
               {isRegistering ? 'Har du allerede en adgangskode? Log ind' : 'Første gang? Opret din adgangskode her'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeStoreName = stores.find(s => s.id === loggedInStoreId)?.name;

  return (
    <div className="container animate-fade-in" style={{maxWidth: '800px', padding: '2rem 1rem'}}>
      <div className="flex items-center justify-between" style={{marginBottom: '3rem'}}>
         <div className="flex items-center gap-3">
           <ShieldCheck size={32} className="text-primary" />
           <div>
             <h1 style={{fontSize: '2rem'}}>{activeStoreName}</h1>
             <p className="text-muted">Lokal PIN-kode Administration</p>
           </div>
         </div>
         <button onClick={handleLogout} className="btn btn-outline">Log ud</button>
      </div>

      <div style={{background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem'}}>
        <h3 style={{marginBottom: '0.5rem'}}>Opret Ny Medarbejder-kode</h3>
        <p className="text-muted" style={{marginBottom: '1.5rem'}}>Opret en 4-cifret pinkode, så en specifik afdeling (f.eks. frugt/grønt) kan bruge iPad'en.</p>
        {errorMsg && <div style={{background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem'}}>{errorMsg}</div>}
        <form onSubmit={createPin} className="flex gap-4 items-end">
          <div style={{flex: 1}}>
            <label className="text-muted font-bold" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Beskrivelse / Afdeling</label>
            <input 
              type="text" 
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="F.eks. 'Morten - Grøntafdeling'"
              style={{width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'}}
            />
          </div>
          <div style={{width: '180px'}}>
            <label className="text-muted font-bold" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>Rettighed</label>
            <select 
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              style={{width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'}}
            >
              <option value="Voksen">Voksen (Fuld adgang)</option>
              <option value="Ungarbejder">Ungarbejder (Kræver godkendelse)</option>
            </select>
          </div>
          <div style={{width: '120px'}}>
            <label className="text-muted font-bold" style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem'}}>PIN (4 tal)</label>
            <input 
              type="text" 
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              style={{width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', letterSpacing: '0.1em'}}
            />
          </div>
          <button type="submit" className="btn btn-primary flex items-center gap-2" style={{padding: '0.75rem 1.5rem'}}>
            <Plus size={20} /> Opret
          </button>
        </form>
      </div>

      <div style={{background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden'}}>
         <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
           <thead>
             <tr style={{background: '#f8fafc', borderBottom: '1px solid var(--color-border)'}}>
               <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)'}}>Beskrivelse</th>
               <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)'}}>PIN Kode</th>
               <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)'}}>Oprettet</th>
               <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)', textAlign: 'right'}}>Handling</th>
             </tr>
           </thead>
           <tbody>
             {pins.map(pinObj => {
               let displayDesc = pinObj.description || '';
               let role = 'Voksen';
               if (displayDesc.startsWith('[Ungarbejder] ')) {
                 role = 'Ungarbejder';
                 displayDesc = displayDesc.replace('[Ungarbejder] ', '');
               } else if (displayDesc.startsWith('[Voksen] ')) {
                 displayDesc = displayDesc.replace('[Voksen] ', '');
               }
               
               return (
               <tr key={pinObj.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                 <td style={{padding: '1rem 1.5rem'}}>
                   <div style={{fontWeight: 'bold'}}>{displayDesc}</div>
                   <div style={{fontSize: '0.8rem', color: role === 'Voksen' ? 'var(--color-primary)' : 'var(--color-warning)', fontWeight: 'bold'}}>{role}</div>
                 </td>
                 <td style={{padding: '1rem 1.5rem', letterSpacing: '0.1em', fontFamily: 'monospace', fontSize: '1.125rem'}}>{pinObj.pin_code}</td>
                 <td style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)'}}>
                    {new Date(pinObj.created_at).toLocaleDateString('da-DK')}
                 </td>
                 <td style={{padding: '1rem 1.5rem', textAlign: 'right'}}>
                    <button 
                      onClick={() => deletePin(pinObj.id)}
                      className="btn"
                      style={{background: 'transparent', color: 'var(--color-danger)', border: 'none', cursor: 'pointer', padding: '0.5rem'}}
                      title="Slet PIN adgang"
                    >
                      <Trash2 size={20}/>
                    </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
         {pins.length === 0 && <div style={{padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)'}}>Ingen PIN koder oprettet for denne butik endnu.</div>}
      </div>
    </div>
  );
}
