import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'green' | 'yellow' | 'blue' | 'red';
  subtitle?: string;
  accentColor?: string;
  accentBg?: string;
}

const colorMap = {
  green: { accent: '#34d399', bg: 'rgba(52,211,153,0.1)', glow: 'rgba(52,211,153,0.12)' },
  yellow: { accent: '#fbbf24', bg: 'rgba(251,191,36,0.1)', glow: 'rgba(251,191,36,0.12)' },
  blue: { accent: '#22d3ee', bg: 'rgba(34,211,238,0.1)', glow: 'rgba(34,211,238,0.12)' },
  red: { accent: '#f43f5e', bg: 'rgba(244,63,94,0.1)', glow: 'rgba(244,63,94,0.12)' },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, subtitle }) => {
  const isPositive = change >= 0;
  const c = colorMap[color];

  return (
    <div className="card card-hover p-5 flex flex-col gap-3 cursor-default animate-fadeInUp">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg, color: c.accent, boxShadow: `0 0 20px ${c.glow}` }}>
          {icon}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
          style={{
            background: isPositive ? 'rgba(52,211,153,0.1)' : 'rgba(244,63,94,0.1)',
            color: isPositive ? '#34d399' : '#f43f5e',
          }}>
          <svg className={`w-3 h-3 ${isPositive ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {Math.abs(change)}%
        </span>
      </div>

      <div>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <p className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>

      {/* Mini sparkline decoration */}
      <div className="h-0.5 rounded-full w-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(90, 40 + Math.abs(change) * 3)}%`, background: c.accent, opacity: 0.7 }} />
      </div>
    </div>
  );
};
