import { useState } from "react";
import { Search, Plus, Download, X } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";
import { useStore } from "@/store";

const teachers = [
  { id: "T-001", name: "Mr. Daniel Marko", subject: "Mathematics", classes: ["JSS 1A", "JSS 2B", "SS 1A"], type: "Secondary", experience: "8 yrs", status: "Active" },
  { id: "T-002", name: "Mrs. Sarah James", subject: "English Language", classes: ["JSS 1A", "JSS 3B", "SS 2A"], type: "Secondary", experience: "6 yrs", status: "Active" },
  { id: "T-003", name: "Mr. Peter Obi", subject: "Physics", classes: ["SS 1A", "SS 2B", "SS 3A"], type: "Secondary", experience: "10 yrs", status: "Active" },
  { id: "T-004", name: "Mrs. Amaka Eze", subject: "Primary Class Teacher", classes: ["Primary 3A", "Primary 3B"], type: "Primary", experience: "5 yrs", status: "Active" },
  { id: "T-005", name: "Mr. Kola Adeyemi", subject: "Biology", classes: ["SS 1B", "SS 2A", "SS 3B"], type: "Secondary", experience: "12 yrs", status: "Active" },
  { id: "T-006", name: "Mrs. Grace Nwosu", subject: "Primary Class Teacher", classes: ["Primary 5A"], type: "Primary", experience: "4 yrs", status: "Active" },
  { id: "T-007", name: "Mr. Victor Ade", subject: "Chemistry", classes: ["JSS 3A", "SS 2B", "SS 3A"], type: "Secondary", experience: "7 yrs", status: "Active" },
  { id: "T-008", name: "Mrs. Funke Okonkwo", subject: "Primary Class Teacher", classes: ["Primary 1A", "Primary 1B"], type: "Primary", experience: "9 yrs", status: "On Leave" },
];

type Teacher = typeof teachers[0];

export default function AdminTeachers() {
  const { attendance } = useStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [items, setItems] = useState(teachers);
  const [viewing, setViewing] = useState<Teacher | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", type: "Secondary", experience: "1 yrs" });

  const getLiveStatus = (id: string, defaultStatus: string) => {
    if (attendance[id]) {
      return attendance[id].isClockedIn ? `Clocked In (${attendance[id].lastActionTime})` : `Clocked Out (${attendance[id].lastActionTime || 'Today'})`;
    }
    return defaultStatus;
  };

  const filtered = items.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const exportCsv = () => {
    downloadCSV("teachers.csv", [
      ["ID", "Name", "Subject", "Classes", "Section", "Experience", "Status"],
      ...filtered.map((t) => [t.id, t.name, t.subject, t.classes.join("; "), t.type, t.experience, t.status]),
    ]);
    toast.success(`Exported ${filtered.length} teachers.`);
  };

  const addTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const id = `T-${String(items.length + 1).padStart(3, "0")}`;
    setItems((p) => [{ id, ...form, classes: [], status: "Active" }, ...p]);
    toast.success(`${form.name} added.`);
    setForm({ name: "", subject: "", type: "Secondary", experience: "1 yrs" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Teachers</h1>
          <p className="text-muted-foreground text-sm">Manage teaching staff across all departments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition">
            <Download size={14} /> EXPORT
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition">
            <Plus size={14} /> ADD TEACHER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Teachers", value: "45", color: "border-t-navy" },
          { label: "Primary Staff", value: "18", color: "border-t-gold" },
          { label: "Secondary Staff", value: "27", color: "border-t-emerald-500" },
        ].map((s) => (
          <div key={s.label} className={`bg-white border border-border border-t-4 ${s.color} p-5`}>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="font-display text-3xl font-black text-navy mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border focus:border-navy focus:outline-none text-sm text-navy bg-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-border px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy bg-white"
        >
          {["All", "Primary", "Secondary"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="text-xs text-muted-foreground">{filtered.length} teachers</div>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              {["ID", "TEACHER", "SUBJECT", "CLASSES", "SECTION", "EXPERIENCE", "STATUS", ""].map((h) => (
                <th key={h} className={`px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground ${h === "" ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-secondary/20 transition">
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{t.id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/20 text-navy flex items-center justify-center text-xs font-bold">
                      {t.name.split(" ").slice(1).map((n) => n[0]).join("")}
                    </div>
                    <span className="font-semibold">{t.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{t.subject}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1">
                    {t.classes.map((c) => (
                      <span key={c} className="text-[10px] bg-navy/10 text-navy px-2 py-0.5 font-bold">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">{t.type}</td>
                <td className="px-5 py-4 text-muted-foreground">{t.experience}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 ${getLiveStatus(t.id, t.status).includes("Clocked In") || t.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {getLiveStatus(t.id, t.status)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => setViewing(t)} className="text-xs font-bold text-navy hover:text-gold transition">VIEW</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onSubmit={addTeacher} onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-black text-navy">Add Teacher</h3>
              <button type="button" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border px-3 py-2 text-sm" />
            <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-border px-3 py-2 text-sm" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-border px-3 py-2 text-sm bg-white">
              <option>Primary</option><option>Secondary</option>
            </select>
            <input placeholder="Experience (e.g. 5 yrs)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full border border-border px-3 py-2 text-sm" />
            <button type="submit" className="w-full bg-navy text-gold py-3 font-bold text-xs tracking-wider">SAVE TEACHER</button>
          </form>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-black text-navy">{viewing.name}</h3>
              <button onClick={() => setViewing(null)}><X size={18} /></button>
            </div>
            <dl className="text-sm space-y-2 text-navy">
              <div className="flex justify-between"><dt className="text-muted-foreground">ID</dt><dd className="font-mono">{viewing.id}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Subject</dt><dd>{viewing.subject}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Section</dt><dd>{viewing.type}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Experience</dt><dd>{viewing.experience}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd>{getLiveStatus(viewing.id, viewing.status)}</dd></div>
              <div><dt className="text-muted-foreground mb-1">Classes</dt><dd className="flex flex-wrap gap-1">{viewing.classes.map((c) => <span key={c} className="text-[10px] bg-navy/10 text-navy px-2 py-0.5 font-bold">{c}</span>)}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
