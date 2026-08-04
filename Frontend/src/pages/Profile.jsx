import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const user = {
    name: "Saloni Kumari",
    email: "saloni@example.com",
    role: "Employee",
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-purple-50 flex justify-center items-center p-6">

      <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md">

        <div className="flex justify-center">
          <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {user.name.charAt(0)}
          </div>
        </div>


        <h1 className="text-3xl font-bold text-center mt-5 text-purple-700">
          My Profile
        </h1>


        <div className="mt-6 space-y-4">

          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-semibold">{user.name}</p>
          </div>


          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>


          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-semibold">{user.role}</p>
          </div>

        </div>


        <button
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700"
        >
          Edit Profile
        </button>


        <button
          onClick={handleLogout}
          className="mt-3 w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600"
        >
          Logout
        </button>


      </div>

    </div>
  );
}

export default Profile;