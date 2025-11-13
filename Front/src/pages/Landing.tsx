import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Trophy, Target, Zap, Users } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: 'Adaptive Learning',
      description: 'AI adjusts to your pace and learning style',
    },
    {
      icon: Sparkles,
      title: 'AI Quizzes',
      description: 'Smart assessments that target your weak points',
    },
    {
      icon: Trophy,
      title: 'Gamified XP & Streaks',
      description: 'Stay motivated with rewards and achievements',
    },
    {
      icon: Target,
      title: 'AI Course Builder',
      description: 'Educators can create adaptive courses with AI',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-black/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/20 mb-8 shadow-lg shadow-black/10">
              <Zap className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight text-black">
              Your Smartest{' '}
              <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                Study Companion
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12">
              Experience adaptive learning that evolves with you. Master any subject with AI-powered insights, gamification, and personalized study paths.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="text-lg px-8 py-6 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 hover:shadow-black/30 hover:scale-105 transition-all duration-300 border-0">
                  <Users className="mr-2 w-5 h-5" />
                  Start Learning
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent text-black border-black hover:bg-black/5 hover:scale-105 transition-all duration-300">
                  <Brain className="mr-2 w-5 h-5" />
                  I'm an Educator
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Animated Avatar/Mascot Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-black/10 to-gray-600/10 rounded-full flex items-center justify-center shadow-lg shadow-black/10 animate-float">
              <Brain className="w-32 h-32 text-black" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                Nova Learn
              </span>
            </h2>
            <p className="text-xl text-gray-700">
              The smartest and most adaptive learning platform: Nova Learn.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-3xl p-6 hover:border-black/30 transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-black">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-black/5 to-gray-600/5 border border-black/10 rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of students already learning smarter
            </p>
            <Link to="/student">
              <Button size="lg" className="text-lg px-10 py-6 bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 hover:shadow-black/30 hover:scale-105 transition-all duration-300 border-0">
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;