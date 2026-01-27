import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import prisma from '@/lib/db';
import { sendPasswordResetEmail, isEmailConfigured } from '@/lib/email';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing unused tokens for this user
    await prisma.resetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Create new reset token
    await prisma.resetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Send password reset email
    if (isEmailConfigured()) {
      const result = await sendPasswordResetEmail(email, token, user.name || undefined);
      
      if (!result.success) {
        console.error(`Failed to send password reset email to ${email}:`, result.error);
        // Still return success to prevent email enumeration
        // But log the error for debugging
      }
    } else {
      // Email not configured - log for development
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      console.warn('⚠️  Email is not configured. Set SMTP environment variables to enable email sending.');
      console.log(`📧 Password reset link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      message: 'If an account exists with this email, a reset link has been sent.',
      // Only include reset URL in development when email is not configured
      ...(process.env.NODE_ENV === 'development' && !isEmailConfigured() && { 
        resetUrl: `/reset-password?token=${token}`,
        warning: 'Email not configured. Configure SMTP settings to send actual emails.'
      }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
