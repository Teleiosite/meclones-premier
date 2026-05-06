import { useState } from "react";
import { Search, Plus, Filter, Download, X } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";

const students = [
  { id: "MC-001", name: "David Okafor", class: "SS 2", gender: "Male", parent: "Mrs. Adeyemi", attendance: 92, avg: 85, status: "Active" },
  { id: "MC-002", name: "Grace Okafor", class: "Primary 5", gender: "Female", parent: "Mrs. Adeyemi", attendance: 96, avg: 89, status: "Active" },
  { id: "MC-003", name: "Chinedu Paul", class: "Primary 3", gender: "Male", parent: "Mr. Paul", attendance: 88, avg: 76, status: "Active" },
  { id: "MC-004", name: "Amina Yusuf", class: "Primary 5", gender: "Female", parent: "Mrs. Yusuf", attendance: 94, avg: 91, status: "Active" },
  { id: "MC-005", name: "Daniel Johnson", class: "JSS 1", gender: "Male", parent: "Mr. Johnson", attendance: 85, avg: 72, status: "Active" },
  { id: "MC-006", name: "Blessing Okoro", class: "SS 1", gender: "Female", parent: "Mrs. Okoro", attendance: 90, avg: 88, status: "Active" },
  { id: "MC-007", name: "Emeka Eze", class: "JSS 3", gender: "Male", parent: "Mr. Eze", attendance: 78, avg: 65, status: "Warning" },
  { id: "MC-008", name: "Fatima Bello", class: "SS 3", gender: "Female", parent: "Mr. Bello", attendance: 97, avg: 94, status: "Active" },
  { id: "MC-009", name: "Tunde Adesanya", class: "Primary 6", gender: "Male", parent: "Mrs. Adesanya", attendance: 91, avg: 82, status: "Active" },
  { id: "MC-010", name: "Ngozi Nwosu", class: "JSS 2", gender: "Female", parent: "Mr. Nwosu", attendance: 89, avg: 79, status: "Active" },
];

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [items, setItems] = useState(students);
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState<typeof students[0] | null>(null);
  const [form, setForm] = useState({ name: "", class: "Primary 3", gender: "Male", parent: "" });

  const classes = ["All", "Primary 3", "Primary 5", "Primary 6", "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

  const filtered = items.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    const matchClass = classFilter === "All" || s.class === classFilter;
    return matchSearch && matchClass;
  });

  const exportCsv = () => {
    downloadCSV("students.csv", [
      ["ID", "Name", "Class", "Gender", "Parent", "Attendance", "Avg Score", "Status"],
      ...filtered.map((s) => [s.id, s.name, s.class, s.gender, s.parent, `${s.attendance}%`, `${s.avg}%`, s.status]),
    ]);
    toast.success(`Exported ${filtered.length} students.`);
  };

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const id = `MC-${String(items.length + 1).padStart(3, "0")}`;
    setItems((p) => [{ id, ...form, attendance: 100, avg: 0, status: "Active" }, ...p]);
    toast.success(`${form.name} added.`);
    setForm({ name: "", class: "Primary 3", gender: "Male", parent: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Students</h1>
          <p className="text-muted-foreground text-sm">Manage all enrolled students across Primary and Secondary.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition">
            <Download size={14} /> EXPORT
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition">
            <Plus size={14} /> ADD STUDENT
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border focus:border-navy focus:outline-none text-sm text-navy bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="border border-border px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy bg-white"
          >
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} students</div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">ID</th>
              <th className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">STUDENT</th>
              <th className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">CLASS</th>
              <th className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">PARENT</th>
              <th className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">ATTENDANCE</th>
              <th className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">AVG SCORE</th>
              <th className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">STATUS</th>
              <th className="text-right px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">ACTION</th>
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/20 transition">
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{s.id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-navy/10 text-navy flex items-center justify-center text-xs font-bold">
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">{s.gender}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{s.class}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.parent}</td>
                <td className="px-5 py-4">
                  <span className={`font-bold ${s.attendance >= 90 ? "text-emerald-600" : s.attendance >= 80 ? "text-amber-500" : "text-red-500"}`}>
                    {s.attendance}%
                  </span>
                </td>
                <td className="px-5 py-4 font-bold">{s.avg}%</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 ${s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => setViewing(s)} className="text-xs font-bold text-navy hover:text-gold transition">VIEW</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onSubmit={addStudent} onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-black text-navy">Add Student</h3>
              <button type="button" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-border px-3 py-2 text-sm" />
            <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full border border-border px-3 py-2 text-sm bg-white">
              {classes.slice(1).map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border border-border px-3 py-2 text-sm bg-white">
              <option>Male</option><option>Female</option>
            </select>
            <input placeholder="Parent / Guardian" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} className="w-full border border-border px-3 py-2 text-sm" />
            <button type="submit" className="w-full bg-navy text-gold py-3 font-bold text-xs tracking-wider">SAVE STUDENT</button>
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
              <div className="flex justify-between"><dt className="text-muted-foreground">Class</dt><dd>{viewing.class}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Gender</dt><dd>{viewing.gender}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Parent</dt><dd>{viewing.parent}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Attendance</dt><dd className="font-bold">{viewing.attendance}%</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Avg Score</dt><dd className="font-bold">{viewing.avg}%</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd>{viewing.status}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
