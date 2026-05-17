import PageHero from "@/components/site/PageHero";
import CTABanner from "@/components/site/CTABanner";
import secondaryImg from "@/assets/secondary.jpg";
import gradImg from "@/assets/graduation.jpg";
import { FlaskConical, Globe, Code, Calculator } from "lucide-react";

const programmes = [
  { name: "JSS 1", focus: "Foundation Year" },
  { name: "JSS 2", focus: "Core Curriculum" },
  { name: "JSS 3", focus: "BECE Preparation" },
  { name: "SS 1", focus: "Subject Specialisation" },
  { name: "SS 2", focus: "Mock Examinations" },
  { name: "SS 3", focus: "WAEC · NECO · JAMB" },
];

const exams = ["WAEC", "NECO", "JAMB", "IGCSE", "SAT", "IELTS"];

const tracks = [
  { icon: FlaskConical, name: "Sciences", desc: "Biology, Chemistry, Physics, Further Maths" },
  { icon: Calculator, name: "Commercial", desc: "Accounting, Economics, Commerce, Business" },
  { icon: Globe, name: "Arts", desc: "Literature, Government, History, CRS/IRS" },
  { icon: Code, name: "Technology", desc: "Computer Science, ICT, Coding & Robotics" },
];

const fees = [
  { class: "JSS 1 – JSS 3", term: "₦750,000", year: "₦2,250,000" },
  { class: "SS 1 – SS 2", term: "₦850,000", year: "₦2,550,000" },
  { class: "SS 3 (Exam Year)", term: "₦950,000", year: "₦2,850,000" },
];

export default function Secondary() {
  return (
    <>
      <PageHero
        eyebrow="SECONDARY SCHOOL · JSS1 – SS3"
        title="Where ambition meets opportunity."
        subtitle="A rigorous academic journey preparing students for top universities at home and abroad — backed by exceptional teachers and a track record of results."
        cta={{ label: "APPLY NOW", to: "/admissions" }}
        secondaryCta={{ label: "DOWNLOAD PROSPECTUS", to: "/contact" }}
        image={secondaryImg}
      />

      {/* RESULTS BAR */}
      <section className="bg-gold">
        <div className="container-page py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: "100%", l: "WAEC PASS" },
            { v: "94%", l: "5+ CREDITS" },
            { v: "98%", l: "UNIVERSITY" },
            { v: "42", l: "SCHOLARSHIPS" },
          ].map((s) => (
            <div key={s.l}>
              <div className="display text-4xl md:text-5xl text-navy">{s.v}</div>
              <div className="text-[10px] font-bold tracking-[0.25em] text-navy/70 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMMES */}
      <section className="container-page py-24">
        <div className="eyebrow mb-3">PROGRAMME STRUCTURE</div>
        <h2 className="display text-4xl text-navy mb-10">Six years. One trajectory.</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {programmes.map((p, i) => (
            <div key={p.name} className="bg-white border border-navy/10 p-6 hover:border-navy transition">
              <div className="text-[10px] font-bold tracking-[0.2em] text-gold mb-2">YEAR 0{i + 1}</div>
              <div className="display text-2xl text-navy">{p.name}</div>
              <div className="text-sm text-navy/60 mt-1">{p.focus}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKS */}
      <section className="bg-cream">
        <div className="container-page py-24">
          <div className="eyebrow mb-3">SS SPECIALISATION</div>
          <h2 className="display text-4xl text-navy mb-10">Four senior secondary tracks.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tracks.map((t) => (
              <div key={t.name} className="bg-white p-7 border-t-2 border-navy">
                <t.icon className="text-gold mb-5" size={32} />
                <h3 className="display text-2xl text-navy mb-2">{t.name}</h3>
                <p className="text-sm text-navy/60">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAM PREP */}
      <section className="container-page py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="eyebrow mb-3">EXAM PREPARATION</div>
          <h2 className="display text-4xl text-navy mb-6">Built for results that open doors.</h2>
          <p className="text-navy/70 leading-relaxed mb-8">
            Every student is prepared not just to pass — but to excel. Dedicated exam prep classes, mock seasons, university counselling and one-on-one mentoring.
          </p>
          <div className="flex flex-wrap gap-2">
            {exams.map((e) => (
              <div key={e} className="border-2 border-navy text-navy px-5 py-2.5 text-xs font-bold tracking-[0.15em]">{e}</div>
            ))}
          </div>
        </div>
        <div className="aspect-[4/5] overflow-hidden">
          <img src={gradImg} alt="Graduates" loading="lazy" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* ACHIEVEMENTS STRIP */}
      <section className="bg-cream">
        <div className="container-page py-24">
          <div className="eyebrow mb-3">HALL OF ACHIEVEMENT</div>
          <h2 className="display text-4xl text-navy mb-10">Results that speak for themselves.</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: "Adaeze Okonkwo", award: "WAEC Best Student — Lagos State", year: "2025", score: "7 A1s" },
              { name: "Emeka Nwosu", award: "JAMB Score — 340/400", year: "2025", score: "Top 1%" },
              { name: "Fatima Al-Hassan", award: "British Council Essay Prize", year: "2024", score: "National Winner" },
              { name: "Chukwudi Obi", award: "University of Lagos Full Scholarship", year: "2024", score: "Medicine" },
              { name: "Blessing Eze", award: "National Mathematics Olympiad — Gold", year: "2024", score: "1st Place" },
              { name: "Tomiwa Adeyemi", award: "International Baccalaureate Score", year: "2023", score: "42/45" },
            ].map((a, i) => (
              <div key={i} className="bg-white border border-navy/10 p-6 flex gap-5 items-start hover:border-navy transition">
                <div className="text-[10px] font-bold tracking-[0.25em] text-gold bg-gold/10 px-2 py-1 mt-1 shrink-0">{a.year}</div>
                <div>
                  <div className="font-display font-bold text-lg text-navy">{a.name}</div>
                  <div className="text-sm text-navy/70 mt-1">{a.award}</div>
                  <div className="mt-2 text-xs font-bold tracking-wider text-gold">{a.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEES */}
      <section className="bg-navy text-white">
        <div className="container-page py-24">
          <div className="text-[11px] font-bold tracking-[0.3em] text-gold mb-3">SECONDARY FEES · 2026 SESSION</div>
          <h2 className="display text-4xl md:text-5xl mb-10">Invest in their future.</h2>
          <div className="bg-white/5 border border-white/10">
            <div className="hidden md:grid grid-cols-3 px-6 py-4 text-[11px] font-bold tracking-[0.2em] text-white/60 border-b border-white/10">
              <div>CLASS</div><div>PER TERM</div><div>PER YEAR</div>
            </div>
            {fees.map((f) => (
              <div key={f.class} className="grid md:grid-cols-3 gap-6 md:gap-4 px-6 py-6 md:py-5 border-b border-white/5 last:border-0">
                <div>
                  <div className="md:hidden text-[10px] font-bold tracking-[0.2em] text-white/60 mb-1.5">CLASS</div>
                  <div className="font-medium text-lg md:text-base">{f.class}</div>
                </div>
                <div>
                  <div className="md:hidden text-[10px] font-bold tracking-[0.2em] text-white/60 mb-1.5">PER TERM</div>
                  <div className="display text-3xl md:text-xl text-gold">{f.term}</div>
                </div>
                <div>
                  <div className="md:hidden text-[10px] font-bold tracking-[0.2em] text-white/60 mb-1.5">PER YEAR</div>
                  <div className="display text-3xl md:text-xl text-white">{f.year}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/50">Boarding fees available on request. Sibling and early-payment discounts apply.</p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
