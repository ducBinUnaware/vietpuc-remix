/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/FeedView';
import { WardrobeStudioView } from './components/WardrobeStudioView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { HeritageGuideModal } from './components/HeritageGuideModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { User, OutfitPost, WardrobeItem } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<OutfitPost[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<number[]>([1, 3]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Load: User session, Posts, and Wardrobe Items
  useEffect(() => {
    // 1. Load Session
    const savedUserStr = localStorage.getItem('vpr_user');
    if (savedUserStr) {
      try {
        setCurrentUser(JSON.parse(savedUserStr));
      } catch (e) {
        console.error('Failed to parse user session');
      }
    } else {
      // Default demo user for instant preview delight
      const defaultUser: User = {
        id: 2,
        username: 'linhdan_phuc',
        fullName: 'Linh Đan Phạm',
        email: 'linhdan@vietphuc.vn',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        bio: 'Gen-Z mê Áo Nhật Bình & phối đồ Streetwear. Sống tại Sài Gòn 🌿',
      };
      setCurrentUser(defaultUser);
      localStorage.setItem('vpr_user', JSON.stringify(defaultUser));
    }

    // 2. Fetch Data from REST APIs
    async function loadData() {
      try {
        const [postsRes, wardrobeRes] = await Promise.all([
          fetch('/api/v1/outfits'),
          fetch('/api/v1/wardrobe'),
        ]);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        }

        if (wardrobeRes.ok) {
          const wardrobeData = await wardrobeRes.json();
          setWardrobeItems(wardrobeData);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle Like Action
  const handleLikePost = async (postId: number) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );

    try {
      await fetch(`/api/v1/outfits/${postId}/like`, { method: 'POST' });
      showToast('❤️ Đã thả tim cho bản phối Việt Phục!');
    } catch (e) {
      console.error('Like failed', e);
    }
  };

  // Toggle Save Pin
  const handleToggleSave = (postId: number) => {
    if (savedPostIds.includes(postId)) {
      setSavedPostIds(savedPostIds.filter((id) => id !== postId));
      showToast('Đã bỏ ghim bản phối.');
    } else {
      setSavedPostIds([...savedPostIds, postId]);
      showToast('📌 Đã ghim bản phối vào trang cá nhân!');
    }
  };

  // Publish New Outfit Post
  const handlePublishPost = async (newPostData: any) => {
    try {
      const res = await fetch('/api/v1/outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Username': currentUser?.username || 'linhdan_phuc',
        },
        body: JSON.stringify(newPostData),
      });

      if (res.ok) {
        const createdPost = await res.json();
        setPosts([createdPost, ...posts]);
        setCurrentTab('feed');
        showToast('🎉 Chúc mừng! Bản phối đã vượt qua Chị Gatekeeper và lên Bảng Tin!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Đăng bài thất bại.');
      }
    } catch (e) {
      console.error('Failed to publish', e);
      showToast('Lỗi kết nối máy chủ.');
    }
  };

  // Update Profile Bio
  const handleUpdateBio = async (newBio: string, newFullName: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/v1/auth/profile/${currentUser.username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: newBio, fullName: newFullName }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        localStorage.setItem('vpr_user', JSON.stringify(updated));
        showToast('✓ Đã cập nhật hồ sơ thành công!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Switch demo account
  const handleSwitchUser = async (username: string) => {
    try {
      const res = await fetch(`/api/v1/auth/profile/${username}`);
      if (res.ok) {
        const u = await res.json();
        setCurrentUser(u);
        localStorage.setItem('vpr_user', JSON.stringify(u));
        showToast(`Đã đổi sang tài khoản: ${u.fullName}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('vpr_user');
    localStorage.removeItem('vpr_token');
    setCurrentUser(null);
    showToast('Đã đăng xuất khỏi Audition Việt Phục.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row text-neutral-800">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 pb-16 md:pb-8 min-h-screen overflow-x-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-red-200 border-t-[#E60023] rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-neutral-600">Đang chuẩn bị sàn diễn Việt Phục...</p>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'feed' && (
              <FeedView
                posts={posts}
                onLikePost={handleLikePost}
                savedPostIds={savedPostIds}
                onToggleSave={handleToggleSave}
                onOpenFittingRoom={() => setCurrentTab('wardrobe')}
              />
            )}

            {currentTab === 'wardrobe' && (
              <WardrobeStudioView
                wardrobeItems={wardrobeItems}
                currentUser={currentUser}
                onPublishPost={handlePublishPost}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                posts={posts}
                savedPostIds={savedPostIds}
                onOpenFittingRoom={() => setCurrentTab('wardrobe')}
                onUpdateBio={handleUpdateBio}
                onSwitchUser={handleSwitchUser}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs md:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700 flex items-center gap-2.5 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Chào mừng ${user.fullName} đã gia nhập sàn diễn!`);
        }}
      />

      <HeritageGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
