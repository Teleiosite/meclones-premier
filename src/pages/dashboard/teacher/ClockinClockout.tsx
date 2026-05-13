import { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle, CheckCircle2, LogIn, LogOut, CalendarDays, TimerReset, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { teacherClockIn, teacherClockOut } from "@/lib/rpc";

type ClockRecord = {
  id: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: "On Time" | "Late" | "Absent" | "Half Day";
};

function getStatusStyle(status: ClockRecord["status"]) {
  switch (status) {
    case "On Time":  return "bg-emerald-100 text-emerald-700";
    case "Late":     return "bg-amber-100 text-amber-700";
    case "Half Day": return "bg-violet-100 text-violet-700";
    case "Absent":   return "bg-rose-100 text-rose-700";
  }
}

function calcStatus(clockIn: Date): ClockRecord["status"] {
  const h = clockIn.getHours();
  if (h < 9) return "On Time";
  if (h < 10) return "Late";
  return "Late";
}

export default function ClockinClockout() {
  const { user } = useAuth();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [todayRecord, setTodayRecord] = useState<{ id: string; clock_in: string | null; clock_out: string | null } | null>(null);
  const [records, setRecords]    = useState<ClockRecord[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading]    = useState(true);
  const [acting, setActing]      = useState(false);

  // Live clock
  useEffect(() => {
    const iv = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formattedDate = currentTime.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const todayISO = currentTime.toISOString().split("T")[0];

  const fetchRecords = useCallback(async (tid: string) => {
    const { data } = await supabase
      .from("teacher_clockin")
      .select("*")
      .eq("teacher_id", tid)
      .order("date", { ascending: false })
      .limit(10);

    const mapped: ClockRecord[] = (data || []).map((r: any) => ({
      id:        r.id,
      date:      new Date(r.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
      clock_in:  r.clock_in ? new Date(r.clock_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null,
      clock_out: r.clock_out ? new Date(r.clock_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null,
      status:    r.clock_in ? (r.clock_out ? (new Date(r.clock_out).getHours() < 13 ? "Half Day" : "On Time") : "On Time") : "Absent",
    }));

    setRecords(mapped);

    // Check today's record
    const today = (data || []).find((r: any) => r.date === todayISO);
    setTodayRecord(today ? { id: today.id, clock_in: today.clock_in, clock_out: today.clock_out } : null);
  }, [todayISO]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: teacher } = await supabase
        .from("teachers")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (teacher) {
        setTeacherId(teacher.id);
        await fetchRecords(teacher.id);
      }
      setLoading(false);
    })();
  }, [user, fetchRecords]);

  const isClockedIn = !!todayRecord?.clock_in && !todayRecord?.clock_out;

  const handleSignIn = async () => {
    if (!teacherId || isClockedIn) return;
    setActing(true);
    const now = new Date();
    const { error } = await teacherClockIn();
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Signed in at ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`);
      await fetchRecords(teacherId);
    }
    setActing(false);
  };

  const handleSignOut = async () => {
    if (!teacherId || !todayRecord || !isClockedIn) return;
    setActing(true);
    const now = new Date();
    const { error } = await teacherClockOut();
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Signed out at ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`);
      await fetchRecords(teacherId);
    }
    setActing(false);
  };

  const checkInDisplay = todayRecord?.clock_in
    ? new Date(todayRecord.clock_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";
  const checkOutDisplay = todayRecord?.clock_out
    ? new Date(todayRecord.clock_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin" /> Loading attendance...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">My Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your daily check-ins and working hours.</p>
      </div>

      {/* Clock-in card */}
      <div className="bg-white border border-border overflow-hidden">
        <div className={`px-6 py-3 flex items-center gap-2 text-sm font-bold ${isClockedIn ? "bg-emerald-600 text-white" : "bg-navy text-gold"}`}>
          <TimerReset size={16} />
          {isClockedIn ? "Currently Clocked In — Session Active" : "Not Clocked In"}
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Live clock */}
          <div className="flex flex-col items-center justify-center text-center gap-2 py-4">
            <div className="font-mono text-5xl font-black text-navy tracking-tight">{formattedTime}</div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays size={14} /> {formattedDate}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Check-in opens at <span className="font-bold text-navy">07:00 AM</span> · Closes at <span className="font-bold text-navy">11:00 AM</span>
            </div>
          </div>

          {/* Buttons & status */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary border border-border p-4 text-center">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Check In</div>
                <div className="text-xl font-black text-navy font-mono">{checkInDisplay}</div>
              </div>
              <div className="bg-secondary border border-border p-4 text-center">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Check Out</div>
                <div className="text-xl font-black text-navy font-mono">{checkOutDisplay}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleSignIn} disabled={isClockedIn || acting}
                className={`flex items-center justify-center gap-2 py-3 font-bold text-sm transition ${isClockedIn || acting ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-navy text-gold hover:bg-navy/90"}`}>
                {acting && !isClockedIn ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Sign In
              </button>
              <button onClick={handleSignOut} disabled={!isClockedIn || acting}
                className={`flex items-center justify-center gap-2 py-3 font-bold text-sm transition ${!isClockedIn || acting ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-rose-600 text-white hover:bg-rose-700"}`}>
                {acting && isClockedIn ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info banners */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: <Clock size={18} />, bg: "bg-navy", iconColor: "text-gold", label: "Sign-In Window", value: "07:00 AM – 11:00 AM", border: "border-border" },
          { icon: <AlertTriangle size={18} />, bg: "bg-amber-500", iconColor: "text-white", label: "Late Grace Period", value: "After 09:00 AM (15 min)", border: "border-amber-200" },
          { icon: <CheckCircle2 size={18} />, bg: "bg-emerald-600", iconColor: "text-white", label: "Sign-Out Window", value: "04:00 PM – 06:00 PM", border: "border-border" },
        ].map(b => (
          <div key={b.label} className={`bg-white border ${b.border} p-4 flex items-center gap-3`}>
            <div className={`h-10 w-10 ${b.bg} ${b.iconColor} grid place-items-center shrink-0`}>{b.icon}</div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{b.label}</div>
              <div className="font-bold text-navy text-sm">{b.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance history */}
      <div className="bg-white border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-navy">Recent Attendance</h3>
          <span className="text-xs text-muted-foreground">{records.length} record{records.length !== 1 ? "s" : ""}</span>
        </div>
        {records.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            <TimerReset size={32} className="mx-auto mb-3 opacity-30" />
            No attendance records yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-bold border-b border-border">
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Check In</th>
                  <th className="text-left px-6 py-3">Check Out</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition">
                    <td className="px-6 py-4 font-medium text-navy">{r.date}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{r.clock_in ?? "—"}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{r.clock_out ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 ${getStatusStyle(r.status)}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
