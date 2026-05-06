const days = ["MON", "TUE", "WED", "THU", "FRI"];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

const schedule: Record<string, Record<string, { subject: string; teacher: string; room: string; color: string } | null>> = {
  "08:00": { MON: { subject: "Mathematics", teacher: "Mr. Marko", room: "Rm 12", color: "bg-navy" }, TUE: { subject: "Physics", teacher: "Mr. Obi", room: "Rm 15", color: "bg-violet-600" }, WED: { subject: "Mathematics", teacher: "Mr. Marko", room: "Rm 12", color: "bg-navy" }, THU: { subject: "Chemistry", teacher: "Mr. Ade", room: "Rm 20", color: "bg-orange-500" }, FRI: { subject: "Further Maths", teacher: "Mr. Marko", room: "Rm 12", color: "bg-teal-600" } },
  "09:00": { MON: { subject: "English", teacher: "Mrs. James", room: "Rm 8", color: "bg-emerald-600" }, TUE: null, WED: { subject: "Biology", teacher: "Mr. Adeyemi", room: "Rm 6", color: "bg-rose-500" }, THU: { subject: "Mathematics", teacher: "Mr. Marko", room: "Rm 12", color: "bg-navy" }, FRI: null },
  "10:00": { MON: null, TUE: { subject: "English", teacher: "Mrs. James", room: "Rm 8", color: "bg-emerald-600" }, WED: null, THU: null, FRI: { subject: "Physics", teacher: "Mr. Obi", room: "Rm 15", color: "bg-violet-600" } },
  "11:00": { MON: { subject: "Chemistry", teacher: "Mr. Ade", room: "Rm 20", color: "bg-orange-500" }, TUE: null, WED: { subject: "English", teacher: "Mrs. James", room: "Rm 8", color: "bg-emerald-600" }, THU: { subject: "Further Maths", teacher: "Mr. Marko", room: "Rm 12", color: "bg-teal-600" }, FRI: { subject: "Chemistry", teacher: "Mr. Ade", room: "Rm 20", color: "bg-orange-500" } },
  "12:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
  "13:00": { MON: { subject: "Biology", teacher: "Mr. Adeyemi", room: "Rm 6", color: "bg-rose-500" }, TUE: { subject: "Further Maths", teacher: "Mr. Marko", room: "Rm 12", color: "bg-teal-600" }, WED: null, THU: { subject: "English", teacher: "Mrs. James", room: "Rm 8", color: "bg-emerald-600" }, FRI: null },
  "14:00": { MON: null, TUE: { subject: "Computer Sci.", teacher: "Mrs. Okonkwo", room: "Lab", color: "bg-indigo-600" }, WED: { subject: "Physics", teacher: "Mr. Obi", room: "Rm 15", color: "bg-violet-600" }, THU: null, FRI: { subject: "Biology", teacher: "Mr. Adeyemi", room: "Rm 6", color: "bg-rose-500" } },
  "15:00": { MON: null, TUE: null, WED: { subject: "Computer Sci.", teacher: "Mrs. Okonkwo", room: "Lab", color: "bg-indigo-600" }, THU: null, FRI: null },
};

export default function StudentTimetable() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Timetable</h1>
        <p className="text-muted-foreground text-sm">SS 2 weekly class schedule — Term 2, 2026.</p>
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
                        <div className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-3 mx-1">LUNCH</div>
                      ) : slot ? (
                        <div className={`${slot.color} text-white px-2 py-3 mx-1 text-left`}>
                          <div className="text-[11px] font-bold leading-tight">{slot.subject}</div>
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
