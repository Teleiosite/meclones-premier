import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard, Users, ClipboardCheck, Award, CreditCard,
  MessageSquare, Calendar, FileText, Settings,
  TrendingUp, BookOpen, Wallet,
} from "lucide-react";

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
  return <DashboardLayout role="Parent" userName="Mrs. Adeyemi" userMeta="Parent / Guardian" nav={nav} />;
}

const children = [
  { name: "David Okafor", grade: "SS 2", attendance: 92, average: 85, color: "bg-navy" },
  { name: "Grace Okafor", grade: "Primary 5", attendance: 96, average: 89, color: "bg-emerald-600" },
];

export function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Parent Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, Mrs. Adeyemi 👋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Children Enrolled" value="2" tone="navy" />
        <StatCard icon={<ClipboardCheck size={22} />} label="Avg. Attendance" value="94%" tone="green" />
        <StatCard icon={<TrendingUp size={22} />} label="Avg. Performance" value="87%" tone="purple" />
        <StatCard icon={<Wallet size={22} />} label="Outstanding Fees" value="₦0" hint="All paid" tone="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">My Children</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {children.map((c, i) => (
                <div key={i} className="border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${c.color} text-white flex items-center justify-center font-bold`}>
                      {c.name.split(" ").map((s) => s[0]).join("")}
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
                  <button className={`w-full mt-3 ${c.color} text-white py-2 text-xs font-bold tracking-wider`}>VIEW DETAILS</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Recent Results</h3>
              <a className="text-xs text-navy font-semibold">View All</a>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["David Okafor", "Mathematics Test 2", "88%", "A"],
                ["Grace Okafor", "English Reading Test", "92%", "A"],
                ["David Okafor", "Chemistry Practical", "90%", "A"],
                ["Grace Okafor", "Science Project", "85%", "B"],
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <div className="font-semibold text-navy">{r[1]}</div>
                    <div className="text-[11px] text-muted-foreground">{r[0]}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-navy">{r[2]}</div>
                    <span className="w-7 h-7 bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">{r[3]}</span>
                  </div>
                </div>
              ))}
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
                  {[
                    ["Term 2 Tuition", "David Okafor", "May 12", "₦450,000", "Paid"],
                    ["Term 2 Tuition", "Grace Okafor", "May 12", "₦300,000", "Paid"],
                    ["Uniform & Books", "David Okafor", "Apr 30", "₦35,000", "Paid"],
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 font-semibold">{r[0]}</td>
                      <td>{r[1]}</td>
                      <td>{r[2]}</td>
                      <td className="text-right font-bold">{r[3]}</td>
                      <td className="text-right"><span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1">{r[4].toUpperCase()}</span></td>
                    </tr>
                  ))}
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
            <button className="w-full mt-4 bg-gold text-navy py-3 font-bold tracking-wider text-sm">PAY NOW →</button>
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
