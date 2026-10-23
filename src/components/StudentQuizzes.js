import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  Clock3,
  FileQuestion,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import "../css/StudentQuizzes.css";

const API_BASE_URL =
  "https://project-final-backend-oeh1.onrender.com";

const StudentQuizzes = () => {
  const navigate = useNavigate();

  const [course, setCourse] =
    useState(null);

  const [quizzes, setQuizzes] =
    useState([]);

  const [attempts, setAttempts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  // ==================================================
  // Get Student
  // ==================================================
  const getLoggedInStudent = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem(
          "studentSession"
        ) || "null"
      );
    } catch (error) {
      console.error(
        "Unable to read student session:",
        error
      );

      return null;
    }
  };

  // ==================================================
  // Get JWT Token
  // ==================================================
  const getToken = () => {
    const studentSession =
      getLoggedInStudent();

    // First preference:
    // Token stored inside studentSession
    if (studentSession?.token) {
      return studentSession.token;
    }

    // Fallback:
    // Student-specific token stored in localStorage
    const studentToken =
      localStorage.getItem(
        "studentToken"
      );

    if (studentToken) {
      return studentToken;
    }

    return null;
  };

  // ==================================================
  // Get Auth Headers
  // ==================================================
  const getAuthHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ==================================================
  // Handle Unauthorized / Expired JWT
  // ==================================================
  const handleUnauthorized = () => {
    sessionStorage.removeItem(
      "studentSession"
    );

    localStorage.removeItem(
      "studentToken"
    );

    sessionStorage.removeItem(
      "selectedStudentQuiz"
    );

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login");
  };

  // ==================================================
  // Authenticated GET Request
  // ==================================================
  const fetchJSON = async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    let result = {};

    try {
      result = await response.json();
    } catch (error) {
      result = {};
    }

    // JWT invalid / expired
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleUnauthorized();

      throw new Error(
        result?.message ||
          "Session expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch data."
      );
    }

    return result;
  };

  // ==================================================
  // Get Student ID
  // ==================================================
  const getStudentId = (student) => {
    if (!student) {
      return null;
    }

    return (
      student.id ||
      student.userId ||
      student._id ||
      null
    );
  };

  // ==================================================
  // Get Course ID
  // IMPORTANT:
  // courseId first so enrollment _id is not used
  // ==================================================
  const getCourseId = (courseData) => {
    if (!courseData) {
      return null;
    }

    return (
      courseData.courseId ||
      courseData.course_id ||
      courseData.course?._id ||
      courseData.course?.id ||
      courseData.id ||
      courseData._id ||
      null
    );
  };

  // ==================================================
  // Get Latest Attempt For Quiz
  // ==================================================
  const getLatestAttempt = (quizId) => {
    if (
      !quizId ||
      !Array.isArray(attempts)
    ) {
      return null;
    }

    const quizAttempts =
      attempts.filter(
        (attempt) =>
          String(
            attempt.quizId
          ) ===
          String(quizId)
      );

    if (quizAttempts.length === 0) {
      return null;
    }

    return quizAttempts[0];
  };

  // ==================================================
  // Load Course + Quizzes + Attempts
  // ==================================================
  const loadQuizzes = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const student =
        getLoggedInStudent();

      // ----------------------------------------------
      // Check Student Session
      // ----------------------------------------------
      if (!student) {
        navigate("/login");
        return;
      }

      // ----------------------------------------------
      // Check JWT Token
      // ----------------------------------------------
      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const studentId =
        getStudentId(student);

      if (!studentId) {
        throw new Error(
          "Unable to identify the logged-in student."
        );
      }

      // ----------------------------------------------
      // Get Selected Course
      // ----------------------------------------------
      const savedCourse =
        sessionStorage.getItem(
          "selectedLearningCourse"
        );

      if (!savedCourse) {
        navigate("/courses");
        return;
      }

      let selectedCourse;

      try {
        selectedCourse =
          JSON.parse(savedCourse);
      } catch (error) {
        sessionStorage.removeItem(
          "selectedLearningCourse"
        );

        navigate("/courses");
        return;
      }

      // ----------------------------------------------
      // Get Actual Course ID
      // ----------------------------------------------
      const courseId =
        getCourseId(selectedCourse);

      console.log(
        "Selected Learning Course:",
        selectedCourse
      );

      console.log(
        "Actual Course ID:",
        courseId
      );

      if (!courseId) {
        throw new Error(
          "Unable to identify this course."
        );
      }

      // ----------------------------------------------
      // Verify Enrollment
      // ----------------------------------------------
      const enrollmentUrl =
        `${API_BASE_URL}/api/get-enrollment/` +
        `${studentId}/${courseId}`;

      console.log(
        "Enrollment URL:",
        enrollmentUrl
      );

      const enrollmentResult =
        await fetchJSON(
          enrollmentUrl
        );

      if (
        !enrollmentResult.success ||
        !enrollmentResult.data
      ) {
        throw new Error(
          "You are not enrolled in this course."
        );
      }

      // ----------------------------------------------
      // Get Latest Course
      // ----------------------------------------------
      let finalCourse =
        selectedCourse;

      try {
        const courseResult =
          await fetchJSON(
            `${API_BASE_URL}/api/get-courses`
          );

        if (
          courseResult.success
        ) {
          const courses =
            Array.isArray(
              courseResult.data
            )
              ? courseResult.data
              : [];

          const actualCourse =
            courses.find(
              (item) => {
                const actualId =
                  item.courseId ||
                  item.course_id ||
                  item.id ||
                  item._id;

                return (
                  String(actualId) ===
                  String(courseId)
                );
              }
            );

          if (actualCourse) {
            finalCourse =
              actualCourse;
          }
        }
      } catch (error) {
        console.error(
          "Unable to load latest course:",
          error
        );
      }

      // ----------------------------------------------
      // Set Course
      // ----------------------------------------------
      setCourse({
        ...finalCourse,

        id: courseId,

        courseId,

        title:
          finalCourse.title ||
          finalCourse.courseName ||
          finalCourse.name ||
          "Course",

        instructor:
          finalCourse.instructor ||
          finalCourse.faculty ||
          finalCourse.facultyName ||
          "Faculty",
      });

      // ----------------------------------------------
      // Get Published Quizzes
      // ----------------------------------------------
      const quizResult =
        await fetchJSON(
          `${API_BASE_URL}/quizzes/student/course/${courseId}`
        );

      const quizData =
        Array.isArray(
          quizResult.data
        )
          ? quizResult.data
          : [];

      setQuizzes(quizData);

      // ----------------------------------------------
      // Get Student Quiz Attempts
      // ----------------------------------------------
      try {
        const attemptsResult =
          await fetchJSON(
            `${API_BASE_URL}/quizzes/student/attempts/` +
            `${studentId}/course/${courseId}`
          );

        if (
          attemptsResult.success
        ) {
          setAttempts(
            Array.isArray(
              attemptsResult.data
            )
              ? attemptsResult.data
              : []
          );
        } else {
          setAttempts([]);
        }
      } catch (error) {
        console.error(
          "Unable to load quiz attempts:",
          error
        );

        setAttempts([]);
      }
    } catch (error) {
      console.error(
        "Unable to load student quizzes:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load quizzes."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // Load On Page Open
  // ==================================================
  useEffect(() => {
    loadQuizzes();
  }, [navigate]);

  // ==================================================
  // Start / Retake Quiz
  // ==================================================
  const handleStartQuiz = (
    quiz
  ) => {
    try {
      sessionStorage.setItem(
        "selectedStudentQuiz",
        JSON.stringify(quiz)
      );
    } catch (error) {
      console.error(
        "Unable to save selected quiz:",
        error
      );
    }

    const quizId =
      quiz?._id ||
      quiz?.id ||
      quiz?.quizId;

    navigate(
      `/student-quiz/${quizId}`
    );
  };

  // ==================================================
  // Back
  // ==================================================
  const handleBack = () => {
    navigate(
      "/course-learning"
    );
  };

  // ==================================================
  // Loading
  // ==================================================
  if (loading) {
    return (
      <div className="student-quizzes-loading">
        <BookOpen size={28} />

        <span>
          Loading quizzes...
        </span>
      </div>
    );
  }

  // ==================================================
  // Error
  // ==================================================
  if (errorMessage) {
    return (
      <div className="student-quizzes-page">
        <div className="student-quiz-error-card">
          <AlertCircle size={32} />

          <h2>
            Unable to Load Quizzes
          </h2>

          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleBack}
          >
            <ArrowLeft size={17} />
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-quizzes-page">

      {/* Header */}
      <div className="student-quizzes-header">

        <button
          type="button"
          className="student-quizzes-back-btn"
          onClick={handleBack}
        >
          <ArrowLeft size={17} />
          Back to Course
        </button>

        <div className="student-quizzes-heading">

          <p>
            COURSE QUIZZES
          </p>

          <h1>
            {course?.title ||
              "Quizzes"}
          </h1>

          <span>
            Test your knowledge and
            track your learning progress.
          </span>

        </div>

      </div>

      {/* Quiz Summary */}
      <div className="student-quiz-summary">

        <div className="student-quiz-summary-card">

          <div className="student-quiz-summary-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <span>
              Course
            </span>

            <strong>
              {course?.title ||
                "Course"}
            </strong>
          </div>

        </div>

        <div className="student-quiz-summary-card">

          <div className="student-quiz-summary-icon">
            <FileQuestion size={22} />
          </div>

          <div>
            <span>
              Available Quizzes
            </span>

            <strong>
              {quizzes.length}
            </strong>
          </div>

        </div>

      </div>

      {/* Quiz Section */}
      <div className="student-quizzes-section">

        <div className="student-quizzes-section-heading">

          <div>
            <p>
              TEST YOUR KNOWLEDGE
            </p>

            <h2>
              Available Quizzes
            </h2>
          </div>

          <span>
            {quizzes.length}{" "}
            {quizzes.length === 1
              ? "quiz"
              : "quizzes"}
          </span>

        </div>

        {quizzes.length > 0 ? (
          <div className="student-quiz-grid">

            {quizzes.map(
              (quiz) => {
                const quizId =
                  quiz._id ||
                  quiz.id ||
                  quiz.quizId;

                const latestAttempt =
                  getLatestAttempt(
                    quizId
                  );

                const isAttempted =
                  Boolean(
                    latestAttempt
                  );

                const isPassed =
                  latestAttempt?.result ===
                  "passed";

                const isFailed =
                  latestAttempt?.result ===
                  "failed";

                return (
                  <div
                    className="student-quiz-card"
                    key={quizId}
                  >

                    <div className="student-quiz-card-top">

                      <div className="student-quiz-card-icon">
                        <FileQuestion
                          size={24}
                        />
                      </div>

                      <span className="student-quiz-published">
                        <CheckCircle2
                          size={14}
                        />
                        Published
                      </span>

                    </div>

                    <div className="student-quiz-card-content">

                      <h3>
                        {quiz.title}
                      </h3>

                      <p>
                        {quiz.description ||
                          "Test your understanding of this course."}
                      </p>

                      <div className="student-quiz-info">

                        <span>
                          <FileQuestion
                            size={15}
                          />

                          {quiz.questions?.length ||
                            0}{" "}
                          Questions
                        </span>

                        <span>
                          <Clock3
                            size={15}
                          />

                          {quiz.duration}{" "}
                          Minutes
                        </span>

                      </div>

                      <div className="student-quiz-pass">

                        <span>
                          Passing Score
                        </span>

                        <strong>
                          {quiz.passingScore}%
                        </strong>

                      </div>

                      {/* =================================
                          QUIZ ATTEMPT STATUS
                          ================================= */}
                      {isAttempted ? (
                        <div
                          className="student-quiz-attempt-status"
                          style={{
                            marginTop:
                              "14px",

                            padding:
                              "12px 14px",

                            border:
                              "1px solid #e9e9f2",

                            borderRadius:
                              "12px",

                            background:
                              "#fafafe",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "space-between",

                              gap: "10px",
                            }}
                          >

                            <span
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap: "6px",

                                fontSize:
                                  "13px",

                                fontWeight:
                                  "600",
                              }}
                            >

                              {isPassed ? (
                                <CheckCircle2
                                  size={16}
                                  style={{
                                    color:
                                      "#16a34a",
                                  }}
                                />
                              ) : (
                                <XCircle
                                  size={16}
                                  style={{
                                    color:
                                      "#dc2626",
                                  }}
                                />
                              )}

                              {isPassed
                                ? "Passed"
                                : isFailed
                                ? "Failed"
                                : "Attempted"}

                            </span>

                            <strong
                              style={{
                                fontSize:
                                  "14px",
                              }}
                            >
                              {latestAttempt.percentage ??
                                0}
                              %
                            </strong>

                          </div>

                          <div
                            style={{
                              marginTop:
                                "6px",

                              display:
                                "flex",

                              justifyContent:
                                "space-between",

                              alignItems:
                                "center",

                              fontSize:
                                "12px",

                              color:
                                "#777",
                            }}
                          >

                            <span>
                              Last Score
                            </span>

                            <span>
                              {latestAttempt.correctAnswers ??
                                0}{" "}
                              /{" "}
                              {latestAttempt.totalQuestions ??
                                0}
                            </span>

                          </div>

                        </div>
                      ) : (
                        <div
                          className="student-quiz-not-attempted"
                          style={{
                            marginTop:
                              "14px",

                            padding:
                              "10px 14px",

                            borderRadius:
                              "12px",

                            background:
                              "#f8f9fc",

                            border:
                              "1px solid #ececf3",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap: "8px",

                            fontSize:
                              "13px",

                            fontWeight:
                              "600",

                            color:
                              "#777",
                          }}
                        >

                          <Clock3
                            size={16}
                          />

                          Not Attempted

                        </div>
                      )}

                      {/* =================================
                          START / RETAKE BUTTON
                          ================================= */}
                      <button
                        type="button"
                        className="student-start-quiz-btn"
                        onClick={() =>
                          handleStartQuiz(
                            quiz
                          )
                        }
                      >

                        {isAttempted ? (
                          <>
                            <RotateCcw
                              size={18}
                            />

                            Retake Quiz
                          </>
                        ) : (
                          <>
                            <PlayCircle
                              size={18}
                            />

                            Start Quiz
                          </>
                        )}

                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        ) : (
          <div className="student-no-quizzes">

            <div className="student-no-quizzes-icon">
              <FileQuestion
                size={32}
              />
            </div>

            <h3>
              No Quizzes Available
            </h3>

            <p>
              Faculty has not published
              any quiz for this course yet.
            </p>

          </div>
        )}

      </div>

    </div>
  );
};

export default StudentQuizzes;