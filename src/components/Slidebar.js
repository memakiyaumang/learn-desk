
import React, { useCallback, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  Search,
  TrendingUp,
  Award,
  HelpCircle,
  MoreVertical,
  UserCog,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ClipboardCheck,
  UserRound,
} from "lucide-react";

import "../css/Slidebar.css";
import "../css/AdminSidebar.css";
import "../css/FacultyDashboard.css";

// ==========================================
// Session Helper
// ==========================================
const getSession = (key) => {
  try {
    const session = sessionStorage.getItem(key);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
};

// ==========================================
// Shared Sidebar Component
// role = student | faculty | admin
// ==========================================
const Sidebar = ({ role = "student" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedInUser, setLoggedInUser] = useState(null);

  const loadUser = useCallback(() => {
    if (role === "student") {
      setLoggedInUser(getSession("studentSession"));
    } else if (role === "faculty") {
      setLoggedInUser(getSession("facultySession"));
    } else {
      setLoggedInUser(null);
    }
  }, [role]);

  useEffect(() => {
    loadUser();

    const handleLoginChange = () => loadUser();

    window.addEventListener("userLoginChanged", handleLoginChange);
    window.addEventListener("storage", handleLoginChange);

    return () => {
      window.removeEventListener("userLoginChanged", handleLoginChange);
      window.removeEventListener("storage", handleLoginChange);
    };
  }, [loadUser]);

  const getUserName = () => {
    if (!loggedInUser) {
      return role === "admin" ? "Admin" : role === "faculty" ? "Faculty" : "Student";
    }

    return (
      loggedInUser.name ||
      loggedInUser.fullName ||
      loggedInUser.username ||
      loggedInUser.userName ||
      loggedInUser.email ||
      (role === "faculty" ? "Faculty" : "Student")
    );
  };

  // ==========================================
  // Logout
  // ==========================================
  const handleLogout = () => {
    if (role === "faculty") {
      sessionStorage.removeItem("facultySession");
      localStorage.removeItem("facultyToken");

      window.dispatchEvent(new Event("userLoginChanged"));
      navigate("/login");
      return;
    }

    if (role === "admin") {
      localStorage.removeItem("adminToken");

      window.dispatchEvent(new Event("userLoginChanged"));
      navigate("/admin-login");
    }
  };

  // ==========================================
  // Student Sidebar
  // ==========================================
  if (role === "student") {
    const studentMenu = [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "My Courses",
        path: "/courses",
        icon: BookOpen,
      },
      {
        label: "Browse Courses",
        path: "/browse",
        icon: Search,
      },
      {
        label: "Progress",
        path: "/progress",
        icon: TrendingUp,
      },
      {
        label: "Certificates",
        path: "/certificates",
        icon: Award,
      },
    ];

    const supportMenu = [
      {
        label: "Help Center",
        path: "/help",
        icon: HelpCircle,
      },
    ];

    return (
      <aside className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3 className="sidebar-heading"></h3>

            {studentMenu.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <Icon className="sidebar-icon" size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="sidebar-section support-section">
            <h3 className="sidebar-heading">SUPPORT</h3>

            {supportMenu.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <Icon className="sidebar-icon" size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {getUserName().charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{getUserName()}</span>
              <span className="sidebar-user-role">Student</span>
            </div>

            <button
              type="button"
              className="sidebar-more"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ==========================================
  // Faculty Sidebar
  // ==========================================
  if (role === "faculty") {
    const facultyMenu = [
      {
        label: "Dashboard",
        path: "/faculty",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "My Courses",
        path: "/faculty/courses",
        icon: BookOpen,
      },
      {
        label: "Students",
        path: "/faculty/students",
        icon: Users,
      },
      {
        label: "Student Progress",
        path: "/faculty/progress",
        icon: TrendingUp,
      },
      {
        label: "Quiz Management",
        path: "/faculty/quiz",
        icon: ClipboardCheck,
      },
      {
        label: "Profile",
        path: "/faculty/profile",
        icon: UserRound,
      },
    ];

    return (
      <aside className="faculty-sidebar">
        <div className="faculty-logo">
          <div className="faculty-brand-mark">
            
          </div>
          <span className="faculty-brand-text">LearnDesk</span>
        </div>

        <nav className="faculty-nav">
          {facultyMenu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end || false}
                className={({ isActive }) =>
                  `faculty-nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <button
  type="button"
  className="faculty-nav-item faculty-logout"
  onClick={handleLogout}
>
  <LogOut
    size={20}
    strokeWidth={2}
  />

  <span>
    Logout
  </span>
</button>
        </nav>
      </aside>
    );
  }

  // ==========================================
  // Admin Sidebar
  // ==========================================
  if (role === "admin") {
    const adminMenu = [
      {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
        end: true,
      },
      {
        label: "Manage Courses",
        path: "/admin/courses",
        icon: BookOpen,
      },
      {
        label: "Faculty Management",
        path: "/admin/faculty",
        icon: UserCog,
      },
      {
        label: "Students",
        path: "/admin/student",
        icon: Users,
      },
      {
        label: "Payments",
        path: "/admin/payment",
        icon: CreditCard,
      },
      {
        label: "Settings",
        path: "/admin/settings",
        icon: Settings,
      },
    ];

    return (
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-mark">
            {/* <BookOpen size={22} /> */}
          </div>
          <span>LearnDesk Admin</span>
        </div>

        <nav className="admin-navigation">
          <h3 className="admin-menu-title"></h3>

          <div className="admin-menu">
            {adminMenu.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end || false}
                  className={({ isActive }) =>
                    `admin-menu-link ${isActive ? "active" : ""}`
                  }
                >
                  <span className="admin-menu-icon-wrapper">
                    <Icon size={19} />
                  </span>
                  <span className="admin-menu-text">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-panel-label">Admin Panel</div>
          <div className="admin-status">
            <span className="admin-status-dot"></span>
            <span>System Management</span>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    );
  }

  return null;
};

export default Sidebar;
