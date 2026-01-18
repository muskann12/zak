
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET(req: Request) {
  // 1. Extract Token
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Verify Token
  const payload = await verifyJWT(token);
  if (!payload || !payload.id) {
    return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
  }

  try {
    // 3. Fetch User Data with Relations
    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      include: {
        referrals: {
            orderBy: { createdAt: 'desc' },
            take: 50
        },
        transactions: {
            orderBy: { id: 'desc' }, // Use ID for default ordering if date is string
            take: 20
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 4. Construct Response
    return NextResponse.json({
      walletBalance: user.walletBalance,
      referralCount: user.referralCount,
      activeReferralCode: user.activeReferralCode,
      referralCodeExpiry: user.referralCodeExpiry ? Number(user.referralCodeExpiry) : null,
      
      referrals: user.referrals.map(ref => ({
        id: ref.id,
        name: ref.name,
        date: ref.date,
        status: ref.status,
        commission: ref.commission
      })),
      
      transactions: user.transactions
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
