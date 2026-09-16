import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resume Generator | Professional ATS Resume Builder",
  description: "Create ATS-compliant, job-targeted resumes with AI enhancement and instant Word/PDF export.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
        <footer className="border-t border-slate-200/80 py-5 text-xs text-slate-500 bg-white print:hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Resume Generator</span>
              <span>&bull;</span>
              <span>ATS-Optimized &bull; Free &amp; Private</span>
            </div>
            <p className="text-slate-400">
              All data is processed locally in your browser.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
