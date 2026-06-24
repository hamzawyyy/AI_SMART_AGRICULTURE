import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPasswordApi } from '../../api/authApi';
import PublicLayout from '../../components/layout/PublicLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('من فضلك ادخل البريد الإلكتروني');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await forgotPasswordApi(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ، حاول تاني');
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
              {t('auth.forgot_password')}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              هندخل بريدك الإلكتروني ونبعتلك رابط إعادة التعيين
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="flex flex-col items-center gap-4">
              <div className="text-5xl">📧</div>
              <p className="text-green-600 font-medium text-center">
                تم إرسال رابط إعادة التعيين على بريدك الإلكتروني
              </p>
              <Link to="/login">
                <Button label={t('nav.login')} />
              </Link>
            </div>
          ) : (
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

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button
                label="إرسال رابط إعادة التعيين"
                onClick={handleSubmit}
                loading={loading}
                fullWidth
              />

              <p className="text-center text-sm text-gray-500">
                {t('auth.have_account')}{' '}
                <Link to="/login" className="text-green-600 hover:underline">
                  {t('nav.login')}
                </Link>
              </p>
            </div>
          )}
        </Card>
      </div>
    </PublicLayout>
  );
};

export default ForgotPasswordPage;