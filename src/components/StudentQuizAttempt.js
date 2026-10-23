import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileQuestion,
  AlertCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "../css/StudentQuizAttempt.css";

const API_BASE_URL =
  "https://project-final-backend-oeh1.onrender.com";

const StudentQuizAttempt = () => {
  const navigate = useNavigate();

  const { id: quizId } = useParams();

  const [quiz, setQuiz] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [submitting, setSubmitting] =
    useState(false);

  const [startedAt, setStartedAt] =
    useState(null);

  // ==================================================
  // Student
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

  const getStudentId = (student) => {
    if (!student) {
      return null;
    }

    return (
      student._id ||
      student.id ||
      student.userId ||
      null
    );
  };

  const getStudentEmail = (student) => {
    if (!student) {
      return "";
    }

    return (
      student.email ||
      student.emailAddress ||
      ""
    );
  };

  // ==================================================
  // JWT
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
    // Student-specific token
    const studentToken =
      localStorage.getItem(
        "studentToken"
      );

    if (studentToken) {
      return studentToken;
    }

    return null;
  };

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type":
        "application/json",
    };
  };

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
      new Event(
        "userLoginChanged"
      )
    );

    navigate("/login");
  };

  // ==================================================
  // Load Quiz
  // ==================================================

  const loadQuiz = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const student =
        getLoggedInStudent();

      if (!student) {
        navigate("/login");
        return;
      }

      const studentId =
        getStudentId(student);

      if (!studentId) {
        throw new Error(
          "Unable to identify the logged-in student."
        );
      }

      if (!quizId) {
        throw new Error(
          "Quiz ID is missing."
        );
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      // ----------------------------------------------
      // Get Published Quiz
      // ----------------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/quizzes/student/${quizId}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
          }
        );

      let result = {};

      try {
        result =
          await response.json();
      } catch (error) {
        result = {};
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load quiz."
        );
      }

      const quizData =
        result.data;

      if (
        !quizData ||
        !Array.isArray(
          quizData.questions
        )
      ) {
        throw new Error(
          "Invalid quiz data."
        );
      }

      if (
        quizData.questions.length ===
        0
      ) {
        throw new Error(
          "This quiz does not contain any questions."
        );
      }

      // ----------------------------------------------
      // Verify Enrollment
      // ----------------------------------------------

      const enrollmentResponse =
        await fetch(
          `${API_BASE_URL}/api/get-enrollment/${studentId}/${quizData.courseId}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
          }
        );

      let enrollmentResult =
        {};

      try {
        enrollmentResult =
          await enrollmentResponse.json();
      } catch (error) {
        enrollmentResult = {};
      }

      if (
        enrollmentResponse.status ===
          401 ||
        enrollmentResponse.status ===
          403
      ) {
        handleUnauthorized();

        return;
      }

      if (
        !enrollmentResponse.ok
      ) {
        throw new Error(
          enrollmentResult.message ||
            "Unable to verify course enrollment."
        );
      }

      if (
        !enrollmentResult.success ||
        !enrollmentResult.data
      ) {
        throw new Error(
          "You are not enrolled in this course."
        );
      }

      // ----------------------------------------------
      // Set Quiz
      // ----------------------------------------------

      setQuiz(
        quizData
      );

      const startTime =
        new Date();

      setStartedAt(
        startTime.toISOString()
      );

      setTimeLeft(
        Math.max(
          1,
          Number(
            quizData.duration || 1
          ) * 60
        )
      );
    } catch (error) {
      console.error(
        "Unable to load quiz:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // ==================================================
  // Timer
  // ==================================================

  useEffect(() => {
    if (
      loading ||
      !quiz ||
      submitting ||
      timeLeft <= 0
    ) {
      return;
    }

    const timer =
      setInterval(() => {
        setTimeLeft(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );
      }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    loading,
    quiz,
    submitting,
    timeLeft,
  ]);

  // ==================================================
  // Auto Submit
  // ==================================================

  useEffect(() => {
    if (
      quiz &&
      !loading &&
      !submitting &&
      timeLeft === 0
    ) {
      handleSubmitQuiz(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeLeft,
    quiz,
    loading,
    submitting,
  ]);

  // ==================================================
  // Format Time
  // ==================================================

  const formatTime = (seconds) => {
    const minutes =
      Math.floor(
        seconds / 60
      );

    const remainingSeconds =
      seconds % 60;

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(
      2,
      "0"
    )}`;
  };

  // ==================================================
  // Select Answer
  // ==================================================

  const handleAnswerSelect = (
    questionId,
    option
  ) => {
    if (submitting) {
      return;
    }

    setAnswers(
      (previous) => ({
        ...previous,

        [String(
          questionId
        )]:
          option,
      })
    );
  };

  // ==================================================
  // Previous
  // ==================================================

  const handlePrevious = () => {
    if (submitting) {
      return;
    }

    if (
      currentQuestion > 0
    ) {
      setCurrentQuestion(
        (previous) =>
          previous - 1
      );
    }
  };

  // ==================================================
  // Next
  // ==================================================

  const handleNext = () => {
    if (submitting) {
      return;
    }

    if (
      quiz &&
      currentQuestion <
        quiz.questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      );
    }
  };

  // ==================================================
  // Submit Quiz
  // ==================================================

  const handleSubmitQuiz = async (
    autoSubmit = false
  ) => {
    if (
      !quiz ||
      submitting
    ) {
      return;
    }

    const student =
      getLoggedInStudent();

    if (!student) {
      navigate("/login");
      return;
    }

    const studentId =
      getStudentId(student);

    const studentEmail =
      getStudentEmail(student);

    if (!studentId) {
      setErrorMessage(
        "Unable to identify the logged-in student."
      );

      return;
    }

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    // ----------------------------------------------
    // Prepare Answers
    // ----------------------------------------------

    const answerPayload =
      quiz.questions.map(
        (question) => ({
          questionId:
            String(
              question._id
            ),

          selectedAnswer:
            answers[
              String(
                question._id
              )
            ] || "",
        })
      );

    // ----------------------------------------------
    // Check Unanswered Questions
    // ----------------------------------------------

    if (!autoSubmit) {
      const unansweredCount =
        answerPayload.filter(
          (item) =>
            !item.selectedAnswer
        ).length;

      if (
        unansweredCount > 0
      ) {
        const shouldSubmit =
          window.confirm(
            `${unansweredCount} question${
              unansweredCount === 1
                ? ""
                : "s"
            } remain unanswered. Do you want to submit the quiz?`
          );

        if (!shouldSubmit) {
          return;
        }
      }
    }

    try {
      setSubmitting(true);

      // ----------------------------------------------
      // Submit To Backend
      // ----------------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/quizzes/student/submit`,
          {
            method: "POST",

            headers:
              getAuthHeaders(),

            body: JSON.stringify({
              studentId:
                String(
                  studentId
                ),

              studentEmail:
                studentEmail || "",

              quizId:
                String(
                  quizId
                ),

              answers:
                answerPayload,

              startedAt,
            }),
          }
        );

      let result = {};

      try {
        result =
          await response.json();
      } catch (error) {
        result = {};
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to submit quiz."
        );
      }

      if (
        !result.success ||
        !result.data
      ) {
        throw new Error(
          "Quiz submission failed."
        );
      }

      // ----------------------------------------------
      // Get Attempt ID
      // ----------------------------------------------

      const attemptId =
        result.data.attemptId;

      if (!attemptId) {
        throw new Error(
          "Quiz submitted, but attempt ID was not returned."
        );
      }

      // ----------------------------------------------
      // Save Result
      // ----------------------------------------------

      sessionStorage.setItem(
        "studentQuizResult",
        JSON.stringify(
          result.data
        )
      );

      window.dispatchEvent(
  new Event("studentQuizProgressUpdated")
);

      // ----------------------------------------------
      // Go To Result Page
      // IMPORTANT:
      // Result page uses ATTEMPT ID
      // ----------------------------------------------

      navigate(
        `/student-quiz-result/${attemptId}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Unable to submit quiz:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to submit quiz."
      );

      setSubmitting(false);
    }
  };

  // ==================================================
  // Loading
  // ==================================================

  if (loading) {
    return (
      <div className="student-quiz-attempt-loading">

        <FileQuestion
          size={28}
        />

        <span>
          Loading quiz...
        </span>

      </div>
    );
  }

  // ==================================================
  // Error
  // ==================================================

  if (errorMessage) {
    return (
      <div className="student-quiz-attempt-page">

        <div className="student-quiz-attempt-error">

          <AlertCircle
            size={32}
          />

          <h2>
            Unable to Open Quiz
          </h2>

          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student-quizzes"
              )
            }
          >
            <ArrowLeft
              size={17}
            />

            Back to Quizzes
          </button>

        </div>

      </div>
    );
  }

  // ==================================================
  // Empty Quiz Protection
  // ==================================================

  if (
    !quiz ||
    !quiz.questions?.length
  ) {
    return null;
  }

  // ==================================================
  // Current Question
  // ==================================================

  const question =
    quiz.questions[
      currentQuestion
    ];

  const questionId =
    String(
      question._id
    );

  const selectedAnswer =
    answers[
      questionId
    ] || "";

  const answeredCount =
    Object.values(
      answers
    ).filter(Boolean).length;

  const totalQuestions =
    quiz.questions.length;

  const progress =
    Math.round(
      ((currentQuestion + 1) /
        totalQuestions) *
        100
    );

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="student-quiz-attempt-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="student-quiz-attempt-header">

        <button
          type="button"
          className="student-quiz-exit-btn"
          onClick={() =>
            navigate(
              "/student-quizzes"
            )
          }
          disabled={
            submitting
          }
        >
          <ArrowLeft
            size={17}
          />

          Exit Quiz
        </button>

        <div className="student-quiz-attempt-title">

          <p>
            QUIZ
          </p>

          <h1>
            {quiz.title}
          </h1>

        </div>

        <div
          className={`student-quiz-timer ${
            timeLeft <= 60
              ? "danger"
              : ""
          }`}
        >
          <Clock3
            size={17}
          />

          {formatTime(
            timeLeft
          )}
        </div>

      </div>

      {/* ==================================================
          PROGRESS
      ================================================== */}

      <div className="student-quiz-question-progress">

        <div className="student-quiz-question-progress-top">

          <span>
            Question{" "}
            {currentQuestion + 1}{" "}
            of{" "}
            {totalQuestions}
          </span>

          <span>
            {answeredCount}/
            {totalQuestions} answered
          </span>

        </div>

        <div className="student-quiz-progress-track">

          <div
            className="student-quiz-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="student-quiz-attempt-layout">

        {/* ==================================================
            QUESTION
        ================================================== */}

        <main className="student-quiz-question-card">

          <div className="student-question-label">

            <FileQuestion
              size={17}
            />

            Question{" "}
            {currentQuestion + 1}

          </div>

          <h2>
            {question.question}
          </h2>

          {/* ==================================================
              OPTIONS
          ================================================== */}

          <div className="student-quiz-options">

            {[
              "A",
              "B",
              "C",
              "D",
            ].map(
              (option) => (
                <button
                  type="button"
                  key={option}
                  className={`student-quiz-option ${
                    selectedAnswer ===
                    option
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAnswerSelect(
                      questionId,
                      option
                    )
                  }
                  disabled={
                    submitting
                  }
                >

                  <span className="student-option-letter">
                    {option}
                  </span>

                  <span className="student-option-text">
                    {
                      question
                        .options?.[
                        option
                      ]
                    }
                  </span>

                  {selectedAnswer ===
                    option && (
                    <CheckCircle2
                      size={19}
                      className="student-option-check"
                    />
                  )}

                </button>
              )
            )}

          </div>

          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <div className="student-quiz-navigation">

            <button
              type="button"
              className="student-quiz-prev-btn"
              onClick={
                handlePrevious
              }
              disabled={
                currentQuestion ===
                  0 ||
                submitting
              }
            >
              <ArrowLeft
                size={17}
              />

              Previous
            </button>

            {currentQuestion <
            totalQuestions - 1 ? (
              <button
                type="button"
                className="student-quiz-next-btn"
                onClick={
                  handleNext
                }
                disabled={
                  submitting
                }
              >
                Next

                <ArrowRight
                  size={17}
                />
              </button>
            ) : (
              <button
                type="button"
                className="student-quiz-submit-btn"
                onClick={() =>
                  handleSubmitQuiz(
                    false
                  )
                }
                disabled={
                  submitting
                }
              >
                <CheckCircle2
                  size={17}
                />

                {submitting
                  ? "Submitting..."
                  : "Submit Quiz"}
              </button>
            )}

          </div>

        </main>

        {/* ==================================================
            QUESTION NAVIGATOR
        ================================================== */}

        <aside className="student-question-navigator">

          <div className="student-question-nav-heading">

            <h3>
              Questions
            </h3>

            <span>
              {answeredCount}/
              {totalQuestions}
            </span>

          </div>

          <div className="student-question-number-grid">

            {quiz.questions.map(
              (
                item,
                index
              ) => {
                const itemId =
                  String(
                    item._id
                  );

                const isAnswered =
                  Boolean(
                    answers[itemId]
                  );

                return (
                  <button
                    type="button"
                    key={itemId}
                    className={`student-question-number ${
                      index ===
                      currentQuestion
                        ? "active"
                        : ""
                    } ${
                      isAnswered
                        ? "answered"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentQuestion(
                        index
                      )
                    }
                    disabled={
                      submitting
                    }
                  >
                    {index + 1}
                  </button>
                );
              }
            )}

          </div>

          {/* ==================================================
              LEGEND
          ================================================== */}

          <div className="student-question-legend">

            <div>
              <span className="legend-current" />
              Current
            </div>

            <div>
              <span className="legend-answered" />
              Answered
            </div>

            <div>
              <span className="legend-pending" />
              Not Answered
            </div>

          </div>

        </aside>

      </div>

    </div>
  );
};

export default StudentQuizAttempt;

