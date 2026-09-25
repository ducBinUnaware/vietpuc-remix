package com.audition.vietphuc.config;

import com.audition.vietphuc.model.OutfitPost;
import com.audition.vietphuc.model.User;
import com.audition.vietphuc.model.WardrobeItem;
import com.audition.vietphuc.repository.OutfitPostRepository;
import com.audition.vietphuc.repository.UserRepository;
import com.audition.vietphuc.repository.WardrobeItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final WardrobeItemRepository wardrobeItemRepository;
    private final OutfitPostRepository outfitPostRepository;

    public DataInitializer(UserRepository userRepository, WardrobeItemRepository wardrobeItemRepository, OutfitPostRepository outfitPostRepository) {
        this.userRepository = userRepository;
        this.wardrobeItemRepository = wardrobeItemRepository;
        this.outfitPostRepository = outfitPostRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing H2 Database for Audition Viet Phuc Remix...");

        // 1. Seed Users
        User chigatekeeper = new User(
                "chigatekeeper",
                "gatekeeper123",
                "Chị Gatekeeper AI",
                "gatekeeper@audition.vn",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
                "Giám khảo thời trang gắt nhất V-Biz. Yêu di sản Việt, ghét mặc phản cảm, chấm điểm thẳng tay! 💅✨"
        );

        User linhdan = new User(
                "linhdan_phuc",
                "pass123",
                "Linh Đan Phạm",
                "linhdan@vietphuc.vn",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
                "Gen-Z mê Áo Nhật Bình & phối đồ Streetwear. Sống tại Sài Gòn 🌿"
        );

        User hoangnam = new User(
                "hoangnam_remix",
                "pass123",
                "Hoàng Nam KTS",
                "nam.design@gmail.com",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
                "Kiến trúc sư mê cổ phục thời Lê & Nguyễn. Đưa Áo Ngũ Thân vào văn phòng 🏛️"
        );

        userRepository.saveAll(List.of(chigatekeeper, linhdan, hoangnam));

        // 2. Seed Wardrobe Items (Viet Phuc Heritage & Modern Remix)
        WardrobeItem nhatBinh = new WardrobeItem(
                "Áo Nhật Bình Hoàng Gia (Gấm Đỏ)",
                "OUTERWEAR",
                "TRIEU_NGUYEN",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
                "Áo có cổ hình chữ nhật viền chỉ ngũ sắc, hoa văn phượng hoàng và mây ngũ hành cao quý.",
                "Lễ phục dành cho bậc hoàng hậu, công chúa và phi tần triều Nguyễn thế kỷ 19.",
                true
        );

        WardrobeItem nguThanTayChen = new WardrobeItem(
                "Áo Ngũ Thân Tay Chẽn (Lụa Đen Huyền)",
                "OUTERWEAR",
                "TRIEU_NGUYEN",
                "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80",
                "Phom áo 5 thân gài 5 khuy ngọc bên phải, cổ đứng ôm gọn, tay may chẽn năng động.",
                "Trang phục quốc phục chuẩn mực của nam nữ thời Nguyễn, biểu trưng cho tứ thân phụ mẫu và đức nhân nghĩa.",
                true
        );

        WardrobeItem aoTac = new WardrobeItem(
                "Áo Tấc Thụ Lĩnh (Xanh Cổ Vịt)",
                "OUTERWEAR",
                "TRIEU_NGUYEN",
                "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80",
                "Áo lễ thụ lĩnh tay thụng rộng 1 tấc, tà buông tự nhiên trang nghiêm.",
                "Lễ phục trang trọng của giới nho sĩ và dân gian trong dịp cưới hỏi, tế lễ đình làng.",
                true
        );

        WardrobeItem aoGiaoLinh = new WardrobeItem(
                "Áo Giao Lĩnh Cổ Chéo (Trắng Ngà Thời Lê)",
                "OUTERWEAR",
                "THOI_LE",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
                "Phom áo cổ chéo buông dài, dây lưng lụa thắt ngang eo, phom dáng uyển chuyển.",
                "Trang phục phổ biến triều Lý, Trần, Hậu Lê (thế kỷ 15-18).",
                true
        );

        WardrobeItem yemLuaHaDong = new WardrobeItem(
                "Áo Yếm Lụa Hà Đông (Màu Cánh Sen)",
                "INNERWEAR",
                "NAM_BO_DAN_GIAN",
                "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
                "Yếm cổ xây viền chỉ tơ tằm, dây buộc sau gáy và lưng, chất lụa dệt thủ công.",
                "Trang phục lót truyền thống của phụ nữ Việt từ thời cổ, gợi cảm mà kín đáo kín gió.",
                true
        );

        WardrobeItem quanLuaVanPhuc = new WardrobeItem(
                "Quần Lụa Vạn Phúc Trắng Ngà",
                "BOTTOMS",
                "TRIEU_NGUYEN",
                "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop&q=80",
                "Quần ống rộng lụa tơ tằm rủ mềm mại, cạp chun thoải mái khi chuyển động.",
                "Phần dưới không thể thiếu của trang phục áo ngũ thân và áo dài truyền thống.",
                true
        );

        WardrobeItem quanCargoBaggy = new WardrobeItem(
                "Quần Cargo Streetwear Khaki Rộng",
                "BOTTOMS",
                "MODERN_GENZ",
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
                "Quần nhiều túi hộp phom thụng phong cách hiphop Gen-Z thập niên 2000.",
                "Item hiện đại cực hợp để remix tương phản với áo ngũ thân hoặc yếm tơ.",
                false
        );

        WardrobeItem nonQuaiThao = new WardrobeItem(
                "Nón Quai Thao Xứ Kinh Bắc",
                "ACCESSORIES",
                "THOI_LE",
                "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80",
                "Nón tròn dẹt vành rộng đan bằng lá cọ, gắn quai thao thao tơ tằm buông dài.",
                "Chiếc nón gắn liền với các liền chị quan họ Bắc Ninh dịu dàng duyên dáng.",
                true
        );

        WardrobeItem khanDongGam = new WardrobeItem(
                "Khăn Đóng Gấm Đen Hoàng Triều",
                "ACCESSORIES",
                "TRIEU_NGUYEN",
                "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80",
                "Khăn xếp quấn nhiều nếp đều tăm tắp, ôm sát vòm trán cương nghị.",
                "Phụ kiện đội đầu tiêu chuẩn khi mặc áo ngũ thân và lễ phục xưa.",
                true
        );

        WardrobeItem guocMocSaiGon = new WardrobeItem(
                "Guốc Mộc Gỗ Sơn Mài Quai Nhung",
                "FOOTWEAR",
                "NAM_BO_DAN_GIAN",
                "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
                "Guốc gỗ đẽo thủ công gót cao 5cm tiếng gõ lách cách thân thương hè phố.",
                "Đôi guốc mộc mạc gắn liền ký ức Sài Gòn và phụ nữ Nam Kỳ xưa.",
                true
        );

        WardrobeItem combatBoots = new WardrobeItem(
                "Chunky Combat Boots Đế Răng Cưa",
                "FOOTWEAR",
                "MODERN_GENZ",
                "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80",
                "Boots da cổ cao hầm hố đế dày 6cm phong cách Cyberpunk Audition.",
                "Tạo độ đầm và nét gai góc thời thượng khi mix với tà áo dài truyền thống.",
                false
        );

        wardrobeItemRepository.saveAll(List.of(
                nhatBinh, nguThanTayChen, aoTac, aoGiaoLinh, yemLuaHaDong,
                quanLuaVanPhuc, quanCargoBaggy, nonQuaiThao, khanDongGam,
                guocMocSaiGon, combatBoots
        ));

        // 3. Seed Pinterest Outfit Posts
        OutfitPost post1 = new OutfitPost(
                "Cyberpunk Nhật Bình x Combat Boots quẩy phố Bùi Viện",
                "Dạo phố Bùi Viện đêm thứ 7",
                "Quá keo! Áo Nhật Bình hoàng gia mix cùng combat boots da đen và kính râm matrix. Slay dính dách, tôn nét kiêu kỳ mà không hề bị sến. Chị duyệt thẳng cánh không có nhưng!",
                true,
                96,
                "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80",
                linhdan
        );
        post1.setItems(List.of(nhatBinh, combatBoots, quanLuaVanPhuc));
        post1.setTags(List.of("NhatBinhRemix", "BuiVienNight", "CyberpunkHeritage", "GenZAudition"));
        post1.setLikesCount(142);

        OutfitPost post2 = new OutfitPost(
                "Áo Ngũ Thân Tay Chẽn & Quần Khaki đi họp lớp cấp 3",
                "Họp lớp cấp 3 & cafe sáng",
                "Thanh lịch điểm 10! Vạt áo ngũ thân ôm gọn phối quần ống suông mang lại phong thái nho nhã tri thức. Lũ bạn cấp 3 chỉ có nước lác mắt trầm trồ.",
                true,
                92,
                "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
                hoangnam
        );
        post2.setItems(List.of(nguThanTayChen, khanDongGam));
        post2.setTags(List.of("NguThanStreetwear", "HopLopSlay", "VietNamHeritage"));
        post2.setLikesCount(89);

        OutfitPost post3 = new OutfitPost(
                "Yếm Lụa Hà Đông x Blazer Oversize dự đám cưới người yêu cũ",
                "Dự tiệc cưới người yêu cũ sang chảnh",
                "Đỉnh nóc kịch trần! Nửa kín nửa hở đầy tinh tế, vừa gợi nét yếm đào dân gian vừa khí chất tổng tài kiêu hãnh. Người yêu cũ nhìn thấy là tiếc hùi hụi liền!",
                true,
                98,
                "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80",
                linhdan
        );
        post3.setItems(List.of(yemLuaHaDong, quanCargoBaggy, guocMocSaiGon));
        post3.setTags(List.of("YemDaoRemix", "TiepCuoiNguoiYeuCu", "KeoLy"));
        post3.setLikesCount(310);

        outfitPostRepository.saveAll(List.of(post1, post2, post3));

        log.info("H2 Database successfully initialized with {} items and {} posts.",
                wardrobeItemRepository.count(), outfitPostRepository.count());
    }
}
