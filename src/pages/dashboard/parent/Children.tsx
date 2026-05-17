import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type Child = {
  id: string;
  admission_no: string;
  full_name: string;
  class: string;
  status: string;
  profile_id: string;
};

type Result = { subject: string; score: number };

const COLORS = ["bg-navy", "bg-emerald-600", "bg-violet-600", "bg-amber-600"];

export default function ParentChildren() {
  const { user } = useAuth();
  const [children, setChildren]         = useState<Child[]>([]);
  const [resultMap, setResultMap]       = useState<Record<string, Result[]>>({});
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { rate: number; present: number }>>({});
  const [loading, setLoading]           = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get parent record
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!parent) { setLoading(false); return; }

    // Fetch children
    const { data: students } = await supabase
      .from("students")
      .select(`
        id, admission_no, class, status,
        profiles ( full_name, id )
      `)
      .eq("parent_id", parent.id)
      .eq("status", "Active");

    const mapped: Child[] = (students || []).map((s: any) => ({
      id:           s.id,
      admission_no: s.admission_no ?? "—",
      full_name:    s.profiles?.full_name ?? "—",
      class:        s.class ?? "—",
      status:       s.status,
      profile_id:   s.profiles?.id,
    }));
    setChildren(mapped);

    // Fetch results and attendance for each child
    const rMap: Record<string, Result[]> = {};
    const aMap: Record<string, { rate: number; present: number }> = {};

    await Promise.all(mapped.map(async (child) => {
      // Results
      const { data: results } = await supabase
        .from("results")
        .select("score, exams(subject)")
        .eq("student_id", child.id)
        .limit(6);

      rMap[child.id] = (results || []).map((r: any) => ({
        subject: r.exams?.subject ?? "—",
        score:   r.score ?? 0,
      }));

      // Attendance
      const { data: att } = await supabase
        .from("attendance")
        .select("status")
        .eq("student_id", child.id);

      const total   = (att || []).length;
      const present = (att || []).filter((a: any) => a.status === "Present").length;
      aMap[child.id] = {
        rate:    total > 0 ? Math.round((present / total) * 100) : 0,
        present,
      };
    }));

    setResultMap(rMap);
    setAttendanceMap(aMap);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin" /> Loading children profiles...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">My Children</h1>
        <p className="text-muted-foreground text-sm">Academic profiles for your enrolled children.</p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white border border-border p-12 text-center text-sm text-muted-foreground">
          No children linked to your account yet. Contact the school admin.
        </div>
      ) : (
        children.map((child, i) => {
          const subjects   = resultMap[child.id] ?? [];
          const attendance = attendanceMap[child.id] ?? { rate: 0, present: 0 };
          const avg        = subjects.length
            ? Math.round(subjects.reduce((a, s) => a + s.score, 0) / subjects.length)
            : 0;
          const color = COLORS[i % COLORS.length];

          return (
            <div key={child.id} className="space-y-4">
              <div className="bg-white border border-border overflow-hidden">
                {/* Header */}
                <div className={`${color} text-white p-6 flex flex-wrap items-center gap-5`}>
                  <div className="w-16 h-16 bg-white/20 flex items-center justify-center font-display text-2xl font-black">
                    {child.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="font-display text-2xl font-black">{child.full_name}</div>
                    <div className="text-white/70 text-sm mt-1">{child.class} · {child.admission_no}</div>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-white/60 text-xs">Attendance</div>
                      <div className="font-display text-2xl font-black">{attendance.rate}%</div>
                    </div>
                    <div>
                      <div className="text-white/60 text-xs">Avg Score</div>
                      <div className="font-display text-2xl font-black">{avg > 0 ? `${avg}%` : "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Subject scores */}
                {subjects.length > 0 ? (
                  <div className="p-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {subjects.map((s, j) => (
                      <div key={j} className="border border-border p-4">
                        <div className="font-semibold text-navy text-sm mb-2">{s.subject}</div>
                        <div className="h-1.5 bg-secondary mb-1.5">
                          <div className={`h-full ${color}`} style={{ width: `${s.score}%` }} />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Score</span>
                          <span className="font-bold text-navy">{s.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">No results published yet for this student.</div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
