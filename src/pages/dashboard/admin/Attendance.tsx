import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const classes = ["Primary 3A", "Primary 5A", "JSS 1A", "JSS 2B", "SS 1A", "SS 2B"];

const generateStudents = (cls: string) => [
  { id: 1, name: "David Okafor", present: true },
  { id: 2, name: "Grace Okafor", present: true },
  { id: 3, name: "Amina Yusuf", present: false },
  { id: 4, name: "Emeka Eze", present: true },
  { id: 5, name: "Fatima Bello", present: true },
  { id: 6, name: "Tunde Adesanya", present: false },
  { id: 7, name: "Ngozi Nwosu", present: true },
  { id: 8, name: "Chukwudi Obi", present: true },
];

const summary = [
  { class: "Primary 3A", present: 26, absent: 2, total: 28, rate: 93 },
  { class: "Primary 5A", present: 29, absent: 2, total: 31, rate: 94 },
  { class: "JSS 1A", present: 32, absent: 3, total: 35, rate: 91 },
  { class: "JSS 2B", present: 28, absent: 4, total: 32, rate: 88 },
  { class: "SS 1A", present: 22, absent: 1, total: 23, rate: 96 },
  { class: "SS 2B", present: 20, absent: 2, total: 22, rate: 91 },
];

export default function AdminAttendance() {
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [students, setStudents] = useState(generateStudents(selectedClass));
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const toggle = (id: number) => setStudents((prev) => prev.map((s) => s.id === id ? { ...s, present: !s.present } : s));
  const presentCount = students.filter((s) => s.present).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Attendance</h1>
        <p className="text-muted-foreground text-sm">School-wide attendance tracking across all classes.</p>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {summary.map((s) => (
          <div key={s.class} className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-navy text-sm">{s.class}</span>
              <span className={`text-xs font-bold ${s.rate >= 90 ? "text-emerald-600" : "text-amber-500"}`}>{s.rate}%</span>
            </div>
            <div className="h-1.5 bg-secondary">
              <div className={`h-full ${s.rate >= 90 ? "bg-emerald-500" : "bg-amber-400"}`} style={{ width: `${s.rate}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
              <span>{s.present} present</span><span>{s.absent} absent</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mark Attendance */}
      <div className="bg-white border border-border p-6">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <h3 className="font-bold text-navy text-lg flex-1">Mark Attendance</h3>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none" />
          <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setStudents(generateStudents(e.target.value)); }} className="border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white">
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="text-sm"><span className="font-bold text-emerald-600">{presentCount}</span><span className="text-muted-foreground">/{students.length} present</span></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {students.map((s) => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`flex items-center gap-3 p-3 border text-left transition ${s.present ? "border-emerald-300 bg-emerald-50" : "border-red-200 bg-red-50"}`}
            >
              {s.present ? <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> : <XCircle size={18} className="text-red-400 shrink-0" />}
              <span className={`text-sm font-medium ${s.present ? "text-emerald-800" : "text-red-700"}`}>{s.name}</span>
              <span className={`ml-auto text-[10px] font-bold ${s.present ? "text-emerald-600" : "text-red-500"}`}>{s.present ? "PRESENT" : "ABSENT"}</span>
            </button>
          ))}
        </div>
        <button className="mt-5 bg-navy text-gold px-6 py-3 text-xs font-bold tracking-wider hover:bg-navy/90 transition">SAVE ATTENDANCE →</button>
      </div>
    </div>
  );
}
