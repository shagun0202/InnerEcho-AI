import { FaShieldAlt, FaChartLine, FaBrain, FaLock } from "react-icons/fa";
import meditation from "../assets/meditation.svg";

function Hero() {
  return (
    <section className="bg-gradient-to-br from-white via-purple-50 to-green-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-8 py-16 lg:grid-cols-3">

        {/* Left Section */}
        <div className="flex flex-col justify-center">

          <span className="mb-6 w-fit rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
            💜 Empowering Employees. Enhancing Well-being.
          </span>

          <h1 className="text-6xl font-bold leading-tight text-gray-900">
            Better Minds.
            <br />
            Better Workplaces.
            <br />
            <span className="text-green-500">
              Stronger Together.
            </span>
          </h1>

          <p className="mt-8 text-lg leading-8 text-gray-600">
            MoodMentor is an AI-powered Employee Wellness platform that
            understands emotions, predicts stress, and provides personalized
            wellness recommendations.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-6">

            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-3xl text-green-500" />
              <span>Secure</span>
            </div>

            <div className="flex items-center gap-3">
              <FaChartLine className="text-3xl text-purple-600" />
              <span>Analytics</span>
            </div>

            <div className="flex items-center gap-3">
              <FaBrain className="text-3xl text-pink-500" />
              <span>AI Powered</span>
            </div>

            <div className="flex items-center gap-3">
              <FaLock className="text-3xl text-blue-500" />
              <span>Privacy First</span>
            </div>

          </div>

        </div>


        {/* Center Illustration */}
        <div className="flex items-center justify-center">

          <div className="flex h-[430px] w-[430px] items-center justify-center rounded-full bg-gradient-to-br from-purple-100 via-white to-green-100 shadow-2xl">

            <img
              src={meditation}
              alt="Meditation"
              className="h-[350px] w-[350px] object-contain"
            />

          </div>

        </div>


        {/* Right Login Card */}
        <div className="flex items-center justify-center">

          <div className="w-full rounded-3xl bg-white p-8 shadow-xl">

            <h2 className="mb-2 text-center text-3xl font-bold">
              Welcome Back!
            </h2>

            <p className="mb-8 text-center text-gray-500">
              Login to continue
            </p>

            <input
              type="email"
              placeholder="Email"
              className="mb-4 w-full rounded-xl border p-4"
            />

            <input
              type="password"
              placeholder="Password"
              className="mb-6 w-full rounded-xl border p-4"
            />

            <button className="w-full rounded-xl bg-purple-600 py-4 font-semibold text-white hover:bg-purple-700">
              Login
            </button>

            <button className="mt-4 w-full rounded-xl bg-green-500 py-4 font-semibold text-white hover:bg-green-600">
              Register Now
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;