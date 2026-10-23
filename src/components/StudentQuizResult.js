import React, { useEffect, useState } from "react";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileQuestion,
  Trophy,
  RotateCcw,
  CircleHelp,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "../css/StudentQuizResult.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const StudentQuizResult = () => {
  const params = useParams();
  const navigate = useNavigate();

  /*
    Supports both:
    /student-quiz-result/:attemptId
    /student-quiz-result/:id
  */
  const attemptId =
    params.attemptId ||
    params.id ||
    "";

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);

        if (!attemptId) {
          throw new Error("Quiz attempt ID is missing.");
        }

        /*
          First try to get the result from sessionStorage.
          StudentQuizAttempt.js stores the submitted result here.
        */
        const storedResult =
          sessionStorage.getItem("studentQuizResult");

        if (storedResult) {
          try {
            const parsedResult = JSON.parse(storedResult);

            if (
              parsedResult &&
              String(parsedResult.attemptId) ===
                String(attemptId)
            ) {
              setResult(parsedResult);
              setLoading(false);
              return;
            }
          } catch (storageError) {
            console.error(
              "Unable to parse stored quiz result:",
              storageError
            );
          }
        }

        /*
          If result is not available in sessionStorage,
          fetch it from backend.
        */
        const studentSession =
          sessionStorage.getItem("studentSession");

        let token = "";
        let studentId = "";

        if (studentSession) {
          try {
            const student = JSON.parse(studentSession);

            token = student?.token || "";

            studentId =
              student?._id ||
              student?.id ||
              student?.userId ||
              "";
          } catch (error) {
            console.error(
              "Unable to parse student session:",
              error
            );
          }
        }

        if (!token) {
          token =
            localStorage.getItem("studentToken") ||
            localStorage.getItem("token") ||
            "";
        }

        const response = await fetch(
          `${API_BASE_URL}/quizzes/student/attempt/${attemptId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load quiz result."
          );
        }

        const attemptData =
          data?.data || data;

        if (!attemptData) {
          throw new Error(
            "Quiz result data was not found."
          );
        }

        setResult(attemptData);

        /*
          Keep result in sessionStorage so that
          page refresh/navigation can reuse it.
        */
        sessionStorage.setItem(
          "studentQuizResult",
          JSON.stringify(attemptData)
        );

        /*
          Notify other pages that quiz progress changed.
        */
        window.dispatchEvent(
          new Event("studentQuizProgressUpdated")
        );
      } catch (error) {
        console.error(
          "Unable to load quiz result:",
          error
        );

        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId]);

  /*
    Loading state
  */
  if (loading) {
    return (
      <div className="student-quiz-result-page">
        <div className="student-quiz-result-loading">
          <CircleHelp size={20} />
          Loading quiz result...
        </div>
      </div>
    );
  }

  /*
    No result state
  */
  if (!result) {
    return (
      <div className="student-quiz-result-page">
        <div className="student-no-result">
          <FileQuestion size={45} />

          <h2>Quiz Result Not Found</h2>

          <p>
            We could not find the result for this quiz
            attempt.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/student-quizzes")
            }
          >
            <ArrowLeft size={16} />
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const percentage = Number(
    result.percentage || 0
  );

  const passingScore = Number(
    result.passingScore || 0
  );

  const totalQuestions = Number(
    result.totalQuestions || 0
  );

  const correctAnswers = Number(
    result.correctAnswers || 0
  );

  const wrongAnswers = Number(
    result.wrongAnswers || 0
  );

  const unanswered = Number(
    result.unanswered || 0
  );

  const isPassed =
    result.result === "passed" ||
    percentage >= passingScore;

  const answers = Array.isArray(result.answers)
    ? result.answers
    : [];

  const quizId =
    result.quizId ||
    result.quiz?._id ||
    result.quiz?.id ||
    "";

  const courseId =
    result.courseId ||
    result.course?._id ||
    result.course?.id ||
    "";

  const quizTitle =
    result.quizTitle ||
    result.quiz?.title ||
    "Quiz Result";

  const quizDescription =
    result.description ||
    result.quiz?.description ||
    "";

  const handleBackToQuizzes = () => {
    navigate("/student-quizzes");
  };

  const handleBackToCourse = () => {
  navigate("/course-learning");
};

  const handleRetake = () => {
    if (quizId) {
      navigate(`/student-quiz/${quizId}`);
      return;
    }

    navigate("/student-quizzes");
  };

  return (
    <div className="student-quiz-result-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="student-quiz-result-header">

        <button
          type="button"
          className="student-result-back-btn"
          onClick={handleBackToQuizzes}
        >
          <ArrowLeft size={16} />
          Back to Quizzes
        </button>

        <p>QUIZ RESULT</p>

        <h1>Quiz Result</h1>

      </div>


      {/* ==================================================
          HERO
      ================================================== */}

      <div
        className={`student-result-hero ${
          isPassed ? "passed" : "failed"
        }`}
      >

        <div className="student-result-icon">

          {isPassed ? (
            <Trophy size={32} />
          ) : (
            <XCircle size={32} />
          )}

        </div>

        <h2>
          {isPassed
            ? "Congratulations!"
            : "Quiz Not Passed"}
        </h2>

        <p>
          {isPassed
            ? "You have successfully passed this quiz."
            : "You did not achieve the required passing score."}
        </p>

        <div className="student-result-percentage">
          {percentage}%
        </div>

        <p>
          Passing Score: {passingScore}%
        </p>

      </div>


      {/* ==================================================
          STATS
      ================================================== */}

      <div className="student-result-stats">

        {/* Total Questions */}

        <div className="student-result-stat-card">

          <div className="student-result-stat-icon">
            <FileQuestion size={19} />
          </div>

          <span>Total Questions</span>

          <strong>
            {totalQuestions}
          </strong>

        </div>


        {/* Correct Answers */}

        <div className="student-result-stat-card">

          <div className="student-result-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <span>Correct Answers</span>

          <strong>
            {correctAnswers}
          </strong>

        </div>


        {/* Wrong Answers */}

        <div className="student-result-stat-card">

          <div className="student-result-stat-icon">
            <XCircle size={19} />
          </div>

          <span>Wrong Answers</span>

          <strong>
            {wrongAnswers}
          </strong>

        </div>


        {/* Unanswered */}

        <div className="student-result-stat-card">

          <div className="student-result-stat-icon">
            <CircleHelp size={19} />
          </div>

          <span>Unanswered</span>

          <strong>
            {unanswered}
          </strong>

        </div>

      </div>


      {/* ==================================================
          ANSWER REVIEW
      ================================================== */}

      <div className="student-answer-review">

        <div className="student-answer-review-heading">

          <p>REVIEW</p>

          <h2>Answer Review</h2>

        </div>


        <div className="student-answer-list">

          {answers.length > 0 ? (
            answers.map((answer, index) => {

              const isCorrect =
                answer?.isCorrect === true;

              const selectedAnswer =
                answer?.selectedAnswer || "";

              const correctAnswer =
                answer?.correctAnswer || "";

              return (
                <div
                  key={
                    answer?.questionId ||
                    `answer-${index}`
                  }
                  className={`student-answer-review-item ${
                    isCorrect
                      ? "correct"
                      : "wrong"
                  }`}
                >

                  {/* Question Number */}

                  <div className="student-answer-review-number">
                    {index + 1}
                  </div>


                  {/* Answer Content */}

                  <div className="student-answer-review-content">

                    <strong>
                      Question {index + 1}
                    </strong>

                    <div className="student-answer-values">

                      <span>
                        Your Answer:
                        {" "}
                        <b>
                          {selectedAnswer || "Not Answered"}
                        </b>
                      </span>

                      {!isCorrect &&
                        correctAnswer && (
                          <span>
                            Correct Answer:
                            {" "}
                            <b>
                              {correctAnswer}
                            </b>
                          </span>
                        )}

                    </div>

                  </div>


                  {/* Status */}

                  <div className="student-answer-status">

                    {isCorrect ? (
                      <CheckCircle2 size={21} />
                    ) : (
                      <XCircle size={21} />
                    )}

                  </div>

                </div>
              );
            })
          ) : (
            <div className="student-answer-review-item">

              <div className="student-answer-review-number">
                -
              </div>

              <div className="student-answer-review-content">
                <strong>
                  No answer details available.
                </strong>
              </div>

            </div>
          )}

        </div>

      </div>


      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div className="student-result-actions">

        <button
          type="button"
          className="student-result-retake-btn"
          onClick={handleRetake}
        >
          <RotateCcw size={16} />
          Retake Quiz
        </button>

        <button
          type="button"
          className="student-result-course-btn"
          onClick={handleBackToCourse}
        >
          <ArrowLeft size={16} />
          Back to Course
        </button>

      </div>

    </div>
  );
};

export default StudentQuizResult;