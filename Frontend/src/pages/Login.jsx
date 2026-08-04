import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import loginIllustration from "../assets/meditation.svg";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Temporary login (Backend will be connected later)
    console.log("Login Data:", formData);

    // Navigate to Mood Journal
    navigate("/journal");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-green-50 px-6">
      <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

        {/* Left Section */}
        <div className="hidden flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-green-100 p-10 lg:flex">
          <img
            src={loginIllustration}
            alt="Login Illustration"
            className="w-80"
          />

          <h2 className="mt-8 text-3xl font-bold text-gray-800">
            Welcome Back!
          </h2>

          <p className="mt-4 text-center text-gray-600">
            Continue your wellness journey with MoodMentor.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center p-10">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md"
          >
            <h1 className="text-4xl font-bold text-gray-800">
              Login
            </h1>

            <p className="mt-2 text-gray-500">
              Sign in to your account
            </p>

            {/* Email */}
            <div className="mt-8">
              <label className="mb-2 block font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
              />
            </div>

            {/* Password */}
            <div className="mt-6">
              <label className="mb-2 block font-medium">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-500"
              />
            </div>

            {/* Forgot Password */}
            <div className="mt-3 text-right">
              <button
                type="button"
                className="text-sm text-purple-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="mt-8 w-full rounded-xl bg-purple-600 py-4 text-lg font-semibold text-white hover:bg-purple-700 transition"
            >
              Login
            </button>

            {/* Register */}
            <p className="mt-6 text-center text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-green-600 hover:underline"
              >
                Register
              </Link>
            </p>

            {/* Back Home */}
            <p className="mt-4 text-center">
              <Link
                to="/"
                className="text-sm text-gray-500 hover:text-purple-600"
              >
                ← Back to Home
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;