<<<<<<< HEAD
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
=======
import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, LogIn, LogOut, CalendarDays, TimerReset } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store";

const TEACHER_ID = "T-001";

type AttendanceRecord = {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "On Time" | "Late" | "Absent" | "Half Day";
};

const seedRecords: AttendanceRecord[] = [
  { date: "Mon, 5 May 2025", checkIn: "07:52 AM", checkOut: "04:10 PM", status: "On Time" },
  { date: "Tue, 6 May 2025", checkIn: "09:17 AM", checkOut: "04:00 PM", status: "Late" },
  { date: "Wed, 7 May 2025", checkIn: "07:40 AM", checkOut: "01:05 PM", status: "Half Day" },
  { date: "Thu, 8 May 2025", checkIn: null, checkOut: null, status: "Absent" },
  { date: "Fri, 9 May 2025", checkIn: "08:01 AM", checkOut: "04:30 PM", status: "On Time" },
];

function getStatusStyle(status: AttendanceRecord["status"]) {
  switch (status) {
    case "On Time":   return "bg-emerald-100 text-emerald-700";
    case "Late":      return "bg-amber-100 text-amber-700";
    case "Half Day":  return "bg-violet-100 text-violet-700";
    case "Absent":    return "bg-rose-100 text-rose-700";
  }
}

export default function ClockinClockout() {
  const { attendance, toggleClockIn } = useStore();
  const teacherAttendance = attendance[TEACHER_ID] || { isClockedIn: false, lastActionTime: null };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>(seedRecords);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formattedDate = currentTime.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const handleSignIn = () => {
    if (teacherAttendance.isClockedIn) return;
    const time = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setCheckInTime(time);
    toggleClockIn(TEACHER_ID);
    toast.success(`Signed in at ${time}`);
  };

  const handleSignOut = () => {
    if (!teacherAttendance.isClockedIn) return;
    const time = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const hour = currentTime.getHours();
    const status: AttendanceRecord["status"] =
      !checkInTime               ? "Absent" :
      hour < 13                  ? "Half Day" :
      new Date(checkInTime).getHours?.() > 9 ? "Late" : "On Time";

    setCheckOutTime(time);
    toggleClockIn(TEACHER_ID);

    const newRecord: AttendanceRecord = {
      date: formattedDate,
      checkIn: checkInTime,
      checkOut: time,
      status,
    };
    setRecords((prev) => [newRecord, ...prev]);
    toast.success(`Signed out at ${time}`);
    setCheckInTime(null);
    setCheckOutTime(null);
  };

  const isClockedIn = teacherAttendance.isClockedIn;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-navy">My Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your daily check-ins and working hours.</p>
      </div>

      {/* Clock-in card */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        {/* Status bar */}
        <div className={`px-6 py-3 flex items-center gap-2 text-sm font-bold ${isClockedIn ? "bg-emerald-600 text-white" : "bg-navy text-gold"}`}>
          <TimerReset size={16} />
          {isClockedIn ? "Currently Clocked In — Session Active" : "Not Clocked In"}
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Left: time display */}
          <div className="flex flex-col items-center justify-center text-center gap-2 py-4">
            <div className="font-mono text-5xl font-black text-navy tracking-tight">{formattedTime}</div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays size={14} />
              {formattedDate}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Check-in opens at <span className="font-bold text-navy">07:00 AM</span> · Closes at <span className="font-bold text-navy">11:00 AM</span>
            </div>
          </div>

          {/* Right: sign-in status + buttons */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary border border-border rounded-md p-4 text-center">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Check In</div>
                <div className="text-xl font-black text-navy font-mono">
                  {isClockedIn && teacherAttendance.lastActionTime ? teacherAttendance.lastActionTime : checkInTime ?? "—"}
                </div>
              </div>
              <div className="bg-secondary border border-border rounded-md p-4 text-center">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Check Out</div>
                <div className="text-xl font-black text-navy font-mono">
                  {checkOutTime ?? "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSignIn}
                disabled={isClockedIn}
                className={`flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-md transition ${
                  isClockedIn
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "bg-navy text-gold hover:bg-navy/90 shadow-sm"
                }`}
              >
                <LogIn size={16} />
                Sign In
              </button>
              <button
                onClick={handleSignOut}
                disabled={!isClockedIn}
                className={`flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-md transition ${
                  !isClockedIn
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                }`}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-navy text-gold grid place-items-center shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Sign-In Window</div>
            <div className="font-bold text-navy text-sm">07:00 AM – 11:00 AM</div>
          </div>
        </div>
        <div className="bg-white border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-amber-500 text-white grid place-items-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-amber-600 font-bold">Late Grace Period</div>
            <div className="font-bold text-navy text-sm">After 09:00 AM (15 min)</div>
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-emerald-600 text-white grid place-items-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Sign-Out Window</div>
            <div className="font-bold text-navy text-sm">04:00 PM – 06:00 PM</div>
          </div>
        </div>
      </div>

      {/* Attendance history table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
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
                {records.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/40 transition">
                    <td className="px-6 py-4 font-medium text-navy">{r.date}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{r.checkIn ?? "—"}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{r.checkOut ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getStatusStyle(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
>>>>>>> 76282c8 (feat: fix Admin Attendance UI consistency and add Teacher My Attendance (Clock-in/Clock-out) page)
      </div>
    </div>
  );
}
