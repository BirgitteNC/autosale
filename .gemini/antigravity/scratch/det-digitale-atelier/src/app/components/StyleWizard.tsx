"use client";

import { useState, useRef, useEffect } from "react";
import { BodyProfile, FavoriteGarment } from "../types/styling";
import { Camera, Upload, ArrowRight, Shirt } from "lucide-react";
import { ColorSlider, ColorState } from "./ColorSlider";
import { supabase } from "@/lib/supabase";

interface StyleWizardProps {
  onCalculate: (body: BodyProfile, garment: FavoriteGarment, image: string | null) => void;
  colorState: ColorState;
  setColorState: (state: ColorState) => void;
}

export function StyleWizard({ onCalculate, colorState, setColorState }: StyleWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Garment State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [garmentName, setGarmentName] = useState("");
  const [category, setCategory] = useState<FavoriteGarment["category"]>("top");
  const [fit, setFit] = useState<FavoriteGarment["fit"]>("oversized");
  const [color, setColor] = useState("");
  const [garmentId, setGarmentId] = useState<string | undefined>(undefined);

  // Wardrobe State
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);

  // Body Profile State
  const [waist, setWaist] = useState<BodyProfile["waistType"]>("high_waist");
  const [focus, setFocus] = useState<BodyProfile["bodyFocus"]>("slimming");

  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const fetchWardrobe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('wardrobe_items')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (data) setWardrobeItems(data);
      }
      setLoadingWardrobe(false);
    };
    fetchWardrobe();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Fejl: Upload venligst en billedfil (JPG/PNG).");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);
        setScanning(true);
        setGarmentId(undefined); // Reset ID since it's a new image
        
        try {
          const response = await fetch('/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64 })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.name) setGarmentName(data.name);
            if (data.category) setCategory(data.category);
            if (data.fit) setFit(data.fit);
            if (data.color) setColor(data.color);
            if (data._error) {
              console.warn("AI advarsel:", data._error);
            }
          } else {
            setGarmentName(""); // Lad feltet være tomt, så brugeren tvinges til at udfylde det
          }
        } catch (error) {
          console.warn("Fejl ved upload til Vision:", error);
          setGarmentName(""); 
        } finally {
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectWardrobeItem = (item: any) => {
    setGarmentId(item.id);
    setGarmentName(item.name);
    setCategory(item.category);
    setFit(item.fit);
    setColor(item.color);
    setUploadedImage(item.image_url || null);
    // Auto-scroll evt ned til felterne eller gå videre?
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!garmentName || !color) {
        alert("Udfyld venligst hvad det er, og hvilken farve det har.");
        return;
      }
      setStep(2);
    } else {
      onCalculate(
        { waistType: waist, bodyFocus: focus },
        { id: garmentId, name: garmentName, category, fit, color },
        uploadedImage
      );
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-surface/80 backdrop-blur-md border border-foreground/10 rounded-lg p-6 md:p-8 shadow-sm">
      {/* Progress Indicator */}
      <div className="flex gap-2 mb-8">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-foreground/10'}`} />
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-foreground/10'}`} />
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-xl font-light tracking-widest text-foreground uppercase mb-2">Dit udgangspunkt</h2>
            <p className="text-sm text-foreground/60">Upload eller vælg det stykke tøj, du vil style.</p>
          </div>

          {/* Wardrobe Selector */}
          {!loadingWardrobe && wardrobeItems.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-foreground/60 mb-3">Vælg fra garderobeskabet:</p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {wardrobeItems.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleSelectWardrobeItem(item)}
                    className={`snap-start shrink-0 w-20 h-20 rounded-md border overflow-hidden relative transition-all ${garmentId === item.id ? 'border-accent shadow-sm' : 'border-foreground/10 hover:border-foreground/30'}`}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full bg-foreground/5 flex items-center justify-center text-foreground/40">
                        <Shirt size={20} />
                      </div>
                    )}
                    {garmentId === item.id && (
                      <div className="absolute inset-0 bg-accent/10 border-2 border-accent rounded-md"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Torben-Friendly Big Button */}
          <div 
            className="w-full border-2 border-dashed border-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-foreground/5 transition-colors relative overflow-hidden group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            {uploadedImage && !garmentId ? (
              <div className="absolute inset-0 w-full h-full">
                <img src={uploadedImage} alt="Uploaded garment" className={`w-full h-full object-cover transition-all ${scanning ? 'opacity-40 grayscale blur-sm' : 'opacity-80'}`} />
                {scanning ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-[10px] uppercase tracking-widest text-accent font-medium bg-background px-3 py-1 rounded-sm">AI Analyserer</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest rounded-sm">Skift billede</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <Camera size={32} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <span className="block text-foreground font-medium uppercase tracking-widest text-sm mb-1">Upload Nyt Billede</span>
                  <span className="text-foreground/50 text-xs">JPG, PNG eller WebP</span>
                </div>
              </>
            )}
          </div>

          {/* Mock Vision Metadata Input */}
          <div className="space-y-4 pt-4 border-t border-foreground/5">
            <p className="text-xs uppercase tracking-widest text-foreground/40 text-center mb-4">Hjælp os med detaljerne</p>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">Hvad kigger vi på?</label>
              <input 
                type="text" 
                placeholder="F.eks. Oversized Blazer (skal udfyldes)"
                value={garmentName}
                onChange={(e) => { setGarmentName(e.target.value); setGarmentId(undefined); }}
                className="w-full bg-transparent border-b border-foreground/20 text-sm py-2 focus:outline-none focus:border-accent text-foreground transition-colors"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">Kategori</label>
                <select 
                  value={category} 
                  onChange={(e) => { setCategory(e.target.value as any); setGarmentId(undefined); }}
                  className="w-full bg-surface border border-foreground/10 text-xs py-2 px-1 rounded-sm text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="top">Overdel</option>
                  <option value="bottom">Underdel</option>
                  <option value="outerwear">Ydertøj</option>
                  <option value="footwear">Fodtøj</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">Pasform</label>
                <select 
                  value={fit} 
                  onChange={(e) => { setFit(e.target.value as any); setGarmentId(undefined); }}
                  className="w-full bg-surface border border-foreground/10 text-xs py-2 px-1 rounded-sm text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="oversized">Oversized</option>
                  <option value="wide-leg">Vidde (Wide-leg)</option>
                  <option value="slim-fit">Tætsiddende</option>
                  <option value="fitted">Figursyet</option>
                  <option value="structured">Struktureret</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-1">Hovedfarve</label>
                <input 
                  type="text" 
                  placeholder="F.eks. Sand"
                  value={color} 
                  onChange={(e) => { setColor(e.target.value); setGarmentId(undefined); }}
                  className="w-full bg-surface border border-foreground/10 text-xs py-2 px-2 rounded-sm text-foreground focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center">
            <h2 className="text-xl font-light tracking-widest text-foreground uppercase mb-2">Din Kropstype</h2>
            <p className="text-sm text-foreground/60">Fortæl os om dine proportioner, så vi kan skræddersy formlen.</p>
          </div>

          <div className="space-y-6">
            {/* Waist Type */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-3 text-center">Hvor sidder din naturlige talje?</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setWaist("high_waist")}
                  className={`py-4 text-xs border rounded-md transition-all ${waist === "high_waist" ? "border-accent bg-accent/5 text-foreground shadow-sm" : "border-foreground/10 text-foreground/60 hover:border-foreground/30"}`}
                >
                  <span className="block font-medium uppercase tracking-widest mb-1">Høj Talje</span>
                  <span className="text-[10px] opacity-70">Lange ben, kortere overkrop</span>
                </button>
                <button 
                  onClick={() => setWaist("mid_low_waist")}
                  className={`py-4 text-xs border rounded-md transition-all ${waist === "mid_low_waist" ? "border-accent bg-accent/5 text-foreground shadow-sm" : "border-foreground/10 text-foreground/60 hover:border-foreground/30"}`}
                >
                  <span className="block font-medium uppercase tracking-widest mb-1">Middel / Lav</span>
                  <span className="text-[10px] opacity-70">Længere overkrop, jævne proportioner</span>
                </button>
              </div>
            </div>

            {/* Body Focus */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-3 text-center">Hvad er dit primære styling-mål?</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { id: "chest_enhance", label: "Bryst: Ønsker fylde" },
                  { id: "chest_reduce", label: "Bryst: Ønsker at minimere" },
                  { id: "bottom_reduce", label: "Bagdel: Fjern fokus" },
                  { id: "bottom_enhance", label: "Bagdel: Fremhæv fokus" },
                  { id: "slimming", label: "Krop: Syne slankere" },
                  { id: "volume_add", label: "Krop: Ønsker mere fylde" },
                  { id: "legs_lengthen", label: "Ben: Længere / Slankere" },
                  { id: "legs_shorten", label: "Ben: Syne kortere" },
                ].map((goal) => (
                  <button 
                    key={goal.id}
                    onClick={() => setFocus(goal.id as any)}
                    className={`py-3 text-xs border rounded-md transition-all flex items-center justify-between px-3 ${focus === goal.id ? "border-accent bg-accent/5 text-foreground" : "border-foreground/10 text-foreground/60 hover:border-foreground/30"}`}
                  >
                    <span className="uppercase tracking-widest text-[9px]">{goal.label}</span>
                    <div className={`w-3 h-3 rounded-full border shrink-0 ${focus === goal.id ? "border-accent bg-accent" : "border-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="pt-4 border-t border-foreground/10">
              <label className="block text-[10px] uppercase tracking-widest text-foreground/60 mb-4 text-center">Dit foretrukne farvetema</label>
              <ColorSlider value={colorState} onChange={setColorState} />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="px-6 py-3 text-xs tracking-widest uppercase text-foreground/60 hover:text-foreground transition-colors"
          >
            Tilbage
          </button>
        )}
        <button
          onClick={handleNextStep}
          className="flex-1 bg-foreground text-background py-3 rounded-sm text-xs tracking-widest uppercase hover:bg-foreground/90 transition-all flex justify-center items-center gap-2 font-medium"
        >
          {step === 1 ? "Næste: Kropstype" : "Generér Outfit Formula"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
