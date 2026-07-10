"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Playfair_Display } from "next/font/google";
import { Shirt, Plus, LogOut, Trash2, X } from "lucide-react";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  fit: string;
  image_url?: string;
}

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndWardrobe = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      setSession(session);

      // Fetch wardrobe items
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching wardrobe:", error);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    };

    fetchSessionAndWardrobe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleClearWardrobe = async () => {
    if (!window.confirm("Er du sikker på, at du vil slette ALT tøj i dit garderobeskab? (Dette kan ikke fortrydes)")) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setLoading(true);
      const { error } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('user_id', session.user.id);
        
      if (error) {
        console.error("Fejl ved sletning:", error);
      } else {
        setItems([]);
      }
      setLoading(false);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Stop routing til item details
    if (!window.confirm("Vil du slette denne style fra dit skab?")) return;

    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-widest text-[#A69482] animate-pulse">Henter Garderobe...</p>
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
        <h1 className={`${playfair.className} text-4xl text-[#1A1816] mb-2`}>Dit Garderobeskab</h1>
        <p className="text-[10px] uppercase tracking-widest text-[#A69482]">Quiet Luxury Archive</p>
      </header>

      <div className="max-w-4xl mx-auto p-6 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[#2C2825]">Dine Gemte Styles</h2>
          <div className="flex gap-4">
            {items.length > 0 && (
              <button 
                onClick={handleClearWardrobe}
                className="flex items-center gap-2 border border-[#E5E0D8] text-[#A69482] px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-[#F2EFEB] transition-colors"
              >
                <Trash2 size={14} /> Tøm Skab
              </button>
            )}
            <Link href="/">
              <button className="flex items-center gap-2 bg-[#1A1816] text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-[#2C2825] transition-colors">
                <Plus size={14} /> Tilføj Nyt Tøj
              </button>
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#E5E0D8] rounded-sm bg-white">
            <div className="w-16 h-16 bg-[#F2EFEB] rounded-full flex items-center justify-center mx-auto mb-4 text-[#A69482]">
              <Shirt size={24} strokeWidth={1} />
            </div>
            <h3 className={`${playfair.className} text-xl text-[#2C2825] mb-2`}>Dit skab er tomt</h3>
            <p className="text-xs text-[#A69482] mb-6">Start din stylingrejse for at bygge din personlige formelsamling.</p>
            <Link href="/">
              <button className="text-[10px] uppercase tracking-widest border border-[#1A1816] px-6 py-2 hover:bg-[#1A1816] hover:text-white transition-colors">
                Gå til Style Wizard
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-[#E5E0D8] p-6 hover:shadow-lg transition-shadow cursor-pointer group relative">
                <button 
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  className="absolute top-4 right-4 z-10 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center text-[#A69482] hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  title="Slet style"
                >
                  <X size={14} />
                </button>

                <div className="w-full aspect-square bg-[#F2EFEB] mb-4 flex items-center justify-center text-[#A69482] group-hover:text-[#2C2825] transition-colors relative overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
                  ) : (
                    <Shirt size={40} strokeWidth={0.5} />
                  )}
                </div>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-[#A69482] mb-1">{item.category} • {item.color}</span>
                <h3 className={`${playfair.className} text-lg text-[#2C2825]`}>{item.name}</h3>
                
                <Link href={`/wardrobe/${item.id}`}>
                  <button className="mt-4 text-[9px] uppercase tracking-widest text-[#6B5E53] border-b border-[#6B5E53] pb-0.5 group-hover:text-[#1A1816] group-hover:border-[#1A1816]">
                    Krydsmatch →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-[#E5E0D8] flex justify-around items-center p-4 z-50">
        <Link href="/wardrobe" className="flex flex-col items-center text-[#1A1816]">
          <Shirt size={20} className="mb-1" />
          <span className="text-[9px] uppercase tracking-widest font-bold">Garderobe</span>
        </Link>
        <Link href="/" className="flex flex-col items-center text-[#A69482] hover:text-[#1A1816] transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#F2EFEB] flex items-center justify-center -mt-6 border-4 border-white text-[#2C2825] shadow-sm">
            <Plus size={20} />
          </div>
          <span className="text-[9px] uppercase tracking-widest mt-1">Style This</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-[#A69482] hover:text-[#1A1816] transition-colors">
          {session?.user?.user_metadata?.avatar_url ? (
            <img src={session.user.user_metadata.avatar_url} alt="Profil" className="w-5 h-5 rounded-full object-cover mb-1 border border-current" />
          ) : (
            <div className="w-5 h-5 rounded-full border border-current mb-1 flex items-center justify-center">
              <span className="text-[8px]">U</span>
            </div>
          )}
          <span className="text-[9px] uppercase tracking-widest">Profil</span>
        </Link>
      </nav>
    </main>
  );
}
