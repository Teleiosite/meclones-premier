import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  LayoutDashboard, BookOpen, FileText, ClipboardCheck, Award,
  Calendar, MessageSquare, FolderOpen, User, Settings,
  Download, Upload, CreditCard, Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const nav = [
  { to: "/dashboard/student", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/dashboard/student/courses", label: "My Courses", icon: <BookOpen size={18} /> },
  { to: "/dashboard/student/assignments", label: "Assignments", icon: <FileText size={18} /> },
  { to: "/dashboard/student/attendance", label: "Attendance", icon: <ClipboardCheck size={18} /> },
  { to: "/dashboard/student/results", label: "Results / Grades", icon: <Award size={18} /> },
  { to: "/dashboard/student/timetable", label: "Timetable", icon: <Calendar size={18} /> },
  { to: "/dashboard/student/messages", label: "Messages", icon: <MessageSquare size={18} /> },
  { to: "/dashboard/student/resources", label: "Resources", icon: <FolderOpen size={18} /> },
  { to: "/dashboard/student/profile", label: "Profile", icon: <User size={18} /> },
  { to: "/dashboard/student/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function StudentLayout() {
  return <DashboardLayout role="Student" userName="David Okafor" userMeta="SS 2 Student" nav={nav} />;
}

  const [studentStats, setStudentStats] = useState({ subjects: "–", attendance: "–", pending: "–", average: "–", upcoming: "–" });
  const [courseList, setCourseList] = useState<any[]>([]);
  const [assignmentList, setAssignmentList] = useState<any[]>([]);
  const [resultList, setResultList] = useState<any[]>([]);
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("Student");
  const [studentClass, setStudentClass] = useState("");

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    async function loadStudentData() {
      if (!user) return;
      setLoading(true);
      try {
        // 1. Get Student Profile
        const { data: student } = await supabase
          .from("students")
          .select("id, class, profiles(full_name)")
          .eq("profile_id", user.id)
          .single();

        if (!student) return;
        setStudentName(student.profiles?.full_name || "Student");
        setStudentClass(student.class || "Unknown Class");

        // 2. Fetch Courses (Unique subjects from timetable for this class)
        const { data: ttData } = await supabase
          .from("timetable")
          .select("subject, teachers(profiles(full_name)), color")
          .eq("class_name", student.class);

        const uniqueSubjects: Record<string, any> = {};
        ttData?.forEach(t => {
          if (!uniqueSubjects[t.subject]) {
            uniqueSubjects[t.subject] = {
              name: t.subject,
              teacher: t.teachers?.profiles?.full_name || "Teacher",
              progress: 70 + Math.floor(Math.random() * 25), // Placeholder progress
              color: t.color || "bg-navy"
            };
          }
        });
        setCourseList(Object.values(uniqueSubjects).slice(0, 5));

        // 3. Fetch Assignments
        const { data: assignData } = await supabase
          .from("assignments")
          .select("title, due_date")
          .eq("class_name", student.class)
          .order("due_date", { ascending: true })
          .limit(3);
        
        setAssignmentList(assignData || []);

        // 4. Fetch Results
        const { data: resData } = await supabase
          .from("results")
          .select("score, exams(title, date)")
          .eq("student_id", student.id)
          .order("created_at", { ascending: false })
          .limit(4);
        
        setResultList(resData?.map(r => ({
          title: r.exams?.title || "Exam",
          date: r.exams?.date || "Recently",
          score: r.score,
          grade: r.score >= 70 ? "A" : r.score >= 60 ? "B" : "C"
        })) || []);

        // 5. Today's Schedule
        const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const todayDay = dayNames[new Date().getDay()];
        const todaySchedule = ttData?.filter(t => t.day === (todayDay as any)) || []; // Simplified check
        
        setScheduleList(todaySchedule.map(t => ({
          time: t.time_slot,
          title: t.subject,
          room: "Room 10", // Placeholder
          status: "Upcoming"
        })));

        // Stats
        setStudentStats({
          subjects: Object.keys(uniqueSubjects).length.toString(),
          attendance: "92%",
          pending: (assignData?.length || 0).toString(),
          average: "84%",
          upcoming: "2"
        });

      } catch (err) {
        console.error("Error loading student dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, [user]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const scores = [40, 55, 65, 60, 70, 85];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Student Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {studentName} 👋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<BookOpen size={22} />} label="Enrolled Subjects" value={studentStats.subjects} hint="This Term" tone="navy" />
        <StatCard icon={<ClipboardCheck size={22} />} label="Attendance Rate" value={studentStats.attendance} hint="This Term" tone="green" />
        <StatCard icon={<FileText size={22} />} label="Pending Assignments" value={studentStats.pending} hint="Needs attention" tone="orange" />
        <StatCard icon={<Star size={22} />} label="Current Average" value={studentStats.average} hint="Good job!" tone="purple" />
        <StatCard icon={<Calendar size={22} />} label="Upcoming Tests" value={studentStats.upcoming} hint="This Week" tone="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Academic Progress</h3>
              <span className="text-xs text-muted-foreground">This Term</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2">
                <svg viewBox="0 0 320 160" className="w-full h-40">
                  {[0, 25, 50, 75, 100].map((y, i) => (
                    <line key={i} x1="30" y1={20 + i * 30} x2="310" y2={20 + i * 30} stroke="#e5e7eb" strokeDasharray="2 4" />
                  ))}
                  <polyline
                    fill="none"
                    stroke="hsl(var(--navy))"
                    strokeWidth="2.5"
                    points={scores.map((v, i) => `${30 + i * 56},${140 - v}`).join(" ")}
                  />
                  {scores.map((v, i) => (
                    <circle key={i} cx={30 + i * 56} cy={140 - v} r="4" fill="hsl(var(--gold))" stroke="hsl(var(--navy))" strokeWidth="2" />
                  ))}
                  {months.map((m, i) => (
                    <text key={i} x={30 + i * 56} y="158" fontSize="9" textAnchor="middle" fill="#6b7280">{m}</text>
                  ))}
                </svg>
              </div>
              <div className="text-center border-l border-border pl-4">
                <div className="text-xs text-muted-foreground">Average Score</div>
                <div className="relative w-24 h-24 mx-auto my-2">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--navy))" strokeWidth="3" strokeDasharray={`${85 * 0.94} 100`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-display text-xl font-black text-navy">85%</div>
                    <div className="text-[10px] text-muted-foreground">Good</div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground">Better than 78% of students</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">My Courses</h3>
              <Link to="/dashboard/student/courses" className="text-xs text-navy font-semibold hover:text-gold">View All</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {courseList.map((c, i) => (
                <div key={i} className="border border-border p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 ${c.color} text-white flex items-center justify-center font-bold text-xs`}>
                    {c.name.split(" ").map((s: string) => s[0]).join("").slice(0, 3)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-navy truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{c.teacher}</div>
                    <div className="mt-1.5 h-1 bg-secondary"><div className={`h-full ${c.color}`} style={{ width: `${c.progress}%` }} /></div>
                  </div>
                  <div className="font-bold text-sm text-navy">{c.progress}%</div>
                </div>
              ))}
              {courseList.length === 0 && !loading && (
                <div className="col-span-full py-6 text-center text-muted-foreground text-xs">No courses found.</div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border border-border p-5">
              <h3 className="font-bold text-navy mb-4">Pending Assignments</h3>
              <div className="space-y-3 text-sm">
                {assignmentList.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-border pb-3 last:border-0">
                    <div className="w-8 h-8 bg-gold/30 text-navy rounded flex items-center justify-center"><FileText size={14} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-navy">{a.title}</div>
                      <div className="text-[11px] text-muted-foreground">Due: {new Date(a.due_date).toLocaleDateString("en-GB")}</div>
                    </div>
                  </div>
                ))}
                {assignmentList.length === 0 && !loading && (
                  <div className="py-6 text-center text-muted-foreground text-xs">No pending assignments.</div>
                )}
              </div>
            </div>
            <div className="bg-white border border-border p-5">
              <h3 className="font-bold text-navy mb-4">Recent Results</h3>
              <div className="space-y-3 text-sm">
                {resultList.map((r, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <div>
                      <div className="font-semibold text-navy">{r.title}</div>
                      <div className="text-[11px] text-muted-foreground">{r.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-navy">{r.score}%</div>
                      <span className="w-7 h-7 bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">{r.grade}</span>
                    </div>
                  </div>
                ))}
                {resultList.length === 0 && !loading && (
                  <div className="py-6 text-center text-muted-foreground text-xs">No recent results.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy">Upcoming Schedule</h3>
              <Link to="/dashboard/student/timetable" className="text-xs text-navy font-semibold hover:text-gold">Timetable</Link>
            </div>
            <div className="text-xs text-muted-foreground mb-3">Today · May 29</div>
            <div className="space-y-3 text-sm">
              {scheduleList.map((s, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-border pb-2 last:border-0">
                  <div className="text-xs font-mono text-muted-foreground w-12">{s.time}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-navy">{s.title}</div>
                    <div className="text-[11px] text-muted-foreground">{s.room}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 ${
                    s.status === "Done" ? "bg-emerald-100 text-emerald-700" :
                    s.status === "Now" ? "bg-gold/30 text-navy" :
                    s.status === "Break" ? "bg-secondary text-muted-foreground" :
                    "bg-violet-100 text-violet-700"
                  }`}>{s.status}</span>
                </div>
              ))}
              {scheduleList.length === 0 && !loading && (
                <div className="py-6 text-center text-muted-foreground text-xs">No classes for today.</div>
              )}
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-3">Announcement</h3>
            <div className="bg-gold/10 border-l-4 border-gold p-3">
              <div className="font-bold text-navy text-sm">Midterm Exam Schedule</div>
              <p className="text-xs text-muted-foreground mt-1">Midterm exams begin June 10. Check the timetable for details.</p>
              <div className="text-[10px] text-muted-foreground mt-2">Admin · May 28</div>
            </div>
          </div>

          <div className="bg-white border border-border p-5">
            <h3 className="font-bold text-navy mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => navigate("/dashboard/student/resources")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1 hover:bg-navy hover:text-gold"><Download size={14} />MATERIALS</button>
              <button onClick={() => navigate("/dashboard/student/assignments")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1 hover:bg-navy hover:text-gold"><Upload size={14} />SUBMIT</button>
              <button onClick={() => navigate("/dashboard/student/results")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1 hover:bg-navy hover:text-gold"><Calendar size={14} />EXAMS</button>
              <button onClick={() => navigate("/fees")} className="border border-navy text-navy py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-1 hover:bg-navy hover:text-gold"><CreditCard size={14} />FEES</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
