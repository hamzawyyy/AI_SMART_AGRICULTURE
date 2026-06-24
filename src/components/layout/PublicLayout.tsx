import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-green-600 font-bold text-xl">
          🌱 Smart Agriculture
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link to="/about" className="text-gray-600 hover:text-green-600 text-sm">
            {t('nav.about')}
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-green-600 text-sm">
            {t('nav.login')}
          </Link>
          <Link
            to="/register"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            {t('nav.register')}
          </Link>

          {/* زرار تبديل اللغة */}
          <button
            onClick={toggleLanguage}
            className="border border-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-gray-100"
          >
            {i18n.language === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </nav>

      {/* المحتوى */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-gray-400 text-sm">
        © 2026 Smart Agriculture System
      </footer>
    </div>
  );
};

export default PublicLayout;