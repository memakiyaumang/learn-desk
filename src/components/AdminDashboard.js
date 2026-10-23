import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Users,
    BookOpen,
    IndianRupee,
    UserPlus,
    GraduationCap,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    UserCheck,
} from "lucide-react";

import "../css/AdminDashboard.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const AdminDashboard = () => {

    // =========================================================
    // STATE
    // =========================================================

    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingEnrollments, setLoadingEnrollments] =
        useState(true);


    // =========================================================
    // ADMIN TOKEN
    // =========================================================

    const getAdminToken = () => {
        return localStorage.getItem("adminToken");
    };


    // =========================================================
    // ADMIN AUTH FAILURE
    // =========================================================

    const handleAdminAuthFailure = () => {

        localStorage.removeItem("adminToken");

        sessionStorage.removeItem("adminSession");
        sessionStorage.removeItem("isAdminLoggedIn");

        window.location.href = "/admin-login";
    };


    // =========================================================
    // LOAD USERS
    // =========================================================

    const loadUsers = async () => {

        try {

            setLoadingUsers(true);

            const token = getAdminToken();

            if (!token) {

                console.error(
                    "Admin token not found."
                );

                setUsers([]);

                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/get-userdata`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            console.log(
                "Admin Users API Response:",
                data
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleAdminAuthFailure();

                return;
            }

            if (!response.ok) {

                console.error(
                    "Users API Error:",
                    data.message
                );

                setUsers([]);

                return;
            }

            if (Array.isArray(data)) {

                setUsers(data);

            } else if (
                Array.isArray(data.data)
            ) {

                setUsers(data.data);

            } else if (
                Array.isArray(data.users)
            ) {

                setUsers(data.users);

            } else {

                setUsers([]);
            }

        } catch (error) {

            console.error(
                "Failed to load users:",
                error
            );

            setUsers([]);

        } finally {

            setLoadingUsers(false);
        }
    };


    // =========================================================
    // LOAD COURSES
    // =========================================================

    const loadCourses = async () => {

        try {

            setLoadingCourses(true);

            const token = getAdminToken();

            if (!token) {

                console.error(
                    "Admin token not found."
                );

                setCourses([]);

                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin-courses`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            console.log(
                "Admin Courses API Response:",
                data
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleAdminAuthFailure();

                return;
            }

            if (
                !response.ok ||
                !data.success
            ) {

                console.error(
                    "Admin Courses API Error:",
                    data.message
                );

                setCourses([]);

                return;
            }

            if (Array.isArray(data.data)) {

                console.log(
                    "MongoDB Courses:",
                    data.data
                );

                setCourses(data.data);

            } else {

                setCourses([]);
            }

        } catch (error) {

            console.error(
                "Failed to load courses:",
                error
            );

            setCourses([]);

        } finally {

            setLoadingCourses(false);
        }
    };


    // =========================================================
    // LOAD ALL ENROLLMENTS
    // =========================================================

    const loadEnrollments = async () => {

        try {

            setLoadingEnrollments(true);

            const token = getAdminToken();

            if (!token) {

                console.error(
                    "Admin token not found."
                );

                setEnrollments([]);

                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin-enrollments`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const data =
                await response.json();

            console.log(
                "Admin Enrollments API Response:",
                data
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleAdminAuthFailure();

                return;
            }

            if (
                !response.ok ||
                !data.success
            ) {

                console.error(
                    "Admin Enrollments API Error:",
                    data.message
                );

                setEnrollments([]);

                return;
            }

            if (Array.isArray(data.data)) {

                console.log(
                    "MongoDB Enrollments:",
                    data.data
                );

                console.log(
                    "Total Enrollments:",
                    data.data.length
                );

                setEnrollments(
                    data.data
                );

            } else {

                setEnrollments([]);
            }

        } catch (error) {

            console.error(
                "Failed to load enrollments:",
                error
            );

            setEnrollments([]);

        } finally {

            setLoadingEnrollments(false);
        }
    };


    // =========================================================
    // INITIAL DATA LOAD
    // =========================================================

    useEffect(() => {

        loadUsers();

        loadCourses();

        loadEnrollments();

    }, []);


    // =========================================================
    // STUDENTS
    // =========================================================

    const studentUsers = useMemo(() => {

        return users.filter((user) => {

            const role =
                String(
                    user.role || ""
                ).toLowerCase();

            return role === "student";

        });

    }, [users]);


    // =========================================================
    // FACULTY
    // =========================================================

    const facultyUsers = useMemo(() => {

        return users.filter((user) => {

            const role =
                String(
                    user.role || ""
                ).toLowerCase();

            return role === "faculty";

        });

    }, [users]);


    // =========================================================
    // TOTAL STUDENTS
    // =========================================================

    const totalStudents =
        studentUsers.length;


    // =========================================================
    // ACTIVE STUDENTS
    // =========================================================

    const activeStudents = useMemo(() => {

        return studentUsers.filter(
            (user) => {

                const status =
                    String(
                        user.status || ""
                    ).toLowerCase();

                return (
                    status === "approved" ||
                    status === "active" ||
                    user.isActive === true ||
                    user.active === true ||
                    !user.status
                );

            }
        ).length;

    }, [studentUsers]);


    // =========================================================
    // TOTAL FACULTY
    // =========================================================

    const totalFaculty =
        facultyUsers.length;


    // =========================================================
    // ACTIVE FACULTY
    // =========================================================

    const activeFaculty = useMemo(() => {

        return facultyUsers.filter(
            (user) => {

                const status =
                    String(
                        user.status || ""
                    ).toLowerCase();

                return (
                    status === "active" ||
                    user.isActive === true ||
                    user.active === true ||
                    !user.status
                );

            }
        ).length;

    }, [facultyUsers]);


    // =========================================================
    // TOTAL COURSES
    // =========================================================

    const totalCourses =
        courses.length;


    // =========================================================
    // ACTIVE COURSES
    // =========================================================

    const activeCourses =
        courses.filter((course) => {

            const status =
                String(
                    course.status || ""
                ).toLowerCase();

            return (
                status === "published" ||
                status === "active"
            );

        }).length;


    // =========================================================
    // DRAFT COURSES
    // =========================================================

    const draftCourses =
        courses.filter((course) => {

            return (
                String(
                    course.status || ""
                ).toLowerCase() === "draft"
            );

        }).length;


    // =========================================================
    // PENDING ENROLLMENTS
    //
    // Current Enrollment model માં status field નથી.
    //
    // તેથી:
    //
    // progress = 0
    // completed = false
    //
    // એટલે Pending Enrollment
    // =========================================================

    const pendingEnrollments = useMemo(() => {

        return enrollments.filter(
            (enrollment) => {

                const progress =
                    Number(
                        enrollment.progress
                    ) || 0;

                return (
                    progress === 0 &&
                    enrollment.completed !== true
                );

            }
        ).length;

    }, [enrollments]);


    // =========================================================
    // ACTIVE ENROLLMENTS
    // =========================================================

    const activeEnrollments = useMemo(() => {

        return enrollments.filter(
            (enrollment) => {

                const progress =
                    Number(
                        enrollment.progress
                    ) || 0;

                return (
                    progress > 0 &&
                    enrollment.completed !== true
                );

            }
        ).length;

    }, [enrollments]);


    // =========================================================
    // TOTAL REVENUE
    // =========================================================

    const totalRevenue = useMemo(() => {

        return enrollments.reduce(
            (total, enrollment) => {

                const course =
                    courses.find(
                        (item) =>
                            String(
                                item._id
                            ) ===
                            String(
                                enrollment.courseId
                            )
                    );

                if (
                    course &&
                    String(
                        course.courseType || ""
                    ).toLowerCase() === "paid"
                ) {

                    return (
                        total +
                        (
                            Number(
                                course.price
                            ) || 0
                        )
                    );
                }

                return total;

            },
            0
        );

    }, [enrollments, courses]);


    // =========================================================
    // COMPLETED COURSES
    // =========================================================

    const completedCourses =
        enrollments.filter(
            (enrollment) =>
                enrollment.completed === true
        ).length;


    // =========================================================
    // NEW ENROLLMENTS
    // CURRENT MONTH
    // =========================================================

    const newEnrollments = useMemo(() => {

        const now = new Date();

        const currentMonth =
            now.getMonth();

        const currentYear =
            now.getFullYear();

        return enrollments.filter(
            (enrollment) => {

                const dateValue =
                    enrollment.createdAt ||
                    enrollment.enrolledDate ||
                    enrollment.updatedAt;

                if (!dateValue) {
                    return false;
                }

                const date =
                    new Date(dateValue);

                if (
                    isNaN(
                        date.getTime()
                    )
                ) {
                    return false;
                }

                return (
                    date.getMonth() ===
                        currentMonth &&
                    date.getFullYear() ===
                        currentYear
                );

            }
        ).length;

    }, [enrollments]);


    // =========================================================
    // STUDENT NAME
    // =========================================================

    const getStudentName = (
        enrollment
    ) => {

        if (
            enrollment.studentName
        ) {

            return enrollment.studentName;
        }

        const student =
            users.find((user) => {

                const userId =
                    user._id ||
                    user.id ||
                    user.userId;

                return (
                    String(userId) ===
                    String(
                        enrollment.studentId
                    )
                );

            });

        if (student) {

            return (
                student.name ||
                student.fullName ||
                student.username ||
                student.email ||
                "Unknown Student"
            );
        }

        if (
            enrollment.studentEmail
        ) {

            const emailStudent =
                users.find((user) => {

                    return (
                        String(
                            user.email || ""
                        ).toLowerCase() ===
                        String(
                            enrollment.studentEmail
                        ).toLowerCase()
                    );

                });

            if (emailStudent) {

                return (
                    emailStudent.name ||
                    emailStudent.fullName ||
                    emailStudent.username ||
                    emailStudent.email ||
                    "Unknown Student"
                );
            }
        }

        return (
            enrollment.studentEmail ||
            "Unknown Student"
        );
    };


    // =========================================================
    // COURSE NAME
    // =========================================================

    const getCourseName = (
        enrollment
    ) => {

        if (
            enrollment.courseName
        ) {

            return enrollment.courseName;
        }

        if (
            enrollment.course &&
            enrollment.course.title
        ) {

            return enrollment.course.title;
        }

        const course =
            courses.find((item) => {

                return (
                    String(item._id) ===
                    String(
                        enrollment.courseId
                    )
                );

            });

        if (course) {

            return (
                course.title ||
                course.name ||
                "Unknown Course"
            );
        }

        return "Unknown Course";
    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (
        dateValue
    ) => {

        if (!dateValue) {
            return "-";
        }

        const date =
            new Date(dateValue);

        if (
            isNaN(
                date.getTime()
            )
        ) {

            return "-";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =========================================================
    // ENROLLMENT STATUS
    // =========================================================

    const getEnrollmentStatus = (
        enrollment
    ) => {

        if (
            enrollment.completed === true
        ) {

            return "Completed";
        }

        const progress =
            Number(
                enrollment.progress
            ) || 0;

        if (progress === 0) {

            return "Pending";
        }

        return "Active";
    };


    // =========================================================
    // RECENT ENROLLMENTS
    // =========================================================

    const recentEnrollments =
        useMemo(() => {

            return [...enrollments]
                .sort((a, b) => {

                    const dateA =
                        new Date(
                            a.createdAt ||
                            a.enrolledDate ||
                            a.updatedAt ||
                            0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.createdAt ||
                            b.enrolledDate ||
                            b.updatedAt ||
                            0
                        ).getTime();

                    return dateB - dateA;

                })
                .slice(0, 5);

        }, [enrollments]);


    // =========================================================
    // LOADING
    // =========================================================

    const isLoading =
        loadingUsers ||
        loadingCourses ||
        loadingEnrollments;


    // =========================================================
    // CURRENT DATE
    // =========================================================

    const currentDate =
        new Date().toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );


    // =========================================================
    // JSX
    // =========================================================

    return (

        <div className="admin-dashboard">

            {/* =================================================
                WELCOME
            ================================================= */}

            <div className="dashboard-welcome">

                <div>

                    <h1>
                        Welcome back, Admin
                    </h1>

                    <p>
                        Here's what's happening
                        with your learning
                        platform today.
                    </p>

                </div>

                <div className="dashboard-date">

                    {currentDate}

                </div>

            </div>


            {/* =================================================
                MAIN STATISTICS
            ================================================= */}

            <div className="dashboard-stats">

                {/* STUDENTS */}

                <div className="stat-card stat-students">

                    <div className="stat-card-top">

                        <div className="stat-icon">

                            <Users
                                size={21}
                            />

                        </div>

                        <div className="stat-trend">

                            <TrendingUp
                                size={11}
                            />

                            Active

                        </div>

                    </div>

                    <div className="stat-card-content">

                        <h3>
                            Total Students
                        </h3>

                        <p>
                            {totalStudents}
                        </p>

                        <span>
                            {activeStudents} active students
                        </span>

                    </div>

                </div>


                {/* COURSES */}

                <div className="stat-card stat-courses">

                    <div className="stat-card-top">

                        <div className="stat-icon">

                            <BookOpen
                                size={21}
                            />

                        </div>

                        <div className="stat-trend">

                            <TrendingUp
                                size={11}
                            />

                            Active

                        </div>

                    </div>

                    <div className="stat-card-content">

                        <h3>
                            Total Courses
                        </h3>

                        <p>
                            {totalCourses}
                        </p>

                        <span>
                            {activeCourses} active courses
                        </span>

                    </div>

                </div>


                {/* REVENUE */}

                <div className="stat-card stat-revenue">

                    <div className="stat-card-top">

                        <div className="stat-icon">

                            <IndianRupee
                                size={21}
                            />

                        </div>

                    </div>

                    <div className="stat-card-content">

                        <h3>
                            Total Revenue
                        </h3>

                        <p>
                            ₹{totalRevenue}
                        </p>

                        <span>
                            Revenue tracking
                        </span>

                    </div>

                </div>


                {/* ENROLLMENTS */}

                <div className="stat-card stat-enrollments">

                    <div className="stat-card-top">

                        <div className="stat-icon">

                            <UserPlus
                                size={21}
                            />

                        </div>

                        <div className="stat-trend">

                            <TrendingUp
                                size={11}
                            />

                            New

                        </div>

                    </div>

                    <div className="stat-card-content">

                        <h3>
                            Total Enrollments
                        </h3>

                        <p>
                            {enrollments.length}
                        </p>

                        <span>
                            {newEnrollments} this month
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                OVERVIEW
            ================================================= */}

            <div className="dashboard-overview">

                {/* Faculty */}

                <div className="overview-card">

                    <div className="overview-icon students-overview">

                        <GraduationCap
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Total Faculty
                        </span>

                        <strong>
                            {totalFaculty}
                        </strong>

                    </div>

                </div>


                {/* Active Students */}

                <div className="overview-card">

                    <div className="overview-icon active-overview">

                        <UserCheck
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Active Students
                        </span>

                        <strong>
                            {activeStudents}
                        </strong>

                    </div>

                </div>


                {/* Pending */}

                <div className="overview-card">

                    <div className="overview-icon pending-overview">

                        <Clock
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Pending Enrollments
                        </span>

                        <strong>
                            {pendingEnrollments}
                        </strong>

                    </div>

                </div>


                {/* Completed */}

                <div className="overview-card">

                    <div className="overview-icon course-overview">

                        <CheckCircle
                            size={20}
                        />

                    </div>

                    <div>

                        <span>
                            Completed Courses
                        </span>

                        <strong>
                            {completedCourses}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <div className="recent-activity">

                <div className="section-header">

                    <div>

                        <h3>
                            Recent Enrollments
                        </h3>

                        <p>
                            Latest student course
                            enrollments
                        </p>

                    </div>

                    <div className="record-count">

                        {enrollments.length} Records

                    </div>

                </div>


                <div className="table-wrapper">

                    <table className="admin-table">

                        <thead>

                            <tr>

                                <th>
                                    Student
                                </th>

                                <th>
                                    Course
                                </th>

                                <th>
                                    Enrollment Date
                                </th>

                                <th>
                                    Progress
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {isLoading ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "30px",
                                        }}
                                    >
                                        Loading
                                        enrollments...
                                    </td>

                                </tr>

                            ) : recentEnrollments.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "30px",
                                        }}
                                    >
                                        No enrollments
                                        found.
                                    </td>

                                </tr>

                            ) : (

                                recentEnrollments.map(
                                    (
                                        enrollment
                                    ) => {

                                        const progress =
                                            Number(
                                                enrollment.progress
                                            ) || 0;

                                        const status =
                                            getEnrollmentStatus(
                                                enrollment
                                            );

                                        const studentName =
                                            getStudentName(
                                                enrollment
                                            );

                                        return (

                                            <tr
                                                key={
                                                    enrollment._id
                                                }
                                            >

                                                {/* STUDENT */}

                                                <td>

                                                    <div className="student-name-cell">

                                                        <div className="student-avatar">

                                                            {studentName
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}

                                                        </div>

                                                        <span>

                                                            {
                                                                studentName
                                                            }

                                                        </span>

                                                    </div>

                                                </td>


                                                {/* COURSE */}

                                                <td>

                                                    {
                                                        getCourseName(
                                                            enrollment
                                                        )
                                                    }

                                                </td>


                                                {/* DATE */}

                                                <td>

                                                    {formatDate(
                                                        enrollment.createdAt ||
                                                        enrollment.enrolledDate ||
                                                        enrollment.updatedAt
                                                    )}

                                                </td>


                                                {/* PROGRESS */}

                                                <td>

                                                    {progress}%

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`status ${
                                                            status ===
                                                            "Pending"
                                                                ? "pending"
                                                                : "active"
                                                        }`}
                                                    >

                                                        {status}

                                                    </span>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                COURSE OVERVIEW
            ================================================= */}

            <div
                className="recent-activity"
                style={{
                    marginTop: "22px",
                }}
            >

                <div className="section-header">

                    <div>

                        <h3>
                            Course Overview
                        </h3>

                        <p>
                            Overview of courses
                            available on the platform
                        </p>

                    </div>

                    <div className="record-count">

                        {totalCourses} Courses

                    </div>

                </div>


                <div className="table-wrapper">

                    <table className="admin-table">

                        <thead>

                            <tr>

                                <th>
                                    Course
                                </th>

                                <th>
                                    Faculty
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Level
                                </th>

                                <th>
                                    Type
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {courses.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "30px",
                                        }}
                                    >
                                        No courses
                                        found.
                                    </td>

                                </tr>

                            ) : (

                                courses
                                    .slice(
                                        0,
                                        10
                                    )
                                    .map(
                                        (
                                            course
                                        ) => {

                                            const courseStatus =
                                                String(
                                                    course.status ||
                                                    "draft"
                                                ).toLowerCase();

                                            return (

                                                <tr
                                                    key={
                                                        course._id
                                                    }
                                                >

                                                    <td>

                                                        <strong
                                                            style={{
                                                                color:
                                                                    "#334155",
                                                            }}
                                                        >

                                                            {
                                                                course.title
                                                            }

                                                        </strong>

                                                    </td>

                                                    <td>

                                                        {
                                                            course.faculty ||
                                                            "-"
                                                        }

                                                    </td>

                                                    <td>

                                                        {
                                                            course.category ||
                                                            "-"
                                                        }

                                                    </td>

                                                    <td>

                                                        {
                                                            course.level ||
                                                            "-"
                                                        }

                                                    </td>

                                                    <td>

                                                        {
                                                            course.courseType ||
                                                            "-"
                                                        }

                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`status ${
                                                                courseStatus ===
                                                                    "published" ||
                                                                courseStatus ===
                                                                    "active"
                                                                    ? "active"
                                                                    : "pending"
                                                            }`}
                                                        >

                                                            {
                                                                courseStatus
                                                                    .charAt(
                                                                        0
                                                                    )
                                                                    .toUpperCase() +
                                                                courseStatus.slice(
                                                                    1
                                                                )
                                                            }

                                                        </span>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                NO DATA MESSAGE
            ================================================= */}

            {!isLoading &&
                users.length === 0 &&
                courses.length === 0 &&
                enrollments.length === 0 && (

                    <div
                        style={{
                            marginTop:
                                "20px",
                            padding:
                                "15px",
                            background:
                                "#fffbeb",
                            border:
                                "1px solid #fde68a",
                            borderRadius:
                                "8px",
                            color:
                                "#92400e",
                            fontSize:
                                "12px",
                        }}
                    >

                        <AlertCircle
                            size={15}
                            style={{
                                verticalAlign:
                                    "middle",
                                marginRight:
                                    "6px",
                            }}
                        />

                        No MongoDB dashboard
                        data found.

                    </div>

                )}

        </div>
    );
};

export default AdminDashboard;