import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, Camera, Share2, ChevronDown, Cpu, Scan, Network, Database, Mail } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// 首页，动效比较多，gsap配置看着乱
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero文字入场
      gsap.from(textRef.current?.querySelectorAll('.hero-txt') || [], {
        y: 100, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power3.out", delay: 0.5
      });

      // 功能卡片滚动动画
      const cards = featRef.current?.querySelectorAll('.feat-card');
      cards?.forEach((c, i) => {
        gsap.from(c, {
          scrollTrigger: { trigger: c, start: "top 80%" },
          y: 50, opacity: 0, duration: 1, delay: i * 0.2, ease: "power2.out"
        });
      });

      // 技术流程动画
      const items = techRef.current?.querySelectorAll('.tech-item');
      items?.forEach((it, i) => {
        gsap.from(it, {
          scrollTrigger: { trigger: it, start: "top 85%" },
          y: 30, opacity: 0, duration: 0.8, delay: i * 0.15, ease: "back.out(1.7)"
        });
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // 三大功能
  const feats = [
    { title: "智能识别", desc: "上传服饰照片，AI 深度解析民族归属与纹样寓意。", icon: <Camera size={28} />, link: "/recognition", img: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573528114.jpg?imageMogr2/format/webp" },
    { title: "锦绣画廊", desc: "沉浸式浏览中华民族服饰瑰宝，感受传统工艺之美。", icon: <Sparkles size={28} />, link: "/gallery", img: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573526890.jpg?imageMogr2/format/webp" },
    { title: "文化共赏", desc: "分享你的发现，连接每一个热爱民族文化的灵魂。", icon: <Share2 size={28} />, link: "/share", img: "https://cdn.wegic.ai/assets/onepage/agent/images/1764573531217.jpg?imageMogr2/format/webp" }
  ];

  // 技术流程，4个步骤
  const steps = [
    { icon: <Scan size={32} />, title: "高精采集", desc: "8K级纹样扫描与数字化归档" },
    { icon: <Cpu size={32} />, title: "特征提取", desc: "提取色彩、结构与工艺特征" },
    { icon: <Database size={32} />, title: "语义分析", desc: "关联历史文献与民俗寓意" },
    { icon: <Network size={32} />, title: "图谱构建", desc: "生成跨民族文化关联图谱" }
  ];

  return (
    <div ref={heroRef} className="bg-ink-900 overflow-x-hidden">
      {/* Hero */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-ink-900/40 z-10" />
          <div className="w-full h-full bg-ink-900 relative">
            <video className="w-full h-full object-cover opacity-60" autoPlay muted loop playsInline poster="https://cdn.wegic.ai/assets/onepage/agent/images/1764573526890.jpg?imageMogr2/format/webp">
              <source src="/videos/1764573655845.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <div ref={textRef} className="relative z-20 container-custom text-center flex flex-col items-center">
          <div className="hero-txt mb-4 inline-block px-4 py-1 border border-gold-500/30 rounded-full bg-ink-900/50 backdrop-blur-sm text-gold-300 text-sm tracking-[0.2em] uppercase">
            AI × Intangible Cultural Heritage
          </div>
          <h1 className="hero-txt text-5xl md:text-7xl lg:text-9xl font-serif text-mist-100 mb-6 tracking-wide">
            <span className="block text-gold-100 drop-shadow-lg">云矜ku</span>
            <span className="block text-2xl md:text-4xl mt-4 font-light text-mist-300">民族服饰的数字重生</span>
          </h1>
          <p className="hero-txt text-mist-300 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed mb-12 font-light">
            用人工智能唤醒沉睡的纹样，让千年的民族记忆在数字时空中流淌。
            <br className="hidden md:block" />连接过去与未来，织就属于当下的锦绣华章。
          </p>

          <div className="hero-txt flex flex-col md:flex-row gap-6 items-center">
            <Link to="/recognition" className="btn-primary rounded-full flex items-center gap-2 group">
              <span>开始探索</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="btn-outline rounded-full border-mist-100/30 text-mist-100 hover:bg-mist-100/10">
              了解更多
            </Link>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-gold-500/50">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* 介绍/使命 */}
      <section className="py-24 relative z-10 bg-ink-900">
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="aspect-[3/4] rounded-sm overflow-hidden relative">
              <img src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573526890.jpg?imageMogr2/format/webp" alt="Traditional Embroidery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>
          <div className="order-1 md:order-2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-serif text-gold-100 leading-tight">当古老技艺<br />遇见未来科技</h2>
            <p className="text-mist-300 leading-relaxed text-lg">每一针一线都承载着民族的历史与情感。在快节奏的现代生活中，这些珍贵的文化记忆正在悄然流逝。</p>
            <p className="text-mist-300 leading-relaxed text-lg">云矜裤不仅仅是一个识别工具，它是通往过去的数字钥匙。通过先进的计算机视觉技术，我们解构复杂的传统纹样，还原其背后的工艺与故事，让传统美学触手可及。</p>
            <div className="pt-4">
              <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
                <div><span className="block text-3xl font-serif text-gold-500 mb-1">56</span><span className="text-xs text-mist-500 uppercase tracking-wider">民族收录</span></div>
                <div><span className="block text-3xl font-serif text-gold-500 mb-1">10k+</span><span className="text-xs text-mist-500 uppercase tracking-wider">纹样数据</span></div>
                <div><span className="block text-3xl font-serif text-gold-500 mb-1">98%</span><span className="text-xs text-mist-500 uppercase tracking-wider">识别精度</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 功能区 */}
      <section ref={featRef} className="py-32 relative bg-ink-800">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-gold-500 text-sm tracking-widest uppercase mb-4 block">核心功能</span>
            <h2 className="text-3xl md:text-5xl font-serif text-mist-100">开启文化探索之旅</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feats.map((f, i) => (
              <Link key={i} to={f.link} className="feat-card group relative h-[500px] overflow-hidden border border-white/5 bg-ink-900 transition-all duration-500 hover:border-gold-500/30">
                <div className="absolute inset-0 z-0">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover opacity-40 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-900/50 to-ink-900" />
                </div>
                <div className="absolute inset-0 z-10 p-8 flex flex-col justify-end">
                  <div className="mb-4 w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 backdrop-blur-md border border-gold-500/20 group-hover:bg-gold-500 group-hover:text-ink-900 transition-colors duration-300">{f.icon}</div>
                  <h3 className="text-2xl font-serif text-gold-100 mb-3 group-hover:translate-x-2 transition-transform duration-300">{f.title}</h3>
                  <p className="text-mist-300 text-sm leading-relaxed mb-6 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">{f.desc}</p>
                  <div className="flex items-center gap-2 text-gold-500 text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                    <span>Enter</span><ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 技术流程 */}
      <section ref={techRef} className="py-32 relative bg-ink-900 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4">
              <span className="text-gold-500 text-sm tracking-widest uppercase mb-4 block">技术赋能</span>
              <h2 className="text-4xl md:text-5xl font-serif text-mist-100 mb-6">解码<br/>民族记忆</h2>
              <p className="text-mist-300 leading-relaxed mb-8">我们采用自研的 Vision-Culture 模型，针对 56 个民族的服饰特征进行专项训练。不仅能识别纹样形态，更能解读其背后的历史渊源与文化寓意。</p>
              <Link to="/recognition" className="btn-outline rounded-full inline-flex items-center gap-2 text-sm"><span>体验 AI 识别</span></Link>
            </div>
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {steps.map((s, i) => (
                  <div key={i} className="tech-item bg-ink-800 p-8 border border-white/5 hover:border-gold-500/30 transition-colors group">
                    <div className="w-14 h-14 bg-ink-900 rounded-lg flex items-center justify-center text-gold-500 mb-6 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                    <h3 className="text-xl font-serif text-mist-100 mb-3">{s.title}</h3>
                    <p className="text-mist-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 传承人故事 */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-ink-800" />
        <div className="absolute right-0 top-0 w-1/2 h-full">
          <img src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573677810.jpg?imageMogr2/format/webp" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-800 to-transparent" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <span className="text-gold-500 text-sm tracking-widest uppercase mb-6 block">本月特邀传承人</span>
            <blockquote className="text-3xl md:text-4xl font-serif text-mist-100 leading-relaxed mb-8">"每一幅绣片都是有生命的。只要还有人记得它的名字，它就永远不会消失。"</blockquote>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-gold-500/30">
                <img src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573788371.jpg?imageMogr2/format/webp" alt="Curator" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-gold-100 font-serif text-lg">李阿婆</div>
                <div className="text-mist-500 text-sm">苗族刺绣非遗传承人 · 82岁</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 订阅/CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-500/5" />
        <div className="container-custom relative z-10 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-serif text-gold-100 mb-8">让传统不再遥远</h2>
            <p className="text-xl text-mist-300 mb-12">加入我们的社区，成为文化传承的一份子。上传你身边的民族服饰，完善我们的文化图谱。</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Link to="/share" className="btn-primary rounded-full inline-flex items-center gap-2 px-10 py-4 text-lg w-full md:w-auto justify-center">
                <span>加入共赏</span><Share2 size={20} />
              </Link>
              <div className="flex items-center bg-ink-900/50 border border-white/10 rounded-full px-2 py-2 w-full md:w-auto">
                <div className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center text-mist-300"><Mail size={18} /></div>
                <input type="email" placeholder="订阅每周文化简报" className="bg-transparent border-none focus:ring-0 text-sm text-mist-100 px-4 w-48 placeholder:text-mist-500" />
                <button className="px-6 py-2 bg-gold-500 text-ink-900 text-sm font-medium rounded-full hover:bg-gold-300 transition-colors">订阅</button>
              </div>
            </div>
          </div>
          {/* 合作伙伴 */}
          <div className="pt-16 border-t border-white/5 flex flex-wrap justify-center gap-12 opacity-30 hover:opacity-60 transition-opacity">
            <span className="text-2xl font-serif">National Museum</span>
            <span className="text-2xl font-serif">Culture Lab</span>
            <span className="text-2xl font-serif">Heritage AI</span>
            <span className="text-2xl font-serif">Eastern Arts</span>
          </div>
        </div>
      </section>
    </div>
  );
}
