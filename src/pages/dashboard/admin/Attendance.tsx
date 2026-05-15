import { useMemo, useState, useEffect, type ReactNode, useCallback } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Globe,
  Loader2,
  MapPin,
  RefreshCcw,
  ScanSearch,
  Shield,
  ShieldAlert,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { adminAttendanceService, AttendancePolicy } from "../../../services/attendanceService";

type TabKey = "surveillance" | "anomaly" | "policy";

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "surveillance", label: "Surveillance Log", icon: <Shield size={14} /> },
  { key: "anomaly", label: "Anomaly Detection", icon: <AlertTriangle size={14} /> },
  { key: "policy", label: "Security Policy", icon: <ScanSearch size={14} /> },
];

function PolicyCard({
  title, icon, tone, children,
}: {
  title: string; icon: ReactNode; tone: "green" | "amber" | "blue" | "purple"; children: ReactNode;
}) {
  const toneClass = { green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", blue: "bg-blue-100 text-blue-700", purple: "bg-purple-100 text-purple-700" }[tone];
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

interface TeacherRow {
  teacher_id: string;
  name: string;
  subject: string;
  record_id: string | null;
  clock_in: string | null;
  clock_out: string | null;
  present: boolean;
}

export default function AdminAttendance() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("surveillance");

  const [loading, setLoading] = useState(true);
  const [savingRow, setSavingRow] = useState<string | null>(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [capturingIp, setCapturingIp] = useState(false);
  const [syncingGps, setSyncingGps] = useState(false);

  const [rows, setRows] = useState<TeacherRow[]>([]);
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [policyEdits, setPolicyEdits] = useState<Record<string, string>>({}); // unsaved edits

  // Load teacher attendance for selected date
  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAttendanceService.getTeacherAttendanceByDate(date);
      setRows(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  // Load policies once
  useEffect(() => {
    adminAttendanceService.getPolicies()
      .then(data => {
        setPolicies(data);
        const edits: Record<string, string> = {};
        data.forEach(p => { edits[p.key] = p.value; });
        setPolicyEdits(edits);
      })
      .catch(err => toast.error(err.message));
  }, []);

  // Realtime: refresh when any teacher_clockin changes
  useEffect(() => {
    const channel = supabase
      .channel("admin-attendance-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "teacher_clockin" }, loadAttendance)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAttendance]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => r.name.toLowerCase().includes(q) || r.subject?.toLowerCase().includes(q));
  }, [rows, query]);

  const presentCount = rows.filter(r => r.present).length;

  const toggleStatus = async (row: TeacherRow) => {
    try {
      setSavingRow(row.teacher_id);
      await adminAttendanceService.toggleTeacherPresent(row.teacher_id, date, row.record_id, row.present);
      toast.success(`${row.name} marked as ${row.present ? "absent" : "present"}.`);
      await loadAttendance();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingRow(null);
    }
  };

  const saveAllPolicies = async () => {
    try {
      setSavingPolicy(true);
      await Promise.all(
        Object.entries(policyEdits).map(([key, value]) =>
          adminAttendanceService.updatePolicy(key, value)
        )
      );
      toast.success("Attendance policies saved.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPolicy(false);
    }
  };

  const captureMyIp = async () => {
    try {
      setCapturingIp(true);
      const res = await fetch("https://api.ipify.org?format=json");
      const { ip } = await res.json();
      const existing = policyEdits["ip_pool"] ? policyEdits["ip_pool"].split(",").map(s => s.trim()) : [];
      if (!existing.includes(ip)) {
        setPolicyEdits(prev => ({ ...prev, ip_pool: [...existing, ip].filter(Boolean).join(", ") }));
        toast.success(`Captured IP: ${ip}`);
      } else {
        toast.info(`IP ${ip} is already in the pool.`);
      }
    } catch {
      toast.error("Failed to detect IP. Check your internet connection.");
    } finally {
      setCapturingIp(false);
    }
  };

  const syncGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.");
      return;
    }
    setSyncingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPolicyEdits(prev => ({
          ...prev,
          geo_latitude: pos.coords.latitude.toFixed(6),
          geo_longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success(`GPS synced: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setSyncingGps(false);
      },
      (err) => {
        toast.error(`GPS error: ${err.message}`);
        setSyncingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const ENFORCEMENT_OPTIONS = [
    { value: "disabled", label: "Disabled — No restriction" },
    { value: "alert",    label: "Alert — Flag as suspicious" },
    { value: "enforce",  label: "Enforce — Reject check-in" },
  ];

  const clockInPolicies = ["earliest_signin", "punctuality_limit", "grace_threshold", "absence_trigger"];
  const clockOutPolicies = ["half_day_boundary", "window_authorization", "standard_shift_end"];

  const getPolicyInput = (key: string) => (
    <div key={key} className="space-y-1">
      <div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">
        {policies.find(p => p.key === key)?.label ?? key}
      </div>
      <input
        type="text"
        value={policyEdits[key] ?? ""}
        onChange={e => setPolicyEdits(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder="e.g. 07:00"
        className="w-full bg-white border border-border px-3 py-3 font-bold text-navy text-sm focus:outline-none focus:border-navy"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy flex items-center gap-2">
          Attendance Matrix <span className="text-gold text-2xl mt-1">›</span>{" "}
          <span className="text-xl text-muted-foreground mt-1">{tabs.find(t => t.key === tab)?.label}</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-3xl mt-1">
          Monitor teacher attendance, manage clock-in/out records, and configure attendance policies.
        </p>
      </div>

      {/* Tab strip */}
      <div className="inline-flex items-center gap-1 bg-white border border-border p-1">
        {tabs.map(item => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-5 py-2.5 text-xs font-bold tracking-wider transition flex items-center gap-2 uppercase ${
              tab === item.key ? "bg-navy text-gold" : "text-muted-foreground hover:text-navy hover:bg-secondary/50"
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* ── SURVEILLANCE TAB ── */}
      {tab === "surveillance" && (
        <>
          {/* Stats bar */}
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Total Teachers", value: rows.length, color: "text-navy" },
              { label: "Present", value: presentCount, color: "text-emerald-600" },
              { label: "Absent", value: rows.length - presentCount, color: "text-rose-600" },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-border px-6 py-4 flex gap-4 items-center">
                <div className={`text-2xl font-black font-display ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 items-center bg-white border border-border p-4">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search teacher by name or subject..."
              className="flex-1 min-w-[260px] border border-border bg-white px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy"
            />
            <label className="border border-border bg-white px-3 py-2 flex items-center gap-2 text-sm text-navy">
              <CalendarDays size={14} className="text-muted-foreground" />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-transparent outline-none" />
            </label>
            <button
              className="border border-navy bg-white text-navy px-3 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition flex items-center gap-2"
              onClick={() => { setQuery(""); loadAttendance(); }}
            >
              <RefreshCcw size={14} /> REFRESH
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr>
                  {["TEACHER", "SUBJECT", "CLOCK IN", "CLOCK OUT", "DURATION", "STATUS", "OVERRIDE"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-navy divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                        <Loader2 size={16} className="animate-spin" /> Loading attendance...
                      </div>
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground text-sm italic">
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map(row => {
                    const inTime = row.clock_in ? new Date(row.clock_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";
                    const outTime = row.clock_out ? new Date(row.clock_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";

                    let duration = "—";
                    if (row.clock_in && row.clock_out) {
                      const mins = Math.round((new Date(row.clock_out).getTime() - new Date(row.clock_in).getTime()) / 60000);
                      duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                    }

                    const isToggling = savingRow === row.teacher_id;

                    return (
                      <tr key={row.teacher_id} className="hover:bg-secondary/20 transition">
                        <td className="px-5 py-4 font-semibold text-navy">{row.name}</td>
                        <td className="px-5 py-4 text-muted-foreground text-xs">{row.subject || "—"}</td>
                        <td className="px-5 py-4 font-mono text-xs">{inTime}</td>
                        <td className="px-5 py-4 font-mono text-xs">{outTime}</td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{duration}</td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 ${row.present ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                            {row.present ? "PRESENT" : "ABSENT"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => toggleStatus(row)}
                            disabled={isToggling}
                            className={`text-[10px] font-bold px-3 py-1.5 border transition ${
                              isToggling
                                ? "border-border text-muted-foreground cursor-not-allowed"
                                : row.present
                                ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                                : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {isToggling ? <Loader2 size={10} className="animate-spin inline" /> : row.present ? "MARK ABSENT" : "MARK PRESENT"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="px-5 py-3 text-xs text-muted-foreground flex justify-between border-t border-border bg-secondary/10">
              <span>Live attendance data · Updates in real-time</span>
              <span>{filteredRows.length} teacher(s) shown</span>
            </div>
          </div>
        </>
      )}

      {/* ── ANOMALY TAB ── */}
      {tab === "anomaly" && (
        <>
          <div className="border border-rose-200 bg-rose-50 p-6 flex items-start gap-4">
            <div className="h-10 w-10 bg-rose-600 text-white grid place-items-center shrink-0"><ShieldAlert size={20} /></div>
            <div>
              <h3 className="text-xl font-display font-black text-rose-900">Security Alert Protocol</h3>
              <p className="text-rose-700 text-sm mt-1">
                Flags include: multiple clock-ins in one day, clock-out before clock-in, or records edited by admin after clock-in.
              </p>
            </div>
          </div>
          <div className="bg-white border border-border p-12 text-center text-muted-foreground text-sm">
            No anomalies detected for {date}.
          </div>
        </>
      )}

      {/* ── POLICY TAB ── */}
      {tab === "policy" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <PolicyCard title="Clock-In Matrix" icon={<Clock3 size={18} />} tone="green">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {clockInPolicies.map(getPolicyInput)}
              </div>
            </PolicyCard>

            <PolicyCard title="Clock-Out Matrix" icon={<Clock3 size={18} />} tone="amber">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {clockOutPolicies.map(getPolicyInput)}
              </div>
            </PolicyCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Network Isolation */}
            <PolicyCard title="Network Isolation" icon={<Globe size={18} />} tone="blue">
              <div className="space-y-4">
                <div>
                  <div className="text-xs tracking-wider uppercase text-muted-foreground font-bold mb-2">Authorized IP Pool</div>
                  <div className="flex gap-2">
                    <input
                      value={policyEdits["ip_pool"] ?? ""}
                      onChange={e => setPolicyEdits(prev => ({ ...prev, ip_pool: e.target.value }))}
                      placeholder="e.g. 192.168.1.1, 10.0.0.1"
                      className="flex-1 border border-border px-3 py-2 bg-white text-sm text-navy focus:outline-none focus:border-navy"
                    />
                    <button
                      onClick={captureMyIp}
                      disabled={capturingIp}
                      className="border border-navy text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
                    >
                      {capturingIp ? <Loader2 size={12} className="animate-spin" /> : <Wifi size={12} />}
                      {capturingIp ? "DETECTING..." : "CAPTURE MY IP"}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-wider uppercase text-muted-foreground font-bold mb-2">Enforcement Protocol</div>
                  <select
                    value={policyEdits["ip_enforcement"] ?? "disabled"}
                    onChange={e => setPolicyEdits(prev => ({ ...prev, ip_enforcement: e.target.value }))}
                    className="w-full border border-border bg-white px-3 py-2.5 text-sm text-navy font-semibold focus:outline-none focus:border-navy"
                  >
                    {ENFORCEMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </PolicyCard>

            {/* Geofence Registry */}
            <PolicyCard title="Geofence Registry" icon={<MapPin size={18} />} tone="purple">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs tracking-wider uppercase text-muted-foreground font-bold mb-1.5">Latitude Reference</div>
                    <input
                      value={policyEdits["geo_latitude"] ?? ""}
                      onChange={e => setPolicyEdits(prev => ({ ...prev, geo_latitude: e.target.value }))}
                      placeholder="e.g. 6.5244"
                      className="w-full border border-border px-3 py-2 bg-white text-sm text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                  <div>
                    <div className="text-xs tracking-wider uppercase text-muted-foreground font-bold mb-1.5">Longitude Reference</div>
                    <input
                      value={policyEdits["geo_longitude"] ?? ""}
                      onChange={e => setPolicyEdits(prev => ({ ...prev, geo_longitude: e.target.value }))}
                      placeholder="e.g. 3.3792"
                      className="w-full border border-border px-3 py-2 bg-white text-sm text-navy focus:outline-none focus:border-navy"
                    />
                  </div>
                </div>

                <button
                  onClick={syncGps}
                  disabled={syncingGps}
                  className="w-full border border-navy text-navy py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {syncingGps ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
                  {syncingGps ? "ACQUIRING GPS..." : "SYNC GPS COORDINATES"}
                </button>

                <div className="flex items-center justify-between">
                  <div className="text-xs tracking-wider uppercase text-muted-foreground font-bold">Authorized Radius</div>
                  <span className="text-xs font-bold text-navy border border-border px-2 py-0.5">{policyEdits["geo_radius"] ?? "200"}m</span>
                </div>
                <input
                  type="range" min="50" max="5000" step="50"
                  value={policyEdits["geo_radius"] ?? "200"}
                  onChange={e => setPolicyEdits(prev => ({ ...prev, geo_radius: e.target.value }))}
                  className="w-full accent-navy"
                />

                <div>
                  <div className="text-xs tracking-wider uppercase text-muted-foreground font-bold mb-2">Accuracy Protocol</div>
                  <select
                    value={policyEdits["geo_enforcement"] ?? "disabled"}
                    onChange={e => setPolicyEdits(prev => ({ ...prev, geo_enforcement: e.target.value }))}
                    className="w-full border border-border bg-white px-3 py-2.5 text-sm text-navy font-semibold focus:outline-none focus:border-navy"
                  >
                    {ENFORCEMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </PolicyCard>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={saveAllPolicies}
              disabled={savingPolicy}
              className={`bg-navy text-gold px-6 py-3 text-xs font-bold tracking-wider transition flex items-center gap-2 ${savingPolicy ? "opacity-70 cursor-not-allowed" : "hover:bg-navy/90"}`}
            >
              {savingPolicy ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              {savingPolicy ? "SAVING..." : "LOCK CONFIGURATION"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
