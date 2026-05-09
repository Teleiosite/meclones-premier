import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, TriangleAlert } from "lucide-react";

const mockHistory: { date: string; in: string; out: string; status: string }[] = [];

export default function TeacherClockInClockOut() {
  const [now] = useState(new Date());
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  const timeText = useMemo(
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [now]
  );
  const dateText = useMemo(
    () => now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    [now]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Clockin-Clockout</h1>
        <p className="text-muted-foreground text-sm">Track your daily check-ins and working hours.</p>
      </div>

      <div className="bg-white border border-border p-6 grid lg:grid-cols-[1.4fr_1fr_auto] gap-6 items-center">
        <div>
          <div className="font-display text-5xl font-black text-navy">{timeText}</div>
          <div className="text-muted-foreground mt-1">{dateText}</div>
          <div className="text-accent font-semibold mt-2">Check-in opens at 07:00</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="border-r border-border pr-4">
            <div className="text-[11px] tracking-wider text-muted-foreground font-bold">CHECK IN</div>
            <div className="text-xl font-black text-navy mt-2">{checkIn ?? "—"}</div>
          </div>
          <div>
            <div className="text-[11px] tracking-wider text-muted-foreground font-bold">CHECK OUT</div>
            <div className="text-xl font-black text-navy mt-2">{checkOut ?? "—"}</div>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => setCheckIn(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))} className="w-full bg-navy text-gold px-5 py-3 text-xs font-bold tracking-wider hover:bg-navy/90">SIGN IN</button>
          <button onClick={() => setCheckOut(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))} className="w-full border border-navy text-navy px-5 py-3 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold">SIGN OUT</button>
        </div>
      </div>

      <div className="bg-gold/10 border border-gold/30 p-4 text-sm text-navy flex flex-wrap gap-x-6 gap-y-2">
        <span className="flex items-center gap-2"><Clock3 size={15} className="text-accent" /> Sign-in window: <strong>07:00 - 09:00</strong></span>
        <span className="flex items-center gap-2"><TriangleAlert size={15} className="text-amber-600" /> Late after: <strong>09:15</strong> (+15 min grace)</span>
        <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600" /> Sign-out opens: <strong>04:00 PM</strong></span>
      </div>

      <div className="bg-white border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2 text-navy font-bold"><CalendarDays size={16} className="text-accent" />Recent Attendance History</div>
        <div className="grid grid-cols-4 text-[11px] tracking-wider uppercase text-muted-foreground font-bold px-6 py-3 border-b border-border">
          <div>Date</div><div>Check In</div><div>Check Out</div><div>Status</div>
        </div>
        {mockHistory.length === 0 ? (
          <div className="h-24 grid place-items-center text-muted-foreground">No attendance records yet.</div>
        ) : null}
      </div>
    </div>
  );
}
