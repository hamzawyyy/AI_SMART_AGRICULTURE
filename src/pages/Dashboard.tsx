import React, { useState, useEffect } from 'react';
import {
  Wallet, Sprout, PackageCheck, ShieldAlert, Sparkles, Satellite,
  Droplets, Wind, FlaskConical, Thermometer, CircleAlert,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/dashboard/StatCard';
import { ChartSection } from '../components/dashboard/ChartSection';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';

// ── Crop health data ──────────────────────────────────────────────────
const crops = [
  { nameAr: 'طماطم',    nameEn: 'Tomatoes',   health: 87, status: 'good',    hectares: 12.4, yieldAr: 'ممتاز',    yieldEn: 'Excellent', color: '#f43f5e' },
  { nameAr: 'برتقال',   nameEn: 'Oranges',    health: 94, status: 'good',    hectares: 8.2,  yieldAr: 'ممتاز',    yieldEn: 'Excellent', color: '#f97316' },
  { nameAr: 'فراولة',   nameEn: 'Strawberry', health: 72, status: 'warning', hectares: 5.6,  yieldAr: 'تحذير',    yieldEn: 'Warning',   color: '#ec4899' },
  { nameAr: 'قمح',      nameEn: 'Wheat',      health: 96, status: 'good',    hectares: 22.1, yieldAr: 'ممتاز',    yieldEn: 'Excellent', color: '#fbbf24' },
  { nameAr: 'ذرة',      nameEn: 'Corn',       health: 61, status: 'alert',   hectares: 7.8,  yieldAr: 'يحتاج عناية', yieldEn: 'Needs Care', color: '#10b981' },
];

const statusColors: Record<string, string> = {
  good: '#34d399', warning: '#fbbf24', alert: '#f43f5e',
};
const statusBg: Record<string, string> = {
  good: 'rgba(52,211,153,0.1)', warning: 'rgba(251,191,36,0.1)', alert: 'rgba(244,63,94,0.1)',
};
const statusLabel: Record<string, { ar: string; en: string }> = {
  good:    { ar: 'صحي',          en: 'Healthy' },
  warning: { ar: 'تحذير',        en: 'Warning' },
  alert:   { ar: 'يحتاج تدخل',   en: 'Needs Action' },
};

// ── AI Insight cards ──────────────────────────────────────────────────
const insights = [
  {
    typeAr: 'توصية الري',    typeEn: 'Irrigation',
    textAr: 'نقص رطوبة في القطعة C-4. يُوصى بالري خلال 6 ساعات لتفادي الإجهاد المائي.',
    textEn: 'Moisture deficit in field C-4. Recommend irrigation within 6 hours to prevent water stress.',
    Icon: Droplets,
    accent: '#22d3ee', badgeAr: 'عاجل', badgeEn: 'Urgent', urgent: true,
  },
  {
    typeAr: 'جودة التصدير',  typeEn: 'Export Quality',
    textAr: 'دفعة الطماطم تحقق معايير EU Grade A. جاهزة للشحن إلى أسواق أوروبا.',
    textEn: 'Tomato batch meets EU Grade A standards. Ready for European market shipment.',
    Icon: PackageCheck,
    accent: '#34d399', badgeAr: 'مؤكد', badgeEn: 'Confirmed', urgent: false,
  },
  {
    typeAr: 'تحذير أمراض',   typeEn: 'Disease Alert',
    textAr: 'احتمالية 78% لظهور البياض الدقيقي في الفراولة خلال أسبوعين بسبب الرطوبة.',
    textEn: '78% probability of powdery mildew in strawberry fields within 2 weeks due to humidity.',
    Icon: CircleAlert,
    accent: '#fbbf24', badgeAr: 'تنبيه', badgeEn: 'Alert', urgent: true,
  },
];

// ── Export quality metrics ─────────────────────────────────────────────
const exportMetrics = [
  { labelAr: 'حجم الصادرات', labelEn: 'Export Volume',  value: '847 طن', valueEn: '847 T', trend: +12, color: '#34d399' },
  { labelAr: 'معدل القبول',  labelEn: 'Acceptance Rate', value: '96.4%', valueEn: '96.4%', trend: +3,  color: '#22d3ee' },
  { labelAr: 'مخزون معلق',  labelEn: 'Pending Stock',   value: '124 طن', valueEn: '124 T', trend: -8,  color: '#fbbf24' },
  { labelAr: 'عملاء نشطون', labelEn: 'Active Buyers',   value: '38',    valueEn: '38',    trend: +5,  color: '#a78bfa' },
];

const markets = [
  { flag: '🇪🇺', nameAr: 'أوروبا',  nameEn: 'Europe',  pct: 44, color: '#34d399' },
  { flag: '🇸🇦', nameAr: 'الخليج',  nameEn: 'Gulf',    pct: 31, color: '#22d3ee' },
  { flag: '🇺🇸', nameAr: 'أمريكا',  nameEn: 'USA',     pct: 15, color: '#a78bfa' },
  { flag: '🌍',  nameAr: 'أفريقيا', nameEn: 'Africa',  pct: 10, color: '#fbbf24' },
];

const sensors = [
  { Icon: Thermometer,  labelAr: 'درجة الحرارة', labelEn: 'Temperature',   value: '34.2°C', subAr: 'القطعة A-1',     subEn: 'Field A-1',        color: '#f97316', alert: false },
  { Icon: Droplets,     labelAr: 'رطوبة التربة', labelEn: 'Soil Moisture', value: '38%',    subAr: 'يحتاج ري',       subEn: 'Needs irrigation', color: '#22d3ee', alert: true },
  { Icon: Wind,         labelAr: 'رطوبة الهواء', labelEn: 'Air Humidity',  value: '42%',    subAr: 'مثالي',          subEn: 'Optimal',          color: '#34d399', alert: false },
  { Icon: FlaskConical, labelAr: 'مستوى NPK',    labelEn: 'NPK Level',     value: '7.2 N',  subAr: 'N-P-K مثالي',    subEn: 'Balanced N-P-K',   color: '#a78bfa', alert: false },
];

const MarketTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg px-2.5 py-1.5 text-xs"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
      <span className="font-bold" style={{ color: d.color }}>{d.name}: {d.value}%</span>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { stats, activities, weather, chartData, loading } = useDashboard();
  const { language } = useApp();
  const ar = language === 'ar';
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const now = new Date().toLocaleDateString(ar ? 'ar-EG' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const marketPieData = markets.map(m => ({ name: ar ? m.nameAr : m.nameEn, value: m.pct, color: m.color }));

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 animate-fadeInUp relative overflow-hidden">
        <div className="absolute -top-10 -end-10 w-44 h-44 rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--emerald), transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="ai-badge"><Sparkles size={10} /> AI Powered</span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{now}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            {ar ? (
              <span className="gradient-text">لوحة القيادة الذكية</span>
            ) : (
              <span className="gradient-text">AI Agriculture Dashboard</span>
            )}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {ar
              ? 'منصة الذكاء الاصطناعي لإدارة المزارع وذكاء التصدير'
              : 'Smart farming & export intelligence at enterprise scale'}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {/* Live AI scan */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <Satellite size={14} color="#34d399" className="animate-pulse" />
            <span className="text-xs font-bold" style={{ color: '#34d399' }}>
              {ar ? 'المحاصيل: 4 قطع جارية' : 'Scanning: 4 fields live'}
            </span>
          </div>
          <button style={{ background: 'linear-gradient(135deg,#10b981,#22d3ee)', color: '#fff' }}
            className="px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity">
            {ar ? '+ تقرير جديد' : '+ New Report'}
          </button>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={ar ? 'إجمالي الإيرادات' : 'Total Revenue'}
          value={stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()} ${ar ? 'ج.م' : 'EGP'}` : (ar ? '2.4M ج.م' : '2.4M EGP')}
          change={stats?.revenueChange || 14} icon={<Wallet size={20} />} color="green"
          subtitle={ar ? 'مقارنة بالشهر الماضي' : 'vs last month'} />
        <StatCard title={ar ? 'هكتار محصود' : 'Hectares Harvested'}
          value={stats?.activeProducts || '56.1 ha'}
          change={stats?.productsChange || 8} icon={<Sprout size={20} />} color="yellow"
          subtitle={ar ? 'محاصيل نشطة: 5' : '5 active crops'} />
        <StatCard title={ar ? 'شحنات التصدير' : 'Export Shipments'}
          value={stats?.totalOrders || 34}
          change={stats?.ordersChange || 12} icon={<PackageCheck size={20} />} color="blue"
          subtitle={ar ? 'هذا الشهر' : 'this month'} />
        <StatCard title={ar ? 'تنبيهات الأمراض' : 'Disease Alerts'}
          value={stats?.pendingTasks || 2}
          change={-(stats?.tasksChange || 33)} icon={<ShieldAlert size={20} />} color="red"
          subtitle={ar ? 'يتطلب انتباهاً' : 'require attention'} />
      </div>

      {/* ── AI Insights ── */}
      <div className="animate-fadeInUp-delay-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {ar ? 'رؤى الذكاء الاصطناعي' : 'AI Insights'}
            </h2>
            <span className="ai-badge">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--emerald)', display: 'inline-block' }} />
              Live
            </span>
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            {ar ? 'محدّث قبل دقيقتين' : 'Updated 2 min ago'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins, i) => {
            const { Icon } = ins;
            return (
              <div key={i} className="card card-hover p-4 cursor-default"
                style={{ borderColor: ins.urgent ? `${ins.accent}30` : undefined }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${ins.accent}15`, color: ins.accent, border: `1px solid ${ins.accent}30` }}>
                    <Icon size={17} strokeWidth={2} />
                  </div>
                  <span style={{
                    fontSize: '9px', fontWeight: 800, padding: '2px 7px',
                    background: `${ins.accent}18`, border: `1px solid ${ins.accent}30`,
                    borderRadius: 999, color: ins.accent, letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    {ar ? ins.badgeAr : ins.badgeEn}
                  </span>
                </div>
                <p className="text-xs font-bold mb-1" style={{ color: ins.accent }}>
                  {ar ? ins.typeAr : ins.typeEn}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {ar ? ins.textAr : ins.textEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Crop Health + Export Intelligence ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fadeInUp-delay-2">

        {/* Crop Health */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {ar ? 'صحة المحاصيل' : 'Crop Health Index'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {ar ? 'مراقبة حية عبر الأقمار الصناعية' : 'Live satellite monitoring'}
              </p>
            </div>
            <span className="ai-badge"><Sparkles size={10} /> AI</span>
          </div>
          <div className="space-y-3">
            {crops.map((crop, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${crop.color}15`, color: crop.color }}>
                  <Sprout size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {ar ? crop.nameAr : crop.nameEn}
                    </span>
                    <div className="flex items-center gap-2">
                      <span style={{
                        fontSize: '9px', fontWeight: 700, padding: '1px 6px',
                        background: statusBg[crop.status], color: statusColors[crop.status],
                        borderRadius: 999,
                      }}>
                        {ar ? statusLabel[crop.status].ar : statusLabel[crop.status].en}
                      </span>
                      <span className="text-xs font-bold" style={{ color: statusColors[crop.status] }}>
                        {crop.health}%
                      </span>
                    </div>
                  </div>
                  <div className="health-bar">
                    <div className="health-bar-fill" style={{ width: `${crop.health}%`, background: statusColors[crop.status] }} />
                  </div>
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {crop.hectares} ha · {ar ? crop.yieldAr : crop.yieldEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Intelligence */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {ar ? 'ذكاء التصدير' : 'Export Intelligence'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {ar ? 'تحليل الأسواق العالمية' : 'Global market analysis'}
              </p>
            </div>
            <span className="ai-badge"><Sparkles size={10} /> AI</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {exportMetrics.map((m, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {ar ? m.labelAr : m.labelEn}
                </p>
                <p className="text-lg font-extrabold mt-1" style={{ color: m.color }}>
                  {ar ? m.value : m.valueEn}
                </p>
                <p style={{ fontSize: '9px', color: m.trend > 0 ? '#34d399' : '#f43f5e', fontWeight: 700, marginTop: 2 }}>
                  {m.trend > 0 ? '↑' : '↓'} {Math.abs(m.trend)}% {ar ? 'الشهر الماضي' : 'last month'}
                </p>
              </div>
            ))}
          </div>

          {/* Market donut + legend */}
          <div className="flex items-center gap-4">
            <div style={{ width: 110, height: 110 }} className="flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={marketPieData} dataKey="value" nameKey="name" innerRadius={32} outerRadius={50}
                    paddingAngle={3} startAngle={90} endAngle={-270} isAnimationActive={true} animationDuration={900}>
                    {marketPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<MarketTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 min-w-0">
              <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }} className="mb-1">
                {ar ? 'أهم أسواق التصدير' : 'Top Export Markets'}
              </p>
              {markets.map((mkt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">{mkt.flag}</span>
                  <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {ar ? mkt.nameAr : mkt.nameEn}
                  </span>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: mkt.color }}>{mkt.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Chart + Weather ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fadeInUp-delay-3">
        <div className="lg:col-span-2">
          <ChartSection data={chartData} language={language} />
        </div>
        <WeatherWidget weather={weather} language={language} />
      </div>

      {/* ── IoT sensor strip ── */}
      <div className="card p-5 animate-fadeInUp-delay-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {ar ? 'حساسات إنترنت الأشياء — القراءات المباشرة' : 'IoT Sensors — Live Readings'}
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34d399' }} />
            <span className="text-xs font-semibold" style={{ color: '#34d399' }}>
              {ar ? 'مباشر' : 'Live'}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sensors.map((sensor, i) => {
            const { Icon } = sensor;
            return (
              <div key={i} className="rounded-xl p-4"
                style={{
                  background: sensor.alert ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.025)',
                  border: sensor.alert ? '1px solid rgba(34,211,238,0.2)' : '1px solid var(--border)',
                }}>
                <div className="flex items-center justify-between mb-2">
                  <Icon size={16} color={sensor.color} strokeWidth={2} />
                  {sensor.alert && (
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#fbbf24' }} />
                  )}
                </div>
                <p className="text-xl font-extrabold" style={{ color: sensor.color, fontFamily: 'var(--font-display)' }}>{sensor.value}</p>
                <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {ar ? sensor.labelAr : sensor.labelEn}
                </p>
                <p style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: 2 }}>{ar ? sensor.subAr : sensor.subEn}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <RecentActivity activities={activities} language={language} />

    </div>
  );
};