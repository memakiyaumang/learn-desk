
import React, { lazy, Suspense } from "react";

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

import AIAssistant from "./components/AIAssistant";

import "./App.css";


// ==================================================
// PUBLIC COMPONENTS
// ==================================================

const Home = lazy(() => import("./components/Home"));


// ==================================================
// STUDENT COMPONENTS
// ==================================================

const Dashboard = lazy(() => import("./components/Dashboard"));
const Mycourses = lazy(() => import("./components/Mycourses"));
const Browse = lazy(() => import("./components/Browse"));
const Help = lazy(() => import("./components/Help"));
const Progress = lazy(() => import("./components/Progress"));
const Certificates = lazy(() => import("./components/Certificates"));
const CourseDetails = lazy(() => import("./components/CourseDetails"));
const CourseLearning = lazy(() => import("./components/CourseLearning"));
const Payment = lazy(() => import("./components/Payment"));
const StudentQuizzes = lazy(() => import("./components/StudentQuizzes"));
const StudentQuizAttempt = lazy(() => import("./components/StudentQuizAttempt"));
const StudentQuizResult = lazy(() => import("./components/StudentQuizResult"));
const CertificateView = lazy(() => import("./components/CertificateView"));


// ==================================================
// LOGIN / REGISTRATION
// ==================================================

const Login = lazy(() => import("./components/Login"));
const Registration = lazy(() => import("./components/Registration"));


// ==================================================
// ADMIN COMPONENTS
// ==================================================

const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const ManageCourse = lazy(() => import("./components/ManageCourse"));
const Settings = lazy(() => import("./components/Settings"));
const FacultyManagement = lazy(() => import("./components/FacultyManagement"));
const StudentManagement = lazy(() => import("./components/StudentManagement"));
const PaymentManagement = lazy(() => import("./components/PaymentManagement"));
const AdminSettings = lazy(() => import("./components/AdminSettings"));


// ==================================================
// FACULTY COMPONENTS
// ==================================================

const FacultyDashboard = lazy(() => import("./components/FacultyDashboard"));
const FacultyMyCourses = lazy(() => import("./components/FacultyMyCourses"));
const FacultyCourseContent = lazy(() => import("./components/FacultyCourseContent"));
const FacultyCourseDetails = lazy(() => import("./components/FacultyCourseDetails"));
const FacultyStudents = lazy(() => import("./components/FacultyStudents"));
const FacultyStudentProgress = lazy(() => import("./components/FacultyStudentProgress"));
const FacultyQuizManagement = lazy(() => import("./components/FacultyQuizManagement"));
const FacultyNotifications = lazy(() => import("./components/FacultyNotifications"));
const FacultyProfile = lazy(() => import("./components/FacultyProfile"));
const FacultyStudentDetails = lazy(() => import("./components/FacultyStudentDetails"));


// ==================================================
// LOADING COMPONENT
// ==================================================

const PageLoader = () => {
    return (
        <div className="page-loader">
            <div className="page-loader-spinner"></div>
            <p>Loading...</p>
        </div>
    );
};


// ==================================================
// PUBLIC LAYOUT
// ==================================================

const PublicLayout = () => {
    return (
        <div className="public-app">
            <Header />

            <main className="public-main">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};


// ==================================================
// STUDENT MAIN LAYOUT
// ==================================================

const MainLayout = () => {
    return (
        <div className="app">
            <Header />

            <Sidebar role="student" />

            <main className="main-content">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};


// ==================================================
// STUDENT LAYOUT WITH AI ASSISTANT
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
// FACULTY LAYOUT
// ==================================================

const FacultyLayout = () => {
    return (
        <div className="faculty-dashboard">
            <Sidebar role="faculty" />

            <Outlet />
        </div>
    );
};


// ==================================================
// ADMIN LAYOUT
// ==================================================

const AdminLayout = () => {
    return (
        <div className="admin-layout">

            <Sidebar role="admin" />

            <main className="admin-main">

                <header className="admin-header">
                    <h2>Overview</h2>

                    <div className="admin-profile">
                        <div className="admin-avatar">
                            AD
                        </div>

                        <span>Admin</span>
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
// NOT FOUND PAGE
// ==================================================

const NotFound = () => {
    return (
        <div
            style={{
                minHeight: "70vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "30px"
            }}
        >
            <h1>404</h1>
            <h2>Page Not Found</h2>

            <p>
                The page you are looking for does not exist.
            </p>

            <a href="/">
                Go to Home
            </a>
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

            <Suspense fallback={<PageLoader />}>

                <Routes>

                    {/* =====================================
                        PUBLIC ROUTES
                    ===================================== */}

                    <Route element={<PublicLayout />}>

                        <Route
                            path="/"
                            element={<Home />}
                        />

                        <Route
                            path="/browse"
                            element={<Browse />}
                        />

                        <Route
                            path="/course-details/:courseId"
                            element={<CourseDetails />}
                        />

                    </Route>


                    {/* =====================================
                        LOGIN / REGISTRATION
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
                            <RoleProtectedRoute allowedRole="student" />
                        }
                    >

                        <Route element={<StudentLayout />}>

                            <Route element={<MainLayout />}>

                                <Route
                                    path="/dashboard"
                                    element={<Dashboard />}
                                />

                                <Route
                                    path="/courses"
                                    element={<Mycourses />}
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


                            <Route
                                path="/student-quizzes"
                                element={<StudentQuizzes />}
                            />

                            <Route
                                path="/student-quiz/:id"
                                element={<StudentQuizAttempt />}
                            />

                            <Route
                                path="/student-quiz-result/:attemptId"
                                element={<StudentQuizResult />}
                            />

                            <Route
                                path="/payment"
                                element={<Payment />}
                            />

                            <Route
                                path="/course-learning"
                                element={<CourseLearning />}
                            />

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
                            <RoleProtectedRoute allowedRole="faculty" />
                        }
                    >

                        <Route element={<FacultyLayout />}>

                            <Route
                                path="/faculty"
                                element={<FacultyDashboard />}
                            />

                            <Route
                                path="/faculty/course-content"
                                element={<FacultyCourseContent />}
                            />

                            <Route
                                path="/faculty/courses"
                                element={<FacultyMyCourses />}
                            />

                            <Route
                                path="/faculty/course-details"
                                element={<FacultyCourseDetails />}
                            />

                            <Route
                                path="/faculty/students"
                                element={<FacultyStudents />}
                            />

                            <Route
                                path="/faculty/progress"
                                element={<FacultyStudentProgress />}
                            />

                            <Route
                                path="/faculty/quiz"
                                element={<FacultyQuizManagement />}
                            />

                            <Route
                                path="/faculty/notifications"
                                element={<FacultyNotifications />}
                            />

                            <Route
                                path="/faculty/profile"
                                element={<FacultyProfile />}
                            />

                            <Route
                                path="/faculty/student-details"
                                element={<FacultyStudentDetails />}
                            />

                        </Route>

                    </Route>


                    {/* =====================================
                        ADMIN ROUTES
                    ===================================== */}

                    <Route element={<AdminProtectedRoute />}>

                        <Route
                            path="/admin"
                            element={<AdminLayout />}
                        >

                            <Route
                                index
                                element={<AdminDashboard />}
                            />

                            <Route
                                path="courses"
                                element={<ManageCourse />}
                            />

                            <Route
                                path="faculty"
                                element={<FacultyManagement />}
                            />

                            <Route
                                path="settings"
                                element={<AdminSettings />}
                            />

                            <Route
                                path="student"
                                element={<StudentManagement />}
                            />

                            <Route
                                path="payment"
                                element={<PaymentManagement />}
                            />

                        </Route>

                    </Route>


                    {/* =====================================
                        404 PAGE
                    ===================================== */}

                    <Route
                        path="*"
                        element={<NotFound />}
                    />

                </Routes>

            </Suspense>

        </BrowserRouter>
    );
}

export default App;
