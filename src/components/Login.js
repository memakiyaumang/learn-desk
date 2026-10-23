import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // ============================================
    // LOGIN
    // ============================================

    const handleLogin = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const trimmedEmail = email.trim();

        // ============================================
        // FRONTEND VALIDATION
        // ============================================

        if (!trimmedEmail) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ) {
            newErrors.email =
                "Please enter a valid email address.";
        }

        if (!password) {
            newErrors.password =
                "Password is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            // ============================================
            // LOGIN API
            // ============================================

            const response = await fetch(
                "https://project-final-backend-oeh1.onrender.com/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: trimmedEmail,
                        password: password,
                        role: role,
                    }),
                }
            );

            const data = await response.json();

            // ============================================
            // LOGIN FAILED
            // ============================================

            if (!response.ok || !data.success) {
                setErrors({
                    password:
                        data.message ||
                        "Invalid email or password.",
                });

                setIsLoading(false);
                return;
            }

            // ============================================
            // CHECK JWT TOKEN
            // ============================================

            if (!data.token) {
                setErrors({
                    password:
                        "Login successful, but authentication token was not received.",
                });

                setIsLoading(false);
                return;
            }

            // ============================================
            // ROLE CHECK
            // ============================================

            if (
                !data.data ||
                data.data.role !== role
            ) {
                setErrors({
                    password:
                        `This account is registered as ${
                            data.data?.role || "another role"
                        }.`,
                });

                setIsLoading(false);
                return;
            }

            // ============================================
            // APPROVAL CHECK
            // ============================================

            const accountStatus = String(
                data.data.status || "pending"
            )
                .trim()
                .toLowerCase();

            if (accountStatus === "pending") {
                setErrors({
                    password:
                        `Your ${role} account is pending admin approval.`,
                });

                setIsLoading(false);
                return;
            }

            if (accountStatus === "rejected") {
                setErrors({
                    password:
                        `Your ${role} account has been rejected by the admin.`,
                });

                setIsLoading(false);
                return;
            }

            if (accountStatus !== "approved") {
                setErrors({
                    password:
                        `Your ${role} account is not approved yet.`,
                });

                setIsLoading(false);
                return;
            }

            // ============================================
            // USER NAME
            // ============================================

            const userName =
                data.data.fullName ||
                data.data.name ||
                data.data.username ||
                data.data.userName ||
                "";

            // ============================================
            // LOGIN DATA
            // ============================================

            const loginData = {
                id:
                    data.data.id ||
                    data.data._id ||
                    data.data.userId ||
                    "",

                name: userName,

                email:
                    data.data.email ||
                    trimmedEmail,

                role:
                    data.data.role,

                qualification:
                    data.data.qualification || "",

                specialization:
                    data.data.specialization || "",

                status:
                    data.data.status,

                // JWT token is also stored inside
                // the role-specific session.
                token:
                    data.token,
            };

            // ============================================
            // DO NOT CLEAR STUDENT/FACULTY SESSION
            // ============================================
            //
            // Student and Faculty can be logged in
            // at the same time.
            //
            // Therefore:
            //
            // Student login:
            // - Keep facultySession
            // - Keep facultyToken
            //
            // Faculty login:
            // - Keep studentSession
            // - Keep studentToken
            //
            // ============================================

            // ============================================
            // CLEAR OLD SHARED TOKEN
            // ============================================
            // We no longer use localStorage.token

            localStorage.removeItem("token");

            // ============================================
            // STORE ROLE-SPECIFIC JWT TOKEN
            // ============================================

            if (role === "student") {
                // ========================================
                // STUDENT LOGIN
                // ========================================
                //
                // Store student token.
                //
                // IMPORTANT:
                // Do NOT remove facultyToken.
                // ========================================

                localStorage.setItem(
                    "studentToken",
                    data.token
                );

                // Store student session.
                //
                // IMPORTANT:
                // Do NOT remove facultySession.
                sessionStorage.setItem(
                    "studentSession",
                    JSON.stringify(loginData)
                );
            }

            if (role === "faculty") {
                // ========================================
                // FACULTY LOGIN
                // ========================================
                //
                // Store faculty token.
                //
                // IMPORTANT:
                // Do NOT remove studentToken.
                // ========================================

                localStorage.setItem(
                    "facultyToken",
                    data.token
                );

                // Store faculty session.
                //
                // IMPORTANT:
                // Do NOT remove studentSession.
                sessionStorage.setItem(
                    "facultySession",
                    JSON.stringify(loginData)
                );
            }

            // ============================================
            // LOGIN EVENT
            // ============================================

            window.dispatchEvent(
                new Event("userLoginChanged")
            );

            setErrors({});

            // ============================================
            // ROLE BASED REDIRECT
            // ============================================

            if (role === "student") {
                navigate("/", {
                    replace: true,
                });
            }

            if (role === "faculty") {
                navigate("/faculty", {
                    replace: true,
                });
            }
        } catch (error) {
            console.error(
                "Login Error:",
                error
            );

            setErrors({
                password:
                    "Unable to connect to server. Please try again.",
            });
        }

        setIsLoading(false);
    };

    // ============================================
    // EMAIL CHANGE
    // ============================================

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        if (errors.email) {
            setErrors((prev) => ({
                ...prev,
                email: "",
            }));
        }

        if (errors.password) {
            setErrors((prev) => ({
                ...prev,
                password: "",
            }));
        }
    };

    // ============================================
    // PASSWORD CHANGE
    // ============================================

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);

        if (errors.password) {
            setErrors((prev) => ({
                ...prev,
                password: "",
            }));
        }
    };

    // ============================================
    // ROLE CHANGE
    // ============================================

    const handleRoleChange = (e) => {
        setRole(e.target.value);

        setEmail("");
        setPassword("");
        setErrors({});
    };

    // ============================================
    // UI
    // ============================================

    return (
        <div className="login-container">

            <div className="login-box">

                <h2>
                    {role === "student"
                        ? "Student Login"
                        : "Faculty Login"}
                </h2>

                <form
                    onSubmit={handleLogin}
                    noValidate
                >

                    {/* ROLE */}

                    <div className="input-group">

                        <label htmlFor="login-role">
                            Login As
                        </label>

                        <select
                            id="login-role"
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

                    {/* EMAIL */}

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

                    {/* PASSWORD */}

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

                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Logging in..."
                            : "Login"}
                    </button>

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