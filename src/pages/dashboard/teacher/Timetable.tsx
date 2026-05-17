import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

type SlotData = {
  subject: string;
  className: string;
  room: string;
  color: string;
};
type WeeklySchedule = Record<string, Record<string, SlotData | null>>;

export default function TeacherTimetable() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [loading, setLoading] = useState(true);
  const [teacherProfile, setTeacherProfile] = useState<{ name: string; subject: string } | null>(null);

  const fetchTimetable = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // 1. Get teacher's internal ID
    const { data: teacher } = await supabase
      .from("teachers")
      .select("id, subject_specialization, profiles!teachers_profile_id_fkey ( full_name )")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!teacher) {
      setLoading(false);
      return;
    }

    setTeacherProfile({
      name: teacher.profiles?.full_name ?? "Teacher",
      subject: teacher.subject_specialization ?? "General",
    });

    // 2. Load timetable where teacher_id matches
    const { data } = await supabase
      .from("timetable")
      .select("time_slot, day, subject, class_name, room, color")
      .eq("teacher_id", teacher.id);

    const newSchedule: WeeklySchedule = {};
    for (const t of TIMES) {
      newSchedule[t] = {};
      for (const d of DAYS) newSchedule[t][d] = null;
    }

    (data || []).forEach((row: any) => {
      if (newSchedule[row.time_slot] !== undefined) {
        newSchedule[row.time_slot][row.day] = {
          subject: row.subject,
          className: row.class_name,
          room: row.room ?? "TBD",
          color: row.color ?? "bg-navy",
        };
      }
    });

    setSchedule(newSchedule);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Count stats
  const totalPeriods = TIMES.filter(t => t !== "12:00").length * DAYS.length;
  const assignedPeriods = TIMES.filter(t => t !== "12:00").reduce((acc, t) =>
    acc + DAYS.filter(d => !!schedule[t]?.[d]).length, 0);
  const uniqueClasses = new Set(
    TIMES.flatMap(t => DAYS.map(d => schedule[t]?.[d]?.className)).filter(Boolean)
  ).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Timetable</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {teacherProfile?.name} · {teacherProfile?.subject} — Term 2, 2026
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3">
          <div className="bg-white border border-border rounded-lg px-4 py-2.5 text-center min-w-[80px]">
            <div className="font-black text-xl text-navy">{assignedPeriods}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Periods/wk</div>
          </div>
          <div className="bg-white border border-border rounded-lg px-4 py-2.5 text-center min-w-[80px]">
            <div className="font-black text-xl text-navy">{uniqueClasses}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Classes</div>
          </div>
        </div>
      </div>

      {/* Timetable grid */}
      <div className="bg-white border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-muted-foreground w-20">TIME</th>
              {DAYS.map((d) => (
                <th key={d} className="px-3 py-3 text-center text-xs font-bold tracking-wider text-navy">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TIMES.map((t) => (
              <tr key={t} className="hover:bg-secondary/10 transition">
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground font-bold whitespace-nowrap">{t}</td>
                {DAYS.map((d) => {
                  const slot = schedule[t]?.[d];
                  const isBreak = t === "12:00";
                  return (
                    <td key={d} className="px-1.5 py-1.5 text-center">
                      {isBreak ? (
                        <div className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-3 rounded">
                          LUNCH
                        </div>
                      ) : slot ? (
                        <div className={`${slot.color} text-white px-2 py-2 rounded text-left`}>
                          <div className="text-[11px] font-bold leading-tight truncate">{slot.subject}</div>
                          <div className="text-[10px] opacity-80 font-semibold mt-0.5">{slot.className}</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{slot.room}</div>
                        </div>
                      ) : (
                        <div className="h-14 rounded flex items-center justify-center text-muted-foreground/20 text-xs font-bold">
                          —
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="text-xs text-center text-muted-foreground">
        Schedule is set by the Admin. Contact the Admin to request changes.
      </p>
    </div>
  );
}
