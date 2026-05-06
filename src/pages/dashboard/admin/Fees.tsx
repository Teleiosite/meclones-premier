import { Wallet, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csv";

const payments = [
  { name: "Mrs. Adeyemi", child: "David Okafor", class: "SS 2", term: "Term 2", amount: "₦850,000", date: "May 12", method: "Card", status: "Paid" },
  { name: "Mrs. Adeyemi", child: "Grace Okafor", class: "Primary 5", term: "Term 2", amount: "₦600,000", date: "May 12", method: "Card", status: "Paid" },
  { name: "Mr. Paul", child: "Chinedu Paul", class: "Primary 3", term: "Term 2", amount: "₦525,000", date: "May 10", method: "Transfer", status: "Paid" },
  { name: "Mr. Johnson", child: "David Johnson", class: "JSS 1", term: "Term 2", amount: "₦750,000", date: "May 8", method: "USSD", status: "Paid" },
  { name: "Mr. Eze", child: "Emeka Eze", class: "JSS 3", term: "Term 2", amount: "₦750,000", date: "—", method: "—", status: "Outstanding" },
  { name: "Mrs. Okoro", child: "Blessing Okoro", class: "SS 1", term: "Term 2", amount: "₦850,000", date: "—", method: "—", status: "Outstanding" },
  { name: "Mr. Bello", child: "Fatima Bello", class: "SS 3", term: "Term 2", amount: "₦950,000", date: "Apr 28", method: "Card", status: "Paid" },
  { name: "Mrs. Adesanya", child: "Tunde Adesanya", class: "Primary 6", term: "Term 2", amount: "₦600,000", date: "—", method: "—", status: "Partial" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Outstanding: "bg-red-100 text-red-600",
  Partial: "bg-amber-100 text-amber-700",
};

export default function AdminFees() {
  const totalCollected = 24500000;
  const outstanding = 2150000;
  const thisMonth = 8750000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Fees & Payments</h1>
        <p className="text-muted-foreground text-sm">Track fee collection, outstanding balances, and payment history.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wallet size={22} />} label="Total Collected" value="₦24.5M" hint="This session" tone="navy" />
        <StatCard icon={<TrendingUp size={22} />} label="This Month" value="₦8.75M" hint="May 2026" tone="green" />
        <StatCard icon={<AlertCircle size={22} />} label="Outstanding" value="₦2.15M" hint="12 students" tone="orange" />
        <StatCard icon={<CreditCard size={22} />} label="Collection Rate" value="89%" hint="Term 2" tone="gold" />
      </div>

      {/* Fee Collection Bar */}
      <div className="bg-white border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">Term 2 Collection Progress</h3>
          <span className="text-xs text-muted-foreground">Target: ₦27.5M</span>
        </div>
        <div className="h-4 bg-secondary relative overflow-hidden">
          <div className="h-full bg-navy transition-all" style={{ width: `${(totalCollected / 27500000) * 100}%` }} />
          <div className="h-full bg-gold/40 absolute top-0" style={{ left: `${(totalCollected / 27500000) * 100}%`, width: `${(outstanding / 27500000) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-navy inline-block" /> Collected (₦{(totalCollected / 1000000).toFixed(1)}M)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gold/40 inline-block" /> Outstanding (₦{(outstanding / 1000000).toFixed(1)}M)</span>
        </div>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-navy">Payment Records — Term 2, 2026</h3>
          <button onClick={() => { downloadCSV("fees-term2.csv", [["Student", "Parent", "Class", "Term", "Amount", "Date", "Method", "Status"], ...payments.map((p) => [p.child, p.name, p.class, p.term, p.amount, p.date, p.method, p.status])]); toast.success("Payments exported."); }} className="text-xs font-bold text-navy border border-navy px-4 py-2 hover:bg-navy hover:text-gold transition">EXPORT</button>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              {["STUDENT", "CLASS", "TERM", "AMOUNT", "DATE", "METHOD", "STATUS", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {payments.map((p, i) => (
              <tr key={i} className="hover:bg-secondary/20 transition">
                <td className="px-5 py-4">
                  <div className="font-semibold">{p.child}</div>
                  <div className="text-[11px] text-muted-foreground">{p.name}</div>
                </td>
                <td className="px-5 py-4">{p.class}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.term}</td>
                <td className="px-5 py-4 font-bold">{p.amount}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.date}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.method}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 ${statusStyles[p.status]}`}>{p.status.toUpperCase()}</span>
                </td>
                <td className="px-5 py-4">
                  {p.status !== "Paid" && (
                    <button onClick={() => toast.success(`Reminder sent to ${p.name}.`)} className="text-xs font-bold bg-gold text-navy px-3 py-1 hover:bg-gold/80 transition">REMIND</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
