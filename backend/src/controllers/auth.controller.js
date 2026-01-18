const authService = require('../services/auth.service');
const telegramService = require('../services/telegram.service');
const sendResponse = require('../utils/sendResponse');

const register = async (req, res) => {
  try {
    console.log('[REGISTER] Received request body:', JSON.stringify(req.body, null, 2));
    
    const { name, email, password, role, referralCode, instituteName, instituteLocation } = req.body;

    console.log('[REGISTER] Extracted fields:', { name, email, password: '***', role, referralCode });

    if (!name || !email || !password) {
      console.warn('[REGISTER] Validation failed - missing fields:', { name: !!name, email: !!email, password: !!password });
      return sendResponse(res, 400, false, 'Please provide all fields');
    }

    // 1. Create User in DB
    const user = await authService.register({ name, email, password, role, referralCode, instituteName, instituteLocation });
    console.log('[REGISTER] User created:', { id: user.id, email: user.email, role: user.role });

    // 2. Send Telegram Notification
    // Disabled as per user request (only notify on payment confirmation)
    // telegramService.sendApprovalRequest(user).catch(err => console.error('[REGISTER] Telegram error:', err.message));

    // 3. Respond to frontend
    console.log('[REGISTER] Sending success response');
    return sendResponse(res, 201, true, 'Registration successful. Please wait for admin approval.', {
      userId: user.id,
      email: user.email,
      isApproved: user.isApproved
    });

  } catch (error) {
    console.error('[REGISTER] Exception:', error.message, error.stack);
    return sendResponse(res, 400, false, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.login(email, password);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isApproved: user.isApproved,
      role: user.role
    };

    return sendResponse(res, 200, true, 'Login successful', { user: safeUser, token });

  } catch (error) {
    if (error.message === 'PENDING_APPROVAL') {
      return sendResponse(res, 403, false, 'Your account is pending admin approval.');
    }
    return sendResponse(res, 401, false, error.message);
  }
};

const getMe = async (req, res) => {
  // req.user is populated by authMiddleware
  const { password, ...safeUser } = req.user;
  return sendResponse(res, 200, true, 'User details retrieved', safeUser);
};

module.exports = {
  register,
  login,
  getMe
};