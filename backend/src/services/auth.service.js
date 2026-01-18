const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (userData) => {
  const { name, email, password, role, referralCode, instituteName, instituteLocation } = userData;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user (isApproved default is false in schema)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      referralCode: role === 'trainer' ? undefined : undefined, // Don't save used referral code as own code
      instituteName,
      instituteLocation,
    },
  });

  // Handle Referral Logic
  if (role === 'user' && referralCode) {
      try {
          const referrer = await prisma.user.findFirst({ where: { referralCode: referralCode } });
          
          if (referrer) {
              // 1. Create Referral Record
              await prisma.referral.create({
                  data: {
                      referrerId: referrer.id,
                      referredId: user.id
                  }
              });

              // 2. Update Referrer Wallet (Add 300 PKR Commission)
              await prisma.user.update({
                  where: { id: referrer.id },
                  data: { 
                      walletBalance: { increment: 300 }
                  }
              });

              // 3. Log Transaction
              await prisma.transaction.create({
                  data: {
                      userId: referrer.id,
                      amount: 300,
                      type: 'COMMISSION'
                  }
              });
              
              console.log(`[REFERRAL] Applied referral ${referralCode}. Credited 300 to ${referrer.email}`);
          }
      } catch (err) {
          console.error("[REFERRAL] Error processing referral:", err);
          // Don't fail registration if referral fails
      }
  }

  return user;
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  // Check Approval
  if (!user.isApproved) {
    throw new Error('PENDING_APPROVAL'); 
  }

  // Generate Token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { user, token };
};

module.exports = {
  register,
  login
};