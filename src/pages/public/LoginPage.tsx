import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { loginApi } from '../../api/authApi';
import PublicLayout from '../../components/layout/PublicLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('من فضلك ادخل البيانات كاملة');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await loginApi(email, password);
      setAuth(data.token, data.role, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطأ في البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {t('auth.login_title')}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              مرحباً بك في نظام الزراعة الذكية
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t('auth.password')}
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Forgot Password */}
            <div className="text-end">
              <Link
                to="/forgot-password"
                className="text-green-600 text-sm hover:underline"
              >
                {t('auth.forgot_password')}
              </Link>
            </div>

            {/* Login Button */}
            <Button
              label={t('auth.login_btn')}
              onClick={handleLogin}
              loading={loading}
              fullWidth
            />

            {/* Register Link */}
            <p className="text-center text-sm text-gray-500">
              {t('auth.no_account')}{' '}
              <Link to="/register" className="text-green-600 hover:underline">
                {t('nav.register')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;