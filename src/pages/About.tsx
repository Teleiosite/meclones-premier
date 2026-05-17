import PageHero from "@/components/site/PageHero";
import CTABanner from "@/components/site/CTABanner";
import campusImg from "@/assets/School Building 4.jpeg";
import classroomImg from "@/assets/School Building 1.jpeg";

const milestones = [
  { year: "2003", text: "Founded with 32 students in a single building." },
  { year: "2008", text: "Secondary school launched. First JSS1 cohort enrolled." },
  { year: "2014", text: "New secondary block opened. Achieved 100% WAEC pass." },
  { year: "2019", text: "Recognised among Lagos' Top 10 private schools." },
  { year: "2024", text: "Launched digital learning platform for parents and students." },
];

const team = [
  { name: "Dr. Adaeze Onuoha", role: "Head of School" },
  { name: "Mr. Tunde Adekunle", role: "Head of Primary" },
  { name: "Mrs. Funke Bello", role: "Head of Secondary" },
  { name: "Mr. Chinedu Eze", role: "Director of Studies" },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="OUR STORY"
        title="Two decades of nurturing brilliant minds."
        subtitle="What started in 2003 with 32 children has grown into one of Nigeria's most respected combined schools — but our promise has never changed."
        image={campusImg}
      />

      {/* MISSION */}
      <section className="container-page py-24 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="eyebrow mb-3">OUR MISSION</div>
          <h2 className="display text-4xl text-navy">To raise the next generation of confident, compassionate leaders.</h2>
        </div>
        <div className="md:col-span-7 md:col-start-6 space-y-5 text-navy/70 leading-relaxed">
          <p>At Meclones, education is more than results. We believe every child carries something extraordinary — and our role is to find it, nurture it, and let it shine.</p>
          <p>We do this through small classes, brilliant teachers, a rigorous curriculum, and a culture of warmth and high expectations. Our graduates leave us not only with strong grades, but with strong character.</p>
        </div>
      </section>

      {/* IMAGE BAND */}
      <section className="container-page pb-24">
        <div className="aspect-[21/9] overflow-hidden">
          <img src={classroomImg} alt="Classroom" loading="lazy" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* TIMELINE */}
      <section className="bg-cream">
        <div className="container-page py-24">
          <div className="eyebrow mb-3">OUR JOURNEY</div>
          <h2 className="display text-4xl text-navy mb-12">Twenty years. Counting.</h2>
          <div className="space-y-px bg-navy/10">
            {milestones.map((m) => (
              <div key={m.year} className="bg-cream grid md:grid-cols-12 gap-6 py-6 px-2">
                <div className="md:col-span-2 display text-3xl text-gold">{m.year}</div>
                <div className="md:col-span-10 text-navy/80 text-lg">{m.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="container-page py-24">
        <div className="eyebrow mb-3">LEADERSHIP</div>
        <h2 className="display text-4xl text-navy mb-10">The people behind Meclones.</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {team.map((t) => (
            <div key={t.name} className="bg-white border border-navy/10">
              <div className="aspect-[4/5] bg-navy/5" />
              <div className="p-5">
                <div className="font-display font-bold text-navy">{t.name}</div>
                <div className="text-xs text-navy/60 mt-1">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
