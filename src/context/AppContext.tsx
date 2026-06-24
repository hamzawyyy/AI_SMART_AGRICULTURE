import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '../types/index';
import { useAuthStore } from '../store/authStore';

interface AppContextType {
  user: User | null;
  language: 'ar' | 'en';
  isSidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleSidebar: () => void;
  toggleLanguage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // بيانات اليوزر بتيجي من authStore (Zustand) بتاعك بدل ما تتكرر
  const authUser = useAuthStore((state) => state.user);

  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // كل ما authStore يتغير، نزامن الـ user هنا تلقائيًا
  useEffect(() => {
    if (authUser) {
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: (authUser.role as User['role']) || 'farmer',
      });
    } else {
      setUser(null);
    }
  }, [authUser]);

  // Apply direction on mount and language change
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: 'ar' | 'en') => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => prev === 'ar' ? 'en' : 'ar');
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      language,
      isSidebarOpen,
      setUser,
      setLanguage,
      toggleSidebar,
      toggleLanguage,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};