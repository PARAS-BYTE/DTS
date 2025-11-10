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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-primary/30 mb-8 glow-primary">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              Your Smartest{' '}
              <span className="text-gradient">Study Companion</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Experience adaptive learning that evolves with you. Master any subject with AI-powered insights, gamification, and personalized study paths.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="text-lg px-8 py-6 glow-primary hover:scale-105 transition-transform">
                  <Users className="mr-2 w-5 h-5" />
                  Start Learning
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:bg-card hover:scale-105 transition-transform">
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
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center glow-primary animate-float">
              <Brain className="w-32 h-32 text-primary" />
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-gradient">Nova Learn</span>
            </h2>
            <p className="text-xl text-muted-foreground">
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
                className="bg-card border border-border rounded-3xl p-6 hover:border-primary/50 transition-all hover:scale-105 hover:glow-primary"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
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
            className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-3xl p-12 glow-primary"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students already learning smarter
            </p>
            <Link to="/student">
              <Button size="lg" className="text-lg px-10 py-6 glow-primary hover:scale-105 transition-transform">
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
