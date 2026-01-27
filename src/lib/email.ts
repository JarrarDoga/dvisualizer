import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Get app URL for links
const getAppUrl = () => {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

// Get "from" address - use verified domain or Resend's test domain
const getFromAddress = () => {
  return process.env.EMAIL_FROM || 'DVisualizer <onboarding@resend.dev>';
};

/**
 * Check if email is properly configured
 */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('Resend is not configured. Please set RESEND_API_KEY environment variable.');
    return { 
      success: false, 
      error: 'Email service is not configured' 
    };
  }

  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
  const appName = 'DVisualizer';

  try {
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to: email,
      subject: `Reset your ${appName} password`,
      text: `
Hello${userName ? ` ${userName}` : ''},

You requested to reset your password for your ${appName} account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email. Your password will not be changed.

Best regards,
The ${appName} Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">${appName}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
    
    <p>Hello${userName ? ` <strong>${userName}</strong>` : ''},</p>
    
    <p>You requested to reset your password for your ${appName} account.</p>
    
    <p>Click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">This link will expire in <strong>1 hour</strong>.</p>
    
    <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password will not be changed.</p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
  </div>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}
