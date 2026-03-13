## Bug Summary
DELETE /auth/profile returns 404 even though GET /auth/profile works.

## Root Cause
The source code already contains the DELETE route, but the running backend process is likely still using older code.

Current route source:
- GET /auth/profile
- PUT /auth/profile
- DELETE /auth/profile

Your current dev script is:
- ts-node -r tsconfig-paths/register src/server.ts

This script does not auto-reload when files change.

## Fix
Restart the backend server after backend route/controller/service changes.

Use:
```powershell
Set-Location "c:\Users\Elaika Joy Santiago\CP-1\CodeBound-Game\codebound-backend"
npm.cmd run dev
```

If an old backend process is still running, stop it first.

## Verified Source Files
- src/network/routes/auth.route.ts
- src/network/controllers/auth.controller.ts
- src/services/auth.service.ts

## Expected Result After Restart
DELETE /auth/profile should stop returning 404 and should call deleteProfile controller successfully.
