import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, X } from "lucide-react";
import "../css/BrowseChatbot.css";

const API_BASE_URL = "https://project-final-backend-oeh1.onrender.com";

const AIAssistant = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hi! Welcome to LearnDesk. Ask me about our courses or what you should learn next.",
    },
  ]);

  const getStudentSession = () => {
    try {
      const session = sessionStorage.getItem("studentSession");
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error("Error reading student session:", error);
      return null;
    }
  };

  const getToken = () => {
    const studentSession = getStudentSession();
    return studentSession?.token || localStorage.getItem("studentToken") || null;
  };

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const handleUnauthorized = () => {
    sessionStorage.removeItem("studentSession");
    sessionStorage.removeItem("studentQuizResult");
    sessionStorage.removeItem("selectedStudentQuiz");
    localStorage.removeItem("studentToken");
    window.dispatchEvent(new Event("userLoginChanged"));
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/get-courses`, {
          method: "GET",
          headers: getAuthHeaders(),
        });
        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
          if (!cancelled) handleUnauthorized();
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load courses for AI Assistant.");
        }

        const courseList = Array.isArray(result.data) ? result.data : [];
        const publishedCourses = courseList
          .filter((course) => {
            const status = String(course.status || "").toLowerCase();
            return status === "published" || status === "publish";
          })
          .map((course) => ({ ...course, id: course._id || course.id }));

        if (!cancelled) setCourses(publishedCourses);
      } catch (error) {
        console.error("AI Assistant course loading error:", error);
        if (!cancelled) setCourses([]);
      }
    };

    loadCourses();
    return () => {
      cancelled = true;
    };
    // Authentication is read from browser storage when this student-only component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading, chatOpen]);

  const sendChatMessage = async (event) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || chatLoading) return;

    if (!getToken()) {
      handleUnauthorized();
      return;
    }

    setChatInput("");
    setChatMessages((previous) => [...previous, { role: "user", text: message }]);
    setChatLoading(true);

    try {
      const courseContext = courses.map((course) => ({
        title: course.title || course.courseName || course.name || "",
        category: course.category || "",
        description: course.description || "",
        instructor: course.instructor || course.faculty || course.facultyName || "",
        level: course.level || "",
        duration: course.duration || "",
        price: course.price ?? 0,
        lessons: course.lessons || course.totalLessons || 0,
      }));

      const response = await fetch(`${API_BASE_URL}/api/chatbot/chat`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message, courses: courseContext }),
      });
      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to get an AI response.");
      }

      setChatMessages((previous) => [
        ...previous,
        { role: "assistant", text: result.reply || "I couldn't generate a reply. Please try again." },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: error.message || "Sorry, I could not connect right now. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="browse-chatbot">
      {chatOpen && (
        <div className="browse-chatbot-panel">
          <div className="browse-chatbot-header">
            <div className="browse-chatbot-heading">
              <MessageCircle size={21} />
              <div>
                <h3>LearnDesk AI Assistant</h3>
                <p>Ask me about courses or any topic</p>
              </div>
            </div>
            <button
              type="button"
              className="browse-chatbot-close"
              onClick={() => setChatOpen(false)}
              aria-label="Close chatbot"
            >
              <X size={19} />
            </button>
          </div>

          <div className="browse-chatbot-messages">
            {chatMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`browse-chatbot-message ${
                  message.role === "user"
                    ? "browse-chatbot-user"
                    : "browse-chatbot-assistant"
                }`}
              >
                {message.text}
              </div>
            ))}
            {chatLoading && (
              <div className="browse-chatbot-message browse-chatbot-assistant">
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="browse-chatbot-form" onSubmit={sendChatMessage}>
            <input
              type="text"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Ask me anything..."
              maxLength={2000}
              disabled={chatLoading}
              aria-label="Ask LearnDesk AI"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="browse-chatbot-toggle"
        onClick={() => setChatOpen((open) => !open)}
        aria-label={chatOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default AIAssistant;