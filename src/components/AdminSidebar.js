import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  UserCog,
  Users,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

import "../css/AdminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();

  // =========================================
  // ADMIN LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("adminToken");

    navigate("/admin-login", {
      replace: true,
    });
  };


  // =========================================
  // ADMIN MENU ITEMS
  // =========================================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },

    {
      name: "Manage Courses",
      path: "/admin/courses",
      icon: BookOpen,
    },

    {
      name: "Faculty Management",
      path: "/admin/faculty",
      icon: UserCog,
    },

    {
      name: "Students",
      path: "/admin/student",
      icon: Users,
    },

    {
      name: "Payments",
      path: "/admin/payment",
      icon: CreditCard,
    },

    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];


  // =========================================
  // SIDEBAR UI
  // =========================================

  return (
    <aside className="admin-sidebar">

      {/* =====================================
          ADMIN BRAND
      ====================================== */}

      <div className="admin-brand">

        <span className="brand-mark"></span>

        <h2>
          LearnDesk Admin
        </h2>

      </div>


      {/* =====================================
          NAVIGATION
      ====================================== */}

      <nav className="admin-navigation">

        <p className="admin-menu-title">
          MAIN MENU
        </p>


        <ul className="admin-menu">

          {menuItems.map((item) => {

            const Icon = item.icon;

            return (
              <li key={item.path}>

                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive
                      ? "admin-menu-link active"
                      : "admin-menu-link"
                  }
                >

                  {/* Icon */}

                  <span className="admin-menu-icon-wrapper">

                    <Icon
                      className="admin-menu-icon"
                      size={19}
                      strokeWidth={2}
                    />

                  </span>


                  {/* Menu Text */}

                  <span className="admin-menu-text">
                    {item.name}
                  </span>

                </NavLink>

              </li>
            );

          })}

        </ul>

      </nav>


      {/* =====================================
          SIDEBAR BOTTOM
      ====================================== */}

      <div className="admin-sidebar-bottom">


        {/* Admin Panel Status */}

        <div className="admin-panel-label">

          <span className="admin-status-dot"></span>

          <div>

            <strong>
              Admin Panel
            </strong>

            <span>
              System Management
            </span>

          </div>

        </div>


        {/* Logout Button */}

        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
        >

          <LogOut
            className="admin-menu-icon"
            size={18}
            strokeWidth={2}
          />

          <span className="admin-logout-text">
            Logout
          </span>

        </button>

      </div>

    </aside>
  );
};

export default AdminSidebar;