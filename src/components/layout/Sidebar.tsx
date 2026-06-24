import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

// ── Menu definition ───────────────────────────────────────────────────
const menuGroups = [
  {
    groupAr: 'المحطة الرئيسية',
    groupEn: 'Command',
    items: [
      {
        iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3',
        labelAr: 'لوحة القيادة', labelEn: 'Dashboard',
        href: '/dashboard', accent: 'emerald',
        roles: ['farmer', 'trader', 'exporter', 'admin'],
      },
      {
        iconPath: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8',
        labelAr: 'المساعد الذكي', labelEn: 'AI Assistant',
        href: '/chat', accent: 'cyan', badge: 'AI',
        roles: ['farmer', 'trader', 'exporter', 'admin'],
      },
    ],
  },
  {
    groupAr: 'لوحة التحكم',
    groupEn: 'Administration',
    items: [
      {
        iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5',
        labelAr: 'لوحة الأدمن', labelEn: 'Admin Panel',
        href: '/admin', accent: 'emerald',
        roles: ['admin'],
      },
    ],
  },
  {
    groupAr: 'الذكاء الزراعي',
    groupEn: 'Agri Intelligence',
    items: [
      {
        iconPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682',
        labelAr: 'صحة المحاصيل', labelEn: 'Crop Health',
        href: '/crop-health', accent: 'emerald',
        roles: ['farmer', 'admin'],
      },
      {
        iconPath: 'M7 20h10M12 20V10',
        labelAr: 'إدارة المزرعة', labelEn: 'Farm Management',
        href: '/farm', accent: 'emerald', badge: 'NEW',
        roles: ['farmer', 'admin'],
      },
      {
        iconPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18',
        labelAr: 'كشف الأمراض', labelEn: 'Disease Detection',
        href: '/disease', accent: 'rose', badge: '⚠ 2', badgeUrgent: true,
        roles: ['farmer', 'admin'],
      },
      {
        iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1 5h12',
        labelAr: 'السوق الزراعي', labelEn: 'Marketplace',
        href: '/marketplace', accent: 'emerald',
        roles: ['farmer', 'trader', 'exporter', 'admin'],
      },
    ],
  },
  {
    groupAr: 'التصدير والجودة',
    groupEn: 'Export & Quality',
    items: [
      {
        iconPath: 'M9 12l2 2 4-4',
        labelAr: 'تقييم الجودة', labelEn: 'Quality Assessment',
        href: '/quality', accent: 'amber',
        roles: ['trader', 'exporter', 'admin'],
      },
      {
        iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5',
        labelAr: 'وثائق التصدير', labelEn: 'Export Docs',
        href: '/export', accent: 'emerald',
        roles: ['exporter', 'admin'],
      },
    ],
  },
  {
    groupAr: 'التحليلات',
    groupEn: 'Analytics',
    items: [
      {
        iconPath: 'M9 17v-2m3 2v-4m3 4v-6',
        labelAr: 'التقارير', labelEn: 'Reports',
        href: '/reports', accent: 'cyan',
        roles: ['farmer', 'trader', 'exporter', 'admin'],
      },
      {
        iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11',
        labelAr: 'الإشعارات', labelEn: 'Notifications',
        href: '/notifications', accent: 'amber',
        roles: ['farmer', 'trader', 'exporter', 'admin'],
      },
      {
        iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0',
        labelAr: 'الإعدادات', labelEn: 'Settings',
        href: '/settings', accent: 'emerald',
        roles: ['farmer', 'trader', 'exporter', 'admin'],
      },
    ],
  },
];

const accentColors: Record<string, string> = {
  emerald: '#2ecc71',
  cyan:    '#06b6d4',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
};
const accentBg: Record<string, string> = {
  emerald: 'rgba(46,204,113,0.10)',
  cyan:    'rgba(6,182,212,0.10)',
  amber:   'rgba(245,158,11,0.10)',
  rose:    'rgba(244,63,94,0.10)',
};

// ── Component ─────────────────────────────────────────────────────────
export const Sidebar: React.FC = () => {
  const { user, language } = useApp();
  const ar = language === 'ar';
  const role = user?.role || 'admin';
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className="min-h-[calc(100vh-56px)] sticky top-14 flex flex-col w-[230px] border-e"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* User card */}
      <div
        className="m-3 p-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(22,163,74,0.14), rgba(8,145,178,0.07))',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #16a34a, #0891b2)' }}
          >
            {user?.name?.charAt(0) || 'أ'}
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {user?.name || (ar ? 'أحمد محمد' : 'Ahmed Mohamed')}
            </p>
            <p className="text-xs" style={{ color: 'var(--emerald)' }}>
              ● {ar ? 'متصل' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        {menuGroups.map((group, gi) => {
          const filtered = group.items.filter(i => i.roles.includes(role));
          if (!filtered.length) return null;
          return (
            <div key={gi}>
              <p
                className="px-3 mb-2"
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                }}
              >
                {ar ? group.groupAr : group.groupEn}
              </p>
              <div className="space-y-0.5">
                {filtered.map((item, ii) => {
                  const active = location.pathname === item.href;
                  const color = accentColors[item.accent] || accentColors.emerald;
                  const bg    = accentBg[item.accent]    || accentBg.emerald;

                  return (
                    <button
                      key={ii}
                      onClick={() => navigate(item.href)}
                      className="sidebar-item"
                      style={
                        active
                          ? { background: bg, color, border: `1px solid ${color}25` }
                          : {}
                      }
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={active ? 2.5 : 2}
                        style={{ color: active ? color : undefined }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                      </svg>
                      <span className="flex-1 truncate">{ar ? item.labelAr : item.labelEn}</span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '8px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 999,
                            background: (item as any).badgeUrgent
                              ? 'rgba(244,63,94,0.15)'
                              : 'rgba(46,204,113,0.14)',
                            color: (item as any).badgeUrgent ? '#f43f5e' : '#2ecc71',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 m-3 rounded-xl"
        style={{ background: 'rgba(46,204,113,0.04)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="live-dot" style={{ width: '5px', height: '5px' }} />
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {ar ? 'النظام نشط' : 'System Active'}
          </span>
        </div>
        <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
          {ar ? 'آخر مزامنة: قبل دقيقتين' : 'Last sync: 2 min ago'}
        </p>
      </div>
    </aside>
  );
};