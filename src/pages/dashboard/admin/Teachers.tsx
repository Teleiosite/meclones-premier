import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Download, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";
import { supabase } from "@/lib/supabase";

type Teacher = {
  id: string;
  employee_id: string;
  full_name: string;
  subject_specialization: string;
  qualification: string;
  status: string;
  profile_id: string;
};

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<Teacher | null>(null);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", subject_specialization: "", qualification: "", employee_id: "",
  });

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teachers")
      .select(`
        id,
        employee_id,
        subject_specialization,
        qualification,
        status,
        profile_id,
        profiles!teachers_profile_id_fkey ( full_name, email )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load teachers.");
      setLoading(false);
      return;
    }

    const mapped: Teacher[] = (data || []).map((t: any) => ({
      id: t.id,
      employee_id: t.employee_id ?? "—",
      full_name: t.profiles?.full_name ?? "—",
      email: t.profiles?.email ?? "—",
      subject_specialization: t.subject_specialization ?? "—",
      qualification: t.qualification ?? "—",
      status: t.status ?? "Active",
      profile_id: t.profile_id,
    }));

    setTeachers(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const filtered = teachers.filter((t) => {
    const matchSearch = t.full_name.toLowerCase().includes(search.toLowerCase())
      || t.subject_specialization.toLowerCase().includes(search.toLowerCase())
      || (t as any).email?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All"
      || (typeFilter === "Primary" && ["Primary", "Nursery", "Reception"].some(k => t.subject_specialization.includes(k)))
      || (typeFilter === "Secondary" && !["Primary", "Nursery", "Reception"].some(k => t.subject_specialization.includes(k)));
    return matchSearch && matchType;
  });

  const exportCsv = () => {
    downloadCSV("teachers.csv", [
      ["ID", "Name", "Email", "Subject", "Qualification", "Status"],
      ...filtered.map((t) => [t.employee_id, t.full_name, (t as any).email, t.subject_specialization, t.qualification, t.status]),
    ]);
    toast.success(`Exported ${filtered.length} teachers.`);
  };

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Email and password are required.");
      return;
    }
    setSaving(true);

    try {
      // Call the secure RPC instead of an Edge Function
      const { data, error } = await supabase.rpc("manage_user", {
        p_action: "create",
        p_email: form.email,
        p_password: form.password,
        p_role: "teacher",
        p_metadata: {
          full_name: form.full_name,
          employee_id: form.employee_id || `T-${Date.now()}`,
          subject_specialization: form.subject_specialization,
          qualification: form.qualification
        }
      });

      if (error) throw error;
      if (data?.status === "error") throw new Error(data.message);

      toast.success(`${form.full_name} added successfully with access.`);
      setForm({ full_name: "", email: "", password: "", subject_specialization: "", qualification: "", employee_id: "" });
      setShowAdd(false);
      fetchTeachers();
    } catch (err: any) {
      console.error("Teacher creation error:", err);
      toast.error(err.message || "Failed to create teacher account.");
    } finally {
      setSaving(false);
    }
  };



  const counts = {
    Total: teachers.length,
    Active: teachers.filter(t => t.status === "Active").length,
    "On Leave": teachers.filter(t => t.status === "On Leave").length,
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(counts).map(([label, value]) => (
          <div key={label} className="bg-white border border-border border-t-4 border-t-navy p-5">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="font-display text-3xl font-black text-navy mt-1">
              {loading ? "—" : value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
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
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-border px-3 py-2 text-sm text-navy focus:outline-none focus:border-navy bg-white">
          {["All", "Primary", "Secondary"].map((t) => <option key={t}>{t}</option>)}
        </select>
        <div className="text-xs text-muted-foreground">{filtered.length} teachers</div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
            <Loader2 size={18} className="animate-spin" /> Loading teachers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No teachers found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                {["ID", "TEACHER", "SUBJECT", "QUALIFICATION", "STATUS", ""].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground ${h === "" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy divide-y divide-border">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-secondary/20 transition">
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{t.employee_id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gold/20 text-navy flex items-center justify-center text-xs font-bold">
                        {t.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold">{t.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{t.subject_specialization}</td>
                  <td className="px-5 py-4 text-muted-foreground">{t.qualification}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 ${t.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => setViewing(t)} className="text-xs font-bold text-navy hover:text-gold transition">VIEW</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onSubmit={addTeacher} onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-black text-navy">Add Teacher</h3>
              <button type="button" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <input required placeholder="Full name" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm" />
            <input required type="email" placeholder="Email address" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm" />
            <input required type="password" placeholder="Initial password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm" />
            <input required placeholder="Subject / specialization" value={form.subject_specialization}
              onChange={(e) => setForm({ ...form, subject_specialization: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm" />

            <input placeholder="Qualification (e.g. B.Ed, M.Sc)" value={form.qualification}
              onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm" />
            <input placeholder="Employee ID (optional)" value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              className="w-full border border-border px-3 py-2 text-sm font-mono" />
            <button type="submit" disabled={saving}
              className="w-full bg-navy text-gold py-3 font-bold text-xs tracking-wider disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "SAVING..." : "SAVE TEACHER"}
            </button>
          </form>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-black text-navy">{viewing.full_name}</h3>
              <button onClick={() => setViewing(null)}><X size={18} /></button>
            </div>
            <dl className="text-sm space-y-2 text-navy">
              {[
                ["Employee ID", viewing.employee_id],
                ["Subject", viewing.subject_specialization],
                ["Qualification", viewing.qualification],
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
