import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Home, Calendar, BookOpen, FileQuestion, Trophy, BarChart3, Settings, Sparkles, LucideBatteryWarning, Icon, History, Bot, Album, AlbumIcon, GraduationCap, Blocks, Library, Store, Book } from 'lucide-react';
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
    { name: 'Assignments', href: '/student/assignments', icon: FileQuestion },
    { name: 'Quizzes', href: '/student/quizzes', icon: FileQuestion },
    { name: 'Arena', href: '/student/arena', icon: Trophy },
    // { name: 'Reports', href: '/student/reports', icon: BarChart3 },
    { name: 'Settings', href: '/student/settings', icon: Settings },
    {name :'History' ,href: "/student/hist",icon:History},
    { name: "My Learning", href: '/student/learning', icon: LucideBatteryWarning },
    {name :"ChatBot",href:"/student/chatbot",icon :Bot},
    {name :"Store", href:"/student/store",icon:Store},
  ];

  const isActive = (path: string) => {
    if (path === '/student') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-black/10">
              <Blocks className="w-6 h-6 text-white"/>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">LearnNova</span>
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
                'text-gray-600 hover:text-black hover:bg-gray-50',
              )}
              activeClassName="bg-black/5 text-black font-medium border border-gray-200"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">
        {children}
      </main>
    </div>
  );
};

export default StudentLayout;