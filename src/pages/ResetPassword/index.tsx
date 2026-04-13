import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('重置链接无效或已过期');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!token) {
        setError('重置链接无效或已过期');
        return;
      }

      if (!password || !confirmPassword) {
        setError('请填写所有字段');
        return;
      }

      if (password.length < 6) {
        setError('密码长度至少为6位');
        return;
      }

      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }

      const response = await authApi.resetPwd({ token, newPassword: password });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || '重置失败');
      }
    } catch (err: any) {
      setError(err.message || '重置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12">
        <div className="bg-ink-800/50 backdrop-blur-lg border border-white/5 rounded-2xl p-8 md:p-12">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 relative overflow-hidden rounded-full border border-gold-500/30 bg-ink-900 flex items-center justify-center">
              <img src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573456796.png?imageMogr2/format/webp" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-serif text-gold-100">设置新密码</h1>
          </div>

          {/* Success State */}
          {success ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </div>
              <p className="text-mist-300 text-center mb-6">
                密码重置成功！您现在可以使用新密码登录了。
              </p>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium py-3 px-6 rounded-xl transition-all"
              >
                前往登录
              </button>
            </>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              {!token ? (
                <div className="text-center py-8">
                  <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                  <p className="text-mist-300 mb-6">重置链接无效或已过期</p>
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-ink-900/50 hover:bg-ink-900 text-mist-300 font-medium py-3 px-6 rounded-xl transition-all border border-white/10"
                  >
                    返回登录
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-mist-300">新密码</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="请输入新密码（至少6位）"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-gold-500/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-mist-500 hover:text-gold-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-mist-300">确认新密码</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="请再次输入新密码"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-gold-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>重置中...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        <span>重置密码</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Back Button */}
              {!success && token && (
                <div className="mt-8 pt-8 border-t border-white/5">
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-ink-900/50 hover:bg-ink-900 text-mist-300 font-medium py-3 px-6 rounded-xl transition-all border border-white/10"
                  >
                    返回登录
                  </button>
                </div>
              )}
            </>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-mist-500 text-xs">
              遇到问题？请联系{' '}
              <a href="mailto:support@yunjinku.com" className="text-gold-500 hover:text-gold-300 transition-colors">
                support@yunjinku.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}