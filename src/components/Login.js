import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../css/Login.css";

const API_URL = "https://project-final-backend-oeh1.onrender.com/api";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // SAVE SESSION AND REDIRECT
    const completeLogin = (data) => {
        const userData = data.data || data.user;

        if (!data.token || !userData) {
            throw new Error(
                "Authentication token or user data was not received."
            );
        }

        if (userData.role !== role) {
            throw new Error(
                `This account is registered as ${
                    userData.role || "another role"
                }. Please select the correct role.`
            );
        }

        const accountStatus = String(
            userData.status || "pending"
        ).trim().toLowerCase();

        if (accountStatus === "pending") {
            throw new Error(
                `Your ${role} account is pending admin approval.`
            );
        }

        if (accountStatus === "rejected") {
            throw new Error(
                `Your ${role} account has been rejected by the admin.`
            );
        }

        if (accountStatus !== "approved") {
            throw new Error(
                `Your ${role} account is not approved yet.`
            );
        }

        const userName =
            userData.fullName ||
            userData.name ||
            userData.username ||
            userData.userName ||
            "";

        const loginData = {
            id:
                userData.id ||
                userData._id ||
                userData.userId ||
                "",
            name: userName,
            email: userData.email || email.trim(),
            role: userData.role,
            qualification: userData.qualification || "",
            specialization: userData.specialization || "",
            status: userData.status,
            token: data.token,
        };

        // Keep student and faculty sessions independent.
        localStorage.removeItem("token");

        if (role === "student") {
            localStorage.setItem("studentToken", data.token);
            sessionStorage.setItem(
                "studentSession",
                JSON.stringify(loginData)
            );
        } else {
            localStorage.setItem("facultyToken", data.token);
            sessionStorage.setItem(
                "facultySession",
                JSON.stringify(loginData)
            );
        }

        window.dispatchEvent(new Event("userLoginChanged"));

        setErrors({});

        navigate(role === "student" ? "/" : "/faculty", {
            replace: true,
        });
    };

    // EMAIL AND PASSWORD LOGIN
    const handleLogin = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ) {
            newErrors.email =
                "Please enter a valid email address.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            completeLogin(data);
        } catch (error) {
            console.error("Login Error:", error);

            setErrors({
                password:
                    error.message ||
                    "Unable to connect to server. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // GOOGLE LOGIN
    const handleGoogleSuccess = async (googleResponse) => {
        if (!googleResponse.credential) {
            setErrors({
                password: "Google did not return a credential.",
            });
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/google-auth`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        credential: googleResponse.credential,
                        role,
                        mode: "login",
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Google login failed. Please try again."
                );
            }

            completeLogin(data);
        } catch (error) {
            console.error("Google Login Error:", error);

            setErrors({
                password:
                    error.message ||
                    "Unable to connect to server. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // INPUT HANDLERS
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setErrors({});
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setErrors({});
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setEmail("");
        setPassword("");
        setErrors({});
    };

    // UI
    return (
        <div className="login-container">
            <div className="login-box">
                <h2>
                    {role === "student"
                        ? "Student Login"
                        : "Faculty Login"}
                </h2>

                <form onSubmit={handleLogin} noValidate>
                    <div className="input-group">
                        <label htmlFor="login-role">
                            Login As
                        </label>

                        <select
                            id="login-role"
                            value={role}
                            onChange={handleRoleChange}
                            disabled={isLoading}
                        >
                            <option value="student">
                                Student
                            </option>
                            <option value="faculty">
                                Faculty
                            </option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="login-email">
                            Email Address
                        </label>

                        <input
                            type="email"
                            id="login-email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                            className={
                                errors.email ? "input-error" : ""
                            }
                            disabled={isLoading}
                        />

                        {errors.email && (
                            <p className="field-error">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            type="password"
                            id="login-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={handlePasswordChange}
                            className={
                                errors.password ? "input-error" : ""
                            }
                            disabled={isLoading}
                        />

                        {errors.password && (
                            <p className="field-error">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>

                    {/* Show Google Login only for Students */}
                    {role === "student" && (
                        <div className="google-login-section">
                            <p className="google-login-text">
                                Or continue with Google
                            </p>

                            <div className="google-login-button">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() =>
                                        setErrors({
                                            general:
                                                "Google login failed. Please try again.",
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

                    <p className="switch-form">
                        Don't have an account?
                    </p>

                    <div className="registration-links">
                        <Link to="/register">
                            Register here
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;