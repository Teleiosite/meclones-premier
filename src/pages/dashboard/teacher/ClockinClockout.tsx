import { useMemo, useState, useEffect } from "react";
import { CalendarDays, LogIn, LogOut, CheckCircle2, Clock3, TriangleAlert, Loader2, UserX } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { teacherAttendanceService, TeacherClockinRecord } from "../../../services/attendanceService";

export default function ClockinClockout() {
  const { user, loading: authLoading } = useAuth();

  const [now, setNow] = useState(new Date());
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [todayRecord, setTodayRecord] = useState<TeacherClockinRecord | null>(null);
  const [history, setHistory] = useState<TeacherClockinRecord[]>([]);

  // Tick the clock every second
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
  const todayStr = now.toISOString().split("T")[0];

  // Load the teacher ID once we know the user
  useEffect(() => {
    if (authLoading || !user) return;

    const init = async () => {
      try {
        setPageLoading(true);
        const tid = await teacherAttendanceService.getMyTeacherId();
        setTeacherId(tid);
      } catch (err: any) {
        setTeacherError(err.message);
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, [user, authLoading]);

  // Load today's record + history whenever teacherId changes
  const loadRecords = async (tid: string) => {
    try {
      const [today, hist] = await Promise.all([
        teacherAttendanceService.getTodayRecord(tid),
        teacherAttendanceService.getHistory(tid),
      ]);
      setTodayRecord(today);
      setHistory(hist);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (!teacherId) return;
    loadRecords(teacherId);

    // Realtime subscription for this teacher's records
    const channel = supabase
      .channel("teacher-clockin-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teacher_clockin", filter: `teacher_id=eq.${teacherId}` },
        () => loadRecords(teacherId)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [teacherId]);

  const checkInTime = todayRecord?.clock_in
    ? new Date(todayRecord.clock_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;
  const checkOutTime = todayRecord?.clock_out
    ? new Date(todayRecord.clock_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  const handleSignIn = async () => {
    if (!teacherId) return;
    try {
      setSaving(true);
      await teacherAttendanceService.clockIn(teacherId);
      toast.success("Successfully signed in.");
      await loadRecords(teacherId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (!teacherId || !todayRecord?.id || !todayRecord.clock_in) return;
    try {
      setSaving(true);
      await teacherAttendanceService.clockOut(teacherId, todayRecord.id, todayRecord.clock_in);
      toast.success("Successfully signed out.");
      await loadRecords(teacherId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading states ──
  if (authLoading || pageLoading) {
    return (
      <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading your attendance...</span>
      </div>
    );
  }

  if (teacherError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <UserX size={40} className="text-muted-foreground" />
        <p className="font-bold text-navy">Teacher Profile Not Found</p>
        <p className="text-muted-foreground text-sm max-w-xs">{teacherError}</p>
      </div>
    );
  }

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
          {!checkInTime && (
            <div className="text-emerald-600 font-bold mt-2 text-xs tracking-wider uppercase">
              Check-in window is open
            </div>
          )}
          {checkInTime && !checkOutTime && (
            <div className="text-amber-600 font-bold mt-2 text-xs tracking-wider uppercase">
              Signed in — don't forget to sign out
            </div>
          )}
          {checkOutTime && (
            <div className="text-navy font-bold mt-2 text-xs tracking-wider uppercase">
              ✓ Attendance complete for today
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center items-center">
          <div className="border-r border-border pr-6">
            <div className="text-xs tracking-wider text-muted-foreground font-bold uppercase">Check In</div>
            <div className="text-2xl font-black text-navy mt-2">{checkInTime ?? "—"}</div>
          </div>
          <div className="pl-2">
            <div className="text-xs tracking-wider text-muted-foreground font-bold uppercase">Check Out</div>
            <div className="text-2xl font-black text-navy mt-2">{checkOutTime ?? "—"}</div>
          </div>
        </div>

        <div className="space-y-3 min-w-[160px]">
          <button
            onClick={handleSignIn}
            disabled={!!checkInTime || saving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold tracking-wider transition uppercase ${
              !checkInTime && !saving
                ? "bg-navy text-gold hover:bg-navy/90"
                : "bg-secondary text-muted-foreground border border-border cursor-not-allowed"
            }`}
          >
            {saving && !checkInTime ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
            {saving && !checkInTime ? "SAVING..." : "SIGN IN"}
          </button>
          <button
            onClick={handleSignOut}
            disabled={!checkInTime || !!checkOutTime || saving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold tracking-wider transition uppercase ${
              checkInTime && !checkOutTime && !saving
                ? "border border-navy text-navy hover:bg-navy hover:text-gold"
                : "bg-secondary border border-border text-muted-foreground cursor-not-allowed"
            }`}
          >
            {saving && checkInTime && !checkOutTime ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            {saving && checkInTime && !checkOutTime ? "SAVING..." : "SIGN OUT"}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-secondary/40 border border-border p-4 text-sm text-navy flex flex-wrap items-center gap-x-8 gap-y-3">
        <span className="flex items-center gap-2">
          <Clock3 size={16} className="text-navy" />
          Sign-in window: <strong>07:00 - 09:00</strong>
        </span>
        <span className="flex items-center gap-2">
          <TriangleAlert size={16} className="text-amber-600" />
          Late after: <strong>09:00</strong> <span className="text-xs text-muted-foreground ml-1">(+15 min grace)</span>
        </span>
        <span className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Sign-out opens: <strong>04:00 PM</strong>
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
                {["DATE", "CLOCK IN", "CLOCK OUT", "STATUS"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy divide-y divide-border">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-muted-foreground text-sm">
                    No attendance records yet.
                  </td>
                </tr>
              ) : (
                history.map((r) => {
                  const hasIn = !!r.clock_in;
                  const hasOut = !!r.clock_out;
                  const statusLabel = !hasIn ? "Absent" : hasOut ? "Present" : "Incomplete";
                  const statusClass = !hasIn
                    ? "bg-rose-100 text-rose-700"
                    : hasOut
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700";

                  return (
                    <tr key={r.id} className="hover:bg-secondary/20 transition">
                      <td className="px-5 py-4 font-semibold text-navy">{r.date}</td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {r.clock_in ? new Date(r.clock_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs">
                        {r.clock_out ? new Date(r.clock_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 ${statusClass}`}>
                          {statusLabel.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
