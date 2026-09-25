import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client (Server-side only)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Database (reflecting H2 database jdbc:h2:mem:auditiondb)
interface User {
  id: number;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
}

interface WardrobeItem {
  id: number;
  name: string;
  category: 'OUTERWEAR' | 'INNERWEAR' | 'BOTTOMS' | 'ACCESSORIES' | 'FOOTWEAR';
  era: string;
  imageUrl: string;
  description: string;
  culturalContext: string;
  isHeritage: boolean;
}

interface OutfitPost {
  id: number;
  title: string;
  event: string;
  aiFeedback: string;
  isApproved: boolean;
  culturalScore: number;
  imageUrl: string;
  author: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl: string;
    bio: string;
  };
  itemIds: number[];
  items?: WardrobeItem[];
  tags: string[];
  likesCount: number;
  createdAt: string;
}

// Initial Database Seeding
const users: User[] = [
  {
    id: 1,
    username: 'chigatekeeper',
    password: 'password123',
    fullName: 'Chị Gatekeeper AI',
    email: 'gatekeeper@audition.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Giám khảo thời trang gắt nhất V-Biz. Yêu di sản Việt, ghét mặc phản cảm, chấm điểm thẳng tay! 💅✨',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'linhdan_phuc',
    password: 'password123',
    fullName: 'Linh Đan Phạm',
    email: 'linhdan@vietphuc.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bio: 'Gen-Z mê Áo Nhật Bình & phối đồ Streetwear. Sống tại Sài Gòn 🌿',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    username: 'hoangnam_remix',
    password: 'password123',
    fullName: 'Hoàng Nam KTS',
    email: 'nam.design@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    bio: 'Kiến trúc sư mê cổ phục thời Lê & Nguyễn. Đưa Áo Ngũ Thân vào văn phòng 🏛️',
    createdAt: new Date().toISOString(),
  },
];

const wardrobeItems: WardrobeItem[] = [
  {
    id: 1,
    name: 'Áo Nhật Bình Hoàng Gia (Gấm Đỏ)',
    category: 'OUTERWEAR',
    era: 'TRIEU_NGUYEN',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    description: 'Áo có cổ hình chữ nhật viền chỉ ngũ sắc, hoa văn phượng hoàng và mây ngũ hành cao quý.',
    culturalContext: 'Lễ phục dành cho bậc hoàng hậu, công chúa và phi tần triều Nguyễn thế kỷ 19.',
    isHeritage: true,
  },
  {
    id: 2,
    name: 'Áo Ngũ Thân Tay Chẽn (Lụa Đen Huyền)',
    category: 'OUTERWEAR',
    era: 'TRIEU_NGUYEN',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    description: 'Phom áo 5 thân gài 5 khuy ngọc bên phải, cổ đứng ôm gọn, tay may chẽn năng động.',
    culturalContext: 'Trang phục quốc phục chuẩn mực của nam nữ thời Nguyễn, biểu trưng cho tứ thân phụ mẫu và đức nhân nghĩa.',
    isHeritage: true,
  },
  {
    id: 3,
    name: 'Áo Tấc Thụ Lĩnh (Xanh Cổ Vịt)',
    category: 'OUTERWEAR',
    era: 'TRIEU_NGUYEN',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
    description: 'Áo lễ thụ lĩnh tay thụng rộng 1 tấc, tà buông tự nhiên trang nghiêm.',
    culturalContext: 'Lễ phục trang trọng của giới nho sĩ và dân gian trong dịp cưới hỏi, tế lễ đình làng.',
    isHeritage: true,
  },
  {
    id: 4,
    name: 'Áo Giao Lĩnh Cổ Chéo (Trắng Ngà)',
    category: 'OUTERWEAR',
    era: 'THOI_LE',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    description: 'Phom áo cổ chéo buông dài, dây lưng lụa thắt ngang eo, phom dáng uyển chuyển.',
    culturalContext: 'Trang phục thịnh hành triều Lý, Trần, Hậu Lê (thế kỷ 15-18).',
    isHeritage: true,
  },
  {
    id: 5,
    name: 'Áo Khoác Da Biker Oversize',
    category: 'OUTERWEAR',
    era: 'MODERN_GENZ',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    description: 'Áo khoác da đen phong cách rock-chic với khóa kéo bạc cá tính, tạo điểm nhấn tương phản với yếm hoặc áo dài.',
    culturalContext: 'Item streetwear biểu tượng của phong cách tự do phóng khoáng.',
    isHeritage: false,
  },
  {
    id: 6,
    name: 'Áo Yếm Lụa Hà Đông (Cánh Sen)',
    category: 'INNERWEAR',
    era: 'NAM_BO_DAN_GIAN',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    description: 'Yếm cổ xây viền chỉ tơ tằm, dây buộc sau gáy và lưng, chất lụa dệt thủ công.',
    culturalContext: 'Trang phục lót truyền thống của phụ nữ Việt từ thời cổ, gợi cảm mà kín đáo kín gió.',
    isHeritage: true,
  },
  {
    id: 7,
    name: 'Áo Thun Baby Tee Y2K In Họa Tiết Trống Đồng',
    category: 'INNERWEAR',
    era: 'MODERN_GENZ',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80',
    description: 'Áo thun ôm sát lửng in graphic cách điệu hoa văn Trống Đồng Đông Sơn thời đại số.',
    culturalContext: 'Sự giao thoa giữa văn hóa Y2K hiện đại và biểu tượng văn minh Đông Sơn 2000 năm.',
    isHeritage: false,
  },
  {
    id: 8,
    name: 'Quần Lụa Vạn Phúc Trắng Ngà',
    category: 'BOTTOMS',
    era: 'TRIEU_NGUYEN',
    imageUrl: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop&q=80',
    description: 'Quần ống rộng lụa tơ tằm rủ mềm mại, cạp chun thoải mái khi chuyển động.',
    culturalContext: 'Phần dưới không thể thiếu của trang phục áo ngũ thân và áo dài truyền thống.',
    isHeritage: true,
  },
  {
    id: 9,
    name: 'Quần Cargo Khaki Đa Túi Hộp',
    category: 'BOTTOMS',
    era: 'MODERN_GENZ',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    description: 'Quần nhiều túi hộp phom thụng phong cách hiphop Gen-Z thập niên 2000.',
    culturalContext: 'Item hiện đại cực hợp để remix tương phản với áo ngũ thân hoặc yếm tơ.',
    isHeritage: false,
  },
  {
    id: 10,
    name: 'Chân Váy Tulle Nhiều Lớp Công Chúa',
    category: 'BOTTOMS',
    era: 'MODERN_GENZ',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80',
    description: 'Váy lưới phồng bồng bềnh phong cách gothic lolita / fairycore.',
    culturalContext: 'Tạo hiệu ứng layer độc đáo khi mặc dưới tà áo ngũ thân xẻ tà.',
    isHeritage: false,
  },
  {
    id: 11,
    name: 'Nón Quai Thao Xứ Kinh Bắc',
    category: 'ACCESSORIES',
    era: 'THOI_LE',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80',
    description: 'Nón tròn dẹt vành rộng đan bằng lá cọ, gắn quai thao thao tơ tằm buông dài.',
    culturalContext: 'Chiếc nón gắn liền với các liền chị quan họ Bắc Ninh dịu dàng duyên dáng.',
    isHeritage: true,
  },
  {
    id: 12,
    name: 'Khăn Đóng Gấm Đen Hoàng Triều',
    category: 'ACCESSORIES',
    era: 'TRIEU_NGUYEN',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
    description: 'Khăn xếp quấn nhiều nếp đều tăm tắp, ôm sát vòm trán cương nghị.',
    culturalContext: 'Phụ kiện đội đầu tiêu chuẩn khi mặc áo ngũ thân và lễ phục xưa.',
    isHeritage: true,
  },
  {
    id: 13,
    name: 'Kính Râm Cyberpunk Matrix Gọng Bạc',
    category: 'ACCESSORIES',
    era: 'MODERN_GENZ',
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    description: 'Kính mát hình bầu dục gọng kim loại hẹp viễn tưởng phong cách Neo Y2K.',
    culturalContext: 'Phụ kiện biến mọi bộ cổ phục thành runway thời trang tương lai.',
    isHeritage: false,
  },
  {
    id: 14,
    name: 'Guốc Mộc Gỗ Sơn Mài Quai Nhung',
    category: 'FOOTWEAR',
    era: 'NAM_BO_DAN_GIAN',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
    description: 'Guốc gỗ đẽo thủ công gót cao 5cm tiếng gõ lách cách thân thương hè phố.',
    culturalContext: 'Đôi guốc mộc mạc gắn liền ký ức Sài Gòn và phụ nữ Nam Kỳ xưa.',
    isHeritage: true,
  },
  {
    id: 15,
    name: 'Chunky Combat Boots Đế Răng Cưa',
    category: 'FOOTWEAR',
    era: 'MODERN_GENZ',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80',
    description: 'Boots da cổ cao hầm hố đế dày 6cm phong cách Cyberpunk Audition.',
    culturalContext: 'Tạo độ đầm và nét gai góc thời thượng khi mix với tà áo dài truyền thống.',
    isHeritage: false,
  },
];

let posts: OutfitPost[] = [
  {
    id: 1,
    title: 'Cyberpunk Nhật Bình x Combat Boots quẩy phố Bùi Viện',
    event: 'Dạo phố Bùi Viện đêm thứ 7',
    aiFeedback:
      'Quá keo! Áo Nhật Bình hoàng gia mix cùng combat boots da đen và kính râm matrix. Slay dính dách, tôn nét kiêu kỳ mà không hề bị sến. Chị duyệt thẳng cánh không có nhưng!',
    isApproved: true,
    culturalScore: 96,
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 2,
      username: 'linhdan_phuc',
      fullName: 'Linh Đan Phạm',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      bio: 'Gen-Z mê Áo Nhật Bình & phối đồ Streetwear 🌿',
    },
    itemIds: [1, 8, 13, 15],
    tags: ['NhatBinhRemix', 'BuiVienNight', 'CyberpunkHeritage', 'GenZAudition'],
    likesCount: 142,
    createdAt: '2026-09-20T14:30:00.000Z',
  },
  {
    id: 2,
    title: 'Áo Ngũ Thân Tay Chẽn & Quần Khaki đi họp lớp cấp 3',
    event: 'Họp lớp cấp 3 & cafe sáng',
    aiFeedback:
      'Thanh lịch điểm 10! Vạt áo ngũ thân ôm gọn phối quần ống suông mang lại phong thái nho nhã tri thức. Lũ bạn cấp 3 chỉ có nước lác mắt trầm trồ.',
    isApproved: true,
    culturalScore: 92,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 3,
      username: 'hoangnam_remix',
      fullName: 'Hoàng Nam KTS',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      bio: 'Kiến trúc sư mê cổ phục thời Lê & Nguyễn 🏛️',
    },
    itemIds: [2, 9, 12],
    tags: ['NguThanStreetwear', 'HopLopSlay', 'VietNamHeritage'],
    likesCount: 89,
    createdAt: '2026-09-21T09:15:00.000Z',
  },
  {
    id: 3,
    title: 'Yếm Lụa Hà Đông x Blazer Biker dự đám cưới người yêu cũ',
    event: 'Dự tiệc cưới người yêu cũ sang chảnh',
    aiFeedback:
      'Đỉnh nóc kịch trần! Nửa kín nửa hở đầy tinh tế, vừa gợi nét yếm đào dân gian vừa khí chất tổng tài kiêu hãnh. Người yêu cũ nhìn thấy là tiếc hùi hụi liền!',
    isApproved: true,
    culturalScore: 98,
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 2,
      username: 'linhdan_phuc',
      fullName: 'Linh Đan Phạm',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      bio: 'Gen-Z mê Áo Nhật Bình & phối đồ Streetwear 🌿',
    },
    itemIds: [5, 6, 8, 14],
    tags: ['YemDaoRemix', 'TiepCuoiNguoiYeuCu', 'KeoLy'],
    likesCount: 310,
    createdAt: '2026-09-22T19:45:00.000Z',
  },
  {
    id: 4,
    title: 'Áo Giao Lĩnh Bạch Y x Nón Quai Thao chill acoustic Dalat',
    event: 'Chill cafe acoustic ngắm hoàng hôn Đà Lạt',
    aiFeedback:
      'Tâm hồn lãng tử thơ mộng! Áo giao lĩnh trắng ngà thắt đai buông lơi, kết hợp nón quai thao Bắc Ninh tạo nên thần thái thoát tục như bước ra từ tranh cổ tích.',
    isApproved: true,
    culturalScore: 94,
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    author: {
      id: 3,
      username: 'hoangnam_remix',
      fullName: 'Hoàng Nam KTS',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      bio: 'Kiến trúc sư mê cổ phục thời Lê & Nguyễn 🏛️',
    },
    itemIds: [4, 8, 11, 14],
    tags: ['GiaoLinhThoiLe', 'DalatAcoustic', 'ThoatTuc'],
    likesCount: 228,
    createdAt: '2026-09-23T11:20:00.000Z',
  },
];

// Helper: attach item objects to posts
function populatePostItems(post: OutfitPost) {
  const items = wardrobeItems.filter((item) => post.itemIds?.includes(item.id));
  return { ...post, items };
}

// RESTful APIs matching Spring Boot Controller endpoints

// 1. Authentication Endpoints (/api/v1/auth)
app.post('/api/v1/auth/register', (req, res) => {
  const { username, password, fullName, email, avatarUrl, bio } = req.body;
  if (!username || !password || !fullName || !email) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký bắt buộc' });
  }

  const existing = users.find((u) => u.username === username || u.email === email);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc Email đã tồn tại' });
  }

  const newUser: User = {
    id: users.length + 1,
    username,
    password,
    fullName,
    email,
    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: bio || 'Tín đồ thời trang Việt Phục Remix - Gen Z bảo tồn di sản bằng phong cách thời thượng ✨🇻🇳',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);

  const token = `vpr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return res.json({
    success: true,
    message: 'Đăng ký thành công',
    token,
    userId: newUser.id,
    username: newUser.username,
    fullName: newUser.fullName,
    email: newUser.email,
    avatarUrl: newUser.avatarUrl,
    bio: newUser.bio,
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user || user.password !== password) {
    return res.status(400).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' });
  }

  const token = `vpr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return res.json({
    success: true,
    message: 'Đăng nhập thành công',
    token,
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
  });
});

app.get('/api/v1/auth/profile/:username', (req, res) => {
  const user = users.find((u) => u.username === req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password, ...safeUser } = user;
  return res.json(safeUser);
});

app.put('/api/v1/auth/profile/:username', (req, res) => {
  const user = users.find((u) => u.username === req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { fullName, bio, avatarUrl } = req.body;
  if (fullName) user.fullName = fullName;
  if (bio) user.bio = bio;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  const { password, ...safeUser } = user;
  return res.json(safeUser);
});

// 2. Wardrobe Items Endpoints (/api/v1/wardrobe)
app.get('/api/v1/wardrobe', (req, res) => {
  const { category, era } = req.query;
  let items = [...wardrobeItems];
  if (category && typeof category === 'string' && category !== 'ALL') {
    items = items.filter((i) => i.category === category);
  }
  if (era && typeof era === 'string' && era !== 'ALL') {
    items = items.filter((i) => i.era === era);
  }
  return res.json(items);
});

app.get('/api/v1/wardrobe/:id', (req, res) => {
  const item = wardrobeItems.find((i) => i.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item not found' });
  return res.json(item);
});

// 3. Outfits Social Feed Endpoints (/api/v1/outfits)
app.get('/api/v1/outfits', (req, res) => {
  const { search } = req.query;
  let result = [...posts];
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.event.toLowerCase().includes(q) ||
        p.aiFeedback.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  // Sort latest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json(result.map(populatePostItems));
});

app.get('/api/v1/outfits/:id', (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  return res.json(populatePostItems(post));
});

app.get('/api/v1/outfits/user/:username', (req, res) => {
  const userPosts = posts.filter((p) => p.author.username === req.params.username);
  return res.json(userPosts.map(populatePostItems));
});

app.post('/api/v1/outfits', (req, res) => {
  const { title, event, aiFeedback, isApproved, culturalScore, imageUrl, itemIds, tags } = req.body;
  const username = (req.headers['x-user-username'] as string) || 'linhdan_phuc';
  const author = users.find((u) => u.username === username) || users[1];

  if (!title || !event || !imageUrl || !itemIds || itemIds.length === 0) {
    return res.status(400).json({ error: 'Thiếu thông tin bài đăng bắt buộc' });
  }

  const newPost: OutfitPost = {
    id: posts.length + 1,
    title,
    event,
    aiFeedback: aiFeedback || 'Chị Gatekeeper đã thẩm định và trao tem duyệt 10 điểm!',
    isApproved: isApproved !== undefined ? isApproved : true,
    culturalScore: culturalScore || 90,
    imageUrl,
    author: {
      id: author.id,
      username: author.username,
      fullName: author.fullName,
      avatarUrl: author.avatarUrl,
      bio: author.bio,
    },
    itemIds,
    tags: tags && tags.length > 0 ? tags : ['VietPhucRemix', 'GenZAudition'],
    likesCount: 1,
    createdAt: new Date().toISOString(),
  };

  posts.unshift(newPost);
  return res.json(populatePostItems(newPost));
});

app.post('/api/v1/outfits/:id/like', (req, res) => {
  const post = posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.likesCount += 1;
  return res.json({ id: post.id, likesCount: post.likesCount });
});

// 4. AI Gatekeeper Evaluation Endpoint (/api/v1/gatekeeper/evaluate)
app.post('/api/v1/gatekeeper/evaluate', async (req, res) => {
  const { event, itemIds, remixStyle, customNotes } = req.body;

  if (!event || !itemIds || itemIds.length === 0) {
    return res.status(400).json({ error: 'Vui lòng chọn bối cảnh sự kiện và ít nhất 1 món đồ' });
  }

  const selectedItems = wardrobeItems.filter((i) => itemIds.includes(i.id));
  const itemsText = selectedItems
    .map(
      (item) =>
        `- ${item.name} (Loại: ${item.category}, Thời kỳ: ${item.era}, Chi tiết: ${item.description}, Bối cảnh văn hóa: ${item.culturalContext})`
    )
    .join('\n');

  const systemInstruction = `
Bạn là "Chị Gatekeeper" – vị giám khảo thời trang Việt Phục Remix khét tiếng của Gen-Z Việt Nam trên nền tảng Audition Viet Phuc Remix.
Tính cách của bạn:
- Rất am hiểu lịch sử trang phục Việt (Áo Nhật Bình triều Nguyễn, Áo Giao Lĩnh triều Lê, Áo Tấc, Ngũ Thân tay chẽn, Yếm Lụa Hà Đông, Nón Ngựa Gò Găng, Guốc Mộc...).
- Giọng văn cực kỳ hài hước, đanh đá nhưng có tâm, đậm chất Gen-Z Việt Nam (dùng từ lóng tự nhiên: 'quá keo', 'mlem', 'red flag', 'báo thủ', 'cháy phố', '10 điểm không có nhưng', 'slay dính dách', 'over hợp', 'đỉnh nóc kịch trần').
- QUY TẮC CỐT LÕI VỀ VĂN HÓA:
  + Ủng hộ việc remix sáng tạo để Việt phục đi vào đời sống (mặc với sneaker, blazer, kính râm, combat boots, quần túi hộp...).
  + Cảnh báo hoặc từ chối nếu có biểu hiện làm mất phẩm giá di sản: mặc Nhật Bình hoàng gia hở hang không nội y, mang nón quai thao đi nhảy sàn phản cảm, xuyên tạc văn hóa.
  + Đánh giá dựa trên độ hòa hợp giữa món đồ truyền thống và Sự kiện (event).
`;

  const userPrompt = `
Hãy chấm điểm và nhận xét bộ trang phục Việt Phục Remix này:
- Sự kiện / Bối cảnh xuất hiện: ${event}
- Phong cách Remix: ${remixStyle || 'Streetwear Heritage Fusion'}
- Ghi chú thêm từ người mặc: ${customNotes || 'Tự tin tỏa sáng'}
- Các món đồ đã chọn trong phòng thử:
${itemsText}

TRẢ VỀ ĐÚNG FORMAT JSON NÀY (chỉ trả về valid JSON không kèm code block):
{
  "status": "APPROVED",
  "culturalScore": 92,
  "gatekeeperTitle": "Danh hiệu hài hước Chị Gatekeeper ban tặng",
  "feedback": "Lời nhận xét của Chị Gatekeeper bằng tiếng Việt Gen-Z sắc bén, hài hước",
  "culturalNotes": "Kiến thức lịch sử chuẩn xác về các món đồ truyền thống đã chọn",
  "stylingTips": "Lời khuyên phối đồ cụ thể để nâng tầm outfit",
  "hashtags": ["#VietPhucRemix", "#AoNhatBinh", "#GenZHeritage"]
}
`;

  // Try calling Gemini API with retry logic
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    let retries = 3;
    let delay = 1000;
    while (retries > 0) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);

        return res.json({
          status: parsed.status?.toUpperCase() || 'APPROVED',
          culturalScore: Number(parsed.culturalScore) || 88,
          gatekeeperTitle: parsed.gatekeeperTitle || 'Chiến Thần Phối Đồ Hoàng Gia',
          feedback: parsed.feedback || 'Bộ đồ quá keo lỳ, chị duyệt thẳng cánh!',
          culturalNotes: parsed.culturalNotes || 'Trang phục giữ trọn hồn cốt văn hóa dân tộc.',
          stylingTips: parsed.stylingTips || 'Thêm phụ kiện vòng cổ bạc hoặc túi baguette để cháy hơn nữa!',
          hashtags: parsed.hashtags || ['#VietPhucRemix', '#AuditionVibe'],
          isApproved: (parsed.status || '').toUpperCase() === 'APPROVED',
        });
      } catch (err: any) {
        retries--;
        console.warn(`Gemini attempt failed (${3 - retries}/3):`, err?.message || err);
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
  }

  // Smart Cultural Heuristic Engine Fallback
  const eventLower = event.toLowerCase();
  const hasNhatBinh = selectedItems.some((i) => i.name.toLowerCase().includes('nhật bình'));
  const hasNguThan = selectedItems.some((i) => i.name.toLowerCase().includes('ngũ thân'));
  const hasBoots = selectedItems.some((i) => i.name.toLowerCase().includes('boots'));

  let score = 92;
  let status = 'APPROVED';
  let title = 'Tiểu Thư Triều Đình Slay Phố Hiện Đại';
  let feedback = 'Quá keo lỳ bà nội ơi! Tà áo truyền thống hòa quyện cùng tinh thần Gen-Z cực cháy, chị chấm 10 điểm không có nhưng!';
  let culturalNotes = 'Trang phục truyền thống Việt Nam đề cao vẻ đẹp kín đáo, độ rủ tự nhiên của tơ lụa và sự khoan thai trang nhã.';
  let stylingTips = 'Phối thêm kính râm gọng hẹp và túi cắp nách thổ cẩm để chuẩn vibe thời trang sàn diễn.';
  const hashtags = ['#VietPhucRemix', '#AuditionFashion', '#SlayDiSan'];

  if (eventLower.includes('bùi viện') || eventLower.includes('bar') || eventLower.includes('quẩy')) {
    if (hasNhatBinh) {
      score = 86;
      title = 'Công Chúa Triều Nguyễn Đi Quẩy Đêm';
      feedback =
        'Trời đất ơi tưởng red flag mà hóa ra over hợp! Áo Nhật Bình trang nghiêm đem ra Bùi Viện quẩy thì hơi liều, nhưng mix kiểu layer khoác ngoài kèm combat boots thế này thì chị chịu thua độ sáng tạo!';
      culturalNotes =
        'Áo Nhật Bình có cổ áo hình chữ nhật đặc trưng triều Nguyễn, khi khoác dáng mở cần giữ tà áo ngay ngắn để không làm xô lệch hoa văn ngũ hành.';
      stylingTips = 'Cài nhẹ khuy thứ 2 để áo không bị xô lệch khi nhún nhảy theo nhạc!';
    }
  } else if (eventLower.includes('cưới') || eventLower.includes('tiệc')) {
    score = 97;
    title = 'Khách Mời 10 Điểm Đè Bẹp Mọi Ánh Nhìn';
    feedback =
      'Đỉnh nóc kịch trần! Set đồ vừa thanh lịch, kín đáo lại sang trọng hết nấc. Đến đám cưới người yêu cũ mà mặc thế này thì chú rể chỉ có nước ôm tiếc nuối cả đời!';
    culturalNotes = 'Áo ngũ thân và áo tấc tượng trưng cho tứ thân phụ mẫu, là biểu tượng trọn vẹn của lễ nghi gia phong Việt.';
    stylingTips = 'Thêm trâm cài tóc bạc xà cừ hoặc chuỗi ngọc trai cổ điển để thêm phần đài các.';
  } else if (eventLower.includes('rap') || eventLower.includes('concert')) {
    score = 95;
    title = 'Chiến Thần Rap Phục Dính Dách';
    feedback =
      'Over hợp! Mang áo ngũ thân tay chẽn mix cùng boots răng cưa và phụ kiện cyberpunk đi quẩy concert rap thì chị chỉ biết cúi đầu thán phục!';
    culturalNotes = 'Áo ngũ thân tay chẽn thế kỷ 19 cực kỳ năng động và thuận tiện di chuyển trong đời sống thị thành xưa.';
    stylingTips = 'Đeo thêm khánh bạc bản to hoặc dây chuyền xích đôi để tăng độ hầm hố.';
  }

  return res.json({
    status,
    culturalScore: score,
    gatekeeperTitle: title,
    feedback,
    culturalNotes,
    stylingTips,
    hashtags,
    isApproved: status === 'APPROVED',
  });
});

// Vite Integration for dev server & static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Audition Viet Phuc Remix server running on http://localhost:${PORT}`);
  });
}

startServer();
