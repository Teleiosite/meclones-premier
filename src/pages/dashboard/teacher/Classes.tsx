import { useNavigate } from "react-router-dom";
import { BookOpen, Users, BarChart3 } from "lucide-react";

const classes = [
  { name: "JSS 1A", subject: "Mathematics", students: 24, attendance: 95, avgScore: 78, nextClass: "Today, 08:00", room: "Room 12", color: "bg-navy" },
  { name: "JSS 2B", subject: "Mathematics", students: 28, attendance: 90, avgScore: 82, nextClass: "Today, 14:00", room: "Room 15", color: "bg-emerald-600" },
  { name: "JSS 3A", subject: "Mathematics", students: 26, attendance: 88, avgScore: 75, nextClass: "Tue, 09:00", room: "Room 9", color: "bg-orange-500" },
  { name: "SS 1A", subject: "Mathematics", students: 22, attendance: 93, avgScore: 81, nextClass: "Today, 13:00", room: "Room 18", color: "bg-teal-600" },
  { name: "SS 2B", subject: "Mathematics", students: 20, attendance: 91, avgScore: 79, nextClass: "Today, 15:00", room: "Room 20", color: "bg-violet-600" },
];

export default function TeacherClasses() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">My Classes</h1>
          <p className="text-muted-foreground text-sm">All classes you are currently teaching this term.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Total Classes</div>
          <div className="font-display text-3xl font-black text-navy mt-1">{classes.length}</div>
        </div>
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Total Students</div>
          <div className="font-display text-3xl font-black text-navy mt-1">{classes.reduce((a, c) => a + c.students, 0)}</div>
        </div>
        <div className="bg-white border border-border p-5">
          <div className="text-xs text-muted-foreground">Avg. Attendance</div>
          <div className="font-display text-3xl font-black text-emerald-600 mt-1">
            {Math.round(classes.reduce((a, c) => a + c.attendance, 0) / classes.length)}%
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {classes.map((c, i) => (
          <div key={i} className="bg-white border border-border overflow-hidden">
            <div className={`${c.color} text-white p-5`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-2xl font-black">{c.name}</span>
                <span className="text-white/70 text-xs font-bold tracking-wider">{c.subject}</span>
              </div>
              <div className="text-white/70 text-sm">{c.students} students · {c.room}</div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Attendance</span>
                  <span className="font-bold text-emerald-600">{c.attendance}%</span>
                </div>
                <div className="h-1.5 bg-secondary">
                  <div className="h-full bg-emerald-500" style={{ width: `${c.attendance}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Avg. Score</span>
                  <span className="font-bold text-navy">{c.avgScore}%</span>
                </div>
                <div className="h-1.5 bg-secondary">
                  <div className={`h-full ${c.color}`} style={{ width: `${c.avgScore}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold text-navy">Next: </span>{c.nextClass}
                </div>
                <button className={`${c.color} text-white text-xs font-bold px-4 py-2 hover:opacity-90 transition`}>
                  VIEW CLASS
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
