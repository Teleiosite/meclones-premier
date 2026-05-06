import { useMemo, useState } from "react";
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

type TabKey = "surveillance" | "anomaly" | "policy";

const classes = ["Primary 3A", "Primary 5A", "JSS 1A", "JSS 2B", "SS 1A", "SS 2B"];

const generateStudents = (cls: string) => [
  { id: 1, name: "David Okafor", present: true, timeIn: "07:41 AM", timeOut: "03:21 PM", ip: "10.12.0.14" },
  { id: 2, name: "Grace Okafor", present: true, timeIn: "07:43 AM", timeOut: "03:18 PM", ip: "10.12.0.21" },
  { id: 3, name: "Amina Yusuf", present: false, timeIn: "—", timeOut: "—", ip: "—" },
  { id: 4, name: "Emeka Eze", present: true, timeIn: "07:49 AM", timeOut: "03:24 PM", ip: "10.12.0.17" },
  { id: 5, name: "Fatima Bello", present: true, timeIn: "07:45 AM", timeOut: "03:16 PM", ip: "10.12.0.25" },
  { id: 6, name: "Tunde Adesanya", present: false, timeIn: "—", timeOut: "—", ip: "—" },
  { id: 7, name: "Ngozi Nwosu", present: true, timeIn: "07:39 AM", timeOut: "03:26 PM", ip: "10.12.0.12" },
  { id: 8, name: "Chukwudi Obi", present: true, timeIn: "07:46 AM", timeOut: "03:19 PM", ip: "10.12.0.18" },
].map((s) => ({ ...s, class: cls }));

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

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
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
  icon: React.ReactNode;
  tone: "green" | "amber" | "blue" | "purple";
  children: React.ReactNode;
}) {
  const toneClass = {
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${toneClass}`}>{icon}</div>
        <h3 className="text-3xl font-display font-black text-navy leading-none">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AdminAttendance() {
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [students, setStudents] = useState(generateStudents(selectedClass));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabKey>("surveillance");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((row) => row.name.toLowerCase().includes(q) || row.id.toString().includes(q));
  }, [students, query]);

  const presentCount = students.filter((s) => s.present).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-black text-navy">Attendance Matrix <span className="text-gold">›</span> <span className="text-2xl text-muted-foreground">{tabs.find((t) => t.key === tab)?.label}</span></h1>
        <p className="text-muted-foreground text-lg max-w-3xl">Advanced biometric monitoring and network-level security policing for organizational check-in integrity.</p>
      </div>

      <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 border border-border shadow-sm">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-5 py-3 text-sm font-bold rounded-xl transition flex items-center gap-2 ${
              tab === item.key ? "bg-orange-500 text-white shadow" : "text-muted-foreground hover:text-navy"
            }`}
          >
            {item.icon}
            {item.label.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "surveillance" && (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employee by name or ID..."
              className="flex-1 min-w-[260px] border border-border bg-white rounded-xl px-4 py-3"
            />
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setStudents(generateStudents(e.target.value));
              }}
              className="border border-border bg-white rounded-xl px-4 py-3"
            >
              {classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <label className="border border-border bg-white rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
              <CalendarDays size={16} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent outline-none" />
            </label>
            <button className="border border-border rounded-xl p-3 bg-white" onClick={() => setQuery("")}>
              <RefreshCcw size={16} />
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="grid grid-cols-7 text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-bold border-b border-border px-6 py-4">
              <div>Employee</div><div>Log Date</div><div>Clock In</div><div>Clock Out</div><div>Network IP</div><div>Outcome</div><div>Validation</div>
            </div>
            {filteredRows.length === 0 ? (
              <div className="h-52 grid place-items-center text-muted-foreground italic">No check-in entries found.</div>
            ) : (
              filteredRows.map((row) => (
                <div key={row.id} className="grid grid-cols-7 px-6 py-4 border-b border-border/60 text-sm items-center">
                  <div className="font-semibold text-navy">{row.name}</div>
                  <div>{date}</div>
                  <div>{row.timeIn}</div>
                  <div>{row.timeOut}</div>
                  <div>{row.ip}</div>
                  <div className={row.present ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}>{row.present ? "Verified" : "Failed"}</div>
                  <div>{row.present ? "Pass" : "Review"}</div>
                </div>
              ))
            )}
            <div className="px-6 py-3 text-xs text-muted-foreground flex justify-between"><span>Real-time telemetry data</span><span>{filteredRows.length} log(s)</span></div>
          </div>
        </>
      )}

      {tab === "anomaly" && (
        <>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500 text-white grid place-items-center shadow"><ShieldAlert size={22} /></div>
            <div>
              <h3 className="text-2xl font-display font-black text-rose-800">Security Alert Protocol</h3>
              <p className="text-rose-700 text-sm mt-1">These records were automatically flagged by the anti-cheat engine. Detection triggers include: unrecognized device IDs, multiple IPs, or bulk sign-ins within 5 minutes.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white overflow-hidden">
            <div className="grid grid-cols-6 text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-bold border-b border-border px-6 py-4">
              <div>Identified Employee</div><div>Event Date</div><div>Checkpoint</div><div>Source IP</div><div>Hardware Identity</div><div>Violation Logic</div>
            </div>
            {anomalyRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-6 px-6 py-4 border-b border-border/60 text-sm">
                <div className="font-semibold text-navy">{row.employee}</div>
                <div>{row.date}</div>
                <div>{row.checkpoint}</div>
                <div>{row.sourceIp}</div>
                <div>{row.hardware}</div>
                <div className="text-rose-600 font-semibold">{row.logic}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "policy" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <PolicyCard title="Clock-In Matrix" icon={<Clock3 size={18} />} tone="green">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2"><div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Earliest Sign-In</div><div className="bg-secondary border border-border rounded-xl p-3 font-bold text-navy">07:00 AM</div></div>
                <div className="space-y-2"><div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Punctuality Limit</div><div className="bg-secondary border border-border rounded-xl p-3 font-bold text-navy">09:00 AM</div></div>
                <div className="space-y-2"><div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Grace Threshold (Min)</div><div className="bg-secondary border border-border rounded-xl p-3 font-bold text-navy">15</div></div>
                <div className="space-y-2"><div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Absence Trigger</div><div className="bg-secondary border border-border rounded-xl p-3 font-bold text-navy">11:00 AM</div></div>
              </div>
            </PolicyCard>

            <PolicyCard title="Clock-Out Matrix" icon={<Clock3 size={18} />} tone="amber">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2"><div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Half-Day Boundary</div><div className="bg-secondary border border-border rounded-xl p-3 font-bold text-navy">01:00 PM</div></div>
                <div className="space-y-2"><div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Window Authorization</div><div className="bg-secondary border border-border rounded-xl p-3 font-bold text-navy">04:00 PM</div></div>
                <div className="space-y-2 sm:col-span-2"><div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Standard Shift End</div><div className="bg-secondary border border-border rounded-xl p-3 font-bold text-navy">06:00 PM</div></div>
              </div>
            </PolicyCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <PolicyCard title="Network Isolation" icon={<Wifi size={18} />} tone="blue">
              <div className="space-y-4">
                <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Authorized IP Pool</div>
                <div className="flex gap-3">
                  <input placeholder="e.g. 192.168.1.1, 10.0.0.1" className="flex-1 border border-border rounded-xl px-3 py-3 bg-secondary" />
                  <button className="border border-orange-300 text-orange-600 px-4 rounded-xl font-semibold">Capture My IP</button>
                </div>
              </div>
            </PolicyCard>

            <PolicyCard title="Geofence Registry" icon={<MapPin size={18} />} tone="purple">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Latitude reference" className="border border-border rounded-xl px-3 py-3 bg-secondary" />
                  <input placeholder="Longitude reference" className="border border-border rounded-xl px-3 py-3 bg-secondary" />
                </div>
                <button className="w-full border border-purple-300 text-purple-600 rounded-xl py-3 font-semibold">Sync GPS Coordinates</button>
              </div>
            </PolicyCard>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => toast.success(`Saved: ${presentCount} present, ${students.length - presentCount} absent in ${selectedClass}.`)}
              className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition"
            >
              Lock Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
