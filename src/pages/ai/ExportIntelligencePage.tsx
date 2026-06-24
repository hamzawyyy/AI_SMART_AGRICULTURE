import { useState } from 'react';
import TempAINav from '../../components/layout/TempAINav';
import { useTranslation } from 'react-i18next';
import { predictExportApi } from '../../api/exportApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const markets = [
  { key: 'eu', label: 'الاتحاد الأوروبي 🇪🇺' },
  { key: 'gulf', label: 'الخليج 🇸🇦' },
  { key: 'local', label: 'السوق المحلي 🏠' },
];

const ExportIntelligencePage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    crop_type: '',
    quality_grade: 'A',
    weight: '',
    region: '',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    if (!form.crop_type || !form.weight || !form.region) {
      setError('من فضلك ادخل كل البيانات');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await predictExportApi({
        crop_type: form.crop_type,
        quality_grade: form.quality_grade,
        weight: Number(form.weight),
        region: form.region,
      });
      setResult(data);
    } catch (err: any) {
      setError('حدث خطأ أثناء التحليل، حاول تاني');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TempAINav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            🚢 {t('ai.export_title')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ادخل بيانات المحصول وهنديك توصيات التصدير لكل سوق
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card>
            <h2 className="font-bold text-gray-700 mb-4">بيانات المحصول</h2>

            <div className="flex flex-col gap-4">
              {/* Crop Type */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  نوع المحصول <span className="text-red-500">*</span>
                </label>
                <input
                  name="crop_type"
                  value={form.crop_type}
                  onChange={handleChange}
                  placeholder="مثال: طماطم، برتقال، قمح"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Quality Grade */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  درجة الجودة <span className="text-red-500">*</span>
                </label>
                <select
                  name="quality_grade"
                  value={form.quality_grade}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="A">Grade A — ممتاز</option>
                  <option value="B">Grade B — جيد</option>
                  <option value="C">Grade C — مقبول</option>
                </select>
              </div>

              {/* Weight */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  الوزن (كجم) <span className="text-red-500">*</span>
                </label>
                <input
                  name="weight"
                  type="number"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="مثال: 1000"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Region */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  منطقة الزراعة <span className="text-red-500">*</span>
                </label>
                <input
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="مثال: الدلتا، الصعيد"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

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

            {loading && <Loader text="جاري تحليل بيانات التصدير..." />}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                <span className="text-5xl">🌍</span>
                <p className="text-sm mt-2">توصيات التصدير هتظهر هنا</p>
              </div>
            )}

            {!loading && result && (
              <div className="flex flex-col gap-4">
                {markets.map((market) => {
                  const marketResult = result[market.key];
                  return (
                    <div
                      key={market.key}
                      className={`border rounded-xl p-4 ${
                        marketResult?.eligible
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-gray-800">{market.label}</p>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            marketResult?.eligible
                              ? 'bg-green-200 text-green-700'
                              : 'bg-red-200 text-red-700'
                          }`}
                        >
                          {marketResult?.eligible ? '✅ مؤهل' : '❌ غير مؤهل'}
                        </span>
                      </div>
                      {marketResult?.reason && (
                        <p className="text-sm text-gray-600">{marketResult.reason}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default ExportIntelligencePage;