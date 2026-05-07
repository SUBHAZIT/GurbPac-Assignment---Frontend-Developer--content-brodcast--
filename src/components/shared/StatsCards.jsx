import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FolderOpen 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatsCards({ stats, loading }) {
  const items = [
    {
      title: 'Total Uploaded',
      value: stats?.total || 0,
      icon: FolderOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      bar: 'bg-blue-200',
    },
    {
      title: 'Pending Approval',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      bar: 'bg-amber-200',
    },
    {
      title: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      bar: 'bg-emerald-200',
    },
    {
      title: 'Rejected',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      bar: 'bg-rose-200',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <Card key={index} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className={`h-1 w-full ${item.bar}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-slate-500">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-12 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{item.value}</div>
            )}
            <p className="text-xs text-slate-400 mt-1">Updated just now</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
