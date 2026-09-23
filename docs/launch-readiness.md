# IDLE launch readiness — 23 September 2026

## Observed current state

- The existing beta URL returned HTTP 200. `/api/health` returned version 1.14.0, `vision-enabled`. This means a key is configured, not that a scan succeeded.
- TryIdleApp.com returned a script redirect to `/lander`; the destination contained GoDaddy parking assets.
- Source on main already persists rental listings through Supabase. Live authenticated persistence has not been verified in this session.
- Existing booking requests were held in server memory. This branch pauses new requests explicitly to prevent a false success followed by lost data.
- The source disables Plus payments. Stripe checkout and owner payouts are not implemented in this repository.
- Render returned a workspace-selection requirement. Workspace available: My Workspace. User confirmation is required by the connector before deployment inspection or mutation.

## Implemented in this branch

Responsive midnight/lime/lilac design; useful signed-out overview; clearer account forms; category illustrations; mobile bottom navigation; consistent empty/loading/error states; escaped user and AI content; current-session API tokens; truthful beta labels; deposit visibility; finite price and whole-day validation; server-side waitlist and ownership check on rental publication; structured upload errors; paused volatile booking creation.

## Automated checks

`npm test`: 15 passing checks covering UI state and API behavior with fake services. No production account was created or charged. No live DB migration was applied.

## Manual acceptance gate (pending)

1. Desktop at 1440 and 1024 px; mobile at 390 and 360 px: inspect typography, card wrapping, no horizontal overflow, fixed navigation, keyboard focus and readable contrast.
2. Create and confirm a designated beta account; sign in, refresh and sign out.
3. Scan a real JPG. Test no photo, unsupported type, oversized file and failed AI response. Ensure the busy state ends and retry is possible.
4. Save the asset, refresh, sign out/in and verify persistence.
5. Publish an eligible rental; verify it is visible to a second test account. Verify one account cannot edit another's asset, inspect private records or publish a waitlisted vehicle/space through direct API calls.
6. Test server restart against saved assets/listings. Verify database RLS, relevant grants and deployed migrations; the source includes incomplete historical migration context.
7. Sample listings must show sample labels. A quote must show the deposit separately. Booking and payment actions must not report success.
8. Check expired tokens, offline access and returned 500 responses on mobile.
9. Verify share/copy/download behavior, especially long item titles and unsupported sharing browsers.
10. Confirm domain and TLS, then update Supabase site URL and allowed redirect URLs to the exact production origin. Verify confirmation-email redirects before promoting the custom domain.

## Paid marketplace gate (pending)

Durable bookings, availability dates, owner acceptance, cancellation/refund flow, approved terms and customer support, actual item photos and condition records, appropriate trust checks, working renter payment/owner payout integration, and end-to-end test-mode transactions. Do not advertise completed rentals or assured earnings before these exist.

## Deployment

Review the branch and confirm the Render workspace. Verify environment-variable names without exposing values. Deploy the code after visual and real-account checks, then repeat health and persistence checks on the resulting URL. Keep the preceding deploy available for rollback.
