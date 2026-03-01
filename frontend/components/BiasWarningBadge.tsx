'use client';

interface BiasFlag {
  code: string;
  category: string;
  message: string;
  severity: string;
}

interface BiasWarningBadgeProps {
  flags: BiasFlag[];
}

export function BiasWarningBadge({ flags }: BiasWarningBadgeProps) {
  if (flags.length === 0) return null;

  const hasHigh = flags.some((f) => f.severity === 'high');
  const hasMedium = flags.some((f) => f.severity === 'medium');

  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
      title={flags.map((f) => f.message).join('\n')}
      style={{
        backgroundColor: hasHigh
          ? 'rgba(239, 68, 68, 0.15)'
          : hasMedium
          ? 'rgba(245, 158, 11, 0.15)'
          : 'rgba(212, 175, 55, 0.1)',
        borderColor: hasHigh ? 'rgba(239, 68, 68, 0.4)' : hasMedium ? 'rgba(245, 158, 11, 0.4)' : 'rgba(212, 175, 55, 0.3)',
        color: hasHigh ? '#fca5a5' : hasMedium ? '#fcd34d' : '#d4af37',
      }}
    >
      ⚠ {flags.length} flag{flags.length > 1 ? 's' : ''}
    </span>
  );
}
