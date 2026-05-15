import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Download, X, Loader2, Phone, Mail, MapPin, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";
import { supabase } from "@/lib/supabase";

type Parent = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  children_count: number;
  status: string;
};

export default function AdminParents() {
  const [parents, setParents]     = useState<Parent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showAdd, setShowAdd]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [viewing, setViewing]     = useState<Parent | null>(null);
  
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", 
    address: "", occupation: ""
  });

  const fetchParents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("parents")
      .select(`
        id,
        phone,
        address,
        occupation,
        status,
        profiles!parents_profile_id_fkey ( full_name, email ),
        students ( count )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load parents.");
      setLoading(false);
      return;
    }

    const mapped: Parent[] = (data || []).map((p: any) => ({
      id:         p.id,
      full_name:  p.profiles?.full_name ?? "—",
      email:      p.profiles?.email ?? "—",
      phone:      p.phone ?? "—",
      address:    p.address ?? "—",
      occupation: p.occupation ?? "—",
      children_count: p.students?.[0]?.count ?? 0,
      status:     p.status ?? "Active",
    }));

    setParents(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { fetchParents(); }, [fetchParents]);

  const filtered = parents.filter((p) => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const addParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      toast.error("Name and Email are required");
      return;
    }
    setSaving(true);

    try {
      const { data, error } = await supabase.rpc('manage_user', {
        p_action: 'create',
        p_role: 'parent',
        p_email: form.email,
        p_password: Math.random().toString(36).slice(-10) + "!",
        p_metadata: {
          full_name: form.full_name,
          phone: form.phone,
          address: form.address,
          occupation: form.occupation
        }
      });

      if (error) throw error;
      if (data?.status === 'error') throw new Error(data.message);

      toast.success(`${form.full_name} added! Invitation sent.`);
      setForm({ full_name: "", email: "", phone: "", address: "", occupation: "" });
      setShowAdd(false);
      fetchParents();
    } catch (err: any) {
      console.error("Parent Creation Error:", err);
      let message = err.message || "Failed to add parent";
      if (err.code === "23505" || message.includes("unique constraint")) {
        message = "A parent with this Email address already exists.";
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Parents</h1>
          <p className="text-muted-foreground text-sm">Manage parent accounts and communication.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition">
            <Download size={14} /> EXPORT
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition">
            <Plus size={14} /> ADD PARENT
          </button>
        </div>
      </div>

      <div className="bg-white border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search parents by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border focus:border-navy focus:outline-none text-sm text-navy bg-white"
          />
        </div>
        <div className="text-xs text-muted-foreground">{filtered.length} parents found</div>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/10 border-b border-border">
              {["Parent Name", "Contact", "Children", "Status", ""].map((h) => (
                <th key={h} className="px-5 py-4 text-xs font-bold text-navy/60 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/20 transition">
                <td className="px-5 py-4">
                  <div className="font-semibold">{p.full_name}</div>
                  <div className="text-xs text-muted-foreground">{p.occupation}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs"><Mail size={12} className="text-gold" /> {p.email}</div>
                    <div className="flex items-center gap-1.5 text-xs"><Phone size={12} className="text-gold" /> {p.phone}</div>
                  </div>
                </td>
                <td className="px-5 py-4 font-bold">{p.children_count}</td>
                <td className="px-5 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 uppercase">
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => setViewing(p)} className="text-xs font-bold text-navy hover:text-gold transition">VIEW</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onSubmit={addParent} onClick={(e) => e.stopPropagation()} className="bg-white p-8 w-full max-w-md space-y-5 border-t-8 border-navy">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-2xl font-black text-navy">Add Parent</h3>
              <button type="button" onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Full Name</label>
                <input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full border border-border px-3 py-2 text-sm focus:border-navy outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Email Address</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-border px-3 py-2 text-sm focus:border-navy outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-border px-3 py-2 text-sm focus:border-navy outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Occupation</label>
                  <input value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} className="w-full border border-border px-3 py-2 text-sm focus:border-navy outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Home Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border border-border px-3 py-2 text-sm focus:border-navy outline-none h-20" />
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-navy text-gold py-4 font-bold text-xs tracking-widest disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
              {saving ? "SAVING..." : "CREATE PARENT ACCOUNT"}
            </button>
          </form>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-black text-navy">{viewing.full_name}</h3>
              <button onClick={() => setViewing(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-secondary/10 border border-border">
                <Mail size={18} className="text-gold" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Email</div>
                  <div className="text-sm font-semibold">{viewing.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/10 border border-border">
                <Phone size={18} className="text-gold" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Phone</div>
                  <div className="text-sm font-semibold">{viewing.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/10 border border-border">
                <MapPin size={18} className="text-gold" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Address</div>
                  <div className="text-sm font-semibold">{viewing.address}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
