import { Link, useLocation } from 'react-router-dom';
import { Github } from 'lucide-react';
import clsx from 'clsx'; 

export default function Footer() {
  const location = useLocation();
  
  return (
    <footer className={clsx(
      "border-t border-white/5 pt-20 pb-10 relative overflow-hidden",
      location.pathname === '/gallery' 
        ? "bg-black/40 backdrop-blur-sm" 
        : "bg-ink-900"
    )}>
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-gold-500/30 bg-ink-800 flex items-center justify-center">
                 <span className="text-gold-500 font-serif">云</span>
              </div>
              <span className="text-2xl font-serif tracking-widest text-gold-100">云矜裤</span>
            </div>
            <p className="text-mist-500 text-sm leading-relaxed max-w-xs">
              致力基于AI技术保护与传承中华民族服饰文化。让传统纹样在数字时代重获新生，让每一缕丝线都诉说着千年的故事。
            </p>
          </div>
          
          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-gold-500 font-serif mb-6">探索</h4>
            <ul className="space-y-4 text-sm text-mist-300">
              <li><Link to="/recognition" className="hover:text-gold-300 transition-colors">AI 识别</Link></li>
              <li><Link to="/gallery" className="hover:text-gold-300 transition-colors">锦绣画廊</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-gold-500 font-serif mb-6">关于</h4>
            <ul className="space-y-4 text-sm text-mist-300">
              <li><Link to="/about" className="hover:text-gold-300 transition-colors">缘起</Link></li>
              <li><span className="opacity-50 cursor-not-allowed">加入我们</span></li>
              <li><span className="opacity-50 cursor-not-allowed">隐私政策</span></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-gold-500 font-serif mb-6">关注</h4>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-mist-300 hover:bg-gold-500 hover:text-ink-900 hover:border-gold-500 transition-all">
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-mist-500">
          <p>© 2024 Yun Jin Ku. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            Designed with <span className="text-cinnabar">❤</span> by AI & You
          </p>
        </div>
      </div>
    </footer>
  );
}
