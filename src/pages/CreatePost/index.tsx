import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Upload,
  Play,
  Image as ImageIcon,
  Hash,
  MapPin,
  Music,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
  Plus,
  Crosshair,
  Search,
} from 'lucide-react';
import clsx from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || ''; // 用相对路径，通过nginx代理

// 热门话题，后面可以换成后端接口
const HOT_TOPICS = [
  { id: 1, name: '民族服饰', count: 128500 },
  { id: 2, name: '非遗传承', count: 89600 },
  { id: 3, name: '传统手工艺', count: 67200 },
  { id: 4, name: '民族文化', count: 54300 },
  { id: 5, name: '服饰搭配', count: 45100 },
  { id: 6, name: '传统纹样', count: 38900 },
  { id: 7, name: '手工刺绣', count: 32500 },
  { id: 8, name: '民族风穿搭', count: 28700 },
];

// 推荐音乐，这个可以换成Spotify/网易云接口
const TRENDING_MUSIC = [
  { id: 1, name: '蝴蝶泉边', artist: '黄雅莉', duration: '3:45', cover: '🎵' },
  { id: 2, name: '彩云之南', artist: '徐千雅', duration: '4:12', cover: '🎵' },
  { id: 3, name: '侗族大歌', artist: '民间艺术', duration: '5:30', cover: '🎵' },
  { id: 4, name: '彝海情深', artist: '阿鲁阿卓', duration: '3:58', cover: '🎵' },
  { id: 5, name: '茉莉花', artist: '宋祖英', duration: '4:05', cover: '🎵' },
  { id: 6, name: '天路', artist: '韩红', duration: '4:32', cover: '🎵' },
  { id: 7, name: '蒙古人', artist: '腾格尔', duration: '3:28', cover: '🎵' },
  { id: 8, name: '最炫民族风', artist: '凤凰传奇', duration: '4:15', cover: '🎵' },
];

// 支持的格式，这些限制可以放开点
const VIDEO_FMT = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
const IMAGE_FMT = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMG = 9;

// 媒体文件接口
interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface Progress {
  loaded: number;
  total: number;
  percentage: number;
}

export default function CreatePost() {
  const nav = useNavigate();
  
  // 媒体相关
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [curIdx, setCurIdx] = useState(0);
  
  // 视频封面
  const [cover, setCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [selThumb, setSelThumb] = useState(0);
  
  // 表单
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loc, setLoc] = useState('');
  const [locSugs, setLocSugs] = useState<Array<{name: string; address: string; location: string}>>([]);
  const [searchingLoc, setSearchingLoc] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locKw, setLocKw] = useState('');
  const [music, setMusic] = useState('');
  
  // 话题和音乐选择
  const [topics, setTopics] = useState<string[]>([]);
  const [selMusic, setSelMusic] = useState<{ name: string; artist: string } | null>(null);
  const [showTopics, setShowTopics] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showLoc, setShowLoc] = useState(false);
  
  // 上传状态
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  
  // 定位成功提示
  const [locOk, setLocOk] = useState<string | null>(null);
  
  // 视频播放
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // 清理预览URL，避免内存泄漏
  useEffect(() => {
    return () => {
      files.forEach(m => URL.revokeObjectURL(m.preview));
      if (cover && cover.startsWith('blob:')) URL.revokeObjectURL(cover);
      thumbs.forEach(t => URL.revokeObjectURL(t));
    };
  }, []);

  // 从视频提取帧作为封面，有点慢
  const extractFrames = useCallback(async (f: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;
      v.playsInline = true;
      const url = URL.createObjectURL(f);
      v.src = url;
      const frames: string[] = [];
      
      v.onloadedmetadata = async () => {
        const dur = v.duration;
        const interval = dur / 10;
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        c.width = 720; c.height = 1280;
        
        for (let i = 0; i < 10; i++) {
          v.currentTime = i * interval;
          await new Promise<void>((res) => {
            v.onseeked = () => {
              if (ctx) { ctx.drawImage(v, 0, 0, c.width, c.height); frames.push(c.toDataURL('image/jpeg', 0.8)); }
              res();
            };
          });
        }
        URL.revokeObjectURL(url);
        resolve(frames);
      };
      v.onerror = () => { URL.revokeObjectURL(url); resolve([]); };
    });
  }, []);

  // 文件选择
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list?.length) return;

    setErr(null);
    const newFiles: MediaFile[] = [];
    let detType: 'image' | 'video' | null = null;

    for (const f of Array.from(list)) {
      const isImg = IMAGE_FMT.includes(f.type);
      const isVid = VIDEO_FMT.includes(f.type);
      
      if (!isImg && !isVid) { setErr(`不支持的格式: ${f.name}`); continue; }
      if (f.size > MAX_SIZE) { setErr(`文件太大: ${f.name}`); continue; }

      const fType = isVid ? 'video' : 'image';
      if (detType && detType !== fType) { setErr('不能同时上传图片和视频'); break; }
      if (mediaType === 'video' || (detType === 'video' && newFiles.length)) { setErr('视频只能上传一个'); break; }
      if (mediaType === 'image' && files.length + newFiles.length >= MAX_IMG) { setErr(`最多${MAX_IMG}张图片`); break; }

      detType = fType;
      newFiles.push({ file: f, preview: URL.createObjectURL(f), type: fType });
    }

    if (newFiles.length) {
      setFiles(p => [...p, ...newFiles]);
      setMediaType(detType);
      if (detType === 'video') {
        const t = await extractFrames(newFiles[0].file);
        setThumbs(t);
        if (t.length) setCover(t[0]);
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  // 选择封面帧
  const onThumb = (i: number) => { setSelThumb(i); setCover(thumbs[i]); };

  // 上传自定义封面
  const onCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!IMAGE_FMT.includes(f.type)) { setErr('请上传图片'); return; }
    setCover(URL.createObjectURL(f));
    setCoverFile(f);
    if (coverRef.current) coverRef.current.value = '';
  };

  // 删除媒体
  const rmFile = (i: number) => {
    setFiles(p => {
      const n = [...p];
      URL.revokeObjectURL(n[i].preview);
      n.splice(i, 1);
      if (!n.length) { setMediaType(null); setCover(null); setThumbs([]); setCurIdx(0); }
      else if (curIdx >= n.length) setCurIdx(n.length - 1);
      return n;
    });
  };

  // 标签操作
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 5) { setTags(p => [...p, t]); setTagInput(''); }
  };
  const rmTag = (t: string) => setTags(p => p.filter(x => x !== t));

  // 位置搜索防抖
  const locTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const searchLoc = async (kw: string) => {
    setLocKw(kw);
    if (locTimer.current) clearTimeout(locTimer.current);
    if (!kw.trim()) { setLocSugs([]); return; }
    
    locTimer.current = setTimeout(async () => {
      setSearchingLoc(true);
      try {
        const r = await fetch(`${API_URL}/api/amap/suggest?keywords=${encodeURIComponent(kw)}`);
        const d = await r.json();
        if (d.success && d.data?.tips) {
          setLocSugs(d.data.tips.filter((t: { name: string }) => t.name).map((t: { name: string; address: string; location: string }) => ({ name: t.name, address: t.address || '', location: t.location || '' })));
        } else setLocSugs([]);
      } catch { setLocSugs([]); }
      finally { setSearchingLoc(false); }
    }, 300);
  };

  // 自动定位，浏览器geolocation + 高德逆地理编码
  const autoLoc = async () => {
    if (!navigator.geolocation) { alert('浏览器不支持定位'); return; }
    setIsLocating(true);
    setLocOk(null);
    
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
      });
      const { latitude, longitude } = pos.coords;
      
      const r = await fetch(`${API_URL}/api/amap/regeo?location=${longitude},${latitude}`);
      const d = await r.json();

      if (d.success && d.data?.regeocode) {
        const addr = d.data.regeocode.addressComponent;
        let display = addr.street && addr.streetNumber ? `${addr.street}${addr.streetNumber}` :
          addr.district || (typeof addr.city === 'string' ? addr.city : addr.province) ||
          d.data.regeocode.formatted_address;
        
        setLoc(display);
        setLocSugs([]);
        setShowLoc(false);
        setLocOk(display);
        setTimeout(() => setLocOk(null), 3000);
      } else throw new Error('无法解析地址');
    } catch (e) {
      if (e instanceof GeolocationPositionError) {
        const msg = e.code === e.PERMISSION_DENIED ? '定位权限被拒绝' :
          e.code === e.POSITION_UNAVAILABLE ? '无法获取位置' :
          e.code === e.TIMEOUT ? '定位超时' : '定位失败';
        alert(msg);
      } else alert('定位失败: ' + (e instanceof Error ? e.message : '请检查网络'));
    } finally { setIsLocating(false); }
  };

  // 选择位置
  const selLoc = (s: { name: string; address: string }) => {
    setLoc(s.address ? `${s.name} (${s.address})` : s.name);
    setLocSugs([]);
    setLocKw('');
    setShowLoc(false);
  };
  const clrLoc = () => { setLoc(''); setLocKw(''); setLocSugs([]); setShowLoc(false); };

  // 话题选择
  const selTopic = (n: string) => {
    if (topics.includes(n)) setTopics(p => p.filter(t => t !== n));
    else if (topics.length < 3) setTopics(p => [...p, n]);
  };

  // 音乐选择
  const pickMusic = (m: { name: string; artist: string }) => {
    setSelMusic(m); setMusic(`${m.name} - ${m.artist}`); setShowMusic(false);
  };
  const clrMusic = () => { setSelMusic(null); setMusic(''); };

  // 视频播放
  const togglePlay = () => {
    if (videoRef.current) { playing ? videoRef.current.pause() : videoRef.current.play(); setPlaying(!playing); }
  };

  // 切换媒体
  const prevMedia = () => { if (curIdx > 0) { setCurIdx(curIdx - 1); setPlaying(false); } };
  const nextMedia = () => { if (curIdx < files.length - 1) { setCurIdx(curIdx + 1); setPlaying(false); } };

  // 提交上传
  const submit = async () => {
    if (!files.length) { setErr('请选择图片或视频'); return; }
    if (!mediaType) { setErr('无法确定媒体类型'); return; }

    setUploading(true);
    setErr(null);
    setProgress({ loaded: 0, total: 100, percentage: 0 });

    try {
      const fd = new FormData();
      fd.append('description', desc);
      fd.append('mediaType', mediaType);
      files.forEach(m => fd.append('media', m.file));

      if (mediaType === 'video' && cover) {
        if (coverFile) fd.append('cover', coverFile);
        else if (thumbs.length) {
          const r = await fetch(cover);
          fd.append('cover', new File([await r.blob()], 'cover.jpg', { type: 'image/jpeg' }));
        }
      }

      if (tags.length) fd.append('tags', JSON.stringify(tags));
      if (topics.length) fd.append('topics', JSON.stringify(topics));
      if (loc) fd.append('location', loc);
      if (selMusic) fd.append('music', JSON.stringify({ name: selMusic.name, artist: selMusic.artist }));
      else if (music) fd.append('music', JSON.stringify({ name: music }));

      // 用XHR支持进度
      await new Promise<void>((res, rej) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress({ loaded: e.loaded, total: e.total, percentage: Math.round((e.loaded / e.total) * 100) }); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const d = JSON.parse(xhr.responseText);
            if (d.success) { setOk(true); res(); }
            else rej(new Error(d.error || '上传失败'));
          } else rej(new Error('上传失败'));
        };
        xhr.onerror = () => rej(new Error('网络错误'));
        xhr.open('POST', `${API_URL}/api/posts`);
        xhr.withCredentials = true;
        xhr.send(fd);
      });

      setTimeout(() => nav('/share'), 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '上传失败');
      setProgress(null);
    } finally { setUploading(false); }
  };

  const close = () => nav(-1);

  return (
    <div className="fixed inset-0 bg-ink-900 z-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="flex items-center justify-between px-4 py-3 bg-ink-800 border-b border-white/10">
        <button onClick={close} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
          <X size={20} className="text-white" />
        </button>
        <h1 className="text-lg font-medium text-white">
          {mediaType === 'video' ? '发布视频' : mediaType === 'image' ? '发布图片' : '创建内容'}
        </h1>
        <button onClick={submit} disabled={!files.length || uploading} className={clsx("px-4 py-2 rounded-full font-medium", files.length && !uploading ? "bg-gold-500 text-ink-900 hover:bg-gold-400" : "bg-white/10 text-white/50 cursor-not-allowed")}>
          {uploading ? '发布中...' : '发布'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto md:overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* 左侧：媒体上传 */}
          <div className="flex-shrink-0 md:w-1/2 md:h-full flex items-center justify-center p-4">
            <div className="relative bg-black aspect-[9/16] w-full max-w-sm h-auto max-h-[45vh] md:max-h-[80vh] rounded-xl overflow-hidden">
              {!files.length ? (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5">
                  <input ref={fileRef} type="file" accept={[...IMAGE_FMT, ...VIDEO_FMT].join(',')} multiple onChange={onFile} className="hidden" />
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4"><Upload size={32} className="text-white/60" /></div>
                  <p className="text-white/80 text-lg mb-2">点击上传图片或视频</p>
                  <p className="text-white/50 text-sm">支持 JPG、PNG、GIF、WebP、MP4、MOV</p>
                  <p className="text-white/40 text-xs mt-2">最大 50MB</p>
                </label>
              ) : (
                <>
                  {files[curIdx].type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video ref={videoRef} src={files[curIdx].preview} className="w-full h-full object-contain" onEnded={() => setPlaying(false)} onClick={togglePlay} playsInline />
                      <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center">
                        {!playing && <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center"><Play size={32} className="text-white ml-1" /></div>}
                      </button>
                    </div>
                  ) : <img src={files[curIdx].preview} alt="预览" className="w-full h-full object-contain" />}

                  {files.length > 1 && (
                    <>
                      <button onClick={prevMedia} disabled={!curIdx} className={clsx("absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center", !curIdx && "opacity-30")}><ChevronLeft size={24} className="text-white" /></button>
                      <button onClick={nextMedia} disabled={curIdx === files.length - 1} className={clsx("absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center", curIdx === files.length - 1 && "opacity-30")}><ChevronRight size={24} className="text-white" /></button>
                    </>
                  )}

                  {mediaType === 'image' && files.length > 1 && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm">{curIdx + 1} / {files.length}</div>
                  )}

                  <button onClick={() => rmFile(curIdx)} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-red-500/70"><Trash2 size={18} className="text-white" /></button>

                  {mediaType === 'image' && files.length < MAX_IMG && (
                    <label className="absolute bottom-4 left-4 cursor-pointer">
                      <input type="file" accept={IMAGE_FMT.join(',')} multiple onChange={onFile} className="hidden" />
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"><Plus size={20} className="text-white" /></div>
                    </label>
                  )}
                </>
              )}
            </div>

            {/* 移动端封面选择 */}
            {mediaType === 'video' && thumbs.length > 0 && (
              <div className="px-4 py-3 md:hidden">
                <p className="text-white/80 text-sm mb-2">选择封面</p>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {thumbs.map((t, i) => (
                    <button key={i} onClick={() => onThumb(i)} className={clsx("flex-shrink-0 w-16 h-28 rounded-lg overflow-hidden border-2", selThumb === i ? "border-gold-500 ring-2 ring-gold-500/50" : "border-transparent opacity-60")}><img src={t} alt="" className="w-full h-full object-cover" /></button>
                  ))}
                  <label className="flex-shrink-0 w-16 h-28 rounded-lg border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer">
                    <input ref={coverRef} type="file" accept={IMAGE_FMT.join(',')} onChange={onCover} className="hidden" />
                    <ImageIcon size={20} className="text-white/50 mb-1" /><span className="text-white/50 text-xs">自定义</span>
                  </label>
                </div>
              </div>
            )}

            {/* 移动端缩略图 */}
            {mediaType === 'image' && files.length > 1 && (
              <div className="px-4 py-3 md:hidden">
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {files.map((m, i) => (
                    <button key={i} onClick={() => setCurIdx(i)} className={clsx("flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2", curIdx === i ? "border-gold-500" : "border-transparent opacity-60")}><img src={m.preview} alt="" className="w-full h-full object-cover" /></button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：输入区域 */}
          <div className="flex-1 md:w-1/2 md:h-full overflow-y-auto">
            {/* 桌面端封面选择 */}
            {mediaType === 'video' && thumbs.length > 0 && (
              <div className="hidden md:block p-4 border-b border-white/10">
                <p className="text-white/80 text-sm mb-2">选择封面</p>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {thumbs.map((t, i) => (
                    <button key={i} onClick={() => onThumb(i)} className={clsx("flex-shrink-0 w-16 h-28 rounded-lg overflow-hidden border-2", selThumb === i ? "border-gold-500 ring-2 ring-gold-500/50" : "border-transparent opacity-60")}><img src={t} alt="" className="w-full h-full object-cover" /></button>
                  ))}
                  <label className="flex-shrink-0 w-16 h-28 rounded-lg border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer">
                    <input type="file" accept={IMAGE_FMT.join(',')} onChange={onCover} className="hidden" />
                    <ImageIcon size={20} className="text-white/50 mb-1" /><span className="text-white/50 text-xs">自定义</span>
                  </label>
                </div>
              </div>
            )}

            {/* 桌面端缩略图 */}
            {mediaType === 'image' && files.length > 1 && (
              <div className="hidden md:block p-4 border-b border-white/10">
                <p className="text-white/80 text-sm mb-2">已选图片</p>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {files.map((m, i) => (
                    <button key={i} onClick={() => setCurIdx(i)} className={clsx("flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2", curIdx === i ? "border-gold-500" : "border-transparent opacity-60")}><img src={m.preview} alt="" className="w-full h-full object-cover" /></button>
                  ))}
                </div>
              </div>
            )}

            {/* 描述输入 */}
            <div className="p-4 border-b border-white/10">
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="写下你的故事..." className="w-full bg-transparent text-white placeholder-white/40 resize-none focus:outline-none" rows={4} maxLength={500} />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowTopics(!showTopics)} className={clsx("flex items-center gap-1 text-sm", showTopics || topics.length ? "text-gold-500" : "text-white/60 hover:text-white")}><Hash size={16} />话题</button>
                  <button onClick={() => setShowLoc(!showLoc)} className={clsx("flex items-center gap-1 text-sm", showLoc || loc ? "text-gold-500" : "text-white/60 hover:text-white")}><MapPin size={16} />位置</button>
                  <button onClick={() => setShowMusic(!showMusic)} className={clsx("flex items-center gap-1 text-sm", showMusic || music ? "text-gold-500" : "text-white/60 hover:text-white")}><Music size={16} />音乐</button>
                </div>
                <span className="text-white/40 text-xs">{desc.length}/500</span>
              </div>
            </div>

            {/* 定位成功提示 */}
            {locOk && (
              <div className="mx-4 mt-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                <Check size={16} className="text-green-400" /><span className="text-green-400 text-sm">已定位到: {locOk}</span>
              </div>
            )}

            {/* 话题选择 */}
            {showTopics && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/80 text-sm">选择话题</p>
                  <p className="text-white/40 text-xs">最多3个</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {HOT_TOPICS.map((t) => (
                    <button key={t.id} onClick={() => selTopic(t.name)} className={clsx("px-3 py-1.5 rounded-full text-sm", topics.includes(t.name) ? "bg-gold-500 text-ink-900" : "bg-white/10 text-white hover:bg-white/20")}>{t.name}</button>
                  ))}
                </div>
              </div>
            )}

            {/* 位置选择 */}
            {showLoc && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input type="text" value={locKw} onChange={(e) => searchLoc(e.target.value)} placeholder="搜索位置..." className="w-full bg-white/10 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
                  </div>
                  <button onClick={autoLoc} disabled={isLocating} className="px-3 py-2 bg-gold-500 hover:bg-gold-400 text-ink-900 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1">
                    {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}定位
                  </button>
                </div>

                {locSugs.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {locSugs.map((s, i) => (
                      <button key={i} onClick={() => selLoc(s)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5">
                        <p className="text-white text-sm">{s.name}</p>
                        {s.address && <p className="text-white/50 text-xs">{s.address}</p>}
                      </button>
                    ))}
                  </div>
                )}
                {searchingLoc && <p className="text-white/50 text-sm text-center py-2">搜索中...</p>}
                
                {loc && !locSugs.length && (
                  <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-gold-500" /><span className="text-white text-sm">{loc}</span></div>
                    <button onClick={clrLoc} className="text-white/50 hover:text-white"><X size={16} /></button>
                  </div>
                )}
              </div>
            )}

            {/* 音乐选择 */}
            {showMusic && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/80 text-sm">选择音乐</p>
                  {music && <button onClick={clrMusic} className="text-white/50 text-xs hover:text-white">清除</button>}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {TRENDING_MUSIC.map((m) => (
                    <button key={m.id} onClick={() => pickMusic(m)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-lg">{m.cover}</div>
                      <div className="flex-1 text-left">
                        <p className="text-white text-sm">{m.name}</p>
                        <p className="text-white/50 text-xs">{m.artist}</p>
                      </div>
                      {selMusic?.name === m.name && <Check size={16} className="text-gold-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 标签输入 */}
            <div className="p-4 border-b border-white/10">
              <p className="text-white/80 text-sm mb-3">添加标签</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((t) => (
                  <div key={t} className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
                    <span className="text-white text-sm">{t}</span>
                    <button onClick={() => rmTag(t)} className="text-white/50 hover:text-white"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="输入标签后回车..." className="flex-1 bg-white/10 border border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/40 focus:outline-none focus:border-gold-500/50" />
                <button onClick={addTag} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">添加</button>
              </div>
              <p className="text-white/40 text-xs mt-2">最多5个标签</p>
            </div>

            {/* 上传进度 */}
            {uploading && progress && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">上传中...</span>
                  <span className="text-white/60 text-sm">{progress.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 transition-all" style={{ width: `${progress.percentage}%` }} />
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {err && (
              <div className="mx-4 my-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2">
                <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{err}</p>
              </div>
            )}

            {/* 成功提示 */}
            {ok && (
              <div className="mx-4 my-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                <Check size={18} className="text-green-400" /><span className="text-green-400 text-sm">发布成功！正在跳转...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}