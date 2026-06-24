import React from 'react';
import {
  Ship, FileCheck2, Globe2, CircleCheckBig, FileText, Clock, TriangleAlert,
  Sparkles, Radio, FileX2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/dashboard/StatCard';
import { useDashboard } from '../hooks/useDashboard';

const shipments = [
  { idEn: 'EU-2847', dest: '🇪🇺 Europe',  product: 'Tomatoes 12T',   docStatus: 'complete', customsStatus: 'cleared',  eta: '3 days',  value: 432000, color: '#34d399' },
  { idEn: 'SA-2841', dest: '🇸🇦 Saudi',   product: 'Oranges 20T',    docStatus: 'complete', customsStatus: 'pending',  eta: '5 days',  value: 280000, color: '#fbbf24' },
  { idEn: 'US-2839', dest: '🇺🇸 USA',     product: 'Strawberry 5T',  docStatus: 'missing',  customsStatus: 'pending',  eta: '9 days',  value: 186000, color: '#f43f5e' },
  { idEn: 'AE-2835', dest: '🇦🇪 UAE',     product: 'Wheat 100T',     docStatus: 'complete', customsStatus: 'cleared',  eta: 'Delivered',value:210000, color: '#a78bfa' },
];

const docs = [
  { nameAr: 'شهادة المنشأ',        nameEn: 'Certificate of Origin',  status: 'ready',   shipment: 'EU-2847', color: '#34d399' },
  { nameAr: 'شهادة الفيتوسنتري',   nameEn: 'Phytosanitary Cert',     status: 'ready',   shipment: 'EU-2847', color: '#34d399' },
  { nameAr: 'وثيقة الشحن',          nameEn: 'Bill of Lading',         status: 'pending', shipment: 'SA-2841', color: '#fbbf24' },
  { nameAr: 'تصريح الجمارك',        nameEn: 'Customs Declaration',    status: 'missing', shipment: 'US-2839', color: '#f43f5e' },
  { nameAr: 'تقرير تحليل المختبر',  nameEn: 'Lab Analysis Report',    status: 'missing', shipment: 'US-2839', color: '#f43f5e' },
];

const markets = [
  { flag: '🇪🇺', nameAr: 'أوروبا',  nameEn: 'Europe',  pct: 44, color: '#34d399', trend: +12 },
  { flag: '🇸🇦', nameAr: 'الخليج',  nameEn: 'Gulf',    pct: 31, color: '#22d3ee', trend: +5  },
  { flag: '🇺🇸', nameAr: 'أمريكا',  nameEn: 'USA',     pct: 15, color: '#a78bfa', trend: +3  },
  { flag: '🌍',  nameAr: 'أفريقيا', nameEn: 'Africa',  pct: 10, color: '#fbbf24', trend: -2  },
];

const docStatusIcon: Record<string, React.ElementType> = {
  ready: CircleCheckBig,
  pending: Clock,
  missing: TriangleAlert,
};

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

const ExporterDashboard: React.FC = () => {
  const { language } = useApp();
  const { loading } = useDashboard();
  const ar = language === 'ar';

  const now = new Date().toLocaleDateString(ar ? 'ar-EG' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const totalVolume = 847;
  const acceptanceRate = 96.4;
  const activeMarkets = markets.length;
  const docsIssues = docs.filter(d => d.status !== 'ready').length;

  const marketPieData = markets.map(m => ({ name: ar ? m.nameAr : m.nameEn, value: m.pct, color: m.color }));

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 animate-fadeInUp relative overflow-hidden">
        <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="ai-badge"><Ship size={10} /> Exporter</span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{now}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="gradient-text">{ar ? 'لوحة التحكم' : 'Dashboard'}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {ar ? 'الشحنات، وثائق التصدير، الأسواق العالمية' : 'Shipments, export docs & global markets'}
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <Radio size={13} color="#34d399" className="animate-pulse" />
            <span className="text-xs font-bold" style={{ color: '#34d399' }}>
              {ar ? '4 شحنات نشطة' : '4 active shipments'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={ar ? 'حجم الصادرات' : 'Export Volume'}
          value={`${totalVolume}T`} change={12} icon={<Ship size={20} />} color="green"
          subtitle={ar ? 'هذا الشهر' : 'this month'} />
        <StatCard title={ar ? 'معدل القبول' : 'Acceptance Rate'}
          value={`${acceptanceRate}%`} change={3} icon={<CircleCheckBig size={20} />} color="yellow"
          subtitle={ar ? 'معايير الجودة' : 'quality standards'} />
        <StatCard title={ar ? 'أسواق نشطة' : 'Active Markets'}
          value={activeMarkets} change={1} icon={<Globe2 size={20} />} color="blue"
          subtitle={ar ? 'دول' : 'countries'} />
        <StatCard title={ar ? 'وثائق ناقصة' : 'Missing Docs'}
          value={docsIssues} change={-2} icon={<FileX2 size={20} />} color="red"
          subtitle={ar ? 'تحتاج إجراء' : 'need action'} />
      </div>

      {/* Shipments + Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fadeInUp-delay-1">

        {/* Shipments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {ar ? 'الشحنات الحالية' : 'Active Shipments'}
            </h3>
          </div>
          <div className="space-y-3">
            {shipments.map((s, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid var(--border)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p style={{ fontSize:'9px', fontWeight:700, color:'var(--text-muted)' }}>{s.idEn} · {s.dest}</p>
                    <p className="text-xs font-bold mt-0.5" style={{ color:'var(--text-primary)' }}>{s.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold" style={{ color: s.color }}>
                      {(s.value / 1000).toFixed(0)}K EGP
                    </p>
                    <p style={{ fontSize:'9px', color:'var(--text-muted)' }}>ETA: {s.eta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1" style={{ fontSize:'9px', fontWeight:700, padding:'1px 6px', borderRadius:999,
                    background: s.docStatus === 'complete' ? 'rgba(52,211,153,0.12)' : 'rgba(244,63,94,0.12)',
                    color: s.docStatus === 'complete' ? '#34d399' : '#f43f5e' }}>
                    <FileText size={10} />
                    {s.docStatus === 'complete' ? (ar ? 'وثائق مكتملة' : 'Docs OK') : (ar ? 'وثائق ناقصة' : 'Docs Missing')}
                  </span>
                  <span className="inline-flex items-center gap-1" style={{ fontSize:'9px', fontWeight:700, padding:'1px 6px', borderRadius:999,
                    background: s.customsStatus === 'cleared' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                    color: s.customsStatus === 'cleared' ? '#34d399' : '#fbbf24' }}>
                    <FileCheck2 size={10} />
                    {s.customsStatus === 'cleared' ? (ar ? 'جمارك معتمدة' : 'Customs Clear') : (ar ? 'جمارك معلقة' : 'Customs Pending')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Status */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {ar ? 'حالة الوثائق' : 'Document Status'}
            </h3>
            <button className="text-xs font-bold px-3 py-1 rounded-lg"
              style={{ background:'rgba(52,211,153,0.1)', color:'#34d399', border:'1px solid rgba(52,211,153,0.2)' }}>
              {ar ? 'رفع وثيقة' : 'Upload Doc'}
            </button>
          </div>
          <div className="space-y-3">
            {docs.map((d, i) => {
              const StatusIcon = docStatusIcon[d.status];
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${d.color}20` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:`${d.color}15` }}>
                    <StatusIcon size={15} color={d.color} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color:'var(--text-primary)' }}>
                      {ar ? d.nameAr : d.nameEn}
                    </p>
                    <p style={{ fontSize:'9px', color:'var(--text-muted)' }}>{d.shipment}</p>
                  </div>
                  <span style={{ fontSize:'9px', fontWeight:700, padding:'2px 7px', borderRadius:999, background:`${d.color}15`, color: d.color }}>
                    {d.status === 'ready'   ? (ar ? 'جاهز'   : 'Ready')   :
                     d.status === 'pending' ? (ar ? 'معلق'   : 'Pending') :
                                              (ar ? 'ناقص'   : 'Missing')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Market Distribution — donut + bars */}
      <div className="card p-5 animate-fadeInUp-delay-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {ar ? 'توزيع الأسواق العالمية' : 'Global Market Distribution'}
          </h3>
          <span className="ai-badge"><Sparkles size={10} /> AI</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={marketPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}
                  paddingAngle={3} startAngle={90} endAngle={-270} isAnimationActive animationDuration={900}>
                  {marketPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<MarketTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{value}</span>}
                  iconType="circle" iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {markets.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{m.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color:'var(--text-primary)' }}>{ar ? m.nameAr : m.nameEn}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize:'10px', fontWeight:700, color: m.trend > 0 ? '#34d399' : '#f43f5e' }}>
                        {m.trend > 0 ? '▲' : '▼'} {Math.abs(m.trend)}%
                      </span>
                      <span className="text-xs font-bold" style={{ color: m.color }}>{m.pct}%</span>
                    </div>
                  </div>
                  <div className="health-bar">
                    <div className="health-bar-fill" style={{ width:`${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Metrics */}
      <div className="card p-5 animate-fadeInUp-delay-3">
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {ar ? 'مؤشرات الصادرات' : 'Export KPIs'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { labelAr: 'حجم الصادرات', labelEn: 'Export Volume', value: '847 T',  trend: +12, color: '#34d399' },
            { labelAr: 'معدل القبول',  labelEn: 'Acceptance',    value: '96.4%',  trend: +3,  color: '#22d3ee' },
            { labelAr: 'مخزون معلق',  labelEn: 'Pending Stock', value: '124 T',  trend: -8,  color: '#fbbf24' },
            { labelAr: 'مشترون نشطون',labelEn: 'Active Buyers', value: '38',     trend: +5,  color: '#a78bfa' },
          ].map((m, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid var(--border)' }}>
              <p style={{ fontSize:'9px', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                {ar ? m.labelAr : m.labelEn}
              </p>
              <p className="text-lg font-extrabold mt-1" style={{ color: m.color }}>{m.value}</p>
              <p style={{ fontSize:'9px', color: m.trend > 0 ? '#34d399' : '#f43f5e', fontWeight:700, marginTop:2 }}>
                {m.trend > 0 ? '↑' : '↓'} {Math.abs(m.trend)}%
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ExporterDashboard;