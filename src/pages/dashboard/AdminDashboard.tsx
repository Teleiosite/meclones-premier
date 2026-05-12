import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard, Users, GraduationCap, UserCog, FileText,
  Banknote, CalendarCheck, BookOpenCheck, Megaphone, Calendar,
  ShieldCheck, Wallet, TrendingUp, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const nav = [
  { to: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/dashboard/admin/students", label: "Students", icon: <GraduationCap size={18} /> },
  { to: "/dashboard/admin/teachers", label: "Teachers", icon: <UserCog size={18} /> },
  { to: "/dashboard/admin/admissions", label: "Admissions", icon: <FileText size={18} /> },
  { to: "/dashboard/admin/fees", label: "Fee Management", icon: <Banknote size={18} /> },
  { to: "/dashboard/admin/attendance", label: "Attendance", icon: <CalendarCheck size={18} /> },
  { to: "/dashboard/admin/academics", label: "Academics", icon: <BookOpenCheck size={18} /> },
  { to: "/dashboard/admin/timetable", label: "Timetable", icon: <Calendar size={18} /> },
  { to: "/dashboard/admin/announcements", label: "Announcements", icon: <Megaphone size={18} /> },
];

export default function AdminLayout() {
  return <DashboardLayout role="Admin" userName="Super Admin" userMeta="Administrator" nav={nav} />;
}

export function AdminDashboard() {
  const navigate = useNavigate();

  // Live stats from Supabase
  const [stats, setStats] = useState({ students: "–", teachers: "–", collected: "–", pending: "–" });
  const [statsLoading, setStatsLoading] = useState(true);

  // Charts remain with representative data (no change needed for MVP)
  const months = ["May 1", "May 8", "May 15", "May 22", "May 29"];
  const attendance = [62, 70, 74, 80, 92];
  const fees = [55, 70, 110, 90, 130, 95, 120, 80, 75, 160, 130, 140];

  // Static recent activity (would need an audit log table to go live)
  const recent = [
    { name: "Grace U.", action: "New admission", time: "2 min ago" },
    { name: "Daniel M.", action: "Fee payment of ₦65,000", time: "15 min ago" },
    { name: "John Doe", action: "Submitted assignment", time: "30 min ago" },
    { name: "Class P5", action: "Attendance updated", time: "1 hour ago" },
  ];
  const classes = [
    { name: "Primary 3A", students: 28, perf: 92 },
    { name: "Primary 5B", students: 31, perf: 88 },
    { name: "JSS 1A", students: 35, perf: 90 },
  ];

  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true);
      try {
        // Run all stat queries in parallel
        const [
          { count: studentCount },
          { count: teacherCount },
          { count: pendingCount },
          { data: paymentData },
        ] = await Promise.all([
          supabase.from("students").select("*", { count: "exact", head: true }),
          supabase.from("teachers").select("*", { count: "exact", head: true }),
          supabase.from("admissions").select("*", { count: "exact", head: true }).eq("status", "Pending"),
          supabase.from("payments").select("amount").eq("status", "success"),
        ]);

        // Sum total collected fees
        const totalCollected = (paymentData || []).reduce(
          (sum: number, p: any) => sum + Number(p.amount), 0
        );
        const formattedCollected = totalCollected >= 1_000_000
          ? `₦${(totalCollected / 1_000_000).toFixed(1)}M`
          : `₦${totalCollected.toLocaleString()}`;

        setStats({
          students: (studentCount ?? 0).toString(),
          teachers: (teacherCount ?? 0).toString(),
          collected: formattedCollected,
          pending: (pendingCount ?? 0).toString(),
        });
      } catch {
        // Silently fall back to dashes — user can see data on individual pages
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome back — here's what's happening today.</p>
      </div>

      {/* Live KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-border p-5 flex items-center justify-center h-24">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ))
        ) : (
          <>
            <StatCard icon={<Users size={22} />} label="Total Students" value={stats.students} tone="navy" />
            <StatCard icon={<GraduationCap size={22} />} label="Teachers" value={stats.teachers} tone="green" />
            <StatCard icon={<ShieldCheck size={22} />} label="Pending Admissions" value={stats.pending} tone="gold" />
            <StatCard icon={<Wallet size={22} />} label="Fees Collected" value={stats.collected} tone="purple" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          {/* Attendance Chart */}
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

          {/* Fees Collection Chart */}
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

          {/* Pending Admissions — links to the admissions page */}
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Pending Admissions</h3>
              <Link to="/dashboard/admin/admissions" className="text-xs text-navy font-semibold hover:text-gold">View All</Link>
            </div>
            <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
                <FileText size={24} className="text-gold" />
              </div>
              <p className="text-3xl font-display font-black text-navy">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">applications awaiting review</p>
              <Link
                to="/dashboard/admin/admissions"
                className="mt-2 bg-navy text-gold px-6 py-2 text-xs font-bold tracking-wider hover:bg-navy/90 transition"
              >
                REVIEW APPLICATIONS →
              </Link>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Today Overview</h3>
              <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="text-xs text-muted-foreground">Attendance Rate</div>
            <div className="font-display text-4xl font-black text-emerald-600 my-2 flex items-center gap-2">
              92% <TrendingUp size={20} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
              <div><div className="text-[11px] text-muted-foreground">Students</div><div className="font-bold text-accent text-xl">{stats.students}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Teachers</div><div className="font-bold text-accent text-xl">{stats.teachers}</div></div>
              <div><div className="text-[11px] text-muted-foreground">Pending</div><div className="font-bold text-accent text-xl">{stats.pending}</div></div>
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">My Classes</h3>
              <Link to="/dashboard/admin/academics" className="text-xs text-navy font-semibold hover:text-gold">View All</Link>
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
              <button onClick={() => navigate("/dashboard/admin/students")} className="bg-navy text-gold py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90">ADD STUDENT</button>
              <button onClick={() => navigate("/dashboard/admin/academics")} className="bg-navy text-gold py-2.5 text-xs font-bold tracking-wider hover:bg-navy/90">NEW REPORT</button>
              <button onClick={() => navigate("/dashboard/admin/attendance")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold">ATTENDANCE</button>
              <button onClick={() => navigate("/dashboard/admin/announcements")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider hover:bg-navy hover:text-gold">SEND NOTICE</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
