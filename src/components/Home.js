
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  Sparkles,
  Clock3,
  ShieldCheck,
  MonitorPlay,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

import "../css/Home.css";

const Home = () => {
  const navigate = useNavigate();

  // =========================================
  // GET STARTED BUTTON
  // =========================================

  const handleGetStarted = () => {
    try {
      const student = JSON.parse(
        sessionStorage.getItem("studentSession") || "null"
      );

      const faculty = JSON.parse(
        sessionStorage.getItem("facultySession") || "null"
      );

      if (student?.token && student?.role === "student") {
        navigate("/dashboard");
        return;
      }

      if (faculty?.token && faculty?.role === "faculty") {
        navigate("/faculty");
        return;
      }

      navigate("/login");
    } catch (error) {
      console.error("Session checking error:", error);
      navigate("/login");
    }
  };

  return (
    <div className="home-page">

      {/* =====================================
          HERO SECTION
      ===================================== */}

      <section className="home-hero">

        <div className="home-hero-content">

          {/* <div className="home-tag">
            <Sparkles size={15} />
            {/* <span>Welcome to LearnDesk</span> */}
          {/* </div> */} 

          <h1>
            Unlock Your Potential.
            <span> Learn Without Limits.</span>
          </h1>

          <p className="home-hero-description">
            Discover courses, learn from experienced instructors,
            and build practical skills that help you move closer
            to your future goals.
          </p>

          <div className="home-hero-buttons">

            <Link to="/browse" className="home-primary-btn">
              Explore Courses
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              className="home-secondary-btn"
              onClick={handleGetStarted}
            >
              <PlayCircle size={18} />
              Get Started
            </button>

          </div>

          <div className="home-trust-points">

            <span>
              <CheckCircle size={16} />
              Flexible Learning
            </span>

            <span>
              <CheckCircle size={16} />
              Learn at Your Pace
            </span>

            <span>
              <CheckCircle size={16} />
              Track Your Progress
            </span>

          </div>

        </div>


        {/* HERO VISUAL */}

        <div className="home-hero-visual">

          <div className="home-visual-glow"></div>

          <div className="home-main-learning-card">

            <div className="home-learning-card-top">
              <span className="home-learning-label">
                YOUR LEARNING JOURNEY
              </span>

              <span className="home-learning-status">
                <span></span>
                Start Today
              </span>
            </div>

            <div className="home-learning-illustration">
              <div className="home-illustration-circle">
                <GraduationCap size={88} strokeWidth={1.5} />
              </div>

              <div className="home-floating-icon home-floating-book">
                <BookOpen size={23} />
              </div>

              <div className="home-floating-icon home-floating-award">
                <Award size={23} />
              </div>

              <div className="home-floating-icon home-floating-play">
                <PlayCircle size={22} />
              </div>
            </div>

            <div className="home-learning-card-bottom">
              <h3>Start Learning Today</h3>
              <p>Small steps today. Big achievements tomorrow.</p>

              <Link to="/browse" className="home-discover-link">
                Discover Courses
                <ArrowRight size={16} />
              </Link>
            </div>

          </div>

          <div className="home-floating-card home-floating-card-one">
            <div className="home-floating-card-icon purple">
              <Clock3 size={19} />
            </div>

            <div>
              <strong>Learn Anytime</strong>
              <span>At your own pace</span>
            </div>
          </div>

          <div className="home-floating-card home-floating-card-two">
            <div className="home-floating-card-icon green">
              <Award size={19} />
            </div>

            <div>
              <strong>Earn Certificates</strong>
              <span>Celebrate your progress</span>
            </div>
          </div>

        </div>

      </section>


      {/* =====================================
          HIGHLIGHT STRIP
      ===================================== */}

      <section className="home-highlight-strip">

        <div className="home-highlight-item">
          <div className="home-highlight-icon">
            <BookOpen size={21} />
          </div>
          <div>
            <strong>Structured Courses</strong>
            <span>Organized learning content</span>
          </div>
        </div>

        <div className="home-highlight-item">
          <div className="home-highlight-icon">
            <Users size={21} />
          </div>
          <div>
            <strong>Expert Instructors</strong>
            <span>Learn from experienced faculty</span>
          </div>
        </div>

        <div className="home-highlight-item">
          <div className="home-highlight-icon">
            <TrendingUp size={21} />
          </div>
          <div>
            <strong>Track Progress</strong>
            <span>Monitor your learning journey</span>
          </div>
        </div>

        <div className="home-highlight-item">
          <div className="home-highlight-icon">
            <Award size={21} />
          </div>
          <div>
            <strong>Course Certificates</strong>
            <span>Showcase your achievements</span>
          </div>
        </div>

      </section>


      {/* =====================================
          FEATURES SECTION
      ===================================== */}

      <section className="home-features">

        <div className="home-section-heading">
          <span className="home-section-tag">WHY LEARNDESK?</span>

          <h2>
            Everything You Need to
            <span> Grow Your Skills</span>
          </h2>

          <p>
            A simple and effective learning platform designed
            to make your educational journey easier.
          </p>
        </div>


        <div className="home-feature-grid">

          <div className="home-feature-card">
            <div className="home-feature-icon purple">
              <BookOpen size={26} />
            </div>

            <span className="home-feature-number">01</span>

            <h3>Quality Courses</h3>

            <p>
              Explore different courses and improve your knowledge
              through structured lessons and learning materials.
            </p>

            <Link to="/browse" className="home-feature-link">
              Explore Courses <ArrowRight size={15} />
            </Link>
          </div>


          <div className="home-feature-card">
            <div className="home-feature-icon blue">
              <Users size={26} />
            </div>

            <span className="home-feature-number">02</span>

            <h3>Expert Instructors</h3>

            <p>
              Learn through courses created and managed by
              experienced instructors who guide your learning.
            </p>

            <div className="home-feature-link home-feature-static">
              Learn from Experts <CheckCircle size={15} />
            </div>
          </div>


          <div className="home-feature-card">
            <div className="home-feature-icon green">
              <TrendingUp size={26} />
            </div>

            <span className="home-feature-number">03</span>

            <h3>Track Your Progress</h3>

            <p>
              Monitor your learning progress, complete assessments,
              and understand your course achievements.
            </p>

            <div className="home-feature-link home-feature-static">
              Track Your Growth <ArrowRight size={15} />
            </div>
          </div>


          <div className="home-feature-card">
            <div className="home-feature-icon orange">
              <Award size={26} />
            </div>

            <span className="home-feature-number">04</span>

            <h3>Earn Certificates</h3>

            <p>
              Complete your courses and assessments to earn
              certificates that recognize your achievements.
            </p>

            <div className="home-feature-link home-feature-static">
              Celebrate Success <CheckCircle size={15} />
            </div>
          </div>


          <div className="home-feature-card">
            <div className="home-feature-icon pink">
              <MonitorPlay size={26} />
            </div>

            <span className="home-feature-number">05</span>

            <h3>Flexible Learning</h3>

            <p>
              Access your learning content and continue your
              educational journey at your convenience.
            </p>

            <div className="home-feature-link home-feature-static">
              Learn Your Way <ArrowRight size={15} />
            </div>
          </div>


          <div className="home-feature-card">
            <div className="home-feature-icon yellow">
              <Lightbulb size={26} />
            </div>

            <span className="home-feature-number">06</span>

            <h3>Build New Skills</h3>

            <p>
              Discover new topics, strengthen your understanding,
              and take the next step in your learning journey.
            </p>

            <div className="home-feature-link home-feature-static">
              Keep Improving <ArrowRight size={15} />
            </div>
          </div>

        </div>

      </section>


      {/* =====================================
          HOW IT WORKS
      ===================================== */}

      <section className="home-how-it-works">

        <div className="home-section-heading">
          <span className="home-section-tag">SIMPLE LEARNING PROCESS</span>

          <h2>
            Start Learning in
            <span> Three Easy Steps</span>
          </h2>

          <p>
            Begin your learning journey with a simple and
            straightforward process.
          </p>
        </div>


        <div className="home-steps">

          <div className="home-step">
            <div className="home-step-number">01</div>

            <div className="home-step-icon">
              <Users size={25} />
            </div>

            <h3>Create an Account</h3>

            <p>
              Register as a student and access your personal
              learning dashboard.
            </p>
          </div>


          <div className="home-step">
            <div className="home-step-number">02</div>

            <div className="home-step-icon">
              <BookOpen size={25} />
            </div>

            <h3>Choose a Course</h3>

            <p>
              Browse available courses and select the subject
              you want to learn.
            </p>
          </div>


          <div className="home-step">
            <div className="home-step-number">03</div>

            <div className="home-step-icon">
              <GraduationCap size={25} />
            </div>

            <h3>Start Learning</h3>

            <p>
              Enroll in your selected course, complete lessons,
              and track your progress.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================
          CALL TO ACTION
      ===================================== */}

      <section className="home-cta">

        <div className="home-cta-decoration home-cta-decoration-one"></div>
        <div className="home-cta-decoration home-cta-decoration-two"></div>

        <div className="home-cta-content">
          <span className="home-cta-tag">
            <Sparkles size={15} />
            YOUR FUTURE STARTS HERE
          </span>

          <h2>
            Ready to Begin Your
            <span> Learning Journey?</span>
          </h2>

          <p>
            Discover courses, develop new skills, and move closer
            to your goals with LearnDesk.
          </p>

          <div className="home-cta-buttons">
            <Link to="/browse" className="home-cta-btn">
              Browse Courses
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              className="home-cta-secondary"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="home-cta-icon">
          <GraduationCap size={100} strokeWidth={1.2} />
        </div>

      </section>

    </div>
  );
};

export default Home;