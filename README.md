# ⚡ PulseNet — Internship Social Media Platform (Task 2)

A modern, responsive, full-stack mini social media application crafted for **Task 2: Social Media Platform**. Built with **HTML5, Vanilla CSS3, JavaScript (ES6+)**, an **Express.js REST API backend**, and a **relational database schema** for users, posts, comments, likes, and followers.

---

## 🌟 Key Features Implemented

### 1. 👤 User Profiles
- **Profile Customization**: Cover banner, circular avatar, display name, handle (`@username`), bio, internship role, company, location, and portfolio link.
- **Dynamic Profile Metrics**: Real-time stats for:
  - **Posts Count**
  - **Followers Count**
  - **Following Count**
  - **Total Likes Received**
- **Interactive Profile Tabs**: Switch between user's **Posts**, **Liked Posts**, and **Network**.
- **Edit Profile Modal**: Modify display name, role, bio, links, and avatar/banner images in real time with instant client & server sync.
- **Demo User Switcher**: Quickly switch between pre-seeded intern accounts (*Alex Rivera*, *Dr. Sarah Chen*, *Marcus Vance*, *Elena Rostova*) to test follower updates and multi-user interactions seamlessly!

### 2. 📝 Posts & Comments
- **Rich Post Creation**:
  - Multi-line text with auto-detected `#hashtag` tagging and filtering.
  - Image attachments (via URL) with live preview and removal.
  - Categorization pills (`#Engineering`, `#ArtificialIntelligence`, `#DesignSystem`, `#DevOps`, `#CareerAdvice`).
- **Dynamic Feed Streams**:
  - **For You**: Chronological stream of all network posts.
  - **Following**: Filtered feed showing only posts from users you follow.
  - **Trending**: Ranked feed based on engagement (likes and comments).
- **Threaded Comments**:
  - Expand/collapse comments per post.
  - Add comments with real-time counter increment.
  - Delete user's own comments with cascade counter update.
- **Post Management**: Post owners can delete their own posts, cascading to associated likes and comments.

### 3. ❤️ Like & Follow System
- **Like System**:
  - One-click like / unlike with spring micro-animation (`@keyframes heartPop`).
  - Real-time like counter updates.
  - Liked state persistence in database.
- **Follow System**:
  - Follow / Unfollow any user with dynamic button state (`+ Follow` / `Following`).
  - Live follower and following counter recalculation on profile headers.
  - "Who to Follow" widget with one-click follow action.

### 4. 🎨 Design & Aesthetics
- **Modern UI**: Tailored dark and light mode themes with smooth CSS variables.
- **Glassmorphism & Depth**: Frosted glass navigation bars (`backdrop-filter: blur`), subtle borders, and glowing accent gradients.
- **Typography**: Clean Google Font (*Plus Jakarta Sans*).
- **Responsive Layout**: Works seamlessly across desktops (3-column layout), tablets, and mobile devices (with fixed mobile navigation).
- **Toast Notifications**: Interactive feedback toasts for all user actions (likes, follows, post creation, comments, profile updates).

---

## 🏗️ Architecture & Directory Structure

```
social-media-platform/
├── package.json               # Node.js dependencies & start scripts
├── server.js                  # Express.js REST API server & static file host
├── database/
│   ├── db.js                  # Relational DB manager & CRUD operations
│   └── data.json              # File-persisted database store (seeded with interns)
├── public/                    # Frontend client (HTML, CSS, JavaScript)
│   ├── index.html             # Single-page application structure
│   ├── css/
│   │   ├── style.css          # Design system, glassmorphism, responsive grid
│   │   └── animations.css     # Micro-animations, heart pops, toast transitions
│   └── js/
│       ├── api.js             # API client with automatic offline fallback
│       ├── components.js      # Modular rendering functions (Posts, Comments, Profile)
│       └── app.js             # App controller, view routing, state handling
└── README.md                  # Project documentation & instructions
```

---

## 🗄️ Database Schema

The database models relational entities with foreign keys and unique constraints:

```sql
-- Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  location TEXT,
  website TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Posts Table
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  tag TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Likes Table (Unique post_id + user_id)
CREATE TABLE likes (
  id INTEGER PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Followers Table (Unique follower_id + following_id)
CREATE TABLE followers (
  id INTEGER PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | Retrieve list of all users |
| `GET` | `/api/users/current` | Get active authenticated user profile |
| `POST` | `/api/users/switch/:id` | Switch active demo user (for testing) |
| `GET` | `/api/users/:identifier` | Get user profile by ID or username with stats |
| `PUT` | `/api/users/:id` | Update profile information |
| `POST` | `/api/users/:id/follow` | Toggle follow / unfollow user |
| `GET` | `/api/users/:id/followers` | Get followers of a user |
| `GET` | `/api/users/:id/following` | Get users followed by user |
| `GET` | `/api/users/suggested` | Get suggested users to follow |
| `GET` | `/api/posts` | Get posts feed (`filter=all\|following\|trending`, `tag=...`) |
| `POST` | `/api/posts` | Create a new post |
| `GET` | `/api/posts/:id` | Get single post details |
| `DELETE` | `/api/posts/:id` | Delete a post (owner only) |
| `POST` | `/api/posts/:id/like` | Toggle like / unlike on post |
| `GET` | `/api/posts/:id/comments` | Get all comments for a post |
| `POST` | `/api/posts/:id/comments` | Create a comment on a post |
| `DELETE` | `/api/comments/:id` | Delete a comment (author only) |
| `GET` | `/api/search?q=...` | Search users and posts |

---

## 🚀 How to Run the Project

### Option A: Standard Full-Stack Execution (Express.js Server)

1. Open a terminal in the project directory:
   ```bash
   cd "social media platform"
   ```
2. Install the lightweight dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option B: Zero-Install Instant Preview

The frontend includes an intelligent client layer (`public/js/api.js`). If the Express server is not running or if you double-click `public/index.html` directly into any web browser, the app **automatically activates its embedded client storage mode with the complete pre-seeded relational dataset**. 

All features—including creating posts, adding comments, liking, following, and editing profiles—work 100% out of the box!
