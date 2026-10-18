/**
 * PulseNet Main Application Controller
 * Handles application lifecycle, routing, user actions, and state synchronization.
 */

const PulseApp = {
  currentUser: null,
  currentView: 'home', // 'home' | 'profile' | 'explore'
  currentFeedFilter: 'all', // 'all' | 'following' | 'trending'
  viewingProfileUserId: null,
  profileSubTab: 'posts', // 'posts' | 'liked' | 'network'
  selectedTagFilter: null,
  allUsers: [],

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  async init() {
    this.initTheme();
    this.setupEventListeners();

    try {
      // 1. Fetch current logged-in user
      this.currentUser = await API.getCurrentUser();
      this.updateCurrentUserUI();

      // 2. Load sidebars
      await this.loadAllUsers();
      await this.loadSuggestedUsers();

      // 3. Load main feed
      await this.loadFeed();
    } catch (err) {
      console.error('Initialization error:', err);
      this.showToast('Error initializing app: ' + err.message, 'danger');
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('pulsenet_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pulsenet_theme', next);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
    }
    this.showToast(`Switched to ${next} mode`, 'success');
  },

  setupEventListeners() {
    // Global search input with debounce
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          this.handleSearch(e.target.value);
        }, 300);
      });
    }

    // Media toggle button for post creation
    const mediaToggleBtn = document.getElementById('btn-toggle-media-input');
    const mediaInputWrap = document.getElementById('image-url-input-container');
    if (mediaToggleBtn && mediaInputWrap) {
      mediaToggleBtn.addEventListener('click', () => {
        const isHidden = mediaInputWrap.style.display === 'none' || !mediaInputWrap.style.display;
        mediaInputWrap.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
          document.getElementById('input-post-image-url').focus();
        }
      });
    }

    // Apply image URL preview button
    const applyImageBtn = document.getElementById('btn-apply-image-url');
    if (applyImageBtn) {
      applyImageBtn.addEventListener('click', () => {
        this.previewPostImage();
      });
    }

    // Remove image preview
    const removeMediaBtn = document.getElementById('btn-remove-preview-image');
    if (removeMediaBtn) {
      removeMediaBtn.addEventListener('click', () => {
        this.clearPostImagePreview();
      });
    }
  },

  // -------------------------------------------------------------
  // USER STATE & UI UPDATES
  // -------------------------------------------------------------
  updateCurrentUserUI() {
    if (!this.currentUser) return;

    // Update sidebar current user avatar and names
    const avatarElems = document.querySelectorAll('.current-user-avatar');
    avatarElems.forEach(img => {
      img.src = this.currentUser.avatar_url;
      img.alt = this.currentUser.name;
    });

    const nameElem = document.getElementById('sidebar-current-name');
    if (nameElem) nameElem.textContent = this.currentUser.name;

    const handleElem = document.getElementById('sidebar-current-handle');
    if (handleElem) handleElem.textContent = `@${this.currentUser.username}`;
  },

  async loadAllUsers() {
    try {
      this.allUsers = await API.getAllUsers();
      this.renderSwitchUserWidget();
    } catch (err) {
      console.warn('Could not load all users:', err);
    }
  },

  renderSwitchUserWidget() {
    const container = document.getElementById('switch-user-container');
    if (!container || !this.allUsers.length) return;

    container.innerHTML = this.allUsers.map(user => {
      const isActive = this.currentUser && this.currentUser.id === user.id;
      return window.PulseComponents.renderSwitchUserItem(user, isActive);
    }).join('');
  },

  async handleSwitchUser(userId) {
    if (this.currentUser && this.currentUser.id === userId) return;

    try {
      this.currentUser = await API.switchActiveUser(userId);
      this.updateCurrentUserUI();
      this.renderSwitchUserWidget();
      await this.loadSuggestedUsers();

      this.showToast(`Switched active profile to ${this.currentUser.name}`, 'success');

      // Refresh current view
      if (this.currentView === 'profile') {
        await this.navigateToProfile(this.viewingProfileUserId || userId);
      } else {
        await this.loadFeed();
      }
    } catch (err) {
      this.showToast('Failed to switch user: ' + err.message, 'danger');
    }
  },

  async loadSuggestedUsers() {
    const container = document.getElementById('suggested-users-container');
    if (!container) return;

    try {
      const suggested = await API.getSuggestedUsers();
      if (!suggested || suggested.length === 0) {
        container.innerHTML = `<div style="font-size: 13px; color: var(--text-muted);">You're following everyone! 🚀</div>`;
        return;
      }

      container.innerHTML = suggested.map(user => window.PulseComponents.renderSuggestedUserRow(user)).join('');
    } catch (err) {
      container.innerHTML = `<div style="font-size: 13px; color: var(--text-muted);">Unable to load suggestions</div>`;
    }
  },

  // -------------------------------------------------------------
  // FEED & POST MANAGEMENT
  // -------------------------------------------------------------
  async loadFeed(filter = this.currentFeedFilter, tag = this.selectedTagFilter) {
    const feedContainer = document.getElementById('feed-posts-stream');
    if (!feedContainer) return;

    feedContainer.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-muted);">
        <div class="skeleton-loading" style="height: 140px; margin-bottom: 12px; border-radius: 16px;"></div>
        <div class="skeleton-loading" style="height: 140px; border-radius: 16px;"></div>
      </div>
    `;

    try {
      const posts = await API.getPosts(filter, tag);
      this.renderFeedPosts(posts);
    } catch (err) {
      feedContainer.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-title">Failed to load feed</div>
          <div class="empty-state-desc">${escapeHtml(err.message)}</div>
          <button class="btn-primary" onclick="PulseApp.loadFeed()">Try Again</button>
        </div>
      `;
    }
  },

  renderFeedPosts(posts) {
    const feedContainer = document.getElementById('feed-posts-stream');
    if (!feedContainer) return;

    if (!posts || posts.length === 0) {
      feedContainer.innerHTML = `
        <div class="empty-state-box animate-scale-in">
          <div class="empty-state-icon">✨</div>
          <div class="empty-state-title">No posts here yet</div>
          <div class="empty-state-desc">Be the first to share an update, internship win, or question!</div>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = posts.map(post =>
      window.PulseComponents.renderPostCard(post, this.currentUser ? this.currentUser.id : null)
    ).join('');
  },

  setFeedFilter(filter) {
    this.currentFeedFilter = filter;
    this.selectedTagFilter = null;

    // Update active tab buttons
    document.querySelectorAll('.feed-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.loadFeed(filter, null);
  },

  filterByTag(tag) {
    this.selectedTagFilter = tag;
    this.showToast(`Filtered feed by ${tag}`, 'success');
    this.navigateToView('home');
    this.loadFeed(this.currentFeedFilter, tag);
  },

  previewPostImage() {
    const input = document.getElementById('input-post-image-url');
    const url = input ? input.value.trim() : '';
    if (!url) return;

    const previewBox = document.getElementById('post-media-preview-box');
    const previewImg = document.getElementById('post-preview-img');

    if (previewBox && previewImg) {
      previewImg.src = url;
      previewBox.style.display = 'block';
    }
  },

  clearPostImagePreview() {
    const input = document.getElementById('input-post-image-url');
    if (input) input.value = '';
    const previewBox = document.getElementById('post-media-preview-box');
    if (previewBox) previewBox.style.display = 'none';
  },

  async handleCreatePost() {
    const contentInput = document.getElementById('create-post-content');
    const imageInput = document.getElementById('input-post-image-url');
    const tagSelect = document.getElementById('create-post-tag-select');
    const submitBtn = document.getElementById('btn-submit-post');

    const content = contentInput ? contentInput.value.trim() : '';
    const imageUrl = imageInput ? imageInput.value.trim() : '';
    const tag = tagSelect ? tagSelect.value : '';

    if (!content) {
      this.showToast('Please type something to share!', 'warning');
      if (contentInput) contentInput.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';
    }

    try {
      await API.createPost({
        content,
        image_url: imageUrl || null,
        tag: tag || null
      });

      // Clear input fields
      if (contentInput) contentInput.value = '';
      this.clearPostImagePreview();
      const mediaInputWrap = document.getElementById('image-url-input-container');
      if (mediaInputWrap) mediaInputWrap.style.display = 'none';

      this.showToast('Post published successfully! 🎉', 'success');

      // Reload feed
      await this.loadFeed();
      if (this.currentUser) {
        this.currentUser = await API.getCurrentUser();
      }
    } catch (err) {
      this.showToast('Failed to post: ' + err.message, 'danger');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post';
      }
    }
  },

  async handleDeletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await API.deletePost(postId);
      const postCard = document.getElementById(`post-${postId}`);
      if (postCard) {
        postCard.style.transition = 'all 0.3s ease';
        postCard.style.opacity = '0';
        postCard.style.transform = 'scale(0.9)';
        setTimeout(() => postCard.remove(), 300);
      }
      this.showToast('Post deleted', 'success');
    } catch (err) {
      this.showToast('Failed to delete post: ' + err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // LIKE & FOLLOW SYSTEM
  // -------------------------------------------------------------
  async handleToggleLike(postId) {
    const likeBtn = document.getElementById(`like-btn-${postId}`);
    const countElem = document.getElementById(`like-count-${postId}`);

    if (likeBtn) {
      likeBtn.classList.add('animate-pop');
      setTimeout(() => likeBtn.classList.remove('animate-pop'), 400);
    }

    try {
      const result = await API.toggleLike(postId);
      if (likeBtn) {
        likeBtn.classList.toggle('liked', result.liked);
        const svg = likeBtn.querySelector('svg');
        if (svg) {
          svg.setAttribute('fill', result.liked ? 'currentColor' : 'none');
        }
      }
      if (countElem) {
        countElem.textContent = result.likesCount;
      }
    } catch (err) {
      this.showToast('Could not update like: ' + err.message, 'danger');
    }
  },

  async handleToggleFollow(targetUserId, fromWidget = false) {
    try {
      const result = await API.toggleFollow(targetUserId);

      // Update button state in profile view if open
      const profileBtn = document.getElementById(`profile-follow-btn-${targetUserId}`);
      if (profileBtn) {
        profileBtn.className = `btn-follow-action ${result.isFollowing ? 'following' : 'not-following'}`;
        profileBtn.textContent = result.isFollowing ? 'Following' : '+ Follow';
      }

      // Update follower count in profile header if visible
      const followersCountElem = document.getElementById('profile-stat-followers');
      if (followersCountElem) {
        followersCountElem.textContent = result.followersCount;
      }

      this.showToast(result.isFollowing ? 'Followed user! 🤝' : 'Unfollowed user', 'success');

      // Refresh sidebars
      await this.loadSuggestedUsers();

      // If feed was on "following", reload it
      if (this.currentFeedFilter === 'following') {
        await this.loadFeed();
      }
    } catch (err) {
      this.showToast(err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // COMMENTS SYSTEM
  // -------------------------------------------------------------
  async toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-section-${postId}`);
    if (!commentsSection) return;

    const isHidden = commentsSection.style.display === 'none';
    commentsSection.style.display = isHidden ? 'flex' : 'none';

    if (isHidden) {
      await this.loadCommentsForPost(postId);
      const input = document.getElementById(`comment-input-${postId}`);
      if (input) input.focus();
    }
  },

  async loadCommentsForPost(postId) {
    const listElem = document.getElementById(`comments-list-${postId}`);
    if (!listElem) return;

    try {
      const comments = await API.getComments(postId);
      if (!comments || comments.length === 0) {
        listElem.innerHTML = `<div style="font-size: 13px; color: var(--text-muted); padding: 6px 0;">No comments yet. Start the conversation!</div>`;
        return;
      }

      listElem.innerHTML = comments.map(c =>
        window.PulseComponents.renderCommentItem(c, this.currentUser ? this.currentUser.id : null)
      ).join('');
    } catch (err) {
      listElem.innerHTML = `<div style="font-size: 13px; color: var(--danger);">Failed to load comments</div>`;
    }
  },

  async handleAddComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input ? input.value.trim() : '';
    if (!content) return;

    try {
      const newComment = await API.createComment(postId, content);
      if (input) input.value = '';

      // Update comment counter in post card
      const countElem = document.getElementById(`comment-count-${postId}`);
      if (countElem) {
        countElem.textContent = Number(countElem.textContent || 0) + 1;
      }

      // Append new comment to thread
      const listElem = document.getElementById(`comments-list-${postId}`);
      if (listElem) {
        const itemHtml = window.PulseComponents.renderCommentItem(newComment, this.currentUser.id);
        if (listElem.innerHTML.includes('No comments yet')) {
          listElem.innerHTML = itemHtml;
        } else {
          listElem.insertAdjacentHTML('beforeend', itemHtml);
        }
      }

      this.showToast('Comment added 💬', 'success');
    } catch (err) {
      this.showToast('Could not post comment: ' + err.message, 'danger');
    }
  },

  async handleDeleteComment(commentId, postId) {
    if (!confirm('Delete this comment?')) return;

    try {
      await API.deleteComment(commentId);
      const commentElem = document.getElementById(`comment-${commentId}`);
      if (commentElem) commentElem.remove();

      // Decrement comment count
      const countElem = document.getElementById(`comment-count-${postId}`);
      if (countElem) {
        countElem.textContent = Math.max(0, Number(countElem.textContent || 1) - 1);
      }
      this.showToast('Comment deleted', 'success');
    } catch (err) {
      this.showToast('Failed to delete comment: ' + err.message, 'danger');
    }
  },

  handleSharePost(postId) {
    const url = `${window.location.origin}/#post-${postId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    this.showToast('Post link copied to clipboard! 📋', 'success');
  },

  // -------------------------------------------------------------
  // USER PROFILE VIEW
  // -------------------------------------------------------------
  async navigateToProfile(userId) {
    const targetId = userId || (this.currentUser ? this.currentUser.id : 1);
    this.viewingProfileUserId = targetId;
    this.navigateToView('profile');

    const container = document.getElementById('profile-view-container');
    if (!container) return;

    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <div class="skeleton-loading" style="height: 280px; border-radius: 24px;"></div>
      </div>
    `;

    try {
      const user = await API.getUser(targetId);
      const isCurrentUser = this.currentUser && this.currentUser.id === user.id;
      const isFollowing = user.isFollowing;

      container.innerHTML = `
        ${window.PulseComponents.renderProfileHero(user, isCurrentUser, isFollowing, this.profileSubTab)}
        <div class="feed-container" id="profile-posts-container" style="margin-top: 16px;"></div>
      `;

      await this.loadProfilePosts(targetId);
    } catch (err) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon">👤</div>
          <div class="empty-state-title">User not found</div>
          <div class="empty-state-desc">${escapeHtml(err.message)}</div>
          <button class="btn-primary" onclick="PulseApp.navigateToView('home')">Return Home</button>
        </div>
      `;
    }
  },

  async switchProfileSubTab(subTab) {
    this.profileSubTab = subTab;
    if (this.viewingProfileUserId) {
      await this.navigateToProfile(this.viewingProfileUserId);
    }
  },

  async loadProfilePosts(userId) {
    const container = document.getElementById('profile-posts-container');
    if (!container) return;

    try {
      const allPosts = await API.getPosts('all');

      let filtered;
      if (this.profileSubTab === 'liked') {
        filtered = allPosts.filter(p => p.isLiked);
      } else if (this.profileSubTab === 'network') {
        // Show network follower cards
        const user = await API.getUser(userId);
        container.innerHTML = `
          <div class="widget-card">
            <h3 class="widget-title">Professional Network</h3>
            <p style="font-size: 13px; color: var(--text-muted);">Showing network activity for @${escapeHtml(user.username)}</p>
          </div>
        `;
        return;
      } else {
        // User's own posts
        filtered = allPosts.filter(p => p.user_id === userId || (p.author && p.author.id === userId));
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">📝</div>
            <div class="empty-state-title">No posts to show</div>
            <div class="empty-state-desc">This section does not have any posts yet.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(post =>
        window.PulseComponents.renderPostCard(post, this.currentUser ? this.currentUser.id : null)
      ).join('');
    } catch (err) {
      container.innerHTML = `<div style="color: var(--danger); padding: 20px;">Could not load profile posts</div>`;
    }
  },

  // -------------------------------------------------------------
  // EDIT PROFILE MODAL
  // -------------------------------------------------------------
  openEditProfileModal() {
    if (!this.currentUser) return;
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    document.getElementById('edit-name').value = this.currentUser.name || '';
    document.getElementById('edit-bio').value = this.currentUser.bio || '';
    document.getElementById('edit-role').value = this.currentUser.role || '';
    document.getElementById('edit-company').value = this.currentUser.company || '';
    document.getElementById('edit-location').value = this.currentUser.location || '';
    document.getElementById('edit-website').value = this.currentUser.website || '';
    document.getElementById('edit-avatar').value = this.currentUser.avatar_url || '';
    document.getElementById('edit-banner').value = this.currentUser.banner_url || '';

    modal.style.display = 'flex';
  },

  closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.style.display = 'none';
  },

  async handleSaveProfile() {
    if (!this.currentUser) return;

    const updates = {
      name: document.getElementById('edit-name').value.trim(),
      bio: document.getElementById('edit-bio').value.trim(),
      role: document.getElementById('edit-role').value.trim(),
      company: document.getElementById('edit-company').value.trim(),
      location: document.getElementById('edit-location').value.trim(),
      website: document.getElementById('edit-website').value.trim(),
      avatar_url: document.getElementById('edit-avatar').value.trim(),
      banner_url: document.getElementById('edit-banner').value.trim()
    };

    if (!updates.name) {
      this.showToast('Name cannot be empty', 'warning');
      return;
    }

    try {
      this.currentUser = await API.updateProfile(this.currentUser.id, updates);
      this.closeEditProfileModal();
      this.updateCurrentUserUI();
      this.renderSwitchUserWidget();

      this.showToast('Profile updated successfully! ✨', 'success');

      if (this.currentView === 'profile' && this.viewingProfileUserId === this.currentUser.id) {
        await this.navigateToProfile(this.currentUser.id);
      }
    } catch (err) {
      this.showToast('Failed to update profile: ' + err.message, 'danger');
    }
  },

  // -------------------------------------------------------------
  // VIEW NAVIGATION & SEARCH
  // -------------------------------------------------------------
  navigateToView(viewName) {
    this.currentView = viewName;

    // Toggle view containers
    const homeView = document.getElementById('home-view');
    const profileView = document.getElementById('profile-view');
    const exploreView = document.getElementById('explore-view');

    if (homeView) homeView.style.display = viewName === 'home' ? 'flex' : 'none';
    if (profileView) profileView.style.display = viewName === 'profile' ? 'flex' : 'none';
    if (exploreView) exploreView.style.display = viewName === 'explore' ? 'flex' : 'none';

    // Update active state in sidebar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  async handleSearch(query) {
    const q = query.trim();
    if (!q) {
      if (this.currentView === 'explore') {
        this.navigateToView('home');
      }
      return;
    }

    this.navigateToView('explore');
    const resultsContainer = document.getElementById('explore-results-stream');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px;">Searching for "${escapeHtml(q)}"...</div>`;

    try {
      const results = await API.search(q);
      const { users, posts } = results;

      let html = `<div style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Search results for "${escapeHtml(q)}"</div>`;

      // Users matches
      if (users && users.length > 0) {
        html += `
          <div class="widget-card" style="margin-bottom: 16px;">
            <h4 class="widget-title">People (${users.length})</h4>
            <div class="suggested-users-list">
              ${users.map(u => window.PulseComponents.renderSuggestedUserRow(u)).join('')}
            </div>
          </div>
        `;
      }

      // Posts matches
      if (posts && posts.length > 0) {
        html += `
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 12px;">Posts (${posts.length})</h4>
          <div class="feed-container">
            ${posts.map(p => window.PulseComponents.renderPostCard(p, this.currentUser ? this.currentUser.id : null)).join('')}
          </div>
        `;
      }

      if ((!users || users.length === 0) && (!posts || posts.length === 0)) {
        html += `
          <div class="empty-state-box">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">No results found</div>
            <div class="empty-state-desc">Try searching for keywords like "pipeline", "AI", or usernames.</div>
          </div>
        `;
      }

      resultsContainer.innerHTML = html;
    } catch (err) {
      resultsContainer.innerHTML = `<div style="color: var(--danger); padding: 20px;">Search failed: ${escapeHtml(err.message)}</div>`;
    }
  },

  // -------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // -------------------------------------------------------------
  // LIGHTBOX MODAL
  // -------------------------------------------------------------
  openImageModal(imageUrl) {
    const modal = document.getElementById('image-lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (modal && img) {
      img.src = imageUrl;
      modal.style.display = 'flex';
    }
  },

  closeImageModal() {
    const modal = document.getElementById('image-lightbox-modal');
    if (modal) modal.style.display = 'none';
  }
};

// Expose to window
window.PulseApp = PulseApp;

// Auto-run on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  PulseApp.init();
});
