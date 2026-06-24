import { useTranslation } from 'react-i18next';
import PublicLayout from '../../components/layout/PublicLayout';
import Card from '../../components/common/Card';

const AboutPage = () => {
  const { t } = useTranslation();

  const features = t('about.features', { returnObjects: true }) as {
    icon: string; title: string; description: string;
  }[];

  const team = t('about.team', { returnObjects: true }) as {
    name: string; role: string;
  }[];

  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🌱 {t('about.hero_title')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t('about.hero_desc')}
          </p>
        </div>

        {/* Features */}
        <h2 className="text-xl font-bold text-gray-700 mb-6">{t('about.features_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col gap-2">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="font-bold text-gray-800">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Team */}
        <h2 className="text-xl font-bold text-gray-700 mb-6">{t('about.team_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {team.map((member, index) => (
            <Card key={index} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                <p className="text-gray-500 text-xs">{member.role}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Tech Stack */}
        <h2 className="text-xl font-bold text-gray-700 mb-6">{t('about.tech_title')}</h2>
        <Card>
          <div className="flex flex-wrap gap-2">
            {[
              'Python', 'TypeScript', 'React', 'FastAPI',
              'TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face',
              'PostgreSQL', 'Docker', 'GitHub Actions', 'Tailwind CSS'
            ].map((tech) => (
              <span
                key={tech}
                className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </Card>

      </div>
    </PublicLayout>
  );
};

export default AboutPage;