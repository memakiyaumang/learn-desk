
import React, {
    lazy,
    Suspense
} from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Outlet
} from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";

import Header from "./components/Header";
import Sidebar from "./components/Slidebar";
import Footer from "./components/Footer";

import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

// ADDED: AI Assistant
import AIAssistant from "./components/AIAssistant";

import "./App.css";


// ==================================================
// STUDENT COMPONENTS - LAZY LOAD
// ==================================================

const Dashboard = lazy(
    () => import("./components/Dashboard")
);

const Mycourses = lazy(
    () => import("./components/Mycourses")
);

const Browse = lazy(
    () => import("./components/Browse")
);

const Help = lazy(
    () => import("./components/Help")
);

const Progress = lazy(
    () => import("./components/Progress")
);

const Certificates = lazy(
    () => import("./components/Certificates")
);

const CourseDetails = lazy(
    () => import("./components/CourseDetails")
);

const CourseLearning = lazy(
    () => import("./components/CourseLearning")
);

const Payment = lazy(
    () => import("./components/Payment")
);

const StudentQuizzes = lazy(
    () => import("./components/StudentQuizzes")
);

const StudentQuizAttempt = lazy(
    () => import("./components/StudentQuizAttempt")
);

const StudentQuizResult = lazy(
    () => import("./components/StudentQuizResult")
);

const CertificateView = lazy(
    () => import("./components/CertificateView")
);


// ==================================================
// LOGIN / REGISTRATION
// ==================================================

const Login = lazy(
    () => import("./components/Login")
);

const Registration = lazy(
    () => import("./components/Registration")
);


// ==================================================
// ADMIN COMPONENTS - LAZY LOAD
// ==================================================

const AdminDashboard = lazy(
    () => import("./components/AdminDashboard")
);

const AdminLogin = lazy(
    () => import("./components/AdminLogin")
);

const ManageCourse = lazy(
    () => import("./components/ManageCourse")
);

const AdminSidebar = lazy(
    () => import("./components/AdminSidebar")
);

const Settings = lazy(
    () => import("./components/Settings")
);

const FacultyManagement = lazy(
    () => import("./components/FacultyManagement")
);

const StudentManagement = lazy(
    () => import("./components/StudentManagement")
);

const PaymentManagement = lazy(
    () => import("./components/PaymentManagement")
);

const AdminSettings = lazy(
    () => import("./components/AdminSettings")
);


// ==================================================
// FACULTY COMPONENTS - LAZY LOAD
// ==================================================

const FacultyDashboard = lazy(
    () => import("./components/FacultyDashboard")
);

const FacultyMyCourses = lazy(
    () => import("./components/FacultyMyCourses")
);

const FacultyCourseContent = lazy(
    () => import("./components/FacultyCourseContent")
);

const FacultyCourseDetails = lazy(
    () => import("./components/FacultyCourseDetails")
);

const FacultyStudents = lazy(
    () => import("./components/FacultyStudents")
);

const FacultyStudentProgress = lazy(
    () => import("./components/FacultyStudentProgress")
);

const FacultyQuizManagement = lazy(
    () => import("./components/FacultyQuizManagement")
);

const FacultyNotifications = lazy(
    () => import("./components/FacultyNotifications")
);

const FacultyProfile = lazy(
    () => import("./components/FacultyProfile")
);

const FacultyStudentDetails = lazy(
    () => import("./components/FacultyStudentDetails")
);


// ==================================================
// LOADING COMPONENT
// ==================================================

const PageLoader = () => {

    return (
        <div className="page-loader">

            <div className="page-loader-spinner"></div>

            <p>
                Loading...
            </p>

        </div>
    );
};


// ==================================================
// STUDENT LAYOUT
// ==================================================

const MainLayout = () => {

    return (

        <div className="app">

            <Header />

            <Sidebar />

            <main className="main-content">

                <Outlet />

            </main>

            <Footer />

        </div>
    );
};


// ==================================================
// ADDED: STUDENT ROUTE LAYOUT WITH AI ASSISTANT
// ==================================================

const StudentLayout = () => {

    return (
        <>
            <Outlet />
            <AIAssistant />
        </>
    );
};


// ==================================================
// ADMIN LAYOUT
// ==================================================

const AdminLayout = () => {

    return (

        <div className="admin-layout">

            <AdminSidebar />

            <main className="admin-main">

                <header className="admin-header">

                    <h2>
                        Overview
                    </h2>

                    <div className="admin-profile">

                        <div className="admin-avatar">
                            AD
                        </div>

                        <span>
                            Admin
                        </span>

                    </div>

                </header>

                <div className="dashboard-content-area">

                    <Outlet />

                </div>

            </main>

        </div>
    );
};


// ==================================================
// APP
// ==================================================

function App() {

    return (

        <BrowserRouter>

            <ScrollToTop />

            <Suspense
                fallback={<PageLoader />}
            >

                <Routes>


                    {/* =====================================
                        LOGIN / REGISTER
                    ===================================== */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Registration />}
                    />

                    <Route
                        path="/admin-login"
                        element={<AdminLogin />}
                    />


                    {/* =====================================
                        STUDENT ONLY ROUTES
                    ===================================== */}

                    <Route
                        element={
                            <RoleProtectedRoute
                                allowedRole="student"
                            />
                        }
                    >

                        {/* ADDED: WRAP ALL STUDENT ROUTES */}

                        <Route
                            element={<StudentLayout />}
                        >

                            {/* STUDENT MAIN LAYOUT */}

                            <Route
                                element={<MainLayout />}
                            >

                                <Route
                                    path="/"
                                    element={<Dashboard />}
                                />

                                <Route
                                    path="/courses"
                                    element={<Mycourses />}
                                />

                                <Route
                                    path="/browse"
                                    element={<Browse />}
                                />

                                <Route
                                    path="/progress"
                                    element={<Progress />}
                                />

                                <Route
                                    path="/certificates"
                                    element={<Certificates />}
                                />

                                <Route
                                    path="/help"
                                    element={<Help />}
                                />

                                <Route
                                    path="/settings"
                                    element={<Settings />}
                                />

                            </Route>


                            {/* STUDENT COURSE DETAILS */}

                            <Route
                                path="/course-details"
                                element={<CourseDetails />}
                            />


                            {/* STUDENT QUIZZES */}

                            <Route
                                path="/student-quizzes"
                                element={<StudentQuizzes />}
                            />


                            {/* STUDENT QUIZ ATTEMPT */}

                            <Route
                                path="/student-quiz/:id"
                                element={<StudentQuizAttempt />}
                            />


                            {/* STUDENT QUIZ RESULT */}

                            <Route
                                path="/student-quiz-result/:attemptId"
                                element={<StudentQuizResult />}
                            />


                            {/* PAYMENT */}

                            <Route
                                path="/payment"
                                element={<Payment />}
                            />


                            {/* COURSE LEARNING */}

                            <Route
                                path="/course-learning"
                                element={<CourseLearning />}
                            />


                            {/* CERTIFICATE VIEW */}

                            <Route
                                path="/certificate-view"
                                element={<CertificateView />}
                            />

                        </Route>

                    </Route>


                    {/* =====================================
                        FACULTY ONLY ROUTES
                    ===================================== */}

                    <Route
                        element={
                            <RoleProtectedRoute
                                allowedRole="faculty"
                            />
                        }
                    >

                        {/* FACULTY DASHBOARD */}

                        <Route
                            path="/faculty"
                            element={<FacultyDashboard />}
                        />


                        {/* FACULTY COURSE CONTENT */}

                        <Route
                            path="/faculty/course-content"
                            element={<FacultyCourseContent />}
                        />


                        {/* FACULTY COURSES */}

                        <Route
                            path="/faculty/courses"
                            element={<FacultyMyCourses />}
                        />


                        {/* FACULTY COURSE DETAILS */}

                        <Route
                            path="/faculty/course-details"
                            element={<FacultyCourseDetails />}
                        />


                        {/* FACULTY STUDENTS */}

                        <Route
                            path="/faculty/students"
                            element={<FacultyStudents />}
                        />


                        {/* FACULTY PROGRESS */}

                        <Route
                            path="/faculty/progress"
                            element={<FacultyStudentProgress />}
                        />


                        {/* FACULTY QUIZ */}

                        <Route
                            path="/faculty/quiz"
                            element={<FacultyQuizManagement />}
                        />


                        {/* FACULTY NOTIFICATIONS */}

                        <Route
                            path="/faculty/notifications"
                            element={<FacultyNotifications />}
                        />


                        {/* FACULTY PROFILE */}

                        <Route
                            path="/faculty/profile"
                            element={<FacultyProfile />}
                        />


                        {/* FACULTY STUDENT DETAILS */}

                        <Route
                            path="/faculty/student-details"
                            element={<FacultyStudentDetails />}
                        />

                    </Route>


                    {/* =====================================
                        ADMIN ROUTES
                    ===================================== */}

                    <Route
                        element={<AdminProtectedRoute />}
                    >

                        <Route
                            path="/admin"
                            element={<AdminLayout />}
                        >

                            {/* ADMIN DASHBOARD */}

                            <Route
                                index
                                element={<AdminDashboard />}
                            />


                            {/* MANAGE COURSES */}

                            <Route
                                path="courses"
                                element={<ManageCourse />}
                            />


                            {/* FACULTY MANAGEMENT */}

                            <Route
                                path="faculty"
                                element={<FacultyManagement />}
                            />


                            {/* ADMIN SETTINGS */}

                            <Route
                                path="settings"
                                element={<AdminSettings />}
                            />


                            {/* STUDENT MANAGEMENT */}

                            <Route
                                path="student"
                                element={<StudentManagement />}
                            />


                            {/* PAYMENT MANAGEMENT */}

                            <Route
                                path="payment"
                                element={<PaymentManagement />}
                            />

                        </Route>

                    </Route>

                </Routes>

            </Suspense>

        </BrowserRouter>
    );
}

export default App;