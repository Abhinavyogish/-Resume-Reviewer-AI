'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; name?: string; structuredData?: unknown } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const resumeName = name.trim() || file.name.replace(/\.[^/.]+$/, '') || 'My Resume';
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.uploadResume(file, resumeName);
      setResult({ id: res.id, name: res.name, structuredData: res.structuredData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">
        <span className="text-white">Upload Resume</span>
        <span className="ml-2 text-[#d4af37]">↑</span>
      </h1>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#2a2a2e] bg-[#161618] p-8"
      >
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-[#d4af37]">Resume name</span>
            <span className="ml-1 text-[#6b6863]">(e.g. John Smith - SWE)</span>
            <input
              type="text"
              placeholder="Give your resume a name to find it easily"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-[#2a2a2e] bg-[#1c1c1f] px-4 py-3 text-white placeholder-[#6b6863] focus:border-[#d4af37]/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30"
            />
          </label>
          <label className="block">
            <span className="text-sm text-[#9c9892]">PDF, DOCX, PNG, or JPG (max 10MB)</span>
          <input
            type="file"
            accept=".pdf,.docx,.png,.jpg,.jpeg"
            className="mt-3 block w-full rounded-lg border border-[#2a2a2e] bg-[#1c1c1f] px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-[#d4af37] file:px-5 file:py-2 file:font-medium file:text-[#0c0c0e] file:transition file:hover:bg-[#b8860b]"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={loading}
          />
        </label>
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className="mt-6 rounded-lg bg-[#d4af37] px-8 py-3 text-sm font-semibold text-[#0c0c0e] transition hover:bg-[#b8860b] disabled:opacity-40 disabled:hover:bg-[#d4af37]"
        >
          {loading ? 'Processing…' : 'Upload & Parse'}
        </button>
      </form>
      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-red-400">
          {error}
        </div>
      )}
      {result && (
        <div className="rounded-2xl border border-[#2a2a2e] bg-[#161618] p-8">
          <h2 className="text-lg font-semibold text-white">
            Extracted Profile <span className="text-[#d4af37]">✓</span>
          </h2>
          <pre className="mt-4 overflow-auto rounded-lg bg-[#0c0c0e] p-5 text-xs text-[#9c9892] ring-1 ring-[#2a2a2e]">
            {JSON.stringify(result.structuredData, null, 2)}
          </pre>
          <p className="mt-4 text-sm text-[#6b6863]">Resume saved as &quot;{result.name ?? result.id}&quot; (ID: {result.id})</p>
        </div>
      )}
    </div>
  );
}
