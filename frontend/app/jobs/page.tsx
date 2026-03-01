'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Job } from '@/lib/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getJobs().then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const job = await api.createJob(title, description);
      setJobs((prev) => [job, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this job? This cannot be undone.')) return;
    setDeletingId(jobId);
    try {
      await api.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      // ignore for now
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">
        <span className="text-white">Job Descriptions</span>
        <span className="ml-2 text-[#d4af37]">▸</span>
      </h1>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-[#2a2a2e] bg-[#161618] p-8"
      >
        <h2 className="mb-6 text-xl font-semibold text-white">Create Job</h2>
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[#2a2a2e] bg-[#1c1c1f] px-4 py-3 text-white placeholder-[#6b6863] focus:border-[#d4af37]/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30"
          />
          <textarea
            placeholder="Job description and requirements"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-[#2a2a2e] bg-[#1c1c1f] px-4 py-3 text-white placeholder-[#6b6863] focus:border-[#d4af37]/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-[#d4af37] px-8 py-3 text-sm font-semibold text-[#0c0c0e] transition hover:bg-[#b8860b] disabled:opacity-40 disabled:hover:bg-[#d4af37]"
          >
            {creating ? 'Creating…' : 'Create'}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
      </form>

      <div>
        <h2 className="mb-5 text-xl font-semibold text-white">All Jobs</h2>
        {loading ? (
          <p className="text-[#9c9892]">Loading…</p>
        ) : jobs.length === 0 ? (
          <p className="text-[#6b6863]">No jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group flex items-start gap-4 rounded-xl border border-[#2a2a2e] bg-[#161618] p-5 transition hover:border-[#d4af37]/30 hover:ring-1 hover:ring-[#d4af37]/10"
              >
                <Link href={`/jobs/${job.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{job.title}</span>
                    <span className="text-sm text-[#d4af37]">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[#9c9892]">
                    {job.description}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, job.id)}
                  disabled={deletingId === job.id}
                  className="shrink-0 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-950/30 hover:text-red-300 disabled:opacity-50"
                  title="Delete job"
                >
                  {deletingId === job.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
