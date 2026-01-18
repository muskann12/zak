
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { createHash } from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    const passwordHash = createHash('sha256').update(password).digest('hex');

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.passwordHash !== passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.isApproved) {
      return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
    }

    const token = await signJWT({ id: user.id, email: user.email, role: user.role });

    // Prepare User Object for Frontend Context (excluding sensitive hash)
    const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        walletBalance: user.walletBalance,
        referralCount: user.referralCount,
        subscriptionExpiry: user.subscriptionExpiry?.toISOString() || '',
        referralLink: user.referralLink || '',
        activeReferralCode: user.activeReferralCode,
        referralCodeExpiry: user.referralCodeExpiry ? Number(user.referralCodeExpiry) : undefined,
        instituteName: user.instituteName || undefined,
        instituteLocation: user.instituteLocation || undefined
    };

    return NextResponse.json({ token, user: userProfile });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
