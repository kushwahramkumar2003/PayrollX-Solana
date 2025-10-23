# PayrollX-Solana Web-2 Deployment Guide

## Production Build

The application is fully production-ready with all configurations in place.

### Build Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm run start
```

### Build Output

- **Build Type**: Standalone
- **Output Directory**: `.next/standalone`
- **All routes**: Server-rendered dynamically (for React 19 compatibility)

### Environment Configuration

Copy `env.example` to `.env.local` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_GATEWAY_URL=https://api.yourdomain.com

# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_NAME=PayrollX-Solana
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_MPC_WALLET=true
NEXT_PUBLIC_ENABLE_COMPLIANCE=true
```

## Production Features

### ✅ Security

- [x] Security headers configured (X-Frame-Options, CSP, etc.)
- [x] CORS properly configured
- [x] Console logs removed in production (except errors/warnings)
- [x] Protected routes with middleware
- [x] JWT authentication

### ✅ Performance

- [x] SWC compiler for faster builds
- [x] Image optimization
- [x] Code splitting
- [x] React strict mode enabled
- [x] Webpack optimizations (fs, net, tls fallbacks)

### ✅ Code Quality

- [x] TypeScript strict mode
- [x] ESLint configured with Next.js rules
- [x] All type errors resolved
- [x] Production-ready error handling

### ✅ Error Handling

- [x] Custom error page (`app/error.tsx`)
- [x] Custom 404 page (`app/not-found.tsx`)
- [x] Custom pages error handler (`pages/_error.tsx`)
- [x] Error boundary components

### ✅ Development Experience

- [x] Hot reload with Turbopack
- [x] Type checking script
- [x] Linting and formatting scripts
- [x] Clean script for build artifacts

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Option 2: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t payrollx-web .
docker run -p 3000:3000 payrollx-web
```

### Option 3: Traditional Node.js Server

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

The server will run on `http://localhost:3000` by default.

## Performance Monitoring

### Recommended Services

- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics or Google Analytics
- **Performance**: Web Vitals, Lighthouse CI
- **Uptime**: UptimeRobot or Pingdom

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test wallet connections (Phantom, Solflare)
- [ ] Verify API connectivity
- [ ] Test authentication flow
- [ ] Check error pages (404, 500)
- [ ] Verify SSL/HTTPS is working
- [ ] Test WebSocket connections
- [ ] Monitor error logs
- [ ] Setup alerts for critical errors
- [ ] Test on different devices/browsers

## Troubleshooting

### Build Failures

If the build fails:

1. Clear build cache: `npm run clean`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run type-check`
4. Check ESLint errors: `npm run lint`

### Runtime Errors

If you encounter runtime errors:

1. Check browser console for client-side errors
2. Check server logs for server-side errors
3. Verify environment variables are set correctly
4. Check API connectivity

### Wallet Connection Issues

If wallet connections fail:

1. Verify Solana RPC URL is correct
2. Check network (devnet vs mainnet)
3. Ensure wallet adapter dependencies are installed
4. Check browser extensions (Phantom, Solflare)

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update to latest versions (carefully)
npm install <package>@latest
```

### Security Updates

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

## Support

For issues or questions:

- Check the main README.md
- Review Next.js documentation
- Check Solana wallet adapter documentation
- File an issue in the repository

