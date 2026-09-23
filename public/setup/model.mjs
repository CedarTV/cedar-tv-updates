import { parseWebInvitationFragment, bytesToBase64, bytesToBase64URL, openEnvelope, sealEnvelope, normalizeUUID } from '../link/cedar-sync.mjs';

export const RELAY = 'https://cedar-sync-relay.cedar-sync-relay.workers.dev';
export function parseInvitation(fragment, now = Date.now()) {
  const invitation = parseWebInvitationFragment(fragment, now);
  if (invitation.relayBaseURL !== RELAY || invitation.expiresAt > now + 5 * 60_000 + 5_000) throw new Error('This TV setup invitation is invalid.');
  return invitation;
}
export function makeCredentials(invitation) {
  return { relayBaseURL: invitation.relayBaseURL, spaceID: invitation.spaceID,
    ownerDeviceID: invitation.ownerDeviceID, deviceID: crypto.randomUUID(),
    deviceToken: bytesToBase64URL(crypto.getRandomValues(new Uint8Array(32))),
    profileKey: bytesToBase64URL(invitation.profileKey) };
}
export async function request(credentials, path, { method = 'GET', token = credentials.deviceToken, body } = {}) {
  const response = await fetch(`${RELAY}/v1/spaces/${normalizeUUID(credentials.spaceID)}${path}`, {
    method, credentials: 'omit', redirect: 'error', cache: 'no-store', referrerPolicy: 'no-referrer',
    signal: AbortSignal.timeout(15_000), headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error([401, 403, 404, 410].includes(response.status)
    ? 'This session is closed or the invitation was used. Open a fresh session on the TV.' : 'Cedar could not reach your TV. Check its connection and retry.');
  const reader = response.body.getReader(); let size = 0; const chunks = [];
  try { for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length;
    if (size > 8 * 1024 * 1024) throw new Error('The setup response is too large.'); chunks.push(value); }
  } finally { await reader.cancel(); }
  const bytes = new Uint8Array(size); let at = 0; for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length; }
  const root = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (root.schemaVersion !== 1) throw new Error('Unsupported setup response.');
  return root;
}
export async function claim(invitation, credentials) {
  return request(credentials, `/invitations/${normalizeUUID(invitation.invitationID)}/claim`, {
    method: 'POST', token: bytesToBase64URL(invitation.enrollmentToken),
    body: { schemaVersion: 1, deviceID: credentials.deviceID, deviceToken: bytesToBase64(Uint8Array.from(atob(credentials.deviceToken.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0))) },
  });
}
export async function decodeSnapshot(entry, credentials, now = Date.now()) {
  if (entry.envelope.deviceID.toLowerCase() !== credentials.ownerDeviceID) return null;
  const change = await openEnvelope(entry.envelope, credentials);
  try {
    if (change.entityKind !== 'android-setup-snapshot') return null;
    if (change.operation !== 'upsert') throw new Error('Invalid TV settings update.');
    const snapshot = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(change.payload));
    if (snapshot.schemaVersion !== 1 || snapshot.profileID !== change.profileID || !/^[a-f0-9]{64}$/.test(snapshot.revision) ||
      !Number.isSafeInteger(snapshot.expiresAt) || snapshot.expiresAt <= now || snapshot.expiresAt > now + 30 * 60_000 + 5_000 ||
      !Array.isArray(snapshot.configuration?.pages) || snapshot.configuration.profileID !== snapshot.profileID) throw new Error('The TV settings snapshot is invalid or expired.');
    return snapshot;
  } finally { change.payload.fill(0); }
}
export async function commandEnvelope(credentials, snapshot, operation, payload, sequence, now = Date.now()) {
  const requestID = crypto.randomUUID();
  const body = { schemaVersion: 1, requestID, profileID: snapshot.profileID, baseRevision: snapshot.revision,
    expiresAt: Math.min(now + 120_000, snapshot.expiresAt), operation, payload };
  const bytes = new TextEncoder().encode(JSON.stringify(body));
  if (bytes.length > 256 * 1024) throw new Error('This edit is too large.');
  return { requestID, envelope: await sealEnvelope({ schemaVersion: 1, profileID: snapshot.profileID,
    entityKind: 'android-setup-command', entityID: requestID, operation: 'upsert', revision: sequence,
    modifiedAtEpochMilliseconds: now, payload: bytes }, credentials, sequence) };
}
export function editableRows(configuration) {
  return configuration.pages.flatMap(page => page.groups.flatMap(group => group.items)).filter(item => item.editable);
}
