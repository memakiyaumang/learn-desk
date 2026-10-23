import React, { useEffect, useState } from "react";

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
  Mail,
  CalendarDays,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../css/FacultyDashboard.css";
import "../css/FacultyStudentDetails.css";

const FacultyStudentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // SELECTED STUDENT + COURSE
  // =========================================================

  const selectedStudent =
    location.state?.student || null;

  const selectedCourse =
    location.state?.course || null;

  // =========================================================
  // STATES
  // =========================================================

  const [student, setStudent] =
    useState(selectedStudent);

  const [enrollment, setEnrollment] =
    useState(
      selectedStudent?.enrollment || null
    );

  const [totalLessons, setTotalLessons] =
    useState(
      Number(
        selectedStudent?.totalLessons
      ) || 0
    );

  const [completedLessons, setCompletedLessons] =
    useState(
      Number(
        selectedStudent?.completedLessons
      ) || 0
    );

  const [quizAttempts, setQuizAttempts] =
    useState([]);

  const [loadingDetails, setLoadingDetails] =
    useState(true);

  const [detailsError, setDetailsError] =
    useState("");

  // =========================================================
  // FACULTY TOKEN
  // =========================================================

  const getFacultyToken = () => {
    return localStorage.getItem(
      "facultyToken"
    );
  };

  // =========================================================
  // FACULTY AUTH HEADERS
  // =========================================================

  const getFacultyAuthHeaders = () => {
    const token =
      getFacultyToken();

    if (!token) {
      console.error(
        "Faculty token is missing."
      );
    }

    return {
      Authorization:
        token
          ? `Bearer ${token}`
          : "",
      "Content-Type":
        "application/json",
    };
  };

  // =========================================================
  // UNAUTHORIZED
  // =========================================================

  const handleUnauthorized = () => {
    localStorage.removeItem(
      "facultyToken"
    );

    sessionStorage.removeItem(
      "facultySession"
    );

    window.dispatchEvent(
      new Event(
        "userLoginChanged"
      )
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  // =========================================================
  // STUDENT ID
  // =========================================================

  const studentId =
    selectedStudent?._id ||
    selectedStudent?.id ||
    selectedStudent?.userId ||
    selectedStudent?.studentId ||
    null;

  // =========================================================
  // EXACT ENROLLMENT STUDENT ID
  // =========================================================

  /*
   * IMPORTANT:
   *
   * Enrollment માં જે studentId save છે,
   * એ જ ID progress અને quiz API માટે
   * use કરીશું.
   */

  const enrollmentStudentId =
    enrollment?.studentId ||
    selectedStudent?.performanceStudentId ||
    studentId ||
    null;

  // =========================================================
  // STUDENT EMAIL
  // =========================================================

  const studentEmailForRequest =
    selectedStudent?.email ||
    selectedStudent?.studentEmail ||
    selectedStudent?.userEmail ||
    null;

  // =========================================================
  // COURSE ID
  // =========================================================

  const courseId =
    selectedCourse?._id ||
    selectedCourse?.id ||
    selectedCourse?.courseId ||
    null;

  // =========================================================
  // LOAD STUDENT DETAILS
  // =========================================================

  useEffect(() => {
    const loadStudentData = async () => {
      if (
        !studentId ||
        !courseId
      ) {
        setLoadingDetails(false);
        return;
      }

      const facultyToken =
        getFacultyToken();

      if (!facultyToken) {
        setLoadingDetails(false);
        handleUnauthorized();
        return;
      }

      setLoadingDetails(true);
      setDetailsError("");

      try {
        // =====================================================
        // 1. GET STUDENT INFORMATION
        // =====================================================

        try {
          /*
           * IMPORTANT FIX
           *
           * OLD:
           * /api/get-userdata
           *
           * NEW:
           * /api/faculty/get-userdata
           *
           * Faculty protected endpoint.
           */

          const usersResponse =
            await fetch(
              "https://project-final-backend-oeh1.onrender.com/api/faculty/get-userdata",
              {
                method: "GET",
                headers:
                  getFacultyAuthHeaders(),
              }
            );

          console.log(
            "Faculty User Data Status:",
            usersResponse.status
          );

          if (
            usersResponse.status === 401 ||
            usersResponse.status === 403
          ) {
            handleUnauthorized();
            return;
          }

          const usersResult =
            await usersResponse.json();

          console.log(
            "Faculty User Data Response:",
            usersResult
          );

          if (
            usersResponse.ok
          ) {
            let allUsers = [];

            if (
              Array.isArray(
                usersResult
              )
            ) {
              allUsers =
                usersResult;
            } else if (
              Array.isArray(
                usersResult?.data
              )
            ) {
              allUsers =
                usersResult.data;
            } else if (
              Array.isArray(
                usersResult?.users
              )
            ) {
              allUsers =
                usersResult.users;
            }

            const latestStudent =
              allUsers.find(
                (user) => {
                  const userId =
                    user?._id ||
                    user?.id ||
                    user?.userId ||
                    user?.studentId;

                  const userEmail =
                    user?.email ||
                    user?.studentEmail;

                  const idMatched =
                    userId &&
                    String(userId) ===
                      String(studentId);

                  const emailMatched =
                    studentEmailForRequest &&
                    userEmail &&
                    String(
                      userEmail
                    ).toLowerCase() ===
                      String(
                        studentEmailForRequest
                      ).toLowerCase();

                  return (
                    idMatched ||
                    emailMatched
                  );
                }
              );

            if (
              latestStudent
            ) {
              setStudent(
                (oldStudent) => ({
                  ...oldStudent,
                  ...latestStudent,
                })
              );
            }
          }
        } catch (error) {
          console.error(
            "Unable to load student information:",
            error
          );
        }

        // =====================================================
        // 2. GET ENROLLMENT
        // =====================================================

        let latestEnrollment =
          enrollment ||
          selectedStudent?.enrollment ||
          null;

        try {
          const enrollmentResponse =
            await fetch(
              `https://project-final-backend-oeh1.onrender.com/api/get-enrollment/${studentId}/${courseId}`,
              {
                method: "GET",
                headers:
                  getFacultyAuthHeaders(),
              }
            );

          console.log(
            "Enrollment Status:",
            enrollmentResponse.status
          );

          if (
            enrollmentResponse.status === 401 ||
            enrollmentResponse.status === 403
          ) {
            handleUnauthorized();
            return;
          }

          const enrollmentResult =
            await enrollmentResponse.json();

          console.log(
            "Enrollment Response:",
            enrollmentResult
          );

          if (
            enrollmentResponse.ok
          ) {
            latestEnrollment =
              enrollmentResult?.data ||
              enrollmentResult?.enrollment ||
              (
                enrollmentResult?.studentId
                  ? enrollmentResult
                  : null
              );

            if (
              latestEnrollment
            ) {
              setEnrollment(
                latestEnrollment
              );

              if (
                latestEnrollment.completedLessons !==
                undefined
              ) {
                setCompletedLessons(
                  Number(
                    latestEnrollment.completedLessons
                  ) || 0
                );
              }

              if (
                latestEnrollment.totalLessons !==
                undefined
              ) {
                setTotalLessons(
                  Number(
                    latestEnrollment.totalLessons
                  ) || 0
                );
              }
            }
          }
        } catch (error) {
          console.error(
            "Unable to load enrollment:",
            error
          );
        }

        // =====================================================
        // EXACT STUDENT ID FROM ENROLLMENT
        // =====================================================

        const exactStudentId =
          latestEnrollment?.studentId ||
          selectedStudent?.performanceStudentId ||
          studentId;

        console.log(
          "Student Details Request:",
          {
            studentId:
              exactStudentId,
            courseId,
          }
        );

        // =====================================================
        // 3. GET LESSONS
        // =====================================================

        let lessons = [];

        try {
          const lessonsResponse =
            await fetch(
              `https://project-final-backend-oeh1.onrender.com/api/get-lessons/${courseId}`,
              {
                method: "GET",
                headers:
                  getFacultyAuthHeaders(),
              }
            );

          console.log(
            "Lessons Status:",
            lessonsResponse.status
          );

          if (
            lessonsResponse.status === 401 ||
            lessonsResponse.status === 403
          ) {
            handleUnauthorized();
            return;
          }

          const lessonsResult =
            await lessonsResponse.json();

          if (
            lessonsResponse.ok
          ) {
            if (
              Array.isArray(
                lessonsResult
              )
            ) {
              lessons =
                lessonsResult;
            } else if (
              Array.isArray(
                lessonsResult?.data
              )
            ) {
              lessons =
                lessonsResult.data;
            } else if (
              Array.isArray(
                lessonsResult?.lessons
              )
            ) {
              lessons =
                lessonsResult.lessons;
            }

            setTotalLessons(
              lessons.length
            );
          }
        } catch (error) {
          console.error(
            "Unable to load lessons:",
            error
          );
        }

        // =====================================================
        // 4. GET STUDENT LESSON PROGRESS
        // =====================================================

        try {
          const progressResponse =
            await fetch(
              `https://project-final-backend-oeh1.onrender.com/api/get-progress/${exactStudentId}/${courseId}`,
              {
                method: "GET",
                headers:
                  getFacultyAuthHeaders(),
              }
            );

          console.log(
            "Progress Status:",
            progressResponse.status
          );

          if (
            progressResponse.status === 401 ||
            progressResponse.status === 403
          ) {
            handleUnauthorized();
            return;
          }

          const progressResult =
            await progressResponse.json();

          console.log(
            "Progress Response:",
            progressResult
          );

          if (
            progressResponse.ok
          ) {
            let progressData = [];

            if (
              Array.isArray(
                progressResult
              )
            ) {
              progressData =
                progressResult;
            } else if (
              Array.isArray(
                progressResult?.data
              )
            ) {
              progressData =
                progressResult.data;
            } else if (
              Array.isArray(
                progressResult?.progress
              )
            ) {
              progressData =
                progressResult.progress;
            }

            if (
              progressData.length > 0
            ) {
              const completedProgress =
                progressData.filter(
                  (item) =>
                    item?.completed ===
                    true
                );

              setCompletedLessons(
                completedProgress.length
              );
            } else if (
              latestEnrollment
            ) {
              setCompletedLessons(
                Number(
                  latestEnrollment.completedLessons
                ) || 0
              );
            }
          }
        } catch (error) {
          console.error(
            "Unable to load student lesson progress:",
            error
          );
        }

        // =====================================================
        // 5. GET QUIZ ATTEMPTS
        // =====================================================

        try {
          const quizResponse =
            await fetch(
              `https://project-final-backend-oeh1.onrender.com/quizzes/student/attempts/${exactStudentId}/course/${courseId}`,
              {
                method: "GET",
                headers:
                  getFacultyAuthHeaders(),
              }
            );

          console.log(
            "Quiz Attempts Status:",
            quizResponse.status
          );

          if (
            quizResponse.status === 401 ||
            quizResponse.status === 403
          ) {
            handleUnauthorized();
            return;
          }

          const quizResult =
            await quizResponse.json();

          console.log(
            "Quiz Attempts Response:",
            quizResult
          );

          if (
            quizResponse.ok
          ) {
            let attempts = [];

            if (
              Array.isArray(
                quizResult
              )
            ) {
              attempts =
                quizResult;
            } else if (
              Array.isArray(
                quizResult?.data
              )
            ) {
              attempts =
                quizResult.data;
            } else if (
              Array.isArray(
                quizResult?.attempts
              )
            ) {
              attempts =
                quizResult.attempts;
            }

            setQuizAttempts(
              attempts
            );
          } else {
            setQuizAttempts([]);
          }
        } catch (error) {
          console.error(
            "Unable to load quiz attempts:",
            error
          );

          setQuizAttempts([]);
        }

        // =====================================================
        // SAFETY
        // =====================================================

        if (
          lessons.length > 0
        ) {
          setTotalLessons(
            lessons.length
          );

          setCompletedLessons(
            (previous) =>
              Math.min(
                previous,
                lessons.length
              )
          );
        }
      } catch (error) {
        console.error(
          "Faculty student details error:",
          error
        );

        setDetailsError(
          "Unable to load student details. Please try again."
        );
      } finally {
        setLoadingDetails(false);
      }
    };

    loadStudentData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    studentId,
    courseId,
  ]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "facultyToken"
    );

    sessionStorage.removeItem(
      "facultySession"
    );

    window.dispatchEvent(
      new Event(
        "userLoginChanged"
      )
    );

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  // =========================================================
  // NO STUDENT
  // =========================================================

  if (!student) {
    return (
      <div className="faculty-dashboard">

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
                navigate("/faculty")
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>

            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate("/faculty/courses")
              }
            >
              <BookOpen size={20} />
              <span>My Courses</span>
            </div>

            <div
              className="faculty-nav-item active"
              onClick={() =>
                navigate("/faculty/students")
              }
            >
              <Users size={20} />
              <span>Students</span>
            </div>

            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate("/faculty/progress")
              }
            >
              <ChartNoAxesCombined size={20} />
              <span>
                Student Progress
              </span>
            </div>

            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate("/faculty/quiz")
              }
            >
              <ClipboardCheck size={20} />
              <span>
                Quiz Management
              </span>
            </div>

            

            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate("/faculty/profile")
              }
            >
              <UserRound size={20} />
              <span>Profile</span>
            </div>

          </nav>

          <div
            className="faculty-nav-item faculty-logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </div>

        </aside>

        <main className="faculty-main">

          <div className="faculty-student-details-empty">

            <div className="faculty-student-details-empty-icon">
              <Users size={30} />
            </div>

            <h2>
              No Student Selected
            </h2>

            <p>
              Please select a student from the Students page.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/faculty/students"
                )
              }
            >
              <ArrowLeft size={16} />
              Back to Students
            </button>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // STUDENT INFORMATION
  // =========================================================

  const studentName =
    student.name ||
    student.fullName ||
    student.username ||
    student.userName ||
    "Student";

  const studentEmail =
    student.email ||
    student.studentEmail ||
    enrollment?.studentEmail ||
    "No email available";

  // =========================================================
  // PROGRESS
  // =========================================================

  const enrollmentProgress =
    enrollment?.progress;

  const studentProgress =
    student.progress ??
    student.progressPercentage ??
    student.courseProgress;

  const calculatedProgress =
    totalLessons > 0
      ? (
          completedLessons /
          totalLessons
        ) * 100
      : 0;

  const progressValue =
    enrollmentProgress !==
      undefined &&
    enrollmentProgress !==
      null
      ? enrollmentProgress
      : studentProgress !==
          undefined &&
        studentProgress !==
          null
      ? studentProgress
      : calculatedProgress;

  const progressNumber =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          progressValue
        ) || 0
      )
    );

  // =========================================================
  // DATE
  // =========================================================

  const enrollmentDate =
    enrollment?.createdAt ||
    student.enrollmentDate ||
    student.enrolledAt ||
    student.joinedAt ||
    student.createdAt ||
    null;

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate =
      new Date(date);

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

  // =========================================================
  // STATUS
  // =========================================================

  const status =
    String(
      student.status ||
        student.accountStatus ||
        "active"
    )
      .trim()
      .toLowerCase();

  const studentStatus =
    status === "inactive" ||
    status === "blocked" ||
    status === "disabled"
      ? "inactive"
      : "active";

  // =========================================================
  // COURSE
  // =========================================================

  const courseName =
    selectedCourse?.title ||
    selectedCourse?.courseName ||
    selectedCourse?.name ||
    enrollment?.courseName ||
    "Course";

  const courseCategory =
    selectedCourse?.category ||
    "General";

  const courseDuration =
    selectedCourse?.duration ||
    selectedCourse?.courseDuration ||
    "Self-paced";

  // =========================================================
  // LESSONS
  // =========================================================

  const finalTotalLessons =
    totalLessons ||
    Number(
      enrollment?.totalLessons
    ) ||
    Number(
      student.totalLessons
    ) ||
    0;

  const finalCompletedLessons =
    Math.min(
      finalTotalLessons,
      Math.max(
        0,
        Number(
          completedLessons
        ) || 0
      )
    );

  const remainingLessons =
    Math.max(
      0,
      finalTotalLessons -
        finalCompletedLessons
    );

  // =========================================================
  // QUIZ INFORMATION
  // =========================================================

  const totalQuizAttempts =
    Array.isArray(
      quizAttempts
    )
      ? quizAttempts.length
      : 0;

  const passedQuizAttempts =
    Array.isArray(
      quizAttempts
    )
      ? quizAttempts.filter(
          (attempt) => {

            const percentage =
              Number(
                attempt?.percentage ??
                  attempt?.scorePercentage ??
                  attempt?.score ??
                  0
              ) || 0;

            const result =
              String(
                attempt?.result ||
                  ""
              ).toLowerCase();

            const statusValue =
              String(
                attempt?.status ||
                  ""
              ).toLowerCase();

            return (
              attempt?.passed ===
                true ||
              result ===
                "passed" ||
              statusValue ===
                "passed" ||
              percentage >=
                Number(
                  attempt?.passingScore ||
                    50
                )
            );

          }
        ).length
      : 0;

  const latestQuizAttempt =
    Array.isArray(
      quizAttempts
    ) &&
    quizAttempts.length > 0
      ? [
          ...quizAttempts,
        ].sort(
          (a, b) =>
            new Date(
              b?.createdAt ||
                b?.submittedAt ||
                b?.attemptedAt ||
                0
            ) -
            new Date(
              a?.createdAt ||
                a?.submittedAt ||
                a?.attemptedAt ||
                0
            )
        )[0]
      : null;

  const latestQuizScore =
    latestQuizAttempt
      ? Number(
          latestQuizAttempt?.percentage ??
            latestQuizAttempt?.scorePercentage ??
            latestQuizAttempt?.score ??
            0
        ) || 0
      : 0;

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleBack = () => {
    navigate(
      "/faculty/students",
      {
        state: {
          course:
            selectedCourse,
        },
      }
    );
  };

  const handleProgress = () => {
    navigate(
      "/faculty/progress",
      {
        state: {
          course:
            selectedCourse,
          student:
            student,
        },
      }
    );
  };

  const handleCourses = () => {
    navigate(
      "/faculty/courses"
    );
  };

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="faculty-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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
              navigate(
                "/faculty"
              )
            }
          >
            <LayoutDashboard size={20} />
            <span>
              Dashboard
            </span>
          </div>

          <div
            className="faculty-nav-item"
            onClick={
              handleCourses
            }
          >
            <BookOpen size={20} />
            <span>
              My Courses
            </span>
          </div>

          <div
            className="faculty-nav-item active"
            onClick={() =>
              navigate(
                "/faculty/students"
              )
            }
          >
            <Users size={20} />
            <span>
              Students
            </span>
          </div>

          <div
            className="faculty-nav-item"
            onClick={() =>
              navigate(
                "/faculty/progress"
              )
            }
          >
            <ChartNoAxesCombined
              size={20}
            />

            <span>
              Student Progress
            </span>

          </div>

          <div
            className="faculty-nav-item"
            onClick={() =>
              navigate(
                "/faculty/quiz"
              )
            }
          >
            <ClipboardCheck
              size={20}
            />

            <span>
              Quiz Management
            </span>

          </div>

          

          <div
            className="faculty-nav-item"
            onClick={() =>
              navigate(
                "/faculty/profile"
              )
            }
          >
            <UserRound size={20} />

            <span>
              Profile
            </span>

          </div>

        </nav>

        <div
          className="faculty-nav-item faculty-logout"
          onClick={
            handleLogout
          }
        >
          <LogOut size={20} />

          <span>
            Logout
          </span>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="faculty-main">

        <div className="faculty-student-details-page">

          {/* =================================================
              BACK
          ================================================= */}

          <button
            type="button"
            className="faculty-student-back-btn"
            onClick={
              handleBack
            }
          >
            <ArrowLeft size={17} />

            Back to Students

          </button>

          {/* =================================================
              ERROR
          ================================================= */}

          {detailsError && (
            <div
              style={{
                marginBottom:
                  "15px",
                padding:
                  "11px 14px",
                border:
                  "1px solid #fecaca",
                borderRadius:
                  "9px",
                background:
                  "#fff7f7",
                color:
                  "#dc2626",
                fontSize:
                  "11.5px",
              }}
            >
              {detailsError}
            </div>
          )}

          {/* =================================================
              PROFILE
          ================================================= */}

          <section className="faculty-student-profile-card">

            <div className="faculty-student-large-avatar">

              {studentName
                .charAt(0)
                .toUpperCase()}

            </div>

            <div className="faculty-student-profile-main">

              <div className="faculty-student-profile-name-row">

                <div>

                  <h1>
                    {studentName}
                  </h1>

                  <p>
                    Student
                  </p>

                </div>

                <span
                  className={`faculty-student-detail-status ${studentStatus}`}
                >
                  {studentStatus ===
                  "active"
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <div className="faculty-student-contact-row">

                <div>

                  <Mail size={15} />

                  <span>
                    {studentEmail}
                  </span>

                </div>

                <div>

                  <CalendarDays
                    size={15}
                  />

                  <span>
                    Joined{" "}
                    {formatDate(
                      enrollmentDate
                    )}
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              COURSE INFORMATION
          ================================================= */}

          <section className="faculty-student-course-card">

            <div className="faculty-student-section-header">

              <div className="faculty-student-section-icon purple">

                <BookOpen
                  size={19}
                />

              </div>

              <div>

                <h2>
                  Course Information
                </h2>

                <p>
                  Current learning information
                </p>

              </div>

            </div>

            <div className="faculty-student-course-content">

              <div className="faculty-student-course-title">

                <span>
                  {courseCategory}
                </span>

                <h3>
                  {courseName}
                </h3>

                <p>
                  {courseDuration}
                </p>

              </div>

              <div className="faculty-student-course-meta">

                <div>

                  <FileText
                    size={17}
                  />

                  <span>
                    {finalTotalLessons}{" "}
                    Lessons
                  </span>

                </div>

                <div>

                  <Clock
                    size={17}
                  />

                  <span>
                    {courseDuration}
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              LEARNING PROGRESS
          ================================================= */}

          <section className="faculty-student-progress-card">

            <div className="faculty-student-section-header">

              <div className="faculty-student-section-icon blue">

                <TrendingUp
                  size={19}
                />

              </div>

              <div>

                <h2>
                  Learning Progress
                </h2>

                <p>
                  Student progress for this course
                </p>

              </div>

            </div>

            <div className="faculty-student-progress-main">

              <div className="faculty-student-progress-circle">

                <strong>
                  {Math.round(
                    progressNumber
                  )}%
                </strong>

                <span>
                  Completed
                </span>

              </div>

              <div className="faculty-student-progress-details">

                <div className="faculty-student-progress-label">

                  <span>
                    Overall Progress
                  </span>

                  <strong>
                    {Math.round(
                      progressNumber
                    )}%
                  </strong>

                </div>

                <div className="faculty-student-detail-progress-bar">

                  <div
                    style={{
                      width:
                        `${progressNumber}%`,
                    }}
                  ></div>

                </div>

                <div className="faculty-student-progress-stats">

                  <div>

                    <CheckCircle
                      size={16}
                    />

                    <span>
                      Completed
                    </span>

                    <strong>
                      {
                        finalCompletedLessons
                      }
                    </strong>

                  </div>

                  <div>

                    <Clock
                      size={16}
                    />

                    <span>
                      Remaining
                    </span>

                    <strong>
                      {
                        remainingLessons
                      }
                    </strong>

                  </div>

                  <div>

                    <FileText
                      size={16}
                    />

                    <span>
                      Total Lessons
                    </span>

                    <strong>
                      {
                        finalTotalLessons
                      }
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              QUIZ PERFORMANCE
          ================================================= */}

          <section className="faculty-student-information-card">

            <div className="faculty-student-section-header">

              <div className="faculty-student-section-icon purple">

                <ClipboardCheck
                  size={19}
                />

              </div>

              <div>

                <h2>
                  Quiz Performance
                </h2>

                <p>
                  Student quiz activity for this course
                </p>

              </div>

            </div>

            <div className="faculty-student-information-grid">

              <div>

                <span>
                  Quiz Attempts
                </span>

                <strong>
                  {loadingDetails
                    ? "..."
                    : totalQuizAttempts}
                </strong>

              </div>

              <div>

                <span>
                  Passed Attempts
                </span>

                <strong>
                  {loadingDetails
                    ? "..."
                    : passedQuizAttempts}
                </strong>

              </div>

              <div>

                <span>
                  Latest Score
                </span>

                <strong>
                  {loadingDetails
                    ? "..."
                    : `${Math.round(
                        latestQuizScore
                      )}%`}
                </strong>

              </div>

              <div>

                <span>
                  Latest Attempt
                </span>

                <strong>
                  {loadingDetails
                    ? "..."
                    : latestQuizAttempt
                    ? formatDate(
                        latestQuizAttempt.createdAt ||
                          latestQuizAttempt.submittedAt ||
                          latestQuizAttempt.attemptedAt
                      )
                    : "No attempts"}
                </strong>

              </div>

            </div>

          </section>

          {/* =================================================
              STUDENT INFORMATION
          ================================================= */}

          <section className="faculty-student-information-card">

            <div className="faculty-student-section-header">

              <div className="faculty-student-section-icon green">

                <UserCheck
                  size={19}
                />

              </div>

              <div>

                <h2>
                  Student Information
                </h2>

                <p>
                  Basic account information
                </p>

              </div>

            </div>

            <div className="faculty-student-information-grid">

              <div>

                <span>
                  Full Name
                </span>

                <strong>
                  {studentName}
                </strong>

              </div>

              <div>

                <span>
                  Email Address
                </span>

                <strong>
                  {studentEmail}
                </strong>

              </div>

              <div>

                <span>
                  Enrollment Date
                </span>

                <strong>
                  {formatDate(
                    enrollmentDate
                  )}
                </strong>

              </div>

              <div>

                <span>
                  Account Status
                </span>

                <strong
                  className={`faculty-info-status ${studentStatus}`}
                >
                  {studentStatus ===
                  "active"
                    ? "Active"
                    : "Inactive"}
                </strong>

              </div>

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <section className="faculty-student-actions-section">

            <button
              type="button"
              className="faculty-student-action-btn primary"
              onClick={
                handleProgress
              }
            >
              <TrendingUp
                size={18}
              />

              <span>
                View Progress
              </span>

            </button>

            <button
              type="button"
              className="faculty-student-action-btn secondary"
              onClick={
                handleBack
              }
            >
              <ArrowLeft
                size={18}
              />

              <span>
                Back to Students
              </span>

            </button>

          </section>

        </div>

      </main>

    </div>
  );
};

export default FacultyStudentDetails;