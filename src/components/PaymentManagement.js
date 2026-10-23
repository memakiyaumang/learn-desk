
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search,
    CheckCircle2,
    Clock3,
    XCircle,
    CreditCard,
    RefreshCw,
    AlertCircle,
    Eye,
    Wallet,
    TrendingUp,
    ReceiptText,
    CalendarDays,
    UserRound,
    BookOpen,
    Hash,
    X,
} from "lucide-react";

import "../css/PaymentManagement.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";
const PAGE_SIZE = 10;

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Load payment records from backend
    const loadPayments = useCallback(async () => {
        const adminToken = localStorage.getItem("adminToken");

        if (!adminToken) {
            setPayments([]);
            setErrorMessage("Admin session not found. Please log in again.");
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await fetch(
                `${API_BASE_URL}/api/admin/payments`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
                throw new Error(
                    response.status === 401
                        ? "Your admin session is invalid or expired. Please log in again."
                        : "You do not have permission to view payment records."
                );
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to load payment records."
                );
            }

            setPayments(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error("Load payments error:", error);
            setErrorMessage(
                error.message || "Unable to connect to the backend server."
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    // Helpers
    const normalizeStatus = (status) => {
        const value = String(status || "pending").toLowerCase().trim();

        if (["paid", "success", "successful", "completed"].includes(value)) {
            return "successful";
        }

        if (value === "failed") {
            return "failed";
        }

        return "pending";
    };

    const getStatusText = (status) => {
        const value = normalizeStatus(status);

        if (value === "successful") return "Successful";
        if (value === "failed") return "Failed";
        return "Pending";
    };

    const getStatusClass = (status) => {
        return `payment-status-${normalizeStatus(status)}`;
    };

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatCurrency = (amount) => {
        return `₹${formatAmount(amount)}`;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return String(date);
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStudentLabel = (payment) => {
        return (
            payment.studentName ||
            payment.studentEmail ||
            payment.studentId ||
            "Student"
        );
    };

    const getPaymentMethod = (payment) => {
        const method = String(payment.paymentMethod || "").toLowerCase();

        if (method === "razorpay") return "Razorpay";
        if (method === "demo") return "Demo";
        return payment.paymentMethod || "Online";
    };

    // Summary values
    const totalPayments = payments.length;

    const successfulPayments = payments.filter(
        (payment) => normalizeStatus(payment.status) === "successful"
    ).length;

    const pendingPayments = payments.filter(
        (payment) => normalizeStatus(payment.status) === "pending"
    ).length;

    const failedPayments = payments.filter(
        (payment) => normalizeStatus(payment.status) === "failed"
    ).length;

    const totalRevenue = payments
        .filter(
            (payment) => normalizeStatus(payment.status) === "successful"
        )
        .reduce(
            (total, payment) => total + Number(payment.amount || 0),
            0
        );

    // Search and filter
    const filteredPayments = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return payments.filter((payment) => {
            const fields = [
                payment.studentName,
                payment.studentEmail,
                payment.studentId,
                payment.courseName,
                payment.courseId,
                payment.razorpayOrderId,
                payment.razorpayPaymentId,
                payment.paymentMethod,
            ];

            const matchesSearch =
                !search ||
                fields.some((field) =>
                    String(field || "").toLowerCase().includes(search)
                );

            const matchesStatus =
                statusFilter === "all" ||
                normalizeStatus(payment.status) === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payments, searchTerm, statusFilter]);

    // Reset pagination when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPayments.length / PAGE_SIZE)
    );

    const safeCurrentPage = Math.min(currentPage, totalPages);

    const paginatedPayments = filteredPayments.slice(
        (safeCurrentPage - 1) * PAGE_SIZE,
        safeCurrentPage * PAGE_SIZE
    );

    const closePaymentDetails = () => {
        setSelectedPayment(null);
    };

    // Close modal using Escape key
    useEffect(() => {
        if (!selectedPayment) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closePaymentDetails();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedPayment]);

    return (
        <div className="payment-management">
            {/* Page Header */}
            <div className="payment-page-header">
                <div className="payment-heading-content">
                    <div className="payment-heading-icon">
                        <ReceiptText size={25} />
                    </div>

                    <div>
                        <h1>Payment Management</h1>
                        <p>
                            Monitor transactions, payment status and revenue
                            across your learning platform.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="payment-refresh-btn"
                    onClick={loadPayments}
                    disabled={isLoading}
                >
                    <RefreshCw
                        size={17}
                        className={isLoading ? "payment-spinning" : ""}
                    />
                    <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
                </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="payment-error-message" role="alert">
                    <AlertCircle size={20} />
                    <span>{errorMessage}</span>

                    <button type="button" onClick={loadPayments}>
                        Try Again
                    </button>
                </div>
            )}

            {/* Summary Cards */}
            <section className="payment-summary" aria-label="Payment summary">
                <div className="payment-summary-card total-card">
                    <div className="payment-summary-top">
                        <div className="payment-summary-icon total-payment-icon">
                            <CreditCard size={21} />
                        </div>
                        <span className="payment-summary-tag">All records</span>
                    </div>

                    <p>Total Payments</p>
                    <h2>{isLoading ? "—" : totalPayments}</h2>
                    <span className="payment-summary-description">
                        All recorded transactions
                    </span>
                </div>

                <div className="payment-summary-card success-card">
                    <div className="payment-summary-top">
                        <div className="payment-summary-icon success-payment-icon">
                            <CheckCircle2 size={21} />
                        </div>
                        <span className="payment-summary-tag">Completed</span>
                    </div>

                    <p>Successful</p>
                    <h2>{isLoading ? "—" : successfulPayments}</h2>
                    <span className="payment-summary-description">
                        Payments completed
                    </span>
                </div>

                <div className="payment-summary-card pending-card">
                    <div className="payment-summary-top">
                        <div className="payment-summary-icon pending-payment-icon">
                            <Clock3 size={21} />
                        </div>
                        <span className="payment-summary-tag">In progress</span>
                    </div>

                    <p>Pending</p>
                    <h2>{isLoading ? "—" : pendingPayments}</h2>
                    <span className="payment-summary-description">
                        Awaiting confirmation
                    </span>
                </div>

                <div className="payment-summary-card failed-card">
                    <div className="payment-summary-top">
                        <div className="payment-summary-icon failed-payment-icon">
                            <XCircle size={21} />
                        </div>
                        <span className="payment-summary-tag">Unsuccessful</span>
                    </div>

                    <p>Failed</p>
                    <h2>{isLoading ? "—" : failedPayments}</h2>
                    <span className="payment-summary-description">
                        Transactions failed
                    </span>
                </div>
            </section>

            {/* Revenue Section */}
            <section className="payment-revenue-card">
                <div className="payment-revenue-content">
                    <div className="payment-revenue-icon">
                        <Wallet size={23} />
                    </div>

                    <div>
                        <p>Total Successful Revenue</p>
                        <h2>{isLoading ? "—" : formatCurrency(totalRevenue)}</h2>
                        <span>Calculated from successful payments only</span>
                    </div>
                </div>

                <div className="payment-revenue-side">
                    <TrendingUp size={19} />
                    <span>{successfulPayments} successful transactions</span>
                </div>
            </section>

            {/* Table Heading */}
            <div className="payment-records-heading">
                <div>
                    <h2>Payment Transactions</h2>
                    <p>Review and inspect individual payment records.</p>
                </div>

                <span className="payment-record-count">
                    {isLoading ? "Loading..." : `${filteredPayments.length} records`}
                </span>
            </div>

            {/* Search and Filter */}
            <div className="payment-filter-bar">
                <div className="payment-search">
                    <Search size={19} />

                    <input
                        type="search"
                        placeholder="Search student, course or transaction ID..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        aria-label="Search payment records"
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            className="payment-clear-search"
                            onClick={() => setSearchTerm("")}
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="payment-filter-select">
                    <label htmlFor="payment-status-filter">Status</label>
                    <select
                        id="payment-status-filter"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">All Payments</option>
                        <option value="successful">Successful</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Payment Table */}
            <div className="payment-table-card">
                <div className="payment-table-wrapper">
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="no-payments">
                                        <RefreshCw
                                            size={21}
                                            className="payment-spinning"
                                        />
                                        <span>Loading payment records...</span>
                                    </td>
                                </tr>
                            ) : paginatedPayments.length > 0 ? (
                                paginatedPayments.map((payment, index) => {
                                    const studentLabel = getStudentLabel(payment);

                                    return (
                                        <tr key={payment.id || payment.razorpayOrderId || index}>
                                            <td>
                                                <div className="payment-student">
                                                    <div className="payment-avatar">
                                                        {studentLabel
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="payment-student-info">
                                                        <strong title={studentLabel}>
                                                            {studentLabel}
                                                        </strong>

                                                        {payment.studentName &&
                                                            payment.studentEmail && (
                                                                <small title={payment.studentEmail}>
                                                                    {payment.studentEmail}
                                                                </small>
                                                            )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="payment-course-info">
                                                    <BookOpen size={16} />
                                                    <span
                                                        className="payment-course"
                                                        title={payment.courseName || "Course"}
                                                    >
                                                        {payment.courseName || "Course"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <strong className="payment-amount">
                                                    {formatCurrency(payment.amount)}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="payment-method">
                                                    {getPaymentMethod(payment)}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="payment-date">
                                                    {formatDate(payment.date)}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`payment-status ${getStatusClass(
                                                        payment.status
                                                    )}`}
                                                >
                                                    <span className="payment-status-dot" />
                                                    {getStatusText(payment.status)}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="payment-view-btn"
                                                    title="View payment details"
                                                    aria-label={`View details for ${studentLabel}`}
                                                    onClick={() => setSelectedPayment(payment)}
                                                >
                                                    <Eye size={17} />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-payments">
                                        <div className="payment-empty-icon">
                                            <ReceiptText size={27} />
                                        </div>
                                        <strong>No payments found</strong>
                                        <span>
                                            {errorMessage
                                                ? "Fix the connection issue and try again."
                                                : "Try changing your search or status filter."}
                                        </span>

                                        {!errorMessage &&
                                            (searchTerm || statusFilter !== "all") && (
                                                <button
                                                    type="button"
                                                    className="payment-reset-btn"
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setStatusFilter("all");
                                                    }}
                                                >
                                                    Clear filters
                                                </button>
                                            )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && filteredPayments.length > 0 && (
                    <div className="payment-pagination">
                        <span>
                            Showing{" "}
                            {(safeCurrentPage - 1) * PAGE_SIZE + 1}–
                            {Math.min(
                                safeCurrentPage * PAGE_SIZE,
                                filteredPayments.length
                            )}{" "}
                            of {filteredPayments.length} payments
                        </span>

                        <div className="payment-pagination-actions">
                            <button
                                type="button"
                                disabled={safeCurrentPage === 1}
                                onClick={() => setCurrentPage((page) => page - 1)}
                            >
                                Previous
                            </button>

                            <span className="payment-page-number">
                                {safeCurrentPage} / {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={safeCurrentPage === totalPages}
                                onClick={() => setCurrentPage((page) => page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Details Modal */}
            {selectedPayment && (
                <div
                    className="payment-modal-overlay"
                    onClick={closePaymentDetails}
                >
                    <div
                        className="payment-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="payment-details-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="payment-modal-header">
                            <div className="payment-modal-title-icon">
                                <ReceiptText size={21} />
                            </div>

                            <div className="payment-modal-title">
                                <h2 id="payment-details-title">
                                    Payment Details
                                </h2>
                                <p>Transaction information</p>
                            </div>

                            <button
                                type="button"
                                className="payment-modal-close"
                                onClick={closePaymentDetails}
                                aria-label="Close payment details"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="payment-modal-amount">
                            <span>Payment Amount</span>
                            <strong>
                                {formatCurrency(selectedPayment.amount)}
                            </strong>
                            <span
                                className={`payment-status ${getStatusClass(
                                    selectedPayment.status
                                )}`}
                            >
                                <span className="payment-status-dot" />
                                {getStatusText(selectedPayment.status)}
                            </span>
                        </div>

                        <div className="payment-modal-body">
                            <div className="payment-modal-section-title">
                                Student & Course
                            </div>

                            <div className="payment-detail-grid">
                                <div className="payment-modal-field">
                                    <label>
                                        <UserRound size={14} /> Student
                                    </label>
                                    <p>{getStudentLabel(selectedPayment)}</p>
                                </div>

                                <div className="payment-modal-field">
                                    <label>
                                        <BookOpen size={14} /> Course
                                    </label>
                                    <p>
                                        {selectedPayment.courseName || "Course"}
                                    </p>
                                </div>

                                <div className="payment-modal-field">
                                    <label>
                                        <CreditCard size={14} /> Payment Method
                                    </label>
                                    <p>{getPaymentMethod(selectedPayment)}</p>
                                </div>

                                <div className="payment-modal-field">
                                    <label>
                                        <CalendarDays size={14} /> Date
                                    </label>
                                    <p>{formatDate(selectedPayment.date)}</p>
                                </div>
                            </div>

                            <div className="payment-modal-section-title">
                                Transaction IDs
                            </div>

                            <div className="payment-modal-field">
                                <label>
                                    <Hash size={14} /> Order ID
                                </label>
                                <p className="payment-id-text">
                                    {selectedPayment.razorpayOrderId || "—"}
                                </p>
                            </div>

                            <div className="payment-modal-field">
                                <label>
                                    <Hash size={14} /> Payment ID
                                </label>
                                <p className="payment-id-text">
                                    {selectedPayment.razorpayPaymentId || "—"}
                                </p>
                            </div>

                            {selectedPayment.studentEmail && (
                                <div className="payment-modal-field">
                                    <label>Student Email</label>
                                    <p className="payment-id-text">
                                        {selectedPayment.studentEmail}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="payment-modal-footer">
                            <button
                                type="button"
                                className="payment-cancel-btn"
                                onClick={closePaymentDetails}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;
