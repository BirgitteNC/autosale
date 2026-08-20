import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, PackageSearch, Lock, Search, Mic, MicOff, Trash2, Clock, Target, Loader2, Info, Smartphone } from 'lucide-react';
import { useStaffData } from '../hooks/useStaffData';
import { StaffLoginForm } from '../components/StaffLoginForm';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import HelpDialog from '../../../shared/components/HelpDialog';
import { getConfirmationType } from '../utils/confirmationType';

export function StaffTerminalPage() {
  const staffData = useStaffData();
  const {
    isAuthenticated,
    pin, setPin, pinError,
    availableStores, selectedLoginStore, setSelectedLoginStore,
    ingredients, recipeCounts,
    selectedIds, foodWasteIds,
    showSuccess, isSubmitting, storeId, userRole, validateVoksenPin,
    handleLogin, handleLogout,
    toggleIngredient, toggleFoodWaste, handleGenerate,
    handleClearAll, userRoleDesc
  } = staffData;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('staff_department') || 'Alle');
  const [isListening, setIsListening] = useState(false);
  const [hasVoiceConsent, setHasVoiceConsent] = useState(() => {
    try { return localStorage.getItem('voice_consent') === 'true'; } catch { return false; }
  });
  const [toastMessage, setToastMessage] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
  const [helpOpen, setHelpOpen] = useState(false);
  const tabsRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
  };



  // Opdater den aktive fane automatisk når man logger ind, 
  // hvis brugeren er knyttet til en specifik afdeling.
  useEffect(() => {
    if (isAuthenticated) {
      const dept = localStorage.getItem('staff_department');
      if (dept) setActiveTab(dept);
    }
  }, [isAuthenticated]);

  const recognitionRef = useRef(null);

  const handleVoiceSearch = (skipConsentCheck = false) => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!hasVoiceConsent && !skipConsentCheck) {
      setModalConfig({ isOpen: true, type: 'voice_consent' });
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setToastMessage("Din enhed understøtter desværre ikke stemmesøgning.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'da-DK';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setToastMessage("Lytter... (Data behandles muligvis af Apple/Google)");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Fjern punktummer osv., som diktering nogle gange indsætter
      setSearchQuery(transcript.replace(/[.,]/g, '').trim());
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setToastMessage("Kunne ikke høre dig. Prøv igen.");
      setTimeout(() => setToastMessage(null), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleRevokeConsent = () => {
    try {
      localStorage.removeItem('voice_consent');
    } catch {
      // ignore
    }
    setHasVoiceConsent(false);
    setToastMessage("Samtykke til stemmesøgning er nu trukket tilbage.");
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
    return <StaffLoginForm 
      availableStores={availableStores}
      selectedLoginStore={selectedLoginStore}
      setSelectedLoginStore={setSelectedLoginStore}
      pin={pin}
      setPin={setPin}
      handleLogin={handleLogin}
      isSubmitting={isSubmitting}
      pinError={pinError}
    />;
  }

  const isSearching = searchQuery.trim().length > 0;

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

  const categories = Object.keys(groupedIngredients)
    .filter(cat => !(userRole === 'Ungarbejder' && cat === 'Alkohol'))
    .sort((a, b) => {
      // Tving Alkohol om bagerst i fane-rækken
      if (a === 'Alkohol' && b !== 'Alkohol') return 1;
      if (b === 'Alkohol' && a !== 'Alkohol') return -1;
      
      const desc = (userRoleDesc || '').toLowerCase().replace(/\[.*?\]\s*/, '');
      const aMatch = desc && (desc.includes(a.toLowerCase().split(/\s+/)[0]) || a.toLowerCase().includes(desc.split(/\s+/)[0]));
      const bMatch = desc && (desc.includes(b.toLowerCase().split(/\s+/)[0]) || b.toLowerCase().includes(desc.split(/\s+/)[0]));
      
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return a.localeCompare(b);
  });

  return (
    <div className="animate-fade-in" style={{paddingBottom: '120px', background: 'radial-gradient(circle at top left, #1e293b, #020617)', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, sans-serif'}}>
        <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ isOpen: false, type: null })}
        requirePin={modalConfig.type === 'voksen_pin' || modalConfig.type === 'clear_voksen_pin'}
        title={modalConfig.type === 'voice_consent' ? 'Tillad Stemmesøgning' : modalConfig.type === 'no_recipe_match' ? 'KRITISK FEJL: KOMBination afvist!' : modalConfig.type?.includes('voksen_pin') ? 'Godkendelse påkrævet' : (modalConfig.type === 'clear_confirm' ? 'Er du sikker?' : 'Bekræft ansvarsfraskrivelse')}
        message={modalConfig.type === 'voice_consent' ? 'For at omsætte din tale til tekst, bruger vi en indbygget tjeneste, som sender din stemme til f.eks. Apple eller Google. Tryk "Godkend" for at give dit udtrykkelige samtykke (GDPR Opt-in) til dette.' : modalConfig.type === 'no_recipe_match'
          ? 'Din valgte kombination af varer er ugyldig. Der findes ingen opskrift, der samler disse specifikke råvarer (eller der er kød-konflikt). Butiksskærmen modtager IKKE dit opskriftsvalg og er gået i nød-tilstand (pauseskærm). Tilpas dine varer og prøv igen!'
          : modalConfig.type?.includes('voksen_pin') 
          ? 'Du er logget ind som ungarbejder. For at udføre denne handling, skal en ansvarlig Voksen taste sin PIN-kode herunder:' 
          : (modalConfig.type === 'clear_confirm' ? 'Er du sikker på, at du vil fjerne alle fremhævede varer fra systemet? Dette gøres typisk kun ved lukketid.' : 'Som ansvarlig for butiksskærmen bekræfter du hermed, at de valgte varer er korrekte, og at der ikke er valgt ugyldige eller upassende "fjolle-varer". Vil du sende til skærmen?')}
        isAlert={modalConfig.type === 'no_recipe_match'}
        onConfirm={async (enteredPin) => {
          const type = modalConfig.type;
          setModalConfig({ isOpen: false, type: null });
          
          if (type === 'no_recipe_match') return; // kun luk — lad bruger rette valget

          if (type === 'voice_consent') {
            try { localStorage.setItem('voice_consent', 'true'); } catch { // ignore
            }
            setHasVoiceConsent(true);
            handleVoiceSearch(true);
            return;
          }

          if (type.includes('voksen_pin')) {
            const approvalToken = await validateVoksenPin(enteredPin);
            if (!approvalToken) {
               window.dispatchEvent(new CustomEvent('staff-toast', { detail: 'Ugyldig eller manglende Voksen-PIN.' }));
               return;
            }
            if (type === 'clear_voksen_pin') handleClearAll(approvalToken);
            else {
              const status = await handleGenerate(approvalToken);
              if (status === 'NO_RECIPE_MATCH') setModalConfig({ isOpen: true, type: 'no_recipe_match' });
            }
          } else {
            if (type === 'clear_confirm') handleClearAll();
            else {
              const status = await handleGenerate();
              if (status === 'NO_RECIPE_MATCH') setModalConfig({ isOpen: true, type: 'no_recipe_match' });
            }
          }
        }}
      />
      
      <HelpDialog isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      
      <div className="container" style={{maxWidth: '1000px', padding: '1.5rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        
        {/* Header Section */}
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem'}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
             <div style={{background: 'linear-gradient(135deg, #38bdf8, #3b82f6)', padding: '12px', borderRadius: '16px', boxShadow: '0 8px 16px -4px rgba(56, 189, 248, 0.4)'}}>
               <PackageSearch size={32} color="white" />
             </div>
             <div>
               <h2 style={{fontSize: '2rem', margin: 0, fontFamily: 'Outfit, sans-serif', fontWeight: '800', letterSpacing: '-0.5px'}}>Salgsstyring</h2>
               <p style={{color: '#94a3b8', margin: 0, fontSize: '1rem'}}>Vælg Fokusvarer & Datovarer</p>
             </div>
           </div>
           <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', flex: '1 1 auto', justifyContent: 'flex-end'}}>
             <button onClick={() => setHelpOpen(true)} style={{padding: '0.75rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Info size={20} />
             </button>
             <button onClick={() => window.open(`/demo?storeId=${encodeURIComponent(storeId)}`, '_blank', 'noopener,noreferrer')} title="Åbn Kundeskærm (Demo)" style={{padding: '0.75rem 1.25rem', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem'}}>
                <Smartphone size={18} /> Kundeskærm
             </button>
             {hasVoiceConsent && (
               <button onClick={handleRevokeConsent} title="Træk samtykke til stemmesøgning tilbage" style={{padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem'}}>
                  <MicOff size={18} /> Fjern Mikrofon-adgang
               </button>
             )}
             <button onClick={() => {
                 setModalConfig({ isOpen: true, type: getConfirmationType('clear', userRole) });
              }} style={{flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', cursor: 'pointer'}}>
                Ryd alt <Trash2 size={18} />
              </button>
              <button onClick={handleLogout} style={{flex: 1, minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', cursor: 'pointer'}}>
                Log ud <Lock size={18} />
              </button>
           </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500 p-4 md:p-6 rounded-r-2xl mb-8 md:mb-12 flex flex-col md:flex-row gap-4 items-start">
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
            aria-label="Søg via stemme"
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
              aria-label="Rul faner til venstre"
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
                data-testid={`department-tab-${cat}`}
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
              aria-label="Rul faner til højre"
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
          <div className="flex flex-col gap-8">
            {(activeTab === 'Alle' || isSearching ? categories : categories.filter(c => c === activeTab)).map(category => (
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
                        data-testid={`ingredient-${ing.id}`}
                        role="button"
                        tabIndex="0"
                        aria-disabled={isDisabled}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if(!isDisabled) toggleIngredient(ing.id);
                            else {
                              setToastMessage("Ingen opskrifter for denne vare");
                              setTimeout(() => setToastMessage(null), 3000);
                            }
                          }
                        }}
                        onClick={() => { 
                          if(!isDisabled) toggleIngredient(ing.id);
                          else {
                            setToastMessage("Ingen opskrifter for denne vare");
                            setTimeout(() => setToastMessage(null), 3000);
                          }
                        }}
                        style={{
                          background: isDisabled ? 'rgba(30, 41, 59, 0.5)' : isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))' : 'rgba(255,255,255,0.05)', 
                          border: isSelected ? '1px solid #10b981' : isDisabled ? '1px dashed #475569' : '1px solid rgba(255,255,255,0.1)', 
                          opacity: 1, 
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
                            role="button"
                            tabIndex="0"
                            style={{
                              position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                              width: '32px', height: '32px', borderRadius: '10px',
                              background: isFoodWaste ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'rgba(0,0,0,0.3)',
                              border: isFoodWaste ? 'none' : '1px solid rgba(255,255,255,0.2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s', boxShadow: isFoodWaste ? '0 4px 10px rgba(249, 115, 22, 0.3)' : 'none'
                            }} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFoodWaste(ing.id);
                              }
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
      <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', zIndex: 100, boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'}}>
        <div style={{display: 'flex', width: '100%', flex: '1 1 300px', justifyContent: 'space-between', gap: '1rem'}}>
          <div style={{flex: 1, background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center'}}>
            <span data-testid="focus-count" style={{fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8', marginRight: '0.5rem'}}>{selectedIds.length}</span>
            <span style={{color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem'}}>Fokusvarer</span>
          </div>
          <div style={{flex: 1, background: 'rgba(249, 115, 22, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.2)', textAlign: 'center'}}>
            <span style={{fontSize: '1.5rem', fontWeight: '800', color: '#f97316', marginRight: '0.5rem'}}>{foodWasteIds.length}</span>
            <span style={{color: '#fdba74', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem'}}>Datovarer</span>
          </div>
        </div>
        
        {showSuccess && (
          <div style={{background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#34d399', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.1rem', animation: 'fadeIn 0.3s ease', width: '100%', textAlign: 'center'}}>
            ✨ Opskrift sendt til butikkens skærme!
          </div>
        )}
        
        {toastMessage && (
          <div style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem 2rem', borderRadius: '16px', fontWeight: 'bold', fontSize: '1.1rem', animation: 'fadeIn 0.3s ease', position: 'fixed', bottom: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 101}}>
            {toastMessage}
          </div>
        )}

        <button 
          data-testid="send-to-screen-button"
          onClick={() => {
               setModalConfig({ isOpen: true, type: getConfirmationType('send', userRole) });
          }}
          disabled={selectedIds.length === 0 || showSuccess || isSubmitting}
          style={{
             width: '100%', flex: '1 1 300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.25rem', fontSize: '1.2rem', fontWeight: '700', borderRadius: '20px', color: 'white', border: 'none', transition: 'all 0.3s',
             opacity: (selectedIds.length === 0 || showSuccess || isSubmitting) ? 0.5 : 1, 
             background: 'linear-gradient(135deg, #10b981, #059669)',
             cursor: (selectedIds.length === 0 || showSuccess || isSubmitting) ? 'not-allowed' : 'pointer',
             boxShadow: (selectedIds.length === 0 || showSuccess) ? 'none' : '0 10px 25px -5px rgba(16, 185, 129, 0.5)'
          }}
        >
          {isSubmitting && <Loader2 className="animate-spin" size={24} />}
          {isSubmitting ? 'Sender...' : showSuccess ? 'Sendt!' : 'Send til skærm'} 
          {!isSubmitting && !showSuccess && <ChevronRight size={24} />}
        </button>
      </div>
    </div>
  );
}
