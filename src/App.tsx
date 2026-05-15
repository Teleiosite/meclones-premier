import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
import ResetPassword from "./pages/auth/ResetPassword";
import AdminLayout, { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import TeacherLayout, { TeacherDashboard } from "./pages/dashboard/TeacherDashboard";
import StudentLayout, { StudentDashboard } from "./pages/dashboard/StudentDashboard";
import ParentLayout, { ParentDashboard } from "./pages/dashboard/ParentDashboard";
import NotFound from "./pages/NotFound.tsx";

// Admin sub-pages
import AdminStudents from "./pages/dashboard/admin/Students";
import AdminTeachers from "./pages/dashboard/admin/Teachers";
import AdminParents from "./pages/dashboard/admin/Parents";
import AdminAdmissions from "./pages/dashboard/admin/Admissions";

import AdminFees from "./pages/dashboard/admin/Fees";
import AdminAttendance from "./pages/dashboard/admin/Attendance";
import AdminAcademics from "./pages/dashboard/admin/Academics";
import AdminAnnouncements from "./pages/dashboard/admin/Announcements";
import AdminTimetable from "./pages/dashboard/admin/Timetable";

// Teacher sub-pages
import TeacherClasses from "./pages/dashboard/teacher/Classes";
import TeacherStudents from "./pages/dashboard/teacher/Students";
import TeacherAttendance from "./pages/dashboard/teacher/Attendance";
import TeacherAssignments from "./pages/dashboard/teacher/Assignments";
import TeacherExams from "./pages/dashboard/teacher/Exams";
import TeacherMessages from "./pages/dashboard/teacher/Messages";
import TeacherTimetable from "./pages/dashboard/teacher/Timetable";
import TeacherReports from "./pages/dashboard/teacher/Reports";
import TeacherSettings from "./pages/dashboard/teacher/Settings";
import TeacherClockinClockout from "./pages/dashboard/teacher/ClockinClockout";

// Student sub-pages
import StudentCourses from "./pages/dashboard/student/Courses";
import StudentAssignments from "./pages/dashboard/student/Assignments";
import StudentResults from "./pages/dashboard/student/Results";
import StudentTimetable from "./pages/dashboard/student/Timetable";
import StudentAttendance from "./pages/dashboard/student/Attendance";
import StudentMessages from "./pages/dashboard/student/Messages";
import StudentResources from "./pages/dashboard/student/Resources";
import StudentProfile from "./pages/dashboard/student/Profile";
import StudentSettings from "./pages/dashboard/student/Settings";

// Parent sub-pages
import ParentChildren from "./pages/dashboard/parent/Children";
import ParentFees from "./pages/dashboard/parent/Fees";
import ParentAttendance from "./pages/dashboard/parent/Attendance";
import ParentResults from "./pages/dashboard/parent/Results";
import ParentMessages from "./pages/dashboard/parent/Messages";
import ParentCalendar from "./pages/dashboard/parent/Calendar";
import ParentReports from "./pages/dashboard/parent/Reports";
import ParentSettings from "./pages/dashboard/parent/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
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
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected dashboard routes */}
            <Route element={<AuthGuard />}>

            {/* Admin portal */}
            <Route path="/dashboard/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="parents" element={<AdminParents />} />
              <Route path="admissions" element={<AdminAdmissions />} />

              <Route path="fees" element={<AdminFees />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="academics" element={<AdminAcademics />} />
              <Route path="timetable" element={<AdminTimetable />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
            </Route>

            <Route path="/dashboard/teacher" element={<TeacherLayout />}>
              <Route index element={<TeacherDashboard />} />
              <Route path="clockin-clockout" element={<TeacherClockinClockout />} />
              <Route path="classes" element={<TeacherClasses />} />
              <Route path="students" element={<TeacherStudents />} />
              <Route path="attendance" element={<TeacherAttendance />} />
              <Route path="assignments" element={<TeacherAssignments />} />
              <Route path="exams" element={<TeacherExams />} />
              <Route path="messages" element={<TeacherMessages />} />
              <Route path="timetable" element={<TeacherTimetable />} />
              <Route path="reports" element={<TeacherReports />} />
              <Route path="settings" element={<TeacherSettings />} />
            </Route>

            {/* Student portal */}
            <Route path="/dashboard/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="timetable" element={<StudentTimetable />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="messages" element={<StudentMessages />} />
              <Route path="resources" element={<StudentResources />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>

            {/* Parent portal */}
            <Route path="/dashboard/parent" element={<ParentLayout />}>
              <Route index element={<ParentDashboard />} />
              <Route path="children" element={<ParentChildren />} />
              <Route path="fees" element={<ParentFees />} />
              <Route path="attendance" element={<ParentAttendance />} />
              <Route path="results" element={<ParentResults />} />
              <Route path="messages" element={<ParentMessages />} />
              <Route path="calendar" element={<ParentCalendar />} />
              <Route path="reports" element={<ParentReports />} />
              <Route path="settings" element={<ParentSettings />} />
            </Route>

            </Route> {/* end AuthGuard */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
