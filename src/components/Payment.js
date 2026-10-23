import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

import "../css/Payment.css";

const API_URL = "https://project-final-backend-oeh1.onrender.com";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const course = location.state?.course || null;

  const price = Number(
    location.state?.price ?? course?.price ?? 0
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getCourseId = () => {
    return (
      course?.courseId ??
      course?.course_id ??
      course?._id ??
      course?.id ??
      null
    );
  };

  const getStudentSession = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("studentSession") || "null"
      );
    } catch {
      return null;
    }
  };

  const getToken = () => {
    const session = getStudentSession();

    return (
      session?.token ||
      localStorage.getItem("studentToken") ||
      null
    );
  };

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true),
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false),
          { once: true }
        );

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (loading) return;

    setError("");
    setSuccess("");

    const session = getStudentSession();
    const token = getToken();
    const courseId = getCourseId();

    if (!session || !token) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/payment",
          course,
        },
      });

      return;
    }

    if (!courseId) {
      setError("Course information is missing.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Invalid course price.");
      return;
    }

    setLoading(true);

    try {
      // 1. Load Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay Checkout. Check your internet connection."
        );
      }

      // 2. Create payment order on the backend
      const orderResponse = await fetch(
        `${API_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            courseId: String(courseId),
          }),
        }
      );

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok || !orderResult.success) {
        throw new Error(
          orderResult.message ||
            "Unable to create payment order."
        );
      }

      const order = orderResult.data;

      if (
        !order?.keyId ||
        !order?.orderId ||
        !order?.amount
      ) {
        throw new Error(
          "Invalid payment order received from the server."
        );
      }

      // 3. Razorpay Checkout configuration
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "LearnDesk",
        description: `Course: ${order.courseName || "Online Course"}`,
        order_id: order.orderId,

        prefill: {
          name:
            session.name ||
            session.fullName ||
            session.username ||
            "",
          email:
            session.email ||
            session.emailAddress ||
            "",
          contact:
            session.mobile ||
            session.phone ||
            session.phoneNumber ||
            "",
        },

        // UPI preference: displays UPI as a preferred block
        // when this Checkout configuration is supported.
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi",
                  },
                ],
              },
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },

        theme: {
          color: "#6d3df5",
        },

        // 4. Verify payment on the backend
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/api/payments/verify`,
              {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              }
            );

            const verifyResult =
              await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyResult.success
            ) {
              throw new Error(
                verifyResult.message ||
                  "Payment verification failed. Please check your enrollment before retrying."
              );
            }

            // Refresh enrollment and course information
            window.dispatchEvent(
              new Event("enrollmentUpdated")
            );

            window.dispatchEvent(
              new Event("coursesUpdated")
            );

            setSuccess(
              "Payment verified successfully. Your course enrollment is complete."
            );

            navigate("/courses", {
              replace: true,
              state: {
                paymentSuccess: true,
                course,
              },
            });
          } catch (verificationError) {
            console.error(
              "Payment Verification Error:",
              verificationError
            );

            setError(
              verificationError.message ||
                "Unable to verify payment. Please check your enrollment before retrying."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        console.error(
          "Razorpay Payment Failed:",
          response.error
        );

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setLoading(false);
      });

      checkout.open();
    } catch (paymentError) {
      console.error("Payment Error:", paymentError);

      setError(
        paymentError.message ||
          "Unable to start payment. Please try again."
      );

      setLoading(false);
    }
  };

  // Course not found
  if (!course) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <h1>Course Not Found</h1>

          <p>
            Please select a course before proceeding to payment.
          </p>

          <button
            type="button"
            className="payment-back-btn"
            onClick={() => navigate("/browse")}
          >
            <ArrowLeft size={16} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Payment page UI
  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-icon">
          <CreditCard size={30} />
        </div>

        <h1>Complete Your Payment</h1>

        <p className="payment-message">
          Securely purchase your course using Razorpay.
        </p>

        <div className="payment-course-card">
          <div>
            <span className="payment-label">
              Selected Course
            </span>

            <h2>
              {course.title ||
                course.courseName ||
                course.name ||
                "Selected Course"}
            </h2>
          </div>

          <div className="payment-price">
            <span>Course Price</span>

            <strong>
              ₹{price.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        {error && (
          <div
            className="payment-message"
            role="alert"
            style={{ color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="payment-message"
            role="status"
            style={{ color: "#15803d" }}
          >
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <div className="payment-info">
          <div className="payment-info-item">
            <span className="info-icon">
              <ShieldCheck size={22} />
            </span>

            <div>
              <strong>Secure Verification</strong>

              <p>
                Your payment is verified by the LearnDesk
                backend.
              </p>
            </div>
          </div>

          <div className="payment-info-item">
            <span className="info-icon">
              <CreditCard size={22} />
            </span>

            <div>
              <strong>Razorpay Checkout</strong>

              <p>
                Choose from the payment methods available
                through your Razorpay account.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="payment-pay-btn"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle size={18} />
              Processing...
            </>
          ) : (
            `Pay ₹${price.toLocaleString("en-IN")}`
          )}
        </button>

        <br />

        <button
          type="button"
          className="payment-back-btn"
          disabled={loading}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          Back to Course
        </button>
      </div>
    </div>
  );
};

export default Payment;