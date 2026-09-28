/**
 * server/src/utils/sendEmail.ts
 *
 * Reusable type-safe email dispatch utility using the Resend API.
 */

import { Resend } from 'resend';
import env from '../config/env';

const resend = new Resend(env.RESEND_API_KEY || process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'Handicraft Hub <onboarding@resend.dev>',
}: SendEmailOptions): Promise<any> => {
  if (!to) throw new Error('Recipient email is required.');
  if (!subject) throw new Error('Email subject is required.');
  if (!html) throw new Error('Email content is required.');

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log('[Email] Email sent successfully:', data?.id);
    return data;
  } catch (error: any) {
    console.error('[Email] Email dispatch failed:', error.message);
    throw error;
  }
};

export default sendEmail;
