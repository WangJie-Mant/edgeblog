"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import type { Tutorial } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const STORAGE_PREFIX = "tutorial";

type TutorialContextValue = {
  activeKey: string | null;
  activeTutorial: Tutorial | null;
  stepIndex: number;
  isOpen: boolean;
  isReady: boolean;
  open: (key: string) => void;
  openIfNeeded: (key: string) => Promise<void>;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  finish: () => Promise<void>;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

function buildStorageKey(key: string, version: number): string {
  return `${STORAGE_PREFIX}:${key}:v${version}`;
}

function readLocalCompletion(key: string, version: number): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(buildStorageKey(key, version)) === "done";
}

function writeLocalCompletion(key: string, version: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(buildStorageKey(key, version), "done");
}

async function fetchRemoteStatus(
  key: string,
  version: number,
  token: string,
): Promise<{ completed: boolean; completedVersion?: number | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const resp = await fetch(
      `${API_BASE}/api/tutorial/${encodeURIComponent(key)}?version=${version}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: controller.signal,
      },
    );
    if (!resp.ok) {
      throw new Error(`tutorial status failed: ${resp.status}`);
    }
    return resp.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchTutorialDefinition(key: string): Promise<Tutorial | null> {
  if (!API_BASE) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const resp = await fetch(
      `${API_BASE}/api/tutorials/${encodeURIComponent(key)}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    );
    if (!resp.ok) {
      return null;
    }
    return resp.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendRemoteComplete(
  key: string,
  version: number,
  token: string,
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  try {
    const resp = await fetch(
      `${API_BASE}/api/tutorial/${encodeURIComponent(key)}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ version }),
        signal: controller.signal,
      },
    );
    if (!resp.ok) {
      throw new Error(`tutorial complete failed: ${resp.status}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const { token, user, loading } = useAuth();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [tutorialMap, setTutorialMap] = useState<Record<string, Tutorial>>({});
  const completionCache = useRef(new Map<string, boolean>());
  const inflightChecks = useRef(new Set<string>());
  const inflightLoads = useRef(new Set<string>());

  const activeTutorial = activeKey ? (tutorialMap[activeKey] ?? null) : null;
  const isOpen = Boolean(activeTutorial && activeTutorial.steps.length > 0);
  const isReady = !loading;

  const loadTutorial = useCallback(
    async (key: string) => {
      const cached = tutorialMap[key];
      if (cached) return cached;
      if (inflightLoads.current.has(key)) return null;
      inflightLoads.current.add(key);
      try {
        const remote = await fetchTutorialDefinition(key);
        if (!remote || remote.steps.length === 0) return null;
        setTutorialMap((prev) => ({ ...prev, [key]: remote }));
        return remote;
      } finally {
        inflightLoads.current.delete(key);
      }
    },
    [tutorialMap],
  );

  const open = useCallback(
    (key: string) => {
      void (async () => {
        const tutorial = await loadTutorial(key);
        if (!tutorial || tutorial.steps.length === 0) return;
        setActiveKey(key);
        setStepIndex(0);
      })();
    },
    [loadTutorial],
  );

  const close = useCallback(() => {
    setActiveKey(null);
    setStepIndex(0);
  }, []);

  const next = useCallback(() => {
    if (!activeTutorial) return;
    setStepIndex((prev) => Math.min(prev + 1, activeTutorial.steps.length - 1));
  }, [activeTutorial]);

  const prev = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (!activeTutorial) return;
      const nextIndex = Math.max(
        0,
        Math.min(index, activeTutorial.steps.length - 1),
      );
      setStepIndex(nextIndex);
    },
    [activeTutorial],
  );

  const openIfNeeded = useCallback(
    async (key: string) => {
      const tutorial = await loadTutorial(key);
      if (!tutorial || tutorial.steps.length === 0) return;
      const version = tutorial.version;
      const cacheKey = `${user?.id ?? "anon"}:${key}:v${version}`;

      const cached = completionCache.current.get(cacheKey);
      if (cached === true) return;
      if (inflightChecks.current.has(cacheKey)) return;

      inflightChecks.current.add(cacheKey);
      let completed = false;

      if (token && API_BASE) {
        try {
          const status = await fetchRemoteStatus(key, version, token);
          completed = status.completed;
          if (status.completed) {
            writeLocalCompletion(key, version);
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (!completed) {
        completed = readLocalCompletion(key, version);
      }

      completionCache.current.set(cacheKey, completed);
      inflightChecks.current.delete(cacheKey);

      if (!completed) {
        if (activeKey === key && isOpen) return;
        open(key);
      }
    },
    [activeKey, isOpen, loadTutorial, open, token, user?.id],
  );

  const finish = useCallback(async () => {
    if (!activeTutorial || !activeKey) return;
    const version = activeTutorial.version;
    writeLocalCompletion(activeKey, version);
    const cacheKey = `${user?.id ?? "anon"}:${activeKey}:v${version}`;
    completionCache.current.set(cacheKey, true);

    if (token && API_BASE) {
      try {
        await sendRemoteComplete(activeKey, version, token);
      } catch (err) {
        console.error(err);
      }
    }

    close();
  }, [activeKey, activeTutorial, close, token, user?.id]);

  const value = useMemo(
    () => ({
      activeKey,
      activeTutorial,
      stepIndex,
      isOpen,
      isReady,
      open,
      openIfNeeded,
      close,
      next,
      prev,
      goTo,
      finish,
    }),
    [
      activeKey,
      activeTutorial,
      stepIndex,
      isOpen,
      isReady,
      open,
      openIfNeeded,
      close,
      next,
      prev,
      goTo,
      finish,
    ],
  );

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorialContext(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error("useTutorialContext must be used within TutorialProvider");
  }
  return ctx;
}
