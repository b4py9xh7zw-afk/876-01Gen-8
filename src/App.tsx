import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { EmployeeLayout, AdminLayout, ProtectedRoute } from "@/components";

import Login from "@/pages/Login";
import EmployeeDashboard from "@/pages/employee/Dashboard";
import Learning from "@/pages/employee/Learning";
import CourseDetail from "@/pages/employee/CourseDetail";
import Quiz from "@/pages/employee/Quiz";
import QuizResultPage from "@/pages/employee/QuizResultPage";
import Checkin from "@/pages/employee/Checkin";
import Profile from "@/pages/employee/Profile";

import AdminDashboard from "@/pages/admin/Dashboard";
import Employees from "@/pages/admin/Employees";
import Reports from "@/pages/admin/Reports";
import Retraining from "@/pages/admin/Retraining";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="learning" element={<Learning />} />
          <Route path="course/:courseType" element={<CourseDetail />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="quiz/result" element={<QuizResultPage />} />
          <Route path="checkin" element={<Checkin />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="reports" element={<Reports />} />
          <Route path="retraining" element={<Retraining />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
