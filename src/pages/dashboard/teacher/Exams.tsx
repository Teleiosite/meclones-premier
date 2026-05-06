import { useState } from "react";
import { toast } from "sonner";

const examData = [
  { class: "JSS 1A", exam: "Mathematics Midterm", date: "Jun 10", students: [
    { name: "Ada Okonkwo", score: "" }, { name: "Bola Ade", score: "" }, { name: "Chidi Nwosu", score: "" }, { name: "Dami Bello", score: "" }, { name: "Emeka Paul", score: "" },
  ]},
];

const gradeFor = (s: string) => {
  const n = parseFloat(s);
  if (isNaN(n)) return "—";
  if (n >= 75) return "A";
  if (n >= 65) return "B";
  if (n >= 55) return "C";
  if (n >= 45) return "D";
  return "F";
};

const recentResults = [
  { name: "Ada Okonkwo", exam: "Mathematics Test 2", class: "JSS 1A", score: 88, grade: "A" },
  { name: "Bola Ade", exam: "Mathematics Test 2", class: "JSS 1A", score: 72, grade: "B" },
  { name: "Ife Adesanya", exam: "Mathematics Test 2", class: "JSS 2B", score: 91, grade: "A" },
  { name: "Uche Okafor", exam: "Statistics Quiz", class: "SS 1A", score: 65, grade: "B" },
  { name: "David Okafor", exam: "Statistics Quiz", class: "SS 2B", score: 78, grade: "B" },
];

export default function TeacherExams() {
  const [scores, setScores] = useState<Record<string, string>>({});

  const setScore = (name: string, val: string) => setScores((prev) => ({ ...prev, [name]: val }));

  const handleSave = () => toast.success("Grades saved successfully.");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Exams & Grading</h1>
        <p className="text-muted-foreground text-sm">Enter exam scores and view student performance.</p>
      </div>

      {/* Enter grades */}
      {examData.map((e) => (
        <div key={e.class} className="bg-white border border-border p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-navy text-lg">{e.exam}</h3>
              <p className="text-sm text-muted-foreground">{e.class} · {e.date}</p>
            </div>
            <button onClick={handleSave} className="bg-navy text-gold px-5 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition">SAVE GRADES →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground">STUDENT</th>
                  <th className="text-left px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground">SCORE (/100)</th>
                  <th className="text-left px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground">GRADE</th>
                  <th className="text-left px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground">REMARK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-navy">
                {e.students.map((s) => {
                  const grade = gradeFor(scores[s.name] ?? "");
                  return (
                    <tr key={s.name}>
                      <td className="px-4 py-3 font-semibold">{s.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number" min="0" max="100" placeholder="—"
                          value={scores[s.name] ?? ""}
                          onChange={(e) => setScore(s.name, e.target.value)}
                          className="w-20 border border-border px-2 py-1 text-sm focus:border-navy focus:outline-none text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${grade === "A" ? "text-emerald-600" : grade === "F" ? "text-red-500" : "text-navy"}`}>{grade}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {grade === "A" ? "Excellent" : grade === "B" ? "Good" : grade === "C" ? "Average" : grade === "D" ? "Below average" : grade === "F" ? "Fail" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Recent results */}
      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Recent Results</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              {["STUDENT", "EXAM", "CLASS", "SCORE", "GRADE"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-navy">
            {recentResults.map((r, i) => (
              <tr key={i} className="hover:bg-secondary/20">
                <td className="px-5 py-4 font-semibold">{r.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.exam}</td>
                <td className="px-5 py-4">{r.class}</td>
                <td className="px-5 py-4 font-bold">{r.score}%</td>
                <td className="px-5 py-4">
                  <span className={`font-bold ${r.grade === "A" ? "text-emerald-600" : "text-navy"}`}>{r.grade}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
