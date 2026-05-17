import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, X, Users, UserCheck, UserX, Download, ChevronRight, BookOpen, Phone, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";

type Student = {
  id: string;
  admission_no: string;
  full_name: string;
  class: string;
  gender: string;
  status: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  attendance_present: number;
  attendance_absent: number;
  attendance_late: number;
};

const CARD_COLORS = ["bg-navy", "bg-emerald-600", "bg-orange-500", "bg-teal-600", "bg-violet-600", "bg-rose-600"];

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cls, setCls] = useState("All");
  const [classes, setClasses] = useState<string[]>(["All"]);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [markingDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get teacher record
    const { data: teacher } = await supabase
      .from("teachers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!teacher) { setLoading(false); return; }
    setTeacherId(teacher.id);

    // 1. Get classes from timetable
    const { data: ttRows } = await supabase
      .from("timetable")
      .select("class_name")
      .eq("teacher_id", teacher.id);
    const timetableClasses = [...new Set((ttRows || []).map((r: any) => r.class_name))];

    // 2. Get classes where teacher is form teacher
    const { data: formClasses } = await supabase
      .from("classes")
      .select("name")
      .eq("teacher_id", teacher.id);
    const formClassNames = (formClasses || []).map((c: any) => c.name);

    const allClasses = [...new Set([...timetableClasses, ...formClassNames])];
    setClasses(["All", ...allClasses]);

    if (allClasses.length === 0) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("students")
      .select(`
        id, admission_no, class, gender, status,
        profiles!students_profile_id_fkey ( full_name, email ),
        parents ( phone, occupation, address, profiles ( full_name, email ) )
      `)
      .in("class", allClasses)
      .order("class");

    if (error) { toast.error("Failed to load students."); setLoading(false); return; }

    // 4. Load attendance for each student (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString().split("T")[0];

    const studentIds = (data || []).map((s: any) => s.id);
    const { data: attData } = await supabase
      .from("attendance")
      .select("student_id, status")
      .in("student_id", studentIds)
      .gte("date", since);

    const attMap: Record<string, { present: number; absent: number; late: number }> = {};
    for (const row of (attData || [])) {
      if (!attMap[row.student_id]) attMap[row.student_id] = { present: 0, absent: 0, late: 0 };
      if (row.status === "Present") attMap[row.student_id].present++;
      else if (row.status === "Absent") attMap[row.student_id].absent++;
      else if (row.status === "Late") attMap[row.student_id].late++;
    }

    setStudents(
      (data || []).map((s: any) => ({
        id: s.id,
        admission_no: s.admission_no ?? "—",
        full_name: s.profiles?.full_name ?? "Unknown",
        class: s.class,
        gender: s.gender ?? "—",
        status: s.status ?? "Active",
        parent_name: s.parents?.profiles?.full_name ?? "—",
        parent_phone: s.parents?.phone ?? "—",
        parent_email: s.parents?.profiles?.email ?? "—",
        attendance_present: attMap[s.id]?.present ?? 0,
        attendance_absent: attMap[s.id]?.absent ?? 0,
        attendance_late: attMap[s.id]?.late ?? 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase())
      || s.admission_no.toLowerCase().includes(search.toLowerCase());
    const matchClass = cls === "All" || s.class === cls;
    return matchSearch && matchClass;
  });

  const handleMarkAttendance = async (studentId: string, status: "Present" | "Absent" | "Late") => {
    if (!teacherId) return;
    const { error } = await supabase.from("attendance").upsert({
      student_id: studentId,
      date: markingDate,
      status,
      marked_by: teacherId,
    }, { onConflict: "student_id,date" });

    if (error) {
      toast.error("Failed to mark attendance.");
    } else {
      toast.success(`Marked ${status} for ${students.find(s => s.id === studentId)?.full_name}`);
    }
  };

  const exportCSV = () => {
    downloadCSV("students.csv", [
      ["Name", "Admission No", "Class", "Gender", "Status", "Parent", "Present (30d)", "Absent (30d)"],
      ...filtered.map(s => [
        s.full_name, s.admission_no, s.class, s.gender, s.status,
        s.parent_name, String(s.attendance_present), String(s.attendance_absent)
      ])
    ]);
  };

  const totalPresent = filtered.reduce((a, s) => a + s.attendance_present, 0);
  const totalAbsent = filtered.reduce((a, s) => a + s.attendance_absent, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Students</h1>
          <p className="text-muted-foreground text-sm">Students across all your assigned classes (last 30 days attendance shown).</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-widest hover:bg-secondary transition"
        >
          <Download size={14} /> EXPORT CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Total Students</div>
          <div className="font-display text-3xl font-black text-navy mt-1">{filtered.length}</div>
        </div>
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Present (30d avg)</div>
          <div className="font-display text-3xl font-black text-emerald-600 mt-1">{totalPresent}</div>
        </div>
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Absent (30d avg)</div>
          <div className="font-display text-3xl font-black text-rose-600 mt-1">{totalAbsent}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name or admission no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border focus:border-navy focus:outline-none text-sm text-navy bg-white"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => setCls(c)}
              className={`px-3 py-1.5 text-xs font-bold transition ${cls === c ? "bg-navy text-gold" : "border border-navy/20 text-navy hover:border-navy"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-bold">{filtered.length} students</span>
      </div>

      {/* Student List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-border p-16 text-center">
          <Users size={40} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No students found in your assigned classes.</p>
          <p className="text-sm text-muted-foreground mt-1">Contact the admin to assign you to a class.</p>
        </div>
      ) : (
        <div className="bg-white border border-border overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                {["Student", "Admission No", "Class", "Gender", "Status", "Att. (30d)", "Quick Mark", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-widest text-navy/60 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy divide-y divide-border">
              {filtered.map((s, i) => {
                const color = CARD_COLORS[i % CARD_COLORS.length];
                const total = s.attendance_present + s.attendance_absent + s.attendance_late;
                const pct = total > 0 ? Math.round((s.attendance_present / total) * 100) : null;
                return (
                  <tr key={s.id} className="hover:bg-secondary/20 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${color} text-white flex items-center justify-center text-xs font-black`}>
                          {s.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold">{s.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{s.admission_no}</td>
                    <td className="px-5 py-4">
                      <span className="bg-navy/10 text-navy text-[10px] font-black px-2 py-1">{s.class}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground capitalize">{s.gender}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] font-black px-2 py-1 uppercase ${s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {pct !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={`text-xs font-black ${pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-rose-600"}`}>{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No data</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          title="Mark Present"
                          onClick={() => handleMarkAttendance(s.id, "Present")}
                          className="w-7 h-7 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center justify-center transition"
                        >
                          <UserCheck size={13} />
                        </button>
                        <button
                          title="Mark Absent"
                          onClick={() => handleMarkAttendance(s.id, "Absent")}
                          className="w-7 h-7 bg-rose-100 text-rose-700 hover:bg-rose-200 flex items-center justify-center transition"
                        >
                          <UserX size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setViewing(s)}
                        className="text-[10px] font-black text-navy hover:text-gold transition flex items-center gap-1"
                      >
                        DETAILS <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md shadow-2xl border-t-8 border-navy relative">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-navy text-gold flex items-center justify-center text-lg font-black">
                  {viewing.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-xl font-black text-navy">{viewing.full_name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{viewing.admission_no}</p>
                </div>
              </div>
              <button onClick={() => setViewing(null)}><X size={20} /></button>
            </div>

            <div className="p-6 space-y-5">
              {/* Class & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Class</div>
                  <div className="font-black text-navy">{viewing.class}</div>
                </div>
                <div className="bg-secondary/30 p-4">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</div>
                  <span className={`text-[10px] font-black px-2 py-1 uppercase ${viewing.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {viewing.status}
                  </span>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Personal Info</div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Gender</span>
                  <span className="text-sm font-bold text-navy capitalize">{viewing.gender}</span>
                </div>
              </div>

              {/* Attendance (30 days) */}
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Attendance (Last 30 Days)</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-emerald-50 p-3 text-center">
                    <div className="text-xl font-black text-emerald-600">{viewing.attendance_present}</div>
                    <div className="text-[9px] text-emerald-600 font-bold uppercase">Present</div>
                  </div>
                  <div className="bg-rose-50 p-3 text-center">
                    <div className="text-xl font-black text-rose-600">{viewing.attendance_absent}</div>
                    <div className="text-[9px] text-rose-600 font-bold uppercase">Absent</div>
                  </div>
                  <div className="bg-amber-50 p-3 text-center">
                    <div className="text-xl font-black text-amber-600">{viewing.attendance_late}</div>
                    <div className="text-[9px] text-amber-600 font-bold uppercase">Late</div>
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Parent / Guardian</div>
                <div className="bg-secondary/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-navy">
                    <BookOpen size={13} />
                    {viewing.parent_name}
                  </div>
                  {viewing.parent_phone !== "—" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={13} />
                      <a href={`tel:${viewing.parent_phone}`} className="hover:text-navy transition">{viewing.parent_phone}</a>
                    </div>
                  )}
                  {viewing.parent_email !== "—" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={13} />
                      <a href={`mailto:${viewing.parent_email}`} className="hover:text-navy transition">{viewing.parent_email}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Attendance Mark */}
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Mark Attendance for Today ({markingDate})</div>
                <div className="grid grid-cols-3 gap-2">
                  {(["Present", "Absent", "Late"] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => { handleMarkAttendance(viewing.id, status); setViewing(null); }}
                      className={`py-2 text-xs font-black tracking-widest transition ${status === "Present" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : status === "Absent" ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                        }`}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
