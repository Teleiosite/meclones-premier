import { useState, useEffect, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { downloadCSV } from "@/lib/csv";

type ClassPerf = {
  class_name: string;
  students: number;
  avg: number;
  pass: number;
  fail: number;
};

function gradeFor(score: number): string {
  if (score >= 75) return "A";
  if (score >= 65) return "B";
  if (score >= 55) return "C";
  if (score >= 45) return "D";
  return "F";
}

export default function TeacherReports() {
  const [classPerf, setClassPerf] = useState<ClassPerf[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [overallAvg, setOverallAvg] = useState(0);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [passRate, setPassRate] = useState(0);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: teacher } = await supabase
      .from("teachers").select("id").eq("profile_id", user.id).maybeSingle();
    if (!teacher) { setLoading(false); return; }

    // Get all exams for this teacher
    const { data: exams } = await supabase
      .from("exams").select("id, class_name").eq("teacher_id", teacher.id);

    // Get all results for those exams
    const { data: results } = await supabase
      .from("results")
      .select("score, grade, exam_id, student_id")
      .eq("teacher_id", teacher.id);

    // Get total assignments count
    const { count: assignCount } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true })
      .eq("teacher_id", teacher.id);
    setTotalAssignments(assignCount ?? 0);

    if (!results || results.length === 0) {
      setLoading(false);
      return;
    }

    // Build class → exam map
    const examClassMap: Record<string, string> = {};
    (exams || []).forEach((e: any) => { examClassMap[e.id] = e.class_name; });

    // Group results by class
    const classMap: Record<string, { scores: number[] }> = {};
    results.forEach((r: any) => {
      const className = examClassMap[r.exam_id] ?? "Unknown";
      if (!classMap[className]) classMap[className] = { scores: [] };
      classMap[className].scores.push(Number(r.score));
    });

    // Get student counts per class
    const perfRows: ClassPerf[] = [];
    for (const [className, data] of Object.entries(classMap)) {
      const { count } = await supabase
        .from("students").select("*", { count: "exact", head: true }).eq("class", className);
      const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      const pass = data.scores.filter((s) => s >= 50).length;
      const fail = data.scores.length - pass;
      perfRows.push({ class_name: className, students: count ?? 0, avg, pass, fail });
    }

    const allScores = results.map((r: any) => Number(r.score));
    const globalAvg = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
    const globalPass = allScores.filter((s) => s >= 50).length;

    setClassPerf(perfRows.sort((a, b) => a.class_name.localeCompare(b.class_name)));
    setTotalStudents(perfRows.reduce((a, c) => a + c.students, 0));
    setOverallAvg(globalAvg);
    setPassRate(Math.round((globalPass / allScores.length) * 100));
    setLoading(false);
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleExport = () => {
    if (classPerf.length === 0) { toast.info("No data to export."); return; }
    downloadCSV("teacher-report.csv", [
      ["Class", "Students", "Avg Score", "Pass", "Fail"],
      ...classPerf.map((c) => [c.class_name, c.students, `${c.avg}%`, c.pass, c.fail]),
    ]);
    toast.success("Report exported.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Reports</h1>
          <p className="text-muted-foreground text-sm">
            Performance summary across all your classes — live from database.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition"
        >
          <Download size={14} /> EXPORT REPORT
        </button>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students Taught", value: totalStudents || "—" },
          { label: "Overall Pass Rate",     value: classPerf.length ? `${passRate}%` : "—" },
          { label: "Assignments Set",       value: totalAssignments || "—" },
          { label: "Avg. Class Score",      value: classPerf.length ? `${overallAvg}%` : "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display text-3xl font-black text-navy mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Breakdown table */}
      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Class Performance Breakdown</h3>
        </div>

        {classPerf.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No exam results recorded yet. Enter grades via the Exams page.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {classPerf.map((c) => (
              <div key={c.class_name} className="px-5 py-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-navy text-lg">{c.class_name}</span>
                    <span className="text-muted-foreground text-sm ml-3">{c.students} students enrolled</span>
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
                  Grade: <span className="font-semibold text-navy">{gradeFor(c.avg)}</span>
                  {" "}·{" "}
                  Pass threshold: <span className="font-semibold">50%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
