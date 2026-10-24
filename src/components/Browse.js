import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Clock,
  BookOpen,
} from "lucide-react";

import "../css/Browse.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const Browse = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  const [courses, setCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendationLoading, setIsRecommendationLoading] =
    useState(true);

  // --------------------------------------------------
  // Get Student Session
  // --------------------------------------------------
  const getStudentSession = () => {
    try {
      const session = sessionStorage.getItem("studentSession");

      if (!session) {
        return null;
      }

      return JSON.parse(session);
    } catch (error) {
      console.error("Error reading student session:", error);
      return null;
    }
  };

  // --------------------------------------------------
  // Get Student JWT Token
  // --------------------------------------------------
  const getToken = () => {
    const studentSession = getStudentSession();

    if (studentSession?.token) {
      return studentSession.token;
    }

    return localStorage.getItem("studentToken") || null;
  };

  // --------------------------------------------------
  // Authentication Headers
  // --------------------------------------------------
  const getAuthHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // --------------------------------------------------
  // Handle Unauthorized Student
  // --------------------------------------------------
  const handleUnauthorized = () => {
    sessionStorage.removeItem("studentSession");
    sessionStorage.removeItem("studentQuizResult");
    sessionStorage.removeItem("selectedStudentQuiz");

    localStorage.removeItem("studentToken");

    window.dispatchEvent(new Event("userLoginChanged"));

    navigate("/login", {
      replace: true,
    });
  };

  // --------------------------------------------------
  // Load Published Courses From MongoDB
  // --------------------------------------------------
  const loadCourses = async () => {
    try {
      setIsLoading(true);

      const studentSession = getStudentSession();

      if (!studentSession) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const token = getToken();

      if (!token) {
        console.error("Student JWT token is missing.");

        navigate("/login", {
          replace: true,
        });
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/get-courses`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        console.error("Student JWT token is invalid or expired.");
        handleUnauthorized();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load courses."
        );
      }

const courseList = Array.isArray(result.data)
  ? result.data
  : [];

const publishedCourses = courseList.filter((course) => {
  const status = String(course.status || "")
    .toLowerCase()
    .trim();

  return status === "published" || status === "publish";
});

const coursesWithLessons = await Promise.all(
  publishedCourses.map(async (course) => {
    const courseId = course._id || course.id;

    try {
      const lessonsResponse = await fetch(
        `${API_BASE_URL}/api/get-lessons/${courseId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!lessonsResponse.ok) {
        return {
          ...course,
          id: courseId,
          lessons: 0,
          totalLessons: 0,
        };
      }

      const lessonsResult = await lessonsResponse.json();

      const lessons = Array.isArray(lessonsResult.data)
        ? lessonsResult.data
        : [];

      return {
        ...course,
        id: courseId,
        lessons: lessons.length,
        totalLessons: lessons.length,
      };
    } catch (error) {
      console.error(
        `Error loading lessons for course ${courseId}:`,
        error
      );

      return {
        ...course,
        id: courseId,
        lessons: 0,
        totalLessons: 0,
      };
    }
  })
);

setCourses(coursesWithLessons);
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // Load Recommended Courses
  // --------------------------------------------------
  const loadRecommendations = async () => {
    try {
      setIsRecommendationLoading(true);

      const studentSession = getStudentSession();

      if (!studentSession) {
        return;
      }

      const token = getToken();

      if (!token) {
        console.error(
          "Student JWT token is missing for recommendations."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/student/recommendations`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        console.error(
          "Student JWT token is invalid or expired."
        );
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load recommendations."
        );
      }

      const recommendationList = Array.isArray(result.data)
        ? result.data
        : [];

      const formattedRecommendations = recommendationList
        .filter((course) => course && typeof course === "object")
        .map((course) => ({
          ...course,
          id: course.courseId || course._id || course.id,
        }))
        .filter((course) => course.id);

      setRecommendedCourses(formattedRecommendations);
    } catch (error) {
      console.error(
        "Error loading recommendations:",
        error.message || error
      );

      // Keep the recommendation section available.
      // The UI will use fallback suggestions if this API fails.
      setRecommendedCourses([]);
    } finally {
      setIsRecommendationLoading(false);
    }
  };

  // --------------------------------------------------
  // Fallback Recommendations
  // Used only when recommendation API returns no courses
  // --------------------------------------------------
  const displayRecommendedCourses = useMemo(() => {
    if (recommendedCourses.length > 0) {
      return recommendedCourses;
    }

    // Fallback suggestions from published courses.
    // Prefer higher ratings, then higher student counts.
    return [...courses]
      .sort((a, b) => {
        const ratingDifference =
          Number(b.rating || 0) - Number(a.rating || 0);

        if (ratingDifference !== 0) {
          return ratingDifference;
        }

        return (
          Number(b.students || 0) -
          Number(a.students || 0)
        );
      })
      .slice(0, 3);
  }, [recommendedCourses, courses]);

  // --------------------------------------------------
  // Initial Load
  // --------------------------------------------------
  useEffect(() => {
    loadCourses();
    loadRecommendations();
  }, []);

  // --------------------------------------------------
  // Clear Filters
  // --------------------------------------------------
  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setSortBy("default");
  };

  // --------------------------------------------------
  // Get Categories Dynamically
  // --------------------------------------------------
  const categories = useMemo(() => {
    const categoryList = courses
      .map((course) => course.category)
      .filter(Boolean);

    return ["All", ...new Set(categoryList)];
  }, [courses]);

  // --------------------------------------------------
  // Filter + Search + Sort
  // --------------------------------------------------
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (selectedCategory !== "All") {
      result = result.filter(
        (course) =>
          String(course.category || "") === selectedCategory
      );
    }

    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter((course) => {
        const title = String(
          course.title || course.courseName || course.name || ""
        ).toLowerCase();

        const category = String(
          course.category || ""
        ).toLowerCase();

        const instructor = String(
          course.instructor ||
          course.faculty ||
          course.facultyName ||
          ""
        ).toLowerCase();

        const description = String(
          course.description || ""
        ).toLowerCase();

        return (
          title.includes(search) ||
          category.includes(search) ||
          instructor.includes(search) ||
          description.includes(search)
        );
      });
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating || 0) - Number(a.rating || 0)
      );
    }

    if (sortBy === "students") {
      result.sort(
        (a, b) =>
          Number(b.students || 0) -
          Number(a.students || 0)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        String(
          a.title || a.courseName || a.name || ""
        ).localeCompare(
          String(
            b.title || b.courseName || b.name || ""
          )
        )
      );
    }

    return result;
  }, [courses, selectedCategory, searchTerm, sortBy]);

  // --------------------------------------------------
  // Course Card
  // --------------------------------------------------
  const CourseCard = ({
    course,
    recommended = false,
  }) => {
    const courseId =
      course.id || course.courseId || course._id;

    const title =
      course.title ||
      course.courseName ||
      course.name ||
      "Untitled Course";

    const description =
      course.description ||
      "Learn practical skills through this course.";

    const instructor =
      course.instructor ||
      course.faculty ||
      course.facultyName ||
      "Faculty";

    const level = course.level || "Beginner";
    const category = course.category || "General";
    const rating = course.rating ?? 0;
    const students = Number(course.students || 0);
    const duration = course.duration || "Self paced";

    const lessons = Number(
      course.lessons || course.totalLessons || 0
    );

    const price = Number(course.price || 0);

    const image =
      course.image ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

    return (
      <div className="course-card">
        {recommended && (
          <div className="recommended-badge">
            🎯 Recommended For You
          </div>
        )}

        <div className="course-image">
          <img src={image} alt={title} />

          <span className="course-level">{level}</span>

          <span className="course-category">
            {category}
          </span>
        </div>

        <div className="course-body">
          <h3>{title}</h3>

          <p className="course-description">
            {description}
          </p>

          <div className="instructor">
            <span>By {instructor}</span>
          </div>

          <div className="course-meta">
            <div className="course-meta-item">
              <Clock size={12} />
              <span>{duration}</span>
            </div>

            <div className="course-meta-item">
              <BookOpen size={12} />
              <span>{lessons} Lessons</span>
            </div>

            {rating > 0 && (
              <div className="course-rating">
                <Star
                  size={12}
                  fill="currentColor"
                  className="star"
                />
                <span>{rating}</span>
              </div>
            )}
          </div>

          <div className="course-price">
            {price > 0 ? `₹${price}` : "Free"}
          </div>

          <div className="course-footer">
            <span className="courses-count">
              {students.toLocaleString()} students
            </span>

            <button
              type="button"
              className="course-button"
              onClick={() =>
                navigate("/course-details", {
                  state: {
                    course: {
                      ...course,
                      id: courseId,
                      title,
                      description,
                      instructor,
                      level,
                      category,
                      rating,
                      students,
                      duration,
                      lessons,
                      price,
                      image,
                    },
                  },
                })
              }
            >
              View Course
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // Page UI
  // --------------------------------------------------
  return (
    <div className="browse-page">
      {/* PAGE TITLE */}
      <div className="browse-hero">
        <h1>Browse Courses</h1>

        <p>
          Explore our courses and find the right one for your
          learning journey.
        </p>
      </div>

      {/* TOP CONTROLS */}
      <div className="browse-header">
        <div className="browse-top-controls">
          {/* Search */}
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />

            <input
              type="text"
              className="browse-search"
              placeholder="Search Courses"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter */}
          <button
            type="button"
            className={`top-filter-button ${
              showFilters ? "active" : ""
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
          </button>

          {/* Sort */}
          <select
            className="browse-sort"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="default">Sort By</option>
            <option value="rating">Highest Rating</option>
            <option value="students">Most Students</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* FILTER DROPDOWN */}
        {showFilters && (
          <div className="filter-dropdown">
            <div className="filter-dropdown-header">
              <div>
                <h3>Filters</h3>
                <p>Filter courses by category</p>
              </div>

              <button
                type="button"
                className="filter-close"
                onClick={() => setShowFilters(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="dropdown-filter-section">
              <h4>Category</h4>

              <div className="dropdown-category-options">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={
                      selectedCategory === category
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedCategory(category)
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-dropdown-footer">
              <button
                type="button"
                className="clear-filter-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

              <button
                type="button"
                className="apply-filter-button"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* COURSE AREA */}
      <section className="browse-courses-area">
        {/* RECOMMENDED COURSES */}
        {!isRecommendationLoading &&
          displayRecommendedCourses.length > 0 && (
            <div className="recommended-section">
              <div className="recommended-header">
                <div>
                  <h2>🎯 Recommended Courses</h2>

                  <p>
                    Courses recommended for your learning
                    journey.
                  </p>
                </div>
              </div>

              <div className="courses-grid">
                {displayRecommendedCourses.map((course) => (
                  <CourseCard
                    key={
                      course.id ||
                      course.courseId ||
                      course._id
                    }
                    course={course}
                    recommended={true}
                  />
                ))}
              </div>
            </div>
          )}

        {/* ALL COURSES TOOLBAR */}
        <div className="courses-toolbar">
          <span className="courses-count">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1
              ? "course"
              : "courses"}{" "}
            found
          </span>

          {selectedCategory !== "All" && (
            <span className="courses-count">
              Category: {selectedCategory}
            </span>
          )}
        </div>

        {/* ALL COURSES */}
        {isLoading ? (
          <div className="no-courses">
            <h3>Loading courses...</h3>
            <p>Please wait while courses are loading.</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <CourseCard
                key={
                  course.id ||
                  course.courseId ||
                  course._id
                }
                course={course}
              />
            ))}
          </div>
        ) : (
          <div className="no-courses">
            <h3>No courses found</h3>

            <p>
              {courses.length === 0
                ? "No published courses are available yet."
                : "Try changing your search or category filter."}
            </p>

            {courses.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>

    </div>
  );
};

export default Browse;