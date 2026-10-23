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
  Pencil,
  Save,
  X,
  Mail,
  Phone,
  BriefcaseBusiness,
  GraduationCap,
  BookOpenCheck,
  UsersRound,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../css/FacultyProfile.css";
import "../css/FacultyDashboard.css";

const API_BASE_URL =
  "https://project-final-backend-oeh1.onrender.com";

const FacultyProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [faculty, setFaculty] =
    useState(null);

  const [isEditing, setIsEditing] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      department: "",
      specialization: "",
      experience: "",
      education: "",
      bio: "",
    });

  const [
    assignedCourses,
    setAssignedCourses,
  ] = useState([]);

  const [totalStudents, setTotalStudents] =
    useState(0);

  const [totalLessons, setTotalLessons] =
    useState(0);

  const [loadingStats, setLoadingStats] =
    useState(false);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  // =====================================
  // GET LOGGED IN FACULTY
  // =====================================

  const getLoggedInFaculty = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem(
          "facultySession"
        ) || "null"
      );
    } catch (error) {
      return null;
    }
  };

  // =====================================
  // GET FACULTY ID
  // =====================================

  const getFacultyId = (
    loggedFaculty
  ) => {
    if (!loggedFaculty) {
      return "";
    }

    return (
      loggedFaculty._id ||
      loggedFaculty.id ||
      loggedFaculty.facultyId ||
      loggedFaculty.userId ||
      ""
    );
  };

  // =====================================
  // GET FACULTY TOKEN
  // =====================================

  const getFacultyToken = () => {
    return localStorage.getItem(
      "facultyToken"
    );
  };

  // =====================================
  // GET FACULTY AUTH HEADERS
  // =====================================

  const getFacultyAuthHeaders = () => {
    const token =
      getFacultyToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type":
        "application/json",
    };
  };

  // =====================================
  // GET FACULTY NAME
  // =====================================

  const getFacultyName = (
    facultyData
  ) => {
    if (!facultyData) {
      return "Faculty";
    }

    return (
      facultyData.name ||
      facultyData.fullName ||
      facultyData.username ||
      facultyData.firstName ||
      "Faculty"
    );
  };

  // =====================================
  // SET PROFILE FORM
  // =====================================

  const setProfileForm = (
    facultyData
  ) => {
    setFormData({
      name:
        facultyData?.name ||
        "",

      email:
        facultyData?.email ||
        "",

      phone:
        facultyData?.phone ||
        "",

      department:
        facultyData?.department ||
        "",

      specialization:
        facultyData?.specialization ||
        "",

      experience:
        facultyData?.experience ||
        "",

      education:
        facultyData?.education ||
        facultyData?.qualification ||
        "",

      bio:
        facultyData?.bio ||
        "",
    });
  };

  // =====================================
  // LOAD FACULTY PROFILE FROM MONGODB
  // =====================================

  const loadProfile = async () => {
    const loggedFaculty =
      getLoggedInFaculty();

    if (!loggedFaculty) {
      setFaculty(null);
      setAssignedCourses([]);
      setTotalStudents(0);
      setTotalLessons(0);
      return;
    }

    const facultyId =
      getFacultyId(loggedFaculty);

    if (!facultyId) {
      setProfileError(
        "Faculty information could not be identified."
      );
      return;
    }

    const facultyToken =
      getFacultyToken();

    if (!facultyToken) {
      setProfileError(
        "Faculty authentication token not found. Please login again."
      );
      return;
    }

    setLoadingStats(true);
    setProfileError("");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/faculty-profile/${facultyId}`,
          {
            headers:
              getFacultyAuthHeaders(),
          }
        );

      const result =
        await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
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

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load faculty profile."
        );
      }

      const profile =
        result.data?.profile ||
        null;

      const courses =
        Array.isArray(
          result.data?.courses
        )
          ? result.data.courses
          : [];

      const statistics =
        result.data?.statistics ||
        {};

      if (!profile) {
        throw new Error(
          "Faculty profile data not found."
        );
      }

      // =====================================
      // SET PROFILE
      // =====================================

      setFaculty(profile);

      setProfileForm(profile);

      // =====================================
      // SET COURSES
      // =====================================

      setAssignedCourses(
        courses
      );

      // =====================================
      // SET STATISTICS
      // =====================================

      setTotalStudents(
        Number(
          statistics.totalStudents ||
            0
        )
      );

      setTotalLessons(
        Number(
          statistics.totalLessons ||
            0
        )
      );

    } catch (error) {
      console.error(
        "Faculty profile load error:",
        error
      );

      setProfileError(
        error.message ||
          "Unable to load faculty profile."
      );

      setAssignedCourses([]);
      setTotalStudents(0);
      setTotalLessons(0);

    } finally {
      setLoadingStats(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    loadProfile();

    const handleFacultyChange =
      () => {
        loadProfile();
      };

    window.addEventListener(
      "userLoginChanged",
      handleFacultyChange
    );

    window.addEventListener(
      "facultyUpdated",
      handleFacultyChange
    );

    window.addEventListener(
      "facultyProfileUpdated",
      handleFacultyChange
    );

    return () => {
      window.removeEventListener(
        "userLoginChanged",
        handleFacultyChange
      );

      window.removeEventListener(
        "facultyUpdated",
        handleFacultyChange
      );

      window.removeEventListener(
        "facultyProfileUpdated",
        handleFacultyChange
      );
    };
  }, []);

  // =====================================
  // ACTIVE SIDEBAR
  // =====================================

  const isActive = (path) => {
    return (
      location.pathname === path
    );
  };

  // =====================================
  // LOGOUT
  // =====================================

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

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================
  // FORM CHANGE
  // =====================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  // =====================================
  // SAVE PROFILE TO MONGODB
  // =====================================

  const handleSave = async () => {
    const loggedFaculty =
      getLoggedInFaculty();

    if (!loggedFaculty) {
      return;
    }

    const facultyId =
      getFacultyId(
        loggedFaculty
      );

    if (!facultyId) {
      setProfileError(
        "Faculty ID not found."
      );
      return;
    }

    const facultyToken =
      getFacultyToken();

    if (!facultyToken) {
      setProfileError(
        "Faculty authentication token not found. Please login again."
      );
      return;
    }

    setSavingProfile(true);
    setProfileError("");

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/update-user/${facultyId}`,
          {
            method: "PUT",

            headers:
              getFacultyAuthHeaders(),

            body: JSON.stringify({
              name:
                formData.name,

              email:
                formData.email,

              phone:
                formData.phone,

              department:
                formData.department,

              specialization:
                formData.specialization,

              experience:
                formData.experience,

              education:
                formData.education,

              bio:
                formData.bio,
            }),
          }
        );

      const result =
        await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
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

        navigate("/login", {
          replace: true,
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update profile."
        );
      }

      const updatedFaculty =
        result.data;

      // =====================================
      // UPDATE LOCAL COMPONENT STATE
      // =====================================

      setFaculty(
        updatedFaculty
      );

      setProfileForm(
        updatedFaculty
      );

      // =====================================
      // UPDATE SESSION ONLY
      // =====================================
      // Session storage is used only for
      // logged-in identity, not profile storage.

      const currentSession =
        getLoggedInFaculty() ||
        {};

      const updatedSession = {
        ...currentSession,
        ...updatedFaculty,
        _id:
          updatedFaculty._id ||
          currentSession._id,
        id:
          updatedFaculty._id ||
          currentSession.id,
      };

      sessionStorage.setItem(
        "facultySession",
        JSON.stringify(
          updatedSession
        )
      );

      setIsEditing(false);

      window.dispatchEvent(
        new Event(
          "facultyProfileUpdated"
        )
      );

      window.dispatchEvent(
        new Event(
          "userLoginChanged"
        )
      );

    } catch (error) {
      console.error(
        "Faculty profile save error:",
        error
      );

      setProfileError(
        error.message ||
          "Unable to update faculty profile."
      );

    } finally {
      setSavingProfile(false);
    }
  };

  // =====================================
  // CANCEL EDIT
  // =====================================

  const handleCancel = () => {
    if (!faculty) {
      return;
    }

    setProfileForm(
      faculty
    );

    setIsEditing(false);

    setProfileError("");
  };

  // =====================================
  // FACULTY NAME
  // =====================================

  const facultyName =
    getFacultyName(
      faculty
    );

  // =====================================
  // INITIALS
  // =====================================

  const getInitials = (
    name
  ) => {
    if (!name) {
      return "FC";
    }

    const words =
      name
        .trim()
        .split(/\s+/);

    if (
      words.length >= 2
    ) {
      return (
        words[0].charAt(0) +
        words[
          words.length - 1
        ].charAt(0)
      ).toUpperCase();
    }

    return name
      .substring(0, 2)
      .toUpperCase();
  };

  // =====================================
  // COURSE COUNT
  // =====================================

  const courseCount =
    useMemo(() => {
      return assignedCourses.length;
    }, [assignedCourses]);

  // =====================================
  // NOT LOGGED IN
  // =====================================

  if (!faculty) {
    return (
      <div className="faculty-profile-page">

        <div className="faculty-profile-login-message">

          <UserRound size={42} />

          <h2>
            Faculty Login Required
          </h2>

          <p>
            Please login as faculty to
            view your profile.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
          >
            Go to Login
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="faculty-layout">

      {/* =================================
          SIDEBAR
      ================================= */}

      <aside className="faculty-sidebar">

        <div className="faculty-logo">

          <div className="faculty-brand-mark">
            <span></span>
          </div>

          <div className="faculty-brand-text">
            LearnDesk
          </div>

        </div>

        <nav className="faculty-nav">

          <div
            className={`faculty-nav-item ${
              isActive("/faculty")
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate("/faculty")
            }
          >
            <LayoutDashboard
              size={19}
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
            onClick={() =>
              navigate(
                "/faculty/courses"
              )
            }
          >
            <BookOpen
              size={19}
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
            onClick={() =>
              navigate(
                "/faculty/students"
              )
            }
          >
            <Users
              size={19}
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
            onClick={() =>
              navigate(
                "/faculty/progress"
              )
            }
          >
            <ChartNoAxesCombined
              size={19}
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
            onClick={() =>
              navigate(
                "/faculty/quiz"
              )
            }
          >
            <ClipboardCheck
              size={19}
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
            onClick={() =>
              navigate(
                "/faculty/profile"
              )
            }
          >
            <UserRound
              size={19}
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
            size={19}
          />

          <span>
            Logout
          </span>
        </div>

      </aside>

      {/* =================================
          MAIN
      ================================= */}

      <main className="faculty-main">

        <header className="faculty-topbar">

          <div>

            <h1>
              My Profile
            </h1>

          </div>

        </header>

        <br></br>

        <section className="faculty-page-content">

          {/* =================================
              PROFILE ERROR
          ================================= */}

          {profileError && (
            <div
              style={{
                marginBottom:
                  "18px",

                padding:
                  "12px 14px",

                borderRadius:
                  "9px",

                border:
                  "1px solid #f3caca",

                background:
                  "#fff7f7",

                color:
                  "#c0392b",

                fontSize:
                  "12px",
              }}
            >
              {profileError}
            </div>
          )}

          {/* =================================
              PROFILE HEADER
          ================================= */}

          <div className="faculty-profile-header">

            <div className="faculty-profile-identity">

              <div className="faculty-profile-avatar">
                {getInitials(
                  facultyName
                )}
              </div>

              <div>

                <p className="faculty-profile-label">
                  FACULTY PROFILE
                </p>

                <h2>
                  {facultyName}
                </h2>

                <p>
                  {formData.specialization ||
                    formData.department ||
                    "Faculty Member"}
                </p>

                <span className="faculty-profile-email">

                  <Mail
                    size={14}
                  />

                  {formData.email ||
                    "Email not available"}

                </span>

              </div>

            </div>

            {!isEditing ? (

              <button
                type="button"
                className="faculty-edit-profile-btn"
                onClick={() =>
                  setIsEditing(true)
                }
              >
                <Pencil
                  size={17}
                />

                Edit Profile
              </button>

            ) : (

              <div className="faculty-profile-edit-actions">

                <button
                  type="button"
                  className="faculty-profile-cancel-btn"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    savingProfile
                  }
                >
                  <X
                    size={17}
                  />

                  Cancel
                </button>

                <button
                  type="button"
                  className="faculty-profile-save-btn"
                  onClick={
                    handleSave
                  }
                  disabled={
                    savingProfile
                  }
                >
                  <Save
                    size={17}
                  />

                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            )}

          </div>

          {/* =================================
              STATS
          ================================= */}

          <div className="faculty-profile-stats">

            <div className="faculty-profile-stat">

              <div className="faculty-profile-stat-icon courses">

                <BookOpenCheck
                  size={21}
                />

              </div>

              <div>

                <span>
                  Assigned Courses
                </span>

                <strong>
                  {loadingStats
                    ? "..."
                    : courseCount}
                </strong>

              </div>

            </div>

            <div className="faculty-profile-stat">

              <div className="faculty-profile-stat-icon students">

                <UsersRound
                  size={21}
                />

              </div>

              <div>

                <span>
                  Total Students
                </span>

                <strong>
                  {loadingStats
                    ? "..."
                    : totalStudents}
                </strong>

              </div>

            </div>

            <div className="faculty-profile-stat">

              <div className="faculty-profile-stat-icon lessons">

                <BookOpen
                  size={21}
                />

              </div>

              <div>

                <span>
                  Total Lessons
                </span>

                <strong>
                  {loadingStats
                    ? "..."
                    : totalLessons}
                </strong>

              </div>

            </div>

          </div>

          {/* =================================
              PROFILE CONTENT
          ================================= */}

          <div className="faculty-profile-grid">

            {/* LEFT */}

            <div className="faculty-profile-card">

              <div className="faculty-profile-card-header">

                <div>

                  <h3>
                    Personal Information
                  </h3>

                  <p>
                    Your basic faculty
                    information.
                  </p>

                </div>

                <UserRound
                  size={20}
                />

              </div>

              <div className="faculty-profile-form-grid">

                {/* NAME */}

                <div className="faculty-profile-field">

                  <label>
                    Full Name
                  </label>

                  {isEditing ? (

                    <input
                      type="text"
                      name="name"
                      value={
                        formData.name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your name"
                      disabled={
                        savingProfile
                      }
                    />

                  ) : (

                    <div className="faculty-profile-value">

                      {formData.name ||
                        "Not available"}

                    </div>

                  )}

                </div>

                {/* EMAIL */}

                <div className="faculty-profile-field">

                  <label>
                    Email
                  </label>

                  {isEditing ? (

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter email"
                      disabled={
                        savingProfile
                      }
                    />

                  ) : (

                    <div className="faculty-profile-value">

                      <Mail
                        size={15}
                      />

                      {formData.email ||
                        "Not available"}

                    </div>

                  )}

                </div>

                {/* PHONE */}

                <div className="faculty-profile-field">

                  <label>
                    Phone
                  </label>

                  {isEditing ? (

                    <input
                      type="text"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter phone number"
                      disabled={
                        savingProfile
                      }
                    />

                  ) : (

                    <div className="faculty-profile-value">

                      <Phone
                        size={15}
                      />

                      {formData.phone ||
                        "Not available"}

                    </div>

                  )}

                </div>

                {/* DEPARTMENT */}

                <div className="faculty-profile-field">

                  <label>
                    Department
                  </label>

                  {isEditing ? (

                    <input
                      type="text"
                      name="department"
                      value={
                        formData.department
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter department"
                      disabled={
                        savingProfile
                      }
                    />

                  ) : (

                    <div className="faculty-profile-value">

                      <BriefcaseBusiness
                        size={15}
                      />

                      {formData.department ||
                        "Not available"}

                    </div>

                  )}

                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div className="faculty-profile-card">

              <div className="faculty-profile-card-header">

                <div>

                  <h3>
                    Professional Information
                  </h3>

                  <p>
                    Your teaching and
                    professional details.
                  </p>

                </div>

                <GraduationCap
                  size={20}
                />

              </div>

              <div className="faculty-profile-form-grid">

                {/* SPECIALIZATION */}

                <div className="faculty-profile-field">

                  <label>
                    Specialization
                  </label>

                  {isEditing ? (

                    <input
                      type="text"
                      name="specialization"
                      value={
                        formData.specialization
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Data Science"
                      disabled={
                        savingProfile
                      }
                    />

                  ) : (

                    <div className="faculty-profile-value">

                      {formData.specialization ||
                        "Not available"}

                    </div>

                  )}

                </div>

                {/* EXPERIENCE */}

                <div className="faculty-profile-field">

                  <label>
                    Experience
                  </label>

                  {isEditing ? (

                    <input
                      type="text"
                      name="experience"
                      value={
                        formData.experience
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 5 Years"
                      disabled={
                        savingProfile
                      }
                    />

                  ) : (

                    <div className="faculty-profile-value">

                      {formData.experience ||
                        "Not available"}

                    </div>

                  )}

                </div>

                {/* EDUCATION */}

                <div className="faculty-profile-field full">

                  <label>
                    Education
                  </label>

                  {isEditing ? (

                    <input
                      type="text"
                      name="education"
                      value={
                        formData.education
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. M.Tech Computer Science"
                      disabled={
                        savingProfile
                      }
                    />

                  ) : (

                    <div className="faculty-profile-value">

                      <GraduationCap
                        size={15}
                      />

                      {formData.education ||
                        "Not available"}

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

          {/* =================================
              ASSIGNED COURSES
          ================================= */}

          <div className="faculty-profile-card faculty-profile-courses">

            <div className="faculty-profile-card-header">

              <div>

                <h3>
                  Assigned Courses
                </h3>

                <p>
                  Courses currently assigned
                  to you.
                </p>

              </div>

              <BookOpen
                size={20}
              />

            </div>

            {loadingStats ? (

              <div className="faculty-profile-no-courses">

                <BookOpen
                  size={28}
                />

                <h4>
                  Loading Courses...
                </h4>

                <p>
                  Fetching your assigned
                  courses.
                </p>

              </div>

            ) : assignedCourses.length ===
              0 ? (

              <div className="faculty-profile-no-courses">

                <BookOpen
                  size={28}
                />

                <h4>
                  No Courses Assigned
                </h4>

                <p>
                  Courses assigned by the
                  administrator will appear
                  here.
                </p>

              </div>

            ) : (

              <div className="faculty-profile-course-list">

                {assignedCourses.map(
                  (
                    course,
                    index
                  ) => {

                    const courseName =
                      course.title ||
                      course.courseName ||
                      course.name ||
                      `Course ${
                        index + 1
                      }`;

                    const courseId =
                      course._id ||
                      course.id ||
                      course.courseId ||
                      index;

                    return (
                      <div
                        className="faculty-profile-course-item"
                        key={
                          courseId
                        }
                      >

                        <div className="faculty-profile-course-icon">

                          <BookOpen
                            size={18}
                          />

                        </div>

                        <div className="faculty-profile-course-info">

                          <strong>
                            {courseName}
                          </strong>

                          <span>
                            {course.category ||
                              course.level ||
                              "Course"}
                          </span>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/faculty/course-details",
                              {
                                state: {
                                  course,
                                },
                              }
                            )
                          }
                        >
                          View
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </section>

      </main>

    </div>
  );
};

export default FacultyProfile;