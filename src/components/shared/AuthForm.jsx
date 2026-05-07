import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const authSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['teacher', 'principal']).optional(),
  fullName: z.string().min(2, 'Name is too short').optional(),
});

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  const form = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'teacher',
      fullName: '',
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await login(values.email, values.password);
        toast.success('Logged in successfully!');
      } else {
        await authService.signup(values.email, values.password, values.role, values.fullName);
        toast.success('Account created! Please check your email to verify (if enabled) or try logging in.');
        setActiveTab('login');
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
      
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-200 mb-4 animate-in fade-in zoom-in duration-700">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">EduStream</h1>
          <p className="text-slate-500 mt-2 font-medium">Content Broadcasting System</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-slate-200/50">
            <TabsTrigger value="login" className="rounded-md font-semibold">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-md font-semibold">Register</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white pb-2">
                  <CardTitle className="text-xl font-bold">
                    {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'login' 
                      ? 'Enter your credentials to access your dashboard' 
                      : 'Join EduStream to start broadcasting content'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {activeTab === 'signup' && (
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-slate-50 border-slate-200 focus:bg-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} className="bg-slate-50 border-slate-200 focus:bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="bg-slate-50 border-slate-200 focus:bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {activeTab === 'signup' && (
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-50 border-slate-200 focus:bg-white">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="principal">Principal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t border-slate-100 pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </Tabs>
        
        <p className="mt-8 text-center text-sm text-slate-400">
          Demo Credentials:<br/>
          <span className="font-medium text-slate-500">teacher@demo.com</span> / <span className="font-medium text-slate-500">demo123</span><br/>
          <span className="font-medium text-slate-500">principal@demo.com</span> / <span className="font-medium text-slate-500">demo123</span>
        </p>
      </div>
    </div>
  );
}
