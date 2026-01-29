# Generate API Keys and Secrets

## Quick Generate All Keys

Run this command to generate all keys at once:

```bash
ts-node src/gen/genAllKeys.ts
```

This will output all 4 required keys:
- `ENC_KEY_SECRET`
- `CIPHER_KEY_SECRET`
- `API_KEY_SECRET`
- `API_KEY`

## Individual Key Generation

### Generate ENC_KEY_SECRET and CIPHER_KEY_SECRET

```bash
ts-node src/gen/genSecretToken.ts
```

### Generate API_KEY_SECRET

The API_KEY_SECRET should be a 32-byte hex string. You can generate it using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generate API_KEY

The API_KEY should be a 32-byte hex string. You can generate it using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Important Notes

1. **Keep these keys secure** - Never commit them to git
2. **Use the same keys** across frontend and backend
3. **API_KEY** must match between frontend `.env` and backend `.env`
4. All keys should be **hex strings** (64 characters for 32 bytes)

## Current Keys Location

- Backend: `codebound-backend/.env`
- Frontend: `codebound-frontend/.env` (API_KEY only)
