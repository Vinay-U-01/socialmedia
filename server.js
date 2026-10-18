const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Current logged-in active user simulation (defaults to Alex Rivera, ID 1)
let currentUserId = 1;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to extract active user ID (from header, query, or fallback)
function getActiveUserId(req) {
  const headerId = req.headers['x-user-id'];
  if (headerId && !isNaN(Number(headerId))) {
    return Number(headerId);
  }
  return currentUserId;
}

// -------------------------------------------------------------
// USER ROUTES
// -------------------------------------------------------------

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = db.getUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get current logged-in user
app.get('/api/users/current', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const user = db.getUserById(activeId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Current user not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Switch active demo user (makes testing follows/likes super easy!)
app.post('/api/users/switch/:id', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const user = db.getUserById(targetId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found to switch to' });
    }
    currentUserId = targetId;
    res.json({ success: true, message: `Switched active user to ${user.name}`, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get suggested users to follow
app.get('/api/users/suggested', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const suggested = db.getSuggestedUsers(activeId);
    res.json({ success: true, data: suggested });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get specific user by ID or Username
app.get('/api/users/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    const activeId = getActiveUserId(req);
    let user;

    if (!isNaN(Number(identifier))) {
      user = db.getUserById(identifier);
    } else {
      user = db.getUserByUsername(identifier);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = db.isFollowing(user.id, activeId);
    res.json({ success: true, data: { ...user, isFollowing } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile
app.put('/api/users/:id', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const userId = Number(req.params.id);

    if (activeId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own profile' });
    }

    const updated = db.updateUser(userId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: updated, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle follow/unfollow user
app.post('/api/users/:id/follow', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const targetUserId = Number(req.params.id);

    const result = db.toggleFollow(targetUserId, activeId);
    res.json({
      success: true,
      message: result.isFollowing ? 'Followed successfully' : 'Unfollowed successfully',
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get user followers
app.get('/api/users/:id/followers', (req, res) => {
  try {
    const followers = db.getUserFollowers(req.params.id);
    res.json({ success: true, data: followers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get users followed by user
app.get('/api/users/:id/following', (req, res) => {
  try {
    const following = db.getUserFollowing(req.params.id);
    res.json({ success: true, data: following });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// POST ROUTES
// -------------------------------------------------------------

// Get posts feed (with filter: all, following, trending, or tag)
app.get('/api/posts', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const { filter = 'all', tag } = req.query;

    const posts = db.getPosts({ currentUserId: activeId, filter, tag });
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single post
app.get('/api/posts/:id', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const post = db.getPostById(req.params.id, activeId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new post
app.post('/api/posts', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const { content, image_url, tag } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
    }

    const newPost = db.createPost({
      user_id: activeId,
      content: content.trim(),
      image_url: image_url ? image_url.trim() : null,
      tag: tag ? (tag.startsWith('#') ? tag.trim() : `#${tag.trim()}`) : null
    });

    res.status(201).json({ success: true, data: newPost, message: 'Post created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const postId = req.params.id;

    db.deletePost(postId, activeId);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
});

// Toggle Like on post
app.post('/api/posts/:id/like', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const postId = req.params.id;

    const result = db.toggleLike(postId, activeId);
    res.json({
      success: true,
      message: result.liked ? 'Liked post' : 'Unliked post',
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// COMMENT ROUTES
// -------------------------------------------------------------

// Get comments for a post
app.get('/api/posts/:id/comments', (req, res) => {
  try {
    const comments = db.getComments(req.params.id);
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create comment on post
app.post('/api/posts/:id/comments', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const comment = db.createComment({
      post_id: postId,
      user_id: activeId,
      content: content.trim()
    });

    res.status(201).json({ success: true, data: comment, message: 'Comment posted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete comment
app.delete('/api/comments/:id', (req, res) => {
  try {
    const activeId = getActiveUserId(req);
    db.deleteComment(req.params.id, activeId);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
});

// -------------------------------------------------------------
// SEARCH & SYSTEM ROUTES
// -------------------------------------------------------------

// Search users & posts
app.get('/api/search', (req, res) => {
  try {
    const { q } = req.query;
    const results = db.search(q || '');
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset demo database
app.post('/api/reset', (req, res) => {
  try {
    db.resetDb();
    currentUserId = 1;
    res.json({ success: true, message: 'Database reset to initial seed state' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Serve frontend for all remaining GET routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 PulseNet Social Media Platform Backend Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📂 Serving Frontend from: ${path.join(__dirname, 'public')}`);
  console.log(`====================================================`);
});
