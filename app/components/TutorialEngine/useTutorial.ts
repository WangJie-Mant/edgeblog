"use client";

import { useEffect } from "react";
import { useTutorialContext } from "./TutorialContext";

type UseTutorialOptions = {
	auto?: boolean;
};

export function useTutorial(key: string, options: UseTutorialOptions = {}) {
	const { auto = true } = options;
	const {
		activeKey,
		activeTutorial,
		stepIndex,
		isReady,
		open,
		openIfNeeded,
		close,
		next,
		prev,
		goTo,
		finish,
	} = useTutorialContext();

	useEffect(() => {
		if (!auto || !isReady) return;
		openIfNeeded(key);
	}, [auto, isReady, openIfNeeded, key]);

	return {
		isOpen: activeKey === key,
		tutorial: activeKey === key ? activeTutorial : null,
		stepIndex,
		open: () => open(key),
		close,
		next,
		prev,
		goTo,
		finish,
	};
}

