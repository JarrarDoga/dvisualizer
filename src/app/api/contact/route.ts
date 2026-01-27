import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const CONTACT_EMAIL = 'contact@jdoga.works';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    if (!resend) {
      console.error('Resend is not configured');
      // In development, log the message
      console.log('Contact form submission:', { name, email, subject, message });
      return NextResponse.json({
        message: 'Message received (email not configured)',
      });
    }

    // Send email to contact address
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'DVisualizer <onboarding@resend.dev>',
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[DVisualizer Contact] ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 20px; border-radius: 10px 10px 0 0;">
    <h2 style="color: white; margin: 0;">New Contact Form Submission</h2>
  </div>
  
  <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-weight: 600; width: 100px;">Name:</td>
        <td style="padding: 8px 0;">${name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600;">Email:</td>
        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: 600;">Subject:</td>
        <td style="padding: 8px 0;">${subject}</td>
      </tr>
    </table>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
    
    <h3 style="margin-top: 0;">Message:</h3>
    <div style="background: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${message}</div>
    
    <p style="color: #6b7280; font-size: 12px; margin-top: 20px; margin-bottom: 0;">
      You can reply directly to this email to respond to ${name}.
    </p>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error('Error sending contact email:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
