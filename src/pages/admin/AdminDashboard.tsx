import React, { useState, useCallback } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { useApp } from '../../context/AppContext';

// ── Types ─────────────────────────────────────────────────────
type UserRole = 'farmer' | 'trader' | 'exporter' | 'admin';
type UserStatus = 'active' | 'suspended' | 'pending';
type AlertLevel = 'critical' | 'warning' | 'info' | 'success';
type PlatformSection = 'overview' | 'users' | 'system' | 'logs' | 'ai';

interface PlatformUser {
  id: string;
  nameAr: string;
  nameEn: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  joinDateEn: string;
  lastActive: string;
  lastActiveEn: string;
  region: string;
  regionEn: string;
  revenue: string;
  actionsCount: number;
  avatar: string;
}

interface SystemAlert {
  id: string;
  level: AlertLevel;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  time: string;
  timeEn: string;
  resolved: boolean;
  source: string;
}

interface ActivityLog {
  id: string;
  userAr: string;
  userEn: string;
  role: UserRole;
  actionAr: string;
  actionEn: string;
  module: string;
  time: string;
  timeEn: string;
  ip: string;
  status: 'success' | 'failed' | 'warning';
}

interface AIModel {
  id: string;
  nameAr: string;
  nameEn: string;
  accuracy: number;
  requests: number;
  avgLatency: number;
  status: 'online' | 'degraded' | 'offline';
  lastTrained: string;
  lastTrainedEn: string;
  version: string;
}

// ── Data ──────────────────────────────────────────────────────
const USERS: PlatformUser[] = [
  { id: 'u1', nameAr: 'أحمد الخضيري', nameEn: 'Ahmed Al-Khodairy', email: 'ahmed@agri.com', role: 'farmer', status: 'active', joinDate: 'يناير 2025', joinDateEn: 'Jan 2025', lastActive: 'منذ 5 دقائق', lastActiveEn: '5m ago', region: 'الجيزة', regionEn: 'Giza', revenue: '$84K', actionsCount: 342, avatar: 'أ' },
  { id: 'u2', nameAr: 'سارة حسن', nameEn: 'Sara Hassan', email: 'sara@trade.com', role: 'trader', status: 'active', joinDate: 'مارس 2025', joinDateEn: 'Mar 2025', lastActive: 'منذ 2 ساعة', lastActiveEn: '2h ago', region: 'الإسكندرية', regionEn: 'Alexandria', revenue: '$210K', actionsCount: 511, avatar: 'س' },
  { id: 'u3', nameAr: 'محمد طارق', nameEn: 'Mohamed Tarek', email: 'mtarek@export.eg', role: 'exporter', status: 'active', joinDate: 'فبراير 2025', joinDateEn: 'Feb 2025', lastActive: 'منذ 1 ساعة', lastActiveEn: '1h ago', region: 'القاهرة', regionEn: 'Cairo', revenue: '$640K', actionsCount: 289, avatar: 'م' },
  { id: 'u4', nameAr: 'ريم العمري', nameEn: 'Reem Al-Omari', email: 'reem@farm.net', role: 'farmer', status: 'pending', joinDate: 'يونيو 2026', joinDateEn: 'Jun 2026', lastActive: 'منذ يوم', lastActiveEn: '1d ago', region: 'أسيوط', regionEn: 'Asyut', revenue: '$0', actionsCount: 4, avatar: 'ر' },
  { id: 'u5', nameAr: 'خالد فوزي', nameEn: 'Khaled Fawzy', email: 'kfawzy@biz.com', role: 'trader', status: 'suspended', joinDate: 'أبريل 2025', joinDateEn: 'Apr 2025', lastActive: 'منذ 14 يوم', lastActiveEn: '14d ago', region: 'المنصورة', regionEn: 'Mansoura', revenue: '$32K', actionsCount: 78, avatar: 'خ' },
  { id: 'u6', nameAr: 'نهى سليم', nameEn: 'Noha Saleem', email: 'noha@exports.eg', role: 'exporter', status: 'active', joinDate: 'نوفمبر 2024', joinDateEn: 'Nov 2024', lastActive: 'منذ 30 دقيقة', lastActiveEn: '30m ago', region: 'بورسعيد', regionEn: 'Port Said', revenue: '$420K', actionsCount: 634, avatar: 'ن' },
  { id: 'u7', nameAr: 'يوسف البرعي', nameEn: 'Youssef Al-Baraei', email: 'youssef@farm.io', role: 'farmer', status: 'active', joinDate: 'ديسمبر 2024', joinDateEn: 'Dec 2024', lastActive: 'الآن', lastActiveEn: 'Now', region: 'الفيوم', regionEn: 'Faiyum', revenue: '$56K', actionsCount: 198, avatar: 'ي' },
  { id: 'u8', nameAr: 'دينا وهبة', nameEn: 'Dina Wahba', email: 'dina@tradeup.com', role: 'trader', status: 'active', joinDate: 'سبتمبر 2024', joinDateEn: 'Sep 2024', lastActive: 'منذ 3 ساعات', lastActiveEn: '3h ago', region: 'طنطا', regionEn: 'Tanta', revenue: '$178K', actionsCount: 456, avatar: 'د' },
];

const ALERTS: SystemAlert[] = [
  { id: 'a1', level: 'critical', titleAr: 'خطأ في نموذج AI كشف الأمراض', titleEn: 'Disease Detection AI Model Error', descAr: 'نموذج YOLOv9-Agri يُعيد نتائج بدقة 61% — أقل من الحد الأدنى 90%', descEn: 'YOLOv9-Agri returning 61% accuracy — below 90% minimum threshold', time: 'منذ 12 دقيقة', timeEn: '12m ago', resolved: false, source: 'AI Engine' },
  { id: 'a2', level: 'critical', titleAr: 'محاولة وصول غير مصرح به', titleEn: 'Unauthorized Access Attempt', descAr: '47 محاولة تسجيل دخول فاشلة من IP 185.220.101.x في 10 دقائق', descEn: '47 failed login attempts from IP 185.220.101.x in 10 minutes', time: 'منذ 34 دقيقة', timeEn: '34m ago', resolved: false, source: 'Security' },
  { id: 'a3', level: 'warning', titleAr: 'استهلاك API مرتفع', titleEn: 'High API Usage', descAr: 'استهلاك OpenAI API وصل 87% من الحد الشهري. المتبقي: $260', descEn: 'OpenAI API at 87% of monthly limit. Remaining: $260', time: 'منذ 1 ساعة', timeEn: '1h ago', resolved: false, source: 'Billing' },
  { id: 'a4', level: 'warning', titleAr: 'قاعدة بيانات: استخدام تخزين مرتفع', titleEn: 'Database Storage High', descAr: 'PostgreSQL وصلت 78% من سعة التخزين. يُنصح بالتوسع قبل 30 يوم.', descEn: 'PostgreSQL at 78% storage capacity. Expansion recommended within 30 days.', time: 'منذ 3 ساعات', timeEn: '3h ago', resolved: false, source: 'Database' },
  { id: 'a5', level: 'info', titleAr: 'مستخدم جديد ينتظر الموافقة', titleEn: 'New User Awaiting Approval', descAr: 'ريم العمري — طلبت انضمام بدور مزارع من محافظة أسيوط', descEn: 'Reem Al-Omari — requested farmer role from Asyut governorate', time: 'منذ 6 ساعات', timeEn: '6h ago', resolved: false, source: 'User Mgmt' },
  { id: 'a6', level: 'success', titleAr: 'نسخ احتياطي اكتمل بنجاح', titleEn: 'Backup Completed Successfully', descAr: 'نسخ احتياطي يومي لقاعدة البيانات اكتمل — 4.2 GB — S3 bucket', descEn: 'Daily database backup completed — 4.2 GB — S3 bucket', time: 'منذ 8 ساعات', timeEn: '8h ago', resolved: true, source: 'Backup' },
];

const LOGS: ActivityLog[] = [
  { id: 'l1', userAr: 'محمد طارق', userEn: 'Mohamed Tarek', role: 'exporter', actionAr: 'رفع شهادة جودة GlobalGAP', actionEn: 'Uploaded GlobalGAP quality certificate', module: 'Export Docs', time: 'الآن', timeEn: 'Now', ip: '41.33.200.12', status: 'success' },
  { id: 'l2', userAr: 'سارة حسن', userEn: 'Sara Hassan', role: 'trader', actionAr: 'نشر منتج جديد في السوق', actionEn: 'Published new product in marketplace', module: 'Marketplace', time: 'منذ 4 دقائق', timeEn: '4m ago', ip: '41.65.88.201', status: 'success' },
  { id: 'l3', userAr: 'مجهول', userEn: 'Unknown', role: 'farmer', actionAr: 'محاولة تسجيل دخول فاشلة', actionEn: 'Failed login attempt', module: 'Auth', time: 'منذ 8 دقائق', timeEn: '8m ago', ip: '185.220.101.47', status: 'failed' },
  { id: 'l4', userAr: 'أحمد الخضيري', userEn: 'Ahmed Al-Khodairy', role: 'farmer', actionAr: 'تشغيل AI لفحص صحة محاصيل', actionEn: 'Ran AI crop health scan', module: 'Crop Health', time: 'منذ 11 دقيقة', timeEn: '11m ago', ip: '196.219.44.9', status: 'success' },
  { id: 'l5', userAr: 'نهى سليم', userEn: 'Noha Saleem', role: 'exporter', actionAr: 'طلب تقرير تصدير شهري', actionEn: 'Generated monthly export report', module: 'Reports', time: 'منذ 18 دقيقة', timeEn: '18m ago', ip: '41.47.23.5', status: 'success' },
  { id: 'l6', userAr: 'خالد فوزي', userEn: 'Khaled Fawzy', role: 'trader', actionAr: 'محاولة تعديل سعر بعد الإغلاق', actionEn: 'Attempted price edit after market close', module: 'Marketplace', time: 'منذ 25 دقيقة', timeEn: '25m ago', ip: '41.33.199.77', status: 'warning' },
  { id: 'l7', userAr: 'يوسف البرعي', userEn: 'Youssef Al-Baraei', role: 'farmer', actionAr: 'تحديث بيانات المزرعة', actionEn: 'Updated farm data', module: 'Farm Mgmt', time: 'منذ 31 دقيقة', timeEn: '31m ago', ip: '197.32.14.5', status: 'success' },
  { id: 'l8', userAr: 'دينا وهبة', userEn: 'Dina Wahba', role: 'trader', actionAr: 'تصدير بيانات العملاء CSV', actionEn: 'Exported customer data as CSV', module: 'Reports', time: 'منذ 42 دقيقة', timeEn: '42m ago', ip: '41.65.30.101', status: 'success' },
];

const AI_MODELS: AIModel[] = [
  { id: 'm1', nameAr: 'كشف أمراض المحاصيل', nameEn: 'Crop Disease Detection', accuracy: 97.4, requests: 14823, avgLatency: 210, status: 'online', lastTrained: 'يونيو 10, 2026', lastTrainedEn: 'Jun 10, 2026', version: 'YOLOv9-Agri v3.2' },
  { id: 'm2', nameAr: 'تحليل جودة التصدير', nameEn: 'Export Quality Analysis', accuracy: 96.1, requests: 8341, avgLatency: 380, status: 'online', lastTrained: 'مايو 28, 2026', lastTrainedEn: 'May 28, 2026', version: 'QualityNet v2.1' },
  { id: 'm3', nameAr: 'توصيات السوق AI', nameEn: 'Market AI Recommendations', accuracy: 88.7, requests: 22104, avgLatency: 145, status: 'online', lastTrained: 'يونيو 1, 2026', lastTrainedEn: 'Jun 1, 2026', version: 'GPT-4o Fine-tuned' },
  { id: 'm4', nameAr: 'تحليل صور الأقمار الصناعية', nameEn: 'Satellite Image Analysis', accuracy: 91.3, requests: 5620, avgLatency: 820, status: 'degraded', lastTrained: 'مايو 15, 2026', lastTrainedEn: 'May 15, 2026', version: 'SatNet-Agri v1.4' },
  { id: 'm5', nameAr: 'توقعات الطقس الزراعي', nameEn: 'Agri Weather Forecasting', accuracy: 94.2, requests: 31200, avgLatency: 95, status: 'online', lastTrained: 'يونيو 18, 2026', lastTrainedEn: 'Jun 18, 2026', version: 'ECMWF-ML v5.0' },
];

// ── Helpers ───────────────────────────────────────────────────
const roleColor: Record<UserRole, string> = { farmer: 'var(--emerald)', trader: 'var(--cyan)', exporter: '#a78bfa', admin: 'var(--amber)' };
const roleLabel: Record<UserRole, { ar: string; en: string }> = { farmer: { ar: 'مزارع', en: 'Farmer' }, trader: { ar: 'تاجر', en: 'Trader' }, exporter: { ar: 'مُصدّر', en: 'Exporter' }, admin: { ar: 'أدمن', en: 'Admin' } };
const statusColor: Record<UserStatus, string> = { active: 'var(--emerald)', suspended: 'var(--rose)', pending: 'var(--amber)' };
const statusLabel: Record<UserStatus, { ar: string; en: string }> = { active: { ar: 'نشط', en: 'Active' }, suspended: { ar: 'موقوف', en: 'Suspended' }, pending: { ar: 'انتظار', en: 'Pending' } };
const alertColor: Record<AlertLevel, string> = { critical: 'var(--rose)', warning: 'var(--amber)', info: 'var(--cyan)', success: 'var(--emerald)' };
const alertBg:    Record<AlertLevel, string> = { critical: 'rgba(244,63,94,0.08)', warning: 'rgba(251,191,36,0.08)', info: 'rgba(34,211,238,0.08)', success: 'rgba(52,211,153,0.08)' };
const alertBorder:Record<AlertLevel, string> = { critical: 'rgba(244,63,94,0.3)', warning: 'rgba(251,191,36,0.3)', info: 'rgba(34,211,238,0.3)', success: 'rgba(52,211,153,0.3)' };
const logStatusColor: Record<ActivityLog['status'], string> = { success: 'var(--emerald)', failed: 'var(--rose)', warning: 'var(--amber)' };
const modelStatusColor: Record<AIModel['status'], string> = { online: 'var(--emerald)', degraded: 'var(--amber)', offline: 'var(--rose)' };
const modelStatusLabel: Record<AIModel['status'], { ar: string; en: string }> = { online: { ar: 'يعمل', en: 'Online' }, degraded: { ar: 'تدهور', en: 'Degraded' }, offline: { ar: 'معطل', en: 'Offline' } };

// ── Icon helper ───────────────────────────────────────────────
const Icon: React.FC<{ d: string; size?: number; color?: string; sw?: number }> = ({ d, size = 16, color = 'currentColor', sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ── Mini bar chart ────────────────────────────────────────────
const SparkBar: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 32 }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, background: color, opacity: 0.3 + (v / max) * 0.7, borderRadius: '2px 2px 0 0', height: `${(v / max) * 100}%`, transition: 'height 1s ease' }} />
      ))}
    </div>
  );
};

// ── Accuracy ring ─────────────────────────────────────────────
const AccuracyRing: React.FC<{ value: number; color: string; size?: number }> = ({ value, color, size = 44 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
const AdminDashboard: React.FC = () => {
  const { language } = useApp();
  const ar = language === 'ar';

  const [activeSection, setActiveSection] = useState<PlatformSection>('overview');
  const [alerts, setAlerts] = useState<SystemAlert[]>(ALERTS);
  const [users, setUsers] = useState<PlatformUser[]>(USERS);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | UserStatus>('all');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  }, []);

  const toggleUserStatus = useCallback((id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  }, []);

  const approveUser = useCallback((id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));
  }, []);

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalCount = unresolvedAlerts.filter(a => a.level === 'critical').length;

  const filteredUsers = users.filter(u => {
    const matchSearch = userSearch === '' || u.nameAr.includes(userSearch) || u.nameEn.toLowerCase().includes(userSearch.toLowerCase()) || u.email.includes(userSearch);
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', border: 'none', transition: 'all .15s',
    background: activeSection === t ? 'rgba(52,211,153,0.15)' : 'transparent',
    color: activeSection === t ? 'var(--emerald)' : 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', gap: 6, position: 'relative',
  });

  return (
    <div className="animate-fadeInUp space-y-6 pb-8">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--amber)', textTransform: 'uppercase' }}>
              {ar ? 'لوحة إدارة النظام' : 'System Admin Panel'}
            </span>
            <span className="ai-badge" style={{ color: criticalCount > 0 ? 'var(--rose)' : 'var(--emerald)', background: criticalCount > 0 ? 'rgba(244,63,94,0.12)' : 'rgba(52,211,153,0.12)', borderColor: criticalCount > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(52,211,153,0.25)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: criticalCount > 0 ? 'var(--rose)' : 'var(--emerald)', display: 'inline-block', marginInlineEnd: 4, animation: 'pulse-ring 2s infinite' }} />
              {criticalCount > 0 ? `${criticalCount} ${ar ? 'تنبيه حرج' : 'critical alerts'}` : (ar ? 'النظام يعمل' : 'System Healthy')}
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {ar ? 'إدارة منصة AgriMind AI' : 'AgriMind AI Platform Admin'}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {ar ? `${users.length} مستخدم · ${AI_MODELS.length} نماذج AI · ${unresolvedAlerts.length} تنبيه نشط · وقت تشغيل 99.8%`
                : `${users.length} users · ${AI_MODELS.length} AI models · ${unresolvedAlerts.length} active alerts · 99.8% uptime`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {criticalCount > 0 && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 10, padding: '7px 13px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rose)', animation: 'pulse-ring 1.5s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)' }}>{criticalCount} {ar ? 'تنبيه حرج' : 'critical'}</span>
            </div>
          )}
          <button style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: 'var(--amber)', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={14} color="var(--amber)" />
            {ar ? 'تصدير تقرير' : 'Export Report'}
          </button>
          <button style={{ background: 'linear-gradient(135deg,#d97706,#fbbf24)', border: 'none', color: '#000', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d="M12 5v14M5 12l7-7 7 7" size={14} color="#000" />
            {ar ? 'إضافة مستخدم' : 'Add User'}
          </button>
        </div>
      </div>

      {/* ── PLATFORM STATS STRIP ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {[
          { label: ar ? 'إجمالي المستخدمين' : 'Total Users',     val: users.length,                                                   unit: ar ? 'مستخدم' : 'users',   color: 'var(--emerald)', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
          { label: ar ? 'نشطون اليوم'        : 'Active Today',    val: users.filter(u => u.status === 'active').length,               unit: ar ? 'نشط'    : 'active',   color: 'var(--cyan)',    icon: 'M5 12h14M12 5l7 7-7 7' },
          { label: ar ? 'تنبيهات نشطة'       : 'Active Alerts',   val: unresolvedAlerts.length,                                        unit: ar ? 'تنبيه'  : 'alerts',   color: criticalCount > 0 ? 'var(--rose)' : 'var(--amber)', icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z' },
          { label: ar ? 'نماذج AI'            : 'AI Models',       val: AI_MODELS.length,                                               unit: ar ? 'نموذج'  : 'models',   color: '#a78bfa',        icon: 'm12 3-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3z' },
          { label: ar ? 'دقة AI متوسطة'       : 'Avg AI Accuracy', val: `${(AI_MODELS.reduce((s, m) => s + m.accuracy, 0) / AI_MODELS.length).toFixed(1)}%`, unit: '', color: 'var(--emerald)', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: ar ? 'طلبات API اليوم'    : "Today's API Reqs", val: '82.1K',                                                       unit: ar ? 'طلب'    : 'req',      color: 'var(--cyan)',    icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        ].map((item, i) => (
          <div key={i} className="card animate-fadeInUp" style={{ padding: '12px 14px', position: 'relative', overflow: 'hidden', animationDelay: `${i * 0.06}s` }}>
            <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 2, background: `linear-gradient(90deg, ${item.color}55, ${item.color})` }} />
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.3 }}>{item.label}</span>
              <Icon d={item.icon} size={12} color={item.color} />
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.val}</p>
            {item.unit && <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{item.unit}</p>}
          </div>
        ))}
      </div>

      {/* ── TAB BAR ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 4, width: 'fit-content', flexWrap: 'wrap' }}>
        {[
          { key: 'overview', labelAr: '🏠 نظرة عامة',        labelEn: '🏠 Overview' },
          { key: 'users',    labelAr: '👥 إدارة المستخدمين', labelEn: '👥 User Management' },
          { key: 'system',   labelAr: '⚡ التنبيهات',         labelEn: '⚡ Alerts' },
          { key: 'logs',     labelAr: '📋 سجل النشاط',       labelEn: '📋 Activity Log' },
          { key: 'ai',       labelAr: '🤖 نماذج AI',          labelEn: '🤖 AI Models' },
        ].map(tab => (
          <button key={tab.key} style={tabStyle(tab.key)} onClick={() => setActiveSection(tab.key as PlatformSection)}>
            {ar ? tab.labelAr : tab.labelEn}
            {tab.key === 'system' && criticalCount > 0 && (
              <span style={{ position: 'absolute', top: 4, insetInlineEnd: 4, width: 14, height: 14, background: 'var(--rose)', borderRadius: '50%', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                {criticalCount}
              </span>
            )}
            {tab.key === 'users' && users.filter(u => u.status === 'pending').length > 0 && (
              <span style={{ position: 'absolute', top: 4, insetInlineEnd: 4, width: 14, height: 14, background: 'var(--amber)', borderRadius: '50%', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800 }}>
                {users.filter(u => u.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION: OVERVIEW
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

          {/* Platform activity chart */}
          <div className="card animate-fadeInUp" style={{ padding: 20 }}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? 'نشاط المنصة - آخر 7 أيام' : 'Platform Activity - Last 7 Days'}</p>
              <div className="flex items-center gap-8">
                {[{ label: ar ? 'مستخدمون' : 'Users', color: 'var(--emerald)' }, { label: ar ? 'طلبات AI' : 'AI Requests', color: '#a78bfa' }].map((l, li) => (
                  <div key={li} className="flex items-center gap-1.5"><div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} /><span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{l.label}</span></div>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={(ar ? ['س', 'أ', 'ث', 'ر', 'خ', 'ج', 'ح'] : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map((day, di) => ({
                    day,
                    users: [28, 35, 42, 31, 44, 52, 48][di],
                    aiRequests: [120, 180, 210, 160, 220, 310, 280][di],
                  }))}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RTooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 11 }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="aiRequests" name={ar ? 'طلبات AI' : 'AI Requests'} fill="#a78bfa" radius={[6, 6, 0, 0]} barSize={16} opacity={0.55} />
                  <Line type="monotone" dataKey="users" name={ar ? 'مستخدمون' : 'Users'} stroke="var(--emerald)" strokeWidth={2.5}
                    dot={{ r: 3, fill: 'var(--emerald)', strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User role breakdown */}
          <div className="card animate-fadeInUp" style={{ padding: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{ar ? 'توزيع الأدوار' : 'Role Distribution'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['farmer', 'trader', 'exporter', 'admin'] as UserRole[]).map(role => {
                const count = users.filter(u => u.role === role).length;
                const pct = Math.round((count / users.length) * 100);
                const color = roleColor[role];
                return (
                  <div key={role}>
                    <div className="flex justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{ar ? roleLabel[role].ar : roleLabel[role].en}</span>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="health-bar">
                      <div className="health-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical alerts preview */}
          <div className="card animate-fadeInUp animate-fadeInUp-delay-1" style={{ padding: 18 }}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? 'آخر التنبيهات' : 'Recent Alerts'}</p>
              <button onClick={() => setActiveSection('system')} style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', background: 'none', border: 'none' }}>{ar ? 'عرض الكل ←' : 'View all →'}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unresolvedAlerts.slice(0, 4).map(alert => {
                const color = alertColor[alert.level];
                const bg = alertBg[alert.level];
                return (
                  <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: bg, borderRadius: 10, borderInlineStart: `3px solid ${color}` }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{ar ? alert.titleAr : alert.titleEn}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{ar ? alert.descAr : alert.descEn}</p>
                    </div>
                    <span style={{ fontSize: 9, color, fontWeight: 700, flexShrink: 0 }}>{ar ? alert.time : alert.timeEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System health */}
          <div className="card animate-fadeInUp animate-fadeInUp-delay-1" style={{ padding: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{ar ? 'صحة النظام' : 'System Health'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: ar ? 'وقت التشغيل' : 'Uptime',          val: '99.8%', color: 'var(--emerald)', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', spark: [98,99,100,99,100,99,100] },
                { label: ar ? 'استخدام CPU' : 'CPU Usage',        val: '42%',  color: 'var(--cyan)',    icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18', spark: [30,45,38,55,42,50,42] },
                { label: ar ? 'استخدام الذاكرة' : 'Memory',       val: '61%',  color: 'var(--amber)',   icon: 'M4 4h16v4H4zM4 10h16v4H4zM4 16h16v4H4z',             spark: [55,58,60,59,63,61,61] },
                { label: ar ? 'استخدام قاعدة البيانات' : 'DB Load', val: '78%', color: 'var(--rose)',   icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7',             spark: [60,65,70,72,75,78,78] },
                { label: ar ? 'معدل استجابة API' : 'API Response', val: '142ms', color: 'var(--emerald)', icon: 'M13 10V3L4 14h7v7l9-11h-7z',                         spark: [180,160,145,155,140,142,142] },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon d={item.icon} size={13} color={item.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{item.label}</p>
                  </div>
                  <div style={{ width: 60, flexShrink: 0 }}>
                    <SparkBar data={item.spark} color={item.color} height={24} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: item.color, flexShrink: 0, minWidth: 44, textAlign: 'end' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION: USERS
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 360px' : '1fr', gap: 16, alignItems: 'start' }}>
          <div>
            {/* Pending banner */}
            {users.some(u => u.status === 'pending') && (
              <div className="animate-fadeInUp" style={{ marginBottom: 12, padding: '12px 16px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={18} color="var(--amber)" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--amber)' }}>{users.filter(u => u.status === 'pending').length} {ar ? 'مستخدم ينتظر الموافقة' : 'user(s) awaiting approval'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{ar ? 'راجع الطلبات في القائمة أدناه وافعّل أو ارفض' : 'Review requests below and activate or reject'}</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Icon d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" size={14} color="var(--text-muted)" />
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder={ar ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
                  style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 14px 8px 36px', fontSize: 12, color: 'var(--text-primary)', outline: 'none', position: 'static' }} />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', top: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              {(['all', 'farmer', 'trader', 'exporter', 'admin'] as const).map(r => {
                const label = r === 'all' ? (ar ? 'الكل' : 'All') : ar ? roleLabel[r as UserRole].ar : roleLabel[r as UserRole].en;
                const color = r === 'all' ? 'var(--emerald)' : roleColor[r as UserRole];
                const active = userRoleFilter === r;
                return (
                  <button key={r} onClick={() => setUserRoleFilter(r)}
                    style={{ padding: '6px 13px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: active ? `1px solid ${color}55` : '1px solid var(--border)', background: active ? `${color}15` : 'transparent', color: active ? color : 'var(--text-secondary)' }}>
                    {label}
                  </button>
                );
              })}
              {(['all', 'active', 'pending', 'suspended'] as const).map(s => {
                const label = s === 'all' ? (ar ? 'الحالة' : 'Status') : ar ? statusLabel[s as UserStatus].ar : statusLabel[s as UserStatus].en;
                const color = s === 'all' ? 'var(--text-secondary)' : statusColor[s as UserStatus];
                const active = userStatusFilter === s;
                return (
                  <button key={s} onClick={() => setUserStatusFilter(s)}
                    style={{ padding: '6px 13px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: active ? `1px solid ${color}55` : '1px solid var(--border)', background: active ? `${color}15` : 'transparent', color: active ? color : 'var(--text-secondary)' }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Users table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr auto', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {[ar ? 'المستخدم' : 'User', ar ? 'الدور' : 'Role', ar ? 'المنطقة' : 'Region', ar ? 'آخر نشاط' : 'Last Active', ar ? 'الحالة' : 'Status', ar ? 'إجراء' : 'Action'].map((h, hi) => (
                  <span key={hi} style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {filteredUsers.map((user, i) => {
                  const rc = roleColor[user.role];
                  const sc = statusColor[user.status];
                  const isSelected = selectedUser?.id === user.id;
                  return (
                    <div key={user.id}
                      style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr 1fr auto', gap: 12, padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', cursor: 'pointer', background: isSelected ? 'rgba(52,211,153,0.04)' : 'transparent', transition: 'background .15s' }}
                      onClick={() => setSelectedUser(isSelected ? null : user)}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>

                      {/* User */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${rc}44, ${rc}22)`, border: `2px solid ${rc}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: rc, flexShrink: 0 }}>
                          {user.avatar}
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{ar ? user.nameAr : user.nameEn}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{user.email}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 999, background: `${rc}15`, color: rc, fontWeight: 800, display: 'inline-block', width: 'fit-content' }}>
                        {ar ? roleLabel[user.role].ar : roleLabel[user.role].en}
                      </span>

                      {/* Region */}
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{ar ? user.region : user.regionEn}</span>

                      {/* Last active */}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ar ? user.lastActive : user.lastActiveEn}</span>

                      {/* Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc, ...(user.status === 'active' ? { animation: 'pulse-ring 2s infinite' } : {}) }} />
                        <span style={{ fontSize: 11, color: sc, fontWeight: 700 }}>{ar ? statusLabel[user.status].ar : statusLabel[user.status].en}</span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
                        {user.status === 'pending' && (
                          <button onClick={() => approveUser(user.id)} style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: 'var(--emerald)', padding: '4px 8px', borderRadius: 7, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
                            {ar ? 'قبول' : 'Approve'}
                          </button>
                        )}
                        {user.status !== 'pending' && (
                          <button onClick={() => toggleUserStatus(user.id)} style={{ background: user.status === 'active' ? 'rgba(244,63,94,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${user.status === 'active' ? 'rgba(244,63,94,0.25)' : 'rgba(52,211,153,0.25)'}`, color: user.status === 'active' ? 'var(--rose)' : 'var(--emerald)', padding: '4px 8px', borderRadius: 7, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
                            {user.status === 'active' ? (ar ? 'إيقاف' : 'Suspend') : (ar ? 'تفعيل' : 'Activate')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User detail panel */}
          {selectedUser && (
            <div className="card animate-fadeInUp" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 90 }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: `linear-gradient(135deg, ${roleColor[selectedUser.role]}18, rgba(255,255,255,0.01))` }}>
                <div className="flex items-start justify-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor[selectedUser.role]}44, ${roleColor[selectedUser.role]}22)`, border: `2px solid ${roleColor[selectedUser.role]}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: roleColor[selectedUser.role] }}>
                      {selectedUser.avatar}
                    </div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? selectedUser.nameAr : selectedUser.nameEn}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{selectedUser.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '5px 8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Icon d="M6 18L18 6M6 6l12 12" size={14} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: ar ? 'الدور' : 'Role',                 val: ar ? roleLabel[selectedUser.role].ar : roleLabel[selectedUser.role].en,     color: roleColor[selectedUser.role] },
                  { label: ar ? 'الحالة' : 'Status',              val: ar ? statusLabel[selectedUser.status].ar : statusLabel[selectedUser.status].en, color: statusColor[selectedUser.status] },
                  { label: ar ? 'المنطقة' : 'Region',             val: ar ? selectedUser.region : selectedUser.regionEn,                              color: 'var(--text-primary)' },
                  { label: ar ? 'تاريخ الانضمام' : 'Joined',     val: ar ? selectedUser.joinDate : selectedUser.joinDateEn,                         color: 'var(--text-primary)' },
                  { label: ar ? 'آخر نشاط' : 'Last Active',      val: ar ? selectedUser.lastActive : selectedUser.lastActiveEn,                     color: 'var(--text-primary)' },
                  { label: ar ? 'إجمالي الإيرادات' : 'Revenue',  val: selectedUser.revenue,                                                          color: 'var(--cyan)' },
                  { label: ar ? 'عدد الإجراءات' : 'Actions',     val: selectedUser.actionsCount.toLocaleString(),                                   color: 'var(--emerald)' },
                ].map((row, ri) => (
                  <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: ri < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: row.color, fontFamily: ri >= 5 ? 'monospace' : undefined }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: ar ? 'عرض النشاط' : 'View Activity',  color: 'var(--cyan)',    bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.25)' },
                  { label: ar ? 'إرسال رسالة' : 'Send Message',  color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
                  { label: ar ? 'تعديل البيانات' : 'Edit Profile',color: 'var(--amber)',   bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
                  { label: selectedUser.status === 'active' ? (ar ? 'إيقاف الحساب' : 'Suspend') : (ar ? 'تفعيل الحساب' : 'Activate'),
                    color: selectedUser.status === 'active' ? 'var(--rose)' : 'var(--emerald)',
                    bg: selectedUser.status === 'active' ? 'rgba(244,63,94,0.1)' : 'rgba(52,211,153,0.1)',
                    border: selectedUser.status === 'active' ? 'rgba(244,63,94,0.25)' : 'rgba(52,211,153,0.25)' },
                ].map((btn, bi) => (
                  <button key={bi} onClick={bi === 3 ? () => toggleUserStatus(selectedUser.id) : undefined}
                    style={{ background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color, padding: '9px', borderRadius: 9, fontSize: 11, fontWeight: 700 }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION: ALERTS
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'system' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? 'تنبيهات النظام النشطة' : 'Active System Alerts'}</p>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unresolvedAlerts.length} {ar ? 'غير محلولة' : 'unresolved'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map((alert, i) => {
                const color  = alertColor[alert.level];
                const bg     = alertBg[alert.level];
                const border = alertBorder[alert.level];
                return (
                  <div key={alert.id} className="card animate-fadeInUp"
                    style={{ padding: 16, borderInlineStart: `4px solid ${alert.resolved ? 'var(--border)' : color}`, opacity: alert.resolved ? 0.55 : 1, animationDelay: `${i * 0.07}s`, background: alert.resolved ? 'var(--bg-card)' : bg }}>
                    <div className="flex items-start gap-12 justify-between">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: `${color}20`, color, fontWeight: 800, border: `1px solid ${border}` }}>
                            {alert.level.toUpperCase()}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ar ? alert.time : alert.timeEn}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '1px 7px', borderRadius: 999 }}>{alert.source}</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{ar ? alert.titleAr : alert.titleEn}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ar ? alert.descAr : alert.descEn}</p>
                      </div>
                      {!alert.resolved && (
                        <button onClick={() => resolveAlert(alert.id)}
                          style={{ flexShrink: 0, background: `${color}15`, border: `1px solid ${border}`, color, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                          {ar ? 'حل ✓' : 'Resolve ✓'}
                        </button>
                      )}
                      {alert.resolved && (
                        <span style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 700, flexShrink: 0 }}>✓ {ar ? 'محلول' : 'Resolved'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alert stats sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>{ar ? 'إحصائيات التنبيهات' : 'Alert Statistics'}</p>
              {(['critical', 'warning', 'info', 'success'] as AlertLevel[]).map(level => {
                const count = alerts.filter(a => a.level === level).length;
                const color = alertColor[level];
                const labels: Record<AlertLevel, { ar: string; en: string }> = { critical: { ar: 'حرجة', en: 'Critical' }, warning: { ar: 'تحذير', en: 'Warning' }, info: { ar: 'معلومات', en: 'Info' }, success: { ar: 'نجاح', en: 'Success' } };
                return (
                  <div key={level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: level !== 'success' ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ar ? labels[level].ar : labels[level].en}</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'monospace' }}>{count}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--rose)', letterSpacing: '0.06em', marginBottom: 8 }}>AI SECURITY MONITOR</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {ar ? 'تم رصد نمط هجوم brute-force من IP 185.220.101.x. يُنصح بحظر فوري على مستوى Firewall.' : 'Brute-force attack pattern detected from IP 185.220.101.x. Recommend immediate firewall block.'}
              </p>
              <button style={{ marginTop: 10, width: '100%', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', color: 'var(--rose)', padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700 }}>
                {ar ? 'حظر IP الآن' : 'Block IP Now'}
              </button>
            </div>

            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>{ar ? 'إجراءات سريعة' : 'Quick Actions'}</p>
              {[
                { label: ar ? 'فحص أمني شامل' : 'Full Security Scan',     color: 'var(--rose)',    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
                { label: ar ? 'إعادة تشغيل AI Engine' : 'Restart AI Engine', color: 'var(--amber)', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                { label: ar ? 'نسخ احتياطي الآن' : 'Backup Now',           color: 'var(--cyan)',   icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
              ].map((btn, bi) => (
                <button key={bi} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, color: btn.color, fontSize: 12, fontWeight: 700, textAlign: 'start', transition: 'all .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}>
                  <Icon d={btn.icon} size={14} color={btn.color} />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION: ACTIVITY LOG
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'logs' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? 'سجل النشاط المباشر' : 'Live Activity Log'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{ar ? 'آخر 24 ساعة · يتحدث كل 30 ثانية' : 'Last 24 hours · Updates every 30s'}</p>
            </div>
            <div className="flex items-center gap-2" style={{ marginInlineStart: 'auto' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald)', animation: 'pulse-ring 2s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 700 }}>{ar ? 'بث مباشر' : 'LIVE'}</span>
            </div>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr 1fr 1fr 80px', gap: 10, padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
            {[ar ? 'المستخدم' : 'User', ar ? 'الدور' : 'Role', ar ? 'الإجراء' : 'Action', ar ? 'الوحدة' : 'Module', ar ? 'الوقت' : 'Time', ar ? 'الحالة' : 'Status'].map((h, hi) => (
              <span key={hi} style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>

          {LOGS.map((log, i) => {
            const rc = roleColor[log.role];
            const sc = logStatusColor[log.status];
            return (
              <div key={log.id}
                className={i < 4 ? `animate-fadeInUp-delay-${Math.min(i + 1, 4) as 1 | 2 | 3 | 4}` : ''}
                style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr 1fr 1fr 80px', gap: 10, padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', transition: 'background .15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${rc}22`, border: `1.5px solid ${rc}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: rc, flexShrink: 0 }}>
                    {log.userAr.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{ar ? log.userAr : log.userEn}</p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.ip}</p>
                  </div>
                </div>

                {/* Role */}
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: `${rc}15`, color: rc, fontWeight: 800, display: 'inline-block', width: 'fit-content' }}>
                  {ar ? roleLabel[log.role].ar : roleLabel[log.role].en}
                </span>

                {/* Action */}
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{ar ? log.actionAr : log.actionEn}</p>

                {/* Module */}
                <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '2px 8px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {log.module}
                </span>

                {/* Time */}
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ar ? log.time : log.timeEn}</span>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc }} />
                  <span style={{ fontSize: 10, color: sc, fontWeight: 700 }}>
                    {log.status === 'success' ? (ar ? 'نجاح' : 'OK') : log.status === 'failed' ? (ar ? 'فشل' : 'Failed') : (ar ? 'تحذير' : 'Warn')}
                  </span>
                </div>
              </div>
            );
          })}

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ar ? 'عرض آخر 8 سجلات من 1,247 سجل' : 'Showing last 8 of 1,247 log entries'}</p>
            <button style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', padding: '6px 14px', borderRadius: 8 }}>
              {ar ? 'تحميل السجلات الكاملة' : 'Download Full Logs'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION: AI MODELS
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'ai' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? 'نماذج الذكاء الاصطناعي' : 'AI Model Management'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                {AI_MODELS.filter(m => m.status === 'online').length} {ar ? 'نماذج تعمل' : 'models online'} · {AI_MODELS.filter(m => m.status === 'degraded').length} {ar ? 'تدهور' : 'degraded'}
              </p>
            </div>
            <button style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" size={13} color="#a78bfa" />
              {ar ? 'إعادة تدريب الكل' : 'Retrain All'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {AI_MODELS.map((model, i) => {
              const color = modelStatusColor[model.status];
              return (
                <div key={model.id} className="card card-hover animate-fadeInUp" style={{ padding: 18, animationDelay: `${i * 0.07}s` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, ...(model.status === 'online' ? { animation: 'pulse-ring 2s infinite' } : {}) }} />
                        <span style={{ fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {ar ? modelStatusLabel[model.status].ar : modelStatusLabel[model.status].en}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? model.nameAr : model.nameEn}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{model.version}</p>
                    </div>
                    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                      <AccuracyRing value={model.accuracy} color={color} size={44} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color, fontFamily: 'monospace' }}>{model.accuracy}%</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: ar ? 'دقة' : 'Accuracy', val: `${model.accuracy}%`, color },
                      { label: ar ? 'طلبات' : 'Requests', val: model.requests.toLocaleString(), color: 'var(--cyan)' },
                      { label: ar ? 'زمن استجابة' : 'Latency', val: `${model.avgLatency}ms`, color: model.avgLatency > 500 ? 'var(--amber)' : 'var(--emerald)' },
                    ].map((stat, si) => (
                      <div key={si} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 9, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 2 }}>{stat.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: stat.color, fontFamily: 'monospace' }}>{stat.val}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>{ar ? 'آخر تدريب:' : 'Last trained:'}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{ar ? model.lastTrained : model.lastTrainedEn}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                    <button style={{ background: `${color}10`, border: `1px solid ${color}30`, color, padding: '7px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                      {ar ? 'إعادة تدريب' : 'Retrain'}
                    </button>
                    <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', padding: '7px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                      {ar ? 'عرض الأداء' : 'View Metrics'}
                    </button>
                  </div>

                  {model.status === 'degraded' && (
                    <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8 }}>
                      <p style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700 }}>⚠ {ar ? 'يحتاج إعادة معايرة — الدقة تدهورت' : 'Needs recalibration — accuracy degraded'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI cost overview */}
          <div className="card animate-fadeInUp-delay-3" style={{ padding: 18, marginTop: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>{ar ? 'استهلاك API ومصاريف AI هذا الشهر' : 'API Usage & AI Costs This Month'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: ar ? 'OpenAI API' : 'OpenAI API',         used: 87, total: '$3,000', spent: '$2,610', color: '#a78bfa' },
                { label: ar ? 'AWS SageMaker' : 'AWS SageMaker',   used: 54, total: '$1,500', spent: '$810',   color: 'var(--amber)' },
                { label: ar ? 'Google Vision' : 'Google Vision',    used: 33, total: '$800',   spent: '$264',   color: 'var(--cyan)' },
                { label: ar ? 'Sentinel API' : 'Sentinel API',     used: 72, total: '$600',   spent: '$432',   color: 'var(--emerald)' },
              ].map((api, ai_i) => (
                <div key={ai_i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{api.label}</p>
                    <span style={{ fontSize: 11, fontWeight: 800, color: api.used >= 80 ? 'var(--rose)' : api.used >= 60 ? 'var(--amber)' : 'var(--emerald)', fontFamily: 'monospace' }}>{api.used}%</span>
                  </div>
                  <div className="health-bar" style={{ marginBottom: 8 }}>
                    <div className="health-bar-fill" style={{ width: `${api.used}%`, background: api.used >= 80 ? 'var(--rose)' : api.color }} />
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ar ? 'مُنفق:' : 'Spent:'} <strong style={{ color: api.color, fontFamily: 'monospace' }}>{api.spent}</strong></span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ar ? 'من' : 'of'} {api.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;