import { useState, useMemo } from "react";
import PageHero from "@/components/site/PageHero";
import campusImg from "@/assets/School Building 1.jpeg";
import { Lock, ShieldCheck, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";

const feeMap: Record<string, number> = {
  "Nursery 1": 450000, "Nursery 2": 450000, "Reception": 450000,
  "Primary 1": 525000, "Primary 2": 525000, "Primary 3": 525000,
  "Primary 4": 600000, "Primary 5": 600000, "Primary 6": 600000,
  "JSS 1": 750000, "JSS 2": 750000, "JSS 3": 750000,
  "SS 1": 850000, "SS 2": 850000, "SS 3": 950000,
};

export default function Fees() {
  const [school, setSchool] = useState<"primary" | "secondary">("primary");
  const [klass, setKlass] = useState("");
  const [term, setTerm] = useState("Term 1");

  const classes = useMemo(() =>
    school === "primary"
      ? ["Nursery 1","Nursery 2","Reception","Primary 1","Primary 2","Primary 3","Primary 4","Primary 5","Primary 6"]
      : ["JSS 1","JSS 2","JSS 3","SS 1","SS 2","SS 3"], [school]);

  const amount = klass ? feeMap[klass] : 0;

  const onPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!klass) return toast.error("Please select a class");
    toast.success(`Redirecting to secure payment for ₦${amount.toLocaleString()}...`);
  };

  return (
    <>
      <PageHero
        eyebrow="SECURE FEE PAYMENT"
        title="Pay school fees in under a minute."
        subtitle="A trusted, secure way for parents to pay tuition — with instant confirmation and receipts."
        image={campusImg}
      />

      <section className="bg-cream">
        <div className="container-page py-24 grid lg:grid-cols-12 gap-8">
          {/* FORM */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 border border-navy/10">
            <div className="eyebrow mb-3">PAYMENT DETAILS</div>
            <h2 className="display text-3xl text-navy mb-8">Fee Payment Form</h2>
            <form onSubmit={onPay} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">SCHOOL</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["primary", "secondary"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => { setSchool(s); setKlass(""); }}
                      className={`py-3 text-xs font-bold tracking-wider border-2 transition ${
                        school === s ? "bg-navy text-white border-navy" : "border-navy/20 text-navy hover:border-navy"
                      }`}>{s.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">CLASS</label>
                  <select required value={klass} onChange={(e) => setKlass(e.target.value)} className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy">
                    <option value="">Select class</option>
                    {classes.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">TERM</label>
                  <select value={term} onChange={(e) => setTerm(e.target.value)} className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy">
                    <option>Term 1</option><option>Term 2</option><option>Term 3</option><option>Full Year</option>
                  </select>
                </div>
              </div>
              <Field label="Parent / guardian name" name="parent" />
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Email address" name="email" type="email" />
                <Field label="Phone number" name="phone" type="tel" />
              </div>
              <Field label="Child's full name" name="child" />

              {/* AMOUNT */}
              <div className="bg-cream border border-navy/10 p-6 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold tracking-[0.2em] text-navy/60">AMOUNT DUE</div>
                  <div className="display text-4xl text-navy mt-1">₦{amount.toLocaleString()}</div>
                </div>
                <Receipt className="text-gold" size={36} />
              </div>

              <button type="submit" className="w-full bg-gold text-navy py-5 font-bold text-sm tracking-wider hover:bg-gold/90 transition flex items-center justify-center gap-2">
                <Lock size={16} /> PAY SECURELY NOW
              </button>
              <p className="text-xs text-navy/50 text-center">By proceeding you agree to our Terms. Payments processed by Paystack.</p>
            </form>
          </div>

          {/* TRUST SIDEBAR */}
          <aside className="lg:col-span-5 space-y-5">
            <div className="bg-navy text-white p-7">
              <ShieldCheck className="text-gold mb-4" size={32} />
              <div className="font-display font-bold text-2xl mb-3">100% Secure</div>
              <p className="text-sm text-white/70 leading-relaxed">
                Bank-grade encryption. PCI-DSS compliant. Your card details never touch our servers.
              </p>
            </div>
            <div className="bg-white border border-navy/10 p-7">
              <CreditCard className="text-gold mb-4" size={28} />
              <div className="font-display font-bold text-lg text-navy mb-2">Multiple payment options</div>
              <p className="text-sm text-navy/60 mb-4">Card · Bank transfer · USSD · Direct debit</p>
              <div className="flex flex-wrap gap-2">
                {["VISA","MASTERCARD","VERVE","BANK","USSD"].map((p) => (
                  <div key={p} className="border border-navy/20 px-3 py-1.5 text-[10px] font-bold tracking-wider text-navy">{p}</div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-navy/10 p-7">
              <Receipt className="text-gold mb-4" size={28} />
              <div className="font-display font-bold text-lg text-navy mb-2">Instant receipt</div>
              <p className="text-sm text-navy/60">Official receipt sent to your email immediately. Records visible in the parent portal.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">{label.toUpperCase()}</label>
      <input required type={type} name={name} className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" />
    </div>
  );
}
