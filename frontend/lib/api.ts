const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json();
}

export interface Resume {
  id: string;
  name?: string;
  rawText: string;
  structuredData?: {
    skills?: string[];
    years_experience?: number;
    education?: string[];
    seniority_level?: string;
    industries?: string[];
  };
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  structuredRequirements?: {
    required_skills?: string[];
    years_experience_required?: number;
    preferred_education?: string[];
  };
  createdAt: string;
}

export interface RankedCandidate {
  resumeId: string;
  jobId: string;
  totalScore: number;
  breakdown: {
    skillScore: number;
    experienceScore: number;
    semanticScore: number;
    educationScore: number;
    industryScore: number;
  };
  biasFlags: { code: string; category: string; message: string; severity: string }[];
  explanation: string;
  structuredData: Resume['structuredData'] | null;
  rawTextPreview: string;
}

export const api = {
  uploadResume: async (file: File, name: string): Promise<Resume> => {
    const form = new FormData();
    form.append('name', name.trim() || 'Untitled');
    form.append('file', file);
    const res = await fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'Upload failed');
    return res.json();
  },
  getResumes: () => request<Resume[]>('/resume'),
  getResume: (id: string) => request<Resume>(`/resume/${id}`),
  createJob: (title: string, description: string) =>
    request<Job>('/job', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    }),
  getJobs: () => request<Job[]>('/job'),
  getJob: (id: string) => request<Job>(`/job/${id}`),
  deleteJob: async (id: string) => {
    const res = await fetch(`${API_BASE}/job/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as { error?: string }).error ?? 'Delete failed');
    }
  },
  getRankings: (jobId: string) =>
    request<RankedCandidate[]>(`/ranking/${jobId}`),
  rankCandidates: (jobId: string, limit?: number) =>
    request<RankedCandidate[]>(
      `/ranking/${jobId}${limit ? `?limit=${limit}` : ''}`,
      { method: 'POST', body: '{}' }
    ),
};
