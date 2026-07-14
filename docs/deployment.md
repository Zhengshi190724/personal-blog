# Deployment and Preview Checks

The production site is connected to GitHub through Cloudflare Pages.

## Production settings

- Repository: `Zhengshi190724/personal-blog`
- Production branch: `master`
- Build command: `npm run build`
- Output directory: `dist`
- Production URL: `https://personal-blog-ot6.pages.dev`

Every push to `master` runs the GitHub Actions quality gate and triggers a Cloudflare Pages production deployment.

## Pull request previews

Cloudflare Pages preview deployments should remain enabled for non-production branches and pull requests. A normal review flow is:

1. Create a branch, preferably with the `codex/` prefix for Codex changes.
2. Push the branch and open a pull request against `master`.
3. Wait for the GitHub Actions `Quality Gate` check to pass.
4. Open the Cloudflare Pages preview link attached to the pull request or shown in the Cloudflare dashboard.
5. Verify the affected routes on desktop and mobile before merging.

The workflow does not store Cloudflare tokens and does not deploy files itself. GitHub Actions verifies the source; the existing Cloudflare Pages Git integration owns preview and production deployments.

## Required checks

The quality gate runs:

```text
npm ci
npm test
npm run validate:content
npm run build
```

Enable branch protection for `master` in GitHub and require the `Quality Gate / verify` check before merge when repository settings permit it.
