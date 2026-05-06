import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const myClasses = ["JSS 1A", "JSS 2B", "JSS 3A", "SS 1A", "SS 2B"];

const classStudents: Record<string, { id: number; name: string; present: boolean }[]> = {
  "JSS 1A": [{ id: 1, name: "Ada Okonkwo", present: true }, { id: 2, name: "Bola Ade", present: true }, { id: 3, name: "Chidi Nwosu", present: false }, { id: 4, name: "Dami Bello", present: true }, { id: 5, name: "Emeka Paul", present: true }, { id: 6, name: "Femi Yusuf", present: false }, { id: 7, name: "Grace Eze", present: true }, { id: 8, name: "Henry Okafor", present: true }],
  "JSS 2B": [{ id: 1, name: "Ife Adesanya", present: true }, { id: 2, name: "Jade Nwosu", present: true }, { id: 3, name: "Kola Adeyemi", present: true }, { id: 4, name: "Lola Obi", present: false }, { id: 5, name: "Musa Bello", present: true }, { id: 6, name: "Nkechi Paul", present: true }],
  "JSS 3A": [{ id: 1, name: "Ola Johnson", present: true }, { id: 2, name: "Pemi Eze", present: true }, { id: 3, name: "Rita Okoro", present: false }, { id: 4, name: "Sola Nwosu", present: true }, { id: 5, name: "Tayo Bello", present: true }],
  "SS 1A": [{ id: 1, name: "Uche Okafor", present: true }, { id: 2, name: "Vera Adesanya", present: true }, { id: 3, name: "Wale Johnson", present: true }, { id: 4, name: "Xena Eze", present: false }],
  "SS 2B": [{ id: 1, name: "Yemi Bello", present: true }, { id: 2, name: "Zara Paul", present: true }, { id: 3, name: "David Okafor", present: true }, { id: 4, name: "Grace Okafor", present: false }],
};

export default function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState(myClasses[0]);
  const [students, setStudents] = useState(classStudents[myClasses[0]]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const toggle = (id: number) => setStudents((prev) => prev.map((s) => s.id === id ? { ...s, present: !s.present } : s));
  const presentCount = students.filter((s) => s.present).length;

  const handleSave = () => toast.success(`Attendance saved for ${selectedClass} — ${presentCount}/${students.length} present.`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Mark Attendance</h1>
        <p className="text-muted-foreground text-sm">Record daily attendance for your classes.</p>
      </div>

      <div className="bg-white border border-border p-6">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {myClasses.map((c) => (
              <button
                key={c}
                onClick={() => { setSelectedClass(c); setStudents(classStudents[c]); }}
                className={`py-2 text-xs font-bold tracking-wider border-2 transition ${selectedClass === c ? "bg-navy text-gold border-navy" : "border-navy/20 text-navy hover:border-navy"}`}
              >{c}</button>
            ))}
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-border px-3 py-2 text-sm focus:border-navy focus:outline-none" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy">{selectedClass} — {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</h3>
          <div className="text-sm">
            <span className="font-bold text-emerald-600">{presentCount}</span>
            <span className="text-muted-foreground"> / {students.length} present</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
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

        <div className="flex gap-3">
          <button onClick={handleSave} className="bg-navy text-gold px-8 py-3 font-bold text-xs tracking-wider hover:bg-navy/90 transition">SAVE ATTENDANCE →</button>
          <button onClick={() => setStudents((prev) => prev.map((s) => ({ ...s, present: true })))} className="border border-navy text-navy px-5 py-3 font-bold text-xs tracking-wider hover:bg-navy hover:text-gold transition">MARK ALL PRESENT</button>
        </div>
      </div>
    </div>
  );
}
