# Cehpoint

Cehpoint is a full-stack, AI-powered learning platform built with Next.js 15+, TypeScript, Tailwind CSS, and MongoDB. It enables users to generate, learn, and track progress on custom courses, quizzes, and projects, with features like AI explanations, YouTube integration, user authentication, and performance analytics.

---

## 🚀 Live Demo

**Try it now:** [(https://cehpoint-2sgj-3jm9nejvm-kanits-projects.vercel.app/)]

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
  - [Root Files](#root-files)
  - [Public Folder](#public-folder)
  - [src/app](#srcapp)
    - [(pages)](#pages)
    - [api](#api)
    - [assets](#assets)
    - [components](#components)
    - [context](#context)
    - [lib](#lib)
    - [globals.css](#globalscss)
    - [layout.tsx](#layouttsx)
    - [page.tsx](#pagetsx)
  - [types](#types)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

Cehpoint is designed to help users create personalized learning paths using AI. Users can generate courses on any topic, track their progress, take quizzes, complete projects, and view performance analytics. The platform supports authentication (including Google), dark mode, and integrates with external APIs (Google Gemini, YouTube, Unsplash).

---

## Features

- **AI Course Generation:** Create custom courses with AI-generated outlines and explanations.
- **Quiz & Project Integration:** Take quizzes and complete projects for each course.
- **YouTube & Unsplash Integration:** Embedded videos and images for enhanced learning.
- **User Authentication:** Secure login/signup, including Google OAuth.
- **Profile Management:** Update profile, change password, manage API keys.
- **Performance Analytics:** View heatmaps, scores, and progress.
- **Dark Mode:** Toggle between light and dark themes.
- **Admin Dashboard:** Manage users, courses, and platform analytics.
- **Responsive UI:** Mobile-friendly, modern design.
- **Toast Notifications:** Real-time feedback for user actions.

---

## Folder Structure

### Root Files

| File/Folder         | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `.env.local`        | Environment variables (API keys, DB URI, etc.)                              |
| `.gitignore`        | Git ignored files                                                           |
| `middleware.ts`     | Next.js middleware (e.g., for authentication)                               |
| `next-env.d.ts`     | Next.js TypeScript environment                                              |
| `next.config.ts`    | Next.js configuration                                                       |
| `package.json`      | Project dependencies and scripts                                            |
| `postcss.config.mjs`| PostCSS configuration                                                       |
| `README.md`         | Project documentation                                                       |
| `tailwind.config.js`| Tailwind CSS configuration                                                  |
| `tsconfig.json`     | TypeScript configuration                                                    |

### Public Folder

| File/Folder | Description                        |
|-------------|------------------------------------|
| `public/`   | Static assets (images, favicon, etc.) |

### src/app

#### (pages)

Contains all main pages of the application, each as a separate folder:

| Folder/Page         | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `about/`            | About page                                                                  |
| `admin/dashboard/`  | Admin dashboard                                                             |
| `contact/`          | Contact page                                                                |
| `course/[courseId]/`| Dynamic course page (learning, quizzes, projects)                           |
| `create/`           | Course creation page                                                        |
| `features/`         | Features overview page                                                      |
| `home/`             | Home/landing page                                                           |
| `landing/`          | Landing page                                                                |
| `myproject/`        | User's projects page                                                        |
| `performance/`      | Performance analytics page                                                  |
| `privacy/`          | Privacy policy                                                              |
| `profile/`          | User profile page                                                           |
| `signin/`           | Sign-in page                                                                |
| `signup/`           | Sign-up page                                                                |
| `terms/`            | Terms of service                                                            |
| `topics/`           | Course topics selection page                                                |

#### api

All backend API routes (Next.js Route Handlers):

| Folder/Route                | Description                                                      |
|-----------------------------|------------------------------------------------------------------|
| `ai/[...slug]/`             | AI-related endpoints (Gemini, YouTube, Unsplash, etc.)           |
| `auth/google/`              | Google OAuth authentication                                      |
| `auth/signin/`              | User sign-in                                                     |
| `auth/signup/`              | User sign-up                                                     |
| `courses/`                  | Course CRUD operations                                           |
| `courses/[courseId]/`       | Get, update, delete specific course                              |
| `courses/create/`           | Create a new course                                              |
| `courses/generate-content/` | Generate course content using AI                                 |
| `dashboard/`                | Admin dashboard API                                              |
| `getmyprojects/`            | Get user's projects                                              |
| `key/`                      | API key management                                               |
| `performance/[uid]/`        | Get user performance data                                        |
| `projects/`                 | Project CRUD operations                                          |
| `projects/[projectId]/`     | Get, update, delete specific project                             |
| `quiz-results/`             | Quiz results API                                                 |
| `updateuserproject/`        | Update user project                                              |
| `user/profile/`             | Get/update user profile                                          |

#### assets

| File         | Description                  |
|--------------|-----------------------------|
| `pictures.ts`| Static image references     |

#### components

Reusable React components for UI and features:

| Component/Folders         | Description                                                      |
|--------------------------|------------------------------------------------------------------|
| `DarkModeToggle.tsx`     | Dark mode toggle button                                          |
| `Footers.tsx`            | Footer component                                                 |
| `GoogleSignUpButton.jsx` | Google sign-up button                                            |
| `Header.tsx`             | Header/navigation bar                                            |
| `LogoComponent.tsx`      | Logo SVG/component                                               |
| `ToastProvider.tsx`      | Toast notification provider                                      |
| `Usercourses.tsx`        | User's courses list                                              |
| `admin/`                 | Admin dashboard components (sidebar, cards, etc.)                |
| `course/`                | Course page components (sidebar, progress bar, chat drawer, etc.)|
| `landing/`               | Landing page slider and slides                                   |

#### context

React Contexts for global state:

| File              | Description                  |
|-------------------|-----------------------------|
| `SkillsContext.tsx`| User skills context         |
| `ThemeContext.tsx` | Theme (dark/light) context  |

#### lib

Utility and backend helper files:

| File/Folder        | Description                                 |
|--------------------|---------------------------------------------|
| `axios.ts`         | Axios instance for API calls                |
| `constants.ts`     | App-wide constants                          |
| `db.ts`            | MongoDB connection logic                    |
| `firebase.ts`      | Firebase integration                        |
| `models/`          | Mongoose models for DB entities             |

#### globals.css

Global Tailwind and custom CSS styles.

#### layout.tsx

Root layout for all pages (includes providers, theme, etc.).

#### page.tsx

Root page (can be used for redirects or landing).

---

### types

TypeScript type definitions for external libraries and custom types.

| File              | Description                  |
|-------------------|-----------------------------|
| `g-i-s.d.ts`      | Google Image Search types    |

---

## How It Works

1. **User Authentication:**  
   Users sign up/sign in (email/password or Google). Auth state is managed via JWT/session.

2. **Course Creation:**  
   Users generate a course by entering a topic and subtopics. AI (Google Gemini) creates a structured outline.

3. **Learning Experience:**  
   - Each course has topics/subtopics, theory, YouTube videos, images, and AI explanations.
   - Users mark subtopics as complete, take quizzes, and complete projects.

4. **Profile & API Keys:**  
   Users can update their profile, change password, and manage API keys for Gemini, Unsplash, and YouTube.

5. **Performance Analytics:**  
   Users view their progress, quiz scores, and activity heatmaps.

6. **Admin Dashboard:**  
   Admins manage users, courses, and view platform analytics.

---

## Getting Started

1. **Clone the repository:**
   ```
   git clone https://github.com/kanit27/cehpoint.git
   cd cehpoint
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in your API keys, DB URI, etc.

4. **Run the development server:**
   ```
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Environment Variables

- `API_KEY` - Google Gemini API key
- `UNSPLASH_API_KEY` - Unsplash API key
- `YOUTUBE_API_KEY` - YouTube Data API key
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth secret for JWT
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth credentials

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a new Pull Request

---

## License

This project is licensed under the MIT License.

---

**For any questions or issues, please open an issue on GitHub.**
