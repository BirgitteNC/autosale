"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Playfair_Display } from "next/font/google";
import { ShieldAlert } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Adgangskoderne matcher ikke.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Adgangskoden skal være mindst 6 tegn lang.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Viderestil til forsiden/garderoben når koden er skiftet
      router.push("/wardrobe");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Der opstod en fejl ved skift af adgangskode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-12 text-center w-full">
        <h1 className="text-xl tracking-widest font-light uppercase text-[#2C2825]">Style This</h1>
      </div>

      <div className="w-full max-w-md bg-white border border-[#E5E0D8] p-10 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
            <ShieldAlert size={20} />
          </div>
          <h2 className={`${playfair.className} text-3xl text-[#1A1816] mb-2`}>Skift Adgangskode</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#A69482] leading-relaxed">
            Af sikkerhedsmæssige årsager beder vi dig udskifte den Brainstore-genererede adgangskode med din egen.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 rounded-sm mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#6B5E53] mb-2">Ny Adgangskode</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-b border-[#E5E0D8] bg-transparent py-2 text-sm focus:outline-none focus:border-[#A69482] transition-colors"
              placeholder="Mindst 6 tegn"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#6B5E53] mb-2">Bekræft Ny Adgangskode</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-b border-[#E5E0D8] bg-transparent py-2 text-sm focus:outline-none focus:border-[#A69482] transition-colors"
              placeholder="Gentag ny adgangskode"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1816] text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#2C2825] transition-colors disabled:opacity-50"
          >
            {loading ? "Opdaterer..." : "Gem Ny Adgangskode"}
          </button>
        </form>
      </div>
    </main>
  );
}
