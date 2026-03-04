# Dictx Landing (Vercel)

Deploy this folder as a separate Vercel project.

## Vercel Settings

- Root Directory: `landing`
- Framework Preset: `Other`
- Build Command: _(empty)_
- Output Directory: _(empty)_

## Domain

Attach `dictx.splitlabs.io` to this Vercel project.

## Routes

- `/` serves `landing/index.html`
- `/buy` redirects to Polar checkout
- `/api/pro/verify` validates a Polar license key (`lk_...`) for in-app Pro activation

## Environment Variables (Vercel)

- `POLAR_ACCESS_TOKEN`: Polar API token
- `POLAR_ORGANIZATION_ID`: Polar organization id (`org_...`) used by license-key validation
- `POLAR_DICTX_BENEFIT_IDS`: optional comma-separated benefit IDs allowed for Dictx Pro activation
- `POLAR_DICTX_PRODUCT_IDS`: optional legacy fallback for checkout-key migration (`polar_cl_...`)
- `POLAR_API_BASE`: optional override (defaults to `https://api.polar.sh/v1`)
- `PRO_VERIFY_RATE_LIMIT_WINDOW_MS`: optional API rate-limit window
- `PRO_VERIFY_RATE_LIMIT_MAX`: optional API rate-limit max requests per client per window

## Polar Checkout Success URL

Set the product checkout success URL to:

- `https://dictx.splitlabs.io/buy/success?checkout_id={CHECKOUT_ID}`

For true Polar licensing, direct users to copy their `lk_...` key from the Polar customer portal/receipt and activate in-app.
