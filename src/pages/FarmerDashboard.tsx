import React, { useState } from 'react';
import {
  Leaf, Droplets, ClipboardList, TriangleAlert, Sprout,
  Wind, FlaskConical, Thermometer, Check, Sparkles, Radio,
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/dashboard/StatCard';
import { WeatherWidget } from '../components/dashboard/WeatherWidget';
import { useDashboard } from '../hooks/useDashboard';

const crops = [
  { nameAr: 'طماطم',  nameEn: 'Tomatoes',   health: 87, status: 'good',    hectares: 12.4, color: '#f43f5e' },
  { nameAr: 'برتقال', nameEn: 'Oranges',    health: 94, status: 'good',    hectares: 8.2,  color: '#f97316' },
  { nameAr: 'فراولة', nameEn: 'Strawberry', health: 72, status: 'warning', hectares: 5.6,  color: '#ec4899' },
  { nameAr: 'قمح',    nameEn: 'Wheat',      health: 96, status: 'good',    hectares: 22.1, color: '#fbbf24' },
  { nameAr: 'ذرة',    nameEn: 'Corn',       health: 61, status: 'alert',   hectares: 7.8,  color: '#10b981' },
];
const statusColors: Record<string, string> = { good: '#34d399', warning: '#fbbf24', alert: '#f43f5e' };
const statusBg: Record<string, string>     = { good: 'rgba(52,211,153,0.1)', warning: 'rgba(251,191,36,0.1)', alert: 'rgba(244,63,94,0.1)' };
const statusLabel: Record<string, { ar: string; en: string }> = {
  good:    { ar: 'صحي',        en: 'Healthy' },
  warning: { ar: 'تحذير',      en: 'Warning' },
  alert:   { ar: 'يحتاج تدخل', en: 'Needs Action' },
};

const tasks = [
  { textAr: 'ري القطعة C-4 (طماطم)', textEn: 'Irrigate field C-4 (Tomatoes)', due: '2h', urgent: true,  color: '#22d3ee' },
  { textAr: 'فحص أمراض الفراولة',     textEn: 'Inspect Strawberry for disease', due: '4h', urgent: true,  color: '#f43f5e' },
  { textAr: 'تسميد قطعة القمح',       textEn: 'Fertilise Wheat field',          due: '1d', urgent: false, color: '#fbbf24' },
  { textAr: 'حصاد الذرة — قطعة B-2',  textEn: 'Harvest Corn — field B-2',       due: '3d', urgent: false, color: '#34d399' },
];

const iotSensors = [
  { Icon: Thermometer,  labelAr: 'الحرارة',      labelEn: 'Temp',     value: '34.2°C', subAr: 'القطعة A-1',   subEn: 'Field A-1',  color: '#f97316', alert: false },
  { Icon: Droplets,     labelAr: 'رطوبة التربة', labelEn: 'Soil',     value: '38%',    subAr: 'القطعة C-4 ⚠️', subEn: 'Field C-4 ⚠️', color: '#22d3ee', alert: true },
  { Icon: Wind,         labelAr: 'رطوبة الهواء', labelEn: 'Humidity', value: '42%',    subAr: 'مثالي',        subEn: 'Optimal',     color: '#34d399', alert: false },
  { Icon: FlaskConical, labelAr: 'NPK',          labelEn: 'NPK',      value: '7.2 N',  subAr: 'متوازن',       subEn: 'Balanced',    color: '#a78bfa', alert: false },
];

const FarmerDashboard: React.FC = () => {
  const { language } = useApp();
  const { weather, loading } = useDashboard();
  const ar = language === 'ar';
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const now = new Date().toLocaleDateString(ar ? 'ar-EG' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const toggleTask = (i: number) =>
    setCompletedTasks(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const totalHa = crops.reduce((s, c) => s + c.hectares, 0).toFixed(1);
  const avgHealth = Math.round(crops.reduce((s, c) => s + c.health, 0) / crops.length);
  const alertCount = crops.filter(c => c.status !== 'good').length;
  const pendingTasks = tasks.length - completedTasks.length;

  const gaugeData = [{ name: 'health', value: avgHealth, fill: avgHealth > 80 ? '#34d399' : avgHealth > 60 ? '#fbbf24' : '#f43f5e' }];

  return (
    <div className="space-y-6 pb-8">

      {/* Header */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 animate-fadeInUp relative overflow-hidden">
        <div className="absolute -top-12 -end-12 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--emerald), transparent 70%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="ai-badge"><Sprout size={10} /> Farmer</span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{now}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="gradient-text">{ar ? 'لوحة التحكم' : 'Dashboard'}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {ar ? 'مراقبة مزارعك وصحة المحاصيل والمهام اليومية' : 'Monitor your fields, crop health & daily tasks'}
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <Radio size={13} color="#34d399" className="animate-pulse" />
            <span className="text-xs font-bold" style={{ color: '#34d399' }}>
              {ar ? 'IoT: 4 حساسات نشطة' : 'IoT: 4 sensors live'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={ar ? 'إجمالي الهكتارات' : 'Total Hectares'}
          value={`${totalHa} ha`} change={8} icon={<Leaf size={20} />} color="green"
          subtitle={ar ? '5 محاصيل نشطة' : '5 active crops'} />
        <StatCard title={ar ? 'متوسط صحة المحاصيل' : 'Avg Crop Health'}
          value={`${avgHealth}%`} change={3} icon={<Sprout size={20} />} color="yellow"
          subtitle={ar ? 'عبر جميع القطع' : 'across all fields'} />
        <StatCard title={ar ? 'تنبيهات نشطة' : 'Active Alerts'}
          value={alertCount} change={-1} icon={<TriangleAlert size={20} />} color="red"
          subtitle={ar ? 'تحتاج متابعة' : 'need attention'} />
        <StatCard title={ar ? 'مهام معلقة' : 'Pending Tasks'}
          value={pendingTasks} change={0} icon={<ClipboardList size={20} />} color="blue"
          subtitle={ar ? 'اليوم' : 'today'} />
      </div>

      {/* Crop Health + Tasks + Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fadeInUp-delay-1">

        {/* Health gauge */}
        <div className="card p-5 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {ar ? 'مؤشر الصحة العام' : 'Overall Health Index'}
          </p>
          <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: 'rgba(255,255,255,0.06)' }} isAnimationActive animationDuration={1000} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-3xl font-black -mt-16" style={{ color: gaugeData[0].fill, fontFamily: 'var(--font-display)' }}>{avgHealth}%</p>
          <p className="text-xs mt-16" style={{ color: 'var(--text-muted)' }}>
            {ar ? `عبر ${crops.length} محاصيل` : `across ${crops.length} crops`}
          </p>
        </div>

        {/* Crop Health */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {ar ? 'صحة المحاصيل' : 'Crop Health Index'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {ar ? 'مراقبة مباشرة عبر الأقمار الصناعية' : 'Live satellite monitoring'}
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
                      <span style={{ fontSize:'9px', fontWeight:700, padding:'1px 6px', background:statusBg[crop.status], color:statusColors[crop.status], borderRadius:999 }}>
                        {ar ? statusLabel[crop.status].ar : statusLabel[crop.status].en}
                      </span>
                      <span className="text-xs font-bold" style={{ color: statusColors[crop.status] }}>{crop.health}%</span>
                    </div>
                  </div>
                  <div className="health-bar">
                    <div className="health-bar-fill" style={{ width:`${crop.health}%`, background:statusColors[crop.status] }} />
                  </div>
                  <p style={{ fontSize:'9px', color:'var(--text-muted)', marginTop:2 }}>{crop.hectares} ha</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {ar ? 'مهام اليوم' : "Today's Tasks"}
            </h3>
            <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background:'rgba(251,191,36,0.12)', color:'#fbbf24' }}>
              {completedTasks.length}/{tasks.length} {ar ? 'مكتمل' : 'done'}
            </span>
          </div>
          <div className="space-y-3">
            {tasks.map((task, i) => {
              const done = completedTasks.includes(i);
              return (
                <div key={i}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: done ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.025)', border:`1px solid ${done ? 'rgba(52,211,153,0.2)' : 'var(--border)'}`, opacity: done ? 0.6 : 1 }}
                  onClick={() => toggleTask(i)}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: done ? '#34d399' : 'transparent', border:`2px solid ${done ? '#34d399' : task.color}` }}>
                    {done && <Check size={12} color="#06281d" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color:'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                      {ar ? task.textAr : task.textEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.urgent && !done && (
                      <span style={{ fontSize:'9px', fontWeight:700, padding:'1px 5px', background:'rgba(244,63,94,0.12)', color:'#f43f5e', borderRadius:999 }}>
                        {ar ? 'عاجل' : 'Urgent'}
                      </span>
                    )}
                    <span className="text-xs font-bold" style={{ color:'var(--text-muted)' }}>{task.due}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* IoT Sensors */}
      <div className="card p-5 animate-fadeInUp-delay-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {ar ? 'حساسات IoT — قراءات مباشرة' : 'IoT Sensors — Live Readings'}
          </h3>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34d399' }} />
            <span className="text-xs font-semibold" style={{ color: '#34d399' }}>{ar ? 'مباشر' : 'Live'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {iotSensors.map((s, i) => {
            const { Icon } = s;
            return (
              <div key={i} className="rounded-xl p-4" style={{ background: s.alert ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.025)', border: s.alert ? '1px solid rgba(34,211,238,0.2)' : '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <Icon size={16} color={s.color} strokeWidth={2} />
                  {s.alert && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#fbbf24' }} />}
                </div>
                <p className="text-xl font-extrabold" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</p>
                <p style={{ fontSize:'9px', color:'var(--text-muted)', fontWeight:700, marginTop:2, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                  {ar ? s.labelAr : s.labelEn}
                </p>
                <p style={{ fontSize:'9px', color:'var(--text-secondary)', marginTop:2 }}>{ar ? s.subAr : s.subEn}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weather */}
      <div className="animate-fadeInUp-delay-3">
        <WeatherWidget weather={weather} language={language} />
      </div>

    </div>
  );
};

export default FarmerDashboard;