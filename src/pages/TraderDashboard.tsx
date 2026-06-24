import React, { useState } from 'react';
import {
  Wheat, TrendingUp, ClipboardList, BadgeCheck, Sparkles, Radio,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/dashboard/StatCard';
import { ChartSection } from '../components/dashboard/ChartSection';
import { useDashboard } from '../hooks/useDashboard';

const priceData = [
  { nameAr: 'طماطم',  nameEn: 'Tomatoes',   price: 4800, unit: 'EGP/ton', change: +6.2, color: '#f43f5e',  supply: 'high',   demand: 'high' },
  { nameAr: 'برتقال', nameEn: 'Oranges',    price: 6200, unit: 'EGP/ton', change: -2.1, color: '#f97316',  supply: 'medium', demand: 'high' },
  { nameAr: 'فراولة', nameEn: 'Strawberry', price: 12400,unit: 'EGP/ton', change: +11.5,color: '#ec4899',  supply: 'low',    demand: 'high' },
  { nameAr: 'قمح',    nameEn: 'Wheat',      price: 2100, unit: 'EGP/ton', change: -0.8, color: '#fbbf24',  supply: 'high',   demand: 'medium' },
  { nameAr: 'ذرة',    nameEn: 'Corn',       price: 3300, unit: 'EGP/ton', change: +3.4, color: '#10b981',  supply: 'medium', demand: 'medium' },
];

const orders = [
  { idEn: 'ORD-2847', nameAr: 'طماطم — 50 طن',     nameEn: 'Tomatoes — 50T',     buyer: 'Cairo Fresh',    statusAr: 'معلق',    statusEn: 'Pending',    statusColor: '#fbbf24', value: 240000 },
  { idEn: 'ORD-2846', nameAr: 'برتقال — 30 طن',     nameEn: 'Oranges — 30T',      buyer: 'Gulf Exports',   statusAr: 'مؤكد',    statusEn: 'Confirmed',  statusColor: '#34d399', value: 186000 },
  { idEn: 'ORD-2845', nameAr: 'فراولة — 8 طن',       nameEn: 'Strawberry — 8T',    buyer: 'EU AgriTrade',   statusAr: 'شحن',     statusEn: 'Shipping',   statusColor: '#22d3ee', value: 99200 },
  { idEn: 'ORD-2844', nameAr: 'قمح — 200 طن',        nameEn: 'Wheat — 200T',       buyer: 'Delta Mills',    statusAr: 'مكتمل',   statusEn: 'Completed',  statusColor: '#a78bfa', value: 420000 },
];

const supplyLabel: Record<string, { ar: string; en: string; color: string }> = {
  high:   { ar: 'عرض عالٍ',    en: 'High Supply',   color: '#34d399' },
  medium: { ar: 'عرض متوسط',   en: 'Med Supply',    color: '#fbbf24' },
  low:    { ar: 'عرض منخفض',   en: 'Low Supply',    color: '#f43f5e' },
};

const qualityBatches = [
  { labelAr: 'طماطم EU-A', labelEn: 'Tomatoes EU-A', score: 96, color: '#34d399' },
  { labelAr: 'برتقال B+',  labelEn: 'Oranges B+',    score: 89, color: '#f97316' },
  { labelAr: 'فراولة',     labelEn: 'Strawberry',    score: 71, color: '#fbbf24' },
  { labelAr: 'قمح A',      labelEn: 'Wheat A',       score: 98, color: '#22d3ee' },
];

const QualityTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg px-2.5 py-1.5 text-xs"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}: </span>
      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{payload[0].value}</span>
    </div>
  );
};

const TraderDashboard: React.FC = () => {
  const { language } = useApp();
  const { chartData, loading } = useDashboard();
  const ar = language === 'ar';
  const [activeTab, setActiveTab] = useState<'prices' | 'orders'>('prices');

  const now = new Date().toLocaleDateString(ar ? 'ar-EG' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const totalOrderValue = orders.reduce((s, o) => s + o.value, 0);
  const confirmedOrders = orders.filter(o => o.statusEn === 'Confirmed' || o.statusEn === 'Completed').length;
  const positiveItems = priceData.filter(p => p.change > 0).length;

  const qualityChartData = qualityBatches.map(q => ({ name: ar ? q.labelAr : q.labelEn, score: q.score, color: q.color }));

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 animate-fadeInUp relative overflow-hidden">
        <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--cyan), transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="ai-badge"><TrendingUp size={10} /> Trader</span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{now}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="gradient-text">{ar ? 'لوحة التحكم' : 'Dashboard'}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {ar ? 'أسعار السوق، الطلبات، ومستوى الجودة' : 'Market prices, orders & quality levels'}
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <Radio size={13} color="#22d3ee" className="animate-pulse" />
            <span className="text-xs font-bold" style={{ color: '#22d3ee' }}>
              {ar ? 'أسعار محدّثة' : 'Prices live'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={ar ? 'قيمة الطلبات' : 'Orders Value'}
          value={`${(totalOrderValue / 1000).toFixed(0)}K EGP`} change={14} icon={<Wheat size={20} />} color="green"
          subtitle={ar ? 'هذا الشهر' : 'this month'} />
        <StatCard title={ar ? 'طلبات مؤكدة' : 'Confirmed Orders'}
          value={`${confirmedOrders}/${orders.length}`} change={12} icon={<ClipboardList size={20} />} color="yellow"
          subtitle={ar ? 'نسبة التحويل' : 'conversion rate'} />
        <StatCard title={ar ? 'أسعار صاعدة' : 'Rising Prices'}
          value={`${positiveItems}/${priceData.length}`} change={positiveItems} icon={<TrendingUp size={20} />} color="blue"
          subtitle={ar ? 'سلع' : 'commodities'} />
        <StatCard title={ar ? 'درجة الجودة' : 'Quality Grade'}
          value="A+" change={3} icon={<BadgeCheck size={20} />} color="green"
          subtitle={ar ? 'متوسط الدفعات' : 'avg batch score'} />
      </div>

      {/* Tabs: Prices / Orders */}
      <div className="card p-5 animate-fadeInUp-delay-1">
        <div className="flex items-center gap-3 mb-4">
          {(['prices', 'orders'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeTab === tab ? 'rgba(52,211,153,0.12)' : 'transparent',
                color: activeTab === tab ? '#34d399' : 'var(--text-muted)',
                border: activeTab === tab ? '1px solid rgba(52,211,153,0.2)' : '1px solid transparent',
              }}>
              {tab === 'prices' ? (ar ? 'أسعار السوق' : 'Market Prices') : (ar ? 'الطلبات' : 'Orders')}
            </button>
          ))}
        </div>

        {activeTab === 'prices' && (
          <div className="space-y-3">
            {priceData.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${p.color}15`, color: p.color }}>
                  <Wheat size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {ar ? p.nameAr : p.nameEn}
                  </p>
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{supplyLabel[p.supply][ar ? 'ar' : 'en']}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-extrabold" style={{ color: p.color }}>
                    {p.price.toLocaleString()} <span style={{ fontSize: '10px' }}>EGP/T</span>
                  </p>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: p.change > 0 ? '#34d399' : '#f43f5e' }}>
                    {p.change > 0 ? '▲' : '▼'} {Math.abs(p.change)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.map((o, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid var(--border)' }}>
                <div className="flex-shrink-0">
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>{o.idEn}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {ar ? o.nameAr : o.nameEn}
                  </p>
                  <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{o.buyer}</p>
                </div>
                <div className="flex-1" />
                <div className="text-right flex-shrink-0">
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 7px', background: `${o.statusColor}15`, color: o.statusColor, borderRadius: 999 }}>
                    {ar ? o.statusAr : o.statusEn}
                  </span>
                  <p className="text-sm font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {(o.value / 1000).toFixed(0)}K EGP
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quality Assessment summary — real bar chart */}
      <div className="card p-5 animate-fadeInUp-delay-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {ar ? 'تقييم الجودة — آخر الدفعات' : 'Quality Assessment — Latest Batches'}
          </h3>
          <span className="ai-badge"><Sparkles size={10} /> AI</span>
        </div>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qualityChartData} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<QualityTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={36} isAnimationActive animationDuration={900}>
                {qualityChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="animate-fadeInUp-delay-3">
        <ChartSection data={chartData} language={language} />
      </div>

    </div>
  );
};

export default TraderDashboard;