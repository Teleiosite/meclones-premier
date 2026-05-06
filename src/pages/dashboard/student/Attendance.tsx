const records = [
  { date: "May 29", day: "Wed", status: "Present" }, { date: "May 28", day: "Tue", status: "Present" },
  { date: "May 27", day: "Mon", status: "Present" }, { date: "May 24", day: "Fri", status: "Absent" },
  { date: "May 23", day: "Thu", status: "Present" }, { date: "May 22", day: "Wed", status: "Present" },
  { date: "May 21", day: "Tue", status: "Late" },    { date: "May 20", day: "Mon", status: "Present" },
  { date: "May 17", day: "Fri", status: "Present" }, { date: "May 16", day: "Thu", status: "Present" },
  { date: "May 15", day: "Wed", status: "Present" }, { date: "May 14", day: "Tue", status: "Absent" },
  { date: "May 13", day: "Mon", status: "Present" }, { date: "May 10", day: "Fri", status: "Present" },
];

const statusStyle: Record<string, string> = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent: "bg-red-100 text-red-600",
  Late: "bg-amber-100 text-amber-700",
};

export default function StudentAttendance() {
  const present = records.filter(r => r.status === "Present").length;
  const absent = records.filter(r => r.status === "Absent").length;
  const late = records.filter(r => r.status === "Late").length;
  const rate = Math.round((present / records.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Attendance</h1>
        <p className="text-muted-foreground text-sm">Your attendance record for Term 2, 2026.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Attendance Rate", value: `${rate}%`, color: "text-emerald-600" },
          { label: "Days Present", value: present, color: "text-navy" },
          { label: "Days Absent", value: absent, color: "text-red-500" },
          { label: "Late Arrivals", value: late, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`font-display text-3xl font-black mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border p-6">
        <h3 className="font-bold text-navy mb-4">Term 2 Progress</h3>
        <div className="h-3 bg-secondary overflow-hidden flex">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(present / records.length) * 100}%` }} />
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${(late / records.length) * 100}%` }} />
          <div className="h-full bg-red-400 transition-all" style={{ width: `${(absent / records.length) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 inline-block" />Present ({present})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 inline-block" />Late ({late})</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400 inline-block" />Absent ({absent})</span>
        </div>
      </div>

      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Daily Log</h3>
        </div>
        <div className="divide-y divide-border">
          {records.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/20">
              <div className="flex items-center gap-4">
                <div className="text-center w-12">
                  <div className="text-[10px] text-muted-foreground font-bold">{r.day}</div>
                  <div className="font-bold text-navy text-sm">{r.date.split(" ")[1]}</div>
                </div>
                <span className="text-sm text-muted-foreground">{r.date}</span>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 ${statusStyle[r.status]}`}>{r.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
