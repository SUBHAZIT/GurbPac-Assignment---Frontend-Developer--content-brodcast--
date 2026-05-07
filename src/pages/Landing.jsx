import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Search, 
  Users, 
  Monitor, 
  CheckCircle,
  Radio,
  Tv,
  FileVideo,
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layout,
  BarChart3,
  MessageSquare,
  Lock,
  Menu,
  X,
  Twitter,
  Linkedin,
  Youtube,
  ChevronDown,
  Globe2,
  Sparkles,
  Command,
  Layers,
  Cpu,
  FileText,
  Video,
  Image as ImageIcon,
  BookOpen,
  Boxes,
  Workflow,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroFeatureCards = [
    { title: 'TINY', desc: 'ULTRA-COMPRESSED 4K STREAMS', icon: <Zap className="h-5 w-5 text-amber-500" />, bgColor: 'bg-amber-50' },
    { title: 'MODERATED', desc: 'AI-POWERED CONTENT FILTERS', icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, bgColor: 'bg-emerald-50' },
    { title: 'INTERACTIVE', desc: 'REAL-TIME ENGAGEMENT TOOLS', icon: <MessageSquare className="h-5 w-5 text-indigo-500" />, bgColor: 'bg-indigo-50' },
    { title: 'API READY', desc: 'SEAMLESS INSTITUTIONAL INTEGRATION', icon: <Cpu className="h-5 w-5 text-rose-500" />, bgColor: 'bg-rose-50' },
  ];

  const integrationLogos = [
    { Icon: Globe, label: 'GOOGLE CLASSROOM', pos: 'top-10 left-10' },
    { Icon: BookOpen, label: 'CANVAS', pos: 'top-20 right-20' },
    { Icon: Users, label: 'MICROSOFT TEAMS', pos: 'bottom-20 left-1/4' },
    { Icon: Layout, label: 'MOODLE', pos: 'top-1/3 right-10' },
    { Icon: Zap, label: 'SLACK', pos: 'bottom-10 right-1/4' },
    { Icon: Video, label: 'ZOOM', pos: 'bottom-1/3 left-10' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden uppercase">
      {/* Premium Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${isScrolled ? 'py-3 bg-white/90 backdrop-blur-md border-slate-100 shadow-sm' : 'py-5 bg-white border-transparent'}`}>
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Radio className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">STREAMPRO</span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {['PRODUCTS', 'INTEGRATIONS', 'TOOLS', 'CUSTOMERS', 'LEARN', 'PRICING'].map((item) => (
                <button key={item} className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  {item} <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center relative group">
              <Search className="absolute left-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH BROADCASTS..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold w-48 focus:w-64 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
              />
              <div className="absolute right-3 px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-black text-slate-500">⌘ K</div>
            </div>
            
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors">
              <Globe2 className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">EN</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            <Link to="/auth">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black rounded-lg px-6 py-5 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-95">
                MY DASHBOARD
              </Button>
            </Link>

            <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
               <Users className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-teal-50 border border-teal-100 shadow-sm text-xs font-black text-teal-600">
               <div className="h-5 w-5 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
               </div>
               BUILD YOUR BROADCAST STRATEGY FOR 2026. LET'S GET STARTED.
            </div>

            <h1 className="text-7xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              GREAT CONTENT <br/> COMES ALIVE <br/> WITH STREAMING!
            </h1>
            
            <p className="text-xl text-slate-500 font-bold max-w-xl leading-relaxed uppercase">
              CREATE, MANAGE AND IMPLEMENT LIGHTWEIGHT BROADCASTS ACROSS INSTITUTIONS, APPS, PRESENTATIONS, SOCIAL AND MORE.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Link to="/auth">
                <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-10 py-8 rounded-xl text-lg shadow-2xl shadow-teal-500/20 transition-all hover:-translate-y-1">
                  GO TO MY DASHBOARD
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10">
              {heroFeatureCards.map((card) => (
                <div key={card.title} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 group hover:bg-white hover:shadow-xl hover:border-teal-100 transition-all duration-300">
                  <div className={`h-10 w-10 ${card.bgColor} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                    {card.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-900 tracking-wider">{card.title}</p>
                    <p className="text-[10px] text-slate-400 font-bold leading-tight">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
             <div className="absolute inset-0 bg-teal-500/10 blur-[120px] rounded-full -z-10" />
             <div className="relative p-3 bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100">
                <img 
                  src="/Users/apple/.gemini/antigravity/brain/2bd3add8-fa13-4e8f-91be-b4d0de947299/streampro_live_preview_1778175886815.png" 
                  alt="Live Previews" 
                  className="w-full h-auto rounded-[2.5rem]"
                />
             </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto text-center space-y-12 relative z-10">
           <h2 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
             IMPLEMENT YOUR BROADCASTS <br/> IN JUST A FEW CLICKS
           </h2>
           <p className="text-xl text-slate-400 font-bold uppercase">BUILT TO INTEGRATE WITH POPULAR EDUCATIONAL AND DEVELOPER TOOLS.</p>
           <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-12 py-8 rounded-xl text-xl shadow-xl shadow-teal-500/10 transition-all hover:scale-105">
             VIEW ALL INTEGRATIONS
           </Button>
        </div>

        {/* Floating Icons Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           {integrationLogos.map((logo, i) => (
             <motion.div 
               key={i}
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
               className={`absolute ${logo.pos} flex flex-col items-center gap-2`}
             >
                <div className="h-16 w-16 bg-white rounded-2xl shadow-xl border border-slate-100 flex items-center justify-center">
                   <logo.Icon className="h-8 w-8 text-teal-500" />
                </div>
                <span className="text-[10px] font-black text-slate-900 tracking-tighter">{logo.label}</span>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Enterprise Section (Bento Grid) */}
      <section className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-[1400px] mx-auto text-center space-y-10">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-none uppercase">
            A MODERN BROADCASTING WORKFLOW <br/> BUILT FOR TEAMS AND ENTERPRISES
          </h2>
          <p className="text-xl text-slate-400 font-bold max-w-2xl mx-auto uppercase">
            SAVE COUNTLESS DESIGN AND DEVELOPMENT HOURS WITH A MODERN CONTENT BROADCASTING WORKFLOW.
          </p>
          <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-12 py-8 rounded-xl text-xl shadow-xl shadow-teal-500/10">
            VIEW ALL FEATURES
          </Button>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-20">
            <div className="lg:col-span-2 p-12 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between items-start text-left space-y-8 group hover:shadow-2xl transition-all duration-500">
               <div className="space-y-6">
                 <h3 className="text-4xl font-black text-slate-900 uppercase">SEAMLESS INSTITUTIONAL HANDOFF</h3>
                 <p className="text-lg text-slate-400 font-bold uppercase">PREVIEW, TEST, OPTIMIZE AND IMPLEMENT BROADCASTS WITH OUR BUILT-IN MODERATION PIPELINES AND STUDENT ANALYTICS.</p>
               </div>
               <div className="w-full h-80 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white/40 backdrop-blur-xl border-t border-white/50 p-8 flex items-center justify-between">
                     <div className="flex gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-12 w-12 rounded-xl bg-slate-200 animate-pulse" />)}
                     </div>
                     <div className="h-10 w-32 bg-teal-500/20 rounded-lg" />
                  </div>
               </div>
            </div>

            <div className="p-12 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between items-start text-left space-y-8 hover:shadow-2xl transition-all duration-500">
               <div className="space-y-6">
                  <h3 className="text-3xl font-black text-slate-900 uppercase">INTEGRATION</h3>
                  <p className="text-slate-400 font-bold uppercase">ACCESS YOUR PRIVATE INSTITUTIONAL WORKSPACE DIRECTLY WITHIN CANVAS, GOOGLE CLASSROOM, AND TEAMS.</p>
               </div>
               <div className="w-full h-48 bg-teal-50 rounded-3xl flex items-center justify-center">
                  <Workflow className="h-20 w-20 text-teal-500 opacity-20" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Management Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-12">
              <h2 className="text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">DIGITAL ASSET <br/> MANAGEMENT</h2>
              <p className="text-xl text-slate-400 font-bold uppercase max-w-xl">
                 PREVIEW CONTENT AND COURSE MATERIALS WITHOUT OPENING THE APP. MANAGE EVERY IMAGE FORMAT, VIDEO TYPE, AND NATIVE BROADCAST ASSET.
              </p>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-10 py-6 rounded-xl text-lg uppercase shadow-xl shadow-teal-500/20">LEARN MORE</Button>
              
              <div className="space-y-8 pt-6">
                 {[
                   { label: 'IMAGES', desc: 'PNG, GIF, SVG, JPEG, WEBP', Icon: ImageIcon },
                   { label: 'COURSE FILES', desc: 'PDF, DOCX, PPTX, KEYNOTE', Icon: FileText },
                   { label: 'BROADCASTS', desc: 'STREAM, REPLAY, DOTBROADCAST', Icon: Radio },
                   { label: 'VIDEOS', desc: 'MP4, MOV, WEBM', Icon: Video, comingSoon: true },
                 ].map((item, i) => (
                   <div key={i} className="flex items-start gap-6 group cursor-pointer">
                      <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-teal-50">
                         <item.Icon className="h-6 w-6 text-slate-400 group-hover:text-teal-500" />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{item.label}</h4>
                            {item.comingSoon && <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-400">COMING SOON</span>}
                         </div>
                         <p className="text-xs font-bold text-slate-400 uppercase">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="relative">
              <div className="absolute inset-0 bg-teal-500/5 blur-[100px] rounded-full" />
              <div className="relative bg-slate-50 rounded-[3rem] border border-slate-100 p-12 aspect-square flex items-center justify-center">
                 <div className="grid grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-32 w-32 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 transition-transform hover:scale-110">
                         <Boxes className="h-12 w-12 text-teal-500/20" />
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Dark Tool Section */}
      <section className="py-40 px-6 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#0f766e,transparent)] opacity-20" />
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-5 gap-20 items-center relative z-10">
          <div className="lg:col-span-3 space-y-12">
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
              YOUR CONTENT <br/> BROADCASTING, <br/> SIMPLIFIED
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 font-bold max-w-2xl uppercase">
              SAVE COUNTLESS HOURS AND STREAMLINE YOUR BROADCAST WORKFLOW WITH STREAMPRO CREATOR, OR DESIGN RIGHT WITHIN YOUR FAVORITE TOOLS. WE MAKE BROADCASTING EASY.
            </p>

            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-black flex items-center gap-3 hover:bg-teal-50 transition-colors uppercase">
                <Command className="h-5 w-5" />
                STREAMPRO CREATOR
              </button>
              <button className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-black flex items-center gap-3 hover:text-white hover:bg-slate-800 transition-all uppercase">
                <Layers className="h-5 w-5" />
                STREAMPRO FOR TEAMS
              </button>
            </div>

            <div className="pt-20 space-y-10">
               <h3 className="text-4xl font-black uppercase">STREAMPRO CREATOR</h3>
               <p className="text-xl text-slate-400 font-bold max-w-xl uppercase">
                 DESIGNED TO CREATE ULTRA-LIGHTWEIGHT, HIGHLY CUSTOMIZABLE AND INTERACTIVE BROADCASTS FOR WEB, APPS AND SOCIAL. SUPERPOWERED WITH AI-BASED TOOLS.
               </p>
               <Button className="bg-white text-slate-900 hover:bg-teal-50 font-black px-10 py-6 rounded-xl text-lg uppercase">
                  START CREATING
               </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative p-4 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl"
            >
               <img 
                 src="/Users/apple/.gemini/antigravity/brain/2bd3add8-fa13-4e8f-91be-b4d0de947299/streampro_dashboard_mockup_1778175845330.png" 
                 alt="Dashboard Mockup" 
                 className="w-full h-auto rounded-[2rem]"
               />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
         <div className="max-w-[1200px] mx-auto bg-slate-50 rounded-[4rem] p-24 text-left relative overflow-hidden group">
            {/* Decorative Teal Shapes */}
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-teal-400/20 blur-[80px] rounded-full translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-10 right-20 flex gap-4 opacity-40 group-hover:translate-y-[-20px] transition-transform duration-700">
               {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className={`h-32 w-20 bg-teal-500 rounded-full ${i % 2 === 0 ? 'mt-10' : ''}`} />
               ))}
            </div>

            <div className="relative z-10 space-y-10 max-w-2xl">
               <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-none">CREATE, <br/> COLLABORATE <br/> AND BROADCAST.</h2>
               <p className="text-2xl text-slate-400 font-bold uppercase">EFFORTLESSLY BRING QUALITY BROADCASTING TO YOUR INSTITUTION.</p>
               <div className="flex flex-col sm:flex-row items-center gap-6">
                 <Link to="/auth">
                   <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-12 py-8 rounded-2xl text-2xl shadow-2xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 uppercase">
                     GO TO MY DASHBOARD
                   </Button>
                 </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
            <div className="lg:col-span-2 space-y-10">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-10 w-10 bg-teal-500 rounded-xl flex items-center justify-center">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">STREAMPRO</span>
              </Link>
              <p className="text-slate-400 font-bold max-w-sm text-lg leading-relaxed uppercase">
                THE HIGH-PERFORMANCE INFRASTRUCTURE FOR INSTITUTIONAL BROADCASTING. EMPOWERING EDUCATORS, MODERATED BY LEADERS.
              </p>
              <div className="flex gap-4">
                 {[Twitter, Linkedin, Youtube].map((Icon, i) => (
                   <div key={i} className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-teal-50 transition-colors cursor-pointer group">
                      <Icon className="h-6 w-6 text-slate-400 group-hover:text-teal-600" />
                   </div>
                 ))}
              </div>
            </div>

            {['PRODUCT', 'RESOURCES', 'COMPANY'].map((title) => (
              <div key={title} className="space-y-8">
                <h4 className="font-black text-slate-900 text-sm tracking-widest uppercase">{title}</h4>
                <ul className="space-y-4 text-slate-400 font-bold text-sm">
                  {['FEATURES', 'SECURITY', 'API', 'GUIDES', 'CAREERS', 'LEGAL'].slice(0, 4).map(item => (
                    <li key={item} className="hover:text-teal-600 cursor-pointer transition-colors uppercase">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-24 pt-12 border-t border-slate-100 flex justify-between items-center">
             <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase uppercase">© 2026 STREAMPRO INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[200] bg-white p-8 md:hidden"
          >
             <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-black text-slate-900">STREAMPRO</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
             </div>
             <div className="flex flex-col gap-8">
                {['PRODUCTS', 'INTEGRATIONS', 'TOOLS', 'PRICING'].map((item) => (
                  <button key={item} className="text-3xl font-black text-slate-900 text-left">
                    {item}
                  </button>
                ))}
                <hr className="border-slate-100" />
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                   <Button className="w-full bg-teal-500 py-8 rounded-2xl text-xl font-black shadow-xl shadow-teal-500/20">GET STARTED</Button>
                </Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
