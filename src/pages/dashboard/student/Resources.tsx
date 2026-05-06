import { Download, FileText, BookOpen, Video, Link } from "lucide-react";
import { toast } from "sonner";

const resources = [
  { title: "SS 2 Mathematics — Past Questions (2020–2024)", subject: "Mathematics", type: "PDF", size: "2.4 MB", date: "May 20", icon: FileText, color: "text-navy" },
  { title: "WAEC Chemistry Revision Guide", subject: "Chemistry", type: "PDF", size: "5.1 MB", date: "May 18", icon: BookOpen, color: "text-orange-500" },
  { title: "English Essay Writing Framework", subject: "English", type: "DOC", size: "0.8 MB", date: "May 15", icon: FileText, color: "text-emerald-600" },
  { title: "Physics Video — Light & Optics", subject: "Physics", type: "Video", size: "—", date: "May 12", icon: Video, color: "text-violet-600" },
  { title: "Further Mathematics Formula Sheet", subject: "Further Maths", type: "PDF", size: "0.4 MB", date: "May 10", icon: FileText, color: "text-rose-500" },
  { title: "Computer Science Practical Notes", subject: "Computer Sci.", type: "PDF", size: "1.2 MB", date: "May 8", icon: FileText, color: "text-indigo-600" },
  { title: "Biology — Cell Division Diagrams", subject: "Biology", type: "PDF", size: "1.8 MB", date: "May 5", icon: FileText, color: "text-teal-600" },
  { title: "Khan Academy — Integration (Link)", subject: "Further Maths", type: "Link", size: "—", date: "May 1", icon: Link, color: "text-amber-500" },
];

const typeColors: Record<string, string> = {
  PDF: "bg-navy/10 text-navy",
  DOC: "bg-emerald-100 text-emerald-700",
  Video: "bg-violet-100 text-violet-700",
  Link: "bg-amber-100 text-amber-700",
};

export default function StudentResources() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Resources</h1>
        <p className="text-muted-foreground text-sm">Study materials, notes, and revision guides shared by your teachers.</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        {[
          { label: "Total Resources", value: resources.length },
          { label: "PDFs", value: resources.filter(r => r.type === "PDF").length },
          { label: "Videos", value: resources.filter(r => r.type === "Video").length },
          { label: "Links", value: resources.filter(r => r.type === "Link").length },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display text-3xl font-black text-navy mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border divide-y divide-border">
        {resources.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition">
              <div className={`w-10 h-10 bg-secondary flex items-center justify-center shrink-0 ${r.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-navy truncate">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{r.subject} · Added {r.date}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 shrink-0 ${typeColors[r.type]}`}>{r.type}</span>
              {r.size !== "—" && <span className="text-xs text-muted-foreground hidden sm:block">{r.size}</span>}
              <button onClick={() => toast.success(`Downloading "${r.title}"...`)} className="bg-navy text-gold px-3 py-2 text-xs font-bold hover:bg-navy/90 transition flex items-center gap-1.5 shrink-0">
                <Download size={12} /> GET
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
