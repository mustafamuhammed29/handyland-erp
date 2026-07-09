"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] text-white p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Wrench className="w-6 h-6 text-[#111827]" />
            </div>
            <span className="text-3xl font-bold tracking-wider uppercase bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              HANDYLAND
            </span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Interner Login</h1>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">E-Mail Adresse</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                placeholder="Mitarbeiter E-Mail"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Passwort</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20 mt-4"
            >
              {isLoading ? "Wird eingeloggt..." : "Einloggen"}
            </button>
          </form>
        </div>
        
        <p className="text-center text-gray-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} HANDYLAND. Nur für autorisiertes Personal.
        </p>

      </div>
    </div>
  );
}
