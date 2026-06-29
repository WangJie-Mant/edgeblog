import type { ComponentType } from "react";

import { SkillIcons } from "../components/Profile/SkillIcons";

export type SkillLevel = "none" | "proficient" | "expert";

export type SkillDefinition = {
  key: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
};

export const SKILLS: SkillDefinition[] = [
  { key: "rust", name: "Rust", icon: SkillIcons.rust },
  { key: "typescript", name: "TypeScript", icon: SkillIcons.typescript },
  { key: "javascript", name: "JavaScript", icon: SkillIcons.javascript },
  { key: "react", name: "React", icon: SkillIcons.react },
  { key: "node", name: "Node.js", icon: SkillIcons.node },
  { key: "python", name: "Python", icon: SkillIcons.python },
  { key: "sql", name: "SQL", icon: SkillIcons.sql },
  { key: "docker", name: "Docker", icon: SkillIcons.docker },
  { key: "git", name: "Git", icon: SkillIcons.git },
];

export type SkillGroup = {
  key: string;
  name: string;
  skills: string[];
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    key: "programming",
    name: "Programming",
    skills: SKILLS.map((skill) => skill.key),
  },
];

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  none: "无",
  proficient: "熟练",
  expert: "专精",
};

export function defaultSkillRatings(): Record<string, SkillLevel> {
  const ratings: Record<string, SkillLevel> = {};
  for (const skill of SKILLS) {
    ratings[skill.key] = "none";
  }
  return ratings;
}

export function normalizeSkillRatings(
  input: Record<string, unknown> | null | undefined,
): Record<string, SkillLevel> {
  const base = defaultSkillRatings();
  if (!input || typeof input !== "object") return base;
  for (const skill of SKILLS) {
    const level = input[skill.key];
    if (level === "none" || level === "proficient" || level === "expert") {
      base[skill.key] = level;
    }
  }
  return base;
}

export function parseSkillRatings(
  raw: string | Record<string, unknown> | null | undefined,
): Record<string, SkillLevel> {
  if (!raw) return defaultSkillRatings();
  if (typeof raw === "object") {
    return normalizeSkillRatings(raw as Record<string, unknown>);
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === "string") {
      try {
        const parsedInner = JSON.parse(parsed) as Record<string, unknown>;
        return normalizeSkillRatings(parsedInner);
      } catch {
        return defaultSkillRatings();
      }
    }
    return normalizeSkillRatings(parsed as Record<string, unknown>);
  } catch {
    return defaultSkillRatings();
  }
}
