// src/api/reportsApi.ts — Role-aware Reports & History API
// Replace mock bodies with real fetch calls when backend is ready.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ── Types ─────────────────────────────────────────────────────

export type ReportType =
  | 'disease'
  | 'quality'
  | 'export'
  | 'environment'
  | 'marketplace'
  | 'compliance'
  | 'system';

export type ReportStatus = 'success' | 'warning' | 'error' | 'pending';

export type UserRole = 'farmer' | 'trader' | 'exporter' | 'admin';

export interface ReportItem {
  id: string;
  type: ReportType;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  status: ReportStatus;
  result: string;
  resultEn: string;
  confidence?: number;
  timestamp: string;
  imageUrl?: string;
  details?: Record<string, string | number>;
  allowedRoles: UserRole[];
}

export interface ReportSummary {
  total: number;
  disease?: number;
  quality?: number;
  export?: number;
  environment?: number;
  marketplace?: number;
  compliance?: number;
  system?: number;
  thisWeek: number;
  successRate: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Role → allowed report types ───────────────────────────────

export const ROLE_REPORT_TYPES: Record<UserRole, ReportType[]> = {
  farmer:   ['disease', 'quality', 'environment'],
  trader:   ['quality', 'marketplace', 'environment'],
  exporter: ['export', 'quality', 'environment', 'compliance'],
  admin:    ['disease', 'quality', 'export', 'environment', 'marketplace', 'compliance', 'system'],
};

// ── Mock data ─────────────────────────────────────────────────

const ALL_REPORTS: ReportItem[] = [
  // ── DISEASE (farmer, admin) ──────────────────────────────
  {
    id: 'r001', type: 'disease',
    title: 'كشف مرض اللفحة المبكرة', titleEn: 'Early Blight Detected',
    subtitle: 'محصول الطماطم — القطعة C-4', subtitleEn: 'Tomato Crop — Plot C-4',
    status: 'warning', confidence: 0.93,
    result: 'لفحة مبكرة (Alternaria solani) — تحتاج معالجة فورية',
    resultEn: 'Early Blight (Alternaria solani) — Immediate treatment needed',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    details: { confidence: '93%', severity: 'متوسطة', affectedArea: '15%' },
    allowedRoles: ['farmer', 'admin'],
  },
  {
    id: 'r002', type: 'disease',
    title: 'فحص صحة محصول العنب', titleEn: 'Grape Crop Health Check',
    subtitle: 'محصول العنب — المزرعة الجنوبية', subtitleEn: 'Grape Crop — South Farm',
    status: 'success', confidence: 0.97,
    result: 'المحصول بصحة جيدة — لا توجد أمراض مكتشفة',
    resultEn: 'Crop is healthy — No diseases detected',
    timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    details: { confidence: '97%', checked: '450 images', status: 'سليم' },
    allowedRoles: ['farmer', 'admin'],
  },
  {
    id: 'r003', type: 'disease',
    title: 'إصابة بفطر البياض الزغبي', titleEn: 'Downy Mildew Infection',
    subtitle: 'محصول الفلفل — حقل الشمال', subtitleEn: 'Pepper Crop — North Field',
    status: 'error', confidence: 0.91,
    result: 'فطر بياض زغبي حاد — يتطلب عزل فوري وعلاج',
    resultEn: 'Severe downy mildew — Requires immediate isolation and treatment',
    timestamp: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    details: { confidence: '91%', affectedArea: '42%', urgency: 'عالية' },
    allowedRoles: ['farmer', 'admin'],
  },

  // ── QUALITY (farmer, trader, exporter, admin) ────────────
  {
    id: 'r010', type: 'quality',
    title: 'تقييم جودة البرتقال', titleEn: 'Orange Quality Assessment',
    subtitle: 'دفعة #OJ-2024-112', subtitleEn: 'Batch #OJ-2024-112',
    status: 'success', confidence: 0.88,
    result: 'الدرجة A — مناسب للتصدير الممتاز',
    resultEn: 'Grade A — Suitable for premium export',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    details: { grade: 'A', weight: '145g avg', color: '92/100', brix: '11.2°' },
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },
  {
    id: 'r011', type: 'quality',
    title: 'تقييم جودة المانجو', titleEn: 'Mango Quality Assessment',
    subtitle: 'دفعة #MG-2024-085', subtitleEn: 'Batch #MG-2024-085',
    status: 'error', confidence: 0.82,
    result: 'الدرجة C — غير مناسب للتصدير، للسوق المحلي فقط',
    resultEn: 'Grade C — Not export-suitable, local market only',
    timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    details: { grade: 'C', issue: 'تلف جزئي', recommendation: 'سوق محلي' },
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },
  {
    id: 'r012', type: 'quality',
    title: 'فحص جودة الفراولة', titleEn: 'Strawberry Quality Check',
    subtitle: 'دفعة #ST-2024-201', subtitleEn: 'Batch #ST-2024-201',
    status: 'success', confidence: 0.95,
    result: 'الدرجة A+ — جاهز للتصدير الفوري',
    resultEn: 'Grade A+ — Ready for immediate export',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
    details: { grade: 'A+', size: '28–32mm', color: '98/100', firmness: 'ممتازة' },
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },

  // ── EXPORT (exporter, admin) ─────────────────────────────
  {
    id: 'r020', type: 'export',
    title: 'توصية تصدير الفراولة', titleEn: 'Strawberry Export Recommendation',
    subtitle: '12 طن — سوق الاتحاد الأوروبي', subtitleEn: '12 tons — EU Market',
    status: 'success',
    result: 'مؤهل للسوق الأوروبية — يلبي معايير GlobalG.A.P.',
    resultEn: 'Qualified for EU Market — Meets GlobalG.A.P. standards',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    details: { targetMarket: 'EU', compliance: 'GlobalG.A.P.', estimatedValue: '85,000 ج.م' },
    allowedRoles: ['exporter', 'admin'],
  },
  {
    id: 'r021', type: 'export',
    title: 'شحنة البرتقال للسعودية', titleEn: 'Orange Shipment to Saudi Arabia',
    subtitle: '20 طن — ميناء الإسكندرية', subtitleEn: '20 tons — Alexandria Port',
    status: 'pending',
    result: 'في انتظار فحص بيطري من الجانب السعودي',
    resultEn: 'Awaiting veterinary inspection from Saudi side',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    details: { destination: 'Riyadh', port: 'الإسكندرية', eta: '3 أيام' },
    allowedRoles: ['exporter', 'admin'],
  },
  {
    id: 'r022', type: 'export',
    title: 'رفض شحنة المانجو', titleEn: 'Mango Shipment Rejected',
    subtitle: '5 طن — مطلوب إعادة فرز', subtitleEn: '5 tons — Re-sorting required',
    status: 'error',
    result: 'رُفضت الشحنة لعدم مطابقة معايير المستوردين',
    resultEn: 'Shipment rejected — importer quality standards not met',
    timestamp: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    details: { reason: 'مستوى بقايا مبيدات عالٍ', action: 'إعادة فرز وإعادة اختبار' },
    allowedRoles: ['exporter', 'admin'],
  },

  // ── ENVIRONMENT (farmer, trader, exporter, admin) ────────
  {
    id: 'r030', type: 'environment',
    title: 'تحليل البيئة الزراعية', titleEn: 'Agricultural Environment Analysis',
    subtitle: 'حقل القمح الشمالي', subtitleEn: 'North Wheat Field',
    status: 'warning',
    result: 'رطوبة تربة منخفضة — يُنصح بالري خلال 24 ساعة',
    resultEn: 'Low soil moisture — Irrigation recommended within 24h',
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    details: { temperature: '38°C', humidity: '28%', soilMoisture: '18%', status: 'مجهد مائيًا' },
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },
  {
    id: 'r031', type: 'environment',
    title: 'تحذير موجة حرارة', titleEn: 'Heatwave Warning',
    subtitle: 'منطقة دلتا النيل', subtitleEn: 'Nile Delta Region',
    status: 'error',
    result: 'درجات حرارة قياسية متوقعة — خطر على المحاصيل الحساسة',
    resultEn: 'Record temperatures expected — Risk to sensitive crops',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    details: { maxTemp: '44°C', duration: '3 أيام', affectedCrops: 'طماطم، فلفل، خيار' },
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },

  // ── MARKETPLACE (trader, admin) ──────────────────────────
  {
    id: 'r040', type: 'marketplace',
    title: 'تقرير أسعار السوق', titleEn: 'Market Price Report',
    subtitle: 'الفاكهة والخضروات — يونيو 2024', subtitleEn: 'Fruit & Vegetables — June 2024',
    status: 'success',
    result: 'أسعار البرتقال ارتفعت 12% — فرصة شراء قبل موسم التصدير',
    resultEn: 'Orange prices up 12% — Buying opportunity before export season',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    details: { orangePrice: '8.5 ج.م/كجم', strawberryPrice: '22 ج.م/كجم', trend: 'صاعد' },
    allowedRoles: ['trader', 'admin'],
  },
  {
    id: 'r041', type: 'marketplace',
    title: 'تحليل العرض والطلب', titleEn: 'Supply & Demand Analysis',
    subtitle: 'السوق المحلية — الربع الثالث', subtitleEn: 'Local Market — Q3',
    status: 'warning',
    result: 'فائض في المعروض من الطماطم — يُتوقع انخفاض الأسعار',
    resultEn: 'Tomato oversupply — Price drop expected in 2 weeks',
    timestamp: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    details: { commodity: 'طماطم', surplus: '15%', priceOutlook: 'هابط' },
    allowedRoles: ['trader', 'admin'],
  },

  // ── COMPLIANCE (exporter, admin) ─────────────────────────
  {
    id: 'r050', type: 'compliance',
    title: 'تدقيق معايير GlobalG.A.P.', titleEn: 'GlobalG.A.P. Compliance Audit',
    subtitle: 'شهادة سنوية — مزرعة الدلتا', subtitleEn: 'Annual Certification — Delta Farm',
    status: 'success',
    result: 'اجتاز التدقيق — الشهادة صالحة حتى ديسمبر 2025',
    resultEn: 'Audit passed — Certificate valid until December 2025',
    timestamp: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    details: { score: '96/100', auditor: 'Bureau Veritas', validity: 'ديسمبر 2025' },
    allowedRoles: ['exporter', 'admin'],
  },
  {
    id: 'r051', type: 'compliance',
    title: 'تحقق من حدود المبيدات الأوروبية', titleEn: 'EU Pesticide MRL Check',
    subtitle: 'دفعة فراولة للتصدير', subtitleEn: 'Strawberry export batch',
    status: 'success', confidence: 0.99,
    result: 'جميع بقايا المبيدات ضمن الحدود المسموح بها EU MRL',
    resultEn: 'All pesticide residues within EU MRL limits',
    timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    details: { pesticidesChecked: 42, violations: 0, lab: 'SGS Egypt' },
    allowedRoles: ['exporter', 'admin'],
  },

  // ── SYSTEM (admin only) ──────────────────────────────────
  {
    id: 'r060', type: 'system',
    title: 'تقرير أداء المنصة', titleEn: 'Platform Performance Report',
    subtitle: 'يونيو 2024 — شهري', subtitleEn: 'June 2024 — Monthly',
    status: 'success',
    result: 'uptime 99.8% — معالجة 1,240 طلب ذكاء اصطناعي هذا الشهر',
    resultEn: '99.8% uptime — 1,240 AI requests processed this month',
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
    details: { uptime: '99.8%', aiRequests: 1240, activeUsers: 187, errors: 3 },
    allowedRoles: ['admin'],
  },
  {
    id: 'r061', type: 'system',
    title: 'إحصائيات المستخدمين', titleEn: 'User Statistics Report',
    subtitle: 'توزيع الأدوار — الأسبوع الجاري', subtitleEn: 'Role distribution — This week',
    status: 'success',
    result: 'نمو 8% في المستخدمين الجدد — ارتفاع في شريحة المصدّرين',
    resultEn: '8% new user growth — Exporters segment rising',
    timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    details: { farmers: 94, traders: 41, exporters: 38, admins: 14 },
    allowedRoles: ['admin'],
  },
];

// ── Helpers ───────────────────────────────────────────────────

function filterByRole(role: UserRole, typeFilter?: ReportType | 'all'): ReportItem[] {
  const allowedTypes = ROLE_REPORT_TYPES[role];
  const byRole = ALL_REPORTS.filter(r => r.allowedRoles.includes(role));
  if (!typeFilter || typeFilter === 'all') return byRole;
  return byRole.filter(r => r.type === typeFilter);
}

function buildSummary(reports: ReportItem[]): ReportSummary {
  const success = reports.filter(r => r.status === 'success').length;
  const weekAgo = Date.now() - 7 * 24 * 3600000;
  return {
    total: reports.length,
    disease:     reports.filter(r => r.type === 'disease').length     || undefined,
    quality:     reports.filter(r => r.type === 'quality').length     || undefined,
    export:      reports.filter(r => r.type === 'export').length      || undefined,
    environment: reports.filter(r => r.type === 'environment').length || undefined,
    marketplace: reports.filter(r => r.type === 'marketplace').length || undefined,
    compliance:  reports.filter(r => r.type === 'compliance').length  || undefined,
    system:      reports.filter(r => r.type === 'system').length      || undefined,
    thisWeek: reports.filter(r => new Date(r.timestamp).getTime() > weekAgo).length,
    successRate: reports.length ? Math.round((success / reports.length) * 100) : 0,
  };
}

// ── API ───────────────────────────────────────────────────────

export const reportsApi = {
  /**
   * GET /api/reports?role=:role&type=:type&page=:page&limit=:limit
   * Returns reports filtered by user role and optional type.
   */
  getReports: async (
    role: UserRole,
    filter: ReportType | 'all' = 'all',
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ reports: ReportItem[]; total: number }>> => {
    // TODO: real call
    // const res = await fetch(
    //   `${BASE_URL}/api/reports?role=${role}&type=${filter}&page=${page}&limit=${limit}`,
    //   { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    // );
    // return res.json();

    await delay(450);
    const filtered = filterByRole(role, filter);
    return { success: true, data: { reports: filtered, total: filtered.length } };
  },

  /**
   * GET /api/reports/summary?role=:role
   */
  getSummary: async (role: UserRole): Promise<ApiResponse<ReportSummary>> => {
    // TODO: real call
    // const res = await fetch(`${BASE_URL}/api/reports/summary?role=${role}`, { headers: authHeaders() });
    // return res.json();

    await delay(200);
    const reports = filterByRole(role);
    return { success: true, data: buildSummary(reports) };
  },

  /**
   * GET /api/reports/:id
   */
  getReportById: async (id: string): Promise<ApiResponse<ReportItem | null>> => {
    await delay(200);
    const report = ALL_REPORTS.find(r => r.id === id) || null;
    return { success: !!report, data: report };
  },

  /**
   * DELETE /api/reports/:id
   */
  deleteReport: async (id: string): Promise<ApiResponse<null>> => {
    await delay(200);
    return { success: true, data: null };
  },

  /**
   * POST /api/reports/export-pdf  { ids: string[] }
   */
  exportToPdf: async (ids: string[]): Promise<ApiResponse<{ url: string }>> => {
    await delay(600);
    return { success: true, data: { url: '/mock-report.pdf' } };
  },
};
