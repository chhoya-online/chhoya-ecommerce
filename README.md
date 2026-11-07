# CHHOYA Ecommerce Starter

Mobile-first bilingual English/Bengali Next.js storefront.

## Deploy
Vercel should detect Next.js automatically. Keep Root Directory as `./`, Application Preset as `Next.js`, and default Build/Output settings. Add environment variables from `.env.example` in Vercel after deployment.

## Supabase
Reads active rows from `public.products`. It expects a column `is_active` and a product name column (`name` or `product_name`), `price`, and optional `image_url` or `image`. If the real column names differ, update `app/page.tsx` query/mapping. Demo products appear if Supabase is not configured or no active products are found.

This is a storefront starter only. Checkout, customer authentication, payment gateway, shipping and production order processing must be implemented and tested before accepting real orders. Never expose the Supabase service-role key in the browser.
