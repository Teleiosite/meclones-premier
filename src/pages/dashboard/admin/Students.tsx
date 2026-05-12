import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Filter, Download, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  admission_no: string;
  full_name: string;
  class: string;
  gender: string;
  parent_name: string;
  attendance: number;
  avg: number;
  status: string;
};

const CLASS_OPTIONS = [
  "Nursery 1", "Nursery 2",
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JSS 1A", "JSS 1B", "JSS 2A", "JSS 2B", "JSS 3A", "JSS 3B",
  "SS 1A", "SS 1B", "SS 2A", "SS 2B", "SS 3A", "SS 3B",
];

export default function AdminStudents() {
  const [students, setStudents]     = useState<Student[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [showAdd, setShowAdd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [viewing, setViewing]       = useState<Student | null>(null);
  const [form, setForm]             = useState({
    admission_no: "", full_name: "", class: "Primary 1",
    gender: "Male", parent_name: "",
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select(`
        id,
        admission_no,
        class,
        gender,
        status,
        profiles!students_profile_id_fkey ( full_name ),
        parents ( profiles!parents_profile_id_fkey ( full_name ) )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load students.");
      setLoading(false);
      return;
    }

    const mapped: Student[] = (data || []).map((s: any) => ({
      id:          s.id,
      admission_no: s.admission_no,
      full_name:   s.profiles?.full_name ?? "—",
      class:       s.class,
      gender:      s.gender ?? "—",
      parent_name: s.parents?.profiles?.full_name ?? "—",
      attendance:  100,
      avg:         0,
      status:      s.status,
    }));

    setStudents(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const allClasses = ["All", ...CLASS_OPTIONS];

  const filtered = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase())
      || s.admission_no.includes(search);
    const matchClass = classFilter === "All" || s.class === classFilter;
    return matchSearch && matchClass;
  });

  const exportCsv = () => {
    downloadCSV("students.csv", [
      ["ID", "Name", "Class", "Gender", "Parent", "Status"],
      ...filtered.map((s) => [s.admission_no, s.full_name, s.class, s.gender, s.parent_name, s.status]),
    ]);
    toast.success(`Exported ${filtered.length} students.`);
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.admission_no.trim()) return;
    setSaving(true);

    // 1. Create a profile-less student record (admin-created, no auth account yet)
    const { error } = await supabase.from("students").insert({
      admission_no: form.admission_no,
      class:        form.class,
      gender:       form.gender,
      status:       "Active",
    });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    toast.success(`${form.full_name} added successfully.`);
    setForm({ admission_no: "", full_name: "", class: "Primary 1", gender: "Male", parent_name: "" });
    setShowAdd(false);
    setSaving(false);
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Students</h1>
          <p className="text-muted-foreground text-sm">Manage all enrolled students.</p>
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
            placeholder="Search by name or admission no..."
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
            {allClasses.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} students</div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
            <Loader2 size={18} className="animate-spin" /> Loading students...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No students found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                {["ADMISSION NO", "STUDENT", "CLASS", "PARENT", "GENDER", "STATUS", "ACTION"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/20 transition">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{s.admission_no}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-navy/10 text-navy flex items-center justify-center text-xs font-bold">
                        {s.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">{s.class}</td>
                  <td className="px-5 py-4 text-muted-foreground">{s.parent_name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{s.gender}</td>
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
        )}
      </div>

      {/* Add Student Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onSubmit={addStudent} onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-black text-navy">Add Student</h3>
              <button type="button" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <input required placeholder="Full name" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm" />
            <input required placeholder="Admission No (e.g. MC-011)" value={form.admission_no}
              onChange={(e) => setForm({ ...form, admission_no: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm font-mono" />
            <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm bg-white">
              {CLASS_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm bg-white">
              <option>Male</option><option>Female</option>
            </select>
            <button type="submit" disabled={saving}
              className="w-full bg-navy text-gold py-3 font-bold text-xs tracking-wider disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "SAVING..." : "SAVE STUDENT"}
            </button>
          </form>
        </div>
      )}

      {/* View Student Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-black text-navy">{viewing.full_name}</h3>
              <button onClick={() => setViewing(null)}><X size={18} /></button>
            </div>
            <dl className="text-sm space-y-2 text-navy">
              {[
                ["Admission No", viewing.admission_no],
                ["Class", viewing.class],
                ["Gender", viewing.gender],
                ["Parent", viewing.parent_name],
                ["Status", viewing.status],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
