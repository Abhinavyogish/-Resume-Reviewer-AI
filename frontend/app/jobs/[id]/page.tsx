'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type Job, type RankedCandidate } from '@/lib/api';
import { CandidateCard } from '@/components/CandidateCard';
import { ScoreBreakdownChart } from '@/components/ScoreBreakdownChart';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [ranked, setRanked] = useState<RankedCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getJob(id).then(setJob).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api
      .getRankings(id)
      .then((res) => {
        setRanked(res);
        setError(res.length === 0 ? null : null);
      })
      .catch(() => setRanked([]));
  }, [id]);

  const runRanking = async () => {
    setRanking(true);
    setError(null);
    try {
      const res = await api.rankCandidates(id);
      setRanked(res);
      if (res.length === 0) {
        setError('No candidates found. Upload at least one resume first.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ranking failed';
      setError(msg);
      setRanked([]);
    } finally {
      setRanking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    try {
      await api.deleteJob(id);
      router.push('/jobs');
    } catch {
      // ignore
    }
  };

  if (loading) return <p className="text-[#9c9892]">Loading…</p>;
  if (!job) return <p className="text-red-400">Job not found</p>;

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-[#2a2a2e] bg-[#161618] p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">{job.title}</h1>
          <div className="flex gap-3">
            <Link
              href="/jobs"
              className="rounded-lg border border-[#2a2a2e] px-4 py-2 text-sm text-[#9c9892] transition hover:border-[#d4af37]/30 hover:text-white"
            >
              Back to Jobs
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg px-4 py-2 text-sm text-red-400 transition hover:bg-red-950/30 hover:text-red-300"
            >
              Delete Job
            </button>
          </div>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-[#9c9892] leading-relaxed">{job.description}</p>
      </div>

      <div>
        <button
          onClick={runRanking}
          disabled={ranking}
          className="rounded-lg bg-[#d4af37] px-8 py-3 text-sm font-semibold text-[#0c0c0e] transition hover:bg-[#b8860b] disabled:opacity-50 disabled:hover:bg-[#d4af37]"
        >
          {ranking ? 'Ranking… (may take 30–60 sec)' : 'Rank Candidates'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-amber-400">
          {error}
        </div>
      )}

      {ranked.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-white">
            Ranked Candidates <span className="text-[#d4af37]">↓</span>
          </h2>
          <div className="space-y-6">
            {ranked.map((c, i) => (
              <div key={c.resumeId} className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1c1c1f] text-xl font-bold text-[#d4af37] ring-1 ring-[#2a2a2e]">
                  #{i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <CandidateCard candidate={c} />
                  <div className="mt-3">
                    <ScoreBreakdownChart breakdown={c.breakdown} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
