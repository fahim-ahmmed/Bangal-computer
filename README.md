# Bangal Computer — One-project Vercel deployment

The repository is configured to deploy the Next.js storefront and Express API together as Vercel Services. Services are currently **Beta** and available on Vercel plans. A Git push to the connected production branch builds and deploys both services in one deployment.

## Vercel project setup

1. Import this repository into Vercel and keep **Root Directory** at the repository root. Do not set it to `apps/web`.
2. Keep the Next.js frontend and Express API under the `services` configuration in the root `vercel.json`.
3. Add the environment variables below in the Vercel project settings. Project-level variables are shared by both services.
4. Push to the connected production branch to build and deploy the whole app together.

Required Vercel environment variables:

| Variable | Value |
| --- | --- |
| `BETTER_AUTH_SECRET` | A new private random secret. Generate locally with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. |
| `MONGODB_URI` | Production MongoDB Atlas URI with the intended database name; both services use this database. |
| `NEXT_PUBLIC_API_URL` | `/backend/api` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name; required for durable product-image uploads. |
| `CLOUDINARY_API_KEY` | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Cloudinary secret; keep private. |

For a custom production domain, also set `BETTER_AUTH_URL`, `WEB_ORIGIN`, and `NEXT_PUBLIC_SITE_URL` to that site's HTTPS origin (no trailing slash). If these are unset, Vercel's deployment URL is used. Leave `BACKEND_INTERNAL_URL` unset: Vercel provides it from the frontend-to-backend service binding. `API_PUBLIC_URL` is also not needed for Vercel; payment callback URLs use the shared deployment URL.

Optional integrations:

- Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` or `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` to enable social sign-in, and register the deployed site's Better Auth callback URL with the provider.
- Add production bKash credentials and `BKASH_BASE_URL` for live bKash payments. Do not use sandbox credentials for live transactions.
- Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` for email; add `SMS_API_URL` and `SMS_API_KEY` for SMS.

Vercel limits each Function request body to 4.5 MB. Product images are uploaded directly from the browser to Cloudinary to avoid this limit. The existing CSV/Excel bulk-import endpoint still sends the file through the API, so keep import files below 4.5 MB on Vercel.

All secrets belong in Vercel Environment Variables, never in `NEXT_PUBLIC_*` variables or committed files. `.env` files are for local development only. Rotate any database or auth credentials that were previously committed in Git history.

## Local development

Create `apps/api/.env` and `apps/web/.env.local` from their checked-in example files, set local MongoDB and a private auth secret, then run:

```bash
npm install
npm run dev:api
npm run dev:web
```

The local Express server continues to listen on port 5000; local frontend API requests use `http://localhost:5000/api`.
