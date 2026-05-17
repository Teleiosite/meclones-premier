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
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState("All");
  const [classesList, setClassesList] = useState<string[]>([]);
  const [academicSetting, setAcademicSetting] = useState<{ session: string; term: string } | null>(null);

  const fetchTimetable = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // 1. Get teacher's internal ID
    const { data: teacher } = await supabase
      .from("teachers")
      .select("id, subject_specialization, profiles ( full_name )")
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

    // 2. Load timetable where teacher_id matches logged in profile_id
    const { data } = await supabase
      .from("timetable")
      .select("time_slot, day, subject, class_name, room, color")
      .eq("teacher_id", user.id);

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

    // Extract all unique class names for the filter dropdown
    const uniqueClassNames = Array.from(
      new Set(
        (data || []).map((row: any) => row.class_name as string).filter(Boolean)
      )
    ).sort();
    
    // 3. Fetch school settings (Term and Session)
    const { data: settings } = await supabase
      .from("school_settings")
      .select("session, term")
      .eq("id", "current")
      .maybeSingle();

    if (settings) {
      setAcademicSetting({
        session: settings.session,
        term: settings.term,
      });
    }
    
    setClassesList(uniqueClassNames);
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
  const assignedPeriods = TIMES.reduce((acc, t) =>
    acc + DAYS.filter(d => !!schedule[t]?.[d]).length, 0);
  const uniqueClasses = classesList.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-navy">My Timetable</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {teacherProfile?.name} · {teacherProfile?.subject} {academicSetting ? `— ${academicSetting.term}, ${academicSetting.session}` : ""}
        </p>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border p-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-navy uppercase tracking-wider whitespace-nowrap">Filter by Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-border px-3 py-1.5 text-xs text-navy focus:border-navy focus:outline-none bg-white font-semibold"
          >
            <option value="All">All Classes ({uniqueClasses})</option>
            {classesList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3">
          <div className="bg-secondary/40 border border-border rounded px-4 py-1.5 text-center min-w-[100px]">
            <div className="font-black text-lg text-navy">{assignedPeriods}</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Periods/wk</div>
          </div>
          <div className="bg-secondary/40 border border-border rounded px-4 py-1.5 text-center min-w-[100px]">
            <div className="font-black text-lg text-navy">{uniqueClasses}</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold font-display">Classes</div>
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
                  const rawSlot = schedule[t]?.[d];
                  // Filter out slots that do not match the selected class (unless selectedClass === "All")
                  const slot = (rawSlot && (selectedClass === "All" || rawSlot.className === selectedClass)) ? rawSlot : null;
                  
                  return (
                    <td key={d} className="px-1.5 py-1.5 text-center">
                      {slot ? (
                        <div className={`${slot.color} text-white px-2 py-2 rounded text-left shadow-sm`}>
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
