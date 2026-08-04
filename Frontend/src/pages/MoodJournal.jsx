import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaLock } from "react-icons/fa";

function MoodJournal() {
  const [journal, setJournal] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (!journal.trim()) {
      alert("Please write something before analyzing your mood!");
      return;
    }

    // Backend API will be added later
    navigate("/result");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">

          <div className="flex items-center gap-4">

            <div className="bg-white p-3 rounded-full">
              <FaBrain className="text-3xl text-purple-600" />
            </div>

            <div>
              <h1 className="text-4xl font-bold">
                Mood Journal
              </h1>

              <p className="mt-2 text-purple-100">
                Express your thoughts and let AI understand your emotions.
              </p>
            </div>

          </div>

        </div>

        {/* Body */}
        <div className="p-10">

          <h2 className="text-2xl font-semibold text-gray-800">
            How are you feeling today?
          </h2>

          <p className="mt-2 text-gray-500">
            Write freely about your day, emotions, or anything on your mind.
          </p>

          {/* Text Area */}
          <textarea
            rows="10"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Example:

Today I felt stressed because of work pressure. Later I went for a walk and talked with my friend which made me feel much better..."
            className="mt-8 w-full rounded-2xl border border-gray-300 p-5 text-lg outline-none resize-none focus:border-purple-600 focus:ring-2 focus:ring-purple-300"
          />

          {/* Bottom Info */}
          <div className="mt-4 flex items-center justify-between">

            <div className="flex items-center gap-2 text-green-600">
              <FaLock />
              <span>Your journal is private and secure.</span>
            </div>

            <span className="text-gray-500">
              {journal.length} Characters
            </span>

          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            className="mt-10 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-lg font-semibold text-white transition hover:scale-105"
          >
            Analyze Mood
          </button>

        </div>

      </div>

    </div>
  );
}

export default MoodJournal;