import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* App Title */}
        <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          Resume Generator
        </Link>

        {/* Quick Links */}
        <div className="flex items-center space-x-4 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link href="/input" className="hover:text-blue-600">
            Enter Info
          </Link>
          <Link href="/role" className="hover:text-blue-600">
            Select Role
          </Link>
          <Link href="/templates" className="hover:text-blue-600">
            Templates
          </Link>
        </div>
      </div>
    </nav>
  );
}
