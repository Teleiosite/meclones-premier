import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type AttendanceRecord = {
  id: string;
  date: string;
  status: "Present" | "Absent" | "Late";
};

const statusStyle: Record<string, string> = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent:  "bg-red-100 text-red-600",
  Late:    "bg-amber-100 text-amber-700",
};

export default function StudentAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
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
      .from("attendance")
      .select("id, date, status")
      .eq("student_id", student.id)
      .order("date", { ascending: false })
      .limit(60);

    if (!error) {
      setRecords((data || []).map((r: any) => ({
        id:     r.id,
        date:   r.date,
        status: r.status as "Present" | "Absent" | "Late",
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const present = records.filter(r => r.status === "Present").length;
  const absent  = records.filter(r => r.status === "Absent").length;
  const late    = records.filter(r => r.status === "Late").length;
  const rate    = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return {
      day:   d.toLocaleDateString("en-GB", { weekday: "short" }),
      date:  d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      dayNum: d.toLocaleDateString("en-GB", { day: "numeric" }),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin" /> Loading attendance records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Attendance</h1>
        <p className="text-muted-foreground text-sm">Your attendance record for this term.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Attendance Rate", value: records.length ? `${rate}%` : "—", color: "text-emerald-600" },
          { label: "Days Present",    value: present, color: "text-navy" },
          { label: "Days Absent",     value: absent,  color: "text-red-500" },
          { label: "Late Arrivals",   value: late,    color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`font-display text-3xl font-black mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {records.length > 0 && (
        /* Progress bar */
        <div className="bg-white border border-border p-6">
          <h3 className="font-bold text-navy mb-4">Term Progress</h3>
          <div className="h-3 bg-secondary overflow-hidden flex">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(present / records.length) * 100}%` }} />
            <div className="h-full bg-amber-400 transition-all"  style={{ width: `${(late    / records.length) * 100}%` }} />
            <div className="h-full bg-red-400 transition-all"    style={{ width: `${(absent  / records.length) * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 inline-block" />Present ({present})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 inline-block" />Late ({late})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400 inline-block" />Absent ({absent})</span>
          </div>
        </div>
      )}

      {/* Daily log */}
      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Daily Log</h3>
        </div>
        {records.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">No attendance records yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {records.map((r) => {
              const { day, date, dayNum } = formatDate(r.date);
              return (
                <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/20">
                  <div className="flex items-center gap-4">
                    <div className="text-center w-12">
                      <div className="text-[10px] text-muted-foreground font-bold">{day}</div>
                      <div className="font-bold text-navy text-sm">{dayNum}</div>
                    </div>
                    <span className="text-sm text-muted-foreground">{date}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 ${statusStyle[r.status]}`}>
                    {r.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
