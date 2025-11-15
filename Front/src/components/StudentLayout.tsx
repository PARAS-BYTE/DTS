import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import {
  Home,
  Calendar,
  BookOpen,
  FileQuestion,
  Trophy,
  Settings,
  History,
  Bot,
  Store as StoreIcon,
  Blocks,
  Menu,
  X,
  LucideBatteryWarning
} from 'lucide-react';
// import { palette } from "../../theme/palette";
import { palette } from '../theme/palette';
interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const location = useLocation();
  const user = useStore((state) => state.user);
  const [open, setOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'Calendar', href: '/student/calendar', icon: Calendar },
    { name: 'Courses', href: '/student/courses', icon: BookOpen },
    { name: 'Assignments', href: '/student/assignments', icon: FileQuestion },
    { name: 'Quizzes', href: '/student/quizzes', icon: FileQuestion },
    { name: 'Arena', href: '/student/arena', icon: Trophy },
    { name: 'Settings', href: '/student/settings', icon: Settings },
    { name: 'History', href: '/student/hist', icon: History },
    { name: 'My Learning', href: '/student/learning', icon: LucideBatteryWarning },
    { name: 'ChatBot', href: '/student/chatbot', icon: Bot },
    { name: 'Store', href: '/student/store', icon: StoreIcon }
  ];

  const isActive = (path: string) => {
    if (path === '/student') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b" style={{ background: palette.card }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: palette.accent }}>
            <Blocks className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold" style={{ color: palette.text }}>LearnNova</span>
        </Link>

        {/* Hamburger Button */}
        <button onClick={() => setOpen(!open)}>
          {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static top-0 left-0 h-full w-64 p-4 transition-transform duration-300 z-40 border-r',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{ background: palette.card, borderColor: palette.border }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: palette.border }}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: palette.accent }}>
              <Blocks className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: palette.text }}>LearnNova</span>
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
                'hover:bg-gray-100'
              )}
              activeClassName="font-medium"
              style={{ color: palette.text2 }}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white w-full">{children}</main>
    </div>
  );
};

export default StudentLayout;
