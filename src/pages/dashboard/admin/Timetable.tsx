import { useState } from "react";
import { useStore, SlotData } from "@/store";
import { X, Check } from "lucide-react";
import { toast } from "sonner";

const days = ["MON", "TUE", "WED", "THU", "FRI"];
const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

const teachers = [
  { id: "T-001", name: "Mr. Daniel Marko" },
  { id: "T-002", name: "Mrs. Sarah James" },
  { id: "T-003", name: "Mr. Peter Obi" }
];

const colors = ["bg-navy", "bg-emerald-600", "bg-violet-600", "bg-orange-500", "bg-teal-600"];

export default function AdminTimetable() {
  const { timetables, setTimetableSlot } = useStore();
  const [selectedTeacher, setSelectedTeacher] = useState("T-001");
  const [editingSlot, setEditingSlot] = useState<{ time: string; day: string } | null>(null);
  const [form, setForm] = useState({ classLabel: "", room: "", color: "bg-navy" });

  const schedule = timetables[selectedTeacher] || {};

  const handleEditClick = (time: string, day: string, slot: SlotData) => {
    if (time === "12:00") return; // Break time
    setEditingSlot({ time, day });
    if (slot) {
      setForm({ classLabel: slot.class, room: slot.room, color: slot.color });
    } else {
      setForm({ classLabel: "", room: "", color: "bg-navy" });
    }
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlot) {
      if (form.classLabel.trim() === "") {
        setTimetableSlot(selectedTeacher, editingSlot.time, editingSlot.day, null);
        toast.success("Slot cleared.");
      } else {
        setTimetableSlot(selectedTeacher, editingSlot.time, editingSlot.day, {
          class: form.classLabel,
          room: form.room,
          color: form.color,
        });
        toast.success("Timetable slot saved.");
      }
      setEditingSlot(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-display text-3xl font-black text-navy">Manage Timetables</h1>
          <p className="text-muted-foreground text-sm">Assign classes to teachers' schedules.</p>
        </div>
        <select 
          className="border border-border px-4 py-2 bg-white text-navy font-bold focus:outline-none focus:border-navy"
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
        >
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}
        </select>
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="border-b border-border bg-secondary/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold tracking-wider text-muted-foreground w-20">TIME</th>
              {days.map((d) => (
                <th key={d} className="px-4 py-3 text-center text-xs font-bold tracking-wider text-navy">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {times.map((t) => (
              <tr key={t}>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-bold">{t}</td>
                {days.map((d) => {
                  const slot = schedule[t]?.[d];
                  return (
                    <td 
                      key={d} 
                      className={`px-2 py-2 text-center ${t !== "12:00" ? "cursor-pointer hover:bg-secondary/50 transition" : ""}`}
                      onClick={() => handleEditClick(t, d, slot)}
                    >
                      {t === "12:00" ? (
                        <div className="bg-secondary text-muted-foreground text-[10px] font-bold px-2 py-3 mx-1">BREAK</div>
                      ) : slot ? (
                        <div className={`${slot.color} text-white px-2 py-3 mx-1 text-left relative group`}>
                          <div className="text-[11px] font-bold leading-tight">{slot.class}</div>
                          <div className="text-[10px] opacity-75 mt-0.5">{slot.room}</div>
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Edit</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-12 mx-1 flex items-center justify-center text-muted-foreground/30 text-xl font-light hover:text-navy/50 transition">
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

      {editingSlot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingSlot(null)}>
          <form onSubmit={handleSaveSlot} onClick={(e) => e.stopPropagation()} className="bg-white p-6 w-full max-w-sm space-y-4 shadow-xl border border-border border-t-4 border-t-navy">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-xl font-black text-navy">
                Edit Slot ({editingSlot.day} {editingSlot.time})
              </h3>
              <button type="button" onClick={() => setEditingSlot(null)} className="text-muted-foreground hover:text-navy"><X size={18} /></button>
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Class & Subject</label>
              <input 
                placeholder="e.g. JSS 1A - Maths" 
                value={form.classLabel} 
                onChange={(e) => setForm({ ...form, classLabel: e.target.value })} 
                className="w-full border border-border px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none" 
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Room/Location</label>
              <input 
                placeholder="e.g. Room 12" 
                value={form.room} 
                onChange={(e) => setForm({ ...form, room: e.target.value })} 
                className="w-full border border-border px-3 py-2 text-sm text-navy focus:border-navy focus:outline-none" 
              />
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground mb-1 block">Color Tag</label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${color} ${form.color === color ? "ring-2 ring-offset-2 ring-navy" : ""}`}
                  >
                    {form.color === color && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-navy text-gold py-2.5 font-bold text-xs tracking-wider">SAVE SLOT</button>
              <button 
                type="button" 
                onClick={() => { setForm({...form, classLabel: ""}); handleSaveSlot(new Event('submit') as any); }}
                className="bg-red-50 text-red-600 px-4 py-2.5 font-bold text-xs tracking-wider hover:bg-red-100"
              >
                CLEAR
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
