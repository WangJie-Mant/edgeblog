import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { AuthProvider } from "./components/auth/AuthProvider";
import { TutorialProvider } from "./components/TutorialEngine/TutorialContext";
import TutorialEngine from "./components/TutorialEngine/TutorialEngine";
import { cookies } from "next/headers";
import type { AuthUser } from "./components/auth/AuthProvider";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function loadServerUser(token: string): Promise<AuthUser | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  try {
    let resp: Response;
    try {
      const { env } = await getCloudflareContext();
      resp = await env.BACKEND.fetch("https://blog/api/auth/me", {
        headers: { Authorization: "Bearer " + token },
        signal: controller.signal,
      });
    } catch {
      return null;
    }
    if (!resp.ok) return null;
    return resp.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || null;
  const snapshotRaw = cookieStore.get("user_snapshot")?.value || null;
  let initialUser: AuthUser | null = null;
  if (snapshotRaw) {
    try {
      initialUser = JSON.parse(decodeURIComponent(snapshotRaw)) as AuthUser;
    } catch {
      initialUser = null;
    }
  }
  if (!initialUser && token) {
    initialUser = await loadServerUser(token);
  }
  return (
    <html lang="zh-cn" data-theme="corporate">
      <body>
        <AuthProvider initialUser={initialUser} initialToken={token}>
          <TutorialProvider>
            <TutorialEngine />
            <Navbar>
              <main className="flex-1">{children}</main>
              <Footer />
            </Navbar>
          </TutorialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
