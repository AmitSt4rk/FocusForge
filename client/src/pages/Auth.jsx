import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Auth = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const endpoint = isLogin
                ? "http://localhost:5000/api/auth/login"
                : "http://localhost:5000/api/auth/register";

            const response = await axios.post(endpoint, formData);

            console.log("Authentication successful:", response.data);

            login(response.data.user, response.data.token);
            navigate("/dashboard");

            alert(
                isLogin
                    ? "Login successful!"
                    : "Registration successful!"
            );

            // We'll replace this with navigation to Dashboard
            // in Step 5.

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setError("");
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/google",
                {
                    credential: credentialResponse.credential
                }
            );

            console.log("Google authentication successful:", response.data);

            login(response.data.user, response.data.token);
            navigate("/dashboard");

            alert("Google login successful!");

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Google login failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">
                    <h1>FocusForge</h1>

                    <p>
                        {isLogin
                            ? "Welcome back! Stay focused."
                            : "Create your account and start focusing."}
                    </p>
                </div>

                <div className="auth-tabs">

                    <button
                        className={isLogin ? "active" : ""}
                        onClick={() => {
                            setIsLogin(true);
                            setError("");
                        }}
                    >
                        Login
                    </button>

                    <button
                        className={!isLogin ? "active" : ""}
                        onClick={() => {
                            setIsLogin(false);
                            setError("");
                        }}
                    >
                        Register
                    </button>

                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Name</label>

                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isLogin
                                ? "Login"
                                : "Create Account"}
                    </button>

                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="google-login">

                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            setError("Google Login Failed");
                        }}
                    />

                </div>

                <p className="auth-switch">

                    {isLogin
                        ? "Don't have an account?"
                        : "Already have an account?"}

                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                    >
                        {isLogin ? "Register" : "Login"}
                    </button>

                </p>

            </div>

        </div>
    );
};

export default Auth;