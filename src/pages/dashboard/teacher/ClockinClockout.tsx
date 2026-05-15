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
      <div className="bg-white border border-border p-6 grid lg:grid-cols-[1.4fr_1fr_auto] gap-8 items-center">
        <div>
          <div className="font-display text-5xl font-black text-navy tracking-tight">{timeText}</div>
          <div className="text-muted-foreground text-sm mt-1">{dateText}</div>
          <div className="text-emerald-600 font-bold mt-2 text-xs tracking-wider uppercase">Check-in window open until 23:00</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center items-center">
          <div className="border-r border-border pr-6">
            <div className="text-xs tracking-wider text-muted-foreground font-bold uppercase">Check In</div>
            <div className="text-2xl font-black text-navy mt-2">{checkIn ?? "—"}</div>
          </div>
          <div className="pl-2">
            <div className="text-xs tracking-wider text-muted-foreground font-bold uppercase">Check Out</div>
            <div className="text-2xl font-black text-navy mt-2">{checkOut ?? "—"}</div>
          </div>
        </div>

        <div className="space-y-3 min-w-[160px]">
          <button 
            onClick={() => setCheckIn(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))} 
            disabled={!!checkIn}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold tracking-wider transition uppercase ${!checkIn ? "bg-navy text-gold hover:bg-navy/90" : "bg-secondary text-muted-foreground border border-border cursor-not-allowed"}`}
          >
            <LogIn size={14} />
            Sign In
          </button>
          <button 
            onClick={() => setCheckOut(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))} 
            disabled={!checkIn || !!checkOut}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold tracking-wider transition uppercase ${checkIn && !checkOut ? "border border-navy text-navy hover:bg-navy hover:text-gold" : "bg-secondary border border-border text-muted-foreground cursor-not-allowed"}`}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-secondary/40 border border-border p-4 text-sm text-navy flex flex-wrap items-center gap-x-8 gap-y-3">
        <span className="flex items-center gap-2">
          <Clock3 size={16} className="text-navy" /> 
          Sign-in window: <strong>19:12 - 23:00</strong>
        </span>
        <span className="flex items-center gap-2">
          <TriangleAlert size={16} className="text-amber-600" /> 
          Late after: <strong>22:00</strong> <span className="text-xs text-muted-foreground ml-1">(+15 min grace)</span>
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" /> 
          Sign-out opens: <strong>16:00</strong>
        </span>
      </div>

      {/* Attendance history table */}
      <div className="bg-white border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2 text-navy text-sm font-bold">
          <CalendarDays size={16} className="text-navy" />
          Recent Attendance History
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 border-b border-border">
              <tr>
                {["DATE", "CHECK IN", "CHECK OUT", "STATUS"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy divide-y divide-border">
              {/* No records placeholder */}
              <tr>
                <td colSpan={4} className="py-16 text-center text-muted-foreground text-sm">
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
