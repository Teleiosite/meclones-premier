import { useState, useEffect, useCallback } from "react";
import { Wallet, CreditCard, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";
import { supabase } from "@/lib/supabase";

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
  Paid: "bg-emerald-100 text-emerald-700",
  Outstanding: "bg-red-100 text-red-600",
  Partial: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700", // for payments table status
};

export default function AdminFees() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState({
    totalCollected: 0,
    outstanding: 0,
    thisMonth: 0,
    count: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    // Fetch recent payments
    const { data: payData, error: payError } = await supabase
      .from("payments")
      .select(`
        id, amount, reference, status, paid_at,
        students!payments_student_id_fkey (
          class,
          profiles!students_profile_id_fkey ( full_name ),
          parents!students_parent_id_fkey ( profiles!parents_profile_id_fkey ( full_name ) )
        ),
        fees ( term )
      `)
      .order("paid_at", { ascending: false })
      .limit(20);

    // Fetch all fees to calculate outstanding
    const { data: feeData } = await supabase
      .from("fees")
      .select("amount, created_at");

    if (payError) {
      toast.error("Failed to load payment records.");
      setLoading(false);
      return;
    }

    const mapped: PaymentRecord[] = (payData || []).map((p: any) => ({
      id: p.id,
      student_name: p.students?.profiles?.full_name ?? "—",
      parent_name: p.students?.parents?.profiles?.full_name ?? "—",
      student_class: p.students?.class ?? "—",
      term: p.fees?.term ?? "—",
      amount: p.amount,
      date: p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "—",
      method: "Online", // default for Paystack
      status: p.status === "success" ? "Paid" : p.status
    }));

    setPayments(mapped);

    // Calculate Stats
    const totalCollected = (payData || [])
      .filter((p: any) => p.status === "success")
      .reduce((acc: number, p: any) => acc + p.amount, 0);

    const totalFees = (feeData || []).reduce((acc: number, f: any) => acc + f.amount, 0);
    const outstanding = totalFees - totalCollected;

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thisMonth = (payData || [])
      .filter((p: any) => p.status === "success" && p.paid_at && p.paid_at >= firstDay)
      .reduce((acc: number, p: any) => acc + p.amount, 0);

    setStats({
      totalCollected,
      outstanding: Math.max(0, outstanding),
      thisMonth,
      count: feeData?.length || 0
    });

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatCurrency = (n: number) => {
    if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `₦${(n / 1000).toFixed(0)}K`;
    return `₦${n}`;
  };

  const collectionRate = stats.totalCollected + stats.outstanding > 0
    ? Math.round((stats.totalCollected / (stats.totalCollected + stats.outstanding)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin" /> Loading financial records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Fees & Payments</h1>
        <p className="text-muted-foreground text-sm">Track fee collection, outstanding balances, and payment history.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wallet size={22} />} label="Total Collected" value={formatCurrency(stats.totalCollected)} hint="This session" tone="navy" />
        <StatCard icon={<TrendingUp size={22} />} label="This Month" value={formatCurrency(stats.thisMonth)} hint="Current month" tone="green" />
        <StatCard icon={<AlertCircle size={22} />} label="Outstanding" value={formatCurrency(stats.outstanding)} hint="Total balance" tone="orange" />
        <StatCard icon={<CreditCard size={22} />} label="Collection Rate" value={`${collectionRate}%`} hint="Overall" tone="gold" />
      </div>

      {/* Collection Bar */}
      <div className="bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">Fee Collection Progress</h3>
          <span className="text-xs text-muted-foreground">Target: {formatCurrency(stats.totalCollected + stats.outstanding)}</span>
        </div>
        <div className="h-4 bg-secondary relative overflow-hidden">
          <div className="h-full bg-navy transition-all" style={{ width: `${collectionRate}%` }} />
          <div className="h-full bg-gold/40 absolute top-0" style={{ left: `${collectionRate}%`, width: `${100 - collectionRate}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-navy inline-block" /> Collected ({formatCurrency(stats.totalCollected)})</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gold/40 inline-block" /> Outstanding ({formatCurrency(stats.outstanding)})</span>
        </div>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-navy">Recent Payment Records</h3>
          <button 
            onClick={() => { 
              downloadCSV("payments_report.csv", [
                ["Student", "Parent", "Class", "Term", "Amount", "Date", "Status"], 
                ...payments.map((p) => [p.student_name, p.parent_name, p.student_class, p.term, p.amount, p.date, p.status])
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
                    <span className={`text-[10px] font-bold px-2 py-1 ${statusStyles[p.status] || "bg-secondary text-muted-foreground"}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {p.status !== "Paid" && (
                      <button onClick={() => toast.success(`Reminder sent to ${p.parent_name}.`)} className="text-xs font-bold bg-gold text-navy px-3 py-1 hover:bg-gold/80 transition">REMIND</button>
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
