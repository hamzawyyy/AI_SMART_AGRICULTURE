import React, { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

// ── Types ─────────────────────────────────────────────────────
type DocStatus = 'approved' | 'pending' | 'rejected' | 'draft' | 'expired';
type ShipmentStatus = 'in-transit' | 'delivered' | 'preparing' | 'customs' | 'delayed';
type DocType =
  | 'phytosanitary' | 'certificate-of-origin' | 'invoice'
  | 'packing-list' | 'bill-of-lading' | 'quality-cert' | 'fumigation';

interface ExportDocument {
  id: string;
  type: DocType;
  nameAr: string;
  nameEn: string;
  shipmentId: string;
  destination: string;
  destinationFlag: string;
  status: DocStatus;
  issuedDate: string;
  expiryDate: string;
  issuedBy: string;
  fileSize: string;
  required: boolean;
  notes?: string;
  notesEn?: string;
}

interface Shipment {
  id: string;
  refCode: string;
  cropAr: string;
  cropEn: string;
  emoji: string;
  destination: string;
  destinationFlag: string;
  destinationAr: string;
  quantity: string;
  value: string;
  status: ShipmentStatus;
  departure: string;
  departureEn: string;
  eta: string;
  etaEn: string;
  containers: number;
  qualityGrade: string;
  completionPct: number;
  docsTotal: number;
  docsReady: number;
}

interface Market {
  country: string;
  countryAr: string;
  flag: string;
  requirement: string;
  requirementEn: string;
  status: 'compliant' | 'action-needed' | 'pending';
  deadline: string;
  deadlineEn: string;
}

// ── Static Data ────────────────────────────────────────────────
const SHIPMENTS: Shipment[] = [
  {
    id: 's1', refCode: 'EXP-2026-0441',
    cropAr: 'عنب فليم سيدليس', cropEn: 'Flame Seedless Grapes', emoji: '🍇',
    destination: 'Germany', destinationFlag: '🇩🇪', destinationAr: 'ألمانيا',
    quantity: '48 طن', value: '$640K', status: 'in-transit',
    departure: 'يونيو 18, 2026', departureEn: 'Jun 18, 2026',
    eta: 'يوليو 4, 2026', etaEn: 'Jul 4, 2026',
    containers: 4, qualityGrade: 'A+', completionPct: 100, docsTotal: 7, docsReady: 7,
  },
  {
    id: 's2', refCode: 'EXP-2026-0438',
    cropAr: 'برتقال نافيل', cropEn: 'Navel Orange', emoji: '🍊',
    destination: 'UAE', destinationFlag: '🇦🇪', destinationAr: 'الإمارات',
    quantity: '72 طن', value: '$840K', status: 'customs',
    departure: 'يونيو 15, 2026', departureEn: 'Jun 15, 2026',
    eta: 'يونيو 28, 2026', etaEn: 'Jun 28, 2026',
    containers: 6, qualityGrade: 'A+', completionPct: 86, docsTotal: 7, docsReady: 6,
  },
  {
    id: 's3', refCode: 'EXP-2026-0445',
    cropAr: 'مانجو كيت', cropEn: 'Keitt Mango', emoji: '🥭',
    destination: 'Saudi Arabia', destinationFlag: '🇸🇦', destinationAr: 'السعودية',
    quantity: '36 طن', value: '$520K', status: 'preparing',
    departure: 'يوليو 10, 2026', departureEn: 'Jul 10, 2026',
    eta: 'يوليو 18, 2026', etaEn: 'Jul 18, 2026',
    containers: 3, qualityGrade: 'B+', completionPct: 57, docsTotal: 7, docsReady: 4,
  },
  {
    id: 's4', refCode: 'EXP-2026-0431',
    cropAr: 'فراولة', cropEn: 'Strawberry', emoji: '🍓',
    destination: 'UK', destinationFlag: '🇬🇧', destinationAr: 'المملكة المتحدة',
    quantity: '18 طن', value: '$280K', status: 'delayed',
    departure: 'متأخر', departureEn: 'Delayed',
    eta: 'معلق', etaEn: 'On Hold',
    containers: 2, qualityGrade: 'C', completionPct: 28, docsTotal: 7, docsReady: 2,
  },
];

const DOCUMENTS: ExportDocument[] = [
  // S1 - Germany Grapes (all approved)
  { id: 'd1', type: 'phytosanitary', nameAr: 'شهادة صحة النبات', nameEn: 'Phytosanitary Certificate', shipmentId: 's1', destination: 'Germany', destinationFlag: '🇩🇪', status: 'approved', issuedDate: 'Jun 14, 2026', expiryDate: 'Aug 14, 2026', issuedBy: 'MALR Egypt', fileSize: '1.2 MB', required: true },
  { id: 'd2', type: 'certificate-of-origin', nameAr: 'شهادة المنشأ', nameEn: 'Certificate of Origin', shipmentId: 's1', destination: 'Germany', destinationFlag: '🇩🇪', status: 'approved', issuedDate: 'Jun 14, 2026', expiryDate: 'Dec 14, 2026', issuedBy: 'Cairo Chamber of Commerce', fileSize: '0.8 MB', required: true },
  { id: 'd3', type: 'invoice', nameAr: 'الفاتورة التجارية', nameEn: 'Commercial Invoice', shipmentId: 's1', destination: 'Germany', destinationFlag: '🇩🇪', status: 'approved', issuedDate: 'Jun 15, 2026', expiryDate: '—', issuedBy: 'AgriIntel Exports LLC', fileSize: '0.4 MB', required: true },
  { id: 'd4', type: 'packing-list', nameAr: 'قائمة التعبئة', nameEn: 'Packing List', shipmentId: 's1', destination: 'Germany', destinationFlag: '🇩🇪', status: 'approved', issuedDate: 'Jun 15, 2026', expiryDate: '—', issuedBy: 'AgriIntel Exports LLC', fileSize: '0.3 MB', required: true },
  { id: 'd5', type: 'bill-of-lading', nameAr: 'بوليصة الشحن', nameEn: 'Bill of Lading', shipmentId: 's1', destination: 'Germany', destinationFlag: '🇩🇪', status: 'approved', issuedDate: 'Jun 18, 2026', expiryDate: '—', issuedBy: 'Mediterranean Shipping Co.', fileSize: '0.6 MB', required: true },
  { id: 'd6', type: 'quality-cert', nameAr: 'شهادة الجودة GlobalGAP', nameEn: 'GlobalGAP Quality Cert', shipmentId: 's1', destination: 'Germany', destinationFlag: '🇩🇪', status: 'approved', issuedDate: 'Jun 10, 2026', expiryDate: 'Jun 10, 2027', issuedBy: 'SGS Egypt', fileSize: '2.1 MB', required: true },
  { id: 'd7', type: 'fumigation', nameAr: 'شهادة التبخير', nameEn: 'Fumigation Certificate', shipmentId: 's1', destination: 'Germany', destinationFlag: '🇩🇪', status: 'approved', issuedDate: 'Jun 17, 2026', expiryDate: 'Jul 17, 2026', issuedBy: 'SafeShip Egypt', fileSize: '0.5 MB', required: true },
  // S2 - UAE Oranges (one pending)
  { id: 'd8', type: 'phytosanitary', nameAr: 'شهادة صحة النبات', nameEn: 'Phytosanitary Certificate', shipmentId: 's2', destination: 'UAE', destinationFlag: '🇦🇪', status: 'approved', issuedDate: 'Jun 12, 2026', expiryDate: 'Aug 12, 2026', issuedBy: 'MALR Egypt', fileSize: '1.2 MB', required: true },
  { id: 'd9', type: 'certificate-of-origin', nameAr: 'شهادة المنشأ', nameEn: 'Certificate of Origin', shipmentId: 's2', destination: 'UAE', destinationFlag: '🇦🇪', status: 'approved', issuedDate: 'Jun 12, 2026', expiryDate: 'Dec 12, 2026', issuedBy: 'Cairo Chamber of Commerce', fileSize: '0.8 MB', required: true },
  { id: 'd10', type: 'invoice', nameAr: 'الفاتورة التجارية', nameEn: 'Commercial Invoice', shipmentId: 's2', destination: 'UAE', destinationFlag: '🇦🇪', status: 'approved', issuedDate: 'Jun 13, 2026', expiryDate: '—', issuedBy: 'AgriIntel Exports LLC', fileSize: '0.4 MB', required: true },
  { id: 'd11', type: 'packing-list', nameAr: 'قائمة التعبئة', nameEn: 'Packing List', shipmentId: 's2', destination: 'UAE', destinationFlag: '🇦🇪', status: 'approved', issuedDate: 'Jun 13, 2026', expiryDate: '—', issuedBy: 'AgriIntel Exports LLC', fileSize: '0.3 MB', required: true },
  { id: 'd12', type: 'bill-of-lading', nameAr: 'بوليصة الشحن', nameEn: 'Bill of Lading', shipmentId: 's2', destination: 'UAE', destinationFlag: '🇦🇪', status: 'approved', issuedDate: 'Jun 15, 2026', expiryDate: '—', issuedBy: 'Emirates Shipping', fileSize: '0.6 MB', required: true },
  { id: 'd13', type: 'quality-cert', nameAr: 'شهادة الجودة', nameEn: 'Quality Certificate', shipmentId: 's2', destination: 'UAE', destinationFlag: '🇦🇪', status: 'pending', issuedDate: '—', expiryDate: '—', issuedBy: 'معلق', fileSize: '—', required: true, notes: 'بانتظار مراجعة الجمارك الإماراتية', notesEn: 'Awaiting UAE customs review' },
  { id: 'd14', type: 'fumigation', nameAr: 'شهادة التبخير', nameEn: 'Fumigation Certificate', shipmentId: 's2', destination: 'UAE', destinationFlag: '🇦🇪', status: 'approved', issuedDate: 'Jun 14, 2026', expiryDate: 'Jul 14, 2026', issuedBy: 'SafeShip Egypt', fileSize: '0.5 MB', required: true },
  // S3 - Saudi Mango (partial)
  { id: 'd15', type: 'phytosanitary', nameAr: 'شهادة صحة النبات', nameEn: 'Phytosanitary Certificate', shipmentId: 's3', destination: 'Saudi Arabia', destinationFlag: '🇸🇦', status: 'approved', issuedDate: 'Jun 20, 2026', expiryDate: 'Aug 20, 2026', issuedBy: 'MALR Egypt', fileSize: '1.2 MB', required: true },
  { id: 'd16', type: 'certificate-of-origin', nameAr: 'شهادة المنشأ', nameEn: 'Certificate of Origin', shipmentId: 's3', destination: 'Saudi Arabia', destinationFlag: '🇸🇦', status: 'approved', issuedDate: 'Jun 20, 2026', expiryDate: 'Dec 20, 2026', issuedBy: 'Cairo Chamber of Commerce', fileSize: '0.8 MB', required: true },
  { id: 'd17', type: 'invoice', nameAr: 'الفاتورة التجارية', nameEn: 'Commercial Invoice', shipmentId: 's3', destination: 'Saudi Arabia', destinationFlag: '🇸🇦', status: 'draft', issuedDate: '—', expiryDate: '—', issuedBy: 'AgriIntel Exports LLC', fileSize: '—', required: true },
  { id: 'd18', type: 'packing-list', nameAr: 'قائمة التعبئة', nameEn: 'Packing List', shipmentId: 's3', destination: 'Saudi Arabia', destinationFlag: '🇸🇦', status: 'draft', issuedDate: '—', expiryDate: '—', issuedBy: '—', fileSize: '—', required: true },
  { id: 'd19', type: 'bill-of-lading', nameAr: 'بوليصة الشحن', nameEn: 'Bill of Lading', shipmentId: 's3', destination: 'Saudi Arabia', destinationFlag: '🇸🇦', status: 'draft', issuedDate: '—', expiryDate: '—', issuedBy: '—', fileSize: '—', required: true },
  { id: 'd20', type: 'quality-cert', nameAr: 'شهادة الجودة', nameEn: 'Quality Certificate', shipmentId: 's3', destination: 'Saudi Arabia', destinationFlag: '🇸🇦', status: 'pending', issuedDate: '—', expiryDate: '—', issuedBy: 'SGS Egypt', fileSize: '—', required: true },
  { id: 'd21', type: 'fumigation', nameAr: 'شهادة التبخير', nameEn: 'Fumigation Certificate', shipmentId: 's3', destination: 'Saudi Arabia', destinationFlag: '🇸🇦', status: 'draft', issuedDate: '—', expiryDate: '—', issuedBy: '—', fileSize: '—', required: true },
  // S4 - UK Strawberry (blocked)
  { id: 'd22', type: 'phytosanitary', nameAr: 'شهادة صحة النبات', nameEn: 'Phytosanitary Certificate', shipmentId: 's4', destination: 'UK', destinationFlag: '🇬🇧', status: 'rejected', issuedDate: 'Jun 5, 2026', expiryDate: '—', issuedBy: 'MALR Egypt', fileSize: '1.2 MB', required: true, notes: 'مرفوض: اكتشاف بقايا مبيدات تتجاوز الحد الأوروبي', notesEn: 'Rejected: Pesticide residue above EU limit' },
  { id: 'd23', type: 'quality-cert', nameAr: 'شهادة الجودة', nameEn: 'Quality Certificate', shipmentId: 's4', destination: 'UK', destinationFlag: '🇬🇧', status: 'rejected', issuedDate: '—', expiryDate: '—', issuedBy: '—', fileSize: '—', required: true, notes: 'معلق بسبب رفض شهادة النبات', notesEn: 'Blocked: Pending phytosanitary resolution' },
  { id: 'd24', type: 'invoice', nameAr: 'الفاتورة التجارية', nameEn: 'Commercial Invoice', shipmentId: 's4', destination: 'UK', destinationFlag: '🇬🇧', status: 'approved', issuedDate: 'Jun 5, 2026', expiryDate: '—', issuedBy: 'AgriIntel Exports LLC', fileSize: '0.4 MB', required: true },
  { id: 'd25', type: 'packing-list', nameAr: 'قائمة التعبئة', nameEn: 'Packing List', shipmentId: 's4', destination: 'UK', destinationFlag: '🇬🇧', status: 'approved', issuedDate: 'Jun 5, 2026', expiryDate: '—', issuedBy: 'AgriIntel Exports LLC', fileSize: '0.3 MB', required: true },
  { id: 'd26', type: 'bill-of-lading', nameAr: 'بوليصة الشحن', nameEn: 'Bill of Lading', shipmentId: 's4', destination: 'UK', destinationFlag: '🇬🇧', status: 'draft', issuedDate: '—', expiryDate: '—', issuedBy: '—', fileSize: '—', required: true },
  { id: 'd27', type: 'certificate-of-origin', nameAr: 'شهادة المنشأ', nameEn: 'Certificate of Origin', shipmentId: 's4', destination: 'UK', destinationFlag: '🇬🇧', status: 'draft', issuedDate: '—', expiryDate: '—', issuedBy: '—', fileSize: '—', required: true },
  { id: 'd28', type: 'fumigation', nameAr: 'شهادة التبخير', nameEn: 'Fumigation Certificate', shipmentId: 's4', destination: 'UK', destinationFlag: '🇬🇧', status: 'draft', issuedDate: '—', expiryDate: '—', issuedBy: '—', fileSize: '—', required: false },
];

const MARKETS: Market[] = [
  { country: 'EU / Germany', countryAr: 'الاتحاد الأوروبي', flag: '🇪🇺', requirement: 'GlobalGAP + Phytosanitary + EUR1 Form', requirementEn: 'GlobalGAP + Phytosanitary + EUR1 Form', status: 'compliant', deadline: 'سارية', deadlineEn: 'Active' },
  { country: 'UAE', countryAr: 'الإمارات', flag: '🇦🇪', requirement: 'شهادة منشأ عربية + صحة نبات + فاتورة جمركية', requirementEn: 'Arab COO + Phytosanitary + Customs Invoice', status: 'action-needed', deadline: 'يونيو 28', deadlineEn: 'Jun 28' },
  { country: 'Saudi Arabia', countryAr: 'السعودية', flag: '🇸🇦', requirement: 'SFDA Approval + صحة نبات + شهادة حلال', requirementEn: 'SFDA Approval + Phytosanitary + Halal Cert', status: 'pending', deadline: 'يوليو 8', deadlineEn: 'Jul 8' },
  { country: 'UK', countryAr: 'المملكة المتحدة', flag: '🇬🇧', requirement: 'PHSI Health Certificate + MRL Compliance', requirementEn: 'PHSI Health Certificate + MRL Compliance', status: 'action-needed', deadline: 'معلق', deadlineEn: 'On Hold' },
];

// ── Helpers ────────────────────────────────────────────────────
const statusCfg: Record<DocStatus, { color: string; bg: string; border: string; labelAr: string; labelEn: string }> = {
  approved: { color: 'var(--emerald)', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', labelAr: 'معتمدة', labelEn: 'Approved' },
  pending:  { color: 'var(--amber)',   bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  labelAr: 'قيد المراجعة', labelEn: 'Pending' },
  rejected: { color: 'var(--rose)',    bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.3)',   labelAr: 'مرفوضة', labelEn: 'Rejected' },
  draft:    { color: 'var(--text-secondary)', bg: 'rgba(127,185,160,0.1)', border: 'rgba(127,185,160,0.2)', labelAr: 'مسودة', labelEn: 'Draft' },
  expired:  { color: 'var(--rose)',    bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.2)',   labelAr: 'منتهية', labelEn: 'Expired' },
};

const shipStatusCfg: Record<ShipmentStatus, { color: string; bg: string; labelAr: string; labelEn: string; icon: string }> = {
  'in-transit': { color: 'var(--cyan)',    bg: 'rgba(34,211,238,0.12)',  labelAr: 'في الطريق',     labelEn: 'In Transit',   icon: 'M12 19V5M5 12l7-7 7 7' },
  'delivered':  { color: 'var(--emerald)', bg: 'rgba(52,211,153,0.12)',  labelAr: 'تم التسليم',    labelEn: 'Delivered',    icon: 'M5 13l4 4L19 7' },
  'preparing':  { color: 'var(--amber)',   bg: 'rgba(251,191,36,0.12)',  labelAr: 'جاري التحضير',  labelEn: 'Preparing',    icon: 'M12 6v6l4 2' },
  'customs':    { color: 'var(--purple, #a78bfa)', bg: 'rgba(167,139,250,0.12)', labelAr: 'في الجمارك', labelEn: 'In Customs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2' },
  'delayed':    { color: 'var(--rose)',    bg: 'rgba(244,63,94,0.12)',   labelAr: 'متأخرة',        labelEn: 'Delayed',      icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94' },
};

const docTypeIcon: Record<DocType, string> = {
  'phytosanitary':       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'certificate-of-origin':'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064',
  'invoice':             'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
  'packing-list':        'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01',
  'bill-of-lading':      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  'quality-cert':        'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  'fumigation':          'M13 10V3L4 14h7v7l9-11h-7z',
};

const marketStatusCfg: Record<Market['status'], { color: string; bg: string; labelAr: string; labelEn: string }> = {
  'compliant':      { color: 'var(--emerald)', bg: 'rgba(52,211,153,0.1)',  labelAr: 'مستوفٍ',       labelEn: 'Compliant' },
  'action-needed':  { color: 'var(--rose)',    bg: 'rgba(244,63,94,0.1)',   labelAr: 'يحتاج تدخل',   labelEn: 'Action Needed' },
  'pending':        { color: 'var(--amber)',   bg: 'rgba(251,191,36,0.1)',  labelAr: 'قيد المراجعة', labelEn: 'Pending' },
};

// ── SVG Icon helper ─────────────────────────────────────────────
const Icon: React.FC<{ d: string; size?: number; color?: string; sw?: number }> = ({ d, size = 16, color = 'currentColor', sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ── Progress ring ───────────────────────────────────────────────
const ProgressRing: React.FC<{ pct: number; size?: number; color?: string }> = ({ pct, size = 40, color = 'var(--emerald)' }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  );
};

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
const ExportDocsPage: React.FC = () => {
  const { language } = useApp();
  const ar = language === 'ar';

  const [activeTab, setActiveTab] = useState<'shipments' | 'documents' | 'compliance' | 'tracker'>('shipments');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(SHIPMENTS[0]);
  const [filterDocStatus, setFilterDocStatus] = useState<'all' | DocStatus>('all');
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const shipmentDocs = useCallback((shipId: string) =>
    DOCUMENTS.filter(d => d.shipmentId === shipId), []);

  const visibleDocs = filterDocStatus === 'all'
    ? DOCUMENTS
    : DOCUMENTS.filter(d => d.status === filterDocStatus);

  // Aggregate stats
  const totalShipments = SHIPMENTS.length;
  const totalValue = '$2.28M';
  const allDocs = DOCUMENTS.length;
  const approvedDocs = DOCUMENTS.filter(d => d.status === 'approved').length;
  const pendingDocs  = DOCUMENTS.filter(d => d.status === 'pending').length;
  const rejectedDocs = DOCUMENTS.filter(d => d.status === 'rejected').length;
  const draftDocs    = DOCUMENTS.filter(d => d.status === 'draft').length;

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700,
    cursor: 'pointer', border: 'none', transition: 'all .15s',
    background: activeTab === t ? 'rgba(52,211,153,0.15)' : 'transparent',
    color: activeTab === t ? 'var(--emerald)' : 'var(--text-secondary)',
  });

  return (
    <div className="animate-fadeInUp space-y-6 pb-8">

      {/* ── PAGE HEADER ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--cyan)', textTransform: 'uppercase' }}>
              {ar ? 'وثائق التصدير' : 'Export Documentation'}
            </span>
            <span className="ai-badge">
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block', marginInlineEnd: 4, animation: 'pulse-ring 2s infinite' }} />
              {ar ? 'AI نشط' : 'AI Verified'}
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {ar ? 'إدارة مستندات التصدير' : 'Export Document Management'}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            {ar
              ? `${totalShipments} شحنات نشطة · ${allDocs} مستند · ${approvedDocs} معتمد · إجمالي القيمة ${totalValue}`
              : `${totalShipments} active shipments · ${allDocs} documents · ${approvedDocs} approved · Total value ${totalValue}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {rejectedDocs > 0 && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', borderRadius: 10, padding: '7px 13px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rose)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)' }}>
                {rejectedDocs} {ar ? 'مستندات مرفوضة' : 'rejected docs'}
              </span>
            </div>
          )}
          <button style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', color: 'var(--cyan)', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={14} color="var(--cyan)" />
            {ar ? 'تصدير الكل' : 'Export All'}
          </button>
          <button style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon d="M12 5v14M5 12l7-7 7 7" size={14} color="#fff" />
            {ar ? 'رفع مستند' : 'Upload Doc'}
          </button>
        </div>
      </div>

      {/* ── SUMMARY STRIP ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {[
          { label: ar ? 'شحنات نشطة'    : 'Active Shipments', val: `${totalShipments}`, color: 'var(--cyan)',    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
          { label: ar ? 'مستندات معتمدة' : 'Approved Docs',   val: `${approvedDocs}`,  color: 'var(--emerald)', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: ar ? 'قيد المراجعة'   : 'Pending Review',  val: `${pendingDocs}`,   color: 'var(--amber)',   icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: ar ? 'مرفوضة'         : 'Rejected',        val: `${rejectedDocs}`,  color: 'var(--rose)',    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: ar ? 'مسودات'         : 'Drafts',          val: `${draftDocs}`,     color: 'var(--text-secondary)', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        ].map((item, i) => (
          <div key={i} className="card animate-fadeInUp" style={{ padding: '13px 16px', position: 'relative', overflow: 'hidden', animationDelay: `${i * 0.07}s` }}>
            <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 2, background: `linear-gradient(90deg, ${item.color}55, ${item.color})` }} />
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
              <Icon d={item.icon} size={13} color={item.color} />
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* ── TAB BAR ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'shipments',  labelAr: '🚢 الشحنات',       labelEn: '🚢 Shipments' },
          { key: 'documents',  labelAr: '📄 المستندات',     labelEn: '📄 Documents' },
          { key: 'compliance', labelAr: '✅ الامتثال',      labelEn: '✅ Compliance' },
          { key: 'tracker',    labelAr: '📡 تتبع الشحنة',   labelEn: '📡 Shipment Tracker' },
        ].map(tab => (
          <button key={tab.key} style={tabStyle(tab.key)} onClick={() => setActiveTab(tab.key as typeof activeTab)}>
            {ar ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          TAB: SHIPMENTS
      ══════════════════════════════════════════════════ */}
      {activeTab === 'shipments' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedShipment ? '1fr 400px' : '1fr', gap: 16, alignItems: 'start' }}>

          {/* Shipment cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SHIPMENTS.map((ship, i) => {
              const sc = shipStatusCfg[ship.status];
              const isSelected = selectedShipment?.id === ship.id;
              const docs = shipmentDocs(ship.id);
              const approved = docs.filter(d => d.status === 'approved').length;
              return (
                <div key={ship.id} onClick={() => setSelectedShipment(isSelected ? null : ship)}
                  className="card card-hover animate-fadeInUp"
                  style={{ padding: 18, cursor: 'pointer', animationDelay: `${i * 0.07}s`, border: isSelected ? '1px solid rgba(52,211,153,0.4)' : '1px solid var(--border)', boxShadow: isSelected ? '0 0 0 1px rgba(52,211,153,0.15)' : undefined }}>

                  <div className="flex items-start gap-4">
                    {/* Emoji + progress */}
                    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                      <ProgressRing pct={ship.completionPct}
                        color={ship.completionPct === 100 ? 'var(--emerald)' : ship.completionPct >= 70 ? 'var(--cyan)' : ship.completionPct >= 40 ? 'var(--amber)' : 'var(--rose)'}
                        size={48} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {ship.emoji}
                      </div>
                    </div>

                    {/* Main info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {ship.destinationFlag} {ar ? ship.destinationAr : ship.destination}
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 999, fontWeight: 800, background: sc.bg, color: sc.color }}>
                          {ar ? sc.labelAr : sc.labelEn}
                        </span>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {ship.refCode}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {ar ? ship.cropAr : ship.cropEn} · {ship.quantity} · {ship.containers} {ar ? 'حاويات' : 'containers'} · Grade <strong style={{ color: ship.qualityGrade === 'A+' ? 'var(--emerald)' : ship.qualityGrade === 'B+' ? 'var(--amber)' : 'var(--rose)' }}>{ship.qualityGrade}</strong>
                      </p>
                    </div>

                    {/* Value + docs */}
                    <div style={{ textAlign: 'end', flexShrink: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--cyan)', fontFamily: 'monospace' }}>{ship.value}</p>
                      <p style={{ fontSize: 11, color: approved === docs.length ? 'var(--emerald)' : 'var(--amber)', fontWeight: 700, marginTop: 2 }}>
                        {approved}/{docs.length} {ar ? 'مستند' : 'docs'}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 12 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {ar ? 'اكتمال المستندات' : 'Document Completion'}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{ship.completionPct}%</span>
                    </div>
                    <div className="health-bar">
                      <div className="health-bar-fill" style={{
                        width: `${ship.completionPct}%`,
                        background: ship.completionPct === 100
                          ? 'linear-gradient(90deg,#10b981,#34d399)'
                          : ship.completionPct >= 70
                          ? 'linear-gradient(90deg,#0891b2,#22d3ee)'
                          : ship.completionPct >= 40
                          ? 'linear-gradient(90deg,#d97706,#fbbf24)'
                          : 'linear-gradient(90deg,#be123c,#f43f5e)',
                      }} />
                    </div>
                  </div>

                  {/* Dates row */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                    {[
                      { label: ar ? 'المغادرة' : 'Departure', val: ar ? ship.departure : ship.departureEn },
                      { label: ar ? 'الوصول المتوقع' : 'ETA',       val: ar ? ship.eta : ship.etaEn },
                    ].map((d, di) => (
                      <div key={di} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Icon d={di === 0 ? 'M12 19V5M5 12l7-7 7 7' : 'M5 12h14M12 5l7 7-7 7'} size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{d.label}:</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{d.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selectedShipment && (
            <div className="card animate-fadeInUp" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 90 }}>
              {/* Header */}
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(34,211,238,0.04)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ fontSize: 22 }}>{selectedShipment.emoji} {selectedShipment.destinationFlag}</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                      {ar ? selectedShipment.destinationAr : selectedShipment.destination}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {ar ? selectedShipment.cropAr : selectedShipment.cropEn} · {selectedShipment.refCode}
                    </p>
                  </div>
                  <button onClick={() => setSelectedShipment(null)}
                    style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '5px 8px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <Icon d="M6 18L18 6M6 6l12 12" size={14} />
                  </button>
                </div>
              </div>

              {/* Doc checklist */}
              <div style={{ padding: '14px 20px' }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                  {ar ? 'قائمة المستندات المطلوبة' : 'Required Document Checklist'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {shipmentDocs(selectedShipment.id).map(doc => {
                    const sc = statusCfg[doc.status];
                    const isExpanded = expandedDoc === doc.id;
                    return (
                      <div key={doc.id}>
                        <div
                          onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${isExpanded ? sc.border : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, cursor: 'pointer', transition: 'all .15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                        >
                          {/* Status icon */}
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon d={docTypeIcon[doc.type]} size={13} color={sc.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {ar ? doc.nameAr : doc.nameEn}
                            </p>
                            {doc.issuedDate !== '—' && (
                              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                                {doc.issuedBy}
                              </p>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: sc.bg, color: sc.color, fontWeight: 800, border: `1px solid ${sc.border}` }}>
                              {ar ? sc.labelAr : sc.labelEn}
                            </span>
                            <Icon d={isExpanded ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} size={12} color="var(--text-muted)" />
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div style={{ margin: '4px 0 4px 12px', padding: '10px 12px', background: 'rgba(255,255,255,0.015)', border: `1px solid ${sc.border}`, borderRadius: '0 0 10px 10px', borderTop: 'none' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: doc.notes ? 8 : 0 }}>
                              {[
                                { label: ar ? 'تاريخ الإصدار' : 'Issued',   val: doc.issuedDate },
                                { label: ar ? 'تاريخ الانتهاء' : 'Expires', val: doc.expiryDate },
                                { label: ar ? 'الجهة المصدرة' : 'Issued By', val: doc.issuedBy },
                                { label: ar ? 'حجم الملف' : 'File Size',     val: doc.fileSize },
                              ].map((r, ri) => (
                                <div key={ri}>
                                  <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{r.label}</p>
                                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1, fontWeight: 600 }}>{r.val}</p>
                                </div>
                              ))}
                            </div>
                            {(doc.notes || doc.notesEn) && (
                              <div style={{ padding: '8px 10px', background: `${sc.bg}`, border: `1px solid ${sc.border}`, borderRadius: 8 }}>
                                <p style={{ fontSize: 11, color: sc.color, fontWeight: 600 }}>⚠ {ar ? doc.notes : doc.notesEn}</p>
                              </div>
                            )}
                            {doc.status === 'approved' && (
                              <button style={{ marginTop: 8, width: '100%', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--emerald)', padding: '7px', borderRadius: 8, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={12} color="var(--emerald)" />
                                {ar ? 'تحميل الملف' : 'Download'}
                              </button>
                            )}
                            {(doc.status === 'draft' || doc.status === 'rejected') && (
                              <button style={{ marginTop: 8, width: '100%', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: 'var(--cyan)', padding: '7px', borderRadius: 8, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" size={12} color="var(--cyan)" />
                                {ar ? 'رفع المستند' : 'Upload Now'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI note */}
              <div style={{ margin: '0 16px 16px', padding: '12px 14px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 12 }}>
                <div className="flex items-center gap-2 mb-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3z" /></svg>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--emerald)', letterSpacing: '0.04em' }}>AI COMPLIANCE CHECK</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {selectedShipment.completionPct === 100
                    ? (ar ? 'جميع المستندات مكتملة ومعتمدة. الشحنة مؤهلة للإفراج الجمركي المسرّع.' : 'All documents complete & approved. Shipment eligible for expedited clearance.')
                    : ar
                    ? `${selectedShipment.docsTotal - selectedShipment.docsReady} مستند متبقي للاكتمال. راجع المستندات المرفوضة أو المسودات أعلاه.`
                    : `${selectedShipment.docsTotal - selectedShipment.docsReady} documents remaining. Review rejected/draft docs above.`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: DOCUMENTS
      ══════════════════════════════════════════════════ */}
      {activeTab === 'documents' && (
        <div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {(['all', 'approved', 'pending', 'rejected', 'draft'] as const).map(s => {
              const labels: Record<string, string> = { all: ar ? 'الكل' : 'All', approved: ar ? 'معتمدة' : 'Approved', pending: ar ? 'قيد المراجعة' : 'Pending', rejected: ar ? 'مرفوضة' : 'Rejected', draft: ar ? 'مسودات' : 'Drafts' };
              const active = filterDocStatus === s;
              const color = s === 'all' ? 'var(--emerald)' : s === 'approved' ? 'var(--emerald)' : s === 'pending' ? 'var(--amber)' : s === 'rejected' ? 'var(--rose)' : 'var(--text-secondary)';
              return (
                <button key={s} onClick={() => setFilterDocStatus(s)}
                  style={{ padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .15s', border: active ? `1px solid ${color}55` : '1px solid var(--border)', background: active ? `${color}15` : 'transparent', color: active ? color : 'var(--text-secondary)' }}>
                  {labels[s]}
                  {s !== 'all' && (
                    <span style={{ marginInlineStart: 6, opacity: 0.7 }}>
                      ({DOCUMENTS.filter(d => d.status === s).length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Documents table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr auto', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
              {[ar ? 'المستند' : 'Document', ar ? 'الشحنة / الوجهة' : 'Shipment / Dest', ar ? 'الجهة المصدرة' : 'Issued By', ar ? 'تاريخ الإصدار' : 'Issue Date', ar ? 'الحالة' : 'Status', ''].map((h, hi) => (
                <span key={hi} style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div style={{ maxHeight: 480, overflowY: 'auto' }}>
              {visibleDocs.map((doc, i) => {
                const sc = statusCfg[doc.status];
                const ship = SHIPMENTS.find(s => s.id === doc.shipmentId);
                return (
                  <div key={doc.id}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr auto', gap: 12, padding: '13px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s', alignItems: 'center' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    className={i < 4 ? `animate-fadeInUp-delay-${Math.min(i + 1, 4) as 1 | 2 | 3 | 4}` : ''}>

                    {/* Doc name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon d={docTypeIcon[doc.type]} size={14} color={sc.color} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{ar ? doc.nameAr : doc.nameEn}</p>
                        {doc.required && <span style={{ fontSize: 9, color: 'var(--rose)', fontWeight: 700 }}>{ar ? 'إلزامي' : 'Required'}</span>}
                      </div>
                    </div>

                    {/* Shipment */}
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>{doc.destinationFlag} {doc.destination}</p>
                      {ship && <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ship.refCode}</p>}
                    </div>

                    {/* Issued by */}
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{doc.issuedBy}</p>

                    {/* Date */}
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{doc.issuedDate}</p>

                    {/* Status */}
                    <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 999, fontWeight: 800, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, display: 'inline-block', width: 'fit-content' }}>
                      {ar ? sc.labelAr : sc.labelEn}
                    </span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 5 }}>
                      {doc.status === 'approved' && (
                        <button style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: 'var(--emerald)', padding: '5px 7px', borderRadius: 7, cursor: 'pointer' }} title={ar ? 'تحميل' : 'Download'}>
                          <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" size={12} color="var(--emerald)" />
                        </button>
                      )}
                      {(doc.status === 'draft' || doc.status === 'rejected') && (
                        <button style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: 'var(--cyan)', padding: '5px 7px', borderRadius: 7, cursor: 'pointer' }} title={ar ? 'رفع' : 'Upload'}>
                          <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" size={12} color="var(--cyan)" />
                        </button>
                      )}
                      <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', padding: '5px 7px', borderRadius: 7, cursor: 'pointer' }} title={ar ? 'عرض' : 'View'}>
                        <Icon d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" size={12} color="var(--text-secondary)" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: COMPLIANCE
      ══════════════════════════════════════════════════ */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

          {/* Market requirements */}
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              {ar ? 'متطلبات الأسواق الدولية' : 'International Market Requirements'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MARKETS.map((mkt, i) => {
                const ms = marketStatusCfg[mkt.status];
                return (
                  <div key={i} className="card card-hover animate-fadeInUp" style={{ padding: 18, animationDelay: `${i * 0.08}s` }}>
                    <div className="flex items-start gap-4">
                      <div style={{ fontSize: 32, flexShrink: 0 }}>{mkt.flag}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center gap-2 mb-1">
                          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                            {ar ? mkt.countryAr : mkt.country}
                          </p>
                          <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 999, fontWeight: 800, background: ms.bg, color: ms.color }}>
                            {ar ? ms.labelAr : ms.labelEn}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {ar ? mkt.requirement : mkt.requirementEn}
                        </p>
                      </div>
                      <div style={{ textAlign: 'end', flexShrink: 0 }}>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>{ar ? 'الموعد النهائي' : 'Deadline'}</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: ms.color, marginTop: 2 }}>
                          {ar ? mkt.deadline : mkt.deadlineEn}
                        </p>
                      </div>
                    </div>

                    {/* Required docs chips */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                      {(ar ? mkt.requirement : mkt.requirementEn).split('+').map((r, ri) => (
                        <span key={ri} style={{ fontSize: 10, padding: '2px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {r.trim()}
                        </span>
                      ))}
                    </div>

                    {mkt.status === 'action-needed' && (
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" size={13} color="var(--rose)" />
                        <span style={{ fontSize: 11, color: 'var(--rose)', fontWeight: 700 }}>
                          {ar ? 'يتطلب إجراء فوري لاستيفاء الشروط' : 'Immediate action required to meet compliance'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Compliance Advisor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 16, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, background: 'rgba(52,211,153,0.15)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3z" /></svg>
                </div>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--emerald)', letterSpacing: '0.04em' }}>AI COMPLIANCE ADVISOR</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { level: 'danger', text: ar ? 'شحنة فراولة UK: مبيدات تتجاوز MRL. أوقف الشحن وأعد الاختبار.' : 'UK Strawberry: Pesticides exceed MRL limit. Halt shipment & retest.', conf: '97%' },
                  { level: 'warn',   text: ar ? 'UAE: شهادة جودة معلقة ستؤخر الإفراج الجمركي يونيو 28.' : 'UAE: Pending quality cert will delay Jun 28 customs clearance.', conf: '91%' },
                  { level: 'ok',     text: ar ? 'شحنة عنب ألمانيا: جميع متطلبات GlobalGAP مستوفاة بنجاح.' : 'Germany grapes: All GlobalGAP requirements met successfully.', conf: '99%' },
                ].map((item, i) => {
                  const color = item.level === 'danger' ? 'var(--rose)' : item.level === 'warn' ? 'var(--amber)' : 'var(--emerald)';
                  const bg    = item.level === 'danger' ? 'rgba(244,63,94,0.08)' : item.level === 'warn' ? 'rgba(251,191,36,0.08)' : 'rgba(52,211,153,0.08)';
                  return (
                    <div key={i} style={{ padding: '10px 12px', background: bg, borderRadius: 10, borderInlineStart: `3px solid ${color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {item.level === 'danger' ? (ar ? 'خطر' : 'CRITICAL') : item.level === 'warn' ? (ar ? 'تحذير' : 'WARNING') : (ar ? 'ممتاز' : 'OK')}
                        </span>
                        <span style={{ fontSize: 9, color, fontFamily: 'monospace', fontWeight: 700 }}>conf {item.conf}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expiry alerts */}
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                {ar ? 'تنبيهات انتهاء الصلاحية' : 'Expiry Alerts'}
              </p>
              {[
                { nameAr: 'شهادة التبخير - UAE',          nameEn: 'Fumigation Cert - UAE',         expiry: 'Jul 14', daysLeft: 22, color: 'var(--amber)' },
                { nameAr: 'شهادة التبخير - Germany',       nameEn: 'Fumigation Cert - Germany',     expiry: 'Jul 17', daysLeft: 25, color: 'var(--amber)' },
                { nameAr: 'شهادة صحة النبات - Saudi',     nameEn: 'Phytosanitary - Saudi Arabia',  expiry: 'Aug 20', daysLeft: 59, color: 'var(--emerald)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{ar ? item.nameAr : item.nameEn}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.expiry}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: item.color, fontFamily: 'monospace', flexShrink: 0 }}>
                    {item.daysLeft}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: TRACKER
      ══════════════════════════════════════════════════ */}
      {activeTab === 'tracker' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>

          {/* Shipment timeline cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SHIPMENTS.map((ship, i) => {
              const sc = shipStatusCfg[ship.status];
              const steps = [
                { labelAr: 'تحضير المستندات', labelEn: 'Docs Prepared',    done: ship.completionPct >= 40 },
                { labelAr: 'فحص الجودة',      labelEn: 'Quality Checked',  done: ship.completionPct >= 60 },
                { labelAr: 'المغادرة',         labelEn: 'Departed',         done: ship.status !== 'preparing' && ship.status !== 'delayed' },
                { labelAr: 'الجمارك',          labelEn: 'Customs',          done: ship.status === 'in-transit' || ship.status === 'delivered' },
                { labelAr: 'التسليم',          labelEn: 'Delivered',        done: ship.status === 'delivered' },
              ];
              const activeStep = steps.filter(s => s.done).length;

              return (
                <div key={ship.id} className="card animate-fadeInUp" style={{ padding: 20, animationDelay: `${i * 0.08}s` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 20 }}>{ship.emoji} {ship.destinationFlag}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                            {ar ? ship.destinationAr : ship.destination}
                          </p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ship.refCode}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 999, fontWeight: 800, background: sc.bg, color: sc.color }}>
                        {ar ? sc.labelAr : sc.labelEn}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--cyan)', fontFamily: 'monospace' }}>{ship.value}</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {steps.map((step, si) => {
                      const isCurrent = si === activeStep - 1 && ship.status !== 'delivered';
                      const color = step.done ? 'var(--emerald)' : 'var(--border-strong, rgba(52,211,153,0.25))';
                      return (
                        <React.Fragment key={si}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: step.done ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              {step.done
                                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                : <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                              }
                              {isCurrent && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid var(--emerald)', opacity: 0.4, animation: 'pulse-ring 2s infinite' }} />}
                            </div>
                            <span style={{ fontSize: 9, color: step.done ? 'var(--emerald)' : 'var(--text-muted)', fontWeight: 700, textAlign: 'center', maxWidth: 60, lineHeight: 1.3 }}>
                              {ar ? step.labelAr : step.labelEn}
                            </span>
                          </div>
                          {si < steps.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: step.done ? 'var(--emerald)' : 'rgba(255,255,255,0.06)', marginBottom: 22, transition: 'background 0.5s' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* ETA */}
                  <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon d="M12 19V5M5 12l7-7 7 7" size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ar ? 'المغادرة' : 'Departed'}:</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{ar ? ship.departure : ship.departureEn}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon d="M5 12h14M12 5l7 7-7 7" size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>ETA:</span>
                      <span style={{ fontSize: 11, color: sc.color, fontWeight: 700 }}>{ar ? ship.eta : ship.etaEn}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" size={11} color="var(--text-muted)" />
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ar ? 'حاويات' : 'Containers'}:</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{ship.containers}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                {ar ? 'ملخص الشحنات' : 'Shipment Summary'}
              </p>
              {([
                { label: ar ? 'في الطريق' : 'In Transit',    count: SHIPMENTS.filter(s => s.status === 'in-transit').length, color: 'var(--cyan)' },
                { label: ar ? 'في الجمارك' : 'In Customs',   count: SHIPMENTS.filter(s => s.status === 'customs').length,    color: '#a78bfa' },
                { label: ar ? 'جاري التحضير' : 'Preparing',  count: SHIPMENTS.filter(s => s.status === 'preparing').length,  color: 'var(--amber)' },
                { label: ar ? 'متأخرة' : 'Delayed',          count: SHIPMENTS.filter(s => s.status === 'delayed').length,    color: 'var(--rose)' },
              ] as { label: string; count: number; color: string }[]).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: item.color, fontFamily: 'monospace' }}>{item.count}</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 14, padding: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--cyan)', letterSpacing: '0.06em', marginBottom: 8 }}>AI SHIPMENT INSIGHT</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {ar
                  ? 'شحنة العنب لألمانيا ستصل في الموعد. الإمارات معرضة لتأخير 2-3 أيام بسبب الجمارك. يُنصح بالتواصل الفوري مع وكيل الشحن.'
                  : 'Germany grapes on schedule. UAE at risk of 2-3 day delay due to customs. Recommend immediate contact with freight agent.'}
              </p>
            </div>

            {/* Quick actions */}
            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                {ar ? 'إجراءات سريعة' : 'Quick Actions'}
              </p>
              {[
                { label: ar ? 'طباعة بوليصة الشحن' : 'Print Bill of Lading',    icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z', color: 'var(--text-secondary)' },
                { label: ar ? 'تتبع الشحنة على الخريطة' : 'Track on Live Map',  icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', color: 'var(--cyan)' },
                { label: ar ? 'إرسال تنبيه للعميل' : 'Send Client Alert',        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'var(--amber)' },
              ].map((action, i) => (
                <button key={i}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9, color: action.color, fontSize: 12, fontWeight: 600, textAlign: 'start', transition: 'all .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}>
                  <Icon d={action.icon} size={14} color={action.color} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDocsPage;
