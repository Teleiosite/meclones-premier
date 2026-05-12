import { useState, useEffect, useCallback } from "react";
import { CLASSES, SUBJECTS, SlotData } from "@/store";
import { X, Check, BookOpen, User, MapPin, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const COLORS = ["bg-navy", "bg-emerald-600", "bg-violet-600", "bg-orange-500", "bg-teal-600", "bg-indigo-600", "bg-rose-500"];

type EditingSlot = { time: string; day: string };
type Form = { subject: string; teacher_id: string; room: string; color: string };
type SlotMap = Record<string, Record<string, SlotData & { db_id?: string; teacher_id?: string } | null>>;
type TeacherOption = { id: string; name: string; subject: string };

const emptyForm: Form = { subject: "", teacher_id: "", room: "", color: "bg-navy" };

export default function AdminTimetable() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[8]); // JSS 1A default
  const [schedule, setSchedule] = useState<SlotMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  // Load teachers from Supabase (replaces hardcoded TEACHERS array)
  useEffect(() => {
    supabase
      .from("teachers")
      .select("id, subject_specialization, profiles!teachers_profile_id_fkey ( full_name )")
      .then(({ data }) => {
        setTeachers(
          (data || []).map((t: any) => ({
            id: t.id,
            name: t.profiles?.full_name ?? "Unknown",
            subject: t.subject_specialization ?? "",
          }))
        );
      });
  }, []);

  // Load timetable for selected class from Supabase
  const loadTimetable = useCallback(async (className: string) => {
    setLoading(true);

    // Build an empty slot grid
    const grid: SlotMap = {};
    for (const t of TIMES) {
      grid[t] = {};
      for (const d of DAYS) grid[t][d] = null;
    }

    const { data, error } = await supabase
      .from("timetable")
      .select("id, time_slot, day, subject, room, color, teacher_id, teachers ( profiles ( full_name ) )")
      .eq("class_name", className);

    if (error) { toast.error("Failed to load timetable."); setLoading(false); return; }

    for (const row of (data || [])) {
      if (grid[row.time_slot] !== undefined) {
        const teacherName = (row as any).teachers?.profiles?.full_name ?? "—";
        grid[row.time_slot][row.day] = {
          subject: row.subject,
          teacher: teacherName,
          teacher_id: row.teacher_id,
          room: row.room ?? "TBD",
          color: row.color ?? "bg-navy",
          db_id: row.id,
        };
      }
    }

    setSchedule(grid);
    setLoading(false);
  }, []);

  useEffect(() => { loadTimetable(selectedClass); }, [selectedClass, loadTimetable]);

  const openEdit = (time: string, day: string) => {
    if (time === "12:00") return;
    const slot = schedule[time]?.[day];
    setEditingSlot({ time, day });
    setForm(
      slot
        ? { subject: slot.subject ?? "", teacher_id: (slot as any).teacher_id ?? "", room: slot.room ?? "", color: slot.color ?? "bg-navy" }
        : emptyForm
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;
    setSaving(true);

    const existingSlot = schedule[editingSlot.time]?.[editingSlot.day];
    const dbId = (existingSlot as any)?.db_id;

    if (!form.subject.trim()) {
      // Clear the slot
      if (dbId) {
        const { error } = await supabase.from("timetable").delete().eq("id", dbId);
        if (error) { toast.error(error.message); setSaving(false); return; }
      }
      toast.success("Slot cleared.");
    } else {
      if (!form.teacher_id) { toast.error("Please select a teacher."); setSaving(false); return; }

      const payload = {
        class_name: selectedClass,
        time_slot: editingSlot.time,
        day: editingSlot.day,
        subject: form.subject,
        teacher_id: form.teacher_id,
        room: form.room || "TBD",
        color: form.color,
      };

      const { error } = dbId
        ? await supabase.from("timetable").update(payload).eq("id", dbId)
        : await supabase.from("timetable").insert(payload);

      if (error) { toast.error(error.message); setSaving(false); return; }

      const teacherName = teachers.find((t) => t.id === form.teacher_id)?.name ?? form.teacher_id;
      toast.success(`Saved: ${form.subject} → ${teacherName} (${editingSlot.day} ${editingSlot.time})`);
    }

    setEditingSlot(null);
    setSaving(false);
    loadTimetable(selectedClass); // Reload from DB to confirm
  };

  const handleClear = async () => {
    if (!editingSlot) return;
    const existingSlot = schedule[editingSlot.time]?.[editingSlot.day];
    const dbId = (existingSlot as any)?.db_id;
    if (dbId) {
      const { error } = await supabase.from("timetable").delete().eq("id", dbId);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Slot cleared.");
    setEditingSlot(null);
    loadTimetable(selectedClass);
  };

  const slotAt = (time: string, day: string) => schedule[time]?.[day] ?? null;

  const totalSlots = TIMES.filter((t) => t !== "12:00").length * DAYS.length;
  const filledSlots = TIMES.filter((t) => t !== "12:00").reduce(
    (acc, t) => acc + DAYS.filter((d) => !!slotAt(t, d)).length, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Timetable Manager</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Set the weekly schedule for each class. All changes are saved to the database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Coverage</div>
            <div className="font-bold text-navy">{filledSlots} / {totalSlots} slots</div>
          </div>
          <select
            className="border border-border px-4 py-2.5 bg-white text-navy font-bold text-sm focus:outline-none focus:border-navy"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <optgroup label="Nursery">{CLASSES.slice(0, 2).map((c) => <option key={c}>{c}</option>)}</optgroup>
            <optgroup label="Primary">{CLASSES.slice(2, 8).map((c) => <option key={c}>{c}</option>)}</optgroup>
            <optgroup label="Junior Secondary">{CLASSES.slice(8, 14).map((c) => <option key={c}>{c}</option>)}</optgroup>
            <optgroup label="Senior Secondary">{CLASSES.slice(14).map((c) => <option key={c}>{c}</option>)}</optgroup>
          </select>
        </div>
      </div>

      {/* Active teacher legend (from DB) */}
      <div className="flex flex-wrap gap-2">
        {teachers.map((t) => {
          const active = TIMES.some((time) => DAYS.some((day) => (slotAt(time, day) as any)?.teacher_id === t.id));
          return (
            <div key={t.id} className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border ${active ? "bg-navy/5 border-navy/30 text-navy" : "bg-secondary border-border text-muted-foreground"}`}>
              <User size={11} />
              {t.name}
            </div>
          );
        })}
      </div>

      {/* Timetable grid */}
      {loading ? (
        <div className="bg-white border border-border h-64 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="border-b border-border bg-secondary/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-muted-foreground w-20">TIME</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-3 py-3 text-center text-xs font-bold tracking-wider text-navy">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TIMES.map((t) => (
                <tr key={t} className="hover:bg-secondary/20 transition">
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground font-bold whitespace-nowrap">{t}</td>
                  {DAYS.map((d) => {
                    const slot = slotAt(t, d);
                    const isBreak = t === "12:00";
                    return (
                      <td key={d} className={`px-1.5 py-1.5 ${!isBreak ? "cursor-pointer" : ""}`} onClick={() => !isBreak && openEdit(t, d)}>
                        {isBreak ? (
                          <div className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-3 text-center">LUNCH BREAK</div>
                        ) : slot ? (
                          <div className={`${slot.color} text-white px-2 py-2 text-left relative group`}>
                            <div className="text-[11px] font-bold leading-tight truncate">{slot.subject}</div>
                            <div className="text-[10px] opacity-80 mt-0.5 truncate">{slot.teacher}</div>
                            <div className="text-[10px] opacity-60 mt-0.5">{slot.room}</div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white">Edit</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 border-2 border-dashed border-border/40 flex items-center justify-center text-muted-foreground/30 text-xl font-light hover:border-navy/40 hover:text-navy/40 transition">+</div>
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

      <p className="text-xs text-muted-foreground text-center">Click any empty slot to assign · Click filled slot to edit or clear · All saves go directly to Supabase</p>

      {/* Edit modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingSlot(null)}>
          <form onSubmit={handleSave} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md shadow-2xl border border-border overflow-hidden">
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-black">{editingSlot.day} · {editingSlot.time}</h3>
                <p className="text-white/60 text-xs mt-0.5">{selectedClass}</p>
              </div>
              <button type="button" onClick={() => setEditingSlot(null)} className="text-white/60 hover:text-white"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><BookOpen size={12} /> Subject</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-border px-3 py-2.5 text-sm text-navy bg-white focus:border-navy focus:outline-none">
                  <option value="">— Select a subject —</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><User size={12} /> Assign Teacher</label>
                <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                  className="w-full border border-border px-3 py-2.5 text-sm text-navy bg-white focus:border-navy focus:outline-none">
                  <option value="">— Select a teacher —</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1"><MapPin size={12} /> Room / Location</label>
                <input placeholder="e.g. Room 12, Lab 1, Hall" value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className="w-full border border-border px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Slot Colour</label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button key={color} type="button" onClick={() => setForm({ ...form, color })}
                      className={`w-7 h-7 flex items-center justify-center ${color} transition ${form.color === color ? "ring-2 ring-offset-2 ring-navy scale-110" : "opacity-70 hover:opacity-100"}`}>
                      {form.color === color && <Check size={13} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-navy text-gold py-2.5 font-bold text-xs tracking-wider hover:bg-navy/90 transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "SAVING..." : "SAVE SLOT"}
                </button>
                <button type="button" onClick={handleClear}
                  className="px-5 py-2.5 border border-rose-200 text-rose-600 font-bold text-xs tracking-wider hover:bg-rose-50 transition">
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
