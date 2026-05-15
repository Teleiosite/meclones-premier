import { useMemo, useState, useEffect } from "react";
import { CalendarDays, LogIn, LogOut, CheckCircle2, Clock3, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { attendanceService, AttendanceRecord } from "../../../services/attendanceService";
import { employeeService, Employee } from "../../../services/employeeService";
import { supabaseClient } from "../../../lib/supabaseClient";

export default function ClockinClockout() {
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

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

  const todayStr = now.toISOString().split("T")[0];

  useEffect(() => {
    const loadInitData = async () => {
      try {
        setLoading(true);
        const emps = await employeeService.getEmployees();
        setEmployees(emps);
        if (emps.length > 0) {
          // Default to first employee for demonstration (in real app, use auth.uid())
          setSelectedEmployee(emps[0].id);
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadInitData();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;

    const loadRecords = async () => {
      try {
        const past30Days = new Date();
        past30Days.setDate(past30Days.getDate() - 30);
        
        const records = await attendanceService.getAttendanceRange(
          past30Days.toISOString().split("T")[0], 
          todayStr, 
          selectedEmployee
        );
        
        const todayRec = records.find(r => r.date === todayStr) || null;
        setTodayRecord(todayRec);
        setHistory(records.filter(r => r.date !== todayStr).slice(0, 10)); // up to 10 historical records
      } catch (err: any) {
        toast.error(err.message);
      }
    };
    loadRecords();

    // Set up realtime subscription
    const channel = supabaseClient
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_attendance',
          filter: `employee_id=eq.${selectedEmployee}`
        },
        (payload) => {
          loadRecords(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [selectedEmployee, todayStr]);

  const checkIn = todayRecord?.check_in ? new Date(todayRecord.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null;
  const checkOut = todayRecord?.check_out ? new Date(todayRecord.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : null;

  const handleSignIn = async () => {
    if (!selectedEmployee) return;
    try {
      setSaving(true);
      await attendanceService.upsertAttendance({
        id: todayRecord?.id,
        employee_id: selectedEmployee,
        date: todayStr,
        status: "present",
        check_in: new Date().toISOString()
      });
      toast.success("Successfully signed in.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (!selectedEmployee || !todayRecord?.check_in) return;
    try {
      setSaving(true);
      await attendanceService.upsertAttendance({
        ...todayRecord,
        check_out: new Date().toISOString()
      });
      toast.success("Successfully signed out.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Attendance</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your daily check-ins and working hours.</p>
        </div>
        <select 
          value={selectedEmployee} 
          onChange={e => setSelectedEmployee(e.target.value)}
          className="border border-border bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy"
          disabled={loading}
        >
          {loading ? <option>Loading...</option> : employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.department})</option>)}
        </select>
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
            onClick={handleSignIn}
            disabled={!!checkIn || saving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold tracking-wider transition uppercase ${!checkIn && !saving ? "bg-navy text-gold hover:bg-navy/90" : "bg-secondary text-muted-foreground border border-border cursor-not-allowed"}`}
          >
            <LogIn size={14} />
            {saving && !checkIn ? "WAIT..." : "SIGN IN"}
          </button>
          <button 
            onClick={handleSignOut}
            disabled={!checkIn || !!checkOut || saving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold tracking-wider transition uppercase ${checkIn && !checkOut && !saving ? "border border-navy text-navy hover:bg-navy hover:text-gold" : "bg-secondary border border-border text-muted-foreground cursor-not-allowed"}`}
          >
            <LogOut size={14} />
            {saving && checkIn && !checkOut ? "WAIT..." : "SIGN OUT"}
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
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-muted-foreground text-sm">
                    No attendance records yet.
                  </td>
                </tr>
              ) : (
                history.map(r => (
                  <tr key={r.id} className="hover:bg-secondary/20 transition">
                    <td className="px-5 py-4 font-semibold text-navy">{r.date}</td>
                    <td className="px-5 py-4 font-mono text-xs">{r.check_in ? new Date(r.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="px-5 py-4 font-mono text-xs">{r.check_out ? new Date(r.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="px-5 py-4 text-xs font-bold uppercase">{r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
