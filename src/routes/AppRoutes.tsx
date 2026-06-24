import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Layout } from '../components/layout/Layout';

// Pages - Public
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import ForgotPasswordPage from '../pages/public/ForgotPasswordPage';
import AboutPage from '../pages/public/AboutPage';

// Pages - AI
import DiseaseDetectionPage from '../pages/ai/DiseaseDetectionPage';
import QualityAssessmentPage from '../pages/ai/QualityAssessmentPage';
import ExportIntelligencePage from '../pages/ai/ExportIntelligencePage';
import SmartEnvironmentPage from '../pages/ai/SmartEnvironmentPage';

// Pages - Chatbot
import { ChatbotPage } from '../pages/chatbot/ChatbotPage';

// Pages - System
import NotFoundPage from '../pages/system/NotFoundPage';
import MaintenancePage from '../pages/system/MaintenancePage';

// Protected Route — بيتلف بالـ Layout (Navbar + Sidebar) ويتأكد من تسجيل الدخول
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* Protected Routes - AI Services */}
        <Route path="/disease" element={
          <ProtectedRoute><DiseaseDetectionPage /></ProtectedRoute>
        } />
        <Route path="/quality" element={
          <ProtectedRoute><QualityAssessmentPage /></ProtectedRoute>
        } />
        <Route path="/export" element={
          <ProtectedRoute><ExportIntelligencePage /></ProtectedRoute>
        } />
        <Route path="/environment" element={
          <ProtectedRoute><SmartEnvironmentPage /></ProtectedRoute>
        } />

        {/* Protected Routes - Chatbot (مسارين لنفس الصفحة عشان يتوافق مع الـ Sidebar) */}
        <Route path="/chatbot" element={
          <ProtectedRoute><ChatbotPage /></ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute><ChatbotPage /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;