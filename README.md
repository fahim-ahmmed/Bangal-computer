# Bangal Computer — Deployment

## Vercel frontend

Import this repository into Vercel and set **Root Directory** to `apps/web`. Use the Next.js framework preset.

Add these environment variables to Vercel (Production and Preview as appropriate):

| Variable | Value |
| --- | --- |
| `BETTER_AUTH_SECRET` | A newly generated private secret. Generate locally with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. |
| `BETTER_AUTH_URL` | Canonical frontend HTTPS URL, e.g. `https://your-site.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same canonical frontend URL |
| `NEXT_PUBLIC_SITE_URL` | Same canonical frontend URL |
| `NEXT_PUBLIC_API_URL` | Actual frontend URL ending in `/backend/api`, e.g. `https://your-site.vercel.app/backend/api` |
| `API_PROXY_ORIGIN` | API host origin only, e.g. `https://your-api.example.com` (no path or trailing slash) |
| `MONGODB_URI` | Production MongoDB Atlas URI, including the intended database name |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional; required only for Google sign-in |
| `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | Optional; required only for Facebook sign-in |

Vercel does not expand references such as `${NEXT_PUBLIC_SITE_URL}` inside another environment variable; enter the full `NEXT_PUBLIC_API_URL`.

## Express API host

The `apps/api` service starts its own Express server and must run on a separate Node.js host that supports long-running servers. Set:

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Same Atlas URI and database as the Vercel frontend |
| `WEB_ORIGIN` | Canonical frontend HTTPS origin, e.g. `https://your-site.vercel.app` |
| `API_PUBLIC_URL` | API host HTTPS origin, e.g. `https://your-api.example.com` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Configure for durable product image uploads; do not rely on ephemeral local disk |
| `BKASH_BASE_URL`, `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_USERNAME`, `BKASH_PASSWORD` | Configure production bKash merchant credentials for live payments |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional; configure for email notifications |
| `SMS_API_URL`, `SMS_API_KEY` | Optional; configure for SMS notifications |

The web app's `/backend/*` rewrite forwards API calls to `API_PROXY_ORIGIN`, keeping browser API requests same-origin. The API verifies sessions by calling the web app at `WEB_ORIGIN`; it does not need `BETTER_AUTH_SECRET`. Use the same MongoDB URI on both services so authentication and catalog data share a database.

Keep credentials in Vercel's Environment Variables and the API host's secret settings. Never place secrets in `NEXT_PUBLIC_*` variables or commit them to Git. The checked-in `apps/web/.env.example` and `apps/api/.env.example` files are templates. Rotate any MongoDB or auth credentials that were previously committed in Git history; editing a template does not remove older values from history.
