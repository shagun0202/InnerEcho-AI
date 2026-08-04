import { Link } from "react-router-dom";

function Result() {
  return (
    <div className="min-h-screen bg-purple-50 flex justify-center items-center p-6">

      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-2xl">

        <h1 className="text-4xl font-bold text-center text-purple-700">
          Mood Analysis Result
        </h1>

        <div className="mt-10">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Emotion
            </h2>

            <p className="text-3xl text-red-500 font-bold">
              Anxiety
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold">
              Confidence
            </h2>

            <p className="text-2xl text-green-600">
              87%
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-4">
            Suggestions
          </h2>

          <ul className="space-y-3 text-lg">
            <li>🧘 Meditation</li>
            <li>🌬 Deep Breathing</li>
            <li>🎵 Listen to Calm Music</li>
            <li>🚶 Take a Short Walk</li>
          </ul>

        </div>

        <div className="mt-10 flex gap-4">

          <Link
            to="/journal"
            className="flex-1 bg-purple-600 text-white text-center py-3 rounded-xl"
          >
            Analyze Again
          </Link>

          <Link
            to="/dashboard"
            className="flex-1 bg-green-600 text-white text-center py-3 rounded-xl"
          >
            Dashboard
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Result;