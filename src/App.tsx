import React, { Suspense, lazy } from "react";
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
import AdminLayout, { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import TeacherLayout, { TeacherDashboard } from "./pages/dashboard/TeacherDashboard";
import StudentLayout, { StudentDashboard } from "./pages/dashboard/StudentDashboard";
import ParentLayout, { ParentDashboard } from "./pages/dashboard/ParentDashboard";
import NotFound from "./pages/NotFound.tsx";

// Admin sub-pages
const AdminStudents = lazy(() => import("./pages/dashboard/admin/Students"));
const AdminTeachers = lazy(() => import("./pages/dashboard/admin/Teachers"));
const AdminAdmissions = lazy(() => import("./pages/dashboard/admin/Admissions"));
const AdminFees = lazy(() => import("./pages/dashboard/admin/Fees"));
const AdminAttendance = lazy(() => import("./pages/dashboard/admin/Attendance"));
const AdminAcademics = lazy(() => import("./pages/dashboard/admin/Academics"));
const AdminAnnouncements = lazy(() => import("./pages/dashboard/admin/Announcements"));
const AdminTimetable = lazy(() => import("./pages/dashboard/admin/Timetable"));

// Teacher sub-pages
const TeacherClasses = lazy(() => import("./pages/dashboard/teacher/Classes"));
const TeacherStudents = lazy(() => import("./pages/dashboard/teacher/Students"));
const TeacherAttendance = lazy(() => import("./pages/dashboard/teacher/Attendance"));
const TeacherAssignments = lazy(() => import("./pages/dashboard/teacher/Assignments"));
const TeacherExams = lazy(() => import("./pages/dashboard/teacher/Exams"));
const TeacherMessages = lazy(() => import("./pages/dashboard/teacher/Messages"));
const TeacherTimetable = lazy(() => import("./pages/dashboard/teacher/Timetable"));
const TeacherReports = lazy(() => import("./pages/dashboard/teacher/Reports"));
const TeacherSettings = lazy(() => import("./pages/dashboard/teacher/Settings"));
const TeacherClockinClockout = lazy(() => import("./pages/dashboard/teacher/ClockinClockout"));

// Student sub-pages
const StudentCourses = lazy(() => import("./pages/dashboard/student/Courses"));
const StudentAssignments = lazy(() => import("./pages/dashboard/student/Assignments"));
const StudentResults = lazy(() => import("./pages/dashboard/student/Results"));
const StudentTimetable = lazy(() => import("./pages/dashboard/student/Timetable"));
const StudentAttendance = lazy(() => import("./pages/dashboard/student/Attendance"));
const StudentMessages = lazy(() => import("./pages/dashboard/student/Messages"));
const StudentResources = lazy(() => import("./pages/dashboard/student/Resources"));
const StudentProfile = lazy(() => import("./pages/dashboard/student/Profile"));
const StudentSettings = lazy(() => import("./pages/dashboard/student/Settings"));

// Parent sub-pages
const ParentChildren = lazy(() => import("./pages/dashboard/parent/Children"));
const ParentFees = lazy(() => import("./pages/dashboard/parent/Fees"));
const ParentAttendance = lazy(() => import("./pages/dashboard/parent/Attendance"));
const ParentResults = lazy(() => import("./pages/dashboard/parent/Results"));
const ParentMessages = lazy(() => import("./pages/dashboard/parent/Messages"));
const ParentCalendar = lazy(() => import("./pages/dashboard/parent/Calendar"));
const ParentReports = lazy(() => import("./pages/dashboard/parent/Reports"));
const ParentSettings = lazy(() => import("./pages/dashboard/parent/Settings"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent opacity-50"></div>
            </div>
          }>
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

              {/* Protected dashboard routes */}
              <Route element={<AuthGuard />}>

              {/* Admin portal */}
              <Route path="/dashboard/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="teachers" element={<AdminTeachers />} />
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
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
