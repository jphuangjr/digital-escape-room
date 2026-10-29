# Sign in with Apple: setup checklist

The code shipped in #91 and stays switched off until the four `AUTH_APPLE_*` variables below are set in Vercel.
Status: **live** since 2026-10-29: Services ID, key and email source registered, the four variables set in Vercel Production, and sign-in tested on a phone.

You need a paid Apple Developer Program membership ($99/year). Everything below is at
developer.apple.com → Account → **Certificates, Identifiers & Profiles**.

## 1. App ID
- Identifiers → **+** → App IDs → App.
- Description `Escape Escape`, Bundle ID (Explicit) `com.escapeescape.app`.
- Capabilities: tick **Sign in with Apple** → Continue → Register.

## 2. Services ID (becomes `AUTH_APPLE_ID`)
- Identifiers → **+** → Services IDs. Description `Escape Escape Web`, Identifier `com.escapeescape.web` → Register.
- Open it, tick **Sign in with Apple** → **Configure**:
  - Primary App ID: `com.escapeescape.app`
  - Domains and Subdomains: `www.escape-escape.com`
  - Return URLs: `https://www.escape-escape.com/api/auth/callback/apple`
- Next → Done → Continue → **Save**.

## 3. Key (gives `AUTH_APPLE_KEY_ID` and `AUTH_APPLE_PRIVATE_KEY`)
- Keys → **+**, name `Escape Escape Sign in with Apple`.
- Tick **Sign in with Apple** → Configure → pick `com.escapeescape.app` → Save → Continue → Register.
- **Download the `.p8` file.** Apple lets you download it only once.
- Note the 10-character **Key ID**.

## 4. Team ID (`AUTH_APPLE_TEAM_ID`)
- The 10-character code at the top right of the developer site (also under Membership details).

## 5. Recommended: email to "Hide My Email" addresses
- Services → **Sign in with Apple for Email Communication** → Configure → add the sender address from `EMAIL_FROM`.
- Apple checks the domain's SPF record. If it complains, fix the DNS record it names.

## 6. Vercel (Production)
| Name | Value |
|---|---|
| `AUTH_APPLE_ID` | `com.escapeescape.web` (the Services ID) |
| `AUTH_APPLE_TEAM_ID` | Team ID |
| `AUTH_APPLE_KEY_ID` | Key ID |
| `AUTH_APPLE_PRIVATE_KEY` | Full contents of the `.p8`, including the BEGIN/END lines. Mark it **Sensitive**. |

Then redeploy production. **Continue with Apple** appears in the sign-in sheet.

## 7. Test
- On www.escape-escape.com (Apple won't work on preview URLs or localhost): Sign in → Continue with Apple.
- If it fails, check Vercel runtime logs for `[auth] apple sign-in is misconfigured` (bad key) or
  `[next-auth][error]` lines (usually a Services ID, domain or return URL mismatch).

If you use different IDs, keep them consistent: the Services ID from step 2 is `AUTH_APPLE_ID`, and the App ID from
step 1 is the one the Services ID and the key point to. How it works: see the Apple bullet in `CONTRACTS.md`.
