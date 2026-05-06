import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard, Users, GraduationCap, UserCog, FileText,
  CreditCard, BookOpen, ClipboardList, Calendar, BarChart3, Settings,
  Wallet, ShieldCheck, TrendingUp,
} from "lucide-react";

const nav = [
  { to: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/dashboard/admin/students", label: "Students", icon: <GraduationCap size={18} /> },
  { to: "/dashboard/admin/teachers", label: "Teachers", icon: <UserCog size={18} /> },
  { to: "/dashboard/admin/admissions", label: "Admissions", icon: <FileText size={18} /> },
  { to: "/dashboard/admin/fees", label: "Fees & Payments", icon: <CreditCard size={18} /> },
  { to: "/dashboard/admin/attendance", label: "Attendance", icon: <ClipboardList size={18} /> },
  { to: "/dashboard/admin/academics", label: "Academics", icon: <BookOpen size={18} /> },
  { to: "/dashboard/admin/announcements", label: "Announcements", icon: <BarChart3 size={18} /> },
];

export default function AdminLayout() {
  return <DashboardLayout role="Admin" userName="Super Admin" userMeta="Administrator" nav={nav} />;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const months = ["May 1", "May 8", "May 15", "May 22", "May 29"];
  const attendance = [62, 70, 74, 80, 92];
  const fees = [55, 70, 110, 90, 130, 95, 120, 80, 75, 160, 130, 140];
  const recent = [
    { name: "Grace U.", action: "New admission", time: "2 min ago" },
    { name: "Daniel M.", action: "Fee payment of ₦65,000", time: "15 min ago" },
    { name: "John Doe", action: "Submitted assignment", time: "30 min ago" },
    { name: "Class P5", action: "Attendance updated", time: "1 hour ago" },
    { name: "Daniel M.", action: "Logged in", time: "2 hours ago" },
  ];
  const pending = [
    { name: "Chinedu Paul", grade: "Primary 3", date: "May 29, 2024" },
    { name: "Amina Yusuf", grade: "Primary 5", date: "May 29, 2024" },
    { name: "David Johnson", grade: "JSS 1", date: "May 28, 2024" },
    { name: "Blessing Okoro", grade: "SS 1", date: "May 28, 2024" },
  ];
  const classes = [
    { name: "Primary 3A", students: 28, perf: 92 },
    { name: "Primary 5B", students: 31, perf: 88 },
    { name: "JSS 1A", students: 35, perf: 90 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome back — here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22} />} label="Total Students" value="565" tone="navy" />
        <StatCard icon={<GraduationCap size={22} />} label="Teachers" value="45" tone="green" />
        <StatCard icon={<ShieldCheck size={22} />} label="Pass Rate" value="92%" tone="gold" />
        <StatCard icon={<Wallet size={22} />} label="Fees Collected" value="₦24.5M" tone="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          {/* Attendance */}
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Attendance Overview</h3>
              <span className="text-xs text-muted-foreground">This Month</span>
            </div>
            <svg viewBox="0 0 320 160" className="w-full h-40">
              {[0, 25, 50, 75, 100].map((y, i) => (
                <line key={i} x1="30" y1={20 + i * 30} x2="310" y2={20 + i * 30} stroke="#e5e7eb" strokeDasharray="2 4" />
              ))}
              <polyline
                fill="none"
                stroke="hsl(var(--navy))"
                strokeWidth="2.5"
                points={attendance.map((v, i) => `${30 + i * 70},${140 - v}`).join(" ")}
              />
              {attendance.map((v, i) => (
                <circle key={i} cx={30 + i * 70} cy={140 - v} r="4" fill="hsl(var(--gold))" stroke="hsl(var(--navy))" strokeWidth="2" />
              ))}
              {months.map((m, i) => (
                <text key={i} x={30 + i * 70} y="158" fontSize="9" textAnchor="middle" fill="#6b7280">{m}</text>
              ))}
            </svg>
          </div>

          {/* Fees Collection */}
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Fees Collection</h3>
              <span className="text-xs text-muted-foreground">This Term</span>
            </div>
            <svg viewBox="0 0 320 160" className="w-full h-40">
              {fees.map((v, i) => (
                <rect key={i} x={20 + i * 24} y={140 - v} width="14" height={v} fill="hsl(var(--navy))" />
              ))}
            </svg>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recent.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-navy/10 text-navy rounded-full flex items-center justify-center text-xs font-bold">
                    {r.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-navy truncate">{r.action}</div>
                    <div className="text-[11px] text-muted-foreground">{r.name}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground whitespace-nowrap">{r.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Admissions */}
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Pending Admissions</h3>
              <Link to="/dashboard/admin/admissions" className="text-xs text-navy font-semibold hover:text-gold">View All</Link>
            </div>
            <div className="space-y-3">
              {pending.map((p, i) => (
                <div key={i} className="flex items-center gap-3 text-sm border-b border-border pb-3 last:border-0">
                  <div className="w-8 h-8 bg-gold/30 text-navy rounded-full flex items-center justify-center text-xs font-bold">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">{p.grade} · {p.date}</div>
                  </div>
                  <Link to="/dashboard/admin/admissions" className="text-xs font-bold tracking-wider text-navy border border-navy px-3 py-1 hover:bg-navy hover:text-gold">
                    VIEW
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Today Overview</h3>
              <span className="text-xs text-muted-foreground">May 29, 2024</span>
            </div>
            <div className="text-xs text-muted-foreground">New Visits Today</div>
            <div className="font-display text-4xl font-black text-emerald-600 my-2 flex items-center gap-2">
              92% <TrendingUp size={20} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
              <div><div className="text-[11px] text-muted-foreground">New Admissions</div><div className="font-bold text-accent text-xl">3</div></div>
              <div><div className="text-[11px] text-muted-foreground">Fee Payments</div><div className="font-bold text-accent text-xl">12</div></div>
              <div><div className="text-[11px] text-muted-foreground">Events</div><div className="font-bold text-accent text-xl">2</div></div>
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">My Classes</h3>
              <a className="text-xs text-navy font-semibold">View All</a>
            </div>
            <div className="space-y-4">
              {classes.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div>
                      <div className="font-semibold text-navy">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.students} Students</div>
                    </div>
                    <div className="text-emerald-600 font-bold">{c.perf}%</div>
                  </div>
                  <div className="h-1.5 bg-secondary"><div className="h-full bg-emerald-500" style={{ width: `${c.perf}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-navy text-gold py-2.5 text-xs font-bold tracking-wider">ADD STUDENT</button>
              <button className="bg-navy text-gold py-2.5 text-xs font-bold tracking-wider">NEW REPORT</button>
              <button className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider">ATTENDANCE</button>
              <button className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider">SEND NOTICE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
