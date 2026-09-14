import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/tutorProfile.css";

const TutorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showRequestForm, setShowRequestForm] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [duration, setDuration] = useState(1);
    const [requestMessage, setRequestMessage] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [requestStatus, setRequestStatus] = useState("");

    useEffect(() => {
        const fetchTutor = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/tutors/profile/${id}`
                );

                setTutor(response.data.tutorProfile);

            } catch (error) {
                console.error(
                    "Fetch tutor profile error:",
                    error.response?.data || error.message
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load tutor profile."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchTutor();
    }, [id]);

    const sendTutorRequest = async () => {
        if (!selectedSubject) {
            setRequestStatus(
                "Please select a subject."
            );
            return;
        }

        try {
            setSendingRequest(true);
            setRequestStatus("");

            const response = await api.post(
                "/tutor-requests",
                {
                    tutorProfileId: tutor._id,
                    subject: selectedSubject,
                    duration: Number(duration),
                    message: requestMessage.trim()
                }
            );

            console.log(
                "Tutor request created:",
                response.data
            );

            setRequestStatus(
                "Tutoring request sent successfully."
            );

            setSelectedSubject("");
            setDuration(1);
            setRequestMessage("");

            setShowRequestForm(false);

        } catch (error) {
            console.error(
                "Send tutor request error:",
                error.response?.data ||
                error.message
            );

            setRequestStatus(
                error.response?.data?.message ||
                "Failed to send tutoring request."
            );

        } finally {
            setSendingRequest(false);
        }
    };

    const totalCredits = tutor?.hourlyCredits * Number(duration || 1);

    if (loading) {
        return (
            <div className="tutor-profile-page">
                <div className="tutor-profile-message">
                    Loading tutor profile...
                </div>
            </div>
        );
    }

    if (error || !tutor) {
        return (
            <div className="tutor-profile-page">
                <div className="tutor-profile-message">
                    <h2>Tutor not found</h2>

                    <p>
                        {error || "This tutor is no longer available."}
                    </p>

                    <button
                        className="back-to-tutors-button"
                        onClick={() => navigate("/tutors")}
                    >
                        ← Back to Tutors
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="tutor-profile-page">

            <button
                className="back-button"
                onClick={() => navigate("/tutors")}
            >
                ← Back to Tutors
            </button>


            <div className="tutor-profile-card">

                {/* Profile Header */}

                <div className="tutor-profile-header">

                    <div className="large-tutor-avatar">

                        {tutor.user?.profileImage ? (
                            <img
                                src={tutor.user.profileImage}
                                alt={tutor.user.name}
                            />
                        ) : (
                            <span>
                                {tutor.user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "T"}
                            </span>
                        )}

                    </div>


                    <div className="tutor-profile-identity">

                        <span className="profile-label">
                            TUTOR PROFILE
                        </span>

                        <h1>
                            {tutor.user?.name || "Tutor"}
                        </h1>

                        <div className="profile-availability">
                            <span>●</span>
                            Available for tutoring
                        </div>

                    </div>

                </div>


                {/* Profile Body */}

                <div className="tutor-profile-body">

                    <div className="tutor-profile-main">

                        <section className="profile-section">

                            <span className="profile-section-label">
                                ABOUT
                            </span>

                            <h2>
                                About this tutor
                            </h2>

                            <p className="tutor-profile-bio">
                                {tutor.bio ||
                                    "This tutor hasn't added a bio yet."}
                            </p>

                        </section>


                        <section className="profile-section">

                            <span className="profile-section-label">
                                SUBJECTS
                            </span>

                            <h2>
                                What I can teach
                            </h2>

                            <div className="profile-subjects">

                                {tutor.subjects?.map(
                                    (subject) => (
                                        <span
                                            key={subject}
                                        >
                                            {subject}
                                        </span>
                                    )
                                )}

                            </div>

                        </section>

                    </div>


                    {/* Profile Sidebar */}

                    <aside className="tutor-profile-sidebar">

                        <div className="profile-stat">

                            <span>
                                Experience
                            </span>

                            <strong>
                                {tutor.experienceLevel}
                            </strong>

                        </div>


                        <div className="profile-stat">

                            <span>
                                Session Cost
                            </span>

                            <strong>
                                {tutor.hourlyCredits}
                                {" "}
                                credits/hr
                            </strong>

                        </div>


                        <div className="profile-stat">

                            <span>
                                Availability
                            </span>

                            <strong className="available-text">
                                ● Available
                            </strong>

                        </div>


                        <button
                            className="request-session-button"
                            onClick={() => {
                                setShowRequestForm(
                                    !showRequestForm
                                );

                                setRequestStatus("");
                            }}
                        >
                            {showRequestForm
                                ? "Close Request"
                                : "Request Tutoring Session"}
                        </button>

                        {requestStatus && (
                            <div className="tutor-request-status">
                                {requestStatus}
                            </div>
                        )}

                        {showRequestForm && (
                            <div className="tutor-request-form">

                                <h3>
                                    Request a Tutoring Session
                                </h3>

                                <label>
                                    Subject
                                </label>

                                <select
                                    value={selectedSubject}
                                    onChange={(e) =>
                                        setSelectedSubject(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        Select a subject
                                    </option>

                                    {tutor.subjects?.map(
                                        (subject) => (
                                            <option
                                                key={subject}
                                                value={subject}
                                            >
                                                {subject}
                                            </option>
                                        )
                                    )}
                                </select>


                                <label>
                                    Duration
                                </label>

                                <select
                                    value={duration}
                                    onChange={(e) =>
                                        setDuration(
                                            Number(e.target.value)
                                        )
                                    }
                                >
                                    <option value={1}>
                                        1 hour
                                    </option>

                                    <option value={2}>
                                        2 hours
                                    </option>

                                    <option value={3}>
                                        3 hours
                                    </option>
                                </select>


                                <label>
                                    Message
                                </label>

                                <textarea
                                    placeholder="Tell the tutor what you want to learn..."
                                    value={requestMessage}
                                    onChange={(e) =>
                                        setRequestMessage(
                                            e.target.value
                                        )
                                    }
                                    maxLength={300}
                                />


                                <div className="request-cost">

                                    <span>
                                        Session cost
                                    </span>

                                    <strong>
                                        {totalCredits} credits
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    className="send-tutor-request-button"
                                    onClick={sendTutorRequest}
                                    disabled={sendingRequest}
                                >
                                    {sendingRequest
                                        ? "Sending..."
                                        : "Send Request"}
                                </button>

                            </div>
                        )}

                    </aside>

                </div>

            </div>

        </div>
    );
};

export default TutorProfile;