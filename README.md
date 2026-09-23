# IDLE

**A little less idle. A lot more possible.**

IDLE is a private-beta asset discovery and portfolio app. Version 1.15 introduces a midnight, lime, lilac and warm-white interface with responsive navigation and illustrated asset cards.

## Run and test

```sh
npm ci
npm test
npm start
```

The default port is 8787. Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` and `OPENAI_API_KEY` on the server. The browser configuration contains only the public Supabase key. Never add secret keys to `public/`.

`GET /api/health` reports whether an AI key is configured; it does not validate the key or database migrations. Tests use mocked services and do not prove production authentication, email delivery, database policy behavior or AI billing access.

## Beta capabilities

- Photo-based AI estimates, authenticated portfolio storage and rental listings.
- Future-category interest for vehicles and spaces. These are not available to rent.
- Illustrative marketplace samples are explicitly labeled and have no synthetic ratings or distance claims.
- Quotes show the proposed deposit separately from the rental estimate.
- Payments and confirmed bookings are unavailable. New booking requests fail explicitly while durable booking storage and owner confirmation are unfinished. Previously, requests were held in memory and could disappear on restart.
- A sale draft saves a portfolio status only. Asking prices and public sale listings are not implemented.
- The Keep action changes portfolio status; it does not unpublish an existing rental listing.
- Card images are category illustrations, not stored photos of each asset.

## Verification before deployment

Run `npm test`, then complete the real-account and visual acceptance checks in [docs/launch-readiness.md](docs/launch-readiness.md). The current tests cover DOM behavior and server routes against mocked dependencies. They do not replace live Supabase RLS checks or browser verification.

The repository includes a Render blueprint. Do not enable payments or promote confirmed rental transactions until the launch gates have passed.
