import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Award,
  CheckCircle,
} from "lucide-react";

import "../css/CertificateView.css";

const CertificateView = () => {
  const navigate = useNavigate();

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
    if (!certificate) return;

    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      /* Background */
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      /* Outer border */
      pdf.setDrawColor(109, 74, 255);
      pdf.setLineWidth(1.5);
      pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

      /* Inner border */
      pdf.setDrawColor(190, 175, 255);
      pdf.setLineWidth(0.5);
      pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

      /* Award icon */
      pdf.setFillColor(109, 74, 255);
      pdf.circle(pageWidth / 2, 31, 8, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);

      pdf.text("★", pageWidth / 2, 35, {
        align: "center",
      });

      /* Main title */
      pdf.setTextColor(45, 45, 65);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(27);

      pdf.text("CERTIFICATE", pageWidth / 2, 53, {
        align: "center",
      });

      pdf.setTextColor(109, 74, 255);
      pdf.setFontSize(14);

      pdf.text("OF COMPLETION", pageWidth / 2, 62, {
        align: "center",
      });

      /* Presented to */
      pdf.setTextColor(100, 100, 115);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      pdf.text(
        "This certificate is proudly presented to",
        pageWidth / 2,
        76,
        {
          align: "center",
        }
      );

      /* Student name */
      pdf.setTextColor(30, 30, 45);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);

      pdf.text(studentName, pageWidth / 2, 89, {
        align: "center",
      });

      /* Completion text */
      pdf.setTextColor(95, 95, 110);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      pdf.text(
        "for successfully completing the course",
        pageWidth / 2,
        101,
        {
          align: "center",
        }
      );

      /* Course */
      pdf.setTextColor(55, 55, 75);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);

      const courseTitleLines = pdf.splitTextToSize(
        certificate.title || "Course",
        220
      );

      pdf.text(courseTitleLines, pageWidth / 2, 114, {
        align: "center",
      });

      const courseDetailY =
        114 + courseTitleLines.length * 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 115);

      pdf.text(
        `Category: ${certificate.category || "General"}`,
        pageWidth / 2,
        courseDetailY + 5,
        {
          align: "center",
        }
      );

      pdf.text(
        `Instructor: ${certificate.instructor || "Faculty"}`,
        pageWidth / 2,
        courseDetailY + 12,
        {
          align: "center",
        }
      );

      /* Divider */
      const dividerY = courseDetailY + 21;

      pdf.setDrawColor(220, 220, 230);
      pdf.setLineWidth(0.4);

      pdf.line(
        55,
        dividerY,
        pageWidth - 55,
        dividerY
      );

      /* Date */
      pdf.setTextColor(90, 90, 105);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      pdf.text("COMPLETION DATE", 55, dividerY + 14);

      pdf.setTextColor(45, 45, 65);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);

      pdf.text(
        formatDate(certificate.completedDate),
        55,
        dividerY + 21
      );

      /* Certificate ID */
      pdf.setTextColor(90, 90, 105);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      pdf.text(
        "CERTIFICATE ID",
        pageWidth - 55,
        dividerY + 14,
        {
          align: "right",
        }
      );

      pdf.setTextColor(45, 45, 65);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);

      pdf.text(
        certificate.certificateId || "-",
        pageWidth - 55,
        dividerY + 21,
        {
          align: "right",
        }
      );

      /* Platform */
      pdf.setTextColor(109, 74, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);

      pdf.text(
        "ONLINE LEARNING PLATFORM",
        pageWidth / 2,
        pageHeight - 25,
        {
          align: "center",
        }
      );

      const safeFileName = (
        certificate.title || "certificate"
      )
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

      pdf.save(`${safeFileName}-certificate.pdf`);
    } catch (error) {
      console.error(
        "Unable to download certificate:",
        error
      );

      alert(
        "Unable to generate certificate PDF. Please make sure jsPDF is installed."
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

      {/* Certificate */}
      <div className="certificate-paper">

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
            {certificate.title}
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
                {formatDate(
                  certificate.completedDate
                )}
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
                {certificate.certificateId}
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