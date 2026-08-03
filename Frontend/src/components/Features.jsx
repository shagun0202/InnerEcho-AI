import {
  FaBrain,
  FaBookOpen,
  FaRobot,
  FaChartLine,
  FaHeartbeat,
  FaShieldAlt,
} from "react-icons/fa";

import FeatureCard from "./FeatureCard";

function Features() {

  const features = [
    {
      icon: <FaBrain className="text-purple-600" />,
      title: "AI Emotion Detection",
      description:
        "Analyze emotions using advanced NLP and transformer-based language models to identify stress, happiness, anxiety, sadness, and more.",
    },

    {
      icon: <FaBookOpen className="text-green-500" />,
      title: "Mood Journal",
      description:
        "Maintain a daily journal where employees can express thoughts, feelings, and emotions for intelligent mood tracking.",
    },

    {
      icon: <FaRobot className="text-pink-500" />,
      title: "AI Wellness Assistant",
      description:
        "Receive personalized wellness guidance, breathing exercises, motivational suggestions, and self-care recommendations.",
    },

    {
      icon: <FaChartLine className="text-blue-500" />,
      title: "Analytics Dashboard",
      description:
        "Visualize weekly and monthly emotional trends through beautiful charts and interactive reports.",
    },

    {
      icon: <FaHeartbeat className="text-red-500" />,
      title: "Stress Prediction",
      description:
        "Predict emotional stress levels using machine learning and notify users before burnout occurs.",
    },

    {
      icon: <FaShieldAlt className="text-indigo-600" />,
      title: "Secure & Private",
      description:
        "Your mood history and journal entries remain encrypted and securely stored with complete privacy protection.",
    },
  ];

  return (
    <section
      id="features"
      className="bg-gradient-to-b from-gray-50 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mb-16 text-center">

          <span className="rounded-full bg-purple-100 px-5 py-2 text-sm font-semibold text-purple-700">
            Our Features
          </span>

          <h2 className="mt-6 text-5xl font-bold text-gray-900">
            Everything You Need for Better Mental Wellness
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            MoodMentor combines Artificial Intelligence, Machine Learning,
            Sentiment Analysis, and Personalized Recommendations to help
            employees achieve better emotional well-being.
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;