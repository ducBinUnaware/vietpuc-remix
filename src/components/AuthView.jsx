import React, { useState } from 'react';
import { Sparkles, LogIn, UserPlus, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, X, Heart, Shirt, ArrowRight } from 'lucide-react';

export const AuthView = ({ onLoginSuccess, onClose, initialMode = 'login', isModal = false }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Preset avatar choices
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isLoginMode) {
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Mật khẩu phải dài tối thiểu 6 ký tự.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLoginMode ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = isLoginMode
        ? { username: username.trim(), password }
        : {
            username: username.trim(),
            password,
            fullName: fullName.trim(),
            email: email.trim(),
            avatarUrl: avatarUrl || avatarPresets[0],
            bio: bio.trim(),
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Đã xảy ra lỗi trong quá trình xử lý.');
        setLoading(false);
        return;
      }

      setSuccessMsg(isLoginMode ? 'Đăng nhập thành công!' : 'Đăng ký tài khoản thành công! Đang chuyển hướng...');

      // Save real user and session token to browser storage
      localStorage.setItem('vpr_token', data.token);
      localStorage.setItem('vpr_user', JSON.stringify(data.user));

      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        if (onClose) onClose();
      }, 700);
    } catch (err) {
      setErrorMsg('Không thể kết nối đến máy chủ cơ sở dữ liệu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 w-full max-w-xl mx-auto relative">
      {/* Close button if in modal mode */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-neutral-900/60 hover:bg-neutral-900 text-white p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-950 via-stone-900 to-red-950 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E60023] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-600/30">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl tracking-tight">Audition Việt Phục</span>
              <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                Database Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              {isLoginMode
                ? 'Đăng nhập vào tài khoản của bạn để khám phá và lưu trữ bản phối'
                : 'Đăng ký tài khoản mới để bước vào sàn diễn di sản Gen-Z'}
            </p>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-neutral-200 bg-neutral-50 p-1.5 gap-2">
        <button
          type="button"
          onClick={() => {
            setIsLoginMode(true);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isLoginMode
              ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <LogIn className="w-4 h-4 text-[#E60023]" />
          Đăng Nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLoginMode(false);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-3 text-xs sm:text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            !isLoginMode
              ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <UserPlus className="w-4 h-4 text-[#E60023]" />
          Đăng Ký Tài Khoản Mới
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs sm:text-sm rounded-2xl border border-red-200 flex items-start gap-2.5 font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-[#E60023] shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs sm:text-sm rounded-2xl border border-emerald-200 flex items-start gap-2.5 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* REGISTER FIELDS */}
        {!isLoginMode && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700">Họ và Tên *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Phương Linh"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700">Địa chỉ Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="linh.nguyen@vietphuc.vn"
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] font-medium"
              />
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700">Chọn Avatar Phong Cách:</label>
              <div className="flex items-center gap-3">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`relative rounded-xl overflow-hidden ring-2 transition-all p-0.5 cursor-pointer ${
                      avatarUrl === preset || (!avatarUrl && idx === 0)
                        ? 'ring-[#E60023] scale-105 shadow-md'
                        : 'ring-neutral-200 hover:ring-neutral-400'
                    }`}
                  >
                    <img src={preset} alt={`Avatar ${idx + 1}`} className="w-10 h-10 rounded-lg object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700">Giới Thiệu Bản Thân (Bio tùy chọn)</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Đam mê Áo Nhật Bình và phong cách Y2K..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] font-medium"
              />
            </div>
          </>
        )}

        {/* COMMON FIELDS: Username & Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-neutral-700">
            {isLoginMode ? 'Tên đăng nhập hoặc Email *' : 'Tên đăng nhập (Username) *'}
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={isLoginMode ? 'Nhập username hoặc email của bạn' : 'Ví dụ: phuonglinh_remix'}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] font-medium"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-700">Mật Khẩu *</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] text-neutral-500 hover:text-neutral-800 font-medium flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Ẩn' : 'Hiện'}</span>
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] font-medium"
          />
        </div>

        {!isLoginMode && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700">Xác Nhận Mật Khẩu *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] font-medium"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E60023] hover:bg-red-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Đang xử lý dữ liệu...
              </span>
            ) : isLoginMode ? (
              <>
                <LogIn className="w-4 h-4" /> Đăng Nhập Tài Khoản
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Hoàn Tất Đăng Ký Tài Khoản
              </>
            )}
          </button>
        </div>

        {/* Heritage Respect Pledge */}
        <div className="pt-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tài khoản được lưu an toàn trong SQLite Database với mã hóa mật khẩu một chiều.</span>
        </div>
      </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
        {content}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {content}
    </div>
  );
};
