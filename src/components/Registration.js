import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Registration.css";

const Registration = () => {
    const [role, setRole] = useState("student");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [qualification, setQualification] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        const newErrors = {};

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedQualification = qualification.trim();
        const trimmedSpecialization = specialization.trim();

        /* ================================
           NAME VALIDATION
        ================================= */

        if (!trimmedName) {
            newErrors.name = "Full name is required.";
        } else if (trimmedName.length < 2) {
            newErrors.name =
                "Name must be at least 2 characters.";
        }

        /* ================================
           EMAIL VALIDATION
        ================================= */

        if (!trimmedEmail) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ) {
            newErrors.email =
                "Please enter a valid email address.";
        }

        /* ================================
           FACULTY VALIDATION
        ================================= */

        if (role === "faculty") {
            if (!trimmedQualification) {
                newErrors.qualification =
                    "Qualification is required.";
            }

            if (!trimmedSpecialization) {
                newErrors.specialization =
                    "Specialization is required.";
            }
        }

        /* ================================
           PASSWORD VALIDATION
        ================================= */

        if (!password) {
            newErrors.password =
                "Password is required.";
        } else if (password.length < 6) {
            newErrors.password =
                "Password must be at least 6 characters.";
        }

        /* ================================
           CONFIRM PASSWORD
        ================================= */

        if (!confirmPassword) {
            newErrors.confirmPassword =
                "Please confirm your password.";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword =
                "Passwords do not match.";
        }

        /* ================================
           STOP IF VALIDATION ERROR
        ================================= */

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSuccessMessage("");
            return;
        }

        /* ================================
           CLEAR OLD ERRORS
        ================================= */

        setErrors({});
        setSuccessMessage("");
        setIsLoading(true);

        /* ================================
           REGISTER WITH BACKEND
        ================================= */

        try {
            const response = await fetch(
                "https://project-final-backend-oeh1.onrender.com/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                        email: trimmedEmail,
                        password: password,
                        role: role,
                        qualification:
                            role === "faculty"
                                ? trimmedQualification
                                : "",
                        specialization:
                            role === "faculty"
                                ? trimmedSpecialization
                                : "",
                    }),
                }
            );

            const data = await response.json();

            /* ================================
               SUCCESS
            ================================= */

            if (response.status === 200 && data.success) {
                setSuccessMessage(
                    role === "student"
                        ? "Student registration successful! Your account is pending admin approval."
                        : "Faculty registration successful! Your account is pending admin approval."
                );

                /* ================================
                   CLEAR FORM
                ================================= */

                setName("");
                setEmail("");
                setQualification("");
                setSpecialization("");
                setPassword("");
                setConfirmPassword("");
                setErrors({});
            }

            /* ================================
               BACKEND ERROR
            ================================= */

            else {
                if (
                    data.message?.toLowerCase().includes("email")
                ) {
                    setErrors({
                        email: data.message,
                    });
                } else {
                    setErrors({
                        general:
                            data.message ||
                            "Registration failed. Please try again.",
                    });
                }

                setSuccessMessage("");
            }

        } catch (error) {
            console.error(
                "Registration Error:",
                error
            );

            setErrors({
                general:
                    "Unable to connect to server. Please try again.",
            });

            setSuccessMessage("");

        } finally {
            setIsLoading(false);
        }
    };

    /* ================================
       FIELD CHANGE HANDLERS
    ================================= */

    const handleNameChange = (e) => {
        setName(e.target.value);

        if (errors.name || errors.general) {
            setErrors((prev) => ({
                ...prev,
                name: "",
                general: "",
            }));
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        if (errors.email || errors.general) {
            setErrors((prev) => ({
                ...prev,
                email: "",
                general: "",
            }));
        }
    };

    const handleQualificationChange = (e) => {
        setQualification(e.target.value);

        if (errors.qualification || errors.general) {
            setErrors((prev) => ({
                ...prev,
                qualification: "",
                general: "",
            }));
        }
    };

    const handleSpecializationChange = (e) => {
        setSpecialization(e.target.value);

        if (errors.specialization || errors.general) {
            setErrors((prev) => ({
                ...prev,
                specialization: "",
                general: "",
            }));
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);

        if (errors.password || errors.general) {
            setErrors((prev) => ({
                ...prev,
                password: "",
                general: "",
            }));
        }

        if (errors.confirmPassword) {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: "",
            }));
        }
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);

        if (errors.confirmPassword || errors.general) {
            setErrors((prev) => ({
                ...prev,
                confirmPassword: "",
                general: "",
            }));
        }
    };

    /* ================================
       ROLE CHANGE
    ================================= */

    const handleRoleChange = (e) => {
        setRole(e.target.value);

        setErrors({});
        setSuccessMessage("");

        // Clear faculty fields when switching
        // to student
        if (e.target.value === "student") {
            setQualification("");
            setSpecialization("");
        }
    };

    return (
        <div className="registration-container">

            <div className="registration-box">

                <h2>
                    {role === "student"
                        ? "Student Registration"
                        : "Faculty Registration"}
                </h2>

                <form
                    onSubmit={handleRegister}
                    noValidate
                >

                    {/* =========================
                        ROLE
                    ========================== */}

                    <div className="input-group">

                        <label htmlFor="register-role">
                            Register As
                        </label>

                        <select
                            id="register-role"
                            value={role}
                            onChange={handleRoleChange}
                        >
                            <option value="student">
                                Student
                            </option>

                            <option value="faculty">
                                Faculty
                            </option>
                        </select>

                    </div>


                    {/* =========================
                        FULL NAME
                    ========================== */}

                    <div className="input-group">

                        <label htmlFor="register-name">
                            Full Name
                        </label>

                        <input
                            type="text"
                            id="register-name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={handleNameChange}
                            className={
                                errors.name
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.name && (
                            <p className="field-error">
                                {errors.name}
                            </p>
                        )}

                    </div>


                    {/* =========================
                        EMAIL
                    ========================== */}

                    <div className="input-group">

                        <label htmlFor="register-email">
                            Email Address
                        </label>

                        <input
                            type="email"
                            id="register-email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                            className={
                                errors.email
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.email && (
                            <p className="field-error">
                                {errors.email}
                            </p>
                        )}

                    </div>


                    {/* =========================
                        FACULTY FIELDS
                    ========================== */}

                    {role === "faculty" && (
                        <>
                            <div className="input-group">

                                <label htmlFor="qualification">
                                    Qualification
                                </label>

                                <input
                                    type="text"
                                    id="qualification"
                                    placeholder="e.g. MCA, M.Tech, Ph.D."
                                    value={qualification}
                                    onChange={
                                        handleQualificationChange
                                    }
                                    className={
                                        errors.qualification
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.qualification && (
                                    <p className="field-error">
                                        {
                                            errors.qualification
                                        }
                                    </p>
                                )}

                            </div>


                            <div className="input-group">

                                <label htmlFor="specialization">
                                    Specialization
                                </label>

                                <input
                                    type="text"
                                    id="specialization"
                                    placeholder="e.g. AI & ML, Web Development"
                                    value={specialization}
                                    onChange={
                                        handleSpecializationChange
                                    }
                                    className={
                                        errors.specialization
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                {errors.specialization && (
                                    <p className="field-error">
                                        {
                                            errors.specialization
                                        }
                                    </p>
                                )}

                            </div>
                        </>
                    )}


                    {/* =========================
                        PASSWORD
                    ========================== */}

                    <div className="input-group">

                        <label htmlFor="register-password">
                            Password
                        </label>

                        <input
                            type="password"
                            id="register-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={handlePasswordChange}
                            className={
                                errors.password
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.password && (
                            <p className="field-error">
                                {errors.password}
                            </p>
                        )}

                    </div>


                    {/* =========================
                        CONFIRM PASSWORD
                    ========================== */}

                    <div className="input-group">

                        <label htmlFor="confirm-password">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            id="confirm-password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={
                                handleConfirmPasswordChange
                            }
                            className={
                                errors.confirmPassword
                                    ? "input-error"
                                    : ""
                            }
                        />

                        {errors.confirmPassword && (
                            <p className="field-error">
                                {errors.confirmPassword}
                            </p>
                        )}

                    </div>


                    {/* =========================
                        GENERAL ERROR
                    ========================== */}

                    {errors.general && (
                        <p className="field-error">
                            {errors.general}
                        </p>
                    )}


                    {/* =========================
                        SUCCESS MESSAGE
                    ========================== */}

                    {successMessage && (
                        <p className="success-message">
                            {successMessage}
                        </p>
                    )}


                    {/* =========================
                        REGISTER BUTTON
                    ========================== */}

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Registering..."
                            : "Register"}
                    </button>


                    {/* =========================
                        LOGIN LINK
                    ========================== */}

                    <p className="switch-form">
                        Already have an account?
                    </p>

                    <div className="login-link">

                        <Link to="/login">
                            Login here
                        </Link>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default Registration;