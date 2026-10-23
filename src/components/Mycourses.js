import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
BookOpen,
Clock,
PlayCircle,
CheckCircle,
Search,
ArrowRight,
GraduationCap,
} from "lucide-react";
import "../css/Mycourses.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const Mycourses = () => {
const navigate = useNavigate();

const [myCourses, setMyCourses] = useState([]);
const [lessonsList, setLessonsList] = useState([]);
const [lessonProgress, setLessonProgress] = useState([]);

const [searchTerm, setSearchTerm] = useState("");
const [filter, setFilter] = useState("all");

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [loggedInUser, setLoggedInUser] = useState(null);

/* =====================================================
GET LOGGED-IN STUDENT
===================================================== */
useEffect(() => {
try {
const session = sessionStorage.getItem("studentSession");


  if (!session) {
    navigate("/login");
    return;
  }

  const user = JSON.parse(session);

  if (!user) {
    navigate("/login");
    return;
  }

  setLoggedInUser(user);
} catch (err) {
  console.error("Student session error:", err);

  sessionStorage.removeItem("studentSession");
  localStorage.removeItem("studentToken");

  window.dispatchEvent(
    new Event("userLoginChanged")
  );

  navigate("/login");
}

}, [navigate]);

/* =====================================================
HELPERS
===================================================== */

const getStudentToken = () => {
try {
const session =
sessionStorage.getItem("studentSession");

  if (session) {
    const user = JSON.parse(session);

    if (user?.token) {
      return user.token;
    }
  }
} catch (error) {
  console.error(
    "Student session token error:",
    error
  );
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

const getId = (item) => {
if (!item) return "";

return (
  item._id ||
  item.id ||
  item.courseId ||
  item.course_id ||
  ""
);


};

const getLessonId = (lesson) => {
if (!lesson) return "";

return (
  lesson._id ||
  lesson.id ||
  lesson.lessonId ||
  lesson.lesson_id ||
  ""
);


};

const getProgressLessonId = (item) => {
if (!item) return "";


return (
  item.lessonId?._id ||
  item.lessonId?.id ||
  item.lessonId ||
  item.lesson?._id ||
  item.lesson?.id ||
  item.lesson ||
  item.lesson_id ||
  ""
);


};

/* =====================================================
NORMALIZE API RESPONSE
===================================================== */

const normalizeArray = (data, keys = []) => {
if (Array.isArray(data)) {
return data;
}


for (const key of keys) {
  if (Array.isArray(data?.[key])) {
    return data[key];
  }
}

return [];


};

const normalizeProgressData = (data) => {
if (Array.isArray(data)) {
return data;
}

if (Array.isArray(data?.progress)) {
  return data.progress;
}

if (Array.isArray(data?.lessons)) {
  return data.lessons;
}

if (Array.isArray(data?.data)) {
  return data.data;
}

if (data && typeof data === "object") {
  return [data];
}

return [];

};

/* =====================================================
DURATION → MINUTES
===================================================== */

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
  /^\d+(?:\.\d+)?$/.test(duration)
) {
  totalMinutes = parseFloat(duration);
}

return totalMinutes;


};

/* =====================================================
FORMAT LEARNING HOURS
===================================================== */

const formatLearningHours = (totalMinutes) => {
if (!totalMinutes || totalMinutes <= 0) {
return "0.0";
}


const hours = Math.floor(
  totalMinutes / 60
);

const minutes = totalMinutes % 60;

if (minutes === 0) {
  return `${hours}.0`;
}

return `${hours}.${String(minutes).padStart(
  2,
  "0"
)}`;


};

/* =====================================================
CHECK CURRENT STUDENT
===================================================== */

const isSameStudent = (item) => {
if (!item || !loggedInUser) {
return false;
}


const studentId =
  loggedInUser._id ||
  loggedInUser.id ||
  loggedInUser.userId;

const itemStudentId =
  item.studentId ||
  item.student?._id ||
  item.student?.id ||
  "";

if (
  studentId &&
  itemStudentId &&
  String(studentId) ===
    String(itemStudentId)
) {
  return true;
}

if (
  loggedInUser.email &&
  item.studentEmail &&
  String(loggedInUser.email).toLowerCase() ===
    String(item.studentEmail).toLowerCase()
) {
  return true;
}

return false;

};

/* =====================================================
FETCH MY COURSES
===================================================== */

useEffect(() => {
const fetchMyCourses = async () => {
if (!loggedInUser) return;

  try {
    setLoading(true);
    setError("");

    const studentId =
      loggedInUser._id ||
      loggedInUser.id ||
      loggedInUser.userId;

    if (!studentId) {
      setError(
        "Student information not found."
      );
      setLoading(false);
      return;
    }

    const token = getStudentToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    /* -------------------------------------------------
       1. GET ENROLLMENTS
    ------------------------------------------------- */

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
      handleUnauthorized();
      return;
    }

    if (!enrollmentResponse.ok) {
      throw new Error(
        "Failed to fetch enrollments"
      );
    }

    const enrollmentData =
      await enrollmentResponse.json();

    const enrollments =
      normalizeArray(
        enrollmentData,
        ["data", "enrollments"]
      );

    /* -------------------------------------------------
       2. GET ALL COURSES
    ------------------------------------------------- */

    const coursesResponse =
      await fetch(
        `${API_BASE_URL}/api/get-courses`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

    if (
      coursesResponse.status === 401 ||
      coursesResponse.status === 403
    ) {
      handleUnauthorized();
      return;
    }

    if (!coursesResponse.ok) {
      throw new Error(
        "Failed to fetch courses"
      );
    }

    const coursesData =
      await coursesResponse.json();

    const courses =
      normalizeArray(
        coursesData,
        ["data", "courses"]
      );

    /* -------------------------------------------------
       3. MATCH ENROLLMENTS WITH COURSES
    ------------------------------------------------- */

    const enrolledCourses =
      enrollments.map(
        (enrollment) => {
          const enrollmentId =
            enrollment._id ||
            enrollment.id ||
            "";

          const enrollmentCourseId =
            enrollment.courseId ||
            enrollment.course_id ||
            enrollment.course?._id ||
            enrollment.course?.id ||
            "";

          const matchedCourse =
            courses.find(
              (course) => {
                const actualCourseId =
                  course._id ||
                  course.id ||
                  course.courseId ||
                  course.course_id ||
                  "";

                return (
                  String(
                    actualCourseId
                  ) ===
                  String(
                    enrollmentCourseId
                  )
                );
              }
            );

          const actualCourseId =
            matchedCourse?._id ||
            matchedCourse?.id ||
            matchedCourse?.courseId ||
            matchedCourse?.course_id ||
            enrollmentCourseId;

          return {
            ...matchedCourse,

            ...enrollment,

            enrollmentId:
              enrollmentId,

            courseId:
              actualCourseId,

            id:
              actualCourseId,

            title:
              matchedCourse?.title ||
              enrollment.courseName ||
              enrollment.course?.title ||
              "Untitled Course",

            image:
              matchedCourse?.image ||
              enrollment.course?.image ||
              "",

            level:
              matchedCourse?.level ||
              enrollment.course?.level ||
              "Beginner",

            faculty:
              matchedCourse?.faculty ||
              enrollment.course?.faculty ||
              "Unknown Faculty",

            category:
              matchedCourse?.category ||
              enrollment.course?.category ||
              "Other",

            duration:
              matchedCourse?.duration ||
              enrollment.course?.duration ||
              "",

            progress:
              Number(
                enrollment.progress
              ) || 0,

            completedLessons:
              Number(
                enrollment.completedLessons
              ) || 0,

            totalLessons:
              Number(
                enrollment.totalLessons
              ) || 0,

            completed:
              Boolean(
                enrollment.completed
              ),
          };
        }
      );

    setMyCourses(enrolledCourses);

    console.log(
      "FINAL ENROLLED COURSES:",
      enrolledCourses
    );

    /* -------------------------------------------------
       4. GET LESSONS FOR ALL COURSES
    ------------------------------------------------- */

    let allLessons = [];

    for (const course of enrolledCourses) {
      const courseId =
        course.courseId ||
        course.id;

      if (!courseId) continue;

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
          handleUnauthorized();
          return;
        }

        if (!lessonsResponse.ok) {
          continue;
        }

        const lessonsData =
          await lessonsResponse.json();

        const lessons =
          normalizeArray(
            lessonsData,
            ["data", "lessons"]
          );

        const courseLessons =
          lessons.map(
            (lesson) => ({
              ...lesson,

              courseId:
                lesson.courseId ||
                lesson.course_id ||
                courseId,
            })
          );

        allLessons = [
          ...allLessons,
          ...courseLessons,
        ];
      } catch (lessonError) {
        console.error(
          `Lesson error for ${courseId}:`,
          lessonError
        );
      }
    }

    setLessonsList(allLessons);

    /* -------------------------------------------------
       5. GET STUDENT PROGRESS
    ------------------------------------------------- */

    let allProgress = [];

    for (const course of enrolledCourses) {
      const courseId =
        course.courseId ||
        course.id;

      if (!courseId) continue;

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
          handleUnauthorized();
          return;
        }

        if (!progressResponse.ok) {
          continue;
        }

        const progressData =
          await progressResponse.json();

        const normalizedProgress =
          normalizeProgressData(
            progressData
          );

        const courseProgress =
          normalizedProgress.map(
            (item) => ({
              ...item,

              courseId:
                item.courseId ||
                item.course_id ||
                courseId,

              studentId:
                item.studentId ||
                studentId,
            })
          );

        allProgress = [
          ...allProgress,
          ...courseProgress,
        ];
      } catch (progressError) {
        console.error(
          `Progress error for ${courseId}:`,
          progressError
        );
      }
    }

    setLessonProgress(allProgress);

    console.log(
      "My Courses:",
      enrolledCourses
    );

    console.log(
      "Lessons:",
      allLessons
    );

    console.log(
      "Lesson Progress:",
      allProgress
    );
  } catch (err) {
    console.error(
      "My Courses fetch error:",
      err
    );

    setError(
      "Unable to load your courses. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

fetchMyCourses();

}, [loggedInUser]);

/* =====================================================
COURSE PROGRESS
===================================================== */

const getCourseProgress = (course) => {
if (!course) return 0;

const courseId =
  course.courseId ||
  course.id;

const courseLessons =
  lessonsList.filter(
    (lesson) => {
      const lessonCourseId =
        lesson.courseId ||
        lesson.course_id ||
        "";

      return (
        String(lessonCourseId) ===
        String(courseId)
      );
    }
  );

if (courseLessons.length === 0) {
  return Math.min(
    100,
    Math.max(
      0,
      Number(course.progress) || 0
    )
  );
}

let completedCount = 0;

courseLessons.forEach(
  (lesson) => {
    const lessonId =
      getLessonId(lesson);

    if (!lessonId) return;

    const completed =
      lessonProgress.some(
        (item) => {
          const itemCourseId =
            item.courseId ||
            item.course_id ||
            "";

          const itemLessonId =
            getProgressLessonId(
              item
            );

          return (
            String(
              itemCourseId
            ) ===
              String(courseId) &&
            String(
              itemLessonId
            ) ===
              String(lessonId) &&
            isSameStudent(item) &&
            item.completed === true
          );
        }
      );

    if (completed) {
      completedCount += 1;
    }
  }
);

return Math.round(
  (completedCount /
    courseLessons.length) *
    100
);


};

/* =====================================================
LEARNING HOURS
===================================================== */

const learningHours = useMemo(() => {
let totalMinutes = 0;


myCourses.forEach(
  (course) => {
    const courseId =
      course.courseId ||
      course.id;

    if (!courseId) return;

    const courseLessons =
      lessonsList.filter(
        (lesson) => {
          const lessonCourseId =
            lesson.courseId ||
            lesson.course_id ||
            "";

          return (
            String(
              lessonCourseId
            ) ===
            String(courseId)
          );
        }
      );

    courseLessons.forEach(
      (lesson) => {
        const lessonId =
          getLessonId(lesson);

        if (!lessonId) return;

        const isCompleted =
          lessonProgress.some(
            (item) => {
              const itemCourseId =
                item.courseId ||
                item.course_id ||
                "";

              const itemLessonId =
                getProgressLessonId(
                  item
                );

              return (
                String(
                  itemCourseId
                ) ===
                  String(courseId) &&
                String(
                  itemLessonId
                ) ===
                  String(lessonId) &&
                isSameStudent(item) &&
                item.completed === true
              );
            }
          );

        if (!isCompleted) return;

        const minutes =
          parseDurationToMinutes(
            lesson.duration
          );

        totalMinutes += minutes;
      }
    );
  }
);

return formatLearningHours(
  totalMinutes
);


}, [
myCourses,
lessonsList,
lessonProgress,
loggedInUser,
]);

/* =====================================================
TOTAL COMPLETED COURSES
===================================================== */

const completedCourses =
useMemo(() => {
return myCourses.filter(
(course) =>
getCourseProgress(
course
) === 100
).length;
}, [
myCourses,
lessonsList,
lessonProgress,
loggedInUser,
]);

/* =====================================================
IN-PROGRESS COURSES
===================================================== */

const inProgressCourses =
useMemo(() => {
return myCourses.filter(
(course) => {
const progress =
getCourseProgress(
course
);

      return (
        progress > 0 &&
        progress < 100
      );
    }
  ).length;
}, [
  myCourses,
  lessonsList,
  lessonProgress,
  loggedInUser,
]);


/* =====================================================
FILTER COURSES
===================================================== */

const filteredCourses =
useMemo(() => {
let courses = [
...myCourses,
];

  if (searchTerm.trim()) {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    courses =
      courses.filter(
        (course) => {
          const title =
            String(
              course.title || ""
            ).toLowerCase();

          const category =
            String(
              course.category ||
                ""
            ).toLowerCase();

          const level =
            String(
              course.level || ""
            ).toLowerCase();

          const faculty =
            String(
              course.faculty ||
                ""
            ).toLowerCase();

          return (
            title.includes(search) ||
            category.includes(search) ||
            level.includes(search) ||
            faculty.includes(search)
          );
        }
      );
  }

  if (filter === "completed") {
    courses =
      courses.filter(
        (course) =>
          getCourseProgress(
            course
          ) === 100
      );
  }

  if (
    filter === "in-progress"
  ) {
    courses =
      courses.filter(
        (course) => {
          const progress =
            getCourseProgress(
              course
            );

          return (
            progress > 0 &&
            progress < 100
          );
        }
      );
  }

  if (
    filter === "not-started"
  ) {
    courses =
      courses.filter(
        (course) =>
          getCourseProgress(
            course
          ) === 0
      );
  }

  return courses;
}, [
  myCourses,
  searchTerm,
  filter,
  lessonsList,
  lessonProgress,
  loggedInUser,
]);


/* =====================================================
CONTINUE COURSE
===================================================== */

const handleContinueCourse =
(course) => {
const actualCourseId =
course.courseId ||
course.id;

  if (!actualCourseId) {
    console.error(
      "Course ID not found:",
      course
    );

    return;
  }

  const selectedCourse = {
    ...course,

    courseId:
      actualCourseId,

    id:
      actualCourseId,

    enrollmentId:
      course.enrollmentId ||
      course._id ||
      "",
  };

  console.log(
    "Opening Course:",
    selectedCourse
  );

  console.log(
    "Actual Course ID:",
    actualCourseId
  );

  sessionStorage.setItem(
    "selectedLearningCourse",
    JSON.stringify(
      selectedCourse
    )
  );

  navigate(
    "/course-learning"
  );
};


/* =====================================================
LOADING
===================================================== */

if (loading) {
return ( <div className="my-courses-page"> <div className="empty-courses">


      <div className="empty-icon">
        <BookOpen size={22} />
      </div>

      <h3>
        Loading your courses...
      </h3>

      <p>
        Please wait while we
        load your learning
        data.
      </p>

    </div>
  </div>
);


}

/* =====================================================
ERROR
===================================================== */

if (error) {
return ( <div className="my-courses-page"> <div className="empty-courses">


      <div className="empty-icon">
        <BookOpen size={22} />
      </div>

      <h3>
        Something went wrong
      </h3>

      <p>{error}</p>

      <button
        onClick={() =>
          window.location.reload()
        }
      >
        Try Again
      </button>

    </div>
  </div>
);


}

/* =====================================================
MAIN UI
===================================================== */

return ( <div className="my-courses-page">


  {/* PAGE HEADER */}

  <div className="my-courses-header">

    <div>

      <p className="page-label">
        LEARNING
      </p>

      <h1>
        My Courses
      </h1>

      <p className="page-description">
        Continue your learning
        journey and track your
        progress.
      </p>

    </div>

    <button
      className="browse-course-btn"
      onClick={() =>
        navigate("/browse")
      }
    >
      Browse Courses
      <ArrowRight size={14} />
    </button>

  </div>

  {/* STATS */}

  <div className="my-course-stats">

    <div className="my-stat-card">

      <div className="my-stat-icon">
        <BookOpen size={17} />
      </div>

      <div>

        <span>
          Total Courses
        </span>

        <strong>
          {myCourses.length}
        </strong>

      </div>

    </div>

    <div className="my-stat-card">

      <div className="my-stat-icon">
        <PlayCircle size={17} />
      </div>

      <div>

        <span>
          In Progress
        </span>

        <strong>
          {inProgressCourses}
        </strong>

      </div>

    </div>

    <div className="my-stat-card">

      <div className="my-stat-icon">
        <CheckCircle size={17} />
      </div>

      <div>

        <span>
          Completed
        </span>

        <strong>
          {completedCourses}
        </strong>

      </div>

    </div>

    <div className="my-stat-card">

      <div className="my-stat-icon">
        <Clock size={17} />
      </div>

      <div>

        <span>
          Learning Hours
        </span>

        <strong>
          {learningHours}
        </strong>

      </div>

    </div>

  </div>

  {/* TOOLBAR */}

  <div className="my-courses-toolbar">

    <div className="course-search">

      <Search size={15} />

      <input
        type="text"
        placeholder="Search your courses..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(
            e.target.value
          )
        }
      />

    </div>

    <div className="course-filters">

      <button
        className={
          filter === "all"
            ? "active"
            : ""
        }
        onClick={() =>
          setFilter("all")
        }
      >
        All
      </button>

      <button
        className={
          filter === "in-progress"
            ? "active"
            : ""
        }
        onClick={() =>
          setFilter(
            "in-progress"
          )
        }
      >
        In Progress
      </button>

      <button
        className={
          filter === "completed"
            ? "active"
            : ""
        }
        onClick={() =>
          setFilter(
            "completed"
          )
        }
      >
        Completed
      </button>

      <button
        className={
          filter === "not-started"
            ? "active"
            : ""
        }
        onClick={() =>
          setFilter(
            "not-started"
          )
        }
      >
        Not Started
      </button>

    </div>

  </div>

  {/* SECTION TITLE */}

  <div className="my-courses-title">

    <h2>
      Your Courses
    </h2>

    <span className="course-count">

      {filteredCourses.length}{" "}

      course
      {filteredCourses.length !== 1
        ? "s"
        : ""}

    </span>

  </div>

  {/* COURSE GRID */}

  {filteredCourses.length > 0 ? (

    <div className="my-course-grid">

      {filteredCourses.map(
        (course, index) => {
          const progress =
            getCourseProgress(
              course
            );

          const isCompleted =
            progress === 100;

          return (
            <div
              className="my-course-card"
              key={
                course.courseId ||
                course._id ||
                course.id ||
                index
              }
            >

              {/* Course Image */}

              <div className="my-course-image">

                {course.image ? (
                  <img
                    src={
                      course.image
                    }
                    alt={
                      course.title ||
                      "Course"
                    }
                  />
                ) : (
                  <div
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
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
                    }}
                  >
                    <GraduationCap
                      size={38}
                    />
                  </div>
                )}

                <span
                  className={`course-status ${
                    isCompleted
                      ? "completed"
                      : ""
                  }`}
                >
                  {isCompleted
                    ? "COMPLETED"
                    : progress > 0
                    ? "IN PROGRESS"
                    : "NOT STARTED"}
                </span>

              </div>

              {/* Course Content */}

              <div className="my-course-content">

                <div className="course-category-row">

                  <span>
                    {course.category ||
                      "Other"}
                  </span>

                  <span>
                    {course.level ||
                      "Beginner"}
                  </span>

                </div>

                <h3>
                  {course.title ||
                    "Untitled Course"}
                </h3>

                <p className="my-course-instructor">
                  By{" "}
                  {course.faculty ||
                    "Unknown Faculty"}
                </p>

                <div className="course-info-row">

                  <span>

                    <Clock size={11} />

                    {course.duration ||
                      "Self-paced"}

                  </span>

                  <span>

                    <BookOpen size={11} />

                    {course.totalLessons ||
                      lessonsList.filter(
                        (lesson) =>
                          String(
                            lesson.courseId ||
                              lesson.course_id ||
                              ""
                          ) ===
                          String(
                            course.courseId ||
                              course.id
                          )
                      ).length}{" "}
                    Lessons

                  </span>

                </div>

                <div className="my-progress-section">

                  <div className="my-progress-header">

                    <span>
                      Progress
                    </span>

                    <strong>
                      {progress}%
                    </strong>

                  </div>

                  <div className="my-progress-track">

                    <div
                      className="my-progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    ></div>

                  </div>

                </div>

                <button
                  className="continue-course-btn"
                  onClick={() =>
                    handleContinueCourse(
                      course
                    )
                  }
                >
                  {isCompleted
                    ? "Review Course"
                    : progress > 0
                    ? "Continue Learning"
                    : "Start Learning"}

                  <ArrowRight size={13} />

                </button>

              </div>

            </div>
          );
        }
      )}

    </div>

  ) : (

    /* EMPTY COURSES */

    <div className="empty-courses">

      <div className="empty-icon">
        <BookOpen size={22} />
      </div>

      <h3>
        {myCourses.length === 0
          ? "No Courses Yet"
          : "No Courses Found"}
      </h3>

      <p>
        {myCourses.length === 0
          ? "You have not enrolled in any courses yet."
          : "Try changing your search or filter."}
      </p>

      {myCourses.length === 0 && (
        <button
          onClick={() =>
            navigate("/browse")
          }
        >
          Browse Courses
        </button>
      )}

    </div>
  )}

  {/* BOTTOM CTA */}

  <div className="discover-courses">

    <div>

      <h2>
        Discover New Courses
      </h2>

      <p>
        Explore more courses and
        continue building your
        skills.
      </p>

    </div>

    <button
      className="discover-btn"
      onClick={() =>
        navigate("/browse")
      }
    >
      Browse Courses
      <ArrowRight size={13} />
    </button>

  </div>

</div>

);
};

export default Mycourses;
