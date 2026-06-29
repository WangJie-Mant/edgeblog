import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Creep",
  description: "当前活跃应用状态",
};

export default function CreepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="min-h-[60vh]">{children}</section>;
}
