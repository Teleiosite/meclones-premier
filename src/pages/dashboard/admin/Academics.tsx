import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Settings2, 
  MoreVertical,
  ChevronRight,
  TrendingUp,
  School,
  FileText,
  Save,
  Trash2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useStore, TEACHERS } from "@/store";
import { supabase } from "@/lib/supabase";

export default function AdminAcademics() {
  const { classes, subjects, setClasses, setSubjects, addClass, removeClass, addSubject, removeSubject } = useStore();
  const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "sessions">("classes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for modals
  const [newClassName, setNewClassName] = useState("");
  const [newClassSection, setNewClassSection] = useState<"PRIMARY" | "SECONDARY">("PRIMARY");
  const [newClassTeacher, setNewClassTeacher] = useState("");

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubPrimary, setNewSubPrimary] = useState(true);
  const [newSubSecondary, setNewSubSecondary] = useState(false);

  useEffect(() => {
    async function loadAcademicData() {
      // 1. Fetch all students to count class sizes
      const { data: studentsData } = await supabase.from("students").select("class");
      
      // 2. Fetch all timetable entries to get subjects and class subject counts
      const { data: timetableData } = await supabase
        .from("timetable")
        .select(`subject, class_name, teachers ( profiles ( full_name ) )`);

      // 3. Process Classes
      const classMap: Record<string, any> = {};
      
      (studentsData || []).forEach((s: any) => {
        if (!s.class) return;
        if (!classMap[s.class]) {
          classMap[s.class] = {
            id: s.class,
            name: s.class,
            section: s.class.includes("Primary") || s.class.includes("Nursery") ? "PRIMARY" : "SECONDARY",
            students: 0,
            teacher: "Pending Assignment",
            subjectsCount: 0,
          };
        }
        classMap[s.class].students += 1;
      });

      // 4. Process Subjects & Class subjects
      const subjectMap: Record<string, any> = {};
      const classSubjects = new Map<string, Set<string>>();

      (timetableData || []).forEach((t: any) => {
        if (!t.subject) return;

        // Populate class specific counts
        if (t.class_name) {
          if (!classMap[t.class_name]) {
            classMap[t.class_name] = {
              id: t.class_name,
              name: t.class_name,
              section: t.class_name.includes("Primary") || t.class_name.includes("Nursery") ? "PRIMARY" : "SECONDARY",
              students: 0,
              teacher: "Pending Assignment",
              subjectsCount: 0,
            };
          }
          if (!classSubjects.has(t.class_name)) classSubjects.set(t.class_name, new Set());
          classSubjects.get(t.class_name)!.add(t.subject);
        }

        // Populate global subjects
        if (!subjectMap[t.subject]) {
          subjectMap[t.subject] = {
            id: t.subject,
            name: t.subject,
            primary: false,
            secondary: false,
            teachers: [],
          };
        }

        const isSec = t.class_name?.includes("SS") || t.class_name?.includes("JSS");
        if (isSec) subjectMap[t.subject].secondary = true;
        else subjectMap[t.subject].primary = true;

        const teacherName = t.teachers?.profiles?.full_name;
        if (teacherName && !subjectMap[t.subject].teachers.includes(teacherName)) {
          subjectMap[t.subject].teachers.push(teacherName);
        }
      });

      // Update classes with subject counts
      Object.keys(classMap).forEach((className) => {
        classMap[className].subjectsCount = classSubjects.get(className)?.size || 0;
      });

      // Only overwrite if we found data, else keep the initialized dummy store
      if (Object.keys(classMap).length > 0) {
        setClasses(Object.values(classMap).sort((a, b) => a.name.localeCompare(b.name)));
      }
      if (Object.keys(subjectMap).length > 0) {
        setSubjects(Object.values(subjectMap).sort((a, b) => a.name.localeCompare(b.name)));
      }
    }
    
    loadAcademicData();
  }, [setClasses, setSubjects]);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassTeacher) {
      toast.error("Please fill all fields");
      return;
    }
    addClass({
      name: newClassName,
      section: newClassSection,
      teacher: newClassTeacher,
      students: 0,
      subjectsCount: 0
    });
    setNewClassName("");
    setShowAddModal(false);
    toast.success(`${newClassName} added successfully`);
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName) {
      toast.error("Please enter a subject name");
      return;
    }
    addSubject({
      name: newSubjectName,
      primary: newSubPrimary,
      secondary: newSubSecondary,
      teachers: []
    });
    setNewSubjectName("");
    setShowAddModal(false);
    toast.success(`${newSubjectName} curriculum created`);
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy uppercase tracking-tight">Academic Hub</h1>
          <p className="text-muted-foreground text-sm">Manage school structure, subjects, and student progression.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => toast.info("Promotion Center: Scheduled for End of Term")}
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

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-px">
        {[
          { id: "classes", label: "Classes", icon: School },
          { id: "subjects", label: "Curriculum", icon: BookOpen },
          { id: "sessions", label: "Sessions & Terms", icon: Settings2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab.id 
                ? "text-navy" 
                : "text-muted-foreground hover:text-navy hover:bg-secondary/10"
            }`}
          >
            <tab.icon size={16} className={activeTab === tab.id ? "text-accent" : ""} />
            {tab.label.toUpperCase()}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
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
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          removeClass(cls.id);
                          toast.error(`${cls.name} removed`);
                        }}
                        className="text-muted-foreground hover:text-rose-600 p-1.5 transition rounded-md hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
                  onClick={() => toast.success(`Opening details for ${cls.name}`)}
                  className="w-full py-3 bg-secondary/30 hover:bg-navy hover:text-gold text-navy text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2 border-t border-border"
                >
                  MANAGE CLASS <ChevronRight size={14} />
                </button>
              </div>
            ))}
            {filteredClasses.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white border border-dashed border-border rounded-lg">
                <School size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground font-medium">No classes found matching "{searchQuery}"</p>
                <button onClick={() => setSearchQuery("")} className="text-accent text-xs font-bold mt-2 hover:underline">Clear Search</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="bg-white border border-border overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  <th className="text-left px-6 py-4">Subject Name</th>
                  <th className="text-left px-6 py-4">Assigned Teachers</th>
                  <th className="text-center px-6 py-4">Primary</th>
                  <th className="text-center px-6 py-4">Secondary</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-secondary/10 transition group">
                    <td className="px-6 py-4 font-bold text-navy">{sub.name}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {sub.teachers.length > 0 ? sub.teachers.join(", ") : "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`mx-auto w-2.5 h-2.5 rounded-full ${sub.primary ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-border"}`} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`mx-auto w-2.5 h-2.5 rounded-full ${sub.secondary ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-border"}`} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-muted-foreground hover:text-navy hover:bg-secondary rounded transition" title="Edit Curriculum"><FileText size={16} /></button>
                        <button 
                          onClick={() => {
                            removeSubject(sub.id);
                            toast.error(`${sub.name} deleted`);
                          }}
                          className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete Subject"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSubjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-muted-foreground font-medium italic">
                      No subjects found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
              onClick={() => toast.success("Academic settings updated")}
              className="flex items-center gap-2 bg-navy text-gold px-8 py-3 text-xs font-black tracking-widest mx-auto shadow-lg hover:translate-y-[-2px] transition-all active:scale-95"
            >
              <Save size={16} /> SAVE SETTINGS
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-navy transition"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="font-display text-2xl font-black text-navy uppercase tracking-tight">
                {activeTab === "classes" ? "New Class" : "New Subject"}
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Lead Teacher</label>
                    <select 
                      className="w-full p-3 border border-border text-sm focus:outline-none focus:border-navy font-bold text-navy"
                      value={newClassTeacher}
                      onChange={(e) => setNewClassTeacher(e.target.value)}
                    >
                      <option value="">Select Teacher</option>
                      {TEACHERS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
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
                      <input 
                        type="checkbox" 
                        checked={newSubPrimary}
                        onChange={(e) => setNewSubPrimary(e.target.checked)}
                        className="w-4 h-4 accent-navy"
                      />
                      <span className="text-xs font-bold text-navy">Primary Section</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newSubSecondary}
                        onChange={(e) => setNewSubSecondary(e.target.checked)}
                        className="w-4 h-4 accent-navy"
                      />
                      <span className="text-xs font-bold text-navy">Secondary Section</span>
                    </label>
                  </div>
                </>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-navy text-gold text-xs font-black tracking-widest hover:bg-navy/90 transition shadow-lg mt-4"
              >
                CONFIRM AND SAVE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Summary Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
        {[
          { label: "Total Classes", value: classes.length.toString(), icon: School },
          { label: "Active Subjects", value: subjects.length.toString(), icon: BookOpen },
          { label: "Avg Class Size", value: (classes.reduce((acc, c) => acc + c.students, 0) / (classes.length || 1)).toFixed(1), icon: Users },
          { label: "Curriculum Score", value: "92%", icon: GraduationCap },
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
    </div>
  );
}
