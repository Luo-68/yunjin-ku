import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Maximize, ChevronLeft, Crown, Sparkles } from 'lucide-react';

// 博物馆视频列表，后面可以换成数据库
const videos = [
  {
    id: 1,
    title: '华夏服饰之美',
    desc: '从远古到现代，探索华夏服饰的千年演变',
    src: '/videos/1764573655845.mp4',
    poster: 'https://cdn.wegic.ai/assets/onepage/agent/images/1764573526890.jpg?imageMogr2/format/webp',
  },
  {
    id: 2,
    title: '锦绣中华',
    desc: '刺绣工艺与民族文化的完美融合',
    src: '/videos/1764647409914.mp4',
    poster: 'https://cdn.wegic.ai/assets/onepage/agent/images/1764573528114.jpg?imageMogr2/format/webp',
  },
];

// 贵族风博物馆视频页，金色+深红配色，华丽感
export default function MuseumVideo() {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mute, setMute] = useState(true);
  const [prog, setProg] = useState(0);
  const [dur, setDur] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 切换视频时重置状态
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setPlaying(false);
      setProg(0);
    }
  }, [cur]);

  // 播放/暂停
  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  // 静音切换
  const toggleMute = () => {
    if (videoRef.current) videoRef.current.muted = !mute;
    setMute(!mute);
  };

  // 进度更新
  const onTime = () => {
    if (!videoRef.current) return;
    setProg(videoRef.current.currentTime);
    if (dur === 0) setDur(videoRef.current.duration);
  };

  // 跳转进度
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    videoRef.current.currentTime = pct * dur;
    setProg(videoRef.current.currentTime);
  };

  // 全屏
  const fs = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) document.exitFullscreen();
      else videoRef.current.requestFullscreen();
    }
  };

  // 格式化时间
  const fmt = (t: number) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const v = videos[cur];

  return (
    <div className="min-h-screen bg-[#0a0608] relative overflow-hidden">
      {/* 贵族风背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 深红渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a0f] via-[#0a0608] to-[#0f080a]" />
        {/* 金色光晕 */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#8b0000]/10 rounded-full blur-[120px]" />
        {/* 顶部金线装饰 */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
        {/* 边框装饰 */}
        <div className="absolute top-4 left-4 right-4 bottom-4 border border-[#d4af37]/10 rounded-lg pointer-events-none" />
        {/* 角落装饰 */}
        <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-[#d4af37]/30" />
        <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-[#d4af37]/30" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-[#d4af37]/30" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-[#d4af37]/30" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative overflow-hidden rounded-full border border-[#d4af37]/40 bg-[#1a0a0f] flex items-center justify-center group-hover:border-[#d4af37] transition-colors">
              <Crown size={18} className="text-[#d4af37]" />
            </div>
            <span className="text-xl font-serif tracking-[0.15em] text-[#d4af37]">中华服饰博物馆</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-[#d4af37]/70 hover:text-[#d4af37] transition-colors">
            <ChevronLeft size={18} />
            <span className="text-sm tracking-wider">返回首页</span>
          </Link>
        </div>

        {/* 标题区 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[#d4af37]" />
            <span className="text-[#d4af37]/70 text-xs tracking-[0.3em] uppercase">Museum of Chinese Costume</span>
            <Sparkles size={16} className="text-[#d4af37]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#f5e6d3] tracking-wider mb-3">{v.title}</h1>
          <p className="text-[#d4af37]/60 max-w-xl mx-auto">{v.desc}</p>
        </div>

        {/* 视频播放器 */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-[#0a0608] rounded-lg overflow-hidden border border-[#d4af37]/20 shadow-[0_0_60px_rgba(212,175,55,0.1)]">
            {/* 视频元素 */}
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                src={v.src}
                poster={v.poster}
                muted={mute}
                onTimeUpdate={onTime}
                onLoadedMetadata={() => videoRef.current && setDur(videoRef.current.duration)}
                onEnded={() => setPlaying(false)}
                onClick={toggle}
                className="w-full h-full object-cover cursor-pointer"
                playsInline
              />
              {/* 播放按钮覆盖 */}
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button onClick={toggle} className="w-20 h-20 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center hover:bg-[#d4af37]/30 transition-all hover:scale-110">
                    <Play size={36} className="text-[#d4af37] ml-1" />
                  </button>
                </div>
              )}
            </div>

            {/* 控制栏 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
              {/* 进度条 */}
              <div className="mb-3 cursor-pointer group" onClick={seek}>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#f5d78e] transition-all"
                    style={{ width: `${dur ? (prog / dur) * 100 : 0}%` }}
                  />
                </div>
              </div>
              {/* 控制按钮 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={toggle} className="text-[#d4af37]/80 hover:text-[#d4af37] transition-colors">
                    {playing ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <button onClick={toggleMute} className="text-[#d4af37]/80 hover:text-[#d4af37] transition-colors">
                    {mute ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <span className="text-[#d4af37]/60 text-sm font-light">
                    {fmt(prog)} / {fmt(dur)}
                  </span>
                </div>
                <button onClick={fs} className="text-[#d4af37]/80 hover:text-[#d4af37] transition-colors">
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* 视频列表 */}
          <div className="mt-8">
            <h3 className="text-[#d4af37]/70 text-sm tracking-wider mb-4">更多影片</h3>
            <div className="grid grid-cols-2 gap-4">
              {videos.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => setCur(i)}
                  className={`relative rounded-lg overflow-hidden group transition-all ${
                    cur === i ? 'ring-2 ring-[#d4af37]' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="aspect-video">
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <p className="text-[#f5e6d3] text-sm font-medium truncate">{item.title}</p>
                      <p className="text-[#d4af37]/60 text-xs truncate">{item.desc}</p>
                    </div>
                    {cur === i && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center">
                        <Play size={12} className="text-[#0a0608]" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 text-[#d4af37]/30">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#d4af37]/30" />
            <Crown size={14} />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#d4af37]/30" />
          </div>
          <p className="text-[#d4af37]/30 text-xs tracking-widest mt-4">
            探索华夏服饰文化 · 传承千年匠心工艺
          </p>
        </div>
      </div>
    </div>
  );
}
