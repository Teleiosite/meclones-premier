import PageHero from "@/components/site/PageHero";
import CTABanner from "@/components/site/CTABanner";
import art1 from "@/assets/Gallary 12.jpeg";
import art2 from "@/assets/Secondary School 2.jpeg";
import art3 from "@/assets/Gallary 1.jpeg";
import art4 from "@/assets/Gallary 5.jpeg";
import art5 from "@/assets/primary School 4.jpeg";
import art6 from "@/assets/primary School 1.jpeg";
import campusImg from "@/assets/Primary school logo.jpeg";
import featuredImg from "@/assets/slider-meclones-2.jpg";
import { ArrowRight } from "lucide-react";

const featured = {
  img: featuredImg, tag: "GRADUATION", date: "JULY 2025",
  title: "Class of 2025 graduates with 100% WAEC pass rate",
  excerpt: "A record-breaking ceremony as 87 students received their certificates and university offers from across four continents.",
};

const articles = [
  { img: art1, tag: "COMMUNITY", date: "OCT 2025", title: "Celebrating our vibrant school community and shared values" },
  { img: art2, tag: "ACADEMIC", date: "SEP 2025", title: "Senior students engaged in interactive, modern learning" },
  { img: art3, tag: "CAMPUS", date: "AUG 2025", title: "Fostering collaboration and teamwork across all year groups" },
  { img: art4, tag: "ARTS", date: "JUL 2025", title: "Nurturing creativity and self-expression in extracurriculars" },
  { img: art5, tag: "TEACHING", date: "JUN 2025", title: "Hands-on discovery and joy in our primary classrooms" },
  { img: art6, tag: "EARLY YEARS", date: "MAY 2025", title: "A welcoming and joyful start for our youngest learners" },
];

export default function News() {
  return (
    <>
      <PageHero
        eyebrow="NEWS & EVENTS"
        title="What's happening at Meclones."
        subtitle="Stories, celebrations and announcements from across our campus."
        image={campusImg}
        imageClassName="object-contain"
      />

      {/* FEATURED */}
      <section className="container-page py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center bg-white border border-navy/10">
          <div className="aspect-[4/3] overflow-hidden order-1">
            <img src={featured.img} alt={featured.title} loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="p-8 md:p-12 order-2">
            <div className="flex gap-3 mb-4 text-[10px] font-bold tracking-[0.25em]">
              <span className="text-gold">{featured.tag}</span>
              <span className="text-navy/40">·</span>
              <span className="text-navy/60">{featured.date}</span>
            </div>
            <h2 className="display text-3xl md:text-4xl text-navy mb-4">{featured.title}</h2>
            <p className="text-navy/70 mb-6">{featured.excerpt}</p>
            <a href="#" className="inline-flex items-center gap-2 text-navy font-bold text-sm tracking-wider border-b-2 border-gold pb-1">
              READ STORY <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="container-page pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <article key={a.title} className="bg-white border border-navy/10 group cursor-pointer hover:border-navy transition">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={a.img} alt={a.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
              <div className="p-6">
                <div className="flex gap-3 mb-3 text-[10px] font-bold tracking-[0.25em]">
                  <span className="text-gold">{a.tag}</span>
                  <span className="text-navy/40">·</span>
                  <span className="text-navy/60">{a.date}</span>
                </div>
                <h3 className="font-display font-bold text-xl text-navy leading-snug">{a.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
