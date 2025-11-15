import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Users, FileText, Settings, Sparkles, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import axios from 'axios';
import { palette } from '@/theme/palette';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Fetch admin profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const { data } = await axios.get('http://localhost:5000/api/admin/auth/profile', {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (data.success && data.admin) {
          setAdmin(data.admin);
        }
      } catch (err) {
        console.error('Failed to fetch admin profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Assessments', href: '/admin/assessments', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen flex-col md:flex-row" style={{ background: palette.bg }}>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b" style={{ background: palette.card, borderColor: palette.border }}>
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: palette.accent }}>
            <Sparkles className="w-6 h-6" style={{ color: palette.card }} />
          </div>
          <span className="text-xl font-bold" style={{ color: palette.text }}>learnNova</span>
        </Link>

        {/* Hamburger Button */}
        <button onClick={() => setOpen(!open)}>
          {open ? <X className="w-7 h-7" style={{ color: palette.text }} /> : <Menu className="w-7 h-7" style={{ color: palette.text }} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        'fixed md:static top-0 left-0 h-full w-64 p-4 transition-transform duration-300 z-40 border-r flex flex-col shadow-sm flex-shrink-0',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )} style={{ background: palette.card, borderColor: palette.border }}>
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b" style={{ borderColor: palette.border }}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: palette.accent }}>
              <Sparkles className="w-6 h-6" style={{ color: palette.card }} />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold block" style={{ color: palette.text }}>learnNova</span>
              <span className="text-xs" style={{ color: palette.text2 }}>Educator Portal</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                  isActive && 'font-medium'
                )
              }
              style={({ isActive }) => ({
                color: isActive ? palette.text : palette.text2,
                background: isActive ? palette.accentSoft : 'transparent',
              })}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t" style={{ borderColor: palette.border }}>
          <div className="rounded-xl p-4" style={{ background: palette.cardHover }}>
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: palette.border }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded animate-pulse w-24" style={{ background: palette.border }} />
                  <div className="h-3 rounded animate-pulse w-16" style={{ background: palette.border }} />
                </div>
              </div>
            ) : (
            <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2" style={{ borderColor: palette.border }}>
                  <AvatarFallback style={{ background: palette.accent, color: palette.card }}>
                    {admin?.fullName
                      ? admin.fullName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : admin?.username
                      ? admin.username.slice(0, 2).toUpperCase()
                      : 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm" style={{ color: palette.text }}>
                    {admin?.fullName || admin?.username || 'Admin'}
                  </p>
                  <p className="text-xs" style={{ color: palette.text2 }}>
                    {admin?.department || admin?.role || 'Instructor'}
                  </p>
              </div>
            </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <header className="h-14 sm:h-16 border-b flex items-center justify-between px-4 sm:px-6" style={{ background: palette.card, borderColor: palette.border }}>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold" style={{ color: palette.text }}>
              {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto" style={{ background: palette.bg }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
