import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Clock,
  CheckCircle2,
  User,
  ArrowLeft,
  Save,
  Brain,
} from 'lucide-react';
import { toast } from 'sonner';
import { canNotify, iconUrl, sendNotification } from '@/lib/notifications';
import { useAdminNotificationPrefs } from '@/store/notificationPrefs';

interface Question {
  _id: string;
  questionText: string;
  questionType: string;
  marks: number;
  required: boolean;
  order: number;
}

interface Submission {
  _id: string;
  student: {
    _id: string;
    username: string;
    email: string;
  };
  answers: Array<{
    questionId: string;
    answer: string;
    submittedAt: string;
  }>;
  submittedAt: string;
  status: string;
  grade: number;
  totalMarks: number;
  feedback: string;
  gradedBy: {
    username: string;
    fullName: string;
  } | null;
  gradedAt: string | null;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: string;
  questions: Question[];
  totalMarks: number;
  dueDate: string;
}

const AssignmentSubmissions = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [aiGrading, setAiGrading] = useState(false);
  const {
    newSubmissions,
    lastSubmissionCountByAssignment,
    setAssignmentSubmissionCount,
  } = useAdminNotificationPrefs();

  const previousCount = useMemo(() => {
    if (!id) return 0;
    return lastSubmissionCountByAssignment[id] ?? 0;
  }, [id, lastSubmissionCountByAssignment]);

  // ─── Get Admin Token ────────────────────────────────
  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  // ─── Fetch Assignment Submissions ────────────────────────────────
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const { data } = await axios.get(
        `http://localhost:5000/api/assignments/${id}/submissions`,
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (data.success) {
        setAssignment(data.assignment);
        setSubmissions(data.submissions);

        // Detect new submissions and notify (browser notification, not toast)
        const currentCount: number = Array.isArray(data.submissions) ? data.submissions.length : 0;
        if (id) {
          if (currentCount > previousCount && newSubmissions && canNotify()) {
            const diff = currentCount - previousCount;
            sendNotification('New assignment submission', {
              body: diff === 1
                ? `You have 1 new submission for "${data.assignment?.title || 'Assignment'}".`
                : `You have ${diff} new submissions for "${data.assignment?.title || 'Assignment'}".`,
              icon: iconUrl(),
              badge: iconUrl(),
              renotify: true,
            });
          }
          // Store the latest count
          setAssignmentSubmissionCount(id, currentCount);
        }
      }
    } catch (err: any) {
      console.error('Fetch Submissions Error:', err);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubmissions();
    }
  }, [id]);

  // ─── Open Grade Dialog ────────────────────────────────
  const handleGradeClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || 0);
    setFeedback(submission.feedback || '');
    setIsDialogOpen(true);
  };

  // ─── Submit Grade ────────────────────────────────
  const handleSubmitGrade = async () => {
    if (!selectedSubmission || !id) return;

    if (grade < 0 || grade > (assignment?.totalMarks || 100)) {
      toast.error(`Grade must be between 0 and ${assignment?.totalMarks || 100}`);
      return;
    }

    try {
      setGrading(true);
      const token = getAdminToken();

      const { data } = await axios.put(
        `http://localhost:5000/api/assignments/${id}/grade/${selectedSubmission._id}`,
        { grade, feedback },
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (data.success) {
        toast.success('Assignment graded successfully');
        setIsDialogOpen(false);
        fetchSubmissions();
      }
    } catch (err: any) {
      console.error('Grade Assignment Error:', err);
      toast.error(err.response?.data?.message || 'Failed to grade assignment');
    } finally {
      setGrading(false);
    }
  };

  // ─── AI Grade Assignment ────────────────────────────────
  const handleAiGrade = async (submission: Submission) => {
    if (!id) return;

    try {
      setAiGrading(true);
      const token = getAdminToken();

      toast.info('AI is grading the assignment... This may take a moment.');

      const { data } = await axios.post(
        `http://localhost:5000/api/assignments/${id}/ai-grade/${submission._id}`,
        {},
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (data.success) {
        toast.success('Assignment graded successfully by AI!');
        fetchSubmissions();
      }
    } catch (err: any) {
      console.error('AI Grade Assignment Error:', err);
      toast.error(err.response?.data?.message || 'Failed to grade assignment with AI');
    } finally {
      setAiGrading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get answer for a question
  const getAnswerForQuestion = (submission: Submission, questionId: string) => {
    const answer = submission.answers.find((a) => a.questionId === questionId);
    return answer?.answer || 'No answer provided';
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/assessments')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">
            {assignment?.title || 'Assignment Submissions'}
          </h1>
          <p className="text-muted-foreground text-lg">
            Grade student submissions ({submissions.length} total)
          </p>
        </div>
      </div>

      {assignment && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{assignment.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span>Course: <strong>{assignment.course}</strong></span>
              <span>Total Marks: <strong>{assignment.totalMarks}</strong></span>
              <span>Due Date: <strong>{formatDate(assignment.dueDate)}</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      )}

      {/* Submissions List */}
      {!loading && submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <motion.div
              key={submission._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{submission.student.username}</h3>
                          <p className="text-sm text-muted-foreground">{submission.student.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted: {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                        <div className="ml-auto">
                          {submission.status === 'graded' ? (
                            <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                              Graded: {submission.grade}/{submission.totalMarks}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Answers */}
                      <div className="space-y-3 mt-4">
                        {assignment?.questions.map((question, qIndex) => (
                          <div key={question._id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <Label className="text-sm font-semibold">
                                Question {qIndex + 1} ({question.marks} marks)
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {question.questionText}
                            </p>
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">
                                {getAnswerForQuestion(submission, question._id)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {submission.status === 'graded' && submission.feedback && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/30">
                          <p className="text-sm font-medium mb-1">Feedback:</p>
                          <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                          {submission.gradedBy && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Graded by {submission.gradedBy.fullName || submission.gradedBy.username} on{' '}
                              {submission.gradedAt ? formatDate(submission.gradedAt) : 'N/A'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex gap-2">
                      {submission.status !== 'graded' && (
                        <Button
                          onClick={() => handleAiGrade(submission)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={aiGrading}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          {aiGrading ? 'AI Grading...' : 'AI Grade'}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleGradeClick(submission)}
                        className="glow-primary"
                        variant={submission.status === 'graded' ? 'outline' : 'default'}
                        disabled={grading}
                      >
                        {submission.status === 'graded' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Update Grade
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Manual Grade
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No submissions found.</p>
        </div>
      ) : null}

      {/* Grade Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Grade Assignment - {selectedSubmission?.student.username}
            </DialogTitle>
            <DialogDescription>
              Review the submission and provide a grade and feedback.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && assignment && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {assignment.questions.map((question, qIndex) => (
                  <div key={question._id} className="p-3 border rounded-lg">
                    <Label className="text-sm font-semibold">
                      Question {qIndex + 1} ({question.marks} marks)
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">{question.questionText}</p>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {getAnswerForQuestion(selectedSubmission, question._id)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">
                    Grade (out of {assignment.totalMarks})
                  </Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max={assignment.totalMarks}
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the student..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={grading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitGrade} disabled={grading} className="glow-primary">
              {grading ? 'Grading...' : 'Submit Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentSubmissions;

