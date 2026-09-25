import React, { useState } from 'react';
import { Search, Heart, Bookmark, Sparkles, X, Share2, Calendar, User, ExternalLink, Flame, Plus } from 'lucide-react';

export const FeedView = ({
  posts = [],
  currentUser,
  onLikePost,
  onToggleSave,
  onOpenFittingRoom,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [activePost, setActivePost] = useState(null);

  const filteredPosts = posts.filter((post) => {
    const titleMatch = post.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const eventMatch = post.event?.toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = (post.author?.fullName || post.author?.full_name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const tagsMatch = post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSearch = titleMatch || eventMatch || authorMatch || tagsMatch;
    if (!matchesSearch) return false;

    if (selectedTag === 'ALL') return true;
    if (selectedTag === 'NHAT_BINH') return post.tags?.some((t) => t.toLowerCase().includes('nhatbinh'));
    if (selectedTag === 'NGU_THAN') return post.tags?.some((t) => t.toLowerCase().includes('nguthan'));
    if (selectedTag === 'YEM') return post.tags?.some((t) => t.toLowerCase().includes('yem'));
    if (selectedTag === 'BUI_VIEN') return post.event?.toLowerCase().includes('bùi viện');
    if (selectedTag === 'CUOI') return post.event?.toLowerCase().includes('cưới');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
      {/* Hero Banner / Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-950 via-stone-900 to-red-950 text-white p-6 md:p-8 mb-8 shadow-xl border border-red-900/30">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-red-600/30 backdrop-blur-md border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold text-red-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            Audition Fashion x Google Gemini 3.8 Flash
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">
            Khám Phá Sàn Diễn <span className="text-[#E60023]">Việt Phục Remix</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-300 leading-relaxed mb-5">
            Sàn diễn kết hợp Áo Nhật Bình, Ngũ Thân, Yếm Lụa cùng phong cách Streetwear đương đại dưới đôi mắt thẩm định của Chị Gatekeeper AI. Toàn bộ tài khoản, lượt thích và bài đăng được lưu trữ trong cơ sở dữ liệu.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenFittingRoom}
              className="px-5 py-2.5 bg-[#E60023] hover:bg-red-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4" /> Thử Đồ & Chấm Điểm AI
            </button>
            {!currentUser && (
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/20 transition-all cursor-pointer"
              >
                Đăng ký tài khoản để đăng bài
              </button>
            )}
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search Bar & Quick Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bộ phối, sự kiện (Bùi Viện, tiệc cưới...), người tạo, #hashtag..."
            className="w-full bg-white border border-neutral-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60023] focus:border-transparent shadow-sm placeholder:text-neutral-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          {[
            { id: 'ALL', label: 'Tất Cả Bản Phối' },
            { id: 'NHAT_BINH', label: '👑 Áo Nhật Bình' },
            { id: 'NGU_THAN', label: '👘 Áo Ngũ Thân' },
            { id: 'YEM', label: '🌸 Yếm Lụa Dân Gian' },
            { id: 'BUI_VIEN', label: '🍻 Dạo Phố Bùi Viện' },
            { id: 'CUOI', label: '💍 Dự Tiệc Cưới' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTag(tab.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tab.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pinterest-style Masonry Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-red-50 text-[#E60023] rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900">
              {searchQuery ? 'Không tìm thấy bản phối phù hợp' : 'Chưa có bản phối nào trên sàn'}
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1">
              Hãy vào Phòng Thử Đồ, chọn các trang phục di sản yêu thích và đăng bản phối đầu tiên lưu vào cơ sở dữ liệu!
            </p>
          </div>
          <button
            onClick={onOpenFittingRoom}
            className="px-6 py-3 bg-[#E60023] text-white text-xs font-extrabold rounded-2xl shadow-md hover:bg-red-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo Bản Phối Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="pinterest-masonry">
          {filteredPosts.map((post) => {
            const isLiked = Boolean(post.isLiked);
            const isBookmarked = Boolean(post.isBookmarked);

            return (
              <div
                key={post.id}
                onClick={() => setActivePost(post)}
                className="pinterest-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 group relative cursor-pointer hover:-translate-y-1"
              >
                {/* Image & Overlays */}
                <div className="relative overflow-hidden aspect-[3/4] bg-neutral-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {post.culturalScore}/100 Điểm
                    </span>

                    {post.isApproved && (
                      <span className="bg-[#E60023] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-sm">
                        ĐÃ DUYỆT
                      </span>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!currentUser) {
                        onOpenAuth('login');
                        return;
                      }
                      onToggleSave(post.id);
                    }}
                    className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200 pointer-events-auto cursor-pointer ${
                      isBookmarked
                        ? 'bg-neutral-900 text-white shadow-md'
                        : 'bg-white/90 text-neutral-800 hover:bg-[#E60023] hover:text-white opacity-0 group-hover:opacity-100 shadow-lg'
                    }`}
                    title={isBookmarked ? 'Bỏ lưu' : 'Lưu bản phối'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Event Context Pill at Bottom of Image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="bg-neutral-900/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg truncate inline-block max-w-full font-medium border border-white/10">
                      📍 {post.event}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2.5">
                  <h3 className="font-bold text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#E60023] transition-colors">
                    {post.title}
                  </h3>

                  {/* AI Gatekeeper Quick Feedback Snippet */}
                  <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-100 text-xs text-neutral-700 leading-relaxed">
                    <span className="font-bold text-[#E60023] mr-1">Chị Gatekeeper:</span>
                    <span className="italic line-clamp-2">"{post.aiFeedback}"</span>
                  </div>

                  {/* Author Row & Like Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={post.author?.avatarUrl || post.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                        alt={post.author?.fullName || post.author?.full_name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-neutral-200 shrink-0"
                      />
                      <span className="text-xs font-semibold text-neutral-700 truncate">
                        {post.author?.fullName || post.author?.full_name || 'Nhà Phối Đồ'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUser) {
                          onOpenAuth('login');
                          return;
                        }
                        onLikePost(post.id);
                      }}
                      className={`flex items-center gap-1.5 text-xs transition-colors p-1.5 rounded-lg cursor-pointer ${
                        isLiked
                          ? 'text-red-600 bg-red-50 font-bold'
                          : 'text-neutral-500 hover:text-red-600 hover:bg-neutral-50'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 text-red-600' : 'text-neutral-400'}`} />
                      <span>{post.likesCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Detail Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
            {/* Close Button */}
            <button
              onClick={() => setActivePost(null)}
              className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column: Image */}
            <div className="md:w-1/2 bg-neutral-900 flex items-center justify-center relative min-h-[300px] md:min-h-full">
              <img
                src={activePost.imageUrl}
                alt={activePost.title}
                className="w-full h-full max-h-[70vh] md:max-h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-[#E60023] text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-lg">
                  {activePost.isApproved ? 'ĐÃ ĐƯỢC CHỊ GATEKEEPER DUYỆT' : 'CHƯA ĐẠT CHUẨN'}
                </span>
              </div>
            </div>

            {/* Right Column: Information & Full AI Review */}
            <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto space-y-5">
              {/* Author & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activePost.author?.avatarUrl || activePost.author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt={activePost.author?.fullName || activePost.author?.full_name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-neutral-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">
                      {activePost.author?.fullName || activePost.author?.full_name}
                    </h4>
                    <p className="text-xs text-neutral-500">@{activePost.author?.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onOpenAuth('login');
                        return;
                      }
                      onToggleSave(activePost.id);
                    }}
                    className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                      activePost.isBookmarked
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                    }`}
                    title="Lưu bản phối"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onOpenAuth('login');
                        return;
                      }
                      onLikePost(activePost.id);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-colors font-bold text-xs cursor-pointer ${
                      activePost.isLiked
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-[#E60023] hover:bg-red-100'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>{activePost.likesCount} Thả Tim</span>
                  </button>
                </div>
              </div>

              {/* Title & Event */}
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900 leading-tight mb-2">
                  {activePost.title}
                </h2>
                <div className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-700 px-3 py-1 rounded-xl text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  Bối cảnh: {activePost.event}
                </div>
              </div>

              {/* Chị Gatekeeper Official Verdict Box */}
              <div className="bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 border border-red-200 rounded-2xl p-4 md:p-5 space-y-3 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#E60023] text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <span className="font-extrabold text-sm text-[#E60023]">
                      Thẩm Định Của Chị Gatekeeper
                    </span>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 bg-white rounded-full text-neutral-800 shadow-sm border border-neutral-200">
                    ⭐ {activePost.culturalScore}/100 Điểm Di Sản
                  </span>
                </div>

                <p className="text-xs md:text-sm text-neutral-800 leading-relaxed font-medium italic">
                  "{activePost.aiFeedback}"
                </p>
              </div>

              {/* Wardrobe Items Breakdown */}
              {activePost.items && activePost.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Các Món Đồ Phối Trong Set:
                  </h4>
                  <div className="space-y-2">
                    {activePost.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50 border border-neutral-100"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-neutral-900">{item.name}</p>
                          <p className="text-neutral-500 text-[11px]">{item.culturalContext || item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activePost.tags?.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
