import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Calendar, Lock, Camera, ArrowLeft, AlertCircle, CheckCircle, Heart, UserPlus, Grid3X3, Bookmark, MessageCircle } from 'lucide-react';
import { userApi, followApi, postApi, imgUrl } from '@/utils/api';

// 类型定义，这堆interface看着头疼
interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  createdAt: string;
}

interface UserStats {
  followerCount: number;
  followingCount: number;
  likeCount: number;
  postCount: number;
}

interface Post {
  _id: string;
  description: string;
  mediaType: 'image' | 'video';
  media: string[];
  stats: {
    likeCount: number;
    commentCount: number;
    collectionCount: number;
  };
  createdAt: string;
}

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const nav = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ followerCount: 0, followingCount: 0, likeCount: 0, postCount: 0 });
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [curUid, setCurUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [tab, setTab] = useState<'posts' | 'likes' | 'collections'>('posts');

  // 编辑相关
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', bio: '' });

  // 改密码相关
  const [chgPwd, setChgPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ cur: '', new: '', confirm: '' });

  // 头像上传
  const [uploading, setUploading] = useState(false);

  // 分页
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 初始化，逻辑有点乱，后面再整理
  useEffect(() => {
    const init = async () => {
      try {
        const me = await userApi.getProfile() as { success: boolean; data?: UserProfile };
        if (me.success && me.data) setCurUid(me.data._id);

        const tid = userId || (me.success && me.data?._id);
        if (tid) {
          const u = await userApi.getUser(tid) as { success: boolean; data: UserProfile };
          if (u.success && u.data) {
            setUser(u.data);
            setForm({ username: u.data.username, bio: u.data.bio || '' });
            await getStats(tid);
            await getPosts(tid, 1);

            // 检查关注状态，只有看别人主页时才查
            if (me.success && me.data && userId && userId !== me.data._id) {
              const f = await followApi.check(userId) as { success: boolean; data: { following: boolean } };
              if (f.success) setIsFollowing(f.data.following);
            }
          }
        }
      } catch (e: any) {
        console.error('获取用户信息失败:', e);
        if (!userId) {
          setErr('请先登录以查看个人资料');
          setTimeout(() => nav('/login'), 1500);
        } else {
          setErr(e.message || '获取用户信息失败');
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId, nav]);

  // 获取统计，粉丝数要单独请求，有点麻烦
  const getStats = async (uid: string) => {
    try {
      const p = await postApi.userPosts(uid, 1, 100) as { success: boolean; data: Post[] };
      const list = p.success ? p.data : [];
      const likes = list.reduce((s, x) => s + (x.stats?.likeCount || 0), 0);

      // 粉丝数还得调另一个接口，这设计有点坑
      const f = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/follows/${uid}/stats`, { credentials: 'include' });
      const fd = await f.json();

      setStats({
        followerCount: fd.success ? fd.data.followerCount : 0,
        followingCount: fd.success ? fd.data.followingCount : 0,
        likeCount: likes,
        postCount: list.length
      });
    } catch (e) {
      console.error('获取统计信息失败:', e);
    }
  };

  // 获取帖子列表
  const getPosts = async (uid: string, pg: number) => {
    try {
      const r = await postApi.userPosts(uid, pg, 12) as { success: boolean; data: Post[]; pagination?: { total: number } };
      if (r.success) {
        if (pg === 1) setPosts(r.data);
        else setPosts(p => [...p, ...r.data]);
        setHasMore(r.data.length === 12);
        setPage(pg);
      }
    } catch (e) {
      console.error('获取帖子失败:', e);
    }
  };

  // 加载更多
  const more = () => { if (user && hasMore) getPosts(user._id, page + 1); };

  // 关注/取关
  const follow = async () => {
    if (!user || !curUid) return;
    try {
      const r = await followApi.toggle(user._id) as { success: boolean; data: { following: boolean } };
      if (r.success) {
        setIsFollowing(r.data.following);
        setStats(p => ({ ...p, followerCount: p.followerCount + (r.data.following ? 1 : -1) }));
      }
    } catch (e: any) { setErr(e.message || '操作失败'); }
  };

  // 更新资料
  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setOkMsg('');
    try {
      if (!user?._id) return;
      const r = await userApi.update(user._id, form) as { success: boolean; data: UserProfile };
      if (r.success && r.data) {
        setUser(r.data);
        setOkMsg('个人资料更新成功！');
        setEditing(false);
        setTimeout(() => setOkMsg(''), 3000);
      }
    } catch (e: any) { setErr(e.message || '更新失败'); }
  };

  // 改密码，校验逻辑有点啰嗦
  const chgPwdFn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setOkMsg('');
    try {
      if (!user?._id) return;
      if (pwdForm.new !== pwdForm.confirm) { setErr('两次输入的密码不一致'); return; }
      if (pwdForm.new.length < 6) { setErr('新密码长度至少为6位'); return; }
      const r = await userApi.changePwd(user._id, { currentPassword: pwdForm.cur, newPassword: pwdForm.new });
      if (r.success) {
        setOkMsg('密码修改成功！');
        setChgPwd(false);
        setPwdForm({ cur: '', new: '', confirm: '' });
        setTimeout(() => setOkMsg(''), 3000);
      }
    } catch (e: any) { setErr(e.message || '修改密码失败'); }
  };

  // 上传头像，限制类型和大小
  const upAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?._id) return;
    const types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!types.includes(file.type)) { setErr('只支持上传图片文件'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('图片大小不能超过5MB'); return; }
    setErr(''); setUploading(true);
    try {
      const r = await userApi.uploadAvatar(user._id, file);
      if (r.success && r.data) {
        setUser({ ...user!, avatar: r.data.avatar });
        setOkMsg('头像上传成功！');
        setTimeout(() => setOkMsg(''), 3000);
      }
    } catch (e: any) { setErr(e.message || '上传头像失败'); }
    finally { setUploading(false); }
  };

  const isOwn = curUid && user && curUid === user._id;

  // loading状态
  if (loading) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  // 用户不存在
  if (!user) {
    return (
      <div className="min-h-screen bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-mist-300 mb-4">用户不存在</p>
          <button onClick={() => nav('/')} className="px-6 py-2 bg-gold-500 text-ink-900 rounded-full">返回首页</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 py-20">
      <div className="container-custom max-w-4xl">
        <button onClick={() => nav('/')} className="flex items-center gap-2 text-mist-300 hover:text-gold-500 transition-colors mb-8">
          <ArrowLeft size={20} /><span>返回首页</span>
        </button>

        {/* 错误提示 */}
        {err && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{err}</p>
          </div>
        )}

        {/* 成功提示 */}
        {okMsg && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
            <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{okMsg}</p>
          </div>
        )}

        <div className="bg-ink-800/50 backdrop-blur-lg border border-white/5 rounded-2xl overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-gold-500/10 to-transparent p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* 头像 */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gold-500/30">
                  <img src={imgUrl(user.avatar)} alt={user.username} className="w-full h-full object-cover" />
                </div>
                {isOwn && (
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} className="text-white" />
                    <input type="file" accept="image/*" onChange={upAvatar} className="hidden" disabled={uploading} />
                  </label>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* 基本信息 */}
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-serif text-gold-100">{user.username}</h1>
                  {user.isVerified && (
                    <div className="w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center" title="已验证">
                      <CheckCircle size={14} className="text-ink-900" />
                    </div>
                  )}
                </div>
                <p className="text-mist-300 mb-4">{user.bio || '这个人很懒，还没有填写个人简介'}</p>
                <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-mist-500">
                  <div className="flex items-center gap-2"><Mail size={16} /><span>{user.email}</span></div>
                  <div className="flex items-center gap-2"><Calendar size={16} /><span>加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}</span></div>
                </div>
              </div>

              {/* 操作按钮 */}
              {isOwn ? (
                <div className="flex flex-col gap-3">
                  <button onClick={() => setEditing(!editing)} className="px-6 py-2 bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium rounded-full transition-all">
                    {editing ? '取消编辑' : '编辑资料'}
                  </button>
                  <button onClick={() => setChgPwd(!chgPwd)} className="px-6 py-2 border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 font-medium rounded-full transition-all flex items-center gap-2">
                    <Lock size={16} />修改密码
                  </button>
                </div>
              ) : curUid && (
                <button onClick={follow} className={`px-8 py-3 font-medium rounded-full transition-all flex items-center gap-2 ${isFollowing ? 'bg-ink-700 text-mist-300 border border-white/10 hover:bg-red-500/20 hover:text-red-400' : 'bg-gold-500 hover:bg-gold-300 text-ink-900'}`}>
                  <UserPlus size={18} />{isFollowing ? '已关注' : '关注'}
                </button>
              )}
            </div>

            {/* 统计数据 */}
            <div className="mt-8 flex justify-center md:justify-start gap-8">
              <div className="text-center">
                <p className="text-2xl font-serif text-gold-100">{stats.postCount}</p>
                <p className="text-sm text-mist-500">帖子</p>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => nav(`/profile/${user._id}/followers`)}>
                <p className="text-2xl font-serif text-gold-100">{stats.followerCount}</p>
                <p className="text-sm text-mist-500">粉丝</p>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => nav(`/profile/${user._id}/following`)}>
                <p className="text-2xl font-serif text-gold-100">{stats.followingCount}</p>
                <p className="text-sm text-mist-500">关注</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-serif text-gold-100">{stats.likeCount}</p>
                <p className="text-sm text-mist-500">获赞</p>
              </div>
            </div>
          </div>

          {/* 编辑资料表单 */}
          {editing && isOwn && (
            <div className="p-8 border-t border-white/5">
              <h2 className="text-xl font-serif text-gold-100 mb-6">编辑个人资料</h2>
              <form onSubmit={update} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-mist-300">用户名</label>
                  <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 px-4 text-mist-100 focus:outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-mist-300">个人简介</label>
                  <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} maxLength={200} placeholder="介绍一下自己吧..." className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 px-4 text-mist-100 focus:outline-none focus:border-gold-500/50 transition-colors resize-none" />
                  <p className="text-xs text-mist-500">{form.bio.length}/200</p>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium py-3 px-6 rounded-xl transition-all">保存修改</button>
                  <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-white/10 text-mist-300 hover:bg-white/5 font-medium py-3 px-6 rounded-xl transition-all">取消</button>
                </div>
              </form>
            </div>
          )}

          {/* 修改密码表单 */}
          {chgPwd && isOwn && (
            <div className="p-8 border-t border-white/5">
              <h2 className="text-xl font-serif text-gold-100 mb-6">修改密码</h2>
              <form onSubmit={chgPwdFn} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-mist-300">当前密码</label>
                  <input type="password" value={pwdForm.cur} onChange={e => setPwdForm({ ...pwdForm, cur: e.target.value })} className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 px-4 text-mist-100 focus:outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-mist-300">新密码</label>
                  <input type="password" value={pwdForm.new} onChange={e => setPwdForm({ ...pwdForm, new: e.target.value })} className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 px-4 text-mist-100 focus:outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-mist-300">确认新密码</label>
                  <input type="password" value={pwdForm.confirm} onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 px-4 text-mist-100 focus:outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium py-3 px-6 rounded-xl transition-all">修改密码</button>
                  <button type="button" onClick={() => setChgPwd(false)} className="flex-1 border border-white/10 text-mist-300 hover:bg-white/5 font-medium py-3 px-6 rounded-xl transition-all">取消</button>
                </div>
              </form>
            </div>
          )}

          {/* 标签页 */}
          <div className="border-t border-white/5">
            <div className="flex">
              <button onClick={() => setTab('posts')} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${tab === 'posts' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-mist-500 hover:text-mist-300'}`}>
                <Grid3X3 size={18} /><span>帖子</span>
              </button>
              {isOwn && (
                <>
                  <button onClick={() => setTab('likes')} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${tab === 'likes' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-mist-500 hover:text-mist-300'}`}>
                    <Heart size={18} /><span>喜欢</span>
                  </button>
                  <button onClick={() => setTab('collections')} className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${tab === 'collections' ? 'text-gold-500 border-b-2 border-gold-500' : 'text-mist-500 hover:text-mist-300'}`}>
                    <Bookmark size={18} /><span>收藏</span>
                  </button>
                </>
              )}
            </div>

            {/* 帖子列表 */}
            <div className="p-4">
              {posts.length === 0 ? (
                <div className="text-center py-12 text-mist-500">
                  <Grid3X3 size={48} className="mx-auto mb-4 opacity-30" />
                  <p>还没有发布任何内容</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1">
                    {posts.map(p => (
                      <div key={p._id} onClick={() => nav(`/share?post=${p._id}`)} className="aspect-square relative cursor-pointer group overflow-hidden">
                        {p.mediaType === 'video' ? (
                          <video src={p.media[0]} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={imgUrl(p.media[0])} alt="" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                          <span className="flex items-center gap-1"><Heart size={16} /> {p.stats?.likeCount || 0}</span>
                          <span className="flex items-center gap-1"><MessageCircle size={16} /> {p.stats?.commentCount || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {hasMore && <button onClick={more} className="w-full mt-4 py-3 text-mist-500 hover:text-gold-500 transition-colors">加载更多</button>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}