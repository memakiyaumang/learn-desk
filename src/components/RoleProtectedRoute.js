import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRole }) => {
    let loggedInUser = null;
    let token = null;

    // =====================================
    // STUDENT SESSION
    // =====================================

    if (allowedRole === "student") {
        try {
            loggedInUser = JSON.parse(
                sessionStorage.getItem("studentSession") || "null"
            );

            token =
                loggedInUser?.token ||
                localStorage.getItem("studentToken");
        } catch (error) {
            console.error("Invalid student session:", error);

            sessionStorage.removeItem("studentSession");
            loggedInUser = null;
        }
    }

    // =====================================
    // FACULTY SESSION
    // =====================================

    if (allowedRole === "faculty") {
        try {
            loggedInUser = JSON.parse(
                sessionStorage.getItem("facultySession") || "null"
            );

            token =
                loggedInUser?.token ||
                localStorage.getItem("facultyToken");
        } catch (error) {
            console.error("Invalid faculty session:", error);

            sessionStorage.removeItem("facultySession");
            loggedInUser = null;
        }
    }

    // =====================================
    // LOGIN CHECK
    // =====================================

    if (!loggedInUser || !token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // =====================================
    // ROLE CHECK
    // =====================================

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
                    to="/dashboard"
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