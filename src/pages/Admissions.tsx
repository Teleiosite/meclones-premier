import { useState } from "react";
import PageHero from "@/components/site/PageHero";
import heroImg from "@/assets/mecangel-logo (1).png";
import { CheckCircle2, FileText, Calendar, MessageCircle, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const steps = [
  { n: "01", title: "Enquiry", desc: "Submit a quick form. We respond within 24 hours." },
  { n: "02", title: "Campus Tour", desc: "Visit us. Meet the teachers. See your child's future home." },
  { n: "03", title: "Assessment", desc: "Friendly age-appropriate assessment + parent interview." },
  { n: "04", title: "Offer & Enrol", desc: "Receive your offer. Pay deposit. Welcome to Meclones." },
];

const requirements = [
  "Completed application form",
  "Birth certificate (copy)",
  "Two recent passport photographs",
  "Last school report (for transfers)",
  "Immunisation record (Primary)",
  "Parent / guardian ID",
];

const faqs = [
  { q: "When does the academic year begin?", a: "September each year, with three terms running through July." },
  { q: "Do you offer scholarships?", a: "Yes — academic merit and need-based scholarships are awarded annually." },
  { q: "Is boarding available?", a: "Boarding is available for SS1–SS3 students only." },
  { q: "How long does the application take?", a: "From enquiry to offer, typically 2–3 weeks." },
];

export default function Admissions() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    parent_name: "", parent_phone: "", parent_email: "",
    applicant_name: "", class_applying: "", notes: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("admissions").insert({
      applicant_name: formData.applicant_name,
      class_applying: formData.class_applying,
      parent_name:    formData.parent_name,
      parent_email:   formData.parent_email,
      parent_phone:   formData.parent_phone,
      notes:          formData.notes || null,
      status:         "Pending",
    });

    if (error) {
      toast.error("Failed to submit. Please try again.");
    } else {
      toast.success("Application received! We'll be in touch within 24 hours.");
      setFormData({ parent_name: "", parent_phone: "", parent_email: "", applicant_name: "", class_applying: "", notes: "" });
    }
    setSubmitting(false);
  };

  return (
    <>
      <PageHero
        eyebrow="ADMISSIONS · 2026 SESSION OPEN"
        title="Begin your child's Meclones journey."
        subtitle="A simple four-step process. Real human responses. Decisions in two weeks."
        cta={{ label: "APPLY NOW", to: "#form" }}
        secondaryCta={{ label: "BOOK A TOUR", to: "/contact" }}
        image={heroImg}
        imageClassName="object-contain"
      />

      {/* STEPS */}
      <section className="container-page py-24">
        <div className="eyebrow mb-3">HOW IT WORKS</div>
        <h2 className="display text-4xl text-navy mb-12">Four steps. That's it.</h2>
        <div className="grid md:grid-cols-4 gap-px bg-navy/10">
          {steps.map((s) => (
            <div key={s.n} className="bg-cream p-7">
              <div className="display text-5xl text-gold mb-4">{s.n}</div>
              <div className="font-display font-bold text-xl text-navy mb-2">{s.title}</div>
              <div className="text-sm text-navy/60">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="bg-cream">
        <div className="container-page py-24 grid lg:grid-cols-12 gap-10">
          {/* FORM */}
          <div id="form" className="lg:col-span-8 bg-white p-8 md:p-10 border border-navy/10">
            <div className="eyebrow mb-3">START YOUR APPLICATION</div>
            <h2 className="display text-3xl md:text-4xl text-navy mb-8">Tell us about your child.</h2>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">PARENT / GUARDIAN NAME</label>
                  <input required value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})}
                    className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">PHONE NUMBER</label>
                  <input type="tel" required value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})}
                    className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">EMAIL ADDRESS</label>
                <input type="email" required value={formData.parent_email} onChange={e => setFormData({...formData, parent_email: e.target.value})}
                  className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">CHILD'S FULL NAME</label>
                  <input required value={formData.applicant_name} onChange={e => setFormData({...formData, applicant_name: e.target.value})}
                    className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">CLASS APPLYING FOR</label>
                  <select required value={formData.class_applying} onChange={e => setFormData({...formData, class_applying: e.target.value})}
                    className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy">
                    <option value="">Select a class</option>
                    <optgroup label="Primary">
                      <option>Nursery 1</option><option>Nursery 2</option><option>Reception</option>
                      <option>Primary 1</option><option>Primary 2</option><option>Primary 3</option>
                      <option>Primary 4</option><option>Primary 5</option><option>Primary 6</option>
                    </optgroup>
                    <optgroup label="Secondary">
                      <option>JSS 1</option><option>JSS 2</option><option>JSS 3</option>
                      <option>SS 1</option><option>SS 2</option><option>SS 3</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">ANYTHING WE SHOULD KNOW?</label>
                <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" />
              </div>
              <button type="submit" disabled={submitting}
                className="bg-navy text-white px-8 py-4 font-bold text-sm tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION →"}
              </button>
            </form>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-navy text-white p-7">
              <div className="text-[11px] font-bold tracking-[0.3em] text-gold mb-4">WHY MECLONES</div>
              <ul className="space-y-3">
                {["Top 10 school in Lagos", "100% WAEC pass rate", "1:9 teacher ratio", "98% university placement", "Calm, modern campus"].map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-white/85">
                    <CheckCircle2 size={18} className="text-gold shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-navy/10 p-7">
              <FileText className="text-gold mb-3" size={24} />
              <div className="font-display font-bold text-lg text-navy mb-3">Documents needed</div>
              <ul className="space-y-2 text-sm text-navy/70">
                {requirements.map((r) => <li key={r}>· {r}</li>)}
              </ul>
            </div>

            <div className="bg-white border border-navy/10 p-7">
              <Calendar className="text-gold mb-3" size={24} />
              <div className="font-display font-bold text-lg text-navy mb-2">Key dates</div>
              <div className="text-sm text-navy/70 space-y-2">
                <div className="flex justify-between"><span>Applications open</span><span className="font-bold text-navy">Now</span></div>
                <div className="flex justify-between"><span>Assessments</span><span className="font-bold text-navy">Mar 2026</span></div>
                <div className="flex justify-between"><span>Term begins</span><span className="font-bold text-navy">Sep 2026</span></div>
              </div>
            </div>

            <div className="bg-gold p-7">
              <MessageCircle className="text-navy mb-3" size={24} />
              <div className="font-display font-bold text-lg text-navy mb-2">Questions?</div>
              <div className="text-sm text-navy/80 mb-4">Talk to our admissions team — we respond fast.</div>
              <a href="tel:+2348000000000" className="inline-block bg-navy text-white px-5 py-3 text-xs font-bold tracking-wider">CALL US →</a>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-24 max-w-3xl">
        <div className="eyebrow mb-3">FREQUENTLY ASKED</div>
        <h2 className="display text-4xl text-navy mb-10">Quick answers.</h2>
        <div className="border-t border-navy/10">
          {faqs.map((f, i) => (
            <button
              key={f.q}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full text-left border-b border-navy/10 py-6 group"
            >
              <div className="flex justify-between items-center gap-4">
                <span className="font-display font-bold text-lg text-navy">{f.q}</span>
                <ChevronDown size={20} className={`text-navy transition shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
              </div>
              {openFaq === i && <p className="mt-3 text-navy/70">{f.a}</p>}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">{label.toUpperCase()}</label>
      <input
        required
        type={type}
        name={name}
        className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy"
      />
    </div>
  );
}
