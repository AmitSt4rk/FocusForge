import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/tutorRequests.css";

const TutorRequests = () => {
    const navigate = useNavigate();

    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState("");

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

    if (loading) {
        return (
            <div className="tutor-requests-page">
                <div className="tutor-requests-message">
                    Loading tutor requests...
                </div>
            </div>
        );
    }

    return (
        <div className="tutor-requests-page">

            <div className="tutor-requests-header">

                <div>
                    <span className="page-label">
                        TUTOR SYSTEM
                    </span>

                    <h1>
                        Tutor Requests
                    </h1>

                    <p>
                        Manage tutoring requests sent and received.
                    </p>
                </div>

                <button
                    className="back-to-tutors-button"
                    onClick={() => navigate("/tutors")}
                >
                    ← Find Tutors
                </button>

            </div>

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
                            Tutor requests from students will appear here.
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
                                                src={request.student.profileImage}
                                                alt={request.student.name}
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
                                            {request.student?.name || "Student"}
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
                                            {request.duration > 1 ? "s" : ""}
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
                                                actionLoading === request._id
                                            }
                                        >
                                            {actionLoading === request._id
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
                                                actionLoading === request._id
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
                            Requests you send to tutors will appear here.
                        </p>

                        <button
                            className="find-tutor-button"
                            onClick={() => navigate("/tutors")}
                        >
                            Find a Tutor
                        </button>
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
                                                src={request.tutor.profileImage}
                                                alt={request.tutor.name}
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
                                            {request.tutor?.name || "Tutor"}
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
                                            {request.duration > 1 ? "s" : ""}
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

                            </div>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
};

export default TutorRequests;
