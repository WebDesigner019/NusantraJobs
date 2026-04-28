import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, Mail, Lock, Eye, EyeOff, User, Building2 } from "lucide-react";
import { toast } from "sonner";

async function getSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Role = "seeker" | "employer";

function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const routeAfterLogin = async () => {
    const supabase = await getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);
    const isEmployer = roles?.some((r) => r.role === "employer");
    navigate({ to: isEmployer ? "/employer" : "/seeker" });
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/seeker`,
      });
      if (result.error) {
        toast.error(result.error instanceof Error ? result.error.message : "Login Google gagal");
      } else if (!result.redirected) {
        await routeAfterLogin();
      }
    } catch (err: any) {
      toast.error(err.message || "Login Google gagal");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      const supabase = await getSupabase();
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName.trim() || email.split("@")[0],
              role,
            },
          },
        });
        if (error) throw error;
        // Try to sign in immediately (works if email confirmation off)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          toast.success("Akun dibuat. Silakan cek email untuk konfirmasi.");
          setIsSignUp(false);
        } else {
          toast.success("Akun berhasil dibuat!");
          await routeAfterLogin();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        await routeAfterLogin();
      }
    } catch (err: any) {
      toast.error(err.message || "Autentikasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-gradient-to-b from-amber-50/40 via-white to-white">
      <div className="max-w-md w-full">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-lg bg-[#FDAA3E] flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">NusantaraJobs</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200 p-8">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isSignUp ? "Daftar Akun" : "Masuk"}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              {isSignUp ? "Mulai perjalanan kariermu" : "Selamat datang kembali"}
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 transition active:scale-[0.98] disabled:opacity-40"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? "Mohon tunggu..." : "Lanjutkan dengan Google"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">atau</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("seeker")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-semibold transition ${role === "seeker" ? "border-[#FDAA3E] bg-amber-50 text-slate-900" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
                  >
                    <User className="w-4 h-4" />
                    Pencari Kerja
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("employer")}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-xs font-semibold transition ${role === "employer" ? "border-[#FDAA3E] bg-amber-50 text-slate-900" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
                  >
                    <Building2 className="w-4 h-4" />
                    Perusahaan
                  </button>
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min. 6 karakter)"
                className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#FDAA3E] text-slate-900 py-3.5 text-sm font-bold hover:bg-[#fdb95e] transition active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-amber-500/20"
            >
              {loading ? "Mohon tunggu..." : isSignUp ? "Daftar Sekarang" : "Masuk"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#FDAA3E] font-semibold hover:underline"
          >
            {isSignUp ? "Masuk" : "Daftar"}
          </button>
        </p>
      </div>
    </div>
  );
}
