import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, User, Mail, Shield, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const role = user?.profile?.role;

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.profile?.full_name || '',
      avatar_url: user?.profile?.avatar_url || '',
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user?.profile) {
      form.reset({
        full_name: user.profile.full_name || '',
        avatar_url: user.profile.avatar_url || '',
      });
    }
  }, [user, form]);

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      await authService.updateProfile(user.id, {
        full_name: values.full_name,
        avatar_url: values.avatar_url || null,
      });
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  }

  const getRoleBadge = () => {
    switch (role) {
      case 'principal':
        return <Badge className="bg-slate-900 text-white">Principal</Badge>;
      case 'teacher':
        return <Badge className="bg-teal-500 text-white">Teacher</Badge>;
      default:
        return <Badge className="bg-blue-500 text-white">Viewer</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your personal information.</p>
        </div>

        <div className="space-y-6">
          {/* Profile Overview Card */}
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-teal-500 to-emerald-500" />
            <CardContent className="relative pt-0">
              <div className="-mt-12 flex items-end gap-4 mb-6">
                <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-teal-600">
                  {user?.profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-900">{user?.profile?.full_name || 'User'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge()}
                    <span className="text-xs text-slate-400">
                      Joined {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Role</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">{role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form Card */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Edit Profile</CardTitle>
              <CardDescription>Update your display name and avatar.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" /> Display Name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/avatar.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <Button 
                      type="submit" 
                      className="bg-teal-500 hover:bg-teal-600 gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
              <CardDescription>These details are managed by your institution and cannot be changed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Email Address</span>
                <span className="text-sm font-medium text-slate-900">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Account Role</span>
                <span className="text-sm font-medium text-slate-900 capitalize">{role}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-600">Account ID</span>
                <span className="text-xs font-mono text-slate-400">{user?.id?.slice(0, 8)}...{user?.id?.slice(-4)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
