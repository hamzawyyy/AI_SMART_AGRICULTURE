import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
// ── Types ────────────────────────────────────────────────────
interface Field {
  id: string;
  name: string;
  nameEn: string;
  crop: string;
  cropEn: string;
  area: number;
  health: number;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  moisture: number;
  temp: number;
  nextAction: string;
  nextActionEn: string;
  irrigationDue: string;
  irrigationDueEn: string;
  harvestDate: string;
  harvestDateEn: string;
  plantedDate: string;
  zone: string;
}

interface Task {
  id: string;
  title: string;
  titleEn: string;
  field: string;
  fieldEn: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate: string;
  dueDateEn: string;
  type: 'irrigation' | 'pesticide' | 'harvest' | 'fertilize' | 'inspection';
  done: boolean;
}

interface Sensor {
  id: string;
  label: string;
  labelEn: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
  min: number;
  max: number;
}

// ── Static Data ──────────────────────────────────────────────
const FIELDS: Field[] = [
  {
    id: 'f1', name: 'قطعة أ - البرتقال', nameEn: 'Zone A - Citrus', crop: 'برتقال نافيل', cropEn: 'Navel Orange',
    area: 240, health: 91, status: 'excellent', moisture: 68, temp: 32,
    nextAction: 'ري جدول الثلاثاء', nextActionEn: 'Scheduled irrigation Tue',
    irrigationDue: 'الثلاثاء', irrigationDueEn: 'Tuesday',
    harvestDate: 'نوفمبر 2026', harvestDateEn: 'Nov 2026',
    plantedDate: '2022', zone: 'A',
  },
  {
    id: 'f2', name: 'قطعة ب - المانجو', nameEn: 'Zone B - Mango', crop: 'مانجو كيت', cropEn: 'Keitt Mango',
    area: 185, health: 71, status: 'warning', moisture: 41, temp: 38,
    nextAction: 'رفع الرطوبة - عاجل', nextActionEn: 'Increase moisture - Urgent',
    irrigationDue: 'اليوم', irrigationDueEn: 'Today',
    harvestDate: 'أغسطس 2026', harvestDateEn: 'Aug 2026',
    plantedDate: '2021', zone: 'B',
  },
  {
    id: 'f3', name: 'قطعة ج - العنب', nameEn: 'Zone C - Grapes', crop: 'عنب فليم سيدليس', cropEn: 'Flame Seedless',
    area: 120, health: 95, status: 'excellent', moisture: 72, temp: 30,
    nextAction: 'جاهز للحصاد قريباً', nextActionEn: 'Near harvest-ready',
    irrigationDue: 'الجمعة', irrigationDueEn: 'Friday',
    harvestDate: 'يوليو 2026', harvestDateEn: 'Jul 2026',
    plantedDate: '2023', zone: 'C',
  },
  {
    id: 'f4', name: 'قطعة د - الفراولة', nameEn: 'Zone D - Strawberry', crop: 'فراولة', cropEn: 'Strawberry',
    area: 60, health: 54, status: 'danger', moisture: 29, temp: 40,
    nextAction: 'تدخل فوري - مرض', nextActionEn: 'Immediate action - Disease',
    irrigationDue: 'الآن', irrigationDueEn: 'Now',
    harvestDate: 'متوقف', harvestDateEn: 'On Hold',
    plantedDate: '2024', zone: 'D',
  },
  {
    id: 'f5', name: 'قطعة ه - الطماطم', nameEn: 'Zone E - Tomato', crop: 'طماطم شيري', cropEn: 'Cherry Tomato',
    area: 80, health: 83, status: 'good', moisture: 62, temp: 33,
    nextAction: 'تسميد هذا الأسبوع', nextActionEn: 'Fertilize this week',
    irrigationDue: 'الأحد', irrigationDueEn: 'Sunday',
    harvestDate: 'أكتوبر 2026', harvestDateEn: 'Oct 2026',
    plantedDate: '2024', zone: 'E',
  },
];

const TASKS: Task[] = [
  { id: 't1', title: 'ري عاجل - قطعة الفراولة', titleEn: 'Urgent irrigation - Strawberry Zone', field: 'قطعة د', fieldEn: 'Zone D', priority: 'urgent', dueDate: 'اليوم 3م', dueDateEn: 'Today 3pm', type: 'irrigation', done: false },
  { id: 't2', title: 'رش مبيد - بياض طحين', titleEn: 'Pesticide spray - Powdery mildew', field: 'قطعة د', fieldEn: 'Zone D', priority: 'urgent', dueDate: 'اليوم', dueDateEn: 'Today', type: 'pesticide', done: false },
  { id: 't3', title: 'ري جدول - المانجو', titleEn: 'Scheduled irrigation - Mango', field: 'قطعة ب', fieldEn: 'Zone B', priority: 'high', dueDate: 'الثلاثاء', dueDateEn: 'Tuesday', type: 'irrigation', done: false },
  { id: 't4', title: 'تسميد نيتروجيني - الطماطم', titleEn: 'Nitrogen fertilization - Tomato', field: 'قطعة ه', fieldEn: 'Zone E', priority: 'medium', dueDate: 'الأربعاء', dueDateEn: 'Wednesday', type: 'fertilize', done: false },
  { id: 't5', title: 'فحص جودة الحصاد - العنب', titleEn: 'Harvest quality check - Grapes', field: 'قطعة ج', fieldEn: 'Zone C', priority: 'medium', dueDate: 'الخميس', dueDateEn: 'Thursday', type: 'inspection', done: false },
  { id: 't6', title: 'تقليم أشجار البرتقال', titleEn: 'Orange tree pruning', field: 'قطعة أ', fieldEn: 'Zone A', priority: 'low', dueDate: 'الأسبوع القادم', dueDateEn: 'Next week', type: 'inspection', done: true },
];

const SENSORS: Sensor[] = [
  { id: 's1', label: 'رطوبة التربة (ب)', labelEn: 'Soil Moisture (B)', value: 41, unit: '%', status: 'warning', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-8v-4a1 1 0 012 0v4a1 1 0 01-2 0z', min: 0, max: 100 },
  { id: 's2', label: 'درجة الحرارة (د)', labelEn: 'Temperature (D)', value: 40, unit: '°C', status: 'critical', icon: 'M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z', min: 0, max: 50 },
  { id: 's3', label: 'pH التربة (أ)', labelEn: 'Soil pH (A)', value: 6.8, unit: 'pH', status: 'normal', icon: 'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18', min: 0, max: 14 },
  { id: 's4', label: 'سرعة الرياح', labelEn: 'Wind Speed', value: 18, unit: 'km/h', status: 'normal', icon: 'M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2', min: 0, max: 60 },
  { id: 's5', label: 'رطوبة التربة (ج)', labelEn: 'Soil Moisture (C)', value: 72, unit: '%', status: 'normal', icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-8v-4a1 1 0 012 0v4a1 1 0 01-2 0z', min: 0, max: 100 },
  { id: 's6', label: 'ضغط مضخة الري', labelEn: 'Irrigation Pump Psi', value: 3.2, unit: 'bar', status: 'normal', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', min: 0, max: 6 },
];

// ── Helpers ───────────────────────────────────────────────────
const healthColor = (h: number) => h >= 85 ? 'var(--emerald)' : h >= 65 ? 'var(--amber)' : 'var(--rose)';
const healthGlow  = (h: number) => h >= 85 ? 'var(--emerald-glow)' : h >= 65 ? 'var(--amber-glow)' : 'var(--rose-glow)';
const statusBadge: Record<Field['status'], { bg: string; color: string; label: string; labelEn: string }> = {
  excellent: { bg: 'rgba(52,211,153,.12)', color: 'var(--emerald)', label: 'ممتاز', labelEn: 'Excellent' },
  good:      { bg: 'rgba(34,211,238,.12)', color: 'var(--cyan)',    label: 'جيد',   labelEn: 'Good'      },
  warning:   { bg: 'rgba(251,191,36,.12)', color: 'var(--amber)',   label: 'تحذير', labelEn: 'Warning'   },
  danger:    { bg: 'rgba(244,63,94,.12)',  color: 'var(--rose)',    label: 'خطر',   labelEn: 'Danger'    },
};
const priorityStyle: Record<Task['priority'], { bg: string; color: string; label: string; labelEn: string }> = {
  urgent: { bg: 'rgba(244,63,94,.15)',  color: 'var(--rose)',    label: 'عاجل', labelEn: 'Urgent' },
  high:   { bg: 'rgba(251,191,36,.15)', color: 'var(--amber)',   label: 'عالية', labelEn: 'High'  },
  medium: { bg: 'rgba(34,211,238,.12)', color: 'var(--cyan)',    label: 'متوسطة', labelEn: 'Medium'},
  low:    { bg: 'rgba(52,211,153,.10)', color: 'var(--emerald)', label: 'منخفضة', labelEn: 'Low'  },
};
const taskTypeIcon: Record<Task['type'], string> = {
  irrigation: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-8v-4a1 1 0 012 0v4a1 1 0 01-2 0z',
  pesticide:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  harvest:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  fertilize:  'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18',
  inspection: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
};
const sensorStatusColor: Record<Sensor['status'], string> = {
  normal:   'var(--emerald)',
  warning:  'var(--amber)',
  critical: 'var(--rose)',
};
const cropEmoji: Record<string, string> = {
  'برتقال نافيل': '🍊', 'مانجو كيت': '🥭', 'عنب فليم سيدليس': '🍇', 'فراولة': '🍓', 'طماطم شيري': '🍅',
  'Navel Orange': '🍊', 'Keitt Mango': '🥭', 'Flame Seedless': '🍇', 'Strawberry': '🍓', 'Cherry Tomato': '🍅',
};

// ── Inline icon SVG ───────────────────────────────────────────
const Icon: React.FC<{ d: string; size?: number; color?: string; strokeWidth?: number }> = ({ d, size = 16, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ── Health Ring SVG ───────────────────────────────────────────
const HealthRing: React.FC<{ value: number; size?: number }> = ({ value, size = 48 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = healthColor(value);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
};

// ── SensorBar ────────────────────────────────────────────────
const SensorBar: React.FC<{ sensor: Sensor }> = ({ sensor }) => {
  const pct = Math.min(100, ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100);
  const color = sensorStatusColor[sensor.status];
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: 'width 1s ease' }} />
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
const FarmPage: React.FC = () => {
  const { language } = useApp();
  const ar = language === 'ar';

  const [tasks, setTasks]           = useState<Task[]>(TASKS);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [activeTab, setActiveTab]   = useState<'fields' | 'tasks' | 'sensors' | 'schedule'>('fields');
  const [filterStatus, setFilterStatus] = useState<'all' | Field['status']>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const pendingTasks = tasks.filter(t => !t.done);
  const doneTasks    = tasks.filter(t => t.done);
  const urgentCount  = pendingTasks.filter(t => t.priority === 'urgent').length;

  const filteredFields = filterStatus === 'all'
    ? FIELDS
    : FIELDS.filter(f => f.status === filterStatus);

  const totalArea = FIELDS.reduce((sum, f) => sum + f.area, 0);
  const avgHealth = Math.round(FIELDS.reduce((sum, f) => sum + f.health, 0) / FIELDS.length);

  // ── Tab bar style helper ──
  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '8px 18px',
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    transition: 'all .15s',
    background: activeTab === t ? 'rgba(52,211,153,0.15)' : 'transparent',
    color: activeTab === t ? 'var(--emerald)' : 'var(--text-secondary)',
  });

  return (
    <div className="animate-fadeInUp space-y-6 pb-8">

      {/* ── PAGE HEADER ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--emerald)', textTransform: 'uppercase' }}>
              {ar ? 'إدارة المزرعة' : 'Farm Management'}
            </span>
            <span style={{ fontSize: 10, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: 'var(--emerald)', padding: '1px 8px', borderRadius: 999 }} className="ai-badge">
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block', marginInlineEnd: 4, animation: 'pulse-ring 2s infinite' }} />
              {ar ? 'AI نشط' : 'AI Active'}
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {ar ? 'مزرعتي الذكية' : 'My Smart Farm'}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {ar
              ? `${FIELDS.length} قطع · ${totalArea} فدان · ${ar ? 'صحة متوسطة' : 'Avg health'} ${avgHealth}%`
              : `${FIELDS.length} zones · ${totalArea} acres · Avg health ${avgHealth}%`
            }
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {urgentCount > 0 && (
            <div style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)' }}>
                {urgentCount} {ar ? 'مهام عاجلة' : 'urgent tasks'}
              </span>
            </div>
          )}
          <button
            onClick={() => { setActiveTab('tasks'); setShowAddTask(true); }}
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff', padding: '9px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d="M12 5v14M5 12l7 7 7-7" size={14} color="#fff" />
            {ar ? 'إضافة مهمة' : 'Add Task'}
          </button>
        </div>
      </div>

      {/* ── SUMMARY STRIP ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: ar ? 'إجمالي المساحة' : 'Total Area',      val: `${totalArea}`, unit: ar ? 'فدان' : 'Acres', color: 'var(--emerald)', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
          { label: ar ? 'متوسط الصحة' : 'Avg Health',        val: `${avgHealth}%`, unit: ar ? 'كلي' : 'Overall', color: avgHealth >= 80 ? 'var(--emerald)' : 'var(--amber)', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
          { label: ar ? 'مهام معلقة' : 'Pending Tasks',      val: `${pendingTasks.length}`, unit: ar ? 'مهمة' : 'Tasks', color: pendingTasks.length > 3 ? 'var(--rose)' : 'var(--cyan)', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
          { label: ar ? 'مستشعرات نشطة' : 'Active Sensors',  val: `${SENSORS.length}`, unit: ar ? 'مستشعر' : 'Online', color: 'var(--cyan)', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        ].map((item, i) => (
          <div key={i} className="card animate-fadeInUp-delay-1" style={{ padding: '14px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 2, background: `linear-gradient(90deg, ${item.color}88, ${item.color})` }} />
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
              <Icon d={item.icon} size={14} color={item.color} />
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.val}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{item.unit}</p>
          </div>
        ))}
      </div>

      {/* ── TAB BAR ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'fields',   labelAr: '🌿 القطع الزراعية', labelEn: '🌿 Fields' },
          { key: 'tasks',    labelAr: '✅ المهام',           labelEn: '✅ Tasks'  },
          { key: 'sensors',  labelAr: '📡 المستشعرات',       labelEn: '📡 Sensors'},
          { key: 'schedule', labelAr: '📅 الجدول',           labelEn: '📅 Schedule'},
        ].map(tab => (
          <button key={tab.key} style={tabStyle(tab.key)} onClick={() => setActiveTab(tab.key as typeof activeTab)}>
            {ar ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          TAB: FIELDS
      ════════════════════════════════════════════ */}
      {activeTab === 'fields' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedField ? '1fr 380px' : '1fr', gap: 16 }}>

          {/* Fields list + filter */}
          <div>
            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              {(['all', 'excellent', 'good', 'warning', 'danger'] as const).map(s => {
                const labels: Record<string, string> = { all: ar ? 'الكل' : 'All', excellent: ar ? 'ممتاز' : 'Excellent', good: ar ? 'جيد' : 'Good', warning: ar ? 'تحذير' : 'Warning', danger: ar ? 'خطر' : 'Danger' };
                const active = filterStatus === s;
                return (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    style={{ padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .15s', border: active ? '1px solid rgba(52,211,153,0.4)' : '1px solid var(--border)', background: active ? 'rgba(52,211,153,0.12)' : 'transparent', color: active ? 'var(--emerald)' : 'var(--text-secondary)' }}>
                    {labels[s]}
                    {s !== 'all' && <span style={{ marginInlineStart: 6, opacity: 0.7 }}>({FIELDS.filter(f => f.status === s).length})</span>}
                  </button>
                );
              })}
            </div>

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filteredFields.map((field, i) => {
                const badge = statusBadge[field.status];
                const isSelected = selectedField?.id === field.id;
                return (
                  <div key={field.id}
                    onClick={() => setSelectedField(isSelected ? null : field)}
                    className="card card-hover animate-fadeInUp"
                    style={{ padding: 18, cursor: 'pointer', animationDelay: `${i * 0.06}s`, border: isSelected ? '1px solid rgba(52,211,153,0.5)' : '1px solid var(--border)', boxShadow: isSelected ? '0 0 0 1px rgba(52,211,153,0.2)' : undefined }}>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {cropEmoji[ar ? field.crop : field.cropEn]} {ar ? field.name : field.nameEn}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                          {ar ? field.crop : field.cropEn} · {field.area} {ar ? 'فدان' : 'acres'}
                        </p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: badge.bg, color: badge.color }}>
                        {ar ? badge.label : badge.labelEn}
                      </span>
                    </div>

                    {/* Health ring + data */}
                    <div className="flex items-center gap-4">
                      <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                        <HealthRing value={field.health} size={48} />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: healthColor(field.health), fontFamily: 'monospace' }}>{field.health}%</span>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
                          {[
                            { label: ar ? 'رطوبة' : 'Moisture', val: `${field.moisture}%`, color: field.moisture < 40 ? 'var(--rose)' : field.moisture < 60 ? 'var(--amber)' : 'var(--cyan)' },
                            { label: ar ? 'الحرارة' : 'Temp', val: `${field.temp}°C`, color: field.temp > 38 ? 'var(--rose)' : field.temp > 34 ? 'var(--amber)' : 'var(--emerald)' },
                          ].map((item, j) => (
                            <div key={j}>
                              <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
                              <p style={{ fontSize: 14, fontWeight: 800, color: item.color, fontFamily: 'monospace' }}>{item.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Health bar */}
                    <div className="health-bar" style={{ marginTop: 12 }}>
                      <div className="health-bar-fill" style={{ width: `${field.health}%`, background: `linear-gradient(90deg, ${healthColor(field.health)}88, ${healthColor(field.health)})` }} />
                    </div>

                    {/* Next action */}
                    <div style={{ marginTop: 12, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon d={taskTypeIcon.irrigation} size={12} color="var(--text-muted)" />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ar ? field.nextAction : field.nextActionEn}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Field detail panel */}
          {selectedField && (
            <div className="card animate-fadeInUp" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start', position: 'sticky', top: 90 }}>
              {/* Banner */}
              <div style={{ background: `linear-gradient(135deg, ${healthGlow(selectedField.health)}, rgba(255,255,255,0.02))`, padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ fontSize: 22, marginBottom: 4 }}>{cropEmoji[ar ? selectedField.crop : selectedField.cropEn]}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? selectedField.name : selectedField.nameEn}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{ar ? selectedField.crop : selectedField.cropEn}</p>
                  </div>
                  <button onClick={() => setSelectedField(null)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '5px 8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Icon d="M6 18L18 6M6 6l12 12" size={14} />
                  </button>
                </div>

                {/* Big health ring */}
                <div className="flex items-center gap-5 mt-4">
                  <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                    <HealthRing value={selectedField.health} size={72} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: healthColor(selectedField.health), fontFamily: 'monospace' }}>{selectedField.health}%</span>
                      <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{ar ? 'صحة' : 'health'}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: ar ? 'المساحة' : 'Area',    val: `${selectedField.area} ${ar ? 'فدان' : 'ac'}`, color: 'var(--emerald)' },
                      { label: ar ? 'المنطقة' : 'Zone',    val: selectedField.zone,             color: 'var(--cyan)' },
                      { label: ar ? 'الرطوبة' : 'Moisture', val: `${selectedField.moisture}%`, color: selectedField.moisture < 40 ? 'var(--rose)' : 'var(--cyan)' },
                      { label: ar ? 'الحرارة' : 'Temp',    val: `${selectedField.temp}°C`,     color: selectedField.temp > 38 ? 'var(--rose)' : 'var(--amber)' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px' }}>
                        <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: item.color, fontFamily: 'monospace' }}>{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: ar ? 'سنة الزراعة' : 'Planted', val: selectedField.plantedDate, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { label: ar ? 'موعد الري القادم' : 'Next Irrigation', val: ar ? selectedField.irrigationDue : selectedField.irrigationDueEn, icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-8v-4a1 1 0 012 0v4a1 1 0 01-2 0z' },
                  { label: ar ? 'موعد الحصاد' : 'Harvest Date', val: ar ? selectedField.harvestDate : selectedField.harvestDateEn, icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
                  { label: ar ? 'الإجراء القادم' : 'Next Action', val: ar ? selectedField.nextAction : selectedField.nextActionEn, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Icon d={row.icon} size={14} color="var(--text-muted)" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>{row.label}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, marginTop: 2 }}>{row.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Related tasks */}
              <div style={{ padding: '0 20px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  {ar ? 'المهام المرتبطة' : 'Related Tasks'}
                </p>
                {tasks.filter(t => t.field === selectedField.name || t.fieldEn === selectedField.nameEn.split(' - ')[0]).length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ar ? 'لا توجد مهام' : 'No tasks'}</p>
                  : tasks.filter(t => t.field === selectedField.name || t.fieldEn.includes(selectedField.zone)).map(t => {
                      const ps = priorityStyle[t.priority];
                      return (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 999, background: ps.bg, color: ps.color, fontWeight: 800 }}>{ar ? ps.label : ps.labelEn}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>{ar ? t.title : t.titleEn}</span>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: TASKS
      ════════════════════════════════════════════ */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

          {/* Task list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? 'المهام الزراعية' : 'Farm Tasks'}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{pendingTasks.length} {ar ? 'معلقة' : 'pending'} · {doneTasks.length} {ar ? 'مكتملة' : 'done'}</p>
              </div>
              <button onClick={() => setShowAddTask(p => !p)}
                style={{ background: showAddTask ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: showAddTask ? 'var(--emerald)' : 'var(--text-secondary)', padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700 }}>
                {showAddTask ? (ar ? '✕ إلغاء' : '✕ Cancel') : (ar ? '+ إضافة' : '+ Add')}
              </button>
            </div>

            {/* Add task form */}
            {showAddTask && (
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(52,211,153,0.04)' }}>
                <input
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder={ar ? 'عنوان المهمة الجديدة...' : 'New task title...'}
                  style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: 9, padding: '9px 14px', fontSize: 13, color: 'var(--text-primary)', outline: 'none', marginBottom: 8 }}
                />
                <button
                  onClick={() => {
                    if (!newTaskTitle.trim()) return;
                    const newTask: Task = { id: `t${Date.now()}`, title: newTaskTitle, titleEn: newTaskTitle, field: ar ? 'عام' : 'General', fieldEn: 'General', priority: 'medium', dueDate: ar ? 'قريباً' : 'Soon', dueDateEn: 'Soon', type: 'inspection', done: false };
                    setTasks(p => [newTask, ...p]);
                    setNewTaskTitle('');
                    setShowAddTask(false);
                  }}
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 9, fontSize: 12, fontWeight: 700 }}>
                  {ar ? 'حفظ المهمة' : 'Save Task'}
                </button>
              </div>
            )}

            {/* Pending tasks */}
            <div style={{ padding: '12px 20px 0' }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                {ar ? 'معلقة' : 'PENDING'} ({pendingTasks.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pendingTasks.map(task => {
                  const ps = priorityStyle[task.priority];
                  return (
                    <div key={task.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all .15s', cursor: 'default' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}>

                      {/* Checkbox */}
                      <button onClick={() => toggleTask(task.id)}
                        style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${ps.color}`, background: 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = ps.bg}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'} />

                      {/* Icon */}
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: ps.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon d={taskTypeIcon[task.type]} size={14} color={ps.color} />
                      </div>

                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{ar ? task.title : task.titleEn}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{ar ? task.field : task.fieldEn} · {ar ? task.dueDate : task.dueDateEn}</p>
                      </div>

                      {/* Priority badge */}
                      <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 999, background: ps.bg, color: ps.color, fontWeight: 800, flexShrink: 0 }}>
                        {ar ? ps.label : ps.labelEn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Done tasks */}
            {doneTasks.length > 0 && (
              <div style={{ padding: '14px 20px 20px' }}>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                  {ar ? 'مكتملة' : 'COMPLETED'} ({doneTasks.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {doneTasks.map(task => (
                    <div key={task.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', borderRadius: 10, opacity: 0.5 }}>
                      <button onClick={() => toggleTask(task.id)}
                        style={{ width: 20, height: 20, borderRadius: 6, border: '2px solid var(--emerald)', background: 'var(--emerald)', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{ar ? task.title : task.titleEn}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Task summary sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Priority breakdown */}
            <div className="card" style={{ padding: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 14 }}>{ar ? 'توزيع الأولوية' : 'Priority Breakdown'}</p>
              {(['urgent', 'high', 'medium', 'low'] as const).map(p => {
                const count = pendingTasks.filter(t => t.priority === p).length;
                const ps = priorityStyle[p];
                const pct = pendingTasks.length ? Math.round((count / pendingTasks.length) * 100) : 0;
                return (
                  <div key={p} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ps.color }}>{ar ? ps.label : ps.labelEn}</span>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: ps.color, borderRadius: 999, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI suggestion */}
            <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, background: 'rgba(52,211,153,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3z"/></svg>
                </div>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--emerald)', letterSpacing: '0.04em' }}>AI ADVISOR</p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                {ar
                  ? 'أولوية اليوم: تدخل فوري في قطعة الفراولة (ري + رش مبيد). الرطوبة 29% تهدد المحصول.'
                  : "Today's priority: Immediate intervention in Strawberry zone (irrigation + pesticide). 29% moisture threatens the crop."}
              </p>
              <button style={{ width: '100%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: 'var(--emerald)', padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700 }}>
                {ar ? 'عرض خطة التدخل ↗' : 'View Action Plan ↗'}
              </button>
            </div>

            {/* Quick stats */}
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 12 }}>{ar ? 'ملخص الأسبوع' : 'Weekly Summary'}</p>
              {[
                { label: ar ? 'مهام مكتملة' : 'Tasks done',   val: '8', color: 'var(--emerald)' },
                { label: ar ? 'حقول مرويّة' : 'Fields irrigated', val: '4', color: 'var(--cyan)' },
                { label: ar ? 'تقارير AI' : 'AI reports',    val: '3', color: 'var(--amber)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: item.color, fontFamily: 'monospace' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: SENSORS
      ════════════════════════════════════════════ */}
      {activeTab === 'sensors' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{ar ? 'مراقبة المستشعرات الحية' : 'Live IoT Sensor Monitoring'}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{ar ? 'تحديث كل 30 ثانية' : 'Updates every 30 seconds'}</p>
            </div>
            <div className="ai-badge" style={{ gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', animation: 'pulse-ring 2s infinite', display: 'inline-block' }} />
              {ar ? 'بيانات حية' : 'Live Data'}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {SENSORS.map((sensor, i) => {
              const color = sensorStatusColor[sensor.status];
              const statusLabels = { normal: ar ? 'طبيعي' : 'Normal', warning: ar ? 'تحذير' : 'Warning', critical: ar ? 'حرج' : 'Critical' };
              return (
                <div key={sensor.id} className="card card-hover animate-fadeInUp" style={{ padding: 18, animationDelay: `${i * 0.07}s` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon d={sensor.icon} size={18} color={color} />
                    </div>
                    <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 999, background: `${color}15`, color, fontWeight: 800, border: `1px solid ${color}30` }}>
                      {statusLabels[sensor.status]}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{ar ? sensor.label : sensor.labelEn}</p>
                  <p style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
                    {sensor.value}<span style={{ fontSize: 14, color: 'var(--text-muted)', marginInlineStart: 4 }}>{sensor.unit}</span>
                  </p>
                  <SensorBar sensor={sensor} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{sensor.min}{sensor.unit}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{sensor.max}{sensor.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning sensor banner */}
          {SENSORS.some(s => s.status !== 'normal') && (
            <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(244,63,94,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" size={18} color="var(--rose)" />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--rose)' }}>{ar ? 'تحذير: مستشعران يحتاجان تدخلاً' : '2 sensors require attention'}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {ar ? 'درجة حرارة قطعة د حرجة (40°C) · رطوبة قطعة ب منخفضة (41%)' : 'Zone D temp critical (40°C) · Zone B moisture low (41%)'}
                </p>
              </div>
              <button style={{ marginInlineStart: 'auto', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', color: 'var(--rose)', padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {ar ? 'معالجة' : 'Resolve'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB: SCHEDULE
      ════════════════════════════════════════════ */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>

          {/* Weekly calendar */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              {ar ? 'جدول الأسبوع الحالي' : 'Current Week Schedule'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
              {(ar
                ? ['السبت','الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة']
                : ['Sat','Sun','Mon','Tue','Wed','Thu','Fri']
              ).map((day, di) => {
                const today = di === 0;
                const dayTasks = [
                  di === 0 ? [{ label: ar ? 'ري - د' : 'Irrig D', color: 'var(--rose)' }, { label: ar ? 'رش - د' : 'Spray D', color: 'var(--rose)' }] : [],
                  di === 1 ? [{ label: ar ? 'ري - ب' : 'Irrig B', color: 'var(--amber)' }] : [],
                  di === 2 ? [] : [],
                  di === 3 ? [{ label: ar ? 'ري - أ' : 'Irrig A', color: 'var(--emerald)' }] : [],
                  di === 4 ? [{ label: ar ? 'تسميد - ه' : 'Fert E', color: 'var(--cyan)' }] : [],
                  di === 5 ? [{ label: ar ? 'فحص - ج' : 'Inspect C', color: 'var(--emerald)' }] : [],
                  di === 6 ? [{ label: ar ? 'ري - ج' : 'Irrig C', color: 'var(--emerald)' }] : [],
                ][di];

                return (
                  <div key={di} style={{
                    borderRadius: 12, padding: '10px 8px',
                    background: today ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.02)',
                    border: today ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    minHeight: 120,
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: today ? 'var(--emerald)' : 'var(--text-muted)', textAlign: 'center', marginBottom: 8 }}>{day}</p>
                    {today && <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--emerald)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 9, color: '#000', fontWeight: 800 }}>اليوم</span>
                    </div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {dayTasks.map((t, ti) => (
                        <div key={ti} style={{ background: `${t.color}18`, border: `1px solid ${t.color}30`, borderRadius: 6, padding: '3px 6px', fontSize: 9, color: t.color, fontWeight: 700, textAlign: 'center' }}>
                          {t.label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="card" style={{ padding: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>{ar ? 'الأحداث القادمة' : 'Upcoming Events'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: ar ? 'حصاد العنب - قطعة ج' : 'Grape harvest - Zone C',     date: ar ? 'يوليو 2026' : 'Jul 2026',  color: 'var(--emerald)', icon: '🍇' },
                { label: ar ? 'حصاد المانجو - قطعة ب' : 'Mango harvest - Zone B',   date: ar ? 'أغسطس 2026' : 'Aug 2026', color: 'var(--amber)',   icon: '🥭' },
                { label: ar ? 'تقييم جودة التصدير' : 'Export quality assessment',    date: ar ? 'يوليو 15' : 'Jul 15',     color: 'var(--cyan)',    icon: '🏆' },
                { label: ar ? 'صيانة منظومة الري' : 'Irrigation system maintenance', date: ar ? 'يوليو 20' : 'Jul 20',     color: 'var(--text-secondary)', icon: '🔧' },
                { label: ar ? 'حصاد البرتقال - قطعة أ' : 'Citrus harvest - Zone A', date: ar ? 'نوفمبر 2026' : 'Nov 2026',color: 'var(--amber)',   icon: '🍊' },
              ].map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{ev.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{ev.label}</p>
                    <p style={{ fontSize: 10, color: ev.color, fontWeight: 700, marginTop: 2 }}>{ev.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: 12 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--cyan)', marginBottom: 4 }}>AI FORECAST</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {ar
                  ? 'الموسم الحالي أفضل بنسبة 18% من العام الماضي. إنتاجية مرتفعة متوقعة للعنب والبرتقال.'
                  : 'Current season is 18% better than last year. High yield expected for grapes and citrus.'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmPage;