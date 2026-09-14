import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/tutor.css";

const Tutor = () => {
    const navigate = useNavigate();
    const [subject, setSubject] = useState("");
    const [tutors, setTutors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [message, setMessage] = useState("");
    const [pendingRequests, setPendingRequests] = useState(0);

    const fetchTutors = async (searchSubject = "") => {
        try {
            if (searchSubject) {
                setSearching(true);
            } else {
                setLoading(true);
            }

            setMessage("");

            const query = searchSubject.trim()
                ? `?subject=${encodeURIComponent(
                    searchSubject.trim()
                )}`
                : "";

            const response = await api.get(
                `/tutors/discover${query}`
            );

            setTutors(response.data.tutors || []);

            if (response.data.count === 0) {
                setMessage(
                    searchSubject.trim()
                        ? `No tutors found for ${searchSubject}.`
                        : "No tutors are available right now."
                );
            }

        } catch (error) {
            console.error(
                "Fetch tutors error:",
                error.response?.data || error.message
            );

            setTutors([]);
            setMessage(
                "Failed to load tutors."
            );

        } finally {
            setLoading(false);
            setSearching(false);
        }
    };

    useEffect(() => {
        fetchTutors();

        const fetchPendingRequests = async () => {
            try {
                const response = await api.get("/tutor-requests");

                const outgoing = response.data.outgoing || [];

                const pendingCount = outgoing.filter(
                    (request) => request.status === "pending"
                ).length;

                setPendingRequests(pendingCount);

            } catch (error) {
                console.error(
                    "Fetch pending tutor requests error:",
                    error.response?.data || error.message
                );
            }
        };

        fetchPendingRequests();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();

        fetchTutors(subject);
    };

    const clearSearch = () => {
        setSubject("");
        fetchTutors("");
    };

    return (
        <div className="tutor-page">

            <div className="tutor-header">

                <div>
                    <span className="tutor-eyebrow">
                        TUTOR SYSTEM
                    </span>

                    <h1>
                        Find the right tutor
                    </h1>

                    <p>
                        Learn from students who are
                        experienced in the skills you want
                        to master.
                    </p>
                </div>

                <button
                    type="button"
                    className="my-tutor-requests-button"
                    onClick={() =>
                        navigate("/tutor-requests")
                    }
                >
                    My Tutor Requests

                    {pendingRequests > 0 && (
                        <span className="pending-request-badge">
                            {pendingRequests}
                        </span>
                    )}

                    →
                </button>
            </div>


            {/* Search */}

            <section className="tutor-search-section">

                <form
                    className="tutor-search-form"
                    onSubmit={handleSearch}
                >

                    <input
                        type="text"
                        placeholder="Search by subject e.g. React, Python..."
                        value={subject}
                        onChange={(e) =>
                            setSubject(e.target.value)
                        }
                    />

                    <button
                        type="submit"
                        disabled={searching}
                    >
                        {searching
                            ? "Searching..."
                            : "Search Tutors"}
                    </button>

                    {subject && (
                        <button
                            type="button"
                            className="clear-search-button"
                            onClick={clearSearch}
                        >
                            Clear
                        </button>
                    )}

                </form>

            </section>


            {/* Results */}

            <section className="tutor-results-section">

                <div className="section-heading">

                    <div>
                        <h2>
                            Available Tutors
                        </h2>

                        <p>
                            {tutors.length} tutor
                            {tutors.length !== 1
                                ? "s"
                                : ""}{" "}
                            available
                        </p>
                    </div>

                </div>


                {loading ? (

                    <div className="tutor-message">
                        Loading tutors...
                    </div>

                ) : tutors.length === 0 ? (

                    <div className="tutor-empty-state">

                        <div className="empty-icon">
                            👨‍🏫
                        </div>

                        <h3>
                            No tutors found
                        </h3>

                        <p>
                            Try searching for another
                            subject.
                        </p>

                    </div>

                ) : (

                    <div className="tutor-grid">

                        {tutors.map((tutor) => (

                            <div
                                className="tutor-card"
                                key={tutor._id}
                            >

                                <div className="tutor-card-top">

                                    <div className="tutor-avatar">

                                        {tutor.user?.profileImage ? (

                                            <img
                                                src={
                                                    tutor.user
                                                        .profileImage
                                                }
                                                alt={
                                                    tutor.user
                                                        ?.name
                                                }
                                            />

                                        ) : (

                                            <span>
                                                {tutor.user?.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() ||
                                                    "T"}
                                            </span>

                                        )}

                                    </div>


                                    <div className="tutor-basic-info">

                                        <h3>
                                            {tutor.user?.name ||
                                                "Tutor"}
                                        </h3>

                                        <span className="availability-badge">
                                            ● Available
                                        </span>

                                    </div>

                                </div>


                                <p className="tutor-bio">
                                    {tutor.bio ||
                                        "This tutor hasn't added a bio yet."}
                                </p>


                                <div className="tutor-info-row">

                                    <div>
                                        <span>
                                            Experience
                                        </span>

                                        <strong>
                                            {
                                                tutor.experienceLevel
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Cost
                                        </span>

                                        <strong>
                                            {tutor.hourlyCredits} credits/hr
                                        </strong>
                                    </div>

                                </div>


                                <div className="tutor-subjects">

                                    {tutor.subjects?.map(
                                        (item) => (

                                            <span
                                                key={item}
                                            >
                                                {item}
                                            </span>

                                        )
                                    )}

                                </div>


                                <button
                                    type="button"
                                    className="view-tutor-button"
                                    onClick={() =>
                                        navigate(`/tutor/${tutor._id}`)
                                    }
                                >
                                    View Tutor →
                                </button>

                            </div>

                        ))}

                    </div>

                )}

                {message && tutors.length > 0 && (
                    <p className="tutor-search-message">
                        {message}
                    </p>
                )}

            </section>

        </div>
    );
};

export default Tutor;