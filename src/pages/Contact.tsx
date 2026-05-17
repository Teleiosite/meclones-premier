import { useState } from "react";
import PageHero from "@/components/site/PageHero";
import campusImg from "@/assets/Gallary 11.jpeg";
import { Mail, Phone, MapPin, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("contact_enquiries").insert({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message
      });

      if (error) throw error;

      toast.success("Message sent! Our team will reach out to you shortly.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("Contact form error:", err);
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <PageHero
        eyebrow="GET IN TOUCH"
        title="We'd love to hear from you."
        subtitle="Whether you're booking a tour, asking about admissions, or simply curious — we respond fast."
        image={campusImg}
      />

      <section className="container-page py-24 grid lg:grid-cols-12 gap-10">
        {/* INFO */}
        <div className="lg:col-span-5 space-y-5">
          {[
            { icon: MapPin, label: "VISIT", value: "Plot 19 Road 15, Lekki Atlantic Gardens, Alabeko, Eti-Osa, Lagos" },
            { icon: Phone, label: "CALL", value: "0806 024 6634" },
            { icon: Mail, label: "EMAIL", value: "hello@meclones.edu" },
            { icon: Clock, label: "OFFICE HOURS", value: "Mon – Fri · 8:00 – 17:00" },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-navy/10 p-6 flex gap-5">
              <div className="w-12 h-12 bg-navy text-gold flex items-center justify-center shrink-0">
                <c.icon size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.25em] text-gold mb-1">{c.label}</div>
                <div className="font-display text-lg text-navy">{c.value}</div>
              </div>
            </div>
          ))}
          <div className="bg-navy text-white p-7">
            <div className="text-[11px] font-bold tracking-[0.3em] text-gold mb-3">QUICK RESPONSE PROMISE</div>
            <p className="text-white/80 leading-relaxed text-sm">
              Every enquiry is answered within 24 hours by a real member of our admissions team — never a bot.
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="lg:col-span-7 bg-white p-8 md:p-10 border border-navy/10">
          <div className="eyebrow mb-3">SEND A MESSAGE</div>
          <h2 className="display text-3xl text-navy mb-8">How can we help?</h2>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Your name" name="name" value={form.name} onChange={(val) => setForm({ ...form, name: val })} />
              <Field label="Email address" name="email" type="email" value={form.email} onChange={(val) => setForm({ ...form, email: val })} />
            </div>
            <Field label="Subject" name="subject" value={form.subject} onChange={(val) => setForm({ ...form, subject: val })} />
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">MESSAGE</label>
              <textarea required rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" />
            </div>
            <button type="submit" disabled={loading} className="bg-navy text-white px-8 py-4 font-bold text-sm tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "SENDING..." : "SEND MESSAGE →"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ label, name, value, onChange, type = "text" }: { label: string; name: string; value: string; onChange: (val: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">{label.toUpperCase()}</label>
      <input required type={type} name={name} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-navy/20 px-4 py-3 bg-white text-navy focus:outline-none focus:border-navy" />
    </div>
  );
}

