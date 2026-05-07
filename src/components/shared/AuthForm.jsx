import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Radio, Loader2, ArrowLeft, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name is too short'),
});

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('login');

  const form = useForm({
    resolver: zodResolver(activeTab === 'login' ? loginSchema : signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        await login(values.email, values.password);
        setShowSuccess(true);
        toast.success('Logged in successfully!');
      } else {
        // Public signup always creates a 'viewer' account
        await authService.signup(values.email, values.password, 'viewer', values.fullName);
        setShowSuccess(true);
        toast.success('Account created! You can now watch broadcasts.');
        setTimeout(() => {
          setShowSuccess(false);
          setActiveTab('login');
        }, 3000);
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  // Success overlay
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[150px]" />
        </div>
        <div className="text-center space-y-8 relative z-10">
          <div className="w-56 h-56 mx-auto">
            <DotLottieReact
              src="https://lottie.host/e8359154-8e53-47c8-b84d-f24f8c3d4f60/dvEC3AlDW7.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">
              {activeTab === 'login' ? 'Welcome Back!' : 'Account Created!'}
            </h2>
            <p className="text-white/40 font-medium text-sm">
              {activeTab === 'login' 
                ? 'Redirecting to your dashboard...' 
                : 'Your viewer account has been set up successfully.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-emerald-500/8 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px'
          }} 
        />
        <div className="absolute top-20 left-[15%] w-20 h-20 border border-white/5 rounded-2xl rotate-12 animate-pulse" />
        <div className="absolute bottom-32 right-[20%] w-16 h-16 border border-teal-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[30%] right-[10%] w-12 h-12 bg-teal-500/5 rounded-xl rotate-45" />
        <div className="absolute bottom-[20%] left-[10%] w-24 h-24 border border-white/[0.03] rounded-3xl -rotate-12" />
      </div>

      {/* Back to home */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-white/30 hover:text-white/60 font-medium text-sm transition-colors z-20"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-[460px] relative z-10">
        
        {/* Lottie above the card */}
        <div className="w-48 h-48 mx-auto -mb-4 relative z-20">
          <DotLottieReact
            src="https://lottie.host/b58ba8e5-3490-43f1-896b-a5ceeb932540/BFPUjr3ijD.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Glass Card */}
        <div className="relative">
          <div className="absolute -inset-px bg-gradient-to-b from-white/[0.08] to-transparent rounded-[28px] pointer-events-none" />
          
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-[28px] p-8 sm:p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Logo + Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <div className="h-9 w-9 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Radio className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">StreamPro</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === 'login' ? 'Welcome back' : 'Join as a Viewer'}
                </h1>
                <p className="text-white/30 text-sm mt-1.5 font-medium">
                  {activeTab === 'login' 
                    ? 'Sign in to access your dashboard' 
                    : 'Create a free account to watch unlimited broadcasts'}
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.04]">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'signup'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Viewer Signup
              </button>
            </div>

            {/* Info banner for signup */}
            {activeTab === 'signup' && (
              <div className="flex items-start gap-3 p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                <UserPlus className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-teal-300/80 leading-relaxed">
                  Public registration creates a <strong>Viewer</strong> account for watching broadcasts. 
                  Teacher and Principal accounts are managed by your institution.
                </p>
              </div>
            )}

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {activeTab === 'signup' && (
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Full name" 
                            {...field} 
                            className="h-12 bg-white/[0.05] border-white/[0.06] text-white placeholder:text-white/20 rounded-xl px-4 font-medium focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all" 
                          />
                        </FormControl>
                        <FormMessage className="text-rose-400 text-xs" />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Email address" 
                          {...field} 
                          className="h-12 bg-white/[0.05] border-white/[0.06] text-white placeholder:text-white/20 rounded-xl px-4 font-medium focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all" 
                        />
                      </FormControl>
                      <FormMessage className="text-rose-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? 'text' : 'password'} 
                            placeholder="Password" 
                            {...field} 
                            className="h-12 bg-white/[0.05] border-white/[0.06] text-white placeholder:text-white/20 rounded-xl px-4 pr-11 font-medium focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 transition-all" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-400 text-xs" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-white hover:bg-white/90 text-black font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-white/5 active:scale-[0.98] flex items-center justify-center gap-2 group" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {activeTab === 'login' ? 'Sign In' : 'Create Viewer Account'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] text-white/20 font-medium">Demo accounts</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Demo Credentials */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => { form.setValue('email', 'teacher@demo.com'); form.setValue('password', 'demo123'); setActiveTab('login'); }}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] rounded-xl transition-all group cursor-pointer text-left"
              >
                <p className="text-[10px] font-semibold text-teal-400 mb-1">Teacher</p>
                <p className="text-[10px] text-white/40 font-medium group-hover:text-white/60 transition-colors truncate">teacher@demo</p>
              </button>
              <button 
                onClick={() => { form.setValue('email', 'principal@demo.com'); form.setValue('password', 'demo123'); setActiveTab('login'); }}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] rounded-xl transition-all group cursor-pointer text-left"
              >
                <p className="text-[10px] font-semibold text-teal-400 mb-1">Principal</p>
                <p className="text-[10px] text-white/40 font-medium group-hover:text-white/60 transition-colors truncate">principal@demo</p>
              </button>
              <button 
                onClick={() => { form.setValue('email', 'viewer@demo.com'); form.setValue('password', 'demo123'); setActiveTab('login'); }}
                className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] rounded-xl transition-all group cursor-pointer text-left"
              >
                <p className="text-[10px] font-semibold text-teal-400 mb-1">Viewer</p>
                <p className="text-[10px] text-white/40 font-medium group-hover:text-white/60 transition-colors truncate">viewer@demo</p>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-white/15 font-medium">
          © 2026 StreamPro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
