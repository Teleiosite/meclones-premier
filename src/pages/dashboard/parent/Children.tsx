const children = [
  {
    name: "David Okafor", id: "MC-001", class: "SS 2A", section: "Secondary", track: "Science",
    attendance: 92, avg: 85, grade: "A", position: "3rd", status: "Active",
    color: "bg-navy",
    subjects: [
      { name: "Mathematics", score: 85 }, { name: "Physics", score: 88 },
      { name: "Chemistry", score: 82 }, { name: "English", score: 79 },
      { name: "Further Maths", score: 90 }, { name: "Biology", score: 73 },
    ],
  },
  {
    name: "Grace Okafor", id: "MC-002", class: "Primary 5A", section: "Primary", track: "—",
    attendance: 96, avg: 89, grade: "A", position: "1st", status: "Active",
    color: "bg-emerald-600",
    subjects: [
      { name: "Mathematics", score: 92 }, { name: "English", score: 88 },
      { name: "Basic Science", score: 85 }, { name: "Social Studies", score: 90 },
    ],
  },
];

export default function ParentChildren() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">My Children</h1>
        <p className="text-muted-foreground text-sm">Academic profiles for your enrolled children.</p>
      </div>

      {children.map((child, i) => (
        <div key={i} className="space-y-4">
          {/* Child header */}
          <div className="bg-white border border-border overflow-hidden">
            <div className={`${child.color} text-white p-6 flex flex-wrap items-center gap-5`}>
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center font-display text-2xl font-black">
                {child.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="font-display text-2xl font-black">{child.name}</div>
                <div className="text-white/70 text-sm mt-1">{child.class} · {child.section} · {child.id}</div>
              </div>
              <div className="flex gap-6 text-center">
                <div><div className="text-white/60 text-xs">Attendance</div><div className="font-display text-2xl font-black">{child.attendance}%</div></div>
                <div><div className="text-white/60 text-xs">Avg Score</div><div className="font-display text-2xl font-black">{child.avg}%</div></div>
                <div><div className="text-white/60 text-xs">Position</div><div className="font-display text-2xl font-black">{child.position}</div></div>
              </div>
            </div>

            <div className="p-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {child.subjects.map((s, j) => (
                <div key={j} className="border border-border p-4">
                  <div className="font-semibold text-navy text-sm mb-2">{s.name}</div>
                  <div className="h-1.5 bg-secondary mb-1.5">
                    <div className={`h-full ${child.color}`} style={{ width: `${s.score}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-bold text-navy">{s.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
