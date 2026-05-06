import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

const assignments = [
  { title: "Mathematics Homework", subject: "Mathematics", teacher: "Mr. Daniel Marko", due: "May 31", dueLabel: "2 Days", status: "Pending" },
  { title: "English Essay Writing", subject: "English", teacher: "Mrs. Sarah James", due: "Jun 2", dueLabel: "4 Days", status: "Pending" },
  { title: "Physics Lab Report", subject: "Physics", teacher: "Mr. Peter Obi", due: "Jun 5", dueLabel: "7 Days", status: "Pending" },
  { title: "Chemistry Practical Report", subject: "Chemistry", teacher: "Mr. Victor Ade", due: "May 28", dueLabel: "Overdue", status: "Overdue" },
  { title: "Further Maths Problem Set", subject: "Further Maths", teacher: "Mr. Daniel Marko", due: "May 25", dueLabel: "Submitted", status: "Submitted" },
];

const statusStyle: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Overdue: "bg-red-100 text-red-600",
  Submitted: "bg-emerald-100 text-emerald-700",
};

export default function StudentAssignments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Assignments</h1>
        <p className="text-muted-foreground text-sm">Your pending and submitted assignments this term.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: assignments.filter(a => a.status === "Pending").length, color: "text-amber-500" },
          { label: "Submitted", value: assignments.filter(a => a.status === "Submitted").length, color: "text-emerald-600" },
          { label: "Overdue", value: assignments.filter(a => a.status === "Overdue").length, color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5 text-center">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`font-display text-3xl font-black mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {assignments.map((a, i) => (
          <div key={i} className="bg-white border border-border p-5 flex flex-wrap items-center gap-4">
            <div className="w-10 h-10 bg-gold/20 text-navy flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-navy">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{a.subject} · {a.teacher} · Due: {a.due}</div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 ${statusStyle[a.status]}`}>{a.dueLabel}</span>
            {a.status === "Pending" && (
              <button onClick={() => toast.success("Assignment submitted!")}
                className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition">
                <Upload size={14} /> SUBMIT
              </button>
            )}
            {a.status === "Submitted" && (
              <span className="text-xs text-emerald-600 font-bold">✓ Done</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
