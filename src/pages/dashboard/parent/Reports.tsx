import { Download } from "lucide-react";

const termReports = [
  { child: "David Okafor", class: "SS 2A", term: "Term 2, 2026", avg: 85, position: "3rd", grade: "A", available: true },
  { child: "Grace Okafor", class: "Primary 5A", term: "Term 2, 2026", avg: 89, position: "1st", grade: "A", available: true },
  { child: "David Okafor", class: "SS 2A", term: "Term 1, 2026", avg: 81, position: "4th", grade: "A", available: true },
  { child: "Grace Okafor", class: "Primary 5A", term: "Term 1, 2026", avg: 87, position: "1st", grade: "A", available: true },
  { child: "David Okafor", class: "SS 2A", term: "Term 3, 2025", avg: 78, position: "5th", grade: "B", available: true },
  { child: "Grace Okafor", class: "Primary 5A", term: "Term 3, 2025", avg: 84, position: "2nd", grade: "A", available: true },
];

const gradeColor: Record<string, string> = { A: "text-emerald-600", B: "text-navy", C: "text-amber-500" };

export default function ParentReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Reports</h1>
        <p className="text-muted-foreground text-sm">Term-end report cards for your children.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: "Available Reports", value: termReports.length },
          { label: "Terms on Record", value: 3 },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display text-3xl font-black text-navy mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Report Card Archive</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                {["CHILD", "CLASS", "TERM", "AVG SCORE", "POSITION", "GRADE", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy divide-y divide-border">
              {termReports.map((r, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition">
                  <td className="px-5 py-4 font-semibold">{r.child}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.class}</td>
                  <td className="px-5 py-4">{r.term}</td>
                  <td className="px-5 py-4 font-bold">{r.avg}%</td>
                  <td className="px-5 py-4">{r.position}</td>
                  <td className="px-5 py-4">
                    <span className={`font-display text-xl font-black ${gradeColor[r.grade]}`}>{r.grade}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="flex items-center gap-1.5 bg-navy text-gold px-3 py-1.5 text-xs font-bold hover:bg-navy/90 transition">
                      <Download size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
