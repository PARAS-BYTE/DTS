import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Plus, Clock, Users, CheckCircle, Brain, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: string;
  courseId?: string;
  dueDate: string;
  totalMarks: number;
  questionsCount?: number;
  totalStudents: number;
  graded: number;
  pending: number;
  published: boolean;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
}

const Assessments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    module: '',
    dueDate: '',
    allowLateSubmission: false,
    latePenalty: 0,
    published: true,
  });
  const [questions, setQuestions] = useState([
    { questionText: '', questionType: 'text', marks: 1, required: true },
    { questionText: '', questionType: 'text', marks: 1, required: true },
  ]);

  const navigate = useNavigate();

  // ─── Get Admin Token ────────────────────────────────
  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  // ─── Fetch Courses ────────────────────────────────
  const fetchCourses = async () => {
    try {
      const token = getAdminToken();
      const { data } = await axios.get('http://localhost:5000/api/courses', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCourses(data);
    } catch (err: any) {
      console.error('Fetch Courses Error:', err);
    }
  };

  // ─── Fetch Assignments ────────────────────────────────
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      
      // Fetch both quizzes and assignments
      const [quizzesRes, assignmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/auth/assessments', {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => ({ data: { success: false, assessments: [] } })),
        axios.get('http://localhost:5000/api/assignments/admin', {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => ({ data: { success: false, assignments: [] } })),
      ]);

      const allAssessments: Assignment[] = [];
      
      // Add quizzes
      if (quizzesRes.data.success && quizzesRes.data.assessments) {
        quizzesRes.data.assessments.forEach((quiz: any) => {
          allAssessments.push({
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            course: quiz.course,
            courseId: quiz.courseId,
            dueDate: quiz.dueDate || '',
            totalMarks: quiz.totalMarks,
            questionsCount: 0,
            totalStudents: quiz.students,
            graded: quiz.submitted,
            pending: quiz.pending,
            published: quiz.published,
            createdAt: quiz.createdAt,
          });
        });
      }
      
      // Add assignments
      if (assignmentsRes.data.success && assignmentsRes.data.assignments) {
        assignmentsRes.data.assignments.forEach((assignment: any) => {
          allAssessments.push({
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description || '',
            course: assignment.course,
            courseId: assignment.courseId,
            dueDate: assignment.dueDate,
            totalMarks: assignment.totalMarks,
            questionsCount: assignment.questionsCount,
            totalStudents: assignment.totalStudents,
            graded: assignment.graded,
            pending: assignment.pending,
            published: assignment.published,
            createdAt: assignment.createdAt,
          });
        });
      }

      setAssignments(allAssessments);
    } catch (err: any) {
      console.error('Fetch Assignments Error:', err);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchAssignments();
  }, []);

  // ─── Open Create Dialog ────────────────────────────────
  const handleCreateClick = () => {
    setFormData({
      title: '',
      description: '',
      courseId: '',
      module: '',
      dueDate: '',
      allowLateSubmission: false,
      latePenalty: 0,
      published: true,
    });
    setQuestions([
      { questionText: '', questionType: 'text', marks: 1, required: true },
      { questionText: '', questionType: 'text', marks: 1, required: true },
    ]);
    setIsDialogOpen(true);
  };

  // ─── Add Question ────────────────────────────────
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', questionType: 'text', marks: 1, required: true },
    ]);
  };

  // ─── Remove Question ────────────────────────────────
  const removeQuestion = (index: number) => {
    if (questions.length > 2) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      toast.error('At least 2 questions are required');
    }
  };

  // ─── Update Question ────────────────────────────────
  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  // ─── Submit Assignment ────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.courseId || !formData.dueDate) {
      toast.error('Title, course, and due date are required');
      return;
    }

    if (questions.length < 2) {
      toast.error('At least 2 questions are required');
      return;
    }

    const invalidQuestions = questions.filter((q) => !q.questionText.trim());
    if (invalidQuestions.length > 0) {
      toast.error('All questions must have text');
      return;
    }

    try {
      setSubmitting(true);
      const token = getAdminToken();

      const payload = {
        ...formData,
        questions: questions.map((q) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          marks: Number(q.marks),
          required: q.required,
        })),
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/assignments',
        payload,
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (data.success) {
        toast.success('Assignment created successfully');
        setIsDialogOpen(false);
        fetchAssignments();
      }
    } catch (err: any) {
      console.error('Create Assignment Error:', err);
      toast.error(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── View Submissions ────────────────────────────────
  const handleViewSubmissions = (assignmentId: string, assignment: Assignment) => {
    // Only navigate for assignments (those with questionsCount)
    if (assignment.questionsCount !== undefined) {
      navigate(`/admin/assignments/${assignmentId}/submissions`);
    } else {
      toast.info('Quiz submissions are managed differently');
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Assignments</h1>
          <p className="text-muted-foreground text-lg">
            Create and grade student assignments ({assignments.length} total)
          </p>
        </div>
        <Button size="lg" className="glow-primary" onClick={handleCreateClick}>
          <Plus className="w-5 h-5 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      )}

      {/* Assignments List */}
      {!loading && assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="hover:border-primary/50 transition-all cursor-pointer hover:glow-primary">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.course}</p>
                          {assignment.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {assignment.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-warning" />
                          <span className="text-warning font-medium">
                            Due: {formatDate(assignment.dueDate)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Total Students</span>
                          </div>
                          <p className="text-2xl font-bold">{assignment.totalStudents}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span className="text-sm text-success">Graded</span>
                          </div>
                          <p className="text-2xl font-bold text-success">{assignment.graded}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-warning" />
                            <span className="text-sm text-warning">Pending</span>
                          </div>
                          <p className="text-2xl font-bold text-warning">{assignment.pending}</p>
                        </div>
                      </div>

                      {/* Assignment Details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Total Marks: <strong className="text-foreground">{assignment.totalMarks}</strong>
                        </span>
                        {assignment.questionsCount !== undefined && (
                          <span>
                            Questions: <strong className="text-foreground">{assignment.questionsCount}</strong>
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            assignment.published
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {assignment.published ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {assignment.questionsCount !== undefined && (
                          <Button
                            size="sm"
                            className="glow-primary"
                            onClick={() => handleViewSubmissions(assignment._id, assignment)}
                          >
                            View Submissions
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Edit Assignment
                        </Button>
                      </div>
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
          <p className="text-muted-foreground">
            No assignments found. Create your first assignment!
          </p>
        </div>
      ) : null}

      {/* Create Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Create an assignment with 2 or more questions for your students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Midterm Project"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseId">Course *</Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, courseId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Assignment description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module">Module (Optional)</Label>
                <Input
                  id="module"
                  value={formData.module}
                  onChange={(e) =>
                    setFormData({ ...formData, module: e.target.value })
                  }
                  placeholder="Module name"
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Questions *</Label>
                <Button type="button" size="sm" variant="outline" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>

              {questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Question {index + 1}</Label>
                    {questions.length > 2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Textarea
                      placeholder="Enter question text..."
                      value={question.questionText}
                      onChange={(e) =>
                        updateQuestion(index, 'questionText', e.target.value)
                      }
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={question.questionType}
                        onValueChange={(value) =>
                          updateQuestion(index, 'questionType', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="code">Code</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Marks</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.marks}
                        onChange={(e) =>
                          updateQuestion(index, 'marks', Number(e.target.value))
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2 flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) =>
                            updateQuestion(index, 'required', e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-xs">Required</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowLateSubmission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowLateSubmission: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Allow Late Submission</span>
                </label>
              </div>

              {formData.allowLateSubmission && (
                <div className="space-y-2">
                  <Label htmlFor="latePenalty">Late Penalty (%)</Label>
                  <Input
                    id="latePenalty"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.latePenalty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latePenalty: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="glow-primary">
                {submitting ? 'Creating...' : 'Create Assignment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assessments;
