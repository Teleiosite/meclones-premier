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
  const [showInvite, setShowInvite] = useState<{ name: string; link: string; email: string } | null>(null);
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
        profiles ( full_name, email ),
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

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const params = new URLSearchParams({
      email: form.email,
      role: 'parent',
      name: form.full_name,
      phone: form.phone,
      address: form.address,
      occupation: form.occupation
    });
    
    const regLink = `${window.location.origin}/register?${params.toString()}`;
    
    setShowInvite({ name: form.full_name, link: regLink, email: form.email });
    setShowAdd(false);
    setSaving(false);
    
    toast.success("Invitation generated!");
  };

  const exportCsv = () => {
    downloadCSV("parents.csv", [
      ["Name", "Email", "Phone", "Children", "Status"],
      ...filtered.map(p => [p.full_name, p.email, p.phone, p.children_count, p.status])
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy uppercase tracking-tight">Parents</h1>
          <p className="text-muted-foreground text-sm">Manage parent accounts and family links.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-widest hover:bg-secondary transition">
            <Download size={14} /> EXPORT CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold tracking-widest hover:bg-navy/90 transition shadow-lg">
            <Plus size={14} /> INVITE PARENT
          </button>
        </div>
      </div>

      <div className="bg-white border border-border p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search parents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border focus:border-navy focus:outline-none text-sm text-navy bg-white"
          />
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {filtered.length} PARENTS ENROLLED
        </div>
      </div>

      <div className="bg-white border border-border overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/20 border-b border-border">
              {["Parent Name", "Contact", "Children", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-4 text-[10px] font-bold text-navy/60 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/10 transition">
                <td className="px-5 py-4">
                  <div className="font-bold text-sm">{p.full_name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-medium">{p.occupation || "General"}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs"><Mail size={12} className="text-gold" /> {p.email}</div>
                    <div className="flex items-center gap-2 text-xs"><Phone size={12} className="text-gold" /> {p.phone}</div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-navy/5 text-navy font-black text-xs">
                    {p.children_count}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-[9px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 uppercase tracking-tighter">
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => setViewing(p)} className="text-[10px] font-black text-navy hover:text-gold transition underline decoration-gold underline-offset-4">DETAILS</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onSubmit={handleAddParent} onClick={(e) => e.stopPropagation()} className="bg-white p-8 w-full max-w-md space-y-6 border-t-8 border-navy shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-black text-navy uppercase tracking-tight">Invite Parent</h3>
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
                  <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-border px-4 py-3 text-sm focus:border-navy outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-navy/60 uppercase tracking-widest mb-1">Occupation</label>
                  <input value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} className="w-full border border-border px-4 py-3 text-sm focus:border-navy outline-none" />
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
              <Mail size={32} />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black text-navy uppercase">Parent Invited</h3>
              <p className="text-sm text-muted-foreground mt-2">Send this registration link to {showInvite.name}.</p>
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
                  const subject = encodeURIComponent("Invitation to Meclones Group of Schools Parent Portal");
                  const body = encodeURIComponent(`Hello ${showInvite.name},\n\nYou have been invited to join the Meclones Group of Schools portal. Please use the link below to create your account:\n\n${showInvite.link}\n\nRegards,\nSchool Administration`);
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
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/10 border border-border">
                <Mail size={20} className="text-gold" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Email Address</div>
                  <div className="text-sm font-bold text-navy">{viewing.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-secondary/10 border border-border">
                <Phone size={20} className="text-gold" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Phone Number</div>
                  <div className="text-sm font-bold text-navy">{viewing.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-secondary/10 border border-border">
                <MapPin size={20} className="text-gold" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Primary Address</div>
                  <div className="text-sm font-bold text-navy leading-tight">{viewing.address || "No address provided."}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
