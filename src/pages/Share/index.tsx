import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Plus, Music2, Bookmark, MessageSquare, User } from 'lucide-react';
import clsx from 'clsx';
import { postApi, likeApi, collectionApi, followApi, authApi, notificationApi } from '../../utils/api';
import { getImageUrl } from '../../utils/api';
import VideoPlayer from '../../components/share/VideoPlayer';
import CommentSheet from '../../components/share/CommentSheet';
import ShareSheet from '../../components/share/ShareSheet';
import MsgPanel from './MessagePanel';
import ProfilePanel from './ProfilePanel';

// 帖子类型
interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
    bio?: string;
    isVerified?: boolean;
  };
  description: string;
  mediaType: 'image' | 'video';
  mediaUrls: string[];
  coverUrl?: string;
  music?: { name: string; artist?: string; url?: string };
  tags?: string[];
  stats: { likeCount: number; commentCount: number; shareCount: number; viewCount: number; collectionCount: number };
  createdAt: string;
  isLiked?: boolean;
  isCollected?: boolean;
  isFollowing?: boolean;
}

// 演示数据 - 没有后端数据时用这个
const DEMO_POSTS: Post[] = [
  {
    _id: 'demo1',
    author: { _id: 'demo-author-1', username: 'CyberEmbroidery', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cyber', isVerified: true },
    description: '当赛博朋克遇上苏绣，这才是我们要的国潮！🤘 #传统文化 #OOTD #赛博朋克',
    mediaType: 'image',
    mediaUrls: ['https://cdn.wegic.ai/assets/onepage/agent/images/1764573786670.jpg?imageMogr2/format/webp'],
    music: { name: '原声 - CyberEmbroidery' },
    tags: ['传统文化', 'OOTD', '赛博朋克'],
    stats: { likeCount: 12500, commentCount: 892, shareCount: 2300, viewCount: 50000, collectionCount: 1200 },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo2',
    author: { _id: 'demo-author-2', username: 'HeritageDesign', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Design' },
    description: '深夜灵感✨ 正在尝试把云锦纹样解构重组，应用到现代卫衣设计中。大家觉得这个配色怎么样？',
    mediaType: 'image',
    mediaUrls: ['https://cdn.wegic.ai/assets/onepage/agent/images/1764573796076.jpg?imageMogr2/format/webp'],
    music: { name: '配乐 - 灵感时刻' },
    tags: ['设计手稿', '国风新造'],
    stats: { likeCount: 8900, commentCount: 456, shareCount: 1100, viewCount: 35000, collectionCount: 800 },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo3',
    author: { _id: 'demo-author-3', username: 'OldStories', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Story' },
    description: '奶奶当年的嫁衣，每一个盘扣都是她亲手缝制的。虽然照片褪色了，但那份情感永远鲜活。',
    mediaType: 'image',
    mediaUrls: ['https://cdn.wegic.ai/assets/onepage/agent/images/1764573788371.jpg?imageMogr2/format/webp'],
    music: { name: '配乐 - 岁月神偷' },
    tags: ['老照片', '家族记忆', '非遗'],
    stats: { likeCount: 23400, commentCount: 1200, shareCount: 5600, viewCount: 80000, collectionCount: 3500 },
    createdAt: new Date().toISOString(),
  },
];

const VER = 'v4_20260312_fix'; // 演示数据版本号

// 初始统计
const INIT_STATS: Record<string, { likeCount: number; collectionCount: number }> = {
  demo1: { likeCount: 12500, collectionCount: 1200 },
  demo2: { likeCount: 8900, collectionCount: 800 },
  demo3: { likeCount: 23400, collectionCount: 3500 },
};

// 初始化演示数据
const initDemo = () => {
  const v = localStorage.getItem('demoVer');
  if (v !== VER) {
    // 版本不匹配，重置
    ['demoGlobalStats', 'demoUserLikes', 'demoUserCollections', 'demoUserFollows', 'demoComments'].forEach(k => localStorage.removeItem(k));
    localStorage.setItem('demoVer', VER);
    localStorage.setItem('demoGlobalStats', JSON.stringify(INIT_STATS));
    return;
  }
  if (!localStorage.getItem('demoGlobalStats')) {
    localStorage.setItem('demoGlobalStats', JSON.stringify(INIT_STATS));
  }
};

// 数字格式化
const fmtNum = (n: number): string => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
};

// 获取演示数据状态
const getDemoState = (uid: string | null): Post[] => {
  initDemo();
  const stats = JSON.parse(localStorage.getItem('demoGlobalStats') || '{}');
  const likes = JSON.parse(localStorage.getItem('demoUserLikes') || '{}');
  const collects = JSON.parse(localStorage.getItem('demoUserCollections') || '{}');
  const follows = JSON.parse(localStorage.getItem('demoUserFollows') || '{}');
  const comments = JSON.parse(localStorage.getItem('demoComments') || '{}');

  return DEMO_POSTS.map(p => {
    const st = stats[p._id] || INIT_STATS[p._id] || { likeCount: 0, collectionCount: 0 };
    return {
      ...p,
      stats: { ...p.stats, likeCount: st.likeCount, collectionCount: st.collectionCount, commentCount: (comments[p._id] || []).length },
      isLiked: uid ? (likes[p._id] || []).includes(uid) : false,
      isCollected: uid ? (collects[p._id] || []).includes(uid) : false,
      isFollowing: uid ? (follows[p.author._id] || []).includes(uid) : false,
    };
  });
};

export default function SharePg() {
  const nav = useNavigate();
  const [checking, setChecking] = useState(true);
  const [posts, setPosts] = useState<Post[]>(DEMO_POSTS);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showHeart, setShowHeart] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });
  const [commentOpen, setCommentOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selPost, setSelPost] = useState<Post | null>(null);
  const [panel, setPanel] = useState<'message' | 'profile' | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const obsRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getMe();
        if (!res.success || !res.data) {
          nav('/login');
        } else {
          setUid((res.data as any).userId || (res.data as any)._id || null);
        }
      } catch {
        nav('/login');
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [nav]);

  // 获取未读数 - 所有hooks必须在顶层
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.unreadCount() as { success: boolean; data: { count: number } };
        if (res.success && res.data) setUnread(res.data.count);
      } catch { console.log('获取未读数失败'); }
    };
    if (uid) {
      fetchUnread();
      const t = setInterval(fetchUnread, 30000);
      return () => clearInterval(t);
    }
  }, [uid]);

  // uid变化后更新演示数据状态
  useEffect(() => {
    if (uid !== undefined) {
      setPosts(prev => {
        const demoIds = ['demo1', 'demo2', 'demo3'];
        const hasDemo = prev.some(p => demoIds.includes(p._id));
        if (!hasDemo) return getDemoState(uid);

        const stats = JSON.parse(localStorage.getItem('demoGlobalStats') || '{}');
        const likes = JSON.parse(localStorage.getItem('demoUserLikes') || '{}');
        const collects = JSON.parse(localStorage.getItem('demoUserCollections') || '{}');
        const follows = JSON.parse(localStorage.getItem('demoUserFollows') || '{}');
        const comments = JSON.parse(localStorage.getItem('demoComments') || '{}');

        return prev.map(p => {
          if (!demoIds.includes(p._id)) return p;
          const st = stats[p._id] || INIT_STATS[p._id] || { likeCount: 0, collectionCount: 0 };
          return {
            ...p,
            isLiked: uid ? (likes[p._id] || []).includes(uid) : false,
            isCollected: uid ? (collects[p._id] || []).includes(uid) : false,
            isFollowing: uid ? (follows[p.author._id] || []).includes(uid) : false,
            stats: { ...p.stats, likeCount: st.likeCount, collectionCount: st.collectionCount, commentCount: (comments[p._id] || []).length },
          };
        });
      });
    }
  }, [uid]);

  // 加载帖子
  const loadPosts = useCallback(async (pg: number) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await postApi.feed(pg, 10) as { success: boolean; data: Post[]; pagination?: { page: number; totalPages: number } };
      if (res.success && res.data) {
        // 获取点赞收藏状态
        const withStatus = await Promise.all(
          res.data.map(async (p: Post) => {
            try {
              const [lr, cr, fr] = await Promise.all([
                likeApi.check(p._id).catch(() => ({ data: { liked: false } })) as Promise<{ data: { liked: boolean } }>,
                collectionApi.check(p._id).catch(() => ({ data: { collected: false } })) as Promise<{ data: { collected: boolean } }>,
                followApi.check(p.author._id).catch(() => ({ data: { following: false } })) as Promise<{ data: { following: boolean } }>,
              ]);
              return { ...p, isLiked: lr.data?.liked || false, isCollected: cr.data?.collected || false, isFollowing: fr.data?.following || false };
            } catch { return p; }
          })
        );

        if (pg === 1) {
          const demo = getDemoState(uid);
          const realIds = new Set(withStatus.map(p => p._id));
          setPosts([...withStatus, ...demo.filter(p => !realIds.has(p._id))]);
        } else {
          setPosts(prev => [...prev, ...withStatus]);
        }
        setHasMore((res.pagination?.page ?? 0) < (res.pagination?.totalPages ?? 0));
      } else if (pg === 1) {
        setPosts(getDemoState(uid));
        setHasMore(false);
      }
    } catch (e) {
      console.error('加载帖子失败:', e);
      if (pg === 1) setPosts(getDemoState(uid));
    } finally {
      setLoading(false);
    }
  }, [loading, uid]);

  // 初始加载
  useEffect(() => { loadPosts(1); }, []);

  // 滚动监听
  useEffect(() => {
    const onScroll = () => {
      if (boxRef.current) {
        const st = boxRef.current.scrollTop;
        const h = window.innerHeight - 80;
        setActive(Math.round(st / h));
      }
    };
    boxRef.current?.addEventListener('scroll', onScroll);
    return () => boxRef.current?.removeEventListener('scroll', onScroll);
  }, []);

  // 无限滚动
  useEffect(() => {
    if (!hasMore || loading) return;
    const last = document.querySelector(`[data-index="${posts.length - 1}"]`);
    if (!last) return;

    obsRef.current?.disconnect();
    obsRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const np = page + 1;
          setPage(np);
          loadPosts(np);
        }
      },
      { threshold: 0.5 }
    );
    obsRef.current.observe(last);
    return () => obsRef.current?.disconnect();
  }, [posts.length, hasMore, page, loadPosts, loading]);

  // 点赞
  const onLike = async (p: Post, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!uid) { alert('请先登录后再点赞'); return; }

    const newState = !p.isLiked;

    // 演示数据
    if (p._id.startsWith('demo')) {
      const stats = JSON.parse(localStorage.getItem('demoGlobalStats') || '{}');
      if (!stats[p._id]) stats[p._id] = { ...INIT_STATS[p._id] };
      stats[p._id].likeCount += newState ? 1 : -1;
      localStorage.setItem('demoGlobalStats', JSON.stringify(stats));

      const likes = JSON.parse(localStorage.getItem('demoUserLikes') || '{}');
      if (!likes[p._id]) likes[p._id] = [];
      if (newState) { if (!likes[p._id].includes(uid)) likes[p._id].push(uid); }
      else { const idx = likes[p._id].indexOf(uid); if (idx > -1) likes[p._id].splice(idx, 1); }
      localStorage.setItem('demoUserLikes', JSON.stringify(likes));

      setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isLiked: newState, stats: { ...x.stats, likeCount: stats[p._id].likeCount } } : x));
      return;
    }

    // 真实数据 - 乐观更新
    setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isLiked: newState, stats: { ...x.stats, likeCount: newState ? x.stats.likeCount + 1 : x.stats.likeCount - 1 } } : x));
    try {
      const res = await likeApi.toggle(p._id) as { success: boolean; data?: { liked: boolean; likeCount: number } };
      if (res.success && res.data) {
        setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isLiked: res.data!.liked, stats: { ...x.stats, likeCount: res.data!.likeCount } } : x));
      }
    } catch (err) {
      console.error('点赞失败:', err);
      setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isLiked: !newState, stats: { ...x.stats, likeCount: newState ? x.stats.likeCount - 1 : x.stats.likeCount + 1 } } : x));
    }
  };

  // 双击点赞
  const onDblClick = (p: Post, e: React.MouseEvent) => {
    if (!p.isLiked) onLike(p);
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setHeartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  // 收藏
  const onCollect = async (p: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!uid) return;

    const newState = !p.isCollected;

    if (p._id.startsWith('demo')) {
      const stats = JSON.parse(localStorage.getItem('demoGlobalStats') || '{}');
      if (!stats[p._id]) stats[p._id] = { ...INIT_STATS[p._id] };
      stats[p._id].collectionCount += newState ? 1 : -1;
      localStorage.setItem('demoGlobalStats', JSON.stringify(stats));

      const collects = JSON.parse(localStorage.getItem('demoUserCollections') || '{}');
      if (!collects[p._id]) collects[p._id] = [];
      if (newState) { if (!collects[p._id].includes(uid)) collects[p._id].push(uid); }
      else { const idx = collects[p._id].indexOf(uid); if (idx > -1) collects[p._id].splice(idx, 1); }
      localStorage.setItem('demoUserCollections', JSON.stringify(collects));

      setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isCollected: newState, stats: { ...x.stats, collectionCount: stats[p._id].collectionCount } } : x));
      return;
    }

    setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isCollected: newState, stats: { ...x.stats, collectionCount: newState ? x.stats.collectionCount + 1 : x.stats.collectionCount - 1 } } : x));
    try { await collectionApi.toggle(p._id); }
    catch { setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isCollected: !newState, stats: { ...x.stats, collectionCount: newState ? x.stats.collectionCount - 1 : x.stats.collectionCount + 1 } } : x)); }
  };

  // 关注
  const onFollow = async (p: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!uid) return;

    const newState = !p.isFollowing;

    if (p._id.startsWith('demo')) {
      const follows = JSON.parse(localStorage.getItem('demoUserFollows') || '{}');
      const aid = p.author._id;
      if (!follows[aid]) follows[aid] = [];
      if (newState) { if (!follows[aid].includes(uid)) follows[aid].push(uid); }
      else { const idx = follows[aid].indexOf(uid); if (idx > -1) follows[aid].splice(idx, 1); }
      localStorage.setItem('demoUserFollows', JSON.stringify(follows));
      setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isFollowing: newState } : x));
      return;
    }

    setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isFollowing: newState } : x));
    try { await followApi.toggle(p.author._id); }
    catch { setPosts(prev => prev.map(x => x._id === p._id ? { ...x, isFollowing: !newState } : x)); }
  };

  // 打开评论
  const openComment = (p: Post, e: React.MouseEvent) => { e.stopPropagation(); setSelPost(p); setCommentOpen(true); };

  // 打开分享
  const openShare = (p: Post, e: React.MouseEvent) => { e.stopPropagation(); setSelPost(p); setShareOpen(true); };

  // 评论数更新
  const onCommentAdd = () => {
    if (selPost) {
      const newCount = selPost.stats.commentCount + 1;
      // 同时更新两个状态
      setSelPost(prev => prev ? { ...prev, stats: { ...prev.stats, commentCount: newCount } } : null);
      setPosts(prev => prev.map(x => x._id === selPost._id ? { ...x, stats: { ...x.stats, commentCount: newCount } } : x));
    }
  };

  // 分享成功
  const onShareOk = () => {
    if (selPost) setPosts(prev => prev.map(x => x._id === selPost._id ? { ...x, stats: { ...x.stats, shareCount: x.stats.shareCount + 1 } } : x));
  };

  // 删除帖子
  const onPostDel = useCallback((id: string) => { setPosts(prev => prev.filter(x => x._id !== id)); }, []);

  // 点击帖子跳转
  const onPostClick = useCallback((id: string) => {
    const idx = posts.findIndex(x => x._id === id);
    if (idx !== -1 && boxRef.current) {
      const h = window.innerHeight - 80;
      boxRef.current.scrollTo({ top: idx * h, behavior: 'smooth' });
      setActive(idx);
    }
  }, [posts]);

  // 所有hooks必须在顶层，加载状态检查放在hooks之后
  if (checking) {
    return (
      <div className="fixed inset-0 bg-ink-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mist-300">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-0 pt-20">
      {/* 左侧导航 */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <button onClick={() => setPanel(panel === 'message' ? null : 'message')} className={clsx("w-12 h-12 rounded-full flex items-center justify-center transition-all relative", panel === 'message' ? "bg-gold-500 text-ink-900" : "bg-black/40 backdrop-blur-sm text-white hover:bg-white/20")}>
          <MessageSquare size={24} />
          {unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold px-1">{unread > 99 ? '99+' : unread}</span>}
        </button>
        <button onClick={() => setPanel(panel === 'profile' ? null : 'profile')} className={clsx("w-12 h-12 rounded-full flex items-center justify-center transition-all", panel === 'profile' ? "bg-gold-500 text-ink-900" : "bg-black/40 backdrop-blur-sm text-white hover:bg-white/20")}>
          <User size={24} />
        </button>
      </div>

      {/* 消息面板 */}
      {panel === 'message' && <MsgPanel onClose={() => setPanel(null)} onUnreadChange={n => setUnread(n)} />}

      {/* 个人面板 */}
      {panel === 'profile' && <ProfilePanel onClose={() => setPanel(null)} onPostDeleted={onPostDel} onPostClick={onPostClick} />}

      <div ref={boxRef} className="h-[calc(100vh-80px)] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar">
        {posts.map((p, i) => (
          <div key={p._id} data-index={i} className="h-full w-full snap-start relative flex justify-center bg-ink-900">
            <div className="relative w-full max-w-md h-full bg-ink-800 shadow-2xl overflow-hidden border-x border-white/5">
              {/* 媒体内容 */}
              {p.mediaType === 'video' ? (
                <VideoPlayer src={getImageUrl(p.mediaUrls[0])} poster={getImageUrl(p.coverUrl)} isActive={active === i} postId={p._id} onDoubleClick={() => onDblClick(p, {} as React.MouseEvent)} bottomOffset={130} onVideoEnd={() => { if (i < posts.length - 1) document.querySelector(`[data-index="${i + 1}"]`)?.scrollIntoView({ behavior: 'smooth' }); }} />
              ) : (
                <div className="absolute inset-0 w-full h-full" onDoubleClick={e => onDblClick(p, e)}>
                  <img src={getImageUrl(p.mediaUrls[0])} alt="Feed" className="w-full h-full object-cover" />
                </div>
              )}

              {/* 心形动画 */}
              {showHeart && active === i && <div className="absolute z-30 pointer-events-none animate-heart-burst" style={{ left: heartPos.x - 50, top: heartPos.y - 50 }}><Heart size={100} className="text-red-500 fill-red-500 drop-shadow-lg" /></div>}

              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

              {/* 右侧操作栏 */}
              <div className="absolute right-4 bottom-32 flex flex-col items-center gap-5 z-20">
                {/* 头像 + 关注 */}
                <div className="relative group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border-2 border-white p-0.5 overflow-hidden bg-black">
                    <img src={getImageUrl(p.author.avatar)} alt={p.author.username} className="w-full h-full object-cover" />
                  </div>
                  {!p.isFollowing && <button onClick={e => onFollow(p, e)} className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gold-500 rounded-full p-1 text-ink-900 hover:bg-gold-400 transition-colors"><Plus size={12} strokeWidth={4} /></button>}
                </div>

                {/* 点赞 */}
                <button onClick={e => onLike(p, e)} className="flex flex-col items-center gap-1 group">
                  <div className={clsx("p-3 bg-black/40 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-all", p.isLiked && "bg-red-500/20")}>
                    <Heart size={28} className={clsx("transition-all", p.isLiked ? "fill-red-500 text-red-500 scale-110" : "text-white group-hover:scale-110")} />
                  </div>
                  <span className="text-xs font-medium shadow-sm text-white">{fmtNum(p.stats.likeCount)}</span>
                </button>

                {/* 评论 */}
                <button onClick={e => openComment(p, e)} className="flex flex-col items-center gap-1 group">
                  <div className="p-3 bg-black/40 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-colors"><MessageCircle size={28} className="text-white" /></div>
                  <span className="text-xs font-medium shadow-sm text-white">{fmtNum(p.stats.commentCount)}</span>
                </button>

                {/* 收藏 */}
                <button onClick={e => onCollect(p, e)} className="flex flex-col items-center gap-1 group">
                  <div className={clsx("p-3 bg-black/40 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-all", p.isCollected && "bg-gold-500/20")}>
                    <Bookmark size={28} className={clsx("transition-all", p.isCollected ? "fill-gold-500 text-gold-500" : "text-white")} />
                  </div>
                  <span className="text-xs font-medium shadow-sm text-white">{fmtNum(p.stats.collectionCount)}</span>
                </button>

                {/* 分享 */}
                <button onClick={e => openShare(p, e)} className="flex flex-col items-center gap-1 group">
                  <div className="p-3 bg-black/40 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-colors"><Share2 size={28} className="text-white" /></div>
                  <span className="text-xs font-medium shadow-sm text-white">{fmtNum(p.stats.shareCount)}</span>
                </button>

                {/* 音乐 */}
                {p.music && (
                  <div className="w-12 h-12 rounded-full bg-ink-900 border-4 border-ink-800 flex items-center justify-center animate-spin-slow overflow-hidden">
                    <div className="w-full h-full bg-gold-500/20 flex items-center justify-center">
                      <img src={getImageUrl(p.author.avatar)} className="w-6 h-6 rounded-full opacity-80" alt="Music" />
                    </div>
                  </div>
                )}
              </div>

              {/* 底部信息 */}
              <div className="absolute bottom-0 left-0 w-full p-6 z-10 pr-20 pointer-events-none">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-white shadow-sm">@{p.author.username}</h3>
                  {p.author.isVerified && <span className="px-2 py-0.5 bg-gold-500/20 border border-gold-500/30 rounded text-[10px] text-gold-300 font-medium">创作者</span>}
                </div>
                <p className="text-white/90 text-sm mb-4 leading-relaxed shadow-sm line-clamp-2">{p.description}</p>
                {p.music && (
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Music2 size={14} />
                    <div className="overflow-hidden w-32">
                      <div className="animate-marquee whitespace-nowrap">{p.music.name}{p.music.artist && ` - ${p.music.artist}`}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 桌面装饰 */}
            <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 w-64 text-left">
              <div className={clsx("transition-all duration-500 delay-300", active === i ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10")}>
                <h2 className="text-4xl font-serif text-gold-100 mb-4">文化共创</h2>
                <p className="text-mist-300 text-sm leading-relaxed">在这里，传统不再是博物馆里的陈列品，而是年轻人表达个性的新语言。</p>
              </div>
            </div>
          </div>
        ))}

        {/* 加载中 */}
        {loading && <div className="h-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>}
      </div>

      {/* 发布按钮 */}
      <button onClick={() => nav('/create')} className="fixed bottom-24 right-6 lg:bottom-12 lg:right-12 w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/20 z-50 hover:scale-110 transition-transform group">
        <Plus size={28} className="text-ink-900 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* 评论弹窗 */}
      <CommentSheet isOpen={commentOpen} onClose={() => setCommentOpen(false)} postId={selPost?._id || ''} commentCount={selPost?.stats.commentCount || 0} onCommentAdded={onCommentAdd} />

      {/* 分享弹窗 */}
      <ShareSheet isOpen={shareOpen} onClose={() => setShareOpen(false)} postId={selPost?._id || ''} onShareSuccess={onShareOk} />

      {/* 动画样式 */}
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 10s linear infinite; }
        @keyframes heart-burst { 0% { transform: scale(0); opacity: 1; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        .animate-heart-burst { animation: heart-burst 1s ease-out forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}