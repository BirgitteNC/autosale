"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Playfair_Display } from "next/font/google";
import { Shirt, ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string;
  fit: string;
}

export default function WardrobeItemPage({ params }: { params: { id: string } }) {
  const [sourceItem, setSourceItem] = useState<WardrobeItem | null>(null);
  const [matches, setMatches] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchItemAndMatches = async () => {
      // 1. Fetch the specific item
      const { data: itemData, error: itemError } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('id', params.id)
        .single();

      if (itemError || !itemData) {
        console.error("Error fetching item:", itemError);
        setLoading(false);
        return;
      }

      setSourceItem(itemData);

      // 2. Cross-matching logic: find balancing items
      // Editorial Volume Rule: If top is oversized, find slim bottom. If top is slim, find oversized bottom.
      let targetCategory = itemData.category === 'top' ? 'bottom' : (itemData.category === 'bottom' ? 'top' : null);
      let targetFits: string[] = [];

      if (itemData.fit === 'oversized' || itemData.fit === 'wide-leg') {
        targetFits = ['slim-fit', 'fitted', 'structured'];
      } else if (itemData.fit === 'slim-fit' || itemData.fit === 'fitted') {
        targetFits = ['oversized', 'wide-leg'];
      } else {
        // Fallback or neutral
        targetFits = ['structured', 'slim-fit', 'wide-leg'];
      }

      // 3. Fetch matching items from the user's wardrobe
      if (targetCategory) {
        const { data: matchData, error: matchError } = await supabase
          .from('wardrobe_items')
          .select('*')
          .eq('category', targetCategory)
          .in('fit', targetFits)
          .neq('id', params.id); // exclude self

        if (!matchError && matchData) {
          setMatches(matchData);
        }
      }

      setLoading(false);
    };

    fetchItemAndMatches();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-widest text-[#A69482] animate-pulse">Analyserer skab...</p>
      </div>
    );
  }

  if (!sourceItem) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center flex-col">
        <p className="text-xs uppercase tracking-widest text-red-800 mb-4">Tøjet blev ikke fundet</p>
        <button onClick={() => router.push('/wardrobe')} className="border-b border-[#1A1816] text-[10px] uppercase">Tilbage</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Header */}
      <header className="pt-16 pb-8 px-6 text-center border-b border-[#E5E0D8] bg-white relative">
        <Link href="/wardrobe" className="absolute top-6 left-6 text-[#A69482] hover:text-[#2C2825] transition-colors" title="Tilbage">
          <ArrowLeft size={20} />
        </Link>
        <h1 className={`${playfair.className} text-4xl text-[#1A1816] mb-2`}>{sourceItem.name}</h1>
        <p className="text-[10px] uppercase tracking-widest text-[#A69482]">
          {sourceItem.category} • {sourceItem.fit} • {sourceItem.color}
        </p>
      </header>

      <div className="max-w-4xl mx-auto p-6 mt-8">
        
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="text-orange-600" size={20} />
          <h2 className="text-sm font-medium tracking-widest uppercase text-[#2C2825]">Proportionale Matches</h2>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-[#A69482]" size={32} strokeWidth={1} />
            <h3 className={`${playfair.className} text-xl text-[#2C2825] mb-2`}>Ingen perfekte matches endnu</h3>
            <p className="text-xs text-[#6B5E53] leading-relaxed max-w-md mx-auto">
              For at skabe balance til denne <strong>{sourceItem.fit}</strong> style, anbefaler vi at parre den med noget, der sidder modsat. 
              Prøv at tilføje mere tøj til din garderobe for at låse op for formlerne.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div key={match.id} className="bg-white border border-[#E5E0D8] p-6 hover:border-[#1A1816] transition-colors flex items-center gap-6">
                <div className="w-24 h-24 bg-[#F2EFEB] shrink-0 flex items-center justify-center text-[#A69482]">
                  <Shirt size={32} strokeWidth={0.5} />
                </div>
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.2em] text-[#A69482] mb-1">Anbefalet til {sourceItem.name}</span>
                  <h3 className={`${playfair.className} text-xl text-[#2C2825] mb-1`}>{match.name}</h3>
                  <p className="text-[10px] text-[#6B5E53] uppercase tracking-widest">Fordi: Skaber balance til {sourceItem.fit}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
