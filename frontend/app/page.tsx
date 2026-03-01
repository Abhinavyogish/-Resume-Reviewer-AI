import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-[#2a2a2e] bg-[#161618] p-10 ring-1 ring-[#2a2a2e]/50">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-white">AI Resume Screening</span>
          <span className="block mt-1 text-[#d4af37]">& Skill Intelligence</span>
        </h1>
        <p className="mt-2 text-sm text-[#d4af37]">Capstone Project — Abhinav Yogish</p>
        <p className="mt-4 text-[#9c9892] leading-relaxed">
          Upload resumes, create job descriptions, and rank candidates with
          explainable scoring and bias detection.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Link
          href="/upload"
          className="group block rounded-2xl border border-[#2a2a2e] bg-[#161618] p-8 transition-all hover:border-[#d4af37]/40 hover:ring-1 hover:ring-[#d4af37]/20"
        >
          <div className="mb-3 text-2xl text-[#d4af37] opacity-80 group-hover:opacity-100">↑</div>
          <h2 className="text-xl font-semibold text-white">Upload Resume</h2>
          <p className="mt-2 text-sm text-[#9c9892]">
            Parse PDF, DOCX, PNG or JPG and extract structured candidate data.
          </p>
        </Link>
        <Link
          href="/jobs"
          className="group block rounded-2xl border border-[#2a2a2e] bg-[#161618] p-8 transition-all hover:border-[#d4af37]/40 hover:ring-1 hover:ring-[#d4af37]/20"
        >
          <div className="mb-3 text-2xl text-[#d4af37] opacity-80 group-hover:opacity-100">▸</div>
          <h2 className="text-xl font-semibold text-white">Create Job</h2>
          <p className="mt-2 text-sm text-[#9c9892]">
            Add job descriptions and rank candidates against requirements.
          </p>
        </Link>
      </div>
    </div>
  );
}
