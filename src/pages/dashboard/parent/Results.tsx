import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";

type ChildResult = {
  childName: string;
  childClass: string;
  subjects: { name: string; score: number; grade: string }[];
  avg: number;
};

const gradeColor: Record<string, string> = {
  A: "text-emerald-600", B: "text-navy", C: "text-amber-500",
  D: "text-orange-500", F: "text-red-500",
};

const gradeFor = (n: number) => {
  if (n >= 75) return "A"; if (n >= 65) return "B";
  if (n >= 55) return "C"; if (n >= 45) return "D"; return "F";
};

export default function ParentResults() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get parent record
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!parent) { setLoading(false); return; }

    // Get children
    const { data: studentRows } = await supabase
      .from("students")
      .select("id, class, profiles ( full_name )")
      .eq("parent_id", parent.id);

    if (!studentRows || studentRows.length === 0) { setLoading(false); return; }

    const childResults: ChildResult[] = [];

    for (const student of studentRows) {
      const childName = (student as any).profiles?.full_name ?? "Unknown";
      const childClass = (student as any).class ?? "—";

      // Get results for this student
      const { data: results, error } = await supabase
        .from("results")
        .select(`
          score, grade,
          exams ( title )
        `)
        .eq("student_id", student.id);

      if (error) { toast.error(`Failed to load results for ${childName}.`); continue; }

      const subjects = (results || []).map((r: any) => ({
        name: r.exams?.title ?? "Unknown Subject",
        score: r.score ?? 0,
        grade: r.grade ?? gradeFor(r.score ?? 0),
      }));

      const avg = subjects.length > 0
        ? Math.round(subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length)
        : 0;

      childResults.push({ childName, childClass, subjects, avg });
    }

    setChildren(childResults);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Results</h1>
        <p className="text-muted-foreground text-sm">Academic results for your children this term.</p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white border border-dashed border-border p-16 text-center text-muted-foreground">
          No results recorded yet for your children.
        </div>
      ) : (
        children.map((child) => (
          <div key={child.childName} className="space-y-4">
            <div className="flex items-center gap-4 bg-navy text-white p-5 flex-wrap">
              <div className="w-12 h-12 bg-gold text-navy flex items-center justify-center font-black text-lg">
                {child.childName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{child.childName}</div>
                <div className="text-white/60 text-sm">{child.childClass}</div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-white/60 text-xs">Term Average</div>
                  <div className="font-display text-2xl font-black text-gold">{child.avg}%</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs">Grade</div>
                  <div className="font-display text-2xl font-black text-gold">{gradeFor(child.avg)}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  downloadCSV(`results_${child.childName.replace(" ", "_")}.csv`, [
                    ["Subject", "Score", "Grade"],
                    ...child.subjects.map((s) => [s.name, s.score, s.grade]),
                  ]);
                  toast.success("Results downloaded.");
                }}
                className="border border-white/30 text-white px-4 py-2 text-xs font-bold tracking-wider hover:bg-white/10 transition"
              >
                DOWNLOAD
              </button>
            </div>

            {child.subjects.length === 0 ? (
              <div className="bg-white border border-border p-8 text-center text-muted-foreground text-sm">
                No subject results recorded yet.
              </div>
            ) : (
              <div className="bg-white border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/40">
                    <tr>
                      {["SUBJECT", "SCORE", "GRADE"].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-navy">
                    {child.subjects.map((s) => (
                      <tr key={s.name} className="hover:bg-secondary/20">
                        <td className="px-5 py-3 font-semibold">{s.name}</td>
                        <td className="px-5 py-3 font-bold">{s.score}%</td>
                        <td className="px-5 py-3">
                          <span className={`font-display text-xl font-black ${gradeColor[s.grade] ?? "text-navy"}`}>{s.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
