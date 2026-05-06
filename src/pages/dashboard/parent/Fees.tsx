import { toast } from "sonner";
import { CreditCard } from "lucide-react";

const children = [
  { name: "David Okafor", class: "SS 2", term: "Term 3, 2026", amount: "₦850,000", due: "Sep 5, 2026", paid: false },
  { name: "Grace Okafor", class: "Primary 5", term: "Term 3, 2026", amount: "₦600,000", due: "Sep 5, 2026", paid: false },
];

const history = [
  { desc: "Term 2 Tuition", child: "David Okafor", date: "May 12", amount: "₦850,000", status: "Paid" },
  { desc: "Term 2 Tuition", child: "Grace Okafor", date: "May 12", amount: "₦600,000", status: "Paid" },
  { desc: "Uniform & Books", child: "David Okafor", date: "Apr 30", amount: "₦35,000", status: "Paid" },
  { desc: "Term 1 Tuition", child: "David Okafor", date: "Jan 10", amount: "₦850,000", status: "Paid" },
  { desc: "Term 1 Tuition", child: "Grace Okafor", date: "Jan 10", amount: "₦600,000", status: "Paid" },
];

export default function ParentFees() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Fees & Payments</h1>
        <p className="text-muted-foreground text-sm">Manage fee payments for your children.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {children.map((c) => (
          <div key={c.name} className="bg-navy text-white p-6">
            <div className="text-xs text-white/60 font-bold tracking-wider mb-3">{c.name} · {c.class}</div>
            <div className="text-xs text-gold font-bold tracking-wider mb-1">{c.term}</div>
            <div className="font-display text-4xl font-black text-white">{c.amount}</div>
            <div className="text-white/60 text-sm mt-2">Due: {c.due}</div>
            <button onClick={() => toast.success(`Payment initiated for ${c.name}.`)}
              className="mt-5 w-full bg-gold text-navy py-3 font-bold text-xs tracking-wider hover:bg-gold/90 transition flex items-center justify-center gap-2">
              <CreditCard size={14} /> PAY NOW →
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Payment History</h3>
        </div>
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
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-secondary/20">
                  <td className="px-5 py-4 font-semibold">{h.desc}</td>
                  <td className="px-5 py-4 text-muted-foreground">{h.child}</td>
                  <td className="px-5 py-4 text-muted-foreground">{h.date}</td>
                  <td className="px-5 py-4 font-bold">{h.amount}</td>
                  <td className="px-5 py-4"><span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1">{h.status.toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
