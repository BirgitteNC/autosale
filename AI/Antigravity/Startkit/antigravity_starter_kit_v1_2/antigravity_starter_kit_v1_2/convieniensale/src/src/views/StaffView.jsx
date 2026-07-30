import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, PackageSearch, Lock, Search, Mic, MicOff, Trash2, Clock, Target, Loader2 } from 'lucide-react';
import { useStaffData } from '../hooks/useStaffData';

export default function StaffView() {
  const {
    isAuthenticated,
    pin, setPin, pinError,
    availableStores, selectedLoginStore, setSelectedLoginStore,
    ingredients, recipeCounts,
    selectedIds, foodWasteIds,
    showSuccess, isSubmitting, userRole, validateVoksenPin, voksenUnlockUntil,
    handleLogin, handleLogout,
    toggleIngredient, toggleFoodWaste, handleGenerate,
    handleClearAll, userRoleDesc
  } = useStaffData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Alle');
  const [isListening, setIsListening] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  // eslint-disable-next-line react-hooks/purity
  const [isTemporarilyUnlocked, setIsTemporarilyUnlocked] = useState(Date.now() < voksenUnlockUntil);
  const tabsRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
       setIsTemporarilyUnlocked(Date.now() < voksenUnlockUntil);
    }, 10000);
    return () => clearInterval(interval);
  }, [voksenUnlockUntil]);

  const handleVoiceSearch = () => {
    setToastMessage("Stemmegenkendelse er deaktiveret af sikkerheds- og GDPR-hensyn.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const handleToast = (e) => {
       setToastMessage(e.detail);
       setTimeout(() => setToastMessage(null), 3000);
    };
    window.addEventListener('staff-toast', handleToast);
    return () => window.removeEventListener('staff-toast', handleToast);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="animate-fade-in flex-col items-center justify-center" style={{minHeight: '100vh', background: 'radial-gradient(circle at top right, #1e293b, #0f172a)', color: 'white', display: 'flex'}}>
        <div style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', padding: '4rem 3rem', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center', maxWidth: '420px', width: '100%'}}>
          <Lock size={56} style={{margin: '0 auto 1.5rem', color: '#38bdf8'}} />
          <h2 style={{marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800', fontFamily: 'Outfit, sans-serif'}}>Medarbejder Login</h2>
          <p style={{marginBottom: '2.5rem', fontSize: '1.1rem', color: '#94a3b8'}}>Vælg butik og indtast PIN-kode for at aktivere terminalen.</p>
          
          <form onSubmit={handleLogin} className="flex-col gap-4">
            <select 
              value={selectedLoginStore} 
              onChange={(e) => setSelectedLoginStore(e.target.value)}
              style={{
                fontSize: '1.1rem', 
                padding: '1rem', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                outline: 'none',
                marginBottom: '1rem',
                width: '100%'
              }}
            >
              <option value="" disabled style={{color: 'black'}}>Vælg din butik</option>
              {availableStores.map(s => <option key={s.id} value={s.id} style={{color: 'black'}}>{s.name}</option>)}
            </select>

            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN-KODE (4 cifre)"
              maxLength={4}
              style={{
                fontSize: '2rem', 
                padding: '1rem', 
                borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                textAlign: 'center',
                letterSpacing: '0.5rem',
                outline: 'none',
                transition: 'border-color 0.3s',
                width: '100%'
              }}
              onFocus={(e) => e.target.style.borderColor = '#38bdf8'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
            {pinError && <p style={{color: '#f87171', marginTop: '0.5rem', fontWeight: '600'}}>Ugyldig butik eller PIN-kode</p>}
            <button type="submit" disabled={isSubmitting} style={{
              marginTop: '1.5rem', padding: '1.25rem', fontSize: '1.25rem', fontWeight: 'bold', 
              borderRadius: '16px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', 
              color: 'white', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', 
              boxShadow: '0 10px 20px -5px rgba(14, 165, 233, 0.5)', transition: 'transform 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              opacity: isSubmitting ? 0.7 : 1, width: '100%'
            }}
            onMouseOver={(e) => { if (!isSubmitting) e.target.style.transform = 'translateY(-2px)' }}
            onMouseOut={(e) => { if (!isSubmitting) e.target.style.transform = 'translateY(0)' }}
            >
              {isSubmitting && <Loader2 className="animate-spin" size={24} />}
              {isSubmitting ? 'Låser op...' : 'Lås op'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredIngredients = ingredients.filter(ing => 
    ing.navn.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (ing.kategori && ing.kategori.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedIngredients = filteredIngredients.reduce((acc, ing) => {
    const kat = ing.kategori || 'Andre';
    if (!acc[kat]) acc[kat] = [];
    acc[kat].push(ing);
    return acc;
  }, {});

  const categories = Object.keys(groupedIngredients).sort((a, b) => {
    // Fjern "[Voksen]" eller "[Ungarbejder]" fra rollen for at finde selve afdelingen
    const desc = (userRoleDesc || '').toLowerCase().replace(/\[.*?\]\s*/, '');
    
    // Simpel string matching for at rykke matchende afdelinger i toppen
    const aMatch = desc && (desc.includes(a.toLowerCase().split(/\s+/)[0]) || a.toLowerCase().includes(desc.split(/\s+/)[0]));
    const bMatch = desc && (desc.includes(b.toLowerCase().split(/\s+/)[0]) || b.toLowerCase().includes(desc.split(/\s+/)[0]));
    
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="animate-fade-in" style={{paddingBottom: '120px', background: 'radial-gradient(circle at top left, #1e293b, #020617)', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, sans-serif'}}>
      <div className="container" style={{maxWidth: '1000px', padding: '3rem 1.5rem'}}>
        
        {/* Header Section */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem'}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
             <div style={{background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', padding: '12px', borderRadius: '16px', boxShadow: '0 8px 16px -4px rgba(56, 189, 248, 0.4)'}}>
               <PackageSearch size={32} color="white" />
             </div>
             <div>
               <h2 style={{fontSize: '2rem', margin: 0, fontFamily: 'Outfit, sans-serif', fontWeight: '800', letterSpacing: '-0.5px'}}>Salgsstyring</h2>
               <p style={{color: '#94a3b8', margin: 0, fontSize: '1rem'}}>Vælg Fokusvarer & Datovarer på tværs af butikken</p>
             </div>
           </div>
           <div style={{display: 'flex', gap: '1rem'}}>
             <button onClick={handleClearAll} style={{padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}
             onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
             onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
             >
               Ryd alt <Trash2 size={18} />
             </button>
             <button onClick={handleLogout} style={{padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}
             onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
             onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
             >
               Log ud <Lock size={18} />
             </button>
           </div>
        </div>

        {/* Info Banner */}
        <div style={{background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), transparent)', borderLeft: '4px solid #10b981', padding: '1.5rem', borderRadius: '0 16px 16px 0', marginBottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'flex-start'}}>
          <Target color="#10b981" size={24} style={{flexShrink: 0}} />
          <div>
            <h4 style={{margin: '0 0 0.5rem 0', color: '#34d399', fontSize: '1.1rem'}}>Mersalg</h4>
            <p style={{margin: 0, color: '#cbd5e1', lineHeight: '1.6'}}>
              Tryk på et varekort for at markere den som en <strong>Fokusvare</strong> (varer vi vil sælge mere af). <br/>
              Tryk på ur-ikonet (<Clock size={14} style={{display:'inline', color:'#f97316'}}/>) for at markere den specifikt som en <strong>Datovare</strong>. Systemet kombinerer automatisk dine valg på tværs af afdelinger!
            </p>
          </div>
        </div>

        {/* Search & Add Section */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '3rem'}}>
          <div style={{flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '0.75rem 1.5rem', backdropFilter: 'blur(10px)'}}>
            <Search size={22} color="#94a3b8" style={{marginRight: '1rem'}} />
            <input 
              type="text" 
              placeholder="Søg efter råvarer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '1.1rem', color: 'white'}}
            />
          </div>
          <button 
            onClick={handleVoiceSearch}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              padding: '0 1.5rem', borderRadius: '16px',
              background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
              border: `1px solid ${isListening ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
              color: isListening ? '#fca5a5' : 'white',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            {isListening ? <MicOff size={24} className="animate-pulse" /> : <Mic size={24} />}
          </button>
        </div>

        {/* Department Tabs */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => scrollTabs(-1)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '50%', width: '40px', height: '40px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer',
                flexShrink: 0, transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <ChevronLeft size={20} />
            </button>
            <div 
              ref={tabsRef}
              style={{
                display: 'flex', gap: '0.5rem', overflowX: 'auto', 
                paddingBottom: '0.5rem', scrollbarWidth: 'none', flex: 1,
                scrollBehavior: 'smooth'
              }}
            >
              <button
                onClick={() => setActiveTab('Alle')}
                style={{
                  padding: '0.75rem 1.5rem', borderRadius: '24px', whiteSpace: 'nowrap',
                  background: activeTab === 'Alle' ? 'linear-gradient(135deg, #38bdf8, #3b82f6)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'Alle' ? 'white' : '#94a3b8',
                  border: activeTab === 'Alle' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontWeight: activeTab === 'Alle' ? 'bold' : 'normal',
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'Alle' ? '0 4px 12px rgba(56, 189, 248, 0.3)' : 'none'
                }}
              >
                Alle afdelinger
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '24px', whiteSpace: 'nowrap',
                    background: activeTab === cat ? 'linear-gradient(135deg, #38bdf8, #3b82f6)' : 'rgba(255,255,255,0.05)',
                    color: activeTab === cat ? 'white' : '#94a3b8',
                    border: activeTab === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    fontWeight: activeTab === cat ? 'bold' : 'normal',
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === cat ? '0 4px 12px rgba(56, 189, 248, 0.3)' : 'none'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button 
              onClick={() => scrollTabs(1)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '50%', width: '40px', height: '40px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer',
                flexShrink: 0, transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Grid List */}
        {ingredients.length === 0 ? (
           <div style={{textAlign: 'center', padding: '5rem', color: '#94a3b8', fontSize: '1.2rem'}}>Synkroniserer med hovedlageret...</div>
        ) : categories.length === 0 ? (
           <div style={{textAlign: 'center', padding: '5rem', color: '#64748b', fontSize: '1.2rem'}}>Ingen varer matchede din søgning.</div>
        ) : (
          <div className="flex-col gap-8">
            {(activeTab === 'Alle' ? categories : categories.filter(c => c === activeTab)).map(category => (
              <div key={category} style={{marginBottom: '2rem'}}>
                <h3 style={{marginBottom: '1.5rem', color: '#f8fafc', fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  {category}
                  <div style={{flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)'}}></div>
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem'}}>
                  {groupedIngredients[category].map(ing => {
                    const isSelected = selectedIds.includes(ing.id);
                    const isFoodWaste = foodWasteIds.includes(ing.id);
                    const count = recipeCounts[ing.id] || 0;
                    const isDisabled = count === 0;

                    return (
                      <div 
                        key={ing.id}
                        onClick={() => { 
                          if(!isDisabled) toggleIngredient(ing.id);
                          else {
                            setToastMessage("Ingen opskrifter for denne vare");
                            setTimeout(() => setToastMessage(null), 3000);
                          }
                        }}
                        style={{
                          background: isDisabled ? 'rgba(255,255,255,0.02)' : isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))' : 'rgba(255,255,255,0.05)', 
                          border: isSelected ? '1px solid #10b981' : isDisabled ? '1px dashed rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)', 
                          opacity: isDisabled ? 0.3 : 1, 
                          padding: '1.25rem 1rem', 
                          borderRadius: '16px', 
                          cursor: isDisabled ? 'not-allowed' : 'pointer', 
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', 
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                          minHeight: '120px', position: 'relative',
                          backdropFilter: 'blur(10px)',
                          boxShadow: isSelected ? '0 10px 20px -5px rgba(16, 185, 129, 0.2)' : 'none',
                          transform: isSelected ? 'translateY(-4px)' : 'none'
                        }}
                        onMouseOver={e => { if(!isDisabled && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                        onMouseOut={e => { if(!isDisabled && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      >
                        {!isDisabled && (
                          <div 
                            style={{
                              position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                              width: '32px', height: '32px', borderRadius: '10px',
                              background: isFoodWaste ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(0,0,0,0.3)',
                              border: isFoodWaste ? 'none' : '1px solid rgba(255,255,255,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s', boxShadow: isFoodWaste ? '0 4px 10px rgba(249, 115, 22, 0.3)' : 'none'
                            }} 
                            onClick={(e) => { e.stopPropagation(); toggleFoodWaste(ing.id); }}
                            title={isFoodWaste ? "Fjern Datovare-status" : "Marker som Datovare (Udløber snart)"}
                          >
                            <Clock size={18} color={isFoodWaste ? 'white' : 'rgba(255,255,255,0.4)'} />
                          </div>
                        )}
                        <div style={{fontWeight: isSelected ? '700' : '500', color: isSelected ? '#10b981' : '#e2e8f0', zIndex: 5, pointerEvents: 'none', marginTop: '10px'}}>
                          {ing.navn}
                        </div>
                        {isSelected && (
                           <div style={{fontSize: '0.75rem', color: '#34d399', marginTop: '0.5rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}}>Fokusvare</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Glassmorphism Sticky Footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)',
        padding: '1.5rem 3rem', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.3)'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
          <div style={{background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}}>
            <span style={{fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8', marginRight: '0.5rem'}}>{selectedIds.length}</span>
            <span style={{color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem'}}>Fokusvarer Valgt</span>
          </div>
          <div style={{background: 'rgba(249, 115, 22, 0.1)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.2)'}}>
            <span style={{fontSize: '1.5rem', fontWeight: '800', color: '#f97316', marginRight: '0.5rem'}}>{foodWasteIds.length}</span>
            <span style={{color: '#fdba74', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem'}}>Datovarer Valgt</span>
          </div>
        </div>
        
        {showSuccess && (
          <div style={{background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.1rem', animation: 'fadeIn 0.3s ease'}}>
            ✨ Opskrift sendt til butikkens skærme!
          </div>
        )}
        
        {toastMessage && (
          <div style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.1rem', animation: 'fadeIn 0.3s ease', position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>
            {toastMessage}
          </div>
        )}

        <button 
          onClick={async () => {
            if (userRole === 'Ungarbejder' && !isTemporarilyUnlocked) {
              const approvalPin = window.prompt('Godkendelse påkrævet!\n\nDu er logget ind som ungarbejder.\nFor at sende disse varer til skærmen, skal en ansvarlig Voksen taste sin PIN-kode herunder:\n(Dette vil låse adgangen op i 10 minutter)');
              if (!approvalPin) return;
              
              const isValid = await validateVoksenPin(approvalPin);
              if (!isValid) {
                 window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Ugyldig eller manglende Voksen-PIN.' }));
                 return;
              }
              // Voksen har godkendt
              handleGenerate(approvalPin);
            } else {
              if(window.confirm('Bekræft ansvarsfraskrivelse:\n\nSom ansvarlig for butiksskærmen bekræfter du hermed, at de valgte varer er korrekte, og at der ikke er valgt ugyldige eller upassende "fjolle-varer".\n\nVil du sende til skærmen?')) {
                handleGenerate();
              }
            }
          }}
          disabled={selectedIds.length === 0 || showSuccess || isSubmitting}
          style={{
             opacity: (selectedIds.length === 0 || showSuccess || isSubmitting) ? 0.5 : 1, 
             padding: '1.25rem 2.5rem', 
             fontSize: '1.2rem', fontWeight: '700',
             borderRadius: '20px',
             background: 'linear-gradient(135deg, #10b981, #059669)',
             color: 'white', border: 'none', cursor: 'pointer',
             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
             display: 'flex', alignItems: 'center', gap: '0.75rem',
             boxShadow: (selectedIds.length === 0 || showSuccess) ? 'none' : '0 15px 30px -10px rgba(16, 185, 129, 0.5)'
          }}
          onMouseOver={e => { if(selectedIds.length > 0 && !showSuccess) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)' }}
          onMouseOut={e => { if(selectedIds.length > 0 && !showSuccess) e.currentTarget.style.transform = 'translateY(0) scale(1)' }}
        >
          {isSubmitting && <Loader2 className="animate-spin" size={24} />}
          {isSubmitting ? 'Beregner synergi...' : showSuccess ? 'Succes!' : (userRole === 'Ungarbejder' && !isTemporarilyUnlocked) ? 'Klargør (Kræver Voksen-PIN)' : 'Find Opskrift & Send'} 
          {!isSubmitting && !showSuccess && <ChevronRight size={24} />}
        </button>
      </div>
    </div>
  );
}
