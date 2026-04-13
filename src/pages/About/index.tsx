import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Github } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text reveal animation
      gsap.utils.toArray('.reveal-text').forEach((element: any) => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        });
      });

      // Image Parallax
      gsap.utils.toArray('.parallax-img').forEach((element: any) => {
        gsap.to(element, {
          scrollTrigger: {
            trigger: element.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          },
          y: -50,
          ease: "none"
        });
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-ink-900 min-h-screen">
      
      {/* Header */}
      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <span className="reveal-text block text-gold-500 tracking-[0.2em] text-sm uppercase mb-4">我们的故事</span>
          <h1 className="reveal-text text-5xl md:text-7xl font-serif text-gold-100 mb-8 leading-tight">
            缘起：<br />
            让文明的碎片<br />
            重回星河
          </h1>
          <div className="reveal-text w-20 h-1 bg-gold-500/30 mb-12" />
        </div>
        <div className="absolute right-0 top-20 w-1/2 h-full bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none" />
      </section>

      {/* Chapter 1: The Past */}
      <section className="py-20">
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="reveal-text space-y-6">
            <h2 className="text-3xl font-serif text-mist-100">失落的织锦</h2>
            <p className="text-mist-300 leading-relaxed text-lg font-light">
              在中国西南的深山里，每一位绣娘都是天生的艺术家。她们将山川河流、日月星辰绣在衣襟之上。然而，随着现代化进程的加速，这些承载着民族记忆的纹样正在逐渐消失。
            </p>
            <p className="text-mist-300 leading-relaxed text-lg font-light">
              我们看到的不仅仅是图案的消逝，更是一个民族精神世界的坍塌。云矜裤的诞生，源于一次抢救性的田野调查。
            </p>
          </div>
          <div className="relative h-[600px] overflow-hidden rounded-sm">
             <img 
               src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573844182.jpg?imageMogr2/format/webp" 
               alt="Traditional Tools" 
               className="parallax-img w-full h-[120%] object-cover"
             />
             <div className="absolute inset-0 bg-ink-900/20" />
          </div>
        </div>
      </section>

      {/* Chapter 2: The Future */}
      <section className="py-20">
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative h-[600px] overflow-hidden rounded-sm">
             <img 
               src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573843181.jpg?imageMogr2/format/webp" 
               alt="Digital Future" 
               className="parallax-img w-full h-[120%] object-cover"
             />
             <div className="absolute inset-0 bg-ink-900/20" />
          </div>
          <div className="order-1 md:order-2 reveal-text space-y-6">
            <h2 className="text-3xl font-serif text-mist-100">数字的重生</h2>
            <p className="text-mist-300 leading-relaxed text-lg font-light">
              我们试图用最前沿的 AI 技术，去解构最古老的东方美学。通过计算机视觉，我们将复杂的刺绣纹样转化为可被永久保存的数字资产。
            </p>
            <p className="text-mist-300 leading-relaxed text-lg font-light">
              这不是简单的复制，而是赋予传统文化以新的生命形式。在虚拟世界中，这些纹样可以被无限重组、演绎，成为连接过去与未来的数字纽带。
            </p>
          </div>
        </div>
      </section>

      {/* Team / Values */}
      <section className="py-32 bg-ink-800">
        <div className="container-custom text-center max-w-4xl mx-auto">
          <h2 className="reveal-text text-4xl font-serif text-gold-100 mb-16">我们的愿景</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="reveal-text space-y-4">
              <div className="text-5xl mb-2 opacity-20 font-serif">01</div>
              <h3 className="text-xl font-serif text-mist-100">记录</h3>
              <p className="text-mist-500 text-sm">建立最完整的民族服饰数字基因库</p>
            </div>
            <div className="reveal-text space-y-4">
              <div className="text-5xl mb-2 opacity-20 font-serif">02</div>
              <h3 className="text-xl font-serif text-mist-100">传播</h3>
              <p className="text-mist-500 text-sm">让传统美学重回年轻人的日常生活</p>
            </div>
            <div className="reveal-text space-y-4">
              <div className="text-5xl mb-2 opacity-20 font-serif">03</div>
              <h3 className="text-xl font-serif text-mist-100">共创</h3>
              <p className="text-mist-500 text-sm">构建开放的文化开源社区</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-32 relative">
        <div className="container-custom text-center">
           <h2 className="reveal-text text-6xl md:text-8xl font-serif text-gold-500/20 mb-8 select-none">CONTACT</h2>
           <div className="reveal-text relative z-10 -mt-16 md:-mt-24 space-y-8">
             <p className="text-2xl font-serif text-mist-100">准备好一起探索了吗？</p>
             <a href="mailto:hello@yunjinku.com" className="inline-flex items-center gap-3 text-gold-500 hover:text-gold-300 transition-colors text-lg">
               <span>hello@yunjinku.com</span>
               <ArrowRight />
             </a>
             
             <div className="flex justify-center gap-8 mt-12">
               <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-mist-500 hover:text-gold-500 transition-colors"><Github /></a>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
}