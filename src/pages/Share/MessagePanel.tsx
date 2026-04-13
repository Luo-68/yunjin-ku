import { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, UserPlus, AtSign, Bell, Send, Image as ImageIcon, ChevronLeft, UserMinus, Phone, MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import { getImageUrl, notificationApi, messageApi, followApi } from '../../utils/api';

// 类型定义
interface Notif {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  sender: { _id: string; username: string; avatar?: string };
  post?: { _id: string; mediaUrls?: string[] };
  content?: string;
  createdAt: string;
  isRead: boolean;
}

interface Usr {
  _id: string;
  username: string;
  avatar?: string;
}

interface Msg {
  _id: string;
  sender: Usr;
  recipient: Usr;
  content: string;
  type: 'text' | 'image' | 'video';
  media?: string;
  createdAt: string;
  isRead: boolean;
}

interface Conv {
  _id: string;
  user: Usr;
  lastMessage?: Msg;
  lastMessageAt: string;
  unreadCount: number;
}

interface Props {
  onClose: () => void;
  onUnreadChange?: (n: number) => void;
}

// 时间格式化 - 这段可以抽出去复用
const fmtTime = (s: string): string => {
  const d = new Date(s);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);

  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  if (h < 24) return `${h}小时前`;
  if (day < 7) return `${day}天前`;
  return d.toLocaleDateString('zh-CN');
};

// 消息时间
const fmtMsg = (s: string): string => {
  const d = new Date(s);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

export default function MsgPanel({ onClose, onUnreadChange }: Props) {
  // tab状态
  const [tab, setTab] = useState<'notifications' | 'messages'>('notifications');
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  
  // 私信状态
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [target, setTarget] = useState<Usr | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 可私信的好友
  const [mutuals, setMutuals] = useState<Usr[]>([]);

  // 初始加载
  useEffect(() => {
    loadNotif();
    loadUnread();
  }, []);

  useEffect(() => {
    if (notifs.length > 0) checkFollows();
  }, [notifs]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // 切换到私信时加载
  useEffect(() => {
    if (tab === 'messages') {
      loadConvs();
      loadMutuals();
    }
  }, [tab]);

  // 进入聊天聚焦输入框
  useEffect(() => {
    if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 100);
  }, [view]);

  const loadNotif = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.get() as { success: boolean; data: Notif[] };
      if (res.success && res.data) setNotifs(res.data);
    } catch (e) {
      console.error('加载通知失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUnread = async () => {
    try {
      const res = await notificationApi.unreadCount() as { success: boolean; data: { count: number } };
      if (res.success && res.data) {
        setUnread(res.data.count);
        onUnreadChange?.(res.data.count);
      }
    } catch (e) {
      console.error('加载未读数失败:', e);
    }
  };

  const checkFollows = async () => {
    const ids = [...new Set(notifs.map(n => n.sender._id))];
    const st: Record<string, boolean> = {};
    for (const id of ids) {
      try {
        const res = await followApi.check(id) as { success: boolean; data: { following: boolean } };
        if (res.success) st[id] = res.data.following;
      } catch (e) {
        console.error('检查关注状态失败:', e);
      }
    }
    setFollows(st);
  };

  const toggleFollow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await followApi.toggle(id) as { success: boolean; data: { following: boolean } };
      if (res.success) setFollows(prev => ({ ...prev, [id]: res.data.following }));
    } catch (e) {
      console.error('关注操作失败:', e);
    }
  };

  // 从通知发起私信
  const startChat = async (u: Usr, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await messageApi.canSend(u._id) as { success: boolean; data: { canMessage: boolean; reason: string } };
      if (res.success && res.data.canMessage) {
        setTarget(u);
        setView('chat');
        setTab('messages');
        setMsgs([]);
        loadMsgs(u._id);
      } else {
        alert(res.data?.reason || '需要互相关注才能发送私信');
      }
    } catch (e) {
      console.error('检查私信权限失败:', e);
    }
  };

  const loadConvs = async () => {
    setLoadingMsg(true);
    try {
      const res = await messageApi.conversations() as { success: boolean; data: Conv[] };
      if (res.success) setConvs(res.data || []);
    } catch (e) {
      console.error('加载会话失败:', e);
    } finally {
      setLoadingMsg(false);
    }
  };

  const loadMutuals = async () => {
    try {
      const res = await messageApi.mutuals() as { success: boolean; data: Usr[] };
      if (res.success) setMutuals(res.data || []);
    } catch (e) {
      console.error('加载互关好友失败:', e);
    }
  };

  const loadMsgs = async (id: string) => {
    setLoadingMsg(true);
    try {
      const res = await messageApi.history(id) as { success: boolean; data: Msg[] };
      if (res.success) {
        setMsgs(res.data || []);
        await messageApi.markRead(id);
        setConvs(prev => prev.map(c => 
          c.user._id === id ? { ...c, unreadCount: 0 } : c
        ));
      }
    } catch (e) {
      console.error('加载消息失败:', e);
    } finally {
      setLoadingMsg(false);
    }
  };

  // 发送消息
  const sendMsg = async () => {
    if (!target || !input.trim() || sending) return;
    
    setSending(true);
    try {
      const res = await messageApi.send(target._id, input.trim()) as { success: boolean; data?: Msg; error?: string };
      
      if (res.success && res.data) {
        setMsgs(prev => [...prev, res.data!]);
        setInput('');
        loadConvs();
      } else {
        alert(res.error || '发送失败');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '发送失败';
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  // 发送图片
  const sendImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !target) return;
    setSending(true);
    try {
      const res = await messageApi.sendMedia(target._id, f) as { success: boolean; data?: Msg; error?: string };
      if (res.success && res.data) {
        setMsgs(prev => [...prev, res.data!]);
        loadConvs();
      } else {
        alert(res.error || '发送失败');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '发送失败';
      alert(msg);
    } finally {
      setSending(false);
      e.target.value = '';
    }
  };

  const selectConv = (c: Conv) => {
    setTarget(c.user);
    setView('chat');
    loadMsgs(c.user._id);
  };

  const selectFriend = (u: Usr) => {
    setTarget(u);
    setView('chat');
    setMsgs([]);
    loadMsgs(u._id);
  };

  const markRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      const n = Math.max(0, unread - 1);
      setUnread(n);
      onUnreadChange?.(n);
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error('标记已读失败:', e);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.readAll();
      setUnread(0);
      onUnreadChange?.(0);
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('标记全部已读失败:', e);
    }
  };

  // 通知图标
  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={16} className="text-red-400 fill-red-400" />;
      case 'comment': return <MessageCircle size={16} className="text-blue-400" />;
      case 'follow': return <UserPlus size={16} className="text-emerald-400" />;
      case 'mention': return <AtSign size={16} className="text-violet-400" />;
      default: return <Bell size={16} className="text-gray-400" />;
    }
  };

  // 通知文本
  const getText = (n: Notif) => {
    switch (n.type) {
      case 'like': return '赞了你的作品';
      case 'comment': return `评论：${n.content}`;
      case 'follow': return '关注了你';
      case 'mention': return n.content;
      default: return '';
    }
  };

  const msgUnread = convs.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md h-[85vh] bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
        
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-slate-900/80 flex-shrink-0">
          {view === 'chat' ? (
            <>
              <button onClick={() => setView('list')} className="flex items-center gap-1 text-white/80 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span>返回</span>
              </button>
              <div className="flex items-center gap-3">
                <img src={getImageUrl(target?.avatar)} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-semibold text-white">{target?.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                  <Phone size={18} />
                </button>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                  <MoreVertical size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white">消息</h2>
              <div className="flex items-center gap-2">
                {unread > 0 && tab === 'notifications' && (
                  <button onClick={markAllRead} className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
                    全部已读
                  </button>
                )}
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} className="text-white/80" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 标签栏 */}
        {view === 'list' && (
          <div className="flex bg-slate-900/50 flex-shrink-0">
            <button
              onClick={() => setTab('notifications')}
              className={clsx(
                "flex-1 py-3 text-center font-medium transition-all relative",
                tab === 'notifications' ? "text-white" : "text-white/50 hover:text-white/70"
              )}
            >
              通知
              {unread > 0 && (
                <span className="absolute top-2 right-6 min-w-5 h-5 bg-rose-500 rounded-full text-xs flex items-center justify-center text-white px-1.5">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
              {tab === 'notifications' && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setTab('messages')}
              className={clsx(
                "flex-1 py-3 text-center font-medium transition-all relative",
                tab === 'messages' ? "text-white" : "text-white/50 hover:text-white/70"
              )}
            >
              私信
              {msgUnread > 0 && (
                <span className="absolute top-2 right-6 min-w-5 h-5 bg-rose-500 rounded-full text-xs flex items-center justify-center text-white px-1.5">
                  {msgUnread > 99 ? '99+' : msgUnread}
                </span>
              )}
              {tab === 'messages' && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full" />
              )}
            </button>
          </div>
        )}

        {/* 聊天界面 */}
        {view === 'chat' ? (
          <>
            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsg ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : msgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <p>发送第一条消息吧</p>
                  <p className="text-sm mt-1">互相关注后可以畅聊</p>
                </div>
              ) : (
                msgs.map((msg, idx) => {
                  const mine = msg.sender._id !== target?._id;
                  // 5分钟显示一次时间
                  const showT = idx === 0 || 
                    new Date(msgs[idx - 1].createdAt).getTime() - new Date(msg.createdAt).getTime() > 300000;
                  
                  return (
                    <div key={msg._id}>
                      {showT && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">
                            {fmtMsg(msg.createdAt)}
                          </span>
                        </div>
                      )}
                      
                      <div className={clsx("flex items-end gap-2", mine ? "flex-row-reverse" : "flex-row")}>
                        <img
                          src={getImageUrl(msg.sender.avatar)}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-white/10"
                        />
                        <div className={clsx("max-w-[70%]", mine ? "mr-1" : "ml-1")}>
                          {msg.type === 'text' ? (
                            <div className={clsx(
                              "px-4 py-2.5 rounded-2xl shadow-lg",
                              mine 
                                ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-md" 
                                : "bg-white/10 text-white rounded-bl-md"
                            )}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ) : msg.type === 'image' ? (
                            <img src={getImageUrl(msg.media)} className="max-w-[200px] rounded-2xl shadow-lg" />
                          ) : (
                            <video src={getImageUrl(msg.media)} controls className="max-w-[200px] rounded-2xl shadow-lg" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={msgEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="flex items-center gap-3 p-4 bg-slate-900/90 border-t border-white/5 flex-shrink-0">
              <label className="p-2.5 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-all">
                <ImageIcon className="w-5 h-5" />
                <input type="file" accept="image/*,video/*" onChange={sendImg} className="hidden" disabled={sending} />
              </label>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMsg()}
                  placeholder="发送消息..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white text-sm placeholder-white/30 focus:outline-none focus:border-pink-400/50 focus:bg-white/10 transition-all"
                  disabled={sending}
                />
              </div>
              <button
                onClick={sendMsg}
                disabled={!input.trim() || sending}
                className={clsx(
                  "p-2.5 rounded-full transition-all",
                  input.trim() 
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40" 
                    : "bg-white/5 text-white/30"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          /* 列表视图 */
          <div className="flex-1 overflow-y-auto">
            {tab === 'notifications' ? (
              // 通知列表
              loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifs.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markRead(n._id)}
                      className={clsx(
                        "p-4 hover:bg-white/5 transition-colors cursor-pointer group",
                        !n.isRead && "bg-sky-500/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={getImageUrl(n.sender.avatar)}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-white/20 transition-all"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center ring-2 ring-slate-900">
                            {getIcon(n.type)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm leading-relaxed">
                            <span className="font-semibold">{n.sender.username}</span>
                            <span className="text-white/60 ml-1.5">{getText(n)}</span>
                          </p>
                          <p className="text-white/30 text-xs mt-1.5">{fmtTime(n.createdAt)}</p>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={(e) => toggleFollow(n.sender._id, e)}
                              className={clsx(
                                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                                follows[n.sender._id]
                                  ? "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                                  : "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm hover:shadow-md"
                              )}
                            >
                              {follows[n.sender._id] ? <><UserMinus size={14} /> 已关注</> : <><UserPlus size={14} /> 关注</>}
                            </button>
                            <button
                              onClick={(e) => startChat(n.sender, e)}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 transition-all"
                            >
                              <MessageCircle size={14} /> 私信
                            </button>
                          </div>
                        </div>

                        {/* 帖子封面 */}
                        {n.post?.mediaUrls?.[0] && (
                          <img
                            src={getImageUrl(n.post.mediaUrls[0])}
                            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {notifs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-white/30">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Bell size={32} />
                      </div>
                      <p>暂无通知</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              // 私信列表
              <>
                {/* 可私信的好友 */}
                <div className="p-4 border-b border-white/5">
                  <p className="text-white/50 text-xs mb-3">互关好友（可私信）</p>
                  {mutuals.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {mutuals.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => selectFriend(u)}
                          className="flex flex-col items-center gap-1 cursor-pointer group flex-shrink-0"
                        >
                          <div className="relative">
                            <img
                              src={getImageUrl(u.avatar)}
                              className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-pink-400/50 transition-all"
                            />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900" />
                          </div>
                          <span className="text-white/70 text-xs group-hover:text-white transition-colors">
                            {u.username.length > 4 ? u.username.slice(0, 4) + '..' : u.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-sm">暂无互关好友</p>
                  )}
                </div>

                {/* 会话列表 */}
                <div className="flex-1">
                  <p className="px-4 pt-4 pb-2 text-white/50 text-xs">最近会话</p>
                  {loadingMsg ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-10 h-10 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : convs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-white/30">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <MessageCircle size={24} />
                      </div>
                      <p>暂无会话</p>
                      <p className="text-sm mt-1">点击上方好友开始聊天</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {convs.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => selectConv(c)}
                          className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="relative">
                            <img
                              src={getImageUrl(c.user.avatar)}
                              className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-pink-400/50 transition-all"
                            />
                            {c.unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center px-1.5 font-medium">
                                {c.unreadCount > 99 ? '99+' : c.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-white">{c.user.username}</span>
                              <span className="text-xs text-white/30">{fmtTime(c.lastMessageAt)}</span>
                            </div>
                            <p className="text-sm text-white/50 truncate mt-1">
                              {c.lastMessage?.type === 'image' ? '[ 图片 ]' : 
                               c.lastMessage?.type === 'video' ? '[ 视频 ]' : 
                               c.lastMessage?.content || '暂无消息'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
