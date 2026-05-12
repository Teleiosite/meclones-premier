import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type AttendanceRecord = {
  id: string;
  date: string;
  present: boolean;
  child_name: string;
};

type ChildStat = {
  name: string;
  present: number;
  absent: number;
  late: number;
  rate: number;
};

const statusStyle: Record<string, string> = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent: "bg-red-100 text-red-600",
  Late: "bg-amber-100 text-amber-700",
};

export default function ParentAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<ChildStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get parent's record
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!parent) { setLoading(false); return; }

    // Get children
    const { data: children } = await supabase
      .from("students")
      .select("id, profiles!students_profile_id_fkey ( full_name )")
      .eq("parent_id", parent.id);

    if (!children || children.length === 0) { setLoading(false); return; }

    const childIds = children.map((c: any) => c.id);
    const nameMap: Record<string, string> = {};
    children.forEach((c: any) => { nameMap[c.id] = c.profiles?.full_name ?? "Unknown"; });

    // Fetch attendance for all children
    const { data: attendance, error } = await supabase
      .from("attendance")
      .select("id, date, present, student_id")
      .in("student_id", childIds)
      .order("date", { ascending: false })
      .limit(50);

    if (error) { toast.error("Failed to load attendance."); setLoading(false); return; }

    // Map records
    const mapped: AttendanceRecord[] = (attendance || []).map((a: any) => ({
      id: a.id,
      date: new Date(a.date).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" }),
      present: a.present,
      child_name: nameMap[a.student_id] ?? "Unknown",
    }));
    setRecords(mapped);

    // Calculate stats per child
    const statsMap: Record<string, ChildStat> = {};
    children.forEach((c: any) => {
      const name = nameMap[c.id];
      const childRecords = (attendance || []).filter((a: any) => a.student_id === c.id);
      const presentCount = childRecords.filter((a: any) => a.present).length;
      const absentCount = childRecords.filter((a: any) => !a.present).length;
      const total = childRecords.length;
      statsMap[name] = {
        name,
        present: presentCount,
        absent: absentCount,
        late: 0, // 'late' not tracked separately yet
        rate: total > 0 ? Math.round((presentCount / total) * 100) : 0,
      };
    });
    setStats(Object.values(statsMap));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

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
        <h1 className="font-display text-3xl font-black text-navy">Attendance</h1>
        <p className="text-muted-foreground text-sm">Attendance overview for your children this term.</p>
      </div>

      {stats.length === 0 ? (
        <div className="bg-white border border-dashed border-border p-16 text-center text-muted-foreground">
          No attendance records found for your children yet.
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.name} className="bg-white border border-border p-6">
                <div className="font-bold text-navy text-lg mb-1">{s.name}</div>
                <div className={`font-display text-4xl font-black mb-3 ${s.rate >= 90 ? "text-emerald-600" : s.rate >= 75 ? "text-amber-500" : "text-red-500"}`}>
                  {s.rate}%
                </div>
                <div className="h-2 bg-secondary overflow-hidden flex mb-3">
                  <div className="h-full bg-emerald-500" style={{ width: `${(s.present / (s.present + s.absent || 1)) * 100}%` }} />
                  <div className="h-full bg-red-400" style={{ width: `${(s.absent / (s.present + s.absent || 1)) * 100}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div><div className="text-muted-foreground">Present</div><div className="font-bold text-emerald-600">{s.present}</div></div>
                  <div><div className="text-muted-foreground">Absent</div><div className="font-bold text-red-500">{s.absent}</div></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-bold text-navy">Recent Attendance Log</h3>
            </div>
            <div className="divide-y divide-border">
              {records.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">No records yet.</div>
              ) : (
                records.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/20">
                    <div>
                      <div className="font-semibold text-navy text-sm">{r.child_name}</div>
                      <div className="text-xs text-muted-foreground">{r.date}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 ${r.present ? statusStyle["Present"] : statusStyle["Absent"]}`}>
                      {r.present ? "PRESENT" : "ABSENT"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
