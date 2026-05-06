const subjects = [
  { name: "Mathematics", primary: true, secondary: true, teachers: ["Mr. Daniel Marko"], classes: 8 },
  { name: "English Language", primary: true, secondary: true, teachers: ["Mrs. Sarah James"], classes: 9 },
  { name: "Basic Science", primary: true, secondary: false, teachers: ["Mrs. Grace Nwosu"], classes: 4 },
  { name: "Physics", primary: false, secondary: true, teachers: ["Mr. Peter Obi"], classes: 3 },
  { name: "Chemistry", primary: false, secondary: true, teachers: ["Mr. Victor Ade"], classes: 3 },
  { name: "Biology", primary: false, secondary: true, teachers: ["Mr. Kola Adeyemi"], classes: 3 },
  { name: "Computer Science", primary: true, secondary: true, teachers: ["Mrs. Funke Okonkwo"], classes: 6 },
  { name: "Social Studies", primary: true, secondary: false, teachers: ["Mr. Ahmed Bello"], classes: 4 },
];

const classGroups = [
  { section: "PRIMARY", classes: [{ name: "Nursery 1", students: 18 }, { name: "Nursery 2", students: 20 }, { name: "Reception", students: 22 }, { name: "Primary 1", students: 25 }, { name: "Primary 2", students: 27 }, { name: "Primary 3", students: 28 }, { name: "Primary 4", students: 30 }, { name: "Primary 5", students: 31 }, { name: "Primary 6", students: 29 }] },
  { section: "SECONDARY", classes: [{ name: "JSS 1", students: 35 }, { name: "JSS 2", students: 32 }, { name: "JSS 3", students: 30 }, { name: "SS 1", students: 28 }, { name: "SS 2", students: 25 }, { name: "SS 3", students: 22 }] },
];

export default function AdminAcademics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-navy">Academics</h1>
        <p className="text-muted-foreground text-sm">Manage subjects, classes, and academic structure.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {classGroups.map((g) => (
          <div key={g.section} className="bg-white border border-border p-6">
            <div className="eyebrow mb-4 text-xs font-bold tracking-widest text-gold">{g.section}</div>
            <div className="grid grid-cols-2 gap-3">
              {g.classes.map((c) => (
                <div key={c.name} className="border border-navy/10 p-4 hover:border-navy transition">
                  <div className="font-bold text-navy">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.students} students</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Subject Overview</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              {["SUBJECT", "PRIMARY", "SECONDARY", "TEACHER(S)", "CLASSES"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-navy divide-y divide-border">
            {subjects.map((s) => (
              <tr key={s.name} className="hover:bg-secondary/20 transition">
                <td className="px-5 py-4 font-semibold">{s.name}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-bold px-2 py-0.5 ${s.primary ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                    {s.primary ? "YES" : "NO"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-bold px-2 py-0.5 ${s.secondary ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                    {s.secondary ? "YES" : "NO"}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{s.teachers.join(", ")}</td>
                <td className="px-5 py-4 font-bold">{s.classes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
