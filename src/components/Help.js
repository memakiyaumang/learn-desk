import React, { useState } from "react";
import {
  Search,
  BookOpen,
  CreditCard,
  UserRound,
  Settings as SettingsIcon,
  ChevronDown,
  MessageCircleQuestion,
  ArrowRight,
  X,
  Send,
  Headphones,
  Bot,
} from "lucide-react";

import "../css/Help.css";

const categories = [
  {
    id: "courses",
    title: "Courses & Learning",
    description: "Find help with courses, lessons and learning.",
    count: 12,
    icon: BookOpen,
  },
  {
    id: "payments",
    title: "Payments",
    description: "Get help with payments and course purchases.",
    count: 8,
    icon: CreditCard,
  },
  {
    id: "account",
    title: "Account",
    description: "Manage your account, login and profile.",
    count: 10,
    icon: UserRound,
  },
  {
    id: "settings",
    title: "Settings",
    description: "Learn how to manage your preferences.",
    count: 6,
    icon: SettingsIcon,
  },
];

const faqs = [
  // =========================
  // COURSES & LEARNING
  // =========================
  {
    id: 1,
    category: "courses",
    question: "How do I enroll in a course?",
    answer:
      "Go to Browse Courses, select the course you want to learn, and click the Enroll button. After successful enrollment, the course will appear in My Courses.",
  },
  {
    id: 2,
    category: "courses",
    question: "Where can I see my enrolled courses?",
    answer:
      "Open My Courses from the sidebar. You will find all the courses in which you are currently enrolled.",
  },
  {
    id: 3,
    category: "courses",
    question: "How can I track my course progress?",
    answer:
      "Open Progress from the sidebar to view your course progress, completed lessons, learning hours, and quiz progress.",
  },
  {
    id: 4,
    category: "courses",
    question: "How can I take a quiz?",
    answer:
      "Open Student Quizzes for your enrolled course and select an available published quiz.",
  },
  {
    id: 5,
    category: "courses",
    question: "Where can I see my quiz result?",
    answer:
      "After submitting a quiz, your result page shows your score, percentage, correct answers, and pass/fail status.",
  },
  {
    id: 6,
    category: "courses",
    question: "Where can I find my certificate?",
    answer:
      "Open Certificates from the sidebar. Completed courses that meet the certificate requirements will appear there.",
  },

  // =========================
  // PAYMENTS
  // =========================
  {
    id: 7,
    category: "payments",
    question: "How can I purchase a paid course?",
    answer:
      "Open Browse Courses, select the paid course you want to purchase, and follow the available payment process to complete your enrollment.",
  },
  {
    id: 8,
    category: "payments",
    question: "Where can I check my course payment?",
    answer:
      "You can check your purchased course and payment-related information from the available course and account sections.",
  },

  // =========================
  // ACCOUNT
  // =========================
  {
    id: 9,
    category: "account",
    question: "How can I update my profile?",
    answer:
      "Open your account or Settings page, update the available profile information, and click Save Changes.",
  },
  {
    id: 10,
    category: "account",
    question: "What should I do if I cannot log in?",
    answer:
      "Check that your registered email and password are correct. If the problem continues, contact the LearnDesk support team.",
  },

  // =========================
  // SETTINGS
  // =========================
  {
    id: 11,
    category: "settings",
    question: "How can I change my notification settings?",
    answer:
      "Open Settings and update your notification preferences. Click Save Changes to apply the updated preferences.",
  },
  {
    id: 12,
    category: "settings",
    question: "How can I change the appearance?",
    answer:
      "Open Settings and select your preferred appearance option. Save your settings to apply the change.",
  },
];

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);

  // =========================
  // CHAT STATES
  // =========================
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "support",
      message:
        "Hi! 👋 Welcome to LearnDesk Support. How can we help you today?",
    },
  ]);

  const search = searchTerm.trim().toLowerCase();

  // =========================
  // CATEGORY SEARCH
  // =========================
  const filteredCategories = categories.filter((category) => {
    if (!search) {
      return true;
    }

    return (
      category.title.toLowerCase().includes(search) ||
      category.description.toLowerCase().includes(search)
    );
  });

  // =========================
  // FAQ FILTER
  // =========================
  const filteredFaqs = faqs.filter((faq) => {
    if (
      selectedCategory !== "all" &&
      faq.category !== selectedCategory
    ) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      faq.question.toLowerCase().includes(search) ||
      faq.answer.toLowerCase().includes(search)
    );
  });

  // =========================
  // CATEGORY CLICK
  // =========================
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setOpenFaq(null);

    setTimeout(() => {
      const faqSection =
        document.getElementById("help-faq-section");

      if (faqSection) {
        faqSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // =========================
  // CLEAR SEARCH
  // =========================
  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setOpenFaq(null);
  };

  // =========================
  // SHOW ALL FAQ
  // =========================
  const showAllFaqs = () => {
    setSelectedCategory("all");
    setOpenFaq(null);

    setTimeout(() => {
      const faqSection =
        document.getElementById("help-faq-section");

      if (faqSection) {
        faqSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // =========================
  // FAQ TOGGLE
  // =========================
  const toggleFaq = (id) => {
    setOpenFaq((previous) =>
      previous === id ? null : id
    );
  };

  // =========================
  // OPEN CHAT SUPPORT
  // =========================
  const handleChatSupport = () => {
    setIsChatOpen(true);
  };

  // =========================
  // CLOSE CHAT
  // =========================
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // =========================
  // SEND CHAT MESSAGE
  // =========================
  const handleSendMessage = () => {
    const message = chatMessage.trim();

    if (!message) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      message,
    };

    setChatMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setChatMessage("");

    /*
      Support backend/chat API is not connected yet.

      For now we show a temporary support response.
      Later this can be connected with a real
      support/chat API.
    */

    setTimeout(() => {
      const supportMessage = {
        id: Date.now() + 1,
        sender: "support",
        message:
          "Thanks for contacting LearnDesk Support. Our support team will help you shortly.",
      };

      setChatMessages((previous) => [
        ...previous,
        supportMessage,
      ]);
    }, 600);
  };

  // =========================
  // CHAT ENTER KEY
  // =========================
  const handleChatKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // =========================
  // SELECTED CATEGORY
  // =========================
  const selectedCategoryData = categories.find(
    (category) => category.id === selectedCategory
  );

  return (
    <div className="help-page">

      {/* =========================
          HERO
      ========================= */}
      <section className="help-hero">
        <div className="help-hero-icon">
          <MessageCircleQuestion size={28} />
        </div>

        <h1>How can we help you?</h1>

        <p>
          Search our help center or browse categories to find answers quickly.
        </p>

        <div className="help-search-wrapper">
          <Search
            size={20}
            className="help-search-icon"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            placeholder="Search for help..."
          />

          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              style={{
                position: "absolute",
                right: "14px",
                top: "13px",
                border: "none",
                background: "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      {/* =========================
          CATEGORIES
      ========================= */}
      <section className="help-section">
        <div className="help-section-header">
          <div>
            <h2>Help Categories</h2>

            <p>
              Find help based on what you need.
            </p>
          </div>
        </div>

        {filteredCategories.length > 0 ? (
          <div className="help-category-grid">

            {/* ALL HELP */}
            <button
              type="button"
              className="help-category-card"
              onClick={showAllFaqs}
              style={
                selectedCategory === "all"
                  ? {
                      borderColor: "#6d3df5",
                      background: "#faf9ff",
                    }
                  : {}
              }
            >
              <div className="help-category-icon">
                <MessageCircleQuestion size={21} />
              </div>

              <div className="help-category-content">
                <h3>All Help</h3>

                <p>
                  View all frequently asked questions.
                </p>

                <span>
                  {faqs.length} questions
                </span>
              </div>

              <ArrowRight
                size={17}
                style={{
                  marginLeft: "auto",
                  marginTop: "4px",
                  flexShrink: 0,
                  color: "#6d3df5",
                }}
              />
            </button>

            {/* CATEGORY CARDS */}
            {filteredCategories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  type="button"
                  key={category.id}
                  className="help-category-card"
                  onClick={() =>
                    handleCategoryClick(category.id)
                  }
                  style={
                    selectedCategory === category.id
                      ? {
                          borderColor: "#6d3df5",
                          background: "#faf9ff",
                        }
                      : {}
                  }
                >
                  <div className="help-category-icon">
                    <Icon size={21} />
                  </div>

                  <div className="help-category-content">
                    <h3>{category.title}</h3>

                    <p>
                      {category.description}
                    </p>

                    <span>
                      {category.count} articles
                    </span>
                  </div>

                  <ArrowRight
                    size={17}
                    style={{
                      marginLeft: "auto",
                      marginTop: "4px",
                      flexShrink: 0,
                      color: "#6d3df5",
                    }}
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="no-help-results">
            <Search size={28} />

            <h3>No results found</h3>

            <p>
              Try searching with a different keyword.
            </p>
          </div>
        )}
      </section>

      {/* =========================
          FAQ
      ========================= */}
      <section
        className="faq-section"
        id="help-faq-section"
      >
        <div className="help-section-header">
          <div>
            <h2>
              {selectedCategory === "all"
                ? "Frequently Asked Questions"
                : `${selectedCategoryData?.title} Questions`}
            </h2>

            <p>
              {selectedCategory === "all"
                ? "Quick answers to common questions."
                : `Quick answers related to ${selectedCategoryData?.title.toLowerCase()}.`}
            </p>
          </div>
        </div>

        {filteredFaqs.length > 0 ? (
          <div className="faq-list">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`faq-item ${
                    isOpen ? "open" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() =>
                      toggleFaq(faq.id)
                    }
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>

                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition:
                          "transform 0.2s ease",
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-help-results">
            <Search size={28} />

            <h3>No results found</h3>

            <p>
              Try searching with a different keyword.
            </p>
          </div>
        )}
      </section>

      {/* =========================
          SUPPORT CARD
      ========================= */}
      <section className="support-card">
        <div className="support-icon">
          <MessageCircleQuestion size={23} />
        </div>

        <div className="support-content">
          <h2>Still need help?</h2>

          <p>
            If you cannot find the answer you are looking
            for, chat with the LearnDesk support team.
          </p>
        </div>

        <div className="support-actions">
          <button
            type="button"
            className="support-button chat-button"
            onClick={handleChatSupport}
          >
            <MessageCircleQuestion size={15} />

            Chat with Support

            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* =========================
          CHAT OVERLAY
      ========================= */}
      {isChatOpen && (
        <div className="help-chat-overlay">

          <div className="help-chat-box">

            {/* CHAT HEADER */}
            <div className="help-chat-header">

              <div className="help-chat-header-left">

                <div className="help-chat-avatar">
                  <Headphones size={19} />
                </div>

                <div>
                  <h3>
                    LearnDesk Support
                  </h3>

                  <span>
                    <span className="help-chat-status-dot"></span>
                    Online
                  </span>
                </div>

              </div>

              <button
                type="button"
                onClick={handleCloseChat}
                aria-label="Close support chat"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                }}
              >
                <X size={19} />
              </button>

            </div>

            {/* CHAT BODY */}
            <div className="help-chat-body">

              {chatMessages.map((chat) => (
                <div
                  key={chat.id}
                  className={`help-chat-message-row ${
                    chat.sender === "user"
                      ? "user-message-row"
                      : "support-message-row"
                  }`}
                >

                  {chat.sender === "support" && (
                    <div className="help-chat-small-avatar">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`help-chat-message ${
                      chat.sender === "user"
                        ? "user-message"
                        : "support-message"
                    }`}
                  >
                    {chat.message}
                  </div>

                </div>
              ))}

            </div>

            {/* CHAT INPUT */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderTop: "1px solid #e5e7eb",
                background: "#ffffff",
              }}
            >

              <input
                type="text"
                value={chatMessage}
                onChange={(e) =>
                  setChatMessage(e.target.value)
                }
                onKeyDown={handleChatKeyDown}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "9px 11px",
                  outline: "none",
                  fontSize: "12px",
                  color: "#334155",
                }}
              />

              <button
                type="button"
                onClick={handleSendMessage}
                aria-label="Send message"
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#6d3df5",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Send size={15} />
              </button>

            </div>

            <div className="help-chat-footer">
              LearnDesk Support
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Help;
