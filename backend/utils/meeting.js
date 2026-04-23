const crypto = require("crypto");

// =============================================================================
// Jitsi Meet URL generator
// =============================================================================
// Every session gets a deterministic, unguessable meeting room:
//
//   https://meet.jit.si/skillswap-session-<sessionId>-<hmac>
//
// The hmac is the first 10 hex chars of HMAC-SHA256(sessionId, JWT_SECRET).
// Predictable for us (given the same session + secret), impossible for anyone
// else to guess without the secret. That stops randoms from joining a room
// they know the session id of.
// =============================================================================

const JITSI_DOMAIN = process.env.JITSI_DOMAIN || "meet.jit.si";

function roomNameFor(sessionId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET must be set to build meeting rooms.");
  }
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(`session:${sessionId}`)
    .digest("hex")
    .slice(0, 10);
  return `skillswap-session-${sessionId}-${hmac}`;
}

/**
 * Build the Jitsi URL for a session, optionally pre-filling the user's
 * display name and skipping Jitsi's "pre-join" page.
 */
function buildMeetingUrl(sessionId, { displayName } = {}) {
  const room = roomNameFor(sessionId);
  const hashParams = [
    "config.prejoinPageEnabled=false",
    "config.disableDeepLinking=true",
    "config.startWithAudioMuted=true",
    "config.startWithVideoMuted=false",
  ];
  if (displayName) {
    hashParams.push(
      `userInfo.displayName=${encodeURIComponent(`"${displayName}"`)}`
    );
  }
  return `https://${JITSI_DOMAIN}/${room}#${hashParams.join("&")}`;
}

module.exports = { buildMeetingUrl, roomNameFor };
