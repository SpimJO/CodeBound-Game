# Quick Fix Guide - High Priority Issues

Step-by-step guide to fix the remaining 5 high-priority issues.

---

## Issue 1: Backend - AuthController Business Logic

**Time:** ~2 hours  
**Priority:** HIGH  
**Impact:** Architecture violation, hard to test

### Step 1: Update Services to Use Singleton Prisma

All services currently create their own Prisma instance. Update them to use the singleton:

**Files to update:**
- `src/services/achievement.service.ts`
- `src/services/analytics.service.ts`
- `src/services/community.service.ts`
- `src/services/gameSession.service.ts`
- `src/services/leaderboard.service.ts`
- `src/services/progress.service.ts`
- `src/services/skin.service.ts`

**Change:**
```typescript
// Old
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// New
import { prisma } from '@/lib/prisma';
```

### Step 2: Create auth.service.ts

Create `src/services/auth.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { HttpError } from '../lib/error';
import bcrypt from 'bcrypt';
import { CipherToken } from '../utils/cipher';

const httpError = new HttpError();
const cipherToken = new CipherToken();

class AuthService {
    /**
     * Login user
     */
    async login(username: string, password: string) {
        if (!username || !password) {
            throw httpError.badRequest("Username and password are required");
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            throw httpError.notFound("User Not Found");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw httpError.unauthorized("Invalid Credentials");
        }

        const encryptToken = await cipherToken.encrypt({
            id: user.id,
            username: user.username,
            email: user.email,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
            issuedAt: Date.now()
        });

        return {
            token: encryptToken
        };
    }

    /**
     * Register user
     */
    async register(username: string, email: string, password: string) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            throw httpError.conflict("Account is already taken");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                created_at: true,
                updated_at: true
            }
        });

        const encryptToken = await cipherToken.encrypt({
            id: user.id,
            username: user.username,
            email: user.email,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
            issuedAt: Date.now()
        });

        // Create initial progress record
        await prisma.userProgress.create({
            data: {
                userId: user.id
            }
        });

        return {
            user,
            token: encryptToken
        };
    }

    /**
     * Validate session token and get user with progress
     */
    async validateSession(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                created_at: true,
                updated_at: true,
                progress: {
                    select: {
                        currentLevel: true,
                        highestLevel: true,
                        totalTokens: true,
                        totalPlayTime: true,
                        equippedSkin: true,
                        lastPlayed: true
                    }
                }
            }
        });

        if (!user) {
            throw httpError.notFound("User not found");
        }

        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, username?: string, avatar?: string) {
        if (username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username,
                    NOT: { id: userId }
                }
            });

            if (existingUser) {
                throw httpError.conflict("Username already taken");
            }
        }

        const updateData: any = {};
        if (username) updateData.username = username;
        if (avatar) updateData.avatar = avatar;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                created_at: true,
                updated_at: true
            }
        });

        return user;
    }
}

export default new AuthService();
```

### Step 3: Update AuthController to Use Service

Replace controller logic with service calls:

```typescript
import { Request, Response, NextFunction } from 'express';
import { Api } from '../../lib/api';
import { HttpError } from '../../lib/error';
import authService from '../../services/auth.service';

class AuthController extends Api {
    private httpError: HttpError;

    constructor() {
        super();
        this.httpError = new HttpError();
    }

    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;
            const data = await authService.login(username, password);
            return this.success(res, data, "Login successful");
        } catch (error) {
            next(error);
        }
    }

    public async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;
            const data = await authService.register(username, email, password);
            return this.created(res, data, "Registration successful");
        } catch (error) {
            next(error);
        }
    }

    public async sessionToken(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized("Unauthorized"));
            }

            const user = await authService.validateSession(userId);
            return this.success(res, { user }, "Session valid");
        } catch (error) {
            next(error);
        }
    }

    public async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return next(this.httpError.unauthorized("Unauthorized"));
            }

            const { username, avatar } = req.body;
            const user = await authService.updateProfile(userId, username, avatar);
            return this.success(res, { user }, "Profile updated");
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
```

---

## Issue 2: Backend - Standardize Error Handling

**Time:** ~1 hour  
**Priority:** HIGH  
**Impact:** Inconsistent errors, bypasses error middleware

### Find and Replace Pattern

**Files to update:**
- `src/network/controllers/gameSession.controller.ts`
- `src/network/controllers/progress.controller.ts`
- `src/network/controllers/community.controller.ts`
- `src/network/controllers/skin.controller.ts`
- `src/network/controllers/achievement.controller.ts`
- `src/network/controllers/leaderboard.controller.ts`

**Replace pattern 1: Unauthorized errors**
```typescript
// Find
if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
}

// Replace with
if (!userId) {
    return next(httpError.unauthorized('Unauthorized'));
}
```

**Replace pattern 2: Bad request errors**
```typescript
// Find
return res.status(400).json({ error: 'Some message' });

// Replace with
return next(httpError.badRequest('Some message'));
```

**Add at top of each controller:**
```typescript
import { HttpError } from '../../lib/error';

class XxxController {
    private httpError: HttpError;

    constructor() {
        this.httpError = new HttpError();
    }
    // ...
}
```

---

## Issue 3: Backend - Fix Response Format

**Time:** ~30 minutes  
**Priority:** HIGH  
**Impact:** Violates architecture standard

### Pattern to Fix

**Controllers currently do:**
```typescript
res.status(200).json({
    success: true,
    data: result,
});
```

**Should do:**
```typescript
return this.success(res, result, "Operation successful");
```

**Make controllers extend Api class:**
```typescript
import { Api } from '../../lib/api';

class XxxController extends Api {
    // ...methods using this.success(), this.created(), etc.
}
```

---

## Issue 4: Backend - Fix Duplicate Query

**Time:** ~15 minutes  
**Priority:** HIGH  
**Impact:** Performance issue

**File:** `src/services/gameSession.service.ts`

**Current code (lines 24-51):**
```typescript
async endSession(userId: string, sessionId: string, levelsPlayed: number, tokensEarned: number) {
    // Verify session ownership
    const existingSession = await prisma.gameSession.findUnique({
        where: { id: sessionId },
    });

    if (!existingSession) {
        throw new Error('Session not found');
    }

    if (existingSession.userId !== userId) {
        throw new Error('Unauthorized: session does not belong to user');
    }
    
    // DUPLICATE QUERY STARTS HERE
    const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        throw new HttpError(404, 'Session not found');
    }

    if (session.endedAt) {
        throw new HttpError(400, 'Session already ended');
    }

    const endedAt = new Date();
    const duration = (endedAt.getTime() - session.startedAt.getTime()) / 1000;

    const updatedSession = await prisma.gameSession.update({
        where: { id: sessionId },
        data: {
            endedAt,
            duration,
            levelsPlayed,
            tokensEarned,
        },
    });

    return updatedSession;
}
```

**Fixed code:**
```typescript
async endSession(userId: string, sessionId: string, levelsPlayed: number, tokensEarned: number) {
    // Single query - verify session ownership and get session
    const existingSession = await prisma.gameSession.findUnique({
        where: { id: sessionId },
    });

    if (!existingSession) {
        throw new HttpError(404, 'Session not found');
    }

    if (existingSession.userId !== userId) {
        throw new HttpError(403, 'Unauthorized: session does not belong to user');
    }

    if (existingSession.endedAt) {
        throw new HttpError(400, 'Session already ended');
    }

    const endedAt = new Date();
    const duration = (endedAt.getTime() - existingSession.startedAt.getTime()) / 1000;

    const updatedSession = await prisma.gameSession.update({
        where: { id: sessionId },
        data: {
            endedAt,
            duration,
            levelsPlayed,
            tokensEarned,
        },
    });

    return updatedSession;
}
```

---

## Issue 5: Frontend - Replace `any` Types

**Time:** ~1 hour  
**Priority:** HIGH  
**Impact:** Loses type safety

### Create Error Type

Create `src/types/error.types.ts`:
```typescript
export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export interface AxiosError {
    response?: {
        data?: ApiError;
    };
    message: string;
}
```

### Fix Query Hooks

**useCommunity.ts, useProgress.ts:**
```typescript
// Before
onError: (error: any) => {
    console.error('Error:', error);
}

// After
import { AxiosError } from '@/types/error.types';

onError: (error: AxiosError) => {
    console.error('Error:', error.response?.data?.message || error.message);
}
```

### Fix Auth API

**auth.api.ts:**
```typescript
// Before
updateProfile: async (data: UpdateProfileRequest): Promise<{ 
    success: boolean; 
    message: string; 
    data: { user: any } 
}>

// After
import { User } from '@/types/api.types';

updateProfile: async (data: UpdateProfileRequest): Promise<{ 
    success: boolean; 
    message: string; 
    data: { user: User } 
}>
```

### Fix WebSocket Types

**types/app.types.ts:**
```typescript
// Before
emit: (event: string, data?: any) => void;
on: (event: string, callback: (...args: any[]) => void) => void;

// After
export interface SocketData {
    [key: string]: unknown;
}

emit: (event: string, data?: SocketData) => void;
on: (event: string, callback: (...args: unknown[]) => void) => void;
```

### Fix Auth Middleware

**middleware/authMiddleware.ts:**
```typescript
// Before
[key: string]: any;
} catch (error: any) {

// After
[key: string]: unknown;
} catch (error) {
    if (error instanceof Error) {
        console.error('Auth error:', error.message);
    }
}
```

---

## Testing After Fixes

### Backend
```bash
cd codebound-backend
npm run build
npm run dev
```

Test endpoints:
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/sessions/start`
- POST `/api/sessions/:sessionId/end`

### Frontend
```bash
cd codebound-frontend
npm run build
npm run dev
```

Test:
- Login/Register flows
- API calls with proper errors
- Token storage/retrieval

---

## Checklist

- [ ] Update all services to use singleton Prisma
- [ ] Create auth.service.ts
- [ ] Update AuthController to use service
- [ ] Standardize error handling (add httpError to controllers)
- [ ] Fix response format (extend Api class)
- [ ] Fix duplicate query in gameSession.service
- [ ] Create error.types.ts
- [ ] Replace `any` in query hooks
- [ ] Replace `any` in auth API
- [ ] Replace `any` in WebSocket types
- [ ] Replace `any` in auth middleware
- [ ] Run backend build test
- [ ] Run frontend build test
- [ ] Test critical flows

**Estimated Total Time:** 4-5 hours

Once these are done, the codebase will be production-ready with proper architecture compliance.
