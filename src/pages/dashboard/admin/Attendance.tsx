import { useState, useEffect, useCallback } from "react";
import { CalendarDays, RefreshCcw, Loader2, Users, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { CLASSES } from "@/store";

type AttendanceRow = {
  id: string;
  name: string;
  status: "Present" | "Absent" | "Late";
  class: string;
  date: string;
};

export default function AdminAttendance() {
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const classOptions = ["All Classes", ...CLASSES];

  const load = useCallback(async () => {
    setLoading(true);

    let q = supabase
      .from("attendance")
      .select(`
        id, date, status,
        students (
          class,
          profiles!students_profile_id_fkey ( full_name )
        )
      `)
      .eq("date", date)
      .order("created_at", { ascending: false });

    const { data, error } = await q;

    if (error) {
      toast.error("Failed to load attendance.");
      setLoading(false);
      return;
    }

    let mapped: AttendanceRow[] = (data || []).map((r: any) => ({
      id:     r.id,
      name:   r.students?.profiles?.full_name ?? "Unknown Student",
      status: r.status as "Present" | "Absent" | "Late",
      class:  r.students?.class ?? "—",
      date:   r.date,
    }));

    if (selectedClass !== "All Classes") {
      mapped = mapped.filter((r) => r.class === selectedClass);
    }

    if (query.trim()) {
      const q2 = query.trim().toLowerCase();
      mapped = mapped.filter((r) => r.name.toLowerCase().includes(q2));
    }

    setRows(mapped);
    setLoading(false);
  }, [date, selectedClass, query]);

  useEffect(() => { load(); }, [load]);

  const presentCount = rows.filter((r) => r.status === "Present").length;
  const absentCount  = rows.filter((r) => r.status === "Absent").length;
  const lateCount    = rows.filter((r) => r.status === "Late").length;
  const rate = rows.length > 0 ? Math.round((presentCount / rows.length) * 100) : 0;

  const statusStyle: Record<string, string> = {
    Present: "bg-emerald-100 text-emerald-700",
    Absent:  "bg-red-100 text-red-600",
    Late:    "bg-amber-100 text-amber-700",
  };

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Attendance Overview</h1>
        <p className="text-muted-foreground text-sm">View and monitor daily student attendance across all classes.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-border bg-white px-4 py-2.5">
          <CalendarDays size={16} className="text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm focus:outline-none text-navy"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-border bg-white px-4 py-2.5 text-sm text-navy focus:outline-none focus:border-navy"
        >
          {classOptions.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search student name..."
          className="flex-1 min-w-[200px] border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-navy"
        />
        <button
          onClick={() => { setQuery(""); }}
          className="border border-border bg-white p-2.5 hover:bg-secondary transition"
          title="Reset filters"
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Attendance Rate", value: rows.length ? `${rate}%` : "—", color: "text-emerald-600" },
          { label: "Present", value: presentCount, color: "text-emerald-600" },
          { label: "Absent",  value: absentCount,  color: "text-red-500" },
          { label: "Late",    value: lateCount,    color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`font-display text-3xl font-black mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy">
              {selectedClass === "All Classes" ? "All Classes" : selectedClass} — {formattedDate}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{rows.length} record{rows.length !== 1 ? "s" : ""}</p>
          </div>
          <Users size={18} className="text-muted-foreground" />
        </div>

        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
            No attendance records found for this date{selectedClass !== "All Classes" ? ` and class "${selectedClass}"` : ""}.
            {" "}Records are created when a teacher marks attendance.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  {["STUDENT", "CLASS", "DATE", "STATUS"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-navy">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/20">
                    <td className="px-5 py-3 font-semibold flex items-center gap-2">
                      {r.status === "Present"
                        ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                        : <XCircle size={15} className="text-red-400 shrink-0" />}
                      {r.name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.class}</td>
                    <td className="px-5 py-3 text-muted-foreground">{new Date(r.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 ${statusStyle[r.status]}`}>
                        {r.status.toUpperCase()}
                      </span>
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
