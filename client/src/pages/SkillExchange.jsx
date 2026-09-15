import { useState } from "react";
import "../styles/skillExchange.css";

import TutorDiscovery from "../components/TutorDiscovery";
import TutorRequests from "../components/TutorRequests";

const SkillExchange = () => {
    const [activeTab, setActiveTab] = useState("discover");

    const tabs = [
        {
            id: "discover",
            label: "Discover",
            icon: "⌕",
        },
        {
            id: "skills",
            label: "My Skills",
            icon: "✦",
        },
        {
            id: "matches",
            label: "Matches",
            icon: "◇",
        },
        {
            id: "requests",
            label: "Requests",
            icon: "↔",
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "discover":
                return (
                    <section className="exchange-content-section">
                        <div className="content-heading">
                            <div>
                                <span className="skill-eyebrow">
                                    DISCOVER
                                </span>

                                <h2>
                                    Find your next learning connection.
                                </h2>

                                <p>
                                    Explore students who can teach what you
                                    want to learn and connect through
                                    FocusForge.
                                </p>
                            </div>

                            <div className="content-meta">
                                <span className="meta-dot"></span>
                                Peer tutors
                            </div>
                        </div>

                        <div className="exchange-panel">
                            <TutorDiscovery />
                        </div>
                    </section>
                );

            case "skills":
                return (
                    <section className="exchange-content-section">
                        <div className="content-heading">
                            <div>
                                <span className="skill-eyebrow">
                                    YOUR SKILLS
                                </span>

                                <h2>
                                    What can you teach?
                                </h2>

                                <p>
                                    Your skills help other students discover
                                    you and create meaningful learning
                                    connections.
                                </p>
                            </div>

                            <div className="content-meta">
                                <span className="meta-icon">✦</span>
                                Your learning profile
                            </div>
                        </div>

                        <div className="skills-placeholder">
                            <div className="placeholder-icon">
                                ✦
                            </div>

                            <h3>
                                Build your skill profile
                            </h3>

                            <p>
                                Add the skills you can teach and the subjects
                                you want to learn. This will help FocusForge
                                find better peer matches for you.
                            </p>

                            <div className="skill-placeholder-grid">
                                <div className="placeholder-card">
                                    <span className="placeholder-card-icon">
                                        ↑
                                    </span>

                                    <div>
                                        <strong>
                                            Skills I Teach
                                        </strong>

                                        <small>
                                            Share your knowledge with peers
                                        </small>
                                    </div>
                                </div>

                                <div className="placeholder-card">
                                    <span className="placeholder-card-icon">
                                        ↓
                                    </span>

                                    <div>
                                        <strong>
                                            Skills I Want to Learn
                                        </strong>

                                        <small>
                                            Tell others what you're exploring
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );

            case "matches":
                return (
                    <section className="exchange-content-section">
                        <div className="content-heading">
                            <div>
                                <span className="skill-eyebrow">
                                    MATCHES
                                </span>

                                <h2>
                                    People who could be a great fit.
                                </h2>

                                <p>
                                    Discover learning connections based on
                                    complementary skills and interests.
                                </p>
                            </div>

                            <div className="content-meta">
                                <span className="meta-dot match"></span>
                                Smart matching
                            </div>
                        </div>

                        <div className="matches-placeholder">
                            <div className="placeholder-icon match-icon">
                                ◇
                            </div>

                            <h3>
                                Your matches will appear here
                            </h3>

                            <p>
                                Once your teaching and learning skills are
                                connected to your profile, FocusForge can help
                                surface students who match your interests.
                            </p>

                            <button
                                className="placeholder-action"
                                onClick={() => setActiveTab("discover")}
                            >
                                Explore peer tutors
                                <span>→</span>
                            </button>
                        </div>
                    </section>
                );

            case "requests":
                return (
                    <section className="exchange-content-section">
                        <div className="content-heading">
                            <div>
                                <span className="skill-eyebrow">
                                    REQUESTS
                                </span>

                                <h2>
                                    Manage your learning connections.
                                </h2>

                                <p>
                                    Keep track of tutor requests you've sent
                                    and received.
                                </p>
                            </div>

                            <div className="content-meta">
                                <span className="meta-icon">↔</span>
                                Learning connections
                            </div>
                        </div>

                        <div className="exchange-panel">
                            <TutorRequests />
                        </div>
                    </section>
                );

            default:
                return null;
        }
    };

    return (
        <div className="skill-exchange-page">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="skill-exchange-header">

                <div className="skill-header-main">

                    <div className="skill-header-copy">

                        <span className="skill-eyebrow">
                            SKILL EXCHANGE
                        </span>

                        <p>
                            Discover people, exchange knowledge, and turn
                            your Focus Credits into meaningful learning.
                        </p>

                    </div>

                    <div className="skill-credit-card">

                        <div className="credit-card-icon">
                            ◈
                        </div>

                        <div>
                            <span>
                                FOCUS CREDITS
                            </span>

                            <strong>
                                Your learning currency
                            </strong>
                        </div>

                    </div>

                </div>


                {/* =================================================
                    INTERNAL NAVIGATION
                ================================================== */}

                <nav className="exchange-navigation">

                    <div className="exchange-tabs">

                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`exchange-tab ${activeTab === tab.id
                                        ? "active"
                                        : ""
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="exchange-tab-icon">
                                    {tab.icon}
                                </span>

                                <span>
                                    {tab.label}
                                </span>

                                {activeTab === tab.id && (
                                    <span className="tab-indicator"></span>
                                )}
                            </button>
                        ))}

                    </div>

                </nav>

            </header>


            {/* =====================================================
                PAGE CONTENT
            ====================================================== */}

            <main className="skill-exchange-content">

                {renderContent()}

            </main>

        </div>
    );
};

export default SkillExchange;