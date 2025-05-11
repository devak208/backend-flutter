const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Only use morgan in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Routes

// Root route for health checks and deployment verification
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'DragNotes API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const data = error.data;
  res.status(status).json({ message, data });
});

// Connect to MongoDB Atlas
const initializeDb = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    // Don't exit process on Vercel
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Initialize database connection
initializeDb();

// Start server in non-Vercel environments
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel serverless deployment
module.exports = app;