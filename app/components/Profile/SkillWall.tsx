import { SKILLS, SKILL_LEVEL_LABEL, SkillLevel } from "@/app/lib/skills";
import { SkillIcons } from "@/app/components/Profile/SkillIcons";

const LEVEL_ICON_COLOR: Record<SkillLevel, string> = {
  none: "text-base-content/40",
  proficient: "text-warning",
  expert: "text-success",
};

type SkillWallProps = {
  ratings: Record<string, SkillLevel>;
  hideNone?: boolean;
};

export default function SkillWall({ ratings, hideNone = false }: SkillWallProps) {
  const items = hideNone
    ? SKILLS.filter((skill) => (ratings[skill.key] ?? "none") !== "none")
    : SKILLS;

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">技能墙</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {items.map((skill) => {
          const level = ratings[skill.key] ?? "none";
          const levelLabel = SKILL_LEVEL_LABEL[level];
          const title = `${skill.name} | ${levelLabel}`;
          const Icon = skill.icon ?? SkillIcons[skill.key];
          return (
            <div
              key={skill.key}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-base-200"
              title={title}
            >
              {Icon && <Icon className={`h-5 w-5 ${LEVEL_ICON_COLOR[level]}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
