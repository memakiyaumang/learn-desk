import React from "react";
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
  Clock,
  CheckCircle,
  FileText,
  Video,
  PlayCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import "../css/FacultyDashboard.css";
import "../css/FacultyCourseDetails.css";

const FacultyCourseDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const course = location.state?.course;

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    // Faculty authentication token
    // is stored in localStorage
    localStorage.removeItem("facultyToken");

    // Remove faculty session data
    sessionStorage.removeItem("facultySession");

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================
  // NO COURSE SELECTED
  // =========================================

  if (!course) {
    return (
      <div className="faculty-dashboard">

        {/* SIDEBAR */}

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
              className="faculty-nav-item active"
              onClick={() =>
                navigate("/faculty/courses")
              }
            >
              <BookOpen size={20} />
              <span>My Courses</span>
            </div>

            <div
              className="faculty-nav-item"
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
              <span>Student Progress</span>
            </div>

            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate("/faculty/quiz")
              }
            >
              <ClipboardCheck size={20} />
              <span>Quiz Management</span>
            </div>

            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate("/faculty/notifications")
              }
            >
              <Bell size={20} />
              <span>Notifications</span>
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

        {/* MAIN */}

        <main className="faculty-main">

          <div className="faculty-course-not-found">

            <div className="faculty-course-not-found-icon">
              <BookOpen size={30} />
            </div>

            <h2>
              No Course Selected
            </h2>

            <p>
              Please select a course from My Courses.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/faculty/courses")
              }
            >
              <ArrowLeft size={16} />
              Back to My Courses
            </button>

          </div>

        </main>

      </div>
    );
  }

  // =========================================
  // COURSE DATA
  // =========================================

  const courseName =
    course.title ||
    course.courseName ||
    course.name ||
    "Untitled Course";

  const description =
    course.description ||
    "No course description available.";

  const category =
    course.category ||
    "General";

  const level =
    course.level ||
    "All Levels";

  const duration =
    course.duration ||
    course.courseDuration ||
    "Self-paced";

  const students =
    course.studentsCount ??
    course.studentCount ??
    course.students ??
    0;

  const lessons =
    course.lessonsCount ??
    course.lessonCount ??
    course.lessons ??
    0;

  const status =
    String(course.status || "draft")
      .trim()
      .toLowerCase();

  const facultyName =
    course.faculty ||
    course.facultyName ||
    course.instructorName ||
    "Assigned Faculty";

  const getStatusClass = () => {
    if (status === "published") {
      return "faculty-detail-status-published";
    }

    if (status === "pending") {
      return "faculty-detail-status-pending";
    }

    if (status === "rejected") {
      return "faculty-detail-status-rejected";
    }

    return "faculty-detail-status-draft";
  };

  // =========================================
  // ACTIONS
  // =========================================

  const handleContent = () => {
    navigate(
      "/faculty/course-content",
      {
        state: {
          course,
        },
      }
    );
  };

  const handleStudents = () => {
    navigate(
      "/faculty/students",
      {
        state: {
          course,
        },
      }
    );
  };

  const handleProgress = () => {
    navigate(
      "/faculty/progress",
      {
        state: {
          course,
        },
      }
    );
  };

  const handleQuiz = () => {
    navigate(
      "/faculty/quiz",
      {
        state: {
          course,
        },
      }
    );
  };

  return (
    <div className="faculty-dashboard">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="faculty-sidebar">

        {/* LOGO */}

        <div className="faculty-logo">

          <span className="faculty-brand-mark"></span>

          <span className="faculty-brand-text">
            LearnDesk
          </span>

        </div>

        {/* NAVIGATION */}

        <nav className="faculty-nav">

          <div
            className="faculty-nav-item"
            onClick={() =>
              navigate("/faculty")
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
            className="faculty-nav-item active"
            onClick={() =>
              navigate("/faculty/courses")
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
            className="faculty-nav-item"
            onClick={() =>
              navigate("/faculty/students")
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
              navigate("/faculty/progress")
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
              navigate("/faculty/quiz")
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
              navigate("/faculty/profile")
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

        {/* LOGOUT */}

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

        <div className="faculty-course-details-page">

          {/* BACK */}

          <button
            type="button"
            className="faculty-course-back-btn"
            onClick={() =>
              navigate("/faculty/courses")
            }
          >
            <ArrowLeft size={17} />
            Back to My Courses
          </button>

          {/* ==================================================
              COURSE HERO
          ================================================== */}

          <section className="faculty-course-details-hero">

            <div className="faculty-course-details-image">

              {course.image ? (
                <img
                  src={course.image}
                  alt={courseName}
                />
              ) : (
                <BookOpen size={55} />
              )}

            </div>

            <div className="faculty-course-details-hero-content">

              <div className="faculty-course-details-top-row">

                <span className="faculty-course-details-category">
                  {category}
                </span>

                <span
                  className={`faculty-course-details-status ${getStatusClass()}`}
                >
                  {status.charAt(0).toUpperCase() +
                    status.slice(1)}
                </span>

              </div>

              <h1>
                {courseName}
              </h1>

              <p>
                {description}
              </p>

              <div className="faculty-course-details-meta">

                <div>
                  <Users size={17} />
                  <span>
                    {students} Students
                  </span>
                </div>

                <div>
                  <BookOpen size={17} />
                  <span>
                    {lessons} Lessons
                  </span>
                </div>

                <div>
                  <Clock size={17} />
                  <span>
                    {duration}
                  </span>
                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              COURSE INFORMATION
          ================================================== */}

          <section className="faculty-course-info-section">

            <div className="faculty-course-info-header">

              <div>
                <h2>
                  Course Information
                </h2>

                <p>
                  Overview of your assigned course.
                </p>
              </div>

            </div>

            <div className="faculty-course-info-grid">

              <div className="faculty-course-info-card">

                <div className="faculty-course-info-icon purple">
                  <BookOpen size={19} />
                </div>

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {category}
                  </strong>
                </div>

              </div>

              <div className="faculty-course-info-card">

                <div className="faculty-course-info-icon blue">
                  <FileText size={19} />
                </div>

                <div>
                  <span>
                    Level
                  </span>

                  <strong>
                    {level}
                  </strong>
                </div>

              </div>

              <div className="faculty-course-info-card">

                <div className="faculty-course-info-icon orange">
                  <Clock size={19} />
                </div>

                <div>
                  <span>
                    Duration
                  </span>

                  <strong>
                    {duration}
                  </strong>
                </div>

              </div>

              <div className="faculty-course-info-card">

                <div className="faculty-course-info-icon green">
                  <Users size={19} />
                </div>

                <div>
                  <span>
                    Students
                  </span>

                  <strong>
                    {students}
                  </strong>
                </div>

              </div>

              <div className="faculty-course-info-card">

                <div className="faculty-course-info-icon purple">
                  <Video size={19} />
                </div>

                <div>
                  <span>
                    Lessons
                  </span>

                  <strong>
                    {lessons}
                  </strong>
                </div>

              </div>

              <div className="faculty-course-info-card">

                <div className="faculty-course-info-icon green">
                  <UserRound size={19} />
                </div>

                <div>
                  <span>
                    Faculty
                  </span>

                  <strong>
                    {facultyName}
                  </strong>
                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <section className="faculty-course-description-section">

            <div className="faculty-course-description-header">
              <FileText size={20} />

              <div>
                <h2>
                  About This Course
                </h2>

                <p>
                  Course description
                </p>
              </div>
            </div>

            <div className="faculty-course-description-box">
              <p>
                {description}
              </p>
            </div>

          </section>

          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <section className="faculty-course-actions-section">

            <div className="faculty-course-actions-header">

              <div>
                <h2>
                  Course Management
                </h2>

                <p>
                  Manage different learning activities for this course.
                </p>
              </div>

            </div>

            <div className="faculty-course-detail-actions">

              <button
                type="button"
                onClick={handleContent}
                className="faculty-detail-action purple-action"
              >
                <Video size={19} />

                <span>
                  <strong>
                    Course Content
                  </strong>

                  <small>
                    Manage lessons and materials
                  </small>
                </span>

              </button>

              <button
                type="button"
                onClick={handleStudents}
                className="faculty-detail-action blue-action"
              >
                <Users size={19} />

                <span>
                  <strong>
                    Students
                  </strong>

                  <small>
                    View enrolled students
                  </small>
                </span>

              </button>

              <button
                type="button"
                onClick={handleProgress}
                className="faculty-detail-action green-action"
              >
                <ChartNoAxesCombined size={19} />

                <span>
                  <strong>
                    Student Progress
                  </strong>

                  <small>
                    Monitor student performance
                  </small>
                </span>

              </button>

              <button
                type="button"
                onClick={handleQuiz}
                className="faculty-detail-action orange-action"
              >
                <ClipboardCheck size={19} />

                <span>
                  <strong>
                    Quiz Management
                  </strong>

                  <small>
                    Manage course quizzes
                  </small>
                </span>

              </button>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
};

export default FacultyCourseDetails;