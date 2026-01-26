import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import prisma from '@/lib/db';

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
        message: 'If an account exists with this email, a reset link has been generated.',
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

    // In production, you would send an email here
    // For now, we'll return the token in the response (only for development)
    const resetUrl = `/reset-password?token=${token}`;

    // Log the reset URL for development
    console.log(`Password reset link for ${email}: ${resetUrl}`);

    return NextResponse.json({
      message: 'If an account exists with this email, a reset link has been generated.',
      // Remove this in production - only for development testing
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
