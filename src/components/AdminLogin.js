import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminLogin.css";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault();

        const newErrors = {};
        const trimmedEmail = email.trim();

        // ==============================
        // EMAIL VALIDATION
        // ==============================

        if (!trimmedEmail) {
            newErrors.email = "Admin email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ) {
            newErrors.email =
                "Please enter a valid admin email address.";
        }

        // ==============================
        // PASSWORD VALIDATION
        // ==============================

        if (!password) {
            newErrors.password = "Password is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoading(true);
            setErrors({});

            const response = await fetch(
                "https://project-final-backend-oeh1.onrender.com/api/admin-login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: trimmedEmail,
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            // ==============================
            // LOGIN ERROR
            // ==============================

            if (!response.ok || !data.success) {
                setErrors({
                    password:
                        data.message ||
                        "Invalid admin email or password.",
                });

                return;
            }

            // ==============================
            // CHECK TOKEN
            // ==============================

            if (!data.token) {
                setErrors({
                    password:
                        "Admin login successful, but token was not received.",
                });

                return;
            }

            // ==============================
            // SAVE ADMIN JWT
            // ==============================

            localStorage.setItem(
                "adminToken",
                data.token
            );

            // ==============================
            // SAVE ADMIN SESSION
            // ==============================

            if (data.admin) {
                sessionStorage.setItem(
                    "adminSession",
                    JSON.stringify(data.admin)
                );
            }

            sessionStorage.setItem(
                "isAdminLoggedIn",
                "true"
            );

            // Remove old login state
            localStorage.removeItem("isAdminLoggedIn");

            // ==============================
            // VERIFY TOKEN WAS SAVED
            // ==============================

            const savedToken =
                localStorage.getItem("adminToken");

            if (!savedToken) {
                setErrors({
                    password:
                        "Unable to save admin login session. Please try again.",
                });

                return;
            }

            console.log(
                "Admin login successful."
            );

            console.log(
                "Admin token saved:",
                "Yes"
            );

            // ==============================
            // REDIRECT
            // ==============================

            navigate("/admin", {
                replace: true,
            });

        } catch (error) {
            console.error(
                "Admin login error:",
                error
            );

            setErrors({
                password:
                    "Unable to connect to the server. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ==============================
    // EMAIL CHANGE
    // ==============================

    const handleEmailChange = (e) => {
        setEmail(e.target.value);

        if (errors.email) {
            setErrors((prev) => ({
                ...prev,
                email: "",
            }));
        }
    };

    // ==============================
    // PASSWORD CHANGE
    // ==============================

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);

        if (errors.password) {
            setErrors((prev) => ({
                ...prev,
                password: "",
            }));
        }
    };

    return (
        <div className="admin-login-container">

            <div className="admin-login-box">

                {/* ================= HEADER ================= */}

                <div className="admin-login-header">

                    <span className="brand-mark"></span>

                    <h2>
                        Admin Login
                    </h2>

                    <p>
                        Login to access admin dashboard
                    </p>

                </div>

                {/* ================= LOGIN FORM ================= */}

                <form
                    onSubmit={handleAdminLogin}
                    noValidate
                >

                    {/* ================= EMAIL ================= */}

                    <div className="input-group">

                        <label htmlFor="admin-email">
                            Email Address
                        </label>

                        <input
                            type="email"
                            id="admin-email"
                            placeholder="admin@gmail.com"
                            value={email}
                            onChange={handleEmailChange}
                            className={
                                errors.email
                                    ? "input-error"
                                    : ""
                            }
                            disabled={isLoading}
                        />

                        {errors.email && (
                            <p className="field-error">
                                {errors.email}
                            </p>
                        )}

                    </div>

                    {/* ================= PASSWORD ================= */}

                    <div className="input-group">

                        <label htmlFor="admin-password">
                            Password
                        </label>

                        <input
                            type="password"
                            id="admin-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={handlePasswordChange}
                            className={
                                errors.password
                                    ? "input-error"
                                    : ""
                            }
                            disabled={isLoading}
                        />

                        {errors.password && (
                            <p className="field-error">
                                {errors.password}
                            </p>
                        )}

                    </div>

                    {/* ================= LOGIN BUTTON ================= */}

                    <button
                        type="submit"
                        className="admin-login-btn"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "Logging in..."
                            : "Login as Admin"}
                    </button>

                </form>

            </div>

        </div>
    );
};

export default AdminLogin;