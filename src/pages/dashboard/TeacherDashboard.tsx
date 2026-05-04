import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard, BookOpen, Users, ClipboardList, FileText,
  Award, Calendar, MessageSquare, BarChart3, Settings,
  CheckCircle2, ClipboardCheck, FileEdit, Megaphone,
} from "lucide-react";

const nav = [
  { to: "/dashboard/teacher", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/dashboard/teacher/classes", label: "My Classes", icon: <BookOpen size={18} /> },
  { to: "/dashboard/teacher/students", label: "Students", icon: <Users size={18} /> },
  { to: "/dashboard/teacher/attendance", label: "Attendance", icon: <ClipboardCheck size={18} /> },
  { to: "/dashboard/teacher/assignments", label: "Assignments", icon: <FileText size={18} /> },
  { to: "/dashboard/teacher/exams", label: "Exams & Grading", icon: <Award size={18} /> },
  { to: "/dashboard/teacher/timetable", label: "Timetable", icon: <Calendar size={18} /> },
  { to: "/dashboard/teacher/messages", label: "Messages", icon: <MessageSquare size={18} /> },
  { to: "/dashboard/teacher/reports", label: "Reports", icon: <BarChart3 size={18} /> },
  { to: "/dashboard/teacher/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function TeacherLayout() {
  return <DashboardLayout role="Teacher" userName="Mr. Daniel Marko" userMeta="Mathematics Teacher" nav={nav} />;
}

const classes = [
  { name: "JSS 1A", subject: "Mathematics", students: 24, attendance: 95, score: 78, color: "bg-navy" },
  { name: "JSS 2B", subject: "Mathematics", students: 28, attendance: 90, score: 82, color: "bg-emerald-600" },
  { name: "JSS 3A", subject: "Mathematics", students: 26, attendance: 88, score: 75, color: "bg-violet-600" },
  { name: "SS 1A", subject: "Mathematics", students: 22, attendance: 93, score: 81, color: "bg-orange-500" },
  { name: "SS 2B", subject: "Mathematics", students: 20, attendance: 91, score: 79, color: "bg-teal-600" },
];

const schedule = [
  { time: "08:00 AM", title: "JSS 1A - Mathematics", room: "Room 12", status: "Completed" },
  { time: "10:00 AM", title: "JSS 2B - Mathematics", room: "Room 15", status: "In Progress" },
  { time: "12:00 PM", title: "Break", room: "Lunch", status: "Break" },
  { time: "01:00 PM", title: "SS 1A - Mathematics", room: "Room 18", status: "Upcoming" },
  { time: "03:00 PM", title: "SS 2B - Mathematics", room: "Room 20", status: "Upcoming" },
];

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Teacher Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, Mr. Daniel Marko 👋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen size={22} />} label="Total Classes" value="5" tone="navy" />
        <StatCard icon={<Users size={22} />} label="Total Students" value="120" tone="green" />
        <StatCard icon={<ClipboardCheck size={22} />} label="Attendance Rate" value="92%" tone="gold" />
        <StatCard icon={<FileText size={22} />} label="Pending Reviews" value="8" tone="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">My Classes</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {classes.map((c, i) => (
                <div key={i} className="border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${c.color} text-white flex items-center justify-center font-bold text-sm`}>
                      {c.name.split(" ")[0]}
                    </div>
                    <div>
                      <div className="font-bold text-navy">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.subject} · {c.students} students</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Attendance</span><span className="font-bold text-emerald-600">{c.attendance}%</span></div>
                    <div className="h-1 bg-secondary"><div className="h-full bg-emerald-500" style={{ width: `${c.attendance}%` }} /></div>
                    <div className="flex justify-between mt-2"><span className="text-muted-foreground">Avg. Score</span><span className="font-bold text-navy">{c.score}%</span></div>
                  </div>
                  <button className={`w-full mt-3 ${c.color} text-white py-2 text-xs font-bold tracking-wider`}>VIEW CLASS</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Assignments Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left py-2 font-medium">Title</th>
                    <th className="text-left font-medium">Class</th>
                    <th className="text-left font-medium">Due</th>
                    <th className="text-left font-medium">Submitted</th>
                    <th className="text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="text-navy">
                  {[
                    ["Algebra Basics Worksheet", "JSS 2B", "May 31", "23/28"],
                    ["Linear Equations Quiz", "JSS 1A", "May 30", "20/24"],
                    ["Midterm Assignment", "JSS 3A", "May 28", "21/26"],
                    ["Statistics Project", "SS 1A", "Jun 2", "18/22"],
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 font-semibold">{r[0]}</td>
                      <td>{r[1]}</td>
                      <td>{r[2]}</td>
                      <td>{r[3]}</td>
                      <td className="text-right"><button className="bg-navy text-gold px-3 py-1 text-xs font-bold">GRADE</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {schedule.map((s, i) => (
                <div key={i} className="flex items-start gap-3 text-sm border-b border-border pb-3 last:border-0">
                  <div className="text-xs text-muted-foreground font-mono w-16 pt-0.5">{s.time}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-navy">{s.title}</div>
                    <div className="text-[11px] text-muted-foreground">{s.room}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 ${
                    s.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                    s.status === "In Progress" ? "bg-gold/30 text-navy" :
                    s.status === "Break" ? "bg-secondary text-muted-foreground" :
                    "bg-violet-100 text-violet-700"
                  }`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1"><CheckCircle2 size={14} />ATTEND.</button>
              <button className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1"><FileEdit size={14} />ASSIGN</button>
              <button className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1"><Award size={14} />GRADES</button>
              <button className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1"><Megaphone size={14} />NOTICE</button>
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Pending Tasks</h3>
            <div className="space-y-2 text-sm">
              {[["Assignments to grade", 5], ["Attendance not marked", 3], ["Quiz to review", 2], ["Reports to submit", 1]].map((t, i) => (
                <div key={i} className="flex justify-between border-b border-border py-2 last:border-0">
                  <span className="text-navy">{t[0]}</span>
                  <span className="font-bold text-accent">{t[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
