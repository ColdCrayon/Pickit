const { Resend } = require('resend');
const functions = require('firebase-functions');

// Initialize Resend with API key from Firebase config
// To set this: firebase functions:config:set resend.api_key="re_123..."
const resend = new Resend(functions.config().resend?.api_key || process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content
 * @param {string} [params.text] - Plain text content
 * @return {Promise<Object>} Resend API response
 */
async function sendEmail({ to, subject, html, text }) {
  try {
    if (!to) {
      throw new Error('Recipient email is required');
    }

    const data = await resend.emails.send({
      from: 'Pickit <alerts@pickit.app>', // Update with your verified domain
      to,
      subject,
      html,
      text: text ?? (typeof html === 'string' ? html.replace(/<[^>]*>?/gm, '') : undefined),
    });

    console.log(`Email sent to ${to}:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmail,
};
