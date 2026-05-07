import { useState, useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
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
  LogOut,
  User,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MarqueeRow = ({ items, direction = 'left', speed = 60 }) => {
  const animationStyle = {
    '--marquee-duration': `${speed}s`,
  };

  return (
    <div className="flex overflow-hidden py-3" style={animationStyle}>
      <div 
        className={`flex gap-5 min-w-max px-2.5 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="w-[420px] flex-shrink-0">
            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between gap-6 h-full whitespace-normal hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.1)] hover:border-teal-100 transition-all duration-500">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                     <div className="h-11 w-11 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 p-[2px] overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${item.name}`} alt={item.name} className="w-full h-full object-cover rounded-full" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{item.role}</p>
                     </div>
                  </div>
                  <div className="h-9 w-9 flex-shrink-0 opacity-80">
                      <DotLottieReact
                        src="https://lottie.host/19e88a63-230c-4b19-bcfe-c463ce75e49c/CrjSHj7WFa.lottie"
                        loop
                        autoplay
                        style={{ width: '100%', height: '100%' }}
                      />
                  </div>
               </div>
               <p className="text-base font-semibold text-slate-600 leading-relaxed">"{item.quote}"</p>
               <div className="flex items-center gap-3">
                  <div className="h-1 w-6 rounded-full bg-teal-400" />
                  <span className="text-[10px] font-black tracking-widest text-slate-300">{item.institution}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    setActiveDropdown(null);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navDropdowns = {
    PRODUCTS: [
      { label: 'STREAMPRO CREATOR', desc: 'CREATE ULTRA-LIGHTWEIGHT BROADCASTS', action: () => scrollToSection('tools-section') },
      { label: 'STREAMPRO FOR TEAMS', desc: 'COLLABORATE WITH YOUR INSTITUTION', action: () => scrollToSection('tools-section') },
      { label: 'DIGITAL ASSETS', desc: 'MANAGE ALL YOUR BROADCAST MEDIA', action: () => scrollToSection('assets-section') },
    ],
    INTEGRATIONS: [
      { label: 'GOOGLE CLASSROOM', desc: 'SEAMLESS LMS INTEGRATION', action: () => scrollToSection('integrations-section') },
      { label: 'CANVAS', desc: 'CONNECT YOUR EXISTING COURSES', action: () => scrollToSection('integrations-section') },
      { label: 'MICROSOFT TEAMS', desc: 'BROADCAST DIRECTLY IN TEAMS', action: () => scrollToSection('integrations-section') },
      { label: 'VIEW ALL', desc: 'EXPLORE 20+ INTEGRATIONS', action: () => scrollToSection('integrations-section') },
    ],
    TOOLS: [
      { label: 'AI MODERATION', desc: 'AUTOMATED CONTENT FILTERING', action: () => scrollToSection('enterprise-section') },
      { label: 'ANALYTICS', desc: 'REAL-TIME ENGAGEMENT DATA', action: () => scrollToSection('enterprise-section') },
      { label: 'API ACCESS', desc: 'BUILD CUSTOM WORKFLOWS', action: () => scrollToSection('enterprise-section') },
    ],
    CUSTOMERS: [
      { label: 'TESTIMONIALS', desc: 'HEAR FROM OUR USERS', action: () => scrollToSection('testimonials-section') },
      { label: 'CASE STUDIES', desc: 'SEE HOW INSTITUTIONS USE STREAMPRO', action: () => scrollToSection('testimonials-section') },
    ],
    LEARN: [
      { label: 'DOCUMENTATION', desc: 'GUIDES AND API REFERENCE', action: () => {} },
      { label: 'BLOG', desc: 'LATEST NEWS AND UPDATES', action: () => {} },
      { label: 'WEBINARS', desc: 'LIVE TRAINING SESSIONS', action: () => {} },
    ],
    PRICING: [
      { label: 'FREE TIER', desc: 'GET STARTED AT NO COST', action: () => {} },
      { label: 'PRO PLAN', desc: 'FOR GROWING INSTITUTIONS', action: () => {} },
      { label: 'ENTERPRISE', desc: 'CUSTOM SOLUTIONS AT SCALE', action: () => {} },
    ],
  };

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

  const marqueeRow1 = [
    { name: 'PROF. ELENA ROSSI', role: 'HEAD OF DIGITAL LEARNING', quote: 'STREAMPRO HAS REVOLUTIONIZED HOW WE DELIVER GLOBAL SEMINARS. THE QUALITY IS UNMATCHED.', institution: 'UNIVERSITY OF BOLOGNA' },
    { name: 'DR. MARCUS CHEN', role: 'DIRECTOR OF STEM', quote: 'THE LATENCY IS ALMOST ZERO. STUDENTS ENGAGE AS IF THEY ARE IN THE ROOM.', institution: 'SINGAPORE POLYTECHNIC' },
    { name: 'AMARA OKAFOR', role: 'VP OF ENGINEERING', quote: 'WE MIGRATED 200+ COURSES IN A WEEKEND. THE API IS BEAUTIFULLY DESIGNED.', institution: 'LAGOS BUSINESS SCHOOL' },
    { name: 'DR. HANNAH BERG', role: 'DEAN OF SCIENCES', quote: 'OUR STUDENT ENGAGEMENT SCORES JUMPED 40% AFTER SWITCHING TO STREAMPRO.', institution: 'ETH ZÜRICH' },
    { name: 'TOMOKO YAMAZAKI', role: 'EDTECH LEAD', quote: 'THE AI MODERATION ALONE SAVES OUR TEAM 15 HOURS PER WEEK. GAME CHANGER.', institution: 'WASEDA UNIVERSITY' },
  ];

  const marqueeRow2 = [
    { name: 'SARAH JENKINS', role: 'PRINCIPAL', quote: 'MODERATION TOOLS GIVE US THE CONFIDENCE TO BROADCAST TO THOUSANDS SAFELY.', institution: 'OAKWOOD ACADEMY' },
    { name: 'JAMES WILSON', role: 'IT COORDINATOR', quote: 'THE INTEGRATION WITH CANVAS WAS SEAMLESS. IT JUST WORKS PERFECTLY.', institution: 'UCL' },
    { name: 'DR. PRIYA SHARMA', role: 'CHIEF ACADEMIC OFFICER', quote: 'STREAMPRO IS THE BACKBONE OF OUR HYBRID LEARNING STRATEGY. TRULY INDISPENSABLE.', institution: 'IIT DELHI' },
    { name: 'LUCAS ANDERSEN', role: 'PRODUCT MANAGER', quote: 'WE EVALUATED EVERY PLATFORM. STREAMPRO WON ON PERFORMANCE, SECURITY, AND UX.', institution: 'COURSERA' },
    { name: 'MARIE DUPONT', role: 'DIRECTOR OF INNOVATION', quote: 'THE REAL-TIME ANALYTICS DASHBOARD CHANGED HOW WE UNDERSTAND STUDENT BEHAVIOR.', institution: 'SCIENCES PO' },
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

            <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {Object.keys(navDropdowns).map((item) => (
                <div key={item} className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === item ? null : item)}
                    className={`flex items-center gap-1 text-sm font-bold px-3 py-2 rounded-lg transition-colors ${
                      activeDropdown === item ? 'text-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item} <ChevronDown className={`h-3 w-3 transition-transform ${activeDropdown === item ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === item && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 z-50"
                      >
                        {navDropdowns[item].map((subItem, idx) => (
                          <button
                            key={idx}
                            onClick={() => { subItem.action(); setActiveDropdown(null); }}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group flex flex-col gap-0.5"
                          >
                            <span className="text-xs font-black text-slate-900 group-hover:text-teal-600 transition-colors">{subItem.label}</span>
                            <span className="text-[10px] font-bold text-slate-400">{subItem.desc}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={user.profile?.role === 'principal' ? '/principal/dashboard' : '/teacher/dashboard'}>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black rounded-lg px-6 py-5 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-95">
                    MY DASHBOARD
                  </Button>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="h-10 w-10 rounded-full bg-teal-500 border-2 border-teal-400 shadow-sm overflow-hidden flex items-center justify-center text-white font-black text-sm hover:scale-105 transition-transform"
                  >
                    {user.profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 mb-1">
                          <p className="text-xs font-black text-slate-900 truncate">{user.profile?.full_name || 'USER'}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-600 text-[9px] font-black rounded-md tracking-wider">
                            {user.profile?.role?.toUpperCase() || 'MEMBER'}
                          </span>
                        </div>
                        <Link
                          to={user.profile?.role === 'principal' ? '/principal/dashboard' : '/teacher/dashboard'}
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 text-xs font-black text-slate-700"
                        >
                          <User className="h-4 w-4 text-slate-400" /> MY PROFILE
                        </Link>
                        <button
                          onClick={() => { setShowProfileMenu(false); logout(); }}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-3 text-xs font-black text-rose-500"
                        >
                          <LogOut className="h-4 w-4" /> SIGN OUT
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/live/all">
                  <button className="hidden sm:flex items-center gap-2 text-sm font-black text-slate-600 hover:text-teal-600 px-4 py-2 transition-colors">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    WATCH LIVE
                  </button>
                </Link>
                <Link to="/auth">
                  <button className="hidden sm:block text-sm font-black text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">
                    SIGN IN
                  </button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black rounded-lg px-6 py-5 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-95">
                    GET STARTED
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 md:pt-48 pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-100 shadow-sm text-[10px] md:text-xs font-black text-teal-600">
               <div className="h-4 w-4 md:h-5 md:w-5 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
               </div>
               <span className="hidden sm:inline">BUILD YOUR BROADCAST STRATEGY FOR 2026. LET'S GET STARTED.</span>
               <span className="sm:hidden">GET STARTED WITH STREAMING</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              GREAT CONTENT <br/> COMES ALIVE <br/> WITH STREAMING!
            </h1>
            
            <p className="text-sm sm:text-base md:text-xl text-slate-500 font-bold max-w-xl leading-relaxed uppercase">
              CREATE, MANAGE AND IMPLEMENT LIGHTWEIGHT BROADCASTS ACROSS INSTITUTIONS, APPS, PRESENTATIONS, SOCIAL AND MORE.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white font-black px-8 md:px-10 py-6 md:py-8 rounded-xl text-base md:text-lg shadow-2xl shadow-teal-500/20 transition-all hover:-translate-y-1">
                  GO TO MY DASHBOARD
                </Button>
              </Link>
              <Link to="/live/all" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-2 border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-600 font-black px-6 md:px-8 py-6 md:py-8 rounded-xl text-base md:text-lg transition-all hover:-translate-y-1 gap-2 group">
                  <Play className="h-4 w-4 md:h-5 md:w-5 text-teal-500 group-hover:scale-110 transition-transform" />
                  WATCH LIVE
                  <span className="text-[9px] md:text-[10px] bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full font-black border border-teal-100">10 FREE</span>
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
             <div className="relative">
                <DotLottieReact
                  src="https://lottie.host/382b89c4-c988-452a-8a19-f99eb8b27484/QM0zbg6zOt.lottie"
                  loop
                  autoplay
                  style={{ width: '100%', height: 'auto' }}
                />
             </div>
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations-section" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto text-center space-y-12 relative z-10">
           <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
             IMPLEMENT YOUR BROADCASTS <br className="hidden md:block"/> IN JUST A FEW CLICKS
           </h2>
           <p className="text-sm md:text-xl text-slate-400 font-bold uppercase">BUILT TO INTEGRATE WITH POPULAR EDUCATIONAL AND DEVELOPER TOOLS.</p>
           <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-8 py-6 md:px-12 md:py-8 rounded-xl text-base md:text-xl w-full md:w-auto shadow-xl shadow-teal-500/10 transition-all hover:scale-105">
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
      <section id="enterprise-section" className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-[1400px] mx-auto text-center space-y-10">
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-none uppercase">
            A MODERN BROADCASTING WORKFLOW <br className="hidden md:block"/> BUILT FOR TEAMS AND ENTERPRISES
          </h2>
          <p className="text-sm md:text-xl text-slate-400 font-bold max-w-2xl mx-auto uppercase">
            SAVE COUNTLESS DESIGN AND DEVELOPMENT HOURS WITH A MODERN CONTENT BROADCASTING WORKFLOW.
          </p>
          <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-8 py-6 md:px-12 md:py-8 rounded-xl text-base md:text-xl w-full md:w-auto shadow-xl shadow-teal-500/10">
            VIEW ALL FEATURES
          </Button>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-10 md:pt-20">
            <div className="lg:col-span-2 p-6 md:p-12 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between items-start text-left space-y-8 group hover:shadow-2xl transition-all duration-500">
               <div className="space-y-4 md:space-y-6">
                 <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase">SEAMLESS INSTITUTIONAL HANDOFF</h3>
                 <p className="text-sm md:text-lg text-slate-400 font-bold uppercase">PREVIEW, TEST, OPTIMIZE AND IMPLEMENT BROADCASTS WITH OUR BUILT-IN MODERATION PIPELINES AND STUDENT ANALYTICS.</p>
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

            <div className="p-6 md:p-12 bg-white rounded-3xl md:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between items-start text-left space-y-8 hover:shadow-2xl transition-all duration-500">
               <div className="space-y-4 md:space-y-6">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase">INTEGRATION</h3>
                  <p className="text-sm md:text-base text-slate-400 font-bold uppercase">ACCESS YOUR PRIVATE INSTITUTIONAL WORKSPACE DIRECTLY WITHIN CANVAS, GOOGLE CLASSROOM, AND TEAMS.</p>
               </div>
               <div className="w-full h-48 bg-teal-50 rounded-3xl flex items-center justify-center">
                  <Workflow className="h-20 w-20 text-teal-500 opacity-20" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Section */}
      <section id="testimonials-section" className="py-28 bg-gradient-to-b from-slate-50/50 to-white overflow-hidden">
         <div className="max-w-[1400px] mx-auto px-6 mb-20 text-center space-y-5">
            <p className="text-sm font-black text-teal-500 tracking-widest">TESTIMONIALS</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              LOVED BY EDUCATORS. <br className="hidden md:block"/> TRUSTED BY INSTITUTIONS.
            </h2>
            <p className="text-sm md:text-lg text-slate-400 font-bold max-w-xl mx-auto">HEAR FROM THE TEAMS AND EDUCATORS WHO RELY ON STREAMPRO EVERY DAY.</p>
         </div>
         <div className="space-y-5">
            <MarqueeRow items={marqueeRow1} direction="left" speed={55} />
            <MarqueeRow items={marqueeRow2} direction="right" speed={65} />
         </div>
      </section>

      {/* Asset Management Section */}
      <section id="assets-section" className="py-32 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-12">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">DIGITAL ASSET <br className="hidden md:block"/> MANAGEMENT</h2>
              <p className="text-sm md:text-xl text-slate-400 font-bold uppercase max-w-xl">
                 PREVIEW CONTENT AND COURSE MATERIALS WITHOUT OPENING THE APP. MANAGE EVERY IMAGE FORMAT, VIDEO TYPE, AND NATIVE BROADCAST ASSET.
              </p>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-10 py-6 rounded-xl text-base md:text-lg uppercase shadow-xl shadow-teal-500/20 w-full sm:w-auto">LEARN MORE</Button>
              
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
      <section id="tools-section" className="py-40 px-6 bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#0f766e,transparent)] opacity-20" />
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-5 gap-20 items-center relative z-10">
          <div className="lg:col-span-3 space-y-12">
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
              YOUR CONTENT <br className="hidden md:block"/> BROADCASTING, <br className="hidden md:block"/> SIMPLIFIED
            </h2>
            <p className="text-sm md:text-xl lg:text-2xl text-slate-400 font-bold max-w-2xl uppercase">
              SAVE COUNTLESS HOURS AND STREAMLINE YOUR BROADCAST WORKFLOW WITH STREAMPRO CREATOR, OR DESIGN RIGHT WITHIN YOUR FAVORITE TOOLS. WE MAKE BROADCASTING EASY.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <button className="px-6 py-4 md:px-8 bg-white text-slate-900 rounded-xl font-black flex items-center justify-center gap-3 hover:bg-teal-50 transition-colors uppercase w-full sm:w-auto text-sm md:text-base">
                <Command className="h-5 w-5" />
                STREAMPRO CREATOR
              </button>
              <button className="px-6 py-4 md:px-8 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-black flex items-center justify-center gap-3 hover:text-white hover:bg-slate-800 transition-all uppercase w-full sm:w-auto text-sm md:text-base">
                <Layers className="h-5 w-5" />
                STREAMPRO FOR TEAMS
              </button>
            </div>

            <div className="pt-20 space-y-10">
               <h3 className="text-2xl md:text-4xl font-black uppercase">STREAMPRO CREATOR</h3>
               <p className="text-sm md:text-xl text-slate-400 font-bold max-w-xl uppercase">
                 DESIGNED TO CREATE ULTRA-LIGHTWEIGHT, HIGHLY CUSTOMIZABLE AND INTERACTIVE BROADCASTS FOR WEB, APPS AND SOCIAL. SUPERPOWERED WITH AI-BASED TOOLS.
               </p>
               <Button className="bg-white text-slate-900 hover:bg-teal-50 font-black px-10 py-6 rounded-xl text-base md:text-lg uppercase w-full sm:w-auto">
                  START CREATING
               </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative scale-125 origin-center"
            >
               <DotLottieReact
                 src="https://lottie.host/14e2e7b3-b8b8-4ad9-9f21-ddd8e9532bed/14NyUy0w20.lottie"
                 loop
                 autoplay
                 style={{ width: '100%', height: 'auto' }}
               />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-40 px-6 relative overflow-hidden">
         <div className="max-w-[1200px] mx-auto bg-slate-50 rounded-3xl md:rounded-[4rem] p-8 md:p-24 text-left relative overflow-hidden group">
            {/* Decorative Teal Shapes */}
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-teal-400/20 blur-[80px] rounded-full translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-10 right-20 flex gap-4 opacity-40 group-hover:translate-y-[-20px] transition-transform duration-700">
               {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className={`h-32 w-20 bg-teal-500 rounded-full ${i % 2 === 0 ? 'mt-10' : ''}`} />
               ))}
            </div>

            <div className="relative z-10 space-y-6 md:space-y-10 max-w-2xl">
               <h2 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-none">CREATE, <br/> COLLABORATE <br/> AND BROADCAST.</h2>
               <p className="text-sm md:text-2xl text-slate-400 font-bold uppercase">EFFORTLESSLY BRING QUALITY BROADCASTING TO YOUR INSTITUTION.</p>
               <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 pt-4">
                 <Link to="/auth" className="w-full sm:w-auto">
                   <Button className="bg-teal-500 hover:bg-teal-600 text-white font-black px-8 py-6 md:px-12 md:py-8 rounded-xl md:rounded-2xl text-base md:text-2xl w-full sm:w-auto shadow-2xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 uppercase">
                     GO TO MY DASHBOARD
                   </Button>
                 </Link>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 bg-black border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
            <div className="lg:col-span-2 space-y-10">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-10 w-10 bg-teal-500 rounded-xl flex items-center justify-center">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white uppercase">STREAMPRO</span>
              </Link>
              <p className="text-slate-400 font-bold max-w-sm text-lg leading-relaxed uppercase">
                THE HIGH-PERFORMANCE INFRASTRUCTURE FOR INSTITUTIONAL BROADCASTING. EMPOWERING EDUCATORS, MODERATED BY LEADERS.
              </p>
              <div className="flex gap-4">
                 {[Twitter, Linkedin, Youtube].map((Icon, i) => (
                   <div key={i} className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-teal-500/20 transition-colors cursor-pointer group">
                      <Icon className="h-6 w-6 text-slate-400 group-hover:text-teal-400" />
                   </div>
                 ))}
              </div>
            </div>

            {['PRODUCT', 'RESOURCES', 'COMPANY'].map((title) => (
              <div key={title} className="space-y-8">
                <h4 className="font-black text-white text-sm tracking-widest uppercase">{title}</h4>
                <ul className="space-y-4 text-slate-400 font-bold text-sm">
                  {['FEATURES', 'SECURITY', 'API', 'GUIDES', 'CAREERS', 'LEGAL'].slice(0, 4).map(item => (
                    <li key={item} className="hover:text-teal-400 cursor-pointer transition-colors uppercase">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-24 pt-12 border-t border-white/10 flex justify-between items-center">
             <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">© 2026 STREAMPRO INFRASTRUCTURE. ALL RIGHTS RESERVED.</p>
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
            className="fixed inset-0 z-[200] bg-white p-8 overflow-y-auto lg:hidden"
          >
             <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-black text-slate-900">STREAMPRO</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center">
                  <X className="h-5 w-5" />
                </button>
             </div>
             <div className="flex flex-col gap-6">
                {Object.entries(navDropdowns).map(([title, items]) => (
                  <div key={title} className="space-y-3">
                    <p className="text-lg font-black text-slate-900">{title}</p>
                    <div className="pl-4 space-y-2">
                      {items.map((sub, i) => (
                        <button 
                          key={i} 
                          onClick={() => { sub.action(); setIsMobileMenuOpen(false); }}
                          className="block text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors"
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <hr className="border-slate-100" />
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-black text-sm">
                        {user.profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{user.profile?.full_name || 'USER'}</p>
                        <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <Link to={user.profile?.role === 'principal' ? '/principal/dashboard' : '/teacher/dashboard'} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-teal-500 py-8 rounded-2xl text-xl font-black shadow-xl shadow-teal-500/20">MY DASHBOARD</Button>
                    </Link>
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                      className="w-full text-center text-sm font-black text-rose-500 py-3"
                    >
                      SIGN OUT
                    </button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-teal-500 py-8 rounded-2xl text-xl font-black shadow-xl shadow-teal-500/20">GET STARTED</Button>
                  </Link>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
