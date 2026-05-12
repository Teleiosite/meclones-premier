import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ROLE_PATHS: Record<string, string> = {
  admin:   "/dashboard/admin",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
  parent:  "/dashboard/parent",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Login failed. Please check your credentials.");
      setLoading(false);
      return;
    }

    // Fetch the user's role from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role;
    
    if (!role) {
      setError("Authenticated successfully, but no user profile found. Please contact an administrator to assign your role.");
      setLoading(false);
      // Optional: sign out if they shouldn't be in the app at all without a profile
      // await supabase.auth.signOut();
      return;
    }

    const destination = from || ROLE_PATHS[role] || "/";
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-navy text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
        <Link to="/" className="flex items-center gap-3 relative">
          <div className="w-10 h-10 bg-gold flex items-center justify-center text-navy font-black">M</div>
          <span className="font-bold tracking-wide">MECLONES ACADEMY</span>
        </Link>
        <div className="relative">
          <p className="eyebrow text-gold mb-4">Digital Platform</p>
          <h1 className="display text-5xl mb-4">Welcome back to the portal.</h1>
          <p className="text-white/70 max-w-md">
            Manage attendance, payments, results, and communication — all in one secure place.
          </p>
        </div>
        <div className="flex items-center gap-3 text-white/60 text-sm relative">
          <ShieldCheck size={18} className="text-gold" />
          Bank-grade encryption · 256-bit SSL
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-navy flex items-center justify-center text-gold font-black">M</div>
            <span className="font-bold tracking-wide text-navy">MECLONES ACADEMY</span>
          </div>

          <p className="eyebrow mb-3">Sign in</p>
          <h2 className="font-display text-4xl font-black text-navy mb-2">Access your dashboard</h2>
          <p className="text-muted-foreground mb-8">Enter your credentials to continue.</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-wider text-navy mb-2">EMAIL</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@meclones.edu.ng"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border focus:border-navy focus:outline-none text-navy"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold tracking-wider text-navy">PASSWORD</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-navy hover:text-accent">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-border focus:border-navy focus:outline-none text-navy"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" className="accent-navy" />
              Keep me signed in for 30 days
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-gold py-4 font-bold tracking-wider text-sm hover:bg-navy/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "SIGNING IN..." : "SIGN IN TO PORTAL →"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              New parent?{" "}
              <Link to="/admissions" className="text-navy font-semibold hover:underline">
                Apply for admission
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
