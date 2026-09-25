/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { FeedView } from './components/FeedView.jsx';
import { WardrobeStudioView } from './components/WardrobeStudioView.jsx';
import { ProfileView } from './components/ProfileView.jsx';
import { AuthView } from './components/AuthView.jsx';
import { HeritageGuideModal } from './components/HeritageGuideModal.jsx';
import { ArchitectureModal } from './components/ArchitectureModal.jsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState('feed');
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('vpr_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Initial Load: Authenticate real session & load SQLite data
  useEffect(() => {
    async function initApp() {
      setLoading(true);

      // 1. Check existing authenticated session
      const token = localStorage.getItem('vpr_token');
      if (token) {
        try {
          const authRes = await fetch('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            setCurrentUser(authData.user);
            localStorage.setItem('vpr_user', JSON.stringify(authData.user));
          } else {
            // Token expired or invalid
            localStorage.removeItem('vpr_token');
            localStorage.removeItem('vpr_user');
            setCurrentUser(null);
          }
        } catch (e) {
          console.error('Failed to authenticate session:', e);
        }
      }

      // 2. Fetch posts and wardrobe from database
      await refreshData();
      setLoading(false);
    }

    initApp();
  }, []);

  const refreshData = async () => {
    try {
      const token = localStorage.getItem('vpr_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [postsRes, wardrobeRes] = await Promise.all([
        fetch('/api/v1/outfits', { headers }),
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
      console.error('Error fetching data:', err);
    }
  };

  // Like a post (saved to SQLite database `likes` table)
  const handleLikePost = async (postId) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      showToast('⚠️ Vui lòng đăng nhập để thả tim bài viết!');
      return;
    }

    try {
      const res = await fetch(`/api/v1/outfits/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, isLiked: data.isLiked, likesCount: data.likesCount }
              : p
          )
        );
        showToast(data.isLiked ? '❤️ Đã thả tim bản phối!' : 'Đã bỏ thả tim.');
      } else {
        const err = await res.json();
        showToast(err.error || 'Lỗi khi thả tim');
      }
    } catch (e) {
      console.error('Like failed', e);
    }
  };

  // Bookmark / Save a post (saved to SQLite database `bookmarks` table)
  const handleToggleSave = async (postId) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      showToast('⚠️ Vui lòng đăng nhập để ghim bản phối!');
      return;
    }

    try {
      const res = await fetch(`/api/v1/outfits/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, isBookmarked: data.isBookmarked } : p
          )
        );
        showToast(data.isBookmarked ? '📌 Đã ghim bản phối vào hồ sơ!' : 'Đã bỏ ghim bản phối.');
      } else {
        const err = await res.json();
        showToast(err.error || 'Lỗi khi ghim bản phối');
      }
    } catch (e) {
      console.error('Bookmark failed', e);
    }
  };

  // Publish New Outfit Post (Saved into SQLite `outfit_posts` table)
  const handlePublishPost = async (newPostData) => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      showToast('⚠️ Vui lòng đăng nhập để đăng bản phối lên bảng tin!');
      return;
    }

    try {
      const res = await fetch('/api/v1/outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(newPostData),
      });

      if (res.ok) {
        const createdPost = await res.json();
        setPosts([createdPost, ...posts]);
        setCurrentTab('feed');
        showToast('🎉 Bản phối của bạn đã được lưu vào cơ sở dữ liệu và lên Bảng Tin!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Đăng bài thất bại.');
      }
    } catch (e) {
      console.error('Failed to publish', e);
      showToast('Lỗi kết nối máy chủ.');
    }
  };

  // Update Profile Bio (Saved into SQLite `users` table)
  const handleUpdateBio = async (newBio, newFullName) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/v1/auth/profile/${currentUser.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ bio: newBio, fullName: newFullName }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        localStorage.setItem('vpr_user', JSON.stringify(updated));
        showToast('✓ Đã cập nhật hồ sơ vào cơ sở dữ liệu!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Auth Modal
  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Logout (deletes session in SQLite)
  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('vpr_user');
    localStorage.removeItem('vpr_token');
    setCurrentUser(null);
    setCurrentTab('feed');
    refreshData();
    showToast('Đã đăng xuất tài khoản.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row text-neutral-800">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
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
              <p className="text-sm font-bold text-neutral-600">Đang khởi tạo cơ sở dữ liệu và tải sàn diễn...</p>
            </div>
          </div>
        ) : (
          <>
            {currentTab === 'feed' && (
              <FeedView
                posts={posts}
                currentUser={currentUser}
                onLikePost={handleLikePost}
                onToggleSave={handleToggleSave}
                onOpenFittingRoom={() => setCurrentTab('wardrobe')}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentTab === 'wardrobe' && (
              <WardrobeStudioView
                wardrobeItems={wardrobeItems}
                currentUser={currentUser}
                onPublishPost={handlePublishPost}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onOpenFittingRoom={() => setCurrentTab('wardrobe')}
                onUpdateBio={handleUpdateBio}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {currentTab === 'auth' && (
              <AuthView
                initialMode="login"
                isModal={false}
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  setCurrentTab('feed');
                  refreshData();
                  showToast(`Chào mừng ${user.full_name || user.fullName} đã gia nhập sàn diễn!`);
                }}
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

      {/* Dedicated Authentication Modal */}
      {isAuthModalOpen && (
        <AuthView
          initialMode={authModalMode}
          isModal={true}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            refreshData();
            showToast(`Chào mừng ${user.full_name || user.fullName} đã đăng nhập!`);
          }}
        />
      )}

      {/* Cultural Lore Guide Modal */}
      <HeritageGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Database & Architecture Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
