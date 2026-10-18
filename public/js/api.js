/**
 * PulseNet API Client
 * Seamlessly interfaces with Express.js REST API with automatic LocalStorage fallback
 * for zero-friction evaluation and offline testing.
 */

// Initial Seed Dataset for LocalStorage fallback
const FALLBACK_SEED = {
  activeUserId: 1,
  users: [
    {
      id: 1,
      username: "alex_dev",
      name: "Alex Rivera",
      role: "Full-Stack Intern",
      company: "FinTech Innovations",
      bio: "Crafting reactive web apps & microservices. Currently exploring distributed systems and design tokens. Coffee lover & open-source contributor ☕✨",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      banner_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      location: "San Francisco, CA",
      website: "https://alexrivera.dev",
      created_at: "2026-01-15T09:00:00.000Z"
    },
    {
      id: 2,
      username: "sarah_ai",
      name: "Dr. Sarah Chen",
      role: "AI & ML Intern",
      company: "DeepNeural Labs",
      bio: "Working on multimodal embeddings and agentic workflows. Exploring LLM evaluation frameworks. Building the next generation of intelligent tools 🤖📊",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      banner_url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
      location: "Seattle, WA",
      website: "https://sarahchen.ai",
      created_at: "2026-01-20T10:30:00.000Z"
    },
    {
      id: 3,
      username: "marcus_ux",
      name: "Marcus Vance",
      role: "Product Design Intern",
      company: "Starlight Studio",
      bio: "Obsessed with micro-interactions, Figma design systems, accessibility & dark mode aesthetics. Pixel-perfect or nothing 🎨📐",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      banner_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80",
      location: "New York, NY",
      website: "https://marcusvance.design",
      created_at: "2026-02-01T14:15:00.000Z"
    },
    {
      id: 4,
      username: "elena_cloud",
      name: "Elena Rostova",
      role: "DevOps & Cloud Intern",
      company: "Kubernetes Edge",
      bio: "Automating cloud infrastructure, CI/CD pipelines & container orchestration. Terraform & Rust enthusiast ☁️⚡",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      banner_url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
      location: "Austin, TX",
      website: "https://elenacloud.tech",
      created_at: "2026-02-10T11:00:00.000Z"
    }
  ],
  posts: [
    {
      id: 1,
      user_id: 1,
      content: "🚀 Just finished setting up our team's end-to-end testing pipeline for our internship project! Reduced test execution time by 42% using parallel workers. Here is a snapshot of our architecture flow!",
      image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80",
      tag: "#Engineering",
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 2,
      user_id: 2,
      content: "Exciting day at DeepNeural! We just benchmarked our new sparse attention mechanism on real-world conversational data. Latency dropped to sub-50ms with zero degradation in reasoning score 🧠🔥 What's everyone building this week?",
      image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80",
      tag: "#ArtificialIntelligence",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 3,
      user_id: 3,
      content: "Dark mode vs light mode contrast ratios in design systems: always ensure you test with ambient room lighting! Finished our internship UI guidelines with 4.5:1 minimum contrast across all interactive states ✨ Check out the preview:",
      image_url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&auto=format&fit=crop&q=80",
      tag: "#DesignSystem",
      created_at: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: 4,
      user_id: 4,
      content: "First week deploying microservices to our staging cluster using ArgoCD and Helm charts. Infrastructure as Code makes reproducing environments an absolute breeze! 🛠️",
      image_url: null,
      tag: "#DevOps",
      created_at: new Date(Date.now() - 3600000 * 30).toISOString()
    }
  ],
  comments: [
    {
      id: 1,
      post_id: 1,
      user_id: 2,
      content: "Huge speedup Alex! Are you using Jest or Vitest for the parallel runners?",
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
    },
    {
      id: 2,
      post_id: 1,
      user_id: 1,
      content: "Thanks Sarah! We transitioned over to Vitest with native ES modules support. It cut startup time dramatically.",
      created_at: new Date(Date.now() - 3600000 * 1.2).toISOString()
    },
    {
      id: 3,
      post_id: 2,
      user_id: 3,
      content: "Sub-50ms is incredible for generative feedback loops! Can't wait to see this integrated into the product prototype.",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 4,
      post_id: 3,
      user_id: 1,
      content: "Love this attention to accessibility Marcus! Bookmarking this for our front-end component library.",
      created_at: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ],
  likes: [
    { id: 1, post_id: 1, user_id: 2, created_at: "2026-10-04T09:30:00.000Z" },
    { id: 2, post_id: 1, user_id: 3, created_at: "2026-10-04T09:35:00.000Z" },
    { id: 3, post_id: 1, user_id: 4, created_at: "2026-10-04T09:40:00.000Z" },
    { id: 4, post_id: 2, user_id: 1, created_at: "2026-10-04T07:15:00.000Z" },
    { id: 5, post_id: 2, user_id: 3, created_at: "2026-10-04T07:20:00.000Z" },
    { id: 6, post_id: 3, user_id: 1, created_at: "2026-10-03T18:00:00.000Z" },
    { id: 7, post_id: 3, user_id: 4, created_at: "2026-10-03T18:05:00.000Z" },
    { id: 8, post_id: 4, user_id: 1, created_at: "2026-10-03T10:00:00.000Z" }
  ],
  followers: [
    { id: 1, follower_id: 2, following_id: 1, created_at: "2026-02-01T12:00:00.000Z" },
    { id: 2, follower_id: 3, following_id: 1, created_at: "2026-02-02T12:00:00.000Z" },
    { id: 3, follower_id: 4, following_id: 1, created_at: "2026-02-03T12:00:00.000Z" },
    { id: 4, follower_id: 1, following_id: 2, created_at: "2026-02-01T12:30:00.000Z" },
    { id: 5, follower_id: 3, following_id: 2, created_at: "2026-02-04T12:00:00.000Z" },
    { id: 6, follower_id: 1, following_id: 3, created_at: "2026-02-05T12:00:00.000Z" },
    { id: 7, follower_id: 4, following_id: 3, created_at: "2026-02-06T12:00:00.000Z" },
    { id: 8, follower_id: 1, following_id: 4, created_at: "2026-02-07T12:00:00.000Z" }
  ]
};

// LocalStorage Persistence Helper
function getLocalDb() {
  const stored = localStorage.getItem('pulsenet_db');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("Resetting corrupt local db", e);
    }
  }
  localStorage.setItem('pulsenet_db', JSON.stringify(FALLBACK_SEED));
  return FALLBACK_SEED;
}

function saveLocalDb(data) {
  localStorage.setItem('pulsenet_db', JSON.stringify(data));
}

// Active User ID stored locally for header simulation
function getActiveUserId() {
  const uid = localStorage.getItem('pulsenet_active_user_id');
  return uid ? Number(uid) : 1;
}

function setActiveUserId(id) {
  localStorage.setItem('pulsenet_active_user_id', String(id));
}

// API Module
const API = {
  baseUrl: '/api',
  useBackend: true, // Auto-detected on first request

  async request(endpoint, options = {}) {
    const currentUserId = getActiveUserId();
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': String(currentUserId),
      ...options.headers
    };

    if (this.useBackend) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers
        });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP error ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        // If network failed (e.g. server not running or file:// opened directly), fallback to local storage!
        console.warn(`[PulseNet] Express server unavailable (${err.message}). Using client-side storage mode.`);
        this.useBackend = false;
        return this.localFallback(endpoint, options, currentUserId);
      }
    } else {
      return this.localFallback(endpoint, options, currentUserId);
    }
  },

  // -------------------------------------------------------------
  // CLIENT-SIDE LOCAL STORAGE FALLBACK IMPLEMENTATION
  // -------------------------------------------------------------
  localFallback(endpoint, options = {}, currentUserId) {
    const db = getLocalDb();
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body) : {};

    // 1. Current user
    if (endpoint === '/users/current' && method === 'GET') {
      const user = db.users.find(u => u.id === currentUserId) || db.users[0];
      const stats = this._computeUserStats(db, user.id);
      return { success: true, data: { ...user, stats } };
    }

    // 2. Switch user
    if (endpoint.startsWith('/users/switch/') && method === 'POST') {
      const targetId = Number(endpoint.split('/').pop());
      const user = db.users.find(u => u.id === targetId);
      if (user) {
        setActiveUserId(targetId);
        return { success: true, data: user };
      }
    }

    // 3. Get all users
    if (endpoint === '/users' && method === 'GET') {
      return { success: true, data: db.users };
    }

    // 4. Suggested users
    if (endpoint === '/users/suggested' && method === 'GET') {
      const followingIds = db.followers
        .filter(f => f.follower_id === currentUserId)
        .map(f => f.following_id);
      const suggested = db.users
        .filter(u => u.id !== currentUserId && !followingIds.includes(u.id))
        .map(u => ({
          ...u,
          followersCount: db.followers.filter(f => f.following_id === u.id).length
        }));
      return { success: true, data: suggested };
    }

    // 5. Specific user profile /users/:id
    if (endpoint.startsWith('/users/') && !endpoint.includes('/follow') && !endpoint.includes('/followers') && !endpoint.includes('/following') && method === 'GET') {
      const idOrUsername = endpoint.split('/')[2];
      let user;
      if (!isNaN(Number(idOrUsername))) {
        user = db.users.find(u => u.id === Number(idOrUsername));
      } else {
        user = db.users.find(u => u.username.toLowerCase() === idOrUsername.toLowerCase());
      }
      if (!user) return { success: false, message: 'User not found' };

      const stats = this._computeUserStats(db, user.id);
      const isFollowing = db.followers.some(f => f.follower_id === currentUserId && f.following_id === user.id);
      return { success: true, data: { ...user, stats, isFollowing } };
    }

    // 6. Update user profile
    if (endpoint.startsWith('/users/') && method === 'PUT') {
      const userId = Number(endpoint.split('/')[2]);
      const idx = db.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        Object.assign(db.users[idx], body);
        saveLocalDb(db);
        const stats = this._computeUserStats(db, userId);
        return { success: true, data: { ...db.users[idx], stats } };
      }
    }

    // 7. Toggle follow
    if (endpoint.includes('/follow') && method === 'POST') {
      const targetUserId = Number(endpoint.split('/')[2]);
      const existingIdx = db.followers.findIndex(f => f.follower_id === currentUserId && f.following_id === targetUserId);
      let isFollowing = false;

      if (existingIdx !== -1) {
        db.followers.splice(existingIdx, 1);
        isFollowing = false;
      } else {
        db.followers.push({
          id: Date.now(),
          follower_id: currentUserId,
          following_id: targetUserId,
          created_at: new Date().toISOString()
        });
        isFollowing = true;
      }
      saveLocalDb(db);
      const followersCount = db.followers.filter(f => f.following_id === targetUserId).length;
      return { success: true, data: { isFollowing, followersCount } };
    }

    // 8. Posts feed
    if (endpoint.startsWith('/posts') && method === 'GET') {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const filter = urlParams.get('filter') || 'all';
      const tag = urlParams.get('tag');

      let posts = [...db.posts];
      if (tag) {
        posts = posts.filter(p => p.tag && p.tag.toLowerCase() === tag.toLowerCase());
      }
      if (filter === 'following') {
        const followingIds = db.followers.filter(f => f.follower_id === currentUserId).map(f => f.following_id);
        posts = posts.filter(p => followingIds.includes(p.user_id) || p.user_id === currentUserId);
      }

      const enriched = posts.map(post => {
        const author = db.users.find(u => u.id === post.user_id);
        const likes = db.likes.filter(l => l.post_id === post.id);
        const comments = db.comments.filter(c => c.post_id === post.id);
        const isLiked = likes.some(l => l.user_id === currentUserId);

        return {
          ...post,
          author,
          likesCount: likes.length,
          commentsCount: comments.length,
          isLiked
        };
      });

      if (filter === 'trending') {
        enriched.sort((a, b) => (b.likesCount * 2 + b.commentsCount) - (a.likesCount * 2 + a.commentsCount));
      } else {
        enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      return { success: true, data: enriched };
    }

    // 9. Create Post
    if (endpoint === '/posts' && method === 'POST') {
      const newPost = {
        id: Date.now(),
        user_id: currentUserId,
        content: body.content,
        image_url: body.image_url || null,
        tag: body.tag || null,
        created_at: new Date().toISOString()
      };
      db.posts.unshift(newPost);
      saveLocalDb(db);

      const author = db.users.find(u => u.id === currentUserId);
      return {
        success: true,
        data: { ...newPost, author, likesCount: 0, commentsCount: 0, isLiked: false }
      };
    }

    // 10. Delete Post
    if (endpoint.startsWith('/posts/') && method === 'DELETE') {
      const postId = Number(endpoint.split('/')[2]);
      db.posts = db.posts.filter(p => p.id !== postId);
      db.likes = db.likes.filter(l => l.post_id !== postId);
      db.comments = db.comments.filter(c => c.post_id !== postId);
      saveLocalDb(db);
      return { success: true };
    }

    // 11. Toggle Like
    if (endpoint.endsWith('/like') && method === 'POST') {
      const postId = Number(endpoint.split('/')[2]);
      const idx = db.likes.findIndex(l => l.post_id === postId && l.user_id === currentUserId);
      let liked = false;

      if (idx !== -1) {
        db.likes.splice(idx, 1);
        liked = false;
      } else {
        db.likes.push({
          id: Date.now(),
          post_id: postId,
          user_id: currentUserId,
          created_at: new Date().toISOString()
        });
        liked = true;
      }
      saveLocalDb(db);
      const likesCount = db.likes.filter(l => l.post_id === postId).length;
      return { success: true, data: { liked, likesCount } };
    }

    // 12. Comments
    if (endpoint.includes('/comments') && method === 'GET') {
      const postId = Number(endpoint.split('/')[2]);
      const comments = db.comments.filter(c => c.post_id === postId).map(c => ({
        ...c,
        author: db.users.find(u => u.id === c.user_id)
      }));
      return { success: true, data: comments };
    }

    if (endpoint.includes('/comments') && method === 'POST') {
      const postId = Number(endpoint.split('/')[2]);
      const newComment = {
        id: Date.now(),
        post_id: postId,
        user_id: currentUserId,
        content: body.content,
        created_at: new Date().toISOString()
      };
      db.comments.push(newComment);
      saveLocalDb(db);
      return {
        success: true,
        data: {
          ...newComment,
          author: db.users.find(u => u.id === currentUserId)
        }
      };
    }

    if (endpoint.startsWith('/comments/') && method === 'DELETE') {
      const cId = Number(endpoint.split('/')[2]);
      db.comments = db.comments.filter(c => c.id !== cId);
      saveLocalDb(db);
      return { success: true };
    }

    // 13. Search
    if (endpoint.startsWith('/search')) {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const q = (urlParams.get('q') || '').toLowerCase().trim();
      if (!q) return { success: true, data: { users: [], posts: [] } };

      const users = db.users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
      const posts = db.posts.filter(p =>
        p.content.toLowerCase().includes(q) ||
        (p.tag && p.tag.toLowerCase().includes(q))
      );
      return { success: true, data: { users, posts } };
    }

    return { success: true, message: 'Simulated OK' };
  },

  _computeUserStats(db, userId) {
    const followers = db.followers.filter(f => f.following_id === userId);
    const following = db.followers.filter(f => f.follower_id === userId);
    const userPosts = db.posts.filter(p => p.user_id === userId);
    const totalLikes = db.likes.filter(l => {
      const p = db.posts.find(post => post.id === l.post_id);
      return p && p.user_id === userId;
    }).length;

    return {
      postsCount: userPosts.length,
      followersCount: followers.length,
      followingCount: following.length,
      totalLikesReceived: totalLikes
    };
  },

  // -------------------------------------------------------------
  // PUBLIC CONVENIENCE METHODS
  // -------------------------------------------------------------
  async getCurrentUser() {
    const res = await this.request('/users/current');
    return res.data;
  },

  async getAllUsers() {
    const res = await this.request('/users');
    return res.data;
  },

  async switchActiveUser(userId) {
    setActiveUserId(userId);
    const res = await this.request(`/users/switch/${userId}`, { method: 'POST' });
    return res.data;
  },

  async getUser(idOrUsername) {
    const res = await this.request(`/users/${idOrUsername}`);
    return res.data;
  },

  async updateProfile(userId, profileData) {
    const res = await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return res.data;
  },

  async toggleFollow(targetUserId) {
    const res = await this.request(`/users/${targetUserId}/follow`, { method: 'POST' });
    return res.data;
  },

  async getSuggestedUsers() {
    const res = await this.request('/users/suggested');
    return res.data;
  },

  async getPosts(filter = 'all', tag = null) {
    let endpoint = `/posts?filter=${filter}`;
    if (tag) endpoint += `&tag=${encodeURIComponent(tag)}`;
    const res = await this.request(endpoint);
    return res.data;
  },

  async createPost(postData) {
    const res = await this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
    return res.data;
  },

  async deletePost(postId) {
    const res = await this.request(`/posts/${postId}`, { method: 'DELETE' });
    return res.success;
  },

  async toggleLike(postId) {
    const res = await this.request(`/posts/${postId}/like`, { method: 'POST' });
    return res.data;
  },

  async getComments(postId) {
    const res = await this.request(`/posts/${postId}/comments`);
    return res.data;
  },

  async createComment(postId, content) {
    const res = await this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return res.data;
  },

  async deleteComment(commentId) {
    const res = await this.request(`/comments/${commentId}`, { method: 'DELETE' });
    return res.success;
  },

  async search(query) {
    const res = await this.request(`/search?q=${encodeURIComponent(query)}`);
    return res.data;
  }
};
