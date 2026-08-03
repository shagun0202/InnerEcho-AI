import { 
  FaBrain, 
  FaChartLine, 
  FaRobot, 
  FaLock, 
  FaLeaf 
} from "react-icons/fa";

const benefits = [
  {
    icon: <FaBrain />,
    title: "Better Mental Awareness",
    desc: "Understand your emotions and identify mood patterns."
  },
  {
    icon: <FaChartLine />,
    title: "Data-Driven Insights",
    desc: "Analyze mood trends with AI-powered analytics."
  },
  {
    icon: <FaRobot />,
    title: "AI-Powered Support",
    desc: "Receive personalized wellness recommendations."
  },
  {
    icon: <FaLock />,
    title: "Privacy & Security",
    desc: "Your wellness information stays secure."
  },
  {
    icon: <FaLeaf />,
    title: "Improved Productivity",
    desc: "Build a healthier and balanced work environment."
  }
];

function Benefits() {
  return (
    <section id="benefits" className="py-16 bg-white">

      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-700">
          Benefits of MoodMentor
        </h2>

        <p className="text-gray-600 mt-2">
          Helping employees achieve better emotional wellness
        </p>
      </div>


      <div className="grid md:grid-cols-5 gap-6 mt-10 px-10">

        {benefits.map((item,index)=>(
          <div 
            key={index}
            className="bg-purple-50 p-6 rounded-xl shadow hover:shadow-lg transition"
          >

            <div className="text-4xl text-purple-600 flex justify-center">
              {item.icon}
            </div>

            <h3 className="font-semibold text-center mt-4">
              {item.title}
            </h3>

            <p className="text-sm text-gray-600 text-center mt-2">
              {item.desc}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Benefits;