import { useState, useEffect, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type ReportRow = {
  child: string;
  class: string;
  term: string;
  avg: number;
  grade: string;
  totalSubjects: number;
};

const gradeColor: Record<string, string> = {
  A: "text-emerald-600",
  B: "text-navy",
  C: "text-amber-500",
  D: "text-orange-500",
  F: "text-red-600",
};

function getGrade(avg: number): string {
  if (avg >= 75) return "A";
  if (avg >= 60) return "B";
  if (avg >= 50) return "C";
  if (avg >= 40) return "D";
  return "F";
}

export default function ParentReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Step 1: Get parent record
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!parent) { setLoading(false); return; }

    // Step 2: Get children
    const { data: children } = await supabase
      .from("students")
      .select("id, class, profiles ( full_name )")
      .eq("parent_id", parent.id);

    if (!children || children.length === 0) { setLoading(false); return; }

    // Step 3: Fetch results for each child
    const allReports: ReportRow[] = [];

    for (const child of children as any[]) {
      const childName = child.profiles?.full_name ?? "Unknown";
      const childClass = child.class ?? "—";

      const { data: results } = await supabase
        .from("results")
        .select("score, total_marks, exams ( term )")
        .eq("student_id", child.id);

      if (!results || results.length === 0) continue;

      // Group results by term
      const termMap: Record<string, { scores: number[]; totals: number[] }> = {};
      for (const r of results as any[]) {
        const term = r.exams?.term ?? "Unknown Term";
        if (!termMap[term]) termMap[term] = { scores: [], totals: [] };
        termMap[term].scores.push(Number(r.score));
        termMap[term].totals.push(Number(r.total_marks));
      }

      for (const [term, data] of Object.entries(termMap)) {
        const sumScores = data.scores.reduce((a, b) => a + b, 0);
        const sumTotals = data.totals.reduce((a, b) => a + b, 0);
        const avg = sumTotals > 0 ? Math.round((sumScores / sumTotals) * 100) : 0;

        allReports.push({
          child: childName,
          class: childClass,
          term,
          avg,
          grade: getGrade(avg),
          totalSubjects: data.scores.length,
        });
      }
    }

    // Sort: most recent term first (alphabetical fallback)
    allReports.sort((a, b) => b.term.localeCompare(a.term));
    setReports(allReports);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const uniqueTerms = [...new Set(reports.map((r) => r.term))].length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Reports</h1>
        <p className="text-muted-foreground text-sm">Term-end academic summaries for your children.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: "Available Reports", value: reports.length },
          { label: "Terms on Record", value: uniqueTerms },
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

        {reports.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No results on record yet. Check back after exams have been graded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  {["CHILD", "CLASS", "TERM", "AVG SCORE", "SUBJECTS", "GRADE", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-navy divide-y divide-border">
                {reports.map((r, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition">
                    <td className="px-5 py-4 font-semibold">{r.child}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.class}</td>
                    <td className="px-5 py-4">{r.term}</td>
                    <td className="px-5 py-4 font-bold">{r.avg}%</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.totalSubjects}</td>
                    <td className="px-5 py-4">
                      <span className={`font-display text-xl font-black ${gradeColor[r.grade]}`}>{r.grade}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toast.info("PDF export coming soon")}
                        className="flex items-center gap-1.5 bg-navy text-gold px-3 py-1.5 text-xs font-bold hover:bg-navy/90 transition"
                      >
                        <Download size={12} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
