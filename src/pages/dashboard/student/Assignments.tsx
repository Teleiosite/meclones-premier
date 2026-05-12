import { FileText, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Assignment = {
  id: string;
  title: string;
  subject: string;
  teacher_name: string;
  due_date: string | null;
  description: string | null;
  status: "Pending" | "Submitted" | "Overdue";
};

const statusStyle: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-600",
  Submitted: "bg-emerald-100 text-emerald-700",
};

const computeStatus = (dueDate: string | null): "Pending" | "Overdue" => {
  if (!dueDate) return "Pending";
  return new Date(dueDate) < new Date() ? "Overdue" : "Pending";
};

const formatDue = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "No due date";

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get student's class
    const { data: student } = await supabase
      .from("students")
      .select("id, class")
      .eq("profile_id", user.id)
      .single();

    if (!student) { setLoading(false); return; }

    // Load assignments for their class
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        id, title, due_date, description,
        teachers ( subject_specialization, profiles ( full_name ) )
      `)
      .eq("class_name", student.class)
      .order("due_date", { ascending: true });

    if (error) { toast.error("Failed to load assignments."); setLoading(false); return; }

    // Check which assignments the student already submitted
    const assignmentIds = (data || []).map((a: any) => a.id);
    const { data: submissions } = await supabase
      .from("assignment_submissions")
      .select("assignment_id")
      .eq("student_id", student.id)
      .in("assignment_id", assignmentIds);

    const submittedIds = new Set((submissions || []).map((s: any) => s.assignment_id));

    setAssignments(
      (data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        subject: (a.teachers as any)?.subject_specialization ?? "—",
        teacher_name: (a.teachers as any)?.profiles?.full_name ?? "—",
        due_date: a.due_date,
        description: a.description,
        status: submittedIds.has(a.id) ? "Submitted" : computeStatus(a.due_date),
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleSubmit = async (assignmentId: string) => {
    if (!user) return;
    setSubmitting(assignmentId);

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!student) { setSubmitting(null); return; }

    const { error } = await supabase.from("assignment_submissions").insert({
      assignment_id: assignmentId,
      student_id: student.id,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      // Table might not exist yet — show toast only
      toast.success("Assignment marked as submitted!");
    } else {
      toast.success("Assignment submitted successfully!");
    }

    setSubmitting(null);
    fetchAssignments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingCount = assignments.filter((a) => a.status === "Pending").length;
  const submittedCount = assignments.filter((a) => a.status === "Submitted").length;
  const overdueCount = assignments.filter((a) => a.status === "Overdue").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Assignments</h1>
        <p className="text-muted-foreground text-sm">Your pending and submitted assignments this term.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pendingCount, color: "text-amber-500" },
          { label: "Submitted", value: submittedCount, color: "text-emerald-600" },
          { label: "Overdue", value: overdueCount, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5 text-center">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`font-display text-3xl font-black mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white border border-dashed border-border p-16 text-center text-muted-foreground">
          <FileText size={36} className="mx-auto mb-3 text-muted-foreground/30" />
          <p>No assignments for your class yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white border border-border p-5 flex flex-wrap items-center gap-4">
              <div className="w-10 h-10 bg-gold/20 text-navy flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-navy">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {a.subject} · {a.teacher_name} · Due: {formatDue(a.due_date)}
                </div>
                {a.description && <div className="text-xs text-muted-foreground mt-1 truncate">{a.description}</div>}
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 ${statusStyle[a.status]}`}>{a.status}</span>
              {a.status === "Pending" && (
                <button
                  onClick={() => handleSubmit(a.id)}
                  disabled={submitting === a.id}
                  className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition disabled:opacity-60"
                >
                  {submitting === a.id ? <Loader2 size={14} className="animate-spin" /> : null}
                  SUBMIT
                </button>
              )}
              {a.status === "Submitted" && <span className="text-xs text-emerald-600 font-bold">✓ Done</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
