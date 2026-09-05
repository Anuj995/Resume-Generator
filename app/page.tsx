import Link from "next/link";

export default function HomePage() {
  return (
    <div className="py-12 px-4 max-w-3xl mx-auto text-center">
      {/* Main Heading */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
        Resume Generator
      </h1>

      {/* Subheading */}
      <p className="text-lg sm:text-xl text-gray-600 mb-6 font-medium">
        Create a simple job-specific resume from your existing information.
      </p>

      {/* Short Explanation */}
      <p className="text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
        Enter your achievements, skills, education and experience. Select the job role you want, and generate a resume based on your information.
      </p>

      {/* Main Action Button */}
      <div className="mb-12">
        <Link
          href="/input"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md shadow-sm transition-colors text-base"
        >
          Start Creating Resume
        </Link>
      </div>

      {/* Simple Feature Section */}
      <div className="border-t border-gray-200 pt-10 mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-5 border border-gray-200 rounded-lg">
            <div className="text-blue-600 font-bold text-sm mb-1">Step 1</div>
            <h3 className="font-semibold text-gray-900 mb-1">Enter Information</h3>
            <p className="text-sm text-gray-600">
              Paste your raw career details, projects, education, and achievements.
            </p>
          </div>

          <div className="bg-white p-5 border border-gray-200 rounded-lg">
            <div className="text-blue-600 font-bold text-sm mb-1">Step 2</div>
            <h3 className="font-semibold text-gray-900 mb-1">Select Target Role</h3>
            <p className="text-sm text-gray-600">
              Pick the job role you are applying for to highlight relevant skills.
            </p>
          </div>

          <div className="bg-white p-5 border border-gray-200 rounded-lg">
            <div className="text-blue-600 font-bold text-sm mb-1">Step 3</div>
            <h3 className="font-semibold text-gray-900 mb-1">Generate Resume</h3>
            <p className="text-sm text-gray-600">
              Review organized sections, edit content, and preview your final resume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
