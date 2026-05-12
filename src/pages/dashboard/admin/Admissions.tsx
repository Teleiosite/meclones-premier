import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Eye, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type Application = {
  id: string;
  applicant_name: string;
  class_applying: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  status: string;
  created_at: string;
  notes: string | null;
};

const statusStyles: Record<string, string> = {
  Pending:  "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-600",
};

export default function AdminAdmissions() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [viewing, setViewing]   = useState<Application | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { toast.error("Failed to load applications."); }
    else { setApplications(data || []); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const updateStatus = async (id: string, status: "Approved" | "Rejected") => {
    setUpdating(id);
    const { error } = await supabase
      .from("admissions")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Application ${status.toLowerCase()}.`);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      if (viewing?.id === id) setViewing(v => v ? { ...v, status } : null);
    }
    setUpdating(null);
  };

  const counts = {
    All:      applications.length,
    Pending:  applications.filter(a => a.status === "Pending").length,
    Approved: applications.filter(a => a.status === "Approved").length,
    Rejected: applications.filter(a => a.status === "Rejected").length,
  };

  const filtered = filter === "All" ? applications : applications.filter(a => a.status === filter);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Admissions</h1>
        <p className="text-muted-foreground text-sm">Review and manage incoming applications for the 2026 session.</p>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`p-5 border text-left transition ${filter === k ? "bg-navy text-white border-navy" : "bg-white border-border hover:border-navy"}`}>
            <div className={`text-xs font-bold tracking-wider mb-1 ${filter === k ? "text-gold" : "text-muted-foreground"}`}>{k.toUpperCase()}</div>
            <div className={`font-display text-3xl font-black ${filter === k ? "text-white" : "text-navy"}`}>
              {loading ? "—" : v}
            </div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
            <Loader2 size={18} className="animate-spin" /> Loading applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No {filter.toLowerCase()} applications.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                {["APPLICANT", "CLASS", "PARENT / GUARDIAN", "DATE", "STATUS", "ACTIONS"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy divide-y divide-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-secondary/20 transition">
                  <td className="px-5 py-4 font-semibold">{a.applicant_name}</td>
                  <td className="px-5 py-4">{a.class_applying}</td>
                  <td className="px-5 py-4">
                    <div>{a.parent_name}</div>
                    <div className="text-[11px] text-muted-foreground">{a.parent_email}</div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{formatDate(a.created_at)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 ${statusStyles[a.status]}`}>{a.status.toUpperCase()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewing(a)} className="text-muted-foreground hover:text-navy transition" title="View">
                        <Eye size={16} />
                      </button>
                      {a.status === "Pending" && (
                        <>
                          <button
                            disabled={updating === a.id}
                            onClick={() => updateStatus(a.id, "Approved")}
                            className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40 transition" title="Approve">
                            {updating === a.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          </button>
                          <button
                            disabled={updating === a.id}
                            onClick={() => updateStatus(a.id, "Rejected")}
                            className="text-red-500 hover:text-red-600 disabled:opacity-40 transition" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Details Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-black text-navy">Application Details</h3>
              <button onClick={() => setViewing(null)}><X size={18} /></button>
            </div>
            <dl className="text-sm space-y-3 text-navy">
              {[
                ["Applicant", viewing.applicant_name],
                ["Class Applying", viewing.class_applying],
                ["Parent / Guardian", viewing.parent_name],
                ["Email", viewing.parent_email],
                ["Phone", viewing.parent_phone || "—"],
                ["Status", viewing.status],
                ["Submitted", formatDate(viewing.created_at)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold text-right">{val}</dd>
                </div>
              ))}
              {viewing.notes && (
                <div>
                  <dt className="text-muted-foreground mb-1">Notes</dt>
                  <dd className="text-sm leading-relaxed">{viewing.notes}</dd>
                </div>
              )}
            </dl>
            {viewing.status === "Pending" && (
              <div className="flex gap-3 mt-5">
                <button onClick={() => updateStatus(viewing.id, "Approved")} disabled={!!updating}
                  className="flex-1 bg-emerald-600 text-white py-2.5 font-bold text-xs tracking-wider hover:bg-emerald-700 transition disabled:opacity-60">
                  APPROVE
                </button>
                <button onClick={() => updateStatus(viewing.id, "Rejected")} disabled={!!updating}
                  className="flex-1 bg-red-500 text-white py-2.5 font-bold text-xs tracking-wider hover:bg-red-600 transition disabled:opacity-60">
                  REJECT
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
