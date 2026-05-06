import { Search } from "lucide-react";
import { useState } from "react";

const allStudents = [
  { name: "Ada Okonkwo",    class: "JSS 1A", gender: "F", attendance: 95, avg: 78, grade: "B" },
  { name: "Bola Ade",       class: "JSS 1A", gender: "M", attendance: 90, avg: 82, grade: "A" },
  { name: "Chidi Nwosu",    class: "JSS 1A", gender: "M", attendance: 88, avg: 70, grade: "B" },
  { name: "Ife Adesanya",   class: "JSS 2B", gender: "M", attendance: 92, avg: 88, grade: "A" },
  { name: "Jade Nwosu",     class: "JSS 2B", gender: "F", attendance: 85, avg: 75, grade: "B" },
  { name: "Kola Adeyemi",   class: "JSS 2B", gender: "M", attendance: 94, avg: 91, grade: "A" },
  { name: "Ola Johnson",    class: "JSS 3A", gender: "M", attendance: 87, avg: 72, grade: "B" },
  { name: "Rita Okoro",     class: "JSS 3A", gender: "F", attendance: 96, avg: 85, grade: "A" },
  { name: "Uche Okafor",    class: "SS 1A",  gender: "M", attendance: 93, avg: 81, grade: "A" },
  { name: "Vera Adesanya",  class: "SS 1A",  gender: "F", attendance: 91, avg: 79, grade: "B" },
  { name: "David Okafor",   class: "SS 2B",  gender: "M", attendance: 92, avg: 85, grade: "A" },
  { name: "Grace Okafor",   class: "SS 2B",  gender: "F", attendance: 96, avg: 89, grade: "A" },
];

const classes = ["All", "JSS 1A", "JSS 2B", "JSS 3A", "SS 1A", "SS 2B"];

export default function TeacherStudents() {
  const [search, setSearch] = useState("");
  const [cls, setCls] = useState("All");

  const filtered = allStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClass = cls === "All" || s.class === cls;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Students</h1>
        <p className="text-muted-foreground text-sm">All students across your classes.</p>
      </div>

      <div className="bg-white border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border focus:border-navy focus:outline-none text-sm text-navy bg-white"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => setCls(c)}
              className={`px-3 py-1.5 text-xs font-bold transition ${cls === c ? "bg-navy text-gold" : "border border-navy/20 text-navy hover:border-navy"}`}
            >{c}</button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} students</span>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              {["STUDENT", "CLASS", "GENDER", "ATTENDANCE", "AVG SCORE", "GRADE"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {filtered.map((s, i) => (
              <tr key={i} className="hover:bg-secondary/20 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-navy/10 text-navy flex items-center justify-center text-xs font-bold">
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="font-semibold">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">{s.class}</td>
                <td className="px-5 py-4 text-muted-foreground">{s.gender === "M" ? "Male" : "Female"}</td>
                <td className="px-5 py-4">
                  <span className={`font-bold ${s.attendance >= 90 ? "text-emerald-600" : "text-amber-500"}`}>{s.attendance}%</span>
                </td>
                <td className="px-5 py-4 font-bold">{s.avg}%</td>
                <td className="px-5 py-4">
                  <span className={`font-display text-lg font-black ${s.grade === "A" ? "text-emerald-600" : "text-navy"}`}>{s.grade}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
