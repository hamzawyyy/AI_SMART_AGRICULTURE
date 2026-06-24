import React from 'react';
import type{ ActivityItem } from '../../types';

interface RecentActivityProps {
  activities: ActivityItem[];
  language?: 'ar' | 'en';
}

const typeConfig = {
  order:    { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  shipment: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
  alert:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  message:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
};

const demoActivities: ActivityItem[] = [
  { id: '1', type: 'alert', title: 'كشف مرض في محاصيل الطماطم', description: 'AI اكتشف علامات اللفحة المبكرة في القطعة C-4', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), status: 'warning' },
  { id: '2', type: 'shipment', title: 'شحنة تصدير تمت بنجاح', description: '12 طن برتقال — السوق الأوروبية', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), status: 'success' },
  { id: '3', type: 'order', title: 'طلب جديد من باير اجروسيانس', description: 'موافقة على صفقة الفراولة بقيمة 85,000 ج.م', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'success' },
  { id: '4', type: 'message', title: 'تقرير AI الأسبوعي جاهز', description: 'تحليل الإنتاجية والتوصيات المحدثة', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), status: 'info' },
];

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, language = 'ar' }) => {
  const ar = language === 'ar';
  const items = activities.length > 0 ? activities : demoActivities;

  const formatTime = (ts: string) => {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000 / 60);
    if (!ar) {
      if (diff < 1) return 'just now';
      if (diff < 60) return `${diff}m ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
      return `${Math.floor(diff / 1440)}d ago`;
    }
    if (diff < 1) return 'الآن';
    if (diff < 60) return `منذ ${diff} دقيقة`;
    if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`;
    return `منذ ${Math.floor(diff / 1440)} يوم`;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {ar ? 'السجل الذكي' : 'AI Activity Log'}
          </h3>
          <span className="ai-badge">Live</span>
        </div>
        <button className="text-xs font-bold transition-colors" style={{ color: 'var(--emerald)' }}>
          {ar ? 'عرض الكل' : 'View all'} →
        </button>
      </div>

      <div className="space-y-1">
        {items.map((item, i) => {
          const cfg = typeConfig[item.type as keyof typeof typeConfig] || typeConfig.message;
          return (
            <div key={item.id || i}
              className="flex items-start gap-3 p-3 rounded-xl transition-all duration-150 cursor-default group"
              style={{ animationDelay: `${i * 60}ms` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>

              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: cfg.bg, color: cfg.color }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
              </div>

              <p className="text-xs flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatTime(item.timestamp)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
