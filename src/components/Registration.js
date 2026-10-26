import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../css/Registration.css";

const API_URL = "https://project-final-backend-oeh1.onrender.com/api";

const Registration = () => {
    const [role, setRole] = useState("student");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [qualification, setQualification] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Reset form messages
    const clearMessages = () => {
        setErrors({});
        setSuccessMessage("");
    };

    // NORMAL REGISTRATION
    const handleRegister = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            newErrors.name = "Full name is required.";
        } else if (trimmedName.length < 2) {
            newErrors.name = "Name must be at least 2 characters.";
        }

        if (!trimmedEmail) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password.";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSuccessMessage("");
            return;
        }

        setErrors({});
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: trimmedName,
                    email: trimmedEmail,
                    password,
                    role,
                    ...(role === "faculty" && {
                        qualification: qualification.trim(),
                        specialization: specialization.trim(),
                    }),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Registration failed. Please try again."
                );
            }

            setSuccessMessage(
                `${role === "student" ? "Student" : "Faculty"} registration successful! Your account is pending admin approval.`
            );

            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setQualification("");
            setSpecialization("");
            setErrors({});
        } catch (error) {
            console.error("Registration Error:", error);

            setErrors({
                general:
                    error.message ||
                    "Unable to connect to server. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // GOOGLE REGISTRATION
    const handleGoogleSuccess = async (googleResponse) => {
        if (!googleResponse.credential) {
            setErrors({
                general: "Google did not return a credential. Please try again.",
            });
            return;
        }

        setErrors({});
        setSuccessMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/google-auth`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credential: googleResponse.credential,
                    role,
                    mode: "register",
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Google registration failed. Please try again."
                );
            }

            setSuccessMessage(
                data.message ||
                `${role === "student" ? "Student" : "Faculty"} Google registration successful! Your account is pending admin approval.`
            );

            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setQualification("");
            setSpecialization("");
            setErrors({});
        } catch (error) {
            console.error("Google Registration Error:", error);

            setErrors({
                general:
                    error.message ||
                    "Unable to connect to server. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // INPUT HANDLERS
    const handleNameChange = (e) => {
        setName(e.target.value);
        setErrors((prev) => ({
            ...prev,
            name: "",
            general: "",
        }));
        setSuccessMessage("");
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setErrors((prev) => ({
            ...prev,
            email: "",
            general: "",
        }));
        setSuccessMessage("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setErrors((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
            general: "",
        }));
        setSuccessMessage("");
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setErrors((prev) => ({
            ...prev,
            confirmPassword: "",
            general: "",
        }));
        setSuccessMessage("");
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setQualification("");
        setSpecialization("");
        setErrors({});
        setSuccessMessage("");
    };

    return (
        <div className="registration-container">
            <div className="registration-box">
                <h2>
                    {role === "student"
                        ? "Student Registration"
                        : "Faculty Registration"}
                </h2>

                <form onSubmit={handleRegister} noValidate>
                    {/* ROLE */}
                    <div className="input-group">
                        <label htmlFor="register-role">Register As</label>

                        <select
                            id="register-role"
                            value={role}
                            onChange={handleRoleChange}
                            disabled={isLoading}
                        >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>

                    {/* FULL NAME */}
                    <div className="input-group">
                        <label htmlFor="register-name">Full Name</label>

                        <input
                            type="text"
                            id="register-name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={handleNameChange}
                            className={errors.name ? "input-error" : ""}
                            disabled={isLoading}
                        />

                        {errors.name && (
                            <p className="field-error">{errors.name}</p>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div className="input-group">
                        <label htmlFor="register-email">Email Address</label>

                        <input
                            type="email"
                            id="register-email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                            className={errors.email ? "input-error" : ""}
                            disabled={isLoading}
                        />

                        {errors.email && (
                            <p className="field-error">{errors.email}</p>
                        )}
                    </div>

                    {/* FACULTY QUALIFICATION AND SPECIALIZATION */}
                    {role === "faculty" && (
                        <>
                            <div className="input-group">
                                <label htmlFor="register-qualification">
                                    Qualification
                                </label>

                                <input
                                    type="text"
                                    id="register-qualification"
                                    placeholder="e.g. MCA, BCA, B.Tech"
                                    value={qualification}
                                    onChange={(e) =>
                                        setQualification(e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="register-specialization">
                                    Specialization
                                </label>

                                <input
                                    type="text"
                                    id="register-specialization"
                                    placeholder="e.g. MERN, Data Science"
                                    value={specialization}
                                    onChange={(e) =>
                                        setSpecialization(e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                        </>
                    )}

                    {/* PASSWORD */}
                    <div className="input-group">
                        <label htmlFor="register-password">Password</label>

                        <input
                            type="password"
                            id="register-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={handlePasswordChange}
                            className={errors.password ? "input-error" : ""}
                            disabled={isLoading}
                        />

                        {errors.password && (
                            <p className="field-error">{errors.password}</p>
                        )}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="input-group">
                        <label htmlFor="confirm-password">Confirm Password</label>

                        <input
                            type="password"
                            id="confirm-password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className={
                                errors.confirmPassword ? "input-error" : ""
                            }
                            disabled={isLoading}
                        />

                        {errors.confirmPassword && (
                            <p className="field-error">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* GENERAL ERROR */}
                    {errors.general && (
                        <p className="field-error" role="alert">
                            {errors.general}
                        </p>
                    )}

                    {/* SUCCESS MESSAGE */}
                    {successMessage && (
                        <p className="success-message" role="status">
                            {successMessage}
                        </p>
                    )}

                    {/* REGISTER BUTTON */}
                    <button
                        type="submit"
                        className="register-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Registering..." : "Register"}
                    </button>

                    {/* GOOGLE REGISTRATION: STUDENTS ONLY */}
                    {role !== "faculty" && (
                        <div className="google-register-section">
                            <p className="google-register-text">
                                Or continue with Google
                            </p>

                            <div className="google-register-button">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() =>
                                        setErrors({
                                            general:
                                                "Google registration failed. Please try again.",
                                        })
                                    }
                                    text="continue_with"
                                    shape="rectangular"
                                    size="large"
                                    width={430}
                                />
                            </div>
                        </div>
                    )}

                    {/* LOGIN LINK */}
                    <p className="switch-form">
                        Already have an account?
                    </p>

                    <div className="login-link">
                        <Link to="/login">Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registration;