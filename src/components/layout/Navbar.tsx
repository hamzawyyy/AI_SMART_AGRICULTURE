import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { notificationsApi } from '../../services/api';
import type { Notification } from '../../types';

export const Navbar: React.FC = () => {
  const { user, language, toggleLanguage, toggleSidebar } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(3);

  const handleNotificationClick = async () => {
    if (!showNotifications && notifications.length === 0) {
      const response = await notificationsApi.getNotifications();
      if (response.success) setNotifications(response.data);
    }
    setShowNotifications(prev => !prev);
  };

  const markAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const ar = language === 'ar';

  return (
    <nav
      className="sticky top-0 z-40"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', height: '56px' }}
    >
      <div className="h-full px-4 sm:px-6 flex items-center gap-3">

        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #16a34a, #0891b2)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {ar ? 'أجري' : 'Agri'}<span style={{ color: 'var(--emerald)' }}>{ar ? 'إنتل' : 'Intel'}</span>
            </p>
            <p style={{ fontSize: '9px', color: 'var(--emerald)', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>
              {ar ? 'منصة الذكاء الزراعي' : 'AI Agriculture Platform'}
            </p>
          </div>
        </div>

        {/* Live status pill — center */}
        <div className="hidden lg:flex live-pill mx-auto">
          <span className="live-dot" />
          <span className="live-pill-text">
            {ar ? 'النظام يعمل · 99.8% Uptime' : 'System Live · 99.8% Uptime'}
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ms-auto">

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            {ar ? 'EN' : 'عربي'}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-lg transition-colors hover:bg-white/5 relative"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 end-1 w-4 h-4 text-white rounded-full flex items-center justify-center font-bold"
                  style={{ background: 'var(--rose)', fontSize: '9px' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute top-full end-0 mt-2 w-80 rounded-xl overflow-hidden z-50"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}
              >
                <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {ar ? 'التنبيهات الذكية' : 'AI Alerts'}
                    </p>
                    <span className="ai-badge">
                      <span className="live-dot" style={{ width: '5px', height: '5px' }} />
                      Live
                    </span>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                      {ar ? 'لا توجد إشعارات' : 'No alerts'}
                    </p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className="p-3 cursor-pointer transition-colors border-b hover:bg-white/5"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: n.read ? 'var(--text-muted)' : 'var(--emerald)' }}
                          />
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                  className="w-full p-3 text-xs font-bold transition-colors hover:bg-white/5"
                  style={{ color: 'var(--emerald)', borderTop: '1px solid var(--border)' }}
                >
                  {ar ? 'عرض كل الإشعارات ←' : 'View All Notifications →'}
                </button>
              </div>
            )}
          </div>

          {/* User */}
          <div
            className="flex items-center gap-2 ps-3"
            style={{ borderInlineStart: '1px solid var(--border)' }}
          >
            <div className="hidden sm:block text-end">
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {user?.name || (ar ? 'أحمد محمد' : 'Ahmed Mohamed')}
              </p>
              <p className="text-xs" style={{ color: 'var(--emerald)' }}>
                {user?.role === 'admin'
                  ? (ar ? 'مدير النظام' : 'System Admin')
                  : (ar ? 'مزارع متقدم' : 'Senior Farmer')}
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
              style={{ background: 'linear-gradient(135deg, #16a34a, #0891b2)' }}
            >
              {user?.name?.charAt(0) || 'أ'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};