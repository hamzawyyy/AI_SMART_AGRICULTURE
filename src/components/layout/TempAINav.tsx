import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/disease', label: '🌿 Disease' },
  { path: '/quality', label: '⭐ Quality' },
  { path: '/export', label: '🚢 Export' },
  { path: '/environment', label: '🌡️ Environment' },
];

const TempAINav = () => {
  const location = useLocation();

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex gap-2 flex-wrap items-center">
      <span className="text-xs text-yellow-700 font-bold">🔧 Temp Nav (للتست فقط):</span>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`text-xs px-3 py-1 rounded-full border transition-all ${
            location.pathname === link.path
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
          }`}
        >
          {link.label}
        </Link>
      ))}
      <Link
        to="/"
        className="text-xs px-3 py-1 rounded-full border bg-white text-gray-400 border-gray-300 hover:border-gray-400 ms-auto"
      >
        🏠 Home
      </Link>
    </div>
  );
};

export default TempAINav;