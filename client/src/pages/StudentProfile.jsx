import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/studentProfile.css";

const StudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedSkill, setSelectedSkill] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [requestStatus, setRequestStatus] = useState("");

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const response = await api.get(
                    `/skills/profile/${id}`
                );

                setStudent(response.data.student);
            } catch (error) {
                console.error(
                    "Student profile error:",
                    error.response?.data || error.message
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load student profile."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStudentProfile();
    }, [id]);

    const sendExchangeRequest = async () => {
        if (!selectedSkill) {
            setRequestStatus("Please select a skill.");
            return;
        }

        try {
            setSendingRequest(true);
            setRequestStatus("");

            await api.post(
                "/exchange-requests",
                {
                    receiverId: student._id,
                    skill: selectedSkill,
                    message: requestMessage.trim()
                }
            );

            setRequestStatus(
                "Exchange request sent successfully."
            );

            setSelectedSkill("");
            setRequestMessage("");

        } catch (error) {
            console.error(
                "Send exchange request error:",
                error.response?.data || error.message
            );

            setRequestStatus(
                error.response?.data?.message ||
                "Failed to send exchange request."
            );
        } finally {
            setSendingRequest(false);
        }
    };

    if (loading) {
        return (
            <div className="student-profile-loading">
                Loading profile...
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="student-profile-error">
                <h2>Profile unavailable</h2>

                <p>
                    {error || "Student profile could not be found."}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/skill-exchange")}
                >
                    ← Back to Skill Exchange
                </button>
            </div>
        );
    }

    return (
        <div className="student-profile-page">

            <button
                className="profile-back-button"
                type="button"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="student-profile-card">

                <div className="profile-hero">

                    <div className="profile-avatar">
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

                    <div className="profile-identity">
                        <span className="profile-eyebrow">
                            STUDENT PROFILE
                        </span>

                        <h1>{student.name}</h1>

                        <p>
                            {student.role || "Student"}
                        </p>
                    </div>

                </div>

                <div className="profile-divider" />

                <div className="profile-skills-grid">

                    <section className="profile-skill-section">

                        <div className="profile-section-icon">
                            🎓
                        </div>

                        <div>
                            <h2>Skills I Can Teach</h2>

                            <p>
                                Knowledge I can share with other
                                students.
                            </p>

                            <div className="profile-skill-tags">
                                {student.skillsToTeach?.length > 0 ? (
                                    student.skillsToTeach.map(
                                        (skill) => (
                                            <span
                                                key={skill}
                                                className="profile-skill-tag"
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )
                                ) : (
                                    <span className="profile-empty">
                                        No teaching skills listed.
                                    </span>
                                )}
                            </div>
                        </div>

                    </section>

                    <section className="profile-skill-section">

                        <div className="profile-section-icon learn">
                            📚
                        </div>

                        <div>
                            <h2>Skills I Want to Learn</h2>

                            <p>
                                Skills I'm interested in learning.
                            </p>

                            <div className="profile-skill-tags">
                                {student.skillsToLearn?.length > 0 ? (
                                    student.skillsToLearn.map(
                                        (skill) => (
                                            <span
                                                key={skill}
                                                className="profile-skill-tag learn"
                                            >
                                                {skill}
                                            </span>
                                        )
                                    )
                                ) : (
                                    <span className="profile-empty">
                                        No learning skills listed.
                                    </span>
                                )}
                            </div>
                        </div>

                    </section>

                </div>

                <div className="profile-action-section">

                    <div>
                        <h2>Want to learn from {student.name}?</h2>

                        <p>
                            Send an exchange request and start
                            learning together.
                        </p>
                    </div>

                    <div className="exchange-request-form">

                        <select
                            value={selectedSkill}
                            onChange={(e) =>
                                setSelectedSkill(e.target.value)
                            }
                        >
                            <option value="">
                                Select a skill
                            </option>

                            {student.skillsToTeach?.map((skill) => (
                                <option
                                    key={skill}
                                    value={skill}
                                >
                                    {skill}
                                </option>
                            ))}
                        </select>

                        <textarea
                            placeholder={`Message ${student.name}...`}
                            value={requestMessage}
                            onChange={(e) =>
                                setRequestMessage(e.target.value)
                            }
                            maxLength={300}
                        />

                        <button
                            type="button"
                            className="exchange-request-button"
                            onClick={sendExchangeRequest}
                            disabled={sendingRequest}
                        >
                            {sendingRequest
                                ? "Sending..."
                                : "Send Exchange Request"}
                        </button>

                    </div>

                    {requestStatus && (
                        <p className="exchange-request-status">
                            {requestStatus}
                        </p>
                    )}

                </div>

            </div>

        </div>
    );
};

export default StudentProfile;