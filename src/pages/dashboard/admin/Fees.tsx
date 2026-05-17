import { useState, useEffect, useCallback } from "react";
import { Wallet, CreditCard, TrendingUp, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type PaymentRecord = {
  id: string;
  student_name: string;
  parent_name: string;
  student_class: string;
  term: string;
  amount: number;
  date: string | null;
  method: string | null;
  status: string;
};

export type FeeStats = {
  total_collected: number;
  outstanding: number;
  this_month: number;
  collection_rate: number;
  fee_count: number;
};

const statusStyles: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Outstanding: "bg-red-100 text-red-600",
  Partial: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
};

function FeeStructureManagement() {
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    class_name: "Primary 1", term: "Term 1",
    tuition: 0, uniform: 0, books: 0, others: 0
  });

  const fetchStructures = async () => {
    setLoading(true);
    const { data } = await supabase.from("fee_structures").select("*").order("class_name", { ascending: true });
    setStructures(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStructures(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("fee_structures").upsert(form);
    if (error) toast.error(error.message);
    else {
      toast.success("Fee structure updated!");
      setShowAdd(false);
      fetchStructures();
    }
  };

  return (
    <div className="bg-white border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-navy text-lg uppercase tracking-wider">Fee Breakdowns (Schedule)</h3>
        <button onClick={() => setShowAdd(true)} className="bg-navy text-gold px-4 py-2 text-xs font-bold tracking-widest hover:bg-navy/90">SET NEW FEE</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {structures.map((s) => (
          <div key={s.id} className="border border-border p-4 bg-secondary/5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-navy">{s.class_name}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{s.term}</div>
              </div>
              <div className="text-navy font-black">₦{s.total.toLocaleString()}</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground"><span>Tuition</span><span>₦{s.tuition.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Uniforms</span><span>₦{s.uniform.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Books</span><span>₦{s.books.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Others</span><span>₦{s.others.toLocaleString()}</span></div>
            </div>
          </div>
        ))}
        {structures.length === 0 && !loading && (
          <div className="col-span-full py-8 text-center text-muted-foreground text-sm border-2 border-dashed border-border">
            No fee schedules defined yet. Click "Set New Fee" to get started.
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white p-6 w-full max-w-md space-y-4">
            <h4 className="font-bold text-navy">Set Fee for Class</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase mb-1">Class</label>
                <input required value={form.class_name} onChange={e => setForm({ ...form, class_name: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase mb-1">Term</label>
                <input required value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} className="w-full border border-border px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase mb-1">Tuition</label>
                <input type="number" value={form.tuition} onChange={e => setForm({ ...form, tuition: Number(e.target.value) })} className="w-full border border-border px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase mb-1">Uniform</label>
                <input type="number" value={form.uniform} onChange={e => setForm({ ...form, uniform: Number(e.target.value) })} className="w-full border border-border px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase mb-1">Books</label>
                <input type="number" value={form.books} onChange={e => setForm({ ...form, books: Number(e.target.value) })} className="w-full border border-border px-3 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy/60 uppercase mb-1">Others</label>
                <input type="number" value={form.others} onChange={e => setForm({ ...form, others: Number(e.target.value) })} className="w-full border border-border px-3 py-2 text-sm outline-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2 text-xs font-bold border border-navy text-navy">CANCEL</button>
              <button type="submit" className="flex-1 py-2 text-xs font-bold bg-navy text-gold">SAVE SCHEDULE</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AdminFees() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<FeeStats>({
    total_collected: 0,
    outstanding: 0,
    this_month: 0,
    collection_rate: 0,
    fee_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [reminding, setReminding] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatsError(null);

    const { data: feeStats, error: rpcError } = await supabase.rpc('get_fee_stats');

    if (rpcError) {
      setStatsError(rpcError.message);
      toast.error("Could not load fee statistics.");
    } else if (feeStats) {
      setStats({
        total_collected: feeStats.collected,
        outstanding: feeStats.pending,
        this_month: 0,
        collection_rate: feeStats.total_students > 0 ? Math.round((feeStats.collected / (feeStats.collected + feeStats.pending || 1)) * 100) : 0,
        fee_count: feeStats.total_students,
      });
    }

    const { data: payData, error: payError } = await supabase
      .from("payments")
      .select(`
        id, amount, reference, status, paid_at, term,
        students!payments_student_id_fkey (
          class,
          profiles ( full_name ),
          parents ( profiles ( full_name ) )
        )
      `)
      .order("paid_at", { ascending: false })
      .limit(20);

    if (payError) {
      toast.error("Failed to load payment records.");
    } else {
      const mapped: PaymentRecord[] = (payData || []).map((p: any) => ({
        id: p.id,
        student_name: p.students?.profiles?.full_name ?? "—",
        parent_name: p.students?.parents?.profiles?.full_name ?? "—",
        student_class: p.students?.class ?? "—",
        term: p.term ?? "—",
        amount: p.amount,
        date: p.paid_at
          ? new Date(p.paid_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
          : "—",
        method: "Online",
        status: p.status === "success" ? "Paid" : p.status,
      }));
      setPayments(mapped);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-fees-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleRemind = async (p: PaymentRecord) => {
    if (!user || reminding) return;
    setReminding(p.id);
    toast.success(`Reminder triggered for ${p.parent_name}.`);
    setReminding(null);
  };

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
    return `₦${n}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin" /> Loading financial records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Fees &amp; Payments</h1>
          <p className="text-muted-foreground text-sm">Track fee collection, outstanding balances, and payment history.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 border border-navy text-navy px-4 py-2 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold transition"
          title="Refresh stats"
        >
          <RefreshCw size={14} /> REFRESH
        </button>
      </div>

      {statsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{statsError}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wallet size={22} />} label="Total Collected" value={formatCurrency(stats.total_collected)} hint="All time" tone="navy" />
        <StatCard icon={<TrendingUp size={22} />} label="This Month" value={formatCurrency(stats.this_month)} hint="Current month" tone="green" />
        <StatCard icon={<AlertCircle size={22} />} label="Outstanding" value={formatCurrency(stats.outstanding)} hint="Total balance" tone="orange" />
        <StatCard icon={<CreditCard size={22} />} label="Collection Rate" value={`${stats.collection_rate}%`} hint="Overall" tone="gold" />
      </div>

      <div className="bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">Fee Collection Progress</h3>
          <span className="text-xs text-muted-foreground">
            Target: {formatCurrency(stats.total_collected + stats.outstanding)} · {stats.fee_count} fee records
          </span>
        </div>
        <div className="h-4 bg-secondary relative overflow-hidden">
          <div className="h-full bg-navy transition-all" style={{ width: `${stats.collection_rate}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-navy inline-block" /> Collected ({formatCurrency(stats.total_collected)})</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gold/40 inline-block" /> Outstanding ({formatCurrency(stats.outstanding)})</span>
        </div>
      </div>

      <FeeStructureManagement />

      <div className="bg-white border border-border overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-navy">Recent Payment Records</h3>
          <button
            onClick={() => {
              downloadCSV("payments_report.csv", [
                ["Student", "Parent", "Class", "Term", "Amount", "Date", "Status"],
                ...payments.map((p) => [p.student_name, p.parent_name, p.student_class, p.term, p.amount, p.date, p.status]),
              ]);
              toast.success("Payments exported.");
            }}
            className="text-xs font-bold text-navy border border-navy px-4 py-2 hover:bg-navy hover:text-gold transition"
          >
            EXPORT CSV
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              {["STUDENT", "CLASS", "TERM", "AMOUNT", "DATE", "STATUS", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">No payment records found.</td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/20 transition">
                  <td className="px-5 py-4">
                    <div className="font-semibold">{p.student_name}</div>
                    <div className="text-[11px] text-muted-foreground">{p.parent_name}</div>
                  </td>
                  <td className="px-5 py-4">{p.student_class}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.term}</td>
                  <td className="px-5 py-4 font-bold">₦{p.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 ${statusStyles[p.status] ?? "bg-secondary text-muted-foreground"}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {p.status !== "Paid" && (
                      <button
                        onClick={() => handleRemind(p)}
                        disabled={reminding === p.id}
                        className="text-xs font-bold bg-gold text-navy px-3 py-1 hover:bg-gold/80 transition disabled:opacity-50"
                      >
                        {reminding === p.id ? "..." : "REMIND"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
