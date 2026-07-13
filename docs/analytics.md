# Analytics

The site records only anonymous, browser-local counters in `localStorage`:

- route views
- search result selections (never the query text)
- article completion after 90% reading progress

These counters never leave the visitor's device and are intended for interaction state and development verification, not aggregate audience reporting.

## Cloudflare Pages Web Analytics

Use Cloudflare Web Analytics for aggregate production traffic:

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Select the `personal-blog` Pages project.
4. Open **Metrics**.
5. Select **Enable** under **Web Analytics**.
6. Deploy the site again.

Cloudflare Pages automatically injects the analytics beacon. Its SPA mode observes History API navigation, so this React Router app does not need a token or analytics script in source control.
