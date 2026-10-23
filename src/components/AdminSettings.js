import React, { useEffect, useState } from "react";

import {
    UserRound,
    Lock,
    Settings,
    Bell,
    Mail,
    Save,
    AlertCircle,
    CheckCircle,
    Phone,
    Globe,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "../css/AdminSettings.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const AdminSettings = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("profile");

    const [loading, setLoading] = useState(true);

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [platformLoading, setPlatformLoading] = useState(false);
    const [notificationLoading, setNotificationLoading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const [platformErrors, setPlatformErrors] = useState({});

    const [profile, setProfile] = useState({
        name: "",
        email: "",
    });

    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [platform, setPlatform] = useState({
        platformName: "",
        supportEmail: "",
        supportPhone: "",
    });

    const [notifications, setNotifications] = useState({
        newStudent: true,
        newFaculty: true,
        payment: true,
        courseApproval: true,
    });

    /* =====================================================
       GET ADMIN TOKEN
    ===================================================== */

    const getAdminToken = () => {
        return localStorage.getItem("adminToken");
    };

    /* =====================================================
       GET ADMIN ID
    ===================================================== */

    const getAdminId = () => {
        try {
            const adminSession = sessionStorage.getItem("adminSession");

            if (!adminSession) {
                return null;
            }

            const admin = JSON.parse(adminSession);

            return admin?._id || admin?.id || admin?.adminId || null;
        } catch (error) {
            console.error("Admin Session Error:", error);
            return null;
        }
    };

    /* =====================================================
       COMMON HEADERS
    ===================================================== */

    const getHeaders = () => {
        const token = getAdminToken();

        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    };

    /* =====================================================
       CLEAR MESSAGES
    ===================================================== */

    const clearMessages = () => {
        setSuccessMessage("");
        setErrorMessage("");
    };

    /* =====================================================
       HANDLE AUTH ERROR
    ===================================================== */

    const handleAuthError = (response) => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("adminToken");
            sessionStorage.removeItem("adminSession");
            sessionStorage.removeItem("isAdminLoggedIn");

            setErrorMessage(
                "Your admin session has expired. Please login again."
            );

            return true;
        }

        return false;
    };

    /* =====================================================
       LOAD ADMIN SETTINGS
    ===================================================== */

    const loadSettings = async () => {
        try {
            setLoading(true);
            clearMessages();

            const token = getAdminToken();
            const adminId = getAdminId();

            if (!token) {
                navigate("/admin-login", { replace: true });
                return;
            }

            if (!adminId) {
                setErrorMessage(
                    "Admin information could not be found. Please login again."
                );
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin-settings/${adminId}`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load admin settings."
                );
            }

            const settings = data.data || {};

            setProfile({
                name: settings.profile?.name || "",
                email: settings.profile?.email || "",
            });

            setPlatform({
                platformName:
                    settings.platform?.platformName ||
                    "Online Learning Platform",

                supportEmail:
                    settings.platform?.supportEmail ||
                    "support@example.com",

                supportPhone:
                    settings.platform?.supportPhone || "",
            });

            setNotifications({
                newStudent:
                    settings.notifications?.newStudent ?? true,

                newFaculty:
                    settings.notifications?.newFaculty ?? true,

                payment:
                    settings.notifications?.payment ?? true,

                courseApproval:
                    settings.notifications?.courseApproval ?? true,
            });
        } catch (error) {
            console.error("Load Admin Settings Error:", error);

            setErrorMessage(
                error.message ||
                "Unable to load admin settings."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       USE EFFECT
    ===================================================== */

    useEffect(() => {
        loadSettings();
    }, []);

    /* =====================================================
       PROFILE VALIDATION
    ===================================================== */

    const validateProfile = () => {
        const errors = {};

        const trimmedName = profile.name.trim();
        const trimmedEmail = profile.email.trim();

        if (!trimmedName) {
            errors.name = "Admin name is required.";
        } else if (trimmedName.length < 2) {
            errors.name =
                "Admin name must be at least 2 characters.";
        }

        if (!trimmedEmail) {
            errors.email = "Email address is required.";
        } else {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(trimmedEmail)) {
                errors.email =
                    "Please enter a valid email address.";
            }
        }

        setProfileErrors(errors);

        return Object.keys(errors).length === 0;
    };

    /* =====================================================
       PROFILE CHANGE
    ===================================================== */

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));

        setProfileErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setErrorMessage("");
        setSuccessMessage("");
    };

    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    const handleProfileSave = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!validateProfile()) {
            return;
        }

        try {
            setProfileLoading(true);

            const adminId = getAdminId();

            if (!adminId) {
                setErrorMessage(
                    "Admin information could not be found."
                );
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin-settings/${adminId}/profile`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        name: profile.name.trim(),
                        email: profile.email.trim().toLowerCase(),
                    }),
                }
            );

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                if (data.field) {
                    setProfileErrors({
                        [data.field]: data.message,
                    });
                }

                throw new Error(
                    data.message ||
                    "Failed to update profile."
                );
            }

            if (data.data) {
                setProfile({
                    name: data.data.name || "",
                    email: data.data.email || "",
                });
            }

            /* =============================================
               UPDATE ADMIN SESSION
            ============================================= */

            try {
                const existingSession =
                    sessionStorage.getItem("adminSession");

                if (existingSession) {
                    const adminSession =
                        JSON.parse(existingSession);

                    const updatedSession = {
                        ...adminSession,
                        name:
                            data.data?.name ||
                            profile.name.trim(),

                        email:
                            data.data?.email ||
                            profile.email.trim().toLowerCase(),
                    };

                    sessionStorage.setItem(
                        "adminSession",
                        JSON.stringify(updatedSession)
                    );
                }
            } catch (sessionError) {
                console.error(
                    "Admin Session Update Error:",
                    sessionError
                );
            }

            setSuccessMessage(
                data.message ||
                "Profile updated successfully."
            );
        } catch (error) {
            console.error(
                "Update Admin Profile Error:",
                error
            );

            setErrorMessage(
                error.message ||
                "Unable to update admin profile."
            );
        } finally {
            setProfileLoading(false);
        }
    };

    /* =====================================================
       PASSWORD VALIDATION
    ===================================================== */

    const validatePassword = () => {
        const errors = {};

        if (!password.currentPassword) {
            errors.currentPassword =
                "Current password is required.";
        }

        if (!password.newPassword) {
            errors.newPassword =
                "New password is required.";
        } else if (password.newPassword.length < 6) {
            errors.newPassword =
                "New password must be at least 6 characters.";
        }

        if (!password.confirmPassword) {
            errors.confirmPassword =
                "Please confirm your new password.";
        } else if (
            password.newPassword !==
            password.confirmPassword
        ) {
            errors.confirmPassword =
                "New password and confirm password do not match.";
        }

        if (
            password.currentPassword &&
            password.newPassword &&
            password.currentPassword ===
            password.newPassword
        ) {
            errors.newPassword =
                "New password must be different from current password.";
        }

        setPasswordErrors(errors);

        return Object.keys(errors).length === 0;
    };

    /* =====================================================
       PASSWORD CHANGE
    ===================================================== */

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPassword((previous) => ({
            ...previous,
            [name]: value,
        }));

        setPasswordErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setErrorMessage("");
        setSuccessMessage("");
    };

    /* =====================================================
       SAVE PASSWORD
    ===================================================== */

    const handlePasswordSave = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!validatePassword()) {
            return;
        }

        try {
            setPasswordLoading(true);

            const adminId = getAdminId();

            if (!adminId) {
                setErrorMessage(
                    "Admin information could not be found."
                );
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin-settings/${adminId}/password`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        currentPassword:
                            password.currentPassword,

                        newPassword:
                            password.newPassword,

                        confirmPassword:
                            password.confirmPassword,
                    }),
                }
            );

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                if (data.field) {
                    setPasswordErrors({
                        [data.field]: data.message,
                    });
                }

                throw new Error(
                    data.message ||
                    "Failed to update password."
                );
            }

            setPassword({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setPasswordErrors({});

            setSuccessMessage(
                data.message ||
                "Password updated successfully."
            );
        } catch (error) {
            console.error(
                "Update Admin Password Error:",
                error
            );

            setErrorMessage(
                error.message ||
                "Unable to update password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    /* =====================================================
       PLATFORM VALIDATION
    ===================================================== */

    const validatePlatform = () => {
        const errors = {};

        if (!platform.platformName.trim()) {
            errors.platformName =
                "Platform name is required.";
        }

        if (!platform.supportEmail.trim()) {
            errors.supportEmail =
                "Support email is required.";
        } else {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(platform.supportEmail.trim())) {
                errors.supportEmail =
                    "Please enter a valid support email.";
            }
        }

        setPlatformErrors(errors);

        return Object.keys(errors).length === 0;
    };

    /* =====================================================
       PLATFORM CHANGE
    ===================================================== */

    const handlePlatformChange = (event) => {
        const { name, value } = event.target;

        setPlatform((previous) => ({
            ...previous,
            [name]: value,
        }));

        setPlatformErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setErrorMessage("");
        setSuccessMessage("");
    };

    /* =====================================================
       SAVE PLATFORM
    ===================================================== */

    const handlePlatformSave = async (event) => {
        event.preventDefault();

        clearMessages();

        if (!validatePlatform()) {
            return;
        }

        try {
            setPlatformLoading(true);

            const adminId = getAdminId();

            if (!adminId) {
                setErrorMessage(
                    "Admin information could not be found."
                );
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/admin-settings/${adminId}/platform`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify({
                        platformName:
                            platform.platformName.trim(),

                        supportEmail:
                            platform.supportEmail.trim().toLowerCase(),

                        supportPhone:
                            platform.supportPhone.trim(),
                    }),
                }
            );

            if (handleAuthError(response)) {
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                if (data.field) {
                    setPlatformErrors({
                        [data.field]: data.message,
                    });
                }

                throw new Error(
                    data.message ||
                    "Failed to update platform settings."
                );
            }

            if (data.data) {
                setPlatform({
                    platformName:
                        data.data.platformName || "",

                    supportEmail:
                        data.data.supportEmail || "",

                    supportPhone:
                        data.data.supportPhone || "",
                });
            }

            setSuccessMessage(
                data.message ||
                "Platform settings updated successfully."
            );
        } catch (error) {
            console.error(
                "Update Platform Error:",
                error
            );

            setErrorMessage(
                error.message ||
                "Unable to update platform settings."
            );
        } finally {
            setPlatformLoading(false);
        }
    };

    /* =====================================================
       NOTIFICATION CHANGE
    ===================================================== */

    const handleNotificationChange = async (event) => {
        const { name, checked } = event.target;

        clearMessages();

        const previousNotifications = {
            ...notifications,
        };

        setNotifications((previous) => ({
            ...previous,
            [name]: checked,
        }));

        try {
            setNotificationLoading(true);

            const adminId = getAdminId();

            if (!adminId) {
                setNotifications(previousNotifications);

                setErrorMessage(
                    "Admin information could not be found."
                );

                return;
            }

            const updatedNotifications = {
                ...notifications,
                [name]: checked,
            };

            const response = await fetch(
                `${API_BASE_URL}/api/admin-settings/${adminId}/notifications`,
                {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify(
                        updatedNotifications
                    ),
                }
            );

            if (handleAuthError(response)) {
                setNotifications(previousNotifications);
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setNotifications(previousNotifications);

                throw new Error(
                    data.message ||
                    "Failed to update notification settings."
                );
            }

            if (data.data) {
                setNotifications({
                    newStudent:
                        data.data.newStudent ?? true,

                    newFaculty:
                        data.data.newFaculty ?? true,

                    payment:
                        data.data.payment ?? true,

                    courseApproval:
                        data.data.courseApproval ?? true,
                });
            }

            setSuccessMessage(
                data.message ||
                "Notification settings updated successfully."
            );
        } catch (error) {
            console.error(
                "Update Notifications Error:",
                error
            );

            setNotifications(previousNotifications);

            setErrorMessage(
                error.message ||
                "Unable to update notification settings."
            );
        } finally {
            setNotificationLoading(false);
        }
    };

    /* =====================================================
       TAB CHANGE
    ===================================================== */

    const handleTabChange = (tab) => {
        clearMessages();

        setProfileErrors({});
        setPasswordErrors({});
        setPlatformErrors({});

        setActiveTab(tab);
    };

    /* =====================================================
       FIELD ERROR COMPONENT
    ===================================================== */

    const FieldError = ({ message }) => {
        if (!message) {
            return null;
        }

        return (
            <div className="admin-field-error">
                <AlertCircle size={14} />
                <span>{message}</span>
            </div>
        );
    };

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="admin-settings">
                <div className="admin-settings-header">
                    <h1>Settings</h1>
                    <p>
                        Manage your admin account and platform
                        settings.
                    </p>
                </div>

                <div className="admin-settings-section">
                    Loading settings...
                </div>
            </div>
        );
    }

    /* =====================================================
       MAIN UI
    ===================================================== */

    return (
        <div className="admin-settings">

            {/* =============================================
                HEADER
            ============================================= */}

            <div className="admin-settings-header">
                <h1>Settings</h1>

                <p>
                    Manage your admin account and platform
                    settings.
                </p>
            </div>


            {/* =============================================
                SUCCESS MESSAGE
            ============================================= */}

            {successMessage && (
                <div className="settings-success-message">
                    <CheckCircle size={18} />

                    <span>
                        {successMessage}
                    </span>
                </div>
            )}


            {/* =============================================
                ERROR MESSAGE
            ============================================= */}

            {errorMessage && (
                <div className="settings-error-message">
                    <AlertCircle size={18} />

                    <span>
                        {errorMessage}
                    </span>
                </div>
            )}


            {/* =============================================
                MAIN CONTAINER
            ============================================= */}

            <div className="admin-settings-container">

                {/* =========================================
                    SIDEBAR
                ========================================= */}

                <div className="admin-settings-sidebar">

                    <button
                        type="button"
                        className={
                            activeTab === "profile"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            handleTabChange("profile")
                        }
                    >
                        <UserRound size={18} />
                        <span>Profile</span>
                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "password"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            handleTabChange("password")
                        }
                    >
                        <Lock size={18} />
                        <span>Password</span>
                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "platform"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            handleTabChange("platform")
                        }
                    >
                        <Settings size={18} />
                        <span>Platform</span>
                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "notifications"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            handleTabChange(
                                "notifications"
                            )
                        }
                    >
                        <Bell size={18} />
                        <span>Notifications</span>
                    </button>

                </div>


                {/* =========================================
                    CONTENT
                ========================================= */}

                <div className="admin-settings-content">

                    {/* =====================================
                        PROFILE
                    ===================================== */}

                    {activeTab === "profile" && (
                        <div className="admin-settings-section">

                            <div className="settings-section-title">
                                <UserRound size={22} />

                                <div>
                                    <h2>
                                        Admin Profile
                                    </h2>

                                    <p>
                                        Update your admin
                                        account information.
                                    </p>
                                </div>
                            </div>


                            <form
                                className="admin-settings-form"
                                onSubmit={
                                    handleProfileSave
                                }
                            >

                                <div className="admin-form-group">

                                    <label htmlFor="profile-name">
                                        Admin Name
                                    </label>

                                    <div className="admin-input-wrapper">

                                        <UserRound
                                            size={17}
                                        />

                                        <input
                                            id="profile-name"
                                            type="text"
                                            name="name"
                                            value={
                                                profile.name
                                            }
                                            onChange={
                                                handleProfileChange
                                            }
                                            placeholder="Enter admin name"
                                            className={
                                                profileErrors.name
                                                    ? "admin-input-error"
                                                    : ""
                                            }
                                        />

                                    </div>

                                    <FieldError
                                        message={
                                            profileErrors.name
                                        }
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label htmlFor="profile-email">
                                        Email Address
                                    </label>

                                    <div className="admin-input-wrapper">

                                        <Mail
                                            size={17}
                                        />

                                        <input
                                            id="profile-email"
                                            type="email"
                                            name="email"
                                            value={
                                                profile.email
                                            }
                                            onChange={
                                                handleProfileChange
                                            }
                                            placeholder="Enter admin email"
                                            className={
                                                profileErrors.email
                                                    ? "admin-input-error"
                                                    : ""
                                            }
                                        />

                                    </div>

                                    <FieldError
                                        message={
                                            profileErrors.email
                                        }
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="admin-save-btn"
                                    disabled={
                                        profileLoading
                                    }
                                >
                                    <Save size={17} />

                                    {profileLoading
                                        ? "Saving..."
                                        : "Save Profile"}
                                </button>

                            </form>

                        </div>
                    )}


                    {/* =====================================
                        PASSWORD
                    ===================================== */}

                    {activeTab === "password" && (
                        <div className="admin-settings-section">

                            <div className="settings-section-title">
                                <Lock size={22} />

                                <div>
                                    <h2>
                                        Password & Security
                                    </h2>

                                    <p>
                                        Change your admin
                                        account password.
                                    </p>
                                </div>
                            </div>


                            <form
                                className="admin-settings-form"
                                onSubmit={
                                    handlePasswordSave
                                }
                            >

                                <div className="admin-form-group">

                                    <label htmlFor="current-password">
                                        Current Password
                                    </label>

                                    <div className="admin-input-wrapper">

                                        <Lock
                                            size={17}
                                        />

                                        <input
                                            id="current-password"
                                            type="password"
                                            name="currentPassword"
                                            value={
                                                password.currentPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Enter current password"
                                            className={
                                                passwordErrors.currentPassword
                                                    ? "admin-input-error"
                                                    : ""
                                            }
                                        />

                                    </div>

                                    <FieldError
                                        message={
                                            passwordErrors.currentPassword
                                        }
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label htmlFor="new-password">
                                        New Password
                                    </label>

                                    <div className="admin-input-wrapper">

                                        <Lock
                                            size={17}
                                        />

                                        <input
                                            id="new-password"
                                            type="password"
                                            name="newPassword"
                                            value={
                                                password.newPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Enter new password"
                                            className={
                                                passwordErrors.newPassword
                                                    ? "admin-input-error"
                                                    : ""
                                            }
                                        />

                                    </div>

                                    <FieldError
                                        message={
                                            passwordErrors.newPassword
                                        }
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label htmlFor="confirm-password">
                                        Confirm New Password
                                    </label>

                                    <div className="admin-input-wrapper">

                                        <Lock
                                            size={17}
                                        />

                                        <input
                                            id="confirm-password"
                                            type="password"
                                            name="confirmPassword"
                                            value={
                                                password.confirmPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Confirm new password"
                                            className={
                                                passwordErrors.confirmPassword
                                                    ? "admin-input-error"
                                                    : ""
                                            }
                                        />

                                    </div>

                                    <FieldError
                                        message={
                                            passwordErrors.confirmPassword
                                        }
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="admin-save-btn"
                                    disabled={
                                        passwordLoading
                                    }
                                >
                                    <Save size={17} />

                                    {passwordLoading
                                        ? "Updating..."
                                        : "Update Password"}
                                </button>

                            </form>

                        </div>
                    )}


                    {/* =====================================
                        PLATFORM
                    ===================================== */}

                    {activeTab === "platform" && (
                        <div className="admin-settings-section">

                            <div className="settings-section-title">
                                <Settings size={22} />

                                <div>
                                    <h2>
                                        Platform Settings
                                    </h2>

                                    <p>
                                        Configure your
                                        learning platform
                                        information.
                                    </p>
                                </div>
                            </div>


                            <form
                                className="admin-settings-form"
                                onSubmit={
                                    handlePlatformSave
                                }
                            >

                                <div className="admin-form-group">

                                    <label htmlFor="platform-name">
                                        Platform Name
                                    </label>

                                    <div className="admin-input-wrapper">

                                        <Globe
                                            size={17}
                                        />

                                        <input
                                            id="platform-name"
                                            type="text"
                                            name="platformName"
                                            value={
                                                platform.platformName
                                            }
                                            onChange={
                                                handlePlatformChange
                                            }
                                            placeholder="Enter platform name"
                                            className={
                                                platformErrors.platformName
                                                    ? "admin-input-error"
                                                    : ""
                                            }
                                        />

                                    </div>

                                    <FieldError
                                        message={
                                            platformErrors.platformName
                                        }
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label htmlFor="support-email">
                                        Support Email
                                    </label>

                                    <div className="admin-input-wrapper">

                                        <Mail
                                            size={17}
                                        />

                                        <input
                                            id="support-email"
                                            type="email"
                                            name="supportEmail"
                                            value={
                                                platform.supportEmail
                                            }
                                            onChange={
                                                handlePlatformChange
                                            }
                                            placeholder="Enter support email"
                                            className={
                                                platformErrors.supportEmail
                                                    ? "admin-input-error"
                                                    : ""
                                            }
                                        />

                                    </div>

                                    <FieldError
                                        message={
                                            platformErrors.supportEmail
                                        }
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label htmlFor="support-phone">
                                        Support Phone
                                    </label>

                                    <div className="admin-input-wrapper">

                                        <Phone
                                            size={17}
                                        />

                                        <input
                                            id="support-phone"
                                            type="text"
                                            name="supportPhone"
                                            value={
                                                platform.supportPhone
                                            }
                                            onChange={
                                                handlePlatformChange
                                            }
                                            placeholder="Enter support phone"
                                        />

                                    </div>

                                </div>


                                <button
                                    type="submit"
                                    className="admin-save-btn"
                                    disabled={
                                        platformLoading
                                    }
                                >
                                    <Save size={17} />

                                    {platformLoading
                                        ? "Saving..."
                                        : "Save Platform Settings"}
                                </button>

                            </form>

                        </div>
                    )}


                    {/* =====================================
                        NOTIFICATIONS
                    ===================================== */}

                    {activeTab === "notifications" && (
                        <div className="admin-settings-section">

                            <div className="settings-section-title">
                                <Bell size={22} />

                                <div>
                                    <h2>
                                        Notification Settings
                                    </h2>

                                    <p>
                                        Choose which platform
                                        notifications you
                                        want to receive.
                                    </p>
                                </div>
                            </div>


                            <div className="notification-settings">

                                {/* New Student */}

                                <label className="notification-item">

                                    <div>
                                        <strong>
                                            New Student
                                        </strong>

                                        <span>
                                            Receive notifications
                                            when a new student
                                            registers.
                                        </span>
                                    </div>

                                    <input
                                        type="checkbox"
                                        name="newStudent"
                                        checked={
                                            notifications.newStudent
                                        }
                                        onChange={
                                            handleNotificationChange
                                        }
                                        disabled={
                                            notificationLoading
                                        }
                                    />

                                </label>


                                {/* New Faculty */}

                                <label className="notification-item">

                                    <div>
                                        <strong>
                                            New Faculty
                                        </strong>

                                        <span>
                                            Receive notifications
                                            when a new faculty
                                            member registers.
                                        </span>
                                    </div>

                                    <input
                                        type="checkbox"
                                        name="newFaculty"
                                        checked={
                                            notifications.newFaculty
                                        }
                                        onChange={
                                            handleNotificationChange
                                        }
                                        disabled={
                                            notificationLoading
                                        }
                                    />

                                </label>


                                {/* Payment */}

                                <label className="notification-item">

                                    <div>
                                        <strong>
                                            Payment Updates
                                        </strong>

                                        <span>
                                            Receive notifications
                                            about student payment
                                            activities.
                                        </span>
                                    </div>

                                    <input
                                        type="checkbox"
                                        name="payment"
                                        checked={
                                            notifications.payment
                                        }
                                        onChange={
                                            handleNotificationChange
                                        }
                                        disabled={
                                            notificationLoading
                                        }
                                    />

                                </label>


                                {/* Course Approval */}

                                <label className="notification-item">

                                    <div>
                                        <strong>
                                            Course Approval
                                        </strong>

                                        <span>
                                            Receive notifications
                                            when courses require
                                            approval.
                                        </span>
                                    </div>

                                    <input
                                        type="checkbox"
                                        name="courseApproval"
                                        checked={
                                            notifications.courseApproval
                                        }
                                        onChange={
                                            handleNotificationChange
                                        }
                                        disabled={
                                            notificationLoading
                                        }
                                    />

                                </label>

                            </div>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default AdminSettings;