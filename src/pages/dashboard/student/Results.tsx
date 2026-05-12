import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { downloadCSV } from "@/lib/csv";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type Result = {
  id: string;
  subject: string;
  teacher_name: string;
  score: number | null;
  grade: string | null;
  remarks: string | null;
  exam_title: string;
};

const gradeColor: Record<string, string> = {
  A: "text-emerald-600", B: "text-navy", C: "text-amber-500",
  D: "text-orange-500",  F: "text-red-500",
};

export default function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm]       = useState("All");

  const fetchResults = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get student record
    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!student) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("results")
      .select(`
        id, score, grade, remarks,
        exams (
          title, subject,
          teachers ( profiles!teachers_profile_id_fkey ( full_name ) )
        )
      `)
      .eq("student_id", student.id)
      .order("created_at", { ascending: false });

    if (error) { toast.error("Failed to load results."); setLoading(false); return; }

    const mapped: Result[] = (data || []).map((r: any) => ({
      id:          r.id,
      subject:     r.exams?.subject ?? "—",
      teacher_name: r.exams?.teachers?.profiles?.full_name ?? "—",
      score:       r.score,
      grade:       r.grade,
      remarks:     r.remarks,
      exam_title:  r.exams?.title ?? "—",
    }));

    setResults(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const avg = results.length
    ? Math.round(results.reduce((acc, r) => acc + (r.score ?? 0), 0) / results.length)
    : 0;
  const aCount = results.filter(r => r.grade === "A").length;

  const handleDownload = () => {
    downloadCSV("results.csv", [
      ["Subject", "Teacher", "Score", "Grade", "Remarks"],
      ...results.map(r => [r.subject, r.teacher_name, r.score ?? "", r.grade ?? "", r.remarks ?? ""]),
    ]);
    toast.success("Results downloaded.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin" /> Loading your results...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Results & Grades</h1>
        <p className="text-muted-foreground text-sm">Your academic performance.</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white border border-border p-12 text-center text-sm text-muted-foreground">
          No results published yet. Check back after exams are graded.
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-navy text-white p-5 col-span-2 md:col-span-1 flex flex-col justify-between">
              <div className="text-xs text-white/60 font-bold tracking-wider">AVERAGE SCORE</div>
              <div className="font-display text-4xl font-black text-gold mt-3">{avg}%</div>
            </div>
            {[
              { label: "A Grades", value: aCount, color: "text-emerald-600" },
              { label: "Subjects",  value: results.length, color: "text-navy" },
              { label: "Top Grade", value: results.sort((a,b) => (b.score ?? 0) - (a.score ?? 0))[0]?.grade ?? "—", color: "text-gold" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-border p-5">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className={`font-display text-3xl font-black mt-1 ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Results table */}
          <div className="bg-white border border-border overflow-x-auto">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-navy">Subject Results</h3>
              <button onClick={handleDownload}
                className="text-xs font-bold text-navy border border-navy px-4 py-1.5 hover:bg-navy hover:text-gold transition">
                DOWNLOAD CSV
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  {["SUBJECT", "TEACHER", "SCORE", "GRADE", "REMARK"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-navy">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/20">
                    <td className="px-5 py-4 font-semibold">{r.subject}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">{r.teacher_name}</td>
                    <td className="px-5 py-4 font-bold">{r.score ?? "—"}%</td>
                    <td className="px-5 py-4">
                      <span className={`font-display text-xl font-black ${gradeColor[r.grade ?? ""] ?? "text-navy"}`}>
                        {r.grade ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{r.remarks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
