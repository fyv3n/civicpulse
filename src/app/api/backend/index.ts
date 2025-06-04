// src/app/api/backend/index.ts
// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// Then import other dependencies
import express from 'express';
import cors from 'cors';
import moderationRouter from './routes/moderation';
import { cleanupCache } from './services/cacheService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Routes
app.use('/api/backend/routes/moderation', moderationRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Run cleanup every 24 hours
setInterval(async () => {
  try {
    await cleanupCache();
    console.log('Cache cleanup completed');
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}, 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;