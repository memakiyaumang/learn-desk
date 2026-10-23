import React from "react";
import "../css/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">

      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">

          <a href="#" className="footer-logo">
            <span
              className="footer-logo-mark"
              aria-hidden="true"
            ></span>

            LearnDesk
          </a>

          <p className="footer-description">
            Learn at your own pace with practical courses,
            helpful resources, and a learning experience
            designed for your success.
          </p>

          {/* Social Links */}
          <div className="footer-socials">

            <a href="#" aria-label="Facebook">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14 8h3V4h-3c-3.3 0-5 1.7-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-1 .3-1 1-1z" />
              </svg>
            </a>

            <a href="#" aria-label="Twitter">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 10.6 2.2.1 4.4-.6 6-2C3 15.5.5 10.6 3 7c2.2 2.6 5.5 3.1 8.2 1.7C10.1 5.4 13.8 3.2 17 5.1c1.1 0 3-1.1 3-1.1s0 1.7-.1 2.1C21 5.4 22 4 22 4z" />
              </svg>
            </a>

            <a href="#" aria-label="LinkedIn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6.5 8.5A2.5 2.5 0 1 0 6.5 3a2.5 2.5 0 0 0 0 5.5zM4 10h5v11H4V10zm8 0h4.8v1.5h.1c.7-1.2 2.4-2.5 4.9-2.5 5.2 0 6.2 3.2 6.2 7.4V21h-5v-4.8c0-1.1 0-2.5-1.6-2.5s-1.8 1.2-1.8 2.4V21h-5V10z" />
              </svg>
            </a>

            <a href="#" aria-label="Instagram">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />

                <circle
                  cx="17.5"
                  cy="6.5"
                  r="0.7"
                  fill="currentColor"
                />
              </svg>
            </a>

          </div>
        </div>


        {/* Platform */}
        <div className="footer-column">

          <h3>Platform</h3>

          <a href="#">Dashboard</a>
          <a href="#">My Courses</a>
          <a href="#">Browse Courses</a>
          <a href="#">Progress</a>
          <a href="#">Learning Paths</a>

        </div>


        {/* Resources */}
        <div className="footer-column">

          <h3>Resources</h3>

          <a href="#">Help Center</a>
          <a href="#">Documentation</a>
          <a href="#">Community</a>
          <a href="#">FAQs</a>
          <a href="#">Support</a>

        </div>


        {/* Company */}
        <div className="footer-column">

          <h3>Company</h3>

          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Careers</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>

        </div>

      </div>


      {/* Footer Bottom */}
      <div className="footer-bottom">

        <div className="footer-bottom-inner">

          <p>
            © {currentYear} LearnDesk. All rights reserved.
          </p>

          <p className="footer-made">
            Built for <span>better learning</span>
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;