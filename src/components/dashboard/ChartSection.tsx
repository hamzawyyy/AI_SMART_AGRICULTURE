import React, { useState } from 'react';
import type { ChartData } from '../../types';

interface ChartSectionProps {
  data: ChartData | null;
  language?: 'ar' | 'en';
}

export const ChartSection: React.FC<ChartSectionProps> = ({ data, language = 'ar' }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const ar = language === 'ar';

  if (!data) {
    // Fallback static demo data
    data = {
      labels: ar ? ['يناير','فبراير','مارس','أبريل','مايو','يونيو'] : ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [
        { label: ar ? 'الإيرادات' : 'Revenue', data: [42000,55000,48000,72000,65000,88000], color: '#34d399' },
        { label: ar ? 'الصادرات' : 'Exports', data: [28000,35000,31000,44000,39000,52000], color: '#22d3ee' },
      ],
    };
  }

  const allValues = data.datasets.flatMap(d => d.data);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues) * 0.8;

  const getHeight = (val: number) => ((val - minValue) / (maxValue - minValue)) * 100;

  return (
    <div className="card p-6 h-full" style={{ minHeight: 320 }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="ai-badge">AI</span>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{ar ? 'تحليل تنبؤي' : 'Predictive Analytics'}</p>
          </div>
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {ar ? 'أداء الإنتاج والتصدير' : 'Production & Export Performance'}
          </h3>
        </div>
        <div className="flex gap-4">
          {data.datasets.map((ds, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: ds.color }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{ds.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-44 w-full flex items-end gap-1.5">
        {/* Y-axis lines */}
        {[0,25,50,75,100].map(pct => (
          <div key={pct} className="absolute w-full" style={{ bottom: `${pct}%`, borderTop: '1px solid rgba(255,255,255,0.04)' }} />
        ))}

        {data.labels.map((label, li) => (
          <div key={li} className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
            onMouseEnter={() => setHovered(li)}
            onMouseLeave={() => setHovered(null)}>

            {/* Tooltip */}
            {hovered === li && (
              <div className="absolute bottom-full mb-2 rounded-lg p-2 z-10 text-xs whitespace-nowrap"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                {data!.datasets.map((ds, di) => (
                  <div key={di} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: ds.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{ds.label}:</span>
                    <span className="font-bold">{ds.data[li].toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="w-full flex gap-0.5 items-end h-full">
              {data!.datasets.map((ds, di) => {
                const h = getHeight(ds.data[li]);
                return (
                  <div key={di} className="flex-1 rounded-t-md transition-all duration-300"
                    style={{
                      height: `${Math.max(h, 4)}%`,
                      background: hovered === li
                        ? ds.color
                        : `linear-gradient(to top, ${ds.color}99, ${ds.color}cc)`,
                      opacity: hovered === null || hovered === li ? 1 : 0.4,
                    }} />
                );
              })}
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {data.datasets.map((ds, i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{ar ? 'إجمالي' : 'Total'} {ds.label}</p>
            <p className="text-lg font-extrabold" style={{ color: ds.color }}>
              {ds.data.reduce((a, b) => a + b, 0).toLocaleString()}
              <span className="text-xs font-normal ms-1" style={{ color: 'var(--text-muted)' }}>{ar ? 'ج.م' : 'EGP'}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
