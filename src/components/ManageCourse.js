import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  BookOpen,
  Users,
  IndianRupee,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";

import "../css/ManageCourse.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const ManageCourse = () => {
  /* =========================
     ADMIN TOKEN
  ========================= */

  const getAdminToken = () => {
    return localStorage.getItem("adminToken");
  };

  /* =========================
     FACULTY HELPERS
  ========================= */

  const getFacultyName = (faculty) => {
    if (!faculty) return "Unnamed Faculty";

    return (
      faculty.name ||
      faculty.fullName ||
      faculty.facultyName ||
      faculty.username ||
      faculty.userName ||
      "Unnamed Faculty"
    );
  };

  const getFacultyEmail = (faculty) => {
    if (!faculty) return "";

    return String(
      faculty.email || faculty.facultyEmail || ""
    )
      .toLowerCase()
      .trim();
  };

  /* =========================
     COURSE TYPE
  ========================= */

  const getCourseType = (course) => {
    const rawType = course?.courseType ?? course?.type ?? "";
    const normalizedType = String(rawType).trim().toLowerCase();

    if (
      normalizedType === "free" ||
      normalizedType === "free course" ||
      Number(course?.price) === 0
    ) {
      return "free";
    }

    return "paid";
  };

  /* =========================
     STATUS
  ========================= */

  const getCourseStatus = (course) => {
    const rawStatus =
      course?.status ??
      course?.courseStatus ??
      course?.approvalStatus ??
      "draft";

    const normalizedStatus = String(rawStatus)
      .trim()
      .toLowerCase();

    const validStatuses = [
      "draft",
      "pending",
      "published",
      "rejected",
    ];

    return validStatuses.includes(normalizedStatus)
      ? normalizedStatus
      : "draft";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "published":
        return "Published";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
      case "draft":
      default:
        return "Draft";
    }
  };

  /* =========================
     STATES
  ========================= */

  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formErrors, setFormErrors] = useState({});

  const initialFormData = {
    title: "",
    description: "",
    image: "",
    level: "Beginner",
    duration: "4 Weeks",
    faculty: "",
    facultyId: "",
    facultyEmail: "",
    category: "Programming",
    courseType: "free",
    price: 0,
    status: "draft",
  };

  const [formData, setFormData] = useState(initialFormData);

  /* =========================
     ADMIN AUTH CHECK
  ========================= */

  const handleUnauthorized = () => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminSession");
    sessionStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/admin-login";
  };

  /* =========================
     LOAD FACULTY
  ========================= */

  const loadFaculty = async () => {
    try {
      const token = getAdminToken();

      if (!token) {
        console.error("Admin token not found.");
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/get-userdata`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!data.success) {
        console.error("Error loading faculty:", data.message);
        setFacultyList([]);
        return;
      }

      const facultyArray = Array.isArray(data.data)
        ? data.data
            .filter(
              (user) =>
                user.role === "faculty" &&
                String(user.status || "pending")
                  .toLowerCase()
                  .trim() === "approved"
            )
            .map((faculty) => ({
              ...faculty,
              id: faculty._id,
            }))
        : [];

      setFacultyList(facultyArray);
    } catch (error) {
      console.error("Error loading faculty:", error);
      setFacultyList([]);
    }
  };

  /* =========================
     LOAD COURSES
  ========================= */

  const loadCourses = async () => {
    try {
      setIsLoading(true);

      const token = getAdminToken();

      if (!token) {
        console.error("Admin token not found.");
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin-courses`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!data.success) {
        console.error("Error loading courses:", data.message);
        setCourses([]);
        return;
      }

      const formattedCourses = Array.isArray(data.data)
        ? data.data.map((course) => {
            const courseType = getCourseType(course);

            return {
              ...course,
              id: course._id,
              title: course.title || "Untitled Course",
              description: course.description || "",
              level: course.level || "Beginner",
              duration: course.duration || "4 Weeks",
              faculty: course.faculty || "Not Assigned",
              facultyId: course.facultyId || "",
              facultyEmail: course.facultyEmail || "",
              category: course.category || "Programming",
              courseType,
              type: courseType,
              price:
                courseType === "free"
                  ? 0
                  : Number(course.price) >= 0
                  ? Number(course.price)
                  : 0,
              students:
                Number(course.students) >= 0
                  ? Number(course.students)
                  : 0,
              status: getCourseStatus(course),
              image: course.image || "",
            };
          })
        : [];

      setCourses(formattedCourses);
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================
     INITIAL LOAD
  ========================= */

 const firstErrorRef = useRef(null);

useEffect(() => {
  if (Object.keys(formErrors).length > 0) {
    firstErrorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    firstErrorRef.current?.focus({
      preventScroll: true,
    });
  }
}, [formErrors]);

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================
     COURSE TYPE CHANGE
  ========================= */

  const handleCourseTypeChange = (e) => {
    const courseType = e.target.value;

    setFormData((prev) => ({
      ...prev,
      courseType,
      price:
        courseType === "free"
          ? 0
          : prev.price === 0
          ? ""
          : prev.price,
    }));

    setFormErrors((prev) => ({
      ...prev,
      price: "",
    }));
  };

  /* =========================
     IMAGE CHANGE
  ========================= */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Image size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  /* =========================
     FACULTY CHANGE
  ========================= */

  const handleFacultyChange = (e) => {
    const facultyId = e.target.value;

    const selectedFaculty = facultyList.find(
      (faculty) => String(faculty.id) === String(facultyId)
    );

    setFormData((prev) => ({
      ...prev,
      facultyId,
      faculty: selectedFaculty
        ? getFacultyName(selectedFaculty)
        : "",
      facultyEmail: selectedFaculty
        ? getFacultyEmail(selectedFaculty)
        : "",
    }));

    setFormErrors((prev) => ({
      ...prev,
      facultyId: "",
    }));
  };

  /* =========================
     OPEN ADD MODAL
  ========================= */

  const openAddModal = () => {
    setEditingCourse(null);
    setFormErrors({});
    setFormData({ ...initialFormData });
    setShowModal(true);
  };

  /* =========================
     OPEN EDIT MODAL
  ========================= */

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormErrors({});

    let matchedFaculty = null;

    if (course.facultyId) {
      matchedFaculty = facultyList.find(
        (faculty) =>
          String(faculty.id) === String(course.facultyId)
      );
    }

    if (!matchedFaculty && course.faculty) {
      matchedFaculty = facultyList.find(
        (faculty) =>
          getFacultyName(faculty).trim().toLowerCase() ===
          String(course.faculty).trim().toLowerCase()
      );
    }

    const courseType = getCourseType(course);

    setFormData({
      title: course.title || "",
      description: course.description || "",
      image: course.image || "",
      level: course.level || "Beginner",
      duration: course.duration || "4 Weeks",
      faculty: matchedFaculty
        ? getFacultyName(matchedFaculty)
        : course.faculty || "",
      facultyId: matchedFaculty
        ? matchedFaculty.id
        : course.facultyId || "",
      facultyEmail: matchedFaculty
        ? getFacultyEmail(matchedFaculty)
        : course.facultyEmail || "",
      category: course.category || "Programming",
      courseType,
      price:
        courseType === "free"
          ? 0
          : course.price !== undefined
          ? course.price
          : "",
      status: getCourseStatus(course),
    });

    setShowModal(true);
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeModal = () => {
    if (isSaving) return;

    setShowModal(false);
    setEditingCourse(null);
    setFormErrors({});
  };

  /* =========================
     SUBMIT COURSE
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Please enter course title.";
    }

    if (!formData.duration.trim()) {
      errors.duration = "Please enter course duration.";
    }

    if (!formData.facultyId) {
      errors.facultyId = "Please select faculty.";
    }

    if (formData.courseType === "paid") {
      const price = Number(formData.price);

      if (
        formData.price === "" ||
        !Number.isFinite(price) ||
        price <= 0
      ) {
        errors.price = "Please enter a price greater than 0.";
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const selectedFaculty = facultyList.find(
      (faculty) =>
        String(faculty.id) === String(formData.facultyId)
    );

    if (!selectedFaculty) {
      setFormErrors((prev) => ({
        ...prev,
        facultyId: "Selected faculty is not available.",
      }));
      return;
    }

    /* COURSE TYPE */

    const selectedCourseType =
      formData.courseType === "free" ? "free" : "paid";

    /* PRICE */

    let selectedPrice = 0;

    if (selectedCourseType === "paid") {
      selectedPrice = Number(formData.price);
    }

    /* COURSE DATA */

    const courseData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      image: formData.image || "",
      level: formData.level,
      duration: formData.duration.trim(),
      faculty: getFacultyName(selectedFaculty),
      facultyId: selectedFaculty.id,
      facultyEmail: getFacultyEmail(selectedFaculty),
      category: formData.category,
      courseType: selectedCourseType,
      price: selectedPrice,
      status: formData.status,
    };

    try {
      setIsSaving(true);

      const token = getAdminToken();

      if (!token) {
        alert("Admin session expired. Please login again.");
        handleUnauthorized();
        return;
      }

      let response;

      /* EDIT COURSE */

      if (editingCourse) {
        response = await fetch(
          `${API_BASE_URL}/api/admin/update-course/${editingCourse.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
          }
        );
      } else {
        /* ADD COURSE */

        response = await fetch(
          `${API_BASE_URL}/api/admin/add-course`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
          }
        );
      }

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Unable to save course.");
        return;
      }

      alert(
        editingCourse
          ? "Course updated successfully."
          : "Course added successfully."
      );

      await loadCourses();
      closeModal();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Unable to connect to server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  /* =========================
     DELETE COURSE
  ========================= */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      const token = getAdminToken();

      if (!token) {
        alert("Admin session expired. Please login again.");
        handleUnauthorized();
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/delete-course/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!data.success) {
        alert(data.message || "Unable to delete course.");
        return;
      }

      alert("Course deleted successfully.");
      await loadCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Unable to connect to server. Please try again.");
    }
  };

useEffect(() => {
  loadCourses();
  loadFaculty();
}, []);

  /* =========================
     INITIALS
  ========================= */

  const getInitials = (name) => {
    if (!name) return "NA";

    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
      return (
        words[0].charAt(0) + words[1].charAt(0)
      ).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  /* =========================
     FILTER
  ========================= */

  const filteredCourses = courses.filter((course) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      course.title?.toLowerCase().includes(searchText) ||
      course.faculty?.toLowerCase().includes(searchText) ||
      course.category?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" ||
      getCourseStatus(course) === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* =========================
     SUMMARY
  ========================= */

  const totalCourses = courses.length;

  const publishedCourses = courses.filter(
    (course) => getCourseStatus(course) === "published"
  ).length;

  const pendingCourses = courses.filter(
    (course) => getCourseStatus(course) === "pending"
  ).length;

  const draftCourses = courses.filter(
    (course) => getCourseStatus(course) === "draft"
  ).length;

  /* =========================
     UI
  ========================= */

  return (
    <div className="manage-course-page">
      {/* PAGE HEADER */}

      <div className="manage-course-header">
        <div>
          <h1>Manage Courses</h1>
          <p>Create, edit and manage all platform courses.</p>
        </div>

        <button
          type="button"
          className="add-course-btn"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="course-summary">
        <div className="course-summary-card">
          <div className="summary-icon all">
            <BookOpen size={19} />
          </div>
          <div>
            <span>Total Courses</span>
            <strong>{totalCourses}</strong>
          </div>
        </div>

        <div className="course-summary-card">
          <div className="summary-icon published">
            <CheckCircle size={19} />
          </div>
          <div>
            <span>Published</span>
            <strong>{publishedCourses}</strong>
          </div>
        </div>

        <div className="course-summary-card">
          <div className="summary-icon pending">
            <Clock size={19} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{pendingCourses}</strong>
          </div>
        </div>

        <div className="course-summary-card">
          <div className="summary-icon draft">
            <FileText size={19} />
          </div>
          <div>
            <span>Draft</span>
            <strong>{draftCourses}</strong>
          </div>
        </div>
      </div>

      {/* COURSES CARD */}

      <div className="courses-card">
        <div className="courses-toolbar">
          <div>
            <h2>All Courses</h2>
            <p>
              {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="course-filters">
            <div className="course-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* TABLE */}

        <div className="course-table-wrapper">
          <table className="course-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Faculty</th>
                <th>Category</th>
                <th>Type</th>
                <th>Price</th>
                <th>Students</th>
                <th style={{ width: "130px", minWidth: "130px" }}>
                  Status
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="no-courses">
                    Loading courses...
                  </td>
                </tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => {
                  const status = getCourseStatus(course);
                  const statusLabel = getStatusLabel(status);
                  const courseType = getCourseType(course);

                  return (
                    <tr key={course.id}>
                      {/* COURSE */}

                      <td>
                        <div className="course-info">
                          <div className="course-icon">
                            {course.image ? (
                              <img
                                src={course.image}
                                alt={course.title}
                              />
                            ) : (
                              <BookOpen size={18} />
                            )}
                          </div>

                          <div className="course-title-info">
                            <strong>{course.title}</strong>
                            <span>
                              {course.level} {" • "} {course.duration}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* FACULTY */}

                      <td>
                        <div className="faculty-info">
                          <div className="faculty-avatar">
                            {getInitials(course.faculty)}
                          </div>
                          <span>{course.faculty}</span>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td>
                        <span className="category-text">
                          {course.category}
                        </span>
                      </td>

                      {/* COURSE TYPE */}

                      <td>
                        <span
                          className={`course-type-badge ${
                            courseType === "free"
                              ? "course-type-free"
                              : "course-type-paid"
                          }`}
                        >
                          {courseType === "free" ? "Free" : "Paid"}
                        </span>
                      </td>

                      {/* PRICE */}

                      <td>
                        {courseType === "free" ? (
                          <span className="price-text free-price">
                            Free
                          </span>
                        ) : (
                          <span className="price-text">
                            ₹
                            {Number(course.price || 0).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        )}
                      </td>

                      {/* STUDENTS */}

                      <td>
                        <div className="student-count">
                          <Users size={15} />
                          <span>
                            {Number(course.students || 0).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td
                        style={{
                          width: "130px",
                          minWidth: "130px",
                          padding: "13px 18px",
                          whiteSpace: "nowrap",
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          className={`course-status-badge status-${status}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "72px",
                            height: "26px",
                            padding: "0 10px",
                            borderRadius: "20px",
                            fontSize: "10px",
                            fontWeight: 650,
                            lineHeight: "1",
                            whiteSpace: "nowrap",
                            background:
                              status === "published"
                                ? "#ecfdf5"
                                : status === "pending"
                                ? "#fffbeb"
                                : status === "rejected"
                                ? "#fff1f2"
                                : "#eff6ff",
                            color:
                              status === "published"
                                ? "#059669"
                                : status === "pending"
                                ? "#d97706"
                                : status === "rejected"
                                ? "#ef476f"
                                : "#2563eb",
                          }}
                        >
                          {statusLabel}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="course-actions">
                          <button
                            type="button"
                            className="edit-course-btn"
                            onClick={() => openEditModal(course)}
                            title="Edit Course"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="delete-course-btn"
                            onClick={() => handleDelete(course.id)}
                            title="Delete Course"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="no-courses">
                    <BookOpen size={35} />
                    <strong>No courses found</strong>
                    <span>Try changing your search or filter.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div
          className="course-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="course-modal">
            {/* MODAL HEADER */}

            <div className="course-modal-header">
              <div>
                <h2>
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h2>
                <p>Enter course information below.</p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form className="course-form" onSubmit={handleSubmit}>
              {/* TITLE */}

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Course Title</label>
                  <input
  ref={formErrors.title ? firstErrorRef : null}
  type="text"
  name="title"
  placeholder="Enter course title"
  value={formData.title}
  onChange={handleInputChange}
  className={formErrors.title ? "input-error" : ""}
  aria-invalid={Boolean(formErrors.title)}
/>

                  {formErrors.title && (
                    <p className="field-error">{formErrors.title}</p>
                  )}
                </div>
              </div>

              {/* COURSE DESCRIPTION */}

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Course Description</label>
                  <textarea
                    name="description"
                    placeholder="Enter course description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                  />
                </div>
              </div>

              {/* COURSE IMAGE */}

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Course Image</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageChange}
                  />

                  <small className="image-help-text">
                    JPG, PNG or WebP • Maximum 2 MB
                  </small>

                  {formData.image && (
                    <div className="course-image-preview">
                      <img
                        src={formData.image}
                        alt="Course Preview"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            image: "",
                          }))
                        }
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* LEVEL + DURATION */}

              <div className="form-row">
                <div className="form-group">
                  <label>Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <input
  ref={formErrors.duration ? firstErrorRef : null}
  type="text"
  name="duration"
  placeholder="e.g. 8 Weeks"
  value={formData.duration}
  onChange={handleInputChange}
  className={formErrors.duration ? "input-error" : ""}
  aria-invalid={Boolean(formErrors.duration)}
/>

                  {formErrors.duration && (
                    <p className="field-error">
                      {formErrors.duration}
                    </p>
                  )}
                </div>
              </div>

              {/* FACULTY + CATEGORY */}

              <div className="form-row">
                <div className="form-group">
                  <label>Faculty</label>
                  <select
                    name="facultyId"
                    value={formData.facultyId}
                    onChange={handleFacultyChange}
                    className={
                      formErrors.facultyId ? "input-error" : ""
                    }
                    aria-invalid={Boolean(formErrors.facultyId)}
                  >
                    <option value="">Select Faculty</option>

                    {facultyList.length > 0 ? (
                      facultyList.map((faculty) => {
                        const facultyName = getFacultyName(faculty);
                        const facultyEmail = getFacultyEmail(faculty);

                        return (
                          <option
                            key={faculty.id}
                            value={faculty.id}
                          >
                            {facultyName}
                            {facultyEmail ? ` (${facultyEmail})` : ""}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>
                        No approved faculty available
                      </option>
                    )}
                  </select>

                  {formErrors.facultyId && (
                    <p className="field-error">
                      {formErrors.facultyId}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Programming">Programming</option>
                    <option value="Web Development">
                      Web Development
                    </option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="Database">Database</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* COURSE TYPE + PRICE */}

              <div className="form-row">
                <div className="form-group">
                  <label>Course Type</label>
                  <select
                    name="courseType"
                    value={formData.courseType}
                    onChange={handleCourseTypeChange}
                  >
                    <option value="free">Free Course</option>
                    <option value="paid">Paid Course</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price</label>

                  <div
                    className={`input-with-icon ${
                      formErrors.price ? "input-error" : ""
                    }`}
                  >
                    <IndianRupee size={16} />

                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="1"
                      placeholder={
                        formData.courseType === "free"
                          ? "Free"
                          : "Enter price"
                      }
                      value={
                        formData.courseType === "free"
                          ? 0
                          : formData.price
                      }
                      onChange={handleInputChange}
                      disabled={formData.courseType === "free"}
                      className={formErrors.price ? "input-error" : ""}
                      aria-invalid={Boolean(formErrors.price)}
                    />
                  </div>

                  {formErrors.price && (
                    <p className="field-error">{formErrors.price}</p>
                  )}

                  {formData.courseType === "free" && (
                    <small className="image-help-text">
                      Free courses do not require payment.
                    </small>
                  )}
                </div>
              </div>

              {/* STATUS */}

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Course Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* FOOTER */}

              <div className="course-modal-footer">
                <button
                  type="button"
                  className="cancel-course-btn"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-course-btn"
                  disabled={isSaving}
                >
                  {isSaving
                    ? editingCourse
                      ? "Updating..."
                      : "Adding..."
                    : editingCourse
                    ? "Update Course"
                    : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourse;