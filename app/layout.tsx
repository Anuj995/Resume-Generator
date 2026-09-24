import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AppDock from "@/components/AppDock";
import HeroGeometric from "@/components/ui/hero-geometric";

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
      <body className="min-h-screen flex flex-col text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
        {/* Componentry Hero Geometric WebGL Shader Background */}
        <HeroGeometric
          className="fixed inset-0 w-full h-full pointer-events-none z-0 print:hidden bg-transparent"
          color1="#3B82F6"
          color2="#F0F9FF"
          speed={0.14}
        />
        
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 pb-28 relative z-10">
          {children}
        </main>
        <AppDock />
        <footer className="border-t border-slate-200/80 py-6 text-xs text-slate-500 bg-white/80 backdrop-blur-sm print:hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">ResumeGen</span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-slate-600">Student &amp; Internship ATS Resume Builder</span>
            </div>
            <p className="text-slate-400">
              100% Client-Side Privacy &bull; Single-Column ATS Standards
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
