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
    <div className="min-h-screen flex bg-[#0a0a0a]">
      
      {/* ===================== LEFT SIDE — Lottie + Branding ===================== */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-700" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Decorative shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-black/10 rounded-full" />
        <div className="absolute top-[20%] left-[10%] w-24 h-24 border-2 border-white/10 rounded-2xl rotate-12" />
        <div className="absolute bottom-[25%] right-[15%] w-16 h-16 border-2 border-white/10 rounded-full" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          {/* Lottie Animation */}
          <div className="w-80 h-80 mb-6">
            <DotLottieReact
              src="https://lottie.host/b58ba8e5-3490-43f1-896b-a5ceeb932540/BFPUjr3ijD.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Text */}
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-3">
            Your Content,<br />Broadcast Everywhere.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            StreamPro empowers educators to deliver, moderate, and schedule content broadcasts across your institution — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['Live Broadcasting', 'Content Moderation', 'Role-Based Access', 'Scheduling'].map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-[11px] font-semibold text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom branding */}
        <div className="absolute bottom-8 left-0 w-full flex justify-center">
          <div className="flex items-center gap-2 text-white/30">
            <Radio className="h-4 w-4" />
            <span className="text-xs font-bold tracking-wider">STREAMPRO</span>
          </div>
        </div>
      </div>

      {/* ===================== RIGHT SIDE — Form ===================== */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Subtle ambient */}
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Back to home */}
        <Link 
          to="/" 
          className="absolute top-8 left-8 lg:left-auto lg:right-8 flex items-center gap-2 text-white/30 hover:text-white/60 font-medium text-sm transition-colors z-20"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>

        <div className="w-full max-w-[420px] relative z-10">

          {/* Mobile-only logo */}
          <div className="flex items-center justify-center gap-2.5 mb-10 lg:hidden">
            <div className="h-9 w-9 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">StreamPro</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">
              {activeTab === 'login' ? 'Welcome back' : 'Join as a Viewer'}
            </h1>
            <p className="text-white/30 text-sm mt-2 font-medium">
              {activeTab === 'login' 
                ? 'Sign in to access your dashboard' 
                : 'Create a free account to watch unlimited broadcasts'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.04] mb-8">
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

          {/* Viewer info */}
          {activeTab === 'signup' && (
            <div className="flex items-start gap-3 p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-xl mb-6">
              <UserPlus className="h-4 w-4 text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-teal-300/80 leading-relaxed">
                Public registration creates a <strong>Viewer</strong> account. 
                Teacher & Principal accounts are managed by your institution.
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
                    <div className="flex items-center justify-between mt-2">
                      <FormMessage className="text-rose-400 text-xs" />
                      {activeTab === 'login' && (
                        <button type="button" onClick={() => toast.info('Password reset instructions sent to your email (Demo)')} className="text-[11px] text-teal-400 hover:text-teal-300 font-medium transition-colors ml-auto">
                          Forgot password?
                        </button>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group mt-2" 
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
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[11px] text-white/20 font-medium">Test accounts</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Test Credentials */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => { form.setValue('email', 'subhajitofficial9900@gmail.com'); form.setValue('password', '00000000'); setActiveTab('login'); }}
              className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] rounded-xl transition-all group cursor-pointer text-left"
            >
              <p className="text-[10px] font-semibold text-teal-400 mb-1">Teacher</p>
              <p className="text-[10px] text-white/40 font-medium group-hover:text-white/60 transition-colors truncate" title="subhajitofficial9900@gmail.com">subhajitofficial...</p>
            </button>
            <button 
              onClick={() => { form.setValue('email', 'subhajitpathak9900@gmail.com'); form.setValue('password', '12345678'); setActiveTab('login'); }}
              className="p-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] rounded-xl transition-all group cursor-pointer text-left"
            >
              <p className="text-[10px] font-semibold text-teal-400 mb-1">Principal</p>
              <p className="text-[10px] text-white/40 font-medium group-hover:text-white/60 transition-colors truncate" title="subhajitpathak9900@gmail.com">subhajitpathak...</p>
            </button>
          </div>

          <p className="mt-8 text-center text-[11px] text-white/15 font-medium">
            © 2026 StreamPro. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
