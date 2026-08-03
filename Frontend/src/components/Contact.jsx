import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

function Contact() {
  return (
    <section id="contact" className="py-16 bg-purple-50">

      <div className="text-center mb-10">

        <h2 className="text-3xl font-bold text-purple-700">
          Contact Us
        </h2>

        <p className="text-gray-600 mt-2">
          Have questions? We would love to hear from you.
        </p>

      </div>


      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-8">


        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-md p-8">

          <h3 className="text-xl font-semibold mb-6">
            Get In Touch
          </h3>


          <div className="flex items-center gap-4 mb-5">
            <FaEnvelope className="text-purple-600 text-xl" />
            <p>support@moodmentor.com</p>
          </div>


         

          <div className="flex items-center gap-4">
            <FaMapMarkerAlt className="text-purple-600 text-xl" />
            <p>India</p>
          </div>

        </div>



        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-md p-8">

          <h3 className="text-xl font-semibold mb-6">
            Send Message
          </h3>


          <input
            type="text"
            placeholder="Your Name"
            className="w-full border rounded-lg p-3 mb-4"
          />


          <input
            type="email"
            placeholder="Your Email"
            className="w-full border rounded-lg p-3 mb-4"
          />


          <textarea
            placeholder="Your Message"
            rows="4"
            className="w-full border rounded-lg p-3 mb-4"
          ></textarea>


          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
            Send Message
          </button>


        </div>

      </div>

    </section>
  );
}

export default Contact;