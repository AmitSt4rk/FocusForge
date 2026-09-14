import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/skillExchange.css";

const SkillExchange = () => {
    const navigate = useNavigate();
    const [skillsToTeach, setSkillsToTeach] = useState([]);
    const [skillsToLearn, setSkillsToLearn] = useState([]);

    const [teachInput, setTeachInput] = useState("");
    const [learnInput, setLearnInput] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [searchSkill, setSearchSkill] = useState("");
    const [students, setStudents] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchMessage, setSearchMessage] = useState("");

    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [requestMessage, setRequestMessage] = useState("");

    const fetchExchangeRequests = async () => {
        try {
            setRequestsLoading(true);

            const response = await api.get(
                "/exchange-requests"
            );

            setIncomingRequests(
                response.data.incoming || []
            );

            setOutgoingRequests(
                response.data.outgoing || []
            );

        } catch (error) {
            console.error(
                "Fetch exchange requests error:",
                error.response?.data || error.message
            );

            setRequestMessage(
                "Failed to load exchange requests."
            );
        } finally {
            setRequestsLoading(false);
        }
    };

    const updateRequestStatus = async (requestId, status) => {
        try {
            setRequestMessage("");

            await api.patch(
                `/exchange-requests/${requestId}/status`,
                {
                    status
                }
            );

            setIncomingRequests((currentRequests) =>
                currentRequests.map((request) =>
                    request._id === requestId
                        ? { ...request, status }
                        : request
                )
            );

            setRequestMessage(
                `Request ${status} successfully.`
            );

        } catch (error) {
            console.error(
                "Update request status error:",
                error.response?.data || error.message
            );

            setRequestMessage(
                error.response?.data?.message ||
                "Failed to update request."
            );
        }
    };

    // Load existing skills
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await api.get("/skills");

                setSkillsToTeach(response.data.skillsToTeach || []);
                setSkillsToLearn(response.data.skillsToLearn || []);
            } catch (error) {
                console.error(
                    "Fetch skills error:",
                    error.response?.data || error.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();
        fetchExchangeRequests();
    }, []);

    // Add teaching skill
    const addTeachingSkill = () => {
        const skill = teachInput.trim();

        if (!skill) return;

        if (skillsToTeach.includes(skill)) {
            setTeachInput("");
            return;
        }

        setSkillsToTeach([...skillsToTeach, skill]);
        setTeachInput("");
    };

    // Add learning skill
    const addLearningSkill = () => {
        const skill = learnInput.trim();

        if (!skill) return;

        if (skillsToLearn.includes(skill)) {
            setLearnInput("");
            return;
        }

        setSkillsToLearn([...skillsToLearn, skill]);
        setLearnInput("");
    };

    // Remove teaching skill
    const removeTeachingSkill = (skillToRemove) => {
        setSkillsToTeach(
            skillsToTeach.filter(
                (skill) => skill !== skillToRemove
            )
        );
    };

    // Remove learning skill
    const removeLearningSkill = (skillToRemove) => {
        setSkillsToLearn(
            skillsToLearn.filter(
                (skill) => skill !== skillToRemove
            )
        );
    };

    // Discover students by skill
    const discoverStudents = async () => {
        const skill = searchSkill.trim();

        if (!skill) {
            setSearchMessage("Please enter a skill to search.");
            setStudents([]);
            return;
        }

        try {
            setSearching(true);
            setSearchMessage("");

            const response = await api.get(
                `/skills/discover?skill=${encodeURIComponent(skill)}`
            );

            setStudents(response.data.students || []);

            if (response.data.count === 0) {
                setSearchMessage(
                    `No students found who can teach ${skill}.`
                );
            }
        } catch (error) {
            console.error(
                "Discover students error:",
                error.response?.data || error.message
            );

            setStudents([]);
            setSearchMessage("Failed to discover students.");
        } finally {
            setSearching(false);
        }
    };

    // Save skills
    const saveSkills = async () => {
        try {
            setSaving(true);
            setMessage("");

            await api.put("/skills", {
                skillsToTeach,
                skillsToLearn
            });

            setMessage("Skills saved successfully.");
        } catch (error) {
            console.error(
                "Save skills error:",
                error.response?.data || error.message
            );

            setMessage("Failed to save skills.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="skill-page-loading">
                Loading your skills...
            </div>
        );
    }

    return (
        <div className="skill-exchange-page">

            <div className="skill-page-header">
                <div>
                    <span className="skill-eyebrow">
                        SKILL EXCHANGE
                    </span>

                    <h1>Share what you know.</h1>

                    <p>
                        Teach your strengths, discover what you want
                        to learn, and connect with other students.
                    </p>
                </div>
            </div>


            <div className="skills-editor-grid">

                {/* Skills I Can Teach */}
                <section className="skill-editor-card">
                    <div className="skill-card-heading">
                        <div className="skill-icon teach-icon">
                            🎓
                        </div>

                        <div>
                            <h2>I Can Teach</h2>
                            <p>
                                Skills you can share with others.
                            </p>
                        </div>
                    </div>

                    <div className="skill-input-row">
                        <input
                            type="text"
                            placeholder="e.g. React"
                            value={teachInput}
                            onChange={(e) =>
                                setTeachInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    addTeachingSkill();
                                }
                            }}
                        />

                        <button
                            type="button"
                            onClick={addTeachingSkill}
                        >
                            Add
                        </button>
                    </div>

                    <div className="skill-tags">
                        {skillsToTeach.length === 0 ? (
                            <span className="empty-skills">
                                No teaching skills added yet.
                            </span>
                        ) : (
                            skillsToTeach.map((skill) => (
                                <div
                                    className="skill-tag"
                                    key={skill}
                                >
                                    <span>{skill}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeTeachingSkill(skill)
                                        }
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>


                {/* Skills I Want to Learn */}
                <section className="skill-editor-card">
                    <div className="skill-card-heading">
                        <div className="skill-icon learn-icon">
                            📚
                        </div>

                        <div>
                            <h2>I Want to Learn</h2>
                            <p>
                                Skills you want to learn from others.
                            </p>
                        </div>
                    </div>

                    <div className="skill-input-row">
                        <input
                            type="text"
                            placeholder="e.g. Python"
                            value={learnInput}
                            onChange={(e) =>
                                setLearnInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    addLearningSkill();
                                }
                            }}
                        />

                        <button
                            type="button"
                            onClick={addLearningSkill}
                        >
                            Add
                        </button>
                    </div>

                    <div className="skill-tags">
                        {skillsToLearn.length === 0 ? (
                            <span className="empty-skills">
                                No learning skills added yet.
                            </span>
                        ) : (
                            skillsToLearn.map((skill) => (
                                <div
                                    className="skill-tag"
                                    key={skill}
                                >
                                    <span>{skill}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeLearningSkill(skill)
                                        }
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </section>

            </div>


            <div className="skill-save-section">

                {message && (
                    <span className="skill-save-message">
                        {message}
                    </span>
                )}

                <button
                    className="save-skills-button"
                    type="button"
                    onClick={saveSkills}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Skills"}
                </button>

            </div>

            {/* Discover Students */}
            <section className="discover-section">

                <div className="discover-header">
                    <div>
                        <span className="skill-eyebrow">
                            DISCOVER
                        </span>

                        <h2>Find students who can teach you.</h2>

                        <p>
                            Search for a skill and connect with students
                            who already know it.
                        </p>
                    </div>
                </div>

                <div className="discover-search">

                    <input
                        type="text"
                        placeholder="What do you want to learn? e.g. Python"
                        value={searchSkill}
                        onChange={(e) =>
                            setSearchSkill(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                discoverStudents();
                            }
                        }}
                    />

                    <button
                        type="button"
                        onClick={discoverStudents}
                        disabled={searching}
                    >
                        {searching ? "Searching..." : "Search"}
                    </button>

                </div>

                {searchMessage && (
                    <p className="discover-message">
                        {searchMessage}
                    </p>
                )}

                {students.length > 0 && (
                    <div className="student-results">

                        <div className="results-count">
                            Found {students.length} student
                            {students.length !== 1 ? "s" : ""}
                        </div>

                        <div className="student-grid">

                            {students.map((student) => (
                                <div
                                    className="student-card"
                                    key={student._id}
                                >

                                    <div className="student-card-top">

                                        <div className="student-avatar">
                                            {student.profileImage ? (
                                                <img
                                                    src={student.profileImage}
                                                    alt={student.name}
                                                />
                                            ) : (
                                                <span>
                                                    {student.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3>{student.name}</h3>

                                            <span className="student-role">
                                                {student.role || "Student"}
                                            </span>
                                        </div>

                                    </div>

                                    <div className="student-skills">

                                        <div>
                                            <span className="skills-label">
                                                Can teach
                                            </span>

                                            <div className="mini-skill-tags">
                                                {student.skillsToTeach?.map(
                                                    (skill) => (
                                                        <span
                                                            key={skill}
                                                            className="mini-skill-tag"
                                                        >
                                                            {skill}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="skills-label">
                                                Wants to learn
                                            </span>

                                            <div className="mini-skill-tags">
                                                {student.skillsToLearn?.map(
                                                    (skill) => (
                                                        <span
                                                            key={skill}
                                                            className="mini-skill-tag learn"
                                                        >
                                                            {skill}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        className="view-profile-button"
                                        onClick={() =>
                                            navigate(`/student/${student._id}`)
                                        }
                                    >
                                        View Profile →
                                    </button>

                                </div>
                            ))}

                        </div>
                    </div>
                )}

            </section>

            {/* Incoming Requests */}
            <section className="requests-section">

                <div className="requests-header">
                    <div>
                        <span className="skill-eyebrow">
                            REQUESTS
                        </span>

                        <h2>Incoming Requests</h2>

                        <p>
                            Students who want to learn from you.
                        </p>
                    </div>

                    <span className="request-count">
                        {incomingRequests.length}
                    </span>
                </div>

                {requestsLoading ? (
                    <p className="requests-message">
                        Loading requests...
                    </p>
                ) : incomingRequests.length === 0 ? (
                    <p className="requests-message">
                        No incoming requests yet.
                    </p>
                ) : (
                    <div className="request-list">

                        {incomingRequests.map((request) => (
                            <div
                                className="request-card"
                                key={request._id}
                            >

                                <div className="request-user">

                                    <div className="request-avatar">
                                        {request.sender?.profileImage ? (
                                            <img
                                                src={request.sender.profileImage}
                                                alt={request.sender.name}
                                            />
                                        ) : (
                                            <span>
                                                {request.sender?.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3>
                                            {request.sender?.name}
                                        </h3>

                                        <span>
                                            {request.sender?.role ||
                                                "Student"}
                                        </span>
                                    </div>

                                </div>

                                <div className="request-details">

                                    <strong>
                                        Wants to learn:
                                    </strong>

                                    <span className="request-skill">
                                        {request.skill}
                                    </span>

                                    {request.message && (
                                        <p>
                                            "{request.message}"
                                        </p>
                                    )}

                                </div>

                                <div className="request-status-area">

                                    {request.status === "pending" ? (
                                        <div className="request-actions">

                                            <button
                                                type="button"
                                                className="accept-request-button"
                                                onClick={() =>
                                                    updateRequestStatus(
                                                        request._id,
                                                        "accepted"
                                                    )
                                                }
                                            >
                                                Accept
                                            </button>

                                            <button
                                                type="button"
                                                className="reject-request-button"
                                                onClick={() =>
                                                    updateRequestStatus(
                                                        request._id,
                                                        "rejected"
                                                    )
                                                }
                                            >
                                                Reject
                                            </button>

                                        </div>
                                    ) : (
                                        <span
                                            className={`request-status ${request.status}`}
                                        >
                                            {request.status}
                                        </span>
                                    )}

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>


            {/* Outgoing Requests */}
            <section className="requests-section">

                <div className="requests-header">
                    <div>
                        <span className="skill-eyebrow">
                            MY ACTIVITY
                        </span>

                        <h2>Outgoing Requests</h2>

                        <p>
                            Requests you have sent to other students.
                        </p>
                    </div>

                    <span className="request-count">
                        {outgoingRequests.length}
                    </span>
                </div>

                {requestsLoading ? (
                    <p className="requests-message">
                        Loading requests...
                    </p>
                ) : outgoingRequests.length === 0 ? (
                    <p className="requests-message">
                        You haven't sent any requests yet.
                    </p>
                ) : (
                    <div className="request-list">

                        {outgoingRequests.map((request) => (
                            <div
                                className="request-card"
                                key={request._id}
                            >

                                <div className="request-user">

                                    <div className="request-avatar">
                                        {request.receiver?.profileImage ? (
                                            <img
                                                src={request.receiver.profileImage}
                                                alt={request.receiver.name}
                                            />
                                        ) : (
                                            <span>
                                                {request.receiver?.name
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3>
                                            {request.receiver?.name}
                                        </h3>

                                        <span>
                                            {request.receiver?.role ||
                                                "Student"}
                                        </span>
                                    </div>

                                </div>

                                <div className="request-details">

                                    <strong>
                                        Skill:
                                    </strong>

                                    <span className="request-skill">
                                        {request.skill}
                                    </span>

                                    {request.message && (
                                        <p>
                                            "{request.message}"
                                        </p>
                                    )}

                                </div>

                                <div className="request-status-area">

                                    <span
                                        className={`request-status ${request.status}`}
                                    >
                                        {request.status}
                                    </span>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>

        </div>
    );
};

export default SkillExchange;