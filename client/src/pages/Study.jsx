import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/study.css";

const STUDY_DURATION = 25 * 60;

const Study = () => {
    const navigate = useNavigate();
    const { user, login, token } = useAuth();

    const [seconds, setSeconds] = useState(STUDY_DURATION);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);
    const [earnedCredits, setEarnedCredits] = useState(0);
    const [completingSession, setCompletingSession] = useState(false);

    const [activeSessionId, setActiveSessionId] = useState(null);
    const [startingSession, setStartingSession] = useState(false);
    const [loading, setLoading] = useState(true);

    const [subject, setSubject] = useState("General Study");
    const [creditHistory, setCreditHistory] = useState([]);

    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const formatTime = () => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    /*
     * Load existing session
     * This allows the timer to survive a browser refresh.
     */
    useEffect(() => {
        const loadStudySession = async () => {
            try {
                const response = await api.get("/study");

                const sessions = response.data.sessions;

                const activeSession = sessions.find(
                    (session) =>
                        session.status === "active" ||
                        session.status === "paused"
                );

                if (!activeSession) {
                    setLoading(false);
                    return;
                }

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
                setSubject(activeSession.subject);
                setSeconds(remainingSeconds);

                if (activeSession.status === "paused") {
                    setIsPaused(true);
                    setIsRunning(false);
                } else {
                    setIsPaused(false);
                    setIsRunning(true);
                }

            } catch (error) {
                console.error(
                    "Study page loading error:",
                    error.response?.data || error.message
                );
            } finally {
                setLoading(false);
            }
        };

        loadStudySession();
    }, []);

    useEffect(() => {
        const loadCreditHistory = async () => {
            try {
                const response = await api.get("/credits");

                setCreditHistory(
                    response.data.transactions || []
                );

            } catch (error) {
                console.error(
                    "Credit history loading error:",
                    error.response?.data || error.message
                );
            }
        };

        loadCreditHistory();
    }, []);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                const response = await api.get(
                    "/study/analytics"
                );

                setAnalytics(
                    response.data.analytics
                );

            } catch (error) {
                console.error(
                    "Analytics loading error:",
                    error.response?.data || error.message
                );
            } finally {
                setAnalyticsLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    useEffect(() => {
        if (!isRunning || isPaused) {
            return;
        }

        const timer = setInterval(() => {
            setSeconds((previous) => {
                if (previous <= 1) {
                    clearInterval(timer);
                    completeStudySession();
                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, isPaused]);

    /*
     * Start session
     */
    const startStudySession = async () => {
        try {
            setStartingSession(true);

            const response = await api.post("/study/start", {
                subject,
                duration: 25
            });

            const session = response.data.session;

            setActiveSessionId(session._id);
            setSeconds(STUDY_DURATION);
            setIsPaused(false);
            setIsRunning(true);

        } catch (error) {
            console.error(
                "Start study session error:",
                error.response?.data || error.message
            );
        } finally {
            setStartingSession(false);
        }
    };

    /*
     * Pause
     */
    const pauseTimer = async () => {
        if (!activeSessionId) return;

        try {
            await api.post(
                `/study/pause/${activeSessionId}`
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

    /*
     * Resume
     */
    const resumeTimer = async () => {
        if (!activeSessionId) return;

        try {
            await api.post(
                `/study/resume/${activeSessionId}`
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

    /*
     * Cancel
     */
    const cancelStudySession = async () => {
        if (!activeSessionId) return;

        try {
            await api.post(
                `/study/cancel/${activeSessionId}`
            );

            setActiveSessionId(null);
            setIsRunning(false);
            setIsPaused(false);
            setSeconds(STUDY_DURATION);

        } catch (error) {
            console.error(
                "Cancel study session error:",
                error.response?.data || error.message
            );
        }
    };

    const completeStudySession = async () => {
        if (!activeSessionId || completingSession) return;

        try {
            setCompletingSession(true);

            const response = await api.post(
                `/study/complete/${activeSessionId}`
            );

            const creditResponse = await api.get("/credits");

            setCreditHistory(
                creditResponse.data.transactions || []
            );

            const newBalance = creditResponse.data.balance;

            setEarnedCredits(
                response.data.credits?.earned || 0
            );

            const updatedUser = {
                ...user,
                focusCredits: newBalance
            };

            login(updatedUser, token);

            setActiveSessionId(null);
            setIsRunning(false);
            setIsPaused(false);
            setSeconds(0);

            setSessionCompleted(true);

        } catch (error) {
            console.error(
                "Complete study session error:",
                error.response?.data || error.message
            );
        } finally {
            setCompletingSession(false);
        }
    };

    if (loading) {
        return (
            <div className="study-page">
                <div className="study-loading">
                    Loading your study workspace...
                </div>
            </div>
        );
    }

    return (
        <div className="study-page">

            {/* Header */}
            <header className="study-header">

                <button
                    className="back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Dashboard
                </button>

                <div className="study-credit-pill">
                    <span className="credit-icon">◈</span>

                    <div>
                        <strong>{user?.focusCredits ?? 0}</strong>
                        <small>Focus Credits</small>
                    </div>
                </div>

            </header>

            {/* Page Heading */}
            <section className="study-heading">

                <span className="section-label">
                    STUDY WORKSPACE
                </span>

                <h1>
                    Focus. Learn. Progress.
                </h1>

                <p>
                    Your distraction-free space for focused learning.
                </p>

            </section>

            {/* Workspace */}
            <main className="study-workspace">

                {sessionCompleted ? (

                    <section className="session-complete-card">

                        <div className="completion-icon">
                            ✓
                        </div>

                        <span className="section-label">
                            SESSION COMPLETE
                        </span>

                        <h2>
                            Great work.
                        </h2>

                        <p className="completion-message">
                            You stayed focused and completed your study session.
                        </p>

                        <div className="completion-reward">

                            <span>◈</span>

                            <div>
                                <strong>
                                    +{earnedCredits}
                                </strong>

                                <small>
                                    Focus Credits earned
                                </small>
                            </div>

                        </div>

                        <div className="completion-subject">
                            <strong>{subject}</strong>
                            <span>Focus session completed</span>
                        </div>

                        <button
                            className="primary-button"
                            onClick={() => {
                                setSessionCompleted(false);
                                setSeconds(STUDY_DURATION);
                            }}
                        >
                            Continue Focusing
                        </button>

                    </section>

                ) : (

                    <section
                        className={`study-timer-card ${isRunning ? "focus-active" : ""
                            }`}
                    >

                        <div className="timer-top">

                            <div>
                                <span className="section-label">
                                    CURRENT SESSION
                                </span>

                                <h2>{subject}</h2>
                            </div>

                            <span className="timer-status">
                                {isRunning
                                    ? "Focus Mode"
                                    : isPaused
                                        ? "Paused"
                                        : "Ready"}
                            </span>

                        </div>

                        <div className="timer-container">

                            <div className="study-timer">
                                {formatTime()}
                            </div>

                            <div className="timer-progress">
                                <div
                                    className="timer-progress-bar"
                                    style={{
                                        width: `${((STUDY_DURATION - seconds) /
                                            STUDY_DURATION) *
                                            100
                                            }%`
                                    }}
                                />
                            </div>

                        </div>

                        <p className="timer-message">
                            {isRunning
                                ? "Stay focused. You've got this."
                                : isPaused
                                    ? "Take a breath. Resume when you're ready."
                                    : "Ready to start a focused session?"}
                        </p>

                        <div className="study-actions">

                            {!activeSessionId && !isRunning && !isPaused && (
                                <button
                                    className="primary-button"
                                    onClick={startStudySession}
                                    disabled={startingSession}
                                >
                                    {startingSession
                                        ? "Starting..."
                                        : "Start Focus"}
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

                            {activeSessionId && (
                                <button
                                    className="secondary-button"
                                    onClick={cancelStudySession}
                                >
                                    End Session
                                </button>
                            )}

                        </div>

                    </section>
                )}

                {/* Session Info */}
                <aside className="study-info-card">

                    <span className="section-label">
                        FOCUSFORGE
                    </span>

                    <h2>
                        Focus now.
                        <br />
                        Learn together.
                    </h2>

                    <p>
                        Complete focused study sessions to earn
                        Focus Credits.
                    </p>

                    <div className="credit-explanation">

                        <div className="credit-step">
                            <span>01</span>

                            <div>
                                <strong>Focus</strong>
                                <p>Complete your study session.</p>
                            </div>
                        </div>

                        <div className="credit-line"></div>

                        <div className="credit-step">
                            <span>02</span>

                            <div>
                                <strong>Earn</strong>
                                <p>Receive Focus Credits.</p>
                            </div>
                        </div>

                        <div className="credit-line"></div>

                        <div className="credit-step">
                            <span>03</span>

                            <div>
                                <strong>Exchange</strong>
                                <p>Use credits for peer guidance.</p>
                            </div>
                        </div>

                    </div>

                </aside>

            </main>

            {/* Quick Subjects */}
            <section className="quick-subjects">

                <div>
                    <span className="section-label">
                        QUICK START
                    </span>

                    <h2>What are you studying?</h2>
                </div>

                <div className="subject-list">

                    {[
                        "General Study",
                        "DSA",
                        "React",
                        "JavaScript",
                        "DBMS"
                    ].map((item) => (
                        <button
                            key={item}
                            className={
                                subject === item
                                    ? "subject-button active"
                                    : "subject-button"
                            }
                            onClick={() => {
                                if (!activeSessionId) {
                                    setSubject(item);
                                }
                            }}
                            disabled={!!activeSessionId}
                        >
                            {item}
                        </button>
                    ))}

                </div>

            </section>

            <section className="credit-history-section">

                <div className="credit-history-header">

                    <div>
                        <span className="section-label">
                            FOCUS CREDITS
                        </span>

                        <h2>Your focus journey</h2>

                        <p>
                            Every completed session adds to your Focus Credits.
                        </p>
                    </div>

                    <div className="credit-history-balance">
                        <span>◈</span>

                        <div>
                            <strong>{user?.focusCredits ?? 0}</strong>
                            <small>Current balance</small>
                        </div>
                    </div>

                </div>

                <div className="credit-history-list">

                    {creditHistory.length === 0 ? (

                        <div className="credit-empty">
                            <span>◈</span>

                            <strong>
                                No credit activity yet
                            </strong>

                            <p>
                                Complete your first study session to start
                                earning Focus Credits.
                            </p>
                        </div>

                    ) : (

                        creditHistory.slice(0, 5).map((transaction) => (

                            <div
                                className="credit-history-item"
                                key={transaction._id}
                            >

                                <div className="credit-history-icon">
                                    {transaction.type === "earned"
                                        ? "+"
                                        : "−"}
                                </div>

                                <div className="credit-history-details">

                                    <strong>
                                        {transaction.description ||
                                            "Credit transaction"}
                                    </strong>

                                    <span>
                                        {transaction.studySession?.subject ||
                                            "FocusForge"}
                                    </span>

                                </div>

                                <div
                                    className={
                                        transaction.type === "earned"
                                            ? "credit-earned"
                                            : "credit-spent"
                                    }
                                >
                                    {transaction.type === "earned"
                                        ? "+"
                                        : "-"}
                                    {transaction.amount}
                                </div>

                            </div>

                        ))

                    )}

                </div>

            </section>

            {/* Focus Analytics */}
            <section className="focus-analytics-section">

                <div className="analytics-header">

                    <div>
                        <span className="section-label">
                            YOUR PROGRESS
                        </span>

                        <h2>
                            Focus Analytics
                        </h2>

                        <p>
                            See how your focused study time is building momentum.
                        </p>
                    </div>

                </div>

                {analyticsLoading ? (

                    <div className="analytics-loading">
                        Loading your progress...
                    </div>

                ) : analytics ? (

                    <>
                        <div className="analytics-stats">

                            <div className="analytics-stat-card">
                                <span>◷</span>

                                <div>
                                    <strong>
                                        {analytics.totalStudyMinutes}
                                    </strong>

                                    <small>
                                        Study Minutes
                                    </small>
                                </div>
                            </div>


                            <div className="analytics-stat-card">
                                <span>✓</span>

                                <div>
                                    <strong>
                                        {analytics.completedSessions}
                                    </strong>

                                    <small>
                                        Sessions Completed
                                    </small>
                                </div>
                            </div>


                            <div className="analytics-stat-card">
                                <span>◈</span>

                                <div>
                                    <strong>
                                        {analytics.totalCreditsEarned}
                                    </strong>

                                    <small>
                                        Credits Earned
                                    </small>
                                </div>
                            </div>

                        </div>


                        <div className="analytics-bottom-grid">

                            <div className="weekly-activity-card">

                                <div className="analytics-card-heading">

                                    <div>
                                        <span className="section-label">
                                            LAST 7 DAYS
                                        </span>

                                        <h3>
                                            Study Activity
                                        </h3>
                                    </div>

                                </div>


                                <div className="weekly-bars">

                                    {analytics.last7Days.map(
                                        (day) => {

                                            const maxMinutes =
                                                Math.max(
                                                    ...analytics.last7Days.map(
                                                        (item) =>
                                                            item.minutes
                                                    ),
                                                    1
                                                );

                                            const height =
                                                day.minutes === 0
                                                    ? 4
                                                    : Math.max(
                                                        (day.minutes /
                                                            maxMinutes) *
                                                        100,
                                                        8
                                                    );

                                            const date =
                                                new Date(
                                                    `${day.date}T00:00:00`
                                                );

                                            const dayName =
                                                date.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        weekday: "short"
                                                    }
                                                );

                                            return (
                                                <div
                                                    className="activity-day"
                                                    key={day.date}
                                                >

                                                    <div className="activity-bar-container">

                                                        <div
                                                            className="activity-bar"
                                                            style={{
                                                                height: `${height}%`
                                                            }}
                                                            title={`${day.minutes} minutes`}
                                                        ></div>

                                                    </div>

                                                    <span>
                                                        {dayName}
                                                    </span>

                                                    <small>
                                                        {day.minutes}m
                                                    </small>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            </div>


                            <div className="productive-day-card">

                                <span className="section-label">
                                    TOP DAY
                                </span>

                                <div className="productive-icon">
                                    🏆
                                </div>

                                <h3>
                                    {analytics.mostProductiveDay?.minutes || 0}
                                    <span> min</span>
                                </h3>

                                <p>
                                    Your most productive day this week
                                </p>

                                <strong>
                                    {analytics.mostProductiveDay
                                        ? new Date(
                                            `${analytics.mostProductiveDay.date}T00:00:00`
                                        ).toLocaleDateString(
                                            "en-US",
                                            {
                                                weekday: "long",
                                                month: "short",
                                                day: "numeric"
                                            }
                                        )
                                        : "No study data yet"}
                                </strong>

                            </div>

                        </div>
                    </>

                ) : (

                    <div className="analytics-empty">
                        No analytics available yet.
                    </div>

                )}

            </section>

        </div>
    );
};

export default Study;
