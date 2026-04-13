import { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, MessageSquare, MessageSquareOff, Repeat, Send } from 'lucide-react';
import clsx from 'clsx';
import { danmakuApi } from '../../utils/api';

// 弹幕类型
interface Dm {
  _id: string;
  user: { _id: string; username: string; avatar?: string };
  content: string;
  time: number;
  color: string;
  position: 'top' | 'middle' | 'bottom';
  type: 'scroll' | 'fixed';
  fontSize: number;
}

// props类型
interface Props {
  src: string;
  poster?: string;
  isActive: boolean;
  postId?: string;
  onDoubleClick?: () => void;
  bottomOffset?: number;
  onVideoEnd?: () => void;
}

// 暴露给父组件的方法
export interface VRef {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  getCurrentTime: () => number;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// 视频播放器组件
const VPlayer = forwardRef<VRef, Props>(
  ({ src, poster, isActive, postId, onDoubleClick, bottomOffset = 0, onVideoEnd }, ref) => {
    const vRef = useRef<HTMLVideoElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    const dmBoxRef = useRef<HTMLDivElement>(null);
    
    // 状态们
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [t, setT] = useState(0); // 当前时间
    const [dur, setDur] = useState(0); // 总时长
    const [showCtrl, setShowCtrl] = useState(true);
    const [speed, setSpeed] = useState(1);
    const [showSpeed, setShowSpeed] = useState(false);
    
    // 用户暂停标记 - 防止滚动时自动播放覆盖用户操作
    const userPause = useRef(false);
    const wasActive = useRef(isActive);
    
    // 弹幕相关
    const [dms, setDms] = useState<Dm[]>([]);
    const [dmOn, setDmOn] = useState(true);
    const [dmInput, setDmInput] = useState('');
    const [showDmInput, setShowDmInput] = useState(false);
    const activeDms = useRef<{ id: string; el: HTMLDivElement }[]>([]);
    const [dmErr, setDmErr] = useState('');
    
    // 自动连播默认开
    const [autoNext, setAutoNext] = useState(true);
    
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      play: () => vRef.current?.play(),
      pause: () => vRef.current?.pause(),
      togglePlay: () => {
        const v = vRef.current;
        if (v) v.paused ? v.play() : v.pause();
      },
      getCurrentTime: () => vRef.current?.currentTime || 0,
    }));

    // 自动隐藏控制栏的逻辑
    const resetHide = useCallback(() => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (playing && !showDmInput) {
        hideTimer.current = setTimeout(() => {
          setShowCtrl(false);
          setShowSpeed(false);
        }, 3000);
      }
    }, [playing, showDmInput]);

    // 鼠标动一下就显示控制栏
    const onMove = useCallback(() => {
      setShowCtrl(true);
      resetHide();
    }, [resetHide]);

    // 加载弹幕
    useEffect(() => {
      if (postId && isActive) loadDm();
    }, [postId, isActive]);

    const loadDm = async () => {
      if (!postId) return;
      try {
        const res = await danmakuApi.get(postId) as { success: boolean; data: Dm[] };
        if (res.success && res.data) setDms(res.data);
      } catch (e) {
        console.error('弹幕加载失败:', e);
      }
    };

    // 激活时自动播放
    useEffect(() => {
      const v = vRef.current;
      if (!v) return;

      if (isActive) {
        // 只有刚激活且用户没主动暂停才自动播
        const justOn = !wasActive.current;
        wasActive.current = true;
        
        if (justOn && !userPause.current) {
          v.play().catch(() => {
            v.muted = true;
            setMuted(true);
            v.play().catch(() => {});
          });
          setShowCtrl(true);
          resetHide();
        }
      } else {
        wasActive.current = false;
        v.pause();
        v.currentTime = 0;
        setT(0);
        setPlaying(false);
        userPause.current = false;
        // 清掉弹幕
        activeDms.current.forEach(d => d.el.remove());
        activeDms.current = [];
      }
    }, [isActive, resetHide]);

    // 清理定时器
    useEffect(() => {
      return () => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
      };
    }, []);

    // 时间格式化
    const fmt = (s: number) => {
      if (!s || isNaN(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    // 播放/暂停切换
    const toggle = () => {
      const v = vRef.current;
      if (!v) return;
      
      if (v.paused) {
        v.play().catch(e => console.error('播放失败:', e));
        userPause.current = false;
      } else {
        v.pause();
        userPause.current = true;
      }
      setShowCtrl(true);
      resetHide();
    };

    // 跳转
    const seek = (sec: number) => {
      const v = vRef.current;
      if (!v) return;
      v.currentTime = Math.max(0, Math.min(dur, v.currentTime + sec));
    };

    // 进度条点击
    const onProgClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const v = vRef.current;
      const box = e.currentTarget;
      if (!v || !dur) return;
      
      const rect = box.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      v.currentTime = pct * dur;
    };

    // 静音切换
    const toggleMute = () => {
      const v = vRef.current;
      if (!v) return;
      v.muted = !v.muted;
      setMuted(v.muted);
      resetHide();
    };

    // 倍速
    const setSpd = (s: number) => {
      const v = vRef.current;
      if (!v) return;
      v.playbackRate = s;
      setSpeed(s);
      setShowSpeed(false);
      resetHide();
    };

    // 发弹幕
    const sendDm = async () => {
      if (!dmInput.trim()) return;
      
      if (!postId) {
        setDmErr('帖子ID缺失');
        setTimeout(() => setDmErr(''), 2000);
        return;
      }
      
      try {
        const res = await danmakuApi.send(postId, {
          content: dmInput.trim(),
          time: t,
          color: '#FFFFFF',
          position: 'middle'
        }) as { success: boolean; data: Dm };
        
        if (res.success && res.data) {
          setDms(prev => [...prev, res.data]);
          setDmInput('');
          setDmErr('');
          showDm(res.data);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '发送失败';
        setDmErr(msg);
        setTimeout(() => setDmErr(''), 2000);
      }
    };

    // 弹幕轨道 - 5条轨道避免重叠
    const dmTracks = useRef<number[]>([0, 0, 0, 0, 0]);
    const MAX_DM = 5;

    // 显示弹幕
    const showDm = (dm: Dm) => {
      if (!dmOn || !dmBoxRef.current) return;
      
      // 限制数量
      if (activeDms.current.length >= MAX_DM) return;
      
      const box = dmBoxRef.current;
      const el = document.createElement('div');
      el.className = 'absolute whitespace-nowrap text-white pointer-events-none';
      el.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
      el.style.fontSize = '16px';
      el.style.color = dm.color;
      el.style.left = '100%';
      
      // 找空闲轨道
      const h = 20 / 5;
      let idx = -1;
      for (let i = 0; i < 5; i++) {
        if (dmTracks.current[i] < t) {
          idx = i;
          break;
        }
      }
      if (idx === -1) idx = Math.floor(Math.random() * 5);
      
      el.style.top = `${2 + idx * h}%`;
      dmTracks.current[idx] = t + 8;
      
      el.textContent = dm.content;
      box.appendChild(el);
      
      // 滚动动画
      const dur = 8000;
      el.style.transition = `transform ${dur}ms linear`;
      el.style.transform = 'translateX(0)';
      
      requestAnimationFrame(() => {
        const w = el.offsetWidth;
        el.style.transform = `translateX(-${box.offsetWidth + w}px)`;
      });
      
      const id = dm._id;
      activeDms.current.push({ id, el });
      
      setTimeout(() => {
        el.remove();
        activeDms.current = activeDms.current.filter(d => d.id !== id);
      }, dur);
    };

    // 视频时间更新时显示弹幕
    useEffect(() => {
      if (!dmOn || !playing) return;
      
      // 找当前时间点的弹幕
      const list = dms.filter(d => 
        Math.abs(d.time - t) < 0.5 && 
        !activeDms.current.find(a => a.id === d._id)
      );
      
      // 每次最多2条
      list.slice(0, 2).forEach(showDm);
    }, [t, dms, dmOn, playing]);

    // 播放结束
    const onEnd = () => {
      if (autoNext && onVideoEnd) {
        onVideoEnd();
      } else if (vRef.current) {
        vRef.current.currentTime = 0;
        setPlaying(false);
        userPause.current = true;
        setShowCtrl(true);
      }
    };

    return (
      <div 
        ref={boxRef}
        className="relative w-full h-full bg-black group"
        onMouseMove={onMove}
        onMouseLeave={() => {
          if (playing && !showDmInput) setShowCtrl(false);
        }}
      >
        {/* 视频 */}
        <video
          ref={vRef}
          className="w-full h-full object-contain"
          src={src}
          poster={poster}
          muted={muted}
          playsInline
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            setT(v.currentTime);
            if (v.duration) setDur(v.duration);
          }}
          onPlay={() => { setPlaying(true); resetHide(); }}
          onPause={() => setPlaying(false)}
          onEnded={onEnd}
        />

        {/* 弹幕区域 - 顶部20% */}
        <div 
          ref={dmBoxRef}
          className={clsx(
            "absolute top-0 left-0 right-0 h-[20%] overflow-hidden pointer-events-none z-5",
            dmOn ? "opacity-100" : "opacity-0"
          )}
        />

        {/* 点击层 */}
        <div 
          className="absolute inset-0 z-10"
          onClick={() => {
            // 单击延迟，区分双击
            if (clickTimer.current) {
              clearTimeout(clickTimer.current);
              clickTimer.current = null;
            }
            clickTimer.current = setTimeout(() => toggle(), 250);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (clickTimer.current) {
              clearTimeout(clickTimer.current);
              clickTimer.current = null;
            }
            onDoubleClick?.();
          }}
        />

        {/* 控制栏 */}
        <div 
          className={clsx(
            "absolute left-0 right-0 z-30 bg-black/70 backdrop-blur-sm px-3 py-2 transition-all duration-300",
            showCtrl ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}
          style={{ bottom: bottomOffset ? `${bottomOffset}px` : '0px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 进度条 */}
          <div 
            className="h-1.5 bg-white/30 rounded-full mb-2 cursor-pointer hover:h-2 transition-all"
            onClick={onProgClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full relative"
              style={{ width: `${dur ? (t / dur) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
            </div>
          </div>

          {/* 按钮行 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* 播放/暂停 */}
              <button onClick={toggle} className="w-8 h-8 flex items-center justify-center text-white hover:text-pink-400 transition-colors">
                {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>

              {/* 快退 */}
              <button onClick={() => seek(-5)} className="w-8 h-8 flex items-center justify-center text-white hover:text-pink-400 transition-colors">
                <SkipBack size={18} />
              </button>

              {/* 快进 */}
              <button onClick={() => seek(5)} className="w-8 h-8 flex items-center justify-center text-white hover:text-pink-400 transition-colors">
                <SkipForward size={18} />
              </button>

              {/* 音量 */}
              <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center text-white hover:text-pink-400 transition-colors">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* 时间 */}
              <span className="text-white text-xs ml-2 font-mono">
                {fmt(t)} / {fmt(dur)}
              </span>
            </div>

            {/* 右侧按钮 */}
            <div className="flex items-center gap-2">
              {/* 自动连播 */}
              <button 
                onClick={() => setAutoNext(!autoNext)}
                className={clsx(
                  "w-8 h-8 flex items-center justify-center rounded transition-colors",
                  autoNext ? "text-green-400 bg-green-400/20" : "text-white/60 hover:text-white"
                )}
                title={autoNext ? '关闭自动连播' : '开启自动连播'}
              >
                <Repeat size={18} className={autoNext ? "" : "opacity-50"} />
              </button>

              {/* 倍速 */}
              <div className="relative">
                <button 
                  onClick={() => setShowSpeed(!showSpeed)}
                  className="px-2 py-1 bg-white/20 rounded text-white text-xs hover:bg-white/30 transition-colors font-medium"
                >
                  {speed}x
                </button>
                
                {showSpeed && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 rounded-lg overflow-hidden border border-white/20 shadow-xl">
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpd(s)}
                        className={clsx(
                          "block w-full px-4 py-2 text-xs text-left hover:bg-white/10 transition-colors",
                          speed === s ? "text-pink-400 bg-pink-400/10" : "text-white"
                        )}
                      >
                        {s === 1 ? '正常' : `${s}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 弹幕按钮 - 左侧中间 */}
        {showCtrl && postId && (
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹幕开关 */}
            <button
              onClick={() => setDmOn(!dmOn)}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                dmOn ? "bg-pink-500 text-white" : "bg-black/50 text-white hover:bg-black/70"
              )}
              title={dmOn ? '关闭弹幕' : '开启弹幕'}
            >
              {dmOn ? <MessageSquare size={18} /> : <MessageSquareOff size={18} />}
            </button>

            {/* 发送按钮 */}
            <button
              onClick={() => setShowDmInput(!showDmInput)}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                showDmInput ? "bg-pink-500 text-white" : "bg-black/50 text-white hover:bg-black/70"
              )}
              title="发送弹幕"
            >
              <Send size={18} />
            </button>

            {/* 输入框 */}
            {showDmInput && (
              <div 
                className="flex flex-col gap-2 w-48 mt-2"
                onMouseEnter={() => {
                  if (hideTimer.current) clearTimeout(hideTimer.current);
                }}
                onMouseLeave={() => resetHide()}
              >
                {dmErr && (
                  <div className="px-3 py-1.5 bg-red-500/80 text-white text-xs rounded-lg text-center">
                    {dmErr}
                  </div>
                )}
                <input
                  type="text"
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendDm()}
                  placeholder="发送弹幕..."
                  className="w-full px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  maxLength={50}
                  autoFocus
                />
                <button
                  onClick={sendDm}
                  disabled={!dmInput.trim()}
                  className="w-full py-1.5 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  发送
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

VPlayer.displayName = 'VPlayer';

export default VPlayer;