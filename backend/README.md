# ZakVibe Backend with Telegram Approval

## Features
- **User Signup**: Registers user in DB (Pending state).
- **Telegram Notification**: Admin receives an instant alert.
- **Inline Approval**: Admin clicks "Accept" or "Reject" inside Telegram.
- **JWT Auth**: Login protected; requires database `isApproved = true`.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.example` to `.env` and fill in:
   - `TELEGRAM_BOT_TOKEN`: From BotFather.
   - `ADMIN_TELEGRAM_ID`: Your Chat ID (message @userinfobot to get it).
   - `JWT_SECRET`: Any random string.

3. **Database Setup**
   This setup uses SQLite by default for zero-config start.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## Testing

1. **Register User (Postman/cURL)**
   `POST http://localhost:5000/api/auth/register`
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```
   *Check your Telegram! You should see a request.*

2. **Login User (Before Approval)**
   `POST http://localhost:5000/api/auth/login`
   *Response: 403 Forbidden (Account pending approval)*

3. **Approve via Telegram**
   Click "✅ Accept" in the bot chat.

4. **Login User (After Approval)**
   *Response: 200 OK + JWT Token*
