import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShieldAlert, Plus, PowerOff, Power, Loader2 } from 'lucide-react';

export default function SuperAdminView() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stores, setStores] = useState([]);
  const [newStoreName, setNewStoreName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchStores = async () => {
    const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
    if (data) setStores(data);
  };

  useEffect(() => {
    // Tjek om vi allerede har en aktiv Supabase Auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user.email === 'superadmin@antigravity.dk') {
         setIsAuthenticated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchStores();
  }, [isAuthenticated]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (password.length !== 6) return setErrorMsg('Adgangskoden skal være præcis 6 cifre.');

    setIsSubmitting(true);
    const superEmail = 'superadmin@antigravity.dk';

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({ email: superEmail, password: password });
        if (error) setErrorMsg(error.message.includes('already registered') ? 'Allerede oprettet. Skift til Log Ind.' : 'Kunne ikke oprette.');
        else setIsAuthenticated(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: superEmail, password: password });
        if (error) setErrorMsg('Forkert 6-cifret kode.');
        else setIsAuthenticated(true);
      }
    } catch (err) {
      setErrorMsg('Netværksfejl.');
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const createStore = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newStoreName) return;
    const { error } = await supabase.from('stores').insert([{ name: newStoreName }]);
    if (error) setErrorMsg('Fejl ved oprettelse');
    else setNewStoreName('');
    fetchStores();
  };

  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase.from('stores').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchStores();
  };

  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in flex-col items-center justify-center" style={{minHeight: '70vh', gap: '2rem', display: 'flex'}}>
        <div style={{background: 'var(--color-surface)', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', maxWidth: '400px', width: '100%', borderTop: '4px solid var(--color-danger)'}}>
          <ShieldAlert size={48} className="text-danger" style={{margin: '0 auto 1.5rem'}} />
          <h2 style={{marginBottom: '0.5rem', fontSize: '1.75rem'}}>The Boardroom</h2>
          <p className="text-muted" style={{marginBottom: '2.5rem'}}>{isRegistering ? 'Opret Master PIN' : 'Super Admin Access'}</p>
          {errorMsg && <div style={{background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem'}}>{errorMsg}</div>}
          <form onSubmit={handleAuth} className="flex-col gap-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="6-cifret PIN"
              pattern="\d{6}"
              style={{padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%', fontSize: '1.25rem', letterSpacing: '0.2rem', textAlign: 'center'}}
              autoFocus
              required
            />
            <button type="submit" disabled={isSubmitting} className="btn w-full flex items-center justify-center gap-2" style={{background: 'var(--color-danger)', color: 'white', marginTop: '1rem', padding: '1rem', opacity: isSubmitting ? 0.7 : 1}}>
              {isSubmitting && <Loader2 className="animate-spin" size={20} />}
              {isSubmitting ? 'Autentificerer...' : isRegistering ? 'Opret Adgang' : 'Log ind'}
            </button>
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setErrorMsg(''); setPassword(''); }} style={{marginTop: '1rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline'}}>
               {isRegistering ? 'Har du allerede en PIN? Log ind' : 'Første gang? Opret Master PIN'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{maxWidth: '900px', padding: '2rem 1rem'}}>
      <div className="flex items-center justify-between" style={{marginBottom: '3rem'}}>
         <div className="flex items-center gap-3">
           <ShieldAlert size={32} className="text-danger" />
           <div>
             <h1 style={{fontSize: '2rem'}}>The Boardroom</h1>
             <p className="text-muted">Global Licens- & Butiksstyring</p>
           </div>
         </div>
         <button onClick={handleLogout} className="btn btn-outline text-danger">Log ud</button>
      </div>

      <div style={{background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem'}}>
        <h3 style={{marginBottom: '1rem'}}>Opret Ny Kunde (Butik)</h3>
        {errorMsg && <div style={{background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem'}}>{errorMsg}</div>}
        <form onSubmit={createStore} className="flex gap-2">
          <input 
            type="text" 
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            placeholder="F.eks. Meny Nordhavn"
            style={{flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)'}}
          />
          <button type="submit" className="btn btn-primary flex items-center gap-2">
            <Plus size={20} /> Opret Butik
          </button>
        </form>
      </div>

      <div style={{background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden'}}>
         <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
           <thead>
             <tr style={{background: '#f8fafc', borderBottom: '1px solid var(--color-border)'}}>
               <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)'}}>Butiksnavn</th>
               <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)'}}>Oprettet</th>
               <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)'}}>Licens Status</th>
               <th style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)', textAlign: 'right'}}>Handling</th>
             </tr>
           </thead>
           <tbody>
             {stores.map(store => (
               <tr key={store.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                 <td style={{padding: '1rem 1.5rem', fontWeight: 'bold'}}>{store.name}</td>
                 <td style={{padding: '1rem 1.5rem', color: 'var(--color-text-muted)'}}>
                    {new Date(store.created_at).toLocaleDateString('da-DK')}
                 </td>
                 <td style={{padding: '1rem 1.5rem'}}>
                    {store.is_active ? 
                      <span style={{background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 'bold'}}>Aktiv</span> : 
                      <span style={{background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.875rem', fontWeight: 'bold'}}>Lukket</span>
                    }
                 </td>
                 <td style={{padding: '1rem 1.5rem', textAlign: 'right'}}>
                    <button 
                      onClick={() => toggleActive(store.id, store.is_active)}
                      className="btn"
                      style={{
                        background: store.is_active ? '#fee2e2' : '#dcfce7',
                        color: store.is_active ? '#dc2626' : '#16a34a',
                        padding: '0.5rem 1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 'bold'
                      }}
                    >
                      {store.is_active ? <><PowerOff size={16}/> Sluk Adgang</> : <><Power size={16}/> Åbn Adgang</>}
                    </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
         {stores.length === 0 && <div style={{padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)'}}>Ingen butikker fundet.</div>}
      </div>
    </div>
  );
}
