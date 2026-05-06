const courses = [
  { name: "Mathematics", teacher: "Mr. Daniel Marko", progress: 85, topics: 24, done: 20, color: "bg-navy", next: "Quadratic Equations" },
  { name: "English Language", teacher: "Mrs. Sarah James", progress: 78, topics: 20, done: 16, color: "bg-emerald-600", next: "Comprehension & Summary" },
  { name: "Physics", teacher: "Mr. Peter Obi", progress: 88, topics: 22, done: 19, color: "bg-violet-600", next: "Light & Optics" },
  { name: "Chemistry", teacher: "Mr. Victor Ade", progress: 82, topics: 20, done: 16, color: "bg-orange-500", next: "Organic Chemistry" },
  { name: "Further Mathematics", teacher: "Mr. Daniel Marko", progress: 90, topics: 18, done: 16, color: "bg-rose-500", next: "Integration" },
  { name: "Biology", teacher: "Mr. Kola Adeyemi", progress: 73, topics: 22, done: 16, color: "bg-teal-600", next: "Genetics" },
  { name: "Computer Science", teacher: "Mrs. Funke Okonkwo", progress: 87, topics: 16, done: 14, color: "bg-indigo-600", next: "Database Fundamentals" },
  { name: "Civic Education", teacher: "Mr. Ahmed Bello", progress: 70, topics: 14, done: 10, color: "bg-amber-500", next: "Human Rights" },
];

export default function StudentCourses() {
  const overallProgress = Math.round(courses.reduce((a, c) => a + c.progress, 0) / courses.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Courses</h1>
          <p className="text-muted-foreground text-sm">All enrolled subjects for SS 2 — Term 2, 2026.</p>
        </div>
        <div className="bg-navy text-white px-5 py-3 text-center">
          <div className="text-xs text-white/60">Overall Progress</div>
          <div className="font-display text-2xl font-black text-gold">{overallProgress}%</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((c, i) => (
          <div key={i} className="bg-white border border-border overflow-hidden hover:border-navy transition">
            <div className={`${c.color} px-5 py-4 flex items-center justify-between`}>
              <div>
                <div className="text-white font-display font-bold text-lg leading-tight">{c.name}</div>
                <div className="text-white/70 text-xs mt-0.5">{c.teacher}</div>
              </div>
              <div className="text-white font-display text-2xl font-black">{c.progress}%</div>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
                  <span>{c.done}/{c.topics} topics covered</span>
                </div>
                <div className="h-1.5 bg-secondary">
                  <div className={`h-full ${c.color}`} style={{ width: `${c.progress}%` }} />
                </div>
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">Next topic: </span>
                <span className="font-semibold text-navy">{c.next}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
