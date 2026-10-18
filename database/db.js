const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// Initial default schema & seed data
const initialData = {
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
      created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      id: 2,
      user_id: 2,
      content: "Exciting day at DeepNeural! We just benchmarked our new sparse attention mechanism on real-world conversational data. Latency dropped to sub-50ms with zero degradation in reasoning score 🧠🔥 What's everyone building this week?",
      image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80",
      tag: "#ArtificialIntelligence",
      created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    },
    {
      id: 3,
      user_id: 3,
      content: "Dark mode vs light mode contrast ratios in design systems: always ensure you test with ambient room lighting! Finished our internship UI guidelines with 4.5:1 minimum contrast across all interactive states ✨ Check out the preview:",
      image_url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&auto=format&fit=crop&q=80",
      tag: "#DesignSystem",
      created_at: new Date(Date.now() - 3600000 * 20).toISOString() // 20 hours ago
    },
    {
      id: 4,
      user_id: 4,
      content: "First week deploying microservices to our staging cluster using ArgoCD and Helm charts. Infrastructure as Code makes reproducing environments an absolute breeze! 🛠️",
      image_url: null,
      tag: "#DevOps",
      created_at: new Date(Date.now() - 3600000 * 30).toISOString() // 30 hours ago
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
    { id: 1, follower_id: 2, following_id: 1, created_at: "2026-02-01T12:00:00.000Z" }, // Sarah follows Alex
    { id: 2, follower_id: 3, following_id: 1, created_at: "2026-02-02T12:00:00.000Z" }, // Marcus follows Alex
    { id: 3, follower_id: 4, following_id: 1, created_at: "2026-02-03T12:00:00.000Z" }, // Elena follows Alex
    { id: 4, follower_id: 1, following_id: 2, created_at: "2026-02-01T12:30:00.000Z" }, // Alex follows Sarah
    { id: 5, follower_id: 3, following_id: 2, created_at: "2026-02-04T12:00:00.000Z" }, // Marcus follows Sarah
    { id: 6, follower_id: 1, following_id: 3, created_at: "2026-02-05T12:00:00.000Z" }, // Alex follows Marcus
    { id: 7, follower_id: 4, following_id: 3, created_at: "2026-02-06T12:00:00.000Z" }, // Elena follows Marcus
    { id: 8, follower_id: 1, following_id: 4, created_at: "2026-02-07T12:00:00.000Z" }  // Alex follows Elena
  ]
};

// Ensure database file exists
function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, using initial data:', err);
    return initialData;
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

// Relational DB Operations
const db = {
  // Users
  getUsers() {
    const data = loadDb();
    return data.users;
  },
  getUserById(id) {
    const data = loadDb();
    const userId = Number(id);
    const user = data.users.find(u => u.id === userId);
    if (!user) return null;

    // Calculate dynamic stats
    const followers = data.followers.filter(f => f.following_id === userId);
    const following = data.followers.filter(f => f.follower_id === userId);
    const userPosts = data.posts.filter(p => p.user_id === userId);
    const totalLikes = data.likes.filter(l => {
      const post = data.posts.find(p => p.id === l.post_id);
      return post && post.user_id === userId;
    }).length;

    return {
      ...user,
      stats: {
        postsCount: userPosts.length,
        followersCount: followers.length,
        followingCount: following.length,
        totalLikesReceived: totalLikes
      }
    };
  },
  getUserByUsername(username) {
    const data = loadDb();
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    return user ? this.getUserById(user.id) : null;
  },
  updateUser(id, updates) {
    const data = loadDb();
    const userId = Number(id);
    const index = data.users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    const allowed = ['name', 'bio', 'role', 'company', 'location', 'website', 'avatar_url', 'banner_url'];
    allowed.forEach(field => {
      if (updates[field] !== undefined) {
        data.users[index][field] = updates[field];
      }
    });

    saveDb(data);
    return this.getUserById(userId);
  },

  // Posts
  getPosts({ currentUserId = null, filter = 'all', tag = null } = {}) {
    const data = loadDb();
    let posts = [...data.posts];

    if (tag) {
      posts = posts.filter(p => p.tag && p.tag.toLowerCase() === tag.toLowerCase());
    }

    if (filter === 'following' && currentUserId) {
      const followingIds = data.followers
        .filter(f => f.follower_id === Number(currentUserId))
        .map(f => f.following_id);
      // Include following users and own posts
      posts = posts.filter(p => followingIds.includes(p.user_id) || p.user_id === Number(currentUserId));
    }

    // Enrich posts with author, likes, comments count, and isLikedByCurrentUser
    const enriched = posts.map(post => {
      const author = data.users.find(u => u.id === post.user_id) || {
        id: post.user_id,
        name: 'Unknown User',
        username: 'unknown',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      };

      const postLikes = data.likes.filter(l => l.post_id === post.id);
      const postComments = data.comments.filter(c => c.post_id === post.id);
      const isLiked = currentUserId ? postLikes.some(l => l.user_id === Number(currentUserId)) : false;

      return {
        ...post,
        author: {
          id: author.id,
          name: author.name,
          username: author.username,
          role: author.role,
          company: author.company,
          avatar_url: author.avatar_url
        },
        likesCount: postLikes.length,
        commentsCount: postComments.length,
        isLiked
      };
    });

    if (filter === 'trending') {
      // Sort by likesCount + commentsCount descending
      enriched.sort((a, b) => (b.likesCount * 2 + b.commentsCount) - (a.likesCount * 2 + a.commentsCount));
    } else {
      // Sort by created_at descending (latest first)
      enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return enriched;
  },

  getPostById(postId, currentUserId = null) {
    const data = loadDb();
    const id = Number(postId);
    const post = data.posts.find(p => p.id === id);
    if (!post) return null;

    const author = data.users.find(u => u.id === post.user_id);
    const postLikes = data.likes.filter(l => l.post_id === id);
    const postComments = data.comments.filter(c => c.post_id === id);
    const isLiked = currentUserId ? postLikes.some(l => l.user_id === Number(currentUserId)) : false;

    return {
      ...post,
      author,
      likesCount: postLikes.length,
      commentsCount: postComments.length,
      isLiked
    };
  },

  createPost({ user_id, content, image_url = null, tag = null }) {
    const data = loadDb();
    const newId = data.posts.length > 0 ? Math.max(...data.posts.map(p => p.id)) + 1 : 1;
    const newPost = {
      id: newId,
      user_id: Number(user_id),
      content,
      image_url: image_url || null,
      tag: tag || null,
      created_at: new Date().toISOString()
    };

    data.posts.unshift(newPost);
    saveDb(data);
    return this.getPostById(newId, user_id);
  },

  deletePost(postId, userId) {
    const data = loadDb();
    const id = Number(postId);
    const postIndex = data.posts.findIndex(p => p.id === id);
    if (postIndex === -1) return false;

    // Verify ownership
    if (data.posts[postIndex].user_id !== Number(userId)) {
      throw new Error("Unauthorized to delete this post");
    }

    // Cascade delete likes and comments
    data.posts.splice(postIndex, 1);
    data.likes = data.likes.filter(l => l.post_id !== id);
    data.comments = data.comments.filter(c => c.post_id !== id);

    saveDb(data);
    return true;
  },

  // Likes System
  toggleLike(postId, userId) {
    const data = loadDb();
    const pId = Number(postId);
    const uId = Number(userId);

    const existingIndex = data.likes.findIndex(l => l.post_id === pId && l.user_id === uId);
    let liked = false;

    if (existingIndex !== -1) {
      // Unlike
      data.likes.splice(existingIndex, 1);
      liked = false;
    } else {
      // Like
      const newId = data.likes.length > 0 ? Math.max(...data.likes.map(l => l.id)) + 1 : 1;
      data.likes.push({
        id: newId,
        post_id: pId,
        user_id: uId,
        created_at: new Date().toISOString()
      });
      liked = true;
    }

    saveDb(data);
    const likesCount = data.likes.filter(l => l.post_id === pId).length;
    return { liked, likesCount };
  },

  // Comments System
  getComments(postId) {
    const data = loadDb();
    const pId = Number(postId);
    const comments = data.comments.filter(c => c.post_id === pId);

    // Enrich with author info
    return comments.map(c => {
      const author = data.users.find(u => u.id === c.user_id) || {
        name: 'User',
        username: 'user',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      };
      return {
        ...c,
        author: {
          id: author.id,
          name: author.name,
          username: author.username,
          avatar_url: author.avatar_url,
          role: author.role
        }
      };
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  createComment({ post_id, user_id, content }) {
    const data = loadDb();
    const newId = data.comments.length > 0 ? Math.max(...data.comments.map(c => c.id)) + 1 : 1;
    const comment = {
      id: newId,
      post_id: Number(post_id),
      user_id: Number(user_id),
      content,
      created_at: new Date().toISOString()
    };

    data.comments.push(comment);
    saveDb(data);

    const author = data.users.find(u => u.id === comment.user_id);
    return {
      ...comment,
      author: {
        id: author.id,
        name: author.name,
        username: author.username,
        avatar_url: author.avatar_url,
        role: author.role
      }
    };
  },

  deleteComment(commentId, userId) {
    const data = loadDb();
    const cId = Number(commentId);
    const index = data.comments.findIndex(c => c.id === cId);
    if (index === -1) return false;

    if (data.comments[index].user_id !== Number(userId)) {
      throw new Error("Unauthorized to delete this comment");
    }

    data.comments.splice(index, 1);
    saveDb(data);
    return true;
  },

  // Followers System
  toggleFollow(targetUserId, currentUserId) {
    const data = loadDb();
    const targetId = Number(targetUserId);
    const currId = Number(currentUserId);

    if (targetId === currId) {
      throw new Error("You cannot follow yourself");
    }

    const existingIndex = data.followers.findIndex(f => f.follower_id === currId && f.following_id === targetId);
    let isFollowing = false;

    if (existingIndex !== -1) {
      // Unfollow
      data.followers.splice(existingIndex, 1);
      isFollowing = false;
    } else {
      // Follow
      const newId = data.followers.length > 0 ? Math.max(...data.followers.map(f => f.id)) + 1 : 1;
      data.followers.push({
        id: newId,
        follower_id: currId,
        following_id: targetId,
        created_at: new Date().toISOString()
      });
      isFollowing = true;
    }

    saveDb(data);

    const followersCount = data.followers.filter(f => f.following_id === targetId).length;
    const followingCount = data.followers.filter(f => f.follower_id === currId).length;

    return { isFollowing, followersCount, followingCount };
  },

  isFollowing(targetUserId, currentUserId) {
    const data = loadDb();
    return data.followers.some(f => f.follower_id === Number(currentUserId) && f.following_id === Number(targetUserId));
  },

  getUserFollowers(userId) {
    const data = loadDb();
    const uId = Number(userId);
    const followerIds = data.followers.filter(f => f.following_id === uId).map(f => f.follower_id);
    return data.users.filter(u => followerIds.includes(u.id));
  },

  getUserFollowing(userId) {
    const data = loadDb();
    const uId = Number(userId);
    const followingIds = data.followers.filter(f => f.follower_id === uId).map(f => f.following_id);
    return data.users.filter(u => followingIds.includes(u.id));
  },

  // Search & Suggestions
  search(query) {
    const data = loadDb();
    const q = query.toLowerCase().trim();
    if (!q) return { users: [], posts: [] };

    const users = data.users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q)
    );

    const posts = this.getPosts().filter(p =>
      p.content.toLowerCase().includes(q) ||
      (p.tag && p.tag.toLowerCase().includes(q))
    );

    return { users, posts };
  },

  getSuggestedUsers(currentUserId, limit = 4) {
    const data = loadDb();
    const currId = Number(currentUserId);
    const followingIds = data.followers.filter(f => f.follower_id === currId).map(f => f.following_id);

    return data.users
      .filter(u => u.id !== currId && !followingIds.includes(u.id))
      .slice(0, limit)
      .map(u => ({
        ...u,
        followersCount: data.followers.filter(f => f.following_id === u.id).length
      }));
  },

  // Reset to initial seed
  resetDb() {
    saveDb(initialData);
    return initialData;
  }
};

module.exports = db;
