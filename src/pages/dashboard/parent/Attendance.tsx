const children = ["David Okafor (SS 2)", "Grace Okafor (Primary 5)"];

const records = [
  { child: "David Okafor", date: "May 29", day: "Wed", status: "Present" },
  { child: "Grace Okafor", date: "May 29", day: "Wed", status: "Present" },
  { child: "David Okafor", date: "May 28", day: "Tue", status: "Present" },
  { child: "Grace Okafor", date: "May 28", day: "Tue", status: "Present" },
  { child: "David Okafor", date: "May 27", day: "Mon", status: "Absent" },
  { child: "Grace Okafor", date: "May 27", day: "Mon", status: "Present" },
  { child: "David Okafor", date: "May 24", day: "Fri", status: "Present" },
  { child: "Grace Okafor", date: "May 24", day: "Fri", status: "Late" },
  { child: "David Okafor", date: "May 23", day: "Thu", status: "Present" },
  { child: "Grace Okafor", date: "May 23", day: "Thu", status: "Present" },
];

const statusStyle: Record<string, string> = {
  Present: "bg-emerald-100 text-emerald-700",
  Absent: "bg-red-100 text-red-600",
  Late: "bg-amber-100 text-amber-700",
};

const stats = [
  { name: "David Okafor", rate: 92, present: 46, absent: 3, late: 1 },
  { name: "Grace Okafor", rate: 96, present: 48, absent: 1, late: 1 },
];

export default function ParentAttendance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Attendance</h1>
        <p className="text-muted-foreground text-sm">Attendance overview for your children this term.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.name} className="bg-white border border-border p-6">
            <div className="font-bold text-navy text-lg mb-1">{s.name}</div>
            <div className={`font-display text-4xl font-black mb-3 ${s.rate >= 90 ? "text-emerald-600" : "text-amber-500"}`}>{s.rate}%</div>
            <div className="h-2 bg-secondary overflow-hidden flex mb-3">
              <div className="h-full bg-emerald-500" style={{ width: `${(s.present / 50) * 100}%` }} />
              <div className="h-full bg-amber-400" style={{ width: `${(s.late / 50) * 100}%` }} />
              <div className="h-full bg-red-400" style={{ width: `${(s.absent / 50) * 100}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div><div className="text-muted-foreground">Present</div><div className="font-bold text-emerald-600">{s.present}</div></div>
              <div><div className="text-muted-foreground">Late</div><div className="font-bold text-amber-500">{s.late}</div></div>
              <div><div className="text-muted-foreground">Absent</div><div className="font-bold text-red-500">{s.absent}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-navy">Recent Attendance Log</h3></div>
        <div className="divide-y divide-border">
          {records.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/20">
              <div>
                <div className="font-semibold text-navy text-sm">{r.child}</div>
                <div className="text-xs text-muted-foreground">{r.day}, {r.date}</div>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 ${statusStyle[r.status]}`}>{r.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
