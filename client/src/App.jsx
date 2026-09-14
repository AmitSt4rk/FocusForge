import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Study from "./pages/Study";
import SkillExchange from "./pages/SkillExchange";
import StudentProfile from "./pages/StudentProfile";
import Tutor from "./pages/Tutor";
import TutorProfile from "./pages/TutorProfile";
import TutorRequests from "./pages/TutorRequests";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public route */}
                <Route path="/login" element={<Auth />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/study" element={<Study />} />
                    <Route path="/skill-exchange" element={<SkillExchange />} />
                    <Route path="/student/:id" element={<StudentProfile />} />
                    <Route path="/tutors" element={<Tutor />} />
                    <Route path="/tutor/:id" element={<TutorProfile />} />
                    <Route path="/tutor-requests" element={<TutorRequests />} />
                </Route>

                {/* Default route */}
                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;