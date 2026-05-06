const months = ["JUNE 2026", "JULY 2026", "AUGUST 2026"];

const events = [
  { date: "Jun 5", day: "Thu", title: "PTA Meeting", time: "10:00 AM", type: "Meeting", color: "bg-navy" },
  { date: "Jun 10", day: "Tue", title: "Midterm Exams Begin", time: "All Week", type: "Exam", color: "bg-red-500" },
  { date: "Jun 14", day: "Sat", title: "Inter-House Sports Day", time: "9:00 AM", type: "Event", color: "bg-emerald-600" },
  { date: "Jun 22", day: "Sun", title: "End of Midterm Break Ends", time: "School resumes Mon", type: "Holiday", color: "bg-amber-500" },
  { date: "Jun 28", day: "Sat", title: "Prize Giving Day", time: "10:00 AM", type: "Event", color: "bg-violet-600" },
  { date: "Jul 4", day: "Fri", title: "School Closes (Term 2)", time: "1:00 PM", type: "Holiday", color: "bg-amber-500" },
  { date: "Sep 1", day: "Mon", title: "School Reopens (Term 3)", time: "8:00 AM", type: "Holiday", color: "bg-emerald-600" },
  { date: "Sep 5", day: "Fri", title: "Term 3 Fee Deadline", time: "All Day", type: "Fee", color: "bg-gold" },
];

const typeColors: Record<string, string> = {
  Meeting: "bg-navy/10 text-navy",
  Exam: "bg-red-100 text-red-600",
  Event: "bg-emerald-100 text-emerald-700",
  Holiday: "bg-amber-100 text-amber-700",
  Fee: "bg-gold/30 text-navy",
};

export default function ParentCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">School Calendar</h1>
        <p className="text-muted-foreground text-sm">Upcoming events, exams, and important dates.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: "Upcoming Events", value: 5, color: "text-navy" },
          { label: "Exams This Term", value: 2, color: "text-red-500" },
          { label: "Days to Term End", value: 36, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`font-display text-3xl font-black mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Upcoming Events</h3>
        </div>
        <div className="divide-y divide-border">
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition">
              <div className={`${e.color} text-white w-14 h-14 flex flex-col items-center justify-center shrink-0 text-center`}>
                <div className="text-[9px] font-bold opacity-80">{e.date.split(" ")[0].toUpperCase()}</div>
                <div className="font-display text-xl font-black leading-none">{e.date.split(" ")[1]}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-navy">{e.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{e.day} · {e.time}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 shrink-0 ${typeColors[e.type]}`}>{e.type.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
