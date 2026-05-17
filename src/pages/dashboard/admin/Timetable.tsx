import { useState, useEffect, useCallback } from "react";
import { X, Check, BookOpen, User, MapPin, Loader2, Save, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const COLORS = ["bg-navy", "bg-emerald-600", "bg-violet-600", "bg-orange-500", "bg-teal-600", "bg-indigo-600", "bg-rose-500", "bg-slate-500"];

type EditingSlot = { time: string; day: string };
type Form = { subject: string; teacher_id: string; room: string; color: string; display_time: string };
type SlotMap = Record<string, Record<string, any | null>>;
type TeacherOption = { id: string; name: string; subject: string };

const emptyForm: Form = { subject: "", teacher_id: "", room: "", color: "bg-navy", display_time: "" };

export default function AdminTimetable() {
  const [classList, setClassList] = useState<string[]>([]);
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [schedule, setSchedule] = useState<SlotMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // 1. Initial Load
  useEffect(() => {
    const init = async () => {
      const { data: tData } = await supabase.from("teachers").select("profile_id, subject_specialization, profiles ( full_name )");
      setTeachers((tData || []).map((t: any) => ({
        id: t.profile_id,
        name: t.profiles?.full_name ?? "Unknown",
        subject: t.subject_specialization ?? "",
      })));

      const { data: cData } = await supabase.from("classes").select("name").order("name");
      const names = (cData || []).map(c => c.name);
      setClassList(names);
      if (names.length > 0) setSelectedClass(names[0]);

      const { data: sData } = await supabase.from("subjects").select("name").order("name");
      setSubjectList((sData || []).map(s => s.name));
    };
    init();
  }, []);

  // 2. Load Timetable
  const loadTimetable = useCallback(async (className: string) => {
    if (!className) return;
    setLoading(true);
    const grid: SlotMap = {};
    for (const t of TIMES) {
      grid[t] = {};
      for (const d of DAYS) grid[t][d] = null;
    }

    const { data, error } = await supabase.from("timetable").select("*").eq("class_name", className);
    if (error) { toast.error("Failed to load timetable."); setLoading(false); return; }

    (data || []).forEach(row => {
      if (grid[row.time_slot]) {
        grid[row.time_slot][row.day] = row;
      }
    });

    setSchedule(grid);
    setLoading(false);
  }, []);

  useEffect(() => { loadTimetable(selectedClass); }, [selectedClass, loadTimetable]);

  // 3. Handlers
  const openEdit = (time: string, day: string) => {
    const slot = schedule[time]?.[day];
    setEditingSlot({ time, day });
    setForm(slot ? {
      subject: slot.subject || "",
      teacher_id: slot.teacher_id || "",
      room: slot.room || "",
      color: slot.color || "bg-navy",
      display_time: slot.display_time || time // Fallback to bucket time
    } : { ...emptyForm, display_time: time });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    setSaving(true);

    const existingSlot = schedule[editingSlot.time]?.[editingSlot.day];
    const dbId = existingSlot?.id;

    if (!form.subject.trim()) {
      if (dbId) await supabase.from("timetable").delete().eq("id", dbId);
      toast.success("Slot cleared.");
    } else {
      const payload = {
        class_name: selectedClass,
        time_slot: editingSlot.time,
        day: editingSlot.day,
        subject: form.subject,
        teacher_id: form.teacher_id || null,
        room: form.room || "TBD",
        color: form.color,
        display_time: form.display_time
      };

      const { error } = dbId 
        ? await supabase.from("timetable").update(payload).eq("id", dbId)
        : await supabase.from("timetable").insert(payload);

      if (error) { toast.error(error.message); setSaving(false); return; }
      toast.success("Slot saved successfully.");
    }

    setEditingSlot(null);
    setSaving(false);
    loadTimetable(selectedClass);
  };

  // 4. Drag & Drop Logic
  const onDragStart = (e: React.DragEvent, slot: any) => {
    if (!slot) return;
    setDraggingId(slot.id);
    e.dataTransfer.setData("slot_id", slot.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e: React.DragEvent, targetTime: string, targetDay: string) => {
    e.preventDefault();
    const slotId = e.dataTransfer.getData("slot_id");
    if (!slotId) return;

    // Don't drop on the same spot
    const currentSlot = schedule[targetTime]?.[targetDay];
    if (currentSlot && currentSlot.id === slotId) return;

    // Update in Supabase
    const { error } = await supabase
      .from("timetable")
      .update({ time_slot: targetTime, day: targetDay })
      .eq("id", slotId);

    if (error) {
      toast.error("Could not move slot. It might conflict with another entry.");
    } else {
      toast.success("Schedule updated.");
      loadTimetable(selectedClass);
    }
    setDraggingId(null);
  };

  const formatCurrency = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy uppercase tracking-tight">Timetable Manager</h1>
          <p className="text-muted-foreground text-sm">Drag and drop slots to reschedule. Click to edit details.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="border border-border px-4 py-2.5 bg-white text-navy font-bold text-sm focus:border-navy outline-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">— Select Class —</option>
            {classList.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-border h-64 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-white border border-border overflow-x-auto shadow-sm">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                <th className="px-4 py-4 text-left text-[10px] font-black tracking-widest text-muted-foreground w-24">TIME</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-3 py-4 text-center text-xs font-black tracking-widest text-navy">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TIMES.map((t) => (
                <tr key={t} className="group transition-colors">
                  <td className="px-4 py-6 font-mono text-[10px] text-muted-foreground font-black bg-secondary/10">{t}</td>
                  {DAYS.map((d) => {
                    const slot = schedule[t]?.[d];
                    const isLunch = slot?.subject?.toLowerCase().includes("lunch") || slot?.subject?.toLowerCase().includes("break");
                    
                    return (
                      <td 
                        key={d} 
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, t, d)}
                        className={`p-1.5 border-l border-border/50 relative min-h-[80px] w-[18%] ${draggingId ? "bg-accent/5" : ""}`}
                      >
                        {slot ? (
                          <div 
                            draggable 
                            onDragStart={(e) => onDragStart(e, slot)}
                            onClick={() => openEdit(t, d)}
                            className={`${slot.color || 'bg-navy'} text-white p-3 shadow-md cursor-grab active:cursor-grabbing hover:brightness-110 transition-all relative group h-full flex flex-col justify-between`}
                          >
                            <GripVertical size={12} className="absolute right-2 top-2 opacity-30" />
                            <div>
                              <div className="text-[10px] font-black tracking-widest opacity-70 mb-1 uppercase">
                                {slot.display_time || t}
                              </div>
                              <div className="text-xs font-black leading-tight uppercase">{slot.subject}</div>
                            </div>
                            <div className="mt-3 space-y-0.5">
                              <div className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                                <User size={10} /> {teachers.find(tr => tr.id === slot.teacher_id)?.name || "—"}
                              </div>
                              <div className="text-[10px] font-bold opacity-60 flex items-center gap-1">
                                <MapPin size={10} /> {slot.room || "TBD"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => openEdit(t, d)}
                            className="h-full min-h-[70px] border-2 border-dashed border-border/40 hover:border-navy/40 flex items-center justify-center text-muted-foreground/20 text-2xl font-light transition-colors cursor-pointer"
                          >
                            +
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-navy text-gold px-6 py-4 flex items-center justify-between border-b border-gold/20">
              <div>
                <h3 className="font-display text-lg font-black uppercase tracking-tight">{editingSlot.day} · Schedule</h3>
                <p className="text-white/60 text-[10px] font-bold tracking-widest">{selectedClass}</p>
              </div>
              <button type="button" onClick={() => setEditingSlot(null)} className="text-white/60 hover:text-white transition"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Time Label</label>
                  <input 
                    placeholder="e.g. 10:20 - 11:30" 
                    value={form.display_time}
                    onChange={(e) => setForm({ ...form, display_time: e.target.value })}
                    className="w-full border border-border px-3 py-2 text-sm text-navy focus:border-navy outline-none font-bold" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Room</label>
                  <input 
                    placeholder="e.g. Lab 1" 
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="w-full border border-border px-3 py-2 text-sm text-navy focus:border-navy outline-none font-bold" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Subject</label>
                <select 
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm text-navy bg-white focus:border-navy outline-none font-bold"
                >
                  <option value="">— Select Subject —</option>
                  <option value="LUNCH BREAK">🍱 LUNCH BREAK</option>
                  <option value="SHORT BREAK">☕ SHORT BREAK</option>
                  {subjectList.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest">Assign Teacher</label>
                <select 
                  value={form.teacher_id} 
                  onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                  className="w-full border border-border px-3 py-2 text-sm text-navy bg-white focus:border-navy outline-none font-bold"
                >
                  <option value="">— Select Teacher —</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-navy/60 uppercase tracking-widest block">Color Code</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button 
                      key={color} 
                      type="button" 
                      onClick={() => setForm({ ...form, color })}
                      className={`w-8 h-8 flex items-center justify-center ${color} hover:brightness-110 transition ${form.color === color ? "ring-2 ring-navy ring-offset-2 scale-110" : "opacity-60"}`}
                    >
                      {form.color === color && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-navy text-gold py-3 font-black text-xs tracking-widest hover:bg-navy/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  SAVE CHANGES
                </button>
                <button 
                  type="button" 
                  onClick={async () => {
                    const slot = schedule[editingSlot.time]?.[editingSlot.day];
                    if (slot?.id) {
                      await supabase.from("timetable").delete().eq("id", slot.id);
                      toast.success("Slot cleared.");
                      setEditingSlot(null);
                      loadTimetable(selectedClass);
                    }
                  }}
                  className="px-6 py-3 border border-red-200 text-red-600 font-black text-xs tracking-widest hover:bg-red-50 transition"
                >
                  CLEAR
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
