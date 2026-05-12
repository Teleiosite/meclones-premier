import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Assignment = {
  id: string;
  title: string;
  class_name: string;
  due_date: string;
  description: string | null;
  status: string;
};

const CLASS_OPTIONS = ["JSS 1A", "JSS 1B", "JSS 2A", "JSS 2B", "JSS 3A", "JSS 3B", "SS 1A", "SS 1B", "SS 2A", "SS 2B", "SS 3A", "SS 3B"];

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", class_name: "JSS 1A", due_date: "", description: "" });

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: teacher } = await supabase
      .from("teachers")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!teacher) { setLoading(false); return; }
    setTeacherId(teacher.id);

    const { data, error } = await supabase
      .from("assignments")
      .select("id, title, class_name, due_date, description, status")
      .eq("teacher_id", teacher.id)
      .order("due_date", { ascending: true });

    if (error) { toast.error("Failed to load assignments."); }
    else { setAssignments(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;
    setSaving(true);

    const { error } = await supabase.from("assignments").insert({
      title: form.title,
      class_name: form.class_name,
      due_date: form.due_date || null,
      description: form.description || null,
      teacher_id: teacherId,
      status: "Active",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Assignment "${form.title}" created for ${form.class_name}.`);
      setForm({ title: "", class_name: "JSS 1A", due_date: "", description: "" });
      setShowForm(false);
      fetchAssignments();
    }
    setSaving(false);
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const isOverdue = (d: string | null) => d ? new Date(d) < new Date() : false;

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
                {CLASS_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">DUE DATE</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">DESCRIPTION (optional)</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Assignment instructions..."
                className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-navy text-gold px-6 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "CREATING..." : "CREATE →"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
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
            <div key={a.id} className="bg-white border border-border p-5 flex flex-wrap items-center gap-4">
              <div className="w-10 h-10 bg-gold/20 text-navy flex items-center justify-center shrink-0"><FileText size={18} /></div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-navy">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {a.class_name} · Due: {formatDate(a.due_date)}
                  {isOverdue(a.due_date) && <span className="ml-2 text-red-500 font-semibold">Overdue</span>}
                </div>
                {a.description && <div className="text-xs text-muted-foreground mt-1 truncate">{a.description}</div>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 ${a.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
