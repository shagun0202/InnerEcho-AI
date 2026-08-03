import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBrain } from "react-icons/fa";

function Navbar() {

  const [active, setActive] = useState("Home");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-purple-600 text-white text-2xl">
            <FaBrain />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-purple-700">Mood</span>{" "}
              <span className="text-green-500">Mentor</span>
            </h1>

            <p className="text-sm text-gray-500">
              Your Well-being, Our Priority.
            </p>
          </div>

        </Link>


        {/* Navigation */}
        <nav className="hidden gap-10 font-medium text-gray-700 lg:flex">

          <a
            href="#"
            onClick={() => setActive("Home")}
            className={active === "Home" ? "text-purple-600" : "hover:text-purple-600"}
          >
            Home
          </a>


          <a
            href="#about"
            onClick={() => setActive("About Us")}
            className={active === "About Us" ? "text-purple-600" : "hover:text-purple-600"}
          >
            About Us
          </a>


          <a
            href="#features"
            onClick={() => setActive("Features")}
            className={active === "Features" ? "text-purple-600" : "hover:text-purple-600"}
          >
            Features
          </a>


          <a
            href="#how-it-works"
            onClick={() => setActive("How It Works")}
            className={active === "How It Works" ? "text-purple-600" : "hover:text-purple-600"}
          >
            How It Works
          </a>


          <a
            href="#benefits"
            onClick={() => setActive("Benefits")}
            className={active === "Benefits" ? "text-purple-600" : "hover:text-purple-600"}
          >
            Benefits
          </a>


          <a
            href="#contact"
            onClick={() => setActive("Contact")}
            className={active === "Contact" ? "text-purple-600" : "hover:text-purple-600"}
          >
            Contact
          </a>

        </nav>


        {/* Buttons */}
        <div className="flex gap-4">

          <Link
            to="/login"
            className="rounded-xl border border-purple-600 px-6 py-2 text-purple-700 transition hover:bg-purple-50"
          >
            Login
          </Link>


          <Link
            to="/register"
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2 text-white transition hover:scale-105"
          >
            Register
          </Link>

        </div>

      </div>

    </header>
  );
}

export default Navbar;