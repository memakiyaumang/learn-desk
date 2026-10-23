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
  Plus,
  Video,
  FileText,
  Clock,
  Edit3,
  Trash2,
  X,
  Save,
  ArrowLeft,
  PlayCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import "../css/FacultyDashboard.css";
import "../css/FacultyCourseContent.css";

const FacultyCourseContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --------------------------------------------------
  // Faculty Session
  // --------------------------------------------------
  const getLoggedInFaculty = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("facultySession") || "null"
      );
    } catch (error) {
      return null;
    }
  };

  const [loggedInFaculty, setLoggedInFaculty] =
    useState(getLoggedInFaculty());

  // --------------------------------------------------
  // Faculty Token
  // Authentication uses ONLY localStorage.facultyToken
  // --------------------------------------------------
  const getFacultyToken = () => {
    const facultyToken =
      localStorage.getItem("facultyToken");

    return facultyToken || null;
  };

  // --------------------------------------------------
  // Faculty Auth Headers
  // --------------------------------------------------
  const getFacultyAuthHeaders = () => {
    const facultyToken = getFacultyToken();

    return {
      "Content-Type": "application/json",
      ...(facultyToken
        ? {
            Authorization: `Bearer ${facultyToken}`,
          }
        : {}),
    };
  };

  // --------------------------------------------------
  // Handle Unauthorized Faculty
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Course received from My Courses page
  // --------------------------------------------------
  const [selectedCourse, setSelectedCourse] = useState(
    location.state?.course || null
  );

  // --------------------------------------------------
  // Lessons
  // --------------------------------------------------
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] =
    useState(true);
  const [lessonLoadError, setLessonLoadError] =
    useState("");

  // --------------------------------------------------
  // Modal
  // --------------------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] =
    useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    materialUrl: "",
    duration: "",
  });

  // --------------------------------------------------
  // Form Validation
  // --------------------------------------------------
  const [formErrors, setFormErrors] = useState({});

  const [savingLesson, setSavingLesson] =
    useState(false);

  const [deletingLessonId, setDeletingLessonId] =
    useState(null);

  // --------------------------------------------------
  // Get Course Name
  // --------------------------------------------------
  const getCourseName = (course) => {
    if (!course) return "Course";

    return (
      course.title ||
      course.courseName ||
      course.name ||
      "Untitled Course"
    );
  };

  // --------------------------------------------------
  // Get Course ID
  // --------------------------------------------------
  const getCourseId = (course) => {
    if (!course) return null;

    return (
      course.id ||
      course.courseId ||
      course._id ||
      null
    );
  };

  // --------------------------------------------------
  // Load Lessons From MongoDB
  // --------------------------------------------------
  const loadLessons = async () => {
    if (!selectedCourse) {
      setLessons([]);
      setLoadingLessons(false);
      return;
    }

    const courseId = getCourseId(selectedCourse);

    if (!courseId) {
      setLessons([]);
      setLoadingLessons(false);
      setLessonLoadError(
        "Course ID not found."
      );
      return;
    }

    const facultyToken = getFacultyToken();

    if (!facultyToken) {
      setLessons([]);
      setLoadingLessons(false);
      setLessonLoadError(
        "Faculty authentication token not found. Please login again."
      );
      return;
    }

    try {
      setLoadingLessons(true);
      setLessonLoadError("");

      const response = await fetch(
        `https://project-final-backend-oeh1.onrender.com/api/get-lessons/${courseId}`,
        {
          method: "GET",
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

      if (!response.ok || !result.success) {
        setLessons([]);
        setLessonLoadError(
          result.message ||
            "Unable to load course lessons."
        );
        return;
      }

      const courseLessons = Array.isArray(
        result.data
      )
        ? result.data
        : [];

      const normalizedLessons =
        courseLessons
          .sort(
            (a, b) =>
              Number(a.order || 0) -
              Number(b.order || 0)
          )
          .map((lesson) => ({
            ...lesson,
            id: lesson._id || lesson.id,
          }));

      setLessons(normalizedLessons);
    } catch (error) {
      console.error(
        "Error loading lessons:",
        error
      );

      setLessons([]);

      setLessonLoadError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoadingLessons(false);
    }
  };

  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------
  useEffect(() => {
    loadLessons();

    const handleUserChange = () => {
      setLoggedInFaculty(
        getLoggedInFaculty()
      );
    };

    window.addEventListener(
      "userLoginChanged",
      handleUserChange
    );

    return () => {
      window.removeEventListener(
        "userLoginChanged",
        handleUserChange
      );
    };
  }, [selectedCourse]);

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------
  const handleNavigation = (path) => {
    navigate(path);
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("facultyToken");
    sessionStorage.removeItem("facultySession");

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login", {
      replace: true,
    });
  };

  // --------------------------------------------------
  // Open Add Lesson Modal
  // --------------------------------------------------
  const handleAddLesson = () => {
    setEditingLesson(null);

    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      materialUrl: "",
      duration: "",
    });

    setFormErrors({});
    setShowModal(true);
  };

  // --------------------------------------------------
  // Open Edit Lesson Modal
  // --------------------------------------------------
  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);

    setFormData({
      title: lesson.title || "",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      materialUrl: lesson.materialUrl || "",
      duration: lesson.duration || "",
    });

    setFormErrors({});
    setShowModal(true);
  };

  // --------------------------------------------------
  // Close Modal
  // --------------------------------------------------
  const handleCloseModal = () => {
    if (savingLesson) {
      return;
    }

    setShowModal(false);
    setEditingLesson(null);

    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      materialUrl: "",
      duration: "",
    });

    setFormErrors({});
  };

  // --------------------------------------------------
  // Form Change
  // --------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // --------------------------------------------------
  // Validate URL
  // --------------------------------------------------
  const isValidUrl = (value) => {
    if (!value.trim()) {
      return true;
    }

    try {
      const url = new URL(value.trim());

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch (error) {
      return false;
    }
  };

  // --------------------------------------------------
  // Validate Duration
  // --------------------------------------------------
  const isValidDuration = (value) => {
    if (!value.trim()) {
      return true;
    }

    const durationPattern =
      /^\d+\s*(minute|minutes|min|mins|hour|hours|hr|hrs)$/i;

    return durationPattern.test(
      value.trim()
    );
  };

  // --------------------------------------------------
  // Validate Form
  // --------------------------------------------------
  const validateForm = () => {
    const errors = {};

    const title = formData.title.trim();

    const description =
      formData.description.trim();

    const duration =
      formData.duration.trim();

    const videoUrl =
      formData.videoUrl.trim();

    const materialUrl =
      formData.materialUrl.trim();

    if (!title) {
      errors.title =
        "Please enter lesson title.";
    } else if (title.length < 3) {
      errors.title =
        "Lesson title must be at least 3 characters.";
    }

    if (
      description &&
      description.length < 5
    ) {
      errors.description =
        "Description must be at least 5 characters.";
    }

    if (
      duration &&
      !isValidDuration(duration)
    ) {
      errors.duration =
        "Use a format like 25 minutes or 1 hour.";
    }

    if (
      videoUrl &&
      !isValidUrl(videoUrl)
    ) {
      errors.videoUrl =
        "Please enter a valid URL starting with http:// or https://.";
    }

    if (
      materialUrl &&
      !isValidUrl(materialUrl)
    ) {
      errors.materialUrl =
        "Please enter a valid URL starting with http:// or https://.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // --------------------------------------------------
  // Save Lesson
  // --------------------------------------------------
  const handleSaveLesson = async (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      setFormErrors({
        general:
          "Please select a course first.",
      });
      return;
    }

    const courseId =
      getCourseId(selectedCourse);

    if (!courseId) {
      setFormErrors({
        general: "Course ID not found.",
      });
      return;
    }

    if (!getFacultyToken()) {
      setFormErrors({
        general:
          "Faculty authentication token not found. Please login again.",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSavingLesson(true);

      // ----------------------------------------------
      // Edit Existing Lesson
      // ----------------------------------------------
      if (editingLesson) {
        const updateData = {
          title: formData.title.trim(),

          description:
            formData.description.trim(),

          videoUrl:
            formData.videoUrl.trim(),

          materialUrl:
            formData.materialUrl.trim(),

          duration:
            formData.duration.trim(),
        };

        const response = await fetch(
          `https://project-final-backend-oeh1.onrender.com/api/update-lesson/${editingLesson.id}`,
          {
            method: "PUT",

            headers:
              getFacultyAuthHeaders(),

            body: JSON.stringify(
              updateData
            ),
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleUnauthorized();
          return;
        }

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          setFormErrors({
            general:
              result.message ||
              "Failed to update lesson.",
          });

          return;
        }
      }

      // ----------------------------------------------
      // Add New Lesson
      // ----------------------------------------------
      else {
        const newLessonData = {
          courseId: String(courseId),

          courseName:
            getCourseName(
              selectedCourse
            ),

          facultyId:
            loggedInFaculty?.id ||
            loggedInFaculty?._id ||
            "",

          facultyEmail:
            loggedInFaculty?.email ||
            "",

          title:
            formData.title.trim(),

          description:
            formData.description.trim(),

          videoUrl:
            formData.videoUrl.trim(),

          materialUrl:
            formData.materialUrl.trim(),

          duration:
            formData.duration.trim(),

          order:
            lessons.length + 1,
        };

        const response = await fetch(
          "https://project-final-backend-oeh1.onrender.com/api/add-lesson",
          {
            method: "POST",

            headers:
              getFacultyAuthHeaders(),

            body: JSON.stringify(
              newLessonData
            ),
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleUnauthorized();
          return;
        }

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          setFormErrors({
            general:
              result.message ||
              "Failed to add lesson.",
          });

          return;
        }
      }

      await loadLessons();

      setShowModal(false);
      setEditingLesson(null);

      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        materialUrl: "",
        duration: "",
      });

      setFormErrors({});
    } catch (error) {
      console.error(
        "Error saving lesson:",
        error
      );

      setFormErrors({
        general:
          "Something went wrong while saving the lesson.",
      });
    } finally {
      setSavingLesson(false);
    }
  };

  // --------------------------------------------------
  // Delete Lesson
  // --------------------------------------------------
  const handleDeleteLesson = async (
    lessonId
  ) => {
    if (deletingLessonId) {
      return;
    }

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this lesson?"
      );

    if (!confirmDelete) {
      return;
    }

    if (!getFacultyToken()) {
      handleUnauthorized();
      return;
    }

    try {
      setDeletingLessonId(lessonId);

      const response = await fetch(
        `https://project-final-backend-oeh1.onrender.com/api/delete-lesson/${lessonId}`,
        {
          method: "DELETE",

          headers:
            getFacultyAuthHeaders(),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        console.error(
          result.message ||
            "Failed to delete lesson."
        );

        return;
      }

      // ----------------------------------------------
      // Re-order remaining lessons
      // ----------------------------------------------
      const remainingLessons =
        lessons.filter(
          (lesson) =>
            String(lesson.id) !==
            String(lessonId)
        );

      for (
        let index = 0;
        index <
        remainingLessons.length;
        index++
      ) {
        const lesson =
          remainingLessons[index];

        const reorderResponse =
          await fetch(
            `https://project-final-backend-oeh1.onrender.com/api/update-lesson/${lesson.id}`,
            {
              method: "PUT",

              headers:
                getFacultyAuthHeaders(),

              body: JSON.stringify({
                title:
                  lesson.title,

                description:
                  lesson.description ||
                  "",

                videoUrl:
                  lesson.videoUrl ||
                  "",

                materialUrl:
                  lesson.materialUrl ||
                  "",

                duration:
                  lesson.duration ||
                  "",

                order:
                  index + 1,
              }),
            }
          );

        if (
          reorderResponse.status ===
            401 ||
          reorderResponse.status ===
            403
        ) {
          handleUnauthorized();
          return;
        }
      }

      await loadLessons();
    } catch (error) {
      console.error(
        "Error deleting lesson:",
        error
      );
    } finally {
      setDeletingLessonId(null);
    }
  };

  // --------------------------------------------------
  // Go Back
  // --------------------------------------------------
  const handleBack = () => {
    navigate("/faculty/courses");
  };

  // --------------------------------------------------
  // Course Not Selected
  // --------------------------------------------------
  if (!selectedCourse) {
    return (
      <div className="faculty-dashboard">

        {/* ================= SIDEBAR ================= */}

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
                handleNavigation(
                  "/faculty"
                )
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>

            <div
              className="faculty-nav-item active"
              onClick={() =>
                handleNavigation(
                  "/faculty/courses"
                )
              }
            >
              <BookOpen size={20} />
              <span>My Courses</span>
            </div>

            <div
              className="faculty-nav-item"
              onClick={() =>
                handleNavigation(
                  "/faculty/students"
                )
              }
            >
              <Users size={20} />
              <span>Students</span>
            </div>

            <div
              className="faculty-nav-item"
              onClick={() =>
                handleNavigation(
                  "/faculty/progress"
                )
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
                handleNavigation(
                  "/faculty/quiz"
                )
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
                handleNavigation(
                  "/faculty/notifications"
                )
              }
            >
              <Bell size={20} />
              <span>Notifications</span>
            </div>

            <div
              className="faculty-nav-item"
              onClick={() =>
                handleNavigation(
                  "/faculty/profile"
                )
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

        {/* ================= MAIN ================= */}

        <main className="faculty-main">

          <div className="faculty-content-not-found">

            <BookOpen size={40} />

            <h2>
              No Course Selected
            </h2>

            <p>
              Please open a course from My
              Courses to manage its content.
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="faculty-primary-btn"
            >
              <ArrowLeft size={17} />
              Back to My Courses
            </button>

          </div>

        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // Course Details
  // --------------------------------------------------
  const courseName =
    getCourseName(selectedCourse);

  const courseDescription =
    selectedCourse.description ||
    "Manage lessons and learning materials for this course.";

  const category =
    selectedCourse.category ||
    "General";

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

          <div
            className="faculty-nav-item active"
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

        {/* ================= HEADER ================= */}

        <div className="faculty-content-header">

          <div className="faculty-content-header-left">

            <button
              type="button"
              className="faculty-back-btn"
              onClick={handleBack}
            >
              <ArrowLeft size={18} />
            </button>

            <div>

              <div className="faculty-page-label">
                COURSE CONTENT
              </div>

              <h1>
                {courseName}
              </h1>

              <p>
                Manage lessons, videos and
                study materials for this
                course.
              </p>

            </div>

          </div>

          <button
            type="button"
            className="faculty-add-lesson-btn"
            onClick={handleAddLesson}
            disabled={savingLesson}
          >
            <Plus size={18} />
            Add Lesson
          </button>

        </div>

        {/* ================= COURSE INFO ================= */}

        <div className="faculty-course-summary">

          <div className="faculty-course-summary-icon">
            <BookOpen size={26} />
          </div>

          <div className="faculty-course-summary-content">

            <span className="faculty-course-summary-category">
              {category}
            </span>

            <h2>
              {courseName}
            </h2>

            <p>
              {courseDescription}
            </p>

          </div>

          <div className="faculty-course-summary-stat">

            <strong>
              {lessons.length}
            </strong>

            <span>
              Lessons
            </span>

          </div>

        </div>

        {/* ================= SECTION HEADER ================= */}

        <div className="faculty-lessons-section-header">

          <div>

            <h2>
              Course Lessons
            </h2>

            <p>
              Add and manage the learning
              content for your students.
            </p>

          </div>

          <span className="faculty-lesson-count">
            {lessons.length}{" "}
            {lessons.length === 1
              ? "Lesson"
              : "Lessons"}
          </span>

        </div>

        {/* ================= LESSONS ================= */}

        {loadingLessons ? (

          <div className="faculty-empty-lessons">

            <div className="faculty-empty-lessons-icon">
              <BookOpen size={32} />
            </div>

            <h3>
              Loading lessons...
            </h3>

            <p>
              Please wait while we load the
              course content.
            </p>

          </div>

        ) : lessonLoadError ? (

          <div className="faculty-empty-lessons">

            <div className="faculty-empty-lessons-icon">
              <BookOpen size={32} />
            </div>

            <h3>
              Unable to load lessons
            </h3>

            <p>
              {lessonLoadError}
            </p>

            <button
              type="button"
              className="faculty-primary-btn"
              onClick={loadLessons}
            >
              Try Again
            </button>

          </div>

        ) : lessons.length === 0 ? (

          <div className="faculty-empty-lessons">

            <div className="faculty-empty-lessons-icon">
              <BookOpen size={32} />
            </div>

            <h3>
              No lessons yet
            </h3>

            <p>
              Start building this course by
              adding your first lesson.
            </p>

            <button
              type="button"
              className="faculty-primary-btn"
              onClick={handleAddLesson}
            >
              <Plus size={17} />
              Add First Lesson
            </button>

          </div>

        ) : (

          <div className="faculty-lessons-list">

            {lessons.map(
              (lesson, index) => (

                <div
                  className="faculty-lesson-card"
                  key={lesson.id}
                >

                  {/* Lesson Number */}

                  <div className="faculty-lesson-number">
                    {index + 1}
                  </div>

                  {/* Lesson Icon */}

                  <div className="faculty-lesson-icon">

                    {lesson.videoUrl ? (
                      <PlayCircle
                        size={23}
                      />
                    ) : (
                      <FileText
                        size={23}
                      />
                    )}

                  </div>

                  {/* Lesson Information */}

                  <div className="faculty-lesson-info">

                    <div className="faculty-lesson-title-row">

                      <h3>
                        {lesson.title}
                      </h3>

                    </div>

                    {lesson.description && (
                      <p>
                        {lesson.description}
                      </p>
                    )}

                    <div className="faculty-lesson-meta">

                      {lesson.duration && (
                        <span>
                          <Clock size={14} />
                          {lesson.duration}
                        </span>
                      )}

                      {lesson.videoUrl && (
                        <span>
                          <Video size={14} />
                          Video
                        </span>
                      )}

                      {lesson.materialUrl && (
                        <span>
                          <FileText size={14} />
                          Material
                        </span>
                      )}

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="faculty-lesson-actions">

                    {lesson.videoUrl && (
                      <a
                        href={lesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="faculty-lesson-view-btn"
                      >
                        <PlayCircle
                          size={16}
                        />
                        View
                      </a>
                    )}

                    <button
                      type="button"
                      className="faculty-lesson-edit-btn"
                      onClick={() =>
                        handleEditLesson(
                          lesson
                        )
                      }
                      title="Edit Lesson"
                      disabled={
                        deletingLessonId !==
                        null
                      }
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      type="button"
                      className="faculty-lesson-delete-btn"
                      onClick={() =>
                        handleDeleteLesson(
                          lesson.id
                        )
                      }
                      title="Delete Lesson"
                      disabled={
                        deletingLessonId !==
                          null &&
                        String(
                          deletingLessonId
                        ) !==
                          String(lesson.id)
                      }
                    >
                      {String(
                        deletingLessonId
                      ) ===
                      String(lesson.id) ? (
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                          }}
                        >
                          Deleting...
                        </span>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </main>

      {/* ==================================================
          ADD / EDIT LESSON MODAL
      ================================================== */}

      {showModal && (

        <div
          className="faculty-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              handleCloseModal();
            }

          }}
        >

          <div className="faculty-lesson-modal">

            {/* Modal Header */}

            <div className="faculty-modal-header">

              <div>

                <span className="faculty-modal-label">
                  {editingLesson
                    ? "EDIT LESSON"
                    : "NEW LESSON"}
                </span>

                <h2>
                  {editingLesson
                    ? "Edit Lesson"
                    : "Add New Lesson"}
                </h2>

              </div>

              <button
                type="button"
                className="faculty-modal-close"
                onClick={handleCloseModal}
                aria-label="Close"
                disabled={savingLesson}
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

            <form
              className="faculty-lesson-form"
              onSubmit={handleSaveLesson}
              noValidate
            >

              {/* General Error */}

              {formErrors.general && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    border:
                      "1px solid #fecaca",
                    color: "#dc2626",
                    fontSize: "12px",
                    lineHeight: "1.4",
                  }}
                >
                  {formErrors.general}
                </div>
              )}

              {/* Lesson Title */}

              <div className="faculty-form-group">

                <label>
                  Lesson Title
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter lesson title"
                  className={
                    formErrors.title
                      ? "faculty-input-error"
                      : ""
                  }
                  disabled={savingLesson}
                />

                {formErrors.title && (
                  <div className="faculty-field-error">
                    {formErrors.title}
                  </div>
                )}

              </div>

              {/* Description */}

              <div className="faculty-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter lesson description"
                  rows="4"
                  className={
                    formErrors.description
                      ? "faculty-input-error"
                      : ""
                  }
                  disabled={savingLesson}
                />

                {formErrors.description && (
                  <div className="faculty-field-error">
                    {formErrors.description}
                  </div>
                )}

              </div>

              {/* Duration */}

              <div className="faculty-form-group">

                <label>
                  Duration
                </label>

                <div className="faculty-input-with-icon">

                  <Clock size={17} />

                  <input
                    type="text"
                    name="duration"
                    value={
                      formData.duration
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Example: 25 minutes"
                    className={
                      formErrors.duration
                        ? "faculty-input-error"
                        : ""
                    }
                    disabled={savingLesson}
                  />

                </div>

                {formErrors.duration && (
                  <div className="faculty-field-error">
                    {formErrors.duration}
                  </div>
                )}

              </div>

              {/* Video URL */}

              <div className="faculty-form-group">

                <label>
                  Video URL
                </label>

                <div className="faculty-input-with-icon">

                  <Video size={17} />

                  <input
                    type="url"
                    name="videoUrl"
                    value={
                      formData.videoUrl
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="https://..."
                    className={
                      formErrors.videoUrl
                        ? "faculty-input-error"
                        : ""
                    }
                    disabled={savingLesson}
                  />

                </div>

                {formErrors.videoUrl && (
                  <div className="faculty-field-error">
                    {formErrors.videoUrl}
                  </div>
                )}

              </div>

              {/* Material URL */}

              <div className="faculty-form-group">

                <label>
                  Study Material URL
                </label>

                <div className="faculty-input-with-icon">

                  <FileText size={17} />

                  <input
                    type="url"
                    name="materialUrl"
                    value={
                      formData.materialUrl
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="PDF or material link"
                    className={
                      formErrors.materialUrl
                        ? "faculty-input-error"
                        : ""
                    }
                    disabled={savingLesson}
                  />

                </div>

                {formErrors.materialUrl && (
                  <div className="faculty-field-error">
                    {formErrors.materialUrl}
                  </div>
                )}

              </div>

              {/* Form Actions */}

              <div className="faculty-modal-actions">

                <button
                  type="button"
                  className="faculty-modal-cancel"
                  onClick={
                    handleCloseModal
                  }
                  disabled={savingLesson}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="faculty-modal-save"
                  disabled={savingLesson}
                >
                  {savingLesson ? (
                    <>
                      <span
                        style={{
                          width: "15px",
                          height: "15px",
                          border:
                            "2px solid rgba(255,255,255,0.4)",
                          borderTopColor:
                            "#ffffff",
                          borderRadius:
                            "50%",
                          display:
                            "inline-block",
                          animation:
                            "facultySpin 0.7s linear infinite",
                        }}
                      />

                      {editingLesson
                        ? "Updating..."
                        : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={17} />

                      {editingLesson
                        ? "Update Lesson"
                        : "Save Lesson"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default FacultyCourseContent;