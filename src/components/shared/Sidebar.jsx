import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  CheckCircle, 
  Users, 
  LogOut,
  Radio,
  Settings,
  UserPlus,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth();
  const role = user?.profile?.role;

  const teacherLinks = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Upload Content', href: '/teacher/upload', icon: Upload },
    { name: 'My Content', href: '/teacher/content', icon: FileText },
  ];

  const principalLinks = [
    { name: 'Dashboard', href: '/principal/dashboard', icon: LayoutDashboard },
    { name: 'Pending Approvals', href: '/principal/pending', icon: CheckCircle },
    { name: 'All Content', href: '/principal/content', icon: Users },
    { name: 'Manage Staff', href: '/principal/manage', icon: UserPlus },
  ];

  const viewerLinks = [
    { name: 'Live Broadcast', href: '/live/all', icon: Play },
  ];

  const links = role === 'principal' ? principalLinks : role === 'teacher' ? teacherLinks : viewerLinks;

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-teal-500 p-1.5 rounded-lg">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">StreamPro</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menu</p>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isActive 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-teal-600' : 'text-slate-400')} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</p>
          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
              pathname === '/profile' 
                ? 'bg-teal-50 text-teal-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Settings className={cn('h-5 w-5', pathname === '/profile' ? 'text-teal-600' : 'text-slate-400')} />
            Profile Settings
          </Link>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-xs">
            {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.profile?.full_name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{role}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
