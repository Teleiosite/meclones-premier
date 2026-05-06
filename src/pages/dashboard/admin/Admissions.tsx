import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";

const applications = [
  { id: "APP-2026-001", name: "Chinedu Paul Jr.", class: "Primary 3", parent: "Mr. Chinedu Paul", phone: "+234 803 000 0001", email: "paul@email.com", date: "May 29, 2026", status: "Pending" },
  { id: "APP-2026-002", name: "Amina Yusuf", class: "Primary 5", parent: "Mrs. Yusuf", phone: "+234 803 000 0002", email: "yusuf@email.com", date: "May 29, 2026", status: "Pending" },
  { id: "APP-2026-003", name: "David Johnson", class: "JSS 1", parent: "Mr. Johnson", phone: "+234 803 000 0003", email: "johnson@email.com", date: "May 28, 2026", status: "Pending" },
  { id: "APP-2026-004", name: "Blessing Okoro", class: "SS 1", parent: "Mrs. Okoro", phone: "+234 803 000 0004", email: "okoro@email.com", date: "May 28, 2026", status: "Pending" },
  { id: "APP-2026-005", name: "Temi Adewale", class: "Nursery 1", parent: "Mr. Adewale", phone: "+234 803 000 0005", email: "adewale@email.com", date: "May 27, 2026", status: "Approved" },
  { id: "APP-2026-006", name: "Kemi Okafor", class: "JSS 2", parent: "Mrs. Okafor", phone: "+234 803 000 0006", email: "okafor@email.com", date: "May 26, 2026", status: "Rejected" },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-600",
};

export default function AdminAdmissions() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState(applications);

  const approve = (id: string) => {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: "Approved" } : a));
    toast.success("Application approved.");
  };
  const reject = (id: string) => {
    setItems((prev) => prev.map((a) => a.id === id ? { ...a, status: "Rejected" } : a));
    toast.error("Application rejected.");
  };

  const counts = { All: items.length, Pending: items.filter((a) => a.status === "Pending").length, Approved: items.filter((a) => a.status === "Approved").length, Rejected: items.filter((a) => a.status === "Rejected").length };
  const filtered = filter === "All" ? items : items.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Admissions</h1>
        <p className="text-muted-foreground text-sm">Review and manage incoming applications for the 2026 session.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(counts).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`p-5 border text-left transition ${filter === k ? "bg-navy text-white border-navy" : "bg-white border-border hover:border-navy"}`}
          >
            <div className={`text-xs font-bold tracking-wider mb-1 ${filter === k ? "text-gold" : "text-muted-foreground"}`}>{k.toUpperCase()}</div>
            <div className={`font-display text-3xl font-black ${filter === k ? "text-white" : "text-navy"}`}>{v}</div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              {["REF", "APPLICANT", "CLASS", "PARENT / GUARDIAN", "DATE", "STATUS", "ACTIONS"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-secondary/20 transition">
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{a.id}</td>
                <td className="px-5 py-4 font-semibold">{a.name}</td>
                <td className="px-5 py-4">{a.class}</td>
                <td className="px-5 py-4">
                  <div>{a.parent}</div>
                  <div className="text-[11px] text-muted-foreground">{a.email}</div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{a.date}</td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 ${statusStyles[a.status]}`}>{a.status.toUpperCase()}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-muted-foreground hover:text-navy transition" title="View"><Eye size={16} /></button>
                    {a.status === "Pending" && (
                      <>
                        <button onClick={() => approve(a.id)} className="text-emerald-600 hover:text-emerald-700 transition" title="Approve"><CheckCircle2 size={16} /></button>
                        <button onClick={() => reject(a.id)} className="text-red-500 hover:text-red-600 transition" title="Reject"><XCircle size={16} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No {filter.toLowerCase()} applications.</div>
        )}
      </div>
    </div>
  );
}
