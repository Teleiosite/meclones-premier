import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";

const roles = [
  { value: "admin", label: "Admin", path: "/dashboard/admin" },
  { value: "teacher", label: "Teacher", path: "/dashboard/teacher" },
  { value: "student", label: "Student", path: "/dashboard/student" },
  { value: "parent", label: "Parent", path: "/dashboard/parent" },
];

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("admin");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = roles.find((r) => r.value === role)?.path ?? "/";
    navigate(target);
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-wider text-navy mb-2">SIGN IN AS</label>
              <div className="grid grid-cols-4 gap-1 bg-secondary p-1">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`py-2 text-xs font-bold tracking-wider transition ${
                      role === r.value ? "bg-navy text-gold" : "text-navy/70 hover:text-navy"
                    }`}
                  >
                    {r.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-wider text-navy mb-2">EMAIL</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  defaultValue="user@meclones.edu.ng"
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
                  defaultValue="••••••••"
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
              className="w-full bg-navy text-gold py-4 font-bold tracking-wider text-sm hover:bg-navy/90 transition"
            >
              SIGN IN TO PORTAL →
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
