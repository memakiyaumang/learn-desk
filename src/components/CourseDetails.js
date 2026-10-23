import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  PlayCircle,
  Award,
} from "lucide-react";

import "../css/CourseDetails.css";

const API_URL = "https://project-final-backend-oeh1.onrender.com";

const CourseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ==================================================
  // COURSE
  // ==================================================

  const [selectedCourse, setSelectedCourse] = useState(
    location.state?.course || null
  );

  const [isCourseLoading, setIsCourseLoading] = useState(true);

  // ==================================================
  // LESSONS
  // ==================================================

  const [lessons, setLessons] = useState([]);

  // ==================================================
  // ENROLLMENT
  // ==================================================

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrollmentLoading, setIsEnrollmentLoading] =
    useState(false);

  // ==================================================
  // GET LOGGED IN STUDENT
  // ==================================================

  const getLoggedInStudent = () => {
    try {
      const student = JSON.parse(
        sessionStorage.getItem("studentSession") || "null"
      );

      return student;
    } catch (error) {
      console.error(
        "Unable to read student session:",
        error
      );

      return null;
    }
  };

  // ==================================================
  // GET JWT TOKEN
  // ==================================================

  const getToken = () => {
    const student = getLoggedInStudent();

    if (student?.token) {
      return student.token;
    }

    const localStorageToken =
      localStorage.getItem("token");

    if (localStorageToken) {
      return localStorageToken;
    }

    return null;
  };

  // ==================================================
  // GET AUTH HEADERS
  // ==================================================

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ==================================================
  // HANDLE UNAUTHORIZED
  // ==================================================

  const handleUnauthorized = () => {
    sessionStorage.removeItem("studentSession");
    sessionStorage.removeItem("studentQuizResult");
    sessionStorage.removeItem("selectedStudentQuiz");

    localStorage.removeItem("token");

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login", {
      replace: true,
      state: {
        from: location.pathname,
      },
    });
  };

  // ==================================================
  // COURSE ID
  // ==================================================

  const getCourseId = (course) => {
    if (!course) {
      return null;
    }

    return (
      course.courseId ??
      course.course_id ??
      course._id ??
      course.id ??
      null
    );
  };

  // ==================================================
  // STUDENT ID
  // ==================================================

  const getStudentId = (student) => {
    if (!student) {
      return null;
    }

    return (
      student.id ??
      student.userId ??
      student._id ??
      null
    );
  };

  // ==================================================
  // STUDENT EMAIL
  // ==================================================

  const getStudentEmail = (student) => {
    if (!student) {
      return "";
    }

    return String(
      student.email ??
        student.emailAddress ??
        ""
    )
      .trim()
      .toLowerCase();
  };

  // ==================================================
  // STUDENT NAME
  // ==================================================

  const getStudentName = (student) => {
    if (!student) {
      return "Student";
    }

    return (
      student.name ||
      student.fullName ||
      student.username ||
      student.userName ||
      "Student"
    );
  };

  // ==================================================
  // COURSE TYPE
  // ==================================================

  const getCourseType = (course) => {
    if (!course) {
      return "free";
    }

    const rawType =
      course.courseType ??
      course.type ??
      "";

    const normalizedType = String(rawType)
      .trim()
      .toLowerCase();

    if (
      normalizedType === "free" ||
      normalizedType === "free course"
    ) {
      return "free";
    }

    if (
      normalizedType === "paid" ||
      normalizedType === "paid course"
    ) {
      return "paid";
    }

    const coursePrice = Number(
      course.price || 0
    );

    return coursePrice > 0
      ? "paid"
      : "free";
  };

  // ==================================================
  // COURSE PRICE
  // ==================================================

  const getCoursePrice = (course) => {
    if (getCourseType(course) === "free") {
      return 0;
    }

    const coursePrice = Number(
      course?.price || 0
    );

    return Number.isFinite(coursePrice)
      ? coursePrice
      : 0;
  };

  // ==================================================
  // LOAD ACTUAL COURSE FROM MONGODB
  // ==================================================

  const loadCourse = async () => {
    try {
      setIsCourseLoading(true);

      const stateCourse =
        location.state?.course;

      if (!stateCourse) {
        setSelectedCourse(null);
        return;
      }

      const selectedId =
        getCourseId(stateCourse);

      if (selectedId === null) {
        setSelectedCourse(null);
        return;
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/api/get-courses`,
        {
          method: "GET",
          headers: getAuthHeaders(),
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

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to load course"
        );
      }

      const courseList =
        Array.isArray(result.data)
          ? result.data
          : [];

      const actualCourse =
        courseList.find((course) => {
          const courseId =
            getCourseId(course);

          return (
            courseId !== null &&
            String(courseId) ===
              String(selectedId)
          );
        });

      if (actualCourse) {
        setSelectedCourse({
          ...actualCourse,

          id:
            actualCourse._id ||
            actualCourse.id ||
            actualCourse.courseId,
        });
      } else {
        setSelectedCourse(null);
      }
    } catch (error) {
      console.error(
        "Error loading course from MongoDB:",
        error
      );

      setSelectedCourse(null);
    } finally {
      setIsCourseLoading(false);
    }
  };

  // ==================================================
  // LOAD LESSONS FROM MONGODB
  // ==================================================

  const loadLessons = async () => {
    if (!selectedCourse) {
      setLessons([]);
      return;
    }

    try {
      const courseId =
        getCourseId(selectedCourse);

      if (courseId === null) {
        setLessons([]);
        return;
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/api/get-lessons/${courseId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
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

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to load lessons"
        );
      }

      const courseLessons =
        Array.isArray(result.data)
          ? result.data
              .map((lesson) => ({
                ...lesson,

                id:
                  lesson._id ||
                  lesson.id,
              }))
              .sort(
                (a, b) =>
                  Number(a.order || 0) -
                  Number(b.order || 0)
              )
          : [];

      setLessons(courseLessons);
    } catch (error) {
      console.error(
        "Error loading lessons from MongoDB:",
        error
      );

      setLessons([]);
    }
  };

  // ==================================================
  // CHECK ENROLLMENT FROM MONGODB
  // ==================================================

  const checkEnrollment = async () => {
    const student =
      getLoggedInStudent();

    if (!student || !selectedCourse) {
      setIsEnrolled(false);
      return;
    }

    try {
      setIsEnrollmentLoading(true);

      const studentId =
        getStudentId(student);

      const courseId =
        getCourseId(selectedCourse);

      if (
        studentId === null ||
        courseId === null
      ) {
        setIsEnrolled(false);
        return;
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_URL}/api/get-enrollment/${studentId}/${courseId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
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

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to check enrollment"
        );
      }

      if (
        result.success &&
        result.data
      ) {
        setIsEnrolled(true);
      } else {
        setIsEnrolled(false);
      }
    } catch (error) {
      console.error(
        "Error checking enrollment from MongoDB:",
        error
      );

      setIsEnrolled(false);
    } finally {
      setIsEnrollmentLoading(false);
    }
  };

  // ==================================================
  // INITIAL COURSE LOAD
  // ==================================================

  useEffect(() => {
    loadCourse();
  }, []);

  // ==================================================
  // LOAD LESSONS + CHECK ENROLLMENT
  // ==================================================

  useEffect(() => {
    if (!selectedCourse) {
      return;
    }

    loadLessons();
    checkEnrollment();

    const handleLessonUpdate = () => {
      loadLessons();
    };

    const handleEnrollmentUpdate = () => {
      checkEnrollment();
    };

    const handleUserChange = () => {
      checkEnrollment();
    };

    window.addEventListener(
      "facultyLessonsUpdated",
      handleLessonUpdate
    );

    window.addEventListener(
      "enrollmentUpdated",
      handleEnrollmentUpdate
    );

    window.addEventListener(
      "userLoginChanged",
      handleUserChange
    );

    window.addEventListener(
      "storage",
      handleEnrollmentUpdate
    );

    return () => {
      window.removeEventListener(
        "facultyLessonsUpdated",
        handleLessonUpdate
      );

      window.removeEventListener(
        "enrollmentUpdated",
        handleEnrollmentUpdate
      );

      window.removeEventListener(
        "userLoginChanged",
        handleUserChange
      );

      window.removeEventListener(
        "storage",
        handleEnrollmentUpdate
      );
    };
  }, [selectedCourse]);

  // ==================================================
  // CREATE ENROLLMENT IN MONGODB
  // ==================================================

  const createEnrollment = async () => {
    const student =
      getLoggedInStudent();

    if (!student || !selectedCourse) {
      return false;
    }

    try {
      setIsEnrollmentLoading(true);

      const courseId =
        getCourseId(selectedCourse);

      const studentId =
        getStudentId(student);

      const studentEmail =
        getStudentEmail(student);

      const studentName =
        getStudentName(student);

      const courseName =
        selectedCourse.title ||
        selectedCourse.courseName ||
        selectedCourse.name ||
        "Untitled Course";

      if (courseId === null) {
        alert(
          "Course ID is missing. Please try again."
        );

        return false;
      }

      if (
        studentId === null ||
        studentEmail === ""
      ) {
        alert(
          "Student information is missing. Please login again."
        );

        return false;
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return false;
      }

      // ---------------------------------------------
      // CREATE ENROLLMENT
      // ---------------------------------------------

      const response = await fetch(
        `${API_URL}/api/add-enrollment`,
        {
          method: "POST",

          headers: getAuthHeaders(),

          body: JSON.stringify({
            studentId: String(studentId),

            studentEmail:
              studentEmail,

            courseId:
              String(courseId),

            courseName:
              courseName,

            totalLessons:
              lessons.length,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return false;
      }

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to enroll in course"
        );
      }

      console.log(
        "Enrollment saved in MongoDB:",
        result.data
      );

      setIsEnrolled(true);

      window.dispatchEvent(
        new Event(
          "enrollmentUpdated"
        )
      );

      return true;
    } catch (error) {
      console.error(
        "Error enrolling in course:",
        error
      );

      alert(
        error.message ||
          "Something went wrong while enrolling in this course."
      );

      return false;
    } finally {
      setIsEnrollmentLoading(false);
    }
  };

  // ==================================================
  // ENROLL / PAYMENT FLOW
  // ==================================================

  const handleEnroll = async () => {
    const student =
      getLoggedInStudent();

    if (!student) {
      navigate("/login", {
        state: {
          from: "/course-details",
          course: selectedCourse,
        },
      });

      return;
    }

    if (!selectedCourse) {
      return;
    }

    if (isEnrollmentLoading) {
      return;
    }

    if (isEnrolled) {
      navigate("/course-learning", {
        state: {
          course: selectedCourse,
        },
      });

      return;
    }

    const courseType =
      getCourseType(
        selectedCourse
      );

    const coursePrice =
      getCoursePrice(
        selectedCourse
      );

    // ---------------------------------------------
    // FREE COURSE
    // ---------------------------------------------

    if (
      courseType === "free" ||
      coursePrice <= 0
    ) {
      const enrollmentCreated =
        await createEnrollment();

      if (enrollmentCreated) {
        navigate("/courses");
      }

      return;
    }

    // ---------------------------------------------
    // PAID COURSE
    // ---------------------------------------------

    navigate("/payment", {
      state: {
        course: selectedCourse,

        courseType: "paid",

        price: coursePrice,

        student: student,

        from: "/course-details",
      },
    });
  };

  // ==================================================
  // COURSE LOADING
  // ==================================================

  if (isCourseLoading) {
    return (
      <div className="course-details-page">

        <button
          type="button"
          className="back-course-button"
          onClick={() =>
            navigate("/browse")
          }
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>

        <div
          className="no-course-details"
          style={{
            textAlign: "center",
            padding: "80px 20px",
          }}
        >
          <h2>
            Loading Course...
          </h2>

          <p>
            Please wait while course
            details are loading.
          </p>
        </div>

      </div>
    );
  }

  // ==================================================
  // COURSE NOT FOUND
  // ==================================================

  if (!selectedCourse) {
    return (
      <div className="course-details-page">

        <button
          type="button"
          className="back-course-button"
          onClick={() =>
            navigate("/browse")
          }
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>

        <div
          className="no-course-details"
          style={{
            textAlign: "center",
            padding: "80px 20px",
          }}
        >
          <h2>
            Course Not Found
          </h2>

          <p>
            The selected course could
            not be found.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/browse")
            }
          >
            Browse Courses
          </button>

        </div>

      </div>
    );
  }

  // ==================================================
  // COURSE VALUES
  // ==================================================

  const courseId =
    getCourseId(selectedCourse);

  const courseTitle =
    selectedCourse.title ||
    selectedCourse.courseName ||
    selectedCourse.name ||
    "Untitled Course";

  const category =
    selectedCourse.category ||
    "General";

  const description =
    selectedCourse.description ||
    "";

  const instructor =
    selectedCourse.instructor ||
    selectedCourse.faculty ||
    selectedCourse.facultyName ||
    "Faculty";

  const level =
    selectedCourse.level ||
    "Beginner";

  const rating =
    Number(
      selectedCourse.rating || 0
    );

  const students =
    Number(
      selectedCourse.students || 0
    );

  const duration =
    selectedCourse.duration ||
    "Self paced";

  const courseType =
    getCourseType(
      selectedCourse
    );

  const price =
    getCoursePrice(
      selectedCourse
    );

  const image =
    selectedCourse.image ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

  // ==================================================
  // DYNAMIC ABOUT COURSE CONTENT
  // ==================================================

  const lessonDescriptions =
    lessons
      .map((lesson) =>
        String(
          lesson.description || ""
        ).trim()
      )
      .filter(
        (lessonDescription) =>
          lessonDescription !== ""
      );

  const dynamicAboutText =
    description.trim() ||
    (lessons.length > 0
      ? `This course contains ${lessons.length} structured lesson${
          lessons.length === 1
            ? ""
            : "s"
        } designed to help you learn ${courseTitle} step by step.`
      : `This course provides structured learning content and practical lessons to help you build your skills step by step.`);

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="course-details-page">

      {/* ==========================================
          BACK
      ========================================== */}

      <button
        type="button"
        className="back-course-button"
        onClick={() =>
          navigate("/browse")
        }
      >
        <ArrowLeft size={16} />
        Back to Courses
      </button>

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="course-details-hero">

        <div className="course-details-image">

          <img
            src={image}
            alt={courseTitle}
          />

          <span className="details-level">
            {level}
          </span>

        </div>

        <div className="course-details-info">

          <span className="details-category">
            {category}
          </span>

          <h1>
            {courseTitle}
          </h1>

          <p className="details-description">
            {description ||
              dynamicAboutText}
          </p>

          {rating > 0 && (
            <div className="details-rating">

              <Star
                size={16}
                fill="currentColor"
              />

              <strong>
                {rating}
              </strong>

              <span>
                (
                {students.toLocaleString()}
                {" "}students)
              </span>

            </div>
          )}

          <p className="details-instructor">
            Created by{" "}
            <strong>
              {instructor}
            </strong>
          </p>

          <div className="details-meta">

            <div>
              <Clock size={15} />

              <span>
                {duration}
              </span>
            </div>

            <div>
              <BookOpen size={15} />

              <span>
                {lessons.length} Lessons
              </span>
            </div>

            <div>
              <Users size={15} />

              <span>
                {students.toLocaleString()}
                {" "}Students
              </span>
            </div>

          </div>

          <button
            type="button"
            className="enroll-course-button"
            onClick={handleEnroll}
            disabled={isEnrollmentLoading}
          >
            {isEnrollmentLoading
              ? "Please wait..."
              : isEnrolled
              ? "Continue Learning"
              : courseType === "paid"
              ? `Enroll Now • ₹${price.toLocaleString(
                  "en-IN"
                )}`
              : "Enroll Now"}
          </button>

        </div>

      </section>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <div className="course-details-content">

        {/* ========================================
            LEFT
        ======================================== */}

        <div className="course-details-main">

          {/* ABOUT */}

          <section className="details-section">

            <h2>
              About This Course
            </h2>

            <p>
              {dynamicAboutText}
            </p>

            {lessonDescriptions.length > 0 && (
              <>
                {lessonDescriptions.map(
                  (lessonDescription, index) => (
                    <p
                      key={`description-${index}`}
                    >
                      {lessonDescription}
                    </p>
                  )
                )}
              </>
            )}

          </section>

          {/* WHAT YOU WILL LEARN */}

          <section className="details-section">

            <h2>
              What You'll Learn
            </h2>

            {lessons.length > 0 ? (

              <div className="learning-list">

                {lessons.map(
                  (lesson) => (
                    <div
                      className="learning-item"
                      key={
                        lesson.id ||
                        lesson._id
                      }
                    >
                      <CheckCircle size={16} />

                      <span>
                        {lesson.title}
                      </span>
                    </div>
                  )
                )}

              </div>

            ) : (

              <p>
                Course learning objectives
                will be available when the
                faculty adds lessons.
              </p>

            )}

          </section>

          {/* COURSE CONTENT */}

          <section className="details-section">

            <div className="course-content-heading">

              <div>

                <h2>
                  Course Content
                </h2>

                <p>
                  {lessons.length} lessons •{" "}
                  {duration}
                </p>

              </div>

              <PlayCircle size={21} />

            </div>

            {lessons.length > 0 ? (

              <div className="lessons-list">

                {lessons.map(
                  (lesson, index) => (
                    <div
                      className="lesson-item"
                      key={
                        lesson.id ||
                        lesson._id
                      }
                    >

                      <div className="lesson-number">
                        {index + 1}
                      </div>

                      <div className="lesson-info">

                        <strong>
                          {lesson.title}
                        </strong>

                        <span>
                          Lesson{" "}
                          {index + 1}

                          {lesson.duration
                            ? ` • ${lesson.duration}`
                            : ""}
                        </span>

                      </div>

                      {lesson.videoUrl ? (
                        <PlayCircle size={16} />
                      ) : (
                        <BookOpen size={16} />
                      )}

                    </div>
                  )
                )}

              </div>

            ) : (

              <div className="lessons-list">

                <div className="lesson-item">

                  <div className="lesson-info">

                    <strong>
                      No lessons available
                    </strong>

                    <span>
                      Faculty has not added
                      lessons yet.
                    </span>

                  </div>

                </div>

              </div>

            )}

          </section>

        </div>

        {/* ========================================
            RIGHT SIDEBAR
        ======================================== */}

        <aside className="course-details-sidebar">

          <div className="enroll-card">

            <div className="enroll-card-icon">
              <Award size={22} />
            </div>

            <h3>
              {isEnrolled
                ? "Continue Learning"
                : "Start Learning Today"}
            </h3>

            <p>
              {isEnrolled
                ? "You are already enrolled in this course. Continue your learning journey."
                : courseType === "paid"
                ? `Enroll in this paid course for ₹${price.toLocaleString(
                    "en-IN"
                  )} and start improving your skills.`
                : "Enroll in this free course and start improving your skills."}
            </p>

            <button
              type="button"
              className="sidebar-enroll-button"
              onClick={handleEnroll}
              disabled={isEnrollmentLoading}
            >
              {isEnrollmentLoading
                ? "Please wait..."
                : isEnrolled
                ? "Continue Learning"
                : courseType === "paid"
                ? `Enroll Now • ₹${price.toLocaleString(
                    "en-IN"
                  )}`
                : "Enroll Now"}
            </button>

            <div className="enroll-benefits">

              <div>
                <CheckCircle size={14} />

                <span>
                  Full course access
                </span>
              </div>

              <div>
                <CheckCircle size={14} />

                <span>
                  Track your progress
                </span>
              </div>

              <div>
                <CheckCircle size={14} />

                <span>
                  Certificate on completion
                </span>
              </div>

              <div>
                <CheckCircle size={14} />

                <span>
                  Learn at your own pace
                </span>
              </div>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
};

export default CourseDetails;
