import { useState } from 'react';
import TempAINav from '../../components/layout/TempAINav';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { predictDiseaseApi } from '../../api/diseaseApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const DiseaseDetectionPage = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    },
  });

  const handleAnalyze = async () => {
    if (!image) {
      setError('من فضلك ارفع صورة أولاً');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await predictDiseaseApi(image);
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
            🌿 {t('ai.disease_title')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ارفع صورة النبات وهنحدد هل فيه مرض أو لا
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <h2 className="font-bold text-gray-700 mb-4">{t('ai.upload_image')}</h2>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="max-h-48 mx-auto rounded-lg object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <span className="text-5xl">📷</span>
                  <p className="text-sm">اسحب الصورة هنا أو اضغط للاختيار</p>
                </div>
              )}
            </div>

            {preview && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                اضغط على المنطقة فوق لتغيير الصورة
              </p>
            )}

            {error && (
              <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
            )}

            <div className="mt-4">
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

            {loading && <Loader text="جاري تحليل الصورة..." />}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                <span className="text-5xl">🔍</span>
                <p className="text-sm mt-2">النتيجة هتظهر هنا</p>
              </div>
            )}

            {!loading && result && (
              <div className="flex flex-col gap-4">
                {/* Disease Name */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-gray-500">المرض المكتشف</p>
                  <p className="text-xl font-bold text-red-600 mt-1">
                    {result.disease || 'غير محدد'}
                  </p>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{t('ai.confidence')}</span>
                    <span className="font-bold text-green-600">
                      {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(result.confidence || 0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation */}
                {result.recommendation && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-gray-500">التوصية</p>
                    <p className="text-sm text-green-700 mt-1">{result.recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default DiseaseDetectionPage;