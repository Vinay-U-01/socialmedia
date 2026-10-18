/**
 * PulseNet UI Components
 * Modular DOM rendering functions for Posts, Comments, Profiles, and Widgets.
 */

// Helper to format relative time ("just now", "5m ago", "2h ago", "3d ago")
function formatTimeAgo(isoDate) {
  if (!isoDate) return 'just now';
  const now = new Date();
  const past = new Date(isoDate);
  const diffInSec = Math.max(1, Math.floor((now - past) / 1000));

  if (diffInSec < 60) return `${diffInSec}s ago`;
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return past.toLocaleDateString();
}

// Escape HTML for security
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format post text with clickable hashtags
function formatPostContent(text) {
  const safe = escapeHtml(text);
  // Highlight hashtags
  return safe.replace(/#([\w\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/g, '<span class="post-tag-badge" onclick="window.PulseApp.filterByTag(\'#$1\')">#$1</span>');
}

// -------------------------------------------------------------
// POST CARD COMPONENT
// -------------------------------------------------------------
function renderPostCard(post, currentUserId) {
  const isOwner = post.user_id === currentUserId || (post.author && post.author.id === currentUserId);
  const author = post.author || {
    id: post.user_id,
    name: 'Anonymous',
    username: 'user',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: 'Member'
  };

  const imageHtml = post.image_url ? `
    <div class="post-image-container" onclick="window.PulseApp.openImageModal('${escapeHtml(post.image_url)}')">
      <img src="${escapeHtml(post.image_url)}" alt="Post attachment" loading="lazy" onerror="this.parentElement.style.display='none'" />
    </div>
  ` : '';

  const deleteBtnHtml = isOwner ? `
    <button class="post-menu-btn" title="Delete post" onclick="window.PulseApp.handleDeletePost(${post.id})">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>
  ` : '';

  const tagHtml = post.tag ? `
    <span class="post-tag-badge" onclick="window.PulseApp.filterByTag('${escapeHtml(post.tag)}')">${escapeHtml(post.tag)}</span>
  ` : '';

  return `
    <article class="post-card animate-fade-in" id="post-${post.id}" data-post-id="${post.id}">
      <!-- Post Header -->
      <div class="post-header">
        <div class="post-author-link" onclick="window.PulseApp.navigateToProfile(${author.id})">
          <img class="post-author-avatar" src="${escapeHtml(author.avatar_url)}" alt="${escapeHtml(author.name)}" />
          <div class="post-author-details">
            <div class="author-name-row">
              <span class="author-display-name">${escapeHtml(author.name)}</span>
              ${author.role ? `<span class="author-role-badge">${escapeHtml(author.role)}</span>` : ''}
            </div>
            <div class="author-handle-row">
              <span>@${escapeHtml(author.username)}</span>
              <span class="post-time-dot">•</span>
              <span>${formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        ${deleteBtnHtml}
      </div>

      <!-- Post Body -->
      <div class="post-text-content">
        ${formatPostContent(post.content)}
      </div>

      ${tagHtml}
      ${imageHtml}

      <!-- Action Bar -->
      <div class="post-actions-bar">
        <div class="action-btn-group">
          <!-- Like Button -->
          <button class="action-btn btn-like ${post.isLiked ? 'liked' : ''}" 
                  id="like-btn-${post.id}" 
                  onclick="window.PulseApp.handleToggleLike(${post.id})">
            <svg viewBox="0 0 24 24" fill="${post.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="like-count" id="like-count-${post.id}">${post.likesCount || 0}</span>
          </button>

          <!-- Comment Toggle Button -->
          <button class="action-btn btn-comment" onclick="window.PulseApp.toggleComments(${post.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span class="comment-count" id="comment-count-${post.id}">${post.commentsCount || 0}</span>
          </button>
        </div>

        <!-- Share Button -->
        <button class="action-btn btn-share" onclick="window.PulseApp.handleSharePost(${post.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          <span>Share</span>
        </button>
      </div>

      <!-- Expandable Comments Thread (Hidden by default) -->
      <div class="comments-section" id="comments-section-${post.id}" style="display: none;">
        <!-- New Comment Input -->
        <div class="comment-input-box">
          <input type="text" 
                 id="comment-input-${post.id}" 
                 placeholder="Write a supportive comment..." 
                 onkeydown="if(event.key==='Enter') window.PulseApp.handleAddComment(${post.id})" />
          <button class="btn-submit-comment" onclick="window.PulseApp.handleAddComment(${post.id})">Reply</button>
        </div>

        <!-- Comments Container -->
        <div class="comments-list" id="comments-list-${post.id}">
          <div style="font-size: 13px; color: var(--text-muted); padding: 8px 0;">Loading comments...</div>
        </div>
      </div>
    </article>
  `;
}

// -------------------------------------------------------------
// COMMENT ITEM COMPONENT
// -------------------------------------------------------------
function renderCommentItem(comment, currentUserId) {
  const isOwner = comment.user_id === currentUserId || (comment.author && comment.author.id === currentUserId);
  const author = comment.author || {
    id: comment.user_id,
    name: 'User',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  };

  const deleteBtn = isOwner ? `
    <button class="btn-delete-comment" onclick="window.PulseApp.handleDeleteComment(${comment.id}, ${comment.post_id})">
      ✕
    </button>
  ` : '';

  return `
    <div class="comment-item animate-fade-in" id="comment-${comment.id}">
      <img class="comment-avatar" src="${escapeHtml(author.avatar_url)}" alt="${escapeHtml(author.name)}" onclick="window.PulseApp.navigateToProfile(${author.id})" style="cursor: pointer;" />
      <div class="comment-content-wrap">
        <div class="comment-header">
          <span class="comment-author-name" onclick="window.PulseApp.navigateToProfile(${author.id})" style="cursor: pointer;">${escapeHtml(author.name)}</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="comment-time">${formatTimeAgo(comment.created_at)}</span>
            ${deleteBtn}
          </div>
        </div>
        <div class="comment-text">${escapeHtml(comment.content)}</div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// PROFILE HEADER HERO COMPONENT
// -------------------------------------------------------------
function renderProfileHero(user, isCurrentUser, isFollowing, activeSubTab = 'posts') {
  const stats = user.stats || {
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    totalLikesReceived: 0
  };

  const actionButton = isCurrentUser ? `
    <button class="btn-edit-profile" onclick="window.PulseApp.openEditProfileModal()">
      ✏️ Edit Profile
    </button>
  ` : `
    <button class="btn-follow-action ${isFollowing ? 'following' : 'not-following'}" 
            id="profile-follow-btn-${user.id}"
            onclick="window.PulseApp.handleToggleFollow(${user.id})">
      ${isFollowing ? 'Following' : '+ Follow'}
    </button>
  `;

  return `
    <div class="profile-card-hero animate-scale-in">
      <!-- Profile Cover Banner -->
      <div class="profile-banner" style="background-image: url('${escapeHtml(user.banner_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200')}');">
        <div class="profile-banner-overlay"></div>
      </div>

      <div class="profile-info-body">
        <!-- Avatar Row -->
        <div class="profile-avatar-row">
          <img class="profile-avatar-lg" src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(user.name)}" />
          <div class="profile-action-buttons">
            ${actionButton}
          </div>
        </div>

        <!-- Name & Handle -->
        <div class="profile-names-meta">
          <h2 class="profile-display-name">${escapeHtml(user.name)}</h2>
          <span class="profile-handle">@${escapeHtml(user.username)}</span>
          ${user.role ? `
            <div class="profile-role-company">
              <span>💼 ${escapeHtml(user.role)}</span>
              ${user.company ? `<span>• ${escapeHtml(user.company)}</span>` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Bio -->
        <p class="profile-bio">${escapeHtml(user.bio || 'Internship developer building the future.')}</p>

        <!-- Location & Website Details -->
        <div class="profile-extra-details">
          ${user.location ? `
            <div class="detail-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${escapeHtml(user.location)}</span>
            </div>
          ` : ''}
          ${user.website ? `
            <div class="detail-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <a href="${escapeHtml(user.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(user.website.replace(/^https?:\/\//, ''))}</a>
            </div>
          ` : ''}
          <div class="detail-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Joined ${new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="profile-stats-bar">
          <div class="stat-box">
            <span class="stat-number" id="profile-stat-posts">${stats.postsCount}</span>
            <span class="stat-label">Posts</span>
          </div>
          <div class="stat-box">
            <span class="stat-number" id="profile-stat-followers">${stats.followersCount}</span>
            <span class="stat-label">Followers</span>
          </div>
          <div class="stat-box">
            <span class="stat-number" id="profile-stat-following">${stats.followingCount}</span>
            <span class="stat-label">Following</span>
          </div>
          <div class="stat-box">
            <span class="stat-number" id="profile-stat-likes">${stats.totalLikesReceived}</span>
            <span class="stat-label">Likes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sub-tabs (Posts, Liked, Following, Followers) -->
    <div class="profile-subtabs">
      <button class="profile-subtab-btn ${activeSubTab === 'posts' ? 'active' : ''}" 
              onclick="window.PulseApp.switchProfileSubTab('posts')">
        Posts (${stats.postsCount})
      </button>
      <button class="profile-subtab-btn ${activeSubTab === 'liked' ? 'active' : ''}" 
              onclick="window.PulseApp.switchProfileSubTab('liked')">
        Liked Posts
      </button>
      <button class="profile-subtab-btn ${activeSubTab === 'network' ? 'active' : ''}" 
              onclick="window.PulseApp.switchProfileSubTab('network')">
        Network (${stats.followersCount + stats.followingCount})
      </button>
    </div>
  `;
}

// -------------------------------------------------------------
// WIDGET COMPONENTS
// -------------------------------------------------------------
function renderSuggestedUserRow(user) {
  return `
    <div class="suggested-user-row animate-fade-in" id="suggested-user-${user.id}">
      <div class="suggested-user-info" onclick="window.PulseApp.navigateToProfile(${user.id})">
        <img class="suggested-avatar" src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(user.name)}" />
        <div class="suggested-names">
          <span class="suggested-name">${escapeHtml(user.name)}</span>
          <span class="suggested-handle">@${escapeHtml(user.username)}</span>
        </div>
      </div>
      <button class="btn-mini-follow" onclick="window.PulseApp.handleToggleFollow(${user.id}, true)">
        + Follow
      </button>
    </div>
  `;
}

function renderSwitchUserItem(user, isActive) {
  return `
    <div class="switch-user-item ${isActive ? 'active' : ''}" onclick="window.PulseApp.handleSwitchUser(${user.id})">
      <div class="switch-user-left">
        <img class="switch-avatar" src="${escapeHtml(user.avatar_url)}" alt="${escapeHtml(user.name)}" />
        <div style="display: flex; flex-direction: column;">
          <span class="switch-user-name">${escapeHtml(user.name)}</span>
          <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(user.role || '')}</span>
        </div>
      </div>
      ${isActive ? `<span class="switch-active-tag">Active</span>` : ''}
    </div>
  `;
}

// Export to global scope
window.PulseComponents = {
  renderPostCard,
  renderCommentItem,
  renderProfileHero,
  renderSuggestedUserRow,
  renderSwitchUserItem,
  formatTimeAgo,
  escapeHtml
};
