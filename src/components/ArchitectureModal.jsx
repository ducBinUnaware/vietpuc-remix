import React, { useState, useEffect } from 'react';
import { X, Database, Cpu, Server, CheckCircle2, Layers, RefreshCw } from 'lucide-react';

export const ArchitectureModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('db_live');
  const [dbStats, setDbStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/v1/db/stats');
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Cơ Sở Dữ Liệu SQLite & Kiến Trúc JavaScript Thuần
            </h2>
            <p className="text-neutral-400 text-[11px]">
              Tất cả tài khoản, lượt thích, ghim, bài đăng được lưu trữ trong bảng SQLite (`sql.js` file-backed)
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          {[
            { id: 'db_live', label: 'THỐNG KÊ DATABASE LIVE' },
            { id: 'db_schema', label: 'CẤU TRÚC CÁC BẢNG (SCHEMA)' },
            { id: 'endpoints', label: 'RESTFUL APIS JAVASCRIPT' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live DB Stats */}
        {activeTab === 'db_live' && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold flex items-center gap-2">
                  <Server className="w-4 h-4" /> SQLite Database Status
                </span>
                <button
                  onClick={loadStats}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block font-bold">BẢNG `users`</span>
                  <span className="text-xl font-bold text-white">
                    {dbStats?.tables?.users !== undefined ? dbStats.tables.users : '...'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Tài khoản thật</span>
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block font-bold">BẢNG `outfit_posts`</span>
                  <span className="text-xl font-bold text-white">
                    {dbStats?.tables?.outfit_posts !== undefined ? dbStats.tables.outfit_posts : '...'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Bài đăng trên sàn</span>
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block font-bold">BẢNG `likes`</span>
                  <span className="text-xl font-bold text-rose-400">
                    {dbStats?.tables?.likes !== undefined ? dbStats.tables.likes : '...'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Lượt thích</span>
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block font-bold">BẢNG `bookmarks`</span>
                  <span className="text-xl font-bold text-amber-400">
                    {dbStats?.tables?.bookmarks !== undefined ? dbStats.tables.bookmarks : '...'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Bản phối đã ghim</span>
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block font-bold">BẢNG `wardrobe_items`</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {dbStats?.tables?.wardrobe_items !== undefined ? dbStats.tables.wardrobe_items : '...'}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Trang phục di sản</span>
                </div>

                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block font-bold">DATABASE FILE</span>
                  <span className="text-[11px] font-bold text-neutral-200 block truncate">
                    data/audition_vietphuc.db
                  </span>
                  <span className="text-[10px] text-emerald-400 block">File lưu đĩa</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-neutral-300 leading-relaxed space-y-2">
              <p>
                - <strong className="text-white">Không còn tài khoản ảo:</strong> Tất cả tài khoản được tạo thông qua giao diện Đăng Ký và lưu vào bảng <code className="text-amber-400">users</code> với mật khẩu mã hóa scrypt.
              </p>
              <p>
                - <strong className="text-white">Lượt thích & Ghim bài:</strong> Lưu trực tiếp theo quan hệ <code className="text-emerald-400">user_id - post_id</code> trong bảng <code className="text-emerald-400">likes</code> và <code className="text-emerald-400">bookmarks</code>.
              </p>
              <p>
                - <strong className="text-white">Ngôn ngữ JavaScript:</strong> Toàn bộ backend (`server.js`, `db.js`) và frontend (`.jsx`) viết bằng JavaScript chuẩn ES6+.
              </p>
            </div>
          </div>
        )}

        {/* Database Schema */}
        {activeTab === 'db_schema' && (
          <div className="space-y-3">
            <pre className="text-[11px] text-neutral-300 overflow-x-auto p-4 bg-neutral-950 rounded-xl border border-neutral-800">
{`-- SQLITE RELATIONAL TABLES (db.js)

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outfit_posts (
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

CREATE TABLE likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`}
            </pre>
          </div>
        )}

        {/* RESTful APIs */}
        {activeTab === 'endpoints' && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {[
              { method: 'POST', path: '/api/v1/auth/register', desc: 'Đăng ký tài khoản người dùng thật vào bảng users' },
              { method: 'POST', path: '/api/v1/auth/login', desc: 'Đăng nhập & kiểm tra mật khẩu mã hóa scrypt' },
              { method: 'GET', path: '/api/v1/auth/me', desc: 'Lấy thông tin tài khoản đang đăng nhập' },
              { method: 'POST', path: '/api/v1/auth/logout', desc: 'Đăng xuất & hủy token trong bảng sessions' },
              { method: 'GET', path: '/api/v1/wardrobe', desc: 'Lấy danh mục trang phục di sản từ bảng wardrobe_items' },
              { method: 'GET', path: '/api/v1/outfits', desc: 'Lấy bảng tin bài đăng với lượt thích và ghim thực tế' },
              { method: 'POST', path: '/api/v1/outfits', desc: 'Đăng bản phối mới vào bảng outfit_posts & post_items' },
              { method: 'POST', path: '/api/v1/outfits/:id/like', desc: 'Thả tim / Bỏ tim lưu vào bảng likes' },
              { method: 'POST', path: '/api/v1/outfits/:id/bookmark', desc: 'Ghim / Bỏ ghim lưu vào bảng bookmarks' },
              { method: 'POST', path: '/api/v1/gatekeeper/evaluate', desc: 'Gọi Gemini 3.8 Flash thẩm định phong cách' },
              { method: 'GET', path: '/api/v1/db/stats', desc: 'Thống kê trực tiếp số lượng bản ghi các bảng' },
            ].map((ep, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-black text-[10px] ${ep.method === 'POST' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {ep.method}
                  </span>
                  <code className="text-white font-mono">{ep.path}</code>
                </div>
                <span className="text-neutral-400 hidden sm:inline">{ep.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-right pt-2 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng Trình Soi Database
          </button>
        </div>
      </div>
    </div>
  );
};
