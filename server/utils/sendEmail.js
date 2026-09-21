const { Resend } = require('resend');

// Initialize Resend using the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend API
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email content
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    // Basic validation
    if (!to) {
      throw new Error('Recipient email is required');
    }

    if (!subject) {
      throw new Error('Email subject is required');
    }

    if (!html) {
      throw new Error('Email content is required');
    }

    // Send email through Resend HTTP API
    const { data, error } = await resend.emails.send({
      from: 'Handicraft Hub <onboarding@resend.dev>',
      to,
      subject,
      html
    });

    // Resend can return an error without throwing automatically
    if (error) {
      throw new Error(error.message);
    }

    console.log('Email sent successfully:', data?.id);

    return data;

  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
};

module.exports = sendEmail;