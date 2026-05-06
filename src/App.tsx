import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteLayout from "./components/site/SiteLayout";
import Home from "./pages/Home";
import Primary from "./pages/Primary";
import Secondary from "./pages/Secondary";
import About from "./pages/About";
import Admissions from "./pages/Admissions";
import Fees from "./pages/Fees";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AdminLayout, { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import TeacherLayout, { TeacherDashboard } from "./pages/dashboard/TeacherDashboard";
import StudentLayout, { StudentDashboard } from "./pages/dashboard/StudentDashboard";
import ParentLayout, { ParentDashboard } from "./pages/dashboard/ParentDashboard";
import NotFound from "./pages/NotFound.tsx";

// Admin sub-pages
import AdminStudents from "./pages/dashboard/admin/Students";
import AdminTeachers from "./pages/dashboard/admin/Teachers";
import AdminAdmissions from "./pages/dashboard/admin/Admissions";
import AdminFees from "./pages/dashboard/admin/Fees";
import AdminAttendance from "./pages/dashboard/admin/Attendance";
import AdminAcademics from "./pages/dashboard/admin/Academics";
import AdminAnnouncements from "./pages/dashboard/admin/Announcements";

// Teacher sub-pages
import TeacherAttendance from "./pages/dashboard/teacher/Attendance";
import TeacherAssignments from "./pages/dashboard/teacher/Assignments";
import TeacherExams from "./pages/dashboard/teacher/Exams";
import TeacherMessages from "./pages/dashboard/teacher/Messages";
import TeacherTimetable from "./pages/dashboard/teacher/Timetable";

// Student sub-pages
import StudentAssignments from "./pages/dashboard/student/Assignments";
import StudentResults from "./pages/dashboard/student/Results";
import StudentTimetable from "./pages/dashboard/student/Timetable";
import StudentAttendance from "./pages/dashboard/student/Attendance";
import StudentMessages from "./pages/dashboard/student/Messages";

// Parent sub-pages
import ParentFees from "./pages/dashboard/parent/Fees";
import ParentAttendance from "./pages/dashboard/parent/Attendance";
import ParentResults from "./pages/dashboard/parent/Results";
import ParentMessages from "./pages/dashboard/parent/Messages";
import ParentCalendar from "./pages/dashboard/parent/Calendar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/primary" element={<Primary />} />
            <Route path="/secondary" element={<Secondary />} />
            <Route path="/about" element={<About />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin portal */}
          <Route path="/dashboard/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="academics" element={<AdminAcademics />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* Teacher portal */}
          <Route path="/dashboard/teacher" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="exams" element={<TeacherExams />} />
            <Route path="messages" element={<TeacherMessages />} />
            <Route path="timetable" element={<TeacherTimetable />} />
          </Route>

          {/* Student portal */}
          <Route path="/dashboard/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="messages" element={<StudentMessages />} />
          </Route>

          {/* Parent portal */}
          <Route path="/dashboard/parent" element={<ParentLayout />}>
            <Route index element={<ParentDashboard />} />
            <Route path="fees" element={<ParentFees />} />
            <Route path="attendance" element={<ParentAttendance />} />
            <Route path="results" element={<ParentResults />} />
            <Route path="messages" element={<ParentMessages />} />
            <Route path="calendar" element={<ParentCalendar />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
