import { useState } from "react";
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
  Save
} from "lucide-react";
import { toast } from "sonner";

// Master Data (Would come from DB/Store in production)
const INITIAL_SUBJECTS = [
  { id: "S1", name: "Mathematics", primary: true, secondary: true, teachers: ["Mr. Daniel Marko"], classes: 8 },
  { id: "S2", name: "English Language", primary: true, secondary: true, teachers: ["Mrs. Sarah James"], classes: 9 },
  { id: "S3", name: "Basic Science", primary: true, secondary: false, teachers: ["Mrs. Grace Nwosu"], classes: 4 },
  { id: "S4", name: "Physics", primary: false, secondary: true, teachers: ["Mr. Peter Obi"], classes: 3 },
  { id: "S5", name: "Chemistry", primary: false, secondary: true, teachers: ["Mr. Victor Ade"], classes: 3 },
];

const INITIAL_CLASSES = [
  { id: "C1", name: "Nursery 1", section: "PRIMARY", students: 18, subjects: 6, teacher: "Mrs. Ngozi" },
  { id: "C2", name: "JSS 1", section: "SECONDARY", students: 35, subjects: 12, teacher: "Mr. Adams" },
  { id: "C3", name: "SS 1", section: "SECONDARY", students: 28, subjects: 15, teacher: "Mr. Benson" },
];

export default function AdminAcademics() {
  const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "sessions">("classes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header with Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Academic Hub</h1>
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
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-bold transition-all relative ${
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
        <div className="flex items-center gap-3 bg-white border border-border px-4 py-2">
          <Search size={18} className="text-muted-foreground" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            className="flex-1 bg-transparent border-none text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === "classes" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_CLASSES.map((cls) => (
              <div key={cls.id} className="group bg-white border border-border hover:border-navy transition overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-[10px] font-black tracking-widest text-gold mb-1">{cls.section}</div>
                      <h3 className="font-display text-xl font-black text-navy">{cls.name}</h3>
                    </div>
                    <button className="text-muted-foreground hover:text-navy p-1 transition">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-accent" />
                      <div className="text-xs font-bold text-navy">{cls.students} <span className="text-muted-foreground font-normal">Students</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-accent" />
                      <div className="text-xs font-bold text-navy">{cls.subjects} <span className="text-muted-foreground font-normal">Subjects</span></div>
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
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="bg-white border border-border overflow-hidden">
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
                {INITIAL_SUBJECTS.map((sub) => (
                  <tr key={sub.id} className="hover:bg-secondary/10 transition group">
                    <td className="px-6 py-4 font-bold text-navy">{sub.name}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {sub.teachers.join(", ")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`mx-auto w-2 h-2 rounded-full ${sub.primary ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-border"}`} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`mx-auto w-2 h-2 rounded-full ${sub.secondary ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-border"}`} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-muted-foreground hover:text-navy hover:bg-secondary rounded transition"><FileText size={16} /></button>
                        <button className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded transition"><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="max-w-2xl bg-white border border-border p-8 mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-navy/5 text-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings2 size={32} />
            </div>
            <div>
              <h3 className="font-display text-2xl font-black text-navy uppercase tracking-tight">Active Academic Session</h3>
              <p className="text-muted-foreground text-sm mt-1">Configure your school's current calendar year and term periods.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-left mt-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Current Session</label>
                <div className="p-3 border border-border font-bold text-navy flex justify-between items-center">
                  2025/2026 Academic Year
                  <ChevronRight size={14} className="text-gold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Active Term</label>
                <div className="p-3 border border-border font-bold text-navy flex justify-between items-center">
                  Second Term
                  <ChevronRight size={14} className="text-gold" />
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 bg-navy text-gold px-8 py-3 text-xs font-black tracking-widest mx-auto shadow-lg hover:translate-y-[-2px] transition-transform">
              <Save size={16} /> SAVE SETTINGS
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
        {[
          { label: "Total Classes", value: "15", icon: School },
          { label: "Active Subjects", value: "24", icon: BookOpen },
          { label: "Avg Class Size", value: "26.4", icon: Users },
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
