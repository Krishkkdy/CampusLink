import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout";
import FacultyLayout from "./layouts/FacultyLayout";
import AlumniLayout from "./layouts/AlumniLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageAlumni from "./pages/admin/ManageAlumni";
import ManageFaculty from "./pages/admin/ManageFaculty";
import SendEmails from "./pages/admin/SendEmails";
import AlumniList from "./pages/admin/AlumniList";
import FacultyList from "./pages/admin/FacultyList";
import AddAlumni from "./pages/admin/AddAlumni";
import AddFaculty from "./pages/admin/AddFaculty";
import ManageStudents from "./pages/admin/ManageStudents";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import ViewAlumni from "./pages/faculty/ViewAlumni";
import CreateEvents from "./pages/faculty/CreateEvents";
import NotifyAlumni from "./pages/faculty/NotifyAlumni";
import FacultyProfile from "./pages/faculty/FacultyProfile";
import EditEvent from "./pages/faculty/EditEvent";
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import ViewEvents from "./pages/alumni/ViewEvents";
import ViewAlumniProfiles from "./pages/alumni/ViewAlumniProfiles";
import AlumniProfile from "./pages/alumni/AlumniProfile";
import JobPostingDetail from "./pages/alumni/JobPostingDetail";
import JobPostingsPage from './pages/alumni/JobPostingsPage';
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import ViewStudentProfile from "./pages/student/ViewStudentProfile";
import JobListings from "./pages/student/JobListings";
import JobDetail from "./pages/student/JobDetail";
import Login from "./pages/Login";
import AddStudent from './pages/admin/AddStudent';
import StudentList from './pages/admin/StudentList';
import ViewNetwork from './pages/student/ViewNetwork';
import FacultyNetwork from './pages/faculty/FacultyNetwork';
import Messages from './pages/common/Messages';
import "./styles/shared.css";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentResume from './pages/student/StudentResume';
import ViewResumeFeedback from './pages/student/ViewResumeFeedback';
import ResumeReview from './pages/alumni/ResumeReview';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Make login the default route */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/alumni-list" element={<AlumniList />} />
            <Route path="/faculty-list" element={<FacultyList />} />
            <Route path="/admin/add-alumni" element={<AddAlumni />} />
            <Route path="/admin/add-faculty" element={<AddFaculty />} />
            <Route path="/send-emails" element={<SendEmails />} />
            <Route path="/student-list" element={<StudentList />} />
            <Route path="/admin/add-student" element={<AddStudent />} />
          </Route>

          {/* Faculty Routes */}
          <Route element={<FacultyLayout />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/faculty/view-alumni" element={<ViewAlumni />} />
            <Route path="/faculty/network" element={<FacultyNetwork />} />
            <Route path="/faculty/create-events" element={<CreateEvents />} />
            <Route path="/faculty/notify-alumni" element={<NotifyAlumni />} />
            <Route path="/faculty/edit-event/:id" element={<EditEvent />} />
            <Route path="/faculty/messages" element={<Messages />} />
          </Route>

          {/* Alumni Routes */}
          <Route element={<AlumniLayout />}>
            <Route path="/alumni" element={<AlumniDashboard />} />
            <Route path="/alumni/profile" element={<AlumniProfile />} />
            <Route path="/alumni/view-events" element={<ViewEvents />} />
            <Route path="/alumni/view-alumni-profiles" element={<ViewAlumniProfiles />} />
            <Route path="/alumni/messages" element={<Messages />} />
            <Route path="/alumni/resume-review" element={<ResumeReview />} />
            <Route path="/alumni/job-postings/:jobId" element={<JobPostingDetail />} />
            <Route path="/alumni/job-postings" element={<JobPostingsPage />} />
            <Route path="/alumni/view-student-profile/:studentId" element={<ViewStudentProfile />} />
          </Route>

          {/* Student Routes */}
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/network" element={<ViewNetwork />} />
            <Route path="/student/messages" element={<Messages />} />
            <Route path="/student/resume" element={<StudentResume />} />
            <Route path="/student/resume-feedback" element={<ViewResumeFeedback />} />
            <Route path="/student/jobs" element={<JobListings />} />
            <Route path="/student/jobs/:jobId" element={<JobDetail />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
