import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  AlertCircle,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: string;
  courseId?: string;
  dueDate: string;
  totalMarks: number;
  questionsCount: number;
  questions: Array<{
    _id: string;
    questionText: string;
    questionType: string;
    marks: number;
    required: boolean;
    order: number;
  }>;
  allowLateSubmission: boolean;
  latePenalty: number;
  isSubmitted: boolean;
  isGraded: boolean;
  isOverdue: boolean;
  submission: {
    grade: number;
    feedback: string;
    submittedAt: string;
    status: string;
  } | null;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // ─── Fetch Assignments ────────────────────────────────
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/assignments/student', {
        withCredentials: true,
      });

      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (err: any) {
      console.error('Fetch Assignments Error:', err);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // ─── Open Assignment Dialog ────────────────────────────────
  const handleOpenAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    
    // Pre-fill answers if already submitted
    if (assignment.submission && assignment.submission.status === 'submitted') {
      // Note: We'd need to fetch the full submission to get answers
      // For now, we'll just show the submission status
    }
    
    setAnswers({});
    setIsDialogOpen(true);
  };

  // ─── Submit Assignment ────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    // Validate required questions
    const requiredQuestions = selectedAssignment.questions.filter((q) => q.required);
    const missingAnswers = requiredQuestions.filter(
      (q) => !answers[q._id] || !answers[q._id].trim()
    );

    if (missingAnswers.length > 0) {
      toast.error('Please answer all required questions');
      return;
    }

    try {
      setSubmitting(true);

      // Format answers
      const formattedAnswers = selectedAssignment.questions
        .filter((q) => answers[q._id])
        .map((q) => ({
          questionId: q._id,
          answer: answers[q._id],
        }));

      const { data } = await axios.post(
        `http://localhost:5000/api/assignments/${selectedAssignment._id}/submit`,
        { answers: formattedAnswers },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Assignment submitted successfully!');
        setIsDialogOpen(false);
        fetchAssignments();
      }
    } catch (err: any) {
      console.error('Submit Assignment Error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
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

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.isGraded) {
      return (
        <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
          Graded
        </span>
      );
    }
    if (assignment.isSubmitted) {
      return (
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          Submitted
        </span>
      );
    }
    if (assignment.isOverdue) {
      return (
        <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
          Overdue
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
        Pending
      </span>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient">My Assignments</h1>
        <p className="text-muted-foreground text-lg">
          View and submit your assigned tasks
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      )}

      {/* Assignments List */}
      {!loading && assignments.length > 0 ? (
        <div className="grid gap-4">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold">{assignment.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {assignment.course}
                              </p>
                              {assignment.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {assignment.description}
                                </p>
                              )}
                            </div>
                            {getStatusBadge(assignment)}
                          </div>

                          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            </div>
                            <div>
                              <span>Total Marks: <strong className="text-foreground">{assignment.totalMarks}</strong></span>
                            </div>
                            <div>
                              <span>Questions: <strong className="text-foreground">{assignment.questionsCount}</strong></span>
                            </div>
                            {assignment.isGraded && assignment.submission && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-success" />
                                <span className="text-success font-semibold">
                                  Grade: {assignment.submission.grade}/{assignment.totalMarks}
                                </span>
                              </div>
                            )}
                          </div>

                          {assignment.isGraded && assignment.submission?.feedback && (
                            <div className="mt-4 p-3 rounded-lg bg-muted/30">
                              <p className="text-sm font-medium mb-1">Feedback:</p>
                              <p className="text-sm text-muted-foreground">
                                {assignment.submission.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {!assignment.isSubmitted ? (
                        <Button
                          onClick={() => handleOpenAssignment(assignment)}
                          className="glow-primary"
                          disabled={assignment.isOverdue && !assignment.allowLateSubmission}
                        >
                          {assignment.isOverdue ? (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Submit (Late)
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Start Assignment
                            </>
                          )}
                        </Button>
                      ) : assignment.isGraded ? (
                        <Button variant="outline" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Graded
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          Submitted
                        </Button>
                      )}
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
          <p className="text-muted-foreground">No assignments found.</p>
        </div>
      ) : null}

      {/* Assignment Submission Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.description || 'Complete all questions to submit'}
            </DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Due: {formatDate(selectedAssignment.dueDate)}</span>
                </div>
                <div>
                  <span>Total Marks: <strong>{selectedAssignment.totalMarks}</strong></span>
                </div>
                {selectedAssignment.isOverdue && (
                  <span className="text-warning">
                    ⚠️ This assignment is overdue
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {selectedAssignment.questions.map((question, index) => (
                  <div key={question._id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <Label className="text-base font-semibold">
                        Question {index + 1} {question.required && <span className="text-destructive">*</span>}
                        <span className="text-sm text-muted-foreground font-normal ml-2">
                          ({question.marks} marks)
                        </span>
                      </Label>
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                        {question.questionType}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{question.questionText}</p>
                    <Textarea
                      placeholder={
                        question.questionType === 'code'
                          ? 'Write your code here...'
                          : question.questionType === 'file'
                          ? 'Paste file URL or description here...'
                          : 'Type your answer here...'
                      }
                      value={answers[question._id] || ''}
                      onChange={(e) =>
                        setAnswers({ ...answers, [question._id]: e.target.value })
                      }
                      rows={question.questionType === 'code' ? 10 : 5}
                      className="font-mono"
                      required={question.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="glow-primary"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assignments;

