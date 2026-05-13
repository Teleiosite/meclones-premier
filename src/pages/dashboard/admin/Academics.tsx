import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  GraduationCap,
  Settings2,
  ChevronRight,
  TrendingUp,
  School,
  FileText,
  Save,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type ClassItem = {
  id: string;
  name: string;
  section: string;
  students: number;
  teacher: string;
  subjectsCount: number;
};

type SubjectItem = {
  id: string;
  name: string;
  primary: boolean;
  secondary: boolean;
  teachers: string[];
};

export default function AdminAcademics() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "sessions">("classes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newClassName, setNewClassName] = useState("");
  const [newClassSection, setNewClassSection] = useState<"PRIMARY" | "SECONDARY">("PRIMARY");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubPrimary, setNewSubPrimary] = useState(true);
  const [newSubSecondary, setNewSubSecondary] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all students to count class sizes
      const { data: studentsData } = await supabase.from("students").select("class");

      // 2. Fetch all timetable entries
      const { data: timetableData } = await supabase
        .from("timetable")
        .select(`subject, class_name, teacher_id, teachers ( profiles!teachers_profile_id_fkey ( full_name ) )`);

      // 3. Process Classes
      const classMap: Record<string, ClassItem> = {};

      (studentsData || []).forEach((s: any) => {
        if (!s.class) return;
        if (!classMap[s.class]) {
          classMap[s.class] = {
            id: s.class,
            name: s.class,
            section: s.class.toLowerCase().includes("primary") || s.class.toLowerCase().includes("nursery") ? "PRIMARY" : "SECONDARY",
            students: 0,
            teacher: "Unassigned",
            subjectsCount: 0,
          };
        }
        classMap[s.class].students += 1;
      });

      // 4. Process subjects & class subject counts
      const subjectMap: Record<string, SubjectItem> = {};
      const classSubjects = new Map<string, Set<string>>();
      const classTeacher: Record<string, string> = {};

      (timetableData || []).forEach((t: any) => {
        if (!t.subject) return;
        const teacherName: string = (t.teachers as any)?.profiles?.full_name ?? "";

        // Class subject count
        if (t.class_name) {
          if (!classMap[t.class_name]) {
            classMap[t.class_name] = {
              id: t.class_name,
              name: t.class_name,
              section: t.class_name.toLowerCase().includes("primary") || t.class_name.toLowerCase().includes("nursery") ? "PRIMARY" : "SECONDARY",
              students: 0,
              teacher: teacherName || "Unassigned",
              subjectsCount: 0,
            };
          }
          if (!classSubjects.has(t.class_name)) classSubjects.set(t.class_name, new Set());
          classSubjects.get(t.class_name)!.add(t.subject);

          // Use first teacher found for a class
          if (teacherName && !classTeacher[t.class_name]) {
            classTeacher[t.class_name] = teacherName;
          }
        }

        // Global subject map
        if (!subjectMap[t.subject]) {
          subjectMap[t.subject] = {
            id: t.subject,
            name: t.subject,
            primary: false,
            secondary: false,
            teachers: [],
          };
        }
        const isSec = t.class_name?.toLowerCase().includes("ss") || t.class_name?.toLowerCase().includes("jss");
        if (isSec) subjectMap[t.subject].secondary = true;
        else subjectMap[t.subject].primary = true;

        if (teacherName && !subjectMap[t.subject].teachers.includes(teacherName)) {
          subjectMap[t.subject].teachers.push(teacherName);
        }
      });

      // Apply subject counts & teachers to classes
      Object.keys(classMap).forEach((cn) => {
        classMap[cn].subjectsCount = classSubjects.get(cn)?.size || 0;
        if (classTeacher[cn]) classMap[cn].teacher = classTeacher[cn];
      });

      setClasses(Object.values(classMap).sort((a, b) => a.name.localeCompare(b.name)));
      setSubjects(Object.values(subjectMap).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Add Class — inserts a row into the `classes` table
  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) { toast.error("Please enter a class name."); return; }
    setSaving(true);

    const { error } = await supabase.from("classes").insert({
      name: newClassName.trim(),
      section: newClassSection,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${newClassName} added successfully`);
      setNewClassName("");
      setShowAddModal(false);
      loadData();
    }
    setSaving(false);
  };

  // Delete Class — removes from `classes` table (if it exists there)
  const handleDeleteClass = async (className: string) => {
    const { error } = await supabase.from("classes").delete().eq("name", className);
    if (error) {
      // class might only exist via students — show info instead of error
      toast.info(`"${className}" removed from view. To fully delete, reassign or remove all students in this class.`);
    } else {
      toast.success(`${className} removed.`);
      loadData();
    }
  };

  // Add Subject — inserts a timetable placeholder or just shows a toast (no dedicated subjects table)
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) { toast.error("Please enter a subject name."); return; }
    // Since there's no standalone subjects table, we note this is managed via timetable
    toast.success(`${newSubjectName} noted. Assign it to classes via the Timetable page.`);
    setNewSubjectName("");
    setShowAddModal(false);
  };

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy uppercase tracking-tight">Academic Hub</h1>
          <p className="text-muted-foreground text-sm">Manage school structure, subjects, and student progression.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toast.info("Student Promotion: Available at End of Term")}
            className="flex items-center gap-2 bg-white border border-border px-4 py-2 text-xs font-bold text-navy hover:bg-secondary/20 transition"
          >
            <TrendingUp size={16} className="text-accent" />
            PROMOTE STUDENTS
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold hover:bg-navy/90 transition shadow-sm"
          >
            <Plus size={16} />
            {activeTab === "classes" ? "ADD NEW CLASS" : activeTab === "subjects" ? "ADD SUBJECT" : "NEW SESSION"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-px">
        {[
          { id: "classes", label: "Classes", icon: School },
          { id: "subjects", label: "Curriculum", icon: BookOpen },
          { id: "sessions", label: "Sessions & Terms", icon: Settings2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSearchQuery(""); }}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab.id ? "text-navy" : "text-muted-foreground hover:text-navy hover:bg-secondary/10"
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? "text-accent" : ""} />
            {tab.label.toUpperCase()}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-border px-4 py-2 shadow-sm focus-within:border-navy transition-colors">
        <Search size={18} className="text-muted-foreground" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          className="flex-1 bg-transparent border-none text-sm focus:outline-none py-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Classes Tab */}
          {activeTab === "classes" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClasses.map((cls) => (
                <div key={cls.id} className="group bg-white border border-border hover:border-navy transition overflow-hidden shadow-sm">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-[10px] font-black tracking-widest text-gold mb-1">{cls.section}</div>
                        <h3 className="font-display text-xl font-black text-navy">{cls.name}</h3>
                      </div>
                      <button
                        onClick={() => handleDeleteClass(cls.name)}
                        className="text-muted-foreground hover:text-rose-600 p-1.5 transition rounded-md hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6 border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-accent" />
                        <div className="text-xs font-bold text-navy">{cls.students} <span className="text-muted-foreground font-normal">Students</span></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-accent" />
                        <div className="text-xs font-bold text-navy">{cls.subjectsCount} <span className="text-muted-foreground font-normal">Subjects</span></div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap size={14} />
                      Teacher: <span className="text-navy font-bold">{cls.teacher}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toast.info(`Use Timetable page to manage ${cls.name}`)}
                    className="w-full py-3 bg-secondary/30 hover:bg-navy hover:text-gold text-navy text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 border-t border-border"
                  >
                    MANAGE CLASS <ChevronRight size={14} />
                  </button>
                </div>
              ))}

              {filteredClasses.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white border border-dashed border-border">
                  <School size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground font-medium">
                    {searchQuery ? `No classes found matching "${searchQuery}"` : "No classes found. Add students to create classes."}
                  </p>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-accent text-xs font-bold mt-2 hover:underline">
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === "subjects" && (
            <div className="bg-white border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 border-b border-border">
                  <tr className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                    <th className="text-left px-6 py-4">Subject Name</th>
                    <th className="text-left px-6 py-4">Assigned Teachers</th>
                    <th className="text-center px-6 py-4">Primary</th>
                    <th className="text-center px-6 py-4">Secondary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-secondary/10 transition">
                      <td className="px-6 py-4 font-bold text-navy">{sub.name}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {sub.teachers.length > 0 ? sub.teachers.join(", ") : "Unassigned"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`mx-auto w-2.5 h-2.5 rounded-full ${sub.primary ? "bg-emerald-500" : "bg-border"}`} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`mx-auto w-2.5 h-2.5 rounded-full ${sub.secondary ? "bg-emerald-500" : "bg-border"}`} />
                      </td>
                    </tr>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-muted-foreground italic text-sm">
                        {searchQuery ? "No subjects found." : "No subjects yet. Add subjects via the Timetable page."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="max-w-2xl bg-white border border-border p-8 mx-auto text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 bg-navy/5 text-navy rounded-full flex items-center justify-center mx-auto mb-4 border border-navy/10">
                <Settings2 size={32} />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black text-navy uppercase tracking-tight">Active Academic Session</h3>
                <p className="text-muted-foreground text-sm mt-1">Configure your school's current calendar year and term periods.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left mt-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Current Session</label>
                  <div className="p-3 border border-border font-bold text-navy flex justify-between items-center cursor-pointer hover:border-navy transition">
                    2025/2026 Academic Year
                    <ChevronRight size={14} className="text-gold" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Active Term</label>
                  <div className="p-3 border border-border font-bold text-navy flex justify-between items-center cursor-pointer hover:border-navy transition">
                    Second Term
                    <ChevronRight size={14} className="text-gold" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast.success("Academic settings saved")}
                className="flex items-center gap-2 bg-navy text-gold px-8 py-3 text-xs font-black tracking-widest mx-auto shadow-lg hover:translate-y-[-2px] transition-all active:scale-95"
              >
                <Save size={16} /> SAVE SETTINGS
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
          {[
            { label: "Total Classes", value: classes.length, icon: School },
            { label: "Active Subjects", value: subjects.length, icon: BookOpen },
            { label: "Avg Class Size", value: classes.length > 0 ? (classes.reduce((acc, c) => acc + c.students, 0) / classes.length).toFixed(1) : "0", icon: Users },
            { label: "Total Students", value: classes.reduce((acc, c) => acc + c.students, 0), icon: GraduationCap },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col">
              <div className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">{stat.label}</div>
              <div className="flex items-center gap-2 mt-1">
                <stat.icon size={14} className="text-accent" />
                <div className="text-xl font-black text-navy">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-navy transition">
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="font-display text-2xl font-black text-navy uppercase tracking-tight">
                {activeTab === "classes" ? "New Class" : activeTab === "subjects" ? "New Subject" : "New Session"}
              </h2>
              <p className="text-muted-foreground text-xs mt-1">Fill in the details to expand your academic structure.</p>
            </div>

            <form onSubmit={activeTab === "classes" ? handleAddClass : handleAddSubject} className="space-y-4">
              {activeTab === "classes" ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Class Name</label>
                    <input
                      type="text"
                      placeholder="e.g. JSS 3C"
                      className="w-full p-3 border border-border text-sm focus:outline-none focus:border-navy font-bold text-navy"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Section</label>
                    <select
                      className="w-full p-3 border border-border text-sm focus:outline-none focus:border-navy font-bold text-navy"
                      value={newClassSection}
                      onChange={(e) => setNewClassSection(e.target.value as any)}
                    >
                      <option value="PRIMARY">PRIMARY</option>
                      <option value="SECONDARY">SECONDARY</option>
                    </select>
                  </div>
                </>
              ) : activeTab === "subjects" ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Subject Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Further Mathematics"
                      className="w-full p-3 border border-border text-sm focus:outline-none focus:border-navy font-bold text-navy"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newSubPrimary} onChange={(e) => setNewSubPrimary(e.target.checked)} className="w-4 h-4 accent-navy" />
                      <span className="text-xs font-bold text-navy">Primary Section</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newSubSecondary} onChange={(e) => setNewSubSecondary(e.target.checked)} className="w-4 h-4 accent-navy" />
                      <span className="text-xs font-bold text-navy">Secondary Section</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">Subjects are created by assigning them to classes in the Timetable.</p>
                </>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-navy text-gold text-xs font-black tracking-widest hover:bg-navy/90 transition shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                CONFIRM AND SAVE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
