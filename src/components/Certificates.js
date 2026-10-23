import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Download,
  Eye,
  Calendar,
  CheckCircle,
} from "lucide-react";

import "../css/Certificates.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const studentSession = getLoggedInStudent();

    /*
      STUDENT AUTH FLOW:

      1. studentSession.token
      2. studentToken

      IMPORTANT:
      Do NOT use generic "token",
      facultyToken or adminToken here.
    */

    if (studentSession?.token) {
      return studentSession.token;
    }

    const studentToken =
      localStorage.getItem("studentToken");

    if (studentToken) {
      return studentToken;
    }

    return null;
  };

  const getAuthHeaders = () => {
    const token = getToken();

    if (!token) {
      return {
        "Content-Type": "application/json",
      };
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleUnauthorized = () => {
    sessionStorage.removeItem("studentSession");
    sessionStorage.removeItem("studentQuizResult");
    sessionStorage.removeItem("selectedStudentQuiz");

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

  const getCourseId = (course) => {
    if (!course) {
      return null;
    }

    /*
      IMPORTANT:
      courseId must be checked before _id.

      In some places the selected/enrollment
      object can contain enrollment _id in _id.
    */

    return (
      course.courseId ??
      course.course_id ??
      course.course?._id ??
      course.course?.id ??
      course.id ??
      course._id ??
      null
    );
  };

  /* =================================
      NORMALIZE API RESPONSE
  ================================= */

  const extractArray = (responseData) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (
      responseData &&
      Array.isArray(responseData.data)
    ) {
      return responseData.data;
    }

    if (
      responseData &&
      Array.isArray(responseData.enrollments)
    ) {
      return responseData.enrollments;
    }

    if (
      responseData &&
      Array.isArray(responseData.courses)
    ) {
      return responseData.courses;
    }

    if (
      responseData &&
      Array.isArray(responseData.lessons)
    ) {
      return responseData.lessons;
    }

    if (
      responseData &&
      Array.isArray(responseData.progress)
    ) {
      return responseData.progress;
    }

    if (
      responseData &&
      Array.isArray(responseData.quizzes)
    ) {
      return responseData.quizzes;
    }

    if (
      responseData &&
      Array.isArray(responseData.attempts)
    ) {
      return responseData.attempts;
    }

    return [];
  };

  /* =================================
      GET COURSES
  ================================= */

  const getCourses = async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/get-courses`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleUnauthorized();

      throw new Error(
        data?.message ||
          "Session expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to load courses."
      );
    }

    return extractArray(data);
  };

  /* =================================
      GET ENROLLMENTS
  ================================= */

  const getEnrollments = async (
    studentId
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/get-enrollments/${studentId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleUnauthorized();

      throw new Error(
        data?.message ||
          "Session expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to load enrollments."
      );
    }

    return extractArray(data);
  };

  /* =================================
      GET LESSONS
  ================================= */

  const getLessons = async (courseId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/get-lessons/${courseId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleUnauthorized();

      throw new Error(
        data?.message ||
          "Session expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to load course lessons."
      );
    }

    return extractArray(data);
  };

  /* =================================
      GET STUDENT PROGRESS
  ================================= */

  const getProgress = async (
    studentId,
    courseId
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/get-progress/${studentId}/${courseId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleUnauthorized();

      throw new Error(
        data?.message ||
          "Session expired. Please login again."
      );
    }

    /*
      Progress API can return:
      - array
      - { data: [] }
      - { progress: [] }
      - single progress object
    */

    if (!response.ok) {
      return [];
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (
      data &&
      Array.isArray(data.data)
    ) {
      return data.data;
    }

    if (
      data &&
      Array.isArray(data.progress)
    ) {
      return data.progress;
    }

    if (
      data &&
      typeof data === "object" &&
      (
        data.lessonId ||
        data.courseId ||
        data.completed !== undefined
      )
    ) {
      return [data];
    }

    return [];
  };

  /* =================================
      GET COURSE QUIZZES
  ================================= */

  const getCourseQuizzes = async (
    courseId
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/student/course/${courseId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleUnauthorized();

      throw new Error(
        data?.message ||
          "Session expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to load course quizzes."
      );
    }

    return extractArray(data);
  };

  /* =================================
      GET STUDENT QUIZ ATTEMPTS
  ================================= */

  const getQuizAttempts = async (
    studentId,
    courseId
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/quizzes/student/attempts/${studentId}/course/${courseId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      handleUnauthorized();

      throw new Error(
        data?.message ||
          "Session expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Unable to load quiz attempts."
      );
    }

    return extractArray(data);
  };

  /* =================================
      GET QUIZ ID
  ================================= */

  const getQuizId = (quiz) => {
    if (!quiz) {
      return null;
    }

    return (
      quiz.quizId ??
      quiz._id ??
      quiz.id ??
      null
    );
  };

  /* =================================
      GET ATTEMPT QUIZ ID
  ================================= */

  const getAttemptQuizId = (attempt) => {
    if (!attempt) {
      return null;
    }

    return (
      attempt.quizId ??
      attempt.quizID ??
      attempt.quiz_id ??
      attempt.quiz?._id ??
      attempt.quiz?.id ??
      null
    );
  };

  /* =================================
      GET LATEST ATTEMPT FOR QUIZ
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

    const quizAttempts =
      attempts.filter(
        (attempt) => {
          const attemptQuizId =
            getAttemptQuizId(
              attempt
            );

          return (
            attemptQuizId !== null &&
            String(
              attemptQuizId
            ) ===
              String(quizId)
          );
        }
      );

    if (
      quizAttempts.length === 0
    ) {
      return null;
    }

    /*
      The backend normally returns
      latest attempts first.

      We still sort by available
      date fields so that the latest
      attempt is selected safely.
    */

    const sortedAttempts = [
      ...quizAttempts,
    ].sort((a, b) => {
      const dateA =
        new Date(
          a.submittedAt ||
            a.createdAt ||
            a.updatedAt ||
            0
        ).getTime();

      const dateB =
        new Date(
          b.submittedAt ||
            b.createdAt ||
            b.updatedAt ||
            0
        ).getTime();

      return dateB - dateA;
    });

    return (
      sortedAttempts[0] ||
      null
    );
  };

  /* =================================
      CHECK QUIZ COMPLETION
  ================================= */

  const checkQuizCompletion = (
    quizzes,
    attempts
  ) => {
    /*
      If there are no published quizzes,
      there is nothing to complete.

      Therefore lesson completion alone
      can generate the certificate.
    */

    if (
      !Array.isArray(quizzes) ||
      quizzes.length === 0
    ) {
      return {
        totalQuizzes: 0,
        completedQuizzes: 0,
        allQuizzesCompleted: true,
      };
    }

    let completedQuizzes = 0;

    for (const quiz of quizzes) {
      const quizId =
        getQuizId(quiz);

      if (!quizId) {
        /*
          If quiz has no valid ID,
          do not count it as completed.
        */
        continue;
      }

      const latestAttempt =
        getLatestQuizAttempt(
          attempts,
          quizId
        );

      const isPassed =
        String(
          latestAttempt?.result ||
            ""
        ).toLowerCase() ===
        "passed";

      if (isPassed) {
        completedQuizzes++;
      }
    }

    return {
      totalQuizzes:
        quizzes.length,

      completedQuizzes,

      allQuizzesCompleted:
        completedQuizzes >=
        quizzes.length,
    };
  };

  /* =================================
      LOAD CERTIFICATES
  ================================= */

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const student =
        getLoggedInStudent();

      if (!student) {
        setCertificates([]);
        setLoading(false);
        return;
      }

      const studentId =
        getStudentId(student);

      const studentEmail =
        getStudentEmail(student);

      if (!studentId) {
        setCertificates([]);
        setError(
          "Student session is invalid. Please login again."
        );
        setLoading(false);
        return;
      }

      const token = getToken();

      if (!token) {
        handleUnauthorized();
        return;
      }

      /* =================================
          LOAD COURSES + ENROLLMENTS
      ================================= */

      const [
        coursesList,
        enrollments,
      ] = await Promise.all([
        getCourses(),
        getEnrollments(studentId),
      ]);

      /* =================================
          CREATE CERTIFICATES
      ================================= */

      const completedCertificates = [];

      for (const enrollment of enrollments) {
        const enrollmentCourseId =
          enrollment.courseId ??
          enrollment.course_id ??
          enrollment.course?.id ??
          enrollment.course?.courseId ??
          enrollment.course?._id ??
          null;

        if (!enrollmentCourseId) {
          continue;
        }

        /* =============================
            FIND COURSE
        ============================= */

        const actualCourse =
          coursesList.find(
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
          actualCourse ||
          enrollment.course ||
          {};

        const courseId =
          getCourseId(baseCourse) ||
          enrollmentCourseId;

        if (!courseId) {
          continue;
        }

        /* =============================
            LOAD COURSE LESSONS
        ============================= */

        let courseLessons = [];

        try {
          courseLessons =
            await getLessons(courseId);
        } catch (lessonError) {
          console.error(
            `Unable to load lessons for course ${courseId}:`,
            lessonError
          );

          courseLessons = [];
        }

        const totalLessons =
          courseLessons.length > 0
            ? courseLessons.length
            : Number(
                enrollment.totalLessons ||
                  baseCourse.totalLessons ||
                  baseCourse.lessons ||
                  0
              );

        if (totalLessons <= 0) {
          continue;
        }

        /* =============================
            LOAD STUDENT PROGRESS
        ============================= */

        let lessonProgress = [];

        try {
          lessonProgress =
            await getProgress(
              studentId,
              courseId
            );
        } catch (progressError) {
          console.error(
            `Unable to load progress for course ${courseId}:`,
            progressError
          );

          lessonProgress = [];
        }

        /* =============================
            FIND COMPLETED LESSONS
        ============================= */

        const completedLessonRecords =
          lessonProgress.filter(
            (item) => {
              const progressCourseId =
                item.courseId ??
                item.courseID ??
                item.course_id ??
                null;

              const progressStudentId =
                item.studentId ??
                item.userId ??
                null;

              const progressStudentEmail =
                String(
                  item.studentEmail ??
                    item.email ??
                    ""
                )
                  .trim()
                  .toLowerCase();

              const sameCourse =
                progressCourseId !== null &&
                String(
                  progressCourseId
                ) === String(courseId);

              const sameStudentById =
                studentId !== null &&
                progressStudentId !== null &&
                String(
                  progressStudentId
                ) === String(studentId);

              const sameStudentByEmail =
                studentEmail !== "" &&
                progressStudentEmail !== "" &&
                progressStudentEmail ===
                  studentEmail;

              return (
                sameCourse &&
                (
                  sameStudentById ||
                  sameStudentByEmail
                ) &&
                item.completed === true
              );
            }
          );

        /* =============================
            UNIQUE COMPLETED LESSONS
        ============================= */

        const completedLessonIds = [
          ...new Set(
            completedLessonRecords
              .map(
                (item) =>
                  item.lessonId ??
                  item.lessonID ??
                  item.lesson_id ??
                  item._id
              )
              .filter(Boolean)
              .map((id) =>
                String(id)
              )
          ),
        ];

        const completedLessons =
          Math.min(
            completedLessonIds.length,
            totalLessons
          );

        /* =============================
            CHECK LESSON COMPLETION
        ============================= */

        const allLessonsCompleted =
          totalLessons > 0 &&
          completedLessons >=
            totalLessons;

        /*
          If even one lesson is pending,
          certificate must NOT be generated.
        */

        if (!allLessonsCompleted) {
          continue;
        }

        /* =============================
            LOAD COURSE QUIZZES
        ============================= */

        let courseQuizzes = [];

        try {
          courseQuizzes =
            await getCourseQuizzes(
              courseId
            );
        } catch (quizError) {
          console.error(
            `Unable to load quizzes for course ${courseId}:`,
            quizError
          );

          /*
            IMPORTANT:
            If quizzes exist but API fails,
            do NOT generate certificate.

            We cannot safely assume that
            all quizzes are completed.
          */

          continue;
        }

        /* =============================
            LOAD QUIZ ATTEMPTS
        ============================= */

        let quizAttempts = [];

        try {
          quizAttempts =
            await getQuizAttempts(
              studentId,
              courseId
            );
        } catch (attemptError) {
          console.error(
            `Unable to load quiz attempts for course ${courseId}:`,
            attemptError
          );

          /*
            If quiz data exists but attempts
            cannot be loaded, certificate
            must remain locked.
          */

          if (
            courseQuizzes.length > 0
          ) {
            continue;
          }

          quizAttempts = [];
        }

        /* =============================
            CHECK QUIZ COMPLETION
        ============================= */

        const quizCompletion =
          checkQuizCompletion(
            courseQuizzes,
            quizAttempts
          );

        /*
          Certificate requires:

          1. All lessons completed
          2. All published quizzes passed

          If any quiz is not passed,
          certificate is NOT generated.
        */

        if (
          !quizCompletion.allQuizzesCompleted
        ) {
          continue;
        }

        /* =============================
            COURSE INFORMATION
        ============================= */

        const title =
          baseCourse.title ||
          baseCourse.courseName ||
          baseCourse.name ||
          enrollment.courseName ||
          "Untitled Course";

        const instructor =
          baseCourse.instructor ||
          baseCourse.faculty ||
          baseCourse.facultyName ||
          enrollment.faculty ||
          "Faculty";

        const category =
          baseCourse.category ||
          "General";

        const image =
          baseCourse.image ||
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

        /* =============================
            COMPLETION DATE
        ============================= */

        const completedDates =
          completedLessonRecords
            .map(
              (item) =>
                item.completedAt ||
                item.updatedAt
            )
            .filter(Boolean)
            .map(
              (date) =>
                new Date(date)
            )
            .filter(
              (date) =>
                !Number.isNaN(
                  date.getTime()
                )
            );

        /*
          Also include passed quiz dates
          so certificate date can reflect
          the latest completed activity.
        */

        quizAttempts.forEach(
          (attempt) => {
            const attemptQuizId =
              getAttemptQuizId(
                attempt
              );

            if (!attemptQuizId) {
              return;
            }

            const quiz =
              courseQuizzes.find(
                (item) =>
                  String(
                    getQuizId(item)
                  ) ===
                  String(
                    attemptQuizId
                  )
              );

            if (!quiz) {
              return;
            }

            const isPassed =
              String(
                attempt.result ||
                  ""
              ).toLowerCase() ===
              "passed";

            if (!isPassed) {
              return;
            }

            const attemptDate =
              attempt.submittedAt ||
              attempt.updatedAt ||
              attempt.createdAt;

            if (!attemptDate) {
              return;
            }

            const validDate =
              new Date(
                attemptDate
              );

            if (
              !Number.isNaN(
                validDate.getTime()
              )
            ) {
              completedDates.push(
                validDate
              );
            }
          }
        );

        let completedDate = null;

        if (
          completedDates.length > 0
        ) {
          completedDate =
            new Date(
              Math.max(
                ...completedDates.map(
                  (date) =>
                    date.getTime()
                )
              )
            );
        }

        if (!completedDate) {
          completedDate =
            enrollment.updatedAt
              ? new Date(
                  enrollment.updatedAt
                )
              : new Date();
        }

        /* =============================
            CERTIFICATE ID
        ============================= */

        const certificateId =
          `OLP-${completedDate.getFullYear()}-${String(
            courseId
          ).slice(-6)}`;

        completedCertificates.push({
          id: `certificate-${courseId}`,

          courseId,

          title,
          instructor,
          category,
          image,

          completedDate,
          certificateId,

          totalLessons,
          completedLessons,

          totalQuizzes:
            quizCompletion.totalQuizzes,

          completedQuizzes:
            quizCompletion.completedQuizzes,
        });
      }

      /* =================================
          REMOVE DUPLICATES
      ================================= */

      const uniqueCertificates = [];
      const usedCourseIds = new Set();

      completedCertificates.forEach(
        (certificate) => {
          const courseId = String(
            certificate.courseId
          );

          if (
            !usedCourseIds.has(
              courseId
            )
          ) {
            usedCourseIds.add(
              courseId
            );

            uniqueCertificates.push(
              certificate
            );
          }
        }
      );

      /* =================================
          LATEST CERTIFICATE FIRST
      ================================= */

      uniqueCertificates.sort(
        (a, b) =>
          b.completedDate.getTime() -
          a.completedDate.getTime()
      );

      setCertificates(
        uniqueCertificates
      );
    } catch (error) {
      console.error(
        "Unable to load certificates:",
        error
      );

      setCertificates([]);

      setError(
        error.message ||
          "Unable to load certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =================================
      INITIAL LOAD + EVENTS
  ================================= */

  useEffect(() => {
    loadCertificates();

    const handleUpdate = () => {
      loadCertificates();
    };

    window.addEventListener(
      "studentLessonProgressUpdated",
      handleUpdate
    );

    window.addEventListener(
      "studentQuizProgressUpdated",
      handleUpdate
    );

    window.addEventListener(
      "enrollmentUpdated",
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
        "studentLessonProgressUpdated",
        handleUpdate
      );

      window.removeEventListener(
        "studentQuizProgressUpdated",
        handleUpdate
      );

      window.removeEventListener(
        "enrollmentUpdated",
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
      FORMAT DATE
  ================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const validDate =
      date instanceof Date
        ? date
        : new Date(date);

    if (
      Number.isNaN(
        validDate.getTime()
      )
    ) {
      return "-";
    }

    return validDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  /* =================================
      VIEW CERTIFICATE
  ================================= */

  const handleViewCertificate = (
    certificate
  ) => {
    try {
      sessionStorage.setItem(
        "selectedCertificate",
        JSON.stringify(certificate)
      );
    } catch (error) {
      console.error(
        "Unable to save certificate:",
        error
      );
    }

    navigate("/certificate-view");
  };

  /* =================================
      DOWNLOAD PDF CERTIFICATE
  ================================= */

  const handleDownloadCertificate =
    async (certificate) => {
      try {
        const { jsPDF } =
          await import("jspdf");

        const student =
          getLoggedInStudent();

        const studentName =
          getStudentName(student);

        /* =============================
            CREATE PDF
        ============================= */

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        const pageWidth =
          pdf.internal.pageSize.getWidth();

        const pageHeight =
          pdf.internal.pageSize.getHeight();

        /* =============================
            BACKGROUND
        ============================= */

        pdf.setFillColor(
          248,
          250,
          252
        );

        pdf.rect(
          0,
          0,
          pageWidth,
          pageHeight,
          "F"
        );

        /* =============================
            OUTER BORDER
        ============================= */

        pdf.setDrawColor(
          109,
          74,
          255
        );

        pdf.setLineWidth(1.5);

        pdf.rect(
          8,
          8,
          pageWidth - 16,
          pageHeight - 16
        );

        /* =============================
            INNER BORDER
        ============================= */

        pdf.setDrawColor(
          180,
          160,
          255
        );

        pdf.setLineWidth(0.5);

        pdf.rect(
          12,
          12,
          pageWidth - 24,
          pageHeight - 24
        );

        /* =============================
            AWARD CIRCLE
        ============================= */

        pdf.setFillColor(
          109,
          74,
          255
        );

        pdf.circle(
          pageWidth / 2,
          31,
          8,
          "F"
        );

        pdf.setTextColor(
          255,
          255,
          255
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(13);

        pdf.text(
          "★",
          pageWidth / 2,
          35,
          {
            align: "center",
          }
        );

        /* =============================
            CERTIFICATE TITLE
        ============================= */

        pdf.setTextColor(
          45,
          45,
          65
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(27);

        pdf.text(
          "CERTIFICATE",
          pageWidth / 2,
          53,
          {
            align: "center",
          }
        );

        pdf.setFontSize(14);

        pdf.setTextColor(
          109,
          74,
          255
        );

        pdf.text(
          "OF COMPLETION",
          pageWidth / 2,
          62,
          {
            align: "center",
          }
        );

        /* =============================
            PRESENTED TO
        ============================= */

        pdf.setTextColor(
          100,
          100,
          115
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(11);

        pdf.text(
          "This certificate is proudly presented to",
          pageWidth / 2,
          76,
          {
            align: "center",
          }
        );

        /* =============================
            STUDENT NAME
        ============================= */

        pdf.setTextColor(
          30,
          30,
          45
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(24);

        pdf.text(
          studentName,
          pageWidth / 2,
          89,
          {
            align: "center",
          }
        );

        /* =============================
            COMPLETION TEXT
        ============================= */

        pdf.setTextColor(
          95,
          95,
          110
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(11);

        pdf.text(
          "for successfully completing the course",
          pageWidth / 2,
          101,
          {
            align: "center",
          }
        );

        /* =============================
            COURSE TITLE
        ============================= */

        pdf.setTextColor(
          55,
          55,
          75
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(18);

        const courseTitle =
          certificate.title;

        const courseTitleLines =
          pdf.splitTextToSize(
            courseTitle,
            220
          );

        pdf.text(
          courseTitleLines,
          pageWidth / 2,
          114,
          {
            align: "center",
          }
        );

        /* =============================
            COURSE DETAILS
        ============================= */

        const courseDetailY =
          114 +
          courseTitleLines.length *
            7;

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(10);

        pdf.setTextColor(
          100,
          100,
          115
        );

        pdf.text(
          `Category: ${certificate.category}`,
          pageWidth / 2,
          courseDetailY + 5,
          {
            align: "center",
          }
        );

        pdf.text(
          `Instructor: ${certificate.instructor}`,
          pageWidth / 2,
          courseDetailY + 12,
          {
            align: "center",
          }
        );

        /* =============================
            DIVIDER
        ============================= */

        const dividerY =
          courseDetailY + 21;

        pdf.setDrawColor(
          220,
          220,
          230
        );

        pdf.setLineWidth(0.4);

        pdf.line(
          55,
          dividerY,
          pageWidth - 55,
          dividerY
        );

        /* =============================
            COMPLETION DATE
        ============================= */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(9);

        pdf.setTextColor(
          90,
          90,
          105
        );

        pdf.text(
          "COMPLETION DATE",
          55,
          dividerY + 14
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(11);

        pdf.setTextColor(
          45,
          45,
          65
        );

        pdf.text(
          formatDate(
            certificate.completedDate
          ),
          55,
          dividerY + 21
        );

        /* =============================
            CERTIFICATE ID
        ============================= */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(9);

        pdf.setTextColor(
          90,
          90,
          105
        );

        pdf.text(
          "CERTIFICATE ID",
          pageWidth - 55,
          dividerY + 14,
          {
            align: "right",
          }
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(11);

        pdf.setTextColor(
          45,
          45,
          65
        );

        pdf.text(
          certificate.certificateId,
          pageWidth - 55,
          dividerY + 21,
          {
            align: "right",
          }
        );

        /* =============================
            PLATFORM NAME
        ============================= */

        pdf.setTextColor(
          109,
          74,
          255
        );

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(12);

        pdf.text(
          "ONLINE LEARNING PLATFORM",
          pageWidth / 2,
          pageHeight - 25,
          {
            align: "center",
          }
        );

        /* =============================
            DOWNLOAD PDF
        ============================= */

        const safeFileName =
          certificate.title
            .replace(
              /[^a-z0-9]+/gi,
              "-"
            )
            .replace(
              /^-+|-+$/g,
              ""
            )
            .toLowerCase();

        pdf.save(
          `${safeFileName}-certificate.pdf`
        );
      } catch (error) {
        console.error(
          "Unable to generate certificate PDF:",
          error
        );

        alert(
          "Unable to generate certificate PDF. Please make sure jsPDF is installed."
        );
      }
    };

  /* =================================
      LATEST CERTIFICATE YEAR
  ================================= */

  const latestYear =
    certificates.length > 0
      ? new Date(
          certificates[0].completedDate
        ).getFullYear()
      : "-";

  /* =================================
      LOADING STATE
  ================================= */

  if (loading) {
    return (
      <div className="certificates-page">
        <div
          style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Award
            size={35}
            color="#6d3df5"
          />

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Loading certificates...
          </p>
        </div>
      </div>
    );
  }

  /* =================================
      RENDER
  ================================= */

  return (
    <div className="certificates-page">

      {/* =================================
          PAGE HEADER
      ================================= */}

      <div className="certificates-header">

        <div>
          <h1>
            My Certificates
          </h1>

          <p>
            View and manage the
            certificates you earned
            from completed courses.
          </p>
        </div>

        <div className="certificate-header-icon">
          <Award size={24} />
        </div>

      </div>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 14px",
            background: "#fff5f5",
            border: "1px solid #fecaca",
            borderRadius: "9px",
            color: "#dc2626",
            fontSize: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* =================================
          STATS
      ================================= */}

      <div className="certificate-stats">

        <div className="certificate-stat-card">

          <div className="certificate-stat-icon purple">
            <Award size={19} />
          </div>

          <div>
            <span>
              Total Certificates
            </span>

            <strong>
              {certificates.length}
            </strong>
          </div>

        </div>

        <div className="certificate-stat-card">

          <div className="certificate-stat-icon green">
            <CheckCircle size={19} />
          </div>

          <div>
            <span>
              Completed Courses
            </span>

            <strong>
              {certificates.length}
            </strong>
          </div>

        </div>

        <div className="certificate-stat-card">

          <div className="certificate-stat-icon blue">
            <Calendar size={19} />
          </div>

          <div>
            <span>
              Latest Certificate
            </span>

            <strong>
              {latestYear}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================
          CERTIFICATES SECTION
      ================================= */}

      <div className="certificates-section">

        <div className="certificates-section-header">

          <div>
            <h2>
              Earned Certificates
            </h2>

            <p>
              Your achievements and
              completed courses.
            </p>
          </div>

          <span className="certificate-count">
            {certificates.length}{" "}
            {certificates.length === 1
              ? "Certificate"
              : "Certificates"}
          </span>

        </div>

        {/* =================================
            CERTIFICATE GRID
        ================================= */}

        {certificates.length > 0 ? (

          <div className="certificates-grid">

            {certificates.map(
              (certificate) => (

                <div
                  className="certificate-card"
                  key={certificate.id}
                >

                  {/* CERTIFICATE IMAGE */}

                  <div className="certificate-preview">

                    <img
                      src={certificate.image}
                      alt={
                        certificate.title
                      }
                    />

                    <div className="certificate-overlay">

                      <div className="certificate-badge">
                        <Award size={18} />
                      </div>

                      <span>
                        Certificate of Completion
                      </span>

                    </div>

                  </div>

                  {/* CERTIFICATE CONTENT */}

                  <div className="certificate-content">

                    <div className="certificate-title-row">

                      <div>

                        <span className="certificate-category">
                          {
                            certificate.category
                          }
                        </span>

                        <h3>
                          {
                            certificate.title
                          }
                        </h3>

                      </div>

                      <div className="verified-icon">
                        <CheckCircle
                          size={17}
                        />
                      </div>

                    </div>

                    <div className="certificate-details">

                      <div className="certificate-detail">

                        <Calendar
                          size={13}
                        />

                        <span>
                          Completed{" "}
                          {formatDate(
                            certificate.completedDate
                          )}
                        </span>

                      </div>

                      <div className="certificate-detail">

                        <Award
                          size={13}
                        />

                        <span>
                          ID:{" "}
                          {
                            certificate.certificateId
                          }
                        </span>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="certificate-actions">

                      <button
                        type="button"
                        className="view-certificate-button"
                        onClick={() =>
                          handleViewCertificate(
                            certificate
                          )
                        }
                      >
                        <Eye size={14} />

                        View Certificate
                      </button>

                      <button
                        type="button"
                        className="download-certificate-button"
                        onClick={() =>
                          handleDownloadCertificate(
                            certificate
                          )
                        }
                      >
                        <Download size={14} />

                        Download
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          /* =================================
              EMPTY STATE
          ================================= */

          <div
            className="certificates-empty-state"
            style={{
              textAlign: "center",
              padding: "70px 20px",
              background: "#ffffff",
              borderRadius: "16px",
              border:
                "1px solid #e5e7eb",
            }}
          >

            <Award
              size={42}
              style={{
                marginBottom:
                  "14px",
                opacity: 0.55,
              }}
            />

            <h3>
              No Certificates Yet
            </h3>

            <p>
              Complete all lessons and
              pass all quizzes of an
              enrolled course to earn
              your certificate.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/courses")
              }
              style={{
                marginTop: "16px",
                padding:
                  "10px 18px",
                border: "none",
                borderRadius:
                  "8px",
                background:
                  "#6d4aff",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View My Courses
            </button>

          </div>

        )}

      </div>

      {/* =================================
          MOTIVATION CARD
      ================================= */}

      <div className="certificate-motivation">

        <div className="motivation-icon">
          <Award size={22} />
        </div>

        <div className="motivation-content">

          <h3>
            Keep Learning, Keep Achieving!
          </h3>

          <p>
            Complete more courses to
            earn new certificates and
            showcase your learning
            achievements.
          </p>

        </div>

        <button
          type="button"
          className="browse-courses-button"
          onClick={() =>
            navigate("/browse")
          }
        >
          Browse Courses
        </button>

      </div>

    </div>
  );
};

export default Certificates;