import React from 'react';
import type{ WeatherData } from '../../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  language?: 'ar' | 'en';
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, language = 'ar' }) => {
  const ar = language === 'ar';

  const demo: WeatherData = weather || {
    location: ar ? 'القاهرة، مصر' : 'Cairo, Egypt',
    temperature: 34,
    condition: ar ? 'مشمس' : 'Sunny',
    humidity: 42,
    windSpeed: 18,
    forecast: [
      { day: ar ? 'غد' : 'Tmr', temp: 36 },
      { day: ar ? 'الخميس' : 'Thu', temp: 33 },
      { day: ar ? 'الجمعة' : 'Fri', temp: 31 },
      { day: ar ? 'السبت' : 'Sat', temp: 29 },
    ],
  };

  const isSunny = demo.condition.toLowerCase().includes('sun') || demo.condition.includes('مشمس');
  const isRainy = demo.condition.toLowerCase().includes('rain') || demo.condition.includes('مطر');

  const farmingAlert = demo.temperature > 35
    ? (ar ? '⚠️ حرارة مرتفعة — تعطيل الري' : '⚠️ High heat — adjust irrigation')
    : demo.humidity > 70
    ? (ar ? '⚠️ رطوبة عالية — خطر فطري' : '⚠️ High humidity — fungal risk')
    : (ar ? '✅ ظروف مثالية للزراعة' : '✅ Ideal growing conditions');

  return (
    <div className="card p-5 h-full flex flex-col" style={{ minHeight: 320 }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{ar ? 'الطقس الزراعي' : 'Farm Weather'}</p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{demo.location}</p>
        </div>
        <span className="ai-badge">AI</span>
      </div>

      {/* Main temp */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{ background: isSunny ? 'rgba(251,191,36,0.12)' : isRainy ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.05)' }}>
          {isSunny ? (
            <svg className="w-8 h-8" style={{ color: '#fbbf24' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" style={{ color: '#22d3ee' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>{demo.temperature}°C</p>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{demo.condition}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl p-3" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)' }}>
          <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {ar ? 'الرطوبة' : 'Humidity'}
          </p>
          <p className="text-lg font-extrabold mt-0.5" style={{ color: '#22d3ee' }}>{demo.humidity}%</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
          <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {ar ? 'الرياح' : 'Wind'}
          </p>
          <p className="text-lg font-extrabold mt-0.5" style={{ color: '#fbbf24' }}>{demo.windSpeed} km/h</p>
        </div>
      </div>

      {/* AI alert */}
      <div className="rounded-xl px-3 py-2 mb-4" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--emerald)' }}>{farmingAlert}</p>
      </div>

      {/* Forecast */}
      <div>
        <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }} className="mb-2">
          {ar ? 'التوقعات' : 'Forecast'}
        </p>
        <div className="flex gap-1.5">
          {demo.forecast.map((day, i) => (
            <div key={i} className="flex-1 rounded-xl py-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>{day.day}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{day.temp}°</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
