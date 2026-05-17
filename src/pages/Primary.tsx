import PageHero from "@/components/site/PageHero";
import CTABanner from "@/components/site/CTABanner";
import primaryImg from "@/assets/primary School 4.jpeg";
import classroomImg from "@/assets/classroom.jpg";
import campusImg from "@/assets/campus.jpg";
import gradImg from "@/assets/graduation.jpg";
import secondaryImg from "@/assets/secondary.jpg";
import heroImg from "@/assets/hero-students.jpg";
import { Heart, Palette, Music, Trophy } from "lucide-react";

const programmes = [
  { name: "Nursery 1", age: "Age 3" },
  { name: "Nursery 2", age: "Age 4" },
  { name: "Reception", age: "Age 5" },
  { name: "Primary 1", age: "Age 6" },
  { name: "Primary 2", age: "Age 7" },
  { name: "Primary 3", age: "Age 8" },
  { name: "Primary 4", age: "Age 9" },
  { name: "Primary 5", age: "Age 10" },
  { name: "Primary 6", age: "Age 11" },
];

const features = [
  { icon: Heart, title: "Pastoral Care", desc: "Every child has a dedicated form teacher who knows them by name." },
  { icon: Palette, title: "Creative Arts", desc: "Drawing, drama, crafts and storytelling woven into every week." },
  { icon: Music, title: "Music & Movement", desc: "Choir, recorder, dance and physical literacy from age 3." },
  { icon: Trophy, title: "Sports & Play", desc: "Football, athletics, swimming and structured outdoor learning." },
];

const fees = [
  { class: "Nursery 1 – Reception", term: "₦450,000", year: "₦1,350,000" },
  { class: "Primary 1 – Primary 3", term: "₦525,000", year: "₦1,575,000" },
  { class: "Primary 4 – Primary 6", term: "₦600,000", year: "₦1,800,000" },
];

export default function Primary() {
  return (
    <>
      <PageHero
        eyebrow="PRIMARY SCHOOL · AGES 3–11"
        title="Where curious minds take their first big leap."
        subtitle="A nurturing, joyful start with strong foundations in literacy, numeracy and character — guided by teachers who truly know your child."
        cta={{ label: "BOOK A TOUR", to: "/contact" }}
        secondaryCta={{ label: "APPLY NOW", to: "/admissions" }}
        image={primaryImg}
      />

      {/* OVERVIEW */}
      <section className="container-page py-24 grid md:grid-cols-2 gap-12">
        <div>
          <div className="eyebrow mb-3">OUR APPROACH</div>
          <h2 className="display text-4xl text-navy mb-6">Small classes. Big care. Real results.</h2>
          <p className="text-navy/70 leading-relaxed mb-4">
            Our primary school is built around the belief that the early years matter most. With a maximum of 18 children per class and a 1:9 teacher ratio, every child is seen, supported and stretched.
          </p>
          <p className="text-navy/70 leading-relaxed">
            We blend the Nigerian curriculum with British primary best practice — phonics, mental maths, science enquiry and the creative arts.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-navy/10">
          {[
            { v: "1:9", l: "TEACHER RATIO" },
            { v: "18", l: "MAX CLASS SIZE" },
            { v: "9", l: "YEAR GROUPS" },
            { v: "5", l: "LANGUAGES" },
            { v: "12", l: "CLUBS" },
            { v: "100%", l: "READING" },
          ].map((s) => (
            <div key={s.l} className="bg-cream p-6 text-center">
              <div className="display text-3xl text-gold">{s.v}</div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-navy/60 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMMES */}
      <section className="bg-cream">
        <div className="container-page py-24">
          <div className="eyebrow mb-3">YEAR GROUPS</div>
          <h2 className="display text-4xl text-navy mb-10">Programmes from Nursery to Primary 6.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
            {programmes.map((p, i) => (
              <div key={p.name} className="bg-white p-6 border border-navy/10 hover:border-navy transition group">
                <div className="text-[10px] font-bold tracking-[0.2em] text-gold mb-2">0{i + 1}</div>
                <div className="display text-2xl text-navy">{p.name}</div>
                <div className="text-sm text-navy/60 mt-1">{p.age}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-page py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] overflow-hidden order-2 md:order-1">
            <img src={classroomImg} alt="Primary classroom" loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="order-1 md:order-2">
            <div className="eyebrow mb-3">BEYOND ACADEMICS</div>
            <h2 className="display text-4xl text-navy mb-8">A whole-child education.</h2>
            <div className="space-y-5">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-12 h-12 bg-navy text-gold flex items-center justify-center shrink-0">
                    <f.icon size={20} />
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg text-navy">{f.title}</div>
                    <div className="text-sm text-navy/60">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-cream">
        <div className="container-page py-24">
          <div className="eyebrow mb-3">CAMPUS LIFE</div>
          <h2 className="display text-4xl text-navy mb-10">A day at Primary Meclones.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { src: classroomImg, label: "Learning in action" },
              { src: primaryImg, label: "Outdoor play" },
              { src: campusImg, label: "Our beautiful campus" },
              { src: heroImg, label: "Focused learners" },
              { src: gradImg, label: "Prize giving day" },
              { src: secondaryImg, label: "School community" },
            ].map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden group relative">
                <img
                  src={img.src}
                  alt={img.label}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                  <span className="text-white text-xs font-bold tracking-wider">{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEES */}
      <section className="bg-navy text-white">
        <div className="container-page py-24">
          <div className="text-[11px] font-bold tracking-[0.3em] text-gold mb-3">PRIMARY FEES · 2026 SESSION</div>
          <h2 className="display text-4xl md:text-5xl mb-10">Transparent fees. No surprises.</h2>
          <div className="bg-white/5 border border-white/10">
            <div className="grid grid-cols-3 px-6 py-4 text-[11px] font-bold tracking-[0.2em] text-white/60 border-b border-white/10">
              <div>CLASS</div><div>PER TERM</div><div>PER YEAR</div>
            </div>
            {fees.map((f) => (
              <div key={f.class} className="grid grid-cols-3 px-6 py-5 border-b border-white/5 last:border-0">
                <div className="font-medium text-sm md:text-base">{f.class}</div>
                <div className="display text-xl text-gold">{f.term}</div>
                <div className="display text-xl text-white">{f.year}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/50">Fees include tuition, books and meals. Uniforms and excursions billed separately.</p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
