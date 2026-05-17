import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const CARD_COLORS = ["bg-navy", "bg-emerald-600", "bg-orange-500", "bg-teal-600", "bg-violet-600", "bg-rose-600"];

type ClassRow = {
  id: string;
  class_name: string;
  subject: string;
  student_count: number;
  room: string;
};

export default function TeacherClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Get logged-in teacher's user id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get teacher profile id
      const { data: teacher } = await supabase
        .from("teachers")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (!teacher) { setLoading(false); return; }

      // 1. Load timetable entries for this teacher
      const { data: timetableData, error: ttError } = await supabase
        .from("timetable")
        .select("id, class_name, subject, room")
        .eq("teacher_id", teacher.id);

      if (ttError) {
        toast.error("Failed to load timetable classes.");
        setLoading(false);
        return;
      }

      // 2. Load classes where teacher is the assigned class teacher (supervisor)
      const { data: formClassesData, error: fcError } = await supabase
        .from("classes")
        .select("id, name")
        .eq("teacher_id", teacher.id);

      if (fcError) {
        toast.error("Failed to load assigned classes.");
        setLoading(false);
        return;
      }

      // Group and Deduplicate
      const classMap = new Map<string, {
        id: string;
        class_name: string;
        subjects: Set<string>;
        room: string;
      }>();

      for (const row of (timetableData || [])) {
        if (!classMap.has(row.class_name)) {
          classMap.set(row.class_name, {
            id: row.id,
            class_name: row.class_name,
            subjects: new Set([row.subject]),
            room: row.room || "—",
          });
        } else {
          const c = classMap.get(row.class_name)!;
          c.subjects.add(row.subject);
          if (row.room && c.room === "—") c.room = row.room;
        }
      }

      for (const row of (formClassesData || [])) {
        if (!classMap.has(row.name)) {
          classMap.set(row.name, {
            id: row.id,
            class_name: row.name,
            subjects: new Set(["Class Teacher"]),
            room: "—",
          });
        } else {
          const c = classMap.get(row.name)!;
          // Ensure Class Teacher is noted first
          const newSubjects = new Set(["Class Teacher"]);
          c.subjects.forEach(s => newSubjects.add(s));
          c.subjects = newSubjects;
        }
      }

      // Fetch student counts
      const unique: ClassRow[] = [];
      for (const [className, cData] of classMap.entries()) {
        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("class", className);
          
        unique.push({
          id: cData.id,
          class_name: className,
          subject: Array.from(cData.subjects).join(" • "),
          room: cData.room,
          student_count: count ?? 0,
        });
      }

      setClasses(unique);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Classes</h1>
          <p className="text-muted-foreground text-sm">All classes you are currently teaching this term.</p>
        </div>
        <div className="bg-white border border-dashed border-border p-16 text-center">
          <BookOpen size={40} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No classes assigned yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Contact the admin to assign you to a timetable slot.</p>
        </div>
      </div>
    );
  }

  const totalStudents = classes.reduce((a, c) => a + c.student_count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Classes</h1>
          <p className="text-muted-foreground text-sm">All classes you are currently teaching this term.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Total Classes</div>
          <div className="font-display text-3xl font-black text-navy mt-1">{classes.length}</div>
        </div>
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Total Students</div>
          <div className="font-display text-3xl font-black text-navy mt-1">{totalStudents}</div>
        </div>
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Live Data</div>
          <div className="font-display text-3xl font-black text-emerald-600 mt-1">✓</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {classes.map((c, i) => {
          const color = CARD_COLORS[i % CARD_COLORS.length];
          return (
            <div key={c.id} className="bg-white border border-border overflow-hidden">
              <div className={`${color} text-white p-5`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display text-2xl font-black">{c.class_name}</span>
                  <span className="text-white/70 text-xs font-bold tracking-wider">{c.subject}</span>
                </div>
                <div className="text-white/70 text-sm">{c.student_count} students · {c.room || "—"}</div>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users size={14} />
                  <span>{c.student_count} enrolled students</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen size={14} />
                  <span>{c.subject}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-bold text-navy">Room: </span>{c.room || "TBD"}
                  </div>
                  <button
                    onClick={() => navigate("/dashboard/teacher/students")}
                    className={`${color} text-white text-xs font-bold px-4 py-2 hover:opacity-90 transition`}
                  >
                    VIEW CLASS
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
