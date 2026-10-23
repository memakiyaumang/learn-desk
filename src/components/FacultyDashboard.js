import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    LayoutDashboard,
    BookOpen,
    Users,
    ChartNoAxesCombined,
    ClipboardCheck,
    Bell,
    UserRound,
    LogOut,
    BookMarked,
    UsersRound,
    BadgeCheck,
    LibraryBig,
    ArrowUpRight,
    MoreVertical,
    GraduationCap
} from "lucide-react";

import "../css/FacultyDashboard.css";


const FacultyDashboard = () => {

    const navigate =
        useNavigate();


    // ==================================================
    // Get Faculty Session
    // ==================================================
    const getFacultySession = () => {

        try {

            return JSON.parse(
                sessionStorage.getItem(
                    "facultySession"
                ) || "null"
            );

        } catch (error) {

            console.error(
                "Unable to read faculty session:",
                error
            );

            return null;

        }

    };


    // ==================================================
    // Get Faculty JWT Token
    // ==================================================
    const getFacultyToken = () => {

        const facultyToken =
            localStorage.getItem(
                "facultyToken"
            );

        if (facultyToken) {
            return facultyToken;
        }

        return null;

    };


    // ==================================================
    // Faculty State
    // ==================================================
    const [
        loggedInUser,
        setLoggedInUser
    ] = useState(
        getFacultySession()
    );


    // ==================================================
    // Dashboard State
    // ==================================================
    const [
        dashboardData,
        setDashboardData
    ] = useState({
        statistics: {
            totalCourses: 0,
            totalStudents: 0,
            publishedCourses: 0,
            draftCourses: 0,
            totalLessons: 0
        },

        courses: [],

        recentStudents: [],

        progress: []
    });


    const [
        loading,
        setLoading
    ] = useState(true);


    // ==================================================
    // Listen For Login Changes
    // ==================================================
    useEffect(() => {

        const handleUserChange = () => {

            const user =
                getFacultySession();

            setLoggedInUser(user);

        };


        window.addEventListener(
            "userLoginChanged",
            handleUserChange
        );


        window.addEventListener(
            "storage",
            handleUserChange
        );


        return () => {

            window.removeEventListener(
                "userLoginChanged",
                handleUserChange
            );


            window.removeEventListener(
                "storage",
                handleUserChange
            );

        };

    }, []);


    // ==================================================
    // Faculty Name
    // ==================================================
    const facultyName =
        loggedInUser?.name ||
        loggedInUser?.fullName ||
        loggedInUser?.username ||
        loggedInUser?.userName ||
        "Faculty";


    // ==================================================
    // Faculty ID
    // ==================================================
    const facultyId =
        loggedInUser?._id ||
        loggedInUser?.id ||
        loggedInUser?.userId ||
        "";


    // ==================================================
    // Get Faculty Dashboard Data
    // ==================================================
    useEffect(() => {

        const fetchDashboardData =
            async () => {

                if (!facultyId) {

                    setDashboardData({
                        statistics: {
                            totalCourses: 0,
                            totalStudents: 0,
                            publishedCourses: 0,
                            draftCourses: 0,
                            totalLessons: 0
                        },
                        courses: [],
                        recentStudents: [],
                        progress: []
                    });

                    setLoading(false);

                    return;
                }


                try {

                    setLoading(true);


                    // ============================================
                    // FACULTY JWT TOKEN
                    // ============================================

                    const facultyToken =
                        getFacultyToken();


                    const response =
                        await fetch(
                            `https://project-final-backend-oeh1.onrender.com/api/faculty-dashboard/${facultyId}`,
                            {
                                method: "GET",

                                headers: {
                                    Authorization:
                                        `Bearer ${facultyToken}`,

                                    "Content-Type":
                                        "application/json"
                                }
                            }
                        );


                    const result =
                        await response.json();


                    // ============================================
                    // UNAUTHORIZED FACULTY
                    // ============================================

                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {

                        sessionStorage.removeItem(
                            "facultySession"
                        );

                        localStorage.removeItem(
                            "facultyToken"
                        );

                        window.dispatchEvent(
                            new Event(
                                "userLoginChanged"
                            )
                        );

                        navigate(
                            "/login",
                            {
                                replace: true
                            }
                        );

                        return;

                    }


                    if (
                        response.ok &&
                        result.success
                    ) {

                        setDashboardData({
                            statistics:
                                result.data?.statistics ||
                                {
                                    totalCourses: 0,
                                    totalStudents: 0,
                                    publishedCourses: 0,
                                    draftCourses: 0,
                                    totalLessons: 0
                                },

                            courses:
                                result.data?.courses ||
                                [],

                            recentStudents:
                                result.data?.recentStudents ||
                                [],

                            progress:
                                result.data?.progress ||
                                []
                        });

                    } else {

                        console.error(
                            result.message ||
                            "Unable to load faculty dashboard"
                        );

                        setDashboardData({
                            statistics: {
                                totalCourses: 0,
                                totalStudents: 0,
                                publishedCourses: 0,
                                draftCourses: 0,
                                totalLessons: 0
                            },
                            courses: [],
                            recentStudents: [],
                            progress: []
                        });

                    }

                } catch (error) {

                    console.error(
                        "Faculty dashboard error:",
                        error
                    );

                    setDashboardData({
                        statistics: {
                            totalCourses: 0,
                            totalStudents: 0,
                            publishedCourses: 0,
                            draftCourses: 0,
                            totalLessons: 0
                        },
                        courses: [],
                        recentStudents: [],
                        progress: []
                    });

                } finally {

                    setLoading(false);

                }

            };


        fetchDashboardData();

    }, [facultyId, navigate]);


    // ==================================================
    // Logout
    // ==================================================
    const handleLogout = () => {

        sessionStorage.removeItem(
            "facultySession"
        );

        localStorage.removeItem(
            "facultyToken"
        );


        window.dispatchEvent(
            new Event(
                "userLoginChanged"
            )
        );


        navigate(
            "/login",
            {
                replace: true
            }
        );

    };


    // ==================================================
    // Navigation
    // ==================================================
    const handleNavigation = (
        path
    ) => {

        navigate(path);

    };


    // ==================================================
    // Statistics
    // ==================================================
    const statistics =
        dashboardData.statistics ||
        {};


    const totalCourses =
        Number(
            statistics.totalCourses ||
            0
        );


    const totalStudents =
        Number(
            statistics.totalStudents ||
            0
        );


    const publishedCourses =
        Number(
            statistics.publishedCourses ||
            0
        );


    const draftCourses =
        Number(
            statistics.draftCourses ||
            0
        );


    const totalLessons =
        Number(
            statistics.totalLessons ||
            0
        );


    // ==================================================
    // Course List
    // ==================================================
    const courses =
        dashboardData.courses ||
        [];


    // ==================================================
    // Recent Students
    // ==================================================
    const recentStudents =
        dashboardData.recentStudents ||
        [];


    // ==================================================
    // Progress
    // ==================================================
    const progress =
        dashboardData.progress ||
        [];


    // ==================================================
    // Student Display Name
    // ==================================================
    const getStudentName = (
        student
    ) => {

        /*
         * Backend now sends:
         *
         * studentName: student.name
         *
         * So studentName is checked first.
         */

        if (
            student?.studentName &&
            String(
                student.studentName
            ).trim()
        ) {

            return String(
                student.studentName
            ).trim();

        }


        if (
            student?.name &&
            String(
                student.name
            ).trim()
        ) {

            return String(
                student.name
            ).trim();

        }


        if (
            student?.studentEmail &&
            String(
                student.studentEmail
            ).trim()
        ) {

            return String(
                student.studentEmail
            ).trim();

        }


        return "Student";

    };


    // ==================================================
    // Student Initials
    // ==================================================
    const getStudentInitials = (
        student
    ) => {

        const name =
            getStudentName(
                student
            );


        if (
            !name ||
            name === "Student"
        ) {

            return "ST";

        }


        const parts =
            name
                .trim()
                .split(/\s+/);


        if (
            parts.length >= 2
        ) {

            return (
                parts[0]
                    .charAt(0) +
                parts[1]
                    .charAt(0)
            ).toUpperCase();

        }


        return name
            .substring(0, 2)
            .toUpperCase();

    };


    // ==================================================
    // Relative Time
    // ==================================================
    const getRelativeTime = (
        date
    ) => {

        if (!date) {

            return "";

        }


        const createdTime =
            new Date(date).getTime();


        if (
            Number.isNaN(
                createdTime
            )
        ) {

            return "";

        }


        const difference =
            Date.now() -
            createdTime;


        const minutes =
            Math.floor(
                difference /
                (1000 * 60)
            );


        if (
            minutes < 1
        ) {

            return "Just now";

        }


        if (
            minutes < 60
        ) {

            return `${minutes} min ago`;

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (
            hours < 24
        ) {

            return `${hours} hour${hours > 1 ? "s" : ""} ago`;

        }


        const days =
            Math.floor(
                hours / 24
            );


        return `${days} day${days > 1 ? "s" : ""} ago`;

    };


    // ==================================================
    // Status Text
    // ==================================================
    const getCourseStatus =
        (status) => {

            const value =
                String(
                    status || "draft"
                ).toLowerCase();


            if (
                value === "published"
            ) {

                return "Published";

            }


            if (
                value === "pending"
            ) {

                return "Pending";

            }


            if (
                value === "rejected"
            ) {

                return "Rejected";

            }


            return "Draft";

        };


    // ==================================================
    // Status Class
    // ==================================================
    const getCourseStatusClass =
        (status) => {

            const value =
                String(
                    status || "draft"
                ).toLowerCase();


            if (
                value === "published"
            ) {

                return "published";

            }


            return "draft";

        };


    return (

        <div className="faculty-dashboard">


            {/* ================= SIDEBAR ================= */}

            <aside className="faculty-sidebar">


                {/* Logo */}

                <div className="faculty-logo">

                    <span className="faculty-brand-mark"></span>

                    <span className="faculty-brand-text">
                        LearnDesk
                    </span>

                </div>


                {/* Navigation */}

                <nav className="faculty-nav">


                    {/* Dashboard */}

                    <div
                        className="faculty-nav-item active"
                        onClick={() =>
                            handleNavigation(
                                "/faculty"
                            )
                        }
                    >

                        <LayoutDashboard
                            size={20}
                            strokeWidth={2}
                        />

                        <span>
                            Dashboard
                        </span>

                    </div>


                    {/* My Courses */}

                    <div
                        className="faculty-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/faculty/courses"
                            )
                        }
                    >

                        <BookOpen
                            size={20}
                            strokeWidth={2}
                        />

                        <span>
                            My Courses
                        </span>

                    </div>


                    {/* Students */}

                    <div
                        className="faculty-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/faculty/students"
                            )
                        }
                    >

                        <Users
                            size={20}
                            strokeWidth={2}
                        />

                        <span>
                            Students
                        </span>

                    </div>


                    {/* Student Progress */}

                    <div
                        className="faculty-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/faculty/progress"
                            )
                        }
                    >

                        <ChartNoAxesCombined
                            size={20}
                            strokeWidth={2}
                        />

                        <span>
                            Student Progress
                        </span>

                    </div>


                    {/* Quiz Management */}

                    <div
                        className="faculty-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/faculty/quiz"
                            )
                        }
                    >

                        <ClipboardCheck
                            size={20}
                            strokeWidth={2}
                        />

                        <span>
                            Quiz Management
                        </span>

                    </div>


                    


                    {/* Profile */}

                    <div
                        className="faculty-nav-item"
                        onClick={() =>
                            handleNavigation(
                                "/faculty/profile"
                            )
                        }
                    >

                        <UserRound
                            size={20}
                            strokeWidth={2}
                        />

                        <span>
                            Profile
                        </span>

                    </div>

                </nav>


                {/* Logout */}

                <div
                    className="faculty-nav-item faculty-logout"
                    onClick={handleLogout}
                >

                    <LogOut
                        size={20}
                        strokeWidth={2}
                    />

                    <span>
                        Logout
                    </span>

                </div>

            </aside>


            {/* ================= MAIN CONTENT ================= */}

            <main className="faculty-main">


                {/* Header */}

                <header className="faculty-header">

                    <div className="faculty-welcome">

                        <h1>
                            Welcome back, {facultyName}!
                        </h1>

                        <p>
                            Here's what's happening with your courses today.
                        </p>

                    </div>


                    <div className="faculty-user">

                        <div className="faculty-avatar">

                            {facultyName
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div>

                            <strong>
                                {facultyName}
                            </strong>

                            <span>
                                Faculty
                            </span>

                        </div>

                    </div>

                </header>


                {/* ================= STATISTICS ================= */}

                <section className="faculty-stats">


                    {/* Total Courses */}

                    <div className="faculty-stat-card">

                        <div className="stat-icon purple">

                            <BookMarked
                                size={24}
                                strokeWidth={2}
                            />

                        </div>


                        <div className="stat-content">

                            <span>
                                Total Courses
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : totalCourses}
                            </h2>

                            <small>

                                <ArrowUpRight
                                    size={14}
                                />

                                Your courses

                            </small>

                        </div>

                    </div>


                    {/* Total Students */}

                    <div className="faculty-stat-card">

                        <div className="stat-icon blue">

                            <UsersRound
                                size={24}
                                strokeWidth={2}
                            />

                        </div>


                        <div className="stat-content">

                            <span>
                                Total Students
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : totalStudents}
                            </h2>

                            <small>

                                <Users
                                    size={14}
                                />

                                Across your courses

                            </small>

                        </div>

                    </div>


                    {/* Published Courses */}

                    <div className="faculty-stat-card">

                        <div className="stat-icon green">

                            <BadgeCheck
                                size={24}
                                strokeWidth={2}
                            />

                        </div>


                        <div className="stat-content">

                            <span>
                                Published Courses
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : publishedCourses}
                            </h2>

                            <small>
                                {draftCourses} drafts remaining
                            </small>

                        </div>

                    </div>


                    {/* Total Lessons */}

                    <div className="faculty-stat-card">

                        <div className="stat-icon orange">

                            <LibraryBig
                                size={24}
                                strokeWidth={2}
                            />

                        </div>


                        <div className="stat-content">

                            <span>
                                Total Lessons
                            </span>

                            <h2>
                                {loading
                                    ? "..."
                                    : totalLessons}
                            </h2>

                            <small>
                                Across all courses
                            </small>

                        </div>

                    </div>

                </section>


                {/* ================= DASHBOARD GRID ================= */}

                <section className="faculty-dashboard-grid">


                    {/* Course Overview */}

                    <div className="faculty-card">

                        <div className="faculty-card-header">

                            <div>

                                <h3>
                                    Course Overview
                                </h3>

                                <p>
                                    Your recently updated courses
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    handleNavigation(
                                        "/faculty/courses"
                                    )
                                }
                            >
                                View All
                            </button>

                        </div>


                        <div className="course-list">


                            {loading ? (

                                <div
                                    style={{
                                        padding: "20px 2px",
                                        color: "#929aaa",
                                        fontSize: "12px"
                                    }}
                                >
                                    Loading courses...
                                </div>

                            ) : courses.length === 0 ? (

                                <div
                                    style={{
                                        padding: "20px 2px",
                                        color: "#929aaa",
                                        fontSize: "12px"
                                    }}
                                >
                                    No courses found.
                                </div>

                            ) : (

                                courses
                                    .slice(0, 4)
                                    .map(
                                        (
                                            course,
                                            index
                                        ) => {

                                            const iconClasses = [
                                                "purple",
                                                "blue",
                                                "green",
                                                "orange"
                                            ];


                                            const Icon =
                                                index === 1
                                                    ? GraduationCap
                                                    : index === 2
                                                        ? ChartNoAxesCombined
                                                        : index === 3
                                                            ? ClipboardCheck
                                                            : BookOpen;


                                            return (

                                                <div
                                                    className="course-row"
                                                    key={
                                                        course._id
                                                    }
                                                >

                                                    <div
                                                        className={`course-icon ${iconClasses[index % 4]}`}
                                                    >

                                                        <Icon
                                                            size={21}
                                                            strokeWidth={2}
                                                        />

                                                    </div>


                                                    <div className="course-info">

                                                        <h4>
                                                            {
                                                                course.title
                                                            }
                                                        </h4>

                                                        <span>
                                                            {
                                                                course.lessonCount
                                                            } Lessons •{" "}
                                                            {
                                                                course.studentCount
                                                            } Students
                                                        </span>

                                                    </div>


                                                    <div
                                                        className={`course-status ${getCourseStatusClass(course.status)}`}
                                                    >
                                                        {
                                                            getCourseStatus(
                                                                course.status
                                                            )
                                                        }
                                                    </div>


                                                    <MoreVertical
                                                        size={19}
                                                        className="course-menu"
                                                    />

                                                </div>

                                            );

                                        }
                                    )

                            )}

                        </div>

                    </div>


                    {/* Recent Students */}

                    <div className="faculty-card">

                        <div className="faculty-card-header">

                            <div>

                                <h3>
                                    Recent Students
                                </h3>

                                <p>
                                    Recently enrolled students
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    handleNavigation(
                                        "/faculty/students"
                                    )
                                }
                            >
                                View All
                            </button>

                        </div>


                        <div className="student-list">


                            {loading ? (

                                <div
                                    style={{
                                        padding: "20px 2px",
                                        color: "#929aaa",
                                        fontSize: "12px"
                                    }}
                                >
                                    Loading students...
                                </div>

                            ) : recentStudents.length === 0 ? (

                                <div
                                    style={{
                                        padding: "20px 2px",
                                        color: "#929aaa",
                                        fontSize: "12px"
                                    }}
                                >
                                    No students enrolled yet.
                                </div>

                            ) : (

                                recentStudents
                                    .slice(0, 4)
                                    .map(
                                        (
                                            student
                                        ) => (

                                            <div
                                                className="student-row"
                                                key={
                                                    student._id
                                                }
                                            >

                                                <div className="student-avatar">

                                                    {
                                                        getStudentInitials(
                                                            student
                                                        )
                                                    }

                                                </div>


                                                <div>

                                                    <h4>
                                                        {
                                                            getStudentName(
                                                                student
                                                            )
                                                        }
                                                    </h4>

                                                    <span>
                                                        {
                                                            student.courseName
                                                        }
                                                    </span>

                                                </div>


                                                <small>
                                                    {
                                                        getRelativeTime(
                                                            student.createdAt
                                                        )
                                                    }
                                                </small>

                                            </div>

                                        )
                                    )

                            )}

                        </div>

                    </div>

                </section>


                {/* ================= BOTTOM GRID ================= */}

                <section className="faculty-bottom-grid">


                    {/* Student Progress */}

                    <div className="faculty-card">

                        <div className="faculty-card-header">

                            <div>

                                <h3>
                                    Student Progress
                                </h3>

                                <p>
                                    Overall course completion
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    handleNavigation(
                                        "/faculty/progress"
                                    )
                                }
                            >
                                Details
                            </button>

                        </div>


                        <div className="progress-list">


                            {loading ? (

                                <div
                                    style={{
                                        padding: "20px 2px",
                                        color: "#929aaa",
                                        fontSize: "12px"
                                    }}
                                >
                                    Loading progress...
                                </div>

                            ) : progress.length === 0 ? (

                                <div
                                    style={{
                                        padding: "20px 2px",
                                        color: "#929aaa",
                                        fontSize: "12px"
                                    }}
                                >
                                    No progress data available.
                                </div>

                            ) : (

                                progress
                                    .slice(0, 4)
                                    .map(
                                        (
                                            item
                                        ) => {

                                            const percentage =
                                                Math.min(
                                                    100,
                                                    Math.max(
                                                        0,
                                                        Number(
                                                            item.progress ||
                                                            0
                                                        )
                                                    )
                                                );


                                            return (

                                                <div
                                                    className="progress-item"
                                                    key={
                                                        item.courseId
                                                    }
                                                >

                                                    <div className="progress-header">

                                                        <span>
                                                            {
                                                                item.courseName
                                                            }
                                                        </span>

                                                        <strong>
                                                            {
                                                                percentage
                                                            }%
                                                        </strong>

                                                    </div>


                                                    <div className="progress-bar">

                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${percentage}%`
                                                            }}
                                                        ></div>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )

                            )}

                        </div>

                    </div>


                    {/* Recent Activity */}

                    <div className="faculty-card">

                        <div className="faculty-card-header">

                            <div>

                                <h3>
                                    Recent Activity
                                </h3>

                                <p>
                                    Latest updates
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    handleNavigation(
                                        "/faculty/notifications"
                                    )
                                }
                            >
                                View All
                            </button>

                        </div>


                        <div className="activity-list">


                            {recentStudents.length > 0 ? (

                                recentStudents
                                    .slice(0, 4)
                                    .map(
                                        (
                                            student
                                        ) => (

                                            <div
                                                className="activity-item"
                                                key={
                                                    `activity-${student._id}`
                                                }
                                            >

                                                <div className="activity-icon">

                                                    <Users
                                                        size={19}
                                                        strokeWidth={2}
                                                    />

                                                </div>


                                                <div>

                                                    <p>

                                                        <strong>
                                                            {
                                                                getStudentName(
                                                                    student
                                                                )
                                                            }
                                                        </strong>{" "}

                                                        joined{" "}

                                                        <strong>
                                                            {
                                                                student.courseName
                                                            }
                                                        </strong>

                                                    </p>

                                                    <span>
                                                        {
                                                            getRelativeTime(
                                                                student.createdAt
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        )
                                    )

                            ) : (

                                <div
                                    style={{
                                        padding: "20px 2px",
                                        color: "#929aaa",
                                        fontSize: "12px"
                                    }}
                                >
                                    No recent activity.
                                </div>

                            )}

                        </div>

                    </div>

                </section>

            </main>

        </div>

    );

};


export default FacultyDashboard;