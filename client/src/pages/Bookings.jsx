import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/bookings.css";

const Bookings = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/bookings");

            setBookings(response.data.bookings || []);

        } catch (error) {
            console.error(
                "Fetch bookings error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to load bookings."
            );

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const cancelBooking = async (bookingId) => {
        try {
            const confirmed = window.confirm(
                "Are you sure you want to cancel this booking?"
            );

            if (!confirmed) return;

            await api.patch(`/bookings/${bookingId}/cancel`);

            await fetchBookings();

        } catch (error) {
            console.error(
                "Cancel booking error:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Failed to cancel booking."
            );
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );
    };

    if (loading) {
        return (
            <div className="bookings-page">
                <div className="bookings-message">
                    Loading bookings...
                </div>
            </div>
        );
    }

    return (
        <div className="bookings-page">

            <div className="bookings-header">

                <div>
                    <span className="page-label">
                        BOOKING SYSTEM
                    </span>

                    <h1>
                        My Bookings
                    </h1>

                    <p>
                        Manage your upcoming and past tutoring sessions.
                    </p>
                </div>

                <button
                    className="find-tutor-booking-button"
                    onClick={() => navigate("/skill-exchange")}
                >
                    Find a Tutor →
                </button>

            </div>


            {error && (
                <div className="booking-alert error">
                    {error}
                </div>
            )}


            <section className="bookings-section">

                <div className="section-heading">

                    <div>
                        <span className="section-label">
                            SCHEDULE
                        </span>

                        <h2>
                            Your Sessions
                        </h2>
                    </div>

                    <span className="booking-count">
                        {bookings.length}
                    </span>

                </div>


                {bookings.length === 0 ? (

                    <div className="empty-bookings">

                        <div className="empty-icon">
                            📅
                        </div>

                        <h3>
                            No bookings yet
                        </h3>

                        <p>
                            Your confirmed tutoring sessions will appear here.
                        </p>

                        <button
                            className="find-tutor-button"
                            onClick={() => navigate("/skill-exchange")}
                        >
                            Find a Tutor
                        </button>

                    </div>

                ) : (

                    <div className="bookings-grid">

                        {bookings.map((booking) => {
                            const isStudent =
                                String(user?.id) === String(booking.student?._id);

                            const otherPerson = isStudent
                                ? booking.tutor
                                : booking.student;

                            const otherRole = isStudent
                                ? "TUTOR"
                                : "STUDENT";

                            return (
                                <div
                                    className="booking-card"
                                    key={booking._id}
                                >

                                    <div className="booking-card-header">

                                        <div className="booking-subject">

                                            <span className="booking-label">
                                                SUBJECT
                                            </span>

                                            <h3>
                                                {booking.subject}
                                            </h3>

                                        </div>

                                        <span
                                            className={`booking-status ${booking.status}`}
                                        >
                                            {booking.status}
                                        </span>

                                    </div>


                                    <div className="booking-person">

                                        <div className="booking-avatar">

                                            {otherPerson?.profileImage ? (

                                                <img
                                                    src={otherPerson.profileImage}
                                                    alt={otherPerson.name}
                                                />

                                            ) : (

                                                otherPerson?.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "U"

                                            )}

                                        </div>

                                        <div>

                                            <span>
                                                {otherRole}
                                            </span>

                                            <strong>
                                                {otherPerson?.name || "User"}
                                            </strong>

                                        </div>

                                    </div>

                                    <div className="booking-details">

                                        <div>
                                            <span>
                                                DATE
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    booking.scheduledAt
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                TIME
                                            </span>

                                            <strong>
                                                {formatTime(
                                                    booking.scheduledAt
                                                )}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                DURATION
                                            </span>

                                            <strong>
                                                {booking.duration} hour
                                                {booking.duration > 1
                                                    ? "s"
                                                    : ""}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                CREDITS
                                            </span>

                                            <strong>
                                                {booking.credits}
                                            </strong>
                                        </div>

                                    </div>


                                    {booking.notes && (
                                        <div className="booking-notes">

                                            <span>
                                                NOTES
                                            </span>

                                            <p>
                                                {booking.notes}
                                            </p>

                                        </div>
                                    )}

                                    {booking.status === "confirmed" && (
                                        <div className="booking-actions">
                                            <button
                                                className="cancel-booking-button"
                                                onClick={() => cancelBooking(booking._id)}
                                            >
                                                Cancel Booking
                                            </button>
                                        </div>
                                    )}

                                </div>
                            )
                        })}
                    </div>

                )}

            </section>

        </div>
    );
};

export default Bookings;