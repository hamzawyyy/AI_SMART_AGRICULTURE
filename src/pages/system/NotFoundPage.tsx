import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-green-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          الصفحة مش موجودة
        </h1>
        <p className="text-gray-500 mb-8">
          الصفحة اللي بتدور عليها مش موجودة أو اتنقلت لمكان تاني
        </p>
        <Link
          to="/"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all"
        >
          ارجع للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;