import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Scan, Sparkles, Share2, Download } from 'lucide-react';
import { gsap } from 'gsap';
import clsx from 'clsx';
import ParticleCanvas from '@/components/ParticleCanvas';
import RippleCanvas from '@/components/RippleCanvas';
import { recognize, authApi } from '@/utils/api';

type AnalysisState = 'idle' | 'scanning' | 'complete' | 'error';
type SceneMode = 'ink' | 'silk' | 'embroidery';

interface RecognitionResult {
  ethnic_group: string;
  confidence: number;
  era: string;
  craft: string;
  description: string;
}

const SCENE_DESCRIPTIONS = {
  ink: "水墨山水 · 意境悠远",
  silk: "云锦织纹 · 华贵典雅",
  embroidery: "刺绣工艺 · 巧夺天工"
};

export default function RecognitionPage() {
  const nav = useNavigate();
  const [checking, setChecking] = useState(true);
  const [state, setState] = useState<AnalysisState>('idle');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sceneMode, setSceneMode] = useState<SceneMode>('ink');
  const [isGlitching, setIsGlitching] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const uploadCardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scene switch with glitch effect
  const triggerSceneSwitch = () => {
    setIsGlitching(true);
    setTimeout(() => {
      const modes: SceneMode[] = ['ink', 'silk', 'embroidery'];
      const currentIndex = modes.indexOf(sceneMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      setSceneMode(modes[nextIndex]);
      setIsGlitching(false);
    }, 300);
  };

  // 认证检查 - 必须在所有hooks之后
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getMe();
        if (!res.success || !res.data) nav('/login');
      } catch {
        nav('/login');
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [nav]);

  // Keyboard interaction - 所有hooks必须在顶层
  useEffect(() => {
    if (checking) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && state === 'idle') {
        e.preventDefault();
        triggerSceneSwitch();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [checking, state]);

  // 3D card hover effect
  useEffect(() => {
    if (checking) return;
    const card = uploadCardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 1000
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [checking, state]);

  // Scanning animation
  useEffect(() => {
    if (checking || state !== 'scanning' || !selectedImage) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(scanLineRef.current, { top: '0%', duration: 0 });
      tl.to(scanLineRef.current, { top: '100%', duration: 2.5, ease: "power1.inOut" });
      tl.to(scanLineRef.current, { top: '0%', duration: 2.5, ease: "power1.inOut" });

      const particles = particlesRef.current?.children;
      if (particles) {
        gsap.to(particles, {
          x: "random(-150, 150)",
          y: "random(-150, 150)",
          opacity: "random(0.3, 1)",
          scale: "random(0.5, 2)",
          duration: 1.5,
          stagger: { amount: 2, from: "center", repeat: -1, yoyo: true },
          ease: "power2.out"
        });
      }
    }, containerRef);

    // Call AI recognition API
    callRecognitionAPI(selectedImage);

    return () => ctx.revert();
  }, [checking, state, selectedImage]);

  // Result animation
  useEffect(() => {
    if (checking || state !== 'complete') return;
    gsap.from(".result-content", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });
  }, [checking, state]);

  const callRecognitionAPI = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          const result = await recognize.check(base64data);
          if (result.success && result.data) {
            setRecognitionResult(result.data as RecognitionResult);
            setState('complete');
          } else {
            setErrorMessage(result.error || '识别失败');
            setState('error');
          }
        } catch (error) {
          setErrorMessage('网络错误，请检查后端服务');
          setState('error');
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      setErrorMessage('图片处理失败');
      setState('error');
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setRecognitionResult(null);
      setErrorMessage('');
      setState('scanning');
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const reset = () => {
    setState('idle');
    setSelectedImage(null);
    setRecognitionResult(null);
    setErrorMessage('');
  };

  // loading状态 - 在所有hooks之后
  if (checking) {
    return (
      <div className="fixed inset-0 bg-ink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mist-300">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black overflow-hidden">
      {/* Dynamic Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className={clsx(
            "w-full h-full object-cover transition-all duration-1000",
            isGlitching && "blur-sm brightness-150"
          )}
          autoPlay
          muted
          loop
          playsInline
          style={{ filter: isGlitching ? 'hue-rotate(180deg) saturate(2)' : 'none' }}
        >
          <source src="/videos/1764647409914.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-transparent" />
        {isGlitching && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent animate-pulse" />}
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none opacity-0">
        <RippleCanvas className="w-full h-full pointer-events-auto" />
      </div>

      <div className="absolute inset-0 z-10 opacity-0 pointer-events-none">
        <ParticleCanvas className="w-full h-full pointer-events-auto" />
      </div>

      <div className="relative z-20 h-full flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-7xl">
          <div className="absolute top-8 left-8 flex items-center gap-4 animate-fade-in">
            <div className="px-4 py-2 bg-transparent backdrop-blur-sm border border-gold-500/40 rounded-full">
              <span className="text-gold-400 text-xs tracking-[0.2em] uppercase drop-shadow-lg">{SCENE_DESCRIPTIONS[sceneMode]}</span>
            </div>
            <div className="px-4 py-2 bg-transparent backdrop-blur-sm border border-white/30 rounded-full text-white/80 text-xs">
              按 <kbd className="px-2 py-0.5 bg-transparent rounded mx-1">SPACE</kbd> 切换场景
            </div>
          </div>

          {state === 'idle' && (
            <div ref={uploadCardRef} className="relative p-12 md:p-20 animate-fade-in" style={{ transformStyle: 'preserve-3d' }}>
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">智识 · 慧眼</h1>
                <p className="text-white text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">上传服饰图片，AI 将解析文化基因。</p>
              </div>

              <div className="relative group cursor-pointer" onClick={handleUploadClick}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                <div className="w-80 h-80 mx-auto rounded-full border-2 border-dashed border-gold-500/40 flex items-center justify-center relative group-hover:border-gold-500 transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_60px_rgba(212,175,55,0.4)]">
                  <div className="absolute inset-8 rounded-full border border-gold-500/30 animate-spin-slow" style={{ animationDuration: '20s' }} />
                  <div className="absolute inset-16 rounded-full border border-gold-500/20 animate-spin-slow" style={{ animationDuration: '30s', animationDirection: 'reverse' }} />
                  <div className="relative z-10 text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gold-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-gold-500/20">
                      <Upload className="w-10 h-10 text-gold-500 drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                    </div>
                    <div>
                      <p className="text-white text-xl font-serif mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">上传图片</p>
                      <p className="text-white/80 text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">点击或拖拽至此</p>
                    </div>
                  </div>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="absolute w-2 h-2 bg-gold-500 rounded-full opacity-0" style={{ top: `${50 + 45 * Math.sin((i / 12) * Math.PI * 2)}%`, left: `${50 + 45 * Math.cos((i / 12) * Math.PI * 2)}%`, animation: `float ${4 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.1}s`, boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)' }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {state === 'scanning' && selectedImage && (
            <div className="backdrop-blur-md bg-transparent border border-white/20 rounded-3xl p-8 shadow-2xl animate-fade-in">
              <div className="relative w-full max-w-2xl mx-auto aspect-square">
                <img src={selectedImage} alt="Analyzing" className="w-full h-full object-contain rounded-xl" />
                <div ref={scanLineRef} className="absolute left-0 top-0 w-full h-[3px] z-30">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-transparent to-transparent shadow-[0_0_30px_rgba(212,175,55,1)]" />
                  <div className="absolute top-0 left-0 w-full h-32 bg-transparent" />
                </div>
                <div className="absolute inset-0 opacity-0" style={{ backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(212, 175, 55, .1) 25%, rgba(212, 175, 55, .1) 26%, transparent 27%), linear-gradient(90deg, transparent 24%, rgba(212, 175, 55, .1) 25%, rgba(212, 175, 55, .1) 26%, transparent 27%)`, backgroundSize: '40px 40px' }} />
                {['tl', 'tr', 'bl', 'br'].map(pos => (
                  <div key={pos} className={clsx("absolute w-12 h-12 border-gold-500", pos === 'tl' && 'top-4 left-4 border-l-2 border-t-2', pos === 'tr' && 'top-4 right-4 border-r-2 border-t-2', pos === 'bl' && 'bottom-4 left-4 border-l-2 border-b-2', pos === 'br' && 'bottom-4 right-4 border-r-2 border-b-2')} />
                ))}
                <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
                  {[...Array(40)].map((_, i) => (<div key={i} className="absolute w-1 h-1 bg-gold-500 rounded-full" style={{ left: '50%', top: '50%', boxShadow: '0 0 6px rgba(212, 175, 55, 1)' }} />))}
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-transparent backdrop-blur-md px-6 py-3 rounded-full border border-gold-500/30 flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gold-100 text-sm tracking-wider">正在解析文化基因...</span>
                </div>
              </div>
            </div>
          )}

          {state === 'complete' && (
            <div className="backdrop-blur-md bg-transparent border border-white/20 rounded-3xl overflow-hidden shadow-2xl animate-fade-in max-h-[85vh] max-w-6xl mx-auto">
              <div className="flex justify-between items-center p-6 lg:p-8 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-transparent border border-gold-500/30 rounded-full text-gold-400 text-xs uppercase tracking-wider">识别成功</span>
                  <div className="flex items-center gap-1.5 text-mist-500 text-sm">
                    <Sparkles size={14} className="text-gold-500" />
                    <span>{recognitionResult ? (recognitionResult.confidence * 100).toFixed(1) + '%' : '0%'}</span>
                  </div>
                </div>
                <button onClick={reset} className="px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-ink-900 rounded-full text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-gold-500/20">
                  <X size={16} /><span>重新识别</span>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-96">
                    <img src={selectedImage!} alt="Result" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-6 lg:p-8 space-y-5 result-content">
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-serif text-white mb-2">{recognitionResult?.ethnic_group || '未知'}</h2>
                      <p className="text-lg lg:text-xl text-gold-300 font-serif">民族服饰</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-transparent p-4 rounded-xl backdrop-blur-sm border border-white/5">
                        <span className="block text-mist-500 text-xs uppercase mb-1">朝代/年代</span>
                        <span className="text-white font-serif">{recognitionResult?.era || '未知'}</span>
                      </div>
                      <div className="bg-transparent p-4 rounded-xl backdrop-blur-sm border border-white/5">
                        <span className="block text-mist-500 text-xs uppercase mb-1">工艺</span>
                        <span className="text-white font-serif">{recognitionResult?.craft || '未知'}</span>
                      </div>
                    </div>
                    <div className="bg-transparent p-6 rounded-xl backdrop-blur-sm border border-white/5">
                      <h3 className="text-gold-100 font-serif mb-3 flex items-center gap-2"><Scan size={18} />文化解读</h3>
                      <p className="text-mist-300 leading-relaxed text-sm">{recognitionResult?.description || '暂无描述'}</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 bg-gold-500 hover:bg-gold-400 text-ink-900 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"><Share2 size={18} />分享</button>
                      <button className="flex-1 bg-transparent hover:bg-white/5 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10"><Download size={18} />保存</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="backdrop-blur-md bg-transparent border border-red-500/30 rounded-3xl p-12 shadow-2xl animate-fade-in max-w-2xl mx-auto">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center"><X size={40} className="text-red-500" /></div>
                <h2 className="text-3xl font-serif text-white">识别失败</h2>
                <p className="text-mist-300">{errorMessage}</p>
                <button onClick={reset} className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-ink-900 rounded-full text-sm font-medium transition-colors">重新上传</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-15px); }
        }
      `}</style>
    </div>
  );
}
