import { useMemo, useState, useEffect } from "react";
import { CalendarDays, LogIn, LogOut, CheckCircle2, Clock3, TriangleAlert } from "lucide-react";

export default function ClockinClockout() {
  const [now, setNow] = useState(new Date());
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeText = useMemo(
    () => now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    [now]
  );
  
  const dateText = useMemo(
    () => now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    [now]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-navy">My Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your daily check-ins and working hours.</p>
      </div>

      {/* Clock-in card */}
      <div className="bg-white border border-border rounded-xl p-8 grid lg:grid-cols-[1.4fr_1fr_auto] gap-8 items-center">
        <div>
          <div className="font-display text-5xl font-black text-navy tracking-tight">{timeText}</div>
          <div className="text-muted-foreground text-lg mt-2 font-medium">{dateText}</div>
          <div className="text-emerald-500 font-bold mt-3 text-sm">Check-in window open until 23:00</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center items-center">
          <div className="border-r border-border pr-6">
            <div className="text-[11px] tracking-[0.15em] text-muted-foreground font-bold uppercase">Check In</div>
            <div className="text-2xl font-black text-navy mt-2">{checkIn ?? "—"}</div>
          </div>
          <div className="pl-2">
            <div className="text-[11px] tracking-[0.15em] text-muted-foreground font-bold uppercase">Check Out</div>
            <div className="text-2xl font-black text-navy mt-2">{checkOut ?? "—"}</div>
          </div>
        </div>

        <div className="space-y-3 min-w-[140px]">
          <button 
            onClick={() => setCheckIn(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))} 
            disabled={!!checkIn}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold rounded-lg transition-all ${!checkIn ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm" : "bg-secondary text-muted-foreground cursor-not-allowed"}`}
          >
            <LogIn size={18} />
            Sign In
          </button>
          <button 
            onClick={() => setCheckOut(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))} 
            disabled={!checkIn || !!checkOut}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold rounded-lg transition-all ${checkIn && !checkOut ? "bg-rose-500 text-white hover:bg-rose-600 shadow-sm" : "bg-secondary border border-border text-muted-foreground cursor-not-allowed"}`}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-[#fff8f1] border border-orange-100 rounded-lg p-5 text-sm text-navy flex flex-wrap items-center gap-x-8 gap-y-3">
        <span className="flex items-center gap-2.5">
          <Clock3 size={16} className="text-orange-500" /> 
          Sign-in window: <strong>19:12 - 23:00</strong>
        </span>
        <span className="flex items-center gap-2.5">
          <TriangleAlert size={16} className="text-amber-500" /> 
          Late after: <strong>22:00</strong> (+15 min grace)
        </span>
        <span className="flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-500" /> 
          Sign-out opens: <strong>16:00</strong>
        </span>
      </div>

      {/* Attendance history table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2.5 text-navy font-bold">
          <CalendarDays size={18} className="text-orange-500" />
          Recent Attendance History
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-bold border-b border-border bg-secondary/30">
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Check In</th>
                <th className="text-left px-6 py-4">Check Out</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* No records placeholder */}
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">
                  No attendance records yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
