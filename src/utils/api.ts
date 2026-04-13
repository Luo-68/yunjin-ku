// 后端地址 - 使用空字符串表示相对路径，通过nginx代理访问API
const HOST = import.meta.env.VITE_API_URL || '';

// 返回格式
interface Res<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// 核心请求，后面可以加重试逻辑
async function req<T>(path: string, opts: RequestInit = {}): Promise<Res<T>> {
  const url = `${HOST}${path}`;
  
  const cfg: RequestInit = {
    credentials: 'include',  // 不带cookie登录状态会丢
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  };

  const res = await fetch(url, cfg);
  const data = await res.json();
  
  console.log('[API]', opts.method || 'GET', path, 'status:', res.status, 'response:', data);
  
  if (!res.ok) {
    const errMsg = data.error || data.message || `请求失败(${res.status})`;
    throw new Error(errMsg);
  }
  return data;
}


// 登录

export const auth = {
  sendCode: (params: { email: string }) =>
    req('/api/auth/register/send-code', { method: 'POST', body: JSON.stringify(params) }),
  
  // 注册要传4个字段，有点多后面可以精简
  register: (params: { username: string; email: string; password: string; verificationCode: string }) =>
    req('/api/auth/register', { method: 'POST', body: JSON.stringify(params) }),
  
  login: (params: { email: string; password: string }) =>
    req('/api/auth/login', { method: 'POST', body: JSON.stringify(params) }),
  
  getMe: () => req('/api/auth/me'),
  
  logout: () => req('/api/auth/logout', { method: 'POST' }),
  
  // 邮箱验证相关，这几个接口可能后面要整理一下
  verifyEmail: (params: { token: string }) =>
    req('/api/auth/verify-email', { method: 'POST', body: JSON.stringify(params) }),
  
  resendVerification: (params: { email: string }) =>
    req('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify(params) }),
  
  sendVerificationCode: (params: { email: string }) =>
    req('/api/auth/send-verification-code', { method: 'POST', body: JSON.stringify(params) }),
  
  verifyEmailCode: (params: { email: string; code: string }) =>
    req('/api/auth/verify-email-code', { method: 'POST', body: JSON.stringify(params) }),
  
  forgotPwd: (params: { email: string }) =>
    req('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(params) }),
  
  resetPwd: (params: { token: string; newPassword: string }) =>
    req('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(params) }),
};


// 用户

export const user = {
  getProfile: () => req('/api/users/me/profile'),
  
  getUser: (id: string) => req(`/api/users/${id}`),
  
  update: (id: string, params: { username?: string; bio?: string }) =>
    req(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(params) }),
  
  changePwd: (id: string, params: { currentPassword: string; newPassword: string }) =>
    req(`/api/users/${id}/password`, { method: 'PUT', body: JSON.stringify(params) }),
  
  // 头像上传用FormData，不走req函数
  uploadAvatar: async (id: string, file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    const res = await fetch(`${HOST}/api/users/${id}/avatar`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    return res.json();
  },
};


// 识别

export const recognize = {
  check: (image: string) =>
    req('/api/recognition', { method: 'POST', body: JSON.stringify({ image }) }),
};


// 画廊

export const gallery = {
  get: () => req('/api/gallery'),
};


// 帖子

export const post = {
  feed: (page = 1, limit = 10) =>
    req(`/api/posts/feed?page=${page}&limit=${limit}`),
  
  get: (id: string) => req(`/api/posts/${id}`),
  
  userPosts: (id: string, page = 1, limit = 10) =>
    req(`/api/posts/user/${id}?page=${page}&limit=${limit}`),
  
  // 发帖参数比较多，后面看能不能拆分
  create: async (data: {
    description: string;
    mediaType: 'image' | 'video';
    media: File[];
    cover?: File;
    music?: { name: string; artist?: string; url?: string };
    tags?: string[];
    topics?: string[];
    location?: string;
  }) => {
    const fd = new FormData();
    fd.append('description', data.description);
    fd.append('mediaType', data.mediaType);
    data.media.forEach(file => fd.append('media', file));
    if (data.cover) fd.append('cover', data.cover);
    if (data.music) fd.append('music', JSON.stringify(data.music));
    if (data.tags) fd.append('tags', JSON.stringify(data.tags));
    if (data.topics) fd.append('topics', JSON.stringify(data.topics));
    if (data.location) fd.append('location', data.location);
    
    const res = await fetch(`${HOST}/api/posts`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    return res.json();
  },
  
  createBase64: (params: {
    description: string;
    mediaType: 'image' | 'video';
    mediaUrls: string[];
    coverUrl?: string;
    music?: { name: string; artist?: string; url?: string };
    tags?: string[];
    topics?: string[];
    location?: string;
  }) => req('/api/posts/base64', { method: 'POST', body: JSON.stringify(params) }),
  
  delete: (id: string) => req(`/api/posts/${id}`, { method: 'DELETE' }),
  
  search: (q: string, page = 1, limit = 10) =>
    req(`/api/posts/search/q?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),
};


// 点赞

export const like = {
  // toggle是切换状态，点了就变
  toggle: (postId: string) => req(`/api/likes/${postId}`, { method: 'POST' }),
  check: (postId: string) => req(`/api/likes/${postId}/check`),
  list: (postId: string, page = 1, limit = 20) =>
    req(`/api/likes/${postId}/likes?page=${page}&limit=${limit}`),
  userLikes: (userId: string, page = 1, limit = 20) =>
    req(`/api/likes/user/${userId}?page=${page}&limit=${limit}`),
};


// 评论

export const comment = {
  get: (postId: string, page = 1, limit = 20) =>
    req(`/api/comments/${postId}?page=${page}&limit=${limit}`),
  
  add: (postId: string, params: { content: string; parentId?: string }) =>
    req(`/api/comments/${postId}`, { method: 'POST', body: JSON.stringify(params) }),
  
  delete: (id: string) => req(`/api/comments/${id}`, { method: 'DELETE' }),
  
  // 子评论的分页，这个接口可能要优化
  replies: (id: string, page = 1, limit = 10) =>
    req(`/api/comments/${id}/replies?page=${page}&limit=${limit}`),
  
  like: (id: string) => req(`/api/comments/${id}/like`, { method: 'POST' }),
};


// 收藏

export const collect = {
  toggle: (postId: string) => req(`/api/collections/${postId}`, { method: 'POST' }),
  check: (postId: string) => req(`/api/collections/${postId}/check`),
  list: (userId: string, page = 1, limit = 20) =>
    req(`/api/collections/user/${userId}?page=${page}&limit=${limit}`),
};


// 关注

export const follow = {
  // 跟点赞一样是toggle逻辑
  toggle: (userId: string) => req(`/api/follows/${userId}`, { method: 'POST' }),
  check: (userId: string) => req(`/api/follows/${userId}/check`),
  fans: (userId: string, page = 1, limit = 20) =>
    req(`/api/follows/${userId}/followers?page=${page}&limit=${limit}`),
  following: (userId: string, page = 1, limit = 20) =>
    req(`/api/follows/${userId}/following?page=${page}&limit=${limit}`),
};


// 通知

export const notice = {
  get: (type?: string, onlyUnread?: boolean) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (onlyUnread) params.append('unreadOnly', 'true');
    return req(`/api/notifications?${params.toString()}`);
  },
  unreadCount: () => req('/api/notifications/unread-count'),
  markRead: (id: string) => req(`/api/notifications/${id}/read`, { method: 'PUT' }),
  readAll: () => req('/api/notifications/read-all', { method: 'PUT' }),
};


// 私信

export const msg = {
  // 先检查能不能发，互关才能私信
  canSend: (userId: string) => req(`/api/messages/can-message/${userId}`),
  
  send: (recipientId: string, content: string) =>
    req('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content, type: 'text' }),
    }),
  
  // 发图片视频用这个，FormData格式
  sendMedia: async (recipientId: string, file: File, content?: string) => {
    const fd = new FormData();
    fd.append('recipientId', recipientId);
    fd.append('media', file);
    if (content) fd.append('content', content);
    const res = await fetch(`${HOST}/api/messages/send-media`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '发送失败');
    return data;
  },
  
  conversations: (page = 1, limit = 20) =>
    req(`/api/messages/conversations?page=${page}&limit=${limit}`),
  
  history: (userId: string, page = 1, limit = 30) =>
    req(`/api/messages/messages/${userId}?page=${page}&limit=${limit}`),
  
  markRead: (userId: string) => req(`/api/messages/read/${userId}`, { method: 'PUT' }),
  
  unreadCount: () => req('/api/messages/unread-count'),
  
  mutuals: () => req('/api/messages/mutual-follows'),
};


// 弹幕

export const danmaku = {
  send: (postId: string, params: { content: string; time: number; color?: string; position?: string }) =>
    req(`/api/danmakus/${postId}`, { method: 'POST', body: JSON.stringify(params) }),
  
  get: (postId: string) => req(`/api/danmakus/${postId}`),
  
  delete: (id: string) => req(`/api/danmakus/${id}`, { method: 'DELETE' }),
  
  stats: (postId: string) => req(`/api/danmakus/${postId}/stats`),
};

// 图片URL处理，相对路径要补全
export const imgUrl = (url?: string): string => {
  if (!url) return 'https://cdn.wegic.ai/assets/onepage/agent/images/1764573456796.png?imageMogr2/format/webp';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${HOST}${url}`;
  return 'https://cdn.wegic.ai/assets/onepage/agent/images/1764573456796.png?imageMogr2/format/webp';
};

// 兼容旧命名，后面统一改成新的
export const getImageUrl = imgUrl;
export const authApi = auth;
export const userApi = user;
export const recognitionApi = recognize;
export const galleryApi = gallery;
export const postApi = post;
export const likeApi = like;
export const commentApi = comment;
export const collectionApi = collect;
export const followApi = follow;
export const notificationApi = notice;
export const messageApi = msg;
export const danmakuApi = danmaku;

export default { auth, user, recognize, gallery, post, like, comment, collect, follow, notice, msg, danmaku, imgUrl };
