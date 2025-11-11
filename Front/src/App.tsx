import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Student Pages
import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard";
import Calendar from "./pages/student/Calendar";
import Courses from "./pages/student/Courses";
import Quizzes from "./pages/student/Quizzes";
import Arena from "./pages/student/Arena";
import Reports from "./pages/student/Reports";
import Settings from "./pages/student/Settings";

// Admin Pages
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCourses from "./pages/admin/Courses";
import Students from "./pages/admin/Students";
import Assessments from "./pages/admin/Assessments";
import Analytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/Settings";
import MyLearning from "./pages/student/MyLearning";
import StudyGroud from "./pages/student/StudyGroud";
import TakeQuiz from "./pages/student/TakeQuiz";
import QuizAnalyzed from "./pages/student/QuizAnalyzed";
import History from "./pages/student/History";
import ChatBot from "./pages/student/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student routes */}
          <Route
            path="/student"
            element={
              <StudentLayout>
                <StudentDashboard />
              </StudentLayout>
            }
          />
          <Route
            path="/student/chatbot"
            element={
              <StudentLayout>
                <ChatBot />
              </StudentLayout>
            }
          />
          <Route
            path="/student/calendar"
            element={
              <StudentLayout>
                <Calendar />
              </StudentLayout>
            }
          />
          <Route
            path="/student/hist"
            element={
              <StudentLayout>
                <History />
              </StudentLayout>
            }
          />
          <Route
            path="/student/quizresult"
            element={
              <StudentLayout>
                <QuizAnalyzed/>
              </StudentLayout>
            }
          />
          <Route
            path="/student/takequiz"
            element={
              <StudentLayout>
                <TakeQuiz />
              </StudentLayout>
            }
          />
          <Route
            path="/student/courses"
            element={
              <StudentLayout>
                <Courses />
              </StudentLayout>
            }
          />
           <Route
            path="/student/learning"
            element={
              <StudentLayout>
                <MyLearning />
              </StudentLayout>
            }
          />
          <Route
            path="/student/ground"
            element={
              // <StudentLayout>
                <StudyGroud />
              // {/* </StudentLayout> */}
            }
          />
          <Route
            path="/student/quizzes"
            element={
              <StudentLayout>
                <Quizzes />
              </StudentLayout>
            }
          />
          <Route
            path="/student/arena"
            element={
              <StudentLayout>
                <Arena />
              </StudentLayout>
            }
          />
          <Route
            path="/student/reports"
            element={
              <StudentLayout>
                <Reports />
              </StudentLayout>
            }
          />
          <Route
            path="/student/settings"
            element={
              <StudentLayout>
                <Settings />
              </StudentLayout>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminLayout>
                <AdminCourses />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/students"
            element={
              <AdminLayout>
                <Students />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/assessments"
            element={
              <AdminLayout>
                <Assessments />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminLayout>
                <Analytics />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
