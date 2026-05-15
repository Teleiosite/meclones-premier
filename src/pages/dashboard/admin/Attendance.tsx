import { useMemo, useState, useEffect, type ReactNode } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCcw,
  ScanSearch,
  Shield,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { attendanceService, AttendanceRecord } from "../../../services/attendanceService";
import { employeeService, Employee } from "../../../services/employeeService";

type TabKey = "surveillance" | "anomaly" | "policy";

const anomalyRows = [
  {
    employee: "Amina Yusuf",
    date: "2026-05-06",
    checkpoint: "North Gate",
    sourceIp: "172.16.8.90",
    hardware: "Unknown Device",
    logic: "2 sign-ins within 5 mins",
  },
  {
    employee: "Tunde Adesanya",
    date: "2026-05-06",
    checkpoint: "Lab Entry",
    sourceIp: "172.16.8.90",
    hardware: "Unrecognized Device ID",
    logic: "IP mismatch",
  },
];

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "surveillance", label: "Surveillance Log", icon: <Shield size={14} /> },
  { key: "anomaly", label: "Anomaly Detection", icon: <AlertTriangle size={14} /> },
  { key: "policy", label: "Security Policy", icon: <ScanSearch size={14} /> },
];

function PolicyCard({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: ReactNode;
  tone: "green" | "amber" | "blue" | "purple";
  children: ReactNode;
}) {
  const toneClass = {
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  }[tone];

  return (
    <div className="bg-white border border-border p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 grid place-items-center ${toneClass}`}>{icon}</div>
        <h3 className="text-2xl font-display font-black text-navy leading-none">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AdminAttendance() {
  const [selectedClass, setSelectedClass] = useState("Primary 3A");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("surveillance");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Dynamically derive available departments/classes from employees
  const availableClasses = useMemo(() => {
    if (employees.length === 0) return ["Primary 3A", "Staff"];
    const depts = new Set(employees.map(e => e.department));
    return Array.from(depts).sort();
  }, [employees]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const emps = await employeeService.getEmployees();
        setEmployees(emps);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        const records = await attendanceService.getAttendanceByDate(date);
        setAttendanceRecords(records);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [date]);

  const classEmployees = useMemo(() => {
    return employees.filter(e => e.department === selectedClass);
  }, [employees, selectedClass]);

  const gridRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    return classEmployees
      .filter(e => e.full_name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
      .map(emp => {
        const att = attendanceRecords.find(r => r.employee_id === emp.id);
        const present = att?.status === 'present' || att?.status === 'late';
        
        return {
          id: emp.id,
          name: emp.full_name,
          present,
          timeIn: att?.check_in ? new Date(att.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
          timeOut: att?.check_out ? new Date(att.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—",
          ip: "10.12.0." + (emp.id.charCodeAt(0) % 255), // Mock IP
        };
      });
  }, [classEmployees, attendanceRecords, query]);

  const presentCount = gridRows.filter((s) => s.present).length;

  const toggleAttendanceStatus = async (employeeId: string, currentStatus: boolean) => {
    try {
      const newStatus = currentStatus ? 'absent' : 'present';
      
      // Optimistic UI update
      setAttendanceRecords(prev => {
        const existing = prev.find(r => r.employee_id === employeeId);
        if (existing) {
          return prev.map(r => r.employee_id === employeeId ? { ...r, status: newStatus } : r);
        }
        // If they didn't exist yet, we add a mock one for optimistic update
        return [...prev, {
          id: crypto.randomUUID(), // Temp ID
          employee_id: employeeId,
          date,
          status: newStatus,
          check_in: null,
          check_out: null,
          notes: null
        }];
      });

      // Find the real record ID if it exists
      const existingRecord = attendanceRecords.find(r => r.employee_id === employeeId);
      
      await attendanceService.upsertAttendance({
        id: existingRecord?.id,
        employee_id: employeeId,
        date,
        status: newStatus,
      });

      // Refetch to get actual IDs and sync
      const newRecs = await attendanceService.getAttendanceByDate(date);
      setAttendanceRecords(newRecs);
      
      toast.success(`Marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message);
      // Revert on error by refetching
      const newRecs = await attendanceService.getAttendanceByDate(date);
      setAttendanceRecords(newRecs);
    }
  };

  const handleLockConfiguration = async () => {
    try {
      setSaving(true);
      // Create records for everyone currently shown as absent who doesn't have a record
      // In a real app, this would be an admin UI where you check boxes
      const recordsToSave: Partial<AttendanceRecord>[] = classEmployees.map(emp => {
        const existing = attendanceRecords.find(r => r.employee_id === emp.id);
        return {
          id: existing?.id,
          employee_id: emp.id,
          date,
          status: existing?.status || 'absent'
        };
      });

      await attendanceService.bulkUpsertAttendance(recordsToSave);
      toast.success(`Saved: ${presentCount} present, ${classEmployees.length - presentCount} absent in ${selectedClass}.`);
      
      // Refresh
      const newRecs = await attendanceService.getAttendanceByDate(date);
      setAttendanceRecords(newRecs);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy flex items-center gap-2">
          Attendance Matrix <span className="text-gold text-2xl mt-1">›</span> <span className="text-xl text-muted-foreground mt-1">{tabs.find((t) => t.key === tab)?.label}</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-3xl mt-1">Advanced biometric monitoring and network-level security policing for organizational check-in integrity.</p>
      </div>

      <div className="inline-flex items-center gap-1 bg-white border border-border p-1">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-5 py-2.5 text-xs font-bold tracking-wider transition flex items-center gap-2 uppercase ${
              tab === item.key ? "bg-navy text-gold" : "text-muted-foreground hover:text-navy hover:bg-secondary/50"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {tab === "surveillance" && (
        <>
          <div className="flex flex-wrap gap-3 items-center bg-white border border-border p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employee by name..."
              className="flex-1 min-w-[260px] border border-border bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy"
            />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-border bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy"
              disabled={loading}
            >
              {availableClasses.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <label className="border border-border bg-white px-3 py-2 flex items-center gap-2 text-sm text-navy">
              <CalendarDays size={14} className="text-muted-foreground" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent outline-none" disabled={loading} />
            </label>
            <button className="border border-navy bg-white text-navy px-3 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition flex items-center gap-2" onClick={() => setQuery("")}>
              <RefreshCcw size={14} /> RESET
            </button>
          </div>

          <div className="bg-white border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr>
                  {["EMPLOYEE", "LOG DATE", "CLOCK IN", "CLOCK OUT", "NETWORK IP", "OUTCOME", "VALIDATION"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-navy divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm italic">Loading attendance data...</td>
                  </tr>
                ) : gridRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm italic">
                      No check-in entries found for {selectedClass}.
                    </td>
                  </tr>
                ) : (
                  gridRows.map((row) => (
                    <tr key={row.id} className="hover:bg-secondary/20 transition">
                      <td className="px-5 py-4 font-semibold text-navy">{row.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">{date}</td>
                      <td className="px-5 py-4 font-mono text-xs">{row.timeIn}</td>
                      <td className="px-5 py-4 font-mono text-xs">{row.timeOut}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{row.ip}</td>
                      <td className="px-5 py-4">
                        <button 
                          onClick={() => toggleAttendanceStatus(row.id, row.present)}
                          disabled={saving || loading}
                          className={`text-[10px] font-bold px-2 py-1 transition-colors ${row.present ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200"}`}
                        >
                          {row.present ? "VERIFIED" : "FAILED"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-muted-foreground">{row.present ? "PASS" : "REVIEW"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="px-5 py-3 text-xs text-muted-foreground flex justify-between border-t border-border bg-secondary/10">
              <span>Real-time telemetry data</span>
              <span>{gridRows.length} log(s)</span>
            </div>
          </div>
        </>
      )}

      {tab === "anomaly" && (
        <>
          <div className="border border-rose-200 bg-rose-50 p-6 flex items-start gap-4">
            <div className="h-10 w-10 bg-rose-600 text-white grid place-items-center shrink-0"><ShieldAlert size={20} /></div>
            <div>
              <h3 className="text-xl font-display font-black text-rose-900">Security Alert Protocol</h3>
              <p className="text-rose-700 text-sm mt-1">These records were automatically flagged by the anti-cheat engine. Detection triggers include: unrecognized device IDs, multiple IPs, or bulk sign-ins within 5 minutes.</p>
            </div>
          </div>

          <div className="bg-white border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr>
                  {["IDENTIFIED EMPLOYEE", "EVENT DATE", "CHECKPOINT", "SOURCE IP", "HARDWARE IDENTITY", "VIOLATION LOGIC"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-navy divide-y divide-border">
                {anomalyRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition">
                    <td className="px-5 py-4 font-semibold text-navy">{row.employee}</td>
                    <td className="px-5 py-4 text-muted-foreground">{row.date}</td>
                    <td className="px-5 py-4">{row.checkpoint}</td>
                    <td className="px-5 py-4 font-mono text-xs">{row.sourceIp}</td>
                    <td className="px-5 py-4 text-muted-foreground">{row.hardware}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 bg-rose-100 text-rose-700">
                        {row.logic.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "policy" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <PolicyCard title="Clock-In Matrix" icon={<Clock3 size={18} />} tone="green">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1"><div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Earliest Sign-In</div><div className="bg-secondary border border-border p-3 font-bold text-navy">07:00 AM</div></div>
                <div className="space-y-1"><div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Punctuality Limit</div><div className="bg-secondary border border-border p-3 font-bold text-navy">09:00 AM</div></div>
                <div className="space-y-1"><div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Grace Threshold (Min)</div><div className="bg-secondary border border-border p-3 font-bold text-navy">15</div></div>
                <div className="space-y-1"><div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Absence Trigger</div><div className="bg-secondary border border-border p-3 font-bold text-navy">11:00 AM</div></div>
              </div>
            </PolicyCard>

            <PolicyCard title="Clock-Out Matrix" icon={<Clock3 size={18} />} tone="amber">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1"><div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Half-Day Boundary</div><div className="bg-secondary border border-border p-3 font-bold text-navy">01:00 PM</div></div>
                <div className="space-y-1"><div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Window Authorization</div><div className="bg-secondary border border-border p-3 font-bold text-navy">04:00 PM</div></div>
                <div className="space-y-1 sm:col-span-2"><div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Standard Shift End</div><div className="bg-secondary border border-border p-3 font-bold text-navy">06:00 PM</div></div>
              </div>
            </PolicyCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <PolicyCard title="Network Isolation" icon={<Wifi size={18} />} tone="blue">
              <div className="space-y-3">
                <div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Authorized IP Pool</div>
                <div className="flex gap-2">
                  <input placeholder="e.g. 192.168.1.1, 10.0.0.1" className="flex-1 border border-border px-3 py-2 bg-white text-sm text-navy focus:outline-none focus:border-navy" />
                  <button className="border border-navy text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition">CAPTURE IP</button>
                </div>
              </div>
            </PolicyCard>

            <PolicyCard title="Geofence Registry" icon={<MapPin size={18} />} tone="purple">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Latitude" className="border border-border px-3 py-2 bg-white text-sm text-navy focus:outline-none focus:border-navy" />
                  <input placeholder="Longitude" className="border border-border px-3 py-2 bg-white text-sm text-navy focus:outline-none focus:border-navy" />
                </div>
                <button className="w-full border border-navy text-navy py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition">SYNC COORDINATES</button>
              </div>
            </PolicyCard>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleLockConfiguration}
              disabled={saving || loading}
              className={`bg-navy text-gold px-6 py-3 text-xs font-bold tracking-wider transition flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-navy/90'}`}
            >
              <Shield size={14} /> {saving ? "SAVING..." : "LOCK CONFIGURATION"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
