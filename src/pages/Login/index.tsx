import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '@/utils/api';

// 登录注册页，表单逻辑有点绕，将就看吧
export default function Login() {
  const nav = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [cd, setCd] = useState(0); // 倒计时
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    verificationCode: ''
  });

  // 倒计时，每次cd变了就重新设interval
  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    if (cd > 0) {
      t = setInterval(() => setCd(p => p - 1), 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [cd]);

  // 发验证码，邮箱格式得对才能发
  const sendCd = async () => {
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setErr('请输入有效的邮箱地址');
      return;
    }
    try {
      const r = await auth.sendCode({ email: form.email });
      if (r.success) {
        setCodeSent(true);
        setCd(60);
        setErr('');
      } else {
        setErr(r.error || '发送验证码失败');
      }
    } catch (e: any) {
      setErr(e.message || '发送验证码失败，请稍后重试');
    }
  };

  // 表单提交，登录注册逻辑混在一起，有点乱
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setOkMsg('');
    setLoading(true);

    try {
      if (!form.email || !form.password) {
        setErr('请填写邮箱和密码');
        return;
      }
      if (!isLogin && !form.name) {
        setErr('请填写用户名');
        return;
      }
      if (form.password.length < 6) {
        setErr('密码长度至少为6位');
        return;
      }

      if (isLogin) {
        const r = await auth.login({ email: form.email, password: form.password });
        if (r.success) {
          setOkMsg('登录成功！正在跳转...');
          setTimeout(() => nav('/'), 1000);
        }
      } else {
        if (!codeSent) {
          setErr('请先获取验证码');
          setLoading(false);
          return;
        }
        if (!form.verificationCode || form.verificationCode.length !== 6) {
          setErr('请输入6位验证码');
          setLoading(false);
          return;
        }
        const r = await auth.register({
          username: form.name,
          email: form.email,
          password: form.password,
          verificationCode: form.verificationCode,
        });
        if (r.success) {
          setOkMsg('注册成功！正在跳转...');
          setTimeout(() => nav('/'), 1500);
        }
      }
    } catch (e: any) {
      setErr(e.message || '操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 切换登录/注册时清空提示
  const toggle = (login: boolean) => {
    setIsLogin(login);
    setErr('');
    setOkMsg('');
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center relative overflow-hidden">
      {/* 背景装饰，两个模糊的圆 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左边品牌介绍 */}
          <div className="space-y-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 relative overflow-hidden rounded-full border border-gold-500/30 bg-ink-900 flex items-center justify-center group-hover:border-gold-500 transition-colors">
                <img src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573456796.png?imageMogr2/format/webp" alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <span className="text-2xl font-serif tracking-widest text-gold-100">云矜ku</span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-serif text-gold-100 leading-tight">
                {isLogin ? '欢迎归来' : '开启文化之旅'}
              </h1>
              <p className="text-mist-300 text-lg leading-relaxed">
                {isLogin
                  ? '登录您的账户，继续探索中华民族服饰文化的瑰宝。'
                  : '加入云矜ku，与我们一起守护和传承民族文化的珍贵记忆。'}
              </p>
            </div>

            {/* 三个特性展示 */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500">
                  <User size={16} />
                </div>
                <span className="text-mist-300">个性化文化探索体验</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500">
                  <Lock size={16} />
                </div>
                <span className="text-mist-300">安全可靠的账户保护</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500">
                  <Mail size={16} />
                </div>
                <span className="text-mist-300">及时获取文化动态推送</span>
              </div>
            </div>
          </div>

          {/* 右边表单 */}
          <div className="bg-ink-800/50 backdrop-blur-lg border border-white/5 rounded-2xl p-8 md:p-12">
            {/* 登录/注册切换 */}
            <div className="mb-8">
              <div className="flex gap-2 bg-ink-900 p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => toggle(true)}
                  disabled={loading}
                  className={`flex-1 py-2 px-6 rounded-full text-sm font-medium transition-all ${
                    isLogin ? 'bg-gold-500 text-ink-900' : 'text-mist-300 hover:text-mist-100'
                  }`}
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => toggle(false)}
                  disabled={loading}
                  className={`flex-1 py-2 px-6 rounded-full text-sm font-medium transition-all ${
                    !isLogin ? 'bg-gold-500 text-ink-900' : 'text-mist-300 hover:text-mist-100'
                  }`}
                >
                  注册
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {err && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{err}</p>
              </div>
            )}

            {/* 成功提示 */}
            {okMsg && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-400 text-sm">{okMsg}</p>
              </div>
            )}

            <form onSubmit={submit} className="space-y-6">
              {/* 注册时要填用户名 */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm text-mist-300">用户名</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                    <input
                      type="text"
                      placeholder="请输入用户名"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      disabled={loading}
                      className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-gold-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-mist-300">邮箱</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                  <input
                    type="email"
                    placeholder="请输入邮箱"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    disabled={loading || cd > 0}
                    className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-gold-500/50 transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* 注册时的验证码输入 */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm text-mist-300">邮箱验证码</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="请输入6位验证码"
                      value={form.verificationCode}
                      onChange={e => setForm({ ...form, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      disabled={loading || !codeSent}
                      maxLength={6}
                      className="flex-1 px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-mist-100 placeholder-mist-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-center text-2xl tracking-widest disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={sendCd}
                      disabled={loading || cd > 0 || !form.email || !/^\S+@\S+\.\S+$/.test(form.email)}
                      className="px-4 py-3 bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium rounded-xl transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {cd > 0 ? `${cd}秒` : '发送验证码'}
                    </button>
                  </div>
                  {codeSent && <p className="text-xs text-mist-500">验证码已发送到您的邮箱，10分钟内有效</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-mist-300">密码</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    disabled={loading}
                    className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-gold-500/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-mist-500 hover:text-gold-500 transition-colors disabled:opacity-50"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* 登录时显示记住我和忘记密码 */}
              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-mist-300 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-ink-900/50 focus:ring-gold-500/50" />
                    <span>记住我</span>
                  </label>
                  <Link to="/forgot-password" className="text-gold-500 hover:text-gold-300 transition-colors">
                    忘记密码？
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
                    <span>{isLogin ? '登录中...' : '注册中...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? '登录' : '注册'}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* 第三方登录，暂未实现 */}
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="text-center text-sm text-mist-500">
                <span className="block mb-2">或者使用以下方式继续</span>
                <div className="flex gap-4 justify-center">
                  <button className="p-3 bg-ink-900/50 border border-white/10 rounded-xl hover:border-gold-500/30 hover:bg-gold-500/5 transition-all">
                    <img src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573456796.png" alt="WeChat" className="w-6 h-6 object-contain" />
                  </button>
                  <button className="p-3 bg-ink-900/50 border border-white/10 rounded-xl hover:border-gold-500/30 hover:bg-gold-500/5 transition-all">
                    <div className="w-6 h-6 bg-gold-500/20 rounded" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
