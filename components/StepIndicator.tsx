"use client";

import Link from "next/link";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

const STEPS = [
  { step: 1, label: "Information", href: "/input" },
  { step: 2, label: "Role & JD", href: "/role" },
  { step: 3, label: "Review Info", href: "/organize" },
  { step: 4, label: "Edit Resume", href: "/editor" },
  { step: 5, label: "Preview & Export", href: "/preview" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-6 print:hidden">
      {/* Mobile condensed indicator */}
      <div className="flex sm:hidden items-center justify-between bg-white border border-slate-200/80 rounded-lg px-3.5 py-2 text-xs shadow-2xs">
        <span className="font-semibold text-slate-700">
          Step {currentStep} of 5:{" "}
          <span className="text-blue-600">{STEPS[currentStep - 1].label}</span>
        </span>
        <div className="flex items-center gap-1">
          {STEPS.map((s) => (
            <span
              key={s.step}
              className={`w-2 h-2 rounded-full transition-colors ${
                s.step === currentStep
                  ? "bg-blue-600 ring-2 ring-blue-100"
                  : s.step < currentStep
                  ? "bg-emerald-500"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop/tablet horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs">
        {STEPS.map((item, idx) => {
          const isCompleted = item.step < currentStep;
          const isCurrent = item.step === currentStep;
          const isUpcoming = item.step > currentStep;

          const content = (
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-100"
                    : isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isCompleted ? "✓" : item.step}
              </span>
              <span
                className={`text-xs font-medium transition-colors ${
                  isCurrent
                    ? "text-blue-700 font-semibold"
                    : isCompleted
                    ? "text-slate-700"
                    : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          return (
            <div key={item.step} className="flex items-center flex-1 last:flex-none">
              {isCompleted ? (
                <Link
                  href={item.href}
                  className="hover:opacity-80 transition-opacity focus:outline-none"
                  title={`Go back to ${item.label}`}
                >
                  {content}
                </Link>
              ) : (
                <div>{content}</div>
              )}

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2 rounded transition-colors ${
                    item.step < currentStep ? "bg-emerald-200" : "bg-slate-100"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
