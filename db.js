import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DB_DIR, 'audition_vietphuc.db');

let db = null;

// Password hashing with crypto
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

export async function initDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables in SQLite
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wardrobe_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      era TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT,
      cultural_context TEXT,
      is_heritage INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS outfit_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      event TEXT NOT NULL,
      ai_feedback TEXT,
      is_approved INTEGER DEFAULT 1,
      cultural_score INTEGER DEFAULT 85,
      image_url TEXT NOT NULL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS post_items (
      post_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      PRIMARY KEY (post_id, item_id),
      FOREIGN KEY (post_id) REFERENCES outfit_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES wardrobe_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES outfit_posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES outfit_posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed standard wardrobe items catalog if empty
  const countRes = db.exec("SELECT COUNT(*) as count FROM wardrobe_items;");
  const count = countRes.length > 0 && countRes[0].values.length > 0 ? countRes[0].values[0][0] : 0;

  if (count === 0) {
    const stmt = db.prepare(`
      INSERT INTO wardrobe_items (name, category, era, image_url, description, cultural_context, is_heritage)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `);

    const standardItems = [
      ['Áo Nhật Bình Hoàng Gia (Gấm Đỏ)', 'OUTERWEAR', 'TRIEU_NGUYEN', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', 'Áo có cổ hình chữ nhật viền chỉ ngũ sắc, hoa văn phượng hoàng và mây ngũ hành cao quý.', 'Lễ phục dành cho bậc hoàng hậu, công chúa và phi tần triều Nguyễn thế kỷ 19.', 1],
      ['Áo Ngũ Thân Tay Chẽn (Lụa Đen Huyền)', 'OUTERWEAR', 'TRIEU_NGUYEN', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', 'Phom áo 5 thân gài 5 khuy ngọc bên phải, cổ đứng ôm gọn, tay may chẽn năng động.', 'Trang phục quốc phục chuẩn mực của nam nữ thời Nguyễn, biểu trưng cho tứ thân phụ mẫu và đức nhân nghĩa.', 1],
      ['Áo Tấc Thụ Lĩnh (Xanh Cổ Vịt)', 'OUTERWEAR', 'TRIEU_NGUYEN', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80', 'Áo lễ thụ lĩnh tay thụng rộng 1 tấc, tà buông tự nhiên trang nghiêm.', 'Lễ phục trang trọng của giới nho sĩ và dân gian trong dịp cưới hỏi, tế lễ đình làng.', 1],
      ['Áo Giao Lĩnh Cổ Chéo (Trắng Ngà)', 'OUTERWEAR', 'THOI_LE', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80', 'Phom áo cổ chéo buông dài, dây lưng lụa thắt ngang eo, phom dáng uyển chuyển.', 'Trang phục thịnh hành triều Lý, Trần, Hậu Lê (thế kỷ 15-18).', 1],
      ['Áo Khoác Da Biker Oversize', 'OUTERWEAR', 'MODERN_GENZ', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', 'Áo khoác da đen phong cách rock-chic với khóa kéo bạc cá tính, tạo điểm nhấn tương phản với yếm hoặc áo dài.', 'Item streetwear biểu tượng của phong cách tự do phóng khoáng.', 0],
      ['Áo Yếm Lụa Hà Đông (Cánh Sen)', 'INNERWEAR', 'NAM_BO_DAN_GIAN', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80', 'Yếm cổ xây viền chỉ tơ tằm, dây buộc sau gáy và lưng, chất lụa dệt thủ công.', 'Trang phục lót truyền thống của phụ nữ Việt từ thời cổ, gợi cảm mà kín đáo kín gió.', 1],
      ['Áo Baby Tee Graphic Trống Đồng', 'INNERWEAR', 'MODERN_GENZ', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80', 'Áo thun ôm sát lửng in graphic cách điệu hoa văn Trống Đồng Đông Sơn thời đại số.', 'Sự giao thoa giữa văn hóa Y2K hiện đại và biểu tượng văn minh Đông Sơn 2000 năm.', 0],
      ['Quần Lụa Vạn Phúc Trắng Ngà', 'BOTTOMS', 'TRIEU_NGUYEN', 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop&q=80', 'Quần ống rộng lụa tơ tằm rủ mềm mại, cạp chun thoải mái khi chuyển động.', 'Phần dưới không thể thiếu của trang phục áo ngũ thân và áo dài truyền thống.', 1],
      ['Quần Cargo Khaki Đa Túi Hộp', 'BOTTOMS', 'MODERN_GENZ', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', 'Quần nhiều túi hộp phom thụng phong cách hiphop Gen-Z thập niên 2000.', 'Item hiện đại cực hợp để remix tương phản với áo ngũ thân hoặc yếm tơ.', 0],
      ['Chân Váy Tulle Xòe Đen Gothic', 'BOTTOMS', 'MODERN_GENZ', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80', 'Váy lưới phồng bồng bềnh phong cách gothic lolita / fairycore.', 'Tạo hiệu ứng layer độc đáo khi mặc dưới tà áo ngũ thân xẻ tà.', 0],
      ['Nón Quai Thao Xứ Kinh Bắc', 'ACCESSORIES', 'THOI_LE', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80', 'Nón tròn dẹt vành rộng đan bằng lá cọ, gắn quai thao thao tơ tằm buông dài.', 'Chiếc nón gắn liền với các liền chị quan họ Bắc Ninh dịu dàng duyên dáng.', 1],
      ['Khăn Đóng Gấm Đen Hoàng Triều', 'ACCESSORIES', 'TRIEU_NGUYEN', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80', 'Khăn xếp quấn nhiều nếp đều tăm tắp, ôm sát vòm trán cương nghị.', 'Phụ kiện đội đầu tiêu chuẩn khi mặc áo ngũ thân và lễ phục xưa.', 1],
      ['Kính Râm Cyberpunk Matrix Gọng Bạc', 'ACCESSORIES', 'MODERN_GENZ', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80', 'Kính mát hình bầu dục gọng kim loại hẹp viễn tưởng phong cách Neo Y2K.', 'Phụ kiện biến mọi bộ cổ phục thành runway thời trang tương lai.', 0],
      ['Guốc Mộc Gỗ Sơn Mài Quai Nhung', 'FOOTWEAR', 'NAM_BO_DAN_GIAN', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', 'Guốc gỗ đẽo thủ công gót cao 5cm tiếng gõ lách cách thân thương hè phố.', 'Đôi guốc mộc mạc gắn liền ký ức Sài Gòn và phụ nữ Nam Kỳ xưa.', 1],
      ['Chunky Combat Boots Đế Răng Cưa', 'FOOTWEAR', 'MODERN_GENZ', 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80', 'Boots da cổ cao hầm hố đế dày 6cm phong cách Cyberpunk Audition.', 'Tạo độ đầm và nét gai góc thời thượng khi mix với tà áo dài truyền thống.', 0],
    ];

    for (const item of standardItems) {
      stmt.run(item);
    }
    stmt.free();
    saveDatabase();
  }

  saveDatabase();
  return db;
}

export function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

// Database helper functions
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

// Helper: Run query returning array of objects
export function queryAll(sql, params = []) {
  const statement = db.prepare(sql);
  if (params && params.length > 0) {
    statement.bind(params);
  }
  const results = [];
  while (statement.step()) {
    results.push(statement.getAsObject());
  }
  statement.free();
  return results;
}

// Helper: Run query returning first object or null
export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper: Run an insert/update/delete statement and save
export function execute(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
}
