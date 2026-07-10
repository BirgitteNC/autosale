"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Playfair_Display } from "next/font/google";
import { Lock } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mock Login Logic for prototype (hvis databasen ikke er sat op endnu)
    // Her kalder vi normalt Supabase auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check om brugeren skal skifte password (vi tjekker et custom metadata felt 'force_password_change' eller viderestiller altid første gang i prototypen)
      // I dette test setup viderestiller vi til "Skift Kodeord", hvis kodeordet matcher et bestemt "Brainstore" mønster.
      if (password.toLowerCase().startsWith("brainstore_")) {
        router.push("/login/change-password");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ugyldigt login. Tjek din Brainstore adgangskode.");
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
          <div className="w-12 h-12 bg-[#F2EFEB] rounded-full flex items-center justify-center mx-auto mb-4 text-[#A69482]">
            <Lock size={20} />
          </div>
          <h2 className={`${playfair.className} text-3xl text-[#1A1816] mb-2`}>Log Ind</h2>
          <p className="text-[10px] uppercase tracking-widest text-[#A69482]">Adgang købt via Brainstore.dk</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 rounded-sm mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#6B5E53] mb-2">Email Adresse</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-[#E5E0D8] bg-transparent py-2 text-sm focus:outline-none focus:border-[#A69482] transition-colors"
              placeholder="din@email.dk"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#6B5E53] mb-2">Brainstore Adgangskode</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-[#E5E0D8] bg-transparent py-2 text-sm focus:outline-none focus:border-[#A69482] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1816] text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#2C2825] transition-colors disabled:opacity-50"
          >
            {loading ? "Logger ind..." : "Lås Garderoben Op"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E0D8] text-center">
          <p className="text-[10px] text-[#A69482] uppercase tracking-widest">
            Ikke medlem? <a href="#" className="underline font-bold">Køb adgang her</a>
          </p>
        </div>
      </div>
    </main>
  );
}
