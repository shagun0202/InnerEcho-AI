import { Link, useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };


  return (
    <div className="min-h-screen bg-gray-100 p-8">


      {/* Navbar */}
      <div className="bg-white rounded-2xl shadow p-5 flex justify-between items-center mb-8">

        <h1 className="text-2xl font-bold text-purple-700">
          MoodMentor
        </h1>


        <div className="flex gap-5 items-center">

          <Link
            to="/journal"
            className="text-purple-600 font-semibold"
          >
            📝 Journal
          </Link>


          <Link
            to="/profile"
            className="text-purple-600 font-semibold"
          >
            👤 Profile
          </Link>


          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>

      </div>




      {/* Welcome Section */}
      <div className="bg-purple-600 text-white rounded-2xl p-8 mb-10">

        <h1 className="text-4xl font-bold">
          Welcome back, Saloni 👋
        </h1>

        <p className="mt-2 text-lg">
          Track your mental wellness with MoodMentor
        </p>


        <Link to="/journal">

          <button className="mt-5 bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold">
            Analyze New Mood
          </button>

        </Link>


      </div>





      <h1 className="text-4xl font-bold text-center text-purple-700 mb-10">
        Dashboard
      </h1>




      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6">


        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-lg font-semibold">
            Today's Mood
          </h2>

          <p className="text-4xl mt-4">
            😊
          </p>

          <p className="mt-2 text-gray-600">
            Happy
          </p>

        </div>




        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-lg font-semibold">
            Mood Score
          </h2>

          <p className="text-5xl font-bold text-green-600 mt-4">
            82%
          </p>

        </div>




        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-lg font-semibold">
            Journal Entries
          </h2>

          <p className="text-5xl font-bold text-purple-600 mt-4">
            14
          </p>

        </div>


      </div>





      {/* Mood Trend */}
      <div className="bg-white rounded-2xl shadow mt-10 p-8">

        <h2 className="text-2xl font-bold mb-6">
          Weekly Mood Trend
        </h2>


        <div className="flex justify-between text-4xl">

          <span>😊</span>
          <span>🙂</span>
          <span>😐</span>
          <span>😔</span>
          <span>😊</span>
          <span>😁</span>
          <span>😍</span>

        </div>


      </div>


    </div>
  );
}

export default Dashboard;