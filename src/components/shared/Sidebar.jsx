import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  CheckCircle, 
  Users, 
  LogOut,
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
  ];

  const links = role === 'principal' ? principalLinks : teacherLinks;

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Play className="h-5 w-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">EduStream</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-indigo-600' : 'text-slate-400')} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs border border-slate-200">
            {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
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
