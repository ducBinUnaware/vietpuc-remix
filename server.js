import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import {
  initDatabase,
  getDb,
  queryAll,
  queryOne,
  execute,
  saveDatabase,
  hashPassword,
  verifyPassword,
} from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize SQLite Database
await initDatabase();

// Initialize Google Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Middleware to extract authenticated user from token
function getAuthUser(req) {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  let token = null;
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  }
  if (!token) return null;

  const session = queryOne(
    `SELECT s.token, u.id, u.username, u.full_name, u.email, u.avatar_url, u.bio, u.created_at
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = ?`,
    [token]
  );
  return session || null;
}

// ----------------------------------------------------
// 1. AUTHENTICATION & USER MANAGEMENT (/api/v1/auth)
// ----------------------------------------------------

// Register new user (Saved to real SQLite database)
app.post('/api/v1/auth/register', (req, res) => {
  const { username, password, fullName, email, avatarUrl, bio } = req.body;

  if (!username || !password || !fullName || !email) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng điền đầy đủ: Tên đăng nhập, Mật khẩu, Họ và tên, Email.',
    });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  // Validate format
  if (cleanUsername.length < 3) {
    return res.status(400).json({ success: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
  }

  // Check if username or email exists in SQLite
  const existingUser = queryOne(
    'SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?',
    [cleanUsername, cleanEmail]
  );
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Tên đăng nhập hoặc Email này đã được đăng ký trong hệ thống!',
    });
  }

  // Hash password
  const passwordHash = hashPassword(password);
  const defaultAvatar =
    avatarUrl && avatarUrl.trim()
      ? avatarUrl.trim()
      : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`;
  const defaultBio =
    bio && bio.trim()
      ? bio.trim()
      : 'Tín đồ thời trang Việt Phục Remix - Gen Z bảo tồn di sản bằng phong cách thời thượng ✨🇻🇳';

  execute(
    `INSERT INTO users (username, password_hash, full_name, email, avatar_url, bio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cleanUsername, passwordHash, fullName.trim(), cleanEmail, defaultAvatar, defaultBio]
  );

  const newUser = queryOne('SELECT id, username, full_name, email, avatar_url, bio, created_at FROM users WHERE username = ?', [cleanUsername]);

  // Create persistent session
  const token = `vpr_${crypto.randomBytes(24).toString('hex')}`;
  execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', [token, newUser.id]);

  return res.json({
    success: true,
    message: 'Đăng ký tài khoản thành công!',
    token,
    user: newUser,
  });
});

// Login (Authenticated against SQLite database)
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  const cleanIdentifier = username.trim().toLowerCase();

  // Find user by username or email
  const user = queryOne(
    'SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?',
    [cleanIdentifier, cleanIdentifier]
  );

  if (!user) {
    return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại trong hệ thống.' });
  }

  const isPasswordValid = verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    return res.status(400).json({ success: false, message: 'Mật khẩu không chính xác.' });
  }

  // Create persistent session token
  const token = `vpr_${crypto.randomBytes(24).toString('hex')}`;
  execute('INSERT INTO sessions (token, user_id) VALUES (?, ?)', [token, user.id]);

  const { password_hash, ...safeUser } = user;
  return res.json({
    success: true,
    message: 'Đăng nhập thành công!',
    token,
    user: safeUser,
  });
});

// Current active user info
app.get('/api/v1/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' });
  }
  return res.json({ user });
});

// Logout (Deletes session from SQLite)
app.post('/api/v1/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    execute('DELETE FROM sessions WHERE token = ?', [token]);
  }
  return res.json({ success: true, message: 'Đăng xuất thành công' });
});

// Get user profile
app.get('/api/v1/auth/profile/:username', (req, res) => {
  const username = req.params.username.toLowerCase();
  const user = queryOne(
    'SELECT id, username, full_name, email, avatar_url, bio, created_at FROM users WHERE LOWER(username) = ?',
    [username]
  );
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' });
  }
  return res.json(user);
});

// Update user profile
app.put('/api/v1/auth/profile/:username', (req, res) => {
  const authUser = getAuthUser(req);
  const targetUsername = req.params.username.toLowerCase();

  if (!authUser || authUser.username.toLowerCase() !== targetUsername) {
    return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa hồ sơ này' });
  }

  const { fullName, bio, avatarUrl } = req.body;
  if (fullName) {
    execute('UPDATE users SET full_name = ? WHERE id = ?', [fullName.trim(), authUser.id]);
  }
  if (bio !== undefined) {
    execute('UPDATE users SET bio = ? WHERE id = ?', [bio.trim(), authUser.id]);
  }
  if (avatarUrl) {
    execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl.trim(), authUser.id]);
  }

  const updatedUser = queryOne(
    'SELECT id, username, full_name, email, avatar_url, bio, created_at FROM users WHERE id = ?',
    [authUser.id]
  );
  return res.json(updatedUser);
});

// ----------------------------------------------------
// 2. WARDROBE ITEMS CATALOG (/api/v1/wardrobe)
// ----------------------------------------------------
app.get('/api/v1/wardrobe', (req, res) => {
  const { category, era } = req.query;
  let sql = 'SELECT * FROM wardrobe_items WHERE 1=1';
  const params = [];

  if (category && category !== 'ALL') {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (era && era !== 'ALL') {
    sql += ' AND era = ?';
    params.push(era);
  }

  sql += ' ORDER BY is_heritage DESC, id ASC';
  const items = queryAll(sql, params).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    era: item.era,
    imageUrl: item.image_url,
    description: item.description,
    culturalContext: item.cultural_context,
    isHeritage: Boolean(item.is_heritage),
  }));

  return res.json(items);
});

app.get('/api/v1/wardrobe/:id', (req, res) => {
  const item = queryOne('SELECT * FROM wardrobe_items WHERE id = ?', [Number(req.params.id)]);
  if (!item) return res.status(404).json({ error: 'Không tìm thấy trang phục' });
  return res.json({
    id: item.id,
    name: item.name,
    category: item.category,
    era: item.era,
    imageUrl: item.image_url,
    description: item.description,
    culturalContext: item.cultural_context,
    isHeritage: Boolean(item.is_heritage),
  });
});

// ----------------------------------------------------
// 3. SOCIAL FEED & OUTFIT POSTS (/api/v1/outfits)
// ----------------------------------------------------

// Helper to populate post with author, likes, and wardrobe items from DB
function enrichPost(post, currentUserId = null) {
  const author = queryOne(
    'SELECT id, username, full_name, avatar_url, bio FROM users WHERE id = ?',
    [post.user_id]
  ) || {
    id: post.user_id,
    username: 'creator',
    full_name: 'Nhà Phối Đồ',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    bio: '',
  };

  // Likes count
  const likeRow = queryOne('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [post.id]);
  const likesCount = likeRow ? likeRow.count : 0;

  // Has current user liked?
  let isLiked = false;
  let isBookmarked = false;
  if (currentUserId) {
    const userLike = queryOne('SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [post.id, currentUserId]);
    isLiked = Boolean(userLike);

    const userBookmark = queryOne('SELECT id FROM bookmarks WHERE post_id = ? AND user_id = ?', [post.id, currentUserId]);
    isBookmarked = Boolean(userBookmark);
  }

  // Items in this outfit
  const items = queryAll(
    `SELECT w.* FROM wardrobe_items w
     JOIN post_items pi ON w.id = pi.item_id
     WHERE pi.post_id = ?`,
    [post.id]
  ).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    era: item.era,
    imageUrl: item.image_url,
    description: item.description,
    culturalContext: item.cultural_context,
    isHeritage: Boolean(item.is_heritage),
  }));

  const itemIds = items.map((i) => i.id);

  let tags = [];
  try {
    tags = post.tags ? JSON.parse(post.tags) : [];
  } catch (e) {
    tags = post.tags ? post.tags.split(',') : [];
  }

  return {
    id: post.id,
    title: post.title,
    event: post.event,
    aiFeedback: post.ai_feedback,
    isApproved: Boolean(post.is_approved),
    culturalScore: post.cultural_score,
    imageUrl: post.image_url,
    author: {
      id: author.id,
      username: author.username,
      fullName: author.full_name,
      avatarUrl: author.avatar_url,
      bio: author.bio,
    },
    itemIds,
    items,
    tags,
    likesCount,
    isLiked,
    isBookmarked,
    createdAt: post.created_at,
  };
}

// Get feed posts (with real-time likes & bookmarks)
app.get('/api/v1/outfits', (req, res) => {
  const authUser = getAuthUser(req);
  const currentUserId = authUser ? authUser.id : null;
  const { search } = req.query;

  let sql = 'SELECT * FROM outfit_posts WHERE 1=1';
  const params = [];

  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    sql += ' AND (LOWER(title) LIKE ? OR LOWER(event) LIKE ? OR LOWER(ai_feedback) LIKE ? OR LOWER(tags) LIKE ?)';
    params.push(q, q, q, q);
  }

  sql += ' ORDER BY created_at DESC';
  const rawPosts = queryAll(sql, params);
  const posts = rawPosts.map((p) => enrichPost(p, currentUserId));

  return res.json(posts);
});

// Get posts by a specific user
app.get('/api/v1/outfits/user/:username', (req, res) => {
  const authUser = getAuthUser(req);
  const currentUserId = authUser ? authUser.id : null;
  const targetUser = queryOne('SELECT id FROM users WHERE LOWER(username) = ?', [req.params.username.toLowerCase()]);

  if (!targetUser) {
    return res.json([]);
  }

  const rawPosts = queryAll('SELECT * FROM outfit_posts WHERE user_id = ? ORDER BY created_at DESC', [targetUser.id]);
  const posts = rawPosts.map((p) => enrichPost(p, currentUserId));
  return res.json(posts);
});

// Get user's saved/bookmarked posts
app.get('/api/v1/outfits/bookmarks/mine', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để xem các bản phối đã lưu' });
  }

  const rawPosts = queryAll(
    `SELECT p.* FROM outfit_posts p
     JOIN bookmarks b ON p.id = b.post_id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [authUser.id]
  );
  const posts = rawPosts.map((p) => enrichPost(p, authUser.id));
  return res.json(posts);
});

// Create new outfit post (Saved into SQLite `outfit_posts` & `post_items`)
app.post('/api/v1/outfits', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập tài khoản để đăng bản phối lên bảng tin.' });
  }

  const { title, event, aiFeedback, isApproved, culturalScore, imageUrl, itemIds, tags } = req.body;

  if (!title || !event || !imageUrl || !itemIds || itemIds.length === 0) {
    return res.status(400).json({ error: 'Vui lòng cung cấp tiêu đề, sự kiện, ảnh và ít nhất 1 món đồ.' });
  }

  const tagsJson = JSON.stringify(tags || ['VietPhucRemix', 'GenZAudition']);

  execute(
    `INSERT INTO outfit_posts (user_id, title, event, ai_feedback, is_approved, cultural_score, image_url, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      authUser.id,
      title.trim(),
      event.trim(),
      aiFeedback || 'Đã được Chị Gatekeeper kiểm duyệt',
      isApproved !== undefined ? (isApproved ? 1 : 0) : 1,
      culturalScore || 90,
      imageUrl.trim(),
      tagsJson,
    ]
  );

  // Get last inserted post id
  const postRow = queryOne('SELECT id FROM outfit_posts WHERE user_id = ? ORDER BY id DESC LIMIT 1', [authUser.id]);
  const newPostId = postRow.id;

  // Insert wardrobe items link
  for (const itemId of itemIds) {
    execute('INSERT OR IGNORE INTO post_items (post_id, item_id) VALUES (?, ?)', [newPostId, itemId]);
  }

  const rawPost = queryOne('SELECT * FROM outfit_posts WHERE id = ?', [newPostId]);
  return res.json(enrichPost(rawPost, authUser.id));
});

// Real Like Toggle (Stored in SQLite `likes` table)
app.post('/api/v1/outfits/:id/like', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để thả tim bài viết!' });
  }

  const postId = Number(req.params.id);
  const post = queryOne('SELECT id FROM outfit_posts WHERE id = ?', [postId]);
  if (!post) {
    return res.status(404).json({ error: 'Bài viết không tồn tại' });
  }

  const existingLike = queryOne('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [authUser.id, postId]);
  let isLiked = false;

  if (existingLike) {
    // Unlike
    execute('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [authUser.id, postId]);
    isLiked = false;
  } else {
    // Like
    execute('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [authUser.id, postId]);
    isLiked = true;
  }

  const likeCountRow = queryOne('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [postId]);
  return res.json({
    postId,
    isLiked,
    likesCount: likeCountRow ? likeCountRow.count : 0,
  });
});

// Real Bookmark Toggle (Stored in SQLite `bookmarks` table)
app.post('/api/v1/outfits/:id/bookmark', (req, res) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để ghim bản phối vào hồ sơ!' });
  }

  const postId = Number(req.params.id);
  const post = queryOne('SELECT id FROM outfit_posts WHERE id = ?', [postId]);
  if (!post) {
    return res.status(404).json({ error: 'Bài viết không tồn tại' });
  }

  const existingBookmark = queryOne('SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?', [authUser.id, postId]);
  let isBookmarked = false;

  if (existingBookmark) {
    execute('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?', [authUser.id, postId]);
    isBookmarked = false;
  } else {
    execute('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [authUser.id, postId]);
    isBookmarked = true;
  }

  return res.json({
    postId,
    isBookmarked,
  });
});

// ----------------------------------------------------
// 4. AI GATEKEEPER STUDIO EVALUATION (/api/v1/gatekeeper/evaluate)
// ----------------------------------------------------
app.post('/api/v1/gatekeeper/evaluate', async (req, res) => {
  const { event, itemIds, remixStyle, customNotes } = req.body;

  if (!event || !itemIds || itemIds.length === 0) {
    return res.status(400).json({ error: 'Vui lòng chọn bối cảnh sự kiện và ít nhất 1 món đồ.' });
  }

  // Fetch actual wardrobe items from SQLite
  const placeholders = itemIds.map(() => '?').join(',');
  const selectedItems = queryAll(`SELECT * FROM wardrobe_items WHERE id IN (${placeholders})`, itemIds);

  const itemsText = selectedItems
    .map(
      (item) =>
        `- ${item.name} (Phân loại: ${item.category}, Thời kỳ: ${item.era}, Chi tiết: ${item.description}, Bối cảnh văn hóa: ${item.cultural_context})`
    )
    .join('\n');

  const systemInstruction = `
Bạn là "Chị Gatekeeper" – vị giám khảo thời trang Việt Phục Remix khét tiếng của Gen-Z Việt Nam trên nền tảng Audition Viet Phuc Remix.
Tính cách của bạn:
- Rất am hiểu lịch sử trang phục Việt (Áo Nhật Bình triều Nguyễn, Áo Giao Lĩnh triều Lê, Áo Tấc, Ngũ Thân tay chẽn, Yếm Lụa Hà Đông, Nón Quai Thao, Guốc Mộc...).
- Giọng văn cực kỳ hài hước, đanh đá nhưng có tâm, đậm chất Gen-Z Việt Nam (dùng từ lóng: 'quá keo', 'mlem', 'red flag', 'báo thủ', 'cháy phố', '10 điểm không có nhưng', 'slay dính dách', 'over hợp', 'đỉnh nóc kịch trần').
- QUY TẮC CỐT LÕI VỀ VĂN HÓA:
  + Ủng hộ việc remix sáng tạo để Việt phục đi vào đời sống (mặc với sneaker, blazer, kính râm, combat boots, quần túi hộp...).
  + Cảnh báo hoặc từ chối nếu có biểu hiện xúc phạm di sản: mặc Nhật Bình hoàng gia hở hang không nội y, mang nón quai thao nhảy sàn phản cảm, xuyên tạc hoa văn.
  + Đánh giá dựa trên độ hòa hợp giữa món đồ truyền thống và Sự kiện (event).
`;

  const userPrompt = `
Hãy chấm điểm và nhận xét bộ trang phục Việt Phục Remix này:
- Sự kiện / Bối cảnh xuất hiện: ${event}
- Phong cách Remix: ${remixStyle || 'Streetwear Heritage Fusion'}
- Ghi chú thêm từ người mặc: ${customNotes || 'Tự tin tỏa sáng'}
- Các món đồ đã chọn trong phòng thử:
${itemsText}

TRẢ VỀ ĐÚNG FORMAT JSON NÀY (chỉ trả về valid JSON không kèm markdown hay code block):
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

  // Call Gemini 3.8 Flash with retry logic
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
      } catch (err) {
        retries--;
        console.warn(`Gemini API attempt error (${3 - retries}/3):`, err?.message || err);
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }
  }

  // Smart Cultural Intelligence Heuristic
  const eventLower = event.toLowerCase();
  const hasNhatBinh = selectedItems.some((i) => i.name.toLowerCase().includes('nhật bình'));
  const hasNguThan = selectedItems.some((i) => i.name.toLowerCase().includes('ngũ thân'));
  const hasBoots = selectedItems.some((i) => i.name.toLowerCase().includes('boots'));

  let score = 92;
  let status = 'APPROVED';
  let title = 'Tiểu Thư Triều Đình Slay Phố Hiện Đại';
  let feedback =
    'Quá keo lỳ bà nội ơi! Tà áo truyền thống hòa quyện cùng tinh thần Gen-Z cực cháy, chị chấm 10 điểm không có nhưng!';
  let culturalNotes =
    'Trang phục truyền thống Việt Nam đề cao vẻ đẹp kín đáo, độ rủ tự nhiên của tơ lụa và sự khoan thai trang nhã.';
  let stylingTips =
    'Phối thêm kính râm gọng hẹp và túi cắp nách thổ cẩm để chuẩn vibe thời trang sàn diễn.';
  const hashtags = ['#VietPhucRemix', '#AuditionFashion', '#SlayDiSan'];

  if (eventLower.includes('bùi viện') || eventLower.includes('bar') || eventLower.includes('quẩy')) {
    if (hasNhatBinh) {
      score = 88;
      title = 'Công Chúa Triều Nguyễn Đi Quẩy Đêm';
      feedback =
        'Trời đất ơi tưởng red flag mà hóa ra over hợp! Áo Nhật Bình trang nghiêm đem ra Bùi Viện quẩy thì hơi liều, nhưng mix kiểu layer khoác ngoài kèm combat boots thế này thì chị chịu thua độ sáng tạo!';
      culturalNotes =
        'Áo Nhật Bình có cổ áo hình chữ nhật đặc trưng triều Nguyễn, khi khoác ngoài cần giữ ngay ngắn để tôn lên hoa văn ngũ hành.';
      stylingTips = 'Cài nhẹ nút cúc thứ 2 để áo không bị xô lệch khi nhún nhảy theo nhạc!';
    }
  } else if (eventLower.includes('cưới') || eventLower.includes('tiệc')) {
    score = 98;
    title = 'Khách Mời 10 Điểm Lấn Lướt Toàn Tập';
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

// Database stats for health inspection
app.get('/api/v1/db/stats', (req, res) => {
  const usersCount = queryOne('SELECT COUNT(*) as count FROM users')?.count || 0;
  const postsCount = queryOne('SELECT COUNT(*) as count FROM outfit_posts')?.count || 0;
  const itemsCount = queryOne('SELECT COUNT(*) as count FROM wardrobe_items')?.count || 0;
  const likesCount = queryOne('SELECT COUNT(*) as count FROM likes')?.count || 0;
  const bookmarksCount = queryOne('SELECT COUNT(*) as count FROM bookmarks')?.count || 0;

  return res.json({
    engine: 'SQLite 3 (sql.js persistent wasm)',
    databaseFile: 'data/audition_vietphuc.db',
    tables: {
      users: usersCount,
      outfit_posts: postsCount,
      wardrobe_items: itemsCount,
      likes: likesCount,
      bookmarks: bookmarksCount,
    },
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
