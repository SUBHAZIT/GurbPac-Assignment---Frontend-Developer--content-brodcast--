import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Radio, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const authSchema = z.object({
  email: z.string().email('INVALID EMAIL FORMAT'),
  password: z.string().min(6, 'PASSWORD MUST BE AT LEAST 6 CHARACTERS'),
  role: z.enum(['teacher', 'principal']).optional(),
  fullName: z.string().min(2, 'NAME IS TOO SHORT').optional(),
});

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        setShowSuccess(true);
        toast.success('Logged in successfully!');
      } else {
        await authService.signup(values.email, values.password, values.role, values.fullName);
        setShowSuccess(true);
        toast.success('Account created! Please check your email to verify (if enabled) or try logging in.');
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
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center space-y-8">
          <div className="w-64 h-64 mx-auto">
            <DotLottieReact
              src="https://lottie.host/e8359154-8e53-47c8-b84d-f24f8c3d4f60/dvEC3AlDW7.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">
              {activeTab === 'login' ? 'WELCOME BACK!' : 'ACCOUNT CREATED!'}
            </h2>
            <p className="text-slate-400 font-bold uppercase text-sm tracking-wider">
              {activeTab === 'login'
                ? 'REDIRECTING TO YOUR DASHBOARD...'
                : 'YOUR ACCOUNT HAS BEEN SET UP SUCCESSFULLY.'}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full animate-[loading_2s_ease-in-out_infinite]"
                style={{ animation: 'loading 2s ease-in-out infinite', width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex uppercase">
      {/* Left Panel — Creative Colored Side */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600">
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Large circle */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/10 blur-sm" />
          {/* Small circle */}
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-black/10" />
          {/* Diagonal stripe */}
          <div className="absolute top-1/4 -right-20 w-[600px] h-24 bg-white/5 rotate-[-30deg]" />
          <div className="absolute top-1/3 -right-10 w-[500px] h-16 bg-white/5 rotate-[-30deg]" />
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          {/* Grain texture */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        </div>

        {/* Lottie */}
        <div className="relative z-10 w-[85%] max-w-[600px]">
          <DotLottieReact
            src="https://lottie.host/b58ba8e5-3490-43f1-896b-a5ceeb932540/BFPUjr3ijD.lottie"
            loop
            autoplay
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {/* Bottom branding text */}
        <div className="absolute bottom-12 left-12 right-12 space-y-4 z-10">
          <h2 className="text-5xl font-black text-white tracking-tighter leading-none drop-shadow-lg">
            BROADCAST<br />WITHOUT<br />LIMITS.
          </h2>
          <p className="text-white/60 font-bold text-sm tracking-wider max-w-sm">
            STREAMPRO GIVES YOU THE TOOLS TO CREATE, MANAGE AND DELIVER BROADCASTS AT SCALE.
          </p>
        </div>

        {/* Right edge fade into black */}
        <div className="absolute top-0 right-0 w-px h-full bg-black/20" />
      </div>

      {/* Right Panel — Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-400 font-bold text-xs tracking-widest mb-12 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          BACK TO HOME
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 bg-teal-500 rounded-xl flex items-center justify-center">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">STREAMPRO</span>
        </div>

        {/* Header */}
        <div className="space-y-3 mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            {activeTab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </h1>
          <p className="text-slate-500 font-bold text-sm tracking-wider">
            {activeTab === 'login'
              ? 'ENTER YOUR CREDENTIALS TO ACCESS YOUR DASHBOARD'
              : 'JOIN STREAMPRO TO START BROADCASTING CONTENT'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-8 w-fit border border-white/5">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-6 py-3 rounded-lg text-xs font-black tracking-wider transition-all ${activeTab === 'login'
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-500 hover:text-white'
              }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`px-6 py-3 rounded-lg text-xs font-black tracking-wider transition-all ${activeTab === 'signup'
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-500 hover:text-white'
              }`}
          >
            REGISTER
          </button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {activeTab === 'signup' && (
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-400 font-black text-[11px] tracking-widest">FULL NAME</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="JOHN DOE"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl py-6 px-4 font-bold focus:border-teal-500/50 focus:ring-teal-500/20 transition-all uppercase"
                      />
                    </FormControl>
                    <FormMessage className="text-rose-400 text-[10px] font-black" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400 font-black text-[11px] tracking-widest">EMAIL ADDRESS</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="NAME@EXAMPLE.COM"
                      {...field}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl py-6 px-4 font-bold focus:border-teal-500/50 focus:ring-teal-500/20 transition-all"
                    />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-[10px] font-black" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-400 font-black text-[11px] tracking-widest">PASSWORD</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 rounded-xl py-6 px-4 pr-12 font-bold focus:border-teal-500/50 focus:ring-teal-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-400 text-[10px] font-black" />
                </FormItem>
              )}
            />

            {activeTab === 'signup' && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-400 font-black text-[11px] tracking-widest">ACCOUNT TYPE</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl py-6 px-4 font-bold focus:border-teal-500/50 focus:ring-teal-500/20 uppercase">
                          <SelectValue placeholder="SELECT A ROLE" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="teacher" className="font-bold uppercase">TEACHER</SelectItem>
                        <SelectItem value="principal" className="font-bold uppercase">PRINCIPAL</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-rose-400 text-[10px] font-black" />
                  </FormItem>
                )}
              />
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-7 rounded-xl text-sm tracking-wider shadow-2xl shadow-teal-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {activeTab === 'login' ? 'SIGN IN TO DASHBOARD' : 'CREATE MY ACCOUNT'}
              </Button>
            </div>
          </form>
        </Form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] font-black text-slate-600 tracking-widest">DEMO CREDENTIALS</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Demo Credentials */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 space-y-2">
            <p className="text-[10px] font-black text-teal-500 tracking-widest">TEACHER</p>
            <p className="text-xs font-bold text-slate-400">TEACHER@DEMO.COM</p>
            <p className="text-xs font-bold text-slate-500">DEMO123</p>
          </div>
          <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 space-y-2">
            <p className="text-[10px] font-black text-teal-500 tracking-widest">PRINCIPAL</p>
            <p className="text-xs font-bold text-slate-400">PRINCIPAL@DEMO.COM</p>
            <p className="text-xs font-bold text-slate-500">DEMO123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-10 text-[10px] font-black text-slate-600 tracking-widest text-center">
          © 2026 STREAMPRO INFRASTRUCTURE. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
}
