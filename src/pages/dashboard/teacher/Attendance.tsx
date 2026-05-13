import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type Student = {
  id: string;
  full_name: string;
  present: boolean;
};

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classes, setClasses]     = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents]   = useState<Student[]>([]);
  const [date, setDate]           = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch teacher's ID and their classes
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
        // Fetch classes this teacher is assigned to in timetable
        const { data: tt } = await supabase
          .from("timetable")
          .select("class_name")
          .eq("teacher_id", teacher.id);

        const uniqueClasses = [...new Set((tt || []).map((t: any) => t.class_name).filter(Boolean))];
        setClasses(uniqueClasses);
        if (uniqueClasses.length > 0) setSelectedClass(uniqueClasses[0]);
      }
      setLoading(false);
    })();
  }, [user]);

  // Load students for selected class
  const loadStudents = useCallback(async () => {
    if (!selectedClass || !teacherId) return;
    setLoadingStudents(true);
    const { data } = await supabase
      .from("students")
      .select("id, profiles!students_profile_id_fkey(full_name)")
      .eq("class", selectedClass)
      .eq("status", "Active");

    const mapped: Student[] = (data || []).map((s: any) => ({
      id:        s.id,
      full_name: s.profiles?.full_name ?? "Unnamed Student",
      present:   true, // default to present
    }));

    // Check if attendance already saved for this class+date
    const studentIds = mapped.map(s => s.id);
    if (studentIds.length > 0) {
      const { data: existing } = await supabase
        .from("attendance")
        .select("student_id, status")
        .eq("date", date)
        .eq("marked_by", teacherId)
        .in("student_id", studentIds);

      if (existing && existing.length > 0) {
        const map = Object.fromEntries(existing.map((e: any) => [e.student_id, e.status]));
        mapped.forEach(s => {
          if (map[s.id]) s.present = map[s.id] === "Present";
        });
      }
    }

    setStudents(mapped);
    setLoadingStudents(false);
  }, [selectedClass, date, teacherId]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const toggle = (id: string) =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, present: !s.present } : s));

  const presentCount = students.filter(s => s.present).length;

  const handleSave = async () => {
    if (!teacherId || students.length === 0) return;
    setSaving(true);

    const records = students.map(s => ({
      student_id: s.id,
      date,
      status:     s.present ? "Present" : "Absent",
      marked_by:  teacherId,
    }));

    // Upsert — update if already exists for that student+date
    const { error } = await supabase
      .from("attendance")
      .upsert(records, { onConflict: "student_id,date" });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Attendance saved for ${selectedClass} — ${presentCount}/${students.length} present.`);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin" /> Loading your classes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Mark Attendance</h1>
        <p className="text-muted-foreground text-sm">Record daily attendance for your classes.</p>
      </div>

      <div className="bg-white border border-border p-6">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes assigned to you yet. Ask the admin to update the timetable.</p>
          ) : (
            <div className="flex-1 flex flex-wrap gap-2">
              {classes.map((c) => (
                <button key={c} onClick={() => setSelectedClass(c)}
                  className={`px-4 py-2 text-xs font-bold tracking-wider border-2 transition ${selectedClass === c ? "bg-navy text-gold border-navy" : "border-navy/20 text-navy hover:border-navy"}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none" />
        </div>

        {loadingStudents ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No students found for {selectedClass}.</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">
                {selectedClass} — {new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <div className="text-sm">
                <span className="font-bold text-emerald-600">{presentCount}</span>
                <span className="text-muted-foreground"> / {students.length} present</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {students.map((s) => (
                <button key={s.id} onClick={() => toggle(s.id)}
                  className={`flex items-center gap-3 p-3 border text-left transition ${s.present ? "border-emerald-300 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                  {s.present
                    ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    : <XCircle size={18} className="text-red-400 shrink-0" />}
                  <span className={`text-sm font-medium ${s.present ? "text-emerald-800" : "text-red-700"}`}>{s.full_name}</span>
                  <span className={`ml-auto text-[10px] font-bold ${s.present ? "text-emerald-600" : "text-red-500"}`}>
                    {s.present ? "PRESENT" : "ABSENT"}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-navy text-gold px-8 py-3 font-bold text-xs tracking-wider hover:bg-navy/90 transition disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "SAVING..." : "SAVE ATTENDANCE →"}
              </button>
              <button onClick={() => setStudents(prev => prev.map(s => ({ ...s, present: true })))}
                className="border border-navy text-navy px-5 py-3 font-bold text-xs tracking-wider hover:bg-navy hover:text-gold transition">
                MARK ALL PRESENT
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
