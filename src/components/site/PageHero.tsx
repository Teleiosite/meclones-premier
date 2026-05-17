import { Link } from "react-router-dom";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  image: string;
  align?: "left" | "center";
  imageClassName?: string;
}

export default function PageHero({ eyebrow, title, subtitle, cta, secondaryCta, image, align = "left", imageClassName }: Props) {
  return (
    <section className="relative bg-navy text-white overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <img src={image} alt="" className={`w-full h-full ${imageClassName || "object-cover object-center"}`} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
      </div>
      <div className={`relative container-page py-24 md:py-32 ${align === "center" ? "text-center" : ""}`}>
        {eyebrow && <div className="text-[11px] font-bold tracking-[0.3em] text-gold mb-5">{eyebrow}</div>}
        <h1 className="display text-5xl md:text-7xl max-w-3xl mx-auto" style={align === "left" ? { marginInline: 0 } : {}}>
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-6 text-lg text-white/70 max-w-xl ${align === "center" ? "mx-auto" : ""}`}>{subtitle}</p>
        )}
        {(cta || secondaryCta) && (
          <div className={`mt-10 flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
            {cta && (
              <Link to={cta.to} className="bg-gold text-navy px-7 py-4 font-bold text-sm tracking-wider hover:bg-gold/90 transition">
                {cta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link to={secondaryCta.to} className="border-2 border-white/30 text-white px-7 py-4 font-bold text-sm tracking-wider hover:bg-white/10 transition">
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
