import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { authApi } from '@/utils/api';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'input' | 'sending' | 'verifying' | 'success' | 'error'>('input');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // 倒计时处理
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('error');
      setMessage('请输入有效的邮箱地址');
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const response = await authApi.sendVerificationCode({ email });

      if (response.success) {
        setStatus('input');
        setMessage('');
        setCanResend(false);
        setCountdown(60); // 60秒倒计时
      } else {
        setStatus('error');
        setMessage(response.error || '发送验证码失败');
        setCanResend(true);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || '发送验证码失败，请稍后重试');
      setCanResend(true);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setStatus('error');
      setMessage('请输入6位验证码');
      return;
    }

    setStatus('verifying');
    setMessage('');

    try {
      const response = await authApi.verifyEmailCode({ email, code });

      if (response.success) {
        setStatus('success');
        setMessage('邮箱验证成功！您现在可以登录了。');
      } else {
        setStatus('error');
        setMessage(response.error || '验证失败');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || '验证失败，请稍后重试');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
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
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="absolute top-4 left-4 text-mist-400 hover:text-mist-200 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 relative overflow-hidden rounded-full border border-gold-500/30 bg-ink-900 flex items-center justify-center">
              <img src="https://cdn.wegic.ai/assets/onepage/agent/images/1764573456796.png?imageMogr2/format/webp" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-serif text-gold-100">邮箱验证</h1>
          </div>

          {/* Status Icons */}
          <div className="flex justify-center mb-6">
            {(status === 'sending' || status === 'verifying') && (
              <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center">
                <Loader2 size={40} className="text-gold-500 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={40} className="text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle size={40} className="text-red-500" />
              </div>
            )}
          </div>

          {/* Input Form */}
          {status === 'input' && (
            <>
              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-mist-300 text-sm mb-2">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入您的邮箱"
                  className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-mist-100 placeholder-mist-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                />
              </div>

              {/* Send Code Button */}
              <button
                onClick={handleSendCode}
                disabled={!canResend}
                className="w-full bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {canResend ? (
                  <>
                    <Mail size={18} />
                    <span>发送验证码</span>
                  </>
                ) : (
                  <span>{countdown}秒后可重新发送</span>
                )}
              </button>

              {/* Verification Code Input */}
              <div className="mb-4">
                <label className="block text-mist-300 text-sm mb-2">验证码</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-ink-900/50 border border-white/10 rounded-xl text-mist-100 placeholder-mist-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-center text-2xl tracking-widest"
                />
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={code.length !== 6}
                className="w-full bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                验证邮箱
              </button>
            </>
          )}

          {/* Status Messages */}
          {status !== 'input' && (
            <div className="text-center mb-8">
              {status === 'sending' && (
                <p className="text-mist-300 text-lg">正在发送验证码...</p>
              )}
              {status === 'verifying' && (
                <p className="text-mist-300 text-lg">正在验证您的邮箱...</p>
              )}
              {status === 'success' && (
                <>
                  <p className="text-mist-300 text-lg mb-4">{message}</p>
                  <p className="text-mist-500 text-sm">感谢您的注册，欢迎加入云矜ku！</p>
                </>
              )}
              {status === 'error' && (
                <>
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{message}</p>
                  </div>
                  {status === 'error' && (
                    <button
                      onClick={() => setStatus('input')}
                      className="text-gold-500 hover:text-gold-300 text-sm transition-colors"
                    >
                      重新尝试
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {status === 'success' && (
            <button
              onClick={handleGoToLogin}
              className="w-full bg-gold-500 hover:bg-gold-300 text-ink-900 font-medium py-3 px-6 rounded-xl transition-all"
            >
              前往登录
            </button>
          )}

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-mist-500 text-sm">
              验证码有效期为10分钟，请尽快完成验证。
            </p>
            <p className="text-mist-500 text-sm mt-2">
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