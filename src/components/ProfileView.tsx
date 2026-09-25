import React, { useState } from 'react';
import { User as UserIcon, Heart, Bookmark, Edit3, Sparkles, Plus, Check } from 'lucide-react';
import { User, OutfitPost } from '../types';

interface ProfileViewProps {
  currentUser: User | null;
  posts: OutfitPost[];
  savedPostIds: number[];
  onOpenFittingRoom: () => void;
  onUpdateBio: (newBio: string, newFullName: string) => Promise<void>;
  onSwitchUser: (username: string) => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  posts,
  savedPostIds,
  onOpenFittingRoom,
  onUpdateBio,
  onSwitchUser,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'my_posts' | 'saved'>('my_posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-[#E60023] rounded-3xl flex items-center justify-center mx-auto mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Đăng nhập để xem hồ sơ</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Xem lại các bản phối Việt Phục đã được Chị Gatekeeper duyệt và danh sách ghim yêu thích của bạn.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-[#E60023] hover:bg-red-700 text-white font-bold rounded-2xl shadow-md text-sm transition-all"
        >
          Đăng Nhập Hoặc Đăng Ký
        </button>
      </div>
    );
  }

  // Filter user posts
  const myPosts = posts.filter((p) => p.author.username === currentUser.username);
  const savedPosts = posts.filter((p) => savedPostIds.includes(p.id));

  // Compute stats
  const totalLikes = myPosts.reduce((acc, p) => acc + p.likesCount, 0);
  const avgScore = myPosts.length > 0
    ? Math.round(myPosts.reduce((acc, p) => acc + p.culturalScore, 0) / myPosts.length)
    : 95;

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
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-neutral-100 shadow-lg"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-neutral-900">{currentUser.fullName}</h1>
                <p className="text-xs text-neutral-400 font-medium">@{currentUser.username}</p>
              </div>

              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => {
                    setEditFullName(currentUser.fullName);
                    setEditBio(currentUser.bio);
                    setIsEditing(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Chỉnh Sửa Bio
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-2xl">
              {currentUser.bio}
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-center sm:justify-start gap-6 pt-3 border-t border-neutral-100 text-xs">
              <div>
                <strong className="text-base font-black text-neutral-900">{myPosts.length}</strong>
                <span className="text-neutral-400 block text-[11px]">Bản Phối Đã Lên Sàn</span>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div>
                <strong className="text-base font-black text-[#E60023]">{avgScore}/100</strong>
                <span className="text-neutral-400 block text-[11px]">Điểm Di Sản TB</span>
              </div>
              <div className="w-px h-8 bg-neutral-200" />
              <div>
                <strong className="text-base font-black text-neutral-900">{totalLikes}</strong>
                <span className="text-neutral-400 block text-[11px]">Lượt Thả Tim</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Switcher Quick Bar */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-neutral-400 font-semibold">Chuyển nhanh tài khoản demo:</span>
          <div className="flex items-center gap-2">
            {[
              { u: 'linhdan_phuc', name: 'Linh Đan (Gen-Z)' },
              { u: 'hoangnam_remix', name: 'Hoàng Nam (KTS)' },
              { u: 'chigatekeeper', name: 'Chị Gatekeeper' },
            ].map((acc) => (
              <button
                key={acc.u}
                onClick={() => onSwitchUser(acc.u)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  currentUser.username === acc.u
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {acc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-neutral-200 mb-6">
        <button
          onClick={() => setActiveTab('my_posts')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'my_posts'
              ? 'text-neutral-900 border-b-2 border-[#E60023]'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          Bản Phối Của Tôi ({myPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'saved'
              ? 'text-neutral-900 border-b-2 border-[#E60023]'
              : 'text-neutral-400 hover:text-neutral-600'
          }`}
        >
          Đã Ghim ({savedPosts.length})
        </button>
      </div>

      {/* Content Grid */}
      {activeTab === 'my_posts' && (
        <>
          {myPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8 space-y-3">
              <Sparkles className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-800 text-sm">Bạn chưa có bản phối nào lên sàn</h3>
              <p className="text-xs text-neutral-400">Hãy vào phòng thử đồ để kết hợp trang phục và xin tem duyệt từ Chị Gatekeeper!</p>
              <button
                onClick={onOpenFittingRoom}
                className="px-5 py-2.5 bg-[#E60023] text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-colors"
              >
                Vào Phòng Thử Đồ Ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-shadow group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
                        <Heart className="w-3.5 h-3.5 fill-current" /> {post.likesCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'saved' && (
        <>
          {savedPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8 space-y-2">
              <Bookmark className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-800 text-sm">Chưa có bản phối nào được ghim</h3>
              <p className="text-xs text-neutral-400">Bấm vào biểu tượng bookmark trên các bản phối ở Bảng Tin để lưu vào đây nhé!</p>
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
                    <p className="text-xs text-neutral-500">{post.author.fullName}</p>
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2.5 bg-[#E60023] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
