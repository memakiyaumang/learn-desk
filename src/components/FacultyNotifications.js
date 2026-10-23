import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ChartNoAxesCombined,
  ClipboardCheck,
  Bell,
  UserRound,
  LogOut,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Info,
  MessageSquare,
  BookOpenCheck,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import "../css/FacultyNotifications.css";
import "../css/FacultyDashboard.css";

const FacultyNotifications = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [faculty, setFaculty] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const getLoggedInFaculty = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("facultySession") || "null"
      );
    } catch (error) {
      return null;
    }
  };

  const loadNotifications = () => {
    const loggedFaculty = getLoggedInFaculty();

    if (!loggedFaculty) {
      setFaculty(null);
      setNotifications([]);
      return;
    }

    setFaculty(loggedFaculty);

    try {
      const storedNotifications = JSON.parse(
        localStorage.getItem("facultyNotificationsList") || "[]"
      );

      setNotifications(
        Array.isArray(storedNotifications)
          ? storedNotifications
          : []
      );
    } catch (error) {
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleFacultyChange = () => {
      loadNotifications();
    };

    window.addEventListener(
      "userLoginChanged",
      handleFacultyChange
    );

    window.addEventListener(
      "storage",
      handleFacultyChange
    );

    window.addEventListener(
      "facultyNotificationsUpdated",
      handleFacultyChange
    );

    return () => {
      window.removeEventListener(
        "userLoginChanged",
        handleFacultyChange
      );

      window.removeEventListener(
        "storage",
        handleFacultyChange
      );

      window.removeEventListener(
        "facultyNotificationsUpdated",
        handleFacultyChange
      );
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("facultySession");

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login", { replace: true });
  };

  const getNotificationIcon = (type) => {
    if (type === "course") {
      return <BookOpenCheck size={20} />;
    }

    if (type === "message") {
      return <MessageSquare size={20} />;
    }

    if (type === "success") {
      return <Check size={20} />;
    }

    return <Info size={20} />;
  };

  const getNotificationType = (type) => {
    if (type === "course") return "course";
    if (type === "message") return "message";
    if (type === "success") return "success";

    return "info";
  };

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (filter === "unread") {
      result = result.filter(
        (notification) => !notification.read
      );
    }

    if (filter === "read") {
      result = result.filter(
        (notification) => notification.read
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((notification) => {
        return (
          String(notification.title || "")
            .toLowerCase()
            .includes(search) ||
          String(notification.message || "")
            .toLowerCase()
            .includes(search) ||
          String(notification.courseName || "")
            .toLowerCase()
            .includes(search)
        );
      });
    }

    return result;
  }, [notifications, filter, searchTerm]);

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(
      (notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
    );

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "facultyNotificationsList",
      JSON.stringify(updatedNotifications)
    );

    window.dispatchEvent(
      new Event("facultyNotificationsUpdated")
    );
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "facultyNotificationsList",
      JSON.stringify(updatedNotifications)
    );

    window.dispatchEvent(
      new Event("facultyNotificationsUpdated")
    );
  };

  const deleteNotification = (id) => {
    const updatedNotifications = notifications.filter(
      (notification) => notification.id !== id
    );

    setNotifications(updatedNotifications);

    localStorage.setItem(
      "facultyNotificationsList",
      JSON.stringify(updatedNotifications)
    );

    window.dispatchEvent(
      new Event("facultyNotificationsUpdated")
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);

    localStorage.setItem(
      "facultyNotificationsList",
      JSON.stringify([])
    );

    window.dispatchEvent(
      new Event("facultyNotificationsUpdated")
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.read
  ).length;

  const formatDate = (dateValue) => {
    if (!dateValue) return "Recently";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="faculty-layout">

      {/* SIDEBAR */}
      <aside className="faculty-sidebar">

        <div className="faculty-logo">
          <div className="faculty-brand-mark">
            <span></span>
          </div>

          <div className="faculty-brand-text">
            LearnDesk
          </div>
        </div>

        <nav className="faculty-nav">

          <div
            className={`faculty-nav-item ${
              isActive("/faculty") ? "active" : ""
            }`}
            onClick={() => navigate("/faculty")}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive("/faculty/courses") ? "active" : ""
            }`}
            onClick={() => navigate("/faculty/courses")}
          >
            <BookOpen size={19} />
            <span>My Courses</span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive("/faculty/students") ? "active" : ""
            }`}
            onClick={() => navigate("/faculty/students")}
          >
            <Users size={19} />
            <span>Students</span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive("/faculty/progress") ? "active" : ""
            }`}
            onClick={() => navigate("/faculty/progress")}
          >
            <ChartNoAxesCombined size={19} />
            <span>Student Progress</span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive("/faculty/quiz") ? "active" : ""
            }`}
            onClick={() => navigate("/faculty/quiz")}
          >
            <ClipboardCheck size={19} />
            <span>Quiz Management</span>
          </div>

          <div
            className={`faculty-nav-item ${
              isActive("/faculty/notifications")
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate("/faculty/notifications")
            }
          >
            <Bell size={19} />
            <span>Notifications</span>

            {unreadCount > 0 && (
              <span className="faculty-notification-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          <div
            className={`faculty-nav-item ${
              isActive("/faculty/profile") ? "active" : ""
            }`}
            onClick={() =>
              navigate("/faculty/profile")
            }
          >
            <UserRound size={19} />
            <span>Profile</span>
          </div>

        </nav>

        <div
          className="faculty-nav-item faculty-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </div>

      </aside>

      {/* MAIN */}
      <main className="faculty-main">

        <section className="faculty-page-content">

          {/* PAGE TITLE */}
          <div className="notifications-header">

            <div className="notifications-heading">
              <div>
                <p className="notifications-label">
                  UPDATES
                </p>

                <h2>Notifications</h2>

                <p>
                  View important updates, course activities
                  and student messages.
                </p>
              </div>

            </div>

            {notifications.length > 0 && (
              <div className="notifications-header-actions">

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="notification-mark-all"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck size={16} />
                    Mark all as read
                  </button>
                )}

                <button
                  type="button"
                  className="notification-clear-all"
                  onClick={clearAllNotifications}
                >
                  <Trash2 size={16} />
                  Clear all
                </button>

              </div>
            )}

          </div>

          {/* STATS */}
          <div className="notifications-stats">

            <div className="notification-stat-card">

              <div className="notification-stat-icon total">
                <Bell size={19} />
              </div>

              <div className="notification-stat-content">
                <span>Total</span>
                <strong>{notifications.length}</strong>
                <small>All notifications</small>
              </div>

            </div>

            <div className="notification-stat-card">

              <div className="notification-stat-icon unread">
                <Info size={19} />
              </div>

              <div className="notification-stat-content">
                <span>Unread</span>
                <strong>{unreadCount}</strong>
                <small>Needs attention</small>
              </div>

            </div>

            <div className="notification-stat-card">

              <div className="notification-stat-icon read">
                <CheckCheck size={19} />
              </div>

              <div className="notification-stat-content">
                <span>Read</span>
                <strong>{readCount}</strong>
                <small>Already reviewed</small>
              </div>

            </div>

          </div>

          {/* TOOLBAR */}
          <div className="notifications-toolbar">

            <div className="notification-search">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  className="notification-search-clear"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

            </div>

            <div className="notification-filter">

              <button
                type="button"
                className={
                  filter === "all" ? "active" : ""
                }
                onClick={() => setFilter("all")}
              >
                All
                <span>{notifications.length}</span>
              </button>

              <button
                type="button"
                className={
                  filter === "unread" ? "active" : ""
                }
                onClick={() => setFilter("unread")}
              >
                Unread
                <span>{unreadCount}</span>
              </button>

              <button
                type="button"
                className={
                  filter === "read" ? "active" : ""
                }
                onClick={() => setFilter("read")}
              >
                Read
                <span>{readCount}</span>
              </button>

            </div>

          </div>

          {/* LIST */}
          {filteredNotifications.length === 0 ? (

            <div className="notifications-empty">

              <div className="notifications-empty-icon">
                <Bell size={28} />
              </div>

              <h3>
                {notifications.length === 0
                  ? "No notifications yet"
                  : "No notifications found"}
              </h3>

              <p>
                {notifications.length === 0
                  ? "You will see important updates and activities here."
                  : "Try changing your search or filter."}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <div className="notifications-list">

              {filteredNotifications.map(
                (notification) => {

                  const notificationType =
                    getNotificationType(
                      notification.type
                    );

                  return (
                    <article
                      key={notification.id}
                      className={`notification-item ${
                        notification.read
                          ? "read"
                          : "unread"
                      }`}
                    >

                      <div
                        className={`notification-icon ${notificationType}`}
                      >
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="notification-content">

                        <div className="notification-item-top">

                          <div className="notification-title-row">

                            <h3>
                              {notification.title ||
                                "Notification"}
                            </h3>

                            {!notification.read && (
                              <span className="notification-unread-dot">
                                <span></span>
                                New
                              </span>
                            )}

                          </div>

                          <span className="notification-time">
                            {formatDate(
                              notification.createdAt
                            )}
                          </span>

                        </div>

                        <p>
                          {notification.message ||
                            "You have a new notification."}
                        </p>

                        {notification.courseName && (
                          <span className="notification-course">
                            <BookOpen size={13} />
                            {notification.courseName}
                          </span>
                        )}

                        <div className="notification-actions">

                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                            >
                              <Check size={14} />
                              Mark as read
                            </button>
                          )}

                          <button
                            type="button"
                            className="delete"
                            onClick={() =>
                              deleteNotification(
                                notification.id
                              )
                            }
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
};

export default FacultyNotifications;