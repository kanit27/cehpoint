# Cehpoint Project - Comprehensive Issues Report

## Executive Summary

The Cehpoint project is an AI-powered learning platform with 37 npm vulnerabilities (1 low, 9 moderate, 22 high, 5 critical), multiple code issues, missing environment variables, and several architectural problems that need immediate attention.

---

## 🔴 CRITICAL ISSUES (Priority 1)

### 1. Security Vulnerabilities in Dependencies

**Severity: CRITICAL** - 5 critical vulnerabilities found

#### Critical Packages:
1. **Next.js (15.5.4)** - Multiple critical vulnerabilities
   - RCE vulnerability in React flight protocol (CVE-2024-XXXX)
   - Server Actions source code exposure
   - DoS with Server Components
   - **Fix:** Update to Next.js 15.5.15+
   
2. **fast-xml-parser** - Multiple critical issues
   - Entity expansion bypass (CVSS 9.3)
   - DoS through entity expansion
   - **Fix:** Update to v5.7.0+
   
3. **protobufjs** - Arbitrary code execution (CVSS 9.8)
   - **Fix:** Update to v7.5.5+
   
4. **form-data** - Unsafe random function
   - **Fix:** Cannot fix directly (dependency of deprecated `request`)
   
5. **request** - Deprecated package with multiple vulnerabilities
   - Server-Side Request Forgery
   - **Fix:** Replace with `axios` or `node-fetch`

**Action Required:**
```bash
npm audit fix --force
# Or manually update packages
npm install next@15.5.15 fast-xml-parser@^5.7.0 protobufjs@^7.5.5
```

---

### 2. Missing Environment Variables

**Severity: CRITICAL** - Application will not function without these

#### Missing from .env.local:
```env
# Required but missing:
- MONGODB_URI (database connection)
- NEXTAUTH_SECRET (JWT signing)
- GOOGLE_CLIENT_ID (Google OAuth)
- GOOGLE_CLIENT_SECRET (Google OAuth)
- NEXT_PUBLIC_FIREBASE_* (all Firebase configs)
- API_KEY (Google Gemini)
- UNSPLASH_API_KEY
- YOUTUBE_API_KEY
```

**Current .env.local Issues:**
- Contains placeholder values
- Missing `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` referenced in firebase.ts
- Missing `NEXT_PUBLIC_GOOGLE_CLIENT_ID` referenced in components

---

### 3. Firebase Configuration Issues

**Severity: CRITICAL** - Authentication will fail

**File:** `src/lib/firebase.ts:14`
```typescript
measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
```

**Issues:**
- Missing `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` in .env.local
- Firebase is initialized but Firestore is imported but never used
- Firebase Auth is used but configuration may be incomplete

---

### 4. Database Connection Issues

**Severity: CRITICAL** - No data persistence

**File:** `src/lib/db.ts`
```typescript
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}
```

**Issues:**
- MongoDB connection string not configured
- No database fallback or error handling
- Application will throw error on first API call

---

### 5. Authentication Flow Broken

**Severity: CRITICAL** - Users cannot sign in/up

**Files:** 
- `src/app/(pages)/signin/page.tsx:122-136`
- `src/app/(pages)/signup/page.tsx:145-174`

**Issues:**
1. Email/password inputs are **disabled** (lines 122, 135 in signin, 145, 159, 173 in signup)
2. Submit buttons are **disabled** (lines 148, 180)
3. Message shows "Email and password login is temporarily unavailable"
4. Only Google OAuth works, but requires proper configuration

**Code Evidence:**
```tsx
// Signin page - inputs disabled
<input disabled={true} ... />
<button disabled={true} ... >Submit</button>

// Signup page - inputs disabled  
<input disabled={true} ... />
<button disabled={true} ... >Submit</button>
```

---

## 🟠 HIGH PRIORITY ISSUES (Priority 2)

### 6. Inconsistent User Model Schema

**Severity: HIGH**

**File:** `src/lib/models/User.ts`

**Issues:**
1. Schema has fields not in database: `apiKey`, `unsplashApiKey`, `verified`
2. Signup route tries to save these fields but they don't exist in schema
3. Will cause MongoDB errors or data loss

**User.ts Schema:**
```typescript
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  mName: String,
  password: String,
  profile: { type: String, default: "..." },
  role: { type: String, default: "user" },
  type: String,
  uid: { type: String, required: true, unique: true },
});
```

**Signup route tries to save:**
```typescript
const newUser = new User({
  email, mName, password, type, uid, profile, 
  apiKey,        // ❌ Not in schema
  unsplashApiKey, // ❌ Not in schema
  verified        // ❌ Not in schema
});
```

---

### 7. JWT Secret Not Configured

**Severity: HIGH**

**Files:** 
- `src/app/api/auth/signin/route.ts:22`
- `src/app/api/auth/signup/route.ts:32`

```typescript
jwt.sign(
  { userId: user._id, uid: user.uid },
  process.env.JWT_SECRET || 'your_secret_key', // ❌ Hardcoded fallback!
  { expiresIn: '30d' }
);
```

**Issues:**
- Uses insecure fallback `'your_secret_key'`
- Should use `NEXTAUTH_SECRET` from env
- Security risk in production

---

### 8. Missing API Routes

**Severity: HIGH** - Features will break

**Missing Routes:**
1. `/api/data` - Referenced in signup for sending emails
2. `/api/courses/[courseId]` - Course details endpoint
3. `/api/performance/[uid]` - Performance tracking

**Referenced but not found:**
- Course management APIs
- User profile update APIs
- Quiz generation APIs

---

### 9. Image Domain Configuration

**Severity: HIGH**

**File:** `next.config.ts`

**Issues:**
```typescript
images: {
  domains: [
    "via.placeholder.com",
    "images.unsplash.com", 
    "firebasestorage.googleapis.com",
    "lh3.googleusercontent.com"
  ],
},
```

**Problems:**
- Missing `ui-avatars.com` (used in constants.ts for avatars)
- Missing `encrypted-tbn0.gstatic.com` (Google OAuth avatar)
- Next.js 15+ uses `remotePatterns` instead of `domains`

---

### 10. TypeScript Configuration Issues

**Severity: MEDIUM**

**File:** `tsconfig.json`

**Issues:**
```json
{
  "strict": true,  // Good but causes issues with loose code
  "moduleResolution": "bundler"  // May cause import issues
}
```

**Problems:**
- Strict mode enabled but code has implicit `any` types
- Missing path aliases resolution in some files
- Import paths inconsistent (some use `@/`, some use relative)

---

### 11. Course Content Generation Issues

**Severity: HIGH**

**File:** `src/app/api/ai/generate/route.ts:39`

```typescript
model = genAIuser.getGenerativeModel({ 
  model: "gemini-2.0-flash"  // ❌ May not be available
});
```

**Issues:**
- Model version `gemini-2.0-flash` may not be stable
- No fallback for model unavailability
- API key validation missing

---

### 12. Unsplash API Configuration

**Severity: MEDIUM**

**File:** `src/app/api/courses/create/route.ts:7`

```typescript
const unsplash = createApi({ 
  accessKey: process.env.UNSPLASH_ACCESS_KEY || "" 
});
```

**Issues:**
- Uses `UNSPLASH_ACCESS_KEY` but .env has `UNSPLASH_API_KEY`
- Inconsistent naming convention
- No error handling for missing key

---

### 13. Course Page State Management

**Severity: MEDIUM**

**File:** `src/app/(pages)/course/[courseId]/page.tsx`

**Issues:**
- Large component (569 lines) - should be split
- Multiple state variables without context
- `userId` from sessionStorage but not validated
- No error boundaries

---

### 14. Missing Error Handling

**Severity: MEDIUM**

**Throughout the codebase:**
- API routes lack try-catch blocks
- No global error boundary
- Missing 404 page
- No loading states for async operations

---

## 🟡 MEDIUM PRIORITY ISSUES (Priority 3)

### 15. Deprecated Dependencies

**Severity: MEDIUM**

```json
{
  "g-i-s": "^2.1.7",      // Uses deprecated 'request' package
  "showdown": "^2.1.0",   // Has ReDoS vulnerability
  "axios": "^1.12.2",     // Multiple security issues
  "nodemailer": "^7.0.9"  // SMTP injection vulnerabilities
}
```

---

### 16. Missing Type Safety

**Severity: MEDIUM**

**Files:** Multiple

**Issues:**
- `any` types used extensively
- Props without interfaces
- API responses not typed

**Example:**
```typescript
const [courseData, setCourseData] = useState<any>(null);
const [content, setContent] = useState<{
  theory: string;
  youtube: string;
  image?: string;
  aiExplanation?: string;
}>({ theory: "", youtube: "" });
```

---

### 17. Performance Issues

**Severity: MEDIUM**

**Issues:**
1. No code splitting for large components
2. Images without `priority` or `loading="lazy"`
3. No memoization (React.memo, useMemo, useCallback missing)
4. Large bundle size (244 kB for course page)

---

### 18. Middleware Configuration

**Severity: LOW**

**File:** `middleware.ts`

**Issues:**
```typescript
// Commented out redirect logic
// if (['/signin', '/signup'].includes(pathname) && token) {
//   const url = request.nextUrl.clone();
//   url.pathname = '/home';
//   return NextResponse.redirect(url);
// }
```

**Problems:**
- Authenticated users can access signin/signup
- No rate limiting
- No CSRF protection

---

### 19. Email Sending Not Configured

**Severity: MEDIUM**

**File:** `src/app/(pages)/signup/page.tsx:95-105`

```typescript
async function sendEmail(mEmail: string, mName: string) {
  const emailHtml = `...`;
  try {
    await axiosInstance.post(`/data`, {  // ❌ Route doesn't exist
      subject: `Welcome to ${appName}`,
      to: mEmail,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send welcome email", error);
  }
}
```

**Issues:**
- `/api/data` route doesn't exist
- Nodemailer configured but no implementation
- Welcome emails not sent

---

### 20. Google OAuth Configuration

**Severity: HIGH**

**File:** `src/app/components/GoogleSignUpButton.tsx`

**Issues:**
- Requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Firebase Google Auth must be configured
- OAuth consent screen needs setup
- Redirect URIs must match exactly

---

## 📊 DEPENDENCY VULNERABILITIES SUMMARY

### Critical (5):
- Next.js: RCE, DoS, Source Code Exposure
- fast-xml-parser: Entity expansion bypass (9.3 CVSS)
- protobufjs: Arbitrary code execution (9.8 CVSS)
- form-data: Unsafe random function
- request: SSRF (deprecated package)

### High (22):
- axios: Multiple security issues
- jws: HMAC signature verification
- undici: Multiple DoS and injection issues
- tar: Path traversal vulnerabilities
- AWS SDK packages: Credential exposure

### Moderate (9):
- ajv: ReDoS
- follow-redirects: Header leakage
- mdast-util-to-hast: XSS via class attribute
- postcss: XSS via stringification
- qs: DoS via arrayLimit bypass

### Low (1):
- @smithy/config-resolver: Region parameter validation

---

## 🔧 RECOMMENDED FIXES

### Immediate Actions (Day 1):

1. **Update .env.local with real credentials:**
```bash
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=<generate-random-32-char-string>
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-xxx
API_KEY=xxx (Google Gemini)
UNSPLASH_API_KEY=xxx
YOUTUBE_API_KEY=xxx
```

2. **Fix critical vulnerabilities:**
```bash
npm install next@15.5.15 fast-xml-parser@^5.7.0 protobufjs@^7.5.5
npm uninstall g-i-s request
```

3. **Enable email/password authentication:**
   - Remove `disabled={true}` from inputs
   - Fix User schema to include missing fields

4. **Update next.config.ts:**
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    { protocol: 'https', hostname: 'ui-avatars.com' },
    { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
  ],
}
```

### Short-term Actions (Week 1):

5. **Fix User model schema** - Add missing fields
6. **Add error boundaries** - Global error handling
7. **Implement missing API routes** - Complete the API layer
8. **Add type safety** - Remove `any` types
9. **Configure Firebase properly** - Test Google OAuth
10. **Set up email sending** - Implement nodemailer

### Long-term Improvements:

11. **Code splitting** - Break large components
12. **Performance optimization** - Add memoization
13. **Testing** - Add unit and integration tests
14. **Documentation** - API documentation
15. **CI/CD** - Automated testing and deployment

---

## 📈 SEVERITY BREAKDOWN

| Severity | Count | Priority |
|----------|-------|----------|
| Critical | 5     | P0       |
| High     | 22    | P1       |
| Moderate | 9     | P2       |
| Low      | 1     | P3       |

**Total Issues: 37 (npm) + 20 (code) = 57 issues**

---

## ✅ VERIFICATION CHECKLIST

After fixes, verify:
- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts without crashes
- [ ] MongoDB connection successful
- [ ] User signup/signin works (both email and Google)
- [ ] Course creation works
- [ ] AI generation works
- [ ] No console errors in browser
- [ ] Security audit passes
- [ ] All environment variables set
- [ ] OAuth flow works end-to-end

---

## 📝 NOTES

- Database models are well-structured but need schema updates
- Component structure is good but needs optimization
- API routes follow Next.js conventions
- TypeScript configuration is appropriate for Next.js 15
- Firebase is configured but may need production adjustments

---

**Generated:** $(date)
**Project:** Cehpoint v0.1.0
**Status:** Development - Critical Issues Found
