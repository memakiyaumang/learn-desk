import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  Search,
  TrendingUp,
  Award,
  HelpCircle,
  Settings,
  MoreVertical,
} from "lucide-react";

import "../css/Slidebar.css";

const Sidebar = () => {
  const location = useLocation();

  // =========================
  // Get Student Session
  // =========================
  const getLoggedInUser = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("studentSession") || "null"
      );
    } catch (error) {
      return null;
    }
  };

  const getUserName = (user) => {
    if (!user) return "Student";

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.userName ||
      "Student"
    );
  };

  // =========================
  // Student User State
  // =========================
  const [loggedInUser, setLoggedInUser] = useState(
    getLoggedInUser()
  );

  // =========================
  // Listen For Login / Logout
  // =========================
  useEffect(() => {
    const handleUserChange = () => {
      const user = getLoggedInUser();

      setLoggedInUser(user);
    };

    // Custom event
    window.addEventListener(
      "userLoginChanged",
      handleUserChange
    );

    // Browser storage event
    window.addEventListener(
      "storage",
      handleUserChange
    );

    return () => {
      window.removeEventListener(
        "userLoginChanged",
        handleUserChange
      );

      window.removeEventListener(
        "storage",
        handleUserChange
      );
    };
  }, []);

  // =========================
  // Get User Name
  // =========================
  const userName = getUserName(loggedInUser);

  // =========================
  // Student Role
  // =========================
  const userRole = "Student";

  // =========================
  // Generate Initials
  // =========================
  const getInitials = (name) => {
    if (!name) return "ST";

    const words = name.trim().split(/\s+/);

    if (words.length >= 2) {
      return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
      ).toUpperCase();
    }

    return name
      .substring(0, 2)
      .toUpperCase();
  };

  // =========================
  // Active Menu
  // =========================
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path;
  };

  // =========================
  // Main Menu
  // =========================
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "My Courses",
      path: "/courses",
      icon: BookOpen,
    },
    {
      name: "Browse Courses",
      path: "/browse",
      icon: Search,
    },
    {
      name: "Progress",
      path: "/progress",
      icon: TrendingUp,
    },
    {
      name: "Certificates",
      path: "/certificates",
      icon: Award,
    },
  ];

  // =========================
  // Support Menu
  // =========================
  const supportItems = [
    {
      name: "Help Center",
      path: "/help",
      icon: HelpCircle,
    },
    // {
    //   name: "Settings",
    //   path: "/settings",
    //   icon: Settings,
    // },
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-content">

        {/* =========================
            MAIN
        ========================= */}
        <div className="sidebar-section">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${
                  isActive(item.path)
                    ? "active"
                    : ""
                }`}
              >

                <span className="sidebar-icon">
                  <Icon size={19} />
                </span>

                <span className="sidebar-link-text">
                  {item.name}
                </span>

              </Link>
            );
          })}

        </div>

        {/* =========================
            SUPPORT
        ========================= */}
        <div className="sidebar-section support-section">

          <p className="sidebar-heading">
            SUPPORT
          </p>

          {supportItems.map((item) => {

            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${
                  isActive(item.path)
                    ? "active"
                    : ""
                }`}
              >

                <span className="sidebar-icon">
                  <Icon size={19} />
                </span>

                <span className="sidebar-link-text">
                  {item.name}
                </span>

              </Link>
            );
          })}

        </div>

      </div>

      {/* =========================
          USER PROFILE
      ========================= */}
      <div className="sidebar-bottom">

        <div className="sidebar-user">

          {/* Avatar */}
          <div className="sidebar-avatar">
            {getInitials(userName)}
          </div>

          {/* Name + Role */}
          <div className="sidebar-user-info">

            <strong title={userName}>
              {userName}
            </strong>

            <span>
              {userRole}
            </span>

          </div>

          {/* More Button */}
          <button
            type="button"
            className="sidebar-more"
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;