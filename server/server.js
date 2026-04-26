import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import issueRoutes from './routes/issueRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/issues', issueRoutes);

// Database Connection
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in .env');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log('Successfully connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Critical Error: Failed to connect to MongoDB');
    console.error('Error Details:', err.message);
    if (err.name === 'MongooseServerSelectionError') {
      console.error('Tip: Check your MongoDB Atlas IP Whitelist settings.');
    }
  });

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('Smart City Issue API is running...');
});
