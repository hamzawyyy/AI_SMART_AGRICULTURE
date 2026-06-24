import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerApi } from '../../api/authApi';
import PublicLayout from '../../components/layout/PublicLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'farmer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm_password) {
      setError('من فضلك ادخل البيانات كاملة');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('كلمة المرور مش متطابقة');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await registerApi({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ، حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {t('auth.register_title')}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              انضم لنظام الزراعة الذكية
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Input
              label={t('auth.full_name')}
              name="name"
              placeholder="الاسم الكامل"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              label={t('auth.email')}
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label={t('auth.password')}
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              label={t('auth.confirm_password')}
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />

            {/* Role Select */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                {t('auth.role')} <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="farmer">{t('auth.farmer')}</option>
                <option value="trader">{t('auth.trader')}</option>
                <option value="exporter">{t('auth.exporter')}</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Register Button */}
            <Button
              label={t('auth.register_btn')}
              onClick={handleRegister}
              loading={loading}
              fullWidth
            />

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500">
              {t('auth.have_account')}{' '}
              <Link to="/login" className="text-green-600 hover:underline">
                {t('nav.login')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default RegisterPage;