import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard, Users, ClipboardCheck, Award, CreditCard,
  MessageSquare, Calendar, FileText, Settings, TrendingUp, Wallet,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";


const nav = [
  { to: "/dashboard/parent", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/dashboard/parent/children", label: "My Children", icon: <Users size={18} /> },
  { to: "/dashboard/parent/attendance", label: "Attendance", icon: <ClipboardCheck size={18} /> },
  { to: "/dashboard/parent/results", label: "Results", icon: <Award size={18} /> },
  { to: "/dashboard/parent/fees", label: "Fees & Payments", icon: <CreditCard size={18} /> },
  { to: "/dashboard/parent/messages", label: "Messages", icon: <MessageSquare size={18} /> },
  { to: "/dashboard/parent/calendar", label: "Calendar", icon: <Calendar size={18} /> },
  { to: "/dashboard/parent/reports", label: "Reports", icon: <FileText size={18} /> },
  { to: "/dashboard/parent/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function ParentLayout() {
  const { profile } = useAuth();
  return <DashboardLayout role="Parent" userName={profile?.full_name || "Parent"} userMeta="Parent / Guardian" nav={nav} />;
}

export function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [parentStats, setParentStats] = useState({ children: "–", attendance: "–", performance: "–", outstanding: "₦0" });
  const [childList, setChildList] = useState<any[]>([]);
  const [resultList, setResultList] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState("Parent");


  useEffect(() => {
    async function loadParentData() {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Get Parent Profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile) setParentName(profile.full_name);

        // 2. Fetch Children
        const { data: students } = await supabase
          .from("students")
          .select("id, profiles(full_name), class")
          .eq("parent_id", user.id);

        if (students && students.length > 0) {
          const colors = ["bg-navy", "bg-emerald-600", "bg-violet-600", "bg-orange-500"];
          const studentIds = students.map(s => s.id);

          // 3. Fetch Children's Results
          const { data: results } = await supabase
            .from("results")
            .select("score, students(profiles(full_name)), exams(title)")
            .in("student_id", studentIds)
            .order("created_at", { ascending: false })
            .limit(4);

          setResultList(results?.map(r => ({
            child: (r.students as any)?.profiles?.full_name || "Child",
            title: r.exams?.title || "Exam",
            score: r.score,
            grade: r.score >= 70 ? "A" : r.score >= 60 ? "B" : "C"
          })) || []);

          // 4. Fetch Payment History
          const { data: payments } = await supabase
            .from("payments")
            .select("amount, description, created_at, students(profiles(full_name)), status")
            .in("student_id", studentIds)
            .order("created_at", { ascending: false })
            .limit(5);

          setPaymentHistory(payments?.map(p => ({
            description: p.description || "Fee Payment",
            child: (p.students as any)?.profiles?.full_name || "Child",
            date: new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
            amount: `₦${Number(p.amount).toLocaleString()}`,
            status: p.status || "paid"
          })) || []);

          setChildList(students.map((s, i) => ({
            name: (s.profiles as any)?.full_name || "Child",
            grade: s.class || "N/A",
            attendance: 90 + Math.floor(Math.random() * 8), // Placeholder until attendance summary table exists
            average: 75 + Math.floor(Math.random() * 15), // Placeholder until results avg exists
            color: colors[i % colors.length]
          })));

          setParentStats({
            children: students.length.toString(),
            attendance: "94%",
            performance: "87%",
            outstanding: "₦0"
          });
        }
      } catch (err) {
        console.error("Error loading parent dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadParentData();
  }, [user]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Parent Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {parentName} 👋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Children Enrolled" value={parentStats.children} tone="navy" />
        <StatCard icon={<ClipboardCheck size={22} />} label="Avg. Attendance" value={parentStats.attendance} tone="green" />
        <StatCard icon={<TrendingUp size={22} />} label="Avg. Performance" value={parentStats.performance} tone="purple" />
        <StatCard icon={<Wallet size={22} />} label="Outstanding Fees" value={parentStats.outstanding} hint="All paid" tone="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">My Children</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {childList.map((c, i) => (
                <div key={i} className="border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${c.color} text-white flex items-center justify-center font-bold`}>
                      {c.name.split(" ").map((s: string) => s[0]).join("")}
                    </div>
                    <div>
                      <div className="font-bold text-navy">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.grade}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-secondary p-2">
                      <div className="text-[10px] text-muted-foreground">Attendance</div>
                      <div className="font-bold text-navy">{c.attendance}%</div>
                    </div>
                    <div className="bg-secondary p-2">
                      <div className="text-[10px] text-muted-foreground">Average</div>
                      <div className="font-bold text-navy">{c.average}%</div>
                    </div>
                  </div>
                  <button onClick={() => navigate("/dashboard/parent/children")} className={`w-full mt-3 ${c.color} text-white py-2 text-xs font-bold tracking-wider hover:opacity-90`}>VIEW DETAILS</button>
                </div>
              ))}
              {childList.length === 0 && !loading && (
                <div className="col-span-full py-8 text-center text-muted-foreground text-xs border border-dashed border-border">
                  No children linked to this account.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Recent Results</h3>
              <Link to="/dashboard/parent/results" className="text-xs text-navy font-semibold hover:text-gold">View All</Link>
            </div>
            <div className="space-y-3 text-sm">
              {resultList.map((r, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <div className="font-semibold text-navy">{r.title}</div>
                    <div className="text-[11px] text-muted-foreground">{r.child}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-navy">{r.score}%</div>
                    <span className="w-7 h-7 bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">{r.grade}</span>
                  </div>
                </div>
              ))}
              {resultList.length === 0 && !loading && (
                <div className="py-6 text-center text-muted-foreground text-xs">No recent results for your children.</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Fee Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left py-2 font-medium">Description</th>
                    <th className="text-left font-medium">Child</th>
                    <th className="text-left font-medium">Date</th>
                    <th className="text-right font-medium">Amount</th>
                    <th className="text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-navy">
                  {paymentHistory.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 font-semibold">{r.description}</td>
                      <td>{r.child}</td>
                      <td>{r.date}</td>
                      <td className="text-right font-bold">{r.amount}</td>
                      <td className="text-right"><span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1">{r.status.toUpperCase()}</span></td>
                    </tr>
                  ))}
                  {paymentHistory.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground text-xs">No payment records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-navy text-white p-5">
            <p className="eyebrow text-gold mb-2">Next Payment</p>
            <div className="font-display text-3xl font-black">₦750,000</div>
            <div className="text-white/70 text-sm mt-1">Term 3 Tuition · Due Sep 5</div>
            <button onClick={() => navigate("/dashboard/parent/fees")} className="w-full mt-4 bg-gold text-navy py-3 font-bold tracking-wider text-sm hover:bg-gold/90">PAY NOW →</button>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-3">Messages</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Mr. Daniel", "Math performance update", "10m"],
                ["Admin", "PTA meeting reminder", "2h"],
                ["Mrs. James", "Parent-teacher session", "1d"],
              ].map((m, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-border pb-2 last:border-0">
                  <div className="w-8 h-8 bg-navy/10 text-navy rounded-full flex items-center justify-center text-xs font-bold">
                    {m[0][0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy text-sm">{m[0]}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{m[1]}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{m[2]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-3">Upcoming Events</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Jun 5", "PTA Meeting", "10:00 AM"],
                ["Jun 10", "Midterm Exams Begin", "All week"],
                ["Jun 22", "Sports Day", "9:00 AM"],
              ].map((e, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-border pb-2 last:border-0">
                  <div className="bg-gold/20 text-navy text-center px-2 py-1 w-12">
                    <div className="text-[9px] font-bold">{e[0].split(" ")[0]}</div>
                    <div className="font-bold text-sm leading-none">{e[0].split(" ")[1]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-navy">{e[1]}</div>
                    <div className="text-[11px] text-muted-foreground">{e[2]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
