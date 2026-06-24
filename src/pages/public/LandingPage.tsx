import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../../components/layout/PublicLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const LandingPage = () => {
  const { t } = useTranslation();

  const features = t('landing.features', { returnObjects: true }) as {
    icon: string; title: string; description: string;
  }[];

  const stats = t('landing.stats', { returnObjects: true }) as {
    value: string; label: string;
  }[];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 text-7xl opacity-10 hidden lg:block select-none">
          🌿
        </div>
        <div className="absolute bottom-20 left-10 text-6xl opacity-10 hidden lg:block select-none">
          🚜
        </div>
        <div className="absolute top-1/3 right-20 text-5xl opacity-5 hidden xl:block select-none animate-spin-slow">
          🌾
        </div>
        <div className="absolute bottom-1/3 left-20 text-5xl opacity-5 hidden xl:block select-none animate-bounce-slow">
          🌱
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-lg mb-8 border border-green-200/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-700 font-medium text-sm">
              🚀 AI-Powered Smart Agriculture
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-800 mb-6 leading-[1.1]">
            {t('landing.hero_title_1')}
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
                {t('landing.hero_title_2')}
              </span>
              {/* Underline decoration */}
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full blur-sm" />
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.hero_desc')}
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:-translate-y-0.5">
                <span className="relative z-10 flex items-center gap-2">
                  {t('landing.start_free')}
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </Link>
            <Link to="/about">
              <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-white hover:border-green-300 hover:shadow-lg transition-all duration-300">
                {t('landing.learn_more')}
              </button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex items-center justify-center gap-6 flex-wrap text-sm text-gray-500">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Free Forever
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              No Credit Card
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              24/7 Support
            </span>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
            <span className="text-xs uppercase tracking-wider font-medium">Scroll</span>
            <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex justify-center">
              <div className="w-1 h-2 bg-green-500 rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 to-transparent h-32" />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/5 to-emerald-400/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <p className="relative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                  {stat.value}
                </p>
                <p className="relative text-gray-600 text-sm mt-2 font-medium">
                  {stat.label}
                </p>
                
                {/* Bottom decoration line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 group-hover:w-3/4 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 via-white to-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100/50 px-4 py-1.5 rounded-full mb-4">
              <span className="text-green-600 text-sm font-medium">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {t('landing.features_title')}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Discover how our AI-powered platform transforms agriculture
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100/50"
              >
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" />
                
                {/* Icon with gradient background */}
                <div className="relative w-16 h-16 flex items-center justify-center text-3xl bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                <h3 className="relative text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="relative text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Decorative line */}
                <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-green-400/0 via-green-400/50 to-emerald-400/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 px-4 overflow-hidden">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-emerald-600">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Floating decorations */}
        <div className="absolute top-10 left-10 text-6xl opacity-10 select-none animate-float">
          🌾
        </div>
        <div className="absolute bottom-10 right-10 text-7xl opacity-10 select-none animate-float-delay">
          🌿
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20 mb-6">
            <span className="text-white/90 text-sm font-medium">🚀 Get Started Today</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('landing.cta_title')}
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.cta_desc')}
          </p>
          
          <Link to="/register">
            <button className="group relative px-10 py-4 bg-white text-green-700 font-bold rounded-xl shadow-2xl shadow-black/20 hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-1">
              <span className="relative z-10 flex items-center gap-2">
                {t('landing.cta_btn')}
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </Link>
          
          <p className="mt-6 text-green-200/80 text-sm">
            ✨ No commitment • Cancel anytime
          </p>
        </div>
      </section>
    </PublicLayout>
  );
};

export default LandingPage;