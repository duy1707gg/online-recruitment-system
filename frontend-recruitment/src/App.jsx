import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import PostJob from './pages/PostJob';
import JobList from './pages/JobList';
import InterviewRoom from './pages/InterviewRoom';
import MyApplications from './pages/MyApplications';
import ManageJobs from './pages/ManageJobs';
import HomePage from './pages/HomePage';
import ManageProblems from './pages/ManageProblems';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from "./pages/ProfilePage.jsx";
import ManageUsers from './pages/ManageUsers';
import ChatbotWidget from "./pages/ChatbotWidget.jsx";
import AnalyticsDashboard from "./pages/AnalyticsDashboard.jsx";
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const RoleRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }>

                        <Route index element={<HomePage />} />

                        <Route path="post-job" element={
                            <RoleRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                                <PostJob />
                            </RoleRoute>
                        } />
                        <Route path="jobs" element={<JobList />} />
                        <Route path="/manage-users" element={
                            <RoleRoute allowedRoles={['ADMIN']}>
                                <ManageUsers />
                            </RoleRoute>
                        } />

                        <Route path="room/:roomId" element={<InterviewRoom />} />
                        <Route path="/chat" element={<ChatbotWidget />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="my-applications" element={<MyApplications />} />
                        <Route path="manage-jobs" element={
                            <RoleRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                                <ManageJobs />
                            </RoleRoute>
                        } />
                        <Route path="manage-problems" element={
                            <RoleRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                                <ManageProblems />
                            </RoleRoute>
                        } />
                        <Route path="dashboard/analytics" element={
                            <RoleRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                                <AnalyticsDashboard />
                            </RoleRoute>
                        } />
                    </Route>
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;