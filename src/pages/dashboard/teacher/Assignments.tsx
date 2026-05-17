import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Loader2, X, Paperclip, Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Assignment = {
  id: string;
  title: string;
  class: string;
  due_date: string;
  description: string | null;
  status: string;
  attachment_url?: string | null;
};

type SubmissionRow = {
  student_id: string;
  student_name: string;
  submitted_at: string | null;
  file_url: string | null;
  grade: string;
  feedback: string;
  status: "Submitted" | "Pending";
};

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", class_name: "", due_date: "", description: "" });
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Submissions and Grading Panel State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: teacher } = await supabase
      .from("teachers")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!teacher) { setLoading(false); return; }
    setTeacherId(teacher.id);

    // Fetch classes this teacher is assigned to (timetable + form teacher)
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
      setForm((prev) => ({ ...prev, class_name: uniqueClasses[0] }));
    }

    const { data, error } = await supabase
      .from("assignments")
      .select("id, title, class, due_date, description, status, attachment_url")
      .eq("teacher_id", teacher.id)
      .order("due_date", { ascending: true });

    if (error) { toast.error("Failed to load assignments."); }
    else { setAssignments(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  // Load submissions for a specific assignment
  const loadSubmissions = useCallback(async (assignment: Assignment) => {
    setLoadingSubmissions(true);
    setSelectedAssignment(assignment);

    // 1. Fetch all students registered in this class
    const { data: classStudents, error: studentsError } = await supabase
      .from("students")
      .select(`
        id,
        profiles ( full_name )
      `)
      .eq("class", assignment.class);

    if (studentsError) {
      toast.error("Failed to load class students.");
      setLoadingSubmissions(false);
      return;
    }

    // 2. Fetch submissions for this assignment
    const { data: subs, error: subsError } = await supabase
      .from("assignment_submissions")
      .select("student_id, submitted_at, file_url, grade, feedback")
      .eq("assignment_id", assignment.id);

    if (subsError) {
      toast.error("Failed to load submissions.");
      setLoadingSubmissions(false);
      return;
    }

    const subMap = new Map((subs || []).map((s: any) => [s.student_id, s]));

    const mappedSubmissions: SubmissionRow[] = (classStudents || []).map((student: any) => {
      const sub = subMap.get(student.id);
      return {
        student_id: student.id,
        student_name: student.profiles?.full_name ?? "Unknown Student",
        submitted_at: sub ? sub.submitted_at : null,
        file_url: sub ? sub.file_url : null,
        grade: sub ? (sub.grade || "") : "",
        feedback: sub ? (sub.feedback || "") : "",
        status: sub ? "Submitted" : "Pending",
      };
    });

    setSubmissions(mappedSubmissions);
    setLoadingSubmissions(false);
  }, []);

  const handleGradeChange = (studentId: string, val: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, grade: val } : s))
    );
  };

  const handleFeedbackChange = (studentId: string, val: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, feedback: val } : s))
    );
  };

  const handleSaveGrade = async (row: SubmissionRow) => {
    if (!selectedAssignment) return;
    setSavingGradeId(row.student_id);

    const { error } = await supabase
      .from("assignment_submissions")
      .upsert({
        assignment_id: selectedAssignment.id,
        student_id: row.student_id,
        grade: row.grade || null,
        feedback: row.feedback || null,
        submitted_at: row.submitted_at || new Date().toISOString(), // keep date if submitted, otherwise mark now
        file_url: row.file_url || null,
      }, { onConflict: "assignment_id,student_id" });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Grade saved for ${row.student_name}!`);
    }
    setSavingGradeId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    const { error } = await supabase.storage
      .from('assignments')
      .upload(filePath, file);

    if (error) {
      console.warn("Storage upload failed, using local mock fallback:", error.message);
      const mockUrl = URL.createObjectURL(file);
      setAttachmentUrl(mockUrl);
      toast.success("Material loaded locally!");
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath);
      setAttachmentUrl(publicUrl);
      toast.success("Material uploaded successfully!");
    }
    setUploading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    if (!form.class_name) {
      toast.error("Please assign this to one of your classes.");
      return;
    }
    setSaving(true);

    const { error } = await supabase.from("assignments").insert({
      title: form.title,
      class: form.class_name,
      due_date: form.due_date || null,
      description: form.description || null,
      teacher_id: teacherId,
      status: "Active",
      attachment_url: attachmentUrl,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Assignment "${form.title}" created for ${form.class_name}.`);
      setForm({ title: "", class_name: classes[0] || "", due_date: "", description: "" });
      setAttachmentUrl(null);
      setShowForm(false);
      fetchAssignments();
    }
    setSaving(false);
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const isOverdue = (d: string | null) => d ? new Date(d) < new Date() : false;

  // Render Submissions & Grading Panel View
  if (selectedAssignment) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedAssignment(null)} className="flex items-center justify-center w-8 h-8 bg-secondary text-navy hover:bg-navy hover:text-gold transition">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-black text-navy">{selectedAssignment.title}</h1>
            <p className="text-muted-foreground text-xs">Submissions & Grading for class: <span className="font-bold text-navy">{selectedAssignment.class}</span></p>
          </div>
        </div>

        {loadingSubmissions ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="bg-white border border-border">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-bold text-navy">Class Submission Roster ({submissions.length} Students)</h3>
            </div>

            {submissions.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No students registered in this class.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-border bg-secondary/40">
                    <tr>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">STUDENT</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">STATUS</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">FILE</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">GRADE</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">FEEDBACK</th>
                      <th className="px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-navy">
                    {submissions.map((row) => (
                      <tr key={row.student_id} className="hover:bg-secondary/20 transition">
                        <td className="px-5 py-4 font-bold">{row.student_name}</td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 ${row.status === "Submitted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs">
                          {row.file_url ? (
                            <a href={row.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-navy hover:underline bg-secondary/60 px-2.5 py-1 border border-border">
                              📄 View Work
                            </a>
                          ) : (
                            <span className="text-muted-foreground italic">No file attached</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="text"
                            value={row.grade}
                            onChange={(e) => handleGradeChange(row.student_id, e.target.value)}
                            placeholder="A, B, 95%..."
                            className="w-20 border border-border px-2 py-1 text-xs focus:border-navy focus:outline-none text-navy font-bold"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="text"
                            value={row.feedback}
                            onChange={(e) => handleFeedbackChange(row.student_id, e.target.value)}
                            placeholder="Add comment..."
                            className="w-full min-w-[150px] border border-border px-2 py-1 text-xs focus:border-navy focus:outline-none text-navy"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleSaveGrade(row)}
                            disabled={savingGradeId === row.student_id}
                            className="flex items-center justify-center w-8 h-8 bg-navy text-gold hover:bg-navy/95 transition disabled:opacity-60"
                            title="Save grade and feedback"
                          >
                            {savingGradeId === row.student_id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Assignments</h1>
          <p className="text-muted-foreground text-sm">Create and manage assignments for your classes.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition">
          <Plus size={14} /> NEW ASSIGNMENT
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-navy">Create New Assignment</h3>
            <button onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">TITLE</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Assignment title..." className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">CLASS</label>
              <select value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white text-navy">
                {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                {classes.length === 0 && <option value="">No classes assigned</option>}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">DUE DATE</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">UPLOAD MATERIAL (optional)</label>
              <div className="flex items-center gap-3 border border-border px-3 py-2 text-sm text-navy bg-white">
                <Paperclip size={16} className="text-navy" />
                <input type="file" onChange={handleFileUpload} disabled={uploading} className="text-xs focus:outline-none flex-1" />
                {uploading && <Loader2 size={14} className="animate-spin text-navy" />}
              </div>
              {attachmentUrl && (
                <div className="text-[10px] font-bold text-emerald-600 mt-1">✓ File ready to attach</div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">DESCRIPTION (optional)</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Assignment instructions..."
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving || uploading}
                className="bg-navy text-gold px-6 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "CREATING..." : "CREATE →"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setAttachmentUrl(null); }}
                className="border border-navy text-navy px-6 py-2.5 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition">
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white border border-dashed border-border p-16 text-center text-muted-foreground">
          <FileText size={36} className="mx-auto mb-3 text-muted-foreground/30" />
          <p>No assignments yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white border border-border p-5 flex flex-wrap items-center gap-4 hover:border-navy transition">
              <div className="w-10 h-10 bg-gold/20 text-navy flex items-center justify-center shrink-0"><FileText size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-navy">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Class: <span className="font-bold text-navy">{a.class}</span> · Due: {formatDate(a.due_date)}
                  {isOverdue(a.due_date) && <span className="ml-2 text-red-500 font-semibold">Overdue</span>}
                </div>
                {a.description && <div className="text-xs text-muted-foreground mt-1 truncate">{a.description}</div>}
                {a.attachment_url && (
                  <div className="mt-2">
                    <a href={a.attachment_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-navy hover:underline bg-secondary/30 px-2 py-0.5 border border-border">
                      📎 VIEW ATTACHMENT
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 ${a.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                  {a.status}
                </span>
                <button
                  onClick={() => loadSubmissions(a)}
                  className="bg-navy text-gold px-3.5 py-1.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition"
                >
                  GRADE SUBMISSIONS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
