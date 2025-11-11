import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Home, Calendar, BookOpen, FileQuestion, Trophy, BarChart3, Settings, Sparkles, LucideBatteryWarning, Icon, History, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const location = useLocation();
  const user = useStore((state) => state.user);

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'Calendar', href: '/student/calendar', icon: Calendar },
    { name: 'Courses', href: '/student/courses', icon: BookOpen },
    { name: 'Quizzes', href: '/student/quizzes', icon: FileQuestion },
    { name: 'Arena', href: '/student/arena', icon: Trophy },
    { name: 'Reports', href: '/student/reports', icon: BarChart3 },
    { name: 'Settings', href: '/student/settings', icon: Settings },
    {name :'History' ,href: "/student/hist",icon:History},
    { name: "My Learning", href: '/student/learning', icon: LucideBatteryWarning },
    {name :"ChatBot",href:"/student/chatbot",icon :Bot}
  ];

  const isActive = (path: string) => {
    if (path === '/student') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const levelProgress = user ? ((user.xp % 1000) / 1000) * 100 : 0;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">AIMentor</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/student'}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
              activeClassName="bg-primary/10 text-primary font-medium glow-primary"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          {user && (
            <div className="bg-muted/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Level {user.level}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">XP</span>
                  <span className="font-medium text-primary">{user.xp}</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/10 text-warning">
                  <span>🔥</span>
                  <span className="font-medium">{user.streak} day streak</span>
                </div>
                <div className="px-2 py-1 rounded-lg bg-success/10 text-success font-medium">
                  {user.rank}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;
