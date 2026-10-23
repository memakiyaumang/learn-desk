  import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  Award,
  FileQuestion,
  Trophy,
  XCircle,
  RotateCcw,
} from "lucide-react";

import "../css/Progress.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const Progress = () => {
  const [progressData, setProgressData] = useState([]);
  const [quizProgressData, setQuizProgressData] = useState([]);
  const [selectedQuizCourseId, setSelectedQuizCourseId] =
    useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* =================================
      COMMON HELPERS
  ================================= */

  const getLoggedInStudent = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("studentSession") || "null"
      );
    } catch (error) {
      console.error(
        "Unable to read student session:",
        error
      );

      return null;
    }
  };

  const getToken = () => {
    try {
      const studentSession =
        getLoggedInStudent();

      if (studentSession?.token) {
        return studentSession.token;
      }

      const studentToken =
        localStorage.getItem("studentToken");

      if (studentToken) {
        return studentToken;
      }

      return null;
    } catch (error) {
      console.error(
        "Unable to get authentication token:",
        error
      );

      return null;
    }
  };

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleAuthenticationError = () => {
    sessionStorage.removeItem(
      "studentSession"
    );

    localStorage.removeItem("studentToken");

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login");
  };

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

  const getCourseId = (course) => {
    if (!course) {
      return null;
    }

    return (
      course.courseId ??
      course.course_id ??
      course.id ??
      course._id ??
      null
    );
  };

  const getQuizId = (quiz) => {
    if (!quiz) {
      return null;
    }

    return (
      quiz.quizId ??
      quiz.id ??
      quiz._id ??
      null
    );
  };

  /* =================================
      FETCH JSON HELPER
  ================================= */

  const fetchJSON = async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    let result = null;

    try {
      result = await response.json();
    } catch (error) {
      result = null;
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleAuthenticationError();

      throw new Error(
        "Authentication expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Unable to fetch data"
      );
    }

    return result;
  };

  /* =================================
      PARSE LESSON DURATION
  ================================= */

  const parseDurationToMinutes = (duration) => {
    if (!duration) {
      return 0;
    }

    const value = String(duration)
      .trim()
      .toLowerCase();

    if (!value) {
      return 0;
    }

    let totalMinutes = 0;

    /*
      Supports:
      1h
      1 hr
      1 hour
      1 hours
      30m
      30 min
      30 minutes
      1h 30m
      1 hour 30 minutes
    */

    const hourMatch = value.match(
      /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i
    );

    const minuteMatch = value.match(
      /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)\b/i
    );

    if (hourMatch) {
      totalMinutes +=
        Number(hourMatch[1]) * 60;
    }

    if (minuteMatch) {
      totalMinutes +=
        Number(minuteMatch[1]);
    }

    /*
      Supports HH:MM format.
      Example:
      01:30 = 90 minutes
    */

    if (
      !hourMatch &&
      !minuteMatch
    ) {
      const timeMatch = value.match(
        /^(\d+):(\d{1,2})$/
      );

      if (timeMatch) {
        const hours = Number(
          timeMatch[1]
        );

        const minutes = Number(
          timeMatch[2]
        );

        return (
          hours * 60 +
          minutes
        );
      }
    }

    /*
      If duration is only a number,
      consider it as minutes.
      Example:
      "45" = 45 minutes
    */

    if (
      !hourMatch &&
      !minuteMatch
    ) {
      const numericValue =
        Number(value);

      if (
        Number.isFinite(
          numericValue
        ) &&
        numericValue > 0
      ) {
        return numericValue;
      }
    }

    return totalMinutes;
  };

  /* =================================
      FORMAT LEARNING HOURS
  ================================= */

  const formatLearningHours = (
    totalMinutes
  ) => {
    const minutes = Math.max(
      0,
      Math.round(
        Number(totalMinutes) || 0
      )
    );

    const hours = Math.floor(
      minutes / 60
    );

    const remainingMinutes =
      minutes % 60;

    if (
      hours === 0 &&
      remainingMinutes === 0
    ) {
      return "0h";
    }

    if (hours === 0) {
      return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  /* =================================
      GET LATEST QUIZ ATTEMPT
  ================================= */

  const getLatestQuizAttempt = (
    attempts,
    quizId
  ) => {
    if (
      !Array.isArray(attempts) ||
      !quizId
    ) {
      return null;
    }

    const matchingAttempts =
      attempts.filter((attempt) => {
        const attemptQuizId =
          attempt.quizId ??
          attempt.quiz?._id ??
          attempt.quiz?.id ??
          null;

        return (
          attemptQuizId !== null &&
          String(attemptQuizId) ===
            String(quizId)
        );
      });

    if (
      matchingAttempts.length === 0
    ) {
      return null;
    }

    matchingAttempts.sort(
      (a, b) =>
        new Date(
          b.submittedAt ||
            b.createdAt ||
            0
        ) -
        new Date(
          a.submittedAt ||
            a.createdAt ||
            0
        )
    );

    return matchingAttempts[0];
  };

  /* =================================
      LOAD PROGRESS FROM MONGODB
  ================================= */

  const loadProgress = async () => {
    try {
      setLoading(true);

      const student =
        getLoggedInStudent();

      if (!student) {
        setProgressData([]);
        setQuizProgressData([]);
        setSelectedQuizCourseId(null);

        navigate("/login");

        return;
      }

      const token = getToken();

      if (!token) {
        setProgressData([]);
        setQuizProgressData([]);
        setSelectedQuizCourseId(null);

        handleAuthenticationError();

        return;
      }

      const studentId =
        getStudentId(student);

      const studentEmail =
        getStudentEmail(student);

      /*
        Keep student email available for
        future progress filtering if required.
      */
      void studentEmail;

      if (!studentId) {
        setProgressData([]);
        setQuizProgressData([]);
        setSelectedQuizCourseId(null);
        return;
      }

      /* =================================
          1. GET STUDENT ENROLLMENTS
      ================================= */

      const enrollmentResult =
        await fetchJSON(
          `${API_BASE_URL}/api/get-enrollments/${studentId}`
        );

      const myEnrollments =
        Array.isArray(
          enrollmentResult?.data
        )
          ? enrollmentResult.data
          : [];

      if (myEnrollments.length === 0) {
        setProgressData([]);
        setQuizProgressData([]);
        setSelectedQuizCourseId(null);
        return;
      }

      /* =================================
          2. GET ALL COURSES
      ================================= */

      const courseResult =
        await fetchJSON(
          `${API_BASE_URL}/api/get-courses`
        );

      const allCourses =
        Array.isArray(
          courseResult?.data
        )
          ? courseResult.data
          : [];

      /* =================================
          3. PROCESS EACH ENROLLMENT
      ================================= */

      const courseData =
        await Promise.all(
          myEnrollments.map(
            async (enrollment) => {
              const enrollmentCourseId =
                enrollment.courseId ??
                enrollment.course_id ??
                enrollment.course?._id ??
                enrollment.course?.id ??
                null;

              if (!enrollmentCourseId) {
                return null;
              }

              /* =============================
                  ACTUAL COURSE
              ============================= */

              const actualCourse =
                allCourses.find(
                  (course) => {
                    const courseId =
                      getCourseId(course);

                    return (
                      courseId !== null &&
                      String(courseId) ===
                        String(
                          enrollmentCourseId
                        )
                    );
                  }
                );

              const baseCourse =
                actualCourse || {
                  title:
                    enrollment.courseName ||
                    "Untitled Course",

                  duration:
                    "Self paced",

                  faculty: "Faculty",

                  category: "General",

                  image: "",
                };

              const courseId =
                getCourseId(
                  baseCourse
                ) ||
                enrollmentCourseId;

              /* =============================
                  PARALLEL MONGODB REQUESTS
              ============================= */

              const [
                lessonsResult,
                progressResult,
                quizzesResult,
                attemptsResult,
              ] =
                await Promise.all([
                  fetchJSON(
                    `${API_BASE_URL}/api/get-lessons/${courseId}`
                  ),

                  fetchJSON(
                    `${API_BASE_URL}/api/get-progress/${studentId}/${courseId}`
                  ),

                  fetchJSON(
                    `${API_BASE_URL}/quizzes/student/course/${courseId}`
                  ),

                  fetchJSON(
                    `${API_BASE_URL}/quizzes/student/attempts/${studentId}/course/${courseId}`
                  ),
                ]);

              /* =============================
                  LESSONS
              ============================= */

              const courseLessons =
                Array.isArray(
                  lessonsResult?.data
                )
                  ? lessonsResult.data
                  : [];

              /* =============================
                  STUDENT PROGRESS
              ============================= */

              const studentProgress =
                Array.isArray(
                  progressResult?.data
                )
                  ? progressResult.data
                  : [];

              /* =============================
                  COMPLETED LESSONS
              ============================= */

              const completedLessonIds = [
                ...new Set(
                  studentProgress
                    .filter(
                      (item) =>
                        item.completed ===
                        true
                    )
                    .map(
                      (item) =>
                        String(
                          item.lessonId
                        )
                    )
                ),
              ];

              const totalLessons =
                courseLessons.length;

              const completedLessons =
                Math.min(
                  completedLessonIds.length,
                  totalLessons
                );

              /* =============================
                  LEARNING HOURS
              ============================= */

              const completedLearningMinutes =
                courseLessons
                  .filter((lesson) =>
                    completedLessonIds.includes(
                      String(
                        lesson._id
                      )
                    )
                  )
                  .reduce(
                    (
                      total,
                      lesson
                    ) => {
                      return (
                        total +
                        parseDurationToMinutes(
                          lesson.duration
                        )
                      );
                    },
                    0
                  );

              /* =============================
                  COURSE PROGRESS
              ============================= */

              let progress = 0;

              if (totalLessons > 0) {
                progress = Math.round(
                  (completedLessons /
                    totalLessons) *
                    100
                );
              } else {
                progress = Number(
                  enrollment.progress ||
                    0
                );
              }

              progress = Math.max(
                0,
                Math.min(
                  100,
                  progress
                )
              );

              const status =
                progress >= 100
                  ? "Completed"
                  : "In Progress";

              /* =============================
                  COURSE INFORMATION
              ============================= */

              const title =
                baseCourse.title ||
                enrollment.courseName ||
                "Untitled Course";

              const instructor =
                baseCourse.faculty ||
                baseCourse.facultyName ||
                "Faculty";

              const category =
                baseCourse.category ||
                "General";

              const duration =
                baseCourse.duration ||
                "Self paced";

              const image =
                baseCourse.image ||
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

              /* =============================
                  QUIZZES
              ============================= */

              const quizzes =
                Array.isArray(
                  quizzesResult?.data
                )
                  ? quizzesResult.data
                  : [];

              const attempts =
                Array.isArray(
                  attemptsResult?.data
                )
                  ? attemptsResult.data
                  : [];

              /* =============================
                  QUIZ PROGRESS
              ============================= */

              const courseQuizData =
                quizzes.map(
                  (quiz) => {
                    const quizId =
                      getQuizId(quiz);

                    const latestAttempt =
                      getLatestQuizAttempt(
                        attempts,
                        quizId
                      );

                    const attempted =
                      !!latestAttempt;

                    const percentage =
                      attempted
                        ? Number(
                            latestAttempt.percentage ??
                              0
                          )
                        : 0;

                    const result =
                      attempted
                        ? String(
                            latestAttempt.result ||
                              ""
                          ).toLowerCase()
                        : "";

                    const passed =
                      attempted &&
                      result ===
                        "passed";

                    const failed =
                      attempted &&
                      result ===
                        "failed";

                    return {
                      ...quiz,

                      quizId,

                      courseId,

                      title:
                        quiz.title ||
                        "Untitled Quiz",

                      attempted,

                      passed,

                      failed,

                      percentage,

                      latestAttempt,

                      attemptDate:
                        latestAttempt?.submittedAt ||
                        latestAttempt?.createdAt ||
                        null,
                    };
                  }
                );

              return {
                ...baseCourse,

                id: courseId,
                courseId,

                title,
                instructor,
                category,
                duration,
                image,

                progress,

                completedLessons,

                totalLessons,

                status,

                enrollmentId:
                  enrollment._id,

                enrolledDate:
                  enrollment.createdAt,

                completed:
                  progress >= 100,

                completedLearningMinutes,

                quizzes:
                  courseQuizData,

                totalQuizzes:
                  quizzes.length,

                attemptedQuizzes:
                  courseQuizData.filter(
                    (quiz) =>
                      quiz.attempted
                  ).length,

                passedQuizzes:
                  courseQuizData.filter(
                    (quiz) =>
                      quiz.passed
                  ).length,

                failedQuizzes:
                  courseQuizData.filter(
                    (quiz) =>
                      quiz.failed
                  ).length,

                studentProgress,

                attempts,
              };
            }
          )
        );

      const validCourseData =
        courseData.filter(
          (course) =>
            course !== null
        );

      setProgressData(
        validCourseData
      );

      /* =================================
          CREATE COURSE-WISE QUIZ DATA
      ================================= */

      const allQuizProgress = [];

      validCourseData.forEach(
        (course) => {
          if (
            !Array.isArray(
              course.quizzes
            )
          ) {
            return;
          }

          allQuizProgress.push({
            courseId:
              course.courseId,

            courseTitle:
              course.title,

            courseImage:
              course.image,

            instructor:
              course.instructor,

            totalQuizzes:
              course.totalQuizzes,

            attemptedQuizzes:
              course.attemptedQuizzes,

            passedQuizzes:
              course.passedQuizzes,

            failedQuizzes:
              course.failedQuizzes,

            quizzes:
              course.quizzes,
          });
        }
      );

      setQuizProgressData(
        allQuizProgress
      );

      /* =================================
          DEFAULT SELECTED QUIZ COURSE
      ================================= */

      setSelectedQuizCourseId(
        (previousCourseId) => {
          const previousExists =
            allQuizProgress.some(
              (course) =>
                String(
                  course.courseId
                ) ===
                String(
                  previousCourseId
                )
            );

          if (
            previousCourseId &&
            previousExists
          ) {
            return previousCourseId;
          }

          const courseWithQuiz =
            allQuizProgress.find(
              (course) =>
                course.totalQuizzes >
                0
            );

          return (
            courseWithQuiz?.courseId ??
            allQuizProgress[0]
              ?.courseId ??
            null
          );
        }
      );
    } catch (error) {
      console.error(
        "Unable to load MongoDB progress:",
        error
      );

      setProgressData([]);
      setQuizProgressData([]);
      setSelectedQuizCourseId(null);
    } finally {
      setLoading(false);
    }
  };

  /* =================================
      LOAD ON PAGE OPEN
  ================================= */

  useEffect(() => {
    loadProgress();

    const handleUpdate = () => {
      loadProgress();
    };

    window.addEventListener(
      "enrollmentUpdated",
      handleUpdate
    );

    window.addEventListener(
      "studentLessonProgressUpdated",
      handleUpdate
    );

    window.addEventListener(
      "facultyLessonsUpdated",
      handleUpdate
    );

    window.addEventListener(
      "coursesUpdated",
      handleUpdate
    );

    window.addEventListener(
      "userLoginChanged",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "enrollmentUpdated",
        handleUpdate
      );

      window.removeEventListener(
        "studentLessonProgressUpdated",
        handleUpdate
      );

      window.removeEventListener(
        "facultyLessonsUpdated",
        handleUpdate
      );

      window.removeEventListener(
        "coursesUpdated",
        handleUpdate
      );

      window.removeEventListener(
        "userLoginChanged",
        handleUpdate
      );
    };
  }, []);

  /* =================================
      CONTINUE LEARNING
  ================================= */

  const handleContinue = (
    course
  ) => {
    try {
      sessionStorage.setItem(
        "selectedLearningCourse",
        JSON.stringify(course)
      );
    } catch (error) {
      console.error(
        "Unable to save selected course:",
        error
      );
    }

    navigate("/course-learning");
  };

  /* =================================
      CERTIFICATE
  ================================= */

  const handleCertificate = (
    course
  ) => {
    try {
      sessionStorage.setItem(
        "selectedCertificateCourse",
        JSON.stringify(course)
      );
    } catch (error) {
      console.error(
        "Unable to save certificate course:",
        error
      );
    }

    navigate("/certificates");
  };

  /* =================================
      OPEN QUIZ RESULT
  ================================= */

  const handleQuizResult = (
    quiz
  ) => {
    const attemptId =
      quiz?.latestAttempt?._id ||
      quiz?.latestAttempt?.attemptId ||
      null;

    if (!attemptId) {
      return;
    }

    navigate(
      `/student-quiz-result/${attemptId}`
    );
  };

  /* =================================
      START / RETAKE QUIZ
  ================================= */

  const handleRetakeQuiz = (
    quiz
  ) => {
    const quizId =
      quiz?.quizId ||
      quiz?._id ||
      null;

    if (!quizId) {
      return;
    }

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

    navigate(
      `/student-quiz/${quizId}`
    );
  };

  /* =================================
      OVERALL STATISTICS
  ================================= */

  const completedCourses =
    progressData.filter(
      (course) =>
        course.progress >= 100
    ).length;

  const inProgressCourses =
    progressData.filter(
      (course) =>
        course.progress > 0 &&
        course.progress < 100
    ).length;

  const overallProgress =
    progressData.length > 0
      ? Math.round(
          progressData.reduce(
            (total, course) =>
              total +
              Number(
                course.progress || 0
              ),
            0
          ) /
            progressData.length
        )
      : 0;

  /* =================================
      LEARNING HOURS
  ================================= */

  const totalLearningMinutes =
    progressData.reduce(
      (total, course) =>
        total +
        Number(
          course.completedLearningMinutes ||
            0
        ),
      0
    );

  const learningHoursText =
    formatLearningHours(
      totalLearningMinutes
    );

  /* =================================
      QUIZ GLOBAL STATISTICS
  ================================= */

  const totalQuizzes =
    quizProgressData.reduce(
      (total, course) =>
        total +
        Number(
          course.totalQuizzes || 0
        ),
      0
    );

  const attemptedQuizzes =
    quizProgressData.reduce(
      (total, course) =>
        total +
        Number(
          course.attemptedQuizzes ||
            0
        ),
      0
    );

  const passedQuizzes =
    quizProgressData.reduce(
      (total, course) =>
        total +
        Number(
          course.passedQuizzes ||
            0
        ),
      0
    );

  const failedQuizzes =
    quizProgressData.reduce(
      (total, course) =>
        total +
        Number(
          course.failedQuizzes ||
            0
        ),
      0
    );

  /* =================================
      SELECTED QUIZ COURSE
  ================================= */

  const selectedQuizCourse =
    quizProgressData.find(
      (course) =>
        String(course.courseId) ===
        String(
          selectedQuizCourseId
        )
    ) || null;

  const selectedCourseQuizzes =
    selectedQuizCourse?.quizzes ||
    [];

  const selectedCourseQuizProgress =
    selectedQuizCourse &&
    selectedQuizCourse.totalQuizzes > 0
      ? Math.round(
          (selectedQuizCourse.attemptedQuizzes /
            selectedQuizCourse.totalQuizzes) *
            100
        )
      : 0;

  /* =================================
      RECENT ACTIVITY
  ================================= */

  const recentActivity = [];

  progressData.forEach(
    (course) => {
      /* =============================
          COURSE COMPLETED
      ============================= */

      if (course.completed) {
        recentActivity.push({
          type:
            "completed-course",

          title:
            `Completed ${course.title}`,

          description:
            "Course completed successfully",

          date:
            course.studentProgress?.length >
            0
              ? course.studentProgress[
                  course.studentProgress.length -
                    1
                ]?.updatedAt ||
                course.studentProgress[
                  course.studentProgress.length -
                    1
                ]?.createdAt
              : course.enrolledDate,
        });
      }

      /* =============================
          LESSON ACTIVITY
      ============================= */

      else if (
        course.completedLessons > 0
      ) {
        const latestProgress =
          Array.isArray(
            course.studentProgress
          )
            ? [
                ...course.studentProgress,
              ].sort(
                (a, b) =>
                  new Date(
                    b.updatedAt ||
                      b.createdAt ||
                      0
                  ) -
                  new Date(
                    a.updatedAt ||
                      a.createdAt ||
                      0
                  )
              )[0]
            : null;

        recentActivity.push({
          type: "lesson",

          title:
            `Completed lessons in ${course.title}`,

          description:
            `${course.completedLessons} of ${course.totalLessons} lessons completed`,

          date:
            latestProgress?.updatedAt ||
            latestProgress?.createdAt ||
            course.enrolledDate,
        });
      }

      /* =============================
          STARTED COURSE
      ============================= */

      else {
        recentActivity.push({
          type: "started",

          title:
            `Started ${course.title}`,

          description:
            "Course learning started",

          date:
            course.enrolledDate,
        });
      }

      /* =============================
          QUIZ ACTIVITY
      ============================= */

      if (
        Array.isArray(
          course.quizzes
        )
      ) {
        course.quizzes.forEach(
          (quiz) => {
            if (!quiz.attempted) {
              return;
            }

            const attempt =
              quiz.latestAttempt;

            recentActivity.push({
              type: quiz.passed
                ? "quiz-passed"
                : quiz.failed
                ? "quiz-failed"
                : "quiz",

              title:
                quiz.passed
                  ? `Passed ${quiz.title}`
                  : quiz.failed
                  ? `Attempted ${quiz.title}`
                  : `Completed ${quiz.title}`,

              description:
                `Score: ${quiz.percentage}% • ${course.title}`,

              date:
                attempt?.submittedAt ||
                attempt?.createdAt ||
                null,
            });
          }
        );
      }
    }
  );

  /* =================================
      SORT RECENT ACTIVITY
  ================================= */

  recentActivity.sort(
    (a, b) =>
      new Date(
        b.date || 0
      ) -
      new Date(
        a.date || 0
      )
  );

  /* =================================
      FORMAT ACTIVITY DATE
  ================================= */

  const formatActivityDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      date.getTime();

    const days = Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    );

    if (days <= 0) {
      return "Today";
    }

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =================================
      ACTIVITY ICON
  ================================= */

  const getActivityIcon = (
    type
  ) => {
    if (
      type ===
      "completed-course"
    ) {
      return (
        <CheckCircle size={16} />
      );
    }

    if (type === "lesson") {
      return (
        <PlayCircle size={16} />
      );
    }

    if (
      type ===
      "quiz-passed"
    ) {
      return (
        <Trophy size={16} />
      );
    }

    if (
      type ===
      "quiz-failed"
    ) {
      return (
        <XCircle size={16} />
      );
    }

    if (type === "quiz") {
      return (
        <FileQuestion
          size={16}
        />
      );
    }

    return (
      <BookOpen size={16} />
    );
  };

  /* =================================
      LOADING STATE
  ================================= */

  if (loading) {
    return (
      <div className="progress-page">
        <div
          style={{
            minHeight:
              "500px",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            flexDirection:
              "column",
            gap: "12px",
          }}
        >
          <Clock
            size={30}
            className="progress-loading-icon"
          />

          <h3>
            Loading your progress...
          </h3>

          <p>
            Fetching your courses,
            lessons and quizzes.
          </p>
        </div>
      </div>
    );
  }

  /* =================================
      RENDER
  ================================= */

  return (
    <div className="progress-page">

      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="progress-header">
        <div>
          <h1>
            My Progress
          </h1>

          <p>
            Track your learning progress
            and continue your courses.
          </p>
        </div>
      </div>


      {/* =================================
          OVERVIEW CARDS
      ================================= */}

      <div className="progress-stats">

        <div className="progress-stat-card">
          <div className="progress-stat-icon purple">
            <TrendingUp size={19} />
          </div>

          <div className="progress-stat-info">
            <span>
              Overall Progress
            </span>

            <strong>
              {overallProgress}%
            </strong>
          </div>
        </div>


        <div className="progress-stat-card">
          <div className="progress-stat-icon green">
            <CheckCircle size={19} />
          </div>

          <div className="progress-stat-info">
            <span>
              Completed Courses
            </span>

            <strong>
              {completedCourses}
            </strong>
          </div>
        </div>


        <div className="progress-stat-card">
          <div className="progress-stat-icon orange">
            <BookOpen size={19} />
          </div>

          <div className="progress-stat-info">
            <span>
              In Progress
            </span>

            <strong>
              {inProgressCourses}
            </strong>
          </div>
        </div>


        <div className="progress-stat-card">
          <div className="progress-stat-icon blue">
            <Clock size={19} />
          </div>

          <div className="progress-stat-info">
            <span>
              Learning Hours
            </span>

            <strong>
              {learningHoursText}
            </strong>
          </div>
        </div>

      </div>


      {/* =================================
          OVERALL PROGRESS
      ================================= */}

      <div className="overall-progress-card">

        <div className="overall-progress-header">

          <div>
            <h2>
              Overall Learning Progress
            </h2>

            <p>
              Keep learning to reach
              your goals.
            </p>
          </div>

          <div className="overall-progress-percent">
            {overallProgress}%
          </div>

        </div>


        <div className="overall-progress-track">

          <div
            className="overall-progress-fill"
            style={{
              width: `${overallProgress}%`,
            }}
          ></div>

        </div>


        <div className="overall-progress-footer">

          <span>
            {completedCourses} of{" "}
            {progressData.length}{" "}
            courses completed
          </span>

          <span>
            {progressData.length > 0
              ? "Keep going!"
              : "Start learning today!"}
          </span>

        </div>

      </div>


      {/* =================================
          COURSE PROGRESS
      ================================= */}

      <div className="course-progress-section">

        <div className="section-title">

          <div>
            <h2>
              Course Progress
            </h2>

            <p>
              Continue where you
              left off.
            </p>
          </div>

          <Link to="/courses">
            View My Courses
          </Link>

        </div>


        {progressData.length > 0 ? (
          <div className="progress-course-list">

            {progressData.map(
              (course) => (

                <div
                  className="progress-course-card"
                  key={
                    course.enrollmentId ||
                    course.id
                  }
                >

                  <div className="progress-course-image">

                    <img
                      src={course.image}
                      alt={course.title}
                    />

                    <span
                      className={`progress-status ${
                        course.status ===
                        "Completed"
                          ? "completed"
                          : "learning"
                      }`}
                    >
                      {course.status}
                    </span>

                  </div>


                  <div className="progress-course-content">

                    <div className="progress-course-top">

                      <div>

                        <span className="progress-category">
                          {course.category}
                        </span>

                        <h3>
                          {course.title}
                        </h3>

                        <p>
                          By{" "}
                          {course.instructor}
                        </p>

                      </div>

                      <strong className="course-progress-percent">
                        {course.progress}%
                      </strong>

                    </div>


                    <div className="course-progress-bar">

                      <div
                        className={`course-progress-fill ${
                          course.progress ===
                          100
                            ? "completed"
                            : ""
                        }`}
                        style={{
                          width: `${course.progress}%`,
                        }}
                      ></div>

                    </div>


                    <div className="progress-course-details">

                      <span>
                        <CheckCircle size={12} />

                        {
                          course.completedLessons
                        }
                        /
                        {
                          course.totalLessons
                        }{" "}
                        Lessons
                      </span>

                      <span>
                        <Clock size={12} />

                        {
                          course.duration
                        }
                      </span>

                    </div>

                  </div>


                  <div className="progress-course-action">

                    {course.progress ===
                    100 ? (
                      <button
                        type="button"
                        className="certificate-button"
                        onClick={() =>
                          handleCertificate(
                            course
                          )
                        }
                      >
                        <Award size={14} />

                        Certificate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="continue-button"
                        onClick={() =>
                          handleContinue(
                            course
                          )
                        }
                      >
                        <PlayCircle size={14} />

                        Continue
                      </button>
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        ) : (

          <div
            className="progress-empty-state"
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#ffffff",
              borderRadius: "16px",
              border:
                "1px solid #e5e7eb",
            }}
          >
            <BookOpen
              size={38}
              style={{
                marginBottom: "12px",
                opacity: 0.6,
              }}
            />

            <h3>
              No Course Progress Yet
            </h3>

            <p>
              Enroll in a course and
              start learning to see
              your progress here.
            </p>

            <Link
              to="/browse"
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                marginTop: "15px",
                padding:
                  "10px 18px",
                borderRadius:
                  "8px",
                textDecoration:
                  "none",
                background:
                  "#6d4aff",
                color:
                  "#ffffff",
                fontWeight:
                  600,
              }}
            >
              Browse Courses
            </Link>
          </div>
        )}

      </div>


      {/* =================================
          QUIZ PROGRESS
      ================================= */}

      <div
        className="quiz-progress-section"
        style={{
          marginTop: "30px",
        }}
      >

        <div className="section-title">

          <div>
            <h2>
              Quiz Progress
            </h2>

            <p>
              Select a course to view
              its quiz progress.
            </p>
          </div>

        </div>


        {/* =================================
            GLOBAL QUIZ SUMMARY
        ================================= */}

        <div
          className="progress-stats"
          style={{
            marginTop: "20px",
          }}
        >

          <div className="progress-stat-card">
            <div className="progress-stat-icon purple">
              <FileQuestion
                size={19}
              />
            </div>

            <div className="progress-stat-info">
              <span>
                Total Quizzes
              </span>

              <strong>
                {totalQuizzes}
              </strong>
            </div>
          </div>


          <div className="progress-stat-card">
            <div className="progress-stat-icon blue">
              <PlayCircle
                size={19}
              />
            </div>

            <div className="progress-stat-info">
              <span>
                Attempted
              </span>

              <strong>
                {attemptedQuizzes}
              </strong>
            </div>
          </div>


          <div className="progress-stat-card">
            <div className="progress-stat-icon green">
              <Trophy size={19} />
            </div>

            <div className="progress-stat-info">
              <span>
                Passed
              </span>

              <strong>
                {passedQuizzes}
              </strong>
            </div>
          </div>


          <div className="progress-stat-card">
            <div className="progress-stat-icon orange">
              <XCircle size={19} />
            </div>

            <div className="progress-stat-info">
              <span>
                Failed
              </span>

              <strong>
                {failedQuizzes}
              </strong>
            </div>
          </div>

        </div>


        {/* =================================
            COURSE-WISE QUIZ SELECTOR
        ================================= */}

        {quizProgressData.length > 0 ? (

          <>

            <div
              style={{
                marginTop: "22px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
              }}
            >

              {quizProgressData.map(
                (course) => {
                  const isSelected =
                    String(
                      selectedQuizCourseId
                    ) ===
                    String(
                      course.courseId
                    );

                  const courseQuizProgress =
                    course.totalQuizzes >
                    0
                      ? Math.round(
                          (course.attemptedQuizzes /
                            course.totalQuizzes) *
                            100
                        )
                      : 0;

                  return (
                    <button
                      key={
                        course.courseId
                      }
                      type="button"
                      onClick={() =>
                        setSelectedQuizCourseId(
                          course.courseId
                        )
                      }
                      style={{
                        width: "100%",
                        textAlign:
                          "left",
                        border: isSelected
                          ? "2px solid #6d4aff"
                          : "1px solid #e9e9f2",
                        borderRadius:
                          "14px",
                        padding:
                          "16px",
                        background:
                          isSelected
                            ? "#f7f4ff"
                            : "#ffffff",
                        cursor:
                          "pointer",
                        boxShadow:
                          isSelected
                            ? "0 7px 22px rgba(109, 74, 255, 0.10)"
                            : "0 5px 18px rgba(31, 30, 45, 0.04)",
                        transition:
                          "all 0.2s ease",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "12px",
                        }}
                      >

                        <div
                          style={{
                            width:
                              "48px",
                            height:
                              "48px",
                            borderRadius:
                              "10px",
                            overflow:
                              "hidden",
                            flexShrink:
                              0,
                            background:
                              "#f0eff6",
                          }}
                        >
                          <img
                            src={
                              course.courseImage
                            }
                            alt={
                              course.courseTitle
                            }
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                            }}
                          />
                        </div>


                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >

                          <h3
                            style={{
                              margin:
                                "0 0 5px",
                              fontSize:
                                "15px",
                              color:
                                "#222",
                              whiteSpace:
                                "nowrap",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                            }}
                          >
                            {
                              course.courseTitle
                            }
                          </h3>

                          <p
                            style={{
                              margin: 0,
                              fontSize:
                                "12px",
                              color:
                                "#777",
                            }}
                          >
                            {
                              course.attemptedQuizzes
                            }{" "}
                            /{" "}
                            {
                              course.totalQuizzes
                            }{" "}
                            quizzes attempted
                          </p>

                        </div>

                      </div>


                      <div
                        style={{
                          marginTop:
                            "14px",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            marginBottom:
                              "6px",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#666",
                            }}
                          >
                            Quiz Progress
                          </span>

                          <strong
                            style={{
                              fontSize:
                                "13px",
                              color:
                                "#6d4aff",
                            }}
                          >
                            {
                              courseQuizProgress
                            }%
                          </strong>
                        </div>

                        <div
                          style={{
                            height:
                              "6px",
                            background:
                              "#e9e9ef",
                            borderRadius:
                              "10px",
                            overflow:
                              "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${courseQuizProgress}%`,
                              height:
                                "100%",
                              background:
                                "#6d4aff",
                              borderRadius:
                                "10px",
                            }}
                          />
                        </div>

                      </div>


                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "12px",
                          marginTop:
                            "12px",
                          fontSize:
                            "11px",
                        }}
                      >

                        <span
                          style={{
                            color:
                              "#16803a",
                            fontWeight:
                              600,
                          }}
                        >
                          Passed:{" "}
                          {
                            course.passedQuizzes
                          }
                        </span>

                        <span
                          style={{
                            color:
                              "#d93025",
                            fontWeight:
                              600,
                          }}
                        >
                          Failed:{" "}
                          {
                            course.failedQuizzes
                          }
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>


            {/* =================================
                SELECTED COURSE QUIZ HEADER
            ================================= */}

            {selectedQuizCourse && (
              <div
                style={{
                  marginTop:
                    "25px",
                  padding:
                    "18px 20px",
                  background:
                    "#ffffff",
                  border:
                    "1px solid #e9e9f2",
                  borderRadius:
                    "14px",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap:
                    "15px",
                  flexWrap:
                    "wrap",
                }}
              >

                <div>
                  <span
                    style={{
                      fontSize:
                        "11px",
                      fontWeight:
                        700,
                      color:
                        "#6d4aff",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Selected Course
                  </span>

                  <h3
                    style={{
                      margin:
                        "5px 0 3px",
                      fontSize:
                        "18px",
                    }}
                  >
                    {
                      selectedQuizCourse.courseTitle
                    }
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "13px",
                      color:
                        "#777",
                    }}
                  >
                    {
                      selectedQuizCourse.attemptedQuizzes
                    }{" "}
                    of{" "}
                    {
                      selectedQuizCourse.totalQuizzes
                    }{" "}
                    quizzes attempted
                  </p>
                </div>


                <div
                  style={{
                    minWidth:
                      "150px",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      marginBottom:
                        "6px",
                      fontSize:
                        "12px",
                    }}
                  >
                    <span>
                      Progress
                    </span>

                    <strong>
                      {
                        selectedCourseQuizProgress
                      }%
                    </strong>
                  </div>

                  <div
                    style={{
                      height:
                        "7px",
                      background:
                        "#e9e9ef",
                      borderRadius:
                        "10px",
                      overflow:
                        "hidden",
                    }}
                  >

                    <div
                      style={{
                        width: `${selectedCourseQuizProgress}%`,
                        height:
                          "100%",
                        background:
                          "#6d4aff",
                        borderRadius:
                          "10px",
                      }}
                    />

                  </div>

                </div>

              </div>
            )}


            {/* =================================
                SELECTED COURSE QUIZ LIST
            ================================= */}

            {selectedCourseQuizzes.length >
            0 ? (

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap:
                    "18px",
                  marginTop:
                    "20px",
                }}
              >

                {selectedCourseQuizzes.map(
                  (quiz) => (

                    <div
                      key={
                        quiz.quizId
                      }
                      style={{
                        background:
                          "#ffffff",
                        border:
                          "1px solid #e9e9f2",
                        borderRadius:
                          "16px",
                        padding:
                          "20px",
                        boxShadow:
                          "0 7px 22px rgba(31, 30, 45, 0.05)",
                      }}
                    >

                      {/* QUIZ HEADER */}

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap:
                            "12px",
                        }}
                      >

                        <div
                          style={{
                            flex: 1,
                          }}
                        >

                          <span
                            style={{
                              fontSize:
                                "12px",
                              fontWeight:
                                600,
                              color:
                                "#6d4aff",
                            }}
                          >
                            QUIZ
                          </span>

                          <h3
                            style={{
                              margin:
                                "6px 0 4px",
                              fontSize:
                                "17px",
                            }}
                          >
                            {
                              quiz.title
                            }
                          </h3>

                        </div>


                        {/* STATUS */}

                        <span
                          style={{
                            padding:
                              "5px 9px",
                            borderRadius:
                              "20px",
                            fontSize:
                              "11px",
                            fontWeight:
                              700,
                            background:
                              quiz.passed
                                ? "#eaf8ef"
                                : quiz.failed
                                ? "#fff0f0"
                                : quiz.attempted
                                ? "#eef4ff"
                                : "#f3f4f6",
                            color:
                              quiz.passed
                                ? "#16803a"
                                : quiz.failed
                                ? "#d93025"
                                : quiz.attempted
                                ? "#2563eb"
                                : "#6b7280",
                          }}
                        >
                          {quiz.passed
                            ? "Passed"
                            : quiz.failed
                            ? "Failed"
                            : quiz.attempted
                            ? "Attempted"
                            : "Not Attempted"}
                        </span>

                      </div>


                      {/* QUIZ DETAILS */}

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap:
                            "10px",
                          marginTop:
                            "18px",
                          fontSize:
                            "13px",
                          color:
                            "#666",
                        }}
                      >

                        <span>
                          <FileQuestion
                            size={13}
                            style={{
                              verticalAlign:
                                "middle",
                              marginRight:
                                "5px",
                            }}
                          />

                          {
                            Array.isArray(
                              quiz.questions
                            )
                              ? quiz.questions
                                  .length
                              : 0
                          }{" "}
                          Questions
                        </span>

                        <span>
                          {quiz.duration || 0} min
                        </span>

                      </div>


                      {/* QUIZ SCORE */}

                      {quiz.attempted ? (

                        <div
                          style={{
                            marginTop:
                              "18px",
                            padding:
                              "12px",
                            background:
                              quiz.passed
                                ? "#f1fbf4"
                                : quiz.failed
                                ? "#fff5f5"
                                : "#f7f4ff",
                            borderRadius:
                              "10px",
                          }}
                        >

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                            }}
                          >

                            <span
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#666",
                              }}
                            >
                              Latest Score
                            </span>

                            <strong
                              style={{
                                fontSize:
                                  "18px",
                                color:
                                  quiz.passed
                                    ? "#16803a"
                                    : quiz.failed
                                    ? "#d93025"
                                    : "#6d4aff",
                              }}
                            >
                              {
                                quiz.percentage
                              }%
                            </strong>

                          </div>


                          <div
                            style={{
                              height:
                                "7px",
                              background:
                                "#e9e9ef",
                              borderRadius:
                                "10px",
                              marginTop:
                                "8px",
                              overflow:
                                "hidden",
                            }}
                          >

                            <div
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(
                                    100,
                                    quiz.percentage
                                  )
                                )}%`,
                                height:
                                  "100%",
                                background:
                                  quiz.passed
                                    ? "#22a447"
                                    : quiz.failed
                                    ? "#e04444"
                                    : "#6d4aff",
                                borderRadius:
                                  "10px",
                              }}
                            />

                          </div>

                        </div>

                      ) : (

                        <div
                          style={{
                            marginTop:
                              "18px",
                            padding:
                              "12px",
                            background:
                              "#f8f9fc",
                            borderRadius:
                              "10px",
                            fontSize:
                              "13px",
                            color:
                              "#777",
                          }}
                        >
                          You have not attempted
                          this quiz yet.
                        </div>

                      )}


                      {/* QUIZ ACTION */}

                      <div
                        style={{
                          marginTop:
                            "16px",
                          display:
                            "flex",
                          gap:
                            "8px",
                        }}
                      >

                        {!quiz.attempted ? (

                          <button
                            type="button"
                            onClick={() =>
                              handleRetakeQuiz(
                                quiz
                              )
                            }
                            style={{
                              flex: 1,
                              border:
                                "none",
                              borderRadius:
                                "8px",
                              padding:
                                "10px 12px",
                              background:
                                "#6d4aff",
                              color:
                                "#ffffff",
                              fontWeight:
                                600,
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              gap:
                                "6px",
                            }}
                          >
                            <PlayCircle
                              size={14}
                            />

                            Start Quiz
                          </button>

                        ) : (

                          <>

                            <button
                              type="button"
                              onClick={() =>
                                handleQuizResult(
                                  quiz
                                )
                              }
                              style={{
                                flex: 1,
                                border:
                                  "1px solid #e1e1e8",
                                borderRadius:
                                  "8px",
                                padding:
                                  "10px 12px",
                                background:
                                  "#ffffff",
                                color:
                                  "#4b5563",
                                fontWeight:
                                  600,
                                cursor:
                                  "pointer",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                gap:
                                  "6px",
                              }}
                            >
                              <Award
                                size={14}
                              />

                              View Result
                            </button>


                            <button
                              type="button"
                              onClick={() =>
                                handleRetakeQuiz(
                                  quiz
                                )
                              }
                              style={{
                                flex: 1,
                                border:
                                  "none",
                                borderRadius:
                                  "8px",
                                padding:
                                  "10px 12px",
                                background:
                                  "#6d4aff",
                                color:
                                  "#ffffff",
                                fontWeight:
                                  600,
                                cursor:
                                  "pointer",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                gap:
                                  "6px",
                              }}
                            >
                              <RotateCcw
                                size={14}
                              />

                              Retake
                            </button>

                          </>

                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div
                style={{
                  marginTop:
                    "20px",
                  padding:
                    "45px 20px",
                  textAlign:
                    "center",
                  background:
                    "#ffffff",
                  borderRadius:
                    "16px",
                  border:
                    "1px solid #e5e7eb",
                }}
              >

                <FileQuestion
                  size={38}
                  style={{
                    marginBottom:
                      "12px",
                    opacity: 0.6,
                  }}
                />

                <h3>
                  No Quizzes Available
                </h3>

                <p>
                  This course does not
                  have any quizzes yet.
                </p>

              </div>

            )}

          </>

        ) : (

          <div
            style={{
              marginTop:
                "20px",
              padding:
                "45px 20px",
              textAlign:
                "center",
              background:
                "#ffffff",
              borderRadius:
                "16px",
              border:
                "1px solid #e5e7eb",
            }}
          >

            <FileQuestion
              size={38}
              style={{
                marginBottom:
                  "12px",
                opacity: 0.6,
              }}
            />

            <h3>
              No Quizzes Available
            </h3>

            <p>
              Quizzes for your enrolled
              courses will appear here.
            </p>

          </div>

        )}

      </div>


      {/* =================================
          RECENT ACTIVITY
      ================================= */}

      <div className="recent-activity">

        <div className="section-title">

          <div>
            <h2>
              Recent Activity
            </h2>

            <p>
              Your latest learning
              activities.
            </p>
          </div>

        </div>


        {recentActivity.length > 0 ? (

          <div className="activity-list">

            {recentActivity
              .slice(0, 5)
              .map(
                (
                  activity,
                  index
                ) => (

                  <div
                    className="activity-item"
                    key={`${activity.type}-${index}`}
                  >

                    <div className="activity-icon">
                      {getActivityIcon(
                        activity.type
                      )}
                    </div>

                    <div className="activity-content">

                      <strong>
                        {
                          activity.title
                        }
                      </strong>

                      <span>
                        {
                          activity.description
                        }
                      </span>

                    </div>

                    <time>
                      {formatActivityDate(
                        activity.date
                      )}
                    </time>

                  </div>

                )
              )}

          </div>

        ) : (

          <div
            className="activity-list"
            style={{
              padding:
                "30px",
              textAlign:
                "center",
            }}
          >
            <p>
              No learning activity
              yet.
            </p>
          </div>

        )}

      </div>

    </div>
  );
};

export default Progress;
