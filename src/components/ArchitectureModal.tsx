import React, { useState } from 'react';
import { X, Terminal, Database, Cpu, Server, CheckCircle2, Code2, Layers } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gemini_retry' | 'endpoints' | 'jpa_schema'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8 font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Kiến Trúc Backend Java Spring Boot 3.x & H2 Database
            </h2>
            <p className="text-neutral-400 text-[11px]">
              Microservices-ready, Clean Layered Architecture (controller, dto, model, repository, service)
            </p>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          {[
            { id: 'overview', label: 'TỔNG QUAN HỆ THỐNG' },
            { id: 'gemini_retry', label: 'GEMINI 503 RETRY' },
            { id: 'jpa_schema', label: 'H2 JPA ENTITIES' },
            { id: 'endpoints', label: 'RESTFUL APIS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

        {/* Content Section */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" /> Kiến Trúc Đa Tầng (Spring Boot 3 + Java 17)
              </div>
              <div className="space-y-2 text-neutral-300 leading-relaxed">
                <p>
                  1. <strong className="text-white">Controller Layer:</strong> Đảm nhận RESTful routing (`/api/v1/auth`, `/api/v1/wardrobe`, `/api/v1/outfits`, `/api/v1/gatekeeper`).
                </p>
                <p>
                  2. <strong className="text-white">Service Layer:</strong> Xử lý nghiệp vụ, session token, thuật toán thẩm định di sản, và `GeminiService` với cơ chế Exponential Backoff tự động retry khi gặp lỗi 503 Service Unavailable.
                </p>
                <p>
                  3. <strong className="text-white">Repository Layer:</strong> Spring Data JPA tương tác với H2 In-Memory Database (`jdbc:h2:mem:auditiondb`).
                </p>
                <p>
                  4. <strong className="text-white">Live AI Studio Proxy:</strong> Chạy Express full-stack tích hợp `@google/genai` (Gemini 3.8 Flash) ánh xạ 1:1 với toàn bộ REST endpoints của Spring Boot.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 block mb-1 font-bold">H2 In-Memory DB Connection:</span>
                <code className="text-amber-400">jdbc:h2:mem:auditiondb;DB_CLOSE_DELAY=-1</code>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 block mb-1 font-bold">Model AI Đang Phục Vụ:</span>
                <code className="text-emerald-400">gemini-3.8-flash (Chị Gatekeeper Persona)</code>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gemini_retry' && (
          <div className="space-y-3">
            <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> Cơ Chế Xử Lý 503 Retry Trong GeminiService.java
              </span>
              <pre className="text-[11px] text-neutral-300 overflow-x-auto p-3 bg-black/60 rounded-lg">
{`// backend/src/main/java/com/audition/vietphuc/service/GeminiService.java
int attempts = 0;
while (attempts < maxRetries) {
    attempts++;
    try {
        ResponseEntity<String> response = restTemplate.exchange(
            endpoint, HttpMethod.POST, entity, String.class);
        if (response.getStatusCode().is2xxSuccessful()) {
            return parseGeminiResponse(response.getBody());
        }
    } catch (HttpServerErrorException.ServiceUnavailable e) {
        log.warn("Gemini 503 Service Unavailable (attempt {}/{}). Retrying...", attempts, maxRetries);
        if (attempts >= maxRetries) throw e;
        Thread.sleep(retryBackoffMs * attempts); // Exponential Backoff
    }
}`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'jpa_schema' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <strong className="text-white block mb-1">Entity User</strong>
                <ul className="text-neutral-400 space-y-1 text-[11px]">
                  <li>- id: Long (PK)</li>
                  <li>- username: String</li>
                  <li>- password: String</li>
                  <li>- fullName: String</li>
                  <li>- email: String</li>
                  <li>- avatarUrl: String</li>
                  <li>- bio: String</li>
                  <li>- createdAt: LocalDateTime</li>
                </ul>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <strong className="text-white block mb-1">Entity OutfitPost</strong>
                <ul className="text-neutral-400 space-y-1 text-[11px]">
                  <li>- id: Long (PK)</li>
                  <li>- title: String</li>
                  <li>- event: String</li>
                  <li>- aiFeedback: TEXT</li>
                  <li>- isApproved: Boolean</li>
                  <li>- culturalScore: Integer</li>
                  <li>- author: User (ManyToOne)</li>
                  <li>- items: List (ManyToMany)</li>
                </ul>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <strong className="text-white block mb-1">Entity WardrobeItem</strong>
                <ul className="text-neutral-400 space-y-1 text-[11px]">
                  <li>- id: Long (PK)</li>
                  <li>- name: String</li>
                  <li>- category: String</li>
                  <li>- era: String</li>
                  <li>- imageUrl: String</li>
                  <li>- culturalContext: String</li>
                  <li>- isHeritage: boolean</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {[
              { method: 'POST', path: '/api/v1/auth/register', desc: 'Đăng ký tài khoản người dùng mới' },
              { method: 'POST', path: '/api/v1/auth/login', desc: 'Đăng nhập & tạo token phiên làm việc' },
              { method: 'GET', path: '/api/v1/auth/profile/{username}', desc: 'Lấy thông tin tài khoản' },
              { method: 'GET', path: '/api/v1/wardrobe', desc: 'Danh sách trang phục (hỗ trợ filter category/era)' },
              { method: 'GET', path: '/api/v1/outfits', desc: 'Bảng tin bài đăng Pinterest (search, filter)' },
              { method: 'POST', path: '/api/v1/outfits', desc: 'Đăng bản phối mới lên bảng tin' },
              { method: 'POST', path: '/api/v1/outfits/{id}/like', desc: 'Thả tim bài đăng' },
              { method: 'POST', path: '/api/v1/gatekeeper/evaluate', desc: 'Gọi Gemini AI Gatekeeper thẩm định' },
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
            Đóng Trình Soi Kiến Trúc
          </button>
        </div>
      </div>
    </div>
  );
};
