// src/pages/profile/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  profileApi,
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../../api/profileApi';

// ── Small reusable pieces ────────────────────────────────

const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div
    className="rounded-2xl p-6 mb-6"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
  >
    <div className="mb-5">
      <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
      )}
    </div>
    {children}
  </div>
);

const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  error?: string;
}> = ({ label, children, error }) => (
  <div className="mb-4">
    <label
      className="block text-xs font-semibold mb-1.5"
      style={{ color: 'var(--text-secondary)' }}
    >
      {label}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-xs" style={{ color: 'var(--rose)' }}>
        {error}
      </p>
    )}
  </div>
);

const inputClass =
  'w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all';
const inputStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
};
const inputFocusStyle = {
  borderColor: 'var(--border-strong)',
  boxShadow: '0 0 0 3px var(--emerald-glow)',
};

function Input({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={inputClass}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}), opacity: disabled ? 0.5 : 1 }}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder = '',
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`${inputClass} resize-none`}
      style={{ ...inputStyle, ...(focused ? inputFocusStyle : {}) }}
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
      style={{ background: checked ? 'var(--emerald-dim)' : 'rgba(255,255,255,0.1)' }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: checked ? 'translateX(calc(100% + 4px))' : 'translateX(4px)' }}
      />
    </button>
  );
}

function SaveButton({
  loading,
  label,
  onClick,
  variant = 'primary',
}: {
  loading?: boolean;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'danger';
}) {
  const bg =
    variant === 'danger'
      ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
      : 'linear-gradient(135deg, #10b981, #059669)';
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
      style={{ background: bg }}
    >
      {loading ? (
        <>
          <span
            className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
            style={{ display: 'inline-block' }}
          />
          {label}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className="fixed bottom-6 end-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-2xl animate-fade-in"
      style={{
        background: type === 'success' ? 'var(--emerald-dim)' : 'var(--rose)',
        minWidth: 260,
      }}
    >
      <span className="text-lg">{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}

// ── Role badge ───────────────────────────────────────────

const roleLabels: Record<string, { ar: string; en: string; color: string }> = {
  farmer:   { ar: 'مزارع',  en: 'Farmer',   color: 'var(--emerald)' },
  trader:   { ar: 'تاجر',   en: 'Trader',    color: 'var(--amber)'   },
  exporter: { ar: 'مُصدّر', en: 'Exporter',  color: 'var(--cyan)'    },
  admin:    { ar: 'أدمن',   en: 'Admin',     color: 'var(--rose)'    },
};

// ── Main Page ────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const { language, setLanguage } = useApp();
  const ar = language === 'ar';

  // ── State ──────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'preferences'>('personal');

  // ── Fetch on mount ────────────────────────────────────
  useEffect(() => {
    profileApi.getProfile().then(res => {
      if (res.success) {
        const p = res.data;
        setProfile(p);
        setName(p.name);
        setEmail(p.email);
        setPhone(p.phone ?? '');
        setLocation(p.location ?? '');
        setBio(p.bio ?? '');
      }
      setLoadingProfile(false);
    });
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers ──────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const payload: UpdateProfilePayload = { name, email, phone, location, bio };
    const res = await profileApi.updateProfile(payload);
    setSavingProfile(false);
    if (res.success) {
      showToast(ar ? 'تم حفظ التعديلات بنجاح' : 'Profile updated successfully', 'success');
    } else {
      showToast(ar ? 'حدث خطأ، حاول مجددًا' : 'Something went wrong', 'error');
    }
  };

  const handleChangePassword = async () => {
    setPwdError('');
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError(ar ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    if (newPwd.length < 8) {
      setPwdError(ar ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError(ar ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setSavingPwd(true);
    const res = await profileApi.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
    setSavingPwd(false);
    if (res.success) {
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      showToast(ar ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully', 'success');
    } else {
      setPwdError(res.message ?? (ar ? 'كلمة المرور الحالية غير صحيحة' : 'Incorrect current password'));
    }
  };

  const handleLanguageChange = async (lang: 'ar' | 'en') => {
    setLanguage(lang);
    await profileApi.updateLanguage(lang);
    showToast(lang === 'ar' ? 'تم التغيير إلى العربية' : 'Switched to English', 'success');
  };

  // ── Loading state ─────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--emerald)' }}
        />
      </div>
    );
  }

  // ── Tabs config ───────────────────────────────────────
  const tabs: { key: typeof activeTab; label: string; icon: string }[] = [
    { key: 'personal',     label: ar ? 'البيانات الشخصية' : 'Personal Info',  icon: '👤' },
    { key: 'security',     label: ar ? 'الأمان وكلمة المرور' : 'Security',     icon: '🔒' },
    { key: 'preferences',  label: ar ? 'التفضيلات'          : 'Preferences',   icon: '⚙️' },
  ];

  const roleInfo = roleLabels[profile?.role ?? 'exporter'];

  return (
    <div className="max-w-3xl mx-auto py-6">

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        >
          {name.charAt(0) || 'أ'}
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `${roleInfo.color}18`,
                color: roleInfo.color,
                border: `1px solid ${roleInfo.color}30`,
              }}
            >
              {ar ? roleInfo.ar : roleInfo.en}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {email}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              border: activeTab === tab.key ? '1px solid var(--border-strong)' : '1px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────── */}
      {/* TAB: Personal Info                             */}
      {/* ─────────────────────────────────────────────── */}
      {activeTab === 'personal' && (
        <SectionCard
          title={ar ? 'البيانات الشخصية' : 'Personal Information'}
          subtitle={ar ? 'تعديل اسمك ومعلومات التواصل' : 'Update your name and contact info'}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Field label={ar ? 'الاسم الكامل' : 'Full Name'}>
              <Input value={name} onChange={setName} placeholder={ar ? 'أحمد محمد' : 'Ahmed Mohamed'} />
            </Field>
            <Field label={ar ? 'البريد الإلكتروني' : 'Email'}>
              <Input value={email} onChange={setEmail} type="email" placeholder="ahmed@agriintel.com" />
            </Field>
            <Field label={ar ? 'رقم الهاتف' : 'Phone'}>
              <Input value={phone} onChange={setPhone} placeholder="+20 100 000 0000" />
            </Field>
            <Field label={ar ? 'الموقع الجغرافي' : 'Location'}>
              <Input value={location} onChange={setLocation} placeholder={ar ? 'القاهرة، مصر' : 'Cairo, Egypt'} />
            </Field>
          </div>
          <Field label={ar ? 'نبذة شخصية' : 'Bio'}>
            <Textarea
              value={bio}
              onChange={setBio}
              placeholder={ar ? 'أكتب نبذة مختصرة عن نفسك...' : 'Write a short bio...'}
            />
          </Field>

          {/* Read-only role */}
          <Field label={ar ? 'نوع الحساب' : 'Account Type'}>
            <Input
              value={ar ? roleInfo.ar : roleInfo.en}
              onChange={() => {}}
              disabled
            />
          </Field>

          <div className="flex justify-end mt-2">
            <SaveButton
              loading={savingProfile}
              label={ar ? 'حفظ التعديلات' : 'Save Changes'}
              onClick={handleSaveProfile}
            />
          </div>
        </SectionCard>
      )}

      {/* ─────────────────────────────────────────────── */}
      {/* TAB: Security                                  */}
      {/* ─────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <SectionCard
          title={ar ? 'تغيير كلمة المرور' : 'Change Password'}
          subtitle={ar ? 'يُنصح باستخدام كلمة مرور قوية لا تستخدمها في أي مكان آخر' : 'Use a strong password you don&apos;t use elsewhere'}
        >
          <Field label={ar ? 'كلمة المرور الحالية' : 'Current Password'}>
            <Input value={currentPwd} onChange={setCurrentPwd} type="password" placeholder="••••••••" />
          </Field>
          <Field label={ar ? 'كلمة المرور الجديدة' : 'New Password'}>
            <Input value={newPwd} onChange={setNewPwd} type="password" placeholder="••••••••" />
          </Field>
          <Field label={ar ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} error={pwdError}>
            <Input value={confirmPwd} onChange={setConfirmPwd} type="password" placeholder="••••••••" />
          </Field>

          {/* Password strength hint */}
          {newPwd && (
            <div className="mb-4">
              <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3].map(i => {
                  const strength =
                    (newPwd.length >= 8 ? 1 : 0) +
                    (/[A-Z]/.test(newPwd) ? 1 : 0) +
                    (/[0-9]/.test(newPwd) ? 1 : 0) +
                    (/[^A-Za-z0-9]/.test(newPwd) ? 1 : 0);
                  const colors = ['var(--rose)', 'var(--amber)', 'var(--emerald)', 'var(--emerald)'];
                  return (
                    <div
                      key={i}
                      className="flex-1 h-1.5 rounded-full transition-all"
                      style={{ background: i < strength ? colors[strength - 1] : 'var(--border)' }}
                    />
                  );
                })}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {ar
                  ? 'قوة أكبر: أضف أرقامًا، أحرفًا كبيرة، ورموزًا'
                  : 'Stronger: add numbers, capitals & symbols'}
              </p>
            </div>
          )}

          <div className="flex justify-end mt-2">
            <SaveButton
              loading={savingPwd}
              label={ar ? 'تغيير كلمة المرور' : 'Change Password'}
              onClick={handleChangePassword}
              variant="danger"
            />
          </div>
        </SectionCard>
      )}

      {/* ─────────────────────────────────────────────── */}
      {/* TAB: Preferences                               */}
      {/* ─────────────────────────────────────────────── */}
      {activeTab === 'preferences' && (
        <SectionCard
          title={ar ? 'التفضيلات' : 'Preferences'}
          subtitle={ar ? 'ضبط لغة الواجهة والإعدادات الشخصية' : 'Adjust interface language and personal settings'}
        >
          {/* Language */}
          <div
            className="flex items-center justify-between p-4 rounded-xl mb-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {ar ? 'لغة الواجهة' : 'Interface Language'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {ar ? 'يؤثر على اتجاه الصفحة والنصوص' : 'Affects page direction and labels'}
              </p>
            </div>
            <div className="flex gap-2">
              {(['ar', 'en'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: language === lang ? 'var(--emerald-dim)' : 'var(--bg-card)',
                    color: language === lang ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${language === lang ? 'var(--emerald-dim)' : 'var(--border)'}`,
                  }}
                >
                  {lang === 'ar' ? 'عربي' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Account info (read-only) */}
          <div
            className="p-4 rounded-xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              {ar ? 'معلومات الحساب' : 'Account Details'}
            </p>
            <div className="space-y-2">
              {[
                { label: ar ? 'تاريخ الإنشاء' : 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(ar ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' }) : '—' },
                { label: ar ? 'معرّف الحساب' : 'Account ID', value: `#${profile?.id ?? '—'}` },
                { label: ar ? 'آخر تسجيل دخول' : 'Last Login', value: ar ? 'اليوم، 09:43 ص' : 'Today, 09:43 AM' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Toast ─────────────────────────────────────── */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ProfilePage;
