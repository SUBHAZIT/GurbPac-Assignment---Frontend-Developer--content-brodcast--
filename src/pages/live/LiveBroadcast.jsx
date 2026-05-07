import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { contentService } from '@/services/content.service';
import { Play, Clock, BookOpen, User, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveBroadcast() {
  const { teacherId } = useParams();
  const [content, setContent] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function fetchLive() {
      try {
        const data = await contentService.getLiveContent(teacherId);
        setContent(data);
        // Reset index if it's out of bounds after a refresh
        if (data.length > 0) {
          if (currentIndex >= data.length) setCurrentIndex(0);
          if (timeLeft === 0) setTimeLeft(data[0].rotation_duration || 10);
        }
      } catch (error) {
        console.error('Live fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLive();
    const interval = setInterval(fetchLive, 60000); // Check for new content every minute
    return () => clearInterval(interval);
  }, [teacherId]);

  useEffect(() => {
    if (content.length <= 1) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCurrentIndex((curr) => (curr + 1) % content.length);
          return content[(currentIndex + 1) % content.length].rotation_duration || 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [content, currentIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">Initializing Broadcast...</p>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-slate-900 p-8 rounded-full mb-6 border border-slate-800">
          <Play className="h-16 w-16 text-slate-700" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">No content available</h1>
        <p className="text-slate-400 max-w-md">
          There are currently no active broadcasts for this teacher. Please check back later.
        </p>
        <div className="mt-12 h-1 w-64 bg-slate-900 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-600"
            animate={{ x: [-256, 256] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  const activeItem = content[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
      {/* Top Status Bar */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Live Broadcast</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-slate-400">
            <User className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{teacherId === 'all' ? 'Institutional Feed' : `Teacher ID: ${teacherId}`}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {content.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Next in</span>
              <div className="flex gap-1">
                {content.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 w-6 rounded-full transition-colors duration-500 ${i === currentIndex ? 'bg-indigo-500' : 'bg-white/10'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400 w-8">{timeLeft}s</span>
            </div>
          )}
          <div className="text-xs font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative flex items-center justify-center p-12">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeItem.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10"
          >
            <img 
              src={activeItem.file_url} 
              alt={activeItem.title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Content Info */}
            <div className="absolute bottom-0 left-0 w-full p-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-indigo-600 text-white border-none py-1 px-3 text-xs font-bold rounded-full">
                  {activeItem.subject}
                </Badge>
                <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  Ends at {new Date(activeItem.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <h2 className="text-5xl font-extrabold tracking-tight leading-tight max-w-2xl">
                {activeItem.title}
              </h2>
              
              {activeItem.description && (
                <p className="text-white/70 text-lg max-w-xl line-clamp-2">
                  {activeItem.description}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-20 h-64 w-64 bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-20 right-20 h-96 w-96 bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      </div>

      {/* Footer Info */}
      <div className="h-20 px-12 flex items-center justify-between bg-black/60 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Current Subject</p>
              <p className="text-sm font-bold">{activeItem.subject}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <Info className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Broadcasting To</p>
              <p className="text-sm font-bold">Public Students Feed</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Powered by</span>
          <div className="flex items-center gap-1.5 ml-1">
             <Play className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />
             <span className="text-sm font-black tracking-tighter">EduStream</span>
          </div>
        </div>
      </div>
    </div>
  );
}
