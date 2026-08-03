import {
  FaBrain,
  FaHeartbeat,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";

function About() {
  return (
    <section id="about" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-16">
          <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
            About MoodMentor
          </span>

          <h2 className="text-5xl font-bold mt-6 text-gray-900">
            AI-Powered Employee Wellness Platform
          </h2>

          <p className="mt-6 text-lg text-gray-600 max-w-4xl mx-auto leading-8">
            MoodMentor helps employees understand their emotional well-being
            using Artificial Intelligence, Natural Language Processing, and
            Sentiment Analysis. It analyzes journal entries, detects emotions,
            and provides personalized wellness recommendations to support
            mental health and productivity.
          </p>
        </div>

        {/* About Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="bg-purple-50 p-8 rounded-3xl shadow hover:shadow-xl transition">
            <FaBrain className="text-5xl text-purple-600 mb-5" />
            <h3 className="text-xl font-bold mb-3">AI Emotion Detection</h3>
            <p className="text-gray-600">
              Detect emotions like happiness, stress, anxiety, sadness and
              frustration using transformer-based AI models.
            </p>
          </div>

          <div className="bg-green-50 p-8 rounded-3xl shadow hover:shadow-xl transition">
            <FaHeartbeat className="text-5xl text-green-600 mb-5" />
            <h3 className="text-xl font-bold mb-3">Wellness Guidance</h3>
            <p className="text-gray-600">
              Receive personalized suggestions including meditation,
              breathing exercises and motivational activities.
            </p>
          </div>

          <div className="bg-blue-50 p-8 rounded-3xl shadow hover:shadow-xl transition">
            <FaChartLine className="text-5xl text-blue-600 mb-5" />
            <h3 className="text-xl font-bold mb-3">Mood Analytics</h3>
            <p className="text-gray-600">
              Track weekly and monthly emotional trends through beautiful
              dashboards and interactive charts.
            </p>
          </div>

          <div className="bg-pink-50 p-8 rounded-3xl shadow hover:shadow-xl transition">
            <FaShieldAlt className="text-5xl text-pink-600 mb-5" />
            <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
            <p className="text-gray-600">
              Your journal entries and wellness data remain encrypted and
              protected to ensure complete privacy.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default About;