// src/pages/profile/NotificationsPage.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  notificationsApi,
  NotificationItem,
  NotificationSettings,
  NotifType,
  UserRole,
  ROLE_NOTIF_TYPES,
  DEFAULT_SETTINGS,
} from '../../api/profileApi';

// ── Type config ──────────────────────────────────────────

interface NotifTypeConfig {
  icon: string;
  color: string;
  labelAr: string;
  labelEn: string;
}

const TYPE_CONFIG: Record<NotifType, NotifTypeConfig> = {
  disease:         { icon: '🦠', color: 'var(--rose)',    labelAr: 'أمراض',       labelEn: 'Disease'         },
  export:          { icon: '🚢', color: 'var(--cyan)',    labelAr: 'تصدير',       labelEn: 'Export'          },
  environment:     { icon: '🌱', color: 'var(--emerald)', labelAr: 'بيئة',        labelEn: 'Environment'     },
  report:          { icon: '📊', color: 'var(--amber)',   labelAr: 'تقارير',      labelEn: 'Reports'         },
  system:          { icon: '⚙️', color: 'var(--text-secondary)', labelAr: 'نظام', labelEn: 'System'          },
  marketplace:     { icon: '🏪', color: '#a78bfa',       labelAr: 'السوق',       labelEn: 'Marketplace'     },
  compliance:      { icon: '✅', color: '#f97316',        labelAr: 'الامتثال',    labelEn: 'Compliance'      },
  user_management: { icon: '👥', color: 'var(--rose)',    labelAr: 'المستخدمون',  labelEn: 'Users'           },
};

// ── Settings metadata ────────────────────────────────────

interface SettingMeta {
  key: keyof NotificationSettings;
  labelAr: string;
  labelEn: string;
  sublabelAr: string;
  sublabelEn: string;
  roles: UserRole[];
}

const SETTINGS_META: SettingMeta[] = [
  {
    key: 'disease',
    labelAr: 'إشعارات الأمراض', labelEn: 'Disease Alerts',
    sublabelAr: 'تنبيه فوري عند كشف مرض في محاصيلك', sublabelEn: 'Instant alert when a crop disease is detected',
    roles: ['farmer', 'admin'],
  },
  {
    key: 'export',
    labelAr: 'توصيات التصدير', labelEn: 'Export Recommendations',
    sublabelAr: 'إشعار عند اكتمال تقييم صلاحية التصدير', sublabelEn: 'Notify when export eligibility is assessed',
    roles: ['exporter', 'admin'],
  },
  {
    key: 'environment',
    labelAr: 'التنبيهات البيئية', labelEn: 'Environment Alerts',
    sublabelAr: 'إشعار عند وصول رطوبة أو حرارة لمستوى حرج', sublabelEn: 'Alert on critical humidity or temperature',
    roles: ['farmer', 'trader', 'exporter', 'admin'],
  },
  {
    key: 'reports',
    labelAr: 'التقارير الأسبوعية', labelEn: 'Weekly Reports',
    sublabelAr: 'إشعار عند اكتمال التقرير الأسبوعي', sublabelEn: 'Notify when your weekly report is ready',
    roles: ['farmer', 'trader', 'exporter', 'admin'],
  },
  {
    key: 'marketplace',
    labelAr: 'تنبيهات السوق', labelEn: 'Marketplace Alerts',
    sublabelAr: 'تغيرات الأسعار وعروض البيع والشراء', sublabelEn: 'Price changes, buy/sell offers',
    roles: ['trader', 'admin'],
  },
  {
    key: 'compliance',
    labelAr: 'تنبيهات الامتثال', labelEn: 'Compliance Alerts',
    sublabelAr: 'تجديد الشهادات وفحوصات MRL ومعايير الجودة', sublabelEn: 'Certificate renewals, MRL checks, quality standards',
    roles: ['exporter', 'admin'],
  },
  {
    key: 'system',
    labelAr: 'إشعارات النظام', labelEn: 'System Notifications',
    sublabelAr: 'تحديثات موديلات الذكاء الاصطناعي وأداء المنصة', sublabelEn: 'AI model updates and platform performance',
    roles: ['admin'],
  },
  {
    key: 'user_management',
    labelAr: 'إدارة المستخدمين', labelEn: 'User Management',
    sublabelAr: 'مستخدمون جدد وتغييرات في الأدوار', sublabelEn: 'New users and role changes',
    roles: ['admin'],
  },
  {
    key: 'emailAlerts',
    labelAr: 'تنبيهات البريد الإلكتروني', labelEn: 'Email Alerts',
    sublabelAr: 'إرسال نسخة من الإشعارات إلى بريدك الإلكتروني', sublabelEn: 'Send alert copies to your email',
    roles: ['farmer', 'trader', 'exporter', 'admin'],
  },
];

// ── Role labels ───────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, { ar: string; en: string; color: string }> = {
  admin:    { ar: 'مدير النظام', en: 'Admin',    color: 'var(--rose)'    },
  farmer:   { ar: 'مزارع',       en: 'Farmer',   color: 'var(--emerald)' },
  trader:   { ar: 'تاجر',        en: 'Trader',   color: '#a78bfa'        },
  exporter: { ar: 'مصدّر',       en: 'Exporter', color: 'var(--cyan)'    },
};

// ── Helpers ───────────────────────────────────────────────

function timeAgo(iso: string, ar: boolean): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return ar ? 'الآن'                     : 'Just now';
  if (diff < 3600)  return ar ? `${Math.floor(diff/60)} د`  : `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return ar ? `${Math.floor(diff/3600)} س`: `${Math.floor(diff/3600)}h ago`;
  return ar ? `${Math.floor(diff/86400)} يوم` : `${Math.floor(diff/86400)}d ago`;
}

type FilterKey = 'all' | NotifType;

// ── Setting toggle row ───────────────────────────────────

function SettingRow({
  label, sublabel, checked, onChange,
}: {
  label: string; sublabel: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sublabel}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors"
        style={{ background: checked ? 'var(--emerald-dim)' : 'rgba(255,255,255,0.1)' }}
      >
        <span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(calc(100% + 4px))' : 'translateX(4px)' }}
        />
      </button>
    </div>
  );
}

// ── Notification card ────────────────────────────────────

function NotifCard({
  notif, ar, onRead, onDelete,
}: {
  notif: NotificationItem; ar: boolean;
  onRead: (id: string) => void; onDelete: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  return (
    <div
      className="relative flex gap-4 p-4 rounded-xl mb-2 transition-all"
      style={{
        background: notif.read ? 'var(--bg-card)' : `${cfg.color}08`,
        border: `1px solid ${notif.read ? 'var(--border)' : cfg.color + '25'}`,
      }}
    >
      {!notif.read && (
        <div className="absolute top-4 end-4 w-2 h-2 rounded-full" style={{ background: cfg.color }} />
      )}

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: `${cfg.color}15` }}
      >
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
            {notif.title}
          </p>
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {timeAgo(notif.timestamp, ar)}
          </span>
        </div>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {notif.message}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${cfg.color}15`, color: cfg.color }}
          >
            {ar ? cfg.labelAr : cfg.labelEn}
          </span>

          {!notif.read && (
            <button
              onClick={() => onRead(notif.id)}
              className="text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--emerald)' }}
            >
              {ar ? 'تعيين كمقروء' : 'Mark as read'}
            </button>
          )}

          {notif.actionUrl && (
            <a
              href={notif.actionUrl}
              className="text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: 'var(--cyan)' }}
            >
              {ar ? 'عرض التفاصيل ←' : 'View →'}
            </a>
          )}

          <button
            onClick={() => onDelete(notif.id)}
            className="text-xs ms-auto transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            {ar ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────

const NotificationsPage: React.FC = () => {
  const { language, user } = useApp();
  const ar = language === 'ar';
  const role = (user?.role ?? 'farmer') as UserRole;

  const allowedTypes = ROLE_NOTIF_TYPES[role];
  const filterOptions: { key: FilterKey; labelAr: string; labelEn: string }[] = [
    { key: 'all', labelAr: 'الكل', labelEn: 'All' },
    ...allowedTypes.map(t => ({
      key: t as FilterKey,
      labelAr: TYPE_CONFIG[t].labelAr,
      labelEn: TYPE_CONFIG[t].labelEn,
    })),
  ];

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings]           = useState<NotificationSettings | null>(null);
  const [loading, setLoading]             = useState(true);
  const [activeFilter, setActiveFilter]   = useState<FilterKey>('all');
  const [activeTab, setActiveTab]         = useState<'feed' | 'settings'>('feed');
  const [savingSettings, setSavingSettings] = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      notificationsApi.getAll(role),
      notificationsApi.getSettings(role),
    ]).then(([nRes, sRes]) => {
      if (nRes.success) setNotifications(nRes.data);
      if (sRes.success) setSettings(sRes.data);
      setLoading(false);
    });
  }, [role]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleReadAll = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast(ar ? 'تم تعيين الكل كمقروء' : 'All marked as read');
  };

  const handleDelete = async (id: string) => {
    await notificationsApi.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    await notificationsApi.updateSettings(settings);
    setSavingSettings(false);
    showToast(ar ? 'تم حفظ الإعدادات' : 'Settings saved');
  };

  const filtered =
    activeFilter === 'all'
      ? notifications
      : notifications.filter(n => n.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.read).length;
  const rl = ROLE_LABELS[role];

  // Settings rows relevant to this role
  const relevantSettings = SETTINGS_META.filter(s => s.roles.includes(role));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--emerald)' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">

      {/* ── Page header ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {ar ? 'الإشعارات الذكية' : 'AI Alerts & Notifications'}
            </h1>
            {/* Role badge */}
            <span style={{
              padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              color: rl.color, background: `${rl.color}18`,
              border: `1px solid ${rl.color}30`,
            }}>
              {ar ? rl.ar : rl.en}
            </span>
          </div>
          {unreadCount > 0 && (
            <p className="text-xs" style={{ color: 'var(--emerald)' }}>
              {ar ? `${unreadCount} إشعار غير مقروء` : `${unreadCount} unread`}
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          {(['feed', 'settings'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activeTab === t ? 'var(--bg-card)' : 'transparent',
                color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                border: activeTab === t ? '1px solid var(--border-strong)' : '1px solid transparent',
              }}
            >
              {t === 'feed'
                ? (ar ? '🔔 الإشعارات' : '🔔 Feed')
                : (ar ? '⚙️ الإعدادات' : '⚙️ Settings')}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────── */}
      {/* TAB: Notifications Feed                        */}
      {/* ─────────────────────────────────────────────── */}
      {activeTab === 'feed' && (
        <>
          {/* Filter bar + actions */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="flex gap-1 flex-wrap flex-1">
              {filterOptions.map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: activeFilter === f.key ? 'var(--emerald-dim)' : 'var(--bg-card)',
                    color: activeFilter === f.key ? '#fff' : 'var(--text-muted)',
                    border: `1px solid ${activeFilter === f.key ? 'var(--emerald-dim)' : 'var(--border)'}`,
                  }}
                >
                  {f.key !== 'all' && TYPE_CONFIG[f.key as NotifType]?.icon + ' '}
                  {ar ? f.labelAr : f.labelEn}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleReadAll}
                className="text-xs font-semibold transition-colors hover:opacity-80 flex-shrink-0"
                style={{ color: 'var(--emerald)' }}
              >
                {ar ? 'تعيين الكل كمقروء' : 'Mark all read'}
              </button>
            )}
          </div>

          {/* Notifications list */}
          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 rounded-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <span className="text-4xl mb-3">🔕</span>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {ar ? 'لا توجد إشعارات' : 'No notifications'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {ar ? 'ستظهر هنا عند وجود تنبيهات جديدة' : 'New alerts will appear here'}
              </p>
            </div>
          ) : (
            filtered.map(n => (
              <NotifCard
                key={n.id}
                notif={n}
                ar={ar}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────── */}
      {/* TAB: Notification Settings                     */}
      {/* ─────────────────────────────────────────────── */}
      {activeTab === 'settings' && settings && (
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
            {ar ? 'اختر أنواع الإشعارات التي تريد استقبالها' : 'Choose which alerts you want to receive'}
          </p>

          {relevantSettings.map(s => (
            <SettingRow
              key={s.key}
              label={ar ? s.labelAr : s.labelEn}
              sublabel={ar ? s.sublabelAr : s.sublabelEn}
              checked={!!settings[s.key]}
              onChange={v => handleSettingChange(s.key, v)}
            />
          ))}

          <div className="flex justify-end mt-5">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {savingSettings ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                    style={{ display: 'inline-block' }}
                  />
                  {ar ? 'جارٍ الحفظ...' : 'Saving...'}
                </>
              ) : (
                ar ? 'حفظ الإعدادات' : 'Save Settings'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 end-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-2xl"
          style={{ background: 'var(--emerald-dim)', minWidth: 220 }}
        >
          ✓ {toast}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
