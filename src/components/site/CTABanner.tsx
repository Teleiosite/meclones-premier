import { Link } from "react-router-dom";

export default function CTABanner() {
  return (
    <section className="bg-navy text-white">
      <div className="container-page py-16 md:py-20 grid md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2">
          <div className="text-[11px] font-bold tracking-[0.3em] text-gold mb-4">ADMISSIONS OPEN · 2026</div>
          <h2 className="display text-4xl md:text-5xl">Give your child the start they deserve.</h2>
          <p className="mt-4 text-white/70 max-w-xl">
            Limited spots available across Nursery, Primary and Secondary. Book a campus tour or apply online today.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/admissions" className="bg-gold text-navy px-7 py-4 font-bold text-sm tracking-wider text-center hover:bg-gold/90 transition">
            START APPLICATION →
          </Link>
          <Link to="/contact" className="border-2 border-white/30 px-7 py-4 font-bold text-sm tracking-wider text-center hover:bg-white/10 transition">
            BOOK A TOUR
          </Link>
        </div>
      </div>
    </section>
  );
}
