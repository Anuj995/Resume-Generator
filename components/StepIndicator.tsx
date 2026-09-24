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
    <div className="mb-6 sm:mb-8 print:hidden">
      {/* Mobile condensed indicator */}
      <div className="flex sm:hidden items-center justify-between bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
            {currentStep}
          </span>
          <span className="font-medium text-slate-600">
            Step {currentStep} of 5:{" "}
            <span className="text-slate-900 font-bold">{STEPS[currentStep - 1].label}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <span
              key={s.step}
              className={`w-2 h-2 rounded-full transition-all ${
                s.step === currentStep
                  ? "bg-blue-600 ring-4 ring-blue-500/20 scale-110"
                  : s.step < currentStep
                  ? "bg-emerald-500"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop/tablet horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl px-5 py-3 shadow-xs">
        {STEPS.map((item, idx) => {
          const isCompleted = item.step < currentStep;
          const isCurrent = item.step === currentStep;

          const content = (
            <div className="flex items-center gap-2.5 group">
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-xs ring-4 ring-blue-500/15"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 group-hover:bg-emerald-100/80"
                    : "bg-slate-100 text-slate-400 border border-transparent"
                }`}
              >
                {isCompleted ? "✓" : item.step}
              </span>
              <span
                className={`text-xs font-semibold tracking-tight transition-colors ${
                  isCurrent
                    ? "text-blue-700 font-bold"
                    : isCompleted
                    ? "text-slate-700 group-hover:text-slate-900"
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
                  className="hover:opacity-90 transition-opacity focus:outline-none"
                  title={`Go back to ${item.label}`}
                >
                  {content}
                </Link>
              ) : (
                <div>{content}</div>
              )}

              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-3 rounded-full transition-colors ${
                    item.step < currentStep ? "bg-emerald-300" : "bg-slate-100"
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
