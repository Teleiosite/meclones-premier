import { create } from "zustand";

// ─── Types ───────────────────────────────────────────────────────────────────

/** A single timetable slot assigned to a class */
export type SlotData = {
  subject: string;   // e.g. "Mathematics"
  teacher: string;   // teacher ID, e.g. "T-001"
  room: string;      // e.g. "Room 12"
  color: string;     // Tailwind bg class
} | null;

export type WeeklySchedule = Record<string, Record<string, SlotData>>;

/** Class-centric timetable map: classId → WeeklySchedule */
export type ClassTimetables = Record<string, WeeklySchedule>;

export type TeacherAttendance = {
  isClockedIn: boolean;
  lastActionTime: string | null;
};

// ─── Master data ─────────────────────────────────────────────────────────────

export const TEACHERS = [
  { id: "T-001", name: "Mr. Daniel Marko",    subject: "Mathematics" },
  { id: "T-002", name: "Mrs. Sarah James",    subject: "English" },
  { id: "T-003", name: "Mr. Peter Obi",       subject: "Physics" },
  { id: "T-004", name: "Mr. Chidi Ade",       subject: "Chemistry" },
  { id: "T-005", name: "Mr. Emeka Adeyemi",   subject: "Biology" },
  { id: "T-006", name: "Mrs. Ngozi Okonkwo",  subject: "Computer Science" },
];

export const CLASSES = [
  "Nursery 1", "Nursery 2",
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "JSS 1A", "JSS 1B", "JSS 2A", "JSS 2B", "JSS 3A", "JSS 3B",
  "SS 1A", "SS 1B", "SS 2A", "SS 2B", "SS 3A", "SS 3B",
];

export const SUBJECTS = [
  "Mathematics", "English Language", "Physics", "Chemistry", "Biology",
  "Further Mathematics", "Computer Science", "Economics", "Geography",
  "Civic Education", "Agricultural Science", "French", "History",
  "Physical Education", "Fine Arts", "Music",
];

const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

/** Build an empty weekly grid */
function emptyWeek(): WeeklySchedule {
  const w: WeeklySchedule = {};
  for (const t of TIMES) {
    w[t] = {};
    for (const d of DAYS) w[t][d] = null;
  }
  return w;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const seedClassTimetables: ClassTimetables = {
  "JSS 1A": {
    ...emptyWeek(),
    "08:00": { MON: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" }, TUE: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" }, WED: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" }, THU: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, FRI: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" } },
    "09:00": { MON: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" }, TUE: null, WED: { subject: "Chemistry", teacher: "T-004", room: "Room 20", color: "bg-orange-500" }, THU: null, FRI: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" } },
    "10:00": { MON: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" }, TUE: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" }, WED: null, THU: { subject: "Chemistry", teacher: "T-004", room: "Room 20", color: "bg-orange-500" }, FRI: null },
    "11:00": { MON: null, TUE: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, WED: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" }, THU: null, FRI: { subject: "Chemistry", teacher: "T-004", room: "Room 20", color: "bg-orange-500" } },
    "12:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "13:00": { MON: { subject: "Computer Science", teacher: "T-006", room: "Lab 1", color: "bg-indigo-600" }, TUE: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" }, WED: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, THU: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" }, FRI: null },
    "14:00": { MON: null, TUE: { subject: "Computer Science", teacher: "T-006", room: "Lab 1", color: "bg-indigo-600" }, WED: null, THU: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" }, FRI: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" } },
    "15:00": { MON: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, TUE: null, WED: null, THU: null, FRI: { subject: "Computer Science", teacher: "T-006", room: "Lab 1", color: "bg-indigo-600" } },
  },
  "JSS 2B": {
    ...emptyWeek(),
    "08:00": { MON: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" }, TUE: null, WED: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" }, THU: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" }, FRI: null },
    "09:00": { MON: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" }, TUE: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" }, WED: null, THU: null, FRI: { subject: "Chemistry", teacher: "T-004", room: "Room 20", color: "bg-orange-500" } },
    "10:00": { MON: null, TUE: { subject: "Chemistry", teacher: "T-004", room: "Room 20", color: "bg-orange-500" }, WED: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" }, THU: null, FRI: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" } },
    "11:00": { MON: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, TUE: null, WED: null, THU: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" }, FRI: null },
    "12:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "13:00": { MON: null, TUE: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" }, WED: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, THU: null, FRI: null },
    "14:00": { MON: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" }, TUE: null, WED: null, THU: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, FRI: { subject: "Mathematics", teacher: "T-001", room: "Room 12", color: "bg-navy" } },
    "15:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
  },
  "SS 1A": {
    ...emptyWeek(),
    "08:00": { MON: { subject: "Further Mathematics", teacher: "T-001", room: "Room 18", color: "bg-navy" }, TUE: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, WED: null, THU: { subject: "Chemistry", teacher: "T-004", room: "Lab 2", color: "bg-orange-500" }, FRI: { subject: "Further Mathematics", teacher: "T-001", room: "Room 18", color: "bg-navy" } },
    "09:00": { MON: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" }, TUE: null, WED: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" }, THU: null, FRI: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" } },
    "10:00": { MON: null, TUE: { subject: "Further Mathematics", teacher: "T-001", room: "Room 18", color: "bg-navy" }, WED: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, THU: { subject: "English Language", teacher: "T-002", room: "Room 8", color: "bg-emerald-600" }, FRI: null },
    "11:00": { MON: { subject: "Chemistry", teacher: "T-004", room: "Lab 2", color: "bg-orange-500" }, TUE: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" }, WED: null, THU: null, FRI: { subject: "Biology", teacher: "T-005", room: "Room 6", color: "bg-teal-600" } },
    "12:00": { MON: null, TUE: null, WED: null, THU: null, FRI: null },
    "13:00": { MON: { subject: "Computer Science", teacher: "T-006", room: "Lab 1", color: "bg-indigo-600" }, TUE: null, WED: { subject: "Chemistry", teacher: "T-004", room: "Lab 2", color: "bg-orange-500" }, THU: { subject: "Computer Science", teacher: "T-006", room: "Lab 1", color: "bg-indigo-600" }, FRI: null },
    "14:00": { MON: null, TUE: { subject: "Computer Science", teacher: "T-006", room: "Lab 1", color: "bg-indigo-600" }, WED: null, THU: { subject: "Further Mathematics", teacher: "T-001", room: "Room 18", color: "bg-navy" }, FRI: { subject: "Chemistry", teacher: "T-004", room: "Lab 2", color: "bg-orange-500" } },
    "15:00": { MON: { subject: "Physics", teacher: "T-003", room: "Room 15", color: "bg-violet-600" }, TUE: null, WED: null, THU: null, FRI: null },
  },
};

// ─── Store ────────────────────────────────────────────────────────────────────

interface AppState {
  classTimetables: ClassTimetables;
  attendance: Record<string, TeacherAttendance>;
  setClassSlot: (className: string, time: string, day: string, slot: SlotData) => void;
  toggleClockIn: (teacherId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  classTimetables: seedClassTimetables,

  attendance: {
    "T-001": { isClockedIn: false, lastActionTime: null },
  },

  setClassSlot: (className, time, day, slot) =>
    set((state) => {
      const current = state.classTimetables[className] ?? emptyWeek();
      return {
        classTimetables: {
          ...state.classTimetables,
          [className]: {
            ...current,
            [time]: { ...current[time], [day]: slot },
          },
        },
      };
    }),

  toggleClockIn: (teacherId) =>
    set((state) => {
      const current = state.attendance[teacherId] || { isClockedIn: false, lastActionTime: null };
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
