function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-3xl bg-white p-8 shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl transition-all duration-300 group-hover:scale-110">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-4 text-2xl font-bold text-gray-800">
        {title}
      </h3>

      {/* Description */}
      <p className="leading-7 text-gray-600">
        {description}
      </p>

    </div>
  );
}

export default FeatureCard;