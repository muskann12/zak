import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/v1', router);

app.get('/', (req, res) => {
  res.send('ZakVibe Pro Backend API v1.0');
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
