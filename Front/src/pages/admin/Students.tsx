import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Search, Filter, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const Students = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const students = [
    {
      id: '1',
      name: 'Emma Watson',
      email: 'emma@example.com',
      progress: 85,
      xp: 5420,
      lastActive: '5 min ago',
      weakTopics: ['Recursion', 'Graph Theory'],
      trend: 'up',
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john@example.com',
      progress: 72,
      xp: 4890,
      lastActive: '1 hour ago',
      weakTopics: ['Dynamic Programming', 'Trees'],
      trend: 'up',
    },
    {
      id: '3',
      name: 'Sarah Lee',
      email: 'sarah@example.com',
      progress: 68,
      xp: 4320,
      lastActive: '2 hours ago',
      weakTopics: ['Sorting Algorithms', 'Hash Tables'],
      trend: 'down',
    },
    {
      id: '4',
      name: 'Mike Chen',
      email: 'mike@example.com',
      progress: 91,
      xp: 3850,
      lastActive: '30 min ago',
      weakTopics: ['Greedy Algorithms'],
      trend: 'up',
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-gradient">Students</h1>
        <p className="text-muted-foreground text-lg">Monitor and manage student progress</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Students Grid */}
      <div className="grid gap-4">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:border-primary/50 transition-all cursor-pointer hover:glow-primary">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Avatar and Basic Info */}
                  <Avatar className="w-16 h-16 border-2 border-primary">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-lg">
                      {student.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          {student.name}
                          {student.trend === 'up' ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">Last active: {student.lastActive}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{student.xp}</div>
                        <p className="text-xs text-muted-foreground">Total XP</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-medium text-primary">{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                    </div>

                    {/* Weak Topics */}
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Needs improvement:</p>
                        <div className="flex flex-wrap gap-2">
                          {student.weakTopics.map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 rounded-lg bg-warning/10 text-warning text-xs font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        Send Message
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Assign Task
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

export default Students;
