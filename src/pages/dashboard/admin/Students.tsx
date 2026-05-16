import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Filter, Download, X, Loader2, UserPlus, Mail, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  admission_no: string;
  full_name: string;
  email: string;
  class: string;
  gender: string;
  parent_name: string;
  status: string;
};

const CLASS_OPTIONS = [
  "Nursery 1", "Nursery 2",
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JSS 1A", "JSS 1B", "JSS 2A", "JSS 2B", "JSS 3A", "JSS 3B",
  "SS 1A", "SS 1B", "SS 2A", "SS 2B", "SS 3A", "SS 3B",
];

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [showInvite, setShowInvite] = useState<{ name: string; link: string; email: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [form, setForm] = useState({
    admission_no: "", full_name: "", email: "", class: "Primary 1",
    gender: "Male",
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
        profiles ( full_name, email ),
        parents ( profiles ( full_name ) )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load students.");
      setLoading(false);
      return;
    }

    const mapped: Student[] = (data || []).map((s: any) => ({
      id: s.id,
      admission_no: s.admission_no,
      full_name: s.profiles?.full_name ?? "—",
      email: s.profiles?.email ?? "—",
      class: s.class,
      gender: s.gender ?? "—",
      parent_name: s.parents?.profiles?.full_name ?? "—",
      status: s.status,
    }));

    setStudents(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = students.filter((s) => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase())
      || s.admission_no.includes(search)
      || s.email.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "All" || s.class === classFilter;
    return matchSearch && matchClass;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const regLink = `${window.location.origin}/register?email=${encodeURIComponent(form.email)}&role=student&name=${encodeURIComponent(form.full_name)}`;
    
    setShowInvite({ name: form.full_name, link: regLink, email: form.email });
    setShowAdd(false);
    setSaving(false);
    
    toast.success("Student invitation generated!");
  };

  const exportCsv = () => {
    downloadCSV("students.csv", [
      ["Admission No", "Name", "Class", "Parent", "Status"],
      ...filtered.map(s => [s.admission_no, s.full_name, s.class, s.parent_name, s.status])
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy uppercase tracking-tight">Students</h1>
          <p className="text-muted-foreground text-sm">Review enrollment and manage student portal access.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-widest hover:bg-secondary transition">
            <Download size={14} /> EXPORT CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-widest hover:bg-navy/90 transition shadow-lg">
            <Plus size={14} /> INVITE STUDENT
          </button>
        </div>
      </div>

      <div className="bg-white border border-border p-4 flex flex-wrap gap-3 items-center shadow-sm">
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
            className="border border-border px-3 py-2 text-xs font-bold text-navy focus:outline-none focus:border-navy bg-white"
          >
            <option value="All">ALL CLASSES</option>
            {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-border overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/20 border-b border-border">
              {["Admission No", "Student", "Class", "Parent", "Status", "Action"].map((h) => (
                <th key={h} className="px-5 py-4 text-[10px] font-bold text-navy/60 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/10 transition text-sm">
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{s.admission_no}</td>
                <td className="px-5 py-4 font-bold">{s.full_name}</td>
                <td className="px-5 py-4">{s.class}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.parent_name}</td>
                <td className="px-5 py-4">
                  <span className={`text-[9px] font-black px-2 py-1 ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} uppercase tracking-tighter`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => setViewing(s)} className="text-[10px] font-black text-navy hover:text-gold transition underline decoration-gold underline-offset-4">VIEW</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onSubmit={handleAddStudent} onClick={(e) => e.stopPropagation()} className="bg-white p-8 w-full max-w-md space-y-6 border-t-8 border-navy shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-black text-navy uppercase tracking-tight">Invite Student</h3>
              <button type="button" onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Full Name</label>
                <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full border border-border px-4 py-3 text-sm focus:border-navy outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Email Address</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-border px-4 py-3 text-sm focus:border-navy outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Class</label>
                  <select value={form.class} onChange={e => setForm({...form, class: e.target.value})} className="w-full border border-border px-4 py-3 text-sm focus:border-navy outline-none bg-white">
                    {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Admission No</label>
                  <input required value={form.admission_no} onChange={e => setForm({...form, admission_no: e.target.value})} className="w-full border border-border px-4 py-3 text-sm focus:border-navy outline-none font-mono" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-navy text-gold py-4 font-bold text-xs tracking-widest disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-navy/90 transition shadow-lg">
              {saving ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
              GENERATE INVITE LINK →
            </button>
          </form>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-8 w-full max-w-md space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-gold/10 text-navy flex items-center justify-center mx-auto rounded-full">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black text-navy uppercase">Student Invited</h3>
              <p className="text-sm text-muted-foreground mt-2">Send this registration link to {showInvite.name} or their parent.</p>
            </div>
            
            <div className="bg-secondary/50 p-4 rounded border border-dashed border-border text-xs font-mono break-all text-navy/70 select-all">
              {showInvite.link}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(showInvite.link);
                  toast.success("Link copied!");
                }}
                className="bg-navy text-gold py-3 text-xs font-bold tracking-widest hover:bg-navy/90 transition"
              >
                COPY LINK
              </button>
              <button 
                onClick={() => {
                  const subject = encodeURIComponent("Invitation to Meclones Academy Student Portal");
                  const body = encodeURIComponent(`Hello ${showInvite.name},\n\nYou have been invited to join the Meclones Academy student portal. Please use the link below to create your account:\n\n${showInvite.link}\n\nRegards,\nSchool Administration`);
                  window.location.href = `mailto:${showInvite.email}?subject=${subject}&body=${body}`;
                }}
                className="border border-navy text-navy py-3 text-xs font-bold tracking-widest hover:bg-secondary transition"
              >
                SEND EMAIL
              </button>
            </div>
            <button onClick={() => setShowInvite(null)} className="text-xs font-bold text-muted-foreground hover:text-navy transition">CLOSE</button>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-8 w-full max-w-md border-b-8 border-gold shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-black text-navy uppercase">{viewing.full_name}</h3>
              <button onClick={() => setViewing(null)}><X size={20} /></button>
            </div>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Admission No</dt>
                <dd className="font-black text-navy">{viewing.admission_no}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Current Class</dt>
                <dd className="font-black text-navy">{viewing.class}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Parent / Guardian</dt>
                <dd className="font-black text-navy">{viewing.parent_name}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
