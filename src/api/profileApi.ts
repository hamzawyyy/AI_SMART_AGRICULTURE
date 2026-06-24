// src/api/profileApi.ts
// -------------------------------------------------------
// Mock responses simulate the real backend contract.
// When the backend is ready, replace the mock bodies with
// real fetch calls (the function signatures stay the same).
// -------------------------------------------------------

import { ApiResponse, User } from '../types';

// ── Extended types specific to this module ──────────────

export interface UserProfile extends User {
  phone?: string;
  location?: string;
  bio?: string;
  language: 'ar' | 'en';
  createdAt: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type NotifType =
  | 'disease'
  | 'export'
  | 'environment'
  | 'report'
  | 'system'
  | 'marketplace'
  | 'compliance'
  | 'user_management';

export type UserRole = 'farmer' | 'trader' | 'exporter' | 'admin';

export interface NotificationItem {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  allowedRoles: UserRole[];
}

export interface NotificationSettings {
  disease?: boolean;
  export?: boolean;
  environment?: boolean;
  reports?: boolean;
  marketplace?: boolean;
  compliance?: boolean;
  system?: boolean;
  user_management?: boolean;
  emailAlerts: boolean;
}

// ── Role → allowed notification types ──────────────────

export const ROLE_NOTIF_TYPES: Record<UserRole, NotifType[]> = {
  farmer:   ['disease', 'environment', 'report'],
  trader:   ['marketplace', 'environment', 'report'],
  exporter: ['export', 'compliance', 'environment', 'report'],
  admin:    ['disease', 'export', 'environment', 'report', 'system', 'marketplace', 'compliance', 'user_management'],
};

// ── Default settings per role ───────────────────────────

export const DEFAULT_SETTINGS: Record<UserRole, NotificationSettings> = {
  farmer: {
    disease: true,
    environment: true,
    reports: true,
    emailAlerts: true,
  },
  trader: {
    marketplace: true,
    environment: true,
    reports: false,
    emailAlerts: true,
  },
  exporter: {
    export: true,
    compliance: true,
    environment: true,
    reports: true,
    emailAlerts: true,
  },
  admin: {
    disease: true,
    export: true,
    environment: true,
    reports: true,
    system: true,
    marketplace: true,
    compliance: true,
    user_management: true,
    emailAlerts: true,
  },
};

// ── Helpers ─────────────────────────────────────────────

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ── All notifications pool ──────────────────────────────

const ALL_NOTIFICATIONS: NotificationItem[] = [
  // DISEASE — farmer, admin
  {
    id: 'n001', type: 'disease',
    title: 'تحذير: كشف مرض في المحاصيل',
    message: 'AI اكتشف علامات اللفحة المبكرة في القطعة C-4. يُنصح بالمعاينة الفورية.',
    read: false,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    actionUrl: '/disease',
    allowedRoles: ['farmer', 'admin'],
  },
  {
    id: 'n002', type: 'disease',
    title: 'إنذار: فطر بياض زغبي',
    message: 'تم رصد إصابة بفطر البياض الزغبي في حقل الفلفل الشمالي — تصل نسبة الإصابة 42%.',
    read: false,
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
    actionUrl: '/disease',
    allowedRoles: ['farmer', 'admin'],
  },
  {
    id: 'n003', type: 'disease',
    title: 'محصول العنب بصحة جيدة',
    message: 'فحص روتيني لـ 450 صورة — لا توجد أمراض مكتشفة بنسبة ثقة 97%.',
    read: true,
    timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    actionUrl: '/reports',
    allowedRoles: ['farmer', 'admin'],
  },

  // EXPORT — exporter, admin
  {
    id: 'n010', type: 'export',
    title: 'توصية تصدير جديدة',
    message: 'محصول البرتقال مؤهل للتصدير للسوق الأوروبية بدرجة جودة A.',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    actionUrl: '/export',
    allowedRoles: ['exporter', 'admin'],
  },
  {
    id: 'n011', type: 'export',
    title: 'شحنة معتمدة',
    message: 'الدفعة EU-2024-847 تحقق جميع معايير الاتحاد الأوروبي وجاهزة للشحن.',
    read: true,
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    allowedRoles: ['exporter', 'admin'],
  },
  {
    id: 'n012', type: 'export',
    title: 'رفض شحنة — إجراء مطلوب',
    message: 'تم رفض شحنة المانجو من المستورد السعودي بسبب تجاوز حدود المبيدات. يُرجى إعادة الفرز.',
    read: false,
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    actionUrl: '/export',
    allowedRoles: ['exporter', 'admin'],
  },

  // ENVIRONMENT — farmer, trader, exporter, admin
  {
    id: 'n020', type: 'environment',
    title: 'تنبيه بيئي: رطوبة منخفضة',
    message: 'نسبة رطوبة التربة في الحقل 3 وصلت لمستوى حرج (18%). يُنصح بالري فوراً.',
    read: false,
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    actionUrl: '/environment',
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },
  {
    id: 'n021', type: 'environment',
    title: 'تحذير موجة حرارة',
    message: 'يُتوقع وصول الحرارة لـ 44°C خلال 3 أيام — خطر على المحاصيل الحساسة في دلتا النيل.',
    read: false,
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },

  // REPORT — farmer, trader, exporter, admin
  {
    id: 'n030', type: 'report',
    title: 'التقرير الأسبوعي جاهز',
    message: 'تقرير الأداء الأسبوعي للفترة 16–22 يونيو متاح الآن.',
    read: true,
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    actionUrl: '/reports',
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },
  {
    id: 'n031', type: 'report',
    title: 'تقرير جودة شهري',
    message: 'تم إنشاء تقرير الجودة لشهر يونيو — معدل النجاح 67% عبر 24 دفعة.',
    read: false,
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    actionUrl: '/reports',
    allowedRoles: ['farmer', 'trader', 'exporter', 'admin'],
  },

  // MARKETPLACE — trader, admin
  {
    id: 'n040', type: 'marketplace',
    title: 'ارتفاع أسعار البرتقال',
    message: 'أسعار البرتقال ارتفعت 12% — فرصة شراء قبل موسم التصدير الأوروبي.',
    read: false,
    timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
    actionUrl: '/marketplace',
    allowedRoles: ['trader', 'admin'],
  },
  {
    id: 'n041', type: 'marketplace',
    title: 'تحذير: فائض في الطماطم',
    message: 'يُتوقع انخفاض أسعار الطماطم 15% خلال أسبوعين بسبب الفائض في المعروض.',
    read: true,
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    allowedRoles: ['trader', 'admin'],
  },
  {
    id: 'n042', type: 'marketplace',
    title: 'طلب شراء جديد',
    message: 'مستورد سعودي يطلب 30 طن فراولة درجة A — سعر 22 ج.م/كجم.',
    read: false,
    timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    actionUrl: '/marketplace',
    allowedRoles: ['trader', 'admin'],
  },

  // COMPLIANCE — exporter, admin
  {
    id: 'n050', type: 'compliance',
    title: 'شهادة GlobalG.A.P. مجددة',
    message: 'تم تجديد شهادة الامتثال لمزرعة الدلتا — صالحة حتى ديسمبر 2025.',
    read: true,
    timestamp: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    allowedRoles: ['exporter', 'admin'],
  },
  {
    id: 'n051', type: 'compliance',
    title: 'فحص MRL اكتمل',
    message: 'جميع بقايا المبيدات في دفعة الفراولة ضمن حدود EU MRL. الشحنة جاهزة.',
    read: false,
    timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    actionUrl: '/export',
    allowedRoles: ['exporter', 'admin'],
  },

  // SYSTEM — admin only
  {
    id: 'n060', type: 'system',
    title: 'تحديث النظام',
    message: 'تم تحديث موديل كشف الأمراض إلى الإصدار 2.1 — دقة 94.3%.',
    read: true,
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    allowedRoles: ['admin'],
  },
  {
    id: 'n061', type: 'system',
    title: 'أداء المنصة: ممتاز',
    message: 'uptime 99.8% هذا الشهر — 1,240 طلب ذكاء اصطناعي معالج.',
    read: true,
    timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    allowedRoles: ['admin'],
  },

  // USER_MANAGEMENT — admin only
  {
    id: 'n070', type: 'user_management',
    title: 'مستخدم جديد مسجّل',
    message: 'مصدّر جديد انضم للمنصة: محمد العطار — يحتاج موافقة على البيانات.',
    read: false,
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    allowedRoles: ['admin'],
  },
  {
    id: 'n071', type: 'user_management',
    title: 'نمو المستخدمين 8%',
    message: '14 مستخدم جديد هذا الأسبوع — 6 مزارعين، 5 تجار، 3 مصدّرين.',
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    allowedRoles: ['admin'],
  },
];

// ── Profile API ─────────────────────────────────────────

export const profileApi = {
  /**
   * GET /api/users/me
   */
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    await delay(350);
    return {
      success: true,
      data: {
        id: '1',
        name: 'أحمد محمد',
        email: 'ahmed@agriintel.com',
        role: 'farmer',
        phone: '+20 100 123 4567',
        location: 'القاهرة، مصر',
        bio: 'مزارع متخصص في زراعة الفاكهة والخضروات منذ أكثر من 10 سنوات.',
        language: 'ar',
        createdAt: '2024-01-15T10:00:00Z',
      },
    };
    // REAL:
    // const res = await fetch(`${BASE_URL}/api/users/me`, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    // });
    // return res.json();
  },

  /**
   * PATCH /api/users/me
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> => {
    await delay(500);
    return {
      success: true,
      data: {
        id: '1',
        ...payload,
        role: 'admin',
        language: 'ar',
        createdAt: '2024-01-15T10:00:00Z',
      },
      message: 'تم تحديث الملف الشخصي بنجاح',
    };
    // REAL: const res = await fetch(`${BASE_URL}/api/users/me`, { method: 'PATCH', ... });
  },

  /**
   * POST /api/users/me/change-password
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
    await delay(600);
    if (payload.currentPassword === 'wrong') {
      return { success: false, data: null, message: 'كلمة المرور الحالية غير صحيحة' };
    }
    return { success: true, data: null, message: 'تم تغيير كلمة المرور بنجاح' };
  },

  /**
   * PATCH /api/users/me/language
   */
  updateLanguage: async (language: 'ar' | 'en'): Promise<ApiResponse<null>> => {
    await delay(200);
    return { success: true, data: null };
  },
};

// ── Notifications API ────────────────────────────────────

export const notificationsApi = {
  /**
   * GET /api/notifications?role=:role
   * Returns only notifications the user's role is authorized to see.
   */
  getAll: async (role: UserRole): Promise<ApiResponse<NotificationItem[]>> => {
    // TODO: real call
    // const res = await fetch(`${BASE_URL}/api/notifications?role=${role}`, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    // });
    // return res.json();

    await delay(300);
    const filtered = ALL_NOTIFICATIONS.filter(n => n.allowedRoles.includes(role));
    return { success: true, data: filtered };
  },

  /**
   * PATCH /api/notifications/:id/read
   */
  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    await delay(150);
    return { success: true, data: null };
    // REAL: const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, { method: 'PATCH', ... });
  },

  /**
   * PATCH /api/notifications/read-all
   */
  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    await delay(300);
    return { success: true, data: null };
  },

  /**
   * DELETE /api/notifications/:id
   */
  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay(200);
    return { success: true, data: null };
  },

  /**
   * GET /api/notifications/settings?role=:role
   * Returns role-specific default settings.
   */
  getSettings: async (role: UserRole): Promise<ApiResponse<NotificationSettings>> => {
    // TODO: real call (user's saved preferences)
    // const res = await fetch(`${BASE_URL}/api/notifications/settings`, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    // });
    // return res.json();

    await delay(250);
    return { success: true, data: { ...DEFAULT_SETTINGS[role] } };
  },

  /**
   * PATCH /api/notifications/settings
   */
  updateSettings: async (settings: NotificationSettings): Promise<ApiResponse<null>> => {
    await delay(300);
    return { success: true, data: null };
    // REAL: const res = await fetch(`${BASE_URL}/api/notifications/settings`, { method: 'PATCH', body: JSON.stringify(settings), ... });
  },
};
