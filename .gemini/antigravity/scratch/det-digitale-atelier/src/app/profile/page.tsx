"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Playfair_Display } from "next/font/google";
import { Shirt, Plus, LogOut, Check, ChevronRight, Edit2, Save } from "lucide-react";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [colorDna, setColorDna] = useState<{season: string, explanation: string, recommended_colors: string[]} | null>(null);
  const [eyeColor, setEyeColor] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    height_cm: "",
    body_shape: "",
    body_type: "",
    avoid_heels: false,
    favorite_materials: "",
    nogo_items: ""
  });

  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      setEmail(session.user.email || null);
      if (session.user.user_metadata?.avatar_url) {
        setAvatarUrl(session.user.user_metadata.avatar_url);
      }
      if (session.user.user_metadata?.color_dna) {
        setColorDna(session.user.user_metadata.color_dna);
      }
      if (session.user.user_metadata?.eye_color) {
        setEyeColor(session.user.user_metadata.eye_color);
      }

      // Fetch user profile data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (profile) {
        setProfileData({
          height_cm: profile.height_cm?.toString() || "",
          body_shape: profile.body_shape || "",
          body_type: profile.body_type || "",
          avoid_heels: profile.avoid_heels || false,
          favorite_materials: profile.favorite_materials ? profile.favorite_materials.join(', ') : "",
          nogo_items: profile.nogo_items ? profile.nogo_items.join(', ') : ""
        });
      }

      setLoading(false);
    };

    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSaveProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { data: existing } = await supabase.from('user_profiles').select('id').eq('user_id', session.user.id).single();
    
    const payload = {
      user_id: session.user.id,
      height_cm: profileData.height_cm ? parseInt(profileData.height_cm) : null,
      body_shape: profileData.body_shape,
      body_type: profileData.body_type,
      avoid_heels: profileData.avoid_heels,
      favorite_materials: profileData.favorite_materials.split(',').map((s: string) => s.trim()).filter(Boolean),
      nogo_items: profileData.nogo_items.split(',').map((s: string) => s.trim()).filter(Boolean)
    };

    if (existing) {
      await supabase.from('user_profiles').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('user_profiles').insert(payload);
    }
    
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Adgangskoden skal være mindst 6 tegn lang.");
      return;
    }

    setPasswordStatus("loading");
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error("Error updating password:", error);
      setPasswordStatus("error");
    } else {
      setPasswordStatus("success");
      setNewPassword("");
      setTimeout(() => setPasswordStatus("idle"), 3000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 200;
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);

            // Udregn Color DNA via OpenAI
            const visionRes = await fetch('/api/vision/color-dna', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: resizedBase64, eyeColor: eyeColor })
            });

            if (visionRes.ok) {
              const colorData = await visionRes.json();
              setColorDna(colorData);

              // Gem på brugerens auth metadata
              await supabase.auth.updateUser({
                data: {
                  avatar_url: resizedBase64,
                  color_dna: colorData,
                  eye_color: eyeColor
                }
              });
              
              setAvatarUrl(resizedBase64);
            } else {
              const err = await visionRes.json();
              console.error("Vision Error:", err);
              alert("Kunne ikke analysere billedet: " + (err.error || "Ukendt fejl"));
            }
          } catch (err) {
            console.error("Fejl i billedbehandling:", err);
            alert("Der skete en fejl under upload. Prøv igen.");
          } finally {
            setIsUploading(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Fejl ved opsætning af profilbillede:", error);
      alert("Der skete en fejl under upload. Prøv igen.");
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-widest text-[#A69482] animate-pulse">Henter Profil...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Header */}
      <header className="pt-16 pb-8 px-6 text-center border-b border-[#E5E0D8] bg-white relative">
        <button onClick={handleLogout} className="absolute top-6 right-6 text-[#A69482] hover:text-[#2C2825] transition-colors" title="Log ud">
          <LogOut size={20} />
        </button>
        <label className="relative w-24 h-24 bg-[#F2EFEB] rounded-full mx-auto mb-4 flex items-center justify-center text-[#2C2825] text-3xl font-serif cursor-pointer hover:opacity-80 transition-opacity overflow-hidden group shadow-sm border border-[#E5E0D8]">
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
          {isUploading ? (
            <span className="text-[10px] uppercase tracking-widest text-[#A69482] animate-pulse">Analyserer...</span>
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            email?.charAt(0).toUpperCase()
          )}
          {!isUploading && !avatarUrl && (
            <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] uppercase tracking-widest text-[#1A1816] font-sans">+ Upload</span>
            </div>
          )}
        </label>
        <h1 className={`${playfair.className} text-3xl text-[#1A1816] mb-1`}>Din Profil</h1>
        <p className="text-xs text-[#6B5E53] mb-6">{email}</p>

        {/* Eye Color selector for better AI results */}
        <div className="max-w-xs mx-auto text-left bg-white p-3 rounded-sm border border-[#E5E0D8]">
          <label className="block text-[10px] uppercase tracking-widest text-[#A69482] mb-2 text-center">
            Din rigtige øjenfarve (For præcis AI analyse)
          </label>
          <select 
            value={eyeColor}
            onChange={async (e) => {
              const val = e.target.value;
              setEyeColor(val);
              await supabase.auth.updateUser({ data: { eye_color: val } });
            }}
            className="w-full bg-transparent border-b border-[#E5E0D8] text-sm text-[#2C2825] focus:outline-none pb-1"
          >
            <option value="">-- Vælg øjenfarve --</option>
            <option value="Blå">Blå</option>
            <option value="Grøn">Grøn</option>
            <option value="Brun">Brun</option>
            <option value="Nøddebrun (Hazel)">Nøddebrun (Hazel)</option>
            <option value="Grå">Grå</option>
            <option value="Mørkebrun/Sort">Mørkebrun/Sort</option>
          </select>
          <p className="text-[9px] text-[#A69482] mt-2 text-center">Vælg din øjenfarve før du uploader billede</p>
        </div>

      </header>

      <div className="max-w-2xl mx-auto p-6 mt-4 space-y-8">
        
        {/* Subscription Block */}
        <section className="bg-[#1A1816] text-white p-6 rounded-sm relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#D4CFC7] mb-2">Abonnement</h2>
            <div className="flex items-end gap-3 mb-1">
              <span className={`${playfair.className} text-2xl`}>Premium Medlem</span>
              <Check className="text-[#A69482] mb-1" size={18} />
            </div>
            <p className="text-xs text-[#A69482]">Du har fuld adgang til Styling Engine og Garderobearkivet.</p>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <Shirt size={150} />
          </div>
        </section>

        {/* Stamoplysninger & Præferencer Toolbar */}
        <div className="flex justify-between items-center mb-[-1rem] px-2">
          <h2 className="text-xl font-serif text-[#1A1816]">Personlig Data</h2>
          <button 
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            className="text-[10px] uppercase tracking-widest bg-[#1A1816] text-white px-4 py-2 hover:bg-[#2C2825] transition-colors rounded-sm flex items-center gap-2"
          >
            {isEditing ? <><Save size={14} /> Gem</> : <><Edit2 size={14} /> Rediger</>}
          </button>
        </div>

        {/* Stamoplysninger */}
        <section className={`bg-white p-6 border transition-colors ${isEditing ? 'border-[#1A1816] shadow-sm' : 'border-[#E5E0D8]'}`}>
          <h2 className="text-sm font-medium tracking-widest uppercase text-[#2C2825] border-b border-[#E5E0D8] pb-4 mb-4">Stamoplysninger</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#A69482] mb-1">Højde (cm)</label>
              {isEditing ? (
                <input type="number" className="w-full border-b border-[#A69482] pb-1 text-sm text-[#2C2825] focus:outline-none focus:border-[#1A1816]" value={profileData.height_cm} onChange={e => setProfileData({...profileData, height_cm: e.target.value})} placeholder="F.eks. 168" />
              ) : (
                <div className="w-full border-b border-[#E5E0D8] pb-2 text-sm text-[#2C2825]">{profileData.height_cm || "Ikke angivet"}</div>
              )}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#A69482] mb-1">Kropsform</label>
              {isEditing ? (
                <select className="w-full border-b border-[#A69482] pb-1 text-sm text-[#2C2825] focus:outline-none focus:border-[#1A1816] bg-transparent" value={profileData.body_shape} onChange={e => setProfileData({...profileData, body_shape: e.target.value})}>
                  <option value="">Vælg...</option>
                  <option value="Timeglas">Timeglas</option>
                  <option value="Pære">Pære</option>
                  <option value="Æble">Æble</option>
                  <option value="Rektangulær">Rektangulær</option>
                  <option value="Melonform (Rund)">Melonform (Rund)</option>
                </select>
              ) : (
                <div className="w-full border-b border-[#E5E0D8] pb-2 text-sm text-[#2C2825]">{profileData.body_shape || "Ikke angivet"}</div>
              )}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#A69482] mb-1">Kropstype</label>
              {isEditing ? (
                <input type="text" placeholder="F.eks. Kurvet, Slank" className="w-full border-b border-[#A69482] pb-1 text-sm text-[#2C2825] focus:outline-none focus:border-[#1A1816]" value={profileData.body_type} onChange={e => setProfileData({...profileData, body_type: e.target.value})} />
              ) : (
                <div className="w-full border-b border-[#E5E0D8] pb-2 text-sm text-[#2C2825]">{profileData.body_type || "Ikke angivet"}</div>
              )}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#A69482] mb-1">Farve-DNA (AI Analyse)</label>
              <div className="w-full border-b border-[#E5E0D8] pb-2 text-sm text-[#2C2825]">
                {colorDna ? (
                  <div>
                    <span className="font-semibold text-[#1A1816]">{colorDna.season}</span>
                    <p className="text-[10px] text-[#A69482] mt-1 leading-tight mb-2">{colorDna.explanation}</p>
                    <div className="flex gap-1 flex-wrap">
                      {colorDna.recommended_colors.map((c, i) => (
                        <span key={i} className="text-[8px] uppercase tracking-widest bg-[#F2EFEB] px-1.5 py-0.5 rounded-sm">{c}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-[#A69482] italic text-xs">Upload profilbillede for AI analyse</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Præferencer */}
        <section className={`bg-white p-6 border transition-colors ${isEditing ? 'border-[#1A1816] shadow-sm' : 'border-[#E5E0D8]'}`}>
          <h2 className="text-sm font-medium tracking-widest uppercase text-[#2C2825] border-b border-[#E5E0D8] pb-4 mb-4">Styling Præferencer</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#2C2825]">Undgå høje hæle</p>
                <p className="text-[10px] text-[#A69482]">Styling Engine foreslår aldrig stiletter.</p>
              </div>
              <button 
                disabled={!isEditing}
                onClick={() => setProfileData({...profileData, avoid_heels: !profileData.avoid_heels})}
                className={`w-10 h-5 rounded-full relative transition-colors ${profileData.avoid_heels ? 'bg-[#1A1816]' : 'bg-[#E5E0D8]'} ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${profileData.avoid_heels ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="pt-4 border-t border-[#F2EFEB]">
              <p className="text-sm text-[#2C2825] mb-1">Foretrukne materialer</p>
              {isEditing ? (
                <input type="text" placeholder="Silke, uld, kashmir..." className="w-full text-sm text-[#2C2825] border-b border-[#A69482] focus:outline-none focus:border-[#1A1816] pb-1" value={profileData.favorite_materials} onChange={e => setProfileData({...profileData, favorite_materials: e.target.value})} />
              ) : (
                <p className="text-[10px] text-[#A69482]">{profileData.favorite_materials || "Ingen angivet"}</p>
              )}
            </div>

            <div className="pt-4 border-t border-[#F2EFEB]">
              <p className="text-sm text-[#2C2825] mb-1">No-go items</p>
              {isEditing ? (
                <input type="text" placeholder="Korte nederdele, dybe udskæringer..." className="w-full text-sm text-[#2C2825] border-b border-[#A69482] focus:outline-none focus:border-[#1A1816] pb-1" value={profileData.nogo_items} onChange={e => setProfileData({...profileData, nogo_items: e.target.value})} />
              ) : (
                <p className="text-[10px] text-[#A69482]">{profileData.nogo_items || "Ingen angivet"}</p>
              )}
            </div>
          </div>
        </section>

        {/* Sikkerhed */}
        <section className="bg-white p-6 border border-[#E5E0D8]">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[#2C2825] border-b border-[#E5E0D8] pb-4 mb-6">Sikkerhed</h2>
          
          <form onSubmit={handlePasswordChange}>
            <label className="block text-[10px] uppercase tracking-widest text-[#A69482] mb-2">
              Skift Adgangskode
            </label>
            <div className="flex gap-4">
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ny adgangskode"
                className="flex-1 border-b border-[#E5E0D8] py-2 text-sm text-[#2C2825] focus:outline-none focus:border-[#1A1816] bg-transparent"
              />
              <button 
                type="submit" 
                disabled={passwordStatus === "loading"}
                className="bg-[#F2EFEB] text-[#2C2825] px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-[#E5E0D8] transition-colors disabled:opacity-50"
              >
                {passwordStatus === "loading" ? "Gemmer..." : "Gem kode"}
              </button>
            </div>
            {passwordStatus === "success" && <p className="text-xs text-green-600 mt-2">Adgangskode opdateret!</p>}
            {passwordStatus === "error" && <p className="text-xs text-red-500 mt-2">Der opstod en fejl. Prøv igen.</p>}
          </form>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-[#E5E0D8] flex justify-around items-center p-4 z-50">
        <Link href="/wardrobe" className="flex flex-col items-center text-[#A69482] hover:text-[#1A1816] transition-colors">
          <Shirt size={20} className="mb-1" />
          <span className="text-[9px] uppercase tracking-widest">Garderobe</span>
        </Link>
        <Link href="/" className="flex flex-col items-center text-[#A69482] hover:text-[#1A1816] transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#F2EFEB] flex items-center justify-center -mt-6 border-4 border-white text-[#2C2825] shadow-sm">
            <Plus size={20} />
          </div>
          <span className="text-[9px] uppercase tracking-widest mt-1">Style This</span>
        </Link>
        <div className="flex flex-col items-center text-[#1A1816]">
          <div className="w-5 h-5 rounded-full bg-[#1A1816] text-white mb-1 flex items-center justify-center shadow-sm">
            <span className="text-[8px] font-bold">U</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-bold">Profil</span>
        </div>
      </nav>
    </main>
  );
}
