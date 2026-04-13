import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { authApi, getImageUrl } from '@/utils/api';

interface User {
  userId: string;
  username: string;
  avatar?: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getMe();
        if (response.success && response.data && (response.data as any).userId) {
          const userData = response.data as User;
          setUser(userData);
          // 存到 localStorage，其他组件可以用
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.log('未登录或会话已过期');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 监听路由变化，当访问个人中心页面时重新获取用户信息
  useEffect(() => {
    if (location.pathname.startsWith('/profile/') && user) {
      const fetchUserInfo = async () => {
        try {
          // 重新获取当前用户信息，以更新头像等数据
          const response = await authApi.getMe();
          if (response.success && response.data && (response.data as any).userId) {
            setUser(response.data as User);
          }
        } catch (error) {
          console.log('获取用户信息失败:', error);
        }
      };

      fetchUserInfo();
    }
  }, [location.pathname]);

  // 退出登录
  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setShowUserMenu(false);
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '首页', path: '/' },
    { name: '智识', path: '/recognition' },
    { name: '锦绣', path: '/gallery' },
    { name: '博物', path: '/museum' },
    { name: '共赏', path: '/share' },
    { name: '缘起', path: '/about' },
  ];

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 w-full z-50 transition-all duration-500',
        isScrolled || location.pathname === '/gallery' 
          ? 'bg-ink-900/80 backdrop-blur-lg border-b border-mist-500/10' 
          : 'bg-transparent'
      )}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 relative overflow-hidden rounded-full border border-gold-500/30 bg-ink-900 flex items-center justify-center group-hover:border-gold-500 transition-colors">
             <img src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573456796.png?imageMogr2/format/webp" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xl font-serif tracking-widest text-gold-100">云矜ku</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={clsx(
                'nav-link text-sm uppercase tracking-wider',
                location.pathname === link.path ? 'text-gold-500 after:w-full' : 'text-mist-300'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          ) : user ? (
            // 已登录：显示用户头像和菜单
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/30 text-gold-500 text-xs tracking-wide hover:bg-gold-500 hover:text-ink-900 transition-all"
              >
                <img
                  src={getImageUrl(user.avatar)}
                  alt={user.username}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span>{user.username}</span>
                <ChevronDown size={14} />
              </button>

              {/* 用户下拉菜单 */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-ink-800 border border-white/10 rounded-xl shadow-xl py-2 z-50">
                  <Link
                    to={`/profile/${user.userId}`}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-mist-300 hover:text-gold-500 hover:bg-gold-500/5 transition-colors"
                  >
                    <Settings size={16} />
                    <span>个人中心</span>
                  </Link>
                  <hr className="my-2 border-white/5" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>退出登录</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 未登录：显示登录按钮
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-500/30 text-gold-500 text-xs tracking-wide hover:bg-gold-500 hover:text-ink-900 transition-all"
            >
              <User size={16} />
              <span>登录</span>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-mist-100"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          'fixed inset-0 bg-ink-900 z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="text-2xl font-serif text-gold-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        {/* 移动端用户区域 */}
        {user ? (
          <>
            <div className="w-16 h-1 bg-white/10" />
            <div className="flex items-center gap-3">
              <img
                src={getImageUrl(user.avatar)}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover border border-gold-500/30"
              />
              <span className="text-gold-100 font-serif">{user.username}</span>
            </div>
            <Link
              to={`/profile/${user.userId}`}
              className="text-mist-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              个人中心
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="text-red-400"
            >
              退出登录
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-gold-500"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            登录
          </Link>
        )}
      </div>
    </header>
  );
}