import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <div className="w-full max-w-md bg-white border border-border p-8 sm:p-10 shadow-sm">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy mb-6">
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        {!sent ? (
          <>
            <p className="eyebrow mb-3">Account recovery</p>
            <h1 className="font-display text-3xl font-black text-navy mb-2">Forgot your password?</h1>
            <p className="text-muted-foreground mb-8">
              Enter the email linked to your portal account and we'll send a secure reset link.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-xs font-bold tracking-wider text-navy mb-2">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="you@meclones.edu.ng"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-border focus:border-navy focus:outline-none text-navy"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-navy text-gold py-4 font-bold tracking-wider text-sm hover:bg-navy/90 transition"
              >
                SEND RESET LINK →
              </button>
              <p className="text-xs text-muted-foreground text-center">
                Need help? Contact <span className="text-navy font-semibold">support@meclones.edu.ng</span>
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 mx-auto bg-gold/20 flex items-center justify-center mb-5">
              <CheckCircle2 size={28} className="text-navy" />
            </div>
            <h1 className="font-display text-2xl font-black text-navy mb-2">Check your inbox</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link. It will expire in 30 minutes.
            </p>
            <Link
              to="/login"
              className="inline-block bg-navy text-gold px-6 py-3 font-bold tracking-wider text-sm hover:bg-navy/90"
            >
              RETURN TO SIGN IN
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
