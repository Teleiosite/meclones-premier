import { useState } from "react";
import { Plus, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";

const assignments = [
  { id: 1, title: "Algebra Basics Worksheet", class: "JSS 2B", due: "May 31", submitted: 23, total: 28, status: "Active" },
  { id: 2, title: "Linear Equations Quiz", class: "JSS 1A", due: "May 30", submitted: 20, total: 24, status: "Active" },
  { id: 3, title: "Midterm Assignment", class: "JSS 3A", due: "May 28", submitted: 26, total: 26, status: "Closed" },
  { id: 4, title: "Statistics Project", class: "SS 1A", due: "Jun 2", submitted: 18, total: 22, status: "Active" },
  { id: 5, title: "Calculus Intro Sheet", class: "SS 2B", due: "Jun 5", submitted: 5, total: 20, status: "Active" },
];

export default function TeacherAssignments() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(""); const [cls, setCls] = useState("JSS 1A"); const [due, setDue] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Assignment "${title}" created for ${cls}.`);
    setShowForm(false); setTitle(""); setDue("");
  };

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
          <h3 className="font-bold text-navy mb-5">Create New Assignment</h3>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">TITLE</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment title..." className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none text-navy" />
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">CLASS</label>
              <select value={cls} onChange={(e) => setCls(e.target.value)} className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white text-navy">
                {["JSS 1A", "JSS 2B", "JSS 3A", "SS 1A", "SS 2B"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold tracking-[0.2em] text-navy mb-2">DUE DATE</label>
              <input required type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-full border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none" />
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" className="bg-navy text-gold px-6 py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90 transition">CREATE →</button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-navy text-navy px-6 py-2.5 text-xs font-bold tracking-wider">CANCEL</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white border border-border p-5 flex flex-wrap items-center gap-4">
            <div className="w-10 h-10 bg-gold/20 text-navy flex items-center justify-center shrink-0"><FileText size={18} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-navy">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{a.class} · Due: {a.due}</div>
            </div>
            <div className="text-sm">
              <span className="font-bold text-navy">{a.submitted}</span>
              <span className="text-muted-foreground">/{a.total} submitted</span>
              <div className="h-1.5 bg-secondary mt-1 w-32">
                <div className="h-full bg-emerald-500" style={{ width: `${(a.submitted / a.total) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-1 ${a.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>{a.status}</span>
              <button className="bg-navy text-gold px-3 py-1.5 text-xs font-bold hover:bg-navy/90 transition">GRADE</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
