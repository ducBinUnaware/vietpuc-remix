import React from 'react';
import { X, BookOpen, ShieldCheck } from 'lucide-react';

export const HeritageGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const heritageItems = [
    {
      name: 'Áo Nhật Bình (Triều Nguyễn)',
      era: 'Thế kỷ 19 - Triều Nguyễn',
      desc: 'Là thường phục của Hoàng hậu, Công chúa và mệnh phụ quý tộc. Đặc điểm nổi bật nhất là phần cổ áo hình chữ nhật viền chỉ thêu hoa văn ngũ hành và chim phượng.',
      remixRule: 'Quy tắc Remix: Có thể mặc dạng khoác ngoài (layering) kết hợp váy midi hoặc boots da. Tuyệt đối không phanh ngực hở hang hoặc cắt xén vạt áo làm mất phẩm vị cung đình.',
    },
    {
      name: 'Áo Ngũ Thân Tay Chẽn',
      era: 'Thời chúa Nguyễn Phúc Khoát (1744) & Vua Minh Mạng (1837)',
      desc: 'Là tiền thân trực tiếp của Áo Dài hiện đại. Áo may bằng 5 mảnh vải (ngũ thân) tượng trưng cho phụ mẫu tứ thân và người mặc, gài 5 khuy ngọc bên phải thể hiện Ngũ thường (Nhân - Lễ - Nghĩa - Trí - Tín).',
      remixRule: 'Quy tắc Remix: Phù hợp nhất để mặc phối cùng quần jeans, quần ống suông, sneaker hoặc khoác blazer mỏng.',
    },
    {
      name: 'Áo Giao Lĩnh Cổ Chéo',
      era: 'Triều Lý, Trần, Hậu Lê (Thế kỷ 11 - 18)',
      desc: 'Phom áo vạt chéo buông dài quấn quanh thân và cố định bằng dải thắt lưng vải mềm mại. Mang đậm vẻ đẹp phóng khoáng, thanh nhã của thời kỳ vàng son Đại Việt.',
      remixRule: 'Quy tắc Remix: Mix cùng áo cổ lọ mỏng bên trong, thắt lưng da hiện đại hoặc chân váy tulle tạo nét tiên khí thanh thoát.',
    },
    {
      name: 'Áo Yếm Lụa Dân Gian',
      era: 'Thời Cổ đến Đầu Thế Kỷ 20',
      desc: 'Nội y truyền thống của phụ nữ Việt, ôm lấy bờ vai thon và lưng trần mềm mại. Thường được mặc kín đáo bên trong áo tứ thân hoặc ngũ thân.',
      remixRule: 'Quy tắc Remix: Mặc lót dưới blazer oversized, áo khoác biker da hoặc khoác lụa mỏng để vừa quyến rũ thời thượng vừa không bị phô phang.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-2 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-900">Điển Cố & Cẩm Nang Việt Phục</h2>
            <p className="text-xs text-neutral-500">Tìm hiểu văn hóa để remix cổ phục chuẩn chỉnh và tự hào</p>
          </div>
        </div>

        {/* Chị Gatekeeper Core Principles */}
        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-2">
          <h4 className="text-xs font-bold text-[#E60023] flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Nguyên Tắc Vàng Của Chị Gatekeeper
          </h4>
          <p className="text-xs text-neutral-700 leading-relaxed">
            "Remix là sáng tạo để di sản sống trong thời đại mới, không phải phá nát cội nguồn. Mặc Việt Phục là mang cốt cách người Việt: tự tin, duyên dáng và kiêu hãnh. Phối cùng Streetwear càng chất, miễn là không xúc phạm hình hài cổ nhân!"
          </p>
        </div>

        {/* Heritage Attire Grid */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {heritageItems.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">{item.name}</h3>
                <span className="text-[10px] bg-neutral-200 text-neutral-700 font-bold px-2 py-0.5 rounded">
                  {item.era}
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
              <div className="p-2.5 bg-white rounded-xl border border-neutral-200/60 text-xs text-emerald-800 font-medium">
                💡 {item.remixRule}
              </div>
            </div>
          ))}
        </div>

        <div className="text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đã Hiểu, Quay Lại Sàn Diễn
          </button>
        </div>
      </div>
    </div>
  );
};
