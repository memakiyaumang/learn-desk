// src/components/FacultyQuizManagement.js

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  ChartNoAxesCombined,
  ClipboardCheck,
  Bell,
  UserRound,
  LogOut,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  CheckCircle,
  Clock,
  FileQuestion,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../css/FacultyQuizManagement.css";
import "../css/FacultyDashboard.css";

const API_URL = "https://project-final-backend-oeh1.onrender.com";

const FacultyQuizManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* =========================================================
     FACULTY SESSION
  ========================================================= */

  const getFacultySession = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("facultySession") || "null"
      );
    } catch (error) {
      return null;
    }
  };

  const faculty = getFacultySession();

  /* =========================================================
     FACULTY TOKEN
     TOKEN WILL ALWAYS COME FROM LOCAL STORAGE
  ========================================================= */

  const getFacultyToken = () => {
    return localStorage.getItem("facultyToken");
  };

  /* =========================================================
     FACULTY AUTH HEADERS
  ========================================================= */

  const getFacultyAuthHeaders = () => {
    const token = getFacultyToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /* =========================================================
     UNAUTHORIZED HANDLER
  ========================================================= */

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

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const isActive = (path) => {
    return location.pathname === path;
  };

  const goToDashboard = () => {
    navigate("/faculty");
  };

  const goToCourses = () => {
    navigate("/faculty/courses");
  };

  const goToStudents = () => {
    navigate("/faculty/students");
  };

  const goToProgress = () => {
    navigate("/faculty/progress");
  };

  const goToQuiz = () => {
    navigate("/faculty/quiz", {
      state: {
        fromMyCourses: false,
      },
    });
  };

  const goToNotifications = () => {
    navigate("/faculty/notifications");
  };

  const goToProfile = () => {
    navigate("/faculty/profile");
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

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

  /* =========================================================
     COURSE STATE
  ========================================================= */

  const courseFromState =
    location.state?.course || null;

  const fromMyCourses =
    location.state?.fromMyCourses || false;

  const [
    selectedCourse,
    setSelectedCourse,
  ] = useState(courseFromState);

  const [
    assignedCourses,
    setAssignedCourses,
  ] = useState([]);

  /* =========================================================
     QUIZ STATE
  ========================================================= */

  const [
    quizzes,
    setQuizzes,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    showQuizModal,
    setShowQuizModal,
  ] = useState(false);

  const [
    editingQuiz,
    setEditingQuiz,
  ] = useState(null);

  const [
    showQuestionModal,
    setShowQuestionModal,
  ] = useState(false);

  const [
    selectedQuiz,
    setSelectedQuiz,
  ] = useState(null);

  const [
    editingQuestion,
    setEditingQuestion,
  ] = useState(null);

  /* =========================================================
     QUIZ FORM
  ========================================================= */

  const emptyQuizForm = {
    title: "",
    description: "",
    status: "draft",
    duration: "",
    passingScore: "",
  };

  const [
    quizForm,
    setQuizForm,
  ] = useState(emptyQuizForm);

  const [quizErrors, setQuizErrors] = useState({});

  /* =========================================================
     QUESTION FORM
  ========================================================= */

  const emptyQuestionForm = {
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  };

  const [
    questionForm,
    setQuestionForm,
  ] = useState(emptyQuestionForm);

  const [questionErrors, setQuestionErrors] = useState({});

  /* =========================================================
     FACULTY DETAILS
  ========================================================= */

  const facultyId =
    faculty?.id ||
    faculty?._id ||
    faculty?.facultyId ||
    faculty?.userId ||
    "";

  const facultyEmail =
    (
      faculty?.email ||
      faculty?.facultyEmail ||
      ""
    )
      .toString()
      .toLowerCase()
      .trim();

  const facultyName =
    (
      faculty?.name ||
      faculty?.fullName ||
      faculty?.username ||
      faculty?.userName ||
      ""
    )
      .toString()
      .trim();

  /* =========================================================
     LOAD COURSES FROM MONGODB
  ========================================================= */

  const loadCourses = async () => {
    try {
      const token = getFacultyToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      const response =
        await fetch(
          `${API_URL}/api/get-courses`,
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

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Failed to load courses"
        );
      }

      const courses =
        Array.isArray(result.data)
          ? result.data
          : [];

      /* =============================================
         FILTER COURSES FOR LOGGED-IN FACULTY
      ============================================= */

      const filteredCourses =
        courses.filter(
          (course) => {
            const courseFacultyId =
              course?.facultyId ||
              "";

            const courseFacultyEmail =
              (
                course?.facultyEmail ||
                ""
              )
                .toString()
                .toLowerCase()
                .trim();

            const courseFacultyName =
              (
                course?.faculty ||
                course?.facultyName ||
                ""
              )
                .toString()
                .toLowerCase()
                .trim();

            /* =====================================
               MATCH FACULTY ID
            ===================================== */

            if (
              facultyId &&
              courseFacultyId &&
              String(
                courseFacultyId
              ) ===
                String(
                  facultyId
                )
            ) {
              return true;
            }

            /* =====================================
               MATCH FACULTY EMAIL
            ===================================== */

            if (
              facultyEmail &&
              courseFacultyEmail &&
              courseFacultyEmail ===
                facultyEmail
            ) {
              return true;
            }

            /* =====================================
               MATCH FACULTY NAME
            ===================================== */

            if (
              facultyName &&
              courseFacultyName &&
              courseFacultyName ===
                facultyName.toLowerCase()
            ) {
              return true;
            }

            return false;
          }
        );

      setAssignedCourses(
        filteredCourses
      );

      /* =============================================
         MATCH COURSE FROM ROUTER STATE
      ============================================= */

      if (courseFromState) {
        const courseFromStateId =
          courseFromState?._id ||
          courseFromState?.id ||
          courseFromState?.courseId ||
          "";

        const matchedCourse =
          filteredCourses.find(
            (course) => {
              const currentCourseId =
                course?._id ||
                course?.id ||
                course?.courseId ||
                "";

              return (
                String(
                  currentCourseId
                ) ===
                String(
                  courseFromStateId
                )
              );
            }
          );

        if (matchedCourse) {
          setSelectedCourse(
            matchedCourse
          );
        } else {
          setSelectedCourse(null);
        }
      } else {
        /* =========================================
           AUTO SELECT IF ONLY ONE COURSE
        ========================================= */

        if (
          filteredCourses.length === 1
        ) {
          setSelectedCourse(
            filteredCourses[0]
          );
        }
      }
    } catch (error) {
      console.error(
        "Load courses error:",
        error
      );

      setAssignedCourses([]);
      setSelectedCourse(null);
    }
  };

  /* =========================================================
     LOAD QUIZZES FROM MONGODB
  ========================================================= */

  const loadQuizzes = async () => {
    try {
      const token = getFacultyToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      if (!facultyId) {
        setQuizzes([]);
        return;
      }

      const response =
        await fetch(
          `${API_URL}/quizzes/faculty/${facultyId}`,
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

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Failed to load quizzes"
        );
      }

      setQuizzes(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Load quizzes error:",
        error
      );

      setQuizzes([]);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadCourses();
    loadQuizzes();

    const handleCoursesUpdated = () => {
      loadCourses();
    };

    const handleFacultyUpdated = () => {
      loadCourses();
    };

    const handleQuizUpdated = () => {
      loadQuizzes();
    };

    window.addEventListener(
      "coursesUpdated",
      handleCoursesUpdated
    );

    window.addEventListener(
      "facultyUpdated",
      handleFacultyUpdated
    );

    window.addEventListener(
      "facultyQuizUpdated",
      handleQuizUpdated
    );

    return () => {
      window.removeEventListener(
        "coursesUpdated",
        handleCoursesUpdated
      );

      window.removeEventListener(
        "facultyUpdated",
        handleFacultyUpdated
      );

      window.removeEventListener(
        "facultyQuizUpdated",
        handleQuizUpdated
      );
    };
  }, []);

  /* =========================================================
     SELECT COURSE
  ========================================================= */

  const handleCourseSelect = (
    course
  ) => {
    setSelectedCourse(course);
    setSearchTerm("");
    setStatusFilter("all");
  };

  /* =========================================================
     COURSE QUIZZES
  ========================================================= */

  const courseQuizzes = useMemo(() => {
    if (!selectedCourse) {
      return [];
    }

    const courseId =
      selectedCourse?._id ||
      selectedCourse?.id ||
      selectedCourse?.courseId ||
      "";

    const courseName =
      (
        selectedCourse?.courseName ||
        selectedCourse?.title ||
        selectedCourse?.name ||
        ""
      )
        .toString()
        .toLowerCase()
        .trim();

    return quizzes.filter(
      (quiz) => {
        const quizCourseId =
          quiz?.courseId ||
          quiz?.courseID ||
          "";

        const quizCourseName =
          (
            quiz?.courseName ||
            ""
          )
            .toString()
            .toLowerCase()
            .trim();

        const courseMatch =
          (
            courseId &&
            String(
              quizCourseId
            ) ===
              String(
                courseId
              )
          ) ||
          (
            courseName &&
            quizCourseName ===
              courseName
          );

        if (!courseMatch) {
          return false;
        }

        /* =========================================
           CHECK FACULTY
        ========================================= */

        let quizFacultyId =
          quiz?.facultyId ||
          "";

        if (
          typeof quizFacultyId ===
          "object"
        ) {
          quizFacultyId =
            quizFacultyId?._id ||
            quizFacultyId?.id ||
            "";
        }

        const quizFacultyEmail =
          (
            quiz?.facultyEmail ||
            ""
          )
            .toString()
            .toLowerCase()
            .trim();

        const quizFacultyName =
          (
            quiz?.facultyName ||
            quiz?.faculty ||
            ""
          )
            .toString()
            .toLowerCase()
            .trim();

        if (
          facultyId &&
          quizFacultyId
        ) {
          return (
            String(
              quizFacultyId
            ) ===
              String(
                facultyId
              )
          );
        }

        if (
          facultyEmail &&
          quizFacultyEmail
        ) {
          return (
            quizFacultyEmail ===
              facultyEmail
          );
        }

        if (
          facultyName &&
          quizFacultyName
        ) {
          return (
            quizFacultyName ===
              facultyName.toLowerCase()
          );
        }

        return true;
      }
    );
  }, [
    quizzes,
    selectedCourse,
    facultyId,
    facultyEmail,
    facultyName,
  ]);

  /* =========================================================
     FILTER QUIZZES
  ========================================================= */

  const filteredQuizzes =
    useMemo(() => {
      return courseQuizzes.filter(
        (quiz) => {
          const title =
            (
              quiz?.title ||
              quiz?.name ||
              ""
            )
              .toString()
              .toLowerCase();

          const description =
            (
              quiz?.description ||
              ""
            )
              .toString()
              .toLowerCase();

          const matchesSearch =
            title.includes(
              searchTerm.toLowerCase()
            ) ||
            description.includes(
              searchTerm.toLowerCase()
            );

          const quizStatus =
            (
              quiz?.status ||
              "draft"
            )
              .toString()
              .toLowerCase();

          const matchesStatus =
            statusFilter === "all" ||
            quizStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      courseQuizzes,
      searchTerm,
      statusFilter,
    ]);

  /* =========================================================
     STATS
  ========================================================= */

  const totalQuizzes =
    courseQuizzes.length;

  const publishedQuizzes =
    courseQuizzes.filter(
      (quiz) =>
        (
          quiz?.status ||
          ""
        ).toLowerCase() ===
        "published"
    ).length;

  const draftQuizzes =
    courseQuizzes.filter(
      (quiz) =>
        (
          quiz?.status ||
          ""
        ).toLowerCase() ===
        "draft"
    ).length;

  const totalQuestions =
    courseQuizzes.reduce(
      (total, quiz) => {
        return (
          total +
          (
            Array.isArray(
              quiz?.questions
            )
              ? quiz.questions.length
              : 0
          )
        );
      },
      0
    );

  /* =========================================================
     OPEN ADD QUIZ
  ========================================================= */

  const openAddQuiz = () => {
    setQuizErrors({});
    setEditingQuiz(null);

    setQuizForm({
      ...emptyQuizForm,
    });

    setShowQuizModal(true);
  };

  /* =========================================================
     OPEN EDIT QUIZ
  ========================================================= */

  const openEditQuiz = (
    quiz
  ) => {
    setQuizErrors({});
    setEditingQuiz(quiz);

    setQuizForm({
      title:
        quiz?.title ||
        "",

      description:
        quiz?.description ||
        "",

      status:
        quiz?.status ||
        "draft",

      duration:
        quiz?.duration ||
        "",

      passingScore:
        quiz?.passingScore ??
        "",
    });

    setShowQuizModal(true);
  };

  /* =========================================================
     QUIZ FORM CHANGE
  ========================================================= */

  const handleQuizFormChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setQuizForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

    setQuizErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================================
     SAVE QUIZ
  ========================================================= */

  const handleQuizSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!selectedCourse) {
      alert(
        "Please select a course."
      );
      return;
    }

    const errors = {};

    if (!quizForm.title.trim()) {
      errors.title = "Please enter quiz title.";
    }

    if (!quizForm.duration || Number(quizForm.duration) < 1) {
      errors.duration = "Please enter a duration of at least 1 minute.";
    }

    if (
      quizForm.passingScore === "" ||
      Number(quizForm.passingScore) < 0 ||
      Number(quizForm.passingScore) > 100
    ) {
      errors.passingScore = "Passing score must be between 0 and 100.";
    }

    setQuizErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!facultyId) {
      alert(
        "Faculty session not found. Please login again."
      );
      return;
    }

    const facultyToken =
      getFacultyToken();

    if (!facultyToken) {
      handleUnauthorized();
      return;
    }

    /* =============================================
       ACTUAL MONGODB COURSE ID
    ============================================= */

    const courseId =
      selectedCourse?._id ||
      selectedCourse?.id ||
      selectedCourse?.courseId ||
      "";

    const courseName =
      selectedCourse?.title ||
      selectedCourse?.courseName ||
      selectedCourse?.name ||
      "";

    if (!courseId) {
      alert(
        "Course ID not found."
      );
      return;
    }

    try {
      /* =============================================
         EDIT QUIZ
      ============================================= */

      if (editingQuiz) {
        const quizId =
          editingQuiz?._id ||
          editingQuiz?.id;

        if (!quizId) {
          alert(
            "Quiz ID not found."
          );
          return;
        }

        const response =
          await fetch(
            `${API_URL}/quizzes/${quizId}`,
            {
              method: "PUT",

              headers:
                getFacultyAuthHeaders(),

              body: JSON.stringify({
                title:
                  quizForm.title.trim(),

                description:
                  quizForm.description.trim(),

                status:
                  quizForm.status,

                duration:
                  Number(
                    quizForm.duration
                  ),

                passingScore:
                  Number(
                    quizForm.passingScore
                  ),

                courseId:
                  String(
                    courseId
                  ),

                courseName:
                  courseName,

                facultyId:
                  facultyId,

                facultyEmail:
                  facultyEmail,

                facultyName:
                  facultyName,

                questions:
                  editingQuiz.questions ||
                  [],
              }),
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
          throw new Error(
            result.message ||
            "Failed to update quiz"
          );
        }

        setQuizzes(
          (prev) =>
            prev.map(
              (quiz) =>
                String(
                  quiz?._id ||
                  quiz?.id
                ) ===
                String(
                  quizId
                )
                  ? result.data
                  : quiz
            )
        );

        window.dispatchEvent(
          new Event(
            "facultyQuizUpdated"
          )
        );
      } else {
        /* =============================================
           CREATE QUIZ
        ============================================= */

        const response =
          await fetch(
            `${API_URL}/quizzes`,
            {
              method: "POST",

              headers:
                getFacultyAuthHeaders(),

              body: JSON.stringify({
                title:
                  quizForm.title.trim(),

                description:
                  quizForm.description.trim(),

                status:
                  quizForm.status,

                duration:
                  Number(
                    quizForm.duration
                  ),

                passingScore:
                  Number(
                    quizForm.passingScore
                  ),

                courseId:
                  String(
                    courseId
                  ),

                courseName:
                  courseName,

                facultyId:
                  facultyId,

                facultyEmail:
                  facultyEmail,

                facultyName:
                  facultyName,

                questions: [],
              }),
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
          throw new Error(
            result.message ||
            "Failed to create quiz"
          );
        }

        setQuizzes(
          (prev) => [
            result.data,
            ...prev,
          ]
        );

        window.dispatchEvent(
          new Event(
            "facultyQuizUpdated"
          )
        );
      }

      setShowQuizModal(false);

      setEditingQuiz(null);
      setQuizErrors({});

      setQuizForm({
        ...emptyQuizForm,
      });
    } catch (error) {
      console.error(
        "Save quiz error:",
        error
      );

      alert(
        error.message ||
        "Something went wrong while saving quiz."
      );
    }
  };

  /* =========================================================
     DELETE QUIZ
  ========================================================= */

  const handleDeleteQuiz = async (
    quiz
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${quiz?.title}"?`
      );

    if (!confirmed) {
      return;
    }

    const quizId =
      quiz?._id ||
      quiz?.id;

    if (!quizId) {
      alert(
        "Quiz ID not found."
      );
      return;
    }

    if (!getFacultyToken()) {
      handleUnauthorized();
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/quizzes/${quizId}`,
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
        throw new Error(
          result.message ||
          "Failed to delete quiz"
        );
      }

      setQuizzes(
        (prev) =>
          prev.filter(
            (item) =>
              String(
                item?._id ||
                item?.id
              ) !==
              String(
                quizId
              )
          )
      );

      if (
        selectedQuiz &&
        String(
          selectedQuiz?._id ||
          selectedQuiz?.id
        ) ===
        String(
          quizId
        )
      ) {
        closeQuestionManager();
      }

      window.dispatchEvent(
        new Event(
          "facultyQuizUpdated"
        )
      );
    } catch (error) {
      console.error(
        "Delete quiz error:",
        error
      );

      alert(
        error.message ||
        "Something went wrong while deleting quiz."
      );
    }
  };

  /* =========================================================
     OPEN QUESTIONS
  ========================================================= */

  const openQuestionManager = (
    quiz
  ) => {
    setQuestionErrors({});
    setSelectedQuiz(quiz);

    setEditingQuestion(null);

    setQuestionForm({
      ...emptyQuestionForm,
    });

    setShowQuestionModal(true);
  };

  /* =========================================================
     CLOSE QUESTION MANAGER
  ========================================================= */

  const closeQuestionManager = () => {
    setQuestionErrors({});
    setShowQuestionModal(false);

    setSelectedQuiz(null);

    setEditingQuestion(null);

    setQuestionForm({
      ...emptyQuestionForm,
    });
  };

  /* =========================================================
     QUESTION FORM CHANGE
  ========================================================= */

  const handleQuestionChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setQuestionForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

    setQuestionErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================================
     EDIT QUESTION
  ========================================================= */

  const editQuestion = (
    question
  ) => {
    setQuestionErrors({});
    setEditingQuestion(
      question
    );

    setQuestionForm({
      question:
        question?.question ||
        "",

      optionA:
        question?.options?.A ||
        "",

      optionB:
        question?.options?.B ||
        "",

      optionC:
        question?.options?.C ||
        "",

      optionD:
        question?.options?.D ||
        "",

      correctAnswer:
        question?.correctAnswer ||
        "A",
    });
  };

  /* =========================================================
     SAVE QUESTION
  ========================================================= */

  const handleQuestionSubmit =
    async (e) => {
      e.preventDefault();

      if (!selectedQuiz) {
        return;
      }

      const errors = {};

      if (!questionForm.question.trim()) {
        errors.question = "Please enter a question.";
      }

      if (!questionForm.optionA.trim()) {
        errors.optionA = "Please enter option A.";
      }
      if (!questionForm.optionB.trim()) {
        errors.optionB = "Please enter option B.";
      }
      if (!questionForm.optionC.trim()) {
        errors.optionC = "Please enter option C.";
      }
      if (!questionForm.optionD.trim()) {
        errors.optionD = "Please enter option D.";
      }

      setQuestionErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      const quizId =
        selectedQuiz?._id ||
        selectedQuiz?.id;

      if (!quizId) {
        alert(
          "Quiz ID not found."
        );
        return;
      }

      if (!getFacultyToken()) {
        handleUnauthorized();
        return;
      }

      try {
        /* =============================================
           EDIT QUESTION
        ============================================= */

        if (editingQuestion) {
          const questionId =
            editingQuestion?._id ||
            editingQuestion?.id;

          if (!questionId) {
            alert(
              "Question ID not found."
            );
            return;
          }

          const response =
            await fetch(
              `${API_URL}/quizzes/${quizId}/questions/${questionId}`,
              {
                method: "PUT",

                headers:
                  getFacultyAuthHeaders(),

                body: JSON.stringify({
                  question:
                    questionForm.question.trim(),

                  options: {
                    A:
                      questionForm.optionA.trim(),

                    B:
                      questionForm.optionB.trim(),

                    C:
                      questionForm.optionC.trim(),

                    D:
                      questionForm.optionD.trim(),
                  },

                  correctAnswer:
                    questionForm.correctAnswer,
                }),
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
            throw new Error(
              result.message ||
              "Failed to update question"
            );
          }

          setQuizzes(
            (prev) =>
              prev.map(
                (quiz) =>
                  String(
                    quiz?._id ||
                    quiz?.id
                  ) ===
                  String(
                    quizId
                  )
                    ? result.data
                    : quiz
              )
          );

          setSelectedQuiz(
            result.data
          );
        } else {
          /* =============================================
             ADD QUESTION
          ============================================= */

          const response =
            await fetch(
              `${API_URL}/quizzes/${quizId}/questions`,
              {
                method: "POST",

                headers:
                  getFacultyAuthHeaders(),

                body: JSON.stringify({
                  question:
                    questionForm.question.trim(),

                  options: {
                    A:
                      questionForm.optionA.trim(),

                    B:
                      questionForm.optionB.trim(),

                    C:
                      questionForm.optionC.trim(),

                    D:
                      questionForm.optionD.trim(),
                  },

                  correctAnswer:
                    questionForm.correctAnswer,
                }),
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
            throw new Error(
              result.message ||
              "Failed to add question"
            );
          }

          setQuizzes(
            (prev) =>
              prev.map(
                (quiz) =>
                  String(
                    quiz?._id ||
                    quiz?.id
                  ) ===
                  String(
                    quizId
                  )
                    ? result.data
                    : quiz
              )
          );

          setSelectedQuiz(
            result.data
          );
        }

        window.dispatchEvent(
          new Event(
            "facultyQuizUpdated"
          )
        );

        setEditingQuestion(null);
        setQuestionErrors({});

        setQuestionForm({
          ...emptyQuestionForm,
        });
      } catch (error) {
        console.error(
          "Save question error:",
          error
        );

        alert(
          error.message ||
          "Something went wrong while saving question."
        );
      }
    };

  /* =========================================================
     DELETE QUESTION
  ========================================================= */

  const deleteQuestion = async (
    question
  ) => {
    if (!selectedQuiz) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this question?"
      );

    if (!confirmed) {
      return;
    }

    const quizId =
      selectedQuiz?._id ||
      selectedQuiz?.id;

    const questionId =
      question?._id ||
      question?.id;

    if (
      !quizId ||
      !questionId
    ) {
      alert(
        "Quiz or question ID not found."
      );
      return;
    }

    if (!getFacultyToken()) {
      handleUnauthorized();
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/quizzes/${quizId}/questions/${questionId}`,
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
        throw new Error(
          result.message ||
          "Failed to delete question"
        );
      }

      setQuizzes(
        (prev) =>
          prev.map(
            (quiz) =>
              String(
                quiz?._id ||
                quiz?.id
              ) ===
              String(
                quizId
              )
                ? result.data
                : quiz
          )
      );

      setSelectedQuiz(
        result.data
      );

      setEditingQuestion(null);

      setQuestionForm({
        ...emptyQuestionForm,
      });

      window.dispatchEvent(
        new Event(
          "facultyQuizUpdated"
        )
      );
    } catch (error) {
      console.error(
        "Delete question error:",
        error
      );

      alert(
        error.message ||
        "Something went wrong while deleting question."
      );
    }
  };

  /* =========================================================
     IF NO COURSE SELECTED
  ========================================================= */

  if (!selectedCourse) {
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
              className={`faculty-nav-item ${
                isActive("/faculty")
                  ? "active"
                  : ""
              }`}
              onClick={
                goToDashboard
              }
            >
              <LayoutDashboard
                size={18}
              />

              <span>
                Dashboard
              </span>
            </div>

            <div
              className={`faculty-nav-item ${
                isActive(
                  "/faculty/courses"
                )
                  ? "active"
                  : ""
              }`}
              onClick={
                goToCourses
              }
            >
              <BookOpen
                size={18}
              />

              <span>
                My Courses
              </span>
            </div>

            <div
              className={`faculty-nav-item ${
                isActive(
                  "/faculty/students"
                )
                  ? "active"
                  : ""
              }`}
              onClick={
                goToStudents
              }
            >
              <Users
                size={18}
              />

              <span>
                Students
              </span>
            </div>

            <div
              className={`faculty-nav-item ${
                isActive(
                  "/faculty/progress"
                )
                  ? "active"
                  : ""
              }`}
              onClick={
                goToProgress
              }
            >
              <ChartNoAxesCombined
                size={18}
              />

              <span>
                Student Progress
              </span>
            </div>

            <div
              className={`faculty-nav-item ${
                isActive(
                  "/faculty/quiz"
                )
                  ? "active"
                  : ""
              }`}
              onClick={
                goToQuiz
              }
            >
              <ClipboardCheck
                size={18}
              />

              <span>
                Quiz Management
              </span>
            </div>

            <div
              className={`faculty-nav-item ${
                isActive(
                  "/faculty/profile"
                )
                  ? "active"
                  : ""
              }`}
              onClick={
                goToProfile
              }
            >
              <UserRound
                size={18}
              />

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
            <LogOut
              size={18}
            />

            <span>
              Logout
            </span>
          </div>

        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <main className="faculty-main">

          <div className="faculty-content">

            <div className="faculty-empty-state">

              <FileQuestion
                size={52}
              />

              <h2>
                Select a Course
              </h2>

              <p>
                Select one of your assigned courses
                to manage quizzes.
              </p>

              {assignedCourses.length === 0 ? (
                <p>
                  No courses are currently
                  assigned to you.
                </p>
              ) : (
                <div
                  className="quiz-grid"
                  style={{
                    width: "100%",
                    maxWidth: "1000px",
                    marginTop: "20px",
                  }}
                >
                  {assignedCourses.map(
                    (course) => {
                      const courseId =
                        course?._id ||
                        course?.id ||
                        course?.courseId;

                      return (
                        <div
                          className="quiz-card"
                          key={
                            courseId
                          }
                        >
                          <div className="quiz-card-top">

                            <div className="quiz-card-icon">

                              <BookOpen
                                size={20}
                              />

                            </div>

                          </div>

                          <h2>
                            {
                              course.title ||
                              course.courseName ||
                              course.name ||
                              "Untitled Course"
                            }
                          </h2>

                          <p className="quiz-description">
                            {
                              course.description ||
                              "Manage quizzes and questions for this course."
                            }
                          </p>

                          <button
                            type="button"
                            className="quiz-action view"
                            onClick={() =>
                              handleCourseSelect(
                                course
                              )
                            }
                          >
                            <Eye
                              size={15}
                            />

                            Manage Quizzes
                          </button>

                        </div>
                      );
                    }
                  )}
                </div>
              )}

            </div>

          </div>

        </main>

      </div>
    );
  }

  /* =========================================================
     MAIN QUIZ PAGE
  ========================================================= */

  return (
    <div className="faculty-dashboard">

      {/* =======================================================
          SIDEBAR
      ======================================================= */}

      <aside className="faculty-sidebar">

        <div className="faculty-logo">

          <span className="faculty-brand-mark"></span>

          <span className="faculty-brand-text">
            LearnDesk
          </span>

        </div>

        <nav className="faculty-nav">

          <div
            className={`faculty-nav-item ${
              isActive("/faculty")
                ? "active"
                : ""
            }`}
            onClick={
              goToDashboard
            }
          >
            <LayoutDashboard
              size={18}
            />

            <span>
              Dashboard
            </span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive(
                "/faculty/courses"
              )
                ? "active"
                : ""
            }`}
            onClick={
              goToCourses
            }
          >
            <BookOpen
              size={18}
            />

            <span>
              My Courses
            </span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive(
                "/faculty/students"
              )
                ? "active"
                : ""
            }`}
            onClick={
              goToStudents
            }
          >
            <Users
              size={18}
            />

            <span>
              Students
            </span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive(
                "/faculty/progress"
              )
                ? "active"
                : ""
            }`}
            onClick={
              goToProgress
            }
          >
            <ChartNoAxesCombined
              size={18}
            />

            <span>
              Student Progress
            </span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive(
                "/faculty/quiz"
              )
                ? "active"
                : ""
            }`}
            onClick={
              goToQuiz
            }
          >
            <ClipboardCheck
              size={18}
            />

            <span>
              Quiz Management
            </span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive(
                "/faculty/profile"
              )
                ? "active"
                : ""
            }`}
            onClick={
              goToProfile
            }
          >
            <UserRound
              size={18}
            />

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
          <LogOut
            size={18}
          />

          <span>
            Logout
          </span>
        </div>

      </aside>

      {/* =======================================================
          MAIN
      ======================================================= */}

      <main className="faculty-main">

        <div className="faculty-content">

          {/* ===================================================
              PAGE HEADER
          =================================================== */}

          <div className="quiz-page-header">

            <div>

              <p className="quiz-page-label">
                QUIZ MANAGEMENT
              </p>

              <h1>
                {
                  selectedCourse.title ||
                  selectedCourse.courseName ||
                  selectedCourse.name ||
                  "Course Quiz"
                }
              </h1>

              <p>
                Create and manage quizzes,
                questions and assessments.
              </p>

            </div>

            <button
              type="button"
              className="quiz-add-btn"
              onClick={
                openAddQuiz
              }
            >
              <Plus
                size={17}
              />

              Add Quiz
            </button>

          </div>

          {/* ===================================================
              COURSE SELECTOR
          =================================================== */}

          {!fromMyCourses &&
            assignedCourses.length > 1 && (
              <div
                className="quiz-toolbar"
                style={{
                  marginBottom: "20px",
                }}
              >

                <div>

                  <strong>
                    Current Course
                  </strong>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#77727f",
                      fontSize: "12px",
                    }}
                  >
                    Select another assigned
                    course if required.
                  </div>

                </div>

                <div className="quiz-filter">

                  <select
                    value={
                      selectedCourse?._id ||
                      selectedCourse?.id ||
                      selectedCourse?.courseId ||
                      ""
                    }
                    onChange={(e) => {
                      const course =
                        assignedCourses.find(
                          (item) => {
                            const itemId =
                              item?._id ||
                              item?.id ||
                              item?.courseId ||
                              "";

                            return (
                              String(
                                itemId
                              ) ===
                              String(
                                e.target.value
                              )
                            );
                          }
                        );

                      if (course) {
                        handleCourseSelect(
                          course
                        );
                      }
                    }}
                  >

                    {assignedCourses.map(
                      (course) => {
                        const courseId =
                          course?._id ||
                          course?.id ||
                          course?.courseId;

                        return (
                          <option
                            key={
                              courseId
                            }
                            value={
                              courseId
                            }
                          >
                            {
                              course.title ||
                              course.courseName ||
                              course.name
                            }
                          </option>
                        );
                      }
                    )}

                  </select>

                </div>

              </div>
            )}

          {/* ===================================================
              STATS
          =================================================== */}

          <div className="quiz-stats-grid">

            <div className="quiz-stat-card">

              <div className="quiz-stat-icon">

                <FileQuestion
                  size={21}
                />

              </div>

              <div>

                <span>
                  Total Quizzes
                </span>

                <strong>
                  {totalQuizzes}
                </strong>

              </div>

            </div>

            <div className="quiz-stat-card">

              <div className="quiz-stat-icon published">

                <CheckCircle
                  size={21}
                />

              </div>

              <div>

                <span>
                  Published
                </span>

                <strong>
                  {publishedQuizzes}
                </strong>

              </div>

            </div>

            <div className="quiz-stat-card">

              <div className="quiz-stat-icon draft">

                <Clock
                  size={21}
                />

              </div>

              <div>

                <span>
                  Draft
                </span>

                <strong>
                  {draftQuizzes}
                </strong>

              </div>

            </div>

            <div className="quiz-stat-card">

              <div className="quiz-stat-icon questions">

                <FileQuestion
                  size={21}
                />

              </div>

              <div>

                <span>
                  Total Questions
                </span>

                <strong>
                  {totalQuestions}
                </strong>

              </div>

            </div>

          </div>

          {/* ===================================================
              TOOLBAR
          =================================================== */}

          <div className="quiz-toolbar">

            <div className="quiz-search">

              <Search
                size={17}
              />

              <input
                type="text"
                placeholder="Search quizzes..."
                value={
                  searchTerm
                }
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="quiz-filter">

              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >

                <option value="all">
                  All Status
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>

              </select>

            </div>

          </div>

          {/* ===================================================
              QUIZ LIST
          =================================================== */}

          {filteredQuizzes.length === 0 ? (
            <div className="quiz-empty-state">

              <div className="quiz-empty-icon">

                <FileQuestion
                  size={30}
                />

              </div>

              <h2>
                No Quizzes Found
              </h2>

              <p>
                Create your first quiz for
                this course.
              </p>

              <button
                type="button"
                onClick={
                  openAddQuiz
                }
              >
                <Plus
                  size={16}
                />

                Create Quiz
              </button>

            </div>
          ) : (
            <div className="quiz-grid">

              {filteredQuizzes.map(
                (quiz) => {
                  const questions =
                    Array.isArray(
                      quiz.questions
                    )
                      ? quiz.questions
                      : [];

                  const quizId =
                    quiz?._id ||
                    quiz?.id;

                  return (
                    <div
                      className="quiz-card"
                      key={
                        quizId
                      }
                    >

                      <div className="quiz-card-top">

                        <div className="quiz-card-icon">

                          <ClipboardCheck
                            size={20}
                          />

                        </div>

                        <span
                          className={`quiz-status ${
                            (
                              quiz.status ||
                              "draft"
                            ).toLowerCase()
                          }`}
                        >
                          {
                            quiz.status ||
                            "Draft"
                          }
                        </span>

                      </div>

                      <h2>
                        {
                          quiz.title ||
                          "Untitled Quiz"
                        }
                      </h2>

                      <p className="quiz-description">
                        {
                          quiz.description ||
                          "No quiz description available."
                        }
                      </p>

                      <div className="quiz-meta">

                        <span>

                          <FileQuestion
                            size={13}
                          />

                          {questions.length}
                          {" "}
                          Questions

                        </span>

                        <span>

                          <Clock
                            size={13}
                          />

                          {
                            quiz.duration ||
                            "â€”"
                          }
                          {" "}
                          min

                        </span>

                      </div>

                      <div className="quiz-card-footer">

                        Passing Score:
                        {" "}

                        <strong>
                          {
                            quiz.passingScore ??
                            "â€”"
                          }
                          %
                        </strong>

                      </div>

                      <div className="quiz-actions">

                        <button
                          type="button"
                          className="quiz-action view"
                          onClick={() =>
                            openQuestionManager(
                              quiz
                            )
                          }
                        >
                          <Eye
                            size={14}
                          />

                          Questions
                        </button>

                        <button
                          type="button"
                          className="quiz-action edit"
                          onClick={() =>
                            openEditQuiz(
                              quiz
                            )
                          }
                        >
                          <Pencil
                            size={14}
                          />

                          Edit
                        </button>

                        <button
                          type="button"
                          className="quiz-action delete"
                          aria-label="Delete quiz"
                          onClick={() =>
                            handleDeleteQuiz(
                              quiz
                            )
                          }
                        >
                          <Trash2
                            size={14}
                          />
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </main>

      {/* =======================================================
          QUIZ MODAL
      ======================================================= */}

      {showQuizModal && (
        <div className="quiz-modal-overlay">

          <div className="quiz-modal">

            <div className="quiz-modal-header">

              <div>

                <p className="quiz-page-label">

                  {editingQuiz
                    ? "EDIT QUIZ"
                    : "CREATE QUIZ"}

                </p>

                <h2>

                  {editingQuiz
                    ? "Edit Quiz"
                    : "Create New Quiz"}

                </h2>

                <p>

                  {
                    selectedCourse.title ||
                    selectedCourse.courseName ||
                    selectedCourse.name
                  }

                </p>

              </div>

              <button
                type="button"
                className="quiz-modal-close"
                onClick={() => {
                  setShowQuizModal(false);
                  setEditingQuiz(null);
                }}
              >
                <X
                  size={18}
                />
              </button>

            </div>

            <form
              className="quiz-form"
              onSubmit={
                handleQuizSubmit
              }
            >

              <div className="quiz-form-group">

                <label>
                  Quiz Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    quizForm.title
                  }
                  onChange={
                    handleQuizFormChange
                  }
                  placeholder="Enter quiz title"
                />
                {quizErrors.title && <p style={{ color: "#dc2626", fontSize: "12px", margin: "5px 0 0" }}>{quizErrors.title}</p>}

              </div>

              <div className="quiz-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    quizForm.description
                  }
                  onChange={
                    handleQuizFormChange
                  }
                  placeholder="Enter quiz description"
                />

              </div>

              <div className="quiz-form-row">

                <div className="quiz-form-group">

                  <label>
                    Duration
                  </label>

                  <input
                    type="number"
                    name="duration"
                    min="1"
                    value={
                      quizForm.duration
                    }
                    onChange={
                      handleQuizFormChange
                    }
                    placeholder="Minutes"
                  />
                  {quizErrors.duration && <p style={{ color: "#dc2626", fontSize: "12px", margin: "5px 0 0" }}>{quizErrors.duration}</p>}

                </div>

                <div className="quiz-form-group">

                  <label>
                    Passing Score
                  </label>

                  <input
                    type="number"
                    name="passingScore"
                    min="0"
                    max="100"
                    value={
                      quizForm.passingScore
                    }
                    onChange={
                      handleQuizFormChange
                    }
                    placeholder="Percentage"
                  />
                  {quizErrors.passingScore && <p style={{ color: "#dc2626", fontSize: "12px", margin: "5px 0 0" }}>{quizErrors.passingScore}</p>}

                </div>

              </div>

              <div className="quiz-form-group">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    quizForm.status
                  }
                  onChange={
                    handleQuizFormChange
                  }
                >

                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>

                </select>

              </div>

              <div className="quiz-form-actions">

                <button
                  type="button"
                  className="quiz-cancel-btn"
                  onClick={() => {
                    setShowQuizModal(false);
                    setEditingQuiz(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="quiz-save-btn"
                >
                  {editingQuiz
                    ? "Update Quiz"
                    : "Create Quiz"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =======================================================
          QUESTION MODAL
      ======================================================= */}

      {showQuestionModal &&
        selectedQuiz && (
          <div className="quiz-modal-overlay">

            <div className="quiz-question-modal">

              <div className="quiz-modal-header">

                <div>

                  <p className="quiz-page-label">
                    QUESTIONS
                  </p>

                  <h2>
                    {
                      selectedQuiz.title
                    }
                  </h2>

                  <p>
                    Add, edit and manage
                    quiz questions.
                  </p>

                </div>

                <button
                  type="button"
                  className="quiz-modal-close"
                  onClick={
                    closeQuestionManager
                  }
                >
                  <X
                    size={18}
                  />
                </button>

              </div>

              <div className="quiz-question-layout">

                {/* =============================================
                    QUESTION FORM
                ============================================= */}

                <div className="quiz-question-form-section">

                  <h3>
                    {editingQuestion
                      ? "Edit Question"
                      : "Add Question"}
                  </h3>

                  <form
                    className="quiz-form"
                    onSubmit={
                      handleQuestionSubmit
                    }
                  >

                    <div className="quiz-form-group">

                      <label>
                        Question
                      </label>

                      <textarea
                        name="question"
                        value={
                          questionForm.question
                        }
                        onChange={
                          handleQuestionChange
                        }
                        placeholder="Enter question"
                      />
                      {questionErrors.question && <p style={{ color: "#dc2626", fontSize: "12px", margin: "5px 0 0" }}>{questionErrors.question}</p>}

                    </div>

                    <div className="quiz-option-grid">

                      <div className="quiz-form-group">

                        <label>
                          Option A
                        </label>

                        <input
                          type="text"
                          name="optionA"
                          value={
                            questionForm.optionA
                          }
                          onChange={
                            handleQuestionChange
                          }
                          placeholder="Option A"
                        />
                        {questionErrors.optionA && <p style={{ color: "#dc2626", fontSize: "12px", margin: "5px 0 0" }}>{questionErrors.optionA}</p>}

                      </div>

                      <div className="quiz-form-group">

                        <label>
                          Option B
                        </label>

                        <input
                          type="text"
                          name="optionB"
                          value={
                            questionForm.optionB
                          }
                          onChange={
                            handleQuestionChange
                          }
                          placeholder="Option B"
                        />
                        {questionErrors.optionB && <p style={{ color: "#dc2626", fontSize: "12px", margin: "5px 0 0" }}>{questionErrors.optionB}</p>}

                      </div>

                      <div className="quiz-form-group">

                        <label>
                          Option C
                        </label>

                        <input
                          type="text"
                          name="optionC"
                          value={
                            questionForm.optionC
                          }
                          onChange={
                            handleQuestionChange
                          }
                          placeholder="Option C"
                        />
                        {questionErrors.optionC && <p style={{ color: "#dc2626", fontSize: "12px", margin: "5px 0 0" }}>{questionErrors.optionC}</p>}

                      </div>

                      <div className="quiz-form-group">

                        <label>
                          Option D
                        </label>

                        <input
                          type="text"
                          name="optionD"
                          value={
                            questionForm.optionD
                          }
                          onChange={
                            handleQuestionChange
                          }
                          placeholder="Option D"
                        />
                        {questionErrors.optionD && <p style={{ color: "#dc2626", fontSize: "12px", margin: "5px 0 0" }}>{questionErrors.optionD}</p>}

                      </div>

                    </div>

                    <div className="quiz-form-group">

                      <label>
                        Correct Answer
                      </label>

                      <select
                        name="correctAnswer"
                        value={
                          questionForm.correctAnswer
                        }
                        onChange={
                          handleQuestionChange
                        }
                      >

                        <option value="A">
                          Option A
                        </option>

                        <option value="B">
                          Option B
                        </option>

                        <option value="C">
                          Option C
                        </option>

                        <option value="D">
                          Option D
                        </option>

                      </select>

                    </div>

                    <div className="quiz-form-actions">

                      {editingQuestion && (
                        <button
                          type="button"
                          className="quiz-cancel-btn"
                          onClick={() => {
                            setEditingQuestion(null);

                            setQuestionForm({
                              ...emptyQuestionForm,
                            });
                          }}
                        >
                          Cancel Edit
                        </button>
                      )}

                      <button
                        type="submit"
                        className="quiz-save-btn"
                      >
                        {editingQuestion
                          ? "Update Question"
                          : "Add Question"}
                      </button>

                    </div>

                  </form>

                </div>

                {/* =============================================
                    QUESTION LIST
                ============================================= */}

                <div className="quiz-question-list-section">

                  <div className="quiz-question-list-header">

                    <h3>

                      Questions
                      {" "}
                      (
                      {
                        Array.isArray(
                          selectedQuiz.questions
                        )
                          ? selectedQuiz.questions.length
                          : 0
                      }
                      )

                    </h3>

                  </div>

                  <div className="quiz-question-list">

                    {Array.isArray(
                      selectedQuiz.questions
                    ) &&
                    selectedQuiz.questions.length >
                      0 ? (
                      selectedQuiz.questions.map(
                        (
                          question,
                          index
                        ) => (
                          <div
                            className="quiz-question-item"
                            key={
                              question?._id ||
                              question?.id ||
                              index
                            }
                          >

                            <div className="quiz-question-number">

                              Q
                              {index + 1}

                            </div>

                            <div className="quiz-question-content">

                              <strong>
                                {
                                  question.question
                                }
                              </strong>

                              <div className="quiz-question-options">

                                <span>
                                  A.
                                  {" "}
                                  {
                                    question
                                      .options
                                      ?.A
                                  }
                                </span>

                                <span>
                                  B.
                                  {" "}
                                  {
                                    question
                                      .options
                                      ?.B
                                  }
                                </span>

                                <span>
                                  C.
                                  {" "}
                                  {
                                    question
                                      .options
                                      ?.C
                                  }
                                </span>

                                <span>
                                  D.
                                  {" "}
                                  {
                                    question
                                      .options
                                      ?.D
                                  }
                                </span>

                              </div>

                              <div className="quiz-correct-answer">

                                <CheckCircle
                                  size={13}
                                />

                                Correct Answer:
                                {" "}
                                {
                                  question.correctAnswer
                                }

                              </div>

                              <div className="quiz-question-actions">

                                <button
                                  type="button"
                                  onClick={() =>
                                    editQuestion(
                                      question
                                    )
                                  }
                                >
                                  <Pencil
                                    size={12}
                                  />

                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteQuestion(
                                      question
                                    )
                                  }
                                >
                                  <Trash2
                                    size={12}
                                  />

                                  Delete
                                </button>

                              </div>

                            </div>

                          </div>
                        )
                      )
                    ) : (
                      <div className="quiz-no-questions">

                        <FileQuestion
                          size={35}
                        />

                        <h4>
                          No Questions Yet
                        </h4>

                        <p>
                          Add questions using
                          the form on the left.
                        </p>

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default FacultyQuizManagement;