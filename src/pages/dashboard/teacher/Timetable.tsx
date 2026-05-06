import { useStore } from "@/store";

const days = ["MON", "TUE", "WED", "THU", "FRI"];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

export default function TeacherTimetable() {
  const { timetables } = useStore();
  const schedule = timetables["T-001"] || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Timetable</h1>
        <p className="text-muted-foreground text-sm">Your weekly teaching schedule — Term 2, 2026.</p>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-muted-foreground w-20">TIME</th>
              {days.map((d) => (
                <th key={d} className="px-4 py-3 text-center text-xs font-bold tracking-wider text-navy">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {times.map((t) => (
              <tr key={t}>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-bold">{t}</td>
                {days.map((d) => {
                  const slot = schedule[t]?.[d];
                  return (
                    <td key={d} className="px-2 py-2 text-center">
                      {t === "12:00" ? (
                        <div className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-3 mx-1">BREAK</div>
                      ) : slot ? (
                        <div className={`${slot.color} text-white px-2 py-3 mx-1 text-left`}>
                          <div className="text-[11px] font-bold leading-tight">{slot.class}</div>
                          <div className="text-[10px] opacity-75 mt-0.5">{slot.room}</div>
                        </div>
                      ) : (
                        <div className="h-12 mx-1" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
