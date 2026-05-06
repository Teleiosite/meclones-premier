import { create } from "zustand";

export type SlotData = { class: string; room: string; color: string } | null;
export type WeeklySchedule = Record<string, Record<string, SlotData>>;

export type TeacherAttendance = {
  isClockedIn: boolean;
  lastActionTime: string | null;
};

interface AppState {
  timetables: Record<string, WeeklySchedule>;
  attendance: Record<string, TeacherAttendance>;
  setTimetableSlot: (teacherId: string, time: string, day: string, slot: SlotData) => void;
  toggleClockIn: (teacherId: string) => void;
}

const defaultTimetable: WeeklySchedule = {
  "08:00": { MON: { class: "JSS 1A - Maths", room: "Room 12", color: "bg-navy" }, TUE: null, WED: { class: "SS 2B - Maths", room: "Room 20", color: "bg-violet-600" }, THU: null, FRI: { class: "JSS 1A - Maths", room: "Room 12", color: "bg-navy" } },
  "09:00": { MON: null, TUE: { class: "JSS 2B - Maths", room: "Room 15", color: "bg-emerald-600" }, WED: null, THU: { class: "JSS 3A - Maths", room: "Room 9", color: "bg-orange-500" }, FRI: null },
  "10:00": { MON: { class: "JSS 2B - Maths", room: "Room 15", color: "bg-emerald-600" }, TUE: null, WED: { class: "JSS 1A - Maths", room: "Room 12", color: "bg-navy" }, THU: null, FRI: { class: "SS 1A - Maths", room: "Room 18", color: "bg-teal-600" } },
  "11:00": { MON: null, TUE: { class: "JSS 3A - Maths", room: "Room 9", color: "bg-orange-500" }, WED: null, THU: { class: "JSS 2B - Maths", room: "Room 15", color: "bg-emerald-600" }, FRI: null },
  "12:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
  "13:00": { MON: { class: "SS 1A - Maths", room: "Room 18", color: "bg-teal-600" }, TUE: null, WED: { class: "JSS 3A - Maths", room: "Room 9", color: "bg-orange-500" }, THU: null, FRI: null },
  "14:00": { MON: null, TUE: { class: "SS 1A - Maths", room: "Room 18", color: "bg-teal-600" }, WED: null, THU: { class: "SS 2B - Maths", room: "Room 20", color: "bg-violet-600" }, FRI: { class: "JSS 2B - Maths", room: "Room 15", color: "bg-emerald-600" } },
  "15:00": { MON: { class: "SS 2B - Maths", room: "Room 20", color: "bg-violet-600" }, TUE: null, WED: null, THU: null, FRI: null },
};

export const useStore = create<AppState>((set) => ({
  timetables: {
    "T-001": defaultTimetable, // Default setup for Mr. Daniel Marko
  },
  attendance: {
    "T-001": { isClockedIn: false, lastActionTime: null },
  },
  
  setTimetableSlot: (teacherId, time, day, slot) =>
    set((state) => {
      const currentSchedule = state.timetables[teacherId] || {
        "08:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
        "09:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
        "10:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
        "11:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
        "12:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
        "13:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
        "14:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
        "15:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
      };

      return {
        timetables: {
          ...state.timetables,
          [teacherId]: {
            ...currentSchedule,
            [time]: {
              ...currentSchedule[time],
              [day]: slot,
            },
          },
        },
      };
    }),

  toggleClockIn: (teacherId) =>
    set((state) => {
      const current = state.attendance[teacherId] || { isClockedIn: false, lastActionTime: null };
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        attendance: {
          ...state.attendance,
          [teacherId]: {
            isClockedIn: !current.isClockedIn,
            lastActionTime: now,
          },
        },
      };
    }),
}));
