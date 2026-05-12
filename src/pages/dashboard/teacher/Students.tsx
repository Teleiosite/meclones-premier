import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Student = {
  id: string;
  admission_no: string;
  full_name: string;
  class: string;
  gender: string;
};

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cls, setCls] = useState("All");
  const [classes, setClasses] = useState<string[]>(["All"]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get teacher record
      const { data: teacher } = await supabase
        .from("teachers")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!teacher) { setLoading(false); return; }

      // Get distinct classes this teacher teaches
      const { data: ttRows } = await supabase
        .from("timetable")
        .select("class_name")
        .eq("teacher_id", teacher.id);

      const uniqueClasses = [...new Set((ttRows || []).map((r: any) => r.class_name))];
      setClasses(["All", ...uniqueClasses]);

      // Load students in those classes
      if (uniqueClasses.length === 0) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("students")
        .select(`
          id, admission_no, class, gender,
          profiles!students_profile_id_fkey ( full_name )
        `)
        .in("class", uniqueClasses)
        .order("class");

      if (error) { toast.error("Failed to load students."); setLoading(false); return; }

      setStudents(
        (data || []).map((s: any) => ({
          id: s.id,
          admission_no: s.admission_no ?? "—",
          full_name: s.profiles?.full_name ?? "Unknown",
          class: s.class,
          gender: s.gender ?? "—",
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase())
      || s.admission_no.includes(search);
    const matchClass = cls === "All" || s.class === cls;
    return matchSearch && matchClass;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Students</h1>
        <p className="text-muted-foreground text-sm">All students across your classes.</p>
      </div>

      <div className="bg-white border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search student..."
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
            >{c}</button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} students</span>
      </div>

      {students.length === 0 ? (
        <div className="bg-white border border-dashed border-border p-16 text-center text-muted-foreground">
          No students found in your assigned classes.
        </div>
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                {["STUDENT", "ADMISSION NO", "CLASS", "GENDER"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/20 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-navy/10 text-navy flex items-center justify-center text-xs font-bold">
                        {s.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{s.admission_no}</td>
                  <td className="px-5 py-4">{s.class}</td>
                  <td className="px-5 py-4 text-muted-foreground">{s.gender === "M" ? "Male" : s.gender === "F" ? "Female" : s.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
