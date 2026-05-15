import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Ensure we have an active session (Supabase automatically handles the hash fragment)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session is found, it means the recovery link was invalid or expired
        // But we wait a moment as the hash fragment might be processing
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    toast.success("Password updated successfully!");

    // Redirect after a short delay
    setTimeout(() => {
      navigate("/login");
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <div className="w-full max-w-md bg-white border border-border p-8 sm:p-10 shadow-sm">
        {!success ? (
          <>
            <p className="eyebrow mb-3">Security update</p>
            <h1 className="font-display text-3xl font-black text-navy mb-2">Set new password</h1>
            <p className="text-muted-foreground mb-8">
              Your identity has been verified. Choose a strong new password for your account.
            </p>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold tracking-wider text-navy mb-2">NEW PASSWORD</label>
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

              <div>
                <label className="block text-xs font-bold tracking-wider text-navy mb-2">CONFIRM PASSWORD</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-border focus:border-navy focus:outline-none text-navy"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy text-gold py-4 font-bold tracking-wider text-sm hover:bg-navy/90 transition disabled:opacity-60"
              >
                {loading ? "UPDATING..." : "RESET PASSWORD →"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto bg-emerald-100 flex items-center justify-center mb-5">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h1 className="font-display text-2xl font-black text-navy mb-2">Success!</h1>
            <p className="text-muted-foreground mb-6">
              Your password has been updated. You will be redirected to the sign-in page in a moment.
            </p>
            <Link
              to="/login"
              className="inline-block bg-navy text-gold px-6 py-3 font-bold tracking-wider text-sm hover:bg-navy/90"
            >
              SIGN IN NOW
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
