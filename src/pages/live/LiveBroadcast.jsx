import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { contentService } from '@/services/content.service';
import { viewerService } from '@/services/viewer.service';
import { engagementService } from '@/services/engagement.service';
import {
  Play, Clock, BookOpen, User, Info, Loader2, Lock, Radio, Eye, LogOut,
  Heart, MessageCircle, Send, Trash2, FileText, Film, Music, Image as ImageIcon,
  ChevronLeft, ChevronRight, LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

function ContentRenderer({ item }) {
  if (!item) return null;
  const ft = item.file_type;
  if (ft === 'video') return <video src={item.file_url} controls autoPlay className="w-full h-full object-contain bg-black" />;
  if (ft === 'pdf') return <iframe src={item.file_url} className="w-full h-full border-0" title={item.title} />;
  if (ft === 'audio') return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 gap-6">
      <div className="h-28 w-28 bg-white/10 rounded-full flex items-center justify-center animate-pulse"><Music className="h-14 w-14 text-teal-400" /></div>
      <p className="text-white/60 text-lg font-semibold">{item.title}</p>
      <audio src={item.file_url} controls autoPlay className="w-72" />
    </div>
  );
  return <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" />;
}

function getTypeIcon(type) {
  switch (type) {
    case 'video': return <Film className="h-3 w-3" />;
    case 'pdf': return <FileText className="h-3 w-3" />;
    case 'audio': return <Music className="h-3 w-3" />;
    case 'image': return <ImageIcon className="h-3 w-3" />;
    default: return null;
  }
}

function getThumbnail(item) {
  if (item.file_type === 'image') return item.file_url;
  return null;
}

export default function LiveBroadcast() {
  const { teacherId } = useParams();
  const { user, logout } = useAuth();
  const [content, setContent] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const [viewAccess, setViewAccess] = useState({ allowed: true, viewsUsed: 0, limit: 10 });
  const [showPaywall, setShowPaywall] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [likeStatus, setLikeStatus] = useState({ count: 0, hasLiked: false });
  const [showChat, setShowChat] = useState(true);
  const chatEndRef = useRef(null);
  const chatEndRefMobile = useRef(null);
  const watchTimerRef = useRef(null);
  const videoRef = useRef(null);

  // Fetch live content
  useEffect(() => {
    async function fetchLiveContent() {
      try {
        setLoading(true);
        // Auto-expire silently
        try { await contentService.autoExpireBroadcasts(); } catch {}
        
        const data = await contentService.getLiveContent(teacherId || 'all');
        
        setContent(prevContent => {
          if (data.length > 0 && currentIndex >= data.length) {
            setCurrentIndex(0);
            setTimeLeft(data[0].rotation_duration || 10);
          }
          if (data.length > 0 && prevContent.length === 0) {
            setTimeLeft(data[0].rotation_duration || 10);
          }
          return data;
        });
      } catch (error) { console.error('Fetch error:', error); }
      finally { setLoading(false); }
    }
    fetchLiveContent();
    const interval = setInterval(fetchLiveContent, 15000); 
    return () => clearInterval(interval);
  }, [teacherId]);

  // Load comments & likes
  useEffect(() => {
    if (content.length === 0) return;
    const activeItem = content[currentIndex];
    if (!activeItem) return;

    async function loadEngagement() {
      try {
        const [cmts, likes] = await Promise.all([
          engagementService.getComments(activeItem.id),
          engagementService.getLikeStatus(activeItem.id, user?.id),
        ]);
        setComments(cmts);
        setLikeStatus(likes);
      } catch (e) { /* silent */ }
    }
    loadEngagement();
    const poll = setInterval(async () => {
      try { const cmts = await engagementService.getComments(activeItem.id); setComments(cmts); } catch (e) { /* */ }
    }, 10000);
    return () => clearInterval(poll);
  }, [currentIndex, content, user]);

  // Record view for anon + watch history for auth
  useEffect(() => {
    if (content.length === 0) return;
    const activeItem = content[currentIndex];
    if (!activeItem) return;

    if (!user) {
      viewerService.recordView(activeItem.id).then(() =>
        viewerService.checkViewAccess().then(a => { setViewAccess(a); if (!a.allowed) setShowPaywall(true); })
      );
    } else {
      watchTimerRef.current = setInterval(() => {
        engagementService.recordWatch(activeItem.id, user.id, 10).catch(() => { });
      }, 10000);
    }
    return () => { if (watchTimerRef.current) clearInterval(watchTimerRef.current); };
  }, [currentIndex, content, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    chatEndRefMobile.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Auto-rotation
  useEffect(() => {
    if (content.length <= 1 || showPaywall || !autoRotate || !hasStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const nextIndex = (currentIndex + 1) % content.length;
          setCurrentIndex(nextIndex);
          return content[nextIndex].rotation_duration || 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [content, currentIndex, showPaywall, autoRotate, hasStarted]);

  function selectContent(index) {
    setCurrentIndex(index);
    setAutoRotate(false);
    setHasStarted(true); 
    setTimeLeft(content[index].rotation_duration || 10);
  }

  async function handleSendComment() {
    if (!newComment.trim() || !user) return;
    setSendingComment(true);
    try {
      const comment = await engagementService.addComment(content[currentIndex].id, user.id, newComment);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (e) { console.error(e); } finally { setSendingComment(false); }
  }

  async function handleLike() {
    if (!user) return;
    try {
      const result = await engagementService.toggleLike(content[currentIndex].id, user.id);
      setLikeStatus(prev => ({ count: result.liked ? prev.count + 1 : prev.count - 1, hasLiked: result.liked }));
    } catch (e) { console.error(e); }
  }

  async function handleDeleteComment(commentId) {
    try { await engagementService.deleteComment(commentId); setComments(prev => prev.filter(c => c.id !== commentId)); } catch (e) { console.error(e); }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
      <Loader2 className="h-12 w-12 text-teal-500 animate-spin mb-4" />
      <p className="text-slate-400 font-medium animate-pulse">Initializing Broadcast...</p>
    </div>
  );

  if (content.length === 0) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-slate-900 p-8 rounded-full mb-6 border border-slate-800"><Play className="h-16 w-16 text-slate-700" /></div>
      <h1 className="text-3xl font-bold text-white mb-2">No content available</h1>
      <p className="text-slate-400 max-w-md">There are currently no active broadcasts. Check back later.</p>
    </div>
  );

  if (showPaywall && !user) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[150px]" /></div>
      <div className="relative z-10 max-w-md mx-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 space-y-6">
          <div className="h-20 w-20 mx-auto bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20"><Lock className="h-10 w-10 text-white" /></div>
          <h1 className="text-2xl font-bold text-white">Free Previews Used Up</h1>
          <p className="text-slate-400 text-sm">You've watched <strong className="text-white">{viewAccess.viewsUsed}</strong> of <strong className="text-white">{viewAccess.limit}</strong> free previews.</p>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" style={{ width: '100%' }} /></div>
          <Link to="/auth"><Button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-6 rounded-xl gap-2"><Eye className="h-4 w-4" /> Sign in to Watch Unlimited</Button></Link>
        </div>
      </div>
    </div>
  );

  const activeItem = content[currentIndex];

  function ContentRenderer({ item }) {
    if (!item) return null;
    const ft = item.file_type;
    
    if (!hasStarted && (ft === 'video' || ft === 'audio')) {
      return (
        <div className="w-full h-full relative group cursor-pointer overflow-hidden" onClick={() => setHasStarted(true)}>
          <div 
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110"
            style={{ backgroundImage: `url(${item.file_url})` }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
              <div className="relative h-24 w-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Play className="h-10 w-10 fill-white ml-1" />
              </div>
            </div>
            <div className="mt-8 text-center space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">{item.title}</h3>
              <p className="text-slate-400 font-medium">Click to start broadcast</p>
            </div>
          </div>
          <div className="absolute top-6 left-6 z-20">
            <div className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-lg shadow-rose-500/20">
              <div className="h-1.5 w-1.5 bg-white rounded-full animate-ping" />
              CURRENTLY STREAMING
            </div>
          </div>
        </div>
      );
    }

    if (ft === 'video') return (
      <video 
        ref={videoRef}
        src={item.file_url} 
        controls 
        autoPlay 
        className="w-full h-full object-contain bg-black shadow-2xl" 
        onEnded={() => {
          if (autoRotate && content.length > 1) {
            setCurrentIndex(curr => (curr + 1) % content.length);
          }
        }}
      />
    );

    if (ft === 'pdf') return <iframe src={item.file_url} className="w-full h-full border-0 bg-white" title={item.title} />;

    if (ft === 'audio') return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="h-40 w-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
            <Music className="h-20 w-20 text-teal-400" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-white text-2xl font-bold tracking-tight">{item.title}</p>
          <p className="text-slate-400 font-medium">{item.subject}</p>
        </div>
        <audio src={item.file_url} controls autoPlay className="w-80 h-10 shadow-lg" />
      </div>
    );

    return (
      <div className="w-full h-full flex items-center justify-center bg-black relative">
        <img src={item.file_url} alt={item.title} className="w-full h-full object-contain" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden font-sans">
      <header className="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:rotate-6 transition-transform">
              <Radio className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">StreamPro</span>
          </Link>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Live Broadcast</span>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {teacherId === 'all' ? 'Institution Feed' : 'Teacher Stream'} · {content.length} Broadcasts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-[11px] font-semibold">
                <Eye className="h-3.5 w-3.5 text-teal-400" />
                <span className="text-slate-400"><strong className="text-teal-400">{viewAccess.limit - viewAccess.viewsUsed}</strong> previews left</span>
              </div>
              <Link to="/auth">
                <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-none rounded-lg text-xs font-bold px-4 h-9">Sign In</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-slate-300 capitalize">{user.role}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 h-9 rounded-lg gap-2 text-xs font-bold">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <section className="flex-1 flex flex-col min-w-0 bg-black relative">
          <div className="relative flex-1 min-h-0 flex items-center justify-center group overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeItem.id} 
                initial={{ opacity: 0, scale: 1.02 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }} 
                transition={{ duration: 0.5, ease: "easeOut" }} 
                className="absolute inset-0"
              >
                <ContentRenderer item={activeItem} />
              </motion.div>
            </AnimatePresence>

            {content.length > 1 && (
              <>
                <button 
                  onClick={() => selectContent((currentIndex - 1 + content.length) % content.length)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:scale-110 transition-all z-30 opacity-0 group-hover:opacity-100 shadow-2xl"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button 
                  onClick={() => selectContent((currentIndex + 1) % content.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:scale-110 transition-all z-30 opacity-0 group-hover:opacity-100 shadow-2xl"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div className="absolute top-6 right-6 z-30 flex flex-col items-end gap-3">
              {autoRotate && hasStarted && (
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex flex-col items-end shadow-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Next Content In</span>
                  <span className="text-xl font-black text-teal-400 tabular-nums">{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border-t border-white/5 p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-rose-500 text-white font-black text-[10px] tracking-widest px-3 py-1 rounded-md shadow-lg shadow-rose-500/20">LIVE</Badge>
                  <Badge variant="outline" className="border-teal-500/30 text-teal-400 bg-teal-500/5 font-bold px-3 py-1 rounded-md">{activeItem.subject}</Badge>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">{activeItem.title}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="h-10 w-10 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">{activeItem.profiles?.full_name || 'Broadcast Teacher'}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Educator</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLike} 
                  disabled={!user}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold transition-all ${likeStatus.hasLiked ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white'} ${!user ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Heart className={`h-5 w-5 ${likeStatus.hasLiked ? 'fill-white' : ''}`} />
                  {likeStatus.count}
                </button>
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className="flex lg:hidden items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className={`fixed lg:relative inset-0 lg:inset-auto z-50 lg:z-0 lg:w-[420px] bg-slate-900 border-l border-white/5 flex flex-col transition-transform duration-500 ease-in-out ${showChat ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:hidden'}`}>
          <div className="lg:hidden h-14 px-4 flex items-center justify-between border-b border-white/10 bg-slate-800">
            <span className="font-bold">Live Interactions</span>
            <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}><X className="h-6 w-6" /></Button>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-black tracking-widest uppercase">Live Chat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3 w-3 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500">{comments.length * 3 + 4} Watching</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center space-y-4 px-10">
                    <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center"><MessageCircle className="h-10 w-10" /></div>
                    <div>
                      <p className="font-bold text-white">Join the Conversation</p>
                      <p className="text-xs mt-1">Be the first to comment on this broadcast.</p>
                    </div>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={comment.id} className="group flex gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-teal-400 text-sm font-black shadow-lg border border-white/5 flex-shrink-0">
                        {comment.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-white/90 truncate">{comment.profiles?.full_name || 'Anonymous User'}</span>
                          {comment.profiles?.role && comment.profiles.role !== 'viewer' && (
                            <Badge className="text-[8px] py-0 px-2 h-4 bg-teal-500 text-white border-none uppercase tracking-widest">{comment.profiles.role}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed break-words font-medium">{comment.message}</p>
                      </div>
                      {user?.id === comment.user_id && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-all mt-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 border-t border-white/5 bg-black/20">
                {user ? (
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                      placeholder="Send a message..."
                      className="w-full h-12 pl-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/40 focus:ring-4 focus:ring-teal-500/10 transition-all" 
                    />
                    <button 
                      onClick={handleSendComment} 
                      disabled={!newComment.trim() || sendingComment}
                      className="absolute right-2 top-2 h-8 w-8 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all"
                    >
                      {sendingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 gap-2 font-bold transition-all">
                      <Lock className="h-4 w-4" /> Sign in to Chat
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            <div className="h-[280px] border-t border-white/5 flex flex-col flex-shrink-0 bg-slate-950">
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-black tracking-widest uppercase">Broadcast Playlist</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{currentIndex + 1} / {content.length}</span>
              </div>
              <div className="flex-1 overflow-x-auto p-4 flex gap-4 scrollbar-hide">
                {content.map((item, i) => (
                  <button 
                    key={item.id} 
                    onClick={() => selectContent(i)}
                    className={`flex-shrink-0 w-[180px] group relative rounded-xl overflow-hidden border-2 transition-all ${i === currentIndex ? 'border-teal-500 scale-95' : 'border-transparent opacity-40 hover:opacity-100 hover:border-white/20'}`}
                  >
                    <div className="aspect-video bg-slate-800 relative">
                      {item.file_type === 'image' ? (
                        <img src={item.file_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <div className={`p-2 rounded-lg ${item.file_type === 'video' ? 'bg-purple-500/10 text-purple-400' : item.file_type === 'audio' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {item.file_type === 'video' ? <Film className="h-6 w-6" /> : item.file_type === 'audio' ? <Music className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                          </div>
                        </div>
                      )}
                      {i === currentIndex && (
                        <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center backdrop-blur-[2px]">
                          <Play className="h-8 w-8 fill-teal-400 text-teal-400 animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-slate-900 border-t border-white/5">
                      <p className="text-[11px] font-bold text-white truncate mb-1">{item.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{item.subject}</span>
                        <span className="text-[9px] font-bold text-teal-500">{item.rotation_duration}s</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function X({ className }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
