import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/tutorRequests.css";

const TutorRequests = () => {

    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState("");

    const [bookingRequest, setBookingRequest] = useState(null);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [bookingNotes, setBookingNotes] = useState("");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/tutor-requests");

            setIncoming(response.data.incoming || []);
            setOutgoing(response.data.outgoing || []);

        } catch (error) {
            console.error(
                "Fetch tutor requests error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load tutor requests."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateRequestStatus = async (requestId, status) => {
        try {
            setActionLoading(requestId);
            setMessage("");

            const response = await api.patch(
                `/tutor-requests/${requestId}/status`,
                {
                    status
                }
            );

            console.log(
                "Tutor request updated:",
                response.data
            );

            setMessage(
                status === "accepted"
                    ? "Tutor request accepted successfully."
                    : "Tutor request rejected."
            );

            await fetchRequests();

        } catch (error) {
            console.error(
                "Update tutor request error:",
                error.response?.data || error.message
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to update tutor request."
            );

        } finally {
            setActionLoading(null);
        }
    };

    const getStatusClass = (status) => {
        return `request-status ${status}`;
    };

    const validateBooking = () => {

        if (!bookingDate) {
            setMessage("Please select a booking date.");
            return false;
        }

        if (!bookingTime) {
            setMessage("Please select a booking time.");
            return false;
        }

        const selectedDateTime = new Date(
            `${bookingDate}T${bookingTime}`
        );

        if (selectedDateTime <= new Date()) {
            setMessage(
                "Please select a future date and time."
            );
            return false;
        }

        return true;
    };

    const createBooking = async () => {

        if (!validateBooking()) return;

        try {
            setActionLoading(bookingRequest._id);
            setMessage("");

            const scheduledAt = new Date(
                `${bookingDate}T${bookingTime}`
            ).toISOString();

            const response = await api.post(
                "/bookings",
                {
                    tutorRequestId: bookingRequest._id,
                    scheduledAt,
                    notes: bookingNotes.trim()
                }
            );

            console.log(
                "Booking created:",
                response.data
            );

            setBookingRequest(null);
            setBookingDate("");
            setBookingTime("");
            setBookingNotes("");

            setMessage(
                "Booking created successfully!"
            );

            await fetchRequests();

        } catch (error) {
            console.error(
                "Create booking error:",
                error.response?.data || error.message
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to create booking."
            );

        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="tutor-requests-message">
                Loading tutor requests...
            </div>
        );
    }

    return (
        <div className="tutor-requests-component">

            {error && (
                <div className="tutor-request-alert error">
                    {error}
                </div>
            )}

            {message && (
                <div className="tutor-request-alert success">
                    {message}
                </div>
            )}

            {/* Incoming Requests */}

            <section className="requests-section">

                <div className="section-heading">

                    <div>
                        <span className="section-label">
                            RECEIVED
                        </span>

                        <h2>
                            Incoming Requests
                        </h2>
                    </div>

                    <span className="request-count">
                        {incoming.length}
                    </span>

                </div>

                {incoming.length === 0 ? (

                    <div className="empty-requests">

                        <div className="empty-icon">
                            ↓
                        </div>

                        <h3>
                            No incoming requests
                        </h3>

                        <p>
                            Tutor requests from students
                            will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="requests-grid">

                        {incoming.map((request) => (

                            <div
                                className="tutor-request-card"
                                key={request._id}
                            >

                                <div className="request-card-header">

                                    <div className="request-avatar">

                                        {request.student?.profileImage ? (

                                            <img
                                                src={
                                                    request.student.profileImage
                                                }
                                                alt={
                                                    request.student.name
                                                }
                                            />

                                        ) : (

                                            request.student?.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "S"

                                        )}

                                    </div>

                                    <div className="request-person">

                                        <span>
                                            STUDENT
                                        </span>

                                        <h3>
                                            {
                                                request.student?.name ||
                                                "Student"
                                            }
                                        </h3>

                                    </div>

                                    <span
                                        className={getStatusClass(
                                            request.status
                                        )}
                                    >
                                        {request.status}
                                    </span>

                                </div>

                                <div className="request-details">

                                    <div>
                                        <span>
                                            Subject
                                        </span>

                                        <strong>
                                            {request.subject}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Duration
                                        </span>

                                        <strong>
                                            {request.duration} hour
                                            {request.duration > 1
                                                ? "s"
                                                : ""}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Credits
                                        </span>

                                        <strong>
                                            {request.creditsRequired}
                                        </strong>
                                    </div>

                                </div>

                                {request.message && (
                                    <div className="request-message">

                                        <span>
                                            MESSAGE
                                        </span>

                                        <p>
                                            "{request.message}"
                                        </p>

                                    </div>
                                )}

                                {request.status === "pending" && (

                                    <div className="request-actions">

                                        <button
                                            className="accept-request-button"
                                            onClick={() =>
                                                updateRequestStatus(
                                                    request._id,
                                                    "accepted"
                                                )
                                            }
                                            disabled={
                                                actionLoading ===
                                                request._id
                                            }
                                        >
                                            {actionLoading ===
                                            request._id
                                                ? "Processing..."
                                                : "Accept"}
                                        </button>

                                        <button
                                            className="reject-request-button"
                                            onClick={() =>
                                                updateRequestStatus(
                                                    request._id,
                                                    "rejected"
                                                )
                                            }
                                            disabled={
                                                actionLoading ===
                                                request._id
                                            }
                                        >
                                            Reject
                                        </button>

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* Outgoing Requests */}

            <section className="requests-section">

                <div className="section-heading">

                    <div>
                        <span className="section-label">
                            SENT
                        </span>

                        <h2>
                            My Requests
                        </h2>
                    </div>

                    <span className="request-count">
                        {outgoing.length}
                    </span>

                </div>

                {outgoing.length === 0 ? (

                    <div className="empty-requests">

                        <div className="empty-icon">
                            ↑
                        </div>

                        <h3>
                            No requests sent
                        </h3>

                        <p>
                            Requests you send to tutors
                            will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="requests-grid">

                        {outgoing.map((request) => (

                            <div
                                className="tutor-request-card"
                                key={request._id}
                            >

                                <div className="request-card-header">

                                    <div className="request-avatar">

                                        {request.tutor?.profileImage ? (

                                            <img
                                                src={
                                                    request.tutor.profileImage
                                                }
                                                alt={
                                                    request.tutor.name
                                                }
                                            />

                                        ) : (

                                            request.tutor?.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "T"

                                        )}

                                    </div>

                                    <div className="request-person">

                                        <span>
                                            TUTOR
                                        </span>

                                        <h3>
                                            {request.tutor?.name ||
                                                "Tutor"}
                                        </h3>

                                    </div>

                                    <span
                                        className={getStatusClass(
                                            request.status
                                        )}
                                    >
                                        {request.status}
                                    </span>

                                </div>

                                <div className="request-details">

                                    <div>
                                        <span>
                                            Subject
                                        </span>

                                        <strong>
                                            {request.subject}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Duration
                                        </span>

                                        <strong>
                                            {request.duration} hour
                                            {request.duration > 1
                                                ? "s"
                                                : ""}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Credits
                                        </span>

                                        <strong>
                                            {request.creditsRequired}
                                        </strong>
                                    </div>

                                </div>

                                {request.message && (
                                    <div className="request-message">

                                        <span>
                                            MESSAGE
                                        </span>

                                        <p>
                                            "{request.message}"
                                        </p>

                                    </div>
                                )}

                                {request.status === "accepted" && (

                                    <div className="request-actions">

                                        <button
                                            className="accept-request-button"
                                            onClick={() =>
                                                setBookingRequest(
                                                    request
                                                )
                                            }
                                        >
                                            Book Session →
                                        </button>

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </section>


            {/* Booking Modal */}

            {bookingRequest && (

                <div className="booking-modal-overlay">

                    <div className="booking-modal">

                        <button
                            className="booking-modal-close"
                            onClick={() =>
                                setBookingRequest(null)
                            }
                        >
                            ×
                        </button>

                        <span className="section-label">
                            BOOK SESSION
                        </span>

                        <h2>
                            Schedule Your Session
                        </h2>

                        <p className="booking-modal-subtitle">
                            Choose a convenient time for your
                            tutoring session.
                        </p>

                        <div className="booking-modal-info">

                            <div>
                                <span>SUBJECT</span>
                                <strong>
                                    {bookingRequest.subject}
                                </strong>
                            </div>

                            <div>
                                <span>TUTOR</span>
                                <strong>
                                    {bookingRequest.tutor?.name ||
                                        "Tutor"}
                                </strong>
                            </div>

                            <div>
                                <span>DURATION</span>
                                <strong>
                                    {bookingRequest.duration} hour
                                    {bookingRequest.duration > 1
                                        ? "s"
                                        : ""}
                                </strong>
                            </div>

                            <div>
                                <span>CREDITS</span>
                                <strong>
                                    {bookingRequest.creditsRequired}
                                </strong>
                            </div>

                        </div>

                        <div className="booking-form">

                            <label>
                                DATE

                                <input
                                    type="date"
                                    value={bookingDate}
                                    onChange={(e) =>
                                        setBookingDate(
                                            e.target.value
                                        )
                                    }
                                />
                            </label>

                            <label>
                                TIME

                                <input
                                    type="time"
                                    value={bookingTime}
                                    onChange={(e) =>
                                        setBookingTime(
                                            e.target.value
                                        )
                                    }
                                />
                            </label>

                            <label>
                                NOTES

                                <textarea
                                    placeholder="Add a note for your tutor..."
                                    rows="3"
                                    value={bookingNotes}
                                    onChange={(e) =>
                                        setBookingNotes(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>

                        </div>

                        <div className="booking-modal-actions">

                            <button
                                className="booking-cancel-button"
                                onClick={() =>
                                    setBookingRequest(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="booking-confirm-button"
                                onClick={createBooking}
                                disabled={
                                    actionLoading ===
                                    bookingRequest._id
                                }
                            >
                                {actionLoading ===
                                bookingRequest._id
                                    ? "Creating Booking..."
                                    : "Confirm Booking"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default TutorRequests;