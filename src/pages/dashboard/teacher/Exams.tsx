import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, X, Award } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Student = { id: string; name: string; score: string; };
type ExamRow = { id: string; title: string; class: string; date: string; subject?: string; term?: string; };
type RecentResult = { id: string; student_name: string; exam_title: string; class: string; score: number; grade: string; };

const gradeFor = (s: string) => {
  const n = parseFloat(s);
  if (isNaN(n)) return "—";
  if (n >= 75) return "A"; if (n >= 65) return "B";
  if (n >= 55) return "C"; if (n >= 45) return "D"; return "F";
};
const remarkFor = (g: string) => ({ A: "Excellent", B: "Good", C: "Average", D: "Below average", F: "Fail" }[g] ?? "");
const gradeColor = (g: string) => ({ A: "text-emerald-600", F: "text-red-500" }[g] ?? "text-navy");

export default function TeacherExams() {
  const [exams, setExams] = useState<ExamRow[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamRow | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  
  // Creation modal/form states
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [form, setForm] = useState({ title: "", class: "", subject: "", term: "First Term", date: "" });

  // Fetch exams for this teacher
  const fetchExams = useCallback(async () => {
    setLoadingExams(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingExams(false); return; }

    const { data: teacher } = await supabase.from("teachers").select("id").eq("profile_id", user.id).maybeSingle();
    if (!teacher) { setLoadingExams(false); return; }
    setTeacherId(teacher.id);

    // Fetch classes this teacher is assigned to (timetable + form teacher) to populate the creation select
    const { data: tt } = await supabase
      .from("timetable")
      .select("class_name")
      .eq("teacher_id", user.id);
    const timetableClasses = (tt || []).map((t: any) => t.class_name as string).filter(Boolean);

    const { data: formClasses } = await supabase
      .from("classes")
      .select("name")
      .eq("teacher_id", teacher.id);
    const formClassNames = (formClasses || []).map((c: any) => c.name as string).filter(Boolean);

    const uniqueClasses = [...new Set([...timetableClasses, ...formClassNames])];
    setClasses(uniqueClasses);
    if (uniqueClasses.length > 0) {
      setForm((prev) => ({ ...prev, class: uniqueClasses[0] }));
    }

    const { data, error } = await supabase
      .from("exams")
      .select("id, title, class, date, subject, term")
      .eq("teacher_id", teacher.id)
      .order("date", { ascending: false });

    if (error) toast.error("Failed to load exams.");
    else setExams(data || []);

    // Also load recent results
    const { data: results } = await supabase
      .from("results")
      .select(`
        id, score, grade,
        students ( profiles ( full_name ) ),
        exams ( title, class )
      `)
      .eq("teacher_id", teacher.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setRecentResults(
      (results || []).map((r: any) => ({
        id: r.id,
        student_name: r.students?.profiles?.full_name ?? "Unknown",
        exam_title: r.exams?.title ?? "—",
        class: r.exams?.class ?? "—",
        score: r.score,
        grade: r.grade ?? gradeFor(String(r.score)),
      }))
    );

    setLoadingExams(false);
  }, []);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  // When exam selected, load students in that class
  useEffect(() => {
    if (!selectedExam) return;
    (async () => {
      setLoadingStudents(true);
      const { data, error } = await supabase
        .from("students")
        .select("id, profiles ( full_name )")
        .eq("class", selectedExam.class);

      if (error) { toast.error("Failed to load students."); setLoadingStudents(false); return; }
      setStudents((data || []).map((s: any) => ({ id: s.id, name: s.profiles?.full_name ?? "Unknown", score: "" })));
      setScores({});
      setLoadingStudents(false);
    })();
  }, [selectedExam]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    if (!form.class) {
      toast.error("Please assign this exam to one of your classes.");
      return;
    }
    setSaving(true);

    const { error } = await supabase.from("exams").insert({
      title: form.title,
      class: form.class,
      subject: form.subject,
      term: form.term,
      date: form.date || new Date().toISOString().split('T')[0],
      teacher_id: teacherId,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Exam "${form.title}" created successfully!`);
      setForm({ title: "", class: classes[0] || "", subject: "", term: "First Term", date: "" });
      setShowForm(false);
      fetchExams();
    }
    setSaving(false);
  };

  const handleSaveGrades = async () => {
    if (!selectedExam || !teacherId) return;
    const entries = students.filter((s) => scores[s.id]?.trim());
    if (entries.length === 0) { toast.error("Enter at least one score first."); return; }
    setSaving(true);

    const rows = entries.map((s) => ({
      student_id: s.id,
      exam_id: selectedExam.id,
      teacher_id: teacherId,
      score: parseFloat(scores[s.id]),
      grade: gradeFor(scores[s.id]),
    }));

    const { error } = await supabase.from("results").upsert(rows, { onConflict: "student_id,exam_id" });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Grades saved for ${entries.length} student(s).`);
      setSelectedExam(null);
      fetchExams();
    }
    setSaving(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Exams & Grading</h1>
          <p className="text-muted-foreground text-sm">Enter exam scores and view student performance.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition">
          <Plus size={14} /> NEW EXAM
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-border p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-navy">Create New Exam / Test</h3>
            <button onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <form onSubmit={handleCreateExam} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">EXAM / TEST TITLE</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Midterm Examination, Continuous Assessment 1..." className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">SUBJECT</label>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Mathematics, English, Physics..." className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">CLASS</label>
              <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white text-navy">
                {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                {classes.length === 0 && <option value="">No classes assigned</option>}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">TERM</label>
              <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white text-navy">
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">DATE</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy" />
            </div>
            <div className="sm:col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={saving}
                className="bg-navy text-gold px-6 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "CREATING..." : "CREATE EXAM →"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="border border-navy text-navy px-6 py-2.5 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition">
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exam picker */}
      {loadingExams ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white border border-dashed border-border p-12 text-center text-muted-foreground">
          No exams found. Click the "NEW EXAM" button above to schedule your first exam or quiz!
        </div>
      ) : (
        <div className="bg-white border border-border p-5">
          <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-3">SELECT EXAM TO GRADE</label>
          <div className="flex flex-wrap gap-2">
            {exams.map((e) => (
              <button key={e.id} onClick={() => setSelectedExam(e)}
                className={`px-4 py-3 border text-left transition shrink-0 min-w-[200px] ${selectedExam?.id === e.id ? "bg-navy border-navy text-gold" : "border-border hover:border-navy text-navy bg-white"}`}
              >
                <div className={`font-bold text-sm ${selectedExam?.id === e.id ? "text-gold" : "text-navy"}`}>{e.title}</div>
                <div className={`text-xs mt-1 ${selectedExam?.id === e.id ? "text-white/70" : "text-muted-foreground"}`}>
                  {e.class} · {formatDate(e.date)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grade entry sheet */}
      {selectedExam && (
        <div className="bg-white border border-border p-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-navy text-lg">{selectedExam.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedExam.class} · {formatDate(selectedExam.date)}</p>
            </div>
            <button onClick={handleSaveGrades} disabled={saving}
              className="bg-navy text-gold px-5 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />}
              SAVE GRADES
            </button>
          </div>

          {loadingStudents ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No students in {selectedExam.class}.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/40">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground">STUDENT</th>
                    <th className="text-center px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground w-32">SCORE (100)</th>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground w-24">GRADE</th>
                    <th className="text-left px-4 py-3 text-xs font-bold tracking-wider text-muted-foreground">REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-navy">
                  {students.map((s) => {
                    const grade = gradeFor(scores[s.id] || "");
                    return (
                      <tr key={s.id} className="hover:bg-secondary/20">
                        <td className="px-4 py-3 font-semibold">{s.name}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={scores[s.id] || ""}
                            onChange={(e) => setScores({ ...scores, [s.id]: e.target.value })}
                            placeholder="0 - 100"
                            className="w-20 border border-border px-2 py-1 text-sm focus:border-navy focus:outline-none text-center"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold text-sm ${gradeColor(grade)}`}>{grade}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{remarkFor(grade)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Recent results */}
      {recentResults.length > 0 && (
        <div className="bg-white border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-bold text-navy">Recent Results</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                {["STUDENT", "EXAM", "CLASS", "SCORE", "GRADE"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-navy">
              {recentResults.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/20">
                  <td className="px-5 py-4 font-semibold">{r.student_name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.exam_title}</td>
                  <td className="px-5 py-4">{r.class}</td>
                  <td className="px-5 py-4 font-bold">{r.score}%</td>
                  <td className="px-5 py-4">
                    <span className={`font-bold ${gradeColor(r.grade)}`}>{r.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
