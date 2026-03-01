'use client';

interface SkillMatchVisualizationProps {
  skills: string[];
  max?: number;
}

export function SkillMatchVisualization({
  skills,
  max = 12,
}: SkillMatchVisualizationProps) {
  const display = skills.slice(0, max);

  return (
    <div className="flex flex-wrap gap-2">
      {display.map((skill, i) => (
        <span
          key={`${skill}-${i}`}
          className="rounded-lg border border-[#2a2a2e] bg-[#1c1c1f] px-2.5 py-1 text-xs text-[#e8e6e3]"
        >
          {skill}
        </span>
      ))}
      {skills.length > max && (
        <span className="rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/5 px-2.5 py-1 text-xs text-[#d4af37]">
          +{skills.length - max} more
        </span>
      )}
    </div>
  );
}
