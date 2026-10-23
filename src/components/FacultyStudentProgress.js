import React, {
  useEffect,
  useMemo,
  useState
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
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowLeft,
  Award,
  GraduationCap
} from "lucide-react";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import "../css/FacultyDashboard.css";
import "../css/FacultyStudentProgress.css";


const API_BASE_URL =
  "https://project-final-backend-oeh1.onrender.com";


// ==================================================
// Faculty Student Progress
// ==================================================
const FacultyStudentProgress = () => {

  const navigate = useNavigate();
  const location = useLocation();


  // ==================================================
  // Faculty Session
  // ==================================================
  const getFacultySession = () => {

    try {

      return JSON.parse(
        sessionStorage.getItem(
          "facultySession"
        ) || "null"
      );

    } catch (error) {

      console.error(
        "Unable to read faculty session:",
        error
      );

      return null;

    }

  };


  const facultySession =
    getFacultySession();


  const facultyId =
    facultySession?._id ||
    facultySession?.id ||
    facultySession?.userId ||
    "";


  const facultyName =
    facultySession?.name ||
    facultySession?.fullName ||
    facultySession?.username ||
    facultySession?.userName ||
    "Faculty";


  // ==================================================
  // Faculty Token
  // ==================================================
  const getFacultyToken = () => {

    return localStorage.getItem(
      "facultyToken"
    );

  };


  // ==================================================
  // Faculty Auth Headers
  // ==================================================
  const getFacultyAuthHeaders = () => {

    const token =
      getFacultyToken();


    if (!token) {

      console.error(
        "Faculty token is missing."
      );

    }


    return {
      Authorization:
        `Bearer ${token}`,

      "Content-Type":
        "application/json"
    };

  };


  // ==================================================
  // Unauthorized
  // ==================================================
  const handleUnauthorized = () => {

    localStorage.removeItem(
      "facultyToken"
    );

    sessionStorage.removeItem(
      "facultySession"
    );


    window.dispatchEvent(
      new Event(
        "userLoginChanged"
      )
    );


    navigate(
      "/login",
      {
        replace: true
      }
    );

  };


  // ==================================================
  // Course Passed From Previous Page
  // ==================================================
  const passedCourse =
    location.state?.course ||
    null;


  // ==================================================
  // States
  // ==================================================
  const [
    courses,
    setCourses
  ] = useState([]);


  const [
    selectedCourse,
    setSelectedCourse
  ] = useState(
    passedCourse
  );


  const [
    students,
    setStudents
  ] = useState([]);


  const [
    search,
    setSearch
  ] = useState("");


  const [
    progressFilter,
    setProgressFilter
  ] = useState("all");


  const [
    totalLessons,
    setTotalLessons
  ] = useState(0);


  const [
    loadingCourses,
    setLoadingCourses
  ] = useState(false);


  const [
    loadingStudents,
    setLoadingStudents
  ] = useState(false);


  const [
    studentsError,
    setStudentsError
  ] = useState("");


  // ==================================================
  // Safe Courses
  // ==================================================
  const safeCourses =
    Array.isArray(courses)
      ? courses
      : [];


  // ==================================================
  // Course ID
  // ==================================================
  const courseId =
    selectedCourse?._id ||
    selectedCourse?.id ||
    selectedCourse?.courseId ||
    null;


  // ==================================================
  // Course Name
  // ==================================================
  const courseName =
    selectedCourse?.title ||
    selectedCourse?.courseName ||
    selectedCourse?.name ||
    "All Courses";


  // ==================================================
  // Student ID Helper
  // ==================================================
  const getStudentId = (
    student
  ) => {

    if (!student) {
      return null;
    }


    return (
      student._id ||
      student.id ||
      student.userId ||
      student.studentId ||
      null
    );

  };


  // ==================================================
  // Course ID Helper
  // ==================================================
  const getCourseId = (
    course
  ) => {

    if (!course) {
      return null;
    }


    return (
      course._id ||
      course.id ||
      course.courseId ||
      null
    );

  };


  // ==================================================
  // Load Faculty Courses
  // ==================================================
  useEffect(() => {

    const loadCourses = async () => {

      if (!facultyId) {

        setCourses([]);

        return;

      }


      const facultyToken =
        getFacultyToken();


      if (!facultyToken) {

        setCourses([]);

        handleUnauthorized();

        return;

      }


      try {

        setLoadingCourses(true);


        const response =
          await fetch(
            `${API_BASE_URL}/api/faculty-dashboard/${facultyId}`,
            {
              method: "GET",
              headers:
                getFacultyAuthHeaders()
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
          response.ok &&
          result.success
        ) {

          let facultyCourses = [];


          if (
            Array.isArray(
              result?.data?.courses
            )
          ) {

            facultyCourses =
              result.data.courses;

          } else if (
            Array.isArray(
              result?.courses
            )
          ) {

            facultyCourses =
              result.courses;

          } else if (
            Array.isArray(
              result?.data
            )
          ) {

            facultyCourses =
              result.data;

          } else if (
            Array.isArray(
              result
            )
          ) {

            facultyCourses =
              result;

          }


          setCourses(
            Array.isArray(
              facultyCourses
            )
              ? facultyCourses
              : []
          );


          // ------------------------------------------
          // Passed course
          // ------------------------------------------
          if (
            passedCourse &&
            Array.isArray(
              facultyCourses
            )
          ) {

            const passedId =
              getCourseId(
                passedCourse
              );


            const matchedCourse =
              facultyCourses.find(
                (course) =>
                  String(
                    getCourseId(
                      course
                    )
                  ) ===
                  String(
                    passedId
                  )
              );


            if (matchedCourse) {

              setSelectedCourse(
                matchedCourse
              );

            } else if (
              facultyCourses.length > 0
            ) {

              setSelectedCourse(
                facultyCourses[0]
              );

            }

          } else if (
            Array.isArray(
              facultyCourses
            ) &&
            facultyCourses.length > 0
          ) {

            setSelectedCourse(
              facultyCourses[0]
            );

          }

        } else {

          console.error(
            result.message ||
            "Unable to load faculty courses"
          );

          setCourses([]);

        }

      } catch (error) {

        console.error(
          "Faculty courses error:",
          error
        );

        setCourses([]);

      } finally {

        setLoadingCourses(false);

      }

    };


    loadCourses();

  }, [
    facultyId
  ]);


  // ==================================================
  // Load Students + Actual Progress + Performance
  // ==================================================
  useEffect(() => {

    const loadStudents = async () => {

      if (!courseId) {

        setStudents([]);
        setTotalLessons(0);

        return;

      }


      const facultyToken =
        getFacultyToken();


      if (!facultyToken) {

        setStudents([]);
        setTotalLessons(0);

        handleUnauthorized();

        return;

      }


      try {

        setLoadingStudents(true);
        setStudentsError("");


        // ==================================================
        // 1. Get Course Lessons
        // ==================================================
        let lessons = [];


        try {

          const lessonResponse =
            await fetch(
              `${API_BASE_URL}/api/get-lessons/${courseId}`,
              {
                method: "GET",
                headers:
                  getFacultyAuthHeaders()
              }
            );


          if (
            lessonResponse.status === 401 ||
            lessonResponse.status === 403
          ) {

            handleUnauthorized();

            return;

          }


          const lessonResult =
            await lessonResponse.json();


          if (
            lessonResponse.ok
          ) {

            if (
              Array.isArray(
                lessonResult
              )
            ) {

              lessons =
                lessonResult;

            } else if (
              Array.isArray(
                lessonResult?.lessons
              )
            ) {

              lessons =
                lessonResult.lessons;

            } else if (
              Array.isArray(
                lessonResult?.data
              )
            ) {

              lessons =
                lessonResult.data;

            } else {

              lessons = [];

            }

          }

        } catch (error) {

          console.error(
            "Unable to load lessons:",
            error
          );

        }


        const lessonCount =
          Array.isArray(lessons)
            ? lessons.length
            : 0;


        setTotalLessons(
          lessonCount
        );


        // ==================================================
        // 2. Get All Users
        // ==================================================
        const usersResponse =
          await fetch(
            `${API_BASE_URL}/api/faculty/get-userdata`,
            {
              method: "GET",
              headers:
                getFacultyAuthHeaders()
            }
          );


        if (
          usersResponse.status === 401 ||
          usersResponse.status === 403
        ) {

          handleUnauthorized();

          return;

        }


        const usersResult =
          await usersResponse.json();


        if (
          !usersResponse.ok
        ) {

          throw new Error(
            usersResult.message ||
            "Unable to load students"
          );

        }


        let allUsers = [];


        if (
          Array.isArray(
            usersResult
          )
        ) {

          allUsers =
            usersResult;

        } else if (
          Array.isArray(
            usersResult?.users
          )
        ) {

          allUsers =
            usersResult.users;

        } else if (
          Array.isArray(
            usersResult?.data
          )
        ) {

          allUsers =
            usersResult.data;

        }


        const studentUsers =
          allUsers.filter(
            (user) => {

              const role =
                String(
                  user?.role ||
                  ""
                ).toLowerCase();


              return (
                role === "student" ||
                role === "user"
              );

            }
          );


        // ==================================================
        // 3. Check Enrollment + Progress + Performance
        // ==================================================
        const studentResults =
          await Promise.all(

            studentUsers.map(
              async (student) => {

                const studentId =
                  getStudentId(
                    student
                  );


                if (!studentId) {
                  return null;
                }


                // ------------------------------------------
                // Enrollment
                // ------------------------------------------
                let enrollment = null;


                try {

                  const enrollmentResponse =
                    await fetch(
                      `${API_BASE_URL}/api/get-enrollment/${studentId}/${courseId}`,
                      {
                        method: "GET",
                        headers:
                          getFacultyAuthHeaders()
                      }
                    );


                  if (
                    enrollmentResponse.status === 401 ||
                    enrollmentResponse.status === 403
                  ) {

                    handleUnauthorized();

                    return null;

                  }


                  if (
                    enrollmentResponse.ok
                  ) {

                    const enrollmentResult =
                      await enrollmentResponse.json();


                    if (
                      enrollmentResult?.success === false
                    ) {

                      enrollment =
                        null;

                    } else {

                      enrollment =
                        enrollmentResult?.data ||
                        enrollmentResult?.enrollment ||
                        enrollmentResult ||
                        null;

                    }

                  }

                } catch (error) {

                  console.error(
                    `Enrollment error for ${studentId}:`,
                    error
                  );

                }


                // Student is not enrolled
                if (!enrollment) {
                  return null;
                }


                // ------------------------------------------
                // Exact Enrollment Student ID
                // ------------------------------------------
                const performanceStudentId =
                  String(
                    enrollment?.studentId ||
                    studentId
                  );


                // ------------------------------------------
                // Actual Lesson Progress
                // ------------------------------------------
                let progressRecords =
                  null;


                try {

                  const progressResponse =
                    await fetch(
                      `${API_BASE_URL}/api/get-progress/${performanceStudentId}/${courseId}`,
                      {
                        method: "GET",
                        headers:
                          getFacultyAuthHeaders()
                      }
                    );


                  console.log(
                    "Progress Request:",
                    {
                      studentId:
                        performanceStudentId,
                      courseId,
                      status:
                        progressResponse.status
                    }
                  );


                  if (
                    progressResponse.status === 401 ||
                    progressResponse.status === 403
                  ) {

                    handleUnauthorized();

                    return null;

                  }


                  if (
                    progressResponse.ok
                  ) {

                    const progressResult =
                      await progressResponse.json();


                    if (
                      Array.isArray(
                        progressResult
                      )
                    ) {

                      progressRecords =
                        progressResult;

                    } else if (
                      Array.isArray(
                        progressResult?.data
                      )
                    ) {

                      progressRecords =
                        progressResult.data;

                    } else if (
                      Array.isArray(
                        progressResult?.progress
                      )
                    ) {

                      progressRecords =
                        progressResult.progress;

                    } else if (
                      progressResult?.data
                    ) {

                      progressRecords =
                        progressResult.data;

                    }

                  }

                } catch (error) {

                  console.error(
                    `Progress error for ${performanceStudentId}:`,
                    error
                  );

                }


                // ==================================================
                // Calculate Progress
                // ==================================================
                let completedLessons = 0;

                let studentTotalLessons =
                  lessonCount;


                if (
                  progressRecords &&
                  !Array.isArray(
                    progressRecords
                  )
                ) {

                  completedLessons =
                    Number(
                      progressRecords.completedLessons ||
                      0
                    );


                  if (
                    studentTotalLessons === 0
                  ) {

                    studentTotalLessons =
                      Number(
                        progressRecords.totalLessons ||
                        0
                      );

                  }

                } else if (
                  Array.isArray(
                    progressRecords
                  ) &&
                  progressRecords.length > 0
                ) {

                  completedLessons =
                    progressRecords.filter(
                      (item) =>
                        item?.completed === true
                    ).length;


                  if (
                    studentTotalLessons === 0
                  ) {

                    studentTotalLessons =
                      progressRecords.length;

                  }

                } else {

                  completedLessons =
                    Number(
                      enrollment?.completedLessons ||
                      0
                    );


                  if (
                    studentTotalLessons === 0
                  ) {

                    studentTotalLessons =
                      Number(
                        enrollment?.totalLessons ||
                        0
                      );

                  }

                }


                // ==================================================
                // Progress Percentage
                // ==================================================
                let progressPercentage = 0;


                if (
                  progressRecords &&
                  !Array.isArray(
                    progressRecords
                  )
                ) {

                  progressPercentage =
                    Number(
                      progressRecords.progress ||
                      progressRecords.progressPercentage ||
                      enrollment?.progress ||
                      0
                    );

                } else if (
                  studentTotalLessons > 0
                ) {

                  progressPercentage =
                    Math.round(
                      (
                        completedLessons /
                        studentTotalLessons
                      ) *
                      100
                    );

                } else {

                  progressPercentage =
                    Number(
                      enrollment?.progress ||
                      enrollment?.progressPercentage ||
                      enrollment?.courseProgress ||
                      0
                    );

                }


                progressPercentage =
                  Math.min(
                    100,
                    Math.max(
                      0,
                      progressPercentage
                    )
                  );


                const completed =
                  progressPercentage >= 100;


                // ==================================================
                // AI Performance Prediction
                // ==================================================
                let performance = "N/A";

                let performanceProbabilities = {};

                let performanceModel = "";


                try {

                  const performanceResponse =
                    await fetch(
                      `${API_BASE_URL}/api/faculty/student-performance/${performanceStudentId}/${courseId}`,
                      {
                        method: "GET",
                        headers:
                          getFacultyAuthHeaders()
                      }
                    );


                  console.log(
                    "Performance Prediction Request:",
                    {
                      studentId:
                        performanceStudentId,
                      courseId,
                      status:
                        performanceResponse.status
                    }
                  );


                  if (
                    performanceResponse.status === 401 ||
                    performanceResponse.status === 403
                  ) {

                    console.error(
                      "Performance prediction unauthorized:",
                      performanceResponse.status
                    );

                  } else if (
                    performanceResponse.ok
                  ) {

                    const performanceResult =
                      await performanceResponse.json();


                    console.log(
  "FULL PERFORMANCE DATA:",
  JSON.stringify(performanceResult, null, 2)
);


                    if (
                      performanceResult?.success &&
                      performanceResult?.data
                    ) {

                      performance =
                        performanceResult.data.prediction ||
                        "N/A";


                      performanceProbabilities =
                        performanceResult.data.probabilities ||
                        {};


                      performanceModel =
                        performanceResult.data.model ||
                        "";

                    }

                  }

                } catch (error) {

                  console.error(
                    `Performance prediction error for ${performanceStudentId}:`,
                    error
                  );

                }


                // ==================================================
                // Return Student
                // ==================================================
                return {

                  ...student,

                  _id:
                    student._id,

                  enrollmentId:
                    enrollment?._id ||
                    null,

                  enrollment,

                  performanceStudentId,

                  progress:
                    progressPercentage,

                  progressPercentage,

                  courseProgress:
                    progressPercentage,

                  completedLessons,

                  totalLessons:
                    studentTotalLessons,

                  completed,

                  // AI Performance
                  performance,

                  performanceProbabilities,

                  performanceModel

                };

              }
            )

          );


        const validStudents =
          studentResults.filter(
            Boolean
          );


        setStudents(
          Array.isArray(
            validStudents
          )
            ? validStudents
            : []
        );


      } catch (error) {

        console.error(
          "Faculty student progress error:",
          error
        );


        setStudents([]);

        setStudentsError(
          error.message ||
          "Unable to load student progress."
        );

      } finally {

        setLoadingStudents(false);

      }

    };


    loadStudents();

  }, [
    courseId
  ]);


  // ==================================================
  // Course Selection
  // ==================================================
  const handleCourseChange = (
    event
  ) => {

    const selectedId =
      event.target.value;


    const course =
      safeCourses.find(
        (item) =>
          String(
            getCourseId(
              item
            )
          ) ===
          String(
            selectedId
          )
      );


    if (course) {

      setSelectedCourse(
        course
      );

      setSearch("");

      setProgressFilter(
        "all"
      );

    }

  };


  // ==================================================
  // Student Enrollment Check
  // ==================================================
  const isStudentEnrolled = (
    student
  ) => {

    if (!courseId) {
      return false;
    }


    return Boolean(
      student?.enrollment
    );

  };


  // ==================================================
  // Get Progress
  // ==================================================
  const getProgress = (
    student
  ) => {

    const value =
      Number(
        student?.progressPercentage ??
        student?.progress ??
        student?.courseProgress ??
        0
      );


    if (
      Number.isNaN(
        value
      )
    ) {

      return 0;

    }


    return Math.min(
      100,
      Math.max(
        0,
        value
      )
    );

  };


  // ==================================================
  // Course Students
  // ==================================================
  const courseStudents =
    Array.isArray(students)
      ? students.filter(
          isStudentEnrolled
        )
      : [];


  // ==================================================
  // Filter Students
  // ==================================================
  const filteredStudents =
    useMemo(() => {

      const searchValue =
        search
          .trim()
          .toLowerCase();


      return courseStudents.filter(
        (student) => {

          const name =
            String(
              student?.studentName ||
              student?.name ||
              student?.fullName ||
              student?.username ||
              ""
            ).toLowerCase();


          const email =
            String(
              student?.studentEmail ||
              student?.email ||
              ""
            ).toLowerCase();


          const progress =
            getProgress(
              student
            );


          const matchesSearch =
            !searchValue ||
            name.includes(
              searchValue
            ) ||
            email.includes(
              searchValue
            );


          let matchesProgress =
            true;


          if (
            progressFilter ===
            "not-started"
          ) {

            matchesProgress =
              progress === 0;

          }


          if (
            progressFilter ===
            "in-progress"
          ) {

            matchesProgress =
              progress > 0 &&
              progress < 100;

          }


          if (
            progressFilter ===
            "completed"
          ) {

            matchesProgress =
              progress === 100;

          }


          return (
            matchesSearch &&
            matchesProgress
          );

        }
      );

    }, [
      courseStudents,
      search,
      progressFilter
    ]);


  // ==================================================
  // Statistics
  // ==================================================
  const totalStudents =
    courseStudents.length;


  const completedStudents =
    courseStudents.filter(
      (student) =>
        getProgress(
          student
        ) === 100
    ).length;


  const inProgressStudents =
    courseStudents.filter(
      (student) => {

        const progress =
          getProgress(
            student
          );


        return (
          progress > 0 &&
          progress < 100
        );

      }
    ).length;


  const averageProgress =
    totalStudents > 0
      ? Math.round(
          courseStudents.reduce(
            (
              total,
              student
            ) =>
              total +
              getProgress(
                student
              ),
            0
          ) /
          totalStudents
        )
      : 0;


  // ==================================================
  // Student Name
  // ==================================================
  const getStudentName = (
    student
  ) => {

    return (
      student?.studentName ||
      student?.name ||
      student?.fullName ||
      student?.username ||
      student?.studentEmail ||
      student?.email ||
      "Student"
    );

  };


  // ==================================================
  // Student Initials
  // ==================================================
  const getStudentInitials = (
    student
  ) => {

    const name =
      getStudentName(
        student
      );


    if (
      !name ||
      name === "Student"
    ) {

      return "ST";

    }


    const parts =
      String(
        name
      )
        .trim()
        .split(
          /\s+/
        );


    if (
      parts.length >= 2
    ) {

      return (
        parts[0].charAt(0) +
        parts[1].charAt(0)
      ).toUpperCase();

    }


    return String(
      name
    )
      .substring(
        0,
        2
      )
      .toUpperCase();

  };


  // ==================================================
  // Status
  // ==================================================
  const getProgressStatus = (
    progress
  ) => {

    if (
      progress === 100
    ) {

      return "Completed";

    }


    if (
      progress === 0
    ) {

      return "Not Started";

    }


    return "In Progress";

  };


  // ==================================================
  // Performance Display
  // ==================================================
  const getPerformanceLabel = (
    performance
  ) => {

    const value =
      String(
        performance ||
        ""
      )
        .trim()
        .toLowerCase();


    if (
      value === "good"
    ) {

      return "Good";

    }


    if (
      value === "medium"
    ) {

      return "Medium";

    }


    if (
      value === "poor"
    ) {

      return "Poor";

    }


    return "N/A";

  };


  // ==================================================
  // Performance Class
  // ==================================================
  const getPerformanceClass = (
    performance
  ) => {

    const value =
      String(
        performance ||
        ""
      )
        .trim()
        .toLowerCase();


    if (
      value === "good"
    ) {

      return "good";

    }


    if (
      value === "medium"
    ) {

      return "medium";

    }


    if (
      value === "poor"
    ) {

      return "poor";

    }


    return "na";

  };


  // ==================================================
  // View Student
  // ==================================================
  const handleViewStudent = (
    student
  ) => {

    const studentId =
      String(
        student?.performanceStudentId ||
        student?.enrollment?.studentId ||
        getStudentId(student) ||
        ""
      );


    const selectedCourseId =
      String(
        getCourseId(
          selectedCourse
        ) || ""
      );


    if (!studentId) {

      console.error(
        "Student ID is missing.",
        student
      );

      return;

    }


    if (!selectedCourseId) {

      console.error(
        "Course ID is missing.",
        selectedCourse
      );

      return;

    }


    console.log(
      "Opening Student Details:",
      {
        studentId,
        courseId:
          selectedCourseId,
        student,
        course:
          selectedCourse
      }
    );


    navigate(
      "/faculty/student-details",
      {
        state: {
          student,
          course:
            selectedCourse,

          studentId,
          courseId:
            selectedCourseId,

          enrollment:
            student?.enrollment ||
            null
        }
      }
    );

  };


  // ==================================================
  // Back
  // ==================================================
  const handleBack = () => {

    navigate(
      "/faculty/courses"
    );

  };


  // ==================================================
  // Logout
  // ==================================================
  const handleLogout = () => {

    localStorage.removeItem(
      "facultyToken"
    );

    sessionStorage.removeItem(
      "facultySession"
    );


    window.dispatchEvent(
      new Event(
        "userLoginChanged"
      )
    );


    navigate(
      "/login",
      {
        replace: true
      }
    );

  };


  // ==================================================
  // No Courses
  // ==================================================
  if (
    !loadingCourses &&
    safeCourses.length === 0
  ) {

    return (

      <div className="faculty-dashboard">

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
                navigate(
                  "/faculty"
                )
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>


            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate(
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
                navigate(
                  "/faculty/students"
                )
              }
            >
              <Users size={20} />
              <span>Students</span>
            </div>


            <div className="faculty-nav-item active">

              <ChartNoAxesCombined size={20} />

              <span>
                Student Progress
              </span>

            </div>


            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate(
                  "/faculty/quiz"
                )
              }
            >
              <ClipboardCheck size={20} />
              <span>Quiz Management</span>
            </div>



            <div
              className="faculty-nav-item"
              onClick={() =>
                navigate(
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
            onClick={
              handleLogout
            }
          >
            <LogOut size={20} />
            <span>Logout</span>
          </div>

        </aside>


        <main className="faculty-main">

          <header className="faculty-header">

            <div className="faculty-welcome">

              <h1>
                Student Progress
              </h1>

              <p>
                Track student learning progress across your courses.
              </p>

            </div>


            <div className="faculty-user">

              <div className="faculty-avatar">

                {facultyName
                  .charAt(0)
                  .toUpperCase()}

              </div>


              <div>

                <strong>
                  {facultyName}
                </strong>

                <span>
                  Faculty
                </span>

              </div>

            </div>

          </header>


          <div className="faculty-card">

            <div
              style={{
                padding: "45px 20px",
                textAlign: "center"
              }}
            >

              <GraduationCap
                size={46}
                strokeWidth={1.5}
                style={{
                  color: "#6d3df5",
                  marginBottom: "12px"
                }}
              />


              <h2
                style={{
                  margin: "0 0 8px",
                  color: "#20242d",
                  fontSize: "20px"
                }}
              >
                No Courses Available
              </h2>


              <p
                style={{
                  margin: "0 0 20px",
                  color: "#929aaa",
                  fontSize: "13px"
                }}
              >
                Create a course from My Courses to view student progress.
              </p>


              <button
                onClick={() =>
                  navigate(
                    "/faculty/courses"
                  )
                }
                style={{
                  border: "none",
                  background: "#6d3df5",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Back to My Courses
              </button>

            </div>

          </div>

        </main>

      </div>

    );

  }


  // ==================================================
  // Main Page
  // ==================================================
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
              navigate(
                "/faculty"
              )
            }
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>


          <div
            className="faculty-nav-item"
            onClick={() =>
              navigate(
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
              navigate(
                "/faculty/students"
              )
            }
          >
            <Users size={20} />
            <span>Students</span>
          </div>


          <div className="faculty-nav-item active">

            <ChartNoAxesCombined size={20} />

            <span>
              Student Progress
            </span>

          </div>


          <div
            className="faculty-nav-item"
            onClick={() =>
              navigate(
                "/faculty/quiz"
              )
            }
          >
            <ClipboardCheck size={20} />
            <span>Quiz Management</span>
          </div>


         


          <div
            className="faculty-nav-item"
            onClick={() =>
              navigate(
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
          onClick={
            handleLogout
          }
        >
          <LogOut size={20} />
          <span>Logout</span>
        </div>

      </aside>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="faculty-main">


        {/* ==================================================
            PROGRESS HEADER
        ================================================== */}

        <section className="faculty-student-progress-page">

          <div className="faculty-progress-header">

            <div className="faculty-progress-title-row">

              <div className="faculty-progress-title-icon">

                <ChartNoAxesCombined
                  size={24}
                />

              </div>


              <div>

                <h1>
                  Student Progress
                </h1>

                <p>
                  Track student learning progress across your courses.
                </p>

              </div>

            </div>


            <div className="faculty-progress-course">

              <BookOpen
                size={17}
              />

              <span>
                {courseName}
              </span>

            </div>

          </div>


          {/* ==================================================
              COURSE SELECTOR
          ================================================== */}

          <div className="faculty-progress-toolbar">

            <div className="faculty-progress-search">

              <Search
                size={17}
              />

              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                disabled={
                  loadingStudents
                }
              />

            </div>


            <select
              value={
                courseId || ""
              }
              onChange={
                handleCourseChange
              }
              disabled={
                loadingCourses ||
                safeCourses.length === 0
              }
              className="faculty-progress-filter"
            >

              <option value="">
                Select Course
              </option>


              {safeCourses.map(
                (course) => {

                  const id =
                    getCourseId(
                      course
                    );


                  return (

                    <option
                      key={id}
                      value={id}
                    >
                      {
                        course?.title ||
                        course?.courseName ||
                        course?.name ||
                        "Untitled Course"
                      }
                    </option>

                  );

                }
              )}

            </select>


            <select
              value={
                progressFilter
              }
              onChange={(event) =>
                setProgressFilter(
                  event.target.value
                )
              }
              disabled={
                loadingStudents
              }
              className="faculty-progress-filter"
            >

              <option value="all">
                All Progress
              </option>

              <option value="not-started">
                Not Started
              </option>

              <option value="in-progress">
                In Progress
              </option>

              <option value="completed">
                Completed
              </option>

            </select>

          </div>


          {/* ==================================================
              STATISTICS
          ================================================== */}

          <section className="faculty-progress-stats">


            {/* Total */}

            <div className="faculty-progress-stat-card">

              <div className="faculty-progress-stat-icon purple">

                <Users
                  size={23}
                />

              </div>


              <div>

                <span>
                  Total Students
                </span>

                <h2>
                  {loadingStudents
                    ? "..."
                    : totalStudents}
                </h2>

                <small>
                  Enrolled in this course
                </small>

              </div>

            </div>


            {/* Completed */}

            <div className="faculty-progress-stat-card">

              <div className="faculty-progress-stat-icon green">

                <CheckCircle
                  size={23}
                />

              </div>


              <div>

                <span>
                  Completed
                </span>

                <h2>
                  {loadingStudents
                    ? "..."
                    : completedStudents}
                </h2>

                <small>
                  Course completed
                </small>

              </div>

            </div>


            {/* In Progress */}

            <div className="faculty-progress-stat-card">

              <div className="faculty-progress-stat-icon blue">

                <TrendingUp
                  size={23}
                />

              </div>


              <div>

                <span>
                  In Progress
                </span>

                <h2>
                  {loadingStudents
                    ? "..."
                    : inProgressStudents}
                </h2>

                <small>
                  Currently learning
                </small>

              </div>

            </div>


            {/* Average */}

            <div className="faculty-progress-stat-card">

              <div className="faculty-progress-stat-icon orange">

                <Award
                  size={23}
                />

              </div>


              <div>

                <span>
                  Avg. Progress
                </span>

                <h2>
                  {loadingStudents
                    ? "..."
                    : `${averageProgress}%`}
                </h2>

                <small>
                  Overall course progress
                </small>

              </div>

            </div>

          </section>


          {/* ==================================================
              OVERVIEW
          ================================================== */}

          <section className="faculty-progress-overview">

            <div className="faculty-progress-overview-header">

              <div>

                <strong>
                  {courseName}
                </strong>

                <span>
                  {totalLessons} total lessons
                </span>

              </div>


              <div className="faculty-progress-overview-value">

                {averageProgress}%

              </div>

            </div>


            <div className="faculty-overview-bar">

              <div
                className="progress-bar"
                style={{
                  width:
                    `${averageProgress}%`
                }}
              ></div>

            </div>


            <div className="faculty-overview-legend">

              <span>
                Average Course Progress
              </span>

              <span>
                {totalStudents} Students
              </span>

            </div>

          </section>


          {/* ==================================================
              ERROR
          ================================================== */}

          {studentsError && (

            <div className="faculty-progress-error">

              {studentsError}

            </div>

          )}


          {/* ==================================================
              STUDENT TABLE
          ================================================== */}

          <section className="faculty-progress-table-card">

            <div className="faculty-card-header">

              <div>

                <h3>
                  Student Progress
                </h3>

                <p>
                  {filteredStudents.length} student
                  {filteredStudents.length !== 1
                    ? "s"
                    : ""}{" "}
                  shown
                </p>

              </div>

            </div>


            {loadingStudents ? (

              <div className="faculty-progress-empty">

                <div className="faculty-progress-loading-icon">

                  <TrendingUp
                    size={35}
                  />

                </div>

                <h3>
                  Loading Student Progress
                </h3>

                <p>
                  Please wait while student progress is being loaded.
                </p>

              </div>

            ) : filteredStudents.length === 0 ? (

              <div className="faculty-progress-empty">

                <div className="faculty-progress-empty-icon">

                  <Users
                    size={42}
                    strokeWidth={1.5}
                  />

                </div>


                <h3>
                  No Students Found
                </h3>


                <p>
                  No enrolled students match the selected filters.
                </p>

              </div>

            ) : (

              <div className="faculty-progress-table-wrapper">

                <table className="faculty-progress-table">

                  <thead>

                    <tr>

                      <th>
                        Student
                      </th>

                      <th>
                        Progress
                      </th>

                      <th>
                        Completed
                      </th>

                      <th>
                        Remaining
                      </th>

                      <th>
                        Performance
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredStudents.map(
                      (student) => {

                        const progress =
                          getProgress(
                            student
                          );


                        const studentTotalLessons =
                          Number(
                            student.totalLessons
                          ) ||
                          totalLessons ||
                          0;


                        const completed =
                          Number(
                            student.completedLessons
                          );


                        const calculatedCompleted =
                          Number.isFinite(
                            completed
                          ) &&
                          completed >= 0
                            ? Math.min(
                                studentTotalLessons,
                                completed
                              )
                            : Math.round(
                                (
                                  studentTotalLessons *
                                  progress
                                ) /
                                100
                              );


                        const remaining =
                          Math.max(
                            0,
                            studentTotalLessons -
                            calculatedCompleted
                          );


                        const performance =
                          getPerformanceLabel(
                            student.performance
                          );


                        const performanceClass =
                          getPerformanceClass(
                            student.performance
                          );


                        return (

                          <tr
                            key={
                              student._id ||
                              student.id ||
                              student.userId ||
                              student.performanceStudentId
                            }
                          >


                            {/* Student */}

                            <td>

                              <div className="faculty-progress-student">

                                <div className="faculty-progress-avatar">

                                  {getStudentInitials(
                                    student
                                  )}

                                </div>


                                <div>

                                  <strong>
                                    {getStudentName(
                                      student
                                    )}
                                  </strong>

                                  <span>
                                    {
                                      student.studentEmail ||
                                      student.email ||
                                      "No email"
                                    }
                                  </span>

                                </div>

                              </div>

                            </td>


                            {/* Progress */}

                            <td>

                              <div className="faculty-progress-cell">

                                <div className="faculty-progress-cell-top">

                                  <strong>
                                    {progress}%
                                  </strong>

                                </div>


                                <div className="faculty-progress-cell-bar">

                                  <div
                                    className={
                                      progress > 0
                                        ? "progress-bar"
                                        : "empty-bar"
                                    }
                                    style={{
                                      width:
                                        `${progress}%`
                                    }}
                                  ></div>

                                </div>

                              </div>

                            </td>


                            {/* Completed */}

                            <td>

                              <div className="faculty-progress-number completed">

                                <CheckCircle
                                  size={15}
                                />

                                <span>
                                  {calculatedCompleted}
                                </span>

                              </div>

                            </td>


                            {/* Remaining */}

                            <td>

                              <div className="faculty-progress-number remaining">

                                <Clock
                                  size={15}
                                />

                                <span>
                                  {remaining}
                                </span>

                              </div>

                            </td>


                            {/* Performance */}

                            <td>

                              <span
                                className={`faculty-progress-performance ${performanceClass}`}
                              >
                                {performance}
                              </span>

                            </td>


                            {/* Status */}

                            <td>

                              <span
                                className={`faculty-progress-status ${
                                  progress === 100
                                    ? "completed"
                                    : progress === 0
                                      ? "not-started"
                                      : "in-progress"
                                }`}
                              >

                                {getProgressStatus(
                                  progress
                                )}

                              </span>

                            </td>


                            {/* Action */}

                            <td>

                              <button
                                type="button"
                                className="faculty-progress-view-btn"
                                onClick={() =>
                                  handleViewStudent(
                                    student
                                  )
                                }
                              >

                                <EyeIcon />

                                <span>
                                  View
                                </span>

                              </button>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </section>


          {/* ==================================================
              BACK
          ================================================== */}

          <button
            type="button"
            onClick={
              handleBack
            }
            className="faculty-progress-view-btn"
            style={{
              marginTop: "18px"
            }}
          >

            <ArrowLeft
              size={15}
            />

            <span>
              Back to My Courses
            </span>

          </button>

        </section>

      </main>

    </div>

  );

};


// ==================================================
// Eye Icon
// ==================================================
const EyeIcon = () => (

  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >

    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
    />

    <circle
      cx="12"
      cy="12"
      r="3"
    />

  </svg>

);


export default FacultyStudentProgress;
