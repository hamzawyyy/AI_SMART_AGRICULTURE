import { useState } from 'react';
import TempAINav from '../../components/layout/TempAINav';
import { useTranslation } from 'react-i18next';
import { predictIotApi } from '../../api/iotApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Reading {
  time: string;
  temperature: number;
  humidity: number;
  soil_moisture: number;
}

const SmartEnvironmentPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    temperature: '',
    humidity: '',
    soil_moisture: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Reading[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSimulate = () => {
    setForm({
      temperature: (20 + Math.random() * 20).toFixed(1),
      humidity: (40 + Math.random() * 40).toFixed(1),
      soil_moisture: (30 + Math.random() * 40).toFixed(1),
    });
    setResult(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!form.temperature || !form.humidity || !form.soil_moisture) {
      setError('من فضلك ادخل كل البيانات أو استخدم المحاكاة');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await predictIotApi({
        temperature: Number(form.temperature),
        humidity: Number(form.humidity),
        soil_moisture: Number(form.soil_moisture),
      });
      setResult(data);

      // إضافة للـ History
      setHistory((prev) => [
        ...prev.slice(-9),
        {
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          temperature: Number(form.temperature),
          humidity: Number(form.humidity),
          soil_moisture: Number(form.soil_moisture),
        },
      ]);
    } catch (err: any) {
      setError('حدث خطأ أثناء التحليل، حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TempAINav />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            🌡️ {t('ai.environment_title')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t('ai.simulation_note')}
          </p>
          {/* Simulation Badge */}
          <span className="inline-block mt-2 bg-yellow-100 text-yellow-700 border border-yellow-300 text-xs px-3 py-1 rounded-full">
            ⚠️ بيانات محاكاة — ليست حساسات حقيقية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Input Section */}
          <Card>
            <h2 className="font-bold text-gray-700 mb-4">بيانات البيئة</h2>

            <div className="flex flex-col gap-4">
              {/* Temperature */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  🌡️ درجة الحرارة (°C) <span className="text-red-500">*</span>
                </label>
                <input
                  name="temperature"
                  type="number"
                  value={form.temperature}
                  onChange={handleChange}
                  placeholder="مثال: 28.5"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Humidity */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  💧 رطوبة الجو (%) <span className="text-red-500">*</span>
                </label>
                <input
                  name="humidity"
                  type="number"
                  value={form.humidity}
                  onChange={handleChange}
                  placeholder="مثال: 65"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Soil Moisture */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  🌱 رطوبة التربة (%) <span className="text-red-500">*</span>
                </label>
                <input
                  name="soil_moisture"
                  type="number"
                  value={form.soil_moisture}
                  onChange={handleChange}
                  placeholder="مثال: 45"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button
                label={t('ai.simulate_btn')}
                onClick={handleSimulate}
                variant="secondary"
                fullWidth
              />
              <Button
                label={t('ai.analyze_btn')}
                onClick={handleAnalyze}
                loading={loading}
                fullWidth
              />
            </div>
          </Card>

          {/* Result Section */}
          <Card>
            <h2 className="font-bold text-gray-700 mb-4">{t('ai.result')}</h2>

            {loading && <Loader text="جاري تحليل البيانات البيئية..." />}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                <span className="text-5xl">🌿</span>
                <p className="text-sm mt-2">النتيجة هتظهر هنا</p>
              </div>
            )}

            {!loading && result && (
              <div className="flex flex-col gap-4">
                {/* Plant Status */}
                <div className={`border rounded-xl p-4 text-center ${
                  result.status === 'healthy'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className="text-3xl mb-2">
                    {result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '🚨'}
                  </p>
                  <p className="font-bold text-gray-800">{result.plant_condition || 'غير محدد'}</p>
                </div>

                {/* Risk */}
                {result.risks && result.risks.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-orange-700 mb-2">المخاطر البيئية:</p>
                    {result.risks.map((risk: string, i: number) => (
                      <p key={i} className="text-sm text-orange-600">• {risk}</p>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                {result.recommendation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-blue-700 mb-1">التوصية:</p>
                    <p className="text-sm text-blue-600">{result.recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Chart Section */}
        {history.length > 0 && (
          <Card>
            <h2 className="font-bold text-gray-700 mb-4">📊 سجل القراءات</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history}>
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="حرارة" dot={false} />
                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="رطوبة جو" dot={false} />
                <Line type="monotone" dataKey="soil_moisture" stroke="#22c55e" name="رطوبة تربة" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </>
  );
};

export default SmartEnvironmentPage;