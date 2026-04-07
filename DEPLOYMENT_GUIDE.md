# Deployment Guide - WhatsApp Business Automation Platform

## 🚀 Production Deployment Ready

This guide covers deploying the complete platform to production.

---

## Prerequisites

- Node.js 18+ installed
- Supabase account (database already configured)
- Domain name (optional)
- Cloud provider account (AWS/GCP/Azure/Vercel)

---

## Quick Deploy (5 Minutes)

### Option 1: Vercel (Recommended - Easiest)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Build the project
npm run build

# 3. Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name? whatsapp-business-platform
# - Directory? ./
# - Build command? npm run build
# - Output directory? dist
```

**Environment Variables** (Set in Vercel Dashboard):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Result**:
- URL: `https://whatsapp-business-platform.vercel.app`
- SSL: Automatic
- CDN: Global
- Deploy time: ~2 minutes

---

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=dist

# Or use Netlify UI:
# - Connect GitHub repo
# - Build command: npm run build
# - Publish directory: dist
```

**Environment Variables** (Set in Netlify Dashboard):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### Option 3: AWS (S3 + CloudFront)

```bash
# 1. Build
npm run build

# 2. Create S3 bucket
aws s3 mb s3://whatsapp-platform-prod

# 3. Enable static website hosting
aws s3 website s3://whatsapp-platform-prod \
  --index-document index.html \
  --error-document index.html

# 4. Upload files
aws s3 sync dist/ s3://whatsapp-platform-prod \
  --acl public-read

# 5. Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name whatsapp-platform-prod.s3.amazonaws.com
```

**Cost**: ~$5-10/month for small-medium traffic

---

## Database (Already Configured)

Your Supabase database is production-ready with:
- ✅ 30+ tables created
- ✅ Row Level Security enabled
- ✅ Indexes optimized
- ✅ Auto-backups configured
- ✅ Connection pooling enabled

**No additional setup needed!**

To view your database:
1. Go to https://supabase.com
2. Select your project
3. Database → Tables

---

## Custom Domain Setup

### Vercel
```bash
# Add domain
vercel domains add yourdomain.com

# Add DNS records (in your domain provider):
CNAME yourdomain.com -> cname.vercel-dns.com
```

### Netlify
```bash
# Add domain in Netlify Dashboard
# Add DNS records:
A @ 75.2.60.5
CNAME www -> your-site.netlify.app
```

### Cloudflare (Recommended for performance)
```
1. Add site to Cloudflare
2. Update nameservers at domain registrar
3. Enable:
   - SSL/TLS (Full)
   - Auto minify (JS/CSS/HTML)
   - Brotli compression
   - Caching (Standard)
```

---

## Environment Variables

### Required Variables
```env
# Supabase (Already have from .env)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Optional: Analytics
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://...

# Optional: Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT_SUPPORT=false
```

### How to Set (Vercel)
```bash
# Via CLI
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Or via Dashboard:
# Settings → Environment Variables → Add
```

---

## Performance Optimization

### 1. Enable Compression
All platforms automatically enable gzip/brotli compression.

### 2. CDN Configuration
```javascript
// Already optimized in vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['lucide-react']
        }
      }
    }
  }
}
```

### 3. Caching Headers
```
# Vercel automatically sets:
Cache-Control: public, max-age=31536000, immutable (for assets)
Cache-Control: no-cache (for index.html)
```

---

## Monitoring Setup

### 1. Uptime Monitoring (Free)
```
UptimeRobot:
- Monitor: https://yourdomain.com
- Interval: 5 minutes
- Alert: Email/SMS on downtime
```

### 2. Error Tracking
```bash
# Install Sentry
npm install @sentry/react

# In main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
  tracesSampleRate: 0.1,
});
```

### 3. Analytics
```javascript
// Google Analytics (optional)
// Add to index.html:
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Security Checklist

### Pre-Deployment
- [ ] Remove console.logs from production code
- [ ] Verify environment variables are set
- [ ] Test authentication flows
- [ ] Test RLS policies in Supabase
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Set secure headers

### Post-Deployment
- [ ] Test demo login works
- [ ] Test real signup/login works
- [ ] Verify database connections
- [ ] Check API responses
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit

---

## SSL/HTTPS Setup

All recommended platforms (Vercel, Netlify, Cloudflare) provide **automatic SSL certificates** via Let's Encrypt.

**No manual setup required!**

Verify SSL:
```bash
curl -I https://yourdomain.com
# Should return: HTTP/2 200
```

---

## Scaling Strategy

### Phase 1: 0-1,000 users
- **Frontend**: Vercel Free tier
- **Database**: Supabase Free tier (500MB)
- **Cost**: $0/month

### Phase 2: 1,000-10,000 users
- **Frontend**: Vercel Pro ($20/month)
- **Database**: Supabase Pro ($25/month)
- **Redis**: Upstash ($10/month)
- **Cost**: ~$55/month

### Phase 3: 10,000-100,000 users
- **Frontend**: Vercel Pro + CDN
- **Database**: Supabase Pro + Read Replicas
- **Redis**: Upstash Pro
- **Workers**: AWS Lambda/Edge Functions
- **Cost**: ~$300/month

### Phase 4: 100,000+ users
- **Frontend**: Enterprise CDN
- **Database**: Dedicated PostgreSQL cluster
- **Redis**: Redis Enterprise
- **Microservices**: Kubernetes cluster
- **Cost**: $2,000+/month

---

## Backup Strategy

### Database Backups (Automatic)
Supabase provides:
- Point-in-time recovery (PITR)
- Daily backups (retained 7 days on free tier)
- On-demand backups

**Create manual backup**:
```bash
# In Supabase Dashboard:
Database → Backups → Create backup
```

### Code Backups
- Git repository (GitHub/GitLab)
- Automatic via version control
- Deploy from specific commits

---

## Rollback Procedure

### Vercel/Netlify
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback

# Or via dashboard:
# Deployments → Select previous → Promote to Production
```

### Manual Rollback
```bash
# Git rollback
git revert HEAD
git push origin main

# Or checkout previous version
git checkout <commit-hash>
vercel --prod
```

---

## Health Checks

### Endpoint Monitoring
```javascript
// Create health check endpoint
// src/pages/health.tsx
export const HealthPage = () => {
  return <div>OK</div>;
};

// Monitor: https://yourdomain.com/health
```

### Database Health
```sql
-- Check in Supabase SQL Editor
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_24h
FROM auth.users;
```

---

## Cost Optimization

### Free Tier Limits
```
Vercel:
- 100GB bandwidth/month
- Unlimited deployments
- Automatic SSL

Netlify:
- 100GB bandwidth/month
- 300 build minutes/month

Supabase:
- 500MB database
- 50MB file storage
- 2GB bandwidth/month
```

### Recommendations
1. Use Vercel/Netlify free tier initially
2. Upgrade Supabase to Pro when you hit limits
3. Add Redis cache only when needed
4. Monitor bandwidth usage

---

## Troubleshooting

### Issue: Build Fails
```bash
# Clear cache
rm -rf node_modules dist .next
npm install
npm run build
```

### Issue: Environment Variables Not Working
```bash
# Verify in build logs
vercel logs

# Check variables are prefixed with VITE_
# ✅ VITE_SUPABASE_URL
# ❌ SUPABASE_URL (won't work)
```

### Issue: 404 on Refresh
```bash
# Add vercel.json:
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

# For Netlify, add _redirects:
/*    /index.html   200
```

### Issue: Database Connection Fails
```bash
# Check RLS policies in Supabase
# Verify anon key has correct permissions
# Test query in Supabase SQL Editor
```

---

## Post-Deployment Checklist

### Day 1
- [ ] Verify all pages load
- [ ] Test demo login
- [ ] Test real signup/login
- [ ] Check mobile responsiveness
- [ ] Set up uptime monitoring
- [ ] Configure error tracking

### Week 1
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Gather user feedback
- [ ] Optimize slow queries
- [ ] Review analytics data

### Month 1
- [ ] Review costs
- [ ] Analyze usage patterns
- [ ] Plan scaling if needed
- [ ] Security audit
- [ ] Backup verification

---

## Support & Maintenance

### Regular Tasks
```
Daily:
- Check error logs
- Monitor uptime
- Review user signups

Weekly:
- Database performance review
- Security updates
- Feature releases

Monthly:
- Cost analysis
- Performance optimization
- User feedback review
- Backup testing
```

---

## Success Metrics

Track these KPIs:
- **Users**: Active users, signups, retention
- **Performance**: Page load time, API response time
- **Reliability**: Uptime %, error rate
- **Business**: Conversion rate, MRR, churn

---

## Next Steps After Deployment

1. **WhatsApp Integration**
   - Get Meta Business account
   - Set up WhatsApp Cloud API
   - Deploy webhook Edge Function

2. **Payment Integration**
   - Set up Razorpay/Stripe
   - Configure subscription plans
   - Enable billing

3. **Advanced Features**
   - Real-time messaging
   - Campaign execution
   - Workflow automation

4. **Marketing**
   - SEO optimization
   - Content marketing
   - Social media presence

---

## Emergency Contacts

```
Platform Issues:
- Vercel Status: https://vercel-status.com
- Supabase Status: https://status.supabase.com

Support:
- Create GitHub issue
- Email: support@yourdomain.com
```

---

**🎉 Congratulations! Your platform is now live!**

**Demo URL**: Try the demo at your deployed URL with:
- Email: `demo@example.com`
- Password: `demo123`
