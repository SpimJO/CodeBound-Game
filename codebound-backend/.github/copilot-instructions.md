# ChyDev Node.js Backend Boilerplate - AI Agent Instructions

## Architecture Overview

This is a TypeScript Node.js REST API boilerplate with layered security, standardized responses, and modular design patterns.

**Core Data Flow**: `server.ts` → `index.ts` (Express app) → `network/index.ts` (router) → route files → controllers (extending `Api` class)

**Key Architectural Patterns**:

- **Base Classes**: Controllers extend `Api` class for standardized responses (`success()`, `error()`, `created()`, etc.)
- **Abstract Routers**: Routes extend `baseRouter` abstract class with mandatory `initRoutes()` implementation
- **Layered Security**: Triple-layer encryption (`CipherToken`), API key validation, and JWT-like auth tokens
- **Environment-based Configuration**: Separate `.env.dev` and `.env` files with `devEnv`/`prodEnv` npm scripts

## Critical Development Workflows

### Environment & Database Setup

```bash
# Development with auto env loading
npm run dev                    # Uses .env.dev automatically
npm run prisma:generate        # Generate Prisma client (dev env)
npm run prisma:db-push         # Push schema to dev DB
npm run prisma:studio          # Open Prisma Studio (dev env)

# Production build with obfuscation
npm run build:production       # Compiles + obfuscates with javascript-obfuscator
npm run production             # Uses .env for production
```

### Key Generation Utilities

```bash
# Generate secure secrets (run these for new installations)
ts-node src/gen/genSecretToken.ts    # ENC_KEY_SECRET, CIPHER_KEY_SECRET
ts-node src/gen/genApiKey.ts         # API_KEY (JWT format)
ts-node src/gen/genApiKeySecret.ts   # API_KEY_SECRET
```

## Project Structure & File Organization

**Strict folder hierarchy** - All files must follow this exact structure:

```
src/
├── config/           # App configuration (appConfig object)
├── db/              # Database connections (prisma.ts, redis.ts)
├── gen/             # Key generation utilities (genSecretToken.ts, genApiKey.ts)
├── lib/             # Core libraries & base classes
│   ├── api.ts       # Api base class (REQUIRED for controllers)
│   ├── baseRouter.ts # baseRouter abstract class (REQUIRED for routes)
│   ├── token.ts     # CipherToken encryption class
│   └── apiKey.ts    # API key encryption utilities
├── middleware/      # Express middleware (auth.ts, apiKey.ts, etc.)
├── network/         # API layer organization
│   ├── controllers/ # Business logic (extend Api class)
│   ├── routes/      # Route definitions (extend baseRouter)
│   └── index.ts     # Main router registration
├── types/           # TypeScript definitions
│   ├── index.d.ts   # Global types & Express extensions
│   └── lib-defs/    # Library-specific type definitions
├── utils/           # Utility functions
├── index.ts         # Express app configuration
└── server.ts        # Server entry point & lifecycle
```

**File naming conventions**:

- Controllers: `*.controller.ts` in `src/network/controllers/`
- Routes: `*.route.ts` in `src/network/routes/`
- Middleware: `*.ts` in `src/middleware/`
- Types: `*.d.ts` in `src/types/`

## ChyDev Coding Principles & Patterns

### Controller Architecture

**Dependency Injection at Class Level**: Controllers instantiate all dependencies as private properties:

```typescript
class AuthController extends Api {
  private bcrypt = new Bcrypt();
  private httpError = new HttpError();
  private cipherToken = new CipherToken(
    appConfig.ENC_KEY_SECRET,
    appConfig.CIPHER_KEY_SECRET
  );

  public async methodName(req: Request, res: Response, next: NextFunction) {
    // Implementation using this.bcrypt, this.httpError, etc.
  }
}
```

### Error Handling Strategy

**Structured Error Objects**: Use `HttpError` class methods for consistent error responses:

```typescript
// Instead of throwing generic errors
if (!user) {
  return this.httpError.notFound('User Not Found');
}
if (!passwordMatch) {
  return this.httpError.unauthorized('Invalid Credentials');
}
```

### Database Transaction Patterns

**Explicit Transactions**: Wrap database mutations in `$transaction` for consistency:

```typescript
await prisma.$transaction(async (tx) => {
  await tx.user.create({
    data: { name, email, password: passwordHashed },
  });
});
```

### Route Method Signatures

**Consistent Method Patterns**: All route handlers follow exact signature with explicit typing:

```typescript
// Always: async, explicit types, next parameter for error handling
public async methodName(req: Request, res: Response, next: NextFunction) {
    try {
        // Business logic
        this.success(res, data, "Descriptive Message")
    } catch (error) {
        next(error) // Pass to global error handler
    }
}
```

### Environment Validation

**Startup Environment Checks**: Validate required environment variables on server start:

- Automatic environment file loading based on `NODE_ENV`
- Explicit validation of required variables with process exit on missing values
- Type checking for numeric values (e.g., PORT validation)

## Project-Specific Conventions

### Controller Pattern

**Always** extend the `Api` base class for controllers:

```typescript
class MyController extends Api {
  public async myRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        /* your data */
      };
      this.success(res, data, 'Custom message'); // Standardized response
    } catch (error) {
      next(error); // Pass to global error handler
    }
  }
}
```

### Route Registration Pattern

1. Create controller in `src/network/controllers/`
2. Create route file in `src/network/routes/` using middleware chain:
   ```typescript
   // Standard security stack for protected routes
   router.post('/', apiKeyMiddleware, authMiddleware, controller.method);
   ```
3. Register in `src/network/index.ts` within `initRoutes()` method

### Security Stack Integration

- **API Key**: Required header `api-key` (encrypted format, validated via `apiKeyMiddleware`)
- **Auth Token**: Bearer token in Authorization header (triple-encrypted via `CipherToken` class)
- **Payload Structure**: Auth tokens contain `{ id, name, email, issuedAt, expiresAt }` minimum

### Path Alias Usage

Use `@/` prefix consistently for imports:

```typescript
import Api from '@/lib/api';
import { authMiddleware } from '@/middleware/auth';
import appConfig from '@/config';
```

## Database & External Dependencies

### Prisma Integration

- **Schema**: `prisma/schema.prisma` (MySQL provider)
- **Client**: Singleton instance in `src/db/prisma.ts` with connection lifecycle management
- **Migration**: Use npm scripts (`prisma:migrate`, `prisma:db-push`) for automatic env loading

### Redis (Optional)

- Connection logic in `src/db/redis.ts`
- Used for distributed rate limiting in production
- Currently commented out in `server.ts` but infrastructure ready

## Response Format Standards

**All API responses** follow this structure (enforced by `Api` base class):

```json
{
  "message": "Success",
  "statusCode": 200,
  "timestamp": "2024-11-14T10:30:00.000Z",
  "data": {
    /* your data */
  }
}
```

**Error responses** handled by global error middleware in `index.ts` with consistent format.

## Build & Deployment

### Production Obfuscation

- Build process: TypeScript compilation → path alias resolution → JavaScript obfuscation
- Obfuscation settings: `scripts/build.js` with aggressive protection (control flow flattening, string arrays, etc.)
- **Never commit** obfuscated code - only source TypeScript files

### Docker Ready

- Production Dockerfile in `deployment/`
- Docker Compose with MariaDB integration
- Environment variable injection via `.env` files
