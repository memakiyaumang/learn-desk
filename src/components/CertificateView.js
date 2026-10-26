import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Award,
  CheckCircle,
} from "lucide-react";

import html2canvas from "html2canvas";
import "../css/CertificateView.css";

const CertificateView = () => {
  const navigate = useNavigate();
  const certificateRef = useRef(null);

  let certificate = null;
  let student = null;

  try {
    certificate = JSON.parse(
      sessionStorage.getItem("selectedCertificate") || "null"
    );

    student = JSON.parse(
      sessionStorage.getItem("studentSession") || "null"
    );
  } catch (error) {
    console.error("Unable to read certificate data:", error);
  }

  const studentName =
    student?.name ||
    student?.fullName ||
    student?.username ||
    "Student";

  const formatDate = (date) => {
    if (!date) return "-";

    const validDate = new Date(date);

    if (Number.isNaN(validDate.getTime())) {
      return "-";
    }

    return validDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    if (!certificate || !certificateRef.current) {
      alert("Certificate is not ready to download. Please try again.");
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");
      const certificateElement = certificateRef.current;

      // Wait for fonts and images inside the certificate to finish loading.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const images = Array.from(certificateElement.querySelectorAll("img"));
      await Promise.all(
        images.map((image) => {
          if (image.complete) return Promise.resolve();

          return new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(certificateElement, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fit the captured preview to A4 without stretching its proportions.
      const imageRatio = canvas.width / canvas.height;
      const pageRatio = pageWidth / pageHeight;

      let imageWidth = pageWidth;
      let imageHeight = pageHeight;
      let imageX = 0;
      let imageY = 0;

      if (imageRatio > pageRatio) {
        imageHeight = pageWidth / imageRatio;
        imageY = (pageHeight - imageHeight) / 2;
      } else {
        imageWidth = pageHeight * imageRatio;
        imageX = (pageWidth - imageWidth) / 2;
      }

      pdf.addImage(
        imageData,
        "PNG",
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      const safeFileName = (certificate.title || "certificate")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      pdf.save(`${safeFileName || "certificate"}-certificate.pdf`);
    } catch (error) {
      console.error("Unable to download certificate:", error);
      alert(
        "Unable to generate certificate PDF. Please check that html2canvas and jspdf are installed."
      );
    }
  };

  if (!certificate) {
    return (
      <div className="certificate-view-page">
        <div className="certificate-not-found">
          <Award size={45} />

          <h2>Certificate Not Found</h2>

          <p>
            Please go back to your certificates
            and select a certificate again.
          </p>

          <button
            type="button"
            onClick={() => navigate("/certificates")}
          >
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-view-page">
      {/* Top Bar */}
      <div className="certificate-view-topbar">
        <button
          type="button"
          className="certificate-back-button"
          onClick={() => navigate("/certificates")}
        >
          <ArrowLeft size={17} />
          Back to Certificates
        </button>

        <button
          type="button"
          className="certificate-download-button"
          onClick={handleDownload}
        >
          <Download size={17} />
          Download Certificate
        </button>
      </div>

      {/* Certificate preview: this exact element is captured for the PDF */}
      <div className="certificate-paper" ref={certificateRef}>
        <div className="certificate-paper-inner">
          {/* Top Award */}
          <div className="certificate-award-circle">
            <Award size={28} />
          </div>

          <div className="certificate-small-title">
            LEARNDESK
          </div>

          <h1>
            CERTIFICATE
          </h1>

          <div className="certificate-of-completion">
            OF COMPLETION
          </div>

          <p className="certificate-presented">
            This certificate is proudly presented to
          </p>

          <h2 className="certificate-student-name">
            {studentName}
          </h2>

          <p className="certificate-completed-text">
            for successfully completing the course
          </p>

          <h3 className="certificate-course-title">
            {certificate.title || "Course"}
          </h3>

          <div className="certificate-course-line" />

          <div className="certificate-course-info">
            <div>
              <span>
                Category
              </span>

              <strong>
                {certificate.category || "General"}
              </strong>
            </div>

            <div>
              <span>
                Instructor
              </span>

              <strong>
                {certificate.instructor || "Faculty"}
              </strong>
            </div>
          </div>

          <div className="certificate-bottom-section">
            <div className="certificate-bottom-item">
              <span>
                COMPLETION DATE
              </span>

              <strong>
                {formatDate(certificate.completedDate)}
              </strong>
            </div>

            <div className="certificate-verified">
              <CheckCircle size={22} />

              <div>
                <span>
                  VERIFIED
                </span>

                <small>
                  Course Completed
                </small>
              </div>
            </div>

            <div className="certificate-bottom-item right">
              <span>
                CERTIFICATE ID
              </span>

              <strong>
                {certificate.certificateId || "-"}
              </strong>
            </div>
          </div>

          <div className="certificate-platform">
            ONLINE LEARNING PLATFORM
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
