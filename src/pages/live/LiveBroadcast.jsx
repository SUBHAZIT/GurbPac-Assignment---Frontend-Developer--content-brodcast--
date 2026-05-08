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

  // Track view access for anon
  useEffect(() => {
    async function checkAccess() {
      if (user) return;
      const access = await viewerService.checkViewAccess();
      setViewAccess(access);
      if (!access.allowed) setShowPaywall(true);
    }
    checkAccess();
  }, [user]);

  // Fetch live content — refreshes every 15s for timely auto-stop
  useEffect(() => {
    async function fetchLive() {
      // Auto-expire silently (don't block content fetch)
      try { await contentService.autoExpireBroadcasts(); } catch {}

      try {
        const data = await contentService.getLiveContent(teacherId);
        setContent(prevContent => {
          // If the current index would be out of bounds with new data, reset to 0
          if (data.length > 0 && currentIndex >= data.length) {
            setCurrentIndex(0);
            setTimeLeft(data[0].rotation_duration || 10);
          }
          if (data.length > 0 && prevContent.length === 0) {
            setTimeLeft(data[0].rotation_duration || 10);
          }
          return data;
        });
      } catch (error) { console.error('Live fetch error:', error); }
      finally { setLoading(false); }
    }
    fetchLive();
    const interval = setInterval(fetchLive, 15000); // Check every 15s for timely expiration
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
      // Start watch timer
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
    if (content.length <= 1 || showPaywall || !autoRotate) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCurrentIndex(curr => (curr + 1) % content.length);
          return content[(currentIndex + 1) % content.length].rotation_duration || 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [content, currentIndex, showPaywall, autoRotate]);

  function selectContent(index) {
    setCurrentIndex(index);
    setAutoRotate(false);
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

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col overflow-hidden">

      {/* Top Bar */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Live</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
            {teacherId === 'all' ? 'All Broadcasts' : 'Teacher Feed'} · {content.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!user && (
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/5 text-[10px]">
              <Eye className="h-3 w-3 text-teal-400" />
              <span className="text-teal-400 font-semibold">{viewAccess.limit - viewAccess.viewsUsed} free</span>
            </div>
          )}
          {content.length > 1 && (
            <button onClick={() => setAutoRotate(!autoRotate)}
              className={`text-[10px] font-semibold px-2 py-1 rounded-full border transition-all ${autoRotate ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-white/5 border-white/5 text-white/30'}`}
            >
              {autoRotate ? `Auto ${timeLeft}s` : 'Manual'}
            </button>
          )}
          {user && (
            <button onClick={logout}
              className="flex items-center gap-1 text-[10px] font-semibold text-white/30 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 px-2 py-1 rounded-full border border-white/5 hover:border-rose-500/20 transition-all"
            ><LogOut className="h-3 w-3" /> Logout</button>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Content + Thumbnails */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto lg:overflow-hidden pb-20 lg:pb-0">
          {/* Media (Sticky 16:9 on mobile) */}
          <div className="relative bg-black flex-none aspect-video lg:aspect-auto lg:flex-1 lg:min-h-0 sticky lg:relative top-0 z-40 shadow-xl lg:shadow-none">
            <AnimatePresence mode="wait">
              <motion.div key={activeItem.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                <ContentRenderer item={activeItem} />
                {activeItem.file_type !== 'video' && activeItem.file_type !== 'pdf' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                )}
              </motion.div>
            </AnimatePresence>
            {/* Prev/Next arrows for manual nav */}
            {content.length > 1 && (
              <>
                <button onClick={() => selectContent((currentIndex - 1 + content.length) % content.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all z-10">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => selectContent((currentIndex + 1) % content.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all z-10">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

            {/* Bottom: Info + Thumbnail Strip */}
          <div className="flex-shrink-0 bg-slate-950 lg:bg-slate-900/80 lg:backdrop-blur-sm lg:border-t lg:border-white/5">
            {/* Info Row */}
            <div className="px-4 py-4 lg:py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 lg:border-none">
              <div className="flex-1 min-w-0 space-y-2 lg:space-y-0.5">
                <h2 className="text-xl lg:text-base font-bold lg:truncate text-white leading-tight">{activeItem.title}</h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-500 text-white border-none text-[10px] font-bold px-2 py-0.5 lg:py-0 rounded-full">{activeItem.subject}</Badge>
                  {getTypeIcon(activeItem.file_type) && (
                    <Badge variant="outline" className="border-white/10 text-white/40 text-[10px] gap-1 capitalize py-0.5 lg:py-0">{getTypeIcon(activeItem.file_type)} {activeItem.file_type}</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 lg:gap-2 flex-shrink-0">
                <button onClick={handleLike} disabled={!user}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 lg:px-3 lg:py-1.5 rounded-full border text-sm lg:text-xs font-semibold transition-all flex-1 lg:flex-none ${likeStatus.hasLiked ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/10 text-white/60 hover:text-rose-400'} ${!user ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <Heart className={`h-4 w-4 lg:h-3.5 lg:w-3.5 ${likeStatus.hasLiked ? 'fill-rose-400' : ''}`} />
                  {likeStatus.count}
                </button>
                <button onClick={() => {
                  if (window.innerWidth < 1024) {
                    document.getElementById('mobile-chat')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setShowChat(!showChat);
                  }
                }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 lg:px-3 lg:py-1.5 rounded-full bg-white/5 border border-white/10 text-white flex-1 lg:flex-none text-sm lg:text-xs font-semibold hover:bg-white/10 transition-colors">
                  <MessageCircle className="h-4 w-4 lg:h-3.5 lg:w-3.5 text-teal-400" /> Live Chat ({comments.length})
                </button>
              </div>
            </div>

            {/* Thumbnail Strip / Up Next */}
            {content.length > 1 && (
              <div className="px-4 py-4 lg:pb-3 lg:pt-0">
                <h3 className="text-white font-bold text-lg mb-3 lg:hidden">Up Next</h3>
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-2 overflow-x-auto lg:scrollbar-hide pb-1">
                  {content.map((item, i) => (
                    <button key={item.id} onClick={() => selectContent(i)}
                      className={`flex flex-row lg:flex-col lg:flex-shrink-0 relative rounded-xl lg:rounded-lg overflow-hidden border-2 lg:border transition-all text-left bg-white/5 lg:bg-transparent ${i === currentIndex ? 'border-teal-500 lg:shadow-lg lg:shadow-teal-500/20 bg-white/10' : 'border-transparent lg:border-white/10 hover:border-white/30 hover:bg-white/10 opacity-100 lg:opacity-60 lg:hover:opacity-100'}`}
                    >
                      <div className="w-32 lg:w-[120px] h-20 lg:h-[68px] flex-shrink-0 relative bg-slate-800">
                        {getThumbnail(item) ? (
                          <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                            {item.file_type === 'video' && <Film className="h-5 w-5 text-purple-400" />}
                            {item.file_type === 'pdf' && <FileText className="h-5 w-5 text-rose-400" />}
                            {item.file_type === 'audio' && <Music className="h-5 w-5 text-amber-400" />}
                            {(!item.file_type || item.file_type === 'other') && <LayoutGrid className="h-5 w-5 text-slate-500" />}
                          </div>
                        )}
                        {i === currentIndex && (
                          <div className="absolute top-1.5 right-1.5 lg:top-1 lg:right-1 bg-black/50 p-1 rounded-full backdrop-blur-sm">
                            <div className="h-1.5 w-1.5 bg-teal-400 rounded-full animate-pulse" />
                          </div>
                        )}
                        {/* Overlay label on desktop only */}
                        <div className="hidden lg:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                          <p className="text-[8px] font-bold text-white truncate">{item.title}</p>
                          <p className="text-[7px] text-white/40">{item.subject}</p>
                        </div>
                      </div>

                      {/* Info next to thumbnail on mobile */}
                      <div className="p-3 lg:hidden flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-sm font-bold text-white truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.subject}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Mobile Chat */}
            <div id="mobile-chat" className="lg:hidden mt-4 pb-4 border-t border-white/5 flex flex-col flex-shrink-0">
              <div className="h-10 px-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-teal-400" />
                  <span className="text-sm font-bold text-white">Live Chat</span>
                  <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/40">{comments.length}</span>
                </div>
              </div>
              <div className="overflow-y-auto px-4 py-3 space-y-3 min-h-[300px] max-h-[400px]">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-white/20 text-center">
                    <MessageCircle className="h-8 w-8 mb-2" />
                    <p className="text-xs font-medium">No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="group flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">
                        {comment.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold text-white/70 truncate">{comment.profiles?.full_name || 'User'}</span>
                          {comment.profiles?.role && comment.profiles.role !== 'viewer' && (
                            <Badge className="text-[9px] py-0 px-1.5 h-4 bg-teal-500/20 text-teal-400 border-none capitalize">{comment.profiles.role}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed break-words">{comment.message}</p>
                      </div>
                      {user?.id === comment.user_id && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="opacity-100 text-white/30 hover:text-rose-400 transition-all mt-1">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRefMobile} />
              </div>
              <div className="px-4 py-3 border-t border-white/5 flex-shrink-0">
                {user ? (
                  <div className="flex gap-2">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                      placeholder="Type a message..."
                      className="flex-1 h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/40" />
                    <Button size="icon" onClick={handleSendComment} disabled={!newComment.trim() || sendingComment}
                      className="h-10 w-10 bg-teal-500 hover:bg-teal-600 rounded-xl flex-shrink-0">
                      {sendingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth"><button className="w-full h-10 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-xs font-bold transition-all"><User className="h-4 w-4" /> Sign in to comment</button></Link>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Desktop Chat Sidebar */}
        <div className={`hidden lg:flex w-72 border-l border-white/5 bg-slate-900/40 flex-col flex-shrink-0 relative transition-transform duration-300 ${showChat ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 hidden'}`}>
          <div className="h-10 px-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-xs font-semibold">Live Chat</span>
              <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-white/30">{comments.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/20 text-center">
                <MessageCircle className="h-7 w-7 mb-2" />
                <p className="text-[10px] font-medium">No comments yet</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="group flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-[9px] font-bold flex-shrink-0 mt-0.5">
                    {comment.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold text-white/70 truncate">{comment.profiles?.full_name || 'User'}</span>
                      {comment.profiles?.role && comment.profiles.role !== 'viewer' && (
                        <Badge className="text-[7px] py-0 px-1 h-3 bg-teal-500/20 text-teal-400 border-none capitalize">{comment.profiles.role}</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed break-words">{comment.message}</p>
                  </div>
                  {user?.id === comment.user_id && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all mt-1">
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2.5 border-t border-white/5 flex-shrink-0">
            {user ? (
              <div className="flex gap-1.5">
                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  placeholder="Type a message..."
                  className="flex-1 h-8 px-2.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/40" />
                <Button size="icon" onClick={handleSendComment} disabled={!newComment.trim() || sendingComment}
                  className="h-8 w-8 bg-teal-500 hover:bg-teal-600 rounded-lg flex-shrink-0">
                  {sendingComment ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                </Button>
              </div>
            ) : (
              <Link to="/auth"><button className="w-full h-8 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 text-[10px] font-semibold transition-all"><User className="h-3 w-3" /> Sign in to comment</button></Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
