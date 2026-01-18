import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '../auth/jwt';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: 'Invalid password' });

    if (user.status !== 'APPROVED') {
        return res.status(403).json({ error: 'Account pending approval' });
    }

    const token = signToken({ id: user.id, role: user.role });

    // Remove sensitive data
    const { passwordHash, ...safeUser } = user;
    res.json({ token, user: safeUser });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, instituteName } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash,
        role: role || 'USER',
        status: role === 'USER' ? 'APPROVED' : 'PENDING', // Trainers need approval
        instituteName
      }
    });

    res.json({ message: 'User created', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed. Email might exist.' });
  }
};
