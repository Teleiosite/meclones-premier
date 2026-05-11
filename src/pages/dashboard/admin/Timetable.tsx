import { useState } from "react";
import { useStore, TEACHERS, CLASSES, SUBJECTS, SlotData } from "@/store";
import { X, Check, BookOpen, User, MapPin } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const COLORS = ["bg-navy", "bg-emerald-600", "bg-violet-600", "bg-orange-500", "bg-teal-600", "bg-indigo-600", "bg-rose-500"];

type EditingSlot = { time: string; day: string };
type Form = { subject: string; teacher: string; room: string; color: string };

const emptyForm: Form = { subject: "", teacher: "", room: "", color: "bg-navy" };

export default function AdminTimetable() {
  const { classTimetables, setClassSlot } = useStore();
  const [selectedClass, setSelectedClass] = useState(CLASSES[8]); // JSS 1A default
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);

  const schedule = classTimetables[selectedClass] ?? {};

  const openEdit = (time: string, day: string) => {
    if (time === "12:00") return;
    const slot = schedule[time]?.[day];
    setEditingSlot({ time, day });
    setForm(slot ? { subject: slot.subject, teacher: slot.teacher, room: slot.room, color: slot.color } : emptyForm);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot) return;

    if (!form.subject.trim()) {
      setClassSlot(selectedClass, editingSlot.time, editingSlot.day, null);
      toast.success("Slot cleared.");
    } else {
      if (!form.teacher) { toast.error("Please select a teacher."); return; }
      setClassSlot(selectedClass, editingSlot.time, editingSlot.day, {
        subject: form.subject,
        teacher: form.teacher,
        room: form.room || "TBD",
        color: form.color,
      });
      const teacherName = TEACHERS.find(t => t.id === form.teacher)?.name ?? form.teacher;
      toast.success(`Saved: ${form.subject} → ${teacherName} (${editingSlot.day} ${editingSlot.time})`);
    }
    setEditingSlot(null);
  };

  const handleClear = () => {
    if (!editingSlot) return;
    setClassSlot(selectedClass, editingSlot.time, editingSlot.day, null);
    toast.success("Slot cleared.");
    setEditingSlot(null);
  };

  const slotAt = (time: string, day: string): SlotData =>
    schedule[time]?.[day] ?? null;

  const getTeacherName = (id: string) =>
    TEACHERS.find(t => t.id === id)?.name ?? id;

  // Count assigned slots for the selected class
  const totalSlots = TIMES.filter(t => t !== "12:00").length * DAYS.length;
  const filledSlots = TIMES.filter(t => t !== "12:00").reduce((acc, t) =>
    acc + DAYS.filter(d => !!slotAt(t, d)).length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Timetable Manager</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Set the weekly schedule for each class and assign teachers to subjects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Coverage</div>
            <div className="font-bold text-navy">{filledSlots} / {totalSlots} slots</div>
          </div>
          <select
            className="border border-border px-4 py-2.5 bg-white text-navy font-bold text-sm focus:outline-none focus:border-navy rounded-md"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <optgroup label="Nursery">
              {CLASSES.slice(0, 2).map(c => <option key={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Primary">
              {CLASSES.slice(2, 8).map(c => <option key={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Junior Secondary">
              {CLASSES.slice(8, 14).map(c => <option key={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Senior Secondary">
              {CLASSES.slice(14).map(c => <option key={c}>{c}</option>)}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Teacher legend */}
      <div className="flex flex-wrap gap-2">
        {TEACHERS.map(t => {
          // Check if this teacher has any slot in the selected class
          const active = TIMES.some(time => DAYS.some(day => slotAt(time, day)?.teacher === t.id));
          return (
            <div key={t.id} className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${active ? "bg-navy/5 border-navy/30 text-navy" : "bg-secondary border-border text-muted-foreground"}`}>
              <User size={11} />
              {t.name}
            </div>
          );
        })}
      </div>

      {/* Timetable grid */}
      <div className="bg-white border border-border overflow-x-auto rounded-lg">
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
                    <td
                      key={d}
                      className={`px-1.5 py-1.5 ${!isBreak ? "cursor-pointer" : ""}`}
                      onClick={() => !isBreak && openEdit(t, d)}
                    >
                      {isBreak ? (
                        <div className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-3 text-center rounded">
                          LUNCH BREAK
                        </div>
                      ) : slot ? (
                        <div className={`${slot.color} text-white px-2 py-2 rounded text-left relative group`}>
                          <div className="text-[11px] font-bold leading-tight truncate">{slot.subject}</div>
                          <div className="text-[10px] opacity-80 mt-0.5 truncate">{getTeacherName(slot.teacher)}</div>
                          <div className="text-[10px] opacity-60 mt-0.5">{slot.room}</div>
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Edit</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-14 rounded border-2 border-dashed border-border/40 flex items-center justify-center text-muted-foreground/30 text-xl font-light hover:border-navy/40 hover:text-navy/40 transition">
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

      {/* Instruction hint */}
      <p className="text-xs text-muted-foreground text-center">
        Click any empty slot to assign a subject and teacher · Click a filled slot to edit or clear it
      </p>

      {/* Edit modal */}
      {editingSlot && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingSlot(null)}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md shadow-2xl border border-border rounded-lg overflow-hidden"
          >
            {/* Modal header */}
            <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-black">
                  {editingSlot.day} · {editingSlot.time}
                </h3>
                <p className="text-white/60 text-xs mt-0.5">{selectedClass}</p>
              </div>
              <button type="button" onClick={() => setEditingSlot(null)} className="text-white/60 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <BookOpen size={12} /> Subject
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-navy bg-white focus:border-navy focus:outline-none"
                >
                  <option value="">— Select a subject —</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <User size={12} /> Assign Teacher
                </label>
                <select
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-navy bg-white focus:border-navy focus:outline-none"
                >
                  <option value="">— Select a teacher —</option>
                  {TEACHERS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin size={12} /> Room / Location
                </label>
                <input
                  placeholder="e.g. Room 12, Lab 1, Hall"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none"
                />
              </div>

              {/* Color */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Slot Color
                </label>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm({ ...form, color })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${color} transition ${
                        form.color === color ? "ring-2 ring-offset-2 ring-navy scale-110" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      {form.color === color && <Check size={13} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-navy text-gold py-2.5 font-bold text-xs tracking-wider rounded-md hover:bg-navy/90 transition"
                >
                  SAVE SLOT
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-5 py-2.5 border border-rose-200 text-rose-600 font-bold text-xs tracking-wider rounded-md hover:bg-rose-50 transition"
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
