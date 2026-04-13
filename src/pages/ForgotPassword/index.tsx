import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { authApi } from '@/utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email) {
        setError('请输入邮箱地址');
        return;
      }

      const response = await authApi.forgotPwd({ email });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || '发送失败');
      }
    } catch (err: any) {
      setError(err.message || '发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-serif text-gold-100">重置密码</h1>
          </div>

          {/* Description */}
          {!success ? (
            <div className="mb-8 text-center">
              <p className="text-mist-300 mb-2">
                输入您的邮箱地址，我们将向您发送重置密码的链接。
              </p>
              <p className="text-mist-500 text-sm">
                链接将在 1 小时后过期
              </p>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </div>
              <p className="text-mist-300 text-center mb-2">
                如果该邮箱已注册，您将收到重置密码的邮件。
              </p>
              <p className="text-mist-500 text-sm text-center">
                请检查您的邮箱（包括垃圾箱）并点击邮件中的链接。
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-mist-300">邮箱地址</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist-500" />
                  <input
                    type="email"
                    placeholder="请输入您的邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-mist-100 placeholder:text-mist-600 focus:outline-none focus:border-gold-500/50 transition-colors"
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
                    <span>发送中...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>发送重置链接</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back Button */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-mist-400 hover:text-mist-300 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span>返回登录</span>
            </Link>
          </div>

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