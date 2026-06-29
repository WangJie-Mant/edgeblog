"use client";

import TutorialModal from "./TutorialModal";
import { useTutorialContext } from "./TutorialContext";

export default function TutorialEngine() {
  const { activeTutorial, stepIndex, isOpen, next, prev, goTo, close, finish } =
    useTutorialContext();

  if (!isOpen || !activeTutorial) return null;

  return (
    <TutorialModal
      tutorial={activeTutorial}
      stepIndex={stepIndex}
      onPrev={prev}
      onNext={next}
      onClose={close}
      onFinish={finish}
      onGoTo={goTo}
    />
  );
}
