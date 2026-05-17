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
  teacher_id: string | null;
  subjectsCount: number;
};

type SubjectItem = {
  id: string;
  name: string;
  primary: boolean;
  secondary: boolean;
  teachers: string[];
};

type TeacherOption = {
  id: string;
  name: string;
};

export default function AdminAcademics() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachersList, setTeachersList] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "sessions">("classes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // Form states
  const [newClassName, setNewClassName] = useState("");
  const [newClassSection, setNewClassSection] = useState<"PRIMARY" | "SECONDARY">("PRIMARY");
  const [newClassTeacher, setNewClassTeacher] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubPrimary, setNewSubPrimary] = useState(true);
  const [newSubSecondary, setNewSubSecondary] = useState(false);

  // Global Settings states
  const [currentSession, setCurrentSession] = useState("2023/2024");
  const [currentTerm, setCurrentTerm] = useState("First Term");

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: classesData } = await supabase
        .from("classes")
        .select(`
          *,
          teachers!classes_teacher_id_fkey ( profiles!teachers_profile_id_fkey ( full_name ) ),
          students ( count )
        `);

      const { data: subjectsData } = await supabase.from("subjects").select("*");
      
      const { data: teachersData } = await supabase.from("teachers").select("id, profiles!teachers_profile_id_fkey ( full_name )");

      const mappedClasses: ClassItem[] = (classesData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        section: c.section || "PRIMARY",
        students: c.students?.[0]?.count || 0,
        teacher: c.teachers?.profiles?.full_name || "Unassigned",
        teacher_id: c.teacher_id || null,
        subjectsCount: 0,
      }));

      const mappedSubjects: SubjectItem[] = (subjectsData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        primary: s.category === "Primary" || s.category === "Both",
        secondary: s.category === "Secondary" || s.category === "Both",
        teachers: [],
      }));
      
      const mappedTeachers: TeacherOption[] = (teachersData || []).map((t: any) => ({
        id: t.id,
        name: t.profiles?.full_name || "Unknown Teacher"
      }));

      setClasses(mappedClasses);
      setSubjects(mappedSubjects);
      setTeachersList(mappedTeachers);
    } catch (err) {
      console.error("Academic Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    const { data } = await supabase.from("school_settings").select("*").eq("id", "current").single();
    if (data) {
      setCurrentSession(data.session);
      setCurrentTerm(data.term);
    }
  };

  useEffect(() => { 
    loadData(); 
    loadSettings();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) { toast.error("Please enter a class name."); return; }
    setSaving(true);
    try {
      const payload = {
        name: newClassName.trim(),
        section: newClassSection,
        teacher_id: newClassTeacher || null,
      };

      const { error } = editingClassId
        ? await supabase.from("classes").update(payload).eq("id", editingClassId)
        : await supabase.from("classes").insert(payload);
        
      if (error) throw error;
      toast.success(editingClassId ? `${newClassName} updated` : `${newClassName} added`);
      
      setNewClassName("");
      setNewClassTeacher("");
      setEditingClassId(null);
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Error saving class");
    } finally {
      setSaving(false);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setEditingClassId(null);
    setNewClassName("");
    setNewClassTeacher("");
    setNewSubjectName("");
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) { toast.error("Please enter a subject name."); return; }
    setSaving(true);
    let category = "Both";
    if (newSubPrimary && !newSubSecondary) category = "Primary";
    if (!newSubPrimary && newSubSecondary) category = "Secondary";
    const { error } = await supabase.from("subjects").insert({ name: newSubjectName.trim(), category });
    if (error) toast.error(error.message);
    else {
      toast.success(`${newSubjectName} created!`);
      setNewSubjectName("");
      setShowAddModal(false);
      loadData();
    }
    setSaving(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const { error } = await supabase.from("school_settings").upsert({
      id: "current",
      session: currentSession,
      term: currentTerm,
      updated_at: new Date().toISOString()
    });
    if (error) toast.error(error.message);
    else toast.success("Academic settings updated globally.");
    setSaving(false);
  };

  const filteredClasses = classes.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSubjects = subjects.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy uppercase tracking-tight">Academic Hub</h1>
          <p className="text-muted-foreground text-sm">Manage school structure, subjects, and student progression.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => {
            setEditingClassId(null);
            setNewClassName("");
            setNewClassTeacher("");
            setShowAddModal(true);
          }} className="flex items-center gap-2 bg-navy text-gold px-4 py-2 text-xs font-bold hover:bg-navy/90 transition shadow-sm">
            <Plus size={16} />
            {activeTab === "classes" ? "ADD NEW CLASS" : activeTab === "subjects" ? "ADD SUBJECT" : "NEW SESSION"}
          </button>
        </div>
      </div>

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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
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
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <GraduationCap size={14} />
                        Teacher: <span className="text-navy font-bold">{cls.teacher}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingClassId(cls.id);
                          setNewClassName(cls.name);
                          setNewClassSection(cls.section as any);
                          setNewClassTeacher(cls.teacher_id || "");
                          setActiveTab("classes");
                          setShowAddModal(true);
                        }}
                        className="text-[10px] font-black text-navy hover:text-gold transition px-2 py-1 bg-secondary/50 rounded-sm"
                      >
                        EDIT
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "subjects" && (
            <div className="bg-white border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 border-b border-border">
                  <tr className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                    <th className="text-left px-6 py-4">Subject Name</th>
                    <th className="text-left px-6 py-4">Category</th>
                    <th className="text-center px-6 py-4">Primary</th>
                    <th className="text-center px-6 py-4">Secondary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-secondary/10 transition">
                      <td className="px-6 py-4 font-bold text-navy">{sub.name}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">Core Curriculum</td>
                      <td className="px-6 py-4 text-center">
                        <div className={`mx-auto w-2.5 h-2.5 rounded-full ${sub.primary ? "bg-emerald-500" : "bg-border"}`} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`mx-auto w-2.5 h-2.5 rounded-full ${sub.secondary ? "bg-emerald-500" : "bg-border"}`} />
                      </td>
                    </tr>
                  ))}
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
                  <input className="w-full p-3 border border-border font-bold text-navy focus:border-navy outline-none" value={currentSession} onChange={(e) => setCurrentSession(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Active Term</label>
                  <select className="w-full p-3 border border-border font-bold text-navy focus:border-navy outline-none bg-white" value={currentTerm} onChange={(e) => setCurrentTerm(e.target.value)}>
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 bg-navy text-gold px-8 py-3 text-xs font-black tracking-widest mx-auto shadow-lg hover:translate-y-[-2px] transition-all active:scale-95 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                SAVE SETTINGS
              </button>
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md p-6 shadow-2xl relative">
            <button type="button" onClick={closeAddModal} className="absolute top-4 right-4 text-muted-foreground hover:text-navy transition"><X size={20} /></button>
            <form onSubmit={activeTab === "classes" ? handleAddClass : handleAddSubject} className="space-y-4">
              {activeTab === "classes" ? (
                <>
                  <div className="mb-4">
                    <h2 className="font-display text-xl font-black text-navy">{editingClassId ? "Edit Class" : "Add New Class"}</h2>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Class Name</label>
                    <input className="w-full p-3 border border-border text-sm focus:outline-none focus:border-navy font-bold text-navy" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Section</label>
                    <select className="w-full p-3 border border-border text-sm focus:outline-none focus:border-navy font-bold text-navy bg-white" value={newClassSection} onChange={(e) => setNewClassSection(e.target.value as any)}>
                      <option value="PRIMARY">PRIMARY</option>
                      <option value="SECONDARY">SECONDARY</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Class Teacher</label>
                    <select className="w-full p-3 border border-border text-sm focus:outline-none focus:border-navy font-bold text-navy bg-white" value={newClassTeacher} onChange={(e) => setNewClassTeacher(e.target.value)}>
                      <option value="">— Unassigned —</option>
                      {teachersList.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Subject Title</label>
                    <input className="w-full p-3 border border-border text-sm focus:outline-none focus:border-navy font-bold text-navy" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newSubPrimary} onChange={(e) => setNewSubPrimary(e.target.checked)} className="w-4 h-4 accent-navy" />
                      <span className="text-xs font-bold text-navy">Primary</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newSubSecondary} onChange={(e) => setNewSubSecondary(e.target.checked)} className="w-4 h-4 accent-navy" />
                      <span className="text-xs font-bold text-navy">Secondary</span>
                    </label>
                  </div>
                </>
              )}
              <button type="submit" disabled={saving} className="w-full py-4 bg-navy text-gold text-xs font-black tracking-widest hover:bg-navy/90 transition shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-60">
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
