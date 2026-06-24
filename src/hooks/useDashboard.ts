import { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { DashboardStats, ActivityItem, WeatherData, ChartData } from '../types';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, activityRes, weatherRes, chartRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentActivity(),
          dashboardApi.getWeather(),
          dashboardApi.getChartData(),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (activityRes.success) setActivities(activityRes.data);
        if (weatherRes.success) setWeather(weatherRes.data);
        if (chartRes.success) setChartData(chartRes.data);

      } catch (err) {
        setError('فشل في تحميل بيانات الداشبورد');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, activities, weather, chartData, loading, error };
};