import React, { useState } from 'react';
import { X, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('linhdan_phuc');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isLoginMode ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = isLoginMode
        ? { username, password }
        : { username, password, fullName, email };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      // Save session
      localStorage.setItem('vpr_token', data.token);
      localStorage.setItem(
        'vpr_user',
        JSON.stringify({
          id: data.userId,
          username: data.username,
          fullName: data.fullName,
          email: data.email,
          avatarUrl: data.avatarUrl,
          bio: data.bio,
        })
      );

      onLoginSuccess(
        {
          id: data.userId,
          username: data.username,
          fullName: data.fullName,
          email: data.email,
          avatarUrl: data.avatarUrl,
          bio: data.bio,
        },
        data.token
      );
      onClose();
    } catch (err) {
      setErrorMsg('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoUser: string) => {
    setUsername(demoUser);
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in fade-in duration-200 border border-neutral-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-red-950 p-6 text-white text-center">
          <div className="w-12 h-12 bg-[#E60023] rounded-2xl flex items-center justify-center mx-auto mb-2 text-white font-black text-xl shadow-lg">
            V
          </div>
          <h2 className="text-xl font-black">
            {isLoginMode ? 'Đăng Nhập Audition Việt Phục' : 'Tạo Tài Khoản Nhà Phối Đồ'}
          </h2>
          <p className="text-xs text-neutral-300 mt-1">
            Gia nhập cộng đồng remix cổ phục Việt cùng Gen-Z và Chị Gatekeeper
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              {errorMsg}
            </div>
          )}

          {!isLoginMode && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Họ và Tên *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Thị Mai"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700">Tên Đăng Nhập (Username) *</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nhap_username"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700">Mật Khẩu *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#E60023] hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              'Đang xử lý...'
            ) : isLoginMode ? (
              <>
                <LogIn className="w-4 h-4" /> Đăng Nhập
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Tạo Tài Khoản
              </>
            )}
          </button>

          {/* Quick Demo Credentials */}
          {isLoginMode && (
            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[11px] text-neutral-400 font-semibold block mb-1.5 text-center">
                Hoặc chọn nhanh tài khoản có sẵn:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('linhdan_phuc')}
                  className="text-[11px] font-semibold py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 transition-colors"
                >
                  👩 Linh Đan Phạm
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('hoangnam_remix')}
                  className="text-[11px] font-semibold py-1.5 px-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 transition-colors"
                >
                  👨 Hoàng Nam KTS
                </button>
              </div>
            </div>
          )}

          {/* Switch Mode */}
          <div className="text-center pt-2 text-xs">
            {isLoginMode ? (
              <span className="text-neutral-500">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(false)}
                  className="text-[#E60023] font-bold hover:underline"
                >
                  Đăng ký ngay
                </button>
              </span>
            ) : (
              <span className="text-neutral-500">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  className="text-[#E60023] font-bold hover:underline"
                >
                  Đăng nhập
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
