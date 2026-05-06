const subjects = [
  { name: "Mathematics", teacher: "Mr. Daniel Marko", ca: 88, exam: 82, total: 85, grade: "A", remark: "Excellent" },
  { name: "English Language", teacher: "Mrs. Sarah James", ca: 78, exam: 80, total: 79, grade: "B", remark: "Good" },
  { name: "Physics", teacher: "Mr. Peter Obi", ca: 90, exam: 86, total: 88, grade: "A", remark: "Excellent" },
  { name: "Chemistry", teacher: "Mr. Victor Ade", ca: 80, exam: 83, total: 82, grade: "A", remark: "Very Good" },
  { name: "Further Mathematics", teacher: "Mr. Daniel Marko", ca: 92, exam: 89, total: 90, grade: "A", remark: "Outstanding" },
  { name: "Biology", teacher: "Mr. Kola Adeyemi", ca: 72, exam: 74, total: 73, grade: "B", remark: "Good" },
  { name: "Computer Science", teacher: "Mrs. Funke Okonkwo", ca: 85, exam: 88, total: 87, grade: "A", remark: "Excellent" },
  { name: "Civic Education", teacher: "Mr. Ahmed Bello", ca: 70, exam: 75, total: 73, grade: "B", remark: "Good" },
];

const gradeColor: Record<string, string> = { A: "text-emerald-600", B: "text-navy", C: "text-amber-500", D: "text-orange-500", F: "text-red-500" };

export default function StudentResults() {
  const avg = Math.round(subjects.reduce((acc, s) => acc + s.total, 0) / subjects.length);
  const aCount = subjects.filter(s => s.grade === "A").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Results & Grades</h1>
        <p className="text-muted-foreground text-sm">Your academic performance for Term 2, 2026.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy text-white p-5 col-span-2 md:col-span-1 flex flex-col justify-between">
          <div className="text-xs text-white/60 font-bold tracking-wider">TERM AVERAGE</div>
          <div className="font-display text-4xl font-black text-gold mt-3">{avg}%</div>
          <div className="text-xs text-white/60 mt-1">Better than 78% of class</div>
        </div>
        {[
          { label: "A Grades", value: aCount, color: "text-emerald-600" },
          { label: "Subjects", value: subjects.length, color: "text-navy" },
          { label: "Position", value: "3rd", color: "text-gold" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`font-display text-3xl font-black mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-navy">Subject Results — Term 2, 2026</h3>
          <button onClick={() => { import("@/lib/csv").then(({ downloadCSV }) => downloadCSV("results-term2.csv", [["Subject", "Teacher", "CA", "Exam", "Total", "Grade"], ...subjects.map((s) => [s.name, s.teacher, s.ca, s.exam, s.total, s.grade])])); import("sonner").then(({ toast }) => toast.success("Results downloaded.")); }} className="text-xs font-bold text-navy border border-navy px-4 py-1.5 hover:bg-navy hover:text-gold transition">DOWNLOAD PDF</button>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              {["SUBJECT", "TEACHER", "C.A (40%)", "EXAM (60%)", "TOTAL", "GRADE", "REMARK"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-navy">
            {subjects.map((s) => (
              <tr key={s.name} className="hover:bg-secondary/20">
                <td className="px-5 py-4 font-semibold">{s.name}</td>
                <td className="px-5 py-4 text-muted-foreground text-xs">{s.teacher}</td>
                <td className="px-5 py-4">{s.ca}</td>
                <td className="px-5 py-4">{s.exam}</td>
                <td className="px-5 py-4 font-bold">{s.total}%</td>
                <td className="px-5 py-4">
                  <span className={`font-display text-xl font-black ${gradeColor[s.grade]}`}>{s.grade}</span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{s.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
