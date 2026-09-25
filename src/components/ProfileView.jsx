import React, { useState, useEffect } from 'react';
import { User as UserIcon, Heart, Bookmark, Edit3, Sparkles, Plus, Check, LogIn, Calendar, Trash2 } from 'lucide-react';

export const ProfileView = ({
  currentUser,
  onOpenFittingRoom,
  onUpdateBio,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState('my_posts');
  const [myPosts, setMyPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(currentUser?.full_name || currentUser?.fullName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');

  // Load user's real posts and saved posts from database
  useEffect(() => {
    if (!currentUser) return;

    async function fetchUserData() {
      setLoadingPosts(true);
      try {
        const token = localStorage.getItem('vpr_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch user's own created posts
        const postsRes = await fetch(`/api/v1/outfits/user/${currentUser.username}`, { headers });
        if (postsRes.ok) {
          const data = await postsRes.json();
          setMyPosts(data);
        }

        // Fetch user's saved/bookmarked posts
        const savedRes = await fetch('/api/v1/outfits/bookmarks/mine', { headers });
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedPosts(savedData);
        }
      } catch (err) {
        console.error('Error fetching profile posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-[#E60023] rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Đăng nhập để xem hồ sơ</h2>
        <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
          Đăng nhập hoặc đăng ký tài khoản mới để lưu trữ các bản phối Việt Phục cá nhân, theo dõi lượt thích và xem các bài đã ghim.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-6 py-3 bg-[#E60023] hover:bg-red-700 text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm transition-all cursor-pointer"
          >
            Đăng Nhập Tài Khoản
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-6 py-3 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold rounded-2xl shadow-sm text-xs sm:text-sm transition-all cursor-pointer"
          >
            Đăng Ký Tài Khoản Mới
          </button>
        </div>
      </div>
    );
  }

  // Compute real metrics
  const totalLikes = myPosts.reduce((acc, p) => acc + (p.likesCount || 0), 0);
  const avgScore =
    myPosts.length > 0
      ? Math.round(myPosts.reduce((acc, p) => acc + (p.culturalScore || 85), 0) / myPosts.length)
      : 0;

  const handleSaveProfile = async () => {
    await onUpdateBio(editBio, editFullName);
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 shadow-sm relative overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <img
            src={currentUser.avatar_url || currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
            alt={currentUser.full_name || currentUser.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-neutral-100 shadow-lg"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-neutral-900">{currentUser.full_name || currentUser.fullName}</h1>
                <p className="text-xs text-neutral-400 font-medium">@{currentUser.username}</p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => {
                    setEditFullName(currentUser.full_name || currentUser.fullName);
                    setEditBio(currentUser.bio || '');
                    setIsEditing(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Chỉnh Sửa Bio
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl">
              {currentUser.bio || 'Chưa cập nhật tiểu sử'}
            </p>

            {/* Real Stats Row from SQLite Database */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-3 border-t border-neutral-100 text-xs">
              <div>
                <strong className="text-base font-black text-neutral-900">{myPosts.length}</strong>
                <span className="text-neutral-400 block text-[11px]">Bản Phối Trong DB</span>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div>
                <strong className="text-base font-black text-[#E60023]">
                  {avgScore > 0 ? `${avgScore}/100` : '--'}
                </strong>
                <span className="text-neutral-400 block text-[11px]">Điểm Di Sản TB</span>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div>
                <strong className="text-base font-black text-neutral-900">{totalLikes}</strong>
                <span className="text-neutral-400 block text-[11px]">Lượt Thả Tim Nhận</span>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div>
                <strong className="text-base font-black text-neutral-900">{savedPosts.length}</strong>
                <span className="text-neutral-400 block text-[11px]">Bản Phối Đã Lưu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-neutral-200 mb-6">
        <button
          onClick={() => setActiveTab('my_posts')}
          className={`pb-3 text-sm font-bold transition-all cursor-pointer relative ${
            activeTab === 'my_posts'
              ? 'text-neutral-900 border-b-2 border-[#E60023]'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          Bản Phối Của Tôi ({myPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 text-sm font-bold transition-all cursor-pointer relative ${
            activeTab === 'saved'
              ? 'text-neutral-900 border-b-2 border-[#E60023]'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          Đã Ghim / Đã Lưu ({savedPosts.length})
        </button>
      </div>

      {/* Content Grid */}
      {loadingPosts ? (
        <div className="text-center py-12 text-xs text-neutral-400">Đang tải dữ liệu từ cơ sở dữ liệu...</div>
      ) : activeTab === 'my_posts' ? (
        <>
          {myPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
              <Sparkles className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-800 text-sm">Bạn chưa đăng bản phối nào</h3>
              <p className="text-xs text-neutral-400">
                Hãy vào phòng thử đồ để kết hợp trang phục và xin tem duyệt từ Chị Gatekeeper!
              </p>
              <button
                onClick={onOpenFittingRoom}
                className="px-5 py-2.5 bg-[#E60023] text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-colors cursor-pointer"
              >
                Vào Phòng Thử Đồ Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-shadow group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#E60023] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                        ĐÃ DUYỆT • {post.culturalScore}/100
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-neutral-500 line-clamp-2 italic">"{post.aiFeedback}"</p>
                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-100">
                      <span>📍 {post.event}</span>
                      <span className="flex items-center gap-1 text-red-500 font-bold">
                        <Heart className="w-3.5 h-3.5 fill-current" /> {post.likesCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {savedPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8 space-y-2">
              <Bookmark className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-800 text-sm">Chưa có bản phối nào được ghim</h3>
              <p className="text-xs text-neutral-400">
                Bấm vào biểu tượng bookmark trên các bản phối ở Bảng Tin để lưu vào đây nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <span className="p-2 bg-neutral-900 text-white rounded-full text-xs shadow-md inline-block">
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-sm text-neutral-900 line-clamp-1">{post.title}</h4>
                    <p className="text-xs text-neutral-500">{post.author?.fullName || post.author?.full_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit Bio Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-900">Chỉnh Sửa Hồ Sơ Cá Nhân</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700">Họ và Tên</label>
              <input
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-700">Tiểu Sử (Bio)</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#E60023]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2.5 bg-[#E60023] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Lưu Vào Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
