
import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ChartNoAxesCombined,
  ClipboardCheck,
  UserRound,
  LogOut,
  Search,
  Eye,
  Clock,
  CheckCircle,
  FileText,
  Video,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../css/FacultyDashboard.css";
import "../css/FacultyMyCourses.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

const FacultyMyCourses = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================
  // FACULTY SESSION
  // =========================================

  const getLoggedInFaculty = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("facultySession") || "null"
      );
    } catch (error) {
      console.error("Unable to read faculty session:", error);
      return null;
    }
  };

  const getFacultyToken = () => {
    return localStorage.getItem("facultyToken") || null;
  };

  const [loggedInFaculty, setLoggedInFaculty] =
    useState(getLoggedInFaculty());

  // =========================================
  // FACULTY INFORMATION
  // =========================================

  const getFacultyName = (faculty) => {
    if (!faculty) return "";

    return (
      faculty.name ||
      faculty.fullName ||
      faculty.facultyName ||
      faculty.username ||
      faculty.userName ||
      ""
    );
  };

  const getFacultyEmail = (faculty) => {
    if (!faculty) return "";

    return String(
      faculty.email || faculty.facultyEmail || ""
    ).trim().toLowerCase();
  };

  const getFacultyId = (faculty) => {
    if (!faculty) return "";

    return String(
      faculty._id || faculty.id || faculty.userId || ""
    ).trim();
  };

  // =========================================
  // LOAD COURSES
  // =========================================

  const loadCourses = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const faculty = getLoggedInFaculty();

      if (!faculty) {
        setCourses([]);
        setErrorMessage(
          "Faculty session not found. Please login again."
        );
        return;
      }

      const currentFacultyId = getFacultyId(faculty);

      if (!currentFacultyId) {
        setCourses([]);
        setErrorMessage(
          "Faculty ID not found. Please login again."
        );
        return;
      }

      const facultyToken = getFacultyToken();

      if (!facultyToken) {
        sessionStorage.removeItem("facultySession");
        localStorage.removeItem("facultyToken");

        setCourses([]);
        setErrorMessage(
          "Faculty authentication token not found. Please login again."
        );

        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/faculty-dashboard/${currentFacultyId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${facultyToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("facultySession");
        localStorage.removeItem("facultyToken");

        window.dispatchEvent(new Event("userLoginChanged"));

        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok || !result.success) {
        setCourses([]);
        setErrorMessage(
          result.message || "Unable to load courses."
        );
        return;
      }

      const facultyDashboardData = result.data || {};
      const facultyCourses = facultyDashboardData.courses || [];

      const mongoCourses = facultyCourses.map((course) => ({
        ...course,
        id: course._id || course.id,
        lessonCount: Number(course.lessonCount || 0),
        studentCount: Number(course.studentCount || 0),
      }));

      setCourses(mongoCourses);
    } catch (error) {
      console.error("Error loading faculty courses:", error);

      setCourses([]);
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD DATA AND EVENTS
  // =========================================

  useEffect(() => {
    loadCourses();

    const handleUserChange = () => {
      const faculty = getLoggedInFaculty();
      setLoggedInFaculty(faculty);
      loadCourses();
    };

    const handleCoursesUpdate = () => {
      loadCourses();
    };

    window.addEventListener("storage", handleCoursesUpdate);
    window.addEventListener("coursesUpdated", handleCoursesUpdate);
    window.addEventListener("facultyUpdated", handleCoursesUpdate);
    window.addEventListener("userLoginChanged", handleUserChange);

    return () => {
      window.removeEventListener("storage", handleCoursesUpdate);
      window.removeEventListener("coursesUpdated", handleCoursesUpdate);
      window.removeEventListener("facultyUpdated", handleCoursesUpdate);
      window.removeEventListener("userLoginChanged", handleUserChange);
    };
  }, []);

  // =========================================
  // FILTER COURSES BY FACULTY
  // =========================================

  const facultyId = getFacultyId(loggedInFaculty);
  const facultyEmail = getFacultyEmail(loggedInFaculty);
  const facultyName = getFacultyName(loggedInFaculty)
    .trim()
    .toLowerCase();

  const facultyCourses = courses.filter((course) => {
    if (!facultyId && !facultyEmail && !facultyName) {
      return false;
    }

    const courseFacultyId = String(
      course.facultyId ||
        course.assignedFacultyId ||
        course.instructorId ||
        ""
    ).trim();

    const courseFacultyEmail = String(
      course.facultyEmail ||
        course.assignedFacultyEmail ||
        course.instructorEmail ||
        ""
    )
      .trim()
      .toLowerCase();

    const courseFacultyName = String(
      course.faculty ||
        course.facultyName ||
        course.instructorName ||
        ""
    )
      .trim()
      .toLowerCase();

    return (
      (facultyId &&
        courseFacultyId &&
        courseFacultyId === facultyId) ||
      (facultyEmail &&
        courseFacultyEmail &&
        courseFacultyEmail === facultyEmail) ||
      (facultyName &&
        courseFacultyName &&
        courseFacultyName === facultyName)
    );
  });

  // =========================================
  // SEARCH AND STATUS FILTER
  // =========================================

  const filteredCourses = facultyCourses.filter((course) => {
    const courseName = String(
      course.title || course.courseName || course.name || ""
    ).toLowerCase();

    const category = String(course.category || "").toLowerCase();
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      courseName.includes(searchText) ||
      category.includes(searchText);

    const courseStatus = String(course.status || "draft")
      .trim()
      .toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      courseStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =========================================
  // NAVIGATION
  // =========================================

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("facultySession");
    localStorage.removeItem("facultyToken");

    window.dispatchEvent(new Event("userLoginChanged"));

    navigate("/login", { replace: true });
  };

  const handleView = (course) => {
    navigate("/faculty/course-details", {
      state: { course },
    });
  };

  const handleManageContent = (course) => {
    navigate("/faculty/course-content", {
      state: { course },
    });
  };

  const handleStudents = (course) => {
    navigate("/faculty/students", {
      state: { course },
    });
  };

  const handleProgress = (course) => {
    navigate("/faculty/progress", {
      state: { course },
    });
  };

  const handleQuiz = (course) => {
    navigate("/faculty/quiz", {
      state: {
        course,
        fromMyCourses: true,
      },
    });
  };

  // =========================================
  // STATUS CLASS
  // =========================================

  const getStatusClass = (status) => {
    const normalizedStatus = String(status || "draft")
      .toLowerCase()
      .trim();

    if (normalizedStatus === "published") {
      return "status-published";
    }

    if (normalizedStatus === "pending") {
      return "status-pending";
    }

    if (normalizedStatus === "rejected") {
      return "status-rejected";
    }

    return "status-draft";
  };

  // =========================================
  // STATISTICS
  // =========================================

  const totalCourses = facultyCourses.length;

  const publishedCourses = facultyCourses.filter(
    (course) =>
      String(course.status || "").toLowerCase().trim() ===
      "published"
  ).length;

  const pendingCourses = facultyCourses.filter(
    (course) =>
      String(course.status || "").toLowerCase().trim() ===
      "pending"
  ).length;

  const draftCourses = facultyCourses.filter(
    (course) =>
      String(course.status || "draft").toLowerCase().trim() ===
      "draft"
  ).length;

  // =========================================
  // COURSE IMAGE ERROR HANDLER
  // =========================================

  const handleImageError = (event) => {
    const imageElement = event.currentTarget;

    // Avoid an infinite fallback loop if the default image also fails.
    if (imageElement.dataset.fallback === "true") {
      imageElement.style.display = "none";
      return;
    }

    imageElement.dataset.fallback = "true";
    imageElement.src = DEFAULT_COURSE_IMAGE;
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="faculty-dashboard">
      {/* SIDEBAR */}

      <aside className="faculty-sidebar">
        <div className="faculty-logo">
          <span className="faculty-brand-mark"></span>
          <span className="faculty-brand-text">LearnDesk</span>
        </div>

        <nav className="faculty-nav">
          <div
            className="faculty-nav-item"
            onClick={() => handleNavigation("/faculty")}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>

          <div
            className="faculty-nav-item active"
            onClick={() => handleNavigation("/faculty/courses")}
          >
            <BookOpen size={20} />
            <span>My Courses</span>
          </div>

          <div
            className="faculty-nav-item"
            onClick={() => handleNavigation("/faculty/students")}
          >
            <Users size={20} />
            <span>Students</span>
          </div>

          <div
            className="faculty-nav-item"
            onClick={() => handleNavigation("/faculty/progress")}
          >
            <ChartNoAxesCombined size={20} />
            <span>Student Progress</span>
          </div>

          <div
            className="faculty-nav-item"
            onClick={() => handleNavigation("/faculty/quiz")}
          >
            <ClipboardCheck size={20} />
            <span>Quiz Management</span>
          </div>

          <div
            className="faculty-nav-item"
            onClick={() => handleNavigation("/faculty/profile")}
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

      {/* MAIN CONTENT */}

      <main className="faculty-main">
        {/* HEADER */}

        <div className="faculty-courses-header">
          <div className="faculty-courses-title-row">
            <div className="faculty-courses-title-icon">
              <BookOpen size={22} />
            </div>

            <div>
              <h1>My Courses</h1>
              <p>
                Manage content, students and learning activities
                for your assigned courses.
              </p>
            </div>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="faculty-course-stats">
          <div className="faculty-course-stat-card">
            <div className="faculty-course-stat-icon purple">
              <BookOpen size={20} />
            </div>
            <div>
              <span>Total Courses</span>
              <strong>{totalCourses}</strong>
            </div>
          </div>

          <div className="faculty-course-stat-card">
            <div className="faculty-course-stat-icon green">
              <CheckCircle size={20} />
            </div>
            <div>
              <span>Published</span>
              <strong>{publishedCourses}</strong>
            </div>
          </div>

          <div className="faculty-course-stat-card">
            <div className="faculty-course-stat-icon orange">
              <Clock size={20} />
            </div>
            <div>
              <span>Pending</span>
              <strong>{pendingCourses}</strong>
            </div>
          </div>

          <div className="faculty-course-stat-card">
            <div className="faculty-course-stat-icon blue">
              <FileText size={20} />
            </div>
            <div>
              <span>Draft</span>
              <strong>{draftCourses}</strong>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTER */}

        <div className="faculty-course-toolbar">
          <div className="faculty-course-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="faculty-course-status-filter"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="faculty-empty-courses">
            <div className="faculty-empty-icon">
              <BookOpen size={30} />
            </div>
            <h3>Loading Courses...</h3>
            <p>Please wait while we load your courses.</p>
          </div>
        ) : errorMessage ? (
          <div className="faculty-empty-courses">
            <div className="faculty-empty-icon">
              <BookOpen size={30} />
            </div>
            <h3>Unable to Load Courses</h3>
            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={loadCourses}
              className="faculty-retry-btn"
            >
              Try Again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="faculty-empty-courses">
            <div className="faculty-empty-icon">
              <BookOpen size={30} />
            </div>

            <h3>
              {facultyCourses.length === 0
                ? "No courses assigned"
                : "No courses found"}
            </h3>

            <p>
              {facultyCourses.length === 0
                ? "No courses have been assigned to you by the Admin yet."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          /* COURSE GRID */

          <div className="faculty-courses-grid">
            {filteredCourses.map((course) => {
              const courseName =
                course.title ||
                course.courseName ||
                course.name ||
                "Untitled Course";

              const description =
                course.description ||
                "Explore this course and improve your knowledge with LearnDesk.";

              const category = course.category || "General";

              const status = String(course.status || "draft")
                .trim()
                .toLowerCase();

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

              const duration =
                course.duration ||
                course.courseDuration ||
                "Self-paced";

              // Same default image used in Student Browse.js
              const courseImage =
                course.image || DEFAULT_COURSE_IMAGE;

              return (
                <div
                  className="faculty-course-card"
                  key={course.id}
                >
                  {/* COURSE BANNER */}

                  <div className="faculty-course-card-top">
                    <img
                      className="faculty-course-image"
                      src={courseImage}
                      alt={courseName}
                      onError={handleImageError}
                    />

                    <span
                      className={`faculty-course-status ${getStatusClass(
                        status
                      )}`}
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1)}
                    </span>
                  </div>

                  {/* COURSE BODY */}

                  <div className="faculty-course-card-body">
                    <span className="faculty-course-category">
                      {category}
                    </span>

                    <h3 title={courseName}>{courseName}</h3>

                    <p>{description}</p>

                    {/* COURSE INFORMATION */}

                    <div className="faculty-course-meta">
                      <span>
                        <Users size={15} />
                        {students} Students
                      </span>

                      <span>
                        <BookOpen size={15} />
                        {lessons} Lessons
                      </span>

                      <span>
                        <Clock size={15} />
                        {duration}
                      </span>
                    </div>
                  </div>

                  {/* COURSE ACTIONS */}

                  <div className="faculty-course-actions">
                    <button
                      type="button"
                      className="faculty-view-btn"
                      onClick={() => handleView(course)}
                      title="View Course"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      type="button"
                      className="faculty-edit-btn"
                      onClick={() => handleManageContent(course)}
                      title="Manage Course Content"
                    >
                      <Video size={16} />
                      Content
                    </button>

                    <button
                      type="button"
                      className="faculty-view-btn"
                      onClick={() => handleStudents(course)}
                      title="View Students"
                    >
                      <Users size={16} />
                      Students
                    </button>

                    <button
                      type="button"
                      className="faculty-view-btn"
                      onClick={() => handleProgress(course)}
                      title="View Student Progress"
                    >
                      <TrendingUp size={16} />
                      Progress
                    </button>

                    <button
                      type="button"
                      className="faculty-view-btn faculty-quiz-btn"
                      onClick={() => handleQuiz(course)}
                      title="Manage Quiz"
                    >
                      <ClipboardCheck size={16} />
                      Quiz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyMyCourses;