import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/profile.css";

const Profile = () => {
    const { user, login } = useAuth();

    const [skillsToTeach, setSkillsToTeach] = useState([]);
    const [skillsToLearn, setSkillsToLearn] = useState([]);

    const [teachInput, setTeachInput] = useState("");
    const [learnInput, setLearnInput] = useState("");

    const [loadingSkills, setLoadingSkills] = useState(true);
    const [savingSkills, setSavingSkills] = useState(false);
    const [skillMessage, setSkillMessage] = useState("");

    const [profileName, setProfileName] = useState(user?.name || "");
    const [profileImage, setProfileImage] = useState(
        user?.profileImage || ""
    );

    const [editingProfile, setEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");

    // Load existing skills
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await api.get("/skills");

                setSkillsToTeach(
                    response.data.skillsToTeach || []
                );

                setSkillsToLearn(
                    response.data.skillsToLearn || []
                );
            } catch (error) {
                console.error(
                    "Fetch skills error:",
                    error.response?.data || error.message
                );
            } finally {
                setLoadingSkills(false);
            }
        };

        fetchSkills();
    }, []);

    // Add teaching skill
    const addTeachingSkill = () => {
        const skill = teachInput.trim();

        if (!skill) return;

        if (skillsToTeach.includes(skill)) {
            setTeachInput("");
            return;
        }

        setSkillsToTeach([
            ...skillsToTeach,
            skill
        ]);

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

        setSkillsToLearn([
            ...skillsToLearn,
            skill
        ]);

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

    // Save skills
    const saveSkills = async () => {
        try {
            setSavingSkills(true);
            setSkillMessage("");

            await api.put("/skills", {
                skillsToTeach,
                skillsToLearn
            });

            setSkillMessage(
                "Skills saved successfully."
            );
        } catch (error) {
            console.error(
                "Save skills error:",
                error.response?.data || error.message
            );

            setSkillMessage(
                "Failed to save skills."
            );
        } finally {
            setSavingSkills(false);
        }
    };

    // Save profile
    const saveProfile = async () => {
        try {
            setSavingProfile(true);
            setProfileMessage("");

            const response = await api.put("/auth/profile", {
                name: profileName,
                profileImage
            });

            const updatedUser = response.data.user;

            login(updatedUser, localStorage.getItem("token"));

            setProfileName(updatedUser.name);
            setProfileImage(updatedUser.profileImage || "");

            setProfileMessage("Profile updated successfully.");
            setEditingProfile(false);

        } catch (error) {
            console.error(
                "Save profile error:",
                error.response?.data || error.message
            );

            setProfileMessage(
                error.response?.data?.message ||
                "Failed to update profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">

                {/* PROFILE HEADER */}

                <div className="profile-header">

                    <div className="profile-identity">

                        <div className="profile-avatar">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user?.name || "Profile"}
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                        e.currentTarget.parentElement
                                            .querySelector(".profile-avatar-fallback")
                                            .style.display = "flex";
                                    }}
                                />
                            ) : null}

                            <span
                                className="profile-avatar-fallback"
                                style={{
                                    display: user?.profileImage ? "none" : "flex"
                                }}
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        <div className="profile-identity-info">

                            <span className="profile-eyebrow">
                                MY PROFILE
                            </span>

                            {editingProfile ? (
                                <div className="profile-edit-form">

                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) =>
                                            setProfileName(e.target.value)
                                        }
                                        placeholder="Your name"
                                    />

                                    <input
                                        type="text"
                                        value={profileImage}
                                        onChange={(e) =>
                                            setProfileImage(e.target.value)
                                        }
                                        placeholder="Profile image URL"
                                    />

                                    <div className="profile-edit-actions">

                                        <button
                                            type="button"
                                            onClick={saveProfile}
                                            disabled={savingProfile}
                                        >
                                            {savingProfile
                                                ? "Saving..."
                                                : "Save Profile"}
                                        </button>

                                        <button
                                            type="button"
                                            className="profile-cancel-button"
                                            onClick={() => {
                                                setProfileName(user?.name || "");
                                                setProfileImage(
                                                    user?.profileImage || ""
                                                );
                                                setProfileMessage("");
                                                setEditingProfile(false);
                                            }}
                                            disabled={savingProfile}
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </div>
                            ) : (
                                <>
                                    <h1>
                                        {user?.name || "User"}
                                    </h1>

                                    <p>
                                        {user?.email || "No email available"}
                                    </p>

                                    <span className="profile-status">
                                        <span className="profile-status-dot"></span>
                                        Active learner
                                    </span>

                                    <button
                                        type="button"
                                        className="profile-edit-button"
                                        onClick={() => {
                                            setProfileName(user?.name || "");
                                            setProfileImage(
                                                user?.profileImage || ""
                                            );
                                            setProfileMessage("");
                                            setEditingProfile(true);
                                        }}
                                    >
                                        Edit Profile
                                    </button>

                                </>
                            )}

                            {profileMessage && (
                                <span className="profile-message">
                                    {profileMessage}
                                </span>
                            )}

                        </div>

                    </div>

                </div>


                <div className="profile-stats">

                    <div className="profile-stat-card">

                        <span className="profile-stat-icon">
                            ✦
                        </span>

                        <div>
                            <span className="profile-stat-label">
                                FOCUS CREDITS
                            </span>

                            <strong>
                                {user?.focusCredits ?? 0}
                            </strong>
                        </div>

                    </div>


                    <div className="profile-stat-card">

                        <span className="profile-stat-icon">
                            🎓
                        </span>

                        <div>
                            <span className="profile-stat-label">
                                SKILLS TEACHING
                            </span>

                            <strong>
                                {skillsToTeach.length}
                            </strong>
                        </div>

                    </div>


                    <div className="profile-stat-card">

                        <span className="profile-stat-icon">
                            📚
                        </span>

                        <div>
                            <span className="profile-stat-label">
                                SKILLS LEARNING
                            </span>

                            <strong>
                                {skillsToLearn.length}
                            </strong>
                        </div>

                    </div>

                </div>
                {/* SKILLS */}

                <section className="profile-skills-section">

                    <div className="profile-section-heading">

                        <div>
                            <span className="profile-eyebrow">
                                LEARNING IDENTITY
                            </span>

                            <h2>
                                Your Skills
                            </h2>

                            <p>
                                Tell the FocusForge community
                                what you can teach and what
                                you want to learn.
                            </p>
                        </div>

                    </div>


                    {loadingSkills ? (
                        <div className="profile-skills-loading">
                            Loading your skills...
                        </div>
                    ) : (

                        <div className="profile-skills-grid">

                            {/* TEACH */}

                            <div className="profile-skill-card">

                                <div className="profile-skill-heading">

                                    <div className="profile-skill-icon">
                                        🎓
                                    </div>

                                    <div>
                                        <h3>
                                            I Can Teach
                                        </h3>

                                        <p>
                                            Skills you can
                                            share with others.
                                        </p>
                                    </div>

                                </div>


                                <div className="profile-skill-input">

                                    <input
                                        type="text"
                                        placeholder="e.g. React"
                                        value={teachInput}
                                        onChange={(e) =>
                                            setTeachInput(
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key ===
                                                "Enter"
                                            ) {
                                                addTeachingSkill();
                                            }
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addTeachingSkill
                                        }
                                    >
                                        Add
                                    </button>

                                </div>


                                <div className="profile-skill-tags">

                                    {skillsToTeach.length ===
                                        0 ? (
                                        <span className="profile-empty-skills">
                                            No teaching skills
                                            added yet.
                                        </span>
                                    ) : (
                                        skillsToTeach.map(
                                            (skill) => (
                                                <div
                                                    className="profile-skill-tag"
                                                    key={skill}
                                                >
                                                    <span>
                                                        {skill}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeTeachingSkill(
                                                                skill
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )
                                        )
                                    )}

                                </div>

                            </div>


                            {/* LEARN */}

                            <div className="profile-skill-card">

                                <div className="profile-skill-heading">

                                    <div className="profile-skill-icon">
                                        📚
                                    </div>

                                    <div>
                                        <h3>
                                            I Want to Learn
                                        </h3>

                                        <p>
                                            Skills you want
                                            to learn from others.
                                        </p>
                                    </div>

                                </div>


                                <div className="profile-skill-input">

                                    <input
                                        type="text"
                                        placeholder="e.g. Python"
                                        value={learnInput}
                                        onChange={(e) =>
                                            setLearnInput(
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key ===
                                                "Enter"
                                            ) {
                                                addLearningSkill();
                                            }
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addLearningSkill
                                        }
                                    >
                                        Add
                                    </button>

                                </div>


                                <div className="profile-skill-tags">

                                    {skillsToLearn.length ===
                                        0 ? (
                                        <span className="profile-empty-skills">
                                            No learning skills
                                            added yet.
                                        </span>
                                    ) : (
                                        skillsToLearn.map(
                                            (skill) => (
                                                <div
                                                    className="profile-skill-tag"
                                                    key={skill}
                                                >
                                                    <span>
                                                        {skill}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeLearningSkill(
                                                                skill
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )
                                        )
                                    )}

                                </div>

                            </div>

                        </div>
                    )}


                    <div className="profile-save-area">

                        {skillMessage && (
                            <span className="profile-save-message">
                                {skillMessage}
                            </span>
                        )}

                        <button
                            className="profile-save-button"
                            type="button"
                            onClick={saveSkills}
                            disabled={savingSkills}
                        >
                            {savingSkills
                                ? "Saving..."
                                : "Save Skills"}
                        </button>

                    </div>

                </section>

            </div>
        </div>
    );
};

export default Profile;