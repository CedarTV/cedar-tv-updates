# Tobacco Tie v1

The website and Apple apps use the same bearer envelope. No Cedar account is required. The website
now presents it as a generated username and password, with the legacy code available for older apps.
Anyone holding both values (or the complete legacy tie) can decrypt its source address. This is not provider certification,
access control against a code holder, or a way to revoke a source's credentials.

## Username and password import

- Username: `cedar-user1.<sealed-box>`.
- Password: `cedar-pass1.<key>`.
- The key, sealed box, plaintext and authenticated data are unchanged from the v1 envelope below.
- Both fields must come from the same generation. They are case sensitive, canonical unpadded
  base64url with their versioned prefixes. Surrounding whitespace is trimmed; internal whitespace,
  extra segments, mismatched keys, unknown versions and padding are rejected. The combined input
  limit after trimming is 8,192 UTF-8 bytes.
- The website supplies `https://cedartv.github.io/cedar-tv-updates/` as the server URL to copy.
  The app's server field starts empty: the user must enter it. The app does not append any path
  or assume that the server is a manifest endpoint. It accepts an explicit HTTPS URL up to 4,096
  UTF-8 bytes, without user-info credentials, fragments, whitespace or backslashes.
- After local credential validation, Cedar sends a credential-free HEAD request to that entered
  URL (15-second timeout). A 405 or 501 retries with GET, bounded to 512 KiB. A final HTTPS 2xx
  response passes the connection check; error statuses, transport failures and TLS downgrades fail.
  The response body is not interpreted as a manifest or an authentication response.
- Neither generated value is sent to the connection-check server. After the check, Cedar fetches
  the decoded manifest URL and runs the existing compatibility and installation checks.
- This server is only checked during credential import. It is not saved as the provider endpoint
  and does not replace the source's catalog, metadata, stream or subtitle endpoints.

Existing codes and `cedar://tie/` links remain accepted through **Use a code or link**, without a
new server check. Incoming legacy links select that mode automatically. Existing installations
and refreshes do not change. The website keeps legacy output under **Using an older Cedar app?**.

## Wire format

`cedar-tie1.<key>.<sealed-box>`

Optional app link: `cedar://tie/` followed by that complete code.

- `key`: 32 random bytes, encoded as unpadded canonical base64url.
- `sealed-box`: a fresh 12-byte nonce, AES-256-GCM ciphertext, then a 16-byte authentication tag,
  concatenated and encoded as unpadded canonical base64url.
- Additional authenticated data: the UTF-8 bytes of `cedar-tie1.` (including its trailing period).
- Plaintext: UTF-8 JSON with `v: 1`, `kind: "addon"`, and `url: <configured HTTPS manifest URL>`.
- Each creation uses a fresh cryptographic key and nonce, even for the same address.
- Address ceiling: 4,096 UTF-8 bytes. Complete input code/link ceiling: 8,192 UTF-8 bytes.
- Whitespace may surround the complete code; internal whitespace, padding, extra segments,
  unknown versions/kinds, malformed data, and authentication failures are rejected.
- Only HTTPS source URLs are accepted. User-info credentials, fragments, whitespace, backslashes,
  and non-manifest JSON paths are rejected. Base and `/configure` addresses are normalized to
  `/manifest.json`. Encoded configuration path segments and query values remain intact.

All encryption happens locally in the browser. No address, username, password or code is submitted to Cedar's website.
The app authenticates/decrypts locally, then fetches the manifest over HTTPS and uses its existing
resource compatibility and durable installation flow. Error and diagnostic output must not contain
codes or configured addresses. The website does not contact the provider or certify compatibility.

`tt-preview1` was an unencrypted design preview. It is intentionally rejected; users regenerate it
on the website. Existing app installations and persisted source identifiers do not migrate or change.

## Verification

From this website directory: `node --test test/tobacco-tie.test.mjs`.

From the Cedar app repository: `swift test --filter TobaccoTie`.

The independent Swift fixture uses only `example.com` data. The opt-in
`node scripts/verify-tobacco-ties.mjs` runner reads local `credentials.txt.rtf`, encrypts its manifests
with this website codec, and checks native decryption, address preservation, provider compatibility,
and installed-record serialization. Private fixtures live briefly in Cedar's external `tmp` location
with mode 0600 and are deleted afterward. Never commit real manifests or bearer codes as fixtures.
