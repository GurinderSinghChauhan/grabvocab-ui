# Performance Budget Configuration

This project uses performance budgets to track and maintain optimal web performance.

## Lighthouse Targets

All builds must meet these Lighthouse scores:

| Category | Target | Current |
|----------|--------|---------|
| Performance | 80+ | TBD |
| Accessibility | 90+ | TBD |
| Best Practices | 85+ | TBD |
| SEO | 80+ | TBD |

## Bundle Size Targets

### Web Build

- **Main bundle**: < 500 KB (gzipped)
- **JavaScript**: < 400 KB (gzipped)
- **CSS**: < 50 KB (gzipped)

### Mobile Builds

- **iOS app**: < 100 MB
- **Android app**: < 100 MB

## Monitoring

### Local Testing

```bash
# Build and measure bundle size
npm run build

# Check bundle analysis
npx serve -l 3000 web-build

# Run Lighthouse locally
# Install: npm install -g @lhci/cli@latest
lhci autorun
```

### CI/CD Monitoring

Performance metrics are checked on every:
- ✅ Pull Request (lighthouse.yml workflow)
- ✅ Push to main (lighthouse.yml workflow)
- ✅ Build (build size reported)

### Performance Budgets

GitHub Actions workflows monitor:

1. **Lighthouse CI** (`.github/workflows/lighthouse.yml`)
   - Runs on PRs and main branch pushes
   - Comments results on PRs
   - Fails if metrics drop below thresholds

2. **Build Performance** (`vercel.json`)
   - Vercel automatically reports build metrics
   - Size tracking on deployments

## Interpreting Results

### Lighthouse Scores

- 90-100: Excellent
- 50-89: Needs Improvement
- 0-49: Poor

### Common Performance Issues

1. **Large JavaScript bundles**
   - Use code splitting
   - Lazy load routes
   - Remove unused dependencies

2. **Images**
   - Use WebP format
   - Optimize with imagemin
   - Lazy load below fold

3. **CSS**
   - Remove unused styles
   - Use CSS-in-JS efficiently
   - Minimize specificity

4. **Fonts**
   - Subset fonts
   - Use system fonts where possible
   - Load async

## References

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Performance Budget Calculator](https://www.performancebudget.io/)
