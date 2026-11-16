
import React, { useEffect, useRef, useState } from "react";
import "../css/Header.css";

import {
    Link,
    NavLink,
    useNavigate
} from "react-router-dom";

import {
    UserRound,
    LogOut,
    Bell,
    Menu,
    X,
    BookOpen,
    LayoutDashboard
} from "lucide-react";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const Header = () => {

    const [menuOpen, setMenuOpen] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationError, setNotificationError] = useState("");

    const navigate = useNavigate();

    const avatarMenuRef = useRef(null);
    const notificationRef = useRef(null);

    // =========================================
    // LOAD STUDENT SESSION
    // =========================================

    useEffect(() => {

        const loadUser = () => {

            try {
                const session = JSON.parse(
                    sessionStorage.getItem("studentSession") || "null"
                );

                setLoggedInUser(session);

            } catch (error) {

                console.error("Error loading student session:", error);

                setLoggedInUser(null);
                sessionStorage.removeItem("studentSession");
            }
        };

        loadUser();

        window.addEventListener("userLoginChanged", loadUser);
        window.addEventListener("storage", loadUser);

        return () => {
            window.removeEventListener("userLoginChanged", loadUser);
            window.removeEventListener("storage", loadUser);
        };

    }, []);


    // =========================================
    // CLOSE DROPDOWNS ON OUTSIDE CLICK
    // =========================================

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                avatarMenuRef.current &&
                !avatarMenuRef.current.contains(event.target)
            ) {
                setAvatarMenuOpen(false);
            }

            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };

    }, []);


    // =========================================
    // GET STUDENT TOKEN
    // =========================================

    const getToken = () => {

        try {

            const session = JSON.parse(
                sessionStorage.getItem("studentSession") || "null"
            );

            return (
                session?.token ||
                localStorage.getItem("studentToken")
            );

        } catch {

            return localStorage.getItem("studentToken");
        }
    };


    // =========================================
    // USER NAME AND INITIALS
    // =========================================

    const getUserName = (user) => {

        return (
            user?.name ||
            user?.fullName ||
            user?.username ||
            user?.userName ||
            "Student"
        );
    };

    const getInitials = (name) => {

        if (!name) return "ST";

        const words = name.trim().split(/\s+/);

        if (words.length >= 2) {

            return (
                words[0].charAt(0) +
                words[words.length - 1].charAt(0)
            ).toUpperCase();
        }

        return name.substring(0, 2).toUpperCase();
    };

    const userName = getUserName(loggedInUser);


    // =========================================
    // CLOSE MOBILE MENU
    // =========================================

    const closeMobileMenu = () => {
        setMenuOpen(false);
    };


    // =========================================
    // LOAD STUDENT NOTIFICATIONS
    // =========================================

    const loadNotifications = async () => {

        const token = getToken();

        if (!loggedInUser || !token) {

            setNotifications([]);
            setUnreadCount(0);

            return;
        }

        setNotificationsLoading(true);
        setNotificationError("");

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/student/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load notifications."
                );
            }

            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);

        } catch (error) {

            console.error("Load notifications error:", error);

            setNotificationError(error.message);

        } finally {

            setNotificationsLoading(false);
        }
    };


    useEffect(() => {

        if (loggedInUser) {

            loadNotifications();

        } else {

            setNotifications([]);
            setUnreadCount(0);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedInUser]);


    // =========================================
    // NOTIFICATION BUTTON
    // =========================================

    const handleNotificationClick = async () => {

        if (!loggedInUser) {
            navigate("/login");
            return;
        }

        const willOpen = !notificationsOpen;

        setNotificationsOpen(willOpen);

        if (willOpen) {
            await loadNotifications();
        }
    };


    // =========================================
    // MARK SINGLE NOTIFICATION AS READ
    // =========================================

    const markAsRead = async (notification) => {

        if (notification.isRead) return;

        const token = getToken();

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/student/notifications/${notification._id}/read`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to mark as read."
                );
            }

            setNotifications((current) =>
                current.map((item) =>
                    item._id === notification._id
                        ? { ...item, isRead: true }
                        : item
                )
            );

            setUnreadCount((count) => Math.max(0, count - 1));

        } catch (error) {

            console.error("Mark as read error:", error);

            setNotificationError(error.message);
        }
    };


    // =========================================
    // MARK ALL NOTIFICATIONS AS READ
    // =========================================

    const markAllAsRead = async () => {

        const token = getToken();

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/student/notifications/read-all`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update notifications."
                );
            }

            setNotifications((current) =>
                current.map((item) => ({
                    ...item,
                    isRead: true
                }))
            );

            setUnreadCount(0);

        } catch (error) {

            console.error("Mark all as read error:", error);

            setNotificationError(error.message);
        }
    };


    // =========================================
    // DELETE NOTIFICATION
    // =========================================

    const deleteNotification = async (notificationId) => {

        const token = getToken();

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/student/notifications/${notificationId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to delete notification."
                );
            }

            const deleted = notifications.find(
                (item) => item._id === notificationId
            );

            setNotifications((current) =>
                current.filter(
                    (item) => item._id !== notificationId
                )
            );

            if (deleted && !deleted.isRead) {
                setUnreadCount((count) => Math.max(0, count - 1));
            }

        } catch (error) {

            console.error("Delete notification error:", error);

            setNotificationError(error.message);
        }
    };


    // =========================================
    // AVATAR MENU
    // =========================================

    const handleAvatarClick = () => {

        if (!loggedInUser) {
            navigate("/login");
            return;
        }

        setAvatarMenuOpen((prev) => !prev);
    };


    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = () => {

        sessionStorage.removeItem("studentSession");
        sessionStorage.removeItem("studentQuizResult");

        localStorage.removeItem("studentToken");

        window.dispatchEvent(new Event("userLoginChanged"));

        localStorage.removeItem("appearance");

        document.documentElement.setAttribute("data-theme", "light");
        document.body.setAttribute("data-theme", "light");

        setAvatarMenuOpen(false);
        setNotificationsOpen(false);
        setMenuOpen(false);
        setLoggedInUser(null);

        navigate("/", {
    replace: true,
});
    };


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatDate = (date) => {

        if (!date) return "";

        return new Date(date).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };


    // =========================================
    // ACTIVE NAV LINK STYLE
    // =========================================

    const getNavLinkClass = ({ isActive }) => {

        return isActive
            ? "header-nav-link active"
            : "header-nav-link";
    };


    // =========================================
    // HEADER UI
    // =========================================

    return (

        <header className="site-header">

            <div className="header-inner">


                {/* BRAND */}

                <div className="brand">

                    <Link
                        to="/"
                        className="brand"
                        onClick={closeMobileMenu}
                    >

                        <span
                            className="brand-mark"
                            aria-hidden="true"
                        ></span>

                        <span className="brand-text">
                            LearnDesk
                        </span>

                    </Link>

                </div>


                {/* MOBILE MENU BUTTON */}

                <button
                    className="menu-toggle"
                    aria-expanded={menuOpen}
                    aria-controls="primaryNav"
                    aria-label="Toggle navigation menu"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    type="button"
                >

                    {menuOpen
                        ? <X size={21} />
                        : <Menu size={21} />
                    }

                </button>


                {/* NAVIGATION */}

                <nav
                    id="primaryNav"
                    className={`primary-nav ${menuOpen ? "open" : ""}`}
                >

                    <NavLink
                        to="/"
                        end
                        className={getNavLinkClass}
                        onClick={closeMobileMenu}
                    >
                        Home
                    </NavLink>


                    <NavLink
                        to="/browse"
                        className={getNavLinkClass}
                        onClick={closeMobileMenu}
                    >
                        <BookOpen size={17} />
                        Browse Courses
                    </NavLink>


                    {loggedInUser && (

                        <NavLink
                            to="/dashboard"
                            className={getNavLinkClass}
                            onClick={closeMobileMenu}
                        >
                            <LayoutDashboard size={17} />
                            Dashboard
                        </NavLink>

                    )}


                    {!loggedInUser && (

                        <div className="mobile-auth-links">

                            <Link
                                to="/login"
                                className="mobile-login-link"
                                onClick={closeMobileMenu}
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="mobile-register-link"
                                onClick={closeMobileMenu}
                            >
                                Register
                            </Link>

                        </div>

                    )}

                </nav>


                {/* HEADER ACTIONS */}

                <div className="header-actions">


                    {/* STUDENT NOTIFICATIONS */}

                    {loggedInUser && (

                        <div
                            ref={notificationRef}
                            className="student-notification-wrapper"
                        >

                            <button
                                className="icon-btn"
                                aria-label={`Notifications, ${unreadCount} unread`}
                                aria-expanded={notificationsOpen}
                                onClick={handleNotificationClick}
                                type="button"
                            >

                                <Bell size={19} />

                                {unreadCount > 0 && (

                                    <span className="student-notification-badge">

                                        {unreadCount > 99
                                            ? "99+"
                                            : unreadCount
                                        }

                                    </span>

                                )}

                            </button>


                            {/* NOTIFICATION DROPDOWN */}

                            {notificationsOpen && (

                                <div className="student-notification-dropdown">

                                    <div className="student-notification-heading">

                                        <div>
                                            <strong>Notifications</strong>
                                            <p>{unreadCount} unread</p>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                            }}
                                        >

                                            {unreadCount > 0 && (

                                                <button
                                                    type="button"
                                                    className="student-notification-text-btn"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all read
                                                </button>

                                            )}

                                            <button
                                                type="button"
                                                aria-label="Close notifications"
                                                title="Close notifications"
                                                onClick={() => setNotificationsOpen(false)}
                                                style={{
                                                    border: "none",
                                                    background: "transparent",
                                                    fontSize: "24px",
                                                    cursor: "pointer",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                ×
                                            </button>

                                        </div>

                                    </div>


                                    {notificationError && (

                                        <p className="student-notification-error">
                                            {notificationError}
                                        </p>

                                    )}


                                    {notificationsLoading ? (

                                        <p className="student-notification-empty">
                                            Loading notifications...
                                        </p>

                                    ) : notifications.length === 0 ? (

                                        <p className="student-notification-empty">
                                            You're all caught up!
                                            <br />
                                            No notifications yet.
                                        </p>

                                    ) : (

                                        <div className="student-notification-list">

                                            {notifications.map((notification) => (

                                                <div
                                                    key={notification._id}
                                                    className={`student-notification-item ${
                                                        notification.isRead
                                                            ? "is-read"
                                                            : "is-unread"
                                                    }`}
                                                >

                                                    <button
                                                        type="button"
                                                        className="student-notification-content"
                                                        onClick={async () => {

                                                            await markAsRead(notification);

                                                            if (notification.link) {

                                                                setNotificationsOpen(false);

                                                                navigate(notification.link);
                                                            }
                                                        }}
                                                    >

                                                        <strong>
                                                            {notification.title}
                                                        </strong>

                                                        <span>
                                                            {notification.message}
                                                        </span>

                                                        <small>
                                                            {formatDate(notification.createdAt)}
                                                        </small>

                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="student-notification-delete"
                                                        aria-label="Delete notification"
                                                        title="Delete notification"
                                                        onClick={() =>
                                                            deleteNotification(notification._id)
                                                        }
                                                    >
                                                        ×
                                                    </button>

                                                </div>

                                            ))}

                                        </div>

                                    )}

                                </div>

                            )}

                        </div>

                    )}


                    {/* STUDENT PROFILE */}

                    {loggedInUser ? (

                        <div
                            ref={avatarMenuRef}
                            className="student-avatar-menu-wrapper"
                            style={{ position: "relative" }}
                        >

                            <button
                                type="button"
                                className="avatar"
                                aria-label={`Logged in as ${userName}`}
                                title={userName}
                                aria-expanded={avatarMenuOpen}
                                onClick={handleAvatarClick}
                            >
                                {getInitials(userName)}
                            </button>


                            {avatarMenuOpen && (

                                <div
                                    className="student-avatar-dropdown"
                                    style={{
                                        position: "absolute",
                                        top: "calc(100% + 10px)",
                                        right: 0,
                                        minWidth: "175px",
                                        background: "#fff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "10px",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                        padding: "6px",
                                        zIndex: 1000,
                                    }}
                                >

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setAvatarMenuOpen(false);

                                            navigate("/settings");
                                        }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "none",
                                            background: "transparent",
                                            color: "#374151",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            borderRadius: "6px",
                                        }}
                                    >

                                        <UserRound size={17} />

                                        <span>
                                            Profile
                                        </span>

                                    </button>


                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "none",
                                            background: "transparent",
                                            color: "#dc2626",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            borderRadius: "6px",
                                        }}
                                    >

                                        <LogOut size={17} />

                                        <span>
                                            Logout
                                        </span>

                                    </button>

                                </div>

                            )}

                        </div>

                    ) : (

                        /* PUBLIC LOGIN AND REGISTER BUTTONS */

                        <div className="header-auth-buttons">

                            <Link
                                to="/login"
                                className="header-login-btn"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="header-register-btn"
                            >
                                Register
                            </Link>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
};

export default Header;
