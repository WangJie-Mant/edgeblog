"use client";

import { useEffect } from "react";
import type { Tutorial } from "./types";

type TutorialModalProps = {
  tutorial: Tutorial;
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onClose: () => void;
  onFinish: () => void;
};

export default function TutorialModal({
  tutorial,
  stepIndex,
  onPrev,
  onNext,
  onGoTo,
  onClose,
  onFinish,
}: TutorialModalProps) {
  const steps = tutorial.steps;
  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowLeft") {
        onPrev();
      }
      if (event.key === "ArrowRight") {
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  if (!step) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-md" />
      <div className="relative flex h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/90 shadow-2xl shadow-slate-900/20">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
              {tutorial.key}
            </div>
            <button
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>

          <div className="px-6 py-6">
            <div className="text-2xl font-semibold text-slate-900">
              {step.title}({stepIndex + 1}/{steps.length})
            </div>
            {step.subtitle ? (
              <div className="mt-2 text-sm text-slate-500">{step.subtitle}</div>
            ) : null}
            <div className="mt-4 text-base leading-relaxed text-slate-700">
              {step.contentHtml ? (
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: step.contentHtml }}
                />
              ) : (
                step.content
              )}
            </div>
            {step.image ? (
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={step.image}
                  alt={step.imageAlt || step.title}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={onPrev}
                type="button"
                disabled={isFirst}
              >
                Previous
              </button>
              <button
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800"
                onClick={isLast ? onFinish : onNext}
                type="button"
              >
                {isLast ? "Finish" : "Next"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {steps.map((_, index) => {
                const active = index === stepIndex;
                return (
                  <button
                    key={`${tutorial.key}-dot-${index}`}
                    type="button"
                    aria-label={`Go to step ${index + 1}`}
                    onClick={() => onGoTo(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      active
                        ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                        : "bg-slate-300"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
