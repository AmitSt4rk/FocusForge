import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const STUDY_DURATION = 25 * 60;

    const [seconds, setSeconds] = useState(STUDY_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [activeSessionId, setActiveSessionId] = useState(null);
    const [startingSession, setStartingSession] = useState(false);

    const [studySessions, setStudySessions] = useState([]);
    const [creditBalance, setCreditBalance] = useState(0);
    const [loadingData, setLoadingData] = useState(true);

    const startStudySession = async () => {
        try {
            setStartingSession(true);

            const response = await api.post("/study/start", {
                subject: "General Study",
                duration: 25
            });

            setActiveSessionId(response.data.session._id);
            setSeconds(STUDY_DURATION);
            setIsPaused(false);
            setIsRunning(true);

            console.log("Study session started:", response.data);

        } catch (error) {
            console.error(
                "Start study session error:",
                error.response?.data || error.message
            );
        } finally {
            setStartingSession(false);
        }
    };

    useEffect(() => {
        if (!isRunning || isPaused) return;

        const timer = setInterval(() => {
            setSeconds((previous) => {
                if (previous <= 1) {
                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, isPaused]);

    useEffect(() => {
        if (
            seconds === 0 &&
            isRunning &&
            activeSessionId
        ) {
            setIsRunning(false);
            completeStudySession();
        }
    }, [seconds, isRunning, activeSessionId]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [studyResponse, creditResponse] = await Promise.all([
                    api.get("/study"),
                    api.get("/credits")
                ]);

                setStudySessions(studyResponse.data.sessions);
                setCreditBalance(creditResponse.data.balance);

            } catch (error) {
                console.error(
                    "Dashboard data error:",
                    error.response?.data || error.message
                );
            } finally {
                setLoadingData(false);
            }
        };

        fetchDashboardData();
    }, []);

    const completedSessions = studySessions.filter(
        (session) => session.completed
    );

    const totalStudyMinutes = completedSessions.reduce(
        (total, session) => total + session.duration,
        0
    );

    const formatTime = () => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    const completeStudySession = async () => {
        if (!activeSessionId) {
            console.log("No active study session.");
            return;
        }

        try {
            const response = await api.post(
                `/study/complete/${activeSessionId}`
            );

            console.log(
                "Study session completed:",
                response.data
            );

            setActiveSessionId(null);
            setIsRunning(false);
            setSeconds(STUDY_DURATION);

            // Refresh dashboard data
            const [studyResponse, creditResponse] =
                await Promise.all([
                    api.get("/study"),
                    api.get("/credits")
                ]);

            setStudySessions(studyResponse.data.sessions);
            setCreditBalance(creditResponse.data.balance);

        } catch (error) {
            console.error(
                "Complete study session error:",
                error.response?.data || error.message
            );
        }
    };

    const pauseTimer = () => {
        setIsPaused(true);
        setIsRunning(false);
    };

    const resumeTimer = () => {
        setIsPaused(false);
        setIsRunning(true);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setIsPaused(false);
        setSeconds(STUDY_DURATION);
        setActiveSessionId(null);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard">

            {/* Sidebar */}
            <aside className="sidebar">

                <div className="sidebar-logo">
                    <div className="logo-icon">F</div>

                    <div>
                        <h2>FocusForge</h2>
                        <span>Study smarter</span>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <button className="nav-item active">
                        <span>⌂</span>
                        Dashboard
                    </button>

                    <button className="nav-item">
                        <span>◷</span>
                        Study
                    </button>

                    <button className="nav-item">
                        <span>⇄</span>
                        Skill Exchange
                    </button>

                    <button className="nav-item">
                        <span>▣</span>
                        Bookings
                    </button>

                    <button className="nav-item">
                        <span>◎</span>
                        Profile
                    </button>

                </nav>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <span>↪</span>
                    Logout
                </button>

            </aside>

            {/* Main Content */}
            <main className="dashboard-main">

                {/* Header */}
                <header className="dashboard-header">

                    <div>
                        <p className="dashboard-label">
                            YOUR STUDY SPACE
                        </p>

                        <h1>
                            Good morning, {user?.name?.split(" ")[0]} 👋
                        </h1>

                        <p className="dashboard-subtitle">
                            Stay focused. Make progress. Learn together.
                        </p>
                    </div>

                    <div className="profile-mini">
                        <div className="profile-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user?.name}</strong>
                            <span>{user?.role}</span>
                        </div>
                    </div>

                </header>

                {/* Stats */}
                <section className="stats-grid">

                    <div className="stat-card">
                        <div className="stat-icon credits">
                            ◈
                        </div>

                        <div>
                            <span>Focus Credits</span>
                            <strong>
                                {loadingData ? "..." : creditBalance}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon study">
                            ◷
                        </div>

                        <div>
                            <span>Study Time</span>
                            <strong>
                                {loadingData ? "..." : `${totalStudyMinutes} min`}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon sessions">
                            ✓
                        </div>

                        <div>
                            <span>Completed Sessions</span>
                            <strong>
                                {loadingData ? "..." : completedSessions.length}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon bookings">
                            ▣
                        </div>

                        <div>
                            <span>Upcoming Bookings</span>
                            <strong>0</strong>
                        </div>
                    </div>

                </section>

                {/* Main Dashboard Grid */}
                <section className="dashboard-grid">

                    {/* Study Timer */}
                    <div className="timer-card">

                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    FOCUS SESSION
                                </span>

                                <h2>Study Timer</h2>
                            </div>

                            <span className="timer-status">
                                {isRunning ? "Focus mode" : "Ready"}
                            </span>
                        </div>

                        <div className="timer-display">
                            {formatTime()}
                        </div>

                        <p className="timer-description">
                            Focus for 25 minutes without distractions.
                        </p>

                        <div className="timer-actions">

                            {!isRunning && !isPaused && !activeSessionId && (
                                <button
                                    className="primary-button"
                                    onClick={startStudySession}
                                    disabled={startingSession}
                                >
                                    {startingSession ? "Starting..." : "Start Focus"}
                                </button>
                            )}

                            {isRunning && (
                                <button
                                    className="primary-button"
                                    onClick={pauseTimer}
                                >
                                    Pause
                                </button>
                            )}

                            {isPaused && (
                                <button
                                    className="primary-button"
                                    onClick={resumeTimer}
                                >
                                    Resume
                                </button>
                            )}

                            <button
                                className="secondary-button"
                                onClick={resetTimer}
                                disabled={!activeSessionId}
                            >
                                Reset
                            </button>

                        </div>

                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions-card">

                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    EXPLORE
                                </span>

                                <h2>Quick Actions</h2>
                            </div>
                        </div>

                        <div className="quick-actions">

                            <button className="quick-action">
                                <span>🔎</span>

                                <div>
                                    <strong>Find a Tutor</strong>
                                    <small>
                                        Get academic guidance
                                    </small>
                                </div>

                                <b>→</b>
                            </button>

                            <button className="quick-action">
                                <span>🤝</span>

                                <div>
                                    <strong>Skill Exchange</strong>
                                    <small>
                                        Share what you know
                                    </small>
                                </div>

                                <b>→</b>
                            </button>

                            <button className="quick-action">
                                <span>📅</span>

                                <div>
                                    <strong>My Bookings</strong>
                                    <small>
                                        View your sessions
                                    </small>
                                </div>

                                <b>→</b>
                            </button>

                        </div>

                    </div>

                </section>

                {/* Bottom Section */}
                <section className="bottom-grid">

                    <div className="recent-card">

                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    ACTIVITY
                                </span>

                                <h2>Recent Study Sessions</h2>
                            </div>

                            <button className="view-button">
                                View all
                            </button>
                        </div>

                        <div className="recent-sessions">
                            {loadingData ? (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        ◷
                                    </div>

                                    <h3>Loading sessions...</h3>

                                    <p>
                                        Fetching your study activity.
                                    </p>
                                </div>
                            ) : studySessions.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        ◷
                                    </div>

                                    <h3>No study sessions yet</h3>

                                    <p>
                                        Start your first focus session to
                                        begin earning Focus Credits.
                                    </p>

                                    <button
                                        className="primary-button"
                                        onClick={() => setIsRunning(true)}
                                    >
                                        Start Studying
                                    </button>
                                </div>
                            ) : (
                                studySessions.slice(0, 5).map((session) => (
                                    <div className="session-item" key={session._id}>
                                        <div>
                                            <h4>{session.subject}</h4>
                                            <p>{session.duration} min</p>
                                        </div>

                                        <div>
                                            <span
                                                className={`session-status ${session.status}`}
                                            >
                                                {session.status}
                                            </span>

                                            {session.completed && (
                                                <span className="session-credits">
                                                    +{session.creditsEarned} credit
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>

                    <div className="credits-card">

                        <div className="section-heading">
                            <div>
                                <span className="section-label">
                                    FOCUS CREDITS
                                </span>

                                <h2>Your Balance</h2>
                            </div>
                        </div>

                        <div className="credit-balance">
                            <span>◈</span>

                            <strong>
                                {user?.focusCredits ?? 0}
                            </strong>

                            <small>credits</small>
                        </div>

                        <p>
                            Complete productive study sessions
                            to earn credits that you can spend
                            on peer guidance.
                        </p>

                    </div>

                </section>

            </main>
        </div>
    );
};

export default Dashboard;