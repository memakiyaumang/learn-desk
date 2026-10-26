import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  PlayCircle,
  ChevronRight,
  AlertCircle,
  FileText,
  ClipboardCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "../css/CourseLearning.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const CourseLearning = () => {
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] =
    useState(null);

  const [completedLessons, setCompletedLessons] =
    useState([]);

  // ==================================================
  // QUIZ STATES
  // ==================================================
  const [quizzes, setQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] =
    useState([]);

  const [quizLoading, setQuizLoading] =
    useState(false);

  const [quizError, setQuizError] = useState("");

  // ==================================================
  // GENERAL STATES
  // ==================================================
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  // ==================================================
  // GET LOGGED IN STUDENT
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
  // GET STUDENT TOKEN
  //
  // IMPORTANT:
  // Never use localStorage.token
  // ==================================================
  const getStudentToken = () => {
    try {
      const session =
        sessionStorage.getItem(
          "studentSession"
        );

      if (session) {
        const student =
          JSON.parse(session);

        if (student?.token) {
          return student.token;
        }
      }
    } catch (error) {
      console.error(
        "Unable to read student token:",
        error
      );
    }

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
  // AUTH HEADERS
  // ==================================================
  const getAuthHeaders = () => {
    const token = getStudentToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ==================================================
  // HANDLE UNAUTHORIZED
  // ==================================================
  const handleUnauthorized = () => {
    sessionStorage.removeItem(
      "studentSession"
    );

    sessionStorage.removeItem(
      "studentQuizResult"
    );

    sessionStorage.removeItem(
      "selectedStudentQuiz"
    );

    localStorage.removeItem(
      "studentToken"
    );

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ==================================================
  // GET STUDENT ID
  // ==================================================
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

  // ==================================================
  // GET COURSE ID
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
  // GET LESSON ID
  // ==================================================
  const getLessonId = (lesson) => {
    if (!lesson) {
      return null;
    }

    return (
      lesson._id ||
      lesson.id ||
      lesson.lessonId ||
      null
    );
  };

  // ==================================================
  // GET QUIZ ID
  // ==================================================
  const getQuizId = (quiz) => {
    if (!quiz) {
      return null;
    }

    return (
      quiz._id ||
      quiz.id ||
      quiz.quizId ||
      null
    );
  };

  // ==================================================
  // GET ATTEMPT QUIZ ID
  // ==================================================
  const getAttemptQuizId = (attempt) => {
    if (!attempt) {
      return null;
    }

    return (
      attempt.quizId ||
      attempt.quizID ||
      attempt.quiz_id ||
      attempt.quiz?._id ||
      attempt.quiz?.id ||
      null
    );
  };

  // ==================================================
  // CHECK QUIZ PASSED
  // ==================================================
  const isQuizPassed = (quizId) => {
    if (!quizId) {
      return false;
    }

    return quizAttempts.some(
      (attempt) => {
        const attemptQuizId =
          getAttemptQuizId(attempt);

        const result =
          String(
            attempt?.result || ""
          ).toLowerCase();

        return (
          String(attemptQuizId) ===
            String(quizId) &&
          result === "passed"
        );
      }
    );
  };

  // ==================================================
  // QUIZ COMPLETION
  // ==================================================
  const completedQuizCount = useMemo(() => {
    if (!quizzes.length) {
      return 0;
    }

    return quizzes.filter(
      (quiz) =>
        isQuizPassed(
          getQuizId(quiz)
        )
    ).length;
  }, [
    quizzes,
    quizAttempts,
  ]);

  const allQuizzesCompleted =
    quizzes.length === 0 ||
    completedQuizCount >=
      quizzes.length;

  // ==================================================
  // GET YOUTUBE VIDEO ID
  // ==================================================
  const getYouTubeVideoId = (url) => {
    if (!url) {
      return "";
    }

    try {
      const parsedUrl = new URL(
        String(url).trim()
      );

      const hostname =
        parsedUrl.hostname
          .toLowerCase()
          .replace(/^www\./, "");

      // ----------------------------------------------
      // youtube.com/watch?v=VIDEO_ID
      // ----------------------------------------------
      if (
        hostname === "youtube.com" ||
        hostname === "m.youtube.com"
      ) {
        const videoId =
          parsedUrl.searchParams.get(
            "v"
          );

        if (videoId) {
          return videoId;
        }

        // --------------------------------------------
        // youtube.com/embed/VIDEO_ID
        // --------------------------------------------
        if (
          parsedUrl.pathname.startsWith(
            "/embed/"
          )
        ) {
          return (
            parsedUrl.pathname
              .split("/embed/")[1]
              ?.split("/")[0] || ""
          );
        }

        // --------------------------------------------
        // youtube.com/shorts/VIDEO_ID
        // --------------------------------------------
        if (
          parsedUrl.pathname.startsWith(
            "/shorts/"
          )
        ) {
          return (
            parsedUrl.pathname
              .split("/shorts/")[1]
              ?.split("/")[0] || ""
          );
        }

        // --------------------------------------------
        // youtube.com/live/VIDEO_ID
        // --------------------------------------------
        if (
          parsedUrl.pathname.startsWith(
            "/live/"
          )
        ) {
          return (
            parsedUrl.pathname
              .split("/live/")[1]
              ?.split("/")[0] || ""
          );
        }
      }

      // ----------------------------------------------
      // youtu.be/VIDEO_ID
      // ----------------------------------------------
      if (
        hostname === "youtu.be"
      ) {
        return (
          parsedUrl.pathname
            .replace("/", "")
            .split("/")[0] || ""
        );
      }

      return "";
    } catch (error) {
      return "";
    }
  };

  // ==================================================
  // GET YOUTUBE EMBED URL
  // ==================================================
  const getYouTubeEmbedUrl = (url) => {
    const videoId =
      getYouTubeVideoId(url);

    if (!videoId) {
      return "";
    }

    return `https://www.youtube.com/embed/${videoId}`;
  };

  // ==================================================
  // GET GOOGLE DRIVE VIDEO EMBED URL
  // ==================================================
  const getGoogleDriveEmbedUrl = (url) => {
    if (!url) return "";

    try {
      const parsedUrl = new URL(String(url).trim());
      const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

      if (hostname !== "drive.google.com" && hostname !== "docs.google.com") {
        return "";
      }

      const fileMatch = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/);
      if (fileMatch?.[1]) {
        return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
      }

      const fileId = parsedUrl.searchParams.get("id");
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }

      return "";
    } catch (error) {
      return "";
    }
  };

  // ==================================================
  // GET LESSON VIDEO URL
  // ==================================================
  const getLessonVideoUrl = (
    lesson
  ) => {
    if (!lesson) {
      return "";
    }

    return (
      lesson.videoUrl ||
      lesson.video ||
      lesson.videoURL ||
      lesson.video_url ||
      ""
    );
  };

  // ==================================================
  // GET LESSON MATERIAL URL
  // ==================================================
  const getLessonMaterialUrl = (
    lesson
  ) => {
    if (!lesson) {
      return "";
    }

    return (
      lesson.materialUrl ||
      lesson.material ||
      lesson.pdfUrl ||
      lesson.materialURL ||
      lesson.material_url ||
      ""
    );
  };

  // ==================================================
  // LOAD QUIZZES + ATTEMPTS
  // ==================================================
  const loadQuizzes = async (
    courseId,
    studentId
  ) => {
    if (!courseId) {
      setQuizzes([]);
      setQuizAttempts([]);
      return;
    }

    try {
      setQuizLoading(true);
      setQuizError("");

      const token =
        getStudentToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      // ----------------------------------------------
      // GET PUBLISHED QUIZZES
      // ----------------------------------------------
      const response =
        await fetch(
          `${API_BASE_URL}/quizzes/student/course/${courseId}`,
          {
            method: "GET",
            headers:
              getAuthHeaders(),
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

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to load quizzes."
        );
      }

      const quizList =
        Array.isArray(
          result.data
        )
          ? result.data
          : [];

      setQuizzes(
        quizList
      );

      // ----------------------------------------------
      // GET STUDENT QUIZ ATTEMPTS
      // ----------------------------------------------
      if (studentId) {
        const attemptResponse =
          await fetch(
            `${API_BASE_URL}/quizzes/student/attempts/${studentId}/course/${courseId}`,
            {
              method: "GET",
              headers:
                getAuthHeaders(),
            }
          );

        if (
          attemptResponse.status ===
            401 ||
          attemptResponse.status ===
            403
        ) {
          handleUnauthorized();
          return;
        }

        const attemptResult =
          await attemptResponse.json();

        if (
          !attemptResponse.ok
        ) {
          throw new Error(
            attemptResult.message ||
              "Unable to load quiz attempts."
          );
        }

        const attempts =
          Array.isArray(
            attemptResult.data
          )
            ? attemptResult.data
            : [];

        setQuizAttempts(
          attempts
        );
      } else {
        setQuizAttempts([]);
      }
    } catch (error) {
      console.error(
        "Unable to load quizzes:",
        error
      );

      setQuizzes([]);
      setQuizAttempts([]);

      setQuizError(
        error.message ||
          "Unable to load quizzes."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // ==================================================
  // LOAD COURSE LEARNING DATA
  // ==================================================
  const loadCourseData =
    async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        // --------------------------------------------
        // STUDENT
        // --------------------------------------------
        const student =
          getLoggedInStudent();

        if (!student) {
          navigate("/login");
          return;
        }

        const token =
          getStudentToken();

        if (!token) {
          handleUnauthorized();
          return;
        }

        const studentId =
          getStudentId(student);

        if (!studentId) {
          setErrorMessage(
            "Unable to identify the logged-in student."
          );

          setLoading(false);
          return;
        }

        // --------------------------------------------
        // SELECTED COURSE
        // --------------------------------------------
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
            JSON.parse(
              savedCourse
            );
        } catch (error) {
          sessionStorage.removeItem(
            "selectedLearningCourse"
          );

          navigate("/courses");
          return;
        }

        if (!selectedCourse) {
          navigate("/courses");
          return;
        }

        // --------------------------------------------
        // COURSE ID
        // --------------------------------------------
        const selectedCourseId =
          getCourseId(
            selectedCourse
          );

        console.log(
          "Selected Learning Course:",
          selectedCourse
        );

        console.log(
          "Actual Course ID:",
          selectedCourseId
        );

        if (!selectedCourseId) {
          setErrorMessage(
            "Unable to identify this course."
          );

          setLoading(false);
          return;
        }

        // --------------------------------------------
        // GET LATEST COURSE FROM MONGODB
        // --------------------------------------------
        let finalCourse =
          selectedCourse;

        try {
          const courseResponse =
            await fetch(
              `${API_BASE_URL}/api/get-courses`,
              {
                method: "GET",
                headers:
                  getAuthHeaders(),
              }
            );

          if (
            courseResponse.status ===
              401 ||
            courseResponse.status ===
              403
          ) {
            handleUnauthorized();
            return;
          }

          const courseResult =
            await courseResponse.json();

          if (
            courseResponse.ok &&
            courseResult.success
          ) {
            const coursesList =
              Array.isArray(
                courseResult.data
              )
                ? courseResult.data
                : [];

            const actualCourse =
              coursesList.find(
                (item) => {
                  const actualId =
                    item._id ||
                    item.id ||
                    item.courseId;

                  return (
                    String(
                      actualId
                    ) ===
                    String(
                      selectedCourseId
                    )
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
            "Unable to fetch latest course:",
            error
          );
        }

        // --------------------------------------------
        // PREPARE COURSE
        // --------------------------------------------
        const preparedCourse = {
          ...finalCourse,

          id: selectedCourseId,

          courseId:
            selectedCourseId,

          title:
            finalCourse.title ||
            finalCourse.courseName ||
            finalCourse.name ||
            "Untitled Course",

          instructor:
            finalCourse.instructor ||
            finalCourse.faculty ||
            finalCourse.facultyName ||
            "Faculty",
        };

        setCourse(
          preparedCourse
        );

        // --------------------------------------------
        // VERIFY STUDENT ENROLLMENT
        // --------------------------------------------
        const enrollmentUrl =
          `${API_BASE_URL}/api/get-enrollment/${studentId}/${selectedCourseId}`;

        console.log(
          "Enrollment URL:",
          enrollmentUrl
        );

        const enrollmentResponse =
          await fetch(
            enrollmentUrl,
            {
              method: "GET",
              headers:
                getAuthHeaders(),
            }
          );

        if (
          enrollmentResponse.status ===
            401 ||
          enrollmentResponse.status ===
            403
        ) {
          handleUnauthorized();
          return;
        }

        const enrollmentResult =
          await enrollmentResponse.json();

        if (
          !enrollmentResponse.ok
        ) {
          throw new Error(
            enrollmentResult.message ||
              "Unable to verify course enrollment."
          );
        }

        const studentEnrollment =
          enrollmentResult.success
            ? enrollmentResult.data
            : null;

        if (!studentEnrollment) {
          setErrorMessage(
            "You are not enrolled in this course."
          );

          setLoading(false);
          return;
        }

        // --------------------------------------------
        // GET LESSONS FROM MONGODB
        // --------------------------------------------
        const lessonResponse =
          await fetch(
            `${API_BASE_URL}/api/get-lessons/${selectedCourseId}`,
            {
              method: "GET",
              headers:
                getAuthHeaders(),
            }
          );

        if (
          lessonResponse.status ===
            401 ||
          lessonResponse.status ===
            403
        ) {
          handleUnauthorized();
          return;
        }

        const lessonResult =
          await lessonResponse.json();

        if (
          !lessonResponse.ok
        ) {
          throw new Error(
            lessonResult.message ||
              "Unable to load lessons."
          );
        }

        const mongoLessons =
          Array.isArray(
            lessonResult.data
          )
            ? lessonResult.data
            : [];

        // --------------------------------------------
        // NORMALIZE LESSONS
        // --------------------------------------------
        const courseLessons =
          mongoLessons
            .map((lesson) => ({
              ...lesson,

              id:
                lesson._id ||
                lesson.id ||
                lesson.lessonId,

              // Keep backend field names
              videoUrl:
                lesson.videoUrl ||
                lesson.video ||
                lesson.videoURL ||
                lesson.video_url ||
                "",

              materialUrl:
                lesson.materialUrl ||
                lesson.material ||
                lesson.pdfUrl ||
                lesson.materialURL ||
                lesson.material_url ||
                "",

              duration:
                lesson.duration ||
                lesson.time ||
                "",
            }))
            .sort(
              (a, b) =>
                Number(
                  a.order || 0
                ) -
                Number(
                  b.order || 0
                )
            );

        console.log(
          "Lessons loaded from MongoDB:",
          courseLessons
        );

        // --------------------------------------------
        // DEBUG VIDEO + MATERIAL
        // --------------------------------------------
        courseLessons.forEach(
          (lesson, index) => {
            console.log(
              `Lesson ${index + 1}:`,
              {
                id: lesson.id,
                title: lesson.title,
                videoUrl:
                  lesson.videoUrl,
                materialUrl:
                  lesson.materialUrl,
              }
            );
          }
        );

        setLessons(
          courseLessons
        );

        // --------------------------------------------
        // GET STUDENT PROGRESS
        // --------------------------------------------
        const progressResponse =
          await fetch(
            `${API_BASE_URL}/api/get-progress/${studentId}/${selectedCourseId}`,
            {
              method: "GET",
              headers:
                getAuthHeaders(),
            }
          );

        if (
          progressResponse.status ===
            401 ||
          progressResponse.status ===
            403
        ) {
          handleUnauthorized();
          return;
        }

        const progressResult =
          await progressResponse.json();

        if (
          !progressResponse.ok
        ) {
          throw new Error(
            progressResult.message ||
              "Unable to load student progress."
          );
        }

        const progressList =
          Array.isArray(
            progressResult.data
          )
            ? progressResult.data
            : [];

        const completedLessonIds =
          progressList
            .filter(
              (item) =>
                item.completed ===
                true
            )
            .map((item) =>
              String(
                item.lessonId
              )
            );

        setCompletedLessons([
          ...new Set(
            completedLessonIds
          ),
        ]);

        // --------------------------------------------
        // LOAD QUIZZES
        // --------------------------------------------
        await loadQuizzes(
          selectedCourseId,
          studentId
        );

        // --------------------------------------------
        // SELECT FIRST LESSON
        // --------------------------------------------
        setSelectedLesson((currentLesson) => {
  if (!courseLessons.length) {
    return null;
  }

  if (currentLesson) {
    const currentLessonId = String(
      getLessonId(currentLesson)
    );

    const matchingLesson = courseLessons.find(
      (lesson) =>
        String(getLessonId(lesson)) === currentLessonId
    );

    if (matchingLesson) {
      return matchingLesson;
    }
  }

  return courseLessons[0];
});

        setLoading(false);
      } catch (error) {
        console.error(
          "Unable to load course learning data:",
          error
        );

        setErrorMessage(
          error.message ||
            "Something went wrong while loading the course."
        );

        setLoading(false);
      }
    };

  // ==================================================
  // INITIAL LOAD + EVENTS
  // ==================================================
  useEffect(() => {
    loadCourseData();

    const handleDataUpdate =
      () => {
        loadCourseData();
      };

    window.addEventListener(
      "studentLessonProgressUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "studentQuizProgressUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "enrollmentUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "facultyLessonsUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "coursesUpdated",
      handleDataUpdate
    );

    window.addEventListener(
      "facultyQuizzesUpdated",
      handleDataUpdate
    );

    return () => {
      window.removeEventListener(
        "studentLessonProgressUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "studentQuizProgressUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "enrollmentUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "facultyLessonsUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "coursesUpdated",
        handleDataUpdate
      );

      window.removeEventListener(
        "facultyQuizzesUpdated",
        handleDataUpdate
      );
    };
  }, [navigate]);

  // ==================================================
  // LESSON COMPLETED CHECK
  // ==================================================
  const isLessonCompleted =
    (lessonId) => {
      return completedLessons.includes(
        String(lessonId)
      );
    };

  // ==================================================
  // CALCULATE COURSE PROGRESS
  // ==================================================
  const progress = useMemo(() => {
    if (!lessons.length) {
      return 0;
    }

    const completedCount =
      lessons.filter(
        (lesson) =>
          isLessonCompleted(
            getLessonId(
              lesson
            )
          )
      ).length;

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (completedCount /
            lessons.length) *
            100
        )
      )
    );
  }, [
    lessons,
    completedLessons,
  ]);

  // ==================================================
  // LESSON + QUIZ CERTIFICATE
  // ==================================================
  const allLessonsCompleted =
    lessons.length > 0 &&
    progress >= 100;

  const certificateEligible =
    allLessonsCompleted &&
    allQuizzesCompleted;

  // ==================================================
  // MARK LESSON COMPLETE
  // ==================================================
  const handleLessonComplete =
    async () => {
      if (
        !course ||
        !selectedLesson
      ) {
        return;
      }

      const lessonId =
        getLessonId(
          selectedLesson
        );

      if (!lessonId) {
        return;
      }

      if (
        isLessonCompleted(
          lessonId
        )
      ) {
        return;
      }

      const student =
        getLoggedInStudent();

      if (!student) {
        navigate("/login");
        return;
      }

      const token =
        getStudentToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const studentId =
        getStudentId(student);

      const studentEmail =
        student.email ||
        student.emailAddress ||
        "";

      const courseId =
        getCourseId(course);

      if (
        !studentId ||
        !courseId
      ) {
        console.error(
          "Student ID or Course ID is missing."
        );

        return;
      }

      try {
        // --------------------------------------------
        // SAVE LESSON PROGRESS
        // --------------------------------------------
        const progressResponse =
          await fetch(
            `${API_BASE_URL}/api/update-progress`,
            {
              method: "PUT",

              headers:
                getAuthHeaders(),

              body: JSON.stringify({
                studentId:
                  String(
                    studentId
                  ),

                studentEmail:
                  studentEmail || "",

                courseId:
                  String(
                    courseId
                  ),

                lessonId:
                  String(
                    lessonId
                  ),

                completed: true,
              }),
            }
          );

        if (
          progressResponse.status ===
            401 ||
          progressResponse.status ===
            403
        ) {
          handleUnauthorized();
          return;
        }

        const progressResult =
          await progressResponse.json();

        if (
          !progressResponse.ok
        ) {
          throw new Error(
            progressResult.message ||
              "Unable to save lesson progress."
          );
        }

        // --------------------------------------------
        // UPDATE LOCAL STATE
        // --------------------------------------------
        const updatedCompletedLessons =
          [
            ...completedLessons,
            String(lessonId),
          ];

        const uniqueCompletedLessons =
          [
            ...new Set(
              updatedCompletedLessons
            ),
          ];

        setCompletedLessons(
          uniqueCompletedLessons
        );

        // --------------------------------------------
        // CALCULATE ENROLLMENT PROGRESS
        // --------------------------------------------
        const updatedCompletedCount =
          uniqueCompletedLessons.filter(
            (
              completedLessonId
            ) =>
              lessons.some(
                (lesson) =>
                  String(
                    getLessonId(
                      lesson
                    )
                  ) ===
                  String(
                    completedLessonId
                  )
              )
          ).length;

        const updatedProgress =
          lessons.length > 0
            ? Math.min(
                100,
                Math.round(
                  (updatedCompletedCount /
                    lessons.length) *
                    100
                )
              )
            : 0;

        const enrollmentCompleted =
          lessons.length > 0 &&
          updatedProgress >= 100;

        // --------------------------------------------
        // UPDATE ENROLLMENT
        // --------------------------------------------
        const enrollmentResponse =
          await fetch(
            `${API_BASE_URL}/api/update-enrollment-progress`,
            {
              method: "PUT",

              headers:
                getAuthHeaders(),

              body: JSON.stringify({
                studentId:
                  String(
                    studentId
                  ),

                courseId:
                  String(
                    courseId
                  ),

                progress:
                  updatedProgress,

                completedLessons:
                  updatedCompletedCount,

                totalLessons:
                  lessons.length,

                completed:
                  enrollmentCompleted,
              }),
            }
          );

        if (
          enrollmentResponse.status ===
            401 ||
          enrollmentResponse.status ===
            403
        ) {
          handleUnauthorized();
          return;
        }

        const enrollmentResult =
          await enrollmentResponse.json();

        if (
          !enrollmentResponse.ok
        ) {
          throw new Error(
            enrollmentResult.message ||
              "Unable to update enrollment progress."
          );
        }

        window.dispatchEvent(
          new Event(
            "studentLessonProgressUpdated"
          )
        );

        window.dispatchEvent(
          new Event(
            "enrollmentUpdated"
          )
        );
      } catch (error) {
        console.error(
          "Unable to save lesson progress:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to save lesson progress."
        );
      }
    };

  // ==================================================
  // CURRENT LESSON INDEX
  // ==================================================
  const currentLessonIndex =
    selectedLesson
      ? lessons.findIndex(
          (lesson) =>
            String(
              getLessonId(
                lesson
              )
            ) ===
            String(
              getLessonId(
                selectedLesson
              )
            )
        )
      : -1;

  // ==================================================
  // PREVIOUS LESSON
  // ==================================================
  const handlePreviousLesson =
    () => {
      if (
        currentLessonIndex > 0
      ) {
        setSelectedLesson(
          lessons[
            currentLessonIndex -
              1
          ]
        );
      }
    };

  // ==================================================
  // NEXT LESSON
  // ==================================================
  const handleNextLesson =
    () => {
      if (
        currentLessonIndex >=
          0 &&
        currentLessonIndex <
          lessons.length - 1
      ) {
        setSelectedLesson(
          lessons[
            currentLessonIndex +
              1
          ]
        );
      }
    };

  // ==================================================
  // OPEN STUDENT QUIZZES
  // ==================================================
  const handleOpenQuizzes =
    () => {
      if (!course) {
        return;
      }

      try {
        sessionStorage.setItem(
          "selectedLearningCourse",
          JSON.stringify(
            course
          )
        );
      } catch (error) {
        console.error(
          "Unable to save selected learning course:",
          error
        );
      }

      navigate(
        "/student-quizzes"
      );
    };

  // ==================================================
  // BACK
  // ==================================================
  const handleBack = () => {
    navigate("/courses");
  };

  // ==================================================
  // CURRENT LESSON MEDIA
  // ==================================================
  const materialUrl =
    getLessonMaterialUrl(
      selectedLesson
    );

  const videoUrl =
    getLessonVideoUrl(
      selectedLesson
    );

  const youtubeEmbedUrl =
    getYouTubeEmbedUrl(
      videoUrl
    );

  const googleDriveEmbedUrl =
    getGoogleDriveEmbedUrl(
      videoUrl
    );

  // ==================================================
  // DEBUG CURRENT LESSON
  // ==================================================
  useEffect(() => {
    if (!selectedLesson) {
      return;
    }

    console.log(
      "Selected Lesson:",
      selectedLesson
    );

    console.log(
      "Selected Lesson Video URL:",
      getLessonVideoUrl(
        selectedLesson
      )
    );

    console.log(
      "Selected Lesson Material URL:",
      getLessonMaterialUrl(
        selectedLesson
      )
    );
  }, [selectedLesson]);

  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {
    return (
      <div className="course-learning-loading">
        <BookOpen size={28} />

        <span>
          Loading course...
        </span>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================
  if (errorMessage) {
    return (
      <div className="course-learning-page">
        <div className="learning-error-card">
          <AlertCircle size={30} />

          <h2>
            Unable to Open Course
          </h2>

          <p>
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="learning-back-btn"
          >
            <ArrowLeft size={17} />
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // COURSE NOT FOUND
  // ==================================================
  if (!course) {
    return (
      <div className="course-learning-page">
        <div className="learning-error-card">
          <AlertCircle size={30} />

          <h2>
            Course Not Found
          </h2>

          <p>
            This course could not be
            loaded.
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="learning-back-btn"
          >
            <ArrowLeft size={17} />
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN UI
  // ==================================================
  return (
    <div className="course-learning-page">

      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="learning-header">

        <button
          type="button"
          className="learning-back-btn"
          onClick={handleBack}
        >
          <ArrowLeft size={17} />

          Back to My Courses
        </button>

        <div className="learning-course-title">

          <h1>
            {course.title}
          </h1>

          <span>
            By{" "}
            {course.instructor}
          </span>

        </div>

      </div>

      {/* ==================================================
          COURSE PROGRESS
      ================================================== */}
      <div className="learning-progress-card">

        <div className="learning-progress-top">

          <div>
            <span>
              Course Progress
            </span>

            <strong>
              {progress}%
            </strong>
          </div>

          <div className="learning-progress-info">

            <CheckCircle2
              size={16}
            />

            {
              completedLessons.filter(
                (lessonId) =>
                  lessons.some(
                    (lesson) =>
                      String(
                        getLessonId(
                          lesson
                        )
                      ) ===
                      String(
                        lessonId
                      )
                  )
              ).length
            }

            {" / "}

            {lessons.length}

            {" lessons completed"}

          </div>

        </div>

        <div className="learning-progress-track">

          <div
            className="learning-progress-fill"
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* ==================================================
          MAIN AREA
      ================================================== */}
      <div className="learning-layout">

        {/* ==================================================
            SIDEBAR
        ================================================== */}
        <aside className="learning-lessons">

          <div className="learning-lessons-header">

            <div>

              <p>
                COURSE CONTENT
              </p>

              <h2>
                Lessons
              </h2>

            </div>

            <span>
              {lessons.length}
            </span>

          </div>

          <div className="learning-lesson-list">

            {lessons.map(
              (
                lesson,
                index
              ) => {

                const lessonId =
                  getLessonId(
                    lesson
                  );

                const completed =
                  isLessonCompleted(
                    lessonId
                  );

                const selected =
                  selectedLesson &&
                  String(
                    getLessonId(
                      selectedLesson
                    )
                  ) ===
                    String(
                      lessonId
                    );

                return (
                  <button
                    type="button"
                    key={
                      lessonId ||
                      index
                    }
                    className={`learning-lesson-item ${
                      selected
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedLesson(
                        lesson
                      );
                    }}
                  >

                    <div className="lesson-number">

                      {completed ? (
                        <CheckCircle2
                          size={17}
                        />
                      ) : (
                        index + 1
                      )}

                    </div>

                    <div className="lesson-item-content">

                      <strong>
                        {lesson.title ||
                          `Lesson ${
                            index + 1
                          }`}
                      </strong>

                      <span>

                        <Clock3
                          size={12}
                        />

                        {lesson.duration ||
                          lesson.time ||
                          "Self paced"}

                      </span>

                    </div>

                    {completed ? (
                      <CheckCircle2
                        className="lesson-completed-icon"
                        size={16}
                      />
                    ) : (
                      <ChevronRight
                        size={15}
                      />
                    )}

                  </button>
                );
              }
            )}

          </div>

          {/* ==================================================
              QUIZ SECTION
          ================================================== */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop:
                "1px solid #e5e7eb",
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
                padding:
                  "0 4px 12px",
              }}
            >

              <div>

                <p
                  style={{
                    margin: 0,
                    fontSize:
                      "11px",
                    fontWeight:
                      "700",
                    color:
                      "#6d3df5",
                    letterSpacing:
                      "0.05em",
                  }}
                >
                  ASSESSMENT
                </p>

                <h3
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize:
                      "17px",
                  }}
                >
                  Quizzes
                </h3>

              </div>

              <span
                style={{
                  minWidth:
                    "28px",
                  height:
                    "28px",
                  borderRadius:
                    "50%",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  background:
                    "#f1edff",
                  color:
                    "#6d3df5",
                  fontSize:
                    "12px",
                  fontWeight:
                    "700",
                }}
              >
                {quizzes.length}
              </span>

            </div>

            <button
              type="button"
              onClick={
                handleOpenQuizzes
              }
              style={{
                width: "100%",
                border:
                  "1px solid #e5e7eb",
                background:
                  "#ffffff",
                borderRadius:
                  "10px",
                padding:
                  "11px 12px",
                marginBottom:
                  "10px",
                textAlign:
                  "left",
                cursor:
                  "pointer",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "space-between",
                gap: "10px",
                color:
                  "#334155",
              }}
            >

              <span
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  fontSize:
                    "13px",
                  fontWeight:
                    "600",
                }}
              >

                <ClipboardCheck
                  size={16}
                />

                View All Quizzes

              </span>

              <ChevronRight
                size={15}
              />

            </button>

            {quizLoading ? (
              <div
                style={{
                  padding:
                    "12px",
                  fontSize:
                    "13px",
                  color:
                    "#64748b",
                }}
              >
                Loading quizzes...
              </div>
            ) : quizzes.length ===
              0 ? (
              <div
                style={{
                  padding:
                    "12px",
                  fontSize:
                    "13px",
                  color:
                    "#64748b",
                  background:
                    "#f8fafc",
                  borderRadius:
                    "10px",
                }}
              >
                No published quizzes
                available.
              </div>
            ) : (
              <div
                style={{
                  padding:
                    "4px 0",
                  fontSize:
                    "12px",
                  color:
                    "#64748b",
                  lineHeight:
                    "1.5",
                }}
              >

                <strong>
                  {
                    completedQuizCount
                  }
                </strong>

                {" / "}

                <strong>
                  {
                    quizzes.length
                  }
                </strong>

                {" quizzes passed."}

              </div>
            )}

            {quizError && (
              <p
                style={{
                  fontSize:
                    "12px",
                  color:
                    "#dc2626",
                  margin:
                    "10px 4px 0",
                }}
              >
                {quizError}
              </p>
            )}

          </div>

        </aside>

        {/* ==================================================
            CONTENT
        ================================================== */}
        <main className="learning-content">

          {selectedLesson ? (
            <>

              {/* ==========================================
                  VIDEO
              ========================================== */}
              <div className="learning-video">
  {youtubeEmbedUrl ? (
    <iframe
      src={youtubeEmbedUrl}
      title={
        selectedLesson.title ||
        "Lesson Video"
      }
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  ) : googleDriveEmbedUrl ? (
    <iframe
      src={googleDriveEmbedUrl}
      title={
        selectedLesson.title ||
        "Google Drive Lesson Video"
      }
      frameBorder="0"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  ) : videoUrl ? (
    <video
      controls
      src={videoUrl}
      preload="metadata"
      playsInline
    >
      Your browser does not support the video player.
    </video>
  ) : (
    <div className="learning-video-placeholder">
      <div className="video-play-icon">
        <PlayCircle size={42} />
      </div>

      <h2>
        {selectedLesson.title ||
          "Lesson Video"}
      </h2>

      <p>
        Learning video is not available for
        this lesson yet.
      </p>
    </div>
  )}
</div>
              {/* ==========================================
                  LESSON DETAILS
              ========================================== */}
              <div className="lesson-details">

                <div className="lesson-details-top">

                  <div>

                    <p className="lesson-label">

                      LESSON{" "}
                      {currentLessonIndex +
                        1}

                    </p>

                    <h2>
                      {selectedLesson.title ||
                        "Lesson"}
                    </h2>

                  </div>

                  <div className="lesson-duration">

                    <Clock3
                      size={15}
                    />

                    {selectedLesson.duration ||
                      selectedLesson.time ||
                      "Self paced"}

                  </div>

                </div>

                <p className="lesson-description">

                  {selectedLesson.description ||
                    selectedLesson.content ||
                    `Continue learning ${course.title} through this lesson.`}

                </p>

                {/* ========================================
                    LEARNING MATERIAL
                ======================================== */}
                {materialUrl && (
                  <a
                    href={
                      materialUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lesson-material-btn"
                  >

                    <FileText
                      size={17}
                    />

                    Open Learning Material

                  </a>
                )}

                {/* ========================================
                    LESSON ACTIONS
                ======================================== */}
                <div className="lesson-actions">

                  {isLessonCompleted(
                    getLessonId(
                      selectedLesson
                    )
                  ) ? (

                    <button
                      type="button"
                      className="lesson-completed-btn"
                      disabled
                    >

                      <CheckCircle2
                        size={17}
                      />

                      Lesson Completed

                    </button>

                  ) : (

                    <button
                      type="button"
                      className="lesson-complete-btn"
                      onClick={
                        handleLessonComplete
                      }
                    >

                      <CheckCircle2
                        size={17}
                      />

                      Mark as Complete

                    </button>

                  )}

                  <button
                    type="button"
                    className="lesson-previous-btn"
                    onClick={
                      handlePreviousLesson
                    }
                    disabled={
                      currentLessonIndex <=
                      0
                    }
                  >

                    <ArrowLeft
                      size={17}
                    />

                    Previous

                  </button>

                  <button
                    type="button"
                    className="lesson-next-btn"
                    onClick={
                      handleNextLesson
                    }
                    disabled={
                      currentLessonIndex <
                        0 ||
                      currentLessonIndex >=
                        lessons.length -
                          1
                    }
                  >

                    Next Lesson

                    <ChevronRight
                      size={17}
                    />

                  </button>

                </div>

              </div>

              {/* ==================================================
                  COURSE COMPLETION / CERTIFICATE
              ================================================== */}
              {allLessonsCompleted && (
                <div className="course-complete-card">

                  <div className="course-complete-icon">

                    <CheckCircle2
                      size={25}
                    />

                  </div>

                  <div>

                    <h3>

                      {certificateEligible
                        ? "Course Completed!"
                        : "Lessons Completed!"}

                    </h3>

                    {certificateEligible ? (
                      <p>
                        Congratulations!
                        You have completed
                        all lessons and
                        passed all quizzes
                        of this course.
                        Your certificate is
                        ready.
                      </p>
                    ) : (
                      <p>
                        You have completed
                        all lessons.
                        Complete and pass
                        all quizzes to
                        unlock your
                        certificate.
                        {" "}
                        {
                          completedQuizCount
                        }
                        {" / "}
                        {
                          quizzes.length
                        }
                        {" quizzes passed."}
                      </p>
                    )}

                  </div>

                  {certificateEligible && (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/certificates"
                        )
                      }
                    >
                      View Certificate
                    </button>
                  )}

                </div>
              )}

            </>
          ) : (
            <div className="no-lesson-selected">

              <BookOpen
                size={38}
              />

              <h2>
                No lesson selected
              </h2>

              <p>
                Select a lesson or quiz
                from the course content.
              </p>

            </div>
          )}

        </main>

      </div>

    </div>
  );
};

export default CourseLearning;
