export interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'trader' | 'exporter' | 'admin';
  avatar?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeProducts: number;
  productsChange: number;
  pendingTasks: number;
  tasksChange: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'shipment' | 'alert' | 'message';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: { day: string; temp: number }[];
}

export interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
