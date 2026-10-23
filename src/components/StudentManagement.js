import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Search,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    X
} from "lucide-react";

import "../css/StudentManagement.css";


const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";


const StudentManagement = () => {

    // =====================================================
    // STATE
    // =====================================================

    const [students, setStudents] = useState([]);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedStudent, setSelectedStudent] =
        useState(null);

    const [isEditMode, setIsEditMode] =
        useState(false);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSaving, setIsSaving] =
        useState(false);


    // =====================================================
    // EDIT FORM
    // =====================================================

    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        status: "pending"
    });


    // =====================================================
    // GET ADMIN TOKEN
    // =====================================================

    const getAdminToken = () => {

        return localStorage.getItem(
            "adminToken"
        );
    };


    // =====================================================
    // HANDLE UNAUTHORIZED
    // =====================================================

    const handleUnauthorized = () => {

        localStorage.removeItem(
            "adminToken"
        );

        sessionStorage.removeItem(
            "adminSession"
        );

        sessionStorage.removeItem(
            "isAdminLoggedIn"
        );

        window.location.href =
            "/admin-login";
    };


    // =====================================================
    // FETCH STUDENTS
    // =====================================================

    const fetchStudents = async () => {

        try {

            setIsLoading(true);

            const token =
                getAdminToken();


            if (!token) {

                handleUnauthorized();

                return;
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin-students`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();

                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to fetch students."
                );
            }


            setStudents(
                Array.isArray(data.data)
                    ? data.data
                    : []
            );

        } catch (error) {

            console.error(
                "Fetch Students Error:",
                error
            );

            alert(
                error.message ||
                "Unable to fetch students."
            );

        } finally {

            setIsLoading(false);
        }
    };


    // =====================================================
    // LOAD STUDENTS
    // =====================================================

    useEffect(() => {

        fetchStudents();

    }, []);


    // =====================================================
    // FILTER STUDENTS
    // =====================================================

    const filteredStudents =
        useMemo(() => {

            return students.filter(
                (student) => {

                    const search =
                        searchTerm
                            .toLowerCase()
                            .trim();


                    const matchesSearch =
                        !search ||
                        String(
                            student.name || ""
                        )
                            .toLowerCase()
                            .includes(search) ||

                        String(
                            student.email || ""
                        )
                            .toLowerCase()
                            .includes(search);


                    const studentStatus =
                        String(
                            student.status ||
                            "pending"
                        ).toLowerCase();


                    const matchesStatus =
                        statusFilter === "all" ||
                        studentStatus ===
                        statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            students,
            searchTerm,
            statusFilter
        ]);


    // =====================================================
    // SUMMARY
    // =====================================================

    const totalStudents =
        students.length;


    const pendingStudents =
        students.filter(
            (student) =>
                student.status === "pending"
        ).length;


    const approvedStudents =
        students.filter(
            (student) =>
                student.status === "approved"
        ).length;


    const rejectedStudents =
        students.filter(
            (student) =>
                student.status === "rejected"
        ).length;


    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    const handleEdit = (student) => {

        setSelectedStudent(student);

        setEditForm({
            name: student.name || "",
            email: student.email || "",
            status:
                student.status ||
                "pending"
        });

        setIsEditMode(true);
    };


    // =====================================================
    // CLOSE EDIT MODAL
    // =====================================================

    const closeEditModal = () => {

        if (isSaving) {
            return;
        }

        setSelectedStudent(null);

        setIsEditMode(false);

        setEditForm({
            name: "",
            email: "",
            status: "pending"
        });
    };


    // =====================================================
    // HANDLE FORM CHANGE
    // =====================================================

    const handleEditChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setEditForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };


    // =====================================================
    // UPDATE STUDENT
    // =====================================================

    const handleUpdateStudent = async (
        event
    ) => {

        event.preventDefault();


        if (!selectedStudent) {
            return;
        }


        if (
            !editForm.name.trim()
        ) {

            alert(
                "Student name is required."
            );

            return;
        }


        if (
            !editForm.email.trim()
        ) {

            alert(
                "Student email is required."
            );

            return;
        }


        try {

            setIsSaving(true);

            const token =
                getAdminToken();


            if (!token) {

                handleUnauthorized();

                return;
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/update-student/${selectedStudent._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name:
                                editForm.name.trim(),

                            email:
                                editForm.email.trim(),

                            status:
                                editForm.status
                        })
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();

                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update student."
                );
            }


            // ---------------------------------------------
            // UPDATE TABLE IMMEDIATELY
            // ---------------------------------------------

            setStudents(
                (previousStudents) =>
                    previousStudents.map(
                        (student) =>
                            String(
                                student._id
                            ) ===
                            String(
                                selectedStudent._id
                            )
                                ? data.data
                                : student
                    )
            );


            closeEditModal();


        } catch (error) {

            console.error(
                "Update Student Error:",
                error
            );

            alert(
                error.message ||
                "Unable to update student."
            );

        } finally {

            setIsSaving(false);
        }
    };


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    const handleStatusUpdate = async (
        studentId,
        status
    ) => {

        try {

            const token =
                getAdminToken();


            if (!token) {

                handleUnauthorized();

                return;
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/student-status/${studentId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            status
                        })
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();

                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update student status."
                );
            }


            setStudents(
                (previousStudents) =>
                    previousStudents.map(
                        (student) =>
                            String(
                                student._id
                            ) ===
                            String(studentId)
                                ? data.data
                                : student
                    )
            );

        } catch (error) {

            console.error(
                "Update Student Status Error:",
                error
            );

            alert(
                error.message ||
                "Unable to update student status."
            );
        }
    };


    // =====================================================
    // APPROVE STUDENT
    // =====================================================

    const handleApprove = (studentId) => {

        handleStatusUpdate(
            studentId,
            "approved"
        );
    };


    // =====================================================
    // REJECT STUDENT
    // =====================================================

    const handleReject = (studentId) => {

        handleStatusUpdate(
            studentId,
            "rejected"
        );
    };


    // =====================================================
    // DELETE STUDENT
    // =====================================================

    const handleDelete = async (
        studentId
    ) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this student?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

            const token =
                getAdminToken();


            if (!token) {

                handleUnauthorized();

                return;
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/delete-student/${studentId}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                handleUnauthorized();

                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete student."
                );
            }


            setStudents(
                (previousStudents) =>
                    previousStudents.filter(
                        (student) =>
                            String(
                                student._id
                            ) !==
                            String(studentId)
                    )
            );


        } catch (error) {

            console.error(
                "Delete Student Error:",
                error
            );

            alert(
                error.message ||
                "Unable to delete student."
            );
        }
    };


    // =====================================================
    // GET STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        const normalizedStatus =
            String(
                status || "pending"
            ).toLowerCase();


        if (
            normalizedStatus ===
            "approved"
        ) {
            return "status-approved";
        }


        if (
            normalizedStatus ===
            "rejected"
        ) {
            return "status-rejected";
        }


        return "status-pending";
    };


    // =====================================================
    // GET STATUS LABEL
    // =====================================================

    const getStatusLabel = (status) => {

        const normalizedStatus =
            String(
                status || "pending"
            ).toLowerCase();


        if (
            normalizedStatus ===
            "approved"
        ) {
            return "Approved";
        }


        if (
            normalizedStatus ===
            "rejected"
        ) {
            return "Rejected";
        }


        return "Pending";
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="student-management">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="student-page-header">

                <div>
                    <h1>
                        Student Management
                    </h1>

                    <p>
                        Manage student accounts,
                        approvals and information.
                    </p>
                </div>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="student-summary">

                <div className="student-summary-card">

                    <div className="summary-icon">
                        <Search size={22} />
                    </div>

                    <div>
                        <span>
                            Total Students
                        </span>

                        <strong>
                            {totalStudents}
                        </strong>
                    </div>

                </div>


                <div className="student-summary-card">

                    <div className="summary-icon pending-icon">
                        <Clock size={22} />
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingStudents}
                        </strong>
                    </div>

                </div>


                <div className="student-summary-card">

                    <div className="summary-icon approved-icon">
                        <CheckCircle size={22} />
                    </div>

                    <div>
                        <span>
                            Approved
                        </span>

                        <strong>
                            {approvedStudents}
                        </strong>
                    </div>

                </div>


                <div className="student-summary-card">

                    <div className="summary-icon rejected-icon">
                        <XCircle size={22} />
                    </div>

                    <div>
                        <span>
                            Rejected
                        </span>

                        <strong>
                            {rejectedStudents}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                FILTER BAR
            ================================================= */}

            <div className="student-filter-bar">

                <div className="student-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Status
                    </option>

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


            {/* =================================================
                STUDENT TABLE
            ================================================= */}

            <div className="student-table-card">

                <div className="student-table-wrapper">

                    {isLoading ? (

                        <div className="no-students">
                            Loading students...
                        </div>

                    ) : filteredStudents.length === 0 ? (

                        <div className="no-students">
                            No students found.
                        </div>

                    ) : (

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Email
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

                                {filteredStudents.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student._id
                                            }
                                        >

                                            {/* Student */}

                                            <td>

                                                <div className="student-info">

                                                    <div className="student-avatar">

                                                        {(
                                                            student.name ||
                                                            "S"
                                                        )
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                student.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            Student
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Email */}

                                            <td>

                                                <span className="student-email">
                                                    {
                                                        student.email
                                                    }
                                                </span>

                                            </td>


                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={
                                                        `student-status ${getStatusClass(
                                                            student.status
                                                        )}`
                                                    }
                                                >
                                                    {
                                                        getStatusLabel(
                                                            student.status
                                                        )
                                                    }
                                                </span>

                                            </td>


                                            {/* Actions */}

                                            <td>

                                                <div className="student-actions">

                                                    {/* Edit */}

                                                    <button
                                                        type="button"
                                                        className="edit-btn"
                                                        title="Edit Student"
                                                        onClick={() =>
                                                            handleEdit(
                                                                student
                                                            )
                                                        }
                                                    >

                                                        <Pencil
                                                            size={16}
                                                        />

                                                    </button>




                                                   
                                                    {/* Delete */}

                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        title="Delete Student"
                                                        onClick={() =>
                                                            handleDelete(
                                                                student._id
                                                            )
                                                        }
                                                    >

                                                        <Trash2
                                                            size={16}
                                                        />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>


{/* =================================================
    EDIT MODAL
================================================= */}

{isEditMode && selectedStudent && (

    <div className="student-modal-overlay">

        <div className="student-modal">

            {/* ===============================
                MODAL HEADER
            =============================== */}

            <div className="student-modal-header">

                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={closeEditModal}
                    disabled={isSaving}
                >
                    <X size={20} />
                </button>

            </div>


            {/* ===============================
                MODAL BODY
            =============================== */}

            <div className="student-modal-body">

                {/* Avatar */}

                <div className="modal-avatar">

                    {(
                        selectedStudent.name ||
                        "S"
                    )
                        .charAt(0)
                        .toUpperCase()}

                </div>


                {/* Student Name */}

                <div className="modal-field">

                    <label>
                        Student Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        placeholder="Enter student name"
                    />

                </div>


                {/* Email */}

                <div className="modal-field">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        placeholder="Enter student email"
                    />

                </div>


                {/* Status */}

                <div className="modal-field">

                    <label>
                        Status
                    </label>

                    <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        style={{
                            width: "100%",
                            height: "42px",
                            padding: "0 12px",
                            boxSizing: "border-box",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            outline: "none",
                            color: "#1f2937",
                            background: "#ffffff",
                            fontSize: "14px",
                            cursor: "pointer"
                        }}
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


            {/* ===============================
                MODAL FOOTER
            =============================== */}

            <div className="student-modal-footer">

                <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={closeEditModal}
                    disabled={isSaving}
                >
                    Cancel
                </button>


                <button
                    type="button"
                    className="modal-save-btn"
                    onClick={handleUpdateStudent}
                    disabled={isSaving}
                >

                    {isSaving
                        ? "Saving..."
                        : "Save Changes"}

                </button>

            </div>

        </div>

    </div>

)}
        </div>
    );
};


export default StudentManagement;