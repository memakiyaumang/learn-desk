import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ChartNoAxesCombined,
  ClipboardCheck,
  Bell,
  UserRound,
  LogOut,
  ArrowLeft,
  Search,
  Eye,
  Mail,
  CalendarDays,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import "../css/FacultyDashboard.css";
import "../css/FacultyStudents.css";

const FacultyStudents = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedCourse = location.state?.course || null;

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loggedInFaculty, setLoggedInFaculty] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  // =========================================
  // GET LOGGED IN FACULTY
  // =========================================

  const getLoggedInFaculty = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("facultySession") || "null"
      );
    } catch (error) {
      return null;
    }
  };

  // =========================================
  // GET FACULTY TOKEN
  // =========================================

  const getFacultyToken = () => {
    return localStorage.getItem("facultyToken");
  };

  // =========================================
  // GET FACULTY AUTH HEADERS
  // =========================================

  const getFacultyAuthHeaders = () => {
    const token = getFacultyToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  };

  // =========================================
  // HANDLE UNAUTHORIZED
  // =========================================

  const handleUnauthorized = () => {
    localStorage.removeItem("facultyToken");

    sessionStorage.removeItem("facultySession");

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================
  // GET FACULTY ID
  // =========================================

  const getFacultyId = (faculty) => {
    return (
      faculty?._id ||
      faculty?.id ||
      faculty?.userId ||
      ""
    );
  };

  // =========================================
  // LOAD STUDENTS FROM BACKEND
  // =========================================

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setStudentsError("");

      const facultyToken = getFacultyToken();

      if (!facultyToken) {
        handleUnauthorized();
        return;
      }

      const faculty = getLoggedInFaculty();

      setLoggedInFaculty(faculty);

      const facultyId = getFacultyId(faculty);

      if (!facultyId) {
        setStudents([]);
        setStudentsError(
          "Faculty information not found. Please login again."
        );
        return;
      }

      const response = await fetch(
        `https://project-final-backend-oeh1.onrender.com/api/faculty-dashboard/${facultyId}`,
        {
          headers: getFacultyAuthHeaders(),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            "Unable to load students."
        );
      }

      const dashboardData =
        result.data || result;

      /*
        Backend may return students in either:
        - students
        - recentStudents

        We support both so the frontend remains
        compatible with the current dashboard response.
      */

      const backendStudents =
        dashboardData.students ||
        dashboardData.recentStudents ||
        [];

      if (!Array.isArray(backendStudents)) {
        setStudents([]);
        return;
      }

      const normalizedStudents =
        backendStudents.map(
          (student, index) => ({
            ...student,

            id:
              student.id ||
              student._id ||
              student.userId ||
              student.studentId ||
              student.email ||
              `student-${index}`,

            name:
              student.name ||
              student.fullName ||
              student.username ||
              student.userName ||
              student.studentName ||
              "Student",

            email:
              student.email ||
              student.studentEmail ||
              "No email available",

            courseId:
              student.courseId ||
              student.course?._id ||
              student.course?.id ||
              "",

            courseName:
              student.courseName ||
              student.course?.title ||
              student.course?.courseName ||
              "",

            progress:
              student.progress ??
              student.progressPercentage ??
              student.courseProgress ??
              0,

            enrollmentDate:
              student.enrollmentDate ||
              student.enrolledAt ||
              student.joinedAt ||
              student.createdAt ||
              "",

            status:
              student.status ||
              student.accountStatus ||
              "active",
          })
        );

      setStudents(normalizedStudents);
    } catch (error) {
      console.error(
        "Unable to load faculty students:",
        error
      );

      setStudents([]);

      setStudentsError(
        error.message ||
          "Unable to load students."
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  // =========================================
  // LOAD DATA
  // =========================================

  useEffect(() => {
    loadStudents();

    const handleUserChange = () => {
      loadStudents();
    };

    window.addEventListener(
      "userLoginChanged",
      handleUserChange
    );

    window.addEventListener(
      "usersUpdated",
      handleUserChange
    );

    return () => {
      window.removeEventListener(
        "userLoginChanged",
        handleUserChange
      );

      window.removeEventListener(
        "usersUpdated",
        handleUserChange
      );
    };
  }, []);

  // =========================================
  // COURSE INFORMATION
  // =========================================

  const courseName =
    selectedCourse?.title ||
    selectedCourse?.courseName ||
    selectedCourse?.name ||
    "All Courses";

  const courseId =
    selectedCourse?._id ||
    selectedCourse?.id ||
    selectedCourse?.courseId ||
    null;

  // =========================================
  // CHECK STUDENT COURSE
  // =========================================

  const isStudentEnrolled = (student) => {
    if (!selectedCourse) {
      return true;
    }

    // -----------------------------------------
    // Course ID match
    // -----------------------------------------

    if (courseId) {
      const studentCourseId =
        student.courseId ||
        student.course?._id ||
        student.course?.id ||
        "";

      if (
        studentCourseId &&
        String(studentCourseId) ===
          String(courseId)
      ) {
        return true;
      }
    }

    // -----------------------------------------
    // Course name match
    // -----------------------------------------

    const studentCourseName =
      student.courseName ||
      student.course?.title ||
      student.course?.courseName ||
      "";

    if (
      studentCourseName &&
      String(studentCourseName)
        .trim()
        .toLowerCase() ===
        String(courseName)
          .trim()
          .toLowerCase()
    ) {
      return true;
    }

    // -----------------------------------------
    // Check multiple course structures
    // -----------------------------------------

    const courseCollections = [
      student.enrolledCourses,
      student.courses,
    ];

    for (const courses of courseCollections) {
      if (!Array.isArray(courses)) {
        continue;
      }

      const matched = courses.some(
        (course) => {
          if (
            typeof course === "string" ||
            typeof course === "number"
          ) {
            return (
              courseId &&
              String(course) ===
                String(courseId)
            );
          }

          if (
            typeof course !== "object" ||
            course === null
          ) {
            return false;
          }

          const id =
            course._id ||
            course.id ||
            course.courseId;

          const name =
            course.title ||
            course.courseName ||
            course.name;

          return (
            (courseId &&
              id &&
              String(id) ===
                String(courseId)) ||
            (name &&
              String(name)
                .trim()
                .toLowerCase() ===
                String(courseName)
                  .trim()
                  .toLowerCase())
          );
        }
      );

      if (matched) {
        return true;
      }
    }

    return false;
  };

  // =========================================
  // COURSE STUDENTS
  // =========================================

  const courseStudents = useMemo(() => {
    return students.filter((student) =>
      isStudentEnrolled(student)
    );
  }, [
    students,
    selectedCourse,
    courseId,
    courseName,
  ]);

  // =========================================
  // GET STUDENT NAME
  // =========================================

  const getStudentName = (student) => {
    return (
      student.name ||
      student.fullName ||
      student.username ||
      student.userName ||
      student.studentName ||
      "Student"
    );
  };

  // =========================================
  // GET STUDENT EMAIL
  // =========================================

  const getStudentEmail = (student) => {
    return (
      student.email ||
      student.studentEmail ||
      "No email available"
    );
  };

  // =========================================
  // GET STUDENT STATUS
  // =========================================

  const getStudentStatus = (student) => {
    const status = String(
      student.status ||
        student.accountStatus ||
        "active"
    )
      .trim()
      .toLowerCase();

    if (
      status === "inactive" ||
      status === "blocked" ||
      status === "disabled"
    ) {
      return "inactive";
    }

    return "active";
  };

  // =========================================
  // GET PROGRESS
  // =========================================

  const getStudentProgress = (student) => {
    const progress =
      student.progress ??
      student.progressPercentage ??
      student.courseProgress ??
      0;

    const numericProgress = Number(progress);

    if (Number.isNaN(numericProgress)) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, numericProgress)
    );
  };

  // =========================================
  // GET ENROLLMENT DATE
  // =========================================

  const getEnrollmentDate = (student) => {
    const date =
      student.enrollmentDate ||
      student.enrolledAt ||
      student.joinedAt ||
      student.createdAt;

    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date);
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================
  // FILTER STUDENTS
  // =========================================

  const filteredStudents = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return courseStudents.filter(
      (student) => {
        const name =
          getStudentName(student)
            .toLowerCase();

        const email =
          getStudentEmail(student)
            .toLowerCase();

        const status =
          getStudentStatus(student);

        const matchesSearch =
          !searchText ||
          name.includes(searchText) ||
          email.includes(searchText);

        const matchesStatus =
          statusFilter === "all" ||
          status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    courseStudents,
    search,
    statusFilter,
  ]);

  // =========================================
  // STATISTICS
  // =========================================

  const totalStudents =
    courseStudents.length;

  const activeStudents =
    courseStudents.filter(
      (student) =>
        getStudentStatus(student) ===
        "active"
    ).length;

  const inactiveStudents =
    courseStudents.filter(
      (student) =>
        getStudentStatus(student) ===
        "inactive"
    ).length;

  const averageProgress =
    totalStudents === 0
      ? 0
      : Math.round(
          courseStudents.reduce(
            (total, student) =>
              total +
              getStudentProgress(student),
            0
          ) / totalStudents
        );

  // =========================================
  // VIEW STUDENT
  // =========================================

  const handleViewStudent = (
    student
  ) => {
    navigate(
      "/faculty/student-details",
      {
        state: {
          student,
          course: selectedCourse,
        },
      }
    );
  };

  // =========================================
  // NAVIGATION
  // =========================================

  const handleNavigation = (path) => {
    navigate(path);
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "facultyToken"
    );

    sessionStorage.removeItem(
      "facultySession"
    );

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="faculty-dashboard">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="faculty-sidebar">

        <div className="faculty-logo">

          <span className="faculty-brand-mark"></span>

          <span className="faculty-brand-text">
            LearnDesk
          </span>

        </div>

        <nav className="faculty-nav">

          <div
            className="faculty-nav-item"
            onClick={() =>
              handleNavigation("/faculty")
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

          <div
            className="faculty-nav-item active"
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

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="faculty-main">

        <div className="faculty-students-page">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="faculty-students-header">

            <div className="faculty-students-title-row">

              <div className="faculty-students-title-icon">
                <Users size={22} />
              </div>

              <div>

                <h1>
                  Students
                </h1>

                <p>
                  View and monitor students enrolled in your courses.
                </p>

              </div>

            </div>

            {selectedCourse && (
              <div className="faculty-selected-course">

                <BookOpen size={15} />

                <span>
                  {courseName}
                </span>

              </div>
            )}

          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="faculty-students-stats">

            <div className="faculty-student-stat-card">

              <div className="faculty-student-stat-icon purple">
                <Users size={19} />
              </div>

              <div>
                <span>
                  Total Students
                </span>

                <strong>
                  {loadingStudents
                    ? "—"
                    : totalStudents}
                </strong>
              </div>

            </div>

            <div className="faculty-student-stat-card">

              <div className="faculty-student-stat-icon green">
                <UserCheck size={19} />
              </div>

              <div>
                <span>
                  Active
                </span>

                <strong>
                  {loadingStudents
                    ? "—"
                    : activeStudents}
                </strong>
              </div>

            </div>

            <div className="faculty-student-stat-card">

              <div className="faculty-student-stat-icon red">
                <UserX size={19} />
              </div>

              <div>
                <span>
                  Inactive
                </span>

                <strong>
                  {loadingStudents
                    ? "—"
                    : inactiveStudents}
                </strong>
              </div>

            </div>

            <div className="faculty-student-stat-card">

              <div className="faculty-student-stat-icon blue">
                <TrendingUp size={19} />
              </div>

              <div>
                <span>
                  Avg. Progress
                </span>

                <strong>
                  {loadingStudents
                    ? "—"
                    : `${averageProgress}%`}
                </strong>
              </div>

            </div>

          </div>

          {/* ==================================================
              TOOLBAR
          ================================================== */}

          <div className="faculty-students-toolbar">

            <div className="faculty-students-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search student name or email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                disabled={loadingStudents}
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="faculty-students-status-filter"
              disabled={loadingStudents}
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {studentsError && !loadingStudents && (

            <div className="faculty-students-error">

              <strong>
                Unable to load students
              </strong>

              <span>
                {studentsError}
              </span>

              <button
                type="button"
                onClick={loadStudents}
              >
                Try Again
              </button>

            </div>

          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loadingStudents ? (

            <div className="faculty-students-empty">

              <div className="faculty-students-loading-spinner"></div>

              <h3>
                Loading Students...
              </h3>

              <p>
                Fetching student information from the server.
              </p>

            </div>

          ) : studentsError ? null : filteredStudents.length > 0 ? (

            /* ==================================================
                STUDENTS TABLE
            ================================================== */

            <div className="faculty-students-table-card">

              <div className="faculty-students-table-wrapper">

                <table className="faculty-students-table">

                  <thead>

                    <tr>

                      <th>
                        Student
                      </th>

                      <th>
                        Email
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

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredStudents.map(
                      (student, index) => {

                        const name =
                          getStudentName(
                            student
                          );

                        const email =
                          getStudentEmail(
                            student
                          );

                        const progress =
                          getStudentProgress(
                            student
                          );

                        const status =
                          getStudentStatus(
                            student
                          );

                        return (

                          <tr
                            key={
                              student.id ||
                              student._id ||
                              student.email ||
                              index
                            }
                          >

                            <td>

                              <div className="faculty-student-profile">

                                <div className="faculty-student-avatar">

                                  {name
                                    .charAt(0)
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {name}
                                  </strong>

                                  <span>
                                    Student
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <div className="faculty-student-email">

                                <Mail size={14} />

                                <span>
                                  {email}
                                </span>

                              </div>

                            </td>

                            <td>

                              <div className="faculty-student-date">

                                <CalendarDays size={14} />

                                <span>
                                  {getEnrollmentDate(
                                    student
                                  )}
                                </span>

                              </div>

                            </td>

                            <td>

                              <div className="faculty-student-progress">

                                <div className="faculty-student-progress-top">

                                  <span>
                                    {progress}%
                                  </span>

                                </div>

                                <div className="faculty-student-progress-bar">

                                  <div
                                    style={{
                                      width: `${progress}%`,
                                    }}
                                  ></div>

                                </div>

                              </div>

                            </td>

                            <td>

                              <span
                                className={`faculty-student-status ${status}`}
                              >
                                {status
                                  .charAt(0)
                                  .toUpperCase() +
                                  status.slice(1)}
                              </span>

                            </td>

                            <td>

                              <button
                                type="button"
                                className="faculty-student-view-btn"
                                onClick={() =>
                                  handleViewStudent(
                                    student
                                  )
                                }
                                title="View Student"
                              >
                                <Eye size={15} />
                                View
                              </button>

                            </td>

                          </tr>

                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          ) : (

            /* ==================================================
                EMPTY STATE
            ================================================== */

            <div className="faculty-students-empty">

              <div className="faculty-students-empty-icon">
                <Users size={30} />
              </div>

              <h3>

                {courseStudents.length === 0
                  ? selectedCourse
                    ? "No Students Enrolled"
                    : "No Students Found"
                  : "No Students Found"}

              </h3>

              <p>

                {courseStudents.length === 0
                  ? selectedCourse
                    ? `No students are currently enrolled in ${courseName}.`
                    : "There are no students enrolled in your courses yet."
                  : "Try changing your search or status filter."}

              </p>

              {selectedCourse && (

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/faculty/courses"
                    )
                  }
                >
                  <ArrowLeft size={16} />
                  Back to My Courses
                </button>

              )}

            </div>

          )}

        </div>

      </main>

    </div>
  );
};

export default FacultyStudents;