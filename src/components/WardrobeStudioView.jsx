import React, { useState } from 'react';
import { Sparkles, Check, Plus, Trash2, ArrowRight, ShieldCheck, Flame, RefreshCw, Info, LogIn } from 'lucide-react';

export const WardrobeStudioView = ({
  wardrobeItems = [],
  currentUser,
  onPublishPost,
  onOpenAuth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItemIds, setSelectedItemIds] = useState([1, 8, 11, 14]); // Beautiful default heritage outfit
  const [eventInput, setEventInput] = useState('Dạo phố Bùi Viện đêm thứ 7');
  const [remixStyle, setRemixStyle] = useState('Streetwear Heritage Fusion');
  const [customNotes, setCustomNotes] = useState('Phối layer áo Nhật Bình khoác ngoài, chân mang combat boots và kính ma trận.');

  // AI Evaluation states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [postTitleInput, setPostTitleInput] = useState('');

  // Filter items by category
  const filteredItems = wardrobeItems.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const selectedItems = wardrobeItems.filter((i) => selectedItemIds.includes(i.id));

  const toggleItemSelection = (id) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter((item) => item !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  // Quick Gen-Z Scenario Chips
  const quickScenarios = [
    { label: '🍻 Dạo phố Bùi Viện đêm thứ 7', text: 'Dạo phố Bùi Viện đêm thứ 7' },
    { label: '💍 Dự tiệc cưới người yêu cũ', text: 'Dự tiệc cưới người yêu cũ sang chảnh' },
    { label: '🎤 Đi quẩy concert rap cháy phố', text: 'Đi quẩy concert rap cháy phố' },
    { label: '🏫 Họp lớp cấp 3 thanh lịch', text: 'Họp lớp cấp 3 & cafe sáng' },
    { label: '☕ Chill cafe acoustic Đà Lạt', text: 'Chill cafe acoustic ngắm hoàng hôn Đà Lạt' },
    { label: '🏮 Trẩy hội Đền Hùng trang nghiêm', text: 'Trẩy hội Đền Hùng trang nghiêm' },
  ];

  // Call Gemini Gatekeeper API
  const handleEvaluate = async () => {
    if (selectedItemIds.length === 0) {
      alert('Vui lòng chọn ít nhất 1 món đồ trong tủ để Chị Gatekeeper thẩm định!');
      return;
    }
    if (!eventInput.trim()) {
      alert('Vui lòng nhập sự kiện hoặc chọn bối cảnh xuất hiện!');
      return;
    }

    setIsEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await fetch('/api/v1/gatekeeper/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventInput,
          itemIds: selectedItemIds,
          remixStyle,
          customNotes,
        }),
      });

      const data = await res.json();
      setEvaluationResult(data);
      setPostTitleInput(`${remixStyle} x ${selectedItems[0]?.name || 'Việt Phục'}`);
    } catch (err) {
      console.error('Failed to evaluate outfit:', err);
      alert('Không thể kết nối với Chị Gatekeeper. Vui lòng thử lại sau giây lát!');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Publish outfit to social feed (stored in database)
  const handlePublish = async () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (!evaluationResult) return;

    setIsPublishing(true);
    try {
      const primaryImage =
        selectedItems[0]?.imageUrl ||
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80';

      await onPublishPost({
        title: postTitleInput || `${remixStyle} - ${eventInput}`,
        event: eventInput,
        aiFeedback: evaluationResult.feedback,
        isApproved: evaluationResult.isApproved,
        culturalScore: evaluationResult.culturalScore,
        imageUrl: primaryImage,
        itemIds: selectedItemIds,
        tags: evaluationResult.hashtags?.map((h) => h.replace('#', '')) || ['VietPhucRemix', 'GenZAudition'],
      });

      setEvaluationResult(null);
    } catch (err) {
      console.error('Failed to publish post:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-red-100 text-[#E60023] px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Phòng Thử Đồ Ảo & AI Gatekeeper Studio
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Phòng Phối Đồ <span className="text-[#E60023]">Việt Phục Remix</span>
          </h1>
          <p className="text-sm text-neutral-500">
            Chọn các món đồ truyền thống và hiện đại, đặt bối cảnh và để Chị Gatekeeper AI thẩm định trước khi lên sàn.
          </p>
        </div>

        {/* Selected Counter & Fast Action */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="px-3 text-xs">
            <span className="text-neutral-400">Đã chọn:</span>{' '}
            <strong className="text-neutral-900 text-sm font-black">{selectedItemIds.length}</strong> món
          </div>
          <button
            onClick={() => setSelectedItemIds([])}
            className="text-neutral-400 hover:text-red-600 p-2 rounded-lg transition-colors cursor-pointer"
            title="Xóa tất cả món đã chọn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Wardrobe Item Selector (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            {[
              { id: 'ALL', label: 'Tất Cả' },
              { id: 'OUTERWEAR', label: 'Áo Ngoài (Nhật Bình, Tấc, Giao Lĩnh...)' },
              { id: 'INNERWEAR', label: 'Áo Trong / Yếm Lụa' },
              { id: 'BOTTOMS', label: 'Quần & Váy' },
              { id: 'ACCESSORIES', label: 'Phụ Kiện & Nón' },
              { id: 'FOOTWEAR', label: 'Giày & Guốc Mộc' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#E60023] text-white shadow-md shadow-red-500/20'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Wardrobe Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  className={`bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#E60023] ring-2 ring-red-500/30 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                  }`}
                >
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Heritage Era Tag */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm ${
                          item.isHeritage ? 'bg-amber-500 text-white' : 'bg-neutral-900 text-white'
                        }`}
                      >
                        {item.isHeritage ? 'DI SẢN' : 'STREETWEAR'}
                      </span>
                    </div>

                    {/* Selection Checkmark Badge */}
                    <div
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#E60023] text-white shadow-md'
                          : 'bg-white/80 text-neutral-400 group-hover:text-neutral-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-1 group-hover:text-[#E60023] transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ensemble & AI Gatekeeper Trigger (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Mannequin / Outfit Summary */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-extrabold text-sm text-neutral-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E60023]" />
                Tủ Đang Thử ({selectedItems.length})
              </h3>
              <span className="text-[11px] text-neutral-400 font-medium">Bấm món đồ để bỏ</span>
            </div>

            {selectedItems.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                Chưa chọn món nào. Hãy click vào trang phục bên trái để thêm vào phòng thử!
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 hover:bg-red-50 hover:border-red-200 border border-neutral-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-neutral-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-neutral-400 uppercase">{item.category}</p>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400 group-hover:text-red-600 font-bold px-1">✕</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Event Context & Prompt Box */}
          <div className="bg-white rounded-3xl p-5 border border-neutral-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-neutral-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#E60023]" />
              Bối Cảnh & Định Hướng Phối Đồ
            </h3>

            {/* Event Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Sự Kiện Xuất Hiện *</label>
              <input
                type="text"
                value={eventInput}
                onChange={(e) => setEventInput(e.target.value)}
                placeholder="Ví dụ: Dạo phố Bùi Viện, Dự tiệc cưới, Đi concert..."
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023] font-medium"
              />
            </div>

            {/* Quick Scenario Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400">Chọn Nhanh Kịch Bản Gen-Z:</label>
              <div className="flex flex-wrap gap-1.5">
                {quickScenarios.map((scen, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEventInput(scen.text)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-red-50 hover:text-[#E60023] text-neutral-600 font-medium transition-colors cursor-pointer"
                  >
                    {scen.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Remix Style Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">Phong Cách Remix</label>
              <select
                value={remixStyle}
                onChange={(e) => setRemixStyle(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023] font-medium"
              >
                <option value="Streetwear Heritage Fusion">Streetwear Heritage Fusion (Đường Phố x Di Sản)</option>
                <option value="Cyberpunk Y2K Remix">Cyberpunk Y2K Matrix Remix</option>
                <option value="Royal Vintage Classic">Royal Vintage Classic (Cung Đình Cổ Điển)</option>
                <option value="Gothic Folk Tale">Gothic Folk Tale (Huyền Ảo Dân Gian)</option>
              </select>
            </div>

            {/* Big AI Trigger Button */}
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full py-3.5 px-4 bg-[#E60023] hover:bg-red-700 text-white font-extrabold rounded-2xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Chị Gatekeeper Đang Soi Kỹ...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gặp Chị Gatekeeper Duyệt Đồ Ngay
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive AI Gatekeeper Evaluation Result Modal */}
      {evaluationResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-red-200 relative my-8">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-neutral-900 via-stone-900 to-red-950 p-6 text-white relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-red-400">
                  KẾT QUẢ THẨM ĐỊNH THỜI TRANG CỔ PHỤC
                </span>
                <span className="text-xs text-neutral-300">Powered by Gemini 3.8 Flash</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black">{evaluationResult.gatekeeperTitle}</h2>
              <p className="text-xs text-neutral-300 mt-1">Bối cảnh: {eventInput}</p>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Approval Stamp & Score Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                {/* Visual Stamp */}
                <div className="animate-stamp inline-flex items-center gap-2">
                  <div
                    className={`px-4 py-2 rounded-xl font-black text-sm tracking-wider uppercase shadow-md border-2 ${
                      evaluationResult.isApproved
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-red-600 text-white border-red-400'
                    }`}
                  >
                    {evaluationResult.status === 'APPROVED' ? '✓ ĐÃ DUYỆT (APPROVED)' : '✕ TỪ CHỐI (REJECTED)'}
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[11px] text-neutral-500 font-bold uppercase">Điểm Di Sản</p>
                    <p className="text-2xl font-black text-[#E60023]">{evaluationResult.culturalScore}/100</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-[#E60023] font-black text-sm">
                    {evaluationResult.culturalScore >= 90 ? 'S+' : 'A'}
                  </div>
                </div>
              </div>

              {/* Chị Gatekeeper Feedback */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                  <div className="w-5 h-5 rounded-full bg-[#E60023] text-white flex items-center justify-center text-[10px]">
                    💅
                  </div>
                  <span>Lời Nhận Xét Của Chị Gatekeeper (Gen-Z Style):</span>
                </div>
                <div className="p-4 bg-red-50/80 rounded-2xl border border-red-200/80 text-neutral-800 text-sm font-medium leading-relaxed italic">
                  "{evaluationResult.feedback}"
                </div>
              </div>

              {/* Cultural Lore & Rules */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>Điển Cố Lịch Sử & Lưu Ý Di Sản:</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  {evaluationResult.culturalNotes}
                </p>
              </div>

              {/* Styling Tips */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                  <Sparkles className="w-4 h-4 text-[#E60023]" />
                  <span>Mẹo Thăng Hạng Phong Cách:</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  {evaluationResult.stylingTips}
                </p>
              </div>

              {/* Post Title input before publishing */}
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold text-neutral-700">Tên Bản Phối (Lưu vào Database & Feed):</label>
                <input
                  type="text"
                  value={postTitleInput}
                  onChange={(e) => setPostTitleInput(e.target.value)}
                  placeholder="Nhập tiêu đề ấn tượng..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#E60023] font-semibold"
                />
              </div>

              {/* Not Logged In Warning */}
              {!currentUser && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between">
                  <span>Bạn cần đăng nhập tài khoản để lưu bản phối vào database.</span>
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="font-bold underline text-[#E60023] cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              )}

              {/* Actions: Publish or Close */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setEvaluationResult(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Chỉnh Sửa Thêm
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full sm:w-auto px-6 py-3 bg-[#E60023] hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPublishing ? (
                    'Đang Lưu Vào Database...'
                  ) : (
                    <>
                      <span>📌 Đăng Lên Bảng Tin Social Feed</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
