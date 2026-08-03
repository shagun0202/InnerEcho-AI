import { FaUserPlus, FaPen, FaBrain, FaChartLine } from "react-icons/fa";

const steps = [
  {
    icon: <FaUserPlus />,
    title: "Create Account",
    desc: "Register securely and start your personalized wellness journey."
  },
  {
    icon: <FaPen />,
    title: "Share Your Mood",
    desc: "Write your thoughts and feelings in the mood journal."
  },
  {
    icon: <FaBrain />,
    title: "AI Emotion Analysis",
    desc: "Our AI model analyzes your emotions and detects your mood."
  },
  {
    icon: <FaChartLine />,
    title: "Get Insights",
    desc: "Receive suggestions and track your emotional progress."
  }
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-purple-50">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-purple-700">
          How It Works
        </h2>
        <p className="text-gray-600 mt-2">
          Understand your emotions with AI-powered wellness support
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 px-10">
        {steps.map((step, index) => (
          <div 
            key={index}
            className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-xl transition"
          >
            <div className="text-4xl text-purple-600 flex justify-center mb-4">
              {step.icon}
            </div>

            <h3 className="font-semibold text-lg">
              {step.title}
            </h3>

            <p className="text-gray-600 mt-2">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;