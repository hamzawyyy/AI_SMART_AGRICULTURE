// src/pages/reports/ReportsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  reportsApi,
  ROLE_REPORT_TYPES,
} from '../../api/reportsApi';
import type {
  ReportItem,
  ReportSummary,
  ReportType,
  UserRole,
} from '../../api/reportsApi';

// ── Helpers ───────────────────────────────────────────────────

const fmtDate = (iso: string, ar: boolean) =>
  new Date(iso).toLocaleDateString(ar ? 'ar-EG' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ── Type config ───────────────────────────────────────────────

type FilterKey = 'all' | ReportType;

interface TypeConfig {
  labelAr: string;
  labelEn: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

const ALL_TYPE_CONFIG: Record<string, TypeConfig> = {
  all: {
    labelAr: 'الكل', labelEn: 'All',
    color: 'var(--text-secondary)', bg: 'var(--bg-card)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  disease: {
    labelAr: 'الأمراض', labelEn: 'Disease',
    color: 'var(--rose)', bg: 'rgba(244,63,94,0.1)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
  },
  quality: {
    labelAr: 'الجودة', labelEn: 'Quality',
    color: 'var(--amber)', bg: 'rgba(251,191,36,0.1)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  export: {
    labelAr: 'التصدير', labelEn: 'Export',
    color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  },
  environment: {
    labelAr: 'البيئة', labelEn: 'Environment',
    color: 'var(--cyan)', bg: 'rgba(34,211,238,0.1)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
  marketplace: {
    labelAr: 'السوق', labelEn: 'Marketplace',
    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  compliance: {
    labelAr: 'الامتثال', labelEn: 'Compliance',
    color: '#f97316', bg: 'rgba(249,115,22,0.1)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
  system: {
    labelAr: 'النظام', labelEn: 'System',
    color: 'var(--text-secondary)', bg: 'rgba(148,163,184,0.1)',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
  },
};

const STATUS_CONFIG = {
  success: { color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)', labelAr: 'ناجح', labelEn: 'Success' },
  warning: { color: 'var(--amber)', bg: 'rgba(251,191,36,0.1)', labelAr: 'تحذير', labelEn: 'Warning' },
  error:   { color: 'var(--rose)', bg: 'rgba(244,63,94,0.1)', labelAr: 'خطأ', labelEn: 'Error' },
  pending: { color: 'var(--cyan)', bg: 'rgba(34,211,238,0.1)', labelAr: 'معلق', labelEn: 'Pending' },
};

// ── Role labels ───────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, { ar: string; en: string; color: string }> = {
  admin:    { ar: 'مدير النظام', en: 'Admin', color: 'var(--rose)' },
  farmer:   { ar: 'مزارع', en: 'Farmer', color: 'var(--emerald)' },
  trader:   { ar: 'تاجر', en: 'Trader', color: '#a78bfa' },
  exporter: { ar: 'مصدّر', en: 'Exporter', color: 'var(--cyan)' },
};

// ── Summary cards ─────────────────────────────────────────────

const SummaryCards: React.FC<{
  summary: ReportSummary;
  ar: boolean;
  role: UserRole;
}> = ({ summary, ar, role }) => {
  type CardDef = {
    labelAr: string; labelEn: string;
    value: string | number; color: string; glow: string;
  };

  const base: CardDef[] = [
    { labelAr: 'إجمالي التقارير', labelEn: 'Total Reports', value: summary.total,       color: 'var(--emerald)', glow: 'rgba(52,211,153,0.15)' },
    { labelAr: 'هذا الأسبوع',     labelEn: 'This Week',     value: summary.thisWeek,    color: 'var(--cyan)',    glow: 'rgba(34,211,238,0.12)' },
    { labelAr: 'معدل النجاح',     labelEn: 'Success Rate',  value: `${summary.successRate}%`, color: 'var(--amber)', glow: 'rgba(251,191,36,0.12)' },
  ];

  // Role-specific 4th card
  const roleExtra: Record<UserRole, CardDef> = {
    farmer:   { labelAr: 'تقارير أمراض', labelEn: 'Disease Reports', value: summary.disease ?? 0,     color: 'var(--rose)', glow: 'rgba(244,63,94,0.12)' },
    trader:   { labelAr: 'تقارير السوق', labelEn: 'Market Reports',   value: summary.marketplace ?? 0, color: '#a78bfa',     glow: 'rgba(167,139,250,0.12)' },
    exporter: { labelAr: 'تقارير تصدير', labelEn: 'Export Reports',   value: summary.export ?? 0,      color: 'var(--cyan)', glow: 'rgba(34,211,238,0.12)' },
    admin:    { labelAr: 'تقارير نظام',  labelEn: 'System Reports',   value: summary.system ?? 0,      color: 'var(--rose)', glow: 'rgba(244,63,94,0.12)' },
  };

  const cards = [...base, roleExtra[role]];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)', borderRadius: 14,
          border: '1px solid var(--border)', padding: '16px 18px',
          boxShadow: `0 0 20px ${c.glow}`,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            {ar ? c.labelAr : c.labelEn}
          </p>
          <p style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{c.value}</p>
        </div>
      ))}
    </div>
  );
};

// ── Report card ───────────────────────────────────────────────

const ReportCard: React.FC<{
  report: ReportItem;
  ar: boolean;
  onDelete: (id: string) => void;
  selected: boolean;
  onSelect: (id: string) => void;
}> = ({ report, ar, onDelete, selected, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const tc = ALL_TYPE_CONFIG[report.type] || ALL_TYPE_CONFIG.all;
  const sc = STATUS_CONFIG[report.status];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(ar ? 'هل تريد حذف هذا التقرير؟' : 'Delete this report?')) return;
    setDeleting(true);
    await reportsApi.deleteReport(report.id);
    onDelete(report.id);
  };

  return (
    <div
      onClick={() => setExpanded(p => !p)}
      style={{
        background: selected ? 'rgba(52,211,153,0.05)' : 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--emerald)' : 'var(--border)'}`,
        borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
        transition: 'all .2s', marginBottom: 10, opacity: deleting ? 0.4 : 1,
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Checkbox */}
        <input type="checkbox" checked={selected}
          onChange={e => { e.stopPropagation(); onSelect(report.id); }}
          style={{ accentColor: 'var(--emerald)', width: 15, height: 15, flexShrink: 0 }}
          onClick={e => e.stopPropagation()}
        />

        {/* Type badge */}
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          color: tc.color, background: tc.bg,
          display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        }}>
          {tc.icon}
          {ar ? tc.labelAr : tc.labelEn}
        </span>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 150 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            {ar ? report.title : report.titleEn}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {ar ? report.subtitle : report.subtitleEn}
          </p>
        </div>

        {/* Status badge */}
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
          color: sc.color, background: sc.bg, flexShrink: 0,
        }}>
          {ar ? sc.labelAr : sc.labelEn}
        </span>

        {/* Confidence */}
        {report.confidence !== undefined && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
            {Math.round(report.confidence * 100)}%
          </span>
        )}

        {/* Time */}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
          {fmtDate(report.timestamp, ar)}
        </span>

        {/* Delete */}
        <button onClick={handleDelete}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', padding: 4, borderRadius: 6, flexShrink: 0,
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--rose)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{ar ? 'النتيجة: ' : 'Result: '}</strong>
            {ar ? report.result : report.resultEn}
          </p>
          {report.details && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(report.details).map(([k, v]) => (
                <span key={k} style={{
                  padding: '4px 10px', borderRadius: 8,
                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                  fontSize: 12, color: 'var(--text-secondary)',
                }}>
                  <strong style={{ color: 'var(--text-muted)' }}>{k}: </strong>{v}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────

export const ReportsPage: React.FC = () => {
  const { language, user } = useApp();
  const ar = language === 'ar';
  const role = (user?.role ?? 'farmer') as UserRole;

  const allowedTypes = ROLE_REPORT_TYPES[role];
  const filters: FilterKey[] = ['all', ...allowedTypes];

  const [filter, setFilter] = useState<FilterKey>('all');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [rRes, sRes] = await Promise.all([
      reportsApi.getReports(role, filter),
      reportsApi.getSummary(role),
    ]);
    if (rRes.success) setReports(rRes.data.reports);
    if (sRes.success) setSummary(sRes.data);
    setLoading(false);
  }, [filter, role]);

  useEffect(() => { loadData(); }, [loadData]);

  // Reset filter if it's not in role's allowed types
  useEffect(() => {
    if (filter !== 'all' && !allowedTypes.includes(filter as ReportType)) {
      setFilter('all');
    }
  }, [role]);

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id))
    );
  };

  const handleExport = async () => {
    setExporting(true);
    const ids = selectedIds.size > 0 ? [...selectedIds] : reports.map(r => r.id);
    const res = await reportsApi.exportToPdf(ids);
    if (res.success) alert(ar ? 'جارٍ تحميل التقرير...' : 'Downloading report...');
    setExporting(false);
  };

  const filtered = reports.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title.includes(q) || r.titleEn.toLowerCase().includes(q) ||
      r.result.includes(q) || r.resultEn.toLowerCase().includes(q) ||
      r.subtitle.includes(q)
    );
  });

  const rl = ROLE_LABELS[role];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            {ar ? 'التقارير والسجل' : 'Reports & History'}
          </h1>
          {/* Role badge */}
          <span style={{
            padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            color: rl.color, background: `${rl.color}18`,
            border: `1px solid ${rl.color}30`,
          }}>
            {ar ? rl.ar : rl.en}
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {ar
            ? `سجل تحليلات الذكاء الاصطناعي المخصصة لك — ${allowedTypes.map(t => ALL_TYPE_CONFIG[t]?.labelAr).join('، ')}`
            : `Your AI analysis history — ${allowedTypes.map(t => ALL_TYPE_CONFIG[t]?.labelEn).join(', ')}`}
        </p>
      </div>

      {/* Summary cards */}
      {summary && <SummaryCards summary={summary} ar={ar} role={role} />}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        {/* Search */}
        <div style={{
          flex: 1, minWidth: 200,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '8px 14px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={ar ? 'ابحث في التقارير...' : 'Search reports...'}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13,
              fontFamily: 'inherit', width: '100%',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Filter tabs — only role-allowed types */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {filters.map(f => {
            const tc = ALL_TYPE_CONFIG[f];
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: '1px solid',
                  borderColor: active ? tc.color : 'var(--border)',
                  background: active ? tc.bg : 'transparent',
                  color: active ? tc.color : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all .15s',
                }}
              >
                {tc.icon}
                {ar ? tc.labelAr : tc.labelEn}
              </button>
            );
          })}
        </div>

        {/* Export + Select all */}
        <div style={{ display: 'flex', gap: 8, marginInlineStart: 'auto' }}>
          {filtered.length > 0 && (
            <button onClick={toggleSelectAll}
              style={{
                padding: '7px 14px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
              }}>
              {selectedIds.size === filtered.length
                ? (ar ? 'إلغاء التحديد' : 'Deselect all')
                : (ar ? 'تحديد الكل' : 'Select all')
              }
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', fontSize: 12, fontWeight: 700,
              cursor: exporting ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: exporting ? 0.7 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {exporting ? (ar ? 'جارٍ التصدير...' : 'Exporting...') : (ar ? 'تصدير PDF' : 'Export PDF')}
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
          {ar
            ? `${filtered.length} تقرير${selectedIds.size > 0 ? ` · ${selectedIds.size} محدد` : ''}`
            : `${filtered.length} report${filtered.length !== 1 ? 's' : ''}${selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ''}`
          }
        </p>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 72, borderRadius: 14, background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:.9}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"
            style={{ margin: '0 auto 12px', display: 'block' }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            {search
              ? (ar ? 'لا توجد نتائج لهذا البحث' : 'No results for this search')
              : (ar ? 'لا توجد تقارير بعد' : 'No reports yet')}
          </p>
          {!search && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              {ar ? 'ستظهر تقاريرك هنا بعد إجراء أول تحليل' : 'Your reports will appear here after your first analysis'}
            </p>
          )}
        </div>
      ) : (
        filtered.map(r => (
          <ReportCard
            key={r.id}
            report={r}
            ar={ar}
            onDelete={handleDelete}
            selected={selectedIds.has(r.id)}
            onSelect={toggleSelect}
          />
        ))
      )}
    </div>
  );
};

export default ReportsPage;
