const gradeColor: Record<string, string> = { A: "text-emerald-600", B: "text-navy", C: "text-amber-500", F: "text-red-500" };

const childResults = [
  {
    name: "David Okafor", class: "SS 2", avg: 85, grade: "A", position: "3rd",
    subjects: [
      { name: "Mathematics", total: 85, grade: "A" }, { name: "English", total: 79, grade: "B" },
      { name: "Physics", total: 88, grade: "A" }, { name: "Chemistry", total: 82, grade: "A" },
      { name: "Biology", total: 73, grade: "B" }, { name: "Further Maths", total: 90, grade: "A" },
    ]
  },
  {
    name: "Grace Okafor", class: "Primary 5", avg: 89, grade: "A", position: "1st",
    subjects: [
      { name: "Mathematics", total: 92, grade: "A" }, { name: "English", total: 88, grade: "A" },
      { name: "Basic Science", total: 85, grade: "A" }, { name: "Social Studies", total: 90, grade: "A" },
      { name: "Computer Science", total: 87, grade: "A" }, { name: "Creative Arts", total: 91, grade: "A" },
    ]
  },
];

export default function ParentResults() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Results</h1>
        <p className="text-muted-foreground text-sm">Academic results for your children — Term 2, 2026.</p>
      </div>

      {childResults.map((child) => (
        <div key={child.name} className="space-y-4">
          <div className="flex items-center gap-4 bg-navy text-white p-5 flex-wrap">
            <div className="w-12 h-12 bg-gold text-navy flex items-center justify-center font-black text-lg">
              {child.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">{child.name}</div>
              <div className="text-white/60 text-sm">{child.class}</div>
            </div>
            <div className="flex gap-6 text-center">
              <div><div className="text-white/60 text-xs">Term Average</div><div className={`font-display text-2xl font-black text-gold`}>{child.avg}%</div></div>
              <div><div className="text-white/60 text-xs">Position</div><div className="font-display text-2xl font-black text-gold">{child.position}</div></div>
            </div>
            <button className="border border-white/30 text-white px-4 py-2 text-xs font-bold tracking-wider hover:bg-white/10 transition">DOWNLOAD</button>
          </div>

          <div className="bg-white border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  {["SUBJECT", "SCORE", "GRADE"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-navy">
                {child.subjects.map((s) => (
                  <tr key={s.name} className="hover:bg-secondary/20">
                    <td className="px-5 py-3 font-semibold">{s.name}</td>
                    <td className="px-5 py-3 font-bold">{s.total}%</td>
                    <td className="px-5 py-3"><span className={`font-display text-xl font-black ${gradeColor[s.grade]}`}>{s.grade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
