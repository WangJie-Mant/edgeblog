import type { Tutorial } from "./types";

// Deprecated: tutorial definitions are now loaded from the backend
// content/tutorial directory. Keep this for optional local overrides.
export const tutorialRegistry: Record<string, Tutorial> = {};