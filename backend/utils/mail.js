// =============================================================================
// SkillSwap — Email notifications (Gmail SMTP)
// =============================================================================
// Reads SMTP_USER + SMTP_PASS from .env and sends real mail through Gmail.
// The SMTP_PASS must be a 16-character Google App Password (spaces are fine;
// they're stripped below).
//
// sendBookingEmails({ mentor, learner, skill_name, start_time, end_time,
//                     credits, session_id })
// sends two HTML emails — one to the learner (confirmation) and one to
// the mentor (new booking). Runs fire-and-forget from the booking API so a
// mail outage never blocks the user's response.
// =============================================================================

const nodemailer = require("nodemailer");

// ---------------------------------------------------------------------------
// Transporter (lazy singleton, built on first send)
// ---------------------------------------------------------------------------
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  // Google shows app passwords with spaces for readability; strip them.
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;

  if (!user || !pass) {
    throw new Error(
      "[mail] SMTP_USER and SMTP_PASS must be set in .env (Gmail app password)."
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: { user, pass },
  });

  return transporter;
}

function getFromAddress() {
  return process.env.EMAIL_FROM || `SkillSwap <${process.env.SMTP_USER}>`;
}

async function sendMail({ to, subject, html, text }) {
  try {
    const info = await getTransporter().sendMail({
      from: getFromAddress(),
      to,
      subject,
      text,
      html,
    });
    console.log(`[mail] sent → ${to} (id: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[mail] send to ${to} failed:`, err.message);
  }
}

// ---------------------------------------------------------------------------
// Booking email template helpers
// ---------------------------------------------------------------------------

function formatWhen(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const date = s.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = (d) =>
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time(s)} – ${time(e)}`;
}

function baseWrap(title, body) {
  return `
<!doctype html>
<html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0b0b0b;color:#f5f5f5;padding:32px 0;margin:0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:28px 32px 8px 32px;">
        <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#888;">SkillSwap</div>
        <h1 style="font-size:24px;margin:12px 0 0;font-weight:500;letter-spacing:-0.3px;">${title}</h1>
      </td></tr>
      <tr><td style="padding:16px 32px 32px 32px;font-size:14px;line-height:1.55;color:#ccc;">
        ${body}
      </td></tr>
      <tr><td style="padding:18px 32px;border-top:1px solid #262626;font-size:11px;color:#666;">
        You're receiving this because of activity on your SkillSwap account.
      </td></tr>
    </table>
  </body>
</html>`;
}

function detailRows({
  skill,
  when,
  other_label,
  other_name,
  credits_label,
  credits,
}) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border:1px solid #262626;border-radius:12px;">
      <tr><td style="padding:14px 18px;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Skill</td><td style="padding:14px 18px;text-align:right;color:#f5f5f5;">${skill}</td></tr>
      <tr><td style="padding:14px 18px;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;border-top:1px solid #262626;">When</td><td style="padding:14px 18px;text-align:right;color:#f5f5f5;border-top:1px solid #262626;">${when}</td></tr>
      <tr><td style="padding:14px 18px;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;border-top:1px solid #262626;">${other_label}</td><td style="padding:14px 18px;text-align:right;color:#f5f5f5;border-top:1px solid #262626;">${other_name}</td></tr>
      <tr><td style="padding:14px 18px;color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;border-top:1px solid #262626;">${credits_label}</td><td style="padding:14px 18px;text-align:right;color:#f5f5f5;border-top:1px solid #262626;">${credits} credits</td></tr>
    </table>`;
}

/**
 * Send both confirmation emails for a newly-booked session.
 * Never throws — errors are logged so a bad mail transport never breaks
 * the booking API.
 */
async function sendBookingEmails({
  mentor,    // { name, email }
  learner,   // { name, email }
  skill_name,
  start_time,
  end_time,
  credits,
  session_id,
}) {
  const when = formatWhen(start_time, end_time);

  // -> Learner
  const learnerBody = `
    <p>Hi ${learner.name}, your session is confirmed.</p>
    ${detailRows({
      skill: skill_name,
      when,
      other_label: "Mentor",
      other_name: mentor.name,
      credits_label: "You spent",
      credits,
    })}
    <p style="margin-top:22px;">We've sent ${mentor.name} a notification too. You can chat with them anytime in the SkillSwap app.</p>
    <p style="color:#888;font-size:12px;margin-top:20px;">Session #${session_id}</p>
  `;

  // -> Mentor
  const mentorBody = `
    <p>Hi ${mentor.name}, ${learner.name} just booked a session with you.</p>
    ${detailRows({
      skill: skill_name,
      when,
      other_label: "Learner",
      other_name: learner.name,
      credits_label: "You earned",
      credits,
    })}
    <p style="margin-top:22px;">Open SkillSwap to say hello and prep for the session.</p>
    <p style="color:#888;font-size:12px;margin-top:20px;">Session #${session_id}</p>
  `;

  await Promise.all([
    sendMail({
      to: learner.email,
      subject: `Booked: ${skill_name} with ${mentor.name}`,
      html: baseWrap("Your session is booked", learnerBody),
      text: `Your session is booked.\n\nSkill: ${skill_name}\nWhen: ${when}\nMentor: ${mentor.name}\nYou spent: ${credits} credits\n\nSession #${session_id}`,
    }),
    sendMail({
      to: mentor.email,
      subject: `New booking from ${learner.name}`,
      html: baseWrap("New booking on your calendar", mentorBody),
      text: `New booking on your calendar.\n\nSkill: ${skill_name}\nWhen: ${when}\nLearner: ${learner.name}\nYou earned: ${credits} credits\n\nSession #${session_id}`,
    }),
  ]);
}

module.exports = { sendBookingEmails };
