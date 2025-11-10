import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, Clock, Zap, Target, Brain, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

const Quizzes = () => {
  const quizzes = useStore((state) => state.quizzes);
  const [showAIDialog, setShowAIDialog] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient">Quizzes & Assessments</h1>
        <p className="text-muted-foreground text-lg">Test your knowledge and earn XP</p>
      </div>

      {/* Quiz Modes */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 hover:scale-105 transition-transform cursor-pointer glow-primary h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Topic Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a specific topic and test your mastery
              </p>
              <Button className="w-full glow-primary">Start Quiz</Button>
            </CardContent>
          </Card>
        </motion.div>
        Video
    {/* <video src="https://youtu.be/zTxvGzpfF-g" className="w-full h-full" autoPlay loop controls /> */}
    
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 hover:scale-105 transition-transform cursor-pointer glow-accent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-secondary" />
                Random Quiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Get questions from all topics you're learning</p>
              <Button variant="outline" className="w-full hover:bg-secondary/10">
                Surprise Me
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-warning/20 to-warning/5 border-warning/30 hover:scale-105 transition-transform cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-warning" />
                    Adaptive AI Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">AI adjusts difficulty based on your performance</p>
                  <Button className="w-full bg-warning hover:bg-warning/90 text-warning-foreground">
                    Start AI Quiz
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="w-6 h-6 text-warning" />
                  AI Adaptive Quiz
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
                  <p className="text-sm">
                    <strong>How it works:</strong> The AI will analyze your answers in real-time and adjust the
                    difficulty level to match your skill. This ensures maximum learning efficiency!
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1" variant="outline" onClick={() => setShowAIDialog(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-warning hover:bg-warning/90 text-warning-foreground">
                    Begin Quiz
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {/* Available Quizzes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <Card className="hover:scale-105 transition-transform cursor-pointer hover:border-primary/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
                    <FileQuestion className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{quiz.topic}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileQuestion className="w-4 h-4" />
                      <span>{quiz.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-warning/10 border border-warning/20">
                    <span className="text-sm text-muted-foreground">Reward</span>
                    <div className="flex items-center gap-1 font-bold text-warning">
                      <Zap className="w-4 h-4" />
                      <span>+{quiz.xpReward} XP</span>
                    </div>
                  </div>

                  <Button className="w-full glow-primary">Start Quiz</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Quizzes;
