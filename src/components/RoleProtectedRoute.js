import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRole }) => {

    let loggedInUser = null;

    /* ================================
       STUDENT SESSION
    ================================= */

    if (allowedRole === "student") {
        const studentSession =
            sessionStorage.getItem(
                "studentSession"
            );

        if (studentSession) {
            try {
                loggedInUser =
                    JSON.parse(studentSession);
            } catch (error) {
                sessionStorage.removeItem(
                    "studentSession"
                );
            }
        }
    }

    /* ================================
       FACULTY SESSION
    ================================= */

    if (allowedRole === "faculty") {
        const facultySession =
            sessionStorage.getItem(
                "facultySession"
            );

        if (facultySession) {
            try {
                loggedInUser =
                    JSON.parse(facultySession);
            } catch (error) {
                sessionStorage.removeItem(
                    "facultySession"
                );
            }
        }
    }

    /* ================================
       NO LOGIN
    ================================= */

    if (!loggedInUser) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    /* ================================
       WRONG ROLE
    ================================= */

    if (loggedInUser.role !== allowedRole) {

        if (loggedInUser.role === "faculty") {
            return (
                <Navigate
                    to="/faculty"
                    replace
                />
            );
        }

        if (loggedInUser.role === "student") {
            return (
                <Navigate
                    to="/"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <Outlet />;
};

export default RoleProtectedRoute;