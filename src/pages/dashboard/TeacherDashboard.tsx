import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard, BookOpen, Users, FileText,
  Award, Calendar, MessageSquare, BarChart3, Settings,
  CheckCircle2, ClipboardCheck, FileEdit, Megaphone, Clock, TimerReset,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const nav = [
  { to: "/dashboard/teacher", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/dashboard/teacher/clockin-clockout", label: "My Attendance", icon: <TimerReset size={18} /> },
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
  const { profile, user } = useAuth();
  const [meta, setMeta] = useState("Loading...");

  useEffect(() => {
    if (user?.id) {
      supabase.from("teachers").select("subject_specialization").eq("profile_id", user.id).maybeSingle().then(({ data }) => {
        setMeta(data?.subject_specialization ? `${data.subject_specialization} Teacher` : "Teacher");
      });
    }
  }, [user]);

  return <DashboardLayout role="Teacher" userName={profile?.full_name || "Teacher"} userMeta={meta} nav={nav} />;
}

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [teacherStats, setTeacherStats] = useState({ classes: "–", students: "–", attendance: "–", pending: "–" });
  const [classList, setClassList] = useState<any[]>([]);
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("Teacher");
  
  useEffect(() => {
    async function loadTeacherData() {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Get Teacher Profile
        const { data: teacher, error: teacherError } = await supabase
          .from("teachers")
          .select("id, profiles(full_name), subject_specialization")
          .eq("profile_id", user.id)
          .maybeSingle();

        if (teacherError || !teacher) {
           console.error("No teacher record found", teacherError);
           setLoading(false);
           return;
        }
        
        setTeacherName((teacher.profiles as any)?.full_name || "Teacher");

        // 2. Get Classes assigned to this teacher
        const { data: ttData } = await supabase
          .from("timetable")
          .select("class_name, subject, time_slot, room, color")
          .eq("teacher_id", teacher.id);

        const uniqueClasses = Array.from(new Set(ttData?.map(t => t.class_name) || []));
        
        // 3. Fetch Student counts for these classes
        const { data: studentData } = await supabase
          .from("students")
          .select("id, class")
          .in("class", uniqueClasses);

        const classCounts: Record<string, number> = {};
        studentData?.forEach(s => {
          if (s.class) classCounts[s.class] = (classCounts[s.class] || 0) + 1;
        });

        const studentIds = (studentData || []).map((s: any) => s.id).filter(Boolean);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: attendanceRows } = studentIds.length > 0
          ? await supabase
              .from("attendance")
              .select("student_id, status")
              .in("student_id", studentIds)
              .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
          : { data: [] as any[] };

        const studentClassById = Object.fromEntries((studentData || []).map((s: any) => [s.id, s.class]));
        const attendanceByClass: Record<string, { present: number; total: number }> = {};
        attendanceRows?.forEach((a: any) => {
          const className = studentClassById[a.student_id];
          if (!className) return;
          attendanceByClass[className] ??= { present: 0, total: 0 };
          attendanceByClass[className].total += 1;
          if (a.status === "Present") attendanceByClass[className].present += 1;
        });

        const colors = ["bg-navy", "bg-emerald-600", "bg-violet-600", "bg-orange-500", "bg-teal-600"];
        const processedClasses = uniqueClasses.map((name, i) => {
          const attendance = attendanceByClass[name];
          return {
            name,
            subject: ttData?.find(t => t.class_name === name)?.subject || teacher.subject_specialization,
            students: classCounts[name] || 0,
            attendance: attendance?.total ? Math.round((attendance.present / attendance.total) * 100) : 0,
            score: 0,
            color: colors[i % colors.length]
          };
        });
        setClassList(processedClasses);

        // 4. Fetch Today's Schedule
        const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const todayDay = dayNames[new Date().getDay()];
        const todaySchedule = ttData?.filter(t => t.day === todayDay)
          .sort((a, b) => a.time_slot.localeCompare(b.time_slot))
          .map(t => ({
            time: t.time_slot,
            title: `${t.class_name} - ${t.subject}`,
            room: t.room || "Classroom",
            status: "Upcoming" // Could compare with current time
          })) || [];
        setScheduleList(todaySchedule);

        // 5. Fetch today's clock-in state from persisted table
        const today = new Date().toISOString().split("T")[0];
        const { data: todayClock } = await supabase
          .from("teacher_clockin")
          .select("id, clock_in, clock_out")
          .eq("teacher_id", teacher.id)
          .eq("date", today)
          .maybeSingle();

        setIsClockedIn(!!todayClock?.clock_in && !todayClock?.clock_out);

        // 6. Fetch Assignments
        const { data: assignData } = await supabase
          .from("assignments")
          .select("title, class_name, due_date")
          .eq("teacher_id", teacher.id)
          .order("due_date", { ascending: true })
          .limit(4);
        
        setAssignments(assignData || []);

        const totalAttendance = Object.values(attendanceByClass).reduce((acc, item) => ({
          present: acc.present + item.present,
          total: acc.total + item.total,
        }), { present: 0, total: 0 });

        // Stats
        setTeacherStats({
          classes: uniqueClasses.length.toString(),
          students: (studentData?.length || 0).toString(),
          attendance: totalAttendance.total ? `${Math.round((totalAttendance.present / totalAttendance.total) * 100)}%` : "–",
          pending: "–"
        });

      } catch (err) {
        console.error("Error loading teacher dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTeacherData();
  }, [user]);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Teacher Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {teacherName} 👋</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-bold tracking-wider">STATUS</div>
            <div className={`text-sm font-bold ${isClockedIn ? "text-emerald-600" : "text-amber-600"}`}>
              {isClockedIn ? "Clocked In" : "Clocked Out"}
            </div>
          </div>
          <button 
            onClick={() => navigate("/dashboard/teacher/clockin-clockout")}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider transition ${
              isClockedIn 
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <Clock size={16} />
            {isClockedIn ? "CLOCK OUT" : "CLOCK IN"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen size={22} />} label="Total Classes" value={teacherStats.classes} tone="navy" />
        <StatCard icon={<Users size={22} />} label="Total Students" value={teacherStats.students} tone="green" />
        <StatCard icon={<ClipboardCheck size={22} />} label="Attendance Rate" value={teacherStats.attendance} tone="gold" />
        <StatCard icon={<FileText size={22} />} label="Pending Reviews" value={teacherStats.pending} tone="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">My Classes</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {classList.map((c, i) => (
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
                    <div className="flex justify-between mt-2"><span className="text-muted-foreground">Avg. Score</span><span className="font-bold text-navy">{c.score ? `${c.score}%` : "—"}</span></div>
                  </div>
                  <button onClick={() => navigate("/dashboard/teacher/classes")} className={`w-full mt-3 ${c.color} text-white py-2 text-xs font-bold tracking-wider hover:opacity-90`}>VIEW CLASS</button>
                </div>
              ))}
              {classList.length === 0 && !loading && (
                <div className="col-span-full py-10 text-center text-muted-foreground text-sm border border-dashed border-border">
                  No classes assigned yet.
                </div>
              )}
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
                  {assignments.map((a, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 font-semibold">{a.title}</td>
                      <td>{a.class_name}</td>
                      <td>{new Date(a.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                      <td>–</td>
                      <td className="text-right"><button onClick={() => navigate("/dashboard/teacher/assignments")} className="bg-navy text-gold px-3 py-1 text-xs font-bold hover:bg-navy/90">GRADE</button></td>
                    </tr>
                  ))}
                  {assignments.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">No active assignments.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {scheduleList.map((s, i) => (
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
              {scheduleList.length === 0 && !loading && (
                <div className="py-6 text-center text-muted-foreground text-xs">No classes scheduled for today.</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate("/dashboard/teacher/attendance")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1 hover:bg-navy hover:text-gold"><CheckCircle2 size={14} />ATTEND.</button>
              <button onClick={() => navigate("/dashboard/teacher/assignments")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1 hover:bg-navy hover:text-gold"><FileEdit size={14} />ASSIGN</button>
              <button onClick={() => navigate("/dashboard/teacher/exams")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1 hover:bg-navy hover:text-gold"><Award size={14} />GRADES</button>
              <button onClick={() => navigate("/dashboard/teacher/messages")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1 hover:bg-navy hover:text-gold"><Megaphone size={14} />NOTICE</button>
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-4">Pending Tasks</h3>
            <div className="space-y-2 text-sm">
              {[["Assignments to grade", teacherStats.pending], ["Attendance rate", teacherStats.attendance], ["Classes assigned", teacherStats.classes], ["Students assigned", teacherStats.students]].map((t, i) => (
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
