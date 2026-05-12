import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Course = {
  id: string;
  subject: string;
  teacher_name: string;
  class_name: string;
  room: string;
};

const CARD_COLORS = ["bg-navy", "bg-emerald-600", "bg-violet-600", "bg-orange-500",
  "bg-teal-600", "bg-rose-500", "bg-indigo-600", "bg-amber-500"];

export default function StudentCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentClass, setStudentClass] = useState("");

  const fetchCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get student record with class
    const { data: student } = await supabase
      .from("students")
      .select("id, class")
      .eq("profile_id", user.id)
      .single();

    if (!student) { setLoading(false); return; }
    setStudentClass(student.class ?? "");

    // Load timetable for this student's class (unique subjects)
    const { data, error } = await supabase
      .from("timetable")
      .select(`
        id, subject, room, class_name,
        teachers ( profiles ( full_name ) )
      `)
      .eq("class_name", student.class);

    if (error) { toast.error("Failed to load courses."); setLoading(false); return; }

    // Deduplicate by subject
    const seen = new Set<string>();
    const unique: Course[] = [];
    for (const row of (data || [])) {
      if (!seen.has(row.subject)) {
        seen.add(row.subject);
        unique.push({
          id: row.id,
          subject: row.subject,
          teacher_name: (row as any).teachers?.profiles?.full_name ?? "—",
          class_name: row.class_name,
          room: row.room ?? "TBD",
        });
      }
    }

    setCourses(unique);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Courses</h1>
          <p className="text-muted-foreground text-sm">
            All enrolled subjects{studentClass ? ` for ${studentClass}` : ""} this term.
          </p>
        </div>
        <div className="bg-navy text-white px-5 py-3 text-center">
          <div className="text-xs text-white/60">Subjects</div>
          <div className="font-display text-2xl font-black text-gold">{courses.length}</div>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-dashed border-border p-16 text-center text-muted-foreground">
          No courses found for your class. Ask the admin to assign subjects to your timetable.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((c, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <div key={c.id} className="bg-white border border-border overflow-hidden hover:border-navy transition">
                <div className={`${color} px-5 py-4 flex items-center justify-between`}>
                  <div>
                    <div className="text-white font-display font-bold text-lg leading-tight">{c.subject}</div>
                    <div className="text-white/70 text-xs mt-0.5">{c.teacher_name}</div>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy">Room:</span> {c.room}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy">Class:</span> {c.class_name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
