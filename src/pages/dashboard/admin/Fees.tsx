import { useState, useEffect, useCallback } from "react";
import { Wallet, CreditCard, TrendingUp, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";
import { supabase } from "@/lib/supabase";
import { getFeeStats, logPaymentReminder, type FeeStats } from "@/lib/rpc";
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

const statusStyles: Record<string, string> = {
  Paid:        "bg-emerald-100 text-emerald-700",
  Outstanding: "bg-red-100 text-red-600",
  Partial:     "bg-amber-100 text-amber-700",
  success:     "bg-emerald-100 text-emerald-700",
};

export default function AdminFees() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<FeeStats>({
    total_collected: 0,
    outstanding:     0,
    this_month:      0,
    collection_rate: 0,
    fee_count:       0,
  });
  const [loading, setLoading]       = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [reminding, setReminding]   = useState<string | null>(null); // payment id being reminded

  const fetchData = useCallback(async () => {
    setLoading(true);
    setStatsError(null);

    // ── 1. Server-side financial KPIs via RPC ────────────────────────
    const { data: feeStats, error: rpcError } = await getFeeStats();

    if (rpcError || !feeStats) {
      setStatsError(rpcError ?? "Failed to load financial stats.");
      toast.error("Could not load fee statistics. Check your connection.");
    } else {
      setStats(feeStats);
    }

    // ── 2. Recent payment records for the table ──────────────────────
    const { data: payData, error: payError } = await supabase
      .from("payments")
      .select(`
        id, amount, reference, status, paid_at, term,
        students!payments_student_id_fkey (
          class,
          profiles!students_profile_id_fkey ( full_name ),
          parents!students_parent_id_fkey ( profiles!parents_profile_id_fkey ( full_name ) )
        ),
        fees!payments_fee_id_fkey ( term )
      `)
      .order("paid_at", { ascending: false })
      .limit(20);

    if (payError) {
      toast.error("Failed to load payment records.");
    } else {
      const mapped: PaymentRecord[] = (payData || []).map((p: any) => ({
        id:            p.id,
        student_name:  p.students?.profiles?.full_name ?? "—",
        parent_name:   p.students?.parents?.profiles?.full_name ?? "—",
        student_class: p.students?.class ?? "—",
        term:          p.fees?.term ?? p.term ?? "—",
        amount:        p.amount,
        date:          p.paid_at
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

  // ── Remind action — now audited ──────────────────────────────────────
  const handleRemind = async (p: PaymentRecord) => {
    if (!user || reminding) return;
    setReminding(p.id);

    const { error } = await logPaymentReminder(
      p.id,
      `Reminder triggered by admin for ${p.parent_name} (${p.student_name}) — ${p.term}`
    );

    if (error) {
      toast.error(error);
    } else {
      toast.success(`Reminder logged for ${p.parent_name}. Connect SMS/email delivery before sending live notices.`);
    }
    setReminding(null);
  };

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`;
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

      {/* Stats error banner */}
      {statsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} />
          <span>Financial stats could not be loaded from the database. Showing zeroes.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wallet size={22} />}      label="Total Collected" value={formatCurrency(stats.total_collected)} hint="All time"      tone="navy"   />
        <StatCard icon={<TrendingUp size={22} />}  label="This Month"      value={formatCurrency(stats.this_month)}      hint="Current month" tone="green"  />
        <StatCard icon={<AlertCircle size={22} />} label="Outstanding"     value={formatCurrency(stats.outstanding)}     hint="Total balance" tone="orange" />
        <StatCard icon={<CreditCard size={22} />}  label="Collection Rate" value={`${stats.collection_rate}%`}           hint="Overall"       tone="gold"   />
      </div>

      {/* Collection Progress Bar */}
      <div className="bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">Fee Collection Progress</h3>
          <span className="text-xs text-muted-foreground">
            Target: {formatCurrency(stats.total_collected + stats.outstanding)} · {stats.fee_count} fee records
          </span>
        </div>
        <div className="h-4 bg-secondary relative overflow-hidden">
          <div className="h-full bg-navy transition-all" style={{ width: `${stats.collection_rate}%` }} />
          <div
            className="h-full bg-gold/40 absolute top-0"
            style={{ left: `${stats.collection_rate}%`, width: `${100 - stats.collection_rate}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-navy inline-block" /> Collected ({formatCurrency(stats.total_collected)})</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gold/40 inline-block" /> Outstanding ({formatCurrency(stats.outstanding)})</span>
        </div>
      </div>

      {/* Recent Payments Table */}
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
