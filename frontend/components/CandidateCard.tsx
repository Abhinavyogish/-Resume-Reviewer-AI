'use client';

import type { RankedCandidate } from '@/lib/api';
import { BiasWarningBadge } from './BiasWarningBadge';
import { SkillMatchVisualization } from './SkillMatchVisualization';

interface CandidateCardProps {
  candidate: RankedCandidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const profile = candidate.structuredData;
  const skills = profile?.skills ?? [];

  return (
    <div className="rounded-2xl border border-[#2a2a2e] bg-[#161618] p-6 ring-1 ring-[#2a2a2e]/50">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#d4af37]">
              {candidate.totalScore.toFixed(1)}
            </span>
            <span className="text-sm text-[#9c9892]">score</span>
            {candidate.biasFlags.length > 0 && (
              <BiasWarningBadge flags={candidate.biasFlags} />
            )}
          </div>
          {profile && (
            <div className="mt-2 text-sm text-[#9c9892]">
              {profile.years_experience != null && (
                <span>{profile.years_experience} yrs exp</span>
              )}
              {profile.seniority_level && (
                <span className="ml-3">• {profile.seniority_level}</span>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm text-[#e8e6e3] leading-relaxed">{candidate.explanation}</p>
      {skills.length > 0 && (
        <div className="mt-5">
          <SkillMatchVisualization skills={skills} />
        </div>
      )}
      <p className="mt-4 line-clamp-2 text-xs text-[#6b6863]">
        {candidate.rawTextPreview}…
      </p>
    </div>
  );
}
