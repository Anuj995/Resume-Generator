import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Resume Generator - Internship Project",
  description: "Create a simple job-specific resume from your existing information.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-500 bg-white">
          Resume Generator &bull; Internship Project
        </footer>
      </body>
    </html>
  );
}
