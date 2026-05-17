import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Award, BookOpen, Users, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/School Building 3.jpeg";
import primaryImg from "@/assets/primary School 3.jpeg";
import secondaryImg from "@/assets/slider-meclones-2.jpg";
import gradImg from "@/assets/image5-scaled.jpg";
import CTABanner from "@/components/site/CTABanner";

const slides = [
  {
    image: heroImg,
    eyebrow: "NURSERY — SS3 · EST. 2003",
    titleStart: "BUILT FOR BRILLIANT ",
    titleAccent: "MINDS.",
    subtitle: "Two decades. One promise — the highest standard of education in a calm, modern environment for your child.",
    cta: { label: "EXPLORE PRIMARY", to: "/primary" },
    secondaryCta: { label: "EXPLORE SECONDARY", to: "/secondary" },
  },
  {
    image: primaryImg,
    eyebrow: "PRIMARY · AGES 3–11",
    titleStart: "WHERE CURIOSITY ",
    titleAccent: "BEGINS.",
    subtitle: "Small classes, expert teachers and a joyful start that sets the foundation for a lifetime of learning.",
    cta: { label: "EXPLORE PRIMARY", to: "/primary" },
    secondaryCta: { label: "BOOK A TOUR", to: "/contact" },
  },
  {
    image: secondaryImg,
    eyebrow: "SECONDARY · JSS1 — SS3",
    titleStart: "WHERE AMBITION ",
    titleAccent: "TAKES SHAPE.",
    subtitle: "Rigorous prep for WAEC, NECO, JAMB and top universities at home and abroad.",
    cta: { label: "EXPLORE SECONDARY", to: "/secondary" },
    secondaryCta: { label: "APPLY NOW", to: "/admissions" },
  },
];

const stats = [
  { value: "20", label: "YEARS" },
  { value: "565", label: "STUDENTS" },
  { value: "45", label: "TEACHERS" },
  { value: "100%", label: "EXCELLENCE" },
];

const values = [
  { icon: Award, title: "Academic Excellence", desc: "Rigorous curriculum producing top WAEC, NECO and IGCSE results year after year." },
  { icon: ShieldCheck, title: "Safe Environment", desc: "Secure campus, vetted staff and small class sizes — every child is seen and supported." },
  { icon: BookOpen, title: "Holistic Learning", desc: "Beyond the classroom — sports, arts, leadership and character formation." },
  { icon: Users, title: "Expert Teachers", desc: "Trained, passionate educators with deep subject mastery and a love for children." },
];

const testimonials = [
  { quote: "My daughter has bloomed at Meclones. The teachers truly care, and her confidence has soared.", name: "Mrs. Adeyemi", role: "Parent · Primary 4" },
  { quote: "From JSS1 to graduation — Meclones gave my son discipline, vision and a top university place.", name: "Mr. Okafor", role: "Parent · Alumni" },
  { quote: "The most calm and well-organized school we've experienced. Worth every naira.", name: "Mrs. Bello", role: "Parent · SS2" },
];

export default function Home() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative bg-cream text-navy overflow-hidden border-b border-navy/5">
        <div className="container-page py-16 md:py-24 grid lg:grid-cols-12 gap-12 items-center min-h-[600px] lg:min-h-[700px]">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-6 relative z-10">
            {slides.map((s, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${
                  i === active 
                    ? "opacity-100 relative translate-y-0" 
                    : "opacity-0 pointer-events-none absolute inset-0 translate-y-4"
                }`}
              >
                <div className="eyebrow mb-4 text-navy/60">{s.eyebrow}</div>
                <h1 className="display text-4xl sm:text-5xl md:text-6xl text-navy leading-[1.05] tracking-tight">
                  {s.titleStart}<span className="text-gold">{s.titleAccent}</span>
                </h1>
                <p className="mt-5 text-base md:text-lg text-navy/70 leading-relaxed max-w-xl">{s.subtitle}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={s.cta.to} className="bg-gold text-navy px-7 py-4 font-bold text-xs tracking-widest hover:bg-gold/90 transition inline-flex items-center gap-2">
                    {s.cta.label} <ArrowRight size={14} />
                  </Link>
                  <Link to={s.secondaryCta.to} className="border-2 border-navy text-navy px-7 py-4 font-bold text-xs tracking-widest hover:bg-navy hover:text-white transition">
                    {s.secondaryCta.label}
                  </Link>
                </div>
              </div>
            ))}

            {/* Slide Indicators */}
            <div className="flex gap-2 mt-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 transition-all ${i === active ? "w-10 bg-navy" : "w-5 bg-navy/30"}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Slide Images (Full Width, Premium Aspect Ratio) */}
          <div className="lg:col-span-6 relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] bg-navy overflow-hidden shadow-xl border border-navy/5">
            {slides.map((s, i) => (
              <img
                key={i}
                src={s.image}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                  i === active 
                    ? "opacity-100 scale-100" 
                    : "opacity-0 scale-105 pointer-events-none"
                }`}
              />
            ))}
            {/* Subtle elegant navy shadow transition overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-navy text-white">
        <div className="container-page py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="border-l-2 border-gold pl-4">
              <div className="display text-4xl md:text-5xl text-gold">{s.value}</div>
              <div className="text-[10px] font-bold tracking-[0.25em] text-white/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SCHOOL SELECTOR */}
      <section className="container-page py-24">
        <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-3">CHOOSE YOUR PATH</div>
            <h2 className="display text-4xl md:text-5xl text-navy">One school. Two journeys.</h2>
          </div>
          <p className="text-navy/60 max-w-sm text-sm">A combined campus designed for continuity — from your child's first steps to their graduation day.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { img: primaryImg, eyebrow: "NURSERY · PRIMARY 1–6", title: "Primary School", desc: "Where curiosity is born. A nurturing foundation in literacy, numeracy and character.", to: "/primary" },
            { img: secondaryImg, eyebrow: "JSS 1 · SS 3", title: "Secondary School", desc: "Where ambition takes shape. Rigorous prep for WAEC, NECO, JAMB and beyond.", to: "/secondary" },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="group block bg-white border border-navy/10 hover:border-navy transition">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={c.img} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
              <div className="p-7">
                <div className="eyebrow mb-3">{c.eyebrow}</div>
                <h3 className="display text-3xl text-navy mb-2">{c.title}</h3>
                <p className="text-navy/60 text-sm mb-5">{c.desc}</p>
                <div className="inline-flex items-center gap-2 text-navy font-bold text-xs tracking-wider">
                  EXPLORE <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="bg-cream">
        <div className="container-page py-24">
          <div className="text-center mb-14">
            <div className="eyebrow mb-3">WHY MECLONES</div>
            <h2 className="display text-4xl md:text-5xl text-navy max-w-2xl mx-auto">A school parents trust. A place children love.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((v) => (
              <div key={v.title} className="bg-white p-7 border-t-2 border-gold">
                <v.icon className="text-navy mb-5" size={28} />
                <h3 className="font-display font-bold text-xl text-navy mb-2">{v.title}</h3>
                <p className="text-sm text-navy/60 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRADUATION FEATURE */}
      <section className="container-page py-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={gradImg} alt="Graduation" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="eyebrow mb-4">CLASS OF 2025</div>
          <h2 className="display text-4xl md:text-5xl text-navy mb-6">Every graduate. A future leader.</h2>
          <p className="text-navy/70 mb-6 leading-relaxed">
            100% of our SS3 students earned university placement this year — including in the UK, US, Canada and Nigeria's top federal institutions.
          </p>
          <div className="grid grid-cols-3 gap-6 py-6 border-y border-navy/10">
            <div><div className="display text-3xl text-gold">98%</div><div className="text-[10px] font-bold tracking-[0.2em] text-navy/60 mt-1">UNI PLACEMENT</div></div>
            <div><div className="display text-3xl text-gold">42</div><div className="text-[10px] font-bold tracking-[0.2em] text-navy/60 mt-1">SCHOLARSHIPS</div></div>
            <div><div className="display text-3xl text-gold">14</div><div className="text-[10px] font-bold tracking-[0.2em] text-navy/60 mt-1">COUNTRIES</div></div>
          </div>
          <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-navy font-bold text-sm tracking-wider border-b-2 border-gold pb-1">
            OUR STORY <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-navy text-white">
        <div className="container-page py-24">
          <div className="text-center mb-14">
            <div className="text-[11px] font-bold tracking-[0.3em] text-gold mb-3">PARENT VOICES</div>
            <h2 className="display text-4xl md:text-5xl">Trusted by families across Nigeria.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-7">
                <div className="text-gold display text-4xl leading-none mb-4">"</div>
                <p className="text-white/85 leading-relaxed mb-6">{t.quote}</p>
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-xs text-white/50">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
