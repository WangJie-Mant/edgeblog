"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Toast from "./Toast";

type Flash = { message: string; type?: "success" | "error" | "info" };

const STORAGE_KEY = "flash-toast";

export default function FlashToast() {
  const [flash, setFlash] = useState<Flash | null>(null);
  const pathname = usePathname();

  const readFlash = () => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Flash;
      setFlash(parsed);
    } catch {
      /* ignore malformed */
    } finally {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    readFlash();
  }, [pathname]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);

  if (!flash) return null;
  return <Toast message={flash.message} type={flash.type ?? "info"} />;
}
