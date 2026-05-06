import { Download } from "lucide-react";

const classPerf = [
  { class: "JSS 1A", students: 24, avg: 78, pass: 22, fail: 2, top: "Bola Ade — 91%" },
  { class: "JSS 2B", students: 28, avg: 82, pass: 26, fail: 2, top: "Kola Adeyemi — 94%" },
  { class: "JSS 3A", students: 26, avg: 75, pass: 23, fail: 3, top: "Rita Okoro — 88%" },
  { class: "SS 1A",  students: 22, avg: 81, pass: 20, fail: 2, top: "Uche Okafor — 90%" },
  { class: "SS 2B",  students: 20, avg: 79, pass: 18, fail: 2, top: "Grace Okafor — 92%" },
];

const termSummary = [
  { label: "Total Students Taught", value: 120 },
  { label: "Overall Pass Rate",      value: "91%" },
  { label: "Assignments Set",        value: 18 },
  { label: "Avg. Class Score",       value: "79%" },
];

export default function TeacherReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Reports</h1>
          <p className="text-muted-foreground text-sm">Performance summary across all your classes — Term 2, 2026.</p>
        </div>
        <button className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition">
          <Download size={14} /> EXPORT REPORT
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {termSummary.map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display text-3xl font-black text-navy mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Class Performance Breakdown</h3>
        </div>
        <div className="divide-y divide-border">
          {classPerf.map((c, i) => (
            <div key={i} className="px-5 py-5">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <span className="font-bold text-navy text-lg">{c.class}</span>
                  <span className="text-muted-foreground text-sm ml-3">{c.students} students</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-emerald-600 font-bold">{c.pass} passed</span>
                  <span className="text-red-500 font-bold">{c.fail} failed</span>
                  <span className="font-bold text-navy">{c.avg}% avg</span>
                </div>
              </div>
              <div className="h-2 bg-secondary mb-2">
                <div className="h-full bg-navy" style={{ width: `${c.avg}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">
                🏆 Top student: <span className="font-semibold text-gold">{c.top}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
