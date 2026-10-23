import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Award,
  ArrowRight,
  PlayCircle,
  TrendingUp,
  CalendarDays,
  MoreHorizontal,
} from "lucide-react";
import "../css/Dashboard.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const Dashboard = () => {
  const navigate = useNavigate();

  /*
   * ---------------------------------------------------------
   * STUDENT SESSION
   * ---------------------------------------------------------
   */

  const getStudentSession = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("studentSession") || "null"
      );
    } catch (error) {
      return null;
    }
  };

  const [loggedInUser, setLoggedInUser] = useState(
    getStudentSession()
  );

  /*
   * ---------------------------------------------------------
   * DASHBOARD DATA
   * ---------------------------------------------------------
   */

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [lessonsList, setLessonsList] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);

  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const getId = (item) => {
    if (!item) {
      return "";
    }

    return (
      item._id ||
      item.id ||
      item.courseId ||
      item.lessonId ||
      ""
    );
  };

  const getCourseId = (course) => {
    if (!course) {
      return "";
    }

    return (
      course._id ||
      course.id ||
      course.courseId ||
      ""
    );
  };

  const getLessonId = (lesson) => {
    if (!lesson) {
      return "";
    }

    return (
      lesson._id ||
      lesson.id ||
      lesson.lessonId ||
      ""
    );
  };

  /*
   * ---------------------------------------------------------
   * JWT TOKEN
   * ---------------------------------------------------------
   *
   * Student token only.
   *
   * Priority:
   * 1. studentSession.token
   * 2. localStorage.studentToken
   *
   * IMPORTANT:
   * Never use localStorage.token here.
   * ---------------------------------------------------------
   */

  const getStudentToken = () => {
    const studentSession = getStudentSession();

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
    const token = getStudentToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  /*
   * ---------------------------------------------------------
   * DURATION PARSER
   *
   * Converts lesson duration into TOTAL MINUTES.
   *
   * Examples:
   * 30 min     -> 30
   * 45 minutes -> 45
   * 80 min     -> 80
   * 1h 20m     -> 80
   * 2h         -> 120
   * 80         -> 80
   * ---------------------------------------------------------
   */

  const parseDurationToMinutes = (durationValue) => {
    if (
      durationValue === null ||
      durationValue === undefined ||
      durationValue === ""
    ) {
      return 0;
    }

    const duration = String(durationValue)
      .trim()
      .toLowerCase();

    const hoursMatch = duration.match(
      /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/
    );

    const minutesMatch = duration.match(
      /(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/
    );

    let totalMinutes = 0;

    if (hoursMatch) {
      totalMinutes +=
        parseFloat(hoursMatch[1]) * 60;
    }

    if (minutesMatch) {
      totalMinutes +=
        parseFloat(minutesMatch[1]);
    }

    if (
      !hoursMatch &&
      !minutesMatch &&
      /^\d+(?:\.\d+)?$/.test(
        duration
      )
    ) {
      totalMinutes =
        parseFloat(duration);
    }

    return totalMinutes;
  };

  /*
   * ---------------------------------------------------------
   * LEARNING HOURS DISPLAY FORMAT
   * ---------------------------------------------------------
   */

  const formatLearningHours = (totalMinutes) => {
    if (
      !totalMinutes ||
      totalMinutes <= 0
    ) {
      return "0.0";
    }

    const hours =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    if (minutes === 0) {
      return `${hours}.0`;
    }

    return `${hours}.${String(
      minutes
    ).padStart(2, "0")}`;
  };

  const extractArray = (
    responseData,
    possibleKeys = []
  ) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    for (const key of possibleKeys) {
      if (
        Array.isArray(
          responseData?.[key]
        )
      ) {
        return responseData[key];
      }
    }

    if (
      Array.isArray(
        responseData?.data
      )
    ) {
      return responseData.data;
    }

    return [];
  };

  /*
   * ---------------------------------------------------------
   * LOAD DASHBOARD DATA FROM MONGODB
   * ---------------------------------------------------------
   */

  const loadDashboardData = async () => {
    const student =
      getStudentSession();

    setLoggedInUser(student);
    setDashboardError("");

    if (!student) {
      setEnrolledCourses([]);
      setCoursesList([]);
      setLessonsList([]);
      setLessonProgress([]);
      setLoadingDashboard(false);
      return;
    }

    /*
     * -------------------------------------------------------
     * STUDENT JWT TOKEN
     * -------------------------------------------------------
     */

    const token =
      getStudentToken();

    if (!token) {
      setDashboardError(
        "Authentication token is missing. Please login again."
      );

      setEnrolledCourses([]);
      setCoursesList([]);
      setLessonsList([]);
      setLessonProgress([]);
      setLoadingDashboard(false);

      return;
    }

    const studentId =
      student._id ||
      student.id ||
      student.userId;

    const studentEmail =
      student.email || "";

    if (
      !studentId &&
      !studentEmail
    ) {
      setDashboardError(
        "Student session information is missing."
      );

      setEnrolledCourses([]);
      setCoursesList([]);
      setLessonsList([]);
      setLessonProgress([]);
      setLoadingDashboard(false);

      return;
    }

    setLoadingDashboard(true);

    try {
      /*
       * -----------------------------------------------------
       * 1. GET ALL COURSES
       * JWT PROTECTED
       * -----------------------------------------------------
       */

      const coursesResponse =
        await fetch(
          `${API_BASE_URL}/api/get-courses`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

      if (!coursesResponse.ok) {
        if (
          coursesResponse.status === 401 ||
          coursesResponse.status === 403
        ) {
          throw new Error(
            "Your session is invalid or expired. Please login again."
          );
        }

        throw new Error(
          "Failed to load courses."
        );
      }

      const coursesResult =
        await coursesResponse.json();

      const allCourses =
        extractArray(
          coursesResult,
          [
            "courses",
            "data",
          ]
        );

      /*
       * -----------------------------------------------------
       * 2. GET CURRENT STUDENT ENROLLMENTS
       * JWT PROTECTED
       * -----------------------------------------------------
       */

      let allEnrollments = [];

      if (studentId) {
        const enrollmentResponse =
          await fetch(
            `${API_BASE_URL}/api/get-enrollments/${studentId}`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          );

        if (
          enrollmentResponse.status === 401 ||
          enrollmentResponse.status === 403
        ) {
          throw new Error(
            "You are not authorized to access your enrollments."
          );
        }

        if (enrollmentResponse.ok) {
          const enrollmentResult =
            await enrollmentResponse.json();

          allEnrollments =
            extractArray(
              enrollmentResult,
              [
                "enrollments",
                "data",
              ]
            );
        }
      }

      /*
       * -----------------------------------------------------
       * 3. GET LESSONS + PROGRESS
       * -----------------------------------------------------
       */

      const allLessons = [];
      const allProgress = [];

      const courseRequests =
        allEnrollments.map(
          async (enrollment) => {
            const courseId =
              enrollment.courseId ||
              enrollment.course?._id ||
              enrollment.course?.id;

            if (!courseId) {
              return;
            }

            /*
             * Lessons
             * JWT PROTECTED
             */

            try {
              const lessonsResponse =
                await fetch(
                  `${API_BASE_URL}/api/get-lessons/${courseId}`,
                  {
                    method: "GET",
                    headers: getAuthHeaders(),
                  }
                );

              if (
                lessonsResponse.status === 401 ||
                lessonsResponse.status === 403
              ) {
                throw new Error(
                  "You are not authorized to access lessons."
                );
              }

              if (
                lessonsResponse.ok
              ) {
                const lessonsResult =
                  await lessonsResponse.json();

                const courseLessons =
                  extractArray(
                    lessonsResult,
                    [
                      "lessons",
                      "data",
                    ]
                  );

                courseLessons.forEach(
                  (lesson) => {
                    allLessons.push({
                      ...lesson,
                      courseId:
                        lesson.courseId ||
                        courseId,
                    });
                  }
                );
              }
            } catch (error) {
              console.error(
                "Lesson loading error:",
                error
              );

              throw error;
            }

            /*
             * Student Progress
             * JWT PROTECTED
             */

            if (studentId) {
              try {
                const progressResponse =
                  await fetch(
                    `${API_BASE_URL}/api/get-progress/${studentId}/${courseId}`,
                    {
                      method: "GET",
                      headers: getAuthHeaders(),
                    }
                  );

                if (
                  progressResponse.status === 401 ||
                  progressResponse.status === 403
                ) {
                  throw new Error(
                    "You are not authorized to access student progress."
                  );
                }

                if (
                  progressResponse.ok
                ) {
                  const progressResult =
                    await progressResponse.json();

                  const courseProgress =
                    extractArray(
                      progressResult,
                      [
                        "progress",
                        "progressData",
                        "data",
                      ]
                    );

                  courseProgress.forEach(
                    (progressItem) => {
                      allProgress.push({
                        ...progressItem,
                        courseId:
                          progressItem.courseId ||
                          courseId,
                        studentId:
                          progressItem.studentId ||
                          studentId,
                        studentEmail:
                          progressItem.studentEmail ||
                          studentEmail,
                      });
                    }
                  );
                }
              } catch (error) {
                console.error(
                  "Progress loading error:",
                  error
                );

                throw error;
              }
            }
          }
        );

      await Promise.all(
        courseRequests
      );

      setEnrolledCourses(
        Array.isArray(
          allEnrollments
        )
          ? allEnrollments
          : []
      );

      setCoursesList(
        Array.isArray(allCourses)
          ? allCourses
          : []
      );

      setLessonsList(
        allLessons
      );

      setLessonProgress(
        allProgress
      );
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setDashboardError(
        error.message ||
          "Failed to load dashboard data."
      );

      setEnrolledCourses([]);
      setCoursesList([]);
      setLessonsList([]);
      setLessonProgress([]);
    } finally {
      setLoadingDashboard(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * EVENTS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
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

    window.addEventListener(
      "storage",
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

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * USER NAME
   * ---------------------------------------------------------
   */

  const userName =
    loggedInUser?.name ||
    loggedInUser?.fullName ||
    loggedInUser?.username ||
    loggedInUser?.userName ||
    "Student";

  /*
   * ---------------------------------------------------------
   * COURSE DATA
   * ---------------------------------------------------------
   */

  const getCourseData = (
    enrollment
  ) => {
    const courseId =
      enrollment.courseId ||
      enrollment.course?._id ||
      enrollment.course?.id;

    const latestCourse =
      coursesList.find(
        (course) =>
          String(
            getCourseId(course)
          ) ===
          String(courseId)
      );

    const course =
      latestCourse ||
      enrollment.course ||
      {};

    const courseLessons =
      lessonsList.filter(
        (lesson) =>
          String(
            lesson.courseId
          ) ===
          String(courseId)
      );

    const completedLessons =
      Array.isArray(
        lessonProgress
      )
        ? lessonProgress.filter(
            (item) => {
              const sameCourse =
                String(
                  item.courseId
                ) ===
                String(courseId);

              const sameStudent =
                (loggedInUser?._id &&
                  item.studentId &&
                  String(
                    item.studentId
                  ) ===
                    String(
                      loggedInUser._id
                    )) ||
                (loggedInUser?.id &&
                  item.studentId &&
                  String(
                    item.studentId
                  ) ===
                    String(
                      loggedInUser.id
                    )) ||
                (loggedInUser?.email &&
                  item.studentEmail &&
                  String(
                    item.studentEmail
                  ).toLowerCase() ===
                    String(
                      loggedInUser.email
                    ).toLowerCase());

              return (
                sameCourse &&
                sameStudent &&
                item.completed === true
              );
            }
          )
        : [];

    const totalLessons =
      courseLessons.length ||
      Number(
        enrollment.totalLessons
      ) ||
      0;

    const completedCount =
      Math.min(
        completedLessons.length,
        totalLessons
      );

    const progress =
      totalLessons > 0
        ? Math.round(
            (completedCount /
              totalLessons) *
              100
          )
        : Number(
            enrollment.progress
          ) || 0;

    const facultyName =
      course.faculty ||
      course.instructor ||
      course.facultyName ||
      enrollment.course?.faculty ||
      "Instructor";

    return {
      ...course,

      id: courseId,

      _id:
        course._id ||
        courseId,

      title:
        course.title ||
        course.name ||
        enrollment.course?.title ||
        enrollment.courseName ||
        "Untitled Course",

      instructor:
        facultyName,

      progress,

      completedLessons:
        completedCount,

      totalLessons,

      duration:
        course.duration ||
        enrollment.course?.duration ||
        "—",

      image:
        course.image ||
        enrollment.course?.image ||
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",

      completed:
        progress >= 100,

      enrollment,
    };
  };

  /*
   * ---------------------------------------------------------
   * MY COURSES
   * ---------------------------------------------------------
   */

  const myCourses =
    useMemo(() => {
      return enrolledCourses
        .map(getCourseData)
        .sort((a, b) => {
          const dateA =
            new Date(
              a.enrollment?.updatedAt ||
                a.enrollment?.createdAt ||
                a.enrollment?.enrolledDate ||
                0
            ).getTime();

          const dateB =
            new Date(
              b.enrollment?.updatedAt ||
                b.enrollment?.createdAt ||
                b.enrollment?.enrolledDate ||
                0
            ).getTime();

          return dateB - dateA;
        });
    }, [
      enrolledCourses,
      coursesList,
      lessonsList,
      lessonProgress,
      loggedInUser,
    ]);

  /*
   * ---------------------------------------------------------
   * STATS
   * ---------------------------------------------------------
   */

  const totalCourses =
    myCourses.length;

  const completedCourses =
    myCourses.filter(
      (course) =>
        course.progress >= 100
    ).length;

  const inProgressCourses =
    myCourses.filter(
      (course) =>
        course.progress > 0 &&
        course.progress < 100
    ).length;

  /*
   * ---------------------------------------------------------
   * LEARNING HOURS
   * ---------------------------------------------------------
   */

  const learningHours =
    useMemo(() => {
      let totalMinutes = 0;

      myCourses.forEach(
        (course) => {
          const courseLessons =
            lessonsList.filter(
              (lesson) =>
                String(
                  lesson.courseId
                ) ===
                String(course.id)
            );

          courseLessons.forEach(
            (lesson) => {
              const lessonId =
                getLessonId(lesson);

              const isCompleted =
                Array.isArray(
                  lessonProgress
                ) &&
                lessonProgress.some(
                  (item) => {
                    const sameCourse =
                      String(
                        item.courseId
                      ) ===
                      String(course.id);

                    const progressLessonId =
                      item.lessonId?._id ||
                      item.lessonId?.id ||
                      item.lessonId ||
                      item.lesson?._id ||
                      item.lesson?.id ||
                      item.lesson ||
                      item.lesson_id ||
                      "";

                    const sameLesson =
                      String(
                        progressLessonId
                      ) ===
                      String(
                        lessonId
                      );

                    const sameStudent =
                      (loggedInUser?._id &&
                        item.studentId &&
                        String(
                          item.studentId
                        ) ===
                          String(
                            loggedInUser._id
                          )) ||
                      (loggedInUser?.id &&
                        item.studentId &&
                        String(
                          item.studentId
                        ) ===
                          String(
                            loggedInUser.id
                          )) ||
                      (loggedInUser?.email &&
                        item.studentEmail &&
                        String(
                          item.studentEmail
                        ).toLowerCase() ===
                          String(
                            loggedInUser.email
                          ).toLowerCase());

                    return (
                      sameCourse &&
                      sameLesson &&
                      sameStudent &&
                      item.completed === true
                    );
                  }
                );

              if (!isCompleted) {
                return;
              }

              const lessonMinutes =
                parseDurationToMinutes(
                  lesson.duration
                );

              console.log(
                "Completed Lesson:",
                lesson.title,
                "| Duration:",
                lesson.duration,
                "| Minutes:",
                lessonMinutes
              );

              totalMinutes +=
                lessonMinutes;
            }
          );
        }
      );

      console.log(
        "Dashboard Learning Time:",
        totalMinutes,
        "minutes"
      );

      const formattedHours =
        formatLearningHours(
          totalMinutes
        );

      console.log(
        "Dashboard Learning Hours:",
        formattedHours
      );

      return formattedHours;
    }, [
      myCourses,
      lessonsList,
      lessonProgress,
      loggedInUser,
    ]);

  /*
   * ---------------------------------------------------------
   * CERTIFICATES
   * ---------------------------------------------------------
   */

  const certificateCount =
    completedCourses;

  /*
   * ---------------------------------------------------------
   * CONTINUE LEARNING
   * ---------------------------------------------------------
   */

  const continueCourse =
    useMemo(() => {
      const inProgress =
        myCourses.filter(
          (course) =>
            course.progress < 100
        );

      if (
        inProgress.length > 0
      ) {
        return inProgress[0];
      }

      return (
        myCourses[0] || null
      );
    }, [myCourses]);

  /*
   * ---------------------------------------------------------
   * RECENT COURSES
   * ---------------------------------------------------------
   */

  const recentCourses =
    myCourses.slice(0, 3);

  /*
   * ---------------------------------------------------------
   * RECENT ACTIVITY
   * ---------------------------------------------------------
   */

  const activities =
    useMemo(() => {
      const result = [];

      const completedProgress =
        Array.isArray(
          lessonProgress
        )
          ? lessonProgress
              .filter(
                (item) => {
                  const sameStudent =
                    (loggedInUser?._id &&
                      item.studentId &&
                      String(
                        item.studentId
                      ) ===
                        String(
                          loggedInUser._id
                        )) ||
                    (loggedInUser?.id &&
                      item.studentId &&
                      String(
                        item.studentId
                      ) ===
                        String(
                          loggedInUser.id
                        )) ||
                    (loggedInUser?.email &&
                      item.studentEmail &&
                      String(
                        item.studentEmail
                      ).toLowerCase() ===
                        String(
                          loggedInUser.email
                        ).toLowerCase());

                  return (
                    sameStudent &&
                    item.completed === true
                  );
                }
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.completedAt ||
                      b.updatedAt ||
                      b.createdAt ||
                      0
                  ) -
                  new Date(
                    a.completedAt ||
                      a.updatedAt ||
                      a.createdAt ||
                      0
                  )
              )
          : [];

      completedProgress
        .slice(0, 3)
        .forEach((item) => {
          const lesson =
            lessonsList.find(
              (lessonItem) =>
                String(
                  getLessonId(
                    lessonItem
                  )
                ) ===
                String(
                  item.lessonId
                )
            );

          const course =
            myCourses.find(
              (courseItem) =>
                String(
                  courseItem.id
                ) ===
                String(
                  item.courseId
                )
            );

          if (lesson) {
            const activityDate =
              item.completedAt ||
              item.updatedAt ||
              item.createdAt;

            result.push({
              icon: (
                <CheckCircle2
                  size={18}
                />
              ),

              title:
                "Completed a lesson",

              description:
                lesson.title ||
                course?.title ||
                "Course Lesson",

              time:
                formatRelativeTime(
                  activityDate
                ),

              date: new Date(
                activityDate || 0
              ),
            });
          }
        });

      /*
       * Enrollments
       */

      enrolledCourses.forEach(
        (enrollment) => {
          const course =
            myCourses.find(
              (courseItem) =>
                String(
                  courseItem.id
                ) ===
                String(
                  enrollment.courseId ||
                    enrollment.course?._id ||
                    enrollment.course?.id
                )
            );

          if (!course) {
            return;
          }

          const enrollmentDate =
            enrollment.enrolledDate ||
            enrollment.createdAt;

          result.push({
            icon: (
              <BookOpen
                size={18}
              />
            ),

            title:
              "Enrolled in a course",

            description:
              course.title,

            time:
              formatRelativeTime(
                enrollmentDate
              ),

            date: new Date(
              enrollmentDate || 0
            ),
          });
        }
      );

      /*
       * Completed Courses
       */

      myCourses
        .filter(
          (course) =>
            course.progress >=
            100
        )
        .forEach((course) => {
          const completedDate =
            course.enrollment
              ?.updatedAt ||
            course.enrollment
              ?.createdAt ||
            course.enrollment
              ?.enrolledDate;

          result.push({
            icon: (
              <Award
                size={18}
              />
            ),

            title:
              "Completed a course",

            description:
              course.title,

            time:
              formatRelativeTime(
                completedDate
              ),

            date: new Date(
              completedDate || 0
            ),
          });
        });

      return result
        .sort(
          (a, b) =>
            b.date - a.date
        )
        .slice(0, 4);
    }, [
      lessonProgress,
      enrolledCourses,
      myCourses,
      lessonsList,
      loggedInUser,
    ]);

  /*
   * ---------------------------------------------------------
   * OPEN COURSE LEARNING
   * ---------------------------------------------------------
   */

  const openCourseLearning = (
    course
  ) => {
    if (!course) {
      return;
    }

    sessionStorage.setItem(
      "selectedLearningCourse",
      JSON.stringify(course)
    );

    navigate(
      "/course-learning"
    );
  };

  /*
   * ---------------------------------------------------------
   * EMPTY STATE
   * ---------------------------------------------------------
   */

  const hasCourses =
    myCourses.length > 0;

  /*
   * ---------------------------------------------------------
   * LOADING STATE
   * ---------------------------------------------------------
   */

  if (loadingDashboard) {
    return (
      <div className="dashboard-page">
        <div
          className="dashboard-empty-state"
          style={{
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BookOpen size={36} />

          <h3>
            Loading your dashboard...
          </h3>

          <p>
            Fetching your courses and
            learning progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* ---------------------------------------------------
          WELCOME SECTION
      --------------------------------------------------- */}

      <section className="dashboard-welcome">
        <div>
          <p className="welcome-label">
            LEARNING DASHBOARD
          </p>

          <h1>
            Welcome back{" "}
            <span>{userName}!</span>
          </h1>

          <p className="welcome-description">
            Keep learning, stay consistent,
            and achieve your goals.
          </p>
        </div>

        <div className="welcome-date">
          <CalendarDays size={18} />

          <span>
            Keep Learning Today
          </span>
        </div>
      </section>

      {/* ---------------------------------------------------
          ERROR
      --------------------------------------------------- */}

      {dashboardError && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#fff5f5",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          {dashboardError}
        </div>
      )}

      {/* ---------------------------------------------------
          STATS
      --------------------------------------------------- */}

      <section className="dashboard-stats">

        {/* Enrolled Courses */}

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">
              <BookOpen size={22} />
            </div>

            <button
              type="button"
              className="stat-more"
              aria-label="More options"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>

          <p className="stat-title">
            Enrolled Courses
          </p>

          <div className="stat-bottom">
            <h2>
              {totalCourses}
            </h2>

            <span>
              {inProgressCourses} in progress
            </span>
          </div>
        </div>

        {/* Completed Courses */}

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">
              <CheckCircle2 size={22} />
            </div>

            <button
              type="button"
              className="stat-more"
              aria-label="More options"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>

          <p className="stat-title">
            Completed Courses
          </p>

          <div className="stat-bottom">
            <h2>
              {completedCourses}
            </h2>

            <span>
              {totalCourses > 0
                ? `${Math.round(
                    (completedCourses /
                      totalCourses) *
                      100
                  )}% completed`
                : "Start learning"}
            </span>
          </div>
        </div>

        {/* Learning Hours */}

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">
              <Clock3 size={22} />
            </div>

            <button
              type="button"
              className="stat-more"
              aria-label="More options"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>

          <p className="stat-title">
            Learning Hours
          </p>

          <div className="stat-bottom">
            <h2>
              {learningHours}
            </h2>

            <span>
              Completed lesson time
            </span>
          </div>
        </div>

        {/* Certificates */}

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon">
              <Award size={22} />
            </div>

            <button
              type="button"
              className="stat-more"
              aria-label="More options"
            >
              <MoreHorizontal size={19} />
            </button>
          </div>

          <p className="stat-title">
            Certificates
          </p>

          <div className="stat-bottom">
            <h2>
              {certificateCount}
            </h2>

            <span>
              {certificateCount > 0
                ? "Keep learning"
                : "Complete a course"}
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------
          CONTINUE LEARNING
      --------------------------------------------------- */}

      <section className="continue-section">

        <div className="section-header">
          <div>
            <p className="section-label">
              CONTINUE LEARNING
            </p>

            <h2>
              Pick up where you left off
            </h2>
          </div>

          <Link
            to="/courses"
            className="view-all-link"
          >
            My Courses

            <ArrowRight size={17} />
          </Link>
        </div>

        {continueCourse ? (
          <div className="continue-card">

            <div className="continue-image">
              <img
                src={continueCourse.image}
                alt={
                  continueCourse.title
                }
              />

              <div className="continue-play">
                <PlayCircle size={32} />
              </div>
            </div>

            <div className="continue-content">

              <span className="course-badge">
                {continueCourse.progress >=
                100
                  ? "COMPLETED"
                  : "IN PROGRESS"}
              </span>

              <h3>
                {continueCourse.title}
              </h3>

              <p className="course-instructor">
                By{" "}
                {continueCourse.instructor}
              </p>

              <div className="continue-meta">

                <span>
                  <BookOpen size={15} />

                  {
                    continueCourse.completedLessons
                  }
                  /
                  {
                    continueCourse.totalLessons
                  }{" "}
                  lessons
                </span>

                <span>
                  <Clock3 size={15} />

                  {
                    continueCourse.duration
                  }
                </span>

              </div>

              <div className="progress-info">

                <span>
                  Course Progress
                </span>

                <strong>
                  {
                    continueCourse.progress
                  }%
                </strong>

              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${continueCourse.progress}%`,
                  }}
                ></div>
              </div>

              <button
                type="button"
                className="continue-btn"
                onClick={() =>
                  openCourseLearning(
                    continueCourse
                  )
                }
              >
                {continueCourse.progress >=
                100
                  ? "Review Course"
                  : "Continue Learning"}

                <ArrowRight size={17} />
              </button>

            </div>
          </div>
        ) : (
          <div className="dashboard-empty-state">

            <BookOpen size={36} />

            <h3>
              No enrolled courses yet
            </h3>

            <p>
              Browse available courses and
              start learning today.
            </p>

            <Link
              to="/browse"
              className="continue-btn"
            >
              Browse Courses

              <ArrowRight size={17} />
            </Link>

          </div>
        )}
      </section>

      {/* ---------------------------------------------------
          MY COURSES + ACTIVITY
      --------------------------------------------------- */}

      <section className="dashboard-grid">

        {/* MY COURSES */}

        <div className="courses-section">

          <div className="section-header">

            <div>
              <p className="section-label">
                MY COURSES
              </p>

              <h2>
                Recently Learning
              </h2>
            </div>

            <Link
              to="/courses"
              className="view-all-link"
            >
              View All

              <ArrowRight size={17} />
            </Link>

          </div>

          {recentCourses.length > 0 ? (
            <div className="course-list">

              {recentCourses.map(
                (course) => (
                  <div
                    className="dashboard-course-card"
                    key={course.id}
                  >

                    <div className="dashboard-course-image">
                      <img
                        src={course.image}
                        alt={course.title}
                      />
                    </div>

                    <div className="dashboard-course-content">

                      <h3>
                        {course.title}
                      </h3>

                      <p>
                        {course.instructor}
                      </p>

                      <div className="dashboard-course-progress">

                        <div className="course-progress-row">

                          <span>
                            {
                              course.completedLessons
                            }
                            {" / "}
                            {
                              course.totalLessons
                            }{" "}
                            lessons
                          </span>

                          <strong>
                            {course.progress}%
                          </strong>

                        </div>

                        <div className="small-progress-track">

                          <div
                            className="small-progress-fill"
                            style={{
                              width: `${course.progress}%`,
                            }}
                          ></div>

                        </div>

                      </div>

                    </div>

                    <button
                      type="button"
                      className="course-arrow"
                      onClick={() =>
                        openCourseLearning(
                          course
                        )
                      }
                      aria-label={`Open ${course.title}`}
                    >
                      <ArrowRight size={18} />
                    </button>

                  </div>
                )
              )}

            </div>
          ) : (
            <div className="dashboard-small-empty">

              <p>
                You have not enrolled in any
                course yet.
              </p>

              <Link to="/browse">
                Browse Courses

                <ArrowRight size={16} />
              </Link>

            </div>
          )}

        </div>

        {/* RECENT ACTIVITY */}

        <div className="activity-section">

          <div className="section-header">

            <div>
              <p className="section-label">
                ACTIVITY
              </p>

              <h2>
                Recent Activity
              </h2>
            </div>

          </div>

          {activities.length > 0 ? (
            <div className="activity-list">

              {activities.map(
                (
                  activity,
                  index
                ) => (
                  <div
                    className="activity-item"
                    key={`${activity.title}-${activity.description}-${index}`}
                  >

                    <div className="activity-icon">
                      {
                        activity.icon
                      }
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
                      {
                        activity.time
                      }
                    </time>

                  </div>
                )
              )}

            </div>
          ) : (
            <div className="dashboard-small-empty">

              <p>
                Your learning activity will
                appear here.
              </p>

            </div>
          )}

        </div>
      </section>

      {/* ---------------------------------------------------
          QUICK ACTIONS
      --------------------------------------------------- */}

      <section className="quick-section">

        <div className="section-header">

          <div>
            <p className="section-label">
              QUICK ACTIONS
            </p>

            <h2>
              What would you like to do?
            </h2>
          </div>

        </div>

        <div className="quick-actions">

          {/* Browse Courses */}

          <Link
            to="/browse"
            className="quick-card"
          >

            <div className="quick-icon">
              <BookOpen size={22} />
            </div>

            <div>
              <h3>
                Browse Courses
              </h3>

              <p>
                Explore new courses and skills
              </p>
            </div>

            <ArrowRight size={18} />

          </Link>

          {/* Progress */}

          <Link
            to="/progress"
            className="quick-card"
          >

            <div className="quick-icon">
              <TrendingUp size={22} />
            </div>

            <div>
              <h3>
                View Progress
              </h3>

              <p>
                Check your learning progress
              </p>
            </div>

            <ArrowRight size={18} />

          </Link>

          {/* Continue Learning */}

          <button
            type="button"
            className="quick-card"
            onClick={() =>
              continueCourse &&
              openCourseLearning(
                continueCourse
              )
            }
            disabled={
              !continueCourse
            }
          >

            <div className="quick-icon">
              <PlayCircle size={22} />
            </div>

            <div>
              <h3>
                Continue Learning
              </h3>

              <p>
                Resume your current courses
              </p>
            </div>

            <ArrowRight size={18} />

          </button>

        </div>
      </section>
    </div>
  );
};

/*
 * ---------------------------------------------------------
 * FORMAT RELATIVE TIME
 * ---------------------------------------------------------
 */

const formatRelativeTime = (
  dateValue
) => {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(
    dateValue
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Recently";
  }

  const now = new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const seconds =
    Math.floor(
      difference / 1000
    );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1
        ? "minute"
        : "minutes"
    } ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days} ${
      days === 1
        ? "day"
        : "days"
    } ago`;
  }

  const weeks =
    Math.floor(
      days / 7
    );

  if (weeks < 5) {
    return `${weeks} ${
      weeks === 1
        ? "week"
        : "weeks"
    } ago`;
  }

  return date.toLocaleDateString();
};

export default Dashboard;
