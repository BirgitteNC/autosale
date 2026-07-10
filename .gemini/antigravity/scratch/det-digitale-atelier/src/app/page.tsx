"use client";

import { useEffect, useState } from "react";
import { Carousel, Look } from "./components/Carousel";
import { ColorState } from "./components/ColorSlider";
import { StyleWizard } from "./components/StyleWizard";
import { generateOutfitFormula } from "./lib/stylingEngine";
import { BodyProfile, FavoriteGarment, OutfitFormulaResult } from "./types/styling";
import { motion, AnimatePresence } from "framer-motion";
import { User, Search, BookOpen, Shirt, CheckCircle2, ChevronDown, Sparkles } from "lucide-react";
import { Playfair_Display } from 'next/font/google';
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ['latin'], style: ['normal', 'italic'] });

const MOCK_LOOKS: Look[] = [
  {
    id: "1",
    image: "/images/empire.png",
    title: "The Empire Edit",
    description: "Empire-talje i sandnuancer. Forlænger silhuetten og giver ro."
  },
  {
    id: "2",
    image: "/images/knit.png",
    title: "Structured Layers",
    description: "Abdominal camouflage gennem struktureret strik over en let tunika."
  },
  {
    id: "3",
    image: "/images/trousers.png",
    title: "Volume Balance",
    description: "Brede bukser med chunky støvler for perfekt proportionel balance."
  }
];

export default function Home() {
  const [colorState, setColorState] = useState<ColorState>("monochrome");
  const [formulaResult, setFormulaResult] = useState<OutfitFormulaResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dynamicLooks, setDynamicLooks] = useState<Look[]>(MOCK_LOOKS);
  const router = useRouter();

  // Fetch Lookbook
  useEffect(() => {
    const fetchLooks = async () => {
      const { data, error } = await supabase
        .from('styling_recommendation_logs')
        .select('id, generated_image_url, generated_advice_text, selected_theme')
        .not('generated_image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (data && data.length > 0) {
        const formattedLooks: Look[] = data.map((log: any) => ({
          id: log.id,
          image: log.generated_image_url,
          title: `The ${log.selected_theme || 'Quiet'} Edit`,
          description: log.generated_advice_text.substring(0, 80) + "..."
        }));
        setDynamicLooks(formattedLooks);
      }
    };
    fetchLooks();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setSession(session);
        const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', session.user.id).single();
        setUserProfile(profile);
      }
    };
    checkSession();
  }, [router]);

  const handleCalculate = async (body: BodyProfile, garment: FavoriteGarment, uploadedImage: string | null) => {
    // Hvis brugeren har valgt et eksisterende stykke tøj fra garderoben, har den et ID.
    // Hvis IKKE, og vi har et billede + navn, gemmer vi det først.
    let finalGarmentId = garment.id;
    let finalImageUrl = uploadedImage;
    if (!finalGarmentId && uploadedImage && garment.name) {
      if (session?.user?.id) {
        // Upload image to Supabase Storage if it's base64
        if (uploadedImage.startsWith('data:image')) {
          try {
            const fileData = await fetch(uploadedImage).then(res => res.blob());
            const fileName = `${session.user.id}-${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage.from('wardrobe-images').upload(fileName, fileData);
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage.from('wardrobe-images').getPublicUrl(fileName);
              finalImageUrl = publicUrl;
            }
          } catch (e) {
            console.error("Could not upload image to storage", e);
          }
        }

        // Tjek om tøjet allerede eksisterer (Deduplication)
        const { data: existingGarments } = await supabase
          .from('wardrobe_items')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('name', garment.name)
          .eq('category', garment.category)
          .eq('color', garment.color)
          .limit(1);

        if (existingGarments && existingGarments.length > 0) {
          finalGarmentId = existingGarments[0].id;
        } else {
          // Gem som nyt
          const { data: newGarment, error } = await supabase
            .from('wardrobe_items')
            .insert({
              user_id: session.user.id,
              name: garment.name,
              category: garment.category,
              fit: garment.fit,
              color: garment.color,
              image_url: finalImageUrl
            })
            .select('id')
            .single();
            
          if (newGarment) {
            finalGarmentId = newGarment.id;
          }
        }
      }
    }

    setIsGenerating(true);
    setFormulaResult(null);

    try {
      const result = await generateOutfitFormula(body, { ...garment, id: finalGarmentId, imageUrl: finalImageUrl || undefined }, colorState, userProfile, session?.user?.id);
      setFormulaResult(result);
      setCurrentImage(uploadedImage);
    } catch (error: any) {
      console.error("Error generating formula:", error);
      alert("Fejl: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-quiet ease-quiet flex flex-col pb-20 ${colorState === 'glow' ? 'bg-orange-50/30' : colorState === 'analog' ? 'bg-[#EFEBE4]' : 'bg-background'}`}>
      
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-6 border-b border-foreground/5 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 text-accent">
          <Shirt className="w-6 h-6" strokeWidth={1} />
        </div>
        <h1 className="text-xl tracking-widest font-light uppercase text-foreground">Style This</h1>
        <div className="w-6" /> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-8 pb-12 overflow-x-hidden">
        
        {/* Style Wizard (Onboarding Flow) */}
        <div className="w-full px-4 mb-16 relative z-10">
          <StyleWizard onCalculate={handleCalculate} colorState={colorState} setColorState={setColorState} />
          
          {/* Loading State for AI Generation */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-4xl mx-auto mt-16 bg-[#FAF9F6] border border-[#E5E0D8] p-12 text-center shadow-xl flex flex-col items-center"
              >
                <div className="w-16 h-16 border-t-2 border-[#1A1816] rounded-full animate-spin mb-6"></div>
                <h3 className={`${playfair.className} text-2xl text-[#1A1816] mb-2`}>AI Stylisten arbejder...</h3>
                <p className="text-[#A69482] text-sm uppercase tracking-widest">Analyserer kropsform, farver og tegner dit outfit (dette kan tage et øjeblik)</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formula Result Card (Editorial Version) */}
          <AnimatePresence>
            {formulaResult && !isGenerating && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl mx-auto mt-16 bg-[#FAF9F6] border border-[#E5E0D8] shadow-2xl overflow-hidden flex flex-col md:flex-row"
              >
                {/* Left Column: Image Anchor / Illustration */}
                <div className="w-full md:w-2/5 bg-[#F2EFEB] relative overflow-hidden flex-shrink-0 min-h-[300px]">
                  {formulaResult.illustrationUrl ? (
                    <img src={formulaResult.illustrationUrl} alt="Fashion Sketch" className="w-full h-full object-cover mix-blend-multiply opacity-95" />
                  ) : currentImage ? (
                    <img src={currentImage} alt="Dit tøj" className="w-full h-full object-cover absolute inset-0 mix-blend-multiply opacity-90" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Shirt size={120} strokeWidth={0.5} />
                    </div>
                  )}
                  <div className="absolute top-6 left-6 right-6">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#6B5E53] font-medium block mb-1">
                      {formulaResult.illustrationUrl ? "AI Sketch" : "Anker"}
                    </span>
                    <h4 className={`${playfair.className} text-xl italic text-[#2C2825]`}>{formulaResult.formula.anchor}</h4>
                  </div>
                </div>

                {/* Right Column: Editorial Spread */}
                <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-between relative">
                  <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#A69482] mb-3 block flex items-center gap-2">
                      <Sparkles size={12} /> Din Styling Formel
                    </span>
                    <h3 className={`${playfair.className} text-4xl text-[#1A1816] mb-6 leading-tight`}>
                      {formulaResult.title}
                    </h3>
                    <p className="text-[#4A4540] text-sm leading-relaxed max-w-md font-light">
                      {formulaResult.advice}
                    </p>
                  </div>

                  {/* Swatches & Specs */}
                  <div className="space-y-8 border-t border-[#E5E0D8] pt-8">
                    {/* Color Palette */}
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-[#A69482] mb-3">Farve Palette</span>
                      <div className="flex gap-3 items-center">
                        {formulaResult.formula.colorPalette.map((hex, i) => (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.1 + 0.4 }}
                            key={i} 
                            className="w-8 h-8 rounded-full border border-black/5 shadow-inner"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                        <span className="ml-3 text-[10px] text-[#8C7A6B] italic">{formulaResult.formula.colorCombination}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <span className="block text-[9px] uppercase tracking-[0.2em] text-[#A69482] mb-2">Parringer</span>
                        <ul className="text-xs text-[#2C2825] space-y-2">
                          {formulaResult.formula.pairingPieces.map((p, i) => (
                            <li key={i} className="flex gap-2 items-start">
                              <span className="text-[#A69482] font-serif italic">+</span>
                              <span className="leading-snug">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <span className="block text-[9px] uppercase tracking-[0.2em] text-[#A69482] mb-1">Lag-på-lag</span>
                          <p className="text-xs text-[#2C2825] leading-snug">{formulaResult.formula.layeringStrategy}</p>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-[0.2em] text-[#A69482] mb-1">Pasform & Fald</span>
                          <p className="text-xs text-[#2C2825] flex items-center gap-2">
                            <ChevronDown size={14} className="text-[#A69482]" />
                            {formulaResult.formula.tuckStyle.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase tracking-[0.2em] text-[#A69482] mb-1">Fodtøj</span>
                          <p className="text-xs text-[#2C2825] font-serif italic">{formulaResult.formula.footwearChoice}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Provenance Footer (Rule 8 Compliance) */}
                  <div className="mt-12 pt-6 border-t border-[#E5E0D8] text-[9px] text-[#A69482] font-mono leading-relaxed">
                    <p className="mb-1 uppercase tracking-widest font-bold">EU AI Act / Provenance Log:</p>
                    <p>REGLER: {formulaResult.appliedRuleIds.join(" | ")}</p>
                    <p>KILDER: {formulaResult.provenanceSources.join(" | ")}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center mb-8 px-4 border-t border-foreground/5 w-full pt-16">
          <h2 className="text-xl tracking-widest font-light mb-2 text-foreground">Lookbook Inspiration</h2>
          <p className="text-[10px] text-foreground/50 uppercase tracking-widest">Editorial Quiet Luxury</p>
        </div>

        {/* Carousel */}
        <div className="w-full relative z-0">
          <Carousel looks={dynamicLooks} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-surface border-t border-foreground/10 flex justify-around items-center p-4 z-50">
        <Link href="/wardrobe" className="flex flex-col items-center text-foreground/40 hover:text-foreground transition-colors">
          <Shirt size={20} className="mb-1" />
          <span className="text-[10px] uppercase tracking-widest font-medium">Garderobe</span>
        </Link>
        <button className="flex flex-col items-center text-foreground">
          <div className="w-12 h-12 rounded-full bg-accent text-background flex items-center justify-center -mt-6 border-4 border-surface shadow-md">
            <Search size={20} />
          </div>
          <span className="text-[10px] uppercase tracking-widest mt-1 font-medium">Style This</span>
        </button>
        <Link href="/profile" className="flex flex-col items-center text-foreground/40 hover:text-foreground transition-colors">
          {session?.user?.user_metadata?.avatar_url ? (
            <img src={session.user.user_metadata.avatar_url} alt="Profil" className="w-5 h-5 rounded-full object-cover mb-1 border border-current" />
          ) : (
            <User size={20} className="mb-1" />
          )}
          <span className="text-[10px] uppercase tracking-widest font-medium">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
