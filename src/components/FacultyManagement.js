import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    Pencil,
    Trash2,
    X,
    Users,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react";

import "../css/FacultyManagement.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const getEmptyFormData = () => ({
    name: "",
    email: "",
    qualification: "",
    specialization: "",
    phone: "",
    department: "",
    experience: "",
    education: "",
    password: "",
    status: "pending",
    bio: "",
});

const FacultyManagement = () => {
    const [facultyList, setFacultyList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingFaculty, setEditingFaculty] =
        useState(null);

    const [formData, setFormData] = useState(
        getEmptyFormData()
    );

    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");

    // =========================================================
    // FETCH FACULTY
    // =========================================================

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const adminToken =
                localStorage.getItem("adminToken");

            if (!adminToken) {
                throw new Error(
                    "Admin session expired. Please login again."
                );
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin-faculty`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${adminToken}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch faculty."
                );
            }

            setFacultyList(
                Array.isArray(data.data)
                    ? data.data
                    : []
            );
        } catch (error) {
            console.error(
                "Fetch Faculty Error:",
                error
            );

            setErrorMessage(
                error.message ||
                "Unable to load faculty."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    // =========================================================
    // CLEAR SUCCESS MESSAGE
    // =========================================================

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [successMessage]);

    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    const openEditModal = (faculty) => {
        if (saving) {
            return;
        }

        setEditingFaculty(faculty);

        setFormData({
            name: faculty.name || "",
            email: faculty.email || "",
            qualification:
                faculty.qualification || "",
            specialization:
                faculty.specialization || "",
            phone: faculty.phone || "",
            department:
                faculty.department || "",
            experience:
                faculty.experience || "",
            education:
                faculty.education || "",
            password: "",
            status:
                faculty.status || "pending",
            bio: faculty.bio || "",
        });

        setErrorMessage("");
        setSuccessMessage("");
        setShowModal(true);
    };

    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingFaculty(null);
        setFormData(getEmptyFormData());
        setErrorMessage("");
    };

    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleInputChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (errorMessage) {
            setErrorMessage("");
        }
    };

    // =========================================================
    // UPDATE FACULTY
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log(
            "UPDATE FACULTY BUTTON CLICKED"
        );

        if (saving) {
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (!formData.name.trim()) {
            setErrorMessage(
                "Faculty name is required."
            );
            return;
        }

        if (!formData.email.trim()) {
            setErrorMessage(
                "Faculty email is required."
            );
            return;
        }

        if (
            !formData.qualification.trim()
        ) {
            setErrorMessage(
                "Qualification is required."
            );
            return;
        }

        if (
            !formData.specialization.trim()
        ) {
            setErrorMessage(
                "Specialization is required."
            );
            return;
        }

        if (
            formData.password.trim() &&
            formData.password.trim().length < 6
        ) {
            setErrorMessage(
                "Password must be at least 6 characters."
            );
            return;
        }

        const adminToken =
            localStorage.getItem(
                "adminToken"
            );

        if (!adminToken) {
            setErrorMessage(
                "Admin session expired. Please login again."
            );
            return;
        }

        try {
            setSaving(true);

            const facultyId =
                editingFaculty?.id ||
                editingFaculty?._id;

            console.log(
                "Faculty ID:",
                facultyId
            );

            if (!facultyId) {
                throw new Error(
                    "Faculty ID is missing."
                );
            }

            // -------------------------------------------------
            // UPDATE DATA
            // -------------------------------------------------

            const updateData = {
                name:
                    formData.name.trim(),

                email:
                    formData.email
                        .trim()
                        .toLowerCase(),

                qualification:
                    formData.qualification
                        .trim(),

                specialization:
                    formData.specialization
                        .trim(),

                phone:
                    formData.phone.trim(),

                department:
                    formData.department
                        .trim(),

                experience:
                    formData.experience
                        .trim(),

                education:
                    formData.education
                        .trim(),

                bio:
                    formData.bio.trim(),

                status:
                    formData.status,
            };

            if (
                formData.password.trim()
            ) {
                updateData.password =
                    formData.password.trim();
            }

            console.log(
                "Update Data:",
                updateData
            );

            // -------------------------------------------------
            // API REQUEST
            // -------------------------------------------------

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/update-faculty/${facultyId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${adminToken}`,
                        },

                        body:
                            JSON.stringify(
                                updateData
                            ),
                    }
                );

            const data =
                await response.json();

            console.log(
                "Update Faculty Response:",
                data
            );

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update faculty."
                );
            }

            // -------------------------------------------------
            // UPDATE LOCAL LIST
            // -------------------------------------------------

            const updatedFaculty =
                data.data;

            setFacultyList(
                (previousList) =>
                    previousList.map(
                        (faculty) => {
                            const currentId =
                                String(
                                    faculty.id ||
                                    faculty._id
                                );

                            const updatedId =
                                String(
                                    updatedFaculty?.id ||
                                    updatedFaculty?._id ||
                                    facultyId
                                );

                            if (
                                currentId ===
                                updatedId
                            ) {
                                return {
                                    ...faculty,
                                    ...updatedFaculty,

                                    id:
                                        updatedFaculty?.id ||
                                        updatedFaculty?._id ||
                                        faculty.id,

                                    _id:
                                        updatedFaculty?._id ||
                                        faculty._id,

                                    status:
                                        updatedFaculty?.status ||
                                        faculty.status,
                                };
                            }

                            return faculty;
                        }
                    )
            );

            setSuccessMessage(
                "Faculty updated successfully."
            );

            // -------------------------------------------------
            // CLOSE MODAL
            // -------------------------------------------------

            setShowModal(false);
            setEditingFaculty(null);
            setFormData(
                getEmptyFormData()
            );

        } catch (error) {
            console.error(
                "Faculty Update Error:",
                error
            );

            setErrorMessage(
                error.message ||
                "Something went wrong."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DELETE FACULTY
    // =========================================================

    const handleDeleteFaculty = async (
        faculty
    ) => {
        if (saving) {
            return;
        }

        const facultyId =
            faculty.id || faculty._id;

        if (!facultyId) {
            setErrorMessage(
                "Faculty ID is missing."
            );
            return;
        }

        const confirmDelete =
            window.confirm(
                `Are you sure you want to delete ${faculty.name || "this faculty"}?`
            );

        if (!confirmDelete) {
            return;
        }

        try {
            const adminToken =
                localStorage.getItem(
                    "adminToken"
                );

            if (!adminToken) {
                throw new Error(
                    "Admin session expired. Please login again."
                );
            }

            setErrorMessage("");

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/delete-faculty/${facultyId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${adminToken}`,
                        },
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete faculty."
                );
            }

            setFacultyList(
                (previousList) =>
                    previousList.filter(
                        (item) =>
                            String(
                                item.id ||
                                item._id
                            ) !==
                            String(facultyId)
                    )
            );

            setSuccessMessage(
                "Faculty deleted successfully."
            );

        } catch (error) {
            console.error(
                "Delete Faculty Error:",
                error
            );

            setErrorMessage(
                error.message ||
                "Unable to delete faculty."
            );
        }
    };

    // =========================================================
    // FILTER FACULTY
    // =========================================================

    const filteredFaculty = useMemo(() => {
        return facultyList.filter(
            (faculty) => {
                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();

                const matchesSearch =
                    !search ||
                    String(
                        faculty.name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        faculty.email || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        faculty.qualification ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        faculty.specialization ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =
                    statusFilter ===
                        "all" ||
                    String(
                        faculty.status ||
                        "pending"
                    ).toLowerCase() ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        facultyList,
        searchTerm,
        statusFilter,
    ]);

    // =========================================================
    // SUMMARY
    // =========================================================

    const totalFaculty =
        facultyList.length;

    const approvedFaculty =
        facultyList.filter(
            (faculty) =>
                faculty.status ===
                "approved"
        ).length;

    const pendingFaculty =
        facultyList.filter(
            (faculty) =>
                faculty.status ===
                "pending"
        ).length;

    const rejectedFaculty =
        facultyList.filter(
            (faculty) =>
                faculty.status ===
                "rejected"
        ).length;

    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (
        status
    ) => {
        if (status === "approved") {
            return "status-approved";
        }

        if (status === "rejected") {
            return "status-rejected";
        }

        return "status-pending";
    };

    // =========================================================
    // STATUS LABEL
    // =========================================================

    const getStatusLabel = (
        status
    ) => {
        if (status === "approved") {
            return "Approved";
        }

        if (status === "rejected") {
            return "Rejected";
        }

        return "Pending";
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="faculty-management-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="faculty-page-header">

                <div>
                    <h1>
                        Faculty Management
                    </h1>

                    <p>
                        Manage faculty accounts,
                        profiles and approval status.
                    </p>
                </div>

            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (
                <div className="success-message">

                    <CheckCircle
                        size={18}
                    />

                    <span>
                        {successMessage}
                    </span>

                </div>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {errorMessage &&
                !showModal && (
                    <div className="error-message">

                        <XCircle
                            size={18}
                        />

                        <span>
                            {errorMessage}
                        </span>

                    </div>
                )}

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="faculty-summary">

                <div className="summary-card">

                    <div className="summary-icon">
                        <Users size={22} />
                    </div>

                    <div>
                        <span>
                            Total Faculty
                        </span>

                        <strong>
                            {totalFaculty}
                        </strong>
                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon">
                        <CheckCircle
                            size={22}
                        />
                    </div>

                    <div>
                        <span>
                            Approved
                        </span>

                        <strong>
                            {approvedFaculty}
                        </strong>
                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon">
                        <Clock size={22} />
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingFaculty}
                        </strong>
                    </div>

                </div>

                <div className="summary-card">

                    <div className="summary-icon">
                        <XCircle
                            size={22}
                        />
                    </div>

                    <div>
                        <span>
                            Rejected
                        </span>

                        <strong>
                            {rejectedFaculty}
                        </strong>
                    </div>

                </div>

            </div>

            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <div className="faculty-filter-section">

                <div className="faculty-search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search faculty..."
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

                <select
                    value={
                        statusFilter
                    }
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                    className="faculty-status-filter"
                >

                    <option value="all">
                        All Status
                    </option>

                    <option value="approved">
                        Approved
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="rejected">
                        Rejected
                    </option>

                </select>

            </div>

            {/* =================================================
                FACULTY TABLE
            ================================================= */}

            <div className="faculty-table-card">

                {loading ? (

                    <div className="faculty-loading">
                        Loading faculty...
                    </div>

                ) : filteredFaculty.length === 0 ? (

                    <div className="faculty-empty">

                        <Users size={40} />

                        <h3>
                            No faculty found
                        </h3>

                        <p>
                            No faculty records
                            match your search.
                        </p>

                    </div>

                ) : (

                    <div className="faculty-table-wrapper">

                        <table className="faculty-table">

                            <thead>

                                <tr>

                                    <th>
                                        Faculty
                                    </th>

                                    <th>
                                        Qualification
                                    </th>

                                    <th>
                                        Specialization
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredFaculty.map(
                                    (faculty) => (

                                        <tr
                                            key={
                                                faculty.id ||
                                                faculty._id
                                            }
                                        >

                                            <td>

                                                <div className="faculty-user-info">

                                                    <div className="faculty-avatar">

                                                        {(
                                                            faculty.name ||
                                                            "F"
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {faculty.name ||
                                                                "Unknown Faculty"}
                                                        </strong>

                                                        <span>
                                                            {faculty.email ||
                                                                "No email"}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>
                                                {faculty.qualification ||
                                                    "Not Provided"}
                                            </td>

                                            <td>
                                                {faculty.specialization ||
                                                    "Not Provided"}
                                            </td>

                                            <td>

                                                <span
                                                    className={`faculty-status-badge ${getStatusClass(
                                                        faculty.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        faculty.status
                                                    )}
                                                </span>

                                            </td>

                                            <td>

                                                <div className="faculty-action-buttons">

                                                    <button
                                                        type="button"
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            openEditModal(
                                                                faculty
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >

                                                        <Pencil
                                                            size={
                                                                16
                                                            }
                                                        />

                                                        {/* Edit */}

                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            handleDeleteFaculty(
                                                                faculty
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >

                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />

                                                        {/* Delete */}

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* =================================================
                EDIT MODAL
            ================================================= */}

            {showModal && (
                <div className="faculty-modal-overlay">

                    <div className="faculty-modal">

                        {/* MODAL HEADER */}

                        <div className="faculty-modal-header">

                            <div>

                                <h2>
                                    Edit Faculty
                                </h2>

                                <p>
                                    Update faculty
                                    information and
                                    status.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* MODAL ERROR */}

                        {errorMessage && (
                            <div className="modal-error-message">

                                <XCircle
                                    size={18}
                                />

                                <span>
                                    {
                                        errorMessage
                                    }
                                </span>

                            </div>
                        )}

                        {/* EDIT FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="faculty-modal-body">

                                {/* NAME */}

                                <div className="faculty-form-group">

                                    <label>
                                        Full Name
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Enter faculty name"
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>

                                {/* EMAIL */}

                                <div className="faculty-form-group">

                                    <label>
                                        Email
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Enter faculty email"
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>

                                {/* QUALIFICATION */}

                                <div className="faculty-form-group">

                                    <label>
                                        Qualification
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="qualification"
                                        value={
                                            formData.qualification
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. M.Tech, MCA, Ph.D."
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>

                                {/* SPECIALIZATION */}

                                <div className="faculty-form-group">

                                    <label>
                                        Specialization
                                        <span>
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="specialization"
                                        value={
                                            formData.specialization
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. Data Science"
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>

                                

                                {/* STATUS */}

                                <div className="faculty-form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            formData.status
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    >

                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="approved">
                                            Approved
                                        </option>

                                        <option value="rejected">
                                            Rejected
                                        </option>

                                    </select>

                                </div>

                                
                            </div>

                            {/* MODAL FOOTER */}

                            <div className="faculty-modal-footer">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving
                                        ? "Updating..."
                                        : "Update Faculty"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default FacultyManagement;