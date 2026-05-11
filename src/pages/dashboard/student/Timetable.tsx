import { useStore, TEACHERS } from "@/store";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

// In production this comes from the authenticated student's profile
const STUDENT_CLASS = "JSS 1A";

function getTeacherName(id: string): string {
  return TEACHERS.find(t => t.id === id)?.name ?? id;
}

export default function StudentTimetable() {
  const { classTimetables } = useStore();
  const schedule = classTimetables[STUDENT_CLASS] ?? {};

  // Count periods and subjects
  const periods = TIMES.filter(t => t !== "12:00").reduce((acc, t) =>
    acc + DAYS.filter(d => !!schedule[t]?.[d]).length, 0);
  const subjects = new Set(
    TIMES.flatMap(t => DAYS.map(d => schedule[t]?.[d]?.subject)).filter(Boolean)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Timetable</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {STUDENT_CLASS} weekly class schedule — Term 2, 2026
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-border rounded-lg px-4 py-2.5 text-center min-w-[80px]">
            <div className="font-black text-xl text-navy">{periods}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Periods/wk</div>
          </div>
          <div className="bg-white border border-border rounded-lg px-4 py-2.5 text-center min-w-[80px]">
            <div className="font-black text-xl text-navy">{subjects.size}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Subjects</div>
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
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-3 rounded">
                          🍽 LUNCH
                        </div>
                      ) : slot ? (
                        <div className={`${slot.color} text-white px-2 py-2 rounded text-left`}>
                          <div className="text-[11px] font-bold leading-tight truncate">{slot.subject}</div>
                          <div className="text-[10px] opacity-80 mt-0.5 truncate">{getTeacherName(slot.teacher)}</div>
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

      {/* Subject legend */}
      {subjects.size > 0 && (
        <div className="bg-white border border-border rounded-lg p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Subjects This Term</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(subjects).map(subject => {
              // Find the color for this subject from the schedule
              let color = "bg-secondary";
              for (const t of TIMES) {
                for (const d of DAYS) {
                  if (schedule[t]?.[d]?.subject === subject) {
                    color = schedule[t][d]!.color;
                    break;
                  }
                }
              }
              return (
                <span key={subject} className={`${color} text-white text-[11px] font-bold px-2.5 py-1 rounded-full`}>
                  {subject}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Schedule is managed by the Admin. See your class teacher for any changes.
      </p>
    </div>
  );
}
