import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/dashboard.css";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const DEFAULT_STUDY_DURATION = 45 * 60;

    const [seconds, setSeconds] = useState(DEFAULT_STUDY_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [activeSessionId, setActiveSessionId] = useState(null);
    const [activeSessionDuration, setActiveSessionDuration] = useState(45);
    const [startingSession, setStartingSession] = useState(false);

    const [studySessions, setStudySessions] = useState([]);
    const [creditBalance, setCreditBalance] = useState(0);
    const [upcomingBookings, setUpcomingBookings] = useState(0);
    const [loadingData, setLoadingData] = useState(true);

    const startStudySession = async () => {
        try {
            setStartingSession(true);

            const response = await api.post("/study/start", {
                subject: "General Study",
                duration: 45
            });

            const session = response.data.session;

            setActiveSessionId(session._id);
            setActiveSessionDuration(session.duration);
            setSeconds(session.duration * 60);
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
                const [studyResponse, creditResponse, bookingsResponse] =
                    await Promise.all([
                        api.get("/study"),
                        api.get("/credits"),
                        api.get("/bookings")
                    ]);

                const sessions = studyResponse.data.sessions;

                setStudySessions(sessions);
                setCreditBalance(creditResponse.data.balance);

                const upcomingCount = (
                    bookingsResponse.data.bookings || []
                ).filter(
                    (booking) =>
                        booking.status === "confirmed" &&
                        new Date(booking.scheduledAt) > new Date()
                ).length;

                setUpcomingBookings(upcomingCount);

                const activeSession = sessions.find(
                    (session) =>
                        session.status === "active" ||
                        session.status === "paused"
                );

                if (activeSession) {
                    const startTime = new Date(
                        activeSession.startTime
                    ).getTime();

                    const now = Date.now();

                    const elapsedSeconds = Math.floor(
                        (now - startTime) / 1000
                    );

                    const totalPausedSeconds =
                        activeSession.totalPausedSeconds || 0;

                    let activeElapsedSeconds =
                        elapsedSeconds - totalPausedSeconds;

                    if (
                        activeSession.status === "paused" &&
                        activeSession.pausedAt
                    ) {
                        const pausedAt = new Date(
                            activeSession.pausedAt
                        ).getTime();

                        const currentPauseSeconds = Math.floor(
                            (now - pausedAt) / 1000
                        );

                        activeElapsedSeconds -= currentPauseSeconds;
                    }

                    const totalSeconds =
                        activeSession.duration * 60;

                    const remainingSeconds = Math.max(
                        totalSeconds - activeElapsedSeconds,
                        0
                    );

                    setActiveSessionId(activeSession._id);
                    setActiveSessionDuration(activeSession.duration);
                    setSeconds(remainingSeconds);

                    if (activeSession.status === "paused") {
                        setIsPaused(true);
                        setIsRunning(false);
                    } else {
                        setIsPaused(false);
                        setIsRunning(true);
                    }
                } else {
                    setActiveSessionId(null);
                    setIsRunning(false);
                    setIsPaused(false);
                }
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
            setActiveSessionDuration(25);
            setIsRunning(false);
            setIsPaused(false);
            setSeconds(DEFAULT_STUDY_DURATION);

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

    const cancelStudySession = async () => {
        if (!activeSessionId) {
            return;
        }

        try {
            const response = await api.post(
                `/study/cancel/${activeSessionId}`
            );

            console.log(
                "Study session cancelled:",
                response.data
            );

            setIsRunning(false);
            setIsPaused(false);
            setActiveSessionId(null);
            setActiveSessionDuration(25);
            setSeconds(DEFAULT_STUDY_DURATION);

            const [studyResponse, creditResponse] =
                await Promise.all([
                    api.get("/study"),
                    api.get("/credits")
                ]);

            setStudySessions(studyResponse.data.sessions);
            setCreditBalance(creditResponse.data.balance);

        } catch (error) {
            console.error(
                "Cancel study session error:",
                error.response?.data || error.message
            );
        }
    };

    const pauseTimer = async () => {
        if (!activeSessionId) {
            return;
        }

        try {
            const response = await api.post(
                `/study/pause/${activeSessionId}`
            );

            console.log(
                "Study session paused:",
                response.data
            );

            setIsPaused(true);
            setIsRunning(false);

        } catch (error) {
            console.error(
                "Pause study session error:",
                error.response?.data || error.message
            );
        }
    };

    const resumeTimer = async () => {
        if (!activeSessionId) {
            return;
        }

        try {
            const response = await api.post(
                `/study/resume/${activeSessionId}`
            );

            console.log(
                "Study session resumed:",
                response.data
            );

            setIsPaused(false);
            setIsRunning(true);

        } catch (error) {
            console.error(
                "Resume study session error:",
                error.response?.data || error.message
            );
        }
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

                    <button
                        className="nav-item"
                        onClick={() => navigate("/study")}
                    >
                        <span>◷</span>
                        Study
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/skill-exchange")}
                    >
                        <span>⇄</span>
                        Skill Exchange
                    </button>

                    <button
                        className="nav-item"
                        type="button"
                        onClick={() => navigate("/bookings")}
                    >
                        <span>▣</span>
                        Bookings
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => navigate("/profile")}
                    >
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
                            <strong>
                                {loadingData ? "..." : upcomingBookings}
                            </strong>
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
                            {activeSessionId
                                ? `Focus session • ${activeSessionDuration} minutes`
                                : "Start a focused study session without distractions."
                            }
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
                                onClick={cancelStudySession}
                                disabled={!activeSessionId}
                            >
                                Cancel Session
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

                            <button
                                className="quick-action"
                                onClick={() => navigate("/skill-exchange")}
                            >
                                <span>🔎</span>

                                <div>
                                    <strong>Find a Tutor</strong>
                                    <small>
                                        Get academic guidance
                                    </small>
                                </div>

                                <b>→</b>
                            </button>

                            <button
                                className="quick-action"
                                onClick={() => navigate("/skill-exchange")}
                            >
                                <span>🤝</span>

                                <div>
                                    <strong>Skill Exchange</strong>
                                    <small>
                                        Share what you know
                                    </small>
                                </div>

                                <b>→</b>
                            </button>

                            <button
                                className="quick-action"
                                onClick={() => navigate("/bookings")}
                            >
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

            </main>
        </div>
    );
};

export default Dashboard;