'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Breakdown {
  skillScore: number;
  experienceScore: number;
  semanticScore: number;
  educationScore: number;
  industryScore: number;
}

interface ScoreBreakdownChartProps {
  breakdown: Breakdown;
}

const LABELS: Record<string, string> = {
  skillScore: 'Skill',
  experienceScore: 'Experience',
  semanticScore: 'Semantic',
  educationScore: 'Education',
  industryScore: 'Industry',
};

const COLORS = ['#d4af37', '#b8860b', '#9a7b2e', '#c9a227', '#e6c04a'];

export function ScoreBreakdownChart({ breakdown }: ScoreBreakdownChartProps) {
  const data = Object.entries(breakdown).map(([key, value]) => ({
    name: LABELS[key] ?? key,
    value: Math.round(value),
    fullKey: key,
  }));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={75}
            tick={{ fontSize: 11, fill: '#9c9892' }}
          />
          <Tooltip
            contentStyle={{
              background: '#161618',
              border: '1px solid #2a2a2e',
              borderRadius: 8,
            }}
            formatter={(value: number) => [`${value}%`, 'Score']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
