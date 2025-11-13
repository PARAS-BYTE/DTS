import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Send,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Question {
  questionNumber: number;
  type: 'mcq' | 'qa' | 'truefalse' | 'fillblank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Task {
  taskId: string;
  title: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  content: {
    questions: Question[];
    learningObjectives?: string[];
  };
}

const DailyTask = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    if (!taskId) {
      toast.error('No task selected');
      navigate('/student/calendar');
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:5000/api/calendar/task/${taskId}`, {
        withCredentials: true
      });

      if (!data?.task) {
        toast.error('Task not found');
        navigate('/student/calendar');
        return;
      }

      const identifier =
        data.task.taskId ||
        (data.task._id ? data.task._id.toString() : undefined);

      if (!identifier) {
        toast.error('Task is missing an identifier');
        navigate('/student/calendar');
        return;
      }

      const normalizedTask: Task = {
        ...data.task,
        taskId: identifier,
        content: {
          ...data.task.content,
          questions: (data.task.content?.questions || []).slice(0, 10).map((question: any, index: number) => ({
            ...question,
            questionNumber: question?.questionNumber ?? index + 1,
          })),
        },
      };

      if (!normalizedTask.content?.questions || normalizedTask.content.questions.length !== 10) {
        toast.warning('Adjusting questions to ensure you have 10 to complete today.');
      }

      setTask(normalizedTask);
    } catch (error: any) {
      console.error('Error fetching task:', error);
      const message = error.response?.data?.message || 'Failed to load task';
      toast.error(message);
      navigate('/student/calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (task?.content.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;

    const allAnswered = task.content.questions.every(
      q => answers[q.questionNumber] && answers[q.questionNumber].trim() !== ''
    );

    if (!allAnswered) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);

    // Check answers
    const newResults: { [key: number]: boolean } = {};
    task.content.questions.forEach(q => {
      const userAnswer = answers[q.questionNumber]?.trim().toLowerCase();
      const correctAnswer = q.correctAnswer?.trim().toLowerCase();
      
      if (q.type === 'mcq') {
        // For MCQ, check if answer matches option or index
        const optionIndex = q.options?.findIndex(opt => opt.toLowerCase() === userAnswer);
        newResults[q.questionNumber] = 
          userAnswer === correctAnswer || 
          (optionIndex !== undefined && optionIndex >= 0 && q.options?.[optionIndex]?.toLowerCase() === correctAnswer);
      } else if (q.type === 'truefalse') {
        newResults[q.questionNumber] = userAnswer === correctAnswer;
      } else {
        // For Q/A and fillblank, use fuzzy matching (contains check)
        newResults[q.questionNumber] = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
      }
    });

    setResults(newResults);
    setSubmitted(true);

    // Complete the task
    try {
      await axios.patch(
        `http://localhost:5000/api/calendar/complete/${task.taskId}`,
        {},
        { withCredentials: true }
      );
      
      const correctCount = Object.values(newResults).filter(r => r).length;
      const score = Math.round((correctCount / task.content.questions.length) * 100);
      
      toast.success(`Task completed! Score: ${score}% (${correctCount}/${task.content.questions.length})`);
      
      // Navigate back to calendar after showing results
      setTimeout(() => {
        navigate('/student/calendar', { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast.error(error.response?.data?.message || 'Failed to complete task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const currentQuestion = task.content.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / task.content.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = task.content.questions.every(q => answers[q.questionNumber]);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-gray-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/student/calendar')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calendar
          </Button>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Generated
          </Badge>
        </div>

        {/* Task Info */}
        <Card className="bg-[#121214] border-gray-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-indigo-300 mb-2">{task.title}</CardTitle>
                <p className="text-gray-400">{task.description}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="capitalize mb-2">
                  {task.difficulty}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  {task.estimatedDuration} min
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-indigo-300">
                  {currentQuestionIndex + 1} / {task.content.questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Answered: {answeredCount}/{task.content.questions.length}</span>
                <span>{task.category}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="bg-[#121214] border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Question {currentQuestion.questionNumber}
              <Badge variant="outline" className="ml-2 capitalize">
                {currentQuestion.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div>
              <p className="text-lg text-gray-200 mb-4">{currentQuestion.question}</p>
            </div>

            {/* Answer Input */}
            {!submitted ? (
              <div className="space-y-4">
                {currentQuestion.type === 'mcq' && currentQuestion.options && (
                  <RadioGroup
                    value={answers[currentQuestion.questionNumber] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.questionNumber, value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-300">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'truefalse' && (
                  <RadioGroup
                    value={answers[currentQuestion.questionNumber] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.questionNumber, value)}
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors">
                      <RadioGroupItem value="True" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer text-gray-300">True</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors">
                      <RadioGroupItem value="False" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer text-gray-300">False</Label>
                    </div>
                  </RadioGroup>
                )}

                {(currentQuestion.type === 'qa' || currentQuestion.type === 'fillblank') && (
                  <Textarea
                    placeholder={currentQuestion.type === 'fillblank' ? 'Enter your answer...' : 'Type your answer here...'}
                    value={answers[currentQuestion.questionNumber] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.questionNumber, e.target.value)}
                    className="min-h-[120px] bg-gray-900 border-gray-700 text-gray-200"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border-2 ${
                  results[currentQuestion.questionNumber]
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {results[currentQuestion.questionNumber] ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`font-semibold ${
                      results[currentQuestion.questionNumber] ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {results[currentQuestion.questionNumber] ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p><strong>Your answer:</strong> {answers[currentQuestion.questionNumber] || 'No answer'}</p>
                    <p><strong>Correct answer:</strong> {currentQuestion.correctAnswer}</p>
                    <p className="text-gray-400 mt-2">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="border-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestionIndex < task.content.questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Task
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Navigation Dots */}
        <div className="flex flex-wrap gap-2 justify-center">
          {task.content.questions.map((q, index) => (
            <button
              key={q.questionNumber}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                index === currentQuestionIndex
                  ? 'bg-indigo-600 border-indigo-400'
                  : answers[q.questionNumber]
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-gray-800 border-gray-700'
              }`}
            >
              {q.questionNumber}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyTask;

