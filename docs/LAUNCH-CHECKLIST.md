# Launch Checklist

A comprehensive pre-launch checklist for Saved Brain. Run through each section before deployment.

---

## Code Quality

- [ ] All TypeScript errors resolved (`npm run lint`)
- [ ] Build completes without errors (`npm run build`)
- [ ] No console errors in browser dev tools
- [ ] All API routes return appropriate status codes
- [ ] Environment variables documented and set in Vercel
- [ ] No hardcoded secrets or API keys in codebase
- [ ] Sensitive routes protected (auth, admin, etc.)
- [ ] Input validation on all user inputs
- [ ] Error handling for all async operations
- [ ] Database migrations tested

## Testing

- [ ] Manual smoke test of core user flows
- [ ] Import flow tested (JSON, URL paste)
- [ ] Search functionality verified
- [ ] Board creation and sharing tested
- [ ] Mobile responsive layout verified
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Form submissions work correctly
- [ ] File uploads handle edge cases

## Design & UX

- [ ] All pages match design specifications
- [ ] Loading states implemented for async operations
- [ ] Empty states designed for all lists
- [ ] Error messages are user-friendly
- [ ] Navigation is consistent across pages
- [ ] Typography hierarchy is clear
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets are appropriately sized
- [ ] Images have alt text
- [ ] Page titles are descriptive

## Security

- [ ] No sensitive data in client-side code
- [ ] CSRF protection on mutations
- [ ] Rate limiting on API routes
- [ ] Content Security Policy headers set
- [ ] HTTPS enforced in production
- [ ] Cookies have secure flags
- [ ] OAuth tokens not exposed in URLs
- [ ] File upload validation (type, size)
- [ ] SQL injection prevention
- [ ] XSS prevention (sanitize user input)

## Performance

- [ ] Lighthouse score > 90 for Performance
- [ ] Images optimized and lazy-loaded
- [ ] Font loading is non-blocking
- [ ] No unnecessary re-renders
- [ ] API response times < 200ms (excluding AI)
- [ ] Bundle size reasonable (analyze with next build)
- [ ] Database queries optimized
- [ ] Caching headers set appropriately

## SEO

- [ ] Meta titles and descriptions set
- [ ] Open Graph tags for social sharing
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Canonical URLs set
- [ ] Structured data where appropriate
- [ ] 404 page custom
- [ ] Redirects configured

## Marketing Assets

- [ ] Landing page copy finalized
- [ ] Product screenshots updated
- [ ] Demo video recorded (if applicable)
- [ ] Social media cards designed
- [ ] Press release drafted (if applicable)
- [ ] Email signup form functional
- [ ] Pricing page accurate
- [ ] FAQ updated with real questions

## Legal & Compliance

- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner implemented
- [ ] GDPR compliance (EU users)
- [ ] Data retention policy defined
- [ ] Contact information accessible
- [ ] DMCA policy (if hosting user content)
- [ ] Third-party services disclosed

## Deployment

- [ ] Production environment configured in Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Environment variables set in Vercel dashboard
- [ ] Database backup strategy in place
- [ ] Monitoring setup (error tracking, analytics)
- [ ] Logging configured
- [ ] Health check endpoint tested
- [ ] Rollback plan documented

## Post-Launch

- [ ] Monitor error tracking for first 24 hours
- [ ] Check Vercel analytics
- [ ] Verify all external services connected
- [ ] Test from fresh browser/incognito
- [ ] Check email notifications work
- [ ] Monitor API rate limits
- [ ] Review server logs
- [ ] Check mobile experience
- [ ] Verify social sharing cards
- [ ] Announce on social channels

---

## Quick Sign-Off

Run the health check script before deployment:

```bash
npx tsx scripts/health-check.ts
```

All sections should pass with green checkmarks before proceeding to deployment.

---

*Last updated: $(date +%Y-%m-%d)*