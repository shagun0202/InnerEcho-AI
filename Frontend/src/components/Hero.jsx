import { FaShieldAlt, FaChartLine, FaBrain, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import meditation from "../assets/meditation.svg";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-white via-purple-50 to-green-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-8 py-16 lg:grid-cols-2">
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

        <div className="flex items-center justify-center">

  <div className="flex h-[430px] w-[430px] items-center justify-center rounded-full bg-gradient-to-br from-purple-100 via-white to-green-100 shadow-2xl">

    <img
      src={meditation}
      alt="Meditation"
      className="h-[350px] w-[350px] object-contain"
    />

  </div>

</div>

       

      

      </div>
    </section>
  );
}

export default Hero;