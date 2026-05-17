import { useState, useEffect, useCallback } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type FeeRecord = {
  id: string;
  student_name: string;
  student_class: string;
  term: string;
  amount: number;
  due_date: string | null;
  description: string | null;
  student_id: string;
};

type Payment = {
  id: string;
  amount: number;
  reference: string;
  status: string;
  paid_at: string | null;
  fees: { description: string | null; term: string } | null;
  students: { profiles: { full_name: string } | null } | null;
};

export default function ParentFees() {
  const { user } = useAuth();
  const [fees, setFees]       = useState<FeeRecord[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get parent record
    const { data: parent } = await supabase
      .from("parents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (!parent) { setLoading(false); return; }

    // Get children's fees
    const { data: feeData } = await supabase
      .from("fees")
      .select(`
        id, term, amount, due_date, description,
        students (
          id, class,
          profiles ( full_name )
        )
      `)
      .eq("students.parent_id", parent.id)
      .order("created_at", { ascending: false });

    const mappedFees: FeeRecord[] = (feeData || []).map((f: any) => ({
      id:           f.id,
      student_name: f.students?.profiles?.full_name ?? "—",
      student_class:f.students?.class ?? "—",
      term:         f.term,
      amount:       f.amount,
      due_date:     f.due_date,
      description:  f.description,
      student_id:   f.students?.id,
    }));
    setFees(mappedFees);

    // Get payment history
    const { data: payData } = await supabase
      .from("payments")
      .select(`
        id, amount, reference, status, paid_at,
        fees ( description, term ),
        students (
          profiles ( full_name )
        )
      `)
      .eq("students.parent_id", parent.id)
      .order("created_at", { ascending: false });

    setPayments(payData || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatAmount = (n: number) =>
    "₦" + n.toLocaleString("en-NG");

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const handlePay = (fee: FeeRecord) => {
    // Paystack integration placeholder — will be wired in next phase
    toast.info("Paystack payment coming soon. Contact the school to arrange payment.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin" /> Loading fee records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Fees & Payments</h1>
        <p className="text-muted-foreground text-sm">Manage fee payments for your children.</p>
      </div>

      {/* Outstanding fees */}
      {fees.length === 0 ? (
        <div className="bg-white border border-border p-10 text-center text-muted-foreground text-sm">
          No outstanding fees found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {fees.map((f) => (
            <div key={f.id} className="bg-navy text-white p-6">
              <div className="text-xs text-white/60 font-bold tracking-wider mb-3">
                {f.student_name} · {f.student_class}
              </div>
              <div className="text-xs text-gold font-bold tracking-wider mb-1">{f.term}</div>
              {f.description && <div className="text-xs text-white/50 mb-2">{f.description}</div>}
              <div className="font-display text-4xl font-black text-white">{formatAmount(f.amount)}</div>
              {f.due_date && <div className="text-white/60 text-sm mt-2">Due: {formatDate(f.due_date)}</div>}
              <button onClick={() => handlePay(f)}
                className="mt-5 w-full bg-gold text-navy py-3 font-bold text-xs tracking-wider hover:bg-gold/90 transition flex items-center justify-center gap-2">
                <CreditCard size={14} /> PAY NOW →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment history */}
      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No payment records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr>
                  {["DESCRIPTION", "CHILD", "DATE", "AMOUNT", "STATUS"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-navy">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/20">
                    <td className="px-5 py-4 font-semibold">{p.fees?.description ?? p.fees?.term ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{p.students?.profiles?.full_name ?? "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{formatDate(p.paid_at)}</td>
                    <td className="px-5 py-4 font-bold">{formatAmount(p.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 ${p.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
