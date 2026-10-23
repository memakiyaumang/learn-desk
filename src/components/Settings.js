
import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Save,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../css/Settings.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const Settings = () => {
  const navigate = useNavigate();

  // =========================================
  // GET LOGGED-IN STUDENT
  // =========================================

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
    if (!user) return "";

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.userName ||
      ""
    );
  };

  const getUserEmail = (user) => {
    if (!user) return "";

    return user.email || user.emailAddress || "";
  };

  // =========================================
  // GET TOKEN
  // =========================================

  const getToken = () => {
    const studentSession = getLoggedInUser();

    if (studentSession?.token) {
      return studentSession.token;
    }

    return localStorage.getItem("studentToken") || null;
  };

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // =========================================
  // HANDLE UNAUTHORIZED
  // =========================================

  const handleUnauthorized = () => {
    sessionStorage.removeItem("studentSession");
    sessionStorage.removeItem("studentQuizResult");
    localStorage.removeItem("studentToken");

    window.dispatchEvent(new Event("userLoginChanged"));

    navigate("/login", { replace: true });
  };

  // =========================================
  // USER STATE
  // =========================================

  const [loggedInUser, setLoggedInUser] = useState(
    getLoggedInUser()
  );

  const [name, setName] = useState(
    getUserName(getLoggedInUser())
  );

  const [email, setEmail] = useState(
    getUserEmail(getLoggedInUser())
  );

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // =========================================
  // LOAD USER
  // =========================================

  useEffect(() => {
    const user = getLoggedInUser();

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    setLoggedInUser(user);
    setName(getUserName(user));
    setEmail(getUserEmail(user));
  }, [navigate]);

  // =========================================
  // LISTEN FOR LOGIN / PROFILE CHANGES
  // =========================================

  useEffect(() => {
    const handleUserChange = () => {
      const user = getLoggedInUser();

      setLoggedInUser(user);
      setName(getUserName(user));
      setEmail(getUserEmail(user));
    };

    window.addEventListener(
      "userLoginChanged",
      handleUserChange
    );

    window.addEventListener("storage", handleUserChange);

    return () => {
      window.removeEventListener(
        "userLoginChanged",
        handleUserChange
      );

      window.removeEventListener("storage", handleUserChange);
    };
  }, []);

  // =========================================
  // GENERATE INITIALS
  // =========================================

  const getInitials = (userName) => {
    if (!userName?.trim()) return "ST";

    const words = userName.trim().split(/\s+/);

    if (words.length >= 2) {
      return (
        words[0][0] +
        words[words.length - 1][0]
      ).toUpperCase();
    }

    return userName.substring(0, 2).toUpperCase();
  };

  // =========================================
  // VALIDATION
  // =========================================

  const validateName = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return "Full name is required.";
    }

    if (trimmedValue.length < 2) {
      return "Full name must be at least 2 characters.";
    }

    return "";
  };

  const validateEmail = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  // =========================================
  // INPUT HANDLERS
  // =========================================

  const handleNameChange = (event) => {
    const value = event.target.value;

    setName(value);
    setNameError(validateName(value));
    setSaveError("");
    setShowSuccess(false);
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;

    setEmail(value);
    setEmailError(validateEmail(value));
    setSaveError("");
    setShowSuccess(false);
  };

  // =========================================
  // SAVE PROFILE
  // =========================================

  const handleSave = async () => {
    const currentUser = getLoggedInUser();

    if (!currentUser) {
      navigate("/login", { replace: true });
      return;
    }

    setNameError("");
    setEmailError("");
    setSaveError("");
    setShowSuccess(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const currentNameError = validateName(trimmedName);
    const currentEmailError = validateEmail(trimmedEmail);

    setNameError(currentNameError);
    setEmailError(currentEmailError);

    if (currentNameError || currentEmailError) {
      return;
    }

    const currentUserId =
      currentUser.id ||
      currentUser._id ||
      currentUser.userId;

    if (!currentUserId) {
      setSaveError(
        "Unable to identify your account. Please login again."
      );
      return;
    }

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/update-user/${currentUserId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: trimmedName,
            fullName: trimmedName,
            email: trimmedEmail,
          }),
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        setSaveError(
          result?.message ||
            "Unable to update your profile. Please try again."
        );
        return;
      }

      const backendUser =
        result?.data ||
        result?.user ||
        result?.updatedUser ||
        {};

      const updatedUser = {
        ...currentUser,
        ...backendUser,

        id:
          backendUser.id ||
          backendUser._id ||
          currentUser.id ||
          currentUser._id,

        name:
          backendUser.name ||
          backendUser.fullName ||
          trimmedName,

        fullName:
          backendUser.fullName ||
          backendUser.name ||
          trimmedName,

        email: backendUser.email || trimmedEmail,

        role:
          backendUser.role ||
          currentUser.role ||
          "student",

        status:
          backendUser.status ||
          currentUser.status ||
          "approved",

        token: currentUser.token || token,
      };

      sessionStorage.setItem(
        "studentSession",
        JSON.stringify(updatedUser)
      );

      setLoggedInUser(updatedUser);
      setName(getUserName(updatedUser));
      setEmail(getUserEmail(updatedUser));

      // Refresh Header / Sidebar profile details
      window.dispatchEvent(new Event("userLoginChanged"));

      setShowSuccess(true);
    } catch (error) {
      console.error("Profile update error:", error);

      setSaveError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================
  // JSX
  // =========================================

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>My Profile</h1>
          <p>
            View and update your personal account information.
          </p>
        </div>

        <div className="settings-header-icon">
          <User size={22} />
        </div>
      </div>

      {showSuccess && (
        <div className="settings-success">
          <CheckCircle size={17} />
          <span>Profile updated successfully.</span>
        </div>
      )}

      {saveError && (
        <div
          role="alert"
          style={{
            marginBottom: "16px",
            padding: "11px 14px",
            borderRadius: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          {saveError}
        </div>
      )}

      {/* PROFILE INFORMATION */}

      <section className="settings-card">
        <div className="settings-card-header">
          <div className="settings-section-icon purple">
            <User size={18} />
          </div>

          <div>
            <h2>Profile Information</h2>
            <p>
              Update your personal account information.
            </p>
          </div>
        </div>

        {/* PROFILE PREVIEW */}

        <div className="profile-preview">
          <div className="settings-avatar">
            {getInitials(name)}
          </div>

          <div>
            <h3>{name || "Student"}</h3>
            <span>
              {loggedInUser?.role || "Student"}
            </span>
          </div>
        </div>

        {/* PROFILE FORM */}

        <div className="settings-form-grid">
          <div className="settings-field">
            <label htmlFor="settings-name">
              Full Name
            </label>

            <div
              className="settings-input-wrapper"
              style={
                nameError ? { borderColor: "#ef4444" } : {}
              }
            >
              <User size={15} />

              <input
                type="text"
                id="settings-name"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your name"
                autoComplete="name"
                aria-invalid={Boolean(nameError)}
              />
            </div>

            {nameError && (
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#ef4444",
                  fontSize: "12px",
                }}
              >
                {nameError}
              </span>
            )}
          </div>

          <div className="settings-field">
            <label htmlFor="settings-email">
              Email Address
            </label>

            <div
              className="settings-input-wrapper"
              style={
                emailError ? { borderColor: "#ef4444" } : {}
              }
            >
              <Mail size={15} />

              <input
                type="email"
                id="settings-email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                autoComplete="email"
                aria-invalid={Boolean(emailError)}
              />
            </div>

            {emailError && (
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#ef4444",
                  fontSize: "12px",
                }}
              >
                {emailError}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SAVE PROFILE */}

      <div className="settings-actions">
        <button
          type="button"
          className="save-settings-button"
          onClick={handleSave}
          disabled={isSaving}
          style={
            isSaving
              ? {
                  opacity: 0.7,
                  cursor: "not-allowed",
                }
              : {}
          }
        >
          <Save size={15} />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
