# Notion-Style Block Notes Web App 📝

A fast, beautiful, and distraction-free Notion-style block-based notes application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. It is designed with a **local-first architecture** (saves immediately to your browser with 0 setup required) and optional **Supabase Cloud Sync & Authentication** for seamless multi-device usage.

---

## ✨ Features

- **🧱 Notion-Like Block Editing**:
  - Independent blocks: Headings (H1, H2, H3), Paragraphs, To-do Checklists, Bullet & Numbered lists, Quotes, Callout boxes, Code blocks with syntax copy, and Dividers.
  - **Slash Command Menu (`/`)**: Type `/` anywhere to trigger block insertion.
  - **Keyboard Navigation**: Press `Enter` to create a new block, `Backspace` on an empty block to convert/delete, `Shift+Enter` for code lines.
  - **Reorder & Grip Handles**: Easily move blocks up or down or delete with hover controls.
- **⚡ Local-First & Cloud Ready**:
  - Works 100% offline out-of-the-box using browser storage.
  - Optional **Supabase** cloud sync with user accounts and Row Level Security (RLS).
- **🔍 Quick Find (`Ctrl+K` / `Cmd+K`)**:
  - Real-time search across all note titles, tags, and block contents.
- **📂 Hierarchical Organization**:
  - Nested sub-pages with collapsible tree navigation.
  - Pinned / Favorite notes section.
  - Tag filtering and Trash management (restore or permanently delete).
- **🎨 Customization & Polish**:
  - Dark & Light mode toggle with automatic system theme detection.
  - Emoji note icons with in-app picker.
  - Export any note as standard Markdown (`.md`).

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
This produces an optimized, production-ready static build in the `dist/` directory.

---

## ☁️ Optional: Setting Up Supabase Cloud Sync

1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project.
3. In your Supabase dashboard, go to the **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
4. Copy your **Project URL** and **Anon Key** from `Project Settings > API`.
5. Enter them in the app either via:
   - The in-app **Settings** modal (bottom left corner of the sidebar), OR
   - By creating a `.env` file in the root directory:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

---

## 🌐 Publishing & Deployment Guide

This app is a client-side Single Page Application (SPA) with pre-configured routing rules and can be published in minutes on any hosting provider:

### Option A: Vercel (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. Vercel will automatically detect Vite.
4. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` if you have them.
5. Click **Deploy**. (The included `vercel.json` ensures all routes resolve correctly).

Or deploy via terminal:
```bash
npx vercel
```

### Option B: Netlify
1. Go to [netlify.com](https://netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Select your repository.
3. Build command: `npm run build`, Publish directory: `dist`.
4. Deploy! (The included `netlify.toml` handles routing rewrites).

### Option C: GitHub Pages
1. In `vite.config.ts`, set `base: '/<your-repo-name>/'` if deploying to `username.github.io/repo`.
2. Build and push the `dist/` folder or configure GitHub Actions.
