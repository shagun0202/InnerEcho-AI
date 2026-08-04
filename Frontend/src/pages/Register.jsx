import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaBrain } from "react-icons/fa";
import registerIllustration from "../assets/register-illustration.svg";

function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    // Temporary Registration
    alert("Registration Successful!");

    // Redirect to Login Page
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-green-100 flex items-center justify-center px-6">

      <div className="grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full">

        {/* Left Section */}
        <div className="bg-gradient-to-br from-purple-700 to-indigo-700 text-white p-12 flex flex-col justify-center">

          <div className="flex items-center gap-3 mb-6">
            <FaBrain className="text-4xl" />
            <h1 className="text-4xl font-bold">MoodMentor</h1>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Start Your Wellness Journey
          </h2>

          <p className="text-lg text-purple-100 leading-8">
            Join MoodMentor to track your emotions, receive AI-powered
            recommendations, and improve your mental well-being with
            personalized insights.
          </p>

          <div className="mt-10">
            <img
              src={registerIllustration}
              alt="Employee Wellness"
              className="w-full h-auto"
            />
          </div>

        </div>

        {/* Right Section */}
        <div className="p-12">

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create Account
          </h2>

          <p className="text-gray-500 mb-8">
            Fill in your details to get started.
          </p>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* Full Name */}
            <div className="relative">
              <FaUser className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <FaLock className="absolute left-4 top-4 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm Password"
                required
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-lg font-semibold text-white transition hover:scale-105"
            >
              Create Account
            </button>

          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-purple-600 hover:underline"
            >
              Login
            </Link>
          </p>

          {/* Back to Home */}
          <p className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-purple-600"
            >
              ← Back to Home
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;