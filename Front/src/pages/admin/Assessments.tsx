import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Clock, Users, CheckCircle, Brain } from 'lucide-react';

const Assessments = () => {
  const assessments = [
    {
      id: '1',
      title: 'ML Midterm Exam',
      course: 'Machine Learning',
      students: 45,
      submitted: 38,
      pending: 7,
      dueDate: '2025-11-15',
    },
    {
      id: '2',
      title: 'React Components Quiz',
      course: 'Web Development',
      students: 62,
      submitted: 62,
      pending: 0,
      dueDate: '2025-11-10',
    },
    {
      id: '3',
      title: 'DSA Final Project',
      course: 'Data Structures',
      students: 38,
      submitted: 12,
      pending: 26,
      dueDate: '2025-11-20',
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Assessments</h1>
          <p className="text-muted-foreground text-lg">Create and grade student assessments</p>
        </div>
        <Button size="lg" className="glow-primary">
          <Plus className="w-5 h-5 mr-2" />
          Create Assessment
        </Button>
      </div>

      {/* Assessments List */}
      <div className="space-y-4">
        {assessments.map((assessment, index) => (
          <motion.div
            key={assessment.id}
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
                        <h3 className="text-xl font-semibold">{assessment.title}</h3>
                        <p className="text-sm text-muted-foreground">{assessment.course}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-warning font-medium">Due: {assessment.dueDate}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Total Students</span>
                        </div>
                        <p className="text-2xl font-bold">{assessment.students}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-success">Submitted</span>
                        </div>
                        <p className="text-2xl font-bold text-success">{assessment.submitted}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-warning" />
                          <span className="text-sm text-warning">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-warning">{assessment.pending}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="glow-primary">
                        View Submissions
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit Assessment
                      </Button>
                      <Button size="sm" className="bg-warning hover:bg-warning/90 text-warning-foreground">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Grade
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Assessments;
